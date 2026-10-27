import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Trophy, 
  Flame, 
  Crown, 
  Medal, 
  Church, 
  MapPin, 
  UserPlus, 
  UserCheck 
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export const LeaderboardView: React.FC = () => {
  const { allUsers, currentUser, followUser, setSelectedUserId, setActiveTab } = useApp();
  const [filterScope, setFilterScope] = useState<'church' | 'district' | 'city' | 'country' | 'global'>('church');

  // Only verified genuine accounts appear in the public spiritual ranking
  const filteredUsers = [...allUsers]
    .filter(u => 
      !u.isDemo && 
      u.emailVerified === true &&
      !['user_david', 'user_sarah', 'user_mateo', 'user_valeria', 'user_samuel', 'user_camila', 'user_elena', 'user_david_bvt'].includes(u.id) &&
      !u.email?.endsWith('@ejemplo.com')
    )
    .filter(u => {
      if (filterScope === 'church') return u.church === currentUser.church;
      if (filterScope === 'district') return u.district === currentUser.district;
      if (filterScope === 'city') return u.city === currentUser.city;
      if (filterScope === 'country') return u.country === currentUser.country;
      return true; // global
    })
    .sort((a, b) => b.points - a.points);

  const topThree = filteredUsers.slice(0, 3);
  const remainingUsers = filteredUsers.slice(3);

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 py-4">
      
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold mb-2">
          <Trophy className="h-4 w-4" />
          <span>TABLA DE PUNTUACIONES & GUERREROS ESPIRITUALES</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white font-heading">
          Ranking de Jóvenes Cristianos
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md mx-auto">
          Inspirándonos unos a otros a las buenas obras, al servicio y a la proclamación de la verdad.
        </p>
      </div>

      {/* Scope Selector Tabs */}
      <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 mb-6 overflow-x-auto no-scrollbar">
        {[
          { id: 'church', label: `Mi Iglesia (${currentUser.church.split(' ')[2] || 'Local'})` },
          { id: 'district', label: `Distrito (${currentUser.district})` },
          { id: 'city', label: `Ciudad (${currentUser.city})` },
          { id: 'country', label: `País (${currentUser.country})` },
          { id: 'global', label: 'Global' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterScope(tab.id as any)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all shrink-0 whitespace-nowrap ${
              filterScope === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium (Visual Showcase) */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end mb-8 pt-4">
          
          {/* Rank 2 (Silver) */}
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <UserAvatar
                  avatar={topThree[1].avatar}
                  name={topThree[1].name}
                  size="lg"
                  isOfficial={topThree[1].isOfficialVerified}
                  showBadge={false}
                />
                <div className="absolute -bottom-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-slate-950 font-black text-xs shadow-md">
                  2
                </div>
              </div>
              <p className="text-xs font-bold text-white truncate max-w-[90px] sm:max-w-none text-center">
                {topThree[1].name}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-black text-amber-400 tabular-nums">
                <Flame className="h-3 w-3 fill-amber-400" />
                <span>{topThree[1].points.toLocaleString()}</span>
              </div>
              <div className="w-full h-16 sm:h-20 bg-gradient-to-t from-slate-800 to-slate-850 rounded-t-2xl mt-2 border-t-2 border-slate-400 flex items-center justify-center">
                <Medal className="h-5 w-5 text-slate-300" />
              </div>
            </div>
          )}

          {/* Rank 1 (Gold - Taller Podium) */}
          {topThree[0] && (
            <div className="flex flex-col items-center">
              <Crown className="h-6 w-6 text-yellow-400 animate-bounce mb-1" />
              <div className="relative mb-2">
                <UserAvatar
                  avatar={topThree[0].avatar}
                  name={topThree[0].name}
                  size="xl"
                  isOfficial={topThree[0].isOfficialVerified}
                  showBadge={false}
                />
                <div className="absolute -bottom-2 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-slate-950 font-black text-xs shadow-md">
                  1
                </div>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[100px] sm:max-w-none text-center">
                {topThree[0].name}
              </p>
              <div className="flex items-center gap-1 text-xs font-black text-amber-300 tabular-nums">
                <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{topThree[0].points.toLocaleString()}</span>
              </div>
              <div className="w-full h-24 sm:h-28 bg-gradient-to-t from-amber-600/30 to-yellow-500/20 rounded-t-2xl mt-2 border-t-4 border-yellow-400 flex items-center justify-center">
                <Trophy className="h-7 w-7 text-yellow-400" />
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <UserAvatar
                  avatar={topThree[2].avatar}
                  name={topThree[2].name}
                  size="lg"
                  isOfficial={topThree[2].isOfficialVerified}
                  showBadge={false}
                />
                <div className="absolute -bottom-2 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700 text-white font-black text-xs shadow-md">
                  3
                </div>
              </div>
              <p className="text-xs font-bold text-white truncate max-w-[90px] sm:max-w-none text-center">
                {topThree[2].name}
              </p>
              <div className="flex items-center gap-1 text-[11px] font-black text-amber-400 tabular-nums">
                <Flame className="h-3 w-3 fill-amber-400" />
                <span>{topThree[2].points.toLocaleString()}</span>
              </div>
              <div className="w-full h-12 sm:h-14 bg-gradient-to-t from-slate-800 to-slate-850 rounded-t-2xl mt-2 border-t-2 border-amber-700 flex items-center justify-center">
                <Medal className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          )}

        </div>
      )}

      {/* Remaining Leaderboard Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 overflow-hidden shadow-lg">
        {filteredUsers.map((user, index) => {
          const isCurrentUser = user.id === currentUser.id;
          const isFollowing = currentUser.followingIds.includes(user.id);

          return (
            <div
              key={user.id}
              className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                isCurrentUser ? 'bg-amber-500/15 border-l-4 border-amber-500' : 'hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 text-center text-xs font-black text-slate-400 tabular-nums">
                  #{index + 1}
                </span>

                <button
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setActiveTab('perfil');
                  }}
                  className="flex items-center gap-2.5 text-left focus:outline-none"
                >
                  <UserAvatar
                    avatar={user.avatar}
                    name={`${user.name} ${user.lastName}`}
                    size="sm"
                    isOfficial={user.isOfficialVerified}
                    showBadge={false}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {user.name} {user.lastName}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
                          TÚ
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user.church} · Nivel {user.level} ({user.levelName})
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tabular-nums">
                  <Flame className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
                  <span>{user.points.toLocaleString()} pts</span>
                </div>

                {!isCurrentUser && (
                  <button
                    onClick={() => followUser(user.id)}
                    className={`hidden sm:flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      isFollowing
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-amber-500 text-slate-950 font-bold hover:bg-amber-400'
                    }`}
                  >
                    {isFollowing ? 'Siguiendo' : '+ Seguir'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
