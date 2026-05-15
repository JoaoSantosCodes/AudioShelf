'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, RotateCw, Volume2, List, Moon, X } from 'lucide-react';
import { Book, Chapter } from '@/data/books';
import { supabase } from '@/lib/supabase';

interface AudioPlayerProps {
  book: Book;
  initialChapterIndex?: number;
  userId: string;
}

export default function AudioPlayer({ book, initialChapterIndex = 0, userId }: AudioPlayerProps) {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(initialChapterIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentChapter = book.chapters[currentChapterIndex];
  const streamUrl = `/api/stream?file_id=${currentChapter.telegram_file_id}`;

  // Sleep Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sleepTimer !== null && sleepTimer > 0) {
      interval = setInterval(() => {
        setSleepTimer(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (sleepTimer === 0) {
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setSleepTimer(null);
    }
    return () => clearInterval(interval);
  }, [sleepTimer, isPlaying]);

  // Sincronização inicial com o Cloud
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('book_id', book.id)
          .maybeSingle();

        if (data) {
          const chapterIdx = book.chapters.findIndex(c => c.telegram_file_id === data.chapter_telegram_id);
          if (chapterIdx !== -1) {
            setCurrentChapterIndex(chapterIdx);
            setCurrentTime(data.current_time);
            if (audioRef.current) audioRef.current.currentTime = data.current_time;
          }
        } else {
          // Fallback local se não houver no Cloud
          const saved = localStorage.getItem(`audiobook-progress-${book.id}`);
          if (saved) {
            const { chapterIndex, time } = JSON.parse(saved);
            setCurrentChapterIndex(chapterIndex);
            setCurrentTime(time);
            if (audioRef.current) audioRef.current.currentTime = time;
          }
        }
      } catch (err) {
        console.error("Erro ao carregar progresso:", err);
      }
    };
    fetchProgress();
  }, [book.id]);

  // Salvar Progresso (Cloud + Local)
  useEffect(() => {
    const syncProgress = async () => {
      if (!isPlaying || !audioRef.current) return;

      const time = audioRef.current.currentTime;
      
      // Local (rápido)
      localStorage.setItem(`audiobook-progress-${book.id}`, JSON.stringify({
        chapterIndex: currentChapterIndex,
        time
      }));

      // Cloud (a cada 10s via intervalo ou quando pausar)
      try {
        await supabase
          .from('user_progress')
          .upsert({
            user_id: userId,
            book_id: book.id,
            chapter_telegram_id: currentChapter.telegram_file_id,
            current_time: time,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id, book_id' });
      } catch (err) {
        console.error("Erro ao salvar no Cloud:", err);
      }
    };

    const interval = setInterval(syncProgress, 10000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, currentChapter.telegram_file_id, book.id]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleMetadataLoaded = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const changePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
  };

  // Manter velocidade e volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.volume = volume;
    }
  }, [currentChapterIndex, playbackRate, volume]);

  const isVideo = currentChapter.type === 'video';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-border-custom z-50 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto flex flex-col">
        {/* VÍDEO VIEWPORT (Aparece apenas para vídeos) */}
        {isVideo && (
          <div className="w-full max-w-4xl mx-auto mt-4 px-4">
            <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-gold/10 relative group">
              <video 
                ref={audioRef as any}
                src={streamUrl}
                className="w-full h-full"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleMetadataLoaded}
                onEnded={() => {
                  if (currentChapterIndex < book.chapters.length - 1) {
                    setCurrentChapterIndex(prev => prev + 1);
                  } else {
                    setIsPlaying(false);
                  }
                }}
                onClick={togglePlay}
              />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none transition-all group-hover:bg-black/20">
                  <div className="w-16 h-16 rounded-full bg-gold/20 backdrop-blur-md flex items-center justify-center border border-gold/30 shadow-2xl">
                    <Play size={32} className="text-gold fill-gold ml-1" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTROLS BAR */}
        <div className="px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row items-center gap-4 md:gap-6">
          {!isVideo && (
            <audio 
              ref={audioRef as any}
              src={streamUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleMetadataLoaded}
              onEnded={() => {
                if (currentChapterIndex < book.chapters.length - 1) {
                  setCurrentChapterIndex(prev => prev + 1);
                } else {
                  setIsPlaying(false);
                }
              }}
            />
          )}

          {/* BOOK INFO (LEFT) */}
          <div className="flex items-center justify-between w-full md:w-64 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {!isVideo && (
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-surface-2 border border-border-custom flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-lg">
                  <img src={book.cover} className="w-full h-full object-cover" alt="" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[12px] md:text-[13px] font-medium text-text truncate">{book.title}</div>
                <div className="text-[10px] md:text-[11px] text-text-muted truncate">{currentChapter.title}</div>
              </div>
            </div>
            
            {/* Mobile Play Button */}
            <button 
              onClick={togglePlay}
              className="md:hidden w-10 h-10 rounded-full bg-gold text-bg flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
            </button>
          </div>

          {/* MAIN CONTROLS & PROGRESS (CENTER) */}
          <div className="flex-1 flex flex-col items-center gap-2 w-full">
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => currentChapterIndex > 0 && setCurrentChapterIndex(prev => prev - 1)}
                disabled={currentChapterIndex === 0}
                className="text-text-dim hover:text-gold transition-colors disabled:opacity-20"
              >
                <SkipBack size={22} fill="currentColor" />
              </button>

              <button onClick={() => skip(-30)} className="text-text-dim hover:text-text transition-colors">
                <RotateCcw size={20} />
              </button>

              <button 
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-gold text-bg flex items-center justify-center hover:bg-amber hover:scale-105 transition-all shadow-lg shadow-gold/20"
              >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
              </button>

              <button onClick={() => skip(30)} className="text-text-dim hover:text-text transition-colors">
                <RotateCw size={20} />
              </button>

              <button 
                onClick={() => currentChapterIndex < book.chapters.length - 1 && setCurrentChapterIndex(prev => prev + 1)}
                disabled={currentChapterIndex === book.chapters.length - 1}
                className="text-text-dim hover:text-gold transition-colors disabled:opacity-20"
              >
                <SkipForward size={22} fill="currentColor" />
              </button>
            </div>

            {/* PROGRESS BAR */}
            <div className="flex items-center gap-3 w-full max-w-[600px]">
              <span className="text-[10px] text-text-muted w-8 text-center tabular-nums">{formatTime(currentTime)}</span>
              <input 
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="flex-1 h-1 bg-surface-3 rounded-full appearance-none cursor-pointer accent-gold hover:h-1.5 transition-all"
              />
              <span className="text-[10px] text-text-muted w-8 text-center tabular-nums">{formatTime(duration)}</span>
            </div>

            {/* Mobile Sub-controls */}
            <div className="flex md:hidden items-center justify-center gap-8 w-full mt-1">
              <button onClick={() => skip(-30)} className="text-text-dim active:text-gold flex flex-col items-center gap-1">
                <RotateCcw size={18} />
                <span className="text-[8px] uppercase tracking-tighter">Voltar 30s</span>
              </button>
              <button 
                onClick={changePlaybackRate}
                className="text-gold text-[11px] font-bold border border-gold/30 px-2 py-0.5 rounded"
              >
                {playbackRate}x
              </button>
              <button onClick={() => skip(30)} className="text-text-dim active:text-gold flex flex-col items-center gap-1">
                <RotateCw size={18} />
                <span className="text-[8px] uppercase tracking-tighter">Avançar 30s</span>
              </button>
            </div>
          </div>

          {/* VOLUME & SPEED (RIGHT - DESKTOP) */}
          <div className="hidden md:flex items-center gap-5 w-64 justify-end shrink-0">
            <div className="relative group/speed">
              <button 
                onClick={changePlaybackRate}
                className="bg-surface-3 border border-border-custom text-gold text-[12px] font-bold px-3 py-1.5 rounded-md hover:bg-gold hover:text-bg transition-all min-w-[55px] shadow-sm"
              >
                {playbackRate}x
              </button>
              <div className="absolute bottom-full right-0 mb-3 hidden group-hover/speed:flex flex-col bg-surface border border-border-custom rounded-xl overflow-hidden shadow-2xl z-50 min-w-[120px]">
                <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-text-muted border-b border-border-custom bg-bg/50 font-bold">Sleep Timer</div>
                {[15, 30, 45, 60].map(m => (
                  <button key={m} onClick={() => setSleepTimer(m * 60)} className="px-4 py-2.5 text-[12px] hover:bg-gold hover:text-bg transition-colors text-left flex justify-between items-center group/item">
                    {m} min <Moon size={12} className="text-text-dim group-hover/item:text-bg" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5 group/vol">
              <Volume2 size={18} className="text-text-dim group-hover/vol:text-gold transition-colors" />
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-24 h-1 bg-surface-3 rounded-full appearance-none cursor-pointer accent-text-dim hover:accent-gold transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
