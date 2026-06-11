"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface PlanCreditsPreviewProps {
  used: number;
  currentLimit: number;
  planLimit: number;
  isAdmin: boolean;
}

const PlanCreditsPreview: React.FC<PlanCreditsPreviewProps> = ({ used, currentLimit, planLimit, isAdmin }) => {
  const [showFuture, setShowFuture] = useState(false);
  const [animatedLimit, setAnimatedLimit] = useState(currentLimit);

  // Calcula o limite futuro (limite atual + limite do plano)
  const futureLimit = currentLimit + planLimit;

  useEffect(() => {
    // Reseta para mostrar o atual inicialmente
    setShowFuture(false);
    setAnimatedLimit(currentLimit);

    // Ciclo infinito: 2 segundos no atual, depois faz a transição para o futuro
    const interval = setInterval(() => {
      setShowFuture((prev) => {
        const nextState = !prev;
        if (nextState) {
          // Efeito de contagem progressiva simples até o limite futuro
          let currentVal = currentLimit;
          const step = Math.max(1, Math.floor((futureLimit - currentLimit) / 15));
          const countInterval = setInterval(() => {
            currentVal += step;
            if (currentVal >= futureLimit) {
              setAnimatedLimit(futureLimit);
              clearInterval(countInterval);
            } else {
              setAnimatedLimit(currentVal);
            }
          }, 40);
        } else {
          setAnimatedLimit(currentLimit);
        }
        return nextState;
      });
    }, 4000); // 4 segundos de ciclo completo (2s no atual, 2s no futuro)

    return () => clearInterval(interval);
  }, [currentLimit, futureLimit]);

  // Restante e percentual
  const currentRemaining = Math.max(0, currentLimit - used);
  const futureRemaining = Math.max(0, futureLimit - used);

  const activeRemaining = showFuture ? futureRemaining : currentRemaining;
  const activeLimit = showFuture ? animatedLimit : currentLimit;

  const percentage = activeLimit > 0 ? Math.min((activeRemaining / activeLimit) * 100, 100) : 0;

  // Cor da barrinha
  const barColor = activeRemaining <= 0 
    ? 'bg-gray-800' 
    : (activeRemaining <= 2 ? 'bg-red-500 animate-pulse' : 'bg-champagne');

  return (
    <div className="bg-[#0B1120] rounded-2xl p-5 text-white space-y-4 shadow-lg border border-gray-800/50 w-full animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
          {showFuture ? "Após contratar esse plano" : "Seu saldo de créditos"}
        </span>
        <span className={cn(
          "text-[9px] px-2 py-0.5 rounded text-white font-black uppercase tracking-wider transition-all duration-300",
          showFuture ? "bg-green-600 scale-105" : "bg-gray-800"
        )}>
          {showFuture ? "+ Recarga" : "Atual"}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <span className="text-xs font-medium text-gray-300">Uso da IA</span>
          <span className="text-xs font-bold transition-all duration-300">
            {used} de {activeLimit}
          </span>
        </div>
        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={cn("h-full transition-all duration-1000 ease-out", barColor)} 
            style={{ width: `${percentage}%` }} 
          />
        </div>
      </div>
    </div>
  );
};

export default PlanCreditsPreview;