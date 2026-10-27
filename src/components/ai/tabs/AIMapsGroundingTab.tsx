import React, { useState } from 'react';
import { MapPin, Navigation, RefreshCw, Church, Compass, ExternalLink } from 'lucide-react';

interface MapResult {
  reply: string;
  mapSources?: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
}

const POPULAR_LOCATIONS = [
  'Iglesias Adventistas del Séptimo Día en Buenaventura, Colombia',
  'Templos adventistas y campamentos juveniles en Bogotá',
  'Sedes adventistas y centros de jóvenes en Medellín',
  'Universidades y colegios adventistas en Sudamérica',
];

export const AIMapsGroundingTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<MapResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearchMaps = async (customQuery?: string) => {
    const q = (customQuery || query).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status}: Fallo en Maps Grounding`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Error during Google Maps grounding:', err);
      setErrorMsg(err.message || 'Error al conectar con Google Maps Grounding.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-2xl backdrop-blur-md">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            Localizador de Iglesias & Campamentos (Google Maps Grounding)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Encuentra templos adventistas, sedes de distrito, campos juveniles y centros misioneros con <code className="text-amber-300 font-mono">gemini-3.8-flash</code> + herramienta <code className="text-amber-300 font-mono">googleMaps</code>.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] text-amber-300 font-medium">
          <Navigation className="w-3.5 h-3.5" />
          Geolocalización
        </div>
      </div>

      {/* Input */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSearchMaps();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ej: Templos adventistas en Buenaventura o iglesias cercanas a mi distrito..."
            className="w-full bg-slate-950 border border-slate-700/70 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
          <span>Localizar</span>
        </button>
      </form>

      {/* Preset Suggestions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
          <Church className="w-3.5 h-3.5 text-amber-400" />
          Rutas comunes:
        </span>
        {POPULAR_LOCATIONS.map((loc, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(loc);
              handleSearchMaps(loc);
            }}
            disabled={isLoading}
            className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 px-3 py-1 rounded-full transition cursor-pointer disabled:opacity-50"
          >
            {loc}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="bg-slate-950/70 border border-slate-800 p-8 rounded-xl text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <div className="text-sm font-medium text-slate-200">Localizando iglesias y coordenadas con Google Maps...</div>
          <div className="text-xs text-slate-400">Consultando datos cartográficos precisos</div>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => handleSearchMaps()}
            className="text-xs bg-rose-500 text-white px-3 py-1 rounded-lg hover:bg-rose-600 transition"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {result.reply}
          </div>

          {result.mapSources && result.mapSources.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                Lugares Identificados en Google Maps:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.mapSources.map((src, i) => {
                  const web = src.web;
                  if (!web?.uri) return null;
                  return (
                    <a
                      key={i}
                      href={web.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-lg text-xs text-slate-300 hover:text-amber-300 transition group"
                    >
                      <span className="truncate pr-2 font-medium">{web.title || 'Ver en Google Maps'}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-amber-400" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
