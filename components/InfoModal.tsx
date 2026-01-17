import React, { useState } from 'react';
import { X, Music, Zap, Smartphone, Shield, Info, History, HelpCircle, ChevronDown, CheckCircle2, Terminal } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'about' | 'updates' | 'faq';

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with scanline effect */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-[#0a0a12] border border-violet-500/40 rounded-xl shadow-[0_0_50px_rgba(124,58,237,0.15)] overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-up">
        
        {/* Top Decorative Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-violet-600 animate-[pulse_3s_infinite]"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-lg border border-violet-500/30">
              <Terminal className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-white tracking-wider">СИСТЕМНОЕ МЕНЮ</h2>
              <p className="text-[10px] text-violet-400 font-mono tracking-[0.2em] uppercase">GOH MUSIC SYSTEM V2.0</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all group"
          >
            <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-black/20 overflow-x-auto">
          <TabButton 
            active={activeTab === 'about'} 
            onClick={() => setActiveTab('about')} 
            icon={<Info className="w-4 h-4" />} 
            label="О ПРОЕКТЕ" 
          />
          <TabButton 
            active={activeTab === 'updates'} 
            onClick={() => setActiveTab('updates')} 
            icon={<History className="w-4 h-4" />} 
            label="ОБНОВЛЕНИЯ" 
          />
          <TabButton 
            active={activeTab === 'faq'} 
            onClick={() => setActiveTab('faq')} 
            icon={<HelpCircle className="w-4 h-4" />} 
            label="FAQ / ПОМОЩЬ" 
          />
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
          
          {/* TAB: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="p-6 bg-gradient-to-br from-violet-900/20 to-transparent border border-violet-500/20 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Music className="w-32 h-32 text-violet-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Добро пожаловать в Лабораторию Звука</h3>
                <p className="text-slate-300 leading-relaxed font-light">
                  <span className="text-fuchsia-400 font-semibold">Goh Music</span> — это современная студия в вашем браузере. Загружайте треки, применяйте уникальные эффекты и создавайте новое звучание всего за пару кликов.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureCard 
                  icon={<Zap className="w-5 h-5 text-yellow-400" />}
                  title="Мгновенная Скорость"
                  desc="Никаких ожиданий. Все изменения применяются моментально."
                />
                <FeatureCard 
                  icon={<Music className="w-5 h-5 text-fuchsia-400" />}
                  title="Любые Форматы"
                  desc="Загружайте музыку в MP3, WAV и других популярных форматах."
                />
                <FeatureCard 
                  icon={<Smartphone className="w-5 h-5 text-green-400" />}
                  title="Работает Везде"
                  desc="Создавайте музыку на телефоне, планшете или компьютере."
                />
                <FeatureCard 
                  icon={<Shield className="w-5 h-5 text-blue-400" />}
                  title="Полная Безопасность"
                  desc="Ваши треки остаются только на вашем устройстве."
                />
              </div>
            </div>
          )}

          {/* TAB: UPDATES */}
          {activeTab === 'updates' && (
            <div className="space-y-6 animate-fade-in-up">
              <UpdateItem 
                version="v2.0" 
                date="Сегодня" 
                isLatest={true}
                changes={[
                  "Новый дизайн Cyberpunk/Neon.",
                  "Поддержка больших файлов (до 150 МБ).",
                  "Новые эффекты: 8D Звук, Distortion, Lo-Fi, Реверс.",
                  "Ускорена работа на смартфонах.",
                  "Полный перевод на русский язык."
                ]} 
              />
              <UpdateItem 
                version="v1.0" 
                date="Январь 2024" 
                changes={[
                  "Запуск платформы.",
                  "Базовые эффекты: Замедление, Ускорение, Bass Boost.",
                ]} 
              />
            </div>
          )}

          {/* TAB: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3 animate-fade-in-up">
              <FaqItem 
                question="Это бесплатно?" 
                answer="Да, все функции сайта полностью бесплатны."
                isOpen={openFaqIndex === 0}
                onClick={() => toggleFaq(0)}
              />
              <FaqItem 
                question="Кто видит мои файлы?" 
                answer="Только вы. Файлы обрабатываются прямо в вашем браузере и никому не передаются."
                isOpen={openFaqIndex === 1}
                onClick={() => toggleFaq(1)}
              />
              <FaqItem 
                question="Почему нет звука после обработки?" 
                answer="Проверьте громкость. Некоторые эффекты могут звучать тише или громче оригинала. Попробуйте другой эффект, если проблема сохраняется."
                isOpen={openFaqIndex === 2}
                onClick={() => toggleFaq(2)}
              />
              <FaqItem 
                question="Какой максимальный размер файла?" 
                answer="Вы можете загружать файлы до 150 МБ. Это сделано для стабильной работы на мобильных устройствах."
                isOpen={openFaqIndex === 3}
                onClick={() => toggleFaq(3)}
              />
              <FaqItem 
                question="Как сохранить музыку?" 
                answer="После обработки нажмите кнопку 'СКАЧАТЬ WAV', и файл сохранится на ваше устройство."
                isOpen={openFaqIndex === 4}
                onClick={() => toggleFaq(4)}
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-black/40 flex justify-center">
            <button 
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-white transition-colors uppercase tracking-widest font-mono"
            >
                [ ЗАКРЫТЬ ОКНО ]
            </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 flex items-center justify-center gap-2 py-4 px-4 text-xs font-bold tracking-widest transition-all
      ${active 
        ? 'text-white bg-white/5 border-b-2 border-violet-500 shadow-[inset_0_-10px_20px_rgba(124,58,237,0.1)]' 
        : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
      }
    `}
  >
    {icon}
    <span className="hidden md:inline">{label}</span>
  </button>
);

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5 hover:border-violet-500/30 transition-all duration-300 group">
    <div className="flex items-start gap-3">
      <div className="mt-1 p-2 bg-black/50 rounded-lg group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <h3 className="text-slate-200 font-bold text-sm mb-1">{title}</h3>
        <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  </div>
);

const UpdateItem = ({ version, date, changes, isLatest }: { version: string, date: string, changes: string[], isLatest?: boolean }) => (
  <div className={`relative border-l-2 ${isLatest ? 'border-fuchsia-500' : 'border-slate-700'} pl-6 pb-2`}>
    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${isLatest ? 'bg-fuchsia-500 shadow-[0_0_10px_rgba(219,39,119,0.8)]' : 'bg-slate-700'}`}></div>
    <div className="flex items-center gap-3 mb-2">
      <span className={`text-xl font-display font-bold ${isLatest ? 'text-white' : 'text-slate-400'}`}>{version}</span>
      <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-white/5">{date}</span>
      {isLatest && <span className="text-[10px] bg-fuchsia-500/20 text-fuchsia-300 px-2 py-0.5 rounded-full border border-fuchsia-500/30 font-bold tracking-wider">LATEST</span>}
    </div>
    <ul className="space-y-2">
      {changes.map((change, i) => (
        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
          {change}
        </li>
      ))}
    </ul>
  </div>
);

const FaqItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => (
  <div className="border border-white/5 rounded-lg bg-slate-900/30 overflow-hidden">
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
    >
      <span className="font-medium text-slate-200 text-sm">{question}</span>
      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
    >
      <div className="p-4 pt-0 text-xs text-slate-400 leading-relaxed border-t border-white/5 bg-black/20">
        {answer}
      </div>
    </div>
  </div>
);

export default InfoModal;