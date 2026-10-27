import React, { useState } from 'react';
import { 
  Search, 
  X, 
  Building2, 
  Users, 
  BookOpen, 
  Calendar, 
  Music, 
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { comunidadStorage } from './comunidadStorage';
import { ComunidadArea } from './types';

interface ComunidadSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArea: (area: ComunidadArea) => void;
}

export const ComunidadSearchModal: React.FC<ComunidadSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectArea
}) => {
  const { currentUser } = useApp();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const results = comunidadStorage.searchAll(query, currentUser.id);
  const totalResults = results.communities.length + 
                       results.groups.length + 
                       results.posts.length + 
                       results.studies.length + 
                       results.events.length + 
                       results.projects.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4">
        
        {/* Header & Search Input */}
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar comunidades, grupos, estudios, publicaciones, eventos o proyectos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {query.trim().length > 0 && totalResults === 0 && (
            <div className="p-8 text-center space-y-2">
              <Search className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">No se encontraron resultados para «{query}»</p>
              <p className="text-xs text-slate-500">Prueba con palabras como Sábado, Vigilia, Daniel, Coro o el nombre de un distrito.</p>
            </div>
          )}

          {/* Comunidades Encontradas */}
          {results.communities.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                <span>Comunidades ({results.communities.length})</span>
              </span>
              <div className="space-y-1.5">
                {results.communities.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onSelectArea('distritos');
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-850 hover:border-blue-500/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{c.name}</h4>
                      <span className="text-[10px] text-slate-400">{c.church} · {c.district}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grupos Ministeriales */}
          {results.groups.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>Grupos Ministeriales ({results.groups.length})</span>
              </span>
              <div className="space-y-1.5">
                {results.groups.map(g => (
                  <div
                    key={g.id}
                    onClick={() => {
                      onSelectArea('grupos');
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-850 hover:border-purple-500/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{g.name}</h4>
                      <span className="text-[10px] text-slate-400">{g.categoryLabel}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estudios Bíblicos */}
          {results.studies.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Estudios Bíblicos ({results.studies.length})</span>
              </span>
              <div className="space-y-1.5">
                {results.studies.map(s => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onSelectArea('estudios');
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-850 hover:border-emerald-500/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{s.title}</h4>
                      <span className="text-[10px] text-slate-400">{s.bookOfBible} · {s.topic}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eventos */}
          {results.events.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Eventos JA ({results.events.length})</span>
              </span>
              <div className="space-y-1.5">
                {results.events.map(ev => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      onSelectArea('eventos');
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-850 hover:border-cyan-500/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{ev.title}</h4>
                      <span className="text-[10px] text-slate-400">{ev.date} · {ev.location}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publicaciones */}
          {results.posts.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Publicaciones ({results.posts.length})</span>
              </span>
              <div className="space-y-1.5">
                {results.posts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectArea('feed');
                      onClose();
                    }}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-850 hover:border-amber-500/40 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{p.title || p.content.slice(0, 50) + '...'}</h4>
                      <span className="text-[10px] text-slate-400">Por: {p.authorName} ({p.authorDistrict})</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
