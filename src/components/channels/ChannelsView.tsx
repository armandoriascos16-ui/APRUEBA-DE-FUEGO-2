import React, { useState } from 'react';
import { VERIFIED_ADVENTIST_CREATORS } from '../../data/adventistOfficialData';
import { VerifiedCreator } from '../../types';
import { 
  Tv, 
  CheckCircle2, 
  ExternalLink, 
  Search, 
  ShieldCheck, 
  Sparkles,
  Share2,
  Video,
  Instagram,
  Facebook,
  Award,
  Landmark,
  UserCheck
} from 'lucide-react';

export const ChannelsView: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Las categorías exactas requeridas por la especificación oficial
  const categoryFilters = [
    { id: 'all', label: 'Todos los Canales' },
    { id: 'YouTube', label: 'YouTube' },
    { id: 'Instagram', label: 'Instagram' },
    { id: 'Facebook', label: 'Facebook' },
    { id: 'TikTok', label: 'TikTok' },
    { id: 'ministerios_juveniles', label: 'Canales oficiales de ministerios juveniles' },
    { id: 'creadores_verificados', label: 'Creadores adventistas verificados' },
  ];

  const filteredCreators = VERIFIED_ADVENTIST_CREATORS.filter(c => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      !term || 
      c.name.toLowerCase().includes(term) ||
      c.handle.toLowerCase().includes(term) ||
      c.description.toLowerCase().includes(term);

    let matchesFilter = true;
    if (selectedFilter === 'all') {
      matchesFilter = true;
    } else if (['YouTube', 'Instagram', 'Facebook', 'TikTok'].includes(selectedFilter)) {
      matchesFilter = c.platform === selectedFilter;
    } else if (selectedFilter === 'ministerios_juveniles') {
      matchesFilter = c.category === 'Juventud JA' && c.accountType === 'institucional';
    } else if (selectedFilter === 'creadores_verificados') {
      matchesFilter = c.accountType === 'creador_independiente';
    }

    return matchesSearch && matchesFilter;
  });

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'YouTube':
        return <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-bold flex items-center gap-1">▶️ YouTube</span>;
      case 'Instagram':
        return <span className="px-2.5 py-0.5 rounded-full bg-pink-600/20 text-pink-400 border border-pink-500/30 text-[10px] font-bold flex items-center gap-1">📸 Instagram</span>;
      case 'Facebook':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1">📘 Facebook</span>;
      case 'TikTok':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1">🎵 TikTok</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-red-950/70 via-slate-900 to-slate-950 border border-red-500/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-xs font-bold text-red-300 mb-2">
              <ShieldCheck className="h-4 w-4 text-red-400" />
              <span>DIRECTORIO OFICIAL IASD & CREADORES VERIFICADOS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading">
              CANALES Y CREADORES ADVENTISTAS
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Cuentas oficiales verificadas de la Iglesia Adventista del Séptimo Día (Colombia e Internacionales), sus ministerios juveniles y creadores adventistas cuya afiliación e identidad están comprobadas.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-red-500/30 text-center min-w-[120px] shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Institucionales</span>
              <span className="text-xl font-black text-red-400">
                {VERIFIED_ADVENTIST_CREATORS.filter(c => c.accountType === 'institucional').length}
              </span>
              <span className="text-[10px] text-slate-400 block">Oficiales IASD</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30 text-center min-w-[120px] shrink-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Creadores</span>
              <span className="text-xl font-black text-amber-400">
                {VERIFIED_ADVENTIST_CREATORS.filter(c => c.accountType === 'creador_independiente').length}
              </span>
              <span className="text-[10px] text-slate-400 block">Verificados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categorization & Filter Navigation */}
      <div className="space-y-3 bg-slate-900/80 p-4 rounded-3xl border border-slate-800 shadow-md">
        
        {/* Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre oficial, handle o descripción..."
            className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
          />
        </div>

        {/* Categories Carousel/Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-800/80">
          {categoryFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedFilter === filter.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Verified Accounts */}
      {filteredCreators.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-3xl border border-slate-800 p-6 space-y-3">
          <Tv className="h-12 w-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No hay canales en esta categoría</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Selecciona "Todos los Canales" para ver el catálogo completo verificado.
          </p>
          <button
            onClick={() => { setSelectedFilter('all'); setSearchTerm(''); }}
            className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold"
          >
            Ver Todos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCreators.map((creator) => {
            const isInstitutional = creator.accountType === 'institucional';

            return (
              <div
                key={creator.id}
                className={`rounded-3xl border p-5 transition-all shadow-lg flex flex-col justify-between group ${
                  isInstitutional
                    ? 'bg-slate-900/90 border-slate-800 hover:border-red-500/50'
                    : 'bg-slate-900/80 border-slate-800/80 hover:border-amber-500/50'
                }`}
              >
                <div>
                  {/* Top Bar: Distinction Badge & Platform */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {isInstitutional ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-[10px] font-black text-red-300">
                        <Landmark className="h-3 w-3 text-red-400" />
                        <span>CUENTA INSTITUCIONAL OFICIAL IASD</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-black text-amber-300">
                        <UserCheck className="h-3 w-3 text-amber-400" />
                        <span>CREADOR ADVENTISTA VERIFICADO</span>
                      </span>
                    )}

                    {getPlatformBadge(creator.platform)}
                  </div>

                  {/* Header: Logo, Name & Handle */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                      <img
                        src={creator.avatarUrl}
                        alt={creator.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors leading-snug">
                        {creator.name}
                      </h3>
                      <span className="text-xs text-amber-400 font-mono block mt-0.5">
                        {creator.handle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        Categoría: {creator.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-3">
                    {creator.description}
                  </p>
                </div>

                {/* Bottom Bar: Verification Date & Functional Profile Link */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>Verificado: {creator.lastVerifiedDate}</span>
                  </div>

                  <a
                    href={creator.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-red-600 hover:text-white text-red-400 font-bold transition-all flex items-center gap-1.5 active:scale-95 shadow"
                    title={`Abrir perfil auténtico de ${creator.name}`}
                  >
                    <span>Visitar Perfil</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
