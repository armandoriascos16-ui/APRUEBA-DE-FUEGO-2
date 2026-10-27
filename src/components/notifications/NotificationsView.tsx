import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';
import { 
  Bell, 
  CheckCheck, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Flame, 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  Trash2, 
  Check, 
  ChevronRight,
  Filter
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { 
    notifications, 
    markAllNotificationsRead, 
    markNotificationRead, 
    deleteNotification,
    handleNotificationClick,
    unreadNotificationsCount 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'todas' | 'unread' | 'interacciones' | 'seguidores'>('todas');

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'unread') {
      return !notif.read;
    }
    if (activeFilter === 'interacciones') {
      return notif.type === 'reaction' || notif.type === 'comment' || notif.type === 'prayer';
    }
    if (activeFilter === 'seguidores') {
      return notif.type === 'follow';
    }
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'challenge_approved':
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case 'reaction':
        return <Heart className="h-4 w-4 text-rose-400" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-sky-400" />;
      case 'follow':
        return <UserPlus className="h-4 w-4 text-amber-400" />;
      case 'prayer':
        return <span className="text-sm">🙏</span>;
      case 'event':
        return <Calendar className="h-4 w-4 text-amber-400" />;
      case 'badge_earned':
        return <Sparkles className="h-4 w-4 text-yellow-400" />;
      default:
        return <Flame className="h-4 w-4 text-orange-400" />;
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return 'Justo ahora';
      if (diffMin < 60) return `Hace ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `Hace ${diffHours} h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `Hace ${diffDays} d`;
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white font-heading tracking-tight flex items-center gap-2">
              Avisos y Notificaciones
              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-black bg-amber-500 text-slate-950 rounded-full">
                  {unreadNotificationsCount} nueva{unreadNotificationsCount > 1 ? 's' : ''}
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400">
              Mantente al tanto de interacciones, seguidores y actividades comunitarias
            </p>
          </div>
        </div>

        {/* Action Button: Marcar todas como leídas */}
        <button
          onClick={markAllNotificationsRead}
          disabled={unreadNotificationsCount === 0}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            unreadNotificationsCount > 0
              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 active:scale-95'
              : 'bg-slate-900 border border-slate-800 text-slate-400 opacity-60 cursor-not-allowed'
          }`}
          title="Marcar todas las notificaciones como leídas"
        >
          <CheckCheck className="h-4 w-4" />
          <span>Marcar todas como leídas</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
        <button
          onClick={() => setActiveFilter('todas')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeFilter === 'todas'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Todas ({notifications.length})
        </button>

        <button
          onClick={() => setActiveFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'unread'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <span>No leídas</span>
          {unreadNotificationsCount > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              activeFilter === 'unread' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveFilter('interacciones')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeFilter === 'interacciones'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Interacciones
        </button>

        <button
          onClick={() => setActiveFilter('seguidores')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 ${
            activeFilter === 'seguidores'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
          }`}
        >
          Seguidores
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-3">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">
              {activeFilter === 'unread' ? 'No tienes avisos sin leer' : 'No tienes notificaciones en esta categoría'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              {activeFilter === 'unread' 
                ? '¡Estás al día con todas tus interacciones y mensajes!'
                : 'Cuando otros jóvenes reaccionen, comenten o te sigan, verás sus avisos aquí.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = !notif.read;
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`group relative p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border ${
                  isUnread
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-lg shadow-amber-500/5 hover:border-amber-500/60'
                    : 'bg-slate-950/70 border-slate-800/70 hover:bg-slate-900/50 hover:border-slate-700/80 opacity-85 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Left: Avatar or Type Icon */}
                  <div className="relative shrink-0">
                    {notif.actorAvatar ? (
                      <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-700">
                        <img 
                          src={notif.actorAvatar} 
                          alt={notif.actorName || 'Usuario'} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                        {getIcon(notif.type)}
                      </div>
                    )}

                    {/* Small badge overlay if actorAvatar is present */}
                    {notif.actorAvatar && (
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-slate-800">
                        {getIcon(notif.type)}
                      </div>
                    )}
                  </div>

                  {/* Center: Title & Message */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className={`text-xs font-bold truncate ${isUnread ? 'text-white' : 'text-slate-200'}`}>
                          {notif.title}
                        </h3>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-sm" title="No leída" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatTimestamp(notif.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>

                    {notif.pointsAwarded && (
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                        +{notif.pointsAwarded} PUNTOS ACREDITADOS
                      </span>
                    )}
                  </div>

                  {/* Right Actions: Mark as Read / Unread toggle & Delete */}
                  <div 
                    className="flex items-center gap-1 shrink-0 self-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => markNotificationRead(notif.id, !notif.read)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        notif.read
                          ? 'border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                      }`}
                      title={notif.read ? 'Marcar como no leída' : 'Marcar como leída'}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-colors"
                      title="Eliminar notificación"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-400 transition-colors hidden sm:block" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
