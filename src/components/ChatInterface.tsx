import React, { useEffect, useRef, useState } from 'react';
import { Message, ChatState, AdminSettings, FileAttachment } from '../types';
import InputBar from './InputBar';
import MarkdownText from './MarkdownText';
import { generateWhatsAppLink, detectPositiveIntent } from '../services/whatsapp';
import { MessageCircle, Lock, Zap, FileText, Paperclip, CheckCircle, Copy, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ChatInterfaceProps {
  state: ChatState;
  settings: AdminSettings;
  onSend: (text: string, file?: FileAttachment) => void;
  onNewChat: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ state, settings, onSend, onNewChat }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<FileAttachment | null>(null);
  const [activeRequestType, setActiveRequestType] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    // Remove a tag de anexo do texto copiado para que o usuário receba apenas o texto puro da IA
    const cleanedText = text.replace(/\[SOLICITAR_ANEXO:[A-Z]+\]/g, '').trim();
    navigator.clipboard.writeText(cleanedText).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const creditsUsed = profile?.credits_used || 0;
  const creditsLimit = profile?.role === 'admin'
    ? settings.adminMonthlyLimit
    : (profile?.total_purchased_credits || 0) + settings.freeMonthlyLimit;
  const hasCredits = creditsUsed < creditsLimit;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [state.messages, state.isThinking]);

  useEffect(() => {
    const lastMsg = state.messages[state.messages.length - 1];
    if (lastMsg?.role === 'model' && !state.isThinking) {
      if (lastMsg.content.includes("botão de conexão") || detectPositiveIntent(state.messages[state.messages.length - 2]?.content || '')) {
        setWhatsappLink(generateWhatsAppLink(state.messages, settings.whatsappNumber));
      }
    }
  }, [state.messages, state.isThinking]);

  // Função para identificar tags de solicitação de anexo no conteúdo da mensagem
  const parseMessageAttachmentTag = (content: string) => {
    const match = content.match(/\[SOLICITAR_ANEXO:([A-Z]+)\]/);
    if (match) {
      const type = match[1];
      const cleanedContent = content.replace(/\[SOLICITAR_ANEXO:[A-Z]+\]/g, '').trim();
      return { type, cleanedContent };
    }
    return { type: null, cleanedContent: content };
  };

  const handleCardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("O arquivo é muito grande. O limite máximo permitido é 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setAttachedFile({
        name: file.name,
        type: file.type || "application/octet-stream",
        base64: base64,
        size: file.size
      });
    };
    reader.onerror = () => {
      alert("Erro ao ler o arquivo selecionado.");
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const triggerFileSelectCard = (type: string) => {
    if (!profile) {
      onSend('', undefined); // Dispara a verificação de login se não houver perfil ativo
      return;
    }
    setActiveRequestType(type);
    fileInputRef.current?.click();
  };

  const getAttachmentDetails = (type: string) => {
    switch (type) {
      case 'CONTRATO':
        return {
          title: "Anexar Contrato de Financiamento",
          desc: "Envie o arquivo PDF ou tire fotos nítidas das páginas.",
          icon: <FileText className="w-6 h-6 text-[#C5A059] animate-pulse" />,
          color: "border-champagne/30 bg-champagne/5"
        };
      case 'RESCISAO':
        return {
          title: "Anexar TRCT ou Holerites",
          desc: "Envie o PDF do termo ou fotos dos seus demonstrativos.",
          icon: <FileText className="w-6 h-6 text-green-400 animate-pulse" />,
          color: "border-green-500/30 bg-green-500/5"
        };
      case 'PROCESSO':
        return {
          title: "Anexar Intimação ou Citação",
          desc: "Envie fotos ou PDF do documento que você recebeu.",
          icon: <FileText className="w-6 h-6 text-amber-500 animate-pulse" />,
          color: "border-amber-500/30 bg-amber-500/5"
        };
      case 'MULTA':
        return {
          title: "Anexar Notificação de Multa",
          desc: "Envie a foto nítida do auto de infração de trânsito.",
          icon: <FileText className="w-6 h-6 text-red-400 animate-pulse" />,
          color: "border-red-500/30 bg-red-500/5"
        };
      case 'SAUDE':
        return {
          title: "Anexar Laudo Médico / Negativa",
          desc: "Envie o laudo médico, receitas ou negativa do plano.",
          icon: <FileText className="w-6 h-6 text-blue-400 animate-pulse" />,
          color: "border-blue-500/30 bg-blue-500/5"
        };
      case 'COBRANCA':
        return {
          title: "Anexar Fatura ou Serasa",
          desc: "Envie a fatura com cobrança indevida ou print do nome sujo.",
          icon: <FileText className="w-6 h-6 text-purple-400 animate-pulse" />,
          color: "border-purple-500/30 bg-purple-500/5"
        };
      default:
        return {
          title: "Anexar Documento para Análise",
          desc: "Envie o PDF ou tire fotos do documento de interesse.",
          icon: <FileText className="w-6 h-6 text-gray-400 animate-pulse" />,
          color: "border-gray-500/30 bg-gray-500/5"
        };
    }
  };

  const renderAttachmentCard = (type: string) => {
    const details = getAttachmentDetails(type);
    
    return (
      <div className={cn(
        "border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg transition-all text-left w-full mt-4",
        details.color
      )}>
        <div className="flex items-start gap-3 w-full sm:w-auto">
          <div className="p-2 bg-gray-900/40 rounded-xl border border-white/5 shrink-0">
            {details.icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{details.title}</h4>
            <p className="text-xs text-gray-400 mt-0.5">{details.desc}</p>
          </div>
        </div>
        
        {attachedFile ? (
          <div className="flex items-center gap-1.5 bg-[#C5A059]/15 border border-[#C5A059]/40 p-2 px-3 rounded-xl w-full sm:w-auto justify-center text-xs text-champagne font-bold">
            <CheckCircle className="w-4 h-4 text-champagne" /> Arquivo anexado! Clique em enviar.
          </div>
        ) : (
          <button 
            onClick={() => triggerFileSelectCard(type)}
            className="w-full sm:w-auto bg-[#C5A059] hover:bg-[#C5A059]/90 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow shrink-0"
          >
            Escolher Arquivo / Tirar Foto
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Input de arquivos invisível para o card de anexo */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleCardFileChange} 
        accept="application/pdf,image/*,text/*" 
        className="hidden" 
      />

      <main 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-6 max-w-4xl mx-auto w-full pt-10 pb-80 scrollbar-hide"
      >
        {state.messages.map((msg) => {
          const { type: requestedAttachmentType, cleanedContent } = parseMessageAttachmentTag(msg.content);
          
          return (
            <div key={msg.id} className={cn("flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === 'user' ? 'items-end' : 'items-start')}>
              <div className={cn("max-w-[90%] rounded-2xl p-4 shadow-xl relative group/msg", msg.role === 'user' ? 'bg-champagne text-white' : 'bg-[#1A2333] text-gray-100')}>
                
                {msg.role === 'model' && (
                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-gray-900/60 hover:bg-gray-950 text-gray-400 hover:text-white opacity-0 group-hover/msg:opacity-100 transition-all duration-200 z-10"
                    title="Copiar mensagem"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-green-400 animate-in zoom-in-75 duration-200" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}

                <MarkdownText content={cleanedContent} />
                
                {/* Exibição do Arquivo se estiver anexado à mensagem */}
                {msg.file && (
                  <div className="mt-3 flex items-center gap-2.5 bg-black/20 border border-white/10 rounded-xl p-3 text-left">
                    <FileText className="w-5 h-5 text-champagne shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-200 truncate max-w-[180px] sm:max-w-xs">{msg.file.name}</p>
                      <p className="text-[10px] text-gray-400">{(msg.file.size / 1024).toFixed(1)} KB • Documento Enviado</p>
                    </div>
                  </div>
                )}

                {msg.role === 'model' && whatsappLink && msg.id === state.messages[state.messages.length - 1].id && (
                  <div className="mt-4">
                    <a href={whatsappLink} target="_blank" className="flex items-center justify-center gap-2 bg-green-600 p-3 rounded-xl font-bold hover:brightness-105 transition-all">
                      <MessageCircle className="w-5 h-5" /> Falar no WhatsApp
                    </a>
                  </div>
                )}

                {/* Exibição do Card Inteligente para Anexar se detectado na última mensagem */}
                {msg.role === 'model' && requestedAttachmentType && msg.id === state.messages[state.messages.length - 1].id && (
                  renderAttachmentCard(requestedAttachmentType)
                )}
              </div>
            </div>
          );
        })}

        {state.isThinking && (
          <div className="flex flex-col items-start animate-in fade-in duration-300">
            <div className="bg-[#1A2333] rounded-2xl p-4 shadow-xl flex items-center gap-1.5">
              <div className="w-2 h-2 bg-champagne rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-champagne rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-champagne rounded-full animate-bounce" />
            </div>
          </div>
        )}

        {!hasCredits && (
          <div className="bg-[#1A2333] border border-champagne/30 rounded-3xl p-8 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-champagne/10 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-champagne" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Créditos esgotados</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto">
                Você atingiu seu limite mensal de consultas. Assine um plano para continuar sua análise estratégica.
              </p>
            </div>
            <button 
              onClick={() => navigate('/planos')}
              className="bg-champagne text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto hover:scale-105 transition-all"
            >
              <Zap className="w-4 h-4" /> Ver Planos Disponíveis
            </button>
          </div>
        )}
      </main>

      {/* Container de Input com Gradiente para não cortar as mensagens */}
      <div className="fixed bottom-0 left-0 md:left-72 right-0 p-4 bg-gradient-to-t from-[#0B1120] via-[#0B1120] to-transparent z-30 pt-10">
        <div className={cn("transition-opacity duration-300", !hasCredits ? "opacity-20 pointer-events-none" : "opacity-100")}>
          <InputBar 
            onSend={onSend} 
            isThinking={state.isThinking} 
            placeholder={hasCredits ? "Descreva seu caso..." : "Assine para continuar..."}
            attachedFile={attachedFile}
            onAttachFile={setAttachedFile}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;