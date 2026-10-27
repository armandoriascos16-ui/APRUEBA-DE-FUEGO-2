import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Flame, 
  Heart, 
  Calendar, 
  CheckCircle2, 
  Sparkles,
  MessageCircle,
  UserPlus,
  Trash2,
  Check
} from 'lucide-react';

interface NotificationsDrawerProps {
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ onClose }) => {
  const { 
    notifications, 
    markAllNotificationsRead, 
    markNotificationRead,
    deleteNotification,
    handleNotificationClick,
    unreadNotificationsCount 
  } = useApp();

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
      if (diffMin < 60) return `${diffMin}m`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white font-heading">Notificaciones</h2>
            {unreadNotificationsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
                {unreadNotificationsCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              disabled={unreadNotificationsCount === 0}
              className={`text-[11px] font-semibold transition-colors ${
                unreadNotificationsCount > 0 
                  ? 'text-amber-400 hover:underline cursor-pointer' 
                  : 'text-slate-400 opacity-60 cursor-not-allowed'
              }`}
            >
              Marcar leídas
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No tienes notificaciones en este momento.
            </div>
          ) : (
            notifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    handleNotificationClick(notif);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl mb-1.5 transition-all cursor-pointer border ${
                    isUnread 
                      ? 'bg-slate-950 border-amber-500/40 shadow-sm' 
                      : 'bg-slate-900/40 border-slate-800/80 opacity-75 hover:opacity-100 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {/* Left: Avatar or Type Icon */}
                    {notif.actorAvatar ? (
                      <div className="h-8 w-8 rounded-xl overflow-hidden border border-slate-700 shrink-0">
                        <img 
                          src={notif.actorAvatar} 
                          alt={notif.actorName || 'Usuario'} 
                          className="h-full w-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                        {getIcon(notif.type)}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className={`text-xs font-bold truncate ${isUnread ? 'text-white' : 'text-slate-200'}`}>
                            {notif.title}
                          </h3>
                          {isUnread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatTimestamp(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
                        {notif.message}
                      </p>
                      {notif.pointsAwarded && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                          +{notif.pointsAwarded} PUNTOS ACREDITADOS
                        </span>
                      )}
                    </div>

                    {/* Quick action buttons */}
                    <div 
                      className="flex items-center gap-1 shrink-0 self-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => markNotificationRead(notif.id, !notif.read)}
                        className={`p-1 rounded-md border text-[10px] transition-colors ${
                          notif.read 
                            ? 'border-slate-800 text-slate-400 hover:text-amber-400' 
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        }`}
                        title={notif.read ? 'Marcar como no leída' : 'Marcar como leída'}
                      >
                        <Check className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="p-1 rounded-md border border-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
