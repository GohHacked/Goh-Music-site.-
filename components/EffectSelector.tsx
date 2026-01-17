import React from 'react';
import { EffectType } from '../types';
import { Settings2, Music2, Activity, Zap, Waves, Smartphone, Radio, Repeat, Infinity, Mic2, Speaker } from 'lucide-react';

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
  if (effect === EffectType.EIGHT_D) return <Infinity className="w-5 h-5" />;
  if (effect === EffectType.REVERSE) return <Repeat className="w-5 h-5" />;
  if (effect === EffectType.ECHO) return <Mic2 className="w-5 h-5" />;
  if (effect === EffectType.DISTORTION) return <Speaker className="w-5 h-5" />;
  if (effect === EffectType.LOFI) return <Radio className="w-5 h-5" />;
  if (effect === EffectType.NIGHTCORE) return <Zap className="w-5 h-5 text-yellow-400" />;
  return <Settings2 className="w-5 h-5" />;
};

const EffectSelector: React.FC<EffectSelectorProps> = ({ selectedEffect, onSelect, disabled }) => {
  return (
    <div className="w-full">
      <h3 className="text-violet-200 text-lg font-bold mb-4 flex items-center gap-2 uppercase tracking-wider">
        <Settings2 className="w-5 h-5 text-fuchsia-500" />
        Choose Effect
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {effects.map((effect) => (
          <button
            key={effect}
            onClick={() => onSelect(effect)}
            disabled={disabled}
            className={`
              relative overflow-hidden group p-4 rounded-xl border transition-all duration-300
              flex flex-col items-center justify-center gap-2 text-center h-24
              ${selectedEffect === effect 
                ? 'bg-violet-600/90 border-violet-400 shadow-[0_0_25px_rgba(124,58,237,0.6)] text-white scale-105' 
                : 'bg-slate-900/40 border-slate-700/50 text-slate-400 hover:border-fuchsia-500/50 hover:bg-slate-800/80 hover:text-white'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            {/* Background Gradient for Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className={`p-2 rounded-full z-10 ${selectedEffect === effect ? 'bg-white/20' : 'bg-black/30 group-hover:bg-fuchsia-500/20'} transition-colors`}>
              {getIcon(effect)}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider relative z-10">{effect}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EffectSelector;