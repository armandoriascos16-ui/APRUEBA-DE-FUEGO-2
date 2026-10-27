import React, { useState } from 'react';
import { Music, Play, Pause, Download, RefreshCw, Volume2, Disc, Sparkles, FileText } from 'lucide-react';

const PRESET_MUSIC_PROMPTS = [
  'Himno cristiano majestuoso orquestal con cuerdas, trompetas y coro celestial en alabanza a Dios',
  'Alabanza juvenil acústica con guitarra rítmica, piano cálido y armonías vocales de esperanza',
  'Música instrumental pacífica para el sábado de descanso y oración, piano suave y violonchelo',
  'Canción misionera rítmica y alegre para jóvenes adventistas marchando con fe y propósito',
];

export const AIMusicLyriaTab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isFullTrack, setIsFullTrack] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [lyrics, setLyrics] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleGenerateMusic = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setAudioUrl(null);
    setLyrics('');

    try {
      const res = await fetch('/api/ai/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          isFullTrack,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status}: Fallo al generar música con Lyria`);
      }

      const data = await res.json();
      
      // Convert base64 audio to object URL for seamless browser playback
      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: data.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setLyrics(data.lyrics || '');
    } catch (err: any) {
      console.error('Error generating music with Lyria:', err);
      setErrorMsg(err.message || 'Error al conectar con el motor musical Lyria.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-2xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Music className="w-5 h-5 text-amber-400" />
            Compositor de Alabanzas & Himnos (Lyria 3 Clip & Pro)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Genera pistas orquestales, himnos solemnes y alabanzas juveniles con <code className="text-amber-300 font-mono">lyria-3-clip-preview</code> (hasta 30s) y <code className="text-amber-300 font-mono">lyria-3-pro-preview</code> (pistas completas).
          </p>
        </div>

        {/* Model switcher */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setIsFullTrack(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              !isFullTrack
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Clip Corto (30s)
          </button>
          <button
            onClick={() => setIsFullTrack(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              isFullTrack
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            Pista Completa (Pro)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Describe el estilo musical y el mensaje de alabanza:
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              placeholder="Ej: Un himno adventista solemne en piano y violines con tempo moderado y sentimiento de reverencia..."
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition resize-none"
            />
          </div>

          {/* Preset Styles */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Estilos recomendados:
            </span>
            <div className="flex flex-col gap-1.5">
              {PRESET_MUSIC_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(p)}
                  className="text-left text-xs bg-slate-950/60 hover:bg-slate-800/70 text-slate-300 hover:text-amber-300 border border-slate-800 p-2 rounded-lg transition truncate cursor-pointer"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateMusic}
            disabled={!prompt.trim() || isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Componiendo con Lyria 3 ({isFullTrack ? 'Pro' : 'Clip'})...</span>
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                <span>Generar Música con IA</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Audio Player & Lyrics */}
        <div className="lg:col-span-6 flex flex-col justify-between bg-slate-950/80 border border-slate-800 rounded-xl p-5 min-h-[300px]">
          {isLoading ? (
            <div className="my-auto text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 animate-spin">
                <Disc className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-200">Sintetizando acordes y arreglos orquestales...</p>
              <p className="text-xs text-slate-400">Lyria 3 generando forma de onda a 24kHz</p>
            </div>
          ) : audioUrl ? (
            <div className="space-y-4 my-auto">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlay}
                      className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition shadow-lg shadow-amber-500/20 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                    </button>
                    <div>
                      <h4 className="text-sm font-bold text-white">Composición Cristiana</h4>
                      <p className="text-xs text-amber-400 font-mono">{isFullTrack ? 'Lyria 3 Pro' : 'Lyria 3 Clip (30s)'}</p>
                    </div>
                  </div>

                  <a
                    href={audioUrl}
                    download="alabanza_ia_lyria.wav"
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs flex items-center gap-1.5 transition"
                    title="Descargar audio WAV"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                  </a>
                </div>

                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  controls
                  className="w-full h-9 mt-2"
                />
              </div>

              {lyrics && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    Letra / Poema Inspirado:
                  </span>
                  <p className="text-xs text-slate-300 italic whitespace-pre-wrap leading-relaxed">{lyrics}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="my-auto text-center space-y-3 text-slate-500 p-6">
              <Volume2 className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
              <div>
                <div className="text-sm font-medium text-slate-400">Estudio Musical Inactivo</div>
                <div className="text-xs text-slate-500 mt-0.5">Elige un estilo y pulsa generar para escuchar la música aquí.</div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
