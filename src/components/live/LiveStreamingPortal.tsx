import React, { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { useApp } from '../../context/AppContext';
import { LiveStreamSession } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { 
  subscribeToLiveStreamsFromFirestore, 
  createLiveStreamInFirestore, 
  deleteLiveStreamInFirestore,
  addLiveChatMessageInFirestore,
  subscribeToSingleLiveStream,
  updateSignalingForViewer
} from '../../firebase/firestoreService';
import { 
  Radio, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  Send, 
  Sparkles, 
  Flame, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  RefreshCw,
  Share2,
  CheckCircle2,
  X,
  AlertCircle,
  Headphones,
  Tv,
  ExternalLink,
  ShieldCheck,
  Globe,
  Sliders,
  Link as LinkIcon,
  Activity,
  Minimize2,
  Maximize2,
  Clock,
  StopCircle,
  Lock,
  Cast
} from 'lucide-react';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// ============================================================================
// SEÑALES OFICIALES VERIFICADAS (AWR Colombia & Esperanza Colombia Radio)
// ============================================================================
const INITIAL_STREAMS: LiveStreamSession[] = [
  {
    id: 'stream_awr_colombia',
    title: 'AWR Colombia — Radio Mundial Adventista (1470 AM)',
    description: 'Emisora filial al sistema de Radio Mundial Adventista (AWR). Música sacra, reflexiones bíblicas y esperanza continua 24/7 para toda Colombia.',
    hostId: 'admin_awr',
    hostName: 'AWR Colombia Oficial',
    hostAvatar: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=240&auto=format&fit=crop&q=80',
    isOfficial: true,
    startedAt: 'Señal Continua 24/7',
    viewerCount: 230,
    isActive: true,
    category: 'musica_y_alabanza',
    streamType: 'hls',
    dialOrFrequency: '1470 AM',
    city: 'Medellín & Señal Nacional',
    teveoToken: 'AeABQjJpyjGs0rHamKlqI8JbVS4DVj-kG5K-cMnCsfECSH_hCmaqiFa_3rR_ZTyeGxAKvlbw53D4ZysqehVaUuKJP3ozvOi-VQmupiTNqeuCFnXH8Q',
    officialSiteUrl: 'https://www.awrcolombia.org/',
    chatMessages: [
      { id: 'awr_1', userName: 'Pastor Carlos Gómez', message: '¡Bienvenidos a la señal de Radio Mundial Adventista en Colombia! Dios los bendiga.', timestamp: 'Hace 5 min' },
      { id: 'awr_2', userName: 'Daniela Morales (Medellín)', message: 'Escuchando la programación desde temprano, qué hermosa alabanza 🙏', timestamp: 'Hace 2 min' }
    ]
  },
  {
    id: 'stream_esperanza_bogota',
    title: 'Esperanza Colombia Radio — Bogotá (96.3 FM)',
    description: 'Señal cristiana nacional de radio de la Iglesia Adventista del Séptimo Día en Colombia. Programación espiritual para la familia y la juventud.',
    hostId: 'admin_esperanza',
    hostName: 'Esperanza Radio Bogotá',
    hostAvatar: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=240&auto=format&fit=crop&q=80',
    isOfficial: true,
    startedAt: 'En directo ahora',
    viewerCount: 185,
    isActive: true,
    category: 'culto_juvenil',
    streamType: 'hls',
    dialOrFrequency: '96.3 FM',
    city: 'Bogotá & Región Central',
    teveoToken: 'AeABJVp7Z7UklUEvrD2nEc8Go4FiZL8bCcNaFl4rQ_Qml_3UufekUoGbqjosE8irCU5mEPTy6SXca0AV5YvjYg',
    officialSiteUrl: 'https://esperanzacolombia.com/emisoras/bogota',
    chatMessages: [
      { id: 'esp_1', userName: 'Marcos JA', message: '¡Saludos desde Bogotá! Unidos en fe y oración.', timestamp: 'Hace 6 min' },
      { id: 'esp_2', userName: 'Elena Soto', message: 'Orando por toda la juventud de nuestras iglesias adventistas ❤️', timestamp: 'Hace 1 min' }
    ]
  },
  {
    id: 'stream_esperanza_palmira',
    title: 'Esperanza Colombia Radio — Cali & Palmira (1380 AM)',
    description: 'Emisora adventista en el Valle del Cauca con alabanza, devocionales y programas para la juventud y la familia.',
    hostId: 'admin_esperanza',
    hostName: 'Esperanza Radio Palmira / Cali',
    hostAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=240&auto=format&fit=crop&q=80',
    isOfficial: true,
    startedAt: 'En directo ahora',
    viewerCount: 120,
    isActive: true,
    category: 'oracion_en_vivo',
    streamType: 'hls',
    dialOrFrequency: '1380 AM',
    city: 'Cali & Palmira (Valle)',
    teveoToken: 'AeABt3TwMKvYeiTF_hI7FmbPVeqX6xgFVfU1O5lmJMwv6XL9wlX0OHpcXJWHMqy8PzvIWELsReLzfqJGH22lPQ',
    officialSiteUrl: 'https://esperanzacolombia.com/emisoras/palmira',
    chatMessages: [
      { id: 'esp_p1', userName: 'Julián P. (Cali)', message: '¡Que bendición de programación en 1380 AM! Saludos.', timestamp: 'Hace 4 min' }
    ]
  },
  {
    id: 'stream_esperanza_eje_cafetero',
    title: 'Esperanza Colombia Radio — Eje Cafetero (107.1 FM)',
    description: 'Transmitiendo desde el corazón del Eje Cafetero (Armenia, Pereira y Manizales) alabanza y mensajes de fe.',
    hostId: 'admin_esperanza',
    hostName: 'Esperanza Radio Eje Cafetero',
    hostAvatar: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=240&auto=format&fit=crop&q=80',
    isOfficial: true,
    startedAt: 'En directo ahora',
    viewerCount: 95,
    isActive: true,
    category: 'estudio_biblico',
    streamType: 'hls',
    dialOrFrequency: '107.1 FM',
    city: 'Armenia, Pereira & Manizales',
    teveoToken: 'AeABw7keKCDMF9VGbWMWYgnDPmY1cTn_jSDXPY0s_ZM-oaDQzMrilTB-z_nOnFIUZu5LyR8eBXCAh518772G4g',
    officialSiteUrl: 'https://esperanzacolombia.com/emisoras/eje-cafetero',
    chatMessages: [
      { id: 'esp_ec1', userName: 'Santiago Rios', message: 'Sintonizado desde Manizales con el Club de Guías Mayores.', timestamp: 'Hace 3 min' }
    ]
  },
  {
    id: 'stream_hope_channel',
    title: 'Hope Channel Inter-América — Televisión Oficial IASD',
    description: 'Canal oficial de televisión de la División Interamericana con programación espiritual y familiar en video.',
    hostId: 'admin_official',
    hostName: 'Hope Channel Inter-América',
    hostAvatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=240&auto=format&fit=crop&q=80',
    isOfficial: true,
    startedAt: 'Señal Oficial',
    viewerCount: 160,
    isActive: true,
    category: 'culto_juvenil',
    streamType: 'youtube',
    youtubeId: 'jU2Gg0aE-y4',
    streamUrl: 'https://www.youtube.com/embed/jU2Gg0aE-y4?autoplay=1&mute=0',
    officialSiteUrl: 'https://www.youtube.com/@HopeChannelInteramerica',
    chatMessages: [
      { id: 'hc_1', userName: 'Pr. Carlos Gómez', message: 'Filipenses 4:13: Todo lo puedo en Cristo que me fortalece.', timestamp: 'Hace 7 min' }
    ]
  }
];

export const LiveStreamingPortal: React.FC = () => {
  const { currentUser, setActiveTab } = useApp();
  
  // Category filter
  const [selectedFilter, setSelectedFilter] = useState<'todos' | 'radio' | 'tv' | 'iglesia'>('todos');

  // Authorization check for broadcasting
  const isAuthorizedBroadcaster = 
    currentUser.role === 'admin' || 
    currentUser.role === 'superadmin' || 
    currentUser.role === 'organizer' || 
    currentUser.role === 'moderator' ||
    Boolean(currentUser.ministries?.some(m => /pastor|director|comunicac/i.test(m)));

  // Broadcast Studio Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMode, setBroadcastMode] = useState<'webrtc_camera' | 'church_feed'>('webrtc_camera');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastCategory, setBroadcastCategory] = useState<'culto_juvenil' | 'oracion_en_vivo' | 'musica_y_alabanza' | 'estudio_biblico' | 'taller'>('culto_juvenil');
  const [churchStreamUrl, setChurchStreamUrl] = useState('');
  const [isBroadcastingActive, setIsBroadcastingActive] = useState(false);
  const [currentBroadcastId, setCurrentBroadcastId] = useState<string | null>(null);
  const [broadcastDuration, setBroadcastDuration] = useState(0);

  // Hardware and Studio Phase States
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hardwareError, setHardwareError] = useState<string | null>(null);
  const [broadcastStudioPhase, setBroadcastStudioPhase] = useState<
    'idle' | 'solicitando_permisos' | 'preparando_hardware' | 'conectando_emision' | 'transmitiendo_activa' | 'error_permisos' | 'error_dispositivo' | 'error_conexion' | 'detenida'
  >('idle');
  const [broadcastErrorInfo, setBroadcastErrorInfo] = useState<{
    type: 'permission' | 'device' | 'connection' | 'iframe';
    title: string;
    detail: string;
    technicalError?: string;
  } | null>(null);
  const [isAudioOnlyMode, setIsAudioOnlyMode] = useState(false);
  const [micAudioLevel, setMicAudioLevel] = useState<number>(0);
  const isSubmittingBroadcastRef = useRef<boolean>(false);

  // Active Streams
  const [activeStreams, setActiveStreams] = useState<LiveStreamSession[]>(INITIAL_STREAMS);

  // Spectator & Player State
  const [watchingStream, setWatchingStream] = useState<LiveStreamSession | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'conectando' | 'en_vivo' | 'pausado' | 'error' | 'finalizado'>('conectando');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [chatInput, setChatInput] = useState('');
  const [reactionHearts, setReactionHearts] = useState<{ id: number; emoji: string }[]>([]);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [streamErrorMessage, setStreamErrorMessage] = useState<string | null>(null);

  // Media Element Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const spectatorVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // WebRTC Host Refs
  const hostPeerConnections = useRef<Record<string, RTCPeerConnection>>({});
  const broadcastUnsubscribeRef = useRef<(() => void) | null>(null);

  // WebRTC Spectator Refs
  const spectatorPcRef = useRef<RTCPeerConnection | null>(null);
  const spectatorUnsubscribeRef = useRef<(() => void) | null>(null);
  const currentViewerIdRef = useRef<string | null>(null);

  // Timer for active broadcast
  useEffect(() => {
    let interval: any = null;
    if (isBroadcastingActive) {
      interval = setInterval(() => {
        setBroadcastDuration(prev => prev + 1);
      }, 1000);
    } else {
      setBroadcastDuration(0);
    }
    return () => clearInterval(interval);
  }, [isBroadcastingActive]);

  // Subscribe to real-time live streams in Firestore
  useEffect(() => {
    const unsubscribe = subscribeToLiveStreamsFromFirestore((firestoreStreams) => {
      if (firestoreStreams) {
        setActiveStreams(() => {
          const map = new Map<string, LiveStreamSession>();
          INITIAL_STREAMS.forEach(s => map.set(s.id, s));
          firestoreStreams.forEach(s => map.set(s.id, s));
          return Array.from(map.values());
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopBroadcasterHardware();
      cleanupSpectatorWebRTC();
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
    };
  }, []);

  // Coexistence: Pause radio whenever TV video begins playing
  useEffect(() => {
    const handleMediaPlay = (event: Event) => {
      const customEvt = event as CustomEvent;
      if (customEvt.detail?.type === 'tv') {
        if (audioElementRef.current) {
          audioElementRef.current.pause();
        }
        setIsPlaying(false);
      }
    };

    window.addEventListener('apdf_media_play', handleMediaPlay);
    return () => window.removeEventListener('apdf_media_play', handleMediaPlay);
  }, []);

  // ============================================================================
  // HLS AUDIO RESOLUTION AND PLAYBACK ENGINE (TEVEO & DIRECT HLS)
  // ============================================================================
  const setupAudioStream = useCallback(async (stream: LiveStreamSession) => {
    setStreamErrorMessage(null);
    setStreamStatus('conectando');
    setIsPlaying(true);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
    }

    try {
      let finalAudioSrc = stream.audioUrl || '';

      if (stream.teveoToken) {
        const response = await fetch(`https://api.teveo.com.co/1.1/player/resource?e=${encodeURIComponent(stream.teveoToken)}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`El servidor de Teveo respondió con código ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.source || !data.source.src) {
          throw new Error('No se recibió la URL de reproducción del servidor de radio.');
        }

        finalAudioSrc = data.source.src;
      }

      if (!finalAudioSrc) {
        throw new Error('No hay una fuente de audio configurada para esta emisora.');
      }

      const audioEl = audioElementRef.current;
      if (!audioEl) return;

      audioEl.volume = volume;
      audioEl.muted = isMuted;

      if (finalAudioSrc.includes('.m3u8') && Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 30,
        });

        hls.loadSource(finalAudioSrc);
        hls.attachMedia(audioEl);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStreamStatus('en_vivo');
          window.dispatchEvent(new CustomEvent('apdf_media_play', { detail: { type: 'radio', streamId: stream.id } }));
          audioEl.play().catch(e => {
            console.warn('Autoplay bloqueado por políticas del navegador:', e);
          });
        });

        hls.on(Hls.Events.ERROR, (_, errorData) => {
          if (errorData.fatal) {
            switch (errorData.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setStreamStatus('error');
                setStreamErrorMessage('Error de red al recibir la señal. Pulsa "Reintentar Conexión".');
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (finalAudioSrc.includes('.m3u8') && audioEl.canPlayType('application/vnd.apple.mpegurl')) {
        audioEl.src = finalAudioSrc;
        audioEl.play()
          .then(() => setStreamStatus('en_vivo'))
          .catch(() => setStreamStatus('en_vivo'));
      } else {
        audioEl.src = finalAudioSrc;
        audioEl.play()
          .then(() => setStreamStatus('en_vivo'))
          .catch(() => setStreamStatus('en_vivo'));
      }

    } catch (err: any) {
      console.error('Error al inicializar señal de radio:', err);
      setStreamStatus('error');
      setStreamErrorMessage(err.message || 'No se pudo conectar con el servidor de la emisora.');
    }
  }, [volume, isMuted]);

  // ============================================================================
  // WEBRTC SPECTATOR RECEIVER
  // ============================================================================
  const setupSpectatorWebRTC = useCallback((stream: LiveStreamSession) => {
    cleanupSpectatorWebRTC();
    setStreamStatus('conectando');
    setStreamErrorMessage(null);

    const viewerId = `v_${currentUser.id}_${Date.now()}`;
    currentViewerIdRef.current = viewerId;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    spectatorPcRef.current = pc;

    // Receive incoming audio/video tracks
    pc.ontrack = (event) => {
      if (spectatorVideoRef.current && event.streams[0]) {
        spectatorVideoRef.current.srcObject = event.streams[0];
        setStreamStatus('en_vivo');
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setStreamStatus('en_vivo');
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setStreamStatus('error');
        setStreamErrorMessage('Conexión con el emisor interrumpida. Intentando reconectar...');
      }
    };

    // Candidate handler from spectator to host
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        updateSignalingForViewer(stream.id, viewerId, {
          viewerCandidate: {
            candidate: event.candidate.candidate,
            sdpMid: event.candidate.sdpMid,
            sdpMLineIndex: event.candidate.sdpMLineIndex
          }
        });
      }
    };

    // Register viewer in Firestore signaling map
    updateSignalingForViewer(stream.id, viewerId, {
      state: 'requesting',
      viewerName: currentUser.name,
      joinedAt: Date.now()
    });

    // Listen to host offer and ICE candidates
    const unsub = subscribeToSingleLiveStream(stream.id, async (updatedStream) => {
      if (!updatedStream || !updatedStream.isActive || updatedStream.status === 'ended') {
        setStreamStatus('finalizado');
        cleanupSpectatorWebRTC();
        return;
      }

      const signalingEntry = updatedStream.signaling?.[viewerId];
      if (!signalingEntry) return;

      // Handle Host Offer
      if (signalingEntry.state === 'offered' && signalingEntry.offer && pc.signalingState === 'stable') {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(signalingEntry.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          await updateSignalingForViewer(stream.id, viewerId, {
            state: 'answered',
            answer: { type: answer.type, sdp: answer.sdp }
          });
        } catch (signalingErr) {
          console.warn('Error handling host offer in spectator:', signalingErr);
        }
      }

      // Handle Host ICE Candidate
      if (signalingEntry.hostCandidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signalingEntry.hostCandidate));
        } catch (candErr) {
          console.warn('Error adding host candidate in spectator:', candErr);
        }
      }
    });

    spectatorUnsubscribeRef.current = unsub;
  }, [currentUser.id, currentUser.name]);

  const cleanupSpectatorWebRTC = () => {
    if (spectatorUnsubscribeRef.current) {
      spectatorUnsubscribeRef.current();
      spectatorUnsubscribeRef.current = null;
    }
    if (spectatorPcRef.current) {
      spectatorPcRef.current.close();
      spectatorPcRef.current = null;
    }
    if (spectatorVideoRef.current) {
      spectatorVideoRef.current.srcObject = null;
    }
    currentViewerIdRef.current = null;
  };

  // Switch stream logic
  useEffect(() => {
    if (watchingStream) {
      if (watchingStream.streamType === 'hls' || watchingStream.streamType === 'audio') {
        setupAudioStream(watchingStream);
      } else if (watchingStream.streamType === 'webrtc') {
        setupSpectatorWebRTC(watchingStream);
      } else if (watchingStream.streamType === 'youtube') {
        setStreamStatus('en_vivo');
        setIsPlaying(true);
      }
    } else {
      cleanupSpectatorWebRTC();
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
    }
  }, [watchingStream?.id]);

  const retryConnection = () => {
    if (watchingStream) {
      if (watchingStream.streamType === 'hls' || watchingStream.streamType === 'audio') {
        setupAudioStream(watchingStream);
      } else if (watchingStream.streamType === 'webrtc') {
        setupSpectatorWebRTC(watchingStream);
      }
    }
  };

  // ============================================================================
  // BROADCASTER: HARDWARE CAPTURE & WEBRTC HOST SERVER LOGIC
  // ============================================================================

  const setupWebAudioMeter = (stream: MediaStream) => {
    if (stream.getAudioTracks().length === 0) return;
    try {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          setMicAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(checkVolume);
        }
      };
      animFrameRef.current = requestAnimationFrame(checkVolume);
    } catch (audioErr) {
      console.warn('Web Audio meter not available:', audioErr);
    }
  };

  const handleHardwareFailure = (err: any, isInsideIframe: boolean) => {
    console.warn('Error real devuelto por getUserMedia:', err.name, err.message);

    if (err.name === 'NotAllowedError' || err.name === 'SecurityError' || err.name === 'PermissionDeniedError') {
      if (isInsideIframe) {
        setBroadcastStudioPhase('error_permisos');
        const detail = 'El visor integrado de Google AI Studio (marco iframe) restringe el acceso directo a la cámara y micrófono por política de seguridad del navegador. Puedes abrir la aplicación en una pestaña nueva completa para transmitir con tu cámara, o utilizar la opción «Enlazar Señal de Culto (YouTube Live)».';
        setBroadcastErrorInfo({
          type: 'iframe',
          title: 'Acceso multimedia restringido por el marco (iframe)',
          detail,
          technicalError: `${err.name}: ${err.message}`
        });
        setHardwareError(detail);
      } else {
        setBroadcastStudioPhase('error_permisos');
        const detail = 'El navegador o el sistema denegó el acceso al micrófono o la cámara. Para activarlo, pulsa el ícono de candado o permisos al inicio de la barra de direcciones de tu navegador, selecciona "Permitir" para Cámara y Micrófono, y luego pulsa "Reintentar Acceso".';
        setBroadcastErrorInfo({
          type: 'permission',
          title: 'Permiso de cámara/micrófono no otorgado',
          detail,
          technicalError: `${err.name}: ${err.message}`
        });
        setHardwareError(detail);
      }
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      setBroadcastStudioPhase('error_dispositivo');
      const detail = 'No se encontró ninguna cámara ni micrófono disponible en este equipo. Conecta un dispositivo de entrada, utiliza el modo "Solo Audio", o enlaza la señal de tu iglesia vía YouTube Live.';
      setBroadcastErrorInfo({
        type: 'device',
        title: 'Dispositivo no encontrado',
        detail,
        technicalError: `${err.name}: ${err.message}`
      });
      setHardwareError(detail);
    } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      setBroadcastStudioPhase('error_dispositivo');
      const detail = 'La cámara o el micrófono están bloqueados u ocupados por otra aplicación activa (como Zoom, Google Meet, Teams o una pestaña diferente). Cierra las demás aplicaciones y reintenta.';
      setBroadcastErrorInfo({
        type: 'device',
        title: 'Dispositivo ocupado por otra aplicación',
        detail,
        technicalError: `${err.name}: ${err.message}`
      });
      setHardwareError(detail);
    } else if (err.name === 'OverconstrainedError') {
      setBroadcastStudioPhase('error_dispositivo');
      const detail = 'Las restricciones de resolución de la cámara no son compatibles con este sensor. Haz clic en "Reintentar en Modo Genérico".';
      setBroadcastErrorInfo({
        type: 'device',
        title: 'Restricción de cámara no admitida',
        detail,
        technicalError: `${err.name}: ${err.message}`
      });
      setHardwareError(detail);
    } else {
      setBroadcastStudioPhase('error_dispositivo');
      const detail = err.message || 'Error técnico del navegador al inicializar los dispositivos de captura.';
      setBroadcastErrorInfo({
        type: 'device',
        title: 'Error de captura multimedia',
        detail,
        technicalError: `${err.name || 'Error'}: ${err.message}`
      });
      setHardwareError(detail);
    }
  };

  const startBroadcasterHardware = async (forceAudioOnly = false) => {
    setBroadcastErrorInfo(null);
    setHardwareError(null);

    // Reuse active hardware stream if already open and tracks are live
    if (
      !forceAudioOnly &&
      mediaStreamRef.current && 
      mediaStreamRef.current.active && 
      mediaStreamRef.current.getTracks().some(t => t.readyState === 'live')
    ) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStreamRef.current;
      }
      setBroadcastStudioPhase('preparando_hardware');
      setupWebAudioMeter(mediaStreamRef.current);
      return;
    }

    setBroadcastStudioPhase('solicitando_permisos');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errDetail = 'Tu navegador no soporta la API de captura multimedia (getUserMedia).';
      setBroadcastStudioPhase('error_dispositivo');
      setBroadcastErrorInfo({
        type: 'device',
        title: 'Navegador no compatible',
        detail: errDetail,
        technicalError: 'navigator.mediaDevices.getUserMedia is undefined'
      });
      setHardwareError(errDetail);
      return;
    }

    // Stop prior tracks to avoid NotReadableError / resource locking
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

    let stream: MediaStream | null = null;
    let audioOnlyAcquired = false;

    if (!forceAudioOnly) {
      // Step 1: Try video with ideal facingMode + echo-cancelled audio
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: { echoCancellation: true, noiseSuppression: true }
        });
      } catch (err1: any) {
        console.warn('Intento 1 (video con facingMode) falló:', err1.name, err1.message);

        // Step 2: If OverconstrainedError or TypeError, try generic video: true
        if (err1.name === 'OverconstrainedError' || err1.name === 'TypeError') {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: { echoCancellation: true, noiseSuppression: true }
            });
          } catch (err2: any) {
            console.warn('Intento 2 (video genérico) falló:', err2.name, err2.message);
          }
        }

        // Step 3: If no stream yet and error was NotFoundError (no webcam) or NotReadableError (webcam locked by other app):
        // Automatically try fallback to Audio-Only
        if (!stream && (err1.name === 'NotFoundError' || err1.name === 'NotReadableError' || err1.name === 'OverconstrainedError')) {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: false,
              audio: { echoCancellation: true, noiseSuppression: true }
            });
            audioOnlyAcquired = true;
            setIsAudioOnlyMode(true);
            setCameraEnabled(false);
          } catch (errAudio: any) {
            console.warn('Intento 3 (audio-only fallback) falló:', errAudio.name, errAudio.message);
          }
        }

        // If still no stream, handle the specific terminal error
        if (!stream) {
          handleHardwareFailure(err1, isInsideIframe);
          return;
        }
      }
    } else {
      // User or system explicitly asked for Audio-Only mode
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: { echoCancellation: true, noiseSuppression: true }
        });
        audioOnlyAcquired = true;
        setIsAudioOnlyMode(true);
        setCameraEnabled(false);
      } catch (audioErr: any) {
        handleHardwareFailure(audioErr, isInsideIframe);
        return;
      }
    }

    if (stream) {
      mediaStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsAudioOnlyMode(audioOnlyAcquired || stream.getVideoTracks().length === 0);
      setCameraEnabled(stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled);
      setMicEnabled(stream.getAudioTracks().length > 0 && stream.getAudioTracks()[0].enabled);

      setupWebAudioMeter(stream);
      setBroadcastStudioPhase('preparando_hardware');
    }
  };

  const stopBroadcasterHardware = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setMicAudioLevel(0);
    setIsAudioOnlyMode(false);
  };

  const toggleCameraTrack = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleMicTrack = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  };

  // Start Real In-App WebRTC Broadcast
  const handleStartWebRTCBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || isSubmittingBroadcastRef.current) return;
    isSubmittingBroadcastRef.current = true;

    // Verify active media stream
    if (!mediaStreamRef.current || !mediaStreamRef.current.active || mediaStreamRef.current.getTracks().every(t => t.readyState === 'ended')) {
      await startBroadcasterHardware();
      if (!mediaStreamRef.current || !mediaStreamRef.current.active) {
        isSubmittingBroadcastRef.current = false;
        return;
      }
    }

    // Verify at least one active track exists
    const activeTracks = mediaStreamRef.current.getTracks().filter(t => t.readyState === 'live');
    if (activeTracks.length === 0) {
      setBroadcastStudioPhase('error_dispositivo');
      setBroadcastErrorInfo({
        type: 'device',
        title: 'Sin pistas activas',
        detail: 'No hay ninguna pista de audio o video activa para transmitir. Reintenta la activación de hardware.'
      });
      isSubmittingBroadcastRef.current = false;
      return;
    }

    setBroadcastStudioPhase('conectando_emision');
    setBroadcastErrorInfo(null);

    const broadcastId = `church_live_${Date.now()}`;
    setCurrentBroadcastId(broadcastId);

    const newBroadcast: LiveStreamSession = {
      id: broadcastId,
      title: broadcastTitle.trim(),
      description: `Transmisión oficial de culto en vivo por ${currentUser.name} (${currentUser.church || 'Iglesia Adventista'})`,
      hostId: currentUser.id,
      hostName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      hostAvatar: currentUser.avatar || '',
      isOfficial: true,
      startedAt: 'En directo ahora',
      viewerCount: 1,
      isActive: true,
      status: 'live',
      category: broadcastCategory,
      streamType: 'webrtc',
      signaling: {},
      chatMessages: [
        { id: `sys_${Date.now()}`, userName: 'Sistema JA', message: '¡Transmisión oficial iniciada! La congregación puede conectarse en tiempo real.', timestamp: 'Justo ahora' }
      ]
    };

    try {
      await createLiveStreamInFirestore(newBroadcast);
      setActiveStreams(prev => [newBroadcast, ...prev.filter(s => s.id !== broadcastId)]);
      setIsBroadcastingActive(true);
      setBroadcastStudioPhase('transmitiendo_activa');
    } catch (saveErr: any) {
      console.error('Error publicando transmisión en Firestore:', saveErr);
      setBroadcastStudioPhase('error_conexion');
      setBroadcastErrorInfo({
        type: 'connection',
        title: 'Error al publicar transmisión en el servidor',
        detail: 'No se pudo confirmar la transmisión en la base de datos de la comunidad. Revisa tu conexión a internet o intenta de nuevo.',
        technicalError: saveErr?.message || String(saveErr)
      });
      isSubmittingBroadcastRef.current = false;
      return;
    }

    // Listen to incoming spectators and initiate peer handshakes
    const unsub = subscribeToSingleLiveStream(broadcastId, async (streamDoc) => {
      if (!streamDoc || !streamDoc.isActive || !mediaStreamRef.current) return;

      const signalingMap = streamDoc.signaling || {};
      for (const [viewerId, viewerData] of Object.entries(signalingMap)) {
        if (!viewerData) continue;

        // Spectator wants to connect
        if (viewerData.state === 'requesting' && !hostPeerConnections.current[viewerId]) {
          try {
            const pc = new RTCPeerConnection(ICE_SERVERS);
            hostPeerConnections.current[viewerId] = pc;

            // Add local stream tracks to spectator's connection
            mediaStreamRef.current.getTracks().forEach(track => {
              pc.addTrack(track, mediaStreamRef.current!);
            });

            // Send host ICE candidates to this spectator
            pc.onicecandidate = (evt) => {
              if (evt.candidate) {
                updateSignalingForViewer(broadcastId, viewerId, {
                  hostCandidate: {
                    candidate: evt.candidate.candidate,
                    sdpMid: evt.candidate.sdpMid,
                    sdpMLineIndex: evt.candidate.sdpMLineIndex
                  }
                });
              }
            };

            // Create Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            await updateSignalingForViewer(broadcastId, viewerId, {
              state: 'offered',
              offer: { type: offer.type, sdp: offer.sdp }
            });
          } catch (connErr) {
            console.warn(`Error setting up peer for spectator ${viewerId}:`, connErr);
          }
        }

        // Spectator replied with answer
        if (viewerData.state === 'answered' && viewerData.answer && hostPeerConnections.current[viewerId]) {
          const pc = hostPeerConnections.current[viewerId];
          if (pc.signalingState === 'have-local-offer') {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(viewerData.answer));
            } catch (ansErr) {
              console.warn(`Error setting remote description from ${viewerId}:`, ansErr);
            }
          }
        }

        // Spectator sent ICE candidate
        if (viewerData.viewerCandidate && hostPeerConnections.current[viewerId]) {
          try {
            await hostPeerConnections.current[viewerId].addIceCandidate(new RTCIceCandidate(viewerData.viewerCandidate));
          } catch (iceErr) {
            console.warn(`Error adding ICE candidate from ${viewerId}:`, iceErr);
          }
        }
      }
    });

    broadcastUnsubscribeRef.current = unsub;
    isSubmittingBroadcastRef.current = false;
  };

  const handleStopWebRTCBroadcast = async () => {
    if (broadcastUnsubscribeRef.current) {
      broadcastUnsubscribeRef.current();
      broadcastUnsubscribeRef.current = null;
    }

    // Close all spectator peer connections
    Object.values(hostPeerConnections.current).forEach(pc => pc.close());
    hostPeerConnections.current = {};

    if (currentBroadcastId) {
      await deleteLiveStreamInFirestore(currentBroadcastId).catch(() => {});
      setActiveStreams(prev => prev.filter(s => s.id !== currentBroadcastId));
    }

    stopBroadcasterHardware();
    setIsBroadcastingActive(false);
    setCurrentBroadcastId(null);
    setBroadcastStudioPhase('detenida');
    isSubmittingBroadcastRef.current = false;
    setShowBroadcastModal(false);
  };

  // Publish YouTube / HLS Church Stream (Retransmission)
  const handlePublishChurchFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !churchStreamUrl.trim()) return;

    let detectedType: 'youtube' | 'hls' = 'youtube';
    let cleanStreamUrl = churchStreamUrl.trim();
    let youtubeId = '';

    const ytMatch = cleanStreamUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch) {
      youtubeId = ytMatch[1];
      cleanStreamUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
      detectedType = 'youtube';
    } else if (cleanStreamUrl.includes('.m3u8')) {
      detectedType = 'hls';
    }

    const broadcastId = `church_feed_${Date.now()}`;
    const newSession: LiveStreamSession = {
      id: broadcastId,
      title: broadcastTitle.trim(),
      description: `Transmisión oficial de culto por ${currentUser.name} (${currentUser.church || 'Iglesia Adventista'})`,
      hostId: currentUser.id,
      hostName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      hostAvatar: currentUser.avatar || '',
      isOfficial: true,
      startedAt: 'En directo ahora',
      viewerCount: 1,
      isActive: true,
      status: 'live',
      category: broadcastCategory,
      streamType: detectedType,
      streamUrl: cleanStreamUrl,
      audioUrl: detectedType === 'hls' ? cleanStreamUrl : undefined,
      youtubeId: youtubeId || undefined,
      chatMessages: [
        { id: `sys_${Date.now()}`, userName: 'Sistema JA', message: '¡Culto oficial enlazado en directo! Todos los jóvenes pueden participar.', timestamp: 'Justo ahora' }
      ]
    };

    setActiveStreams(prev => [newSession, ...prev]);
    await createLiveStreamInFirestore(newSession).catch(err => console.warn('Error saving stream:', err));

    setShowBroadcastModal(false);
    setBroadcastTitle('');
    setChurchStreamUrl('');
    setWatchingStream(newSession);
    setIsMinimized(false);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !watchingStream) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      userName: `${currentUser.name}`,
      message: chatInput.trim(),
      timestamp: 'Justo ahora'
    };

    setWatchingStream(prev => prev ? {
      ...prev,
      chatMessages: [...prev.chatMessages, newMsg]
    } : null);

    if (watchingStream.id.startsWith('church_') || watchingStream.id.startsWith('live_')) {
      addLiveChatMessageInFirestore(watchingStream.id, newMsg).catch(e => console.warn('Live chat fallback:', e));
    }

    setChatInput('');
  };

  const triggerReaction = (emoji: string) => {
    const id = Date.now();
    setReactionHearts(prev => [...prev, { id, emoji }]);
    setTimeout(() => {
      setReactionHearts(prev => prev.filter(h => h.id !== id));
    }, 2000);
  };

  const handleShareStream = () => {
    const shareText = `¡Sintoniza "${watchingStream?.title}" en A Prueba de Fuego!`;
    const shareUrl = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: watchingStream?.title,
        text: shareText,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Filtered streams
  const filteredStreams = activeStreams.filter(stream => {
    if (selectedFilter === 'radio') return stream.streamType === 'hls' || stream.streamType === 'audio';
    if (selectedFilter === 'tv') return stream.streamType === 'youtube' && stream.isOfficial;
    if (selectedFilter === 'iglesia') return stream.streamType === 'webrtc' || !stream.isOfficial;
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Hidden audio element for HLS radio playback */}
      <audio
        ref={audioElementRef}
        playsInline
        onCanPlay={() => setStreamStatus('en_vivo')}
        onWaiting={() => setStreamStatus('conectando')}
        onError={() => {
          if (watchingStream?.streamType === 'hls' || watchingStream?.streamType === 'audio') {
            setStreamStatus('error');
            setStreamErrorMessage('Interrupción en la señal de audio. Pulsa "Reintentar Conexión".');
          }
        }}
        onEnded={() => setStreamStatus('finalizado')}
      />

      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-red-950/80 via-slate-900 to-slate-950 border border-red-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-xs font-bold text-red-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <Radio className="h-4 w-4 text-red-400" />
              <span>SEÑALES OFICIALES IASD 24/7 & CULTOS EN DIRECTO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Radio Adventista & Transmisiones en Vivo
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Sintoniza la señal oficial autorizada de <strong>AWR Colombia (1470 AM)</strong> y <strong>Esperanza Colombia Radio</strong> en tiempo real con códec HLS de alta fidelidad, o transmite el culto de tu iglesia en directo para toda la comunidad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Quick Sintonizar AWR Button */}
            <button
              onClick={() => {
                const awrStream = activeStreams.find(s => s.id === 'stream_awr_colombia') || activeStreams[0];
                setWatchingStream(awrStream);
                setIsMinimized(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Sintonizar AWR Colombia</span>
            </button>

            {/* Quick Go to TV Portal Button */}
            <button
              onClick={() => setActiveTab('tv')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-blue-500/40 hover:bg-blue-950/60 text-blue-300 hover:text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Tv className="w-4 h-4 text-blue-400" />
              <span>Canales de TV</span>
            </button>

            {/* Transmitir en Vivo Button */}
            <button
              onClick={() => {
                setShowBroadcastModal(true);
                startBroadcasterHardware();
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Transmitir en Vivo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Directory Filter Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedFilter('todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === 'todos' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todas ({activeStreams.length})
          </button>
          <button
            onClick={() => setSelectedFilter('radio')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFilter === 'radio' 
                ? 'bg-purple-600 text-white shadow-md' 
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Radio Adventista HLS (4)</span>
          </button>
          <button
            onClick={() => setActiveTab('tv')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-slate-900 text-slate-400 hover:text-white hover:border-blue-500 border border-slate-800"
            title="Abrir reproductor de canales de televisión adventistas"
          >
            <Tv className="w-3.5 h-3.5 text-blue-400" />
            <span>Televisión en Vivo (7 Canales)</span>
          </button>
          <button
            onClick={() => setSelectedFilter('iglesia')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedFilter === 'iglesia' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Cast className="w-3.5 h-3.5" />
            <span>Cultos en Directo de Iglesias</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/30 border border-emerald-500/20 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>WebRTC P2P & HLS Activos</span>
        </div>
      </div>

      {/* Active Streams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStreams.map((stream) => {
          const isCurrentPlaying = watchingStream?.id === stream.id && isPlaying && streamStatus === 'en_vivo';

          return (
            <div
              key={stream.id}
              className={`rounded-3xl bg-slate-900 border transition-all p-5 shadow-lg flex flex-col justify-between group ${
                watchingStream?.id === stream.id 
                  ? 'border-amber-500/60 ring-2 ring-amber-500/20' 
                  : 'border-slate-800 hover:border-red-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      avatar={stream.hostAvatar}
                      name={stream.hostName}
                      size="md"
                      isOfficial={stream.isOfficial}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-white line-clamp-1">{stream.hostName}</h4>
                        {stream.isOfficial && (
                          <span className="p-0.5 rounded-full bg-amber-500 text-slate-950 shrink-0" title="Verificado">
                            <Flame className="w-2.5 h-2.5 fill-current" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        {stream.city && <span className="text-amber-400/90 font-medium">{stream.city}</span>}
                        {stream.dialOrFrequency && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-bold">
                            {stream.dialOrFrequency}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    <span>EN VIVO</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-2.5">
                  {stream.streamType === 'webrtc' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                      <Cast className="w-3 h-3" /> Emisión WebRTC en Vivo
                    </span>
                  ) : stream.streamType === 'hls' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                      <Headphones className="w-3 h-3" /> Audio HLS 24/7
                    </span>
                  ) : stream.streamType === 'youtube' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold">
                      <Tv className="w-3 h-3" /> Video Oficial
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                      <Radio className="w-3 h-3" /> Culto en Vivo
                    </span>
                  )}

                  <span className="text-[10px] text-slate-400 capitalize">
                    {stream.category.replace(/_/g, ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors mb-1.5 line-clamp-2">
                  {stream.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {stream.description}
                </p>

                {stream.officialSiteUrl && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                    <a
                      href={stream.officialSiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors font-medium"
                    >
                      <span>Sitio web oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-[10px] text-slate-500">Señal Autorizada</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Users className="w-3.5 h-3.5 text-red-400" />
                  <span>{stream.viewerCount || 1} espectadores</span>
                </div>

                <button
                  onClick={() => {
                    if (stream.id === 'stream_hope_channel') {
                      setActiveTab('tv');
                      return;
                    }
                    setWatchingStream(stream);
                    setIsMinimized(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer ${
                    isCurrentPlaying 
                      ? 'bg-emerald-600 hover:bg-emerald-500 ring-2 ring-emerald-400/30' 
                      : 'bg-red-600 hover:bg-red-500'
                  }`}
                >
                  {isCurrentPlaying ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                      <span>Conectado</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Conectar Señal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================================ */}
      {/* FLOATING MINI PLAYER */}
      {/* ============================================================================ */}
      {watchingStream && isMinimized && (
        <div className="fixed bottom-20 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-96 z-40 bg-slate-900/95 backdrop-blur-xl border border-red-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom">
          <div className="flex items-center gap-2.5 truncate cursor-pointer" onClick={() => setIsMinimized(false)}>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-700">
              <img src={watchingStream.hostAvatar} alt={watchingStream.hostName} className="w-full h-full object-cover" />
              {streamStatus === 'en_vivo' && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
              )}
            </div>
            <div className="truncate">
              <h4 className="text-xs font-bold text-white truncate">{watchingStream.title}</h4>
              <span className="text-[10px] text-amber-400 font-medium">
                {watchingStream.streamType === 'webrtc' ? 'Emisión en Vivo' : (watchingStream.dialOrFrequency || watchingStream.hostName)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Expandir reproductor"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setWatchingStream(null);
                setIsMinimized(false);
              }}
              className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              title="Detener y cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL: REPRODUCTOR EN VIVO (WEBRTC, HLS, YOUTUBE) CON CHAT EN DIRECTO */}
      {/* ============================================================================ */}
      {watchingStream && !isMinimized && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]">
            
            {/* Left: Player Container */}
            <div className="relative flex-1 bg-black flex flex-col justify-between aspect-video md:aspect-auto min-h-[360px]">
              
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
                
                {/* 1. REAL WEBRTC VIDEO STREAM FROM CHURCH */}
                {watchingStream.streamType === 'webrtc' && (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <video
                      ref={spectatorVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />

                    {streamStatus === 'conectando' && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                        <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
                        <h4 className="text-sm font-bold text-white">Conectando con la cámara de la iglesia...</h4>
                        <p className="text-xs text-slate-400 mt-1">Estableciendo canal WebRTC directo de audio y video</p>
                      </div>
                    )}

                    {streamStatus === 'finalizado' && (
                      <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
                        <StopCircle className="w-10 h-10 text-red-500 mb-2" />
                        <h4 className="text-sm font-bold text-white">Transmisión Finalizada</h4>
                        <p className="text-xs text-slate-400 mt-1">El emisor ha concluido la transmisión del culto.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. YOUTUBE VIDEO STREAM */}
                {watchingStream.streamType === 'youtube' && (
                  <iframe
                    src={watchingStream.streamUrl || `https://www.youtube.com/embed/${watchingStream.youtubeId}?autoplay=1`}
                    title={watchingStream.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full min-h-[340px] border-0"
                    onLoad={() => setStreamStatus('en_vivo')}
                    onError={() => {
                      setStreamStatus('error');
                      setStreamErrorMessage('No se pudo cargar la transmisión de video.');
                    }}
                  />
                )}

                {/* 3. REAL HLS / RADIO STREAM */}
                {(watchingStream.streamType === 'hls' || watchingStream.streamType === 'audio') && (
                  <div className="relative w-full h-full min-h-[340px] flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950">
                    
                    <div className="relative mb-4">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 p-1 shadow-2xl animate-pulse">
                        <img 
                          src={watchingStream.hostAvatar} 
                          alt={watchingStream.hostName}
                          className="w-full h-full rounded-[22px] object-cover"
                        />
                      </div>
                      <span className="absolute -bottom-2 -right-2 p-2 rounded-full bg-red-600 text-white shadow-lg">
                        <Radio className="w-4 h-4 animate-bounce" />
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase">
                        {watchingStream.dialOrFrequency || 'Señal Digital'}
                      </span>
                      {watchingStream.city && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {watchingStream.city}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white max-w-sm mb-1 leading-snug">
                      {watchingStream.title}
                    </h3>
                    <p className="text-xs text-purple-300 font-semibold mb-3">
                      {watchingStream.hostName} • Transmisión Oficial en Directo
                    </p>

                    {watchingStream.officialSiteUrl && (
                      <a
                        href={watchingStream.officialSiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-[11px] text-amber-300 hover:text-amber-200 transition-all mb-4"
                      >
                        <Globe className="w-3.5 h-3.5 text-amber-400" />
                        <span>Visitar sitio oficial ({new URL(watchingStream.officialSiteUrl).hostname})</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {/* Equalizer Wave */}
                    {streamStatus === 'en_vivo' && isPlaying && (
                      <div className="flex items-end justify-center gap-1.5 h-7 mb-4">
                        {[40, 70, 100, 60, 90, 50, 80, 45, 95, 65, 85].map((height, i) => (
                          <span
                            key={i}
                            className="w-1.5 bg-gradient-to-t from-red-500 to-amber-400 rounded-full animate-pulse"
                            style={{ 
                              height: `${height}%`, 
                              animationDuration: `${0.35 + (i % 5) * 0.12}s` 
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Audio Controls */}
                    <div className="flex items-center gap-4 bg-slate-900/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          if (audioElementRef.current) {
                            if (isPlaying) {
                              audioElementRef.current.pause();
                              setIsPlaying(false);
                            } else {
                              audioElementRef.current.play();
                              setIsPlaying(true);
                            }
                          }
                        }}
                        className="p-2.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-md transition-all active:scale-95 cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (audioElementRef.current) {
                              audioElementRef.current.muted = !isMuted;
                              setIsMuted(!isMuted);
                            }
                          }}
                          className="text-slate-300 hover:text-white cursor-pointer"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setVolume(v);
                            if (audioElementRef.current) {
                              audioElementRef.current.volume = v;
                              audioElementRef.current.muted = v === 0;
                              setIsMuted(v === 0);
                            }
                          }}
                          className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Header Overlay */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                  {streamStatus === 'conectando' && (
                    <div className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Conectando...</span>
                    </div>
                  )}

                  {streamStatus === 'en_vivo' && (
                    <div className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>EN VIVO</span>
                    </div>
                  )}

                  {streamStatus === 'error' && (
                    <button
                      type="button"
                      onClick={retryConnection}
                      className="px-3 py-1 rounded-full bg-red-700 hover:bg-red-600 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-lg pointer-events-auto cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reintentar Conexión</span>
                    </button>
                  )}

                  <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                    <Users className="w-3 h-3 text-red-400" />
                    <span>{watchingStream.viewerCount || 1} en directo</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition-all text-xs flex items-center gap-1 px-2.5 cursor-pointer"
                    title="Minimizar reproductor"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold">Minimizar</span>
                  </button>

                  <button
                    onClick={handleShareStream}
                    className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition-all text-xs flex items-center gap-1 px-2.5 cursor-pointer"
                    title="Compartir transmisión"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold">{shareSuccess ? '¡Copiado!' : 'Compartir'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setWatchingStream(null);
                      setIsMinimized(false);
                    }}
                    className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/90 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Floating Hearts Animation */}
              <div className="absolute right-4 bottom-16 z-20 flex flex-col items-center pointer-events-none space-y-2">
                {reactionHearts.map(h => (
                  <span key={h.id} className="text-3xl animate-bounce">
                    {h.emoji}
                  </span>
                ))}
              </div>

              {/* Bottom Quick Reactions */}
              <div className="relative z-20 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-between text-white">
                <div className="truncate max-w-[200px] sm:max-w-xs">
                  <h3 className="text-xs font-bold drop-shadow-md truncate">{watchingStream.title}</h3>
                  <p className="text-[10px] text-slate-300 drop-shadow truncate">{watchingStream.hostName}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => triggerReaction('🙏')}
                    className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:scale-110 active:scale-95 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>🙏</span>
                    <span className="hidden sm:inline">Amén</span>
                  </button>
                  <button
                    onClick={() => triggerReaction('🔥')}
                    className="px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 hover:scale-110 active:scale-95 transition-all text-xs font-bold cursor-pointer"
                  >
                    <span>🔥</span>
                  </button>
                  <button
                    onClick={() => triggerReaction('❤️')}
                    className="px-2 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:scale-110 active:scale-95 transition-all text-xs font-bold cursor-pointer"
                  >
                    <span>❤️</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Chat & Intercession */}
            <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-between h-[360px] md:h-auto">
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chat & Oración en Vivo</span>
                </h4>
                <span className="text-[10px] text-slate-400 font-semibold">Moderado</span>
              </div>

              <div className="flex-1 p-3.5 space-y-2.5 overflow-y-auto text-xs">
                {watchingStream.chatMessages.map(msg => (
                  <div key={msg.id} className="rounded-xl bg-slate-950/70 p-2.5 border border-slate-800/60">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-bold text-amber-300">{msg.userName}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-200 leading-relaxed">{msg.message}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendChatMessage} className="p-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Escribe un mensaje o petición..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================================ */}
      {/* MODAL: ESTUDIO DE EMISIÓN EN VIVO (WEBRTC & RETRANSMISIÓN) */}
      {/* ============================================================================ */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Centro de Transmisión Oficial</h3>
                  <p className="text-xs text-slate-400">Emisión en directo de cultos y programas de la iglesia</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (isBroadcastingActive) {
                    handleStopWebRTCBroadcast();
                  } else {
                    stopBroadcasterHardware();
                    setShowBroadcastModal(false);
                  }
                }}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Phase / Status Banner */}
            <div className="space-y-2">
              {broadcastStudioPhase === 'solicitando_permisos' && (
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-center gap-2.5 animate-pulse">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-400 shrink-0" />
                  <div>
                    <p className="font-bold">Solicitando acceso a cámara y micrófono</p>
                    <p className="text-[11px] text-blue-200/80">Por favor confirma la solicitud de permisos en la ventana de tu navegador para activar los dispositivos.</p>
                  </div>
                </div>
              )}

              {broadcastStudioPhase === 'conectando_emision' && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                  <div>
                    <p className="font-bold">Conectando con el servidor de la comunidad</p>
                    <p className="text-[11px] text-amber-200/80">Confirmando la sesión en Firestore y abriendo los canales de señalización WebRTC...</p>
                  </div>
                </div>
              )}

              {broadcastStudioPhase === 'transmitiendo_activa' && isBroadcastingActive && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <div>
                      <p className="font-bold">Transmisión confirmada y activa</p>
                      <p className="text-[11px] text-emerald-200/80">Los miembros de la comunidad pueden conectarse en directo con baja latencia.</p>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                    ID: {currentBroadcastId?.slice(-6)}
                  </div>
                </div>
              )}

              {/* Informative Header when preparing hardware */}
              {!isBroadcastingActive && broadcastStudioPhase !== 'solicitando_permisos' && broadcastStudioPhase !== 'conectando_emision' && !broadcastErrorInfo && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Estudio de emisión JA listo para preparar culto o programa</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{currentUser.church || 'Iglesia Adventista'}</span>
                </div>
              )}
            </div>

            {/* Mode Tabs */}
            {!isBroadcastingActive && (
              <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setBroadcastMode('webrtc_camera');
                    if (!mediaStreamRef.current) startBroadcasterHardware(false);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    broadcastMode === 'webrtc_camera' 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Cámara & Micrófono en Vivo (WebRTC)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBroadcastMode('church_feed')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    broadcastMode === 'church_feed' 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Enlazar Señal de Culto (YouTube Live)</span>
                </button>
              </div>
            )}

            {/* MODE 1: WEBRTC DIRECT CAMERA EMISSION */}
            {broadcastMode === 'webrtc_camera' && (
              <div className="space-y-4">
                
                {/* Actionable Error Card */}
                {broadcastErrorInfo && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs space-y-3">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-red-300">{broadcastErrorInfo.title}</h4>
                        <p className="text-slate-300 leading-relaxed text-[11px]">{broadcastErrorInfo.detail}</p>
                      </div>
                    </div>

                    {/* Action buttons based on error type */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-500/20">
                      {broadcastErrorInfo.type === 'iframe' && (
                        <button
                          type="button"
                          onClick={() => window.open(window.location.href, '_blank')}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir en Pestaña Completa</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => startBroadcasterHardware(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3 text-red-400" />
                        <span>Reintentar Acceso de Hardware</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => startBroadcasterHardware(true)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Mic className="w-3 h-3 text-amber-400" />
                        <span>Transmitir Solo Audio</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBroadcastMode('church_feed')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Usar YouTube Live</span>
                      </button>
                    </div>

                    {broadcastErrorInfo.technicalError && (
                      <div className="text-[10px] font-mono text-slate-400 bg-black/40 px-2.5 py-1 rounded-lg">
                        Diagnóstico técnico: {broadcastErrorInfo.technicalError}
                      </div>
                    )}
                  </div>
                )}

                {/* Video / Audio Preview Screen */}
                <div className="relative aspect-video max-h-[300px] rounded-2xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isAudioOnlyMode ? 'hidden' : 'block'}`}
                  />

                  {/* Audio-only Mode Visual Display */}
                  {isAudioOnlyMode && (
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-black flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2 animate-pulse">
                        <Mic className="w-8 h-8" />
                      </div>
                      <h4 className="text-sm font-bold text-white mb-0.5">Modo Audio en Directo Activo</h4>
                      <p className="text-xs text-slate-400 max-w-sm mb-3">
                        Tu voz se capturará y transmitirá en tiempo real a través del micrófono.
                      </p>
                      <button
                        type="button"
                        onClick={() => startBroadcasterHardware(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5 text-amber-400" />
                        <span>Intentar Activar Cámara</span>
                      </button>
                    </div>
                  )}

                  {!isAudioOnlyMode && !cameraEnabled && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-slate-400 text-xs">
                      <VideoOff className="w-10 h-10 mb-2 text-slate-600" />
                      <p>Cámara apagada por el usuario</p>
                    </div>
                  )}

                  {/* Overlays */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {isBroadcastingActive && broadcastStudioPhase === 'transmitiendo_activa' ? (
                      <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>EMITIENDO EN VIVO</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-amber-400" />
                        <span>ESTUDIO PREVIO</span>
                      </span>
                    )}

                    {isBroadcastingActive && (
                      <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-red-400" />
                        <span>{formatTimer(broadcastDuration)}</span>
                      </span>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3">
                    {!isAudioOnlyMode && (
                      <button
                        type="button"
                        onClick={toggleCameraTrack}
                        className={`p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all cursor-pointer ${
                          cameraEnabled ? 'bg-slate-900/80 text-white' : 'bg-red-600 text-white'
                        }`}
                        title={cameraEnabled ? 'Apagar cámara' : 'Encender cámara'}
                      >
                        {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={toggleMicTrack}
                      className={`p-2.5 rounded-full backdrop-blur-md shadow-lg transition-all cursor-pointer ${
                        micEnabled ? 'bg-slate-900/80 text-white' : 'bg-red-600 text-white'
                      }`}
                      title={micEnabled ? 'Silenciar micrófono' : 'Activar micrófono'}
                    >
                      {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                    </button>

                    {!isAudioOnlyMode && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextFacing = facingMode === 'user' ? 'environment' : 'user';
                          setFacingMode(nextFacing);
                          stopBroadcasterHardware();
                          setTimeout(() => startBroadcasterHardware(false), 200);
                        }}
                        className="px-3 py-2 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
                      >
                        Cambiar Cámara
                      </button>
                    )}
                  </div>
                </div>

                {/* VU Meter */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-amber-400" />
                      <span>Modulación de audio del micrófono (Voz en tiempo real):</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400">{micAudioLevel}%</span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-75 ${
                        micAudioLevel > 75 
                          ? 'bg-rose-500' 
                          : micAudioLevel > 30 
                            ? 'bg-emerald-500' 
                            : 'bg-amber-500'
                      }`}
                      style={{ width: `${micAudioLevel}%` }}
                    />
                  </div>
                </div>

                {/* Form to Start or Stop */}
                {!isBroadcastingActive ? (
                  <form onSubmit={handleStartWebRTCBroadcast} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        Título de la transmisión del culto:
                      </label>
                      <input
                        type="text"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="Ej: Culto Joven JA — Tema: Valientes por Cristo"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <label className="text-xs text-slate-400 font-semibold">Categoría:</label>
                        <select
                          value={broadcastCategory}
                          onChange={(e: any) => setBroadcastCategory(e.target.value)}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="culto_juvenil">Culto Juvenil</option>
                          <option value="oracion_en_vivo">Momento de Oración</option>
                          <option value="musica_y_alabanza">Música & Alabanza</option>
                          <option value="estudio_biblico">Estudio Bíblico</option>
                          <option value="taller">Taller / Dinámica</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={!broadcastTitle.trim() || broadcastStudioPhase === 'conectando_emision' || broadcastStudioPhase === 'solicitando_permisos'}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                      >
                        {broadcastStudioPhase === 'conectando_emision' ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Publicando en el Servidor...</span>
                          </>
                        ) : broadcastStudioPhase === 'solicitando_permisos' ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Esperando Permisos...</span>
                          </>
                        ) : (
                          <>
                            <Radio className="w-4 h-4" />
                            <span>Iniciar Emisión WebRTC en Directo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Señal WebRTC distribuida hacia los espectadores activos</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleStopWebRTCBroadcast}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
                    >
                      <StopCircle className="w-4 h-4" />
                      <span>Finalizar Transmisión</span>
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* MODE 2: RETRANSMISSION OF CHURCH LIVE FEED (YOUTUBE / HLS) */}
            {broadcastMode === 'church_feed' && (
              <form onSubmit={handlePublishChurchFeed} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
                  <div>
                    <p className="font-bold">Retransmisión oficial de iglesia</p>
                    <p className="text-slate-300 mt-0.5 text-[11px] leading-relaxed">
                      Si tu iglesia transmite con OBS, vMix o cámaras profesionales hacia YouTube Live, ingresa el enlace del video para que todos los jóvenes adventistas puedan unirse con chat moderado y oración en directo.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Título del culto:
                  </label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Ej: Culto Joven JA — Sociedad de Jóvenes Iglesia Central"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Enlace de YouTube Live o señal HLS (.m3u8):
                  </label>
                  <input
                    type="url"
                    value={churchStreamUrl}
                    onChange={(e) => setChurchStreamUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-xs text-slate-400 font-semibold">Categoría:</label>
                    <select
                      value={broadcastCategory}
                      onChange={(e: any) => setBroadcastCategory(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="culto_juvenil">Culto Juvenil</option>
                      <option value="oracion_en_vivo">Momento de Oración</option>
                      <option value="musica_y_alabanza">Música & Alabanza</option>
                      <option value="estudio_biblico">Estudio Bíblico</option>
                      <option value="taller">Taller / Dinámica</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={!broadcastTitle.trim() || !churchStreamUrl.trim()}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <Radio className="w-4 h-4" />
                    <span>Publicar Culto Oficial</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
