import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface UsageLimitCardProps {
  title: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  icon: LucideIcon;
  iconColor: string;
  badgeText: string;
}

const UsageLimitCard: React.FC<UsageLimitCardProps> = ({
  title,
  description,
  value,
  onChange,
  icon: Icon,
  iconColor,
  badgeText
}) => {
  return (
    <div className="bg-white border-l-4 border-champagne rounded-2xl p-8 border border-gray-100 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest", iconColor)}>
          <div className="w-5 h-5 bg-gray-50 rounded flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          {title}
        </div>
        <span className="bg-gray-100 text-gray-500 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          {badgeText}
        </span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        {description}
      </p>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Limite de Créditos de Entrada</label>
        <div className="relative">
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onChange(isNaN(val) ? 0 : val);
            }}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 pr-20 text-sm text-gray-900 focus:bg-white outline-none transition-all"
            placeholder="Ex: 3"
          />
          <div className="absolute right-4 top-3.5 text-gray-400 text-xs font-bold">créditos</div>
        </div>
      </div>
    </div>
  );
};

export default UsageLimitCard;