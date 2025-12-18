import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Music, Play, Pause, Download, Cpu, Sparkles, AlertCircle, X, Info, Snowflake } from 'lucide-react';
import { EffectType, ProcessingState, ProcessedResult } from './types';
import { processAudioFile } from './services/audioEngine';
import BackgroundVisualizer from './components/BackgroundVisualizer';
import EffectSelector from './components/EffectSelector';
import InfoModal from './components/InfoModal';

const MAX_SIZE_MB = 15;

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<EffectType | null>(null);
  const [status, setStatus] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    error: null,
    isComplete: false,
  });
  const [result, setResult] = useState<ProcessedResult | null>(null);
  
  // UI State
  const [showInfo, setShowInfo] = useState(false);
  
  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_SIZE_MB * 1024 * 1024) {
        setStatus(prev => ({ ...prev, error: `Файл слишком большой. Максимум ${MAX_SIZE_MB}МБ` }));
        return;
      }
      setFile(selectedFile);
      setStatus({ isProcessing: false, progress: 0, error: null, isComplete: false });
      setResult(null);
      setIsPlaying(false);
    }
  };

  const handleProcess = async () => {
    if (!file || !selectedEffect) return;

    setStatus({ isProcessing: true, progress: 10, error: null, isComplete: false });

    try {
      // Small delay to let UI update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const blob = await processAudioFile(file, selectedEffect, (progress) => {
        setStatus(prev => ({ ...prev, progress }));
      });

      const url = URL.createObjectURL(blob);
      setResult({ blob, url, duration: 0 });
      setStatus({ isProcessing: false, progress: 100, error: null, isComplete: true });
    } catch (err) {
      console.error(err);
      setStatus({ 
        isProcessing: false, 
        progress: 0, 
        error: "Ошибка обработки аудио. Попробуйте другой файл.", 
        isComplete: false 
      });
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setSelectedEffect(null);
    setStatus({ isProcessing: false, progress: 0, error: null, isComplete: false });
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen text-slate-100 pb-20 relative selection:bg-cyan-500/30">
      <BackgroundVisualizer />
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
      
      {/* Header */}
      <header className="pt-12 pb-8 text-center relative z-10 px-4">
        {/* Title Container */}
        <div className="relative inline-block group">
          <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
          <h1 className="font-display text-4xl md:text-7xl font-bold flex items-center justify-center gap-3 md:gap-6">
            <Snowflake className="w-8 h-8 md:w-12 md:h-12 text-cyan-300 animate-[spin_10s_linear_infinite]" />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-cyan-100 to-blue-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]">
              Goh Music Site
            </span>
            <Snowflake className="w-8 h-8 md:w-12 md:h-12 text-cyan-300 animate-[spin_12s_linear_infinite_reverse]" />
          </h1>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-4 mt-6">
          <p className="text-cyan-100/80 text-sm md:text-lg max-w-lg mx-auto font-light tracking-wide shadow-black drop-shadow-md">
            Создавай магию звука с новогодним настроением
          </p>
          
          <button 
            onClick={() => setShowInfo(true)}
            className="
              flex items-center gap-2 px-6 py-2 rounded-full 
              bg-white/5 border border-white/20 backdrop-blur-md
              text-cyan-200 text-sm font-semibold tracking-wider uppercase
              hover:bg-white/10 hover:text-white hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]
              transition-all duration-300 transform hover:scale-105 active:scale-95
            "
          >
            <Info className="w-4 h-4" />
            Что умеет этот сайт?
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-4xl relative z-10">
        
        {/* Step 1: Upload */}
        <section className={`glass-panel rounded-3xl p-1 mb-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] ${file ? 'border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-white/10'}`}>
          <div className="bg-slate-900/40 rounded-[22px] p-6 md:p-8 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              {!file ? (
                <div 
                  className="w-full border-2 border-dashed border-slate-600/60 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-900/10 transition-all duration-300 group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-20 h-20 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/50 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                    <UploadCloud className="w-10 h-10 text-cyan-200 group-hover:text-cyan-100 group-hover:drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-all" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-200 transition-colors">Загрузить музыку</h2>
                  <p className="text-slate-400 text-sm text-center">MP3, WAV до {MAX_SIZE_MB}МБ</p>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-2xl p-5 border border-cyan-500/30 shadow-lg">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                      <Music className="w-7 h-7 text-white" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-white truncate max-w-[180px] md:max-w-xs text-lg">{file.name}</p>
                      <p className="text-sm text-cyan-400 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="p-3 hover:bg-red-500/20 rounded-xl text-slate-400 hover:text-red-400 transition-colors group"
                  >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="audio/*" 
                className="hidden" 
              />
            </div>
          </div>
        </section>

        {/* Error Message */}
        {status.error && (
          <div className="mb-8 bg-red-950/40 border border-red-500/50 backdrop-blur-md p-4 rounded-xl flex items-center gap-3 text-red-200 shadow-lg animate-fade-in-up">
            <AlertCircle className="w-6 h-6 shrink-0 text-red-400" />
            <span className="font-medium">{status.error}</span>
          </div>
        )}

        {/* Step 2: Effect Selection */}
        {file && !status.isComplete && (
          <div className="animate-fade-in-up">
            <section className="glass-panel rounded-3xl p-6 mb-8 border-white/10 hover:border-cyan-500/20 transition-colors">
              <EffectSelector 
                selectedEffect={selectedEffect} 
                onSelect={setSelectedEffect} 
                disabled={status.isProcessing}
              />
            </section>

            {/* Step 3: Action Button */}
            <div className="flex justify-center mb-12">
              <button
                onClick={handleProcess}
                disabled={!selectedEffect || status.isProcessing}
                className={`
                  relative group px-10 py-5 rounded-full font-bold text-xl tracking-wider transition-all duration-300 overflow-hidden
                  ${!selectedEffect || status.isProcessing
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'text-white shadow-[0_0_40px_rgba(6,182,212,0.4)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)] hover:scale-105 active:scale-95'
                  }
                `}
              >
                {/* Button Background for active state */}
                {(!(!selectedEffect || status.isProcessing)) && (
                   <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 opacity-90 group-hover:opacity-100 transition-opacity bg-[length:200%_auto] animate-[pulse_3s_infinite]" />
                )}

                {/* Glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-[shine_1.5s_infinite]" />

                <span className="relative flex items-center gap-3 drop-shadow-md">
                  {status.isProcessing ? (
                     <>
                       <Cpu className="w-6 h-6 animate-spin text-cyan-100" />
                       Обработка {status.progress}%
                     </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 text-yellow-200 animate-pulse" />
                      Начать Магию
                      <Sparkles className="w-6 h-6 text-yellow-200 animate-pulse delay-100" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {status.isComplete && result && (
          <section className="glass-panel rounded-3xl p-1 animate-fade-in-up border-cyan-400/50 shadow-[0_0_50px_rgba(34,211,238,0.15)]">
            <div className="bg-gradient-to-b from-slate-900/60 to-slate-950/60 rounded-[22px] p-8 backdrop-blur-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 mb-2 drop-shadow-sm">Готово!</h2>
                <p className="text-slate-400 text-sm">Ваш трек успешно обработан</p>
              </div>
              
              <div className="flex flex-col items-center gap-8">
                <audio 
                  ref={audioRef} 
                  src={result.url} 
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                />
                
                {/* Custom Play Button with Glow */}
                <div className="relative">
                  <div className={`absolute inset-0 bg-cyan-500 blur-xl rounded-full opacity-0 ${isPlaying ? 'opacity-40 animate-pulse' : 'group-hover:opacity-20'} transition-opacity`}></div>
                  <button 
                    onClick={togglePlay}
                    className="relative w-20 h-20 rounded-full bg-slate-900 border-2 border-cyan-500/50 flex items-center justify-center hover:bg-cyan-500 hover:text-white transition-all text-cyan-400 shadow-2xl z-10 group"
                  >
                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                  </button>
                </div>

                {/* Progress Bar Visual */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                   <div className={`h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(34,211,238,0.8)] ${isPlaying ? 'animate-[width-pulse_2s_infinite]' : ''}`} style={{ width: '100%' }}></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full mt-2">
                  <a 
                    href={result.url} 
                    download={`goh_remix_${file?.name.replace(/\.[^/.]+$/, "")}.wav`}
                    className="
                      flex items-center justify-center gap-2 
                      bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
                      text-white font-bold py-4 rounded-2xl shadow-lg shadow-cyan-900/50 
                      transition-all transform hover:-translate-y-1 hover:shadow-cyan-500/30 active:translate-y-0
                    "
                  >
                    <Download className="w-5 h-5" />
                    Скачать Музыку
                  </a>
                  <button
                    onClick={handleReset}
                    className="
                      flex items-center justify-center gap-2 
                      bg-slate-800 hover:bg-slate-700 
                      text-slate-300 hover:text-white font-bold py-4 rounded-2xl 
                      border border-slate-700 hover:border-slate-500 
                      transition-all
                    "
                  >
                    Обработать другую
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
      
      {/* Footer copyright */}
      <footer className="absolute bottom-4 w-full text-center text-slate-500 text-xs z-10">
        &copy; {new Date().getFullYear()} Goh Music Site. Winter Edition.
      </footer>

      {/* CSS Keyframes for custom animations */}
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(12deg); }
          50%, 100% { transform: translateX(200%) skewX(12deg); }
        }
      `}</style>
    </div>
  );
};

export default App;