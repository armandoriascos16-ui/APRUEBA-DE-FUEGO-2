import React, { useState } from 'react';
import { Search, Globe, ExternalLink, RefreshCw, Compass, BookMarked, Newspaper } from 'lucide-react';

interface SearchResult {
  reply: string;
  sources: Array<{
    web?: {
      uri: string;
      title: string;
    };
  }>;
  webSearchQueries?: string[];
}

const SEARCH_SUGGESTIONS = [
  'Lección de Escuela Sabática para jóvenes de este trimestre',
  'Descubrimientos arqueológicos recientes que confirman la Biblia',
  'Próximo Camporee de Conquistadores y Guías Mayores a nivel internacional',
  'Noticias recientes de la Iglesia Adventista del Séptimo Día en el mundo',
];

export const AISearchGroundingTab: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = async (textToSearch?: string) => {
    const q = (textToSearch || query).trim();
    if (!q || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status}: Fallo en el servicio de búsqueda`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error('Error during Google Search grounding:', err);
      setErrorMsg(err.message || 'Error al conectar con Google Search Grounding.');
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
            <Globe className="w-5 h-5 text-amber-400" />
            Búsqueda e Investigación Bíblica en Vivo (Search Grounding)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Conectado a Google Search con <code className="text-amber-300 font-mono">gemini-3.8-flash</code> para consultar noticias oficiales, Escuela Sabática, arqueología y eventos mundiales.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] text-amber-300 font-medium">
          <Compass className="w-3.5 h-3.5" />
          Datos en Tiempo Real
        </div>
      </div>

      {/* Search Input Bar */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Pregunta sobre noticias adventistas, lección, historia o arqueología bíblica..."
            className="w-full bg-slate-950 border border-slate-700/70 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>Buscar</span>
        </button>
      </form>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
          <BookMarked className="w-3.5 h-3.5 text-amber-400" />
          Temas sugeridos:
        </span>
        {SEARCH_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              setQuery(item);
              handleSearch(item);
            }}
            disabled={isLoading}
            className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700 px-3 py-1 rounded-full transition cursor-pointer disabled:opacity-50"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="bg-slate-950/70 border border-slate-800 p-8 rounded-xl text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
          <div className="text-sm font-medium text-slate-200">Consultando fuentes oficiales y web mediante Google Search...</div>
          <div className="text-xs text-slate-400">Verificando citas y sintetizando información fundamentada</div>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            onClick={() => handleSearch()}
            className="text-xs bg-rose-500 text-white px-3 py-1 rounded-lg hover:bg-rose-600 transition"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-4">
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
            {result.reply}
          </div>

          {/* Sources / Citations */}
          {result.sources && result.sources.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Newspaper className="w-3.5 h-3.5 text-amber-400" />
                Fuentes y Enlaces Verificados:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.sources.map((src, i) => {
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
                      <span className="truncate pr-2 font-medium">{web.title || web.uri}</span>
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
