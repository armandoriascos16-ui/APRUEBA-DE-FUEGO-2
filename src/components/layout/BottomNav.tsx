import React from 'react';
import { useApp, TabType } from '../../context/AppContext';
import { 
  Home, 
  Compass, 
  Plus, 
  Bell, 
  User as UserIcon,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface BottomNavProps {
  onOpenCreate?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenCreate }) => {
  const { activeTab, setActiveTab, currentUser, notifications } = useApp();

  const unreadNotifs = notifications.filter(n => !n.read).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2 pb-safe">
        
        {/* 1. Inicio */}
        <button
          onClick={() => setActiveTab('inicio')}
          className={`relative flex min-h-[48px] min-w-[56px] flex-col items-center justify-center transition-all active:scale-90 ${
            activeTab === 'inicio'
              ? 'text-blue-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className={`h-5 w-5 transition-transform ${activeTab === 'inicio' ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px]'}`} />
          <span className="text-[10px] tracking-tight mt-1">Inicio</span>
          {activeTab === 'inicio' && (
            <div className="absolute bottom-1 h-0.5 w-5 rounded-full bg-blue-500" />
          )}
        </button>

        {/* 2. Explorar */}
        <button
          onClick={() => setActiveTab('descubrir')}
          className={`relative flex min-h-[48px] min-w-[56px] flex-col items-center justify-center transition-all active:scale-90 ${
            activeTab === 'descubrir'
              ? 'text-blue-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className={`h-5 w-5 transition-transform ${activeTab === 'descubrir' ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px]'}`} />
          <span className="text-[10px] tracking-tight mt-1">Explorar</span>
          {activeTab === 'descubrir' && (
            <div className="absolute bottom-1 h-0.5 w-5 rounded-full bg-blue-500" />
          )}
        </button>

        {/* 3. Center Standout Plus Button (+) */}
        <div className="relative -top-3.5 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenCreate}
            className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-white shadow-lg shadow-blue-500/35 ring-4 ring-slate-950 hover:scale-105 active:scale-95 transition-all transform group"
            title="Crear contenido"
          >
            <Plus className="h-6 w-6 stroke-[3] group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* 4. Notificaciones */}
        <button
          onClick={() => setActiveTab('notificaciones')}
          className={`relative flex min-h-[48px] min-w-[56px] flex-col items-center justify-center transition-all active:scale-90 ${
            activeTab === 'notificaciones'
              ? 'text-blue-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Bell className={`h-5 w-5 transition-transform ${activeTab === 'notificaciones' ? 'stroke-[2.5px] scale-110' : 'stroke-[1.8px]'}`} />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-slate-950 animate-pulse">
                {unreadNotifs}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Avisos</span>
          {activeTab === 'notificaciones' && (
            <div className="absolute bottom-1 h-0.5 w-5 rounded-full bg-blue-500" />
          )}
        </button>

        {/* 5. Perfil */}
        <button
          onClick={() => setActiveTab('perfil')}
          className={`relative flex min-h-[48px] min-w-[56px] flex-col items-center justify-center transition-all active:scale-90 ${
            activeTab === 'perfil'
              ? 'text-blue-500 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`rounded-full p-0.5 ${activeTab === 'perfil' ? 'ring-2 ring-blue-500' : 'ring-1 ring-slate-700'}`}>
            <UserAvatar
              avatar={currentUser.avatar}
              name={currentUser.name}
              size="xs"
              showBadge={false}
            />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Perfil</span>
          {activeTab === 'perfil' && (
            <div className="absolute bottom-1 h-0.5 w-5 rounded-full bg-blue-500" />
          )}
        </button>

      </div>
    </nav>
  );
};
