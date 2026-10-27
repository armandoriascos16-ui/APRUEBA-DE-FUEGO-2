import React, { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { useApp } from '../../context/AppContext';
import { 
  Tv, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Users, 
  Radio, 
  Flame, 
  AlertCircle,
  Share2,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Search,
  Filter,
  Check,
  Compass,
  Home
} from 'lucide-react';

export interface TVChannel {
  id: string;
  name: string;
  callsign: string;
  description: string;
  category: string;
  categoryKey: 'oficial' | 'mision' | 'musica' | 'creacion' | 'infantil' | 'salud';
  logo: string;
  streamUrl: string; // Direct verified HLS (.m3u8) live stream
  officialSiteUrl: string;
  isOfficial: boolean;
  status: 'en_vivo' | 'programado';
  viewerCount: number;
  currentProgram: string;
  coverage: string;
  resolution: string;
}

export const OFFICIAL_ADVENTIST_CHANNELS: TVChannel[] = [
  {
    id: 'esperanza_tv_interamerica',
    name: 'Esperanza TV / Hope Channel Inter-América',
    callsign: 'Hope Channel Oficial',
    description: 'Canal oficial de la División Interamericana de la Iglesia Adventista del Séptimo Día. Programación espiritual en español 24/7 con sermones bíblicos, música sacra, salud integral y educación familiar.',
    category: 'Oficial IASD & Familia',
    categoryKey: 'oficial',
    logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=240&auto=format&fit=crop&q=80',
    streamUrl: 'https://jstre.am/live/jsl:EC0Mq0i6HJU.m3u8',
    officialSiteUrl: 'https://esperanzatv.org/',
    isOfficial: true,
    status: 'en_vivo',
    viewerCount: 460,
    currentProgram: 'Alabanza & Palabra Viva con Jóvenes Adventistas',
    coverage: 'Colombia, Centroamérica, Caribe & Sudamérica',
    resolution: 'HD 1080p'
  },
  {
    id: '3abn_latino',
    name: '3ABN Latino — Three Angels Broadcasting',
    callsign: '3ABN Oficial',
    description: 'Red internacional de televisión adventista en español las 24 horas del día. Mensajes cristocéntricos, conferencias de profecía bíblica, cocina vegetariana y testimonios de fe.',
    category: 'Misión & Estudio Bíblico',
    categoryKey: 'mision',
    logo: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=240&auto=format&fit=crop&q=80',
    streamUrl: 'https://3abn.bozztv.com/3abn2/Lat_live/smil:Lat_live.smil/playlist.m3u8',
    officialSiteUrl: 'https://3abnlatino.tv/',
    isOfficial: true,
    status: 'en_vivo',
    viewerCount: 395,
    currentProgram: 'Al Rescate de la Juventud & Escuela Sabática Viva',
    coverage: 'Internacional / Las 3 Américas & Europa',
    resolution: 'HD 1080p'
  },
  {
    id: 'nuevo_tiempo_tv',
    name: 'Nuevo Tiempo Televisión (Español)',
    callsign: 'Nuevo Tiempo TV',
    description: 'Red televisiva oficial de la Iglesia Adventista para Sudamérica y el mundo hispano. Producciones profesionales sobre relaciones familiares, valores bíblicos y actualidad cristiana.',
    category: 'Valores & Actualidad Cristiana',
    categoryKey: 'oficial',
    logo: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=240&auto=format&fit=crop&q=80',
    streamUrl: 'https://streamtv.novotempo.com/CDN-TV-ES/smil:tvnuevotiempo.smil/playlist.m3u8',
    officialSiteUrl: 'https://www.nuevotiempo.org/tv/',
    isOfficial: true,
    status: 'en_vivo',
    viewerCount: 520,
    currentProgram: 'Conexión Abierta: Juventud A Prueba de Fuego',
    coverage: 'Sudamérica, Colombia & Streaming Mundial',
    resolution: 'HD 720p'
  },
  {
    id: '3abn_praise_him',
    name: '3ABN Praise Him — Música Sacra & Alabanza',
    callsign: '3ABN Praise Him',
    description: 'Señal continua dedicada exclusivamente a la adoración y música sacra adventista: grandes coros, himnos tradicionales, cuartetos y momentos de devoción espiritual.',
    category: 'Música Sacra 24/7',
    categoryKey: 'musica',
    logo: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=240&auto=format&fit=crop&q=80',
    streamUrl: 'https://3abn.bozztv.com/3abn1/PraiseHim/smil:PraiseHim.smil/playlist.m3u8',
    officialSiteUrl: 'https://3abn.org/',
    isOfficial: true,
    status: 'en_vivo',
    viewerCount: 310,
    currentProgram: 'Concierto de Alabanzas & Himnos de Esperanza',
    coverage: 'Mundial',
    resolution: 'HD 720p'
  },
  {
    id: 'logos_tv',
    name: 'Logos TV — Creacionismo & Historia Bíblica',
    callsign: 'Logos TV',
    description: 'Canal adventista con conferencias de arqueología bíblica, creacionismo científico, naturaleza y música sacra para todo el público hispanohablante.',
    category: 'Historia & Creacionismo',
    categoryKey: 'creacion',
    logo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=240&auto=format&fit=crop&q=80',
    streamUrl: 'https://streamer1.streamhost.org/salive/logosH/master.m3u8',
    officialSiteUrl: 'https://logostv.es/',
    isOfficial: true,
    status: 'en_vivo',
    viewerCount: 215,
    currentProgram: 'Documentales del Creador & Evidencias Bíblicas',
    coverage: 'España & Habla Hispana',
    resolution: 'HD 1080p'
  },
  {
    id: '3abn_kids',
    name: '3ABN Kids — Niños, Aventureros y Conquistadores',
    callsign: '3ABN Kids',
    description: 'Programación cristiana para niños y adolescentes con lecciones bíblicas, valores morales, historias de la naturaleza, actividades manuales y canciones infantiles.',
    category: 'Infantil & Conquistadores',
    categoryKey: 'infantil',
    logo: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=240&auto=format&fit=crop&q=80',
    streamUrl: 'https://3abn.bozztv.com/3abn2/Kids_live/smil:Kids_live.smil/playlist.m3u8',
    officialSiteUrl: 'https://3abnkids.tv/',
    isOfficial: true,
    status: 'en_vivo',
    viewerCount: 280,
    currentProgram: 'Aventuras Bíblicas & El Rincón del Conquistador',
    coverage: 'Mundial',
    resolution: 'HD 720p'
  },
  {
    id: '3abn_dare_to_dream',
    name: '3ABN Dare to Dream — Salud & Estilo de Vida',
    callsign: 'Dare to Dream',
    description: 'Canal enfocado en el mensaje adventista pro-salud: nutrición sana, prevención de enfermedades, ejercicio, cocina vegetariana y salud mental cristiana.',
    category: 'Salud Integral & Familia',
    categoryKey: 'salud',
    logo: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=240&auto=format&fit=crop&q=80',
    streamUrl: 'https://3abn.bozztv.com/3abn2/d2d_live/smil:d2d_live.smil/playlist.m3u8',
    officialSiteUrl: 'https://d2d.tv/',
    isOfficial: true,
    status: 'en_vivo',
    viewerCount: 190,
    currentProgram: 'Cocina Vegetariana & Los 8 Remedios Naturales',
    coverage: 'Mundial',
    resolution: 'HD 720p'
  }
];

export const LiveTVPortal: React.FC = () => {
  const { setActiveTab } = useApp();
  const [selectedChannel, setSelectedChannel] = useState<TVChannel>(OFFICIAL_ADVENTIST_CHANNELS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [playerStatus, setPlayerStatus] = useState<'conectando' | 'en_vivo' | 'pausado' | 'error'>('conectando');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Setup HLS Stream Player
  const initializeStream = useCallback((channel: TVChannel, autoPlay: boolean = true) => {
    const video = videoRef.current;
    if (!video) return;

    // Reset status
    setPlayerStatus('conectando');
    setErrorMessage(null);

    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    video.pause();
    video.removeAttribute('src');
    video.load();

    const streamUrl = channel.streamUrl;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 12000,
        fragLoadingTimeOut: 15000
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.volume = volume;
          video.muted = isMuted;
          video.play()
            .then(() => {
              setIsPlaying(true);
              setPlayerStatus('en_vivo');
            })
            .catch(() => {
              // Autoplay with sound might be blocked by browser; retry muted
              video.muted = true;
              setIsMuted(true);
              video.play()
                .then(() => {
                  setIsPlaying(true);
                  setPlayerStatus('en_vivo');
                })
                .catch((playErr) => {
                  console.warn('Playback error:', playErr);
                  setPlayerStatus('pausado');
                  setIsPlaying(false);
                });
            });
        } else {
          setPlayerStatus('pausado');
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('Network error in TV stream, attempting reload...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('Media error in TV stream, recovering...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal unrecoverable HLS error in TV stream:', data);
              setPlayerStatus('error');
              setErrorMessage('La señal de este canal experimentó una interrupción de red. Puedes pulsar "Reintentar Conexión" o abrir el canal en su sitio oficial.');
              hls.destroy();
              hlsRef.current = null;
              break;
          }
        }
      });

      hlsRef.current = hls;

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Apple Safari HLS
      video.src = streamUrl;
      video.volume = volume;
      video.muted = isMuted;

      const handleLoadedMetadata = () => {
        if (autoPlay) {
          video.play()
            .then(() => {
              setIsPlaying(true);
              setPlayerStatus('en_vivo');
            })
            .catch(() => {
              video.muted = true;
              setIsMuted(true);
              video.play()
                .then(() => {
                  setIsPlaying(true);
                  setPlayerStatus('en_vivo');
                })
                .catch(() => {
                  setPlayerStatus('pausado');
                  setIsPlaying(false);
                });
            });
        }
      };

      video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });
    } else {
      setPlayerStatus('error');
      setErrorMessage('Tu navegador no cuenta con soporte nativo para transmisiones de video HLS en vivo.');
    }
  }, [volume, isMuted]);

  // Handle Channel Switching
  const handleSelectChannel = (channel: TVChannel) => {
    setSelectedChannel(channel);
    initializeStream(channel, true);

    // Notify other players (radio) to pause
    window.dispatchEvent(new CustomEvent('apdf_media_play', { 
      detail: { type: 'tv', channelId: channel.id } 
    }));
  };

  // Initial load
  useEffect(() => {
    initializeStream(selectedChannel, true);

    // Coordinate with Radio: Pause TV if Radio starts playing
    const handleMediaPlay = (event: Event) => {
      const customEvt = event as CustomEvent;
      if (customEvt.detail?.type === 'radio') {
        if (videoRef.current) {
          videoRef.current.pause();
        }
        setIsPlaying(false);
        setPlayerStatus('pausado');
      }
    };

    window.addEventListener('apdf_media_play', handleMediaPlay);

    return () => {
      window.removeEventListener('apdf_media_play', handleMediaPlay);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
      }
    };
  }, [selectedChannel.id]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Play / Pause toggle
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play()
        .then(() => {
          setIsPlaying(true);
          setPlayerStatus('en_vivo');
          window.dispatchEvent(new CustomEvent('apdf_media_play', { 
            detail: { type: 'tv', channelId: selectedChannel.id } 
          }));
        })
        .catch((err) => {
          console.warn('Error playing video:', err);
        });
    } else {
      video.pause();
      setIsPlaying(false);
      setPlayerStatus('pausado');
    }
  };

  // Mute toggle
  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && video.volume === 0) {
      video.volume = 0.8;
      setVolume(0.8);
    }
  };

  // Volume Change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  // Toggle Fullscreen
  const handleToggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch((err) => {
        console.warn('Error entering fullscreen:', err);
      });
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Retry Connection
  const handleRetry = () => {
    initializeStream(selectedChannel, true);
  };

  // Share Channel
  const handleShare = () => {
    const shareText = `¡Sintoniza "${selectedChannel.name}" en vivo en A Prueba de Fuego!`;
    const shareUrl = selectedChannel.officialSiteUrl;

    if (navigator.share) {
      navigator.share({
        title: selectedChannel.name,
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  // Filter Channels
  const filteredChannels = OFFICIAL_ADVENTIST_CHANNELS.filter(channel => {
    const matchesSearch = 
      !searchTerm ||
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.currentProgram.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === 'todos' || 
      channel.categoryKey === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-3 space-y-5">
      
      {/* Top Navigation & Back Bar */}
      <div className="flex items-center justify-between gap-3">
        {/* Back to Home Button */}
        <button
          onClick={() => setActiveTab('inicio')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer group"
          title="Regresar a la pantalla de inicio"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Inicio</span>
        </button>

        {/* Quick Switch to Radio Button */}
        <button
          onClick={() => setActiveTab('en_vivo')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-red-600/20 via-rose-600/20 to-orange-600/20 border border-red-500/40 text-red-300 hover:text-white hover:bg-red-500/30 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          title="Escuchar Radio Adventista (AWR Colombia & Esperanza Colombia)"
        >
          <Radio className="w-4 h-4 text-red-400" />
          <span>Sintonizar Radio Adventista</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-slate-950 border border-blue-500/30 p-5 sm:p-7 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-xs font-bold text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <Tv className="h-4 w-4 text-blue-400" />
              <span>SEÑALES OFICIALES DE TELEVISIÓN ADVENTISTA 24/7</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Televisión en Vivo
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Disfruta de las cadenas oficiales autorizadas de la Iglesia Adventista del Séptimo Día: <strong>Hope Channel / Esperanza TV</strong>, <strong>3ABN Latino</strong>, <strong>Nuevo Tiempo TV</strong>, música sacra y programas para toda la familia sin costo.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-blue-500/30 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Canales Activos</span>
              <span className="text-xl font-black text-blue-400">{OFFICIAL_ADVENTIST_CHANNELS.length}</span>
              <span className="text-[9px] text-emerald-400 font-bold block">100% En Vivo</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================ */}
      {/* MAIN VIDEO PLAYER CONTAINER */}
      {/* ============================================================================ */}
      <div 
        ref={playerContainerRef}
        className="relative rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col group"
      >
        {/* Top Channel Header Bar inside Player */}
        <div className="bg-slate-900/95 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-2xl overflow-hidden shrink-0 border border-slate-700 bg-slate-800">
              <img 
                src={selectedChannel.logo} 
                alt={selectedChannel.name} 
                className="w-full h-full object-cover" 
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                  {selectedChannel.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[9px] font-bold uppercase tracking-wider shrink-0">
                  {selectedChannel.resolution}
                </span>
              </div>
              <p className="text-[11px] text-amber-400 truncate mt-0.5">
                {selectedChannel.currentProgram}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>EN VIVO</span>
            </span>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{selectedChannel.viewerCount} espectadores</span>
            </div>
          </div>
        </div>

        {/* Video Area (16:9 Aspect Ratio) with HTML5 Video */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          
          <video
            ref={videoRef}
            playsInline
            controls={false}
            className="w-full h-full object-contain bg-black cursor-pointer"
            onClick={handleTogglePlay}
            onPlaying={() => {
              setIsPlaying(true);
              setPlayerStatus('en_vivo');
            }}
            onPause={() => {
              setIsPlaying(false);
              setPlayerStatus('pausado');
            }}
            onWaiting={() => setPlayerStatus('conectando')}
            onError={() => {
              setPlayerStatus('error');
              setErrorMessage('La emisión de este canal no pudo sincronizarse en este momento. Puedes reintentar o abrir la señal oficial.');
            }}
          />

          {/* Loading Overlay */}
          {playerStatus === 'conectando' && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 space-y-3">
              <div className="relative">
                <RefreshCw className="w-10 h-10 text-blue-400 animate-spin" />
                <Tv className="w-4 h-4 text-white absolute inset-0 m-auto" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Sintonizando Señal Oficial...</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">{selectedChannel.name}</p>
                <p className="text-[10px] text-blue-300 mt-0.5">Estableciendo flujo HLS de alta definición</p>
              </div>
            </div>
          )}

          {/* Paused Overlay Screen (Click to resume) */}
          {playerStatus === 'pausado' && (
            <div 
              onClick={handleTogglePlay}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10 cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform mb-3">
                <Play className="w-7 h-7 fill-white translate-x-0.5" />
              </div>
              <h4 className="text-sm font-bold text-white">Transmisión en Pausa</h4>
              <p className="text-xs text-slate-300 mt-1">Haz clic para reanudar la señal en vivo</p>
            </div>
          )}

          {/* Error Overlay Screen */}
          {playerStatus === 'error' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 animate-bounce" />
              <h4 className="text-sm font-bold text-white">Interrupción en la Señal en Vivo</h4>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                {errorMessage || 'El servidor de la emisora no respondió a la solicitud de transmisión. Puedes reintentar la conexión o ver la emisión desde su portal oficial.'}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reintentar Conexión</span>
                </button>
                <a
                  href={selectedChannel.officialSiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
                >
                  <span>Abrir Portal Oficial</span>
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Video Player Controls Bar */}
        <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 flex items-center justify-between gap-3">
          {/* Left: Play/Pause, Mute & Volume Slider */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleTogglePlay}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pausar transmisión' : 'Reanudar transmisión'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
            </button>

            {/* Mute/Unmute */}
            <button
              onClick={handleToggleMute}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Volume Range Slider */}
            <div className="hidden sm:flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 sm:w-28 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                title={`Volumen: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
              <span className="text-[11px] font-mono text-slate-400 min-w-[32px]">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>
          </div>

          {/* Right: Actions (Reload, Share, Official Link, Fullscreen) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleRetry}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Recargar señal del canal"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Compartir este canal"
            >
              {shareSuccess ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            <a
              href={selectedChannel.officialSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-all"
            >
              <span>Sitio Oficial</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            </a>

            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Pantalla completa"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Selected Channel Information Card */}
        <div className="p-4 sm:p-5 bg-slate-900/60 border-t border-slate-800 space-y-2">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
                {selectedChannel.category}
              </span>
              <span className="text-[11px] text-slate-400">
                Cobertura: <strong className="text-slate-200">{selectedChannel.coverage}</strong>
              </span>
            </div>

            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Transmisión Oficial Autorizada IASD</span>
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedChannel.description}
          </p>
        </div>

      </div>

      {/* ============================================================================ */}
      {/* CHANNEL SELECTOR & FILTERS */}
      {/* ============================================================================ */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm sm:text-base font-bold text-white font-heading">
              Guía de Canales Adventistas ({OFFICIAL_ADVENTIST_CHANNELS.length})
            </h2>
          </div>

          {/* Search channel */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar canal o programa..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'todos', label: 'Todos los Canales' },
            { id: 'oficial', label: 'Oficiales IASD' },
            { id: 'mision', label: 'Misión & Estudio' },
            { id: 'musica', label: 'Música Sacra' },
            { id: 'creacion', label: 'Creacionismo' },
            { id: 'infantil', label: 'Infantil & Guías' },
            { id: 'salud', label: 'Salud & Familia' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Channel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredChannels.map((channel) => {
            const isSelected = selectedChannel.id === channel.id;

            return (
              <div
                key={channel.id}
                onClick={() => handleSelectChannel(channel)}
                className={`rounded-3xl p-4 transition-all flex flex-col justify-between cursor-pointer border shadow-lg group ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-slate-700 bg-slate-800 group-hover:scale-105 transition-transform">
                        <img 
                          src={channel.logo} 
                          alt={channel.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                          {channel.name}
                        </h4>
                        <span className="text-[10px] text-amber-400 font-medium line-clamp-1">
                          {channel.callsign}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 text-[9px] font-black shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span>EN VIVO</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-3">
                    {channel.description}
                  </p>

                  <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 mb-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      En emisión ahora:
                    </span>
                    <span className="text-[11px] font-medium text-slate-200 line-clamp-1">
                      {channel.currentProgram}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>{channel.viewerCount} espectadores</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectChannel(channel);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                      isSelected && isPlaying
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/30'
                        : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {isSelected && isPlaying ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                        <span>Sintonizado</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Ver Canal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
