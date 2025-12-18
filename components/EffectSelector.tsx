import React from 'react';
import { EffectType } from '../types';
import { Settings2, Music2, Activity, Zap, Waves, Smartphone, Radio } from 'lucide-react';

interface EffectSelectorProps {
  selectedEffect: EffectType | null;
  onSelect: (effect: EffectType) => void;
  disabled: boolean;
}

const effects = Object.values(EffectType);

const getIcon = (effect: EffectType) => {
  if (effect.includes('Slow')) return <Waves className="w-5 h-5" />;
  if (effect.includes('Fast')) return <Zap className="w-5 h-5" />;
  if (effect.includes('Bass')) return <Activity className="w-5 h-5" />;
  if (effect.includes('Treble')) return <Music2 className="w-5 h-5" />;
  if (effect === EffectType.TELEPHONE) return <Smartphone className="w-5 h-5" />;
  if (effect === EffectType.RADIO) return <Radio className="w-5 h-5" />;
  return <Settings2 className="w-5 h-5" />;
};

const EffectSelector: React.FC<EffectSelectorProps> = ({ selectedEffect, onSelect, disabled }) => {
  return (
    <div className="w-full">
      <h3 className="text-blue-200 text-lg font-semibold mb-4 flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-blue-400" />
        Выберите Эффект
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {effects.map((effect) => (
          <button
            key={effect}
            onClick={() => onSelect(effect)}
            disabled={disabled}
            className={`
              relative overflow-hidden group p-4 rounded-xl border transition-all duration-300
              flex flex-col items-center justify-center gap-2 text-center
              ${selectedEffect === effect 
                ? 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.5)] text-white' 
                : 'bg-slate-900/50 border-slate-700 text-slate-300 hover:border-blue-500/50 hover:bg-slate-800/80'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Hover Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className={`p-2 rounded-full ${selectedEffect === effect ? 'bg-blue-500' : 'bg-slate-800 group-hover:bg-slate-700'} transition-colors`}>
              {getIcon(effect)}
            </div>
            <span className="text-sm font-medium relative z-10">{effect}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EffectSelector;