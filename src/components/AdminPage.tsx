import React, { useState } from 'react';
import { AdminSettings } from '../types';
import { Save, ArrowLeft, Globe, FileText, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AdminPageProps {
  settings: AdminSettings;
  onSave: (settings: AdminSettings) => void;
  onBack: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ settings, onSave, onBack }) => {
  const [formData, setFormData] = useState<AdminSettings>(settings);
  const [activeTab, setActiveTab] = useState<'geral' | 'cerebro' | 'seo'>('geral');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-white font-serif">Configurações do Sistema</h1>
              <p className="text-xs text-gray-400 mt-1">Gerencie as informações do escritório, prompts da IA e regras de SEO.</p>
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full sm:w-auto bg-[#C5A059] hover:bg-[#C5A059]/90 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" /> 
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-gray-800/80 gap-2 pb-px overflow-x-auto">
          <button 
            onClick={() => setActiveTab('geral')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'geral' ? 'border-[#C5A059] text-champagne' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'}`}
          >
            <FileText className="w-4 h-4" /> Dados do Escritório
          </button>
          <button 
            onClick={() => setActiveTab('cerebro')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'cerebro' ? 'border-[#C5A059] text-champagne' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'}`}
          >
            <Brain className="w-4 h-4" /> Cérebro da IA
          </button>
          <button 
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'seo' ? 'border-[#C5A059] text-champagne' : 'border-transparent text-gray-400 hover:text-white hover:border-gray-700'}`}
          >
            <Globe className="w-4 h-4" /> Configurações de SEO (Google)
          </button>
        </div>

        <div className="bg-[#1A2333] border border-gray-800/60 p-6 rounded-2xl shadow-xl">
          {activeTab === 'geral' && (
            <div className="space-y-6">
              <div className="text-left">
                <h3 className="text-base font-bold text-white mb-1">Identidade Jurídica</h3>
                <p className="text-xs text-gray-400">Informações institucionais apresentadas para a IA e no rodapé do sistema.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Nome do Escritório</label>
                  <input 
                    type="text" 
                    value={formData.officeName} 
                    onChange={e => setFormData({...formData, officeName: e.target.value})} 
                    className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors text-white" 
                    placeholder="Nome" 
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">WhatsApp de Contato</label>
                  <input 
                    type="text" 
                    value={formData.whatsappNumber} 
                    onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} 
                    className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors text-white" 
                    placeholder="Ex: 21998702613" 
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Endereços/Unidades</label>
                <textarea 
                  rows={2}
                  value={formData.addresses} 
                  onChange={e => setFormData({...formData, addresses: e.target.value})} 
                  className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors resize-none text-white" 
                  placeholder="Ex: Centro (Rio de Janeiro), Niterói, Nova Iguaçu..." 
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Fundadores / Expertise</label>
                <textarea 
                  rows={2}
                  value={formData.foundersInfo} 
                  onChange={e => setFormData({...formData, foundersInfo: e.target.value})} 
                  className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors resize-none text-white" 
                  placeholder="Informações sobre sócios e tempo de atuação..." 
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Descrição Comercial</label>
                <textarea 
                  rows={3}
                  value={formData.officeDescription} 
                  onChange={e => setFormData({...formData, officeDescription: e.target.value})} 
                  className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors resize-none text-white" 
                  placeholder="Breve descrição institucional..." 
                />
              </div>
            </div>
          )}

          {activeTab === 'cerebro' && (
            <div className="space-y-6">
              <div className="text-left">
                <h3 className="text-base font-bold text-white mb-1">Cérebro e Prompts</h3>
                <p className="text-xs text-gray-400">Defina o tom de voz, regras de fluxo, filtros e comportamento estratégico da Inteligência Artificial.</p>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Instruções Internas de Comportamento</label>
                <textarea 
                  rows={4} 
                  value={formData.internalInstructions} 
                  onChange={e => setFormData({...formData, internalInstructions: e.target.value})} 
                  className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors text-white" 
                  placeholder="Instruções sobre tom de voz, formato de resposta, etc..." 
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Malícia Estratégica (Análise de Risco)</label>
                <textarea 
                  rows={3} 
                  value={formData.malicePrompt} 
                  onChange={e => setFormData({...formData, malicePrompt: e.target.value})} 
                  className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors text-white" 
                  placeholder="Diretrizes para identificar manobras protelatórias da parte contrária..." 
                />
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Restrições Absolutas (Prompt Negativo)</label>
                <textarea 
                  rows={3} 
                  value={formData.negativePrompt} 
                  onChange={e => setFormData({...formData, negativePrompt: e.target.value})} 
                  className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors text-white" 
                  placeholder="O que a IA sob nenhuma circunstância deve responder..." 
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Limite Mensal de Testes (Grátis)</label>
                  <input 
                    type="number" 
                    value={formData.freeMonthlyLimit} 
                    onChange={e => setFormData({...formData, freeMonthlyLimit: parseInt(e.target.value) || 3})} 
                    className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors text-white" 
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Limite Mensal Admin</label>
                  <input 
                    type="number" 
                    value={formData.adminMonthlyLimit} 
                    onChange={e => setFormData({...formData, adminMonthlyLimit: parseInt(e.target.value) || 9999})} 
                    className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors text-white" 
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="text-left">
                <h3 className="text-base font-bold text-white mb-1">Otimização de SEO (Google / Buscadores)</h3>
                <p className="text-xs text-gray-400">Configure as meta tags que informam ao Google o título, a descrição e os termos de busca ideais para ranqueamento do sistema.</p>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Título da Página (SEO Title)</label>
                <input 
                  type="text" 
                  value={formData.seoTitle || ''} 
                  onChange={e => setFormData({...formData, seoTitle: e.target.value})} 
                  className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors text-white" 
                  placeholder="Ex: Consulta Jurídica IA - Magalhães & Gomes" 
                />
                <p className="text-[10px] text-gray-500 ml-1">Recomendado: Até 60 caracteres. É o texto que aparece na guia do navegador e no título das pesquisas.</p>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Descrição de SEO (Meta Description)</label>
                <textarea 
                  rows={3} 
                  value={formData.seoDescription || ''} 
                  onChange={e => setFormData({...formData, seoDescription: e.target.value})} 
                  className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors resize-none text-white" 
                  placeholder="Ex: Faça sua consulta jurídica online de forma rápida e segura. Analise juros abusivos, rescisões de contrato e mais com nossa IA especializada." 
                />
                <p className="text-[10px] text-gray-500 ml-1">Recomendado: Entre 120 e 160 caracteres. É o resumo exibido abaixo do título nos resultados de busca do Google.</p>
              </div>

              <div className="space-y-2 text-left">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Palavras-Chave de SEO (Meta Keywords)</label>
                <textarea 
                  rows={2} 
                  value={formData.seoKeywords || ''} 
                  onChange={e => setFormData({...formData, seoKeywords: e.target.value})} 
                  className="w-full bg-[#0B1120]/75 border border-gray-800 focus:border-[#C5A059] focus:ring-0 p-3 rounded-xl outline-none text-sm transition-colors resize-none text-white" 
                  placeholder="Ex: advogado, consulta juridica, juros abusivos, revisional de contrato, direito do trabalho" 
                />
                <p className="text-[10px] text-gray-500 ml-1">Separe os termos por vírgula. Ajuda motores de busca secundários a catalogar seu sistema.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;