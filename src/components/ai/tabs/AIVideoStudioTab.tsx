import React, { useState, useRef } from 'react';
import { Film, Video, Sparkles, Upload, Play, Download, RefreshCw, Wand2 } from 'lucide-react';

const PRESET_VIDEO_PROMPTS = [
  'Paloma blanca volando con gracia hacia los cielos abiertos sobre un mar en calma al atardecer, luz dorada cinematográfica',
  'Pétalos de lirio cayendo suavemente sobre las aguas cristalinas de un río de montaña con suave brisa',
  'Cielo nocturno estrellado abriéndose con nubes iluminadas de gloria celestial, 16:9 cinematográfico',
  'Un joven orando con reverencia en la cumbre de una colina verde mientras los primeros rayos del sol iluminan la neblina',
];

export const AIVideoStudioTab: React.FC = () => {
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [duration, setDuration] = useState<'5s' | '10s'>('5s');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateVideo = async () => {
    if ((!prompt.trim() && !selectedImage) || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim() || (mode === 'image' ? 'Anima con movimiento cinematográfico suave y reverente esta imagen.' : ''),
          base64Image: mode === 'image' ? selectedImage : null,
          aspectRatio,
          duration,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status}: Fallo al generar video`);
      }

      const data = await res.json();
      setGeneratedVideoUrl(data.videoUrl);
    } catch (err: any) {
      console.error('Error generating video with Omni Flash:', err);
      setErrorMsg(err.message || 'Error al procesar el video con Gemini Omni Flash.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-6 shadow-2xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            Estudio de Animación & Video Espiritual (Gemini Omni Flash)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Genera clips cinematográficos desde texto o anima fotografías con <code className="text-amber-300 font-mono">gemini-omni-1.1-flash</code> en 16:9 o 9:16.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => {
              setMode('text');
              setGeneratedVideoUrl(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              mode === 'text'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            Texto a Video
          </button>
          <button
            onClick={() => {
              setMode('image');
              setGeneratedVideoUrl(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              mode === 'image'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            Animar Foto
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* If image animation mode */}
          {mode === 'image' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                1. Sube la fotografía para animar con IA:
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 rounded-xl p-4 text-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition group"
              >
                {selectedImage ? (
                  <div className="relative aspect-video max-h-44 mx-auto rounded-lg overflow-hidden border border-slate-800">
                    <img src={selectedImage} alt="Fotograma inicial" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-medium transition">
                      Cambiar foto
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-amber-400 mx-auto transition" />
                    <div className="text-xs font-medium text-slate-300">Selecciona una imagen base</div>
                    <div className="text-[11px] text-slate-500">Formato JPG, PNG o WebP</div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              {mode === 'text' ? 'Descripción cinematográfica de la escena:' : 'Instrucción de movimiento para la cámara / elementos:'}
            </label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              rows={3}
              placeholder={
                mode === 'text'
                  ? 'Ej: Un rayo de luz celestial penetra a través de los vitrales de una iglesia antigua iluminando el altar...'
                  : 'Ej: Movimiento de cámara suave hacia adelante con brisa y ramas balanceándose suavemente...'
              }
              className="w-full bg-slate-950 border border-slate-700/80 focus:border-amber-500 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition resize-none"
            />
          </div>

          {/* Video Parameters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Proporción de Pantalla</label>
              <select
                value={aspectRatio}
                onChange={e => setAspectRatio(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="16:9">16:9 (Horizontal / Paisaje)</option>
                <option value="9:16">9:16 (Vertical / Estados)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Duración del Clip</label>
              <select
                value={duration}
                onChange={e => setDuration(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="5s">5 segundos</option>
                <option value="10s">10 segundos</option>
              </select>
            </div>
          </div>

          {/* Presets */}
          {mode === 'text' && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Sugerencias cinemáticas:
              </span>
              <div className="flex flex-col gap-1.5">
                {PRESET_VIDEO_PROMPTS.map((p, idx) => (
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
          )}

          {/* Action Button */}
          <button
            onClick={handleGenerateVideo}
            disabled={(!prompt.trim() && !selectedImage) || isLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Renderizando video con Omni Flash...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{mode === 'text' ? 'Generar Video Cinematográfico' : 'Animar Fotografía con IA'}</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right Column: Video Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-h-[380px] relative">
          {isLoading ? (
            <div className="text-center space-y-4 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                <Film className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Generando fotogramas de video...</p>
                <p className="text-xs text-slate-400 mt-1">Interactions API coordinando con modelo gemini-omni-1.1-flash ({aspectRatio}, {duration})</p>
              </div>
            </div>
          ) : generatedVideoUrl ? (
            <div className="w-full flex flex-col items-center space-y-4">
              <div className={`rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl bg-black ${aspectRatio === '9:16' ? 'max-w-[280px] aspect-[9/16]' : 'w-full max-w-lg aspect-video'}`}>
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              <a
                href={generatedVideoUrl}
                download="video_cristiano_ia.mp4"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Descargar Video MP4
              </a>
            </div>
          ) : (
            <div className="text-center space-y-3 text-slate-500 p-8">
              <Video className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
              <div>
                <div className="text-sm font-medium text-slate-400">Reproductor de Video IA</div>
                <div className="text-xs text-slate-500 mt-0.5">Define tu idea cinemática o sube una imagen para crear tu video espiritual.</div>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
