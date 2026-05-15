'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Settings, 
  Maximize2, 
  List, 
  Download,
  Share2,
  Heart,
  Repeat,
  Shuffle,
  ChevronUp,
  FileText,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';
import { Book } from '@/data/books';
import { useMedia } from '@/context/MediaContext';

interface AudioPlayerProps {
  book: Book;
  userId: string;
}

export default function AudioPlayer({ book, userId }: AudioPlayerProps) {
  const { isMinimized, toggleMinimize, closeMedia } = useMedia();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showAISection, setShowAISection] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [transcription, setTranscription] = useState(book.chapters[currentChapter]?.transcription || '');
  const [summary, setSummary] = useState(book.summary || '');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    setTranscription(book.chapters[currentChapter]?.transcription || '');
    setSummary(book.summary || '');
  }, [currentChapter, book]);

  useEffect(() => {
    if (isPlaying && !isMinimized) {
      setupVisualizer();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [isPlaying, isMinimized]);

  const setupVisualizer = () => {
    if (!audioRef.current || !canvasRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const source = audioContext.createMediaElementSource(audioRef.current);
    const analyser = audioContext.createAnalyser();

    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#d4af37');
        gradient.addColorStop(1, '#f4d03f');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    draw();
  };

  const handleTranscribe = async () => {
    setIsTranscribing(true);
    try {
      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          file_id: book.chapters[currentChapter].telegram_file_id,
          chapter_id: book.chapters[currentChapter].id 
        })
      });
      const data = await res.json();
      if (data.text) setTranscription(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSummarize = async () => {
    if (!transcription) return;
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: transcription,
          book_id: book.id 
        })
      });
      const data = await res.json();
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ 
        y: 0,
        height: isMinimized ? 'auto' : 'auto',
        bottom: isMinimized ? 96 : 0, // Above mobile nav
        padding: isMinimized ? 0 : 0
      }}
      className={`fixed left-0 right-0 z-[100] transition-all duration-500 ${isMinimized ? 'mx-4 mb-4 flex justify-center' : 'bg-background/80 backdrop-blur-2xl border-t border-border-custom shadow-2xl'}`}
    >
      <audio 
        ref={audioRef}
        src={`/api/stream?file_id=${book.chapters[currentChapter].telegram_file_id}`}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => currentChapter < book.chapters.length - 1 && setCurrentChapter(currentChapter + 1)}
      />

      {isMinimized ? (
        /* MINI PLAYER PILL */
        <motion.div 
          layoutId="player-container"
          className="bg-surface-1/90 backdrop-blur-xl border border-gold/30 rounded-full px-4 py-2 flex items-center gap-4 shadow-2xl shadow-gold/10 max-w-sm w-full"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gold/20 shrink-0">
            <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full border-2 border-gold/30 flex items-center justify-center">
                <div 
                  className="w-full h-full border-2 border-gold rounded-full" 
                  style={{ 
                    clipPath: `inset(0 ${100 - (currentTime / duration) * 100}% 0 0)`,
                    transition: 'clip-path 0.3s ease'
                  }} 
                />
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[11px] font-bold text-text truncate leading-tight">{book.title}</h4>
            <p className="text-[9px] text-text-dim truncate uppercase tracking-widest">{book.author}</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-gold text-bg flex items-center justify-center hover:bg-gold-bright transition-colors"
            >
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>
            <button 
              onClick={() => toggleMinimize(false)}
              className="p-1.5 text-text-muted hover:text-gold transition-colors"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </motion.div>
      ) : (
        /* FULL PLAYER BAR */
        <motion.div layoutId="player-container" className="max-w-[1920px] mx-auto">
          <AnimatePresence>
            {showAISection && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-surface-3/50 backdrop-blur-xl border-t border-border-custom overflow-hidden"
              >
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-2">
                        <FileText size={14} /> Transcrição
                      </h3>
                      {!transcription && (
                        <button 
                          onClick={handleTranscribe}
                          disabled={isTranscribing}
                          className="text-[10px] bg-gold/10 hover:bg-gold/20 text-gold px-3 py-1 rounded-full border border-gold/20 transition-all flex items-center gap-2"
                        >
                          {isTranscribing ? <Loader2 size={12} className="animate-spin" /> : <Play size={10} />}
                          {isTranscribing ? 'Processando...' : 'Transcrever Áudio'}
                        </button>
                      )}
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar text-[13px] leading-relaxed text-text-dim">
                      {transcription || 'Nenhuma transcrição disponível. Clique em transcrever para começar.'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-amber flex items-center gap-2">
                        <Sparkles size={14} /> Resumo & Insights IA
                      </h3>
                      {transcription && !summary && (
                        <button 
                          onClick={handleSummarize}
                          disabled={isSummarizing}
                          className="text-[10px] bg-amber/10 hover:bg-amber/20 text-amber px-3 py-1 rounded-full border border-amber/20 transition-all flex items-center gap-2"
                        >
                          {isSummarizing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={10} />}
                          {isSummarizing ? 'Analisando...' : 'Gerar Insights'}
                        </button>
                      )}
                    </div>
                    <div className="bg-black/20 rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar text-[13px] leading-relaxed text-text-dim">
                      {summary ? (
                        <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                          {summary}
                        </div>
                      ) : (
                        'O resumo será gerado a partir da transcrição.'
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="px-6 py-4 flex items-center justify-between gap-6 relative">
            <div className="flex items-center gap-4 w-1/4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative w-12 h-12 rounded-lg overflow-hidden shadow-lg border border-gold/20 shrink-0"
              >
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
              </motion.div>
              <div className="min-w-0">
                <h4 className="text-sm font-serif font-bold text-text truncate">{book.title}</h4>
                <p className="text-[11px] text-text-muted font-medium truncate uppercase tracking-wider">{book.author}</p>
              </div>
              <button 
                onClick={() => setShowAISection(!showAISection)}
                className={`p-2 rounded-lg transition-all ${showAISection ? 'bg-gold/10 text-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'text-text-muted hover:text-gold'}`}
              >
                <Sparkles size={18} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2 max-w-2xl">
              <div className="flex items-center gap-6">
                <button className="text-text-dim hover:text-gold transition-colors"><Shuffle size={18} /></button>
                <button 
                  onClick={() => currentChapter > 0 && setCurrentChapter(currentChapter - 1)}
                  className="text-text hover:text-gold transition-colors"
                >
                  <SkipBack size={22} fill="currentColor" />
                </button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full bg-gold text-bg flex items-center justify-center shadow-lg shadow-gold/20 hover:bg-gold-bright transition-colors"
                >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </motion.button>
                <button 
                  onClick={() => currentChapter < book.chapters.length - 1 && setCurrentChapter(currentChapter + 1)}
                  className="text-text hover:text-gold transition-colors"
                >
                  <SkipForward size={22} fill="currentColor" />
                </button>
                <button className="text-text-dim hover:text-gold transition-colors"><Repeat size={18} /></button>
              </div>

              <div className="w-full flex items-center gap-3">
                <span className="text-[10px] font-bold text-text-muted w-10 text-right">{formatTime(currentTime)}</span>
                <div className="flex-1 relative group h-6 flex items-center">
                  <canvas ref={canvasRef} width="600" height="24" className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" />
                  <input 
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => {
                      const time = Number(e.target.value);
                      setCurrentTime(time);
                      if (audioRef.current) audioRef.current.currentTime = time;
                    }}
                    className="w-full h-1 bg-surface-3 rounded-full appearance-none cursor-pointer accent-gold group-hover:h-1.5 transition-all"
                  />
                </div>
                <span className="text-[10px] font-bold text-text-muted w-10">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 w-1/4">
              <div className="flex items-center gap-2 group">
                <Volume2 size={18} className="text-text-muted group-hover:text-gold transition-colors" />
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  defaultValue="0.7"
                  onChange={(e) => audioRef.current && (audioRef.current.volume = Number(e.target.value))}
                  className="w-20 h-1 bg-surface-3 rounded-full appearance-none cursor-pointer accent-gold"
                />
              </div>
              <button 
                onClick={() => setShowPlaylist(!showPlaylist)}
                className={`p-2 rounded-lg transition-all ${showPlaylist ? 'bg-gold/10 text-gold' : 'text-text-muted hover:text-gold'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => toggleMinimize(true)}
                className="p-2 rounded-lg text-text-muted hover:text-gold transition-all"
                title="Minimizar"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showPlaylist && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full right-6 mb-4 w-80 glass-panel rounded-2xl border border-gold/20 shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-border-custom bg-gold/5">
              <h3 className="font-serif font-bold text-gold text-sm">Capítulos</h3>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">{book.title}</p>
            </div>
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {book.chapters.map((chapter, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setCurrentChapter(idx); setIsPlaying(true); if (audioRef.current) audioRef.current.play(); }}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${idx === currentChapter ? 'bg-gold/10 border-l-2 border-gold' : 'hover:bg-surface-2'}`}
                >
                  <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${idx === currentChapter ? 'text-gold' : 'text-text-muted'}`}>
                    {idx === currentChapter && isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${idx === currentChapter ? 'text-gold' : 'text-text'}`}>{chapter.title}</p>
                    <p className="text-[10px] text-text-muted">Áudio • Telegram</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
