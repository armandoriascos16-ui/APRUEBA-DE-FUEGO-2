import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  Music, 
  Scissors, 
  Play, 
  Pause, 
  FileAudio,
  Volume2
} from 'lucide-react';
import { AudioDraftState } from './types';

interface AudioUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAudio: (audio: AudioDraftState) => void;
}

const ACCEPTED_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/webm'];
const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB
const MAX_DURATION_ALLOWED = 30; // 30 seconds

export const AudioUploaderModal: React.FC<AudioUploaderModalProps> = ({
  isOpen,
  onClose,
  onSaveAudio
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioTitle, setAudioTitle] = useState('');
  const [audioArtist, setAudioArtist] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Validate size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`El archivo es demasiado grande (${(file.size / (1024 * 1024)).toFixed(1)} MB). El tamaño máximo permitido es de 12 MB.`);
      return;
    }

    // Read and inspect duration
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;
      const dataUrl = event.target.result as string;

      // Create audio object to inspect real duration
      const audio = new Audio();
      audio.src = dataUrl;
      audio.onloadedmetadata = () => {
        const dur = Math.round(audio.duration || 0);
        if (dur <= 0) {
          setErrorMessage('El archivo de audio parece estar vacío o dañado. Por favor selecciona otro archivo.');
          return;
        }

        setSelectedFile(file);
        setFileDataUrl(dataUrl);
        setAudioDuration(dur);
        setTrimStart(0);
        setAudioTitle(file.name.replace(/\.[^/.]+$/, ''));
        setAudioArtist('Audio propio');
      };

      audio.onerror = () => {
        setErrorMessage('El formato de audio no pudo ser reproducido por el navegador. Te recomendamos usar archivos en formato MP3, WAV o M4A.');
      };
    };

    reader.onerror = () => {
      setErrorMessage('Error al leer el archivo desde el dispositivo.');
    };

    reader.readAsDataURL(file);
  };

  const handleTogglePlay = () => {
    if (!audioPreviewRef.current) return;

    if (isPlaying) {
      audioPreviewRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPreviewRef.current.currentTime = trimStart;
      audioPreviewRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!audioPreviewRef.current) return;
    const current = audioPreviewRef.current.currentTime;
    const maxSegmentEnd = trimStart + Math.min(MAX_DURATION_ALLOWED, audioDuration);

    if (current >= maxSegmentEnd) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.currentTime = trimStart;
      setIsPlaying(false);
    }
  };

  const handleTrimChange = (newStart: number) => {
    setTrimStart(newStart);
    if (audioPreviewRef.current) {
      audioPreviewRef.current.currentTime = newStart;
    }
  };

  const handleConfirmSave = () => {
    if (!fileDataUrl) return;

    const effectiveDuration = Math.min(MAX_DURATION_ALLOWED, audioDuration - trimStart);

    onSaveAudio({
      audioUrl: fileDataUrl,
      duration: effectiveDuration,
      type: 'upload',
      title: audioTitle.trim() || 'Audio Subido',
      artist: audioArtist.trim() || 'Grabación Propia',
      license: 'Licencia propia del usuario / Autorización devocional',
      attribution: `Pista aportada por el usuario: ${audioTitle}`,
      trimStart: trimStart,
      trimEnd: trimStart + effectiveDuration,
      volume: 1.0
    });

    onClose();
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? `0${s}` : s}`;
  };

  const maxPossibleStart = Math.max(0, audioDuration - MAX_DURATION_ALLOWED);
  const trimEnd = Math.min(audioDuration, trimStart + MAX_DURATION_ALLOWED);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Subir Audio Propio (Máx. 30s)</h3>
              <p className="text-[11px] text-slate-400">Archivos MP3, WAV o M4A con autorización de uso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="audio/mp3,audio/wav,audio/m4a,audio/aac,audio/ogg,audio/mpeg"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Hidden Audio Player for validation */}
        {fileDataUrl && (
          <audio
            ref={audioPreviewRef}
            src={fileDataUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Upload Drop Zone / Button */}
        {!selectedFile ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-2xl border-2 border-dashed border-slate-700 hover:border-purple-500/60 bg-slate-950/60 flex flex-col items-center justify-center text-center cursor-pointer transition-all space-y-3"
          >
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <FileAudio className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Haz clic para seleccionar tu archivo de audio</p>
              <p className="text-xs text-slate-400 mt-1">Formatos compatibles: MP3, WAV, M4A, OGG (hasta 12 MB)</p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
            >
              Examinar Archivos
            </button>
          </div>
        ) : (
          /* File Loaded: Inspector & Trimmer */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileAudio className="h-5 w-5 text-purple-400" />
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{selectedFile.name}</h4>
                    <span className="text-[10px] text-slate-400">
                      Duración total: {formatSeconds(audioDuration)} · {(selectedFile.size / 1024).toFixed(0)} KB
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setFileDataUrl(null);
                    setIsPlaying(false);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                >
                  Cambiar
                </button>
              </div>

              {/* 30-Second Warning & Trimmer */}
              {audioDuration > MAX_DURATION_ALLOWED ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Scissors className="h-4 w-4" />
                    <span>El audio dura más de 30s. Selecciona el fragmento a publicar:</span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300 font-mono">
                      <span>Inicio: {formatSeconds(trimStart)}</span>
                      <span className="text-amber-400 font-bold">Fin: {formatSeconds(trimEnd)} (30s)</span>
                      <span>Total: {formatSeconds(audioDuration)}</span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={maxPossibleStart}
                      value={trimStart}
                      onChange={(e) => handleTrimChange(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-1.5 font-semibold">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Duración válida: {audioDuration} segundos (dentro del límite de 30s).</span>
                </div>
              )}

              {/* Audio Playback Controls */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5 fill-white" /> : <Play className="h-3.5 w-3.5 fill-white" />}
                  <span>{isPlaying ? 'Pausar Fragmento' : 'Escuchar Fragmento (30s)'}</span>
                </button>

                <span className="text-[11px] text-slate-400 font-mono">
                  {formatSeconds(trimStart)} – {formatSeconds(trimEnd)}
                </span>
              </div>
            </div>

            {/* Title and Artist fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Título del audio:
                </label>
                <input
                  type="text"
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  placeholder="Ej: Reflexión sobre Salmos"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Artista o autor:
                </label>
                <input
                  type="text"
                  value={audioArtist}
                  onChange={(e) => setAudioArtist(e.target.value)}
                  placeholder="Ej: Coro Juvenil / Mi Nombre"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
              ⚠️ <span className="font-bold text-slate-300">Aviso ético y legal:</span> Asegúrate de tener los derechos o la autorización debida para compartir este audio dentro de los Estados de la comunidad cristiana.
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
          
          {selectedFile && (
            <button
              type="button"
              onClick={handleConfirmSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 active:scale-95 transition-all"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>Usar este Audio ({Math.min(MAX_DURATION_ALLOWED, audioDuration)}s)</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
