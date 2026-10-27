import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  X, 
  MessageSquare, 
  Users, 
  Calendar, 
  Flame, 
  Sparkles,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { comunidadStorage } from './comunidadStorage';
import { CommunityNotification, ComunidadArea } from './types';

interface ComunidadNotificacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToArea?: (area: ComunidadArea) => void;
}

export const ComunidadNotificacionesModal: React.FC<ComunidadNotificacionesModalProps> = ({
  isOpen,
  onClose,
  onNavigateToArea
}) => {
  const { currentUser } = useApp();
  const [notifications, setNotifications] = useState<CommunityNotification[]>(() =>
    comunidadStorage.getNotifications(currentUser.id)
  );

  useEffect(() => {
    if (!isOpen) return;
    const unsub = comunidadStorage.subscribe(() => {
      setNotifications(comunidadStorage.getNotifications(currentUser.id));
    });
    return unsub;
  }, [isOpen, currentUser.id]);

  if (!isOpen) return null;

  const handleMarkAsRead = (id: string) => {
    comunidadStorage.markNotificationAsRead(id);
  };

  const handleMarkAllRead = () => {
    comunidadStorage.markAllNotificationsAsRead(currentUser.id);
  };

  const getIconForType = (type: CommunityNotification['type']) => {
    switch (type) {
      case 'comentario': return <MessageSquare className="h-4 w-4 text-blue-400" />;
      case 'solicitud': return <Users className="h-4 w-4 text-emerald-400" />;
      case 'evento': return <Calendar className="h-4 w-4 text-cyan-400" />;
      case 'grupo': return <Users className="h-4 w-4 text-purple-400" />;
      case 'reto': return <Flame className="h-4 w-4 text-amber-400" />;
      case 'reaccion': return <Sparkles className="h-4 w-4 text-rose-400" />;
      default: return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="w-full max-w-lg max-h-[85vh] bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="h-5 w-5 text-amber-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-ping" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Notificaciones de la Comunidad</h3>
              <span className="text-[11px] text-slate-400">
                {unreadCount > 0 ? `${unreadCount} no leídas` : 'Todas al día'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center gap-1"
                title="Marcar todas como leídas"
              >
                <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Marcar leídas</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {notifications.map(notif => (
            <div
              key={notif.id}
              onClick={() => {
                handleMarkAsRead(notif.id);
                if (notif.targetArea && onNavigateToArea) {
                  onNavigateToArea(notif.targetArea);
                  onClose();
                }
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                notif.read
                  ? 'bg-slate-950/60 border-slate-850 hover:border-slate-800'
                  : 'bg-slate-900 border-amber-500/40 ring-1 ring-amber-500/20'
              }`}
            >
              <div className="h-8 w-8 rounded-xl bg-slate-850 flex items-center justify-center shrink-0 mt-0.5">
                {getIconForType(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white truncate">{notif.title}</h4>
                  <span className="text-[10px] text-slate-500 shrink-0">{notif.createdAt}</span>
                </div>
                <p className="text-xs text-slate-300 leading-snug mt-0.5">{notif.message}</p>
              </div>

              {!notif.read && (
                <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
              )}
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="p-8 text-center space-y-2">
              <Bell className="h-8 w-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">No tienes notificaciones en la comunidad</p>
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
