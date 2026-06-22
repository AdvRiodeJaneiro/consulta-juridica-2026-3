"use client";

import React, { useState, useEffect } from 'react';
import { Globe, Save, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const SeoManagement = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });

  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const { data, error } = await supabase.from('admin_settings').select('seo_title, seo_description, seo_keywords').limit(1).single();
        if (error) throw error;
        if (data) {
          setFormData({
            seoTitle: data.seo_title || '',
            seoDescription: data.seo_description || '',
            seoKeywords: data.seo_keywords || ''
          });
        }
      } catch (err: any) {
        console.error("Erro ao buscar dados de SEO:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeo();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const { data: current, error: fetchError } = await supabase.from('admin_settings').select('id').limit(1).single();
      if (fetchError) throw fetchError;

      if (current) {
        const { error: updateError } = await supabase.from('admin_settings').update({
          seo_title: formData.seoTitle,
          seo_description: formData.seoDescription,
          seo_keywords: formData.seoKeywords,
          updated_at: new Date().toISOString()
        }).eq('id', current.id);

        if (updateError) throw updateError;
        setMessage({ type: 'success', text: 'Configurações de SEO atualizadas com sucesso!' });
        
        // Dispara recarregamento suave para atualizar o título da aba na hora
        document.title = formData.seoTitle || "Magalhães & Gomes - IA Jurídica";
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', formData.seoDescription);
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) metaKeywords.setAttribute('content', formData.seoKeywords);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar configurações.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-champagne" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Globe className="w-6 h-6 text-champagne" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SEO (Google / Buscadores)</h1>
          </div>
          <p className="text-sm text-gray-500">Configure as meta tags do sistema para melhorar o ranqueamento orgânico no Google.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#00A86B] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:brightness-105 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar SEO
        </button>
      </div>

      {/* Mensagens de feedback */}
      {message && (
        <div className={`p-4 rounded-xl border text-sm font-semibold transition-all animate-in fade-in ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Inputs Form */}
      <div className="bg-white border-l-4 border-champagne rounded-2xl p-8 border border-gray-100 space-y-6 shadow-sm text-left">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Título da Página (SEO Title)</label>
          <input 
            type="text" 
            value={formData.seoTitle} 
            onChange={e => setFormData({...formData, seoTitle: e.target.value})} 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-sm text-gray-900 focus:bg-white outline-none transition-all" 
            placeholder="Ex: Consulta Jurídica IA - Magalhães & Gomes" 
          />
          <p className="text-[10px] text-gray-400 ml-1">Recomendado: Até 60 caracteres. Texto exibido na aba do navegador e no cabeçalho do Google.</p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Descrição de SEO (Meta Description)</label>
          <textarea 
            rows={4} 
            value={formData.seoDescription} 
            onChange={e => setFormData({...formData, seoDescription: e.target.value})} 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-sm text-gray-900 focus:bg-white outline-none transition-all resize-none" 
            placeholder="Ex: Faça sua consulta jurídica estratégica online com agilidade..." 
          />
          <p className="text-[10px] text-gray-400 ml-1">Recomendado: Entre 120 e 160 caracteres. Resumo que aparece logo abaixo do título no Google.</p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider ml-1">Palavras-Chave de SEO (Meta Keywords)</label>
          <textarea 
            rows={2} 
            value={formData.seoKeywords} 
            onChange={e => setFormData({...formData, seoKeywords: e.target.value})} 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-sm text-gray-900 focus:bg-white outline-none transition-all resize-none" 
            placeholder="Ex: advogado, consulta juridica, juros abusivos, revisional de contrato, direito" 
          />
          <p className="text-[10px] text-gray-400 ml-1">Separe os termos por vírgula para ajudar indexadores secundários.</p>
        </div>
      </div>
    </div>
  );
};

export default SeoManagement;