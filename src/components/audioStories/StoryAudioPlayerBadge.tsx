import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Music, 
  Mic, 
  Upload, 
  ShieldCheck, 
  Info, 
  X 
} from 'lucide-react';
import { StoryAudioMeta } from '../../types';

interface StoryAudioPlayerBadgeProps {
  audio: StoryAudioMeta;
  isStoryPaused: boolean;
  onAudioPlayStateChange?: (isPlaying: boolean) => void;
}

export const StoryAudioPlayerBadge: React.FC<StoryAudioPlayerBadgeProps> = ({
  audio,
  isStoryPaused,
  onAudioPlayStateChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync with story pause state
  useEffect(() => {
    if (!audioRef.current) return;
    if (isStoryPaused && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onAudioPlayStateChange?.(false);
    }
  }, [isStoryPaused]);

  // Attempt autoplay on mount (gracefully handles browser autoplay blocks)
  useEffect(() => {
    if (!audioRef.current || !audio.audioUrl) return;

    audioRef.current.currentTime = audio.trimStart || 0;
    audioRef.current.volume = audio.volume ?? 0.9;

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          onAudioPlayStateChange?.(true);
        })
        .catch(() => {
          // Browser requires user click/gesture
          setIsPlaying(false);
          onAudioPlayStateChange?.(false);
        });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audio.audioUrl]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onAudioPlayStateChange?.(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        onAudioPlayStateChange?.(true);
      }).catch(err => console.warn('Audio play prevented:', err));
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    setCurrentTime(cur);

    const maxLimit = (audio.trimStart || 0) + (audio.duration || 30);
    if (cur >= maxLimit) {
      audioRef.current.pause();
      audioRef.current.currentTime = audio.trimStart || 0;
      setIsPlaying(false);
      onAudioPlayStateChange?.(false);
    }
  };

  const getIcon = () => {
    if (audio.type === 'recording') return <Mic className="h-3.5 w-3.5 text-red-400" />;
    if (audio.type === 'upload') return <Upload className="h-3.5 w-3.5 text-purple-400" />;
    return <Music className="h-3.5 w-3.5 text-amber-400 animate-pulse" />;
  };

  return (
    <>
      {/* Hidden Audio Player */}
      <audio
        ref={audioRef}
        src={audio.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          onAudioPlayStateChange?.(false);
        }}
        className="hidden"
      />

      {/* Floating Audio Capsule inside Story */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative z-30 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-white shadow-xl max-w-full select-none"
      >
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className="h-6 w-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 hover:bg-amber-400 transition-colors shadow-sm"
          title={isPlaying ? 'Pausar música' : 'Reproducir música'}
        >
          {isPlaying ? <Pause className="h-3 w-3 fill-current" /> : <Play className="h-3 w-3 fill-current ml-0.5" />}
        </button>

        {/* Music Waves Animation when playing */}
        <div className="flex items-center gap-0.5 h-3">
          <span className={`w-0.5 bg-amber-400 rounded-full transition-all ${isPlaying ? 'h-3 animate-pulse' : 'h-1'}`} />
          <span className={`w-0.5 bg-amber-400 rounded-full transition-all ${isPlaying ? 'h-2 animate-pulse delay-75' : 'h-1.5'}`} />
          <span className={`w-0.5 bg-amber-400 rounded-full transition-all ${isPlaying ? 'h-3.5 animate-pulse delay-150' : 'h-1'}`} />
        </div>

        {/* Track Title and Artist */}
        <div className="min-w-0 pr-1">
          <p className="text-[11px] font-bold text-white truncate max-w-[160px] leading-tight">
            {audio.title}
          </p>
          {audio.artist && (
            <p className="text-[9px] text-amber-300 truncate max-w-[160px] leading-none">
              {audio.artist}
            </p>
          )}
        </div>

        {/* Mute Toggle */}
        <button
          type="button"
          onClick={handleToggleMute}
          className="p-1 text-slate-300 hover:text-white transition-colors shrink-0"
          title={isMuted ? 'Activar sonido' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5 text-red-400" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>

        {/* License Info Button */}
        {audio.attribution && (
          <button
            type="button"
            onClick={() => setShowLicenseModal(true)}
            className="p-1 text-slate-400 hover:text-amber-400 transition-colors shrink-0"
            title="Ver atribución y licencia"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* License & Attribution Modal */}
      {showLicenseModal && (
        <div 
          onClick={(e) => {
            e.stopPropagation();
            setShowLicenseModal(false);
          }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Atribución y Licencia del Audio</span>
              </div>
              <button
                type="button"
                onClick={() => setShowLicenseModal(false)}
                className="h-6 w-6 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold">Pista:</span>
                <p className="font-bold text-white">{audio.title}</p>
                {audio.artist && <p className="text-slate-300 text-[11px]">{audio.artist}</p>}
              </div>

              {audio.license && (
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Licencia:</span>
                  <p className="text-emerald-400 font-semibold">{audio.license}</p>
                </div>
              )}

              {audio.attribution && (
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Atribución de Uso:</span>
                  <p className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-slate-300 font-mono text-[10px] leading-relaxed">
                    {audio.attribution}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowLicenseModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
