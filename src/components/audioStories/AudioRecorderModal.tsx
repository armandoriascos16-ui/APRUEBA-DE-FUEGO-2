import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  X, 
  AlertCircle, 
  Clock, 
  Upload, 
  Volume2, 
  Sparkles 
} from 'lucide-react';
import { AudioDraftState } from './types';

interface AudioRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAudio: (audio: AudioDraftState) => void;
  onSwitchToUpload?: () => void;
}

export const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({
  isOpen,
  onClose,
  onSaveAudio,
  onSwitchToUpload
}) => {
  const [recordState, setRecordState] = useState<'idle' | 'recording' | 'recorded' | 'playing'>('idle');
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [finalDuration, setFinalDuration] = useState<number>(0);
  const [voiceTitle, setVoiceTitle] = useState('Mi Mensaje de Voz / Oración');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const MAX_SECONDS = 30;

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    setPermissionError(null);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError('Tu navegador o dispositivo no soporta grabación directa de micrófono. Puedes subir un archivo de audio en su lugar.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setRecordState('recorded');
        // Stop audio tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordState('recording');
      setSecondsElapsed(0);

      // Start 30 seconds timer
      timerIntervalRef.current = setInterval(() => {
        setSecondsElapsed((prev) => {
          const next = prev + 1;
          if (next >= MAX_SECONDS) {
            stopRecording();
            return MAX_SECONDS;
          }
          return next;
        });
      }, 1000);

    } catch (err: any) {
      console.warn('Microphone permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('No se concedieron permisos para acceder al micrófono. Para grabar tu voz, autoriza el micrófono en tu navegador o selecciona "Subir archivo de audio".');
      } else {
        setPermissionError('No se pudo acceder al micrófono del dispositivo. Puedes subir un archivo de audio grabado previamente.');
      }
    }
  };

  const stopRecording = () => {
    clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setFinalDuration(secondsElapsed || 1);
  };

  const handleTogglePlayback = () => {
    if (!audioElementRef.current) return;

    if (recordState === 'playing') {
      audioElementRef.current.pause();
      setRecordState('recorded');
    } else {
      audioElementRef.current.play();
      setRecordState('playing');
    }
  };

  const handleAudioEnded = () => {
    setRecordState('recorded');
  };

  const handleReset = () => {
    clearInterval(timerIntervalRef.current);
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
    setRecordState('idle');
    setSecondsElapsed(0);
    setAudioUrl(null);
    setAudioBlob(null);
  };

  const handleSave = () => {
    if (!audioBlob || !audioUrl) return;

    // Convert Blob to Data URL for reliable persistent transport
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const durationSeconds = Math.min(MAX_SECONDS, finalDuration || secondsElapsed || 1);

      onSaveAudio({
        audioUrl: dataUrl,
        duration: durationSeconds,
        type: 'recording',
        title: voiceTitle.trim() || 'Grabación de Voz',
        artist: 'Mi Voz / Grabación Propia',
        license: 'Autoría personal del usuario',
        attribution: 'Grabación original realizada por el autor del Estado',
        trimStart: 0,
        trimEnd: durationSeconds,
        volume: 1.0
      });

      onClose();
    };
    reader.readAsDataURL(audioBlob);
  };

  const remainingSeconds = Math.max(0, MAX_SECONDS - secondsElapsed);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Grabar Audio Cristiano (30s)</h3>
              <p className="text-[11px] text-slate-400">Tu voz, oración o mensaje de fe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Hidden Audio Player for Preview */}
        {audioUrl && (
          <audio
            ref={audioElementRef}
            src={audioUrl}
            onEnded={handleAudioEnded}
            className="hidden"
          />
        )}

        {/* Permission Error Banner */}
        {permissionError && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{permissionError}</p>
            </div>
            {onSwitchToUpload && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSwitchToUpload();
                }}
                className="w-full py-2 px-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Subir archivo de audio desde mi equipo</span>
              </button>
            )}
          </div>
        )}

        {/* Visual Recording Area */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col items-center justify-center space-y-4 text-center">
          
          {/* Animated Central Circle */}
          <div className="relative">
            {recordState === 'recording' && (
              <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
            )}
            <div className={`h-24 w-24 rounded-full flex items-center justify-center border-4 transition-all ${
              recordState === 'recording'
                ? 'bg-red-950/50 border-red-500 text-red-400 shadow-lg shadow-red-500/30'
                : recordState === 'recorded' || recordState === 'playing'
                ? 'bg-amber-950/40 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              {recordState === 'recording' ? (
                <div className="flex flex-col items-center">
                  <Mic className="h-8 w-8 animate-pulse text-red-500" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider mt-1">Grabando</span>
                </div>
              ) : recordState === 'recorded' || recordState === 'playing' ? (
                <button
                  type="button"
                  onClick={handleTogglePlayback}
                  className="flex flex-col items-center text-amber-400 hover:scale-105 transition-transform"
                >
                  {recordState === 'playing' ? (
                    <Pause className="h-8 w-8 fill-amber-400" />
                  ) : (
                    <Play className="h-8 w-8 fill-amber-400 ml-1" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
                    {recordState === 'playing' ? 'Pausar' : 'Escuchar'}
                  </span>
                </button>
              ) : (
                <Mic className="h-8 w-8 text-slate-500" />
              )}
            </div>
          </div>

          {/* Timer Display */}
          <div className="space-y-1">
            <div className="text-2xl font-mono font-black text-white tracking-wider">
              00:{secondsElapsed < 10 ? `0${secondsElapsed}` : secondsElapsed}
              <span className="text-sm font-normal text-slate-500 ml-1">/ 00:30</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {recordState === 'recording' 
                ? `Tiempo restante: ${remainingSeconds} segundos` 
                : recordState === 'recorded' 
                ? `Audio listo (${finalDuration || secondsElapsed}s)` 
                : 'Pulsa el botón para comenzar a grabar (máx. 30s)'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                recordState === 'recording' ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{ width: `${(secondsElapsed / MAX_SECONDS) * 100}%` }}
            />
          </div>

        </div>

        {/* Audio Title Input (when recorded) */}
        {recordState !== 'idle' && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Título o descripción del audio:
            </label>
            <input
              type="text"
              value={voiceTitle}
              onChange={(e) => setVoiceTitle(e.target.value)}
              placeholder="Ej: Oración matutina, Salmo de paz..."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        )}

        {/* Control Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
          {recordState === 'idle' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={startRecording}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 active:scale-95 transition-all"
              >
                <Mic className="h-4 w-4" />
                <span>Iniciar Grabación</span>
              </button>
            </>
          )}

          {recordState === 'recording' && (
            <button
              type="button"
              onClick={stopRecording}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 active:scale-95"
            >
              <Square className="h-4 w-4 fill-white" />
              <span>Detener Grabación ({remainingSeconds}s restantes)</span>
            </button>
          )}

          {(recordState === 'recorded' || recordState === 'playing') && (
            <>
              <button
                type="button"
                onClick={handleReset}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Volver a grabar"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Volver a Grabar</span>
              </button>

              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>Usar este Audio</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
