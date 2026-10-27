import React, { useState } from 'react';
import { ADVENTIST_MOVIES, AdventistMovie } from '../../data/adventistResourcesData';
import { 
  Film, 
  Play, 
  ExternalLink, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Clock, 
  Calendar, 
  ShieldCheck,
  Share2,
  Tv,
  HelpCircle,
  X
} from 'lucide-react';

export const ChristianCinemaPortal: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<AdventistMovie | null>(null);
  const [filterGenre, setFilterGenre] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDiscussionModal, setShowDiscussionModal] = useState<AdventistMovie | null>(null);

  const filteredMovies = ADVENTIST_MOVIES.filter(m => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term || 
      m.title.toLowerCase().includes(term) || 
      m.synopsis.toLowerCase().includes(term) ||
      m.spiritualThemes.some(t => t.toLowerCase().includes(term));

    const matchesGenre = 
      filterGenre === 'all' || 
      (filterGenre === 'oficial' ? m.isOfficialAdventist : !m.isOfficialAdventist);

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-950 border border-rose-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs font-bold text-rose-300 mb-2">
              <Film className="h-4 w-4 text-rose-400" />
              <span>CINE ADVENTISTA & CRISTIANO DE IMPACTO</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Portal de Películas & Producciones de Fe
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Descubre historias bíblicas, biografías de pioneros como Desmond Doss y Guillermo Miller, y producciones de Feliz7Play y Hope Channel, ideales para noches de cine en tu Sociedad de Jóvenes con guías de debate didácticas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-rose-500/30 text-center min-w-[140px] shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catálogo Oficial</span>
            <span className="text-2xl font-black text-rose-400">{ADVENTIST_MOVIES.length}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Películas Disponibles</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, pionero o tema..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterGenre('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterGenre === 'all'
                ? 'bg-rose-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Todas ({ADVENTIST_MOVIES.length})
          </button>
          <button
            onClick={() => setFilterGenre('oficial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterGenre === 'oficial'
                ? 'bg-rose-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
            <span>Oficiales IASD</span>
          </button>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMovies.map((movie) => (
          <div 
            key={movie.id}
            className="group rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-xl"
          >
            {/* Poster & Badge */}
            <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                {movie.isOfficialAdventist && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 text-[10px] font-black uppercase flex items-center gap-1 shadow-md">
                    <ShieldCheck className="h-3 w-3" />
                    IASD Oficial
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-slate-200 text-[10px] font-semibold border border-white/10">
                  {movie.year}
                </span>
              </div>

              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-rose-300">
                  <Clock className="h-3.5 w-3.5" />
                  {movie.duration}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-lg bg-black/70 border border-slate-700 text-slate-300 font-bold">
                  {movie.platform}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                  {movie.title}
                </h3>
                <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                  {movie.genre} · {movie.rating}
                </span>
                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {movie.synopsis}
                </p>
              </div>

              {/* Spiritual Themes Chips */}
              <div className="flex flex-wrap gap-1 pt-1">
                {movie.spiritualThemes.slice(0, 3).map((theme, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-semibold"
                  >
                    #{theme}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <a
                  href={movie.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Ver Película</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowDiscussionModal(movie)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Ver Guía de Debate para Sociedad de Jóvenes"
                >
                  <MessageSquare className="h-4 w-4 text-amber-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Discussion Guide Modal */}
      {showDiscussionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                  Guía Didáctica para Sociedad de Jóvenes (JA)
                </span>
                <h3 className="text-base font-black text-white">
                  Debate: {showDiscussionModal.title}
                </h3>
              </div>
              <button 
                onClick={() => setShowDiscussionModal(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <span className="font-bold text-amber-400 block">Temas Centrales de Fe:</span>
              <div className="flex flex-wrap gap-1">
                {showDiscussionModal.spiritualThemes.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-semibold">
                    ✓ {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-amber-400" />
                Preguntas para Reflexión en Grupo Pequeño o Programa JA:
              </span>
              
              <div className="space-y-2">
                {showDiscussionModal.discussionQuestions.map((q, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-2.5">
                    <span className="h-5 w-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Lleva este programa a tu iglesia local.
              </span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `*Guía de Debate JA: ${showDiscussionModal.title}*\n\n` +
                    showDiscussionModal.discussionQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
                  );
                  alert('¡Preguntas de debate copiadas al portapapeles para WhatsApp!');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Copiar Guía</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
