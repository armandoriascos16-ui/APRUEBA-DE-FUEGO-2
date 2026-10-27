import React from 'react';
import { 
  X, 
  MapPin, 
  Building2, 
  Trophy, 
  Flame, 
  Award, 
  MessageSquare, 
  ExternalLink,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, Post } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

interface UserProfileDetailModalProps {
  userId: string;
  userName?: string;
  userAvatar?: string;
  userChurch?: string;
  userDistrict?: string;
  onClose: () => void;
  onNavigateToFullProfile?: (userId: string) => void;
}

export const UserProfileDetailModal: React.FC<UserProfileDetailModalProps> = ({
  userId,
  userName = 'Joven Adventista',
  userAvatar = '',
  userChurch,
  userDistrict,
  onClose,
  onNavigateToFullProfile
}) => {
  const { allUsers, posts, setSelectedUserId, setActiveTab } = useApp();

  const user: User | undefined = allUsers.find(u => u.id === userId);
  const userPosts: Post[] = posts.filter(p => p.authorId === userId);

  const displayName = user ? `${user.name} ${user.lastName || ''}`.trim() : userName;
  const avatarUrl = user?.avatar || userAvatar;
  const churchName = user?.church || userChurch || 'Iglesia Adventista';
  const districtName = user?.district || userDistrict || 'Zona Buenaventura';
  const bio = user?.bio || 'Miembro activo de la juventud adventista, comprometido con la fe y el servicio.';
  const points = user?.points ?? 120;
  const level = user?.level ?? 1;

  const handleOpenFull = () => {
    setSelectedUserId(userId);
    setActiveTab('perfil');
    onClose();
    if (onNavigateToFullProfile) {
      onNavigateToFullProfile(userId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Perfil de Usuario · A Prueba de Fuego
            </h3>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Card Banner */}
        <div className="relative rounded-2xl bg-gradient-to-br from-amber-500/15 via-slate-950 to-slate-950 border border-amber-500/30 p-4 space-y-3">
          <div className="flex items-start gap-3.5">
            <UserAvatar
              avatar={avatarUrl}
              name={displayName}
              size="xl"
              showBadge={false}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-black text-white truncate">{displayName}</h4>
                {(user?.role === 'admin' || (user as any)?.isOfficial) && (
                  <span className="px-2 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold">
                    Oficial
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-400 font-semibold mt-0.5">
                @{user?.username || userName.toLowerCase().replace(/\s+/g, '_')}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-slate-300">
                  <Building2 className="h-3.5 w-3.5 text-blue-400" />
                  <span>{churchName}</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-amber-400" />
                  <span>{districtName}</span>
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            «{bio}»
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Puntos</span>
              <span className="text-sm font-black text-amber-400 flex items-center justify-center gap-1">
                <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{points.toLocaleString()}</span>
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Nivel JA</span>
              <span className="text-sm font-black text-white">Nv. {level}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Publicaciones</span>
              <span className="text-sm font-black text-blue-400">{userPosts.length}</span>
            </div>
          </div>
        </div>

        {/* Badges / Insignias if present */}
        {user?.badges && user.badges.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Insignias Desbloqueadas ({user.badges.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {user.badges.map(b => (
                <div 
                  key={b.id} 
                  className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-xs text-slate-200 shadow-sm"
                  title={b.description}
                >
                  <span>{b.icon}</span>
                  <span className="text-[11px] font-semibold">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Publicaciones autorizadas del usuario */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Publicaciones en A Prueba de Fuego:
          </span>

          {userPosts.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {userPosts.map(post => (
                <div key={post.id} className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-amber-400 font-semibold">{post.createdAt}</span>
                    {post.bibleVerse && <span className="italic">📖 {post.bibleVerse}</span>}
                  </div>
                  <p className="text-slate-200 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center rounded-2xl bg-slate-950 border border-slate-850 text-slate-400 text-xs">
              Este usuario aún no tiene publicaciones públicas compartidas.
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs transition-colors"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleOpenFull}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <span>Ver Ficha Completa</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
