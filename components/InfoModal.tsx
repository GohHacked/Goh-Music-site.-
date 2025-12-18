import React from 'react';
import { X, Music, Zap, Smartphone, Shield, Info } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.25)] overflow-hidden transform transition-all animate-fade-in-up">
        
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
            <Info className="w-6 h-6 text-blue-400" />
            О Goh Music Site
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="relative p-6 md:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          
          <div className="text-center mb-8">
            <p className="text-lg text-slate-300 leading-relaxed">
              <span className="text-blue-400 font-bold">Goh Music Site</span> — это мощный инструмент для обработки звука прямо в вашем браузере. Загружайте, выбирайте эффекты и скачивайте обновленные треки за секунды.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard 
              icon={<Music className="w-6 h-6 text-blue-400" />}
              title="Аудио Форматы"
              desc="Поддержка MP3 и WAV файлов до 15МБ. Мгновенная загрузка и конвертация."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-yellow-400" />}
              title="15+ Эффектов"
              desc="Замедление (Slowed), Reverb, Bass Boost, Nightcore, Телефон и другие уникальные фильтры."
            />
            <FeatureCard 
              icon={<Smartphone className="w-6 h-6 text-green-400" />}
              title="Мобильность"
              desc="Сайт полностью адаптирован под мобильные телефоны. Творите музыку где угодно."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6 text-purple-400" />}
              title="Безопасность"
              desc="Вся обработка происходит локально на вашем устройстве. Ваши файлы не загружаются на сервера."
            />
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl">
            <p className="text-sm text-blue-200 text-center">
              Создано для любителей музыки, ремиксов и уникального звучания.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative p-6 border-t border-white/10 bg-white/5 text-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-95"
          >
            Понятно, Начать!
          </button>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-slate-800/50 hover:bg-slate-800/80 p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 group">
    <div className="mb-3 p-3 bg-slate-900/50 rounded-lg w-fit group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default InfoModal;