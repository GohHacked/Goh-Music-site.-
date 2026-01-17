import React, { useState, useRef } from 'react';
import { UploadCloud, Music, Play, Pause, Download, Cpu, Sparkles, AlertCircle, X, Info, Zap, Settings } from 'lucide-react';
import { EffectType, ProcessingState, ProcessedResult } from './types';
import { processAudioFile } from './services/audioEngine';
import BackgroundVisualizer from './components/BackgroundVisualizer';
import EffectSelector from './components/EffectSelector';
import InfoModal from './components/InfoModal';

// Increased limit as requested
const MAX_SIZE_MB = 150;

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
        setStatus(prev => ({ ...prev, error: `Файл слишком большой. Максимум ${MAX_SIZE_MB} МБ` }));
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

    // Reset status
    setStatus({ isProcessing: true, progress: 5, error: null, isComplete: false });
    setResult(null);

    try {
      // Small delay to let UI render the loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const blob = await processAudioFile(file, selectedEffect, (progress) => {
        setStatus(prev => ({ ...prev, progress }));
      });

      const url = URL.createObjectURL(blob);
      setResult({ blob, url, duration: 0 }); // Duration 0 as placeholder, standard audio tag handles it
      setStatus({ isProcessing: false, progress: 100, error: null, isComplete: true });
    } catch (err: any) {
      console.error(err);
      let errorMsg = "Ошибка системы. Попробуйте другой файл.";
      
      // Better error handling for large files
      if (err.message && err.message.includes('memory')) {
        errorMsg = "Недостаточно памяти. Попробуйте файл меньшего размера.";
      }
      
      setStatus({ 
        isProcessing: false, 
        progress: 0, 
        error: errorMsg, 
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
    // Release memory
    if (result && result.url) {
      URL.revokeObjectURL(result.url);
    }
    setFile(null);
    setResult(null);
    setSelectedEffect(null);
    setStatus({ isProcessing: false, progress: 0, error: null, isComplete: false });
    setIsPlaying(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen text-slate-100 pb-20 relative selection:bg-fuchsia-500/30 overflow-hidden font-sans">
      <BackgroundVisualizer />
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />
      
      {/* Header */}
      <header className="pt-10 pb-8 text-center relative z-10 px-4 animate-fade-in-up">
        {/* Title Container */}
        <div className="relative inline-block group cursor-default mb-6">
          <div className="absolute inset-0 bg-violet-600 blur-[80px] opacity-30 group-hover:opacity-60 transition-opacity duration-700"></div>
          <h1 className="font-display text-5xl md:text-8xl font-black italic tracking-tighter flex items-center justify-center gap-3 relative z-10">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white drop-shadow-[0_0_15px_rgba(139,92,246,0.8)] neon-text">
              GOH MUSIC
            </span>
          </h1>
          <div className="text-xs font-mono text-violet-400 tracking-[0.4em] mt-2 uppercase flex justify-between w-full opacity-80">
            <span>Audio</span>
            <span>Laboratory</span>
            <span>V2.0</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-6">
          <button 
            onClick={() => setShowInfo(true)}
            className="
              flex items-center gap-3 px-8 py-3 rounded-full 
              bg-black/40 border border-violet-500/30 backdrop-blur-md
              text-violet-300 text-xs font-bold tracking-widest uppercase
              hover:bg-violet-600/20 hover:text-white hover:border-violet-400 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]
              transition-all duration-300 transform hover:scale-105 group
            "
          >
            <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
            ИНФО / ОБНОВЛЕНИЯ
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-5xl relative z-10">
        
        {/* Step 1: Upload */}
        <section className={`glass-panel rounded-3xl p-1 mb-8 transition-all duration-500 ${file ? 'border-fuchsia-500/50 shadow-[0_0_30px_rgba(219,39,119,0.2)]' : 'border-slate-800'}`}>
          <div className="bg-black/40 rounded-[22px] p-6 md:p-10 backdrop-blur-md">
            <div className="flex flex-col items-center">
              {!file ? (
                <div 
                  className="w-full border-2 border-dashed border-slate-700/60 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-fuchsia-500 hover:bg-fuchsia-900/10 transition-all duration-300 group relative overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-fuchsia-500/50 group-hover:shadow-[0_0_30px_rgba(219,39,119,0.4)] transition-all duration-300 relative z-10">
                    <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-fuchsia-400 transition-all" />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-white mb-2 group-hover:text-fuchsia-300 transition-colors relative z-10 text-center">ЗАГРУЗИТЬ ТРЕК</h2>
                  <p className="text-slate-500 text-sm text-center relative z-10 font-mono">MP3, WAV • МАКС {MAX_SIZE_MB} МБ</p>
                </div>
              ) : (
                <div className="w-full flex items-center justify-between bg-gradient-to-r from-slate-900/90 to-black/90 rounded-xl p-6 border border-fuchsia-500/30 shadow-lg relative overflow-hidden animate-fade-in-up">
                  <div className="absolute inset-0 bg-fuchsia-600/5 animate-pulse pointer-events-none"></div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-fuchsia-600 to-violet-700 flex items-center justify-center shrink-0 shadow-lg">
                      <Music className="w-8 h-8 text-white" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-white truncate max-w-[180px] md:max-w-md text-xl font-display tracking-wide">{file.name}</p>
                      <p className="text-sm text-fuchsia-400 font-mono uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB • ГОТОВ К ОБРАБОТКЕ</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleReset}
                    className="p-4 hover:bg-red-500/10 rounded-full text-slate-500 hover:text-red-500 transition-colors relative z-10 group"
                  >
                    <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
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
          <div className="mb-8 bg-red-950/80 border-l-4 border-red-500 backdrop-blur-md p-6 rounded-r-xl flex items-center gap-4 text-red-100 shadow-xl animate-fade-in-up">
            <AlertCircle className="w-8 h-8 shrink-0 text-red-500" />
            <div>
              <h4 className="font-bold text-red-400 uppercase tracking-wider text-sm mb-1">ОШИБКА СИСТЕМЫ</h4>
              <span className="font-medium">{status.error}</span>
            </div>
          </div>
        )}

        {/* Step 2: Effect Selection */}
        {file && !status.isComplete && (
          <div className="animate-fade-in-up">
            <section className="glass-panel rounded-3xl p-6 mb-10 border-slate-700 hover:border-violet-500/30 transition-colors">
              <EffectSelector 
                selectedEffect={selectedEffect} 
                onSelect={setSelectedEffect} 
                disabled={status.isProcessing}
              />
            </section>

            {/* Step 3: Action Button */}
            <div className="flex justify-center mb-16">
              <button
                onClick={handleProcess}
                disabled={!selectedEffect || status.isProcessing}
                className={`
                  relative group px-16 py-8 rounded-2xl font-black text-2xl tracking-widest transition-all duration-300 overflow-hidden font-display italic
                  ${!selectedEffect || status.isProcessing
                    ? 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                    : 'text-white border border-fuchsia-500 shadow-[0_0_40px_rgba(219,39,119,0.3)] hover:shadow-[0_0_80px_rgba(219,39,119,0.5)] hover:-translate-y-1'
                  }
                `}
              >
                {/* Active Background */}
                {(!(!selectedEffect || status.isProcessing)) && (
                   <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 opacity-100 transition-opacity bg-[length:200%_auto] animate-[pulse_3s_infinite]" />
                )}
                
                {/* Tech Grid Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-30"></div>

                <span className="relative flex items-center gap-4 z-10">
                  {status.isProcessing ? (
                     <>
                       <Cpu className="w-8 h-8 animate-spin text-white" />
                       ОБРАБОТКА {status.progress}%
                     </>
                  ) : (
                    <>
                      <span>ИНИЦИАЛИЗАЦИЯ</span>
                      <Zap className="w-8 h-8 fill-yellow-300 text-yellow-300 animate-pulse" />
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {status.isComplete && result && (
          <section className="glass-panel rounded-3xl p-1 animate-fade-in-up border-green-500/30 shadow-[0_0_60px_rgba(34,197,94,0.1)]">
            <div className="bg-gradient-to-b from-black/80 to-slate-900/90 rounded-[22px] p-8 backdrop-blur-xl">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4 text-green-400 text-xs font-bold tracking-widest uppercase">
                    <Sparkles className="w-3 h-3" /> Успешно
                </div>
                <h2 className="text-4xl font-display font-black italic text-white mb-2 tracking-wide">ОБРАБОТКА ЗАВЕРШЕНА</h2>
                <p className="text-slate-400 text-sm font-mono uppercase">ФАЙЛ СГЕНЕРИРОВАН // ГОТОВ К ЗАГРУЗКЕ</p>
              </div>
              
              <div className="flex flex-col items-center gap-10">
                <audio 
                  ref={audioRef} 
                  src={result.url} 
                  onEnded={() => setIsPlaying(false)}
                  onPause={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  className="hidden" // Hide default player, use custom UI
                />
                
                {/* Cyberpunk Play Button */}
                <div className="relative group cursor-pointer" onClick={togglePlay}>
                  {/* Outer Glow Ring */}
                  <div className={`absolute -inset-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur-xl opacity-0 ${isPlaying ? 'opacity-40 animate-pulse' : 'group-hover:opacity-20'} transition-opacity duration-500`}></div>
                  
                  {/* Button */}
                  <div className="relative w-24 h-24 rounded-full bg-black border-2 border-violet-500/50 flex items-center justify-center hover:border-fuchsia-500 hover:shadow-[0_0_30px_rgba(219,39,119,0.4)] transition-all z-10">
                    {isPlaying ? <Pause className="w-10 h-10 text-white fill-white" /> : <Play className="w-10 h-10 text-white fill-white ml-1" />}
                  </div>
                </div>

                {/* Visualizer / Progress Bar */}
                <div className="w-full max-w-lg space-y-2">
                    <div className="flex justify-between text-xs font-mono text-slate-500">
                        <span>00:00</span>
                        <span>PREVIEW</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden relative border border-white/5">
                        <div className={`absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 ${isPlaying ? 'animate-[width-pulse_2s_infinite] w-full' : 'w-0'}`}></div>
                        {/* Grid texture on bar */}
                        <div className="absolute inset-0 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMYAEYB8RmROaABADeOQ8CXl/xfgAAAABJRU5ErkJggg==')] opacity-20"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full mt-4">
                  <a 
                    href={result.url} 
                    download={`GOH_REMIX_${file?.name.replace(/\.[^/.]+$/, "")}.wav`}
                    className="
                      flex items-center justify-center gap-3 
                      bg-white text-black font-black italic tracking-wider py-5 rounded-xl 
                      hover:bg-fuchsia-400 hover:text-white hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]
                      transition-all transform hover:-translate-y-1 active:translate-y-0
                    "
                  >
                    <Download className="w-5 h-5" />
                    СКАЧАТЬ WAV
                  </a>
                  <button
                    onClick={handleReset}
                    className="
                      flex items-center justify-center gap-3
                      bg-transparent hover:bg-slate-800/50 
                      text-slate-300 font-bold tracking-wider py-5 rounded-xl 
                      border border-slate-600 hover:border-white
                      transition-all uppercase
                    "
                  >
                    НОВЫЙ ФАЙЛ
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
      
      {/* Footer */}
      <footer className="absolute bottom-6 w-full text-center text-slate-600 text-[10px] z-10 font-mono uppercase tracking-[0.2em]">
        GOH SYSTEM // {new Date().getFullYear()} // ВСЕ ПРАВА ЗАЩИЩЕНЫ
      </footer>
    </div>
  );
};

export default App;