"use client";

import React from 'react';
import { ShieldCheck, Shield, User, Save, Loader2 } from 'lucide-react';
import { useUsageLimits } from '../hooks/useUsageLimits';
import UsageLimitCard from '../components/UsageLimitCard';

const UsageLimits = () => {
  const {
    freeLimit,
    setFreeLimit,
    adminLimit,
    setAdminLimit,
    isLoading,
    isSaving,
    message,
    saveLimits
  } = useUsageLimits();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-champagne" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header Padronizado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-champagne" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Limites de Uso</h1>
          </div>
          <p className="text-sm text-gray-500">Gerencie os limites de créditos e uso para diferentes tipos de usuários do sistema.</p>
        </div>
        
        <button
          onClick={saveLimits}
          disabled={isSaving}
          className="flex items-center gap-2 bg-[#00A86B] text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:brightness-105 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar Configurações
        </button>
      </div>

      {/* Mensagens de Sucesso / Erro */}
      {message && (
        <div className={`p-4 rounded-xl border text-sm font-semibold transition-all animate-in fade-in ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50 border-rose-100 text-rose-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Grid de Cards de Limites */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Card Usuários Free */}
        <UsageLimitCard
          title="USUÁRIOS FREE"
          description="Créditos mensais gratuitos atribuídos de forma automática aos novos usuários que realizarem cadastro na plataforma."
          value={freeLimit}
          onChange={setFreeLimit}
          icon={User}
          iconColor="text-champagne"
          badgeText="Gratuito"
        />

        {/* Card Administradores */}
        <UsageLimitCard
          title="ADMINISTRADORES"
          description="Limite total de créditos para contas administrativas do escritório de advocacia. É recomendado manter este limite elevado."
          value={adminLimit}
          onChange={setAdminLimit}
          icon={Shield}
          iconColor="text-blue-500"
          badgeText="Admin"
        />
      </div>
    </div>
  );
};

export default UsageLimits;