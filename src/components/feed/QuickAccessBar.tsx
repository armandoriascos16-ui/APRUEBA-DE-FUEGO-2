import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp, TabType } from '../../context/AppContext';
import { 
  MessageCircle, 
  HeartHandshake, 
  Gamepad2, 
  Tv, 
  Trophy, 
  Church as ChurchIcon,
  ShieldCheck, 
  Building2, 
  Film, 
  Lightbulb, 
  BookOpen, 
  MapPin, 
  Users, 
  Radio, 
  Newspaper, 
  Music,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Rows3,
  Sparkles
} from 'lucide-react';

interface Shortcut {
  tab: TabType;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  badge?: number;
  isLive?: boolean;
}

export const QuickAccessBar: React.FC = () => {
  const { setActiveTab, currentUser, conversations } = useApp();
  const unreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // View mode: 'carousel' (Acceso rápido horizontal) or 'grid' (Cuadrícula adaptable)
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>(() => {
    return (localStorage.getItem('apdf_tools_view_mode') as 'carousel' | 'grid') || 'carousel';
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const shortcuts: Shortcut[] = [
    { 
      tab: 'ia_studio', 
      title: 'IA Cristiana', 
      subtitle: 'Música, Video, 3D & Voz', 
      icon: Sparkles, 
      color: 'from-purple-600 via-pink-600 to-amber-500' 
    },
    { 
      tab: 'comunidad_juvenil', 
      title: 'Comunidad JA', 
      subtitle: 'Juventud Cristiana', 
      icon: Users, 
      color: 'from-amber-500 via-orange-600 to-red-600' 
    },
    { 
      tab: 'tv', 
      title: 'TV en Vivo', 
      subtitle: 'Hope & 3ABN', 
      icon: Tv, 
      color: 'from-blue-600 via-indigo-600 to-cyan-600',
      isLive: true
    },
    { 
      tab: 'en_vivo', 
      title: 'En Vivo', 
      subtitle: 'Radio & Cultos', 
      icon: Radio, 
      color: 'from-red-600 via-rose-600 to-orange-600',
      isLive: true
    },
    { 
      tab: 'noticias', 
      title: 'Noticias IASD', 
      subtitle: 'DIA & Colombia', 
      icon: Newspaper, 
      color: 'from-emerald-600 to-teal-600' 
    },
    { 
      tab: 'libros', 
      title: 'Libros JA', 
      subtitle: 'EGW & Devocionales', 
      icon: BookOpen, 
      color: 'from-indigo-600 to-blue-600' 
    },
    { 
      tab: 'himnario', 
      title: 'Himnario', 
      subtitle: 'Letras & Edición IADPA', 
      icon: Music, 
      color: 'from-amber-500 to-yellow-600' 
    },
    { 
      tab: 'comunidades', 
      title: 'Comunidades', 
      subtitle: '6 Ministerios JA', 
      icon: Users, 
      color: 'from-purple-600 to-pink-600' 
    },
    { 
      tab: 'eventos', 
      title: 'Buenaventura', 
      subtitle: 'Radar de Eventos', 
      icon: MapPin, 
      color: 'from-amber-500 to-orange-600' 
    },
    { 
      tab: 'cine', 
      title: 'Cine Cristiano', 
      subtitle: 'Películas Adventistas', 
      icon: Film, 
      color: 'from-rose-600 to-red-600' 
    },
    { 
      tab: 'actividades', 
      title: 'Ideas JA', 
      subtitle: 'Dinámicas & Fondos', 
      icon: Lightbulb, 
      color: 'from-amber-600 to-yellow-600' 
    },
    { 
      tab: 'materiales', 
      title: 'Materiales', 
      subtitle: 'Himnarios & Guías', 
      icon: BookOpen, 
      color: 'from-blue-600 to-cyan-600' 
    },
    { 
      tab: 'chat', 
      title: 'Chat JA', 
      subtitle: 'Grupos y Directos', 
      icon: MessageCircle, 
      color: 'from-cyan-600 to-blue-600',
      badge: unreadMessages > 0 ? unreadMessages : undefined 
    },
    { 
      tab: 'oracion', 
      title: 'Oración', 
      subtitle: 'Muro de Clamor', 
      icon: HeartHandshake, 
      color: 'from-purple-600 to-pink-600' 
    },
    { 
      tab: 'juegos', 
      title: 'Juegos', 
      subtitle: 'Trivia & Puntos', 
      icon: Gamepad2, 
      color: 'from-orange-500 to-amber-600' 
    },
    { 
      tab: 'ranking', 
      title: 'Ranking', 
      subtitle: 'Top Jóvenes', 
      icon: Trophy, 
      color: 'from-yellow-500 to-amber-600' 
    },
    { 
      tab: 'canales', 
      title: 'Canales', 
      subtitle: 'Música & Estudio', 
      icon: Tv, 
      color: 'from-red-600 to-rose-600' 
    },
    { 
      tab: 'oficial', 
      title: 'Oficial IASD', 
      subtitle: 'Fuentes & Noticias', 
      icon: ChurchIcon, 
      color: 'from-emerald-600 to-teal-600' 
    },
    { 
      tab: 'iglesias', 
      title: 'Distritos', 
      subtitle: 'Buenaventura (5)', 
      icon: Building2, 
      color: 'from-blue-600 to-indigo-600' 
    },
  ];

  const isAdmin = currentUser.role === 'superadmin' || 
    currentUser.role === 'admin' || 
    currentUser.email === 'harmonymusis@gmail.com' || 
    currentUser.email === 'harmonyestampadosr@gmail.com';

  // Check scroll position to update arrow disabled/visible state
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, viewMode]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Scroll by roughly 2.5 cards (card ~110px + gap 10px = 120px) -> 280px
    const scrollAmount = Math.max(el.clientWidth * 0.65, 240);
    const targetScroll = direction === 'left' 
      ? el.scrollLeft - scrollAmount 
      : el.scrollLeft + scrollAmount;

    el.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleScroll('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleScroll('right');
    }
  };

  // Mouse drag-to-scroll support for desktop users
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    setDragStartX(e.pageX - el.offsetLeft);
    setDragScrollLeft(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const el = scrollContainerRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    el.scrollLeft = dragScrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const toggleViewMode = (mode: 'carousel' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('apdf_tools_view_mode', mode);
  };

  const totalToolsCount = shortcuts.length + (isAdmin ? 1 : 0);

  return (
    <div className="w-full py-1">
      {/* Header with Title and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Comunidad & Herramientas
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
            {totalToolsCount}
          </span>
        </div>

        {/* View Mode Toggle and Carousel Arrows */}
        <div className="flex items-center gap-1.5">
          {/* Mode switch buttons */}
          <div className="flex items-center rounded-xl bg-slate-950 p-0.5 border border-slate-800">
            <button
              onClick={() => toggleViewMode('carousel')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                viewMode === 'carousel'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ver en fila horizontal (Acceso rápido)"
              aria-label="Modo carrusel horizontal"
            >
              <Rows3 className="h-3 w-3" />
              <span className="hidden xs:inline">Fila</span>
            </button>

            <button
              onClick={() => toggleViewMode('grid')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Ver todas en cuadrícula adaptable"
              aria-label="Modo cuadrícula adaptable"
            >
              <LayoutGrid className="h-3 w-3" />
              <span className="hidden xs:inline">Cuadrícula</span>
            </button>
          </div>

          {/* Carousel Scroll Arrows (in header) */}
          {viewMode === 'carousel' && (
            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                disabled={!canScrollLeft}
                aria-label="Desplazar carrusel hacia herramientas anteriores"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 hover:bg-slate-750 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shadow-sm"
                title="Retroceder herramientas"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => handleScroll('right')}
                disabled={!canScrollRight}
                aria-label="Desplazar carrusel hacia herramientas siguientes"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 hover:bg-slate-750 disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 shadow-sm"
                title="Avanzar herramientas"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: ACCESO RÁPIDO (CARRUSEL HORIZONTAL CON FLECHAS) */}
      {viewMode === 'carousel' && (
        <div className="relative group/carousel">
          {/* Floating Left Arrow (Visible on hover or when scrollable) */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-1 z-20 flex items-center pr-2 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent pointer-events-none rounded-l-2xl">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                aria-label="Desplazar a herramientas anteriores"
                className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/95 border border-amber-500/50 text-amber-300 hover:bg-amber-500 hover:text-slate-950 shadow-xl transition-all active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                title="Herramientas anteriores"
              >
                <ChevronLeft className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Floating Right Arrow (Visible on hover or when scrollable) */}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-1 z-20 flex items-center pl-2 bg-gradient-to-l from-slate-900 via-slate-900/80 to-transparent pointer-events-none rounded-r-2xl">
              <button
                type="button"
                onClick={() => handleScroll('right')}
                aria-label="Desplazar a herramientas siguientes"
                className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/95 border border-amber-500/50 text-amber-300 hover:bg-amber-500 hover:text-slate-950 shadow-xl transition-all active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                title="Más herramientas"
              >
                <ChevronRight className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Scrollable Horizontal Track */}
          <div
            ref={scrollContainerRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            aria-label="Fila horizontal de acceso rápido. Usa flechas del teclado o botones para navegar."
            className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1.5 pt-0.5 px-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-500/50 rounded-2xl scroll-smooth select-none cursor-grab active:cursor-grabbing"
          >
            {shortcuts.map((sc) => {
              const Icon = sc.icon;
              return (
                <button
                  key={sc.tab}
                  type="button"
                  onClick={() => setActiveTab(sc.tab)}
                  className="group relative flex min-w-[108px] max-w-[115px] flex-col items-center rounded-2xl bg-slate-900/90 p-2.5 text-center border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all shrink-0 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shadow-sm"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${sc.color} text-white shadow-sm mb-1.5 group-hover:scale-105 transition-transform shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors truncate max-w-full block leading-tight">
                    {sc.title}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-full block mt-0.5 leading-tight">
                    {sc.subtitle}
                  </span>

                  {sc.badge && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white shadow-sm">
                      {sc.badge}
                    </span>
                  )}
                  {sc.isLive && (
                    <span className="absolute top-1.5 left-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900 animate-pulse" />
                  )}
                </button>
              );
            })}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="group relative flex min-w-[108px] max-w-[115px] flex-col items-center rounded-2xl bg-amber-500/10 p-2.5 text-center border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/20 transition-all shrink-0 active:scale-95 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-sm mb-1.5">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-amber-300 truncate max-w-full block">
                  Admin
                </span>
                <span className="text-[10px] text-amber-400/80 truncate max-w-full block mt-0.5">
                  Panel Control
                </span>
              </button>
            )}
          </div>

          {/* Quick toggle to grid footer link */}
          <div className="mt-1 flex justify-center">
            <button
              onClick={() => toggleViewMode('grid')}
              className="text-[11px] text-slate-400 hover:text-amber-400 font-semibold flex items-center gap-1 transition-colors py-1 px-2 rounded-lg hover:bg-slate-900"
            >
              <LayoutGrid className="h-3 w-3 text-amber-500" />
              <span>Ver todas las {totalToolsCount} herramientas en cuadrícula adaptable ↓</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CUADRÍCULA ADAPTABLE (RESPONSIVE GRID) */}
      {viewMode === 'grid' && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5 pt-1">
            {shortcuts.map((sc) => {
              const Icon = sc.icon;
              return (
                <button
                  key={sc.tab}
                  type="button"
                  onClick={() => setActiveTab(sc.tab)}
                  className="group relative flex flex-col items-center justify-center rounded-2xl bg-slate-900/90 p-3 text-center border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shadow-sm"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${sc.color} text-white shadow-sm mb-2 group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-100 group-hover:text-amber-400 transition-colors truncate max-w-full block leading-tight">
                    {sc.title}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-full block mt-0.5 leading-tight">
                    {sc.subtitle}
                  </span>

                  {sc.badge && (
                    <span className="absolute top-2 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white shadow-sm">
                      {sc.badge}
                    </span>
                  )}
                  {sc.isLive && (
                    <span className="absolute top-2 left-2 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-900 animate-pulse" />
                  )}
                </button>
              );
            })}

            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="group relative flex flex-col items-center justify-center rounded-2xl bg-amber-500/10 p-3 text-center border border-amber-500/30 hover:border-amber-500/60 hover:bg-amber-500/20 transition-all active:scale-[0.97] shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-sm mb-2">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-amber-300 truncate max-w-full block leading-tight">
                  Admin
                </span>
                <span className="text-[10px] text-amber-400/80 truncate max-w-full block mt-0.5 leading-tight">
                  Panel Control
                </span>
              </button>
            )}
          </div>

          <div className="mt-2 flex justify-center">
            <button
              onClick={() => toggleViewMode('carousel')}
              className="text-[11px] text-slate-400 hover:text-amber-400 font-semibold flex items-center gap-1 transition-colors py-1 px-2 rounded-lg hover:bg-slate-900"
            >
              <Rows3 className="h-3 w-3 text-amber-500" />
              <span>Volver a fila horizontal desplazable (Acceso rápido) →</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
