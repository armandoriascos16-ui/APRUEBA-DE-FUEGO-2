import React, { useState, useRef } from 'react';
import { Mic, Square, Upload, FileText, Copy, Check, RefreshCw, Volume2, Sparkles } from 'lucide-react';

export const AITranscribeTab: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startRecording = async () => {
    try {
      setErrorMsg(null);
      setTranscription('');
      setAudioUrl(null);
      setAudioBlob(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setErrorMsg('No se pudo acceder al micrófono. Por favor verifica los permisos en el navegador.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
  };

  const handleTranscribe = async () => {
    if (!audioBlob || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        const res = await fetch('/api/ai/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Audio,
            mimeType: audioBlob.type || 'audio/webm',
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error ${res.status}: Fallo al transcribir`);
        }

        const data = await res.json();
        setTranscription(data.transcription || '');
        setIsLoading(false);
      };
    } catch (err: any) {
      console.error('Error in transcription:', err);
      setErrorMsg(err.message || 'Error al transcribir el audio con Gemini 3.5 Transcribe.');
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!transcription) return;
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-2xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Mic className="w-5 h-5 text-amber-400" />
            Transcriptor de Oraciones, Prédicas & Testimonios (Gemini 3.5 Transcribe)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Graba con tu micrófono o sube un archivo de voz para transcribir mensajes espirituales con <code className="text-amber-300 font-mono">gemini-3.5-transcribe</code>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Audio Capture */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 text-center space-y-4">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {isRecording ? 'Grabando desde el micrófono...' : 'Grabación de Voz en Vivo'}
            </div>

            <div className="flex items-center justify-center">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="w-20 h-20 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition animate-pulse cursor-pointer"
                >
                  <Square className="w-7 h-7 fill-current" />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  className="w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  <Mic className="w-8 h-8" />
                </button>
              )}
            </div>

            <div className="text-lg font-mono font-bold text-slate-200">
              {isRecording ? formatTime(recordingSeconds) : '00:00'}
            </div>

            <p className="text-xs text-slate-400">
              {isRecording
                ? 'Pulsa el botón rojo para detener la grabación'
                : 'Pulsa el micrófono para dictar tu oración, sermón o testimonio'}
            </p>
          </div>

          {/* Or upload file */}
          <div className="text-center">
            <span className="text-xs text-slate-500 font-medium">o sube un archivo de audio grabado</span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-4 text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition group flex items-center justify-center gap-3"
          >
            <Upload className="w-5 h-5 text-slate-400 group-hover:text-amber-400" />
            <span className="text-xs text-slate-300 font-medium">Cargar audio (MP3, WAV, M4A, WebM)</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {audioUrl && (
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" />
                Audio capturado listo:
              </span>
              <audio src={audioUrl} controls className="w-full h-8" />
              <button
                onClick={handleTranscribe}
                disabled={isLoading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition disabled:opacity-40 cursor-pointer shadow"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Transcribir con Gemini 3.5 Transcribe</span>
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Transcription Output */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950/80 border border-slate-800 rounded-xl p-5 min-h-[360px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                Texto Transcrito con Alta Precisión:
              </span>
              {transcription && (
                <button
                  onClick={handleCopy}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado' : 'Copiar'}</span>
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-16 space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-200">Analizando ondas fonéticas con Gemini 3.5...</p>
                <p className="text-xs text-slate-400">Puntuando y reconociendo vocabulario bíblico</p>
              </div>
            ) : transcription ? (
              <div className="text-sm text-slate-100 leading-relaxed whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                {transcription}
              </div>
            ) : (
              <div className="text-center py-16 space-y-2 text-slate-500">
                <FileText className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
                <p className="text-sm font-medium text-slate-400">Esperando Audio</p>
                <p className="text-xs text-slate-500">Graba o sube un archivo y presiona transcribir para ver el texto aquí.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
