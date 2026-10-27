import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ADVENTIST_MOVIES, 
  YOUTH_ACTIVITY_IDEAS, 
  OFFICIAL_YOUTH_MATERIALS, 
  BUENAVENTURA_CHURCHES 
} from '../../data/adventistResourcesData';
import { 
  Search, 
  X, 
  User, 
  Calendar, 
  Flame, 
  Church, 
  Film, 
  BookOpen, 
  Lightbulb, 
  ArrowRight,
  MapPin,
  Sparkles
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface GlobalSearchModalProps {
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onClose }) => {
  const { 
    allUsers, 
    posts, 
    events, 
    challenges, 
    churches, 
    setSelectedUserId, 
    setActiveTab 
  } = useApp();

  const [query, setQuery] = useState('');
  const term = query.toLowerCase().trim();

  // 1. Matched Users (Exclusively genuine, verified accounts)
  const matchedUsers = term ? allUsers.filter(u => 
    !u.isDemo &&
    u.emailVerified === true &&
    u.privacy?.isProfilePublic !== false &&
    !['user_david', 'user_sarah', 'user_mateo', 'user_valeria', 'user_samuel', 'user_camila', 'user_elena', 'user_david_bvt'].includes(u.id) &&
    !u.email?.endsWith('@ejemplo.com') && (
      `${u.name} ${u.lastName}`.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.church?.toLowerCase().includes(term) ||
      u.city?.toLowerCase().includes(term)
    )
  ) : [];

  // 2. Matched Events
  const matchedEvents = term ? events.filter(e => 
    e.title.toLowerCase().includes(term) ||
    e.city.toLowerCase().includes(term) ||
    e.organizer.toLowerCase().includes(term) ||
    e.venue.toLowerCase().includes(term)
  ) : [];

  // 3. Matched Buenaventura Churches
  const matchedBuenaventura = term ? BUENAVENTURA_CHURCHES.filter(b => 
    b.churchName.toLowerCase().includes(term) ||
    b.district.toLowerCase().includes(term) ||
    b.address.toLowerCase().includes(term) ||
    b.activeProjects.some(p => p.toLowerCase().includes(term))
  ) : [];

  // 4. Matched General Churches
  const matchedChurches = term ? churches.filter(ch => 
    ch.name.toLowerCase().includes(term) ||
    ch.city.toLowerCase().includes(term) ||
    ch.district.toLowerCase().includes(term)
  ) : [];

  // 5. Matched Movies
  const matchedMovies = term ? ADVENTIST_MOVIES.filter(m => 
    m.title.toLowerCase().includes(term) ||
    m.synopsis.toLowerCase().includes(term) ||
    m.spiritualThemes.some(t => t.toLowerCase().includes(term))
  ) : [];

  // 6. Matched Youth Activity Ideas
  const matchedActivities = term ? YOUTH_ACTIVITY_IDEAS.filter(a => 
    a.title.toLowerCase().includes(term) ||
    a.biblicalTheme.toLowerCase().includes(term) ||
    a.objective.toLowerCase().includes(term)
  ) : [];

  // 7. Matched Materials
  const matchedMaterials = term ? OFFICIAL_YOUTH_MATERIALS.filter(mat => 
    mat.title.toLowerCase().includes(term) ||
    mat.description.toLowerCase().includes(term)
  ) : [];

  // 8. Matched Challenges
  const matchedChallenges = term ? challenges.filter(c => 
    c.title.toLowerCase().includes(term) ||
    c.category.toLowerCase().includes(term)
  ) : [];

  const totalResults = 
    matchedUsers.length + 
    matchedEvents.length + 
    matchedBuenaventura.length + 
    matchedChurches.length + 
    matchedMovies.length + 
    matchedActivities.length + 
    matchedMaterials.length + 
    matchedChallenges.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-md p-4 pt-16">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="h-5 w-5 text-amber-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar eventos, iglesias de Buenaventura, películas, materiales o jóvenes..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Borrar
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar text-[11px]">
          <span className="text-slate-500 font-bold shrink-0">Sugerencias:</span>
          {['Buenaventura', 'Camporee', 'Dile al Mundo', 'Desmond Doss', 'Misión Caleb', 'Himnario', 'Manual JA'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setQuery(s)}
              className="px-2.5 py-0.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition-colors shrink-0"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="p-5 overflow-y-auto space-y-5">
          {!term ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <Search className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="font-bold text-slate-300">Buscador Adventista Universal</p>
              <p className="max-w-md mx-auto text-slate-500">
                Escribe para buscar cualquier evento de la Iglesia Adventista, iglesias de Buenaventura y Colombia, películas cristianas, actividades JA o materiales oficiales.
              </p>
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No se encontraron resultados para "{query}". Prueba con otra palabra clave como "Buenaventura", "Campamento", "Película" o "Himno".
            </div>
          ) : (
            <>
              {/* Buenaventura Churches */}
              {matchedBuenaventura.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Iglesias Adventistas de Buenaventura ({matchedBuenaventura.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {matchedBuenaventura.map((b, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-950 border border-amber-500/30 text-left flex items-start justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{b.churchName}</span>
                          <span className="text-[11px] text-slate-400 block">{b.address} · {b.district}</span>
                          <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                            {b.activeProjects[0]}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setActiveTab('eventos');
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black shrink-0"
                        >
                          Ver Radar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {matchedEvents.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Eventos Adventistas ({matchedEvents.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedEvents.map(e => (
                      <button
                        key={e.id}
                        onClick={() => {
                          setActiveTab('eventos');
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-left flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{e.title}</span>
                          <span className="text-[10px] text-slate-400">{e.date} · {e.city}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Movies */}
              {matchedMovies.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
                    <Film className="h-3.5 w-3.5" />
                    <span>Películas & Cine Cristiano ({matchedMovies.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedMovies.map(m => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setActiveTab('cine');
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-rose-500/40 text-left flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{m.title} ({m.year})</span>
                          <span className="text-[10px] text-slate-400">{m.genre} · {m.duration}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-rose-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Activity Ideas */}
              {matchedActivities.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>Ideas para Sociedad JA ({matchedActivities.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedActivities.map(a => (
                      <button
                        key={a.id}
                        onClick={() => {
                          setActiveTab('actividades');
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-left flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{a.title}</span>
                          <span className="text-[10px] text-slate-400">{a.biblicalTheme} · {a.durationMinutes} min</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-amber-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials */}
              {matchedMaterials.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-blue-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Materiales Oficiales ({matchedMaterials.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedMaterials.map(mat => (
                      <button
                        key={mat.id}
                        onClick={() => {
                          setActiveTab('materiales');
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 text-left flex items-center justify-between transition-colors"
                      >
                        <div>
                          <span className="text-xs font-bold text-white block">{mat.title}</span>
                          <span className="text-[10px] text-slate-400">{mat.format} · {mat.authorOrEntity}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-blue-500" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {matchedUsers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span>Jóvenes Registrados ({matchedUsers.length})</span>
                  </h4>
                  <div className="space-y-1.5">
                    {matchedUsers.slice(0, 4).map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedUserId(u.id);
                          setActiveTab('perfil');
                          onClose();
                        }}
                        className="w-full p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-left flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <UserAvatar avatar={u.avatar} name={`${u.name} ${u.lastName}`} size="xs" showBadge={false} />
                          <div>
                            <span className="text-xs font-bold text-white block">{u.name} {u.lastName}</span>
                            <span className="text-[10px] text-slate-400">{u.church || 'Iglesia local'}</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-amber-400">🔥 {u.points} pts</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}
        </div>

      </div>
    </div>
  );
};
