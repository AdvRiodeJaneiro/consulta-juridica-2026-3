import React, { useState, useRef, useEffect } from 'react';
import { transcribeAudio, blobToBase64 } from '../services/gemini';
import { Mic, Loader2, Send, Paperclip, X, FileText, Image as ImageIcon, File } from 'lucide-react';
import { cn } from '../lib/utils';
import { FileAttachment } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface InputBarProps {
  onSend: (text: string, file?: FileAttachment) => void;
  placeholder?: string;
  isThinking?: boolean;
  attachedFile: FileAttachment | null;
  onAttachFile: (file: FileAttachment | null) => void;
}

const InputBar: React.FC<InputBarProps> = ({ 
  onSend, 
  placeholder, 
  isThinking,
  attachedFile,
  onAttachFile
}) => {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [time, setTime] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerId = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [text]);

  const handleSend = () => {
    if ((text.trim() || attachedFile) && !isThinking && !isTranscribing) {
      onSend(text, attachedFile || undefined);
      setText('');
      onAttachFile(null); // Clear file after sending
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("O arquivo é muito grande. O limite máximo permitido é 15MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      onAttachFile({
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

  const { user } = useAuth();

  const triggerFileSelect = () => {
    if (!user) {
      onSend('', undefined); // Dispara a verificação de login que abre o AuthModal no App.tsx
      return;
    }
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-champagne" />;
    }
    if (mimeType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-400" />;
    }
    return <File className="w-5 h-5 text-blue-400" />;
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorder.current?.stop();
      setIsRecording(false);
      if (timerId.current) clearInterval(timerId.current);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorder.current = recorder;
        audioChunks.current = [];
        recorder.ondataavailable = (e) => audioChunks.current.push(e.data);
        recorder.onstop = async () => {
          setIsTranscribing(true);
          const audioBlob = new Blob(audioChunks.current);
          const base64 = await blobToBase64(audioBlob);
          const transcription = await transcribeAudio(base64);
          if (transcription) setText(prev => prev + ' ' + transcription);
          setIsTranscribing(false);
          stream.getTracks().forEach(t => t.stop());
        };
        recorder.start();
        setIsRecording(true);
        setTime(0);
        timerId.current = setInterval(() => setTime(t => t + 1), 1000);
      } catch (err) { 
        alert("Acesso ao microfone negado ou não suportado."); 
      }
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 pb-6">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="application/pdf,image/*,text/*" 
        className="hidden" 
      />

      <div className={cn(
        "relative flex flex-col bg-[#1A2333]/95 border rounded-2xl transition-all shadow-2xl overflow-hidden",
        (text.trim() || attachedFile) ? "border-champagne/60" : "border-gray-800/80"
      )}>
        {/* Attached File Preview Bar */}
        {attachedFile && (
          <div className="flex items-center justify-between bg-[#111926] border-b border-gray-800/50 p-3 px-4 animate-in slide-in-from-top-1 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-[#1A2333] rounded-lg">
                {getFileIcon(attachedFile.type)}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-200 truncate max-w-[200px] sm:max-w-md">
                  {attachedFile.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(attachedFile.size)}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onAttachFile(null)}
              className="p-1 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
              title="Remover anexo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent border-none focus:ring-0 text-white p-4 max-h-[180px] mb-12 resize-none outline-none text-base placeholder-gray-500"
        />

        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-3 bg-gradient-to-t from-[#1A2333] via-[#1A2333] to-transparent">
          <div className="flex items-center gap-1">
            <button 
              onClick={toggleRecording} 
              className={cn(
                "p-2.5 rounded-xl transition-all duration-200", 
                isRecording ? "text-red-500 bg-red-500/10 scale-105" : "text-gray-400 hover:text-white hover:bg-gray-800/40"
              )}
              title={isRecording ? "Parar gravação" : "Gravar áudio"}
            >
              {isTranscribing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mic className="w-5 h-5" />}
            </button>

            <button 
              onClick={triggerFileSelect}
              className={cn(
                "p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/40 transition-all duration-200",
                attachedFile && "text-champagne bg-champagne/10 hover:text-champagne hover:bg-champagne/20"
              )}
              title="Anexar arquivo (PDF ou Foto)"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {isRecording && (
              <span className="text-xs text-red-500 font-mono animate-pulse ml-2">
                Gravando... {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>

          <button 
            onClick={handleSend} 
            disabled={(!text.trim() && !attachedFile) || isThinking || isTranscribing} 
            className={cn(
              "p-2.5 bg-champagne text-white rounded-xl shadow-lg transition-all duration-200",
              (!text.trim() && !attachedFile) || isThinking || isTranscribing
                ? "opacity-40 cursor-not-allowed scale-100"
                : "hover:scale-105 active:scale-95 bg-champagne/90 hover:bg-champagne"
            )}
            title="Enviar mensagem"
          >
            {isThinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputBar;