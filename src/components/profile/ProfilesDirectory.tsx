import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { 
  Users, 
  Search, 
  Lock, 
  Eye, 
  ShieldCheck, 
  MapPin, 
  Church, 
  Flame, 
  ArrowRight, 
  Sparkles,
  Filter,
  UserCheck,
  UserPlus,
  Radio,
  FileText
} from 'lucide-react';

export const ProfilesDirectory: React.FC = () => {
  const { 
    allUsers, 
    currentUser, 
    setActiveTab, 
    setSelectedUserId, 
    followUser,
    stories,
    posts 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'public' | 'private' | 'church'>('all');
  const [sortBy, setSortBy] = useState<'points' | 'name' | 'level'>('points');

  // Filtrar exclusivamente usuarios reales registrados (excluyendo datos demo o inventados)
  const realUsers = useMemo(() => {
    return allUsers.filter(u => {
      if (u.isDemo) return false;
      if (u.email?.toLowerCase().endsWith('@ejemplo.com')) return false;
      if (['user_david', 'user_sarah', 'user_mateo', 'user_valeria', 'user_samuel', 'user_camila', 'user_elena', 'user_david_bvt'].includes(u.id)) {
        return false;
      }
      return Boolean(u.id && (u.name || u.username));
    });
  }, [allUsers]);

  // Conteos estadísticos reales
  const publicCount = realUsers.filter(u => u.privacy?.isProfilePublic !== false).length;
  const privateCount = realUsers.filter(u => u.privacy?.isProfilePublic === false).length;
  const churchCount = realUsers.filter(u => u.church && u.church.trim() === currentUser.church?.trim()).length;

  // Filtrado y ordenamiento de perfiles
  const filteredUsers = useMemo(() => {
    return realUsers.filter(user => {
      const isPublic = user.privacy?.isProfilePublic !== false;

      // Filtro por tipo
      if (filterMode === 'public' && !isPublic) return false;
      if (filterMode === 'private' && isPublic) return false;
      if (filterMode === 'church' && (!user.church || user.church.trim() !== currentUser.church?.trim())) {
        return false;
      }

      // Filtro por término de búsqueda (nombre, apellido, username, iglesia, ciudad)
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const fullName = `${user.name} ${user.lastName}`.toLowerCase();
        const username = (user.username || '').toLowerCase();
        const church = (user.church || '').toLowerCase();
        const city = (user.city || '').toLowerCase();

        const match = fullName.includes(query) ||
                      username.includes(query) ||
                      church.includes(query) ||
                      city.includes(query);

        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'points') return (b.points || 0) - (a.points || 0);
      if (sortBy === 'level') return (b.level || 1) - (a.level || 1);
      if (sortBy === 'name') {
        const nameA = `${a.name} ${a.lastName}`.trim().toLowerCase();
        const nameB = `${b.name} ${b.lastName}`.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      }
      return 0;
    });
  }, [realUsers, filterMode, searchTerm, sortBy, currentUser.church]);

  const handleOpenUserProfile = (targetUserId: string) => {
    if (targetUserId === currentUser.id) {
      setSelectedUserId(null);
    } else {
      setSelectedUserId(targetUserId);
    }
    setActiveTab('perfil');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* 1. Header Principal de PERFILES */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-600/25 via-slate-900 to-slate-950 border-2 border-amber-500/40 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-slate-950 shadow-md">
                <Users className="h-4 w-4 stroke-[2.5]" />
              </span>
              <span className="text-xs font-black tracking-widest uppercase text-amber-400">
                COMUNIDAD Y CUENTAS REGISTRADAS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight">
              PERFILES
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Explora y consulta los perfiles reales de los jóvenes que forman parte de A Prueba de Fuego. Descubre a tus hermanos de iglesia, consulta su ficha y accede a su contenido público o respeta su privacidad.
            </p>
          </div>

          {/* Estadísticas en tiempo real */}
          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 bg-slate-950/70 p-3 sm:p-3.5 rounded-2xl border border-amber-500/30">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Registrados</span>
              <span className="text-xl font-black text-white tabular-nums flex items-center justify-end gap-1">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                {realUsers.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {publicCount} públicos
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                {privateCount} privados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Barra de Búsqueda y Filtros Rápidos */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-4 space-y-3 shadow-md">
        
        {/* Buscador de personas por nombre o datos */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, apellido, @usuario, iglesia o ciudad..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Pestañas de Filtro y Ordenamiento */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterMode === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Todos ({realUsers.length})
            </button>
            <button
              onClick={() => setFilterMode('public')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                filterMode === 'public'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Públicos ({publicCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('private')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                filterMode === 'private'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privados ({privateCount})</span>
            </button>
            {currentUser.church && (
              <button
                onClick={() => setFilterMode('church')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  filterMode === 'church'
                    ? 'bg-blue-600 text-white shadow-md font-extrabold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Church className="w-3.5 h-3.5 text-blue-400" />
                <span>Mi Iglesia ({churchCount})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400">
            <span className="text-[11px]">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="points">Puntuación 🔥</option>
              <option value="level">Nivel 🌟</option>
              <option value="name">Alfabético A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Grid de Perfiles Registrados */}
      {filteredUsers.length === 0 ? (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">No se encontraron perfiles</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No hay ningún perfil que coincida con los criterios de búsqueda o filtro seleccionados.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterMode('all');
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
          >
            Restablecer búsqueda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const isSelf = user.id === currentUser.id;
            const isPublic = user.privacy?.isProfilePublic !== false;
            const isFollowing = (currentUser.followingIds || []).includes(user.id);

            // Conteo de publicaciones e historias si es público
            const userPostsCount = posts.filter(p => p.authorId === user.id).length;
            const userStoriesCount = stories.filter(s => {
              if (s.authorId !== user.id) return false;
              if (!s.expiresAt) return true;
              const exp = new Date(s.expiresAt).getTime();
              return isNaN(exp) || exp > Date.now();
            }).length;

            return (
              <div
                key={user.id}
                className={`rounded-3xl p-5 border flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-xl relative overflow-hidden group ${
                  isSelf
                    ? 'bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-950 border-blue-500/40'
                    : isPublic
                    ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/40'
                    : 'bg-slate-900/60 border-slate-800/80'
                }`}
              >
                {/* Indicador superior de privacidad / cuenta propia */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isPublic ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
                        <Eye className="w-3 h-3 text-emerald-400" />
                        <span>Público</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>Privado</span>
                      </span>
                    )}

                    {isSelf && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-black uppercase">
                        Tu Cuenta
                      </span>
                    )}
                  </div>

                  {/* Nivel y Puntuación */}
                  <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-300 tabular-nums">
                    <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                    <span>{user.points?.toLocaleString() || 0} pts</span>
                  </div>
                </div>

                {/* Identidad: Avatar, Nombre y Username */}
                <div className="flex items-start gap-3.5 mb-3">
                  <div className="relative shrink-0">
                    <UserAvatar
                      avatar={user.avatar}
                      name={`${user.name} ${user.lastName}`}
                      size="lg"
                      isOfficial={user.isOfficialVerified || user.role === 'admin' || user.role === 'superadmin'}
                      showBadge={false}
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-slate-950 border border-amber-400 text-[9px] font-black text-amber-300">
                      Nv.{user.level || 1}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-extrabold text-white truncate group-hover:text-amber-400 transition-colors">
                        {user.name} {user.lastName}
                      </h3>
                      {(user.isOfficialVerified || user.role === 'admin' || user.role === 'superadmin') && (
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[8px] font-black shrink-0" title="Verificado Oficial">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">@{user.username}</p>

                    {user.church && (
                      <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-1 truncate">
                        <Church className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate">{user.church}</span>
                      </p>
                    )}
                    {user.city && (
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                        <span className="truncate">{user.city}{user.country ? `, ${user.country}` : ''}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Presentación / Biografía pública si existe */}
                <div className="mb-4">
                  {isPublic ? (
                    user.bio ? (
                      <p className="text-xs text-slate-300 line-clamp-2 italic bg-slate-950/50 p-2.5 rounded-xl border border-slate-850">
                        "{user.bio}"
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 italic p-2 rounded-xl bg-slate-950/30">
                        Joven cristiano adventista en A Prueba de Fuego.
                      </p>
                    )
                  ) : (
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Este perfil es privado. Las publicaciones y Estados están protegidos.</span>
                    </div>
                  )}
                </div>

                {/* Actividad pública si corresponde */}
                {isPublic && (
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-4 px-1">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-slate-500" />
                      <strong>{userPostsCount}</strong> publicaciones
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-amber-500" />
                      <strong>{userStoriesCount}</strong> estados activos
                    </span>
                  </div>
                )}

                {/* Botón de Entrada al Perfil */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleOpenUserProfile(user.id)}
                    className={`w-full py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 ${
                      isSelf
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
                        : isPublic
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <span>
                      {isSelf 
                        ? 'Abrir Mi Perfil' 
                        : isPublic 
                        ? 'Abrir Perfil Completo' 
                        : 'Consultar Ficha (🔒 Privado)'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {!isSelf && (
                    <button
                      type="button"
                      onClick={() => followUser(user.id)}
                      className={`w-full py-1.5 rounded-xl text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 ${
                        isFollowing
                          ? 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-3 h-3 text-emerald-400" />
                          <span>Siguiendo</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3 text-amber-400" />
                          <span>Seguir Usuario</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 4. Pie informativo de protección de datos */}
      <div className="rounded-3xl bg-slate-900/50 border border-slate-800/80 p-4 text-center">
        <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl mx-auto flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
          <span>
            <strong>Privacidad y Seguridad Garantizada:</strong> Los perfiles privados no exponen publicaciones, Estados espirituales ni registros personales a otros usuarios. Cada miembro tiene el control total de su visibilidad desde su propia configuración.
          </span>
        </p>
      </div>

    </div>
  );
};
