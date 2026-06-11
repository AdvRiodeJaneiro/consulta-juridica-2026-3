"use client";

import React from 'react';
import { X, Gavel, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlans } from '../hooks/usePlans';

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPro: boolean;
}

const LimitModal: React.FC<LimitModalProps> = ({ isOpen, onClose, isPro }) => {
  const navigate = useNavigate();
  const { plans } = usePlans();
  
  if (!isOpen) return null;

  // Busca o preço do primeiro plano cadastrado (ou usa fallback padrão de R$ 49,90)
  const firstPlan = plans && plans.length > 0 ? plans[0] : null;
  const planPrice = firstPlan ? firstPlan.price : '49,90';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 transition-colors z-10 bg-white rounded-full">
          <X className="w-6 h-6" />
        </button>

        <div className="p-10 overflow-y-auto scrollbar-hide">
          <div className="text-center space-y-8">
            {/* Ícone de Justiça (Gavel) */}
            <div className="w-20 h-20 rounded-[30px] flex items-center justify-center mx-auto bg-yellow-50">
              <Gavel className="w-10 h-10 text-[#C5A059]" />
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">
                {isPro 
                  ? 'Seus créditos pagos mensais chegaram ao fim' 
                  : `Faça sua consulta por apenas R$ ${planPrice}`
                }
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                {isPro ? (
                  <strong>Faça upgrade de plano para ter mais créditos.</strong>
                ) : (
                  'Tire suas dúvidas, faça cálculo de pensão alimentícia, rescisão trabalhista...'
                )}
              </p>
            </div>

            <button 
              onClick={() => { navigate('/planos'); onClose(); }}
              className="w-full bg-[#C5A059] text-white py-5 rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-champagne/10 hover:scale-[1.02] transition-all"
            >
              <span>{isPro ? 'Fazer Upgrade' : 'Eu quero'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitModal;