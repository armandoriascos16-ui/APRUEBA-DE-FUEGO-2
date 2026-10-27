import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Scissors, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  Music, 
  Mic, 
  Upload, 
  ShieldCheck 
} from 'lucide-react';
import { AudioDraftState } from './types';

interface AudioStoryEditorProps {
  audio: AudioDraftState;
  onChangeAudio: (updated: AudioDraftState) => void;
  onRemoveAudio: () => void;
  onChangeMusicClick: () => void;
  onSmartRecommendClick: () => void;
}

export const AudioStoryEditor: React.FC<AudioStoryEditorProps> = ({
  audio,
  onChangeAudio,
  onRemoveAudio,
  onChangeMusicClick,
  onSmartRecommendClick
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(audio.volume ?? 0.9);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTogglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
    } else {
      el.currentTime = audio.trimStart || 0;
      el.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.warn('Preview play error in editor:', e);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    setCurrentTime(current);

    const maxLimit = (audio.trimStart || 0) + (audio.duration || 30);
    if (current >= maxLimit) {
      audioRef.current.pause();
      audioRef.current.currentTime = audio.trimStart || 0;
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(false);
    onChangeAudio({ ...audio, volume: newVol });
  };

  const getAudioTypeLabel = () => {
    switch (audio.type) {
      case 'recording': return { icon: Mic, label: 'Grabación de Voz Propia', color: 'text-red-400 bg-red-500/10 border-red-500/30' };
      case 'upload': return { icon: Upload, label: 'Audio Propio Subido', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 'catalog': return { icon: Music, label: 'Música Cristiana Verificada', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      default: return { icon: Music, label: 'Pista de Audio', color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  const typeInfo = getAudioTypeLabel();
  const TypeIcon = typeInfo.icon;

  return (
    <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 shadow-md">
      
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audio.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
        className="hidden"
      />

      {/* Header Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Music className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${typeInfo.color}`}>
                <TypeIcon className="h-2.5 w-2.5" />
                <span>{typeInfo.label}</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold">⏱ {audio.duration}s máx.</span>
            </div>

            <h4 className="text-xs font-bold text-white truncate mt-1">
              {audio.title}
            </h4>
            {audio.artist && (
              <p className="text-[11px] text-slate-400 truncate">
                {audio.artist}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onRemoveAudio}
          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors shrink-0"
          title="Quitar audio del estado"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Progress & Scrubbing Bar */}
      <div className="space-y-1">
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-100"
            style={{ width: `${Math.min(100, ((currentTime - (audio.trimStart || 0)) / (audio.duration || 30)) * 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>00:{Math.floor(currentTime) < 10 ? `0${Math.floor(currentTime)}` : Math.floor(currentTime)}</span>
          <span className="text-amber-400 font-bold">00:{audio.duration < 10 ? `0${audio.duration}` : audio.duration}s</span>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-900 text-xs">
        
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-sm"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
          <span>{isPlaying ? 'Pausar' : 'Escuchar'}</span>
        </button>

        {/* Volume slider */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-white"
          >
            {isMuted || volume === 0 ? <VolumeX className="h-3.5 w-3.5 text-red-400" /> : <Volume2 className="h-3.5 w-3.5 text-slate-300" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-16 accent-amber-500 cursor-pointer"
            title="Volumen del audio"
          />
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onSmartRecommendClick}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1"
            title="Recomendar según el versículo o texto"
          >
            <Sparkles className="h-3 w-3" />
            <span>Sugerir</span>
          </button>

          <button
            type="button"
            onClick={onChangeMusicClick}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 text-[11px] font-semibold flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Cambiar</span>
          </button>
        </div>

      </div>

      {/* Attribution snippet if catalog track */}
      {audio.attribution && (
        <div className="text-[10px] text-slate-400 font-mono truncate pt-1 border-t border-slate-900 flex items-center gap-1">
          <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
          <span className="truncate">{audio.attribution}</span>
        </div>
      )}

    </div>
  );
};
