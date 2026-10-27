import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  BookOpen, 
  HeartHandshake, 
  Flame, 
  Calendar, 
  Music, 
  Sparkles, 
  WifiOff, 
  MessageSquare,
  Search,
  Bell
} from 'lucide-react';
import { ComunidadArea } from './types';
import { useApp } from '../../context/AppContext';
import { comunidadStorage } from './comunidadStorage';
import { ComunidadesDistritosTab } from './ComunidadesDistritosTab';
import { GruposMinisteriosTab } from './GruposMinisteriosTab';
import { EstudiosBiblicosTab } from './EstudiosBiblicosTab';
import { OracionTestimoniosTab } from './OracionTestimoniosTab';
import { RetosMisionerosTab } from './RetosMisionerosTab';
import { EventosEncuentrosTab } from './EventosEncuentrosTab';
import { TalentosMusicaTab } from './TalentosMusicaTab';
import { CrecimientoDevocionalTab } from './CrecimientoDevocionalTab';
import { RecursosOfflineTab } from './RecursosOfflineTab';
import { FeedComunidadTab } from './FeedComunidadTab';
import { ComunidadSearchModal } from './ComunidadSearchModal';
import { ComunidadNotificacionesModal } from './ComunidadNotificacionesModal';

export const ComunidadJuvenilView: React.FC = () => {
  const { currentUser } = useApp();
  const [activeArea, setActiveArea] = useState<ComunidadArea>('feed');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const updateUnread = () => {
      const notifs = comunidadStorage.getNotifications(currentUser.id);
      setUnreadCount(notifs.filter(n => !n.read).length);
    };
    updateUnread();
    const unsub = comunidadStorage.subscribe(updateUnread);
    return unsub;
  }, [currentUser.id]);

  const navigationItems: {
    id: ComunidadArea;
    label: string;
    shortLabel: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: 'feed', label: 'Muro Juvenil', shortLabel: 'Muro', icon: MessageSquare },
    { id: 'distritos', label: 'Comunidades por Distrito', shortLabel: '5 Distritos', icon: Building2 },
    { id: 'grupos', label: 'Grupos & Ministerios', shortLabel: 'Ministerios', icon: Users },
    { id: 'estudios', label: 'Estudios Bíblicos', shortLabel: 'Biblia', icon: BookOpen },
    { id: 'oracion', label: 'Oración & Testimonios', shortLabel: 'Oración', icon: HeartHandshake },
    { id: 'retos', label: 'Retos Misioneros', shortLabel: 'Retos JA', icon: Flame },
    { id: 'eventos', label: 'Eventos & Vigilias', shortLabel: 'Eventos', icon: Calendar },
    { id: 'talentos', label: 'Talentos & Música', shortLabel: 'Música', icon: Music },
    { id: 'devocional', label: 'Crecimiento Devocional', shortLabel: 'Devocional', icon: Sparkles },
    { id: 'offline', label: 'Recursos Sin Conexión', shortLabel: 'Offline', icon: WifiOff, badge: 'Offline' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      
      {/* Top Banner de la Comunidad Juvenil Cristiana */}
      <div className="relative rounded-3xl bg-gradient-to-br from-amber-600/20 via-slate-900 to-slate-950 border border-amber-500/30 p-5 sm:p-6 shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
            <span>MÓDULO INDEPENDIENTE · A PRUEBA DE FUEGO</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón de Búsqueda Global de Comunidad */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              title="Buscar en la comunidad"
            >
              <Search className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">Buscar</span>
            </button>

            {/* Botón de Notificaciones de Comunidad */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              title="Notificaciones de la comunidad"
            >
              <Bell className="h-4 w-4 text-amber-400" />
              <span className="hidden sm:inline">Avisos</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-black">
                  {unreadCount}
                </span>
              )}
            </button>

            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
              10 Áreas Activas
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-white font-heading tracking-tight">
          Comunidad Juvenil Cristiana
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
          Espacio sagrado para la juventud adventista: fortalece tu fe, comparte testimonios, únete a tu distrito, 
          aprende las Sagradas Escrituras y descarga materiales para la misión sin necesidad de internet.
        </p>
      </div>

      {/* Barra de Navegación de las 10 Áreas Funcionales */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        {navigationItems.map(item => {
          const Icon = item.icon;
          const isActive = activeArea === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveArea(item.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow-md'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-850'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-slate-950 text-amber-400' : 'bg-teal-500/20 text-teal-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Contenido Dinámico de la Sección Activa */}
      <main className="min-h-[400px]">
        {activeArea === 'feed' && <FeedComunidadTab />}
        {activeArea === 'distritos' && <ComunidadesDistritosTab />}
        {activeArea === 'grupos' && <GruposMinisteriosTab />}
        {activeArea === 'estudios' && <EstudiosBiblicosTab />}
        {activeArea === 'oracion' && <OracionTestimoniosTab />}
        {activeArea === 'retos' && <RetosMisionerosTab />}
        {activeArea === 'eventos' && <EventosEncuentrosTab />}
        {activeArea === 'talentos' && <TalentosMusicaTab />}
        {activeArea === 'devocional' && <CrecimientoDevocionalTab />}
        {activeArea === 'offline' && <RecursosOfflineTab />}
      </main>

      {/* Modales de Búsqueda y Notificaciones */}
      <ComunidadSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectArea={(area) => setActiveArea(area)}
      />

      <ComunidadNotificacionesModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToArea={(area) => setActiveArea(area)}
      />

    </div>
  );
};
