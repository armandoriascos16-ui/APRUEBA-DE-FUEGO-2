import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, 
  Search, 
  Play, 
  Pause, 
  Check, 
  X, 
  Sparkles, 
  Info, 
  ExternalLink, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Radio,
  Loader2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { 
  ChristianTrack, 
  ChristianMusicCategory, 
  SpiritualMood, 
  AudioDraftState,
  SmartRecommendationResult 
} from './types';
import { 
  VERIFIED_CHRISTIAN_TRACKS, 
  CHRISTIAN_CATEGORIES, 
  SPIRITUAL_MOODS, 
  VERIFIED_EXTERNAL_SOURCES 
} from './christianMusicCatalog';
import { analyzeStoryAndRecommendMusic } from './smartMusicRecommender';

interface ChristianMusicLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrack: (audio: AudioDraftState) => void;
  storyContext?: {
    textContent: string;
    bibleVerse: string;
    category: string;
  };
}

export const ChristianMusicLibraryModal: React.FC<ChristianMusicLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectTrack,
  storyContext
}) => {
  const [activeTab, setActiveTab] = useState<'recomendadas' | 'catalogo' | 'fuentes'>('recomendadas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedMood, setSelectedMood] = useState<string>('todos');
  
  // Real Audio playback states
  const [activeTrack, setActiveTrack] = useState<ChristianTrack | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(30);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);

  const [inspectingLicenseTrack, setInspectingLicenseTrack] = useState<ChristianTrack | null>(null);

  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Run smart recommendation on the story context
  const recommendationResult: SmartRecommendationResult = analyzeStoryAndRecommendMusic(
    storyContext?.textContent || '',
    storyContext?.bibleVerse || '',
    storyContext?.category || 'reflexion'
  );

  useEffect(() => {
    // If no context given, default to catalog
    if (!storyContext?.textContent && !storyContext?.bibleVerse) {
      setActiveTab('catalogo');
    }
  }, [storyContext]);

  // Clean up audio on unmount or when modal is closed
  useEffect(() => {
    return () => {
      stopAndCleanupAudio();
    };
  }, []);

  // Update volume and mute on audio element when changed
  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = isMuted ? 0 : volume;
      audioPlayerRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const stopAndCleanupAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.removeAttribute('src');
      audioPlayerRef.current.load();
    }
    setPlayingTrackId(null);
    setLoadingTrackId(null);
    setPlaybackState('idle');
    setErrorMessage(null);
    setCurrentTime(0);
  };

  const handleClose = () => {
    stopAndCleanupAudio();
    onClose();
  };

  if (!isOpen) return null;

  // Toggle play / pause with robust state tracking and error handling
  const handleTogglePlay = (track: ChristianTrack) => {
    const audio = audioPlayerRef.current;
    if (!audio) return;

    // Case 1: Clicked on currently playing track -> Pause it
    if (playingTrackId === track.id && playbackState === 'playing') {
      audio.pause();
      setPlaybackState('paused');
      return;
    }

    // Case 2: Clicked on currently paused track -> Resume it
    if (playingTrackId === track.id && playbackState === 'paused') {
      setLoadingTrackId(track.id);
      setPlaybackState('loading');
      setErrorMessage(null);

      audio.play()
        .then(() => {
          setPlaybackState('playing');
          setLoadingTrackId(null);
          setErrorMessage(null);
        })
        .catch((err) => {
          console.warn('Error al reanudar audio:', err);
          setPlaybackState('error');
          setLoadingTrackId(null);
          if (err.name === 'NotAllowedError') {
            setErrorMessage('La reproducción fue bloqueada por el navegador. Pulsa reproducir para intentarlo de nuevo.');
          } else {
            setErrorMessage('No se pudo reanudar esta canción. Prueba otra pista.');
          }
        });
      return;
    }

    // Case 3: Different track or fresh playback
    // 1. Pause any previous audio
    audio.pause();
    setCurrentTime(0);

    // 2. Setup new track
    setActiveTrack(track);
    setPlayingTrackId(track.id);
    setLoadingTrackId(track.id);
    setPlaybackState('loading');
    setErrorMessage(null);
    setCurrentDuration(track.duration || 30);

    // 3. Connect real source
    audio.src = track.audioUrl;
    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;

    // 4. Initiate real playback
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Audio confirmed playing by browser
          setPlaybackState('playing');
          setLoadingTrackId(null);
          setErrorMessage(null);
        })
        .catch((err) => {
          console.warn('Error al iniciar reproducción de audio:', err);
          setPlaybackState('error');
          setLoadingTrackId(null);

          if (err.name === 'NotAllowedError') {
            setErrorMessage('La reproducción fue bloqueada por el navegador. Pulsa reproducir para intentarlo de nuevo.');
          } else if (err.name === 'NotSupportedError') {
            setErrorMessage('El formato de este audio no es admitido por el navegador.');
          } else {
            setErrorMessage('No se pudo cargar esta canción. Prueba otra pista.');
          }
        });
    }
  };

  const handleAudioError = () => {
    const audio = audioPlayerRef.current;
    const mediaError = audio?.error;
    console.error('Error en elemento de audio:', mediaError);

    setPlaybackState('error');
    setLoadingTrackId(null);

    if (mediaError) {
      switch (mediaError.code) {
        case 1: // MEDIA_ERR_ABORTED
          setErrorMessage('La carga del audio fue interrumpida.');
          break;
        case 2: // MEDIA_ERR_NETWORK
          setErrorMessage('Error de red al cargar el archivo de audio. Verifica la conexión.');
          break;
        case 3: // MEDIA_ERR_DECODE
          setErrorMessage('No se pudo decodificar el archivo de audio.');
          break;
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          setErrorMessage('Esta fuente no permite reproducir el audio directamente o no está disponible.');
          break;
        default:
          setErrorMessage('No se pudo cargar esta canción. Prueba otra pista.');
      }
    } else {
      setErrorMessage('No se pudo cargar esta canción. Prueba otra pista.');
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = newTime;
    }
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleChooseTrack = (track: ChristianTrack) => {
    stopAndCleanupAudio();

    onSelectTrack({
      audioUrl: track.audioUrl,
      duration: Math.min(30, track.duration || 30),
      type: 'catalog',
      title: track.title,
      artist: track.artist,
      license: track.license,
      attribution: track.attribution,
      category: track.categoryLabel,
      mood: track.moods[0],
      sourceUrl: track.sourceUrl,
      trimStart: 0,
      trimEnd: Math.min(30, track.duration || 30),
      volume: volume
    });

    onClose();
  };

  // Filter catalog
  const filteredCatalog = VERIFIED_CHRISTIAN_TRACKS.filter(track => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      track.title.toLowerCase().includes(term) ||
      track.artist.toLowerCase().includes(term) ||
      track.description.toLowerCase().includes(term) ||
      track.categoryLabel.toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (selectedCategory !== 'todos' && track.category !== selectedCategory) {
      return false;
    }

    if (selectedMood !== 'todos' && !track.moods.includes(selectedMood as SpiritualMood)) {
      return false;
    }

    return true;
  });

  const formatSeconds = (sec: number) => {
    const s = Math.floor(sec);
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  // Render play button for a track
  const renderPlayButton = (track: ChristianTrack, size: 'sm' | 'md' = 'md') => {
    const isThisTrackPlaying = playingTrackId === track.id && playbackState === 'playing';
    const isThisTrackLoading = loadingTrackId === track.id || (playingTrackId === track.id && playbackState === 'loading');
    const isThisTrackPaused = playingTrackId === track.id && playbackState === 'paused';
    const isThisTrackError = playingTrackId === track.id && playbackState === 'error';

    const btnDim = size === 'md' ? 'h-11 w-11' : 'h-10 w-10';
    const iconDim = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

    return (
      <button
        type="button"
        onClick={() => handleTogglePlay(track)}
        className={`${btnDim} rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all active:scale-95 ${
          isThisTrackPlaying
            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/50 shadow-amber-500/30'
            : isThisTrackError
            ? 'bg-rose-950 text-rose-400 border border-rose-500/50'
            : 'bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300'
        }`}
        title={
          isThisTrackLoading
            ? 'Cargando canción...'
            : isThisTrackPlaying
            ? 'Pausar canción'
            : isThisTrackPaused
            ? 'Continuar canción'
            : isThisTrackError
            ? 'Reintentar reproducción'
            : 'Escuchar canción'
        }
      >
        {isThisTrackLoading ? (
          <Loader2 className={`${iconDim} animate-spin text-amber-400`} />
        ) : isThisTrackPlaying ? (
          <Pause className={`${iconDim} fill-current`} />
        ) : isThisTrackError ? (
          <AlertCircle className={`${iconDim} text-rose-400`} />
        ) : (
          <Play className={`${iconDim} fill-current ml-0.5`} />
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] space-y-3.5">
        
        {/* Real HTML5 Audio Element with Event Listeners */}
        <audio
          ref={audioPlayerRef}
          preload="auto"
          onLoadStart={() => {
            setPlaybackState('loading');
          }}
          onLoadedMetadata={() => {
            if (audioPlayerRef.current) {
              const dur = audioPlayerRef.current.duration;
              if (dur && !isNaN(dur) && isFinite(dur)) {
                setCurrentDuration(dur);
              }
            }
          }}
          onCanPlay={() => {
            if (playbackState === 'loading' && !loadingTrackId) {
              setPlaybackState('idle');
            }
          }}
          onPlaying={() => {
            setPlaybackState('playing');
            setLoadingTrackId(null);
            setErrorMessage(null);
          }}
          onPause={() => {
            if (playbackState !== 'error') {
              setPlaybackState('paused');
            }
          }}
          onTimeUpdate={() => {
            if (audioPlayerRef.current) {
              setCurrentTime(audioPlayerRef.current.currentTime);
            }
          }}
          onEnded={() => {
            setPlaybackState('idle');
            setPlayingTrackId(null);
            setCurrentTime(0);
          }}
          onError={handleAudioError}
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Music className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Biblioteca de Música Cristiana para Estados</h3>
              <p className="text-[11px] text-slate-400">Pistas autorizadas con sonido real, himnos instrumentales y licencias verificadas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick volume control in header */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={handleToggleMute}
                className="text-slate-400 hover:text-white"
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-amber-400" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeSliderChange}
                className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                title={`Volumen: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-850 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('recomendadas')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'recomendadas'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Recomendación Inteligente</span>
            {recommendationResult.primaryRecommendation && (
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalogo')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'catalogo'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Music className="h-3.5 w-3.5" />
            <span>Catálogo Completo ({VERIFIED_CHRISTIAN_TRACKS.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fuentes')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'fuentes'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Fuentes Externas</span>
          </button>
        </div>

        {/* TAB 1: MODO INTELIGENTE / RECOMENDACIÓN */}
        {activeTab === 'recomendadas' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]">
            
            {/* Analysis Summary Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-950 to-slate-950 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Análisis Temático Espiritual</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {recommendationResult.confidenceScore}% Coincidencia
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {recommendationResult.explanation}
              </p>

              {/* Badges of Detected Moods */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {recommendationResult.detectedMoods.map(mood => {
                  const moodObj = SPIRITUAL_MOODS.find(m => m.id === mood);
                  return (
                    <span 
                      key={mood}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border capitalize ${moodObj?.color || 'bg-slate-800 text-slate-300 border-slate-700'}`}
                    >
                      {mood}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Primary Recommendation Card */}
            {recommendationResult.primaryRecommendation && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  Pista Principal Recomendada:
                </span>

                <div className="p-3.5 rounded-2xl bg-slate-950 border-2 border-amber-500/50 space-y-2.5 shadow-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      {renderPlayButton(recommendationResult.primaryRecommendation, 'md')}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white leading-snug truncate">
                            {recommendationResult.primaryRecommendation.title}
                          </h4>
                          {playingTrackId === recommendationResult.primaryRecommendation.id && playbackState === 'playing' && (
                            <span className="flex gap-0.5 items-end h-3 shrink-0">
                              <span className="w-0.5 h-3 bg-amber-400 animate-pulse" />
                              <span className="w-0.5 h-2 bg-amber-400 animate-pulse delay-75" />
                              <span className="w-0.5 h-2.5 bg-amber-400 animate-pulse delay-150" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">
                          {recommendationResult.primaryRecommendation.artist}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>⏱ {recommendationResult.primaryRecommendation.duration}s</span>
                          <span>·</span>
                          <span className="text-amber-400 font-semibold">{recommendationResult.primaryRecommendation.categoryLabel}</span>
                          <span>·</span>
                          <span className="text-emerald-400 font-bold">{recommendationResult.primaryRecommendation.license}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleChooseTrack(recommendationResult.primaryRecommendation!)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 shrink-0"
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Seleccionar</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-serif italic pt-1 border-t border-slate-900">
                    «{recommendationResult.primaryRecommendation.description}»
                  </p>
                </div>
              </div>
            )}

            {/* Alternative Recommendations */}
            {recommendationResult.alternatives.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Otras Opciones Compatibles:
                </span>

                <div className="space-y-2">
                  {recommendationResult.alternatives.map(track => (
                    <div 
                      key={track.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-850 hover:border-slate-800 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {renderPlayButton(track, 'sm')}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs font-bold text-white truncate">{track.title}</h5>
                            {playingTrackId === track.id && playbackState === 'playing' && (
                              <span className="flex gap-0.5 items-end h-2.5 shrink-0">
                                <span className="w-0.5 h-2.5 bg-amber-400 animate-pulse" />
                                <span className="w-0.5 h-1.5 bg-amber-400 animate-pulse delay-75" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                          <span className="text-[10px] text-amber-400 font-medium">{track.categoryLabel} · ⏱ {track.duration}s</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setInspectingLicenseTrack(track)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                          title="Ver licencia"
                        >
                          <Info className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChooseTrack(track)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold transition-colors"
                        >
                          Elegir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: CATÁLOGO COMPLETO */}
        {activeTab === 'catalogo' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por himno, autor, paz, fe, adoración..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('todos')}
                className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === 'todos'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Todas las categorías
              </button>
              {CHRISTIAN_CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Track List */}
            <div className="space-y-2">
              {filteredCatalog.map(track => (
                <div
                  key={track.id}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-850 hover:border-slate-800 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {renderPlayButton(track, 'sm')}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white truncate">{track.title}</h4>
                        {playingTrackId === track.id && playbackState === 'playing' && (
                          <span className="flex gap-0.5 items-end h-2.5 shrink-0">
                            <span className="w-0.5 h-2.5 bg-amber-400 animate-pulse" />
                            <span className="w-0.5 h-1.5 bg-amber-400 animate-pulse delay-75" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{track.artist}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                        <span className="text-amber-400 font-semibold">{track.categoryLabel}</span>
                        <span>·</span>
                        <span>⏱ {track.duration}s</span>
                        <span>·</span>
                        <span className="text-emerald-400">{track.licenseType.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setInspectingLicenseTrack(track)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Ver términos y licencia"
                    >
                      <Info className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleChooseTrack(track)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                    >
                      Seleccionar
                    </button>
                  </div>
                </div>
              ))}

              {filteredCatalog.length === 0 && (
                <div className="p-8 text-center space-y-2">
                  <Music className="h-8 w-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-400">No se encontraron pistas para los filtros seleccionados</p>
                  <p className="text-xs text-slate-500">Prueba con palabras como paz, gracia, fe, alabanza o salmo.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: FUENTES EXTERNAS COMPATIBLES */}
        {activeTab === 'fuentes' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]">
            <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/30 text-blue-200 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1 text-blue-300">
                <ShieldCheck className="h-4 w-4" />
                <span>Condiciones de Fuentes Externas (Prompt Sección 6)</span>
              </span>
              <p className="leading-relaxed">
                A Prueba de Fuego solo integra fuentes de música y radio cristianas cuyos términos autoricen expresamente su uso o difusión. Las transmisiones de radio continuas operan en su propio reproductor en vivo y no son extraídas ni modificadas.
              </p>
            </div>

            <div className="space-y-2.5">
              {VERIFIED_EXTERNAL_SOURCES.map(source => (
                <div key={source.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white">{source.name}</h4>
                      <p className="text-[11px] text-amber-400 font-semibold">{source.organization}</p>
                    </div>

                    <a
                      href={source.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 shrink-0"
                    >
                      <span>Sitio Oficial</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {source.description}
                  </p>

                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-0.5">
                    <span className="font-bold text-slate-400 block text-[10px]">Términos de uso:</span>
                    <p className="text-slate-300">{source.licenseTerms}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Atribución requerida: <strong className="text-slate-300">{source.requiredAttribution}</strong></span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      source.allowsStateEmbed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {source.allowsStateEmbed ? '✓ Pistas en Estados' : '📡 Solo Señal En Vivo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-time Playing Bar / Diagnostics */}
        {activeTrack && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-2 shadow-lg">
            
            {/* Error banner if playback encountered an issue */}
            {errorMessage && (
              <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span className="truncate">{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTogglePlay(activeTrack)}
                  className="px-2 py-1 rounded-lg bg-rose-500 text-white font-bold text-[11px] flex items-center gap-1 shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reintentar</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {renderPlayButton(activeTrack, 'sm')}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h5 className="text-xs font-bold text-white truncate">{activeTrack.title}</h5>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                      playbackState === 'playing'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : playbackState === 'loading'
                        ? 'bg-amber-500/20 text-amber-300'
                        : playbackState === 'error'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {playbackState === 'playing' ? 'Reproduciendo sonido' : 
                       playbackState === 'loading' ? 'Cargando pista...' : 
                       playbackState === 'paused' ? 'En pausa' : 
                       playbackState === 'error' ? 'Error' : 'Listo'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{activeTrack.artist}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleChooseTrack(activeTrack)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-orange-500/20 active:scale-95"
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  <span>Usar esta canción</span>
                </button>
              </div>
            </div>

            {/* Scrubber timeline and audio volume */}
            <div className="space-y-1 pt-1">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span>{formatSeconds(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={currentDuration || 30}
                  step="0.1"
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span>{formatSeconds(currentDuration || 30)}</span>

                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="p-1 rounded text-slate-400 hover:text-white ml-1"
                  title={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-amber-400" />}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Modal de Detalle de Licencia */}
        {inspectingLicenseTrack && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-100">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Condiciones de Uso y Licencia</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setInspectingLicenseTrack(null)}
                  className="h-7 w-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Título de la pista:</span>
                  <p className="font-bold text-white">{inspectingLicenseTrack.title}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">Tipo de Licencia:</span>
                  <p className="text-emerald-400 font-semibold">{inspectingLicenseTrack.license}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">Atribución Obligatoria:</span>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px] bg-slate-950 p-2 rounded-xl border border-slate-800">
                    {inspectingLicenseTrack.attribution}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block">Permisos en Estados:</span>
                  <ul className="text-slate-300 space-y-1 list-disc list-inside mt-1">
                    <li>Sincronización con fotografía o versículo: <strong>Sí</strong></li>
                    <li>Recorte del audio hasta 30 segundos: <strong>Sí</strong></li>
                    <li>Distribución devocional no comercial: <strong>Autorizada</strong></li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectingLicenseTrack(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>🎧 Audios listos para reproducción de hasta 30 segundos</span>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
