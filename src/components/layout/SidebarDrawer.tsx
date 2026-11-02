import React, { useEffect, useRef } from 'react';
import { useApp, TabType } from '../../context/AppContext';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { 
  X, 
  Flame, 
  ShieldCheck, 
  UserPlus, 
  Users, 
  User as UserIcon, 
  Gamepad2, 
  Radio, 
  Tv, 
  QrCode, 
  Newspaper, 
  Music, 
  BookOpen, 
  Lightbulb, 
  Film, 
  MapPin, 
  MessageCircle, 
  HeartHandshake, 
  Trophy, 
  Church, 
  Building2, 
  Sparkles, 
  LogOut, 
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { AccountSwitcher } from '../profile/AccountSwitcher';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal: () => void;
  onOpenInviteModal: () => void;
  onOpenQrModal: () => void;
}

interface MenuItem {
  tab?: TabType;
  action?: () => void;
  title: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  badge?: string | number;
  highlight?: boolean;
  isAdminOnly?: boolean;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAuthModal,
  onOpenInviteModal,
  onOpenQrModal,
}) => {
  const { 
    currentUser, 
    setActiveTab, 
    activeTab, 
    notifications, 
    conversations,
    savedAccounts,
    removeSavedAccount,
    switchAccount,
    setSelectedUserId,
    triggerCelebration
  } = useApp();

  const drawerRef = useRef<HTMLDivElement>(null);
  const unreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto focus drawer
      drawerRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelectTab = (tab: TabType) => {
    if (tab === 'perfil') {
      setSelectedUserId(null);
    }
    setActiveTab(tab);
    onClose();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('apdf_current_user_id');
      window.location.reload();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
  };

  const primaryTools: MenuItem[] = [
    {
      tab: 'ia_studio',
      title: 'IA Cristiana Unificada',
      subtitle: 'Música, Video, Imagen, Chat, 3D, Voz & Biociencias',
      icon: Sparkles,
      color: 'from-purple-600 via-pink-600 to-amber-500',
      badge: 'IA Master',
      highlight: true
    },
    {
      tab: 'comunidad_juvenil',
      title: 'Comunidad JA',
      subtitle: 'Juventud Cristiana & Ministerios',
      icon: Users,
      color: 'from-amber-500 via-orange-600 to-red-600',
      badge: 'Nuevo'
    },
    {
      tab: 'tv',
      title: 'TV en Vivo',
      subtitle: 'Hope Channel, 3ABN & Nuevo Tiempo',
      icon: Tv,
      color: 'from-blue-600 to-cyan-600',
      badge: 'En directo'
    },
    {
      tab: 'en_vivo',
      title: 'Radio & Cultos en Vivo',
      subtitle: 'Radio Adventista (AWR/Esperanza)',
      icon: Radio,
      color: 'from-red-600 to-rose-600',
      badge: 'Radio'
    },
    {
      tab: 'noticias',
      title: 'Noticias Adventistas',
      subtitle: 'Fuentes oficiales DIA & Colombia',
      icon: Newspaper,
      color: 'from-emerald-600 to-teal-600'
    },
    {
      tab: 'libros',
      title: 'Libros & Elena G. White',
      subtitle: 'Biblioteca JA y Devocionales',
      icon: BookOpen,
      color: 'from-indigo-600 to-blue-600'
    },
    {
      tab: 'himnario',
      title: 'Himnario Adventista',
      subtitle: '613 Himnos oficiales IADPA',
      icon: Music,
      color: 'from-amber-500 to-yellow-600'
    },
    {
      tab: 'juegos',
      title: 'Juegos Bíblicos & Trivia',
      subtitle: 'Preguntas con referencias y puntos',
      icon: Gamepad2,
      color: 'from-orange-500 to-amber-600'
    },
    {
      tab: 'comunidades',
      title: 'Comunidades JA',
      subtitle: '6 Ministerios Oficiales',
      icon: Users,
      color: 'from-purple-600 to-pink-600'
    },
    {
      tab: 'eventos',
      title: 'Radar de Eventos',
      subtitle: 'Campamentos y actividades Buenaventura',
      icon: MapPin,
      color: 'from-amber-500 to-orange-600'
    },
    {
      tab: 'cine',
      title: 'Cine Cristiano',
      subtitle: 'Películas y producciones adventistas',
      icon: Film,
      color: 'from-rose-600 to-red-600'
    },
    {
      tab: 'actividades',
      title: 'Ideas JA & Dinámicas',
      subtitle: 'Programas, fondos y dinámicas',
      icon: Lightbulb,
      color: 'from-amber-600 to-yellow-600'
    },
    {
      tab: 'materiales',
      title: 'Materiales & Guías',
      subtitle: 'Boletines oficiales y lecciones',
      icon: BookOpen,
      color: 'from-blue-600 to-cyan-600'
    },
    {
      tab: 'chat',
      title: 'Chat JA',
      subtitle: 'Comunidad y mensajes directos',
      icon: MessageCircle,
      color: 'from-cyan-600 to-blue-600',
      badge: unreadMessages > 0 ? unreadMessages : undefined
    },
    {
      tab: 'oracion',
      title: 'Muro de Oración',
      subtitle: 'Peticiones e intercesión comunitaria',
      icon: HeartHandshake,
      color: 'from-purple-600 to-pink-600'
    },
    {
      tab: 'retos',
      title: 'Retos Misioneros',
      subtitle: 'Desafíos verificados y puntos',
      icon: Flame,
      color: 'from-orange-500 to-red-500'
    },
    {
      tab: 'ranking',
      title: 'Ranking Juvenil',
      subtitle: 'Top de jóvenes y constancia semanal',
      icon: Trophy,
      color: 'from-yellow-500 to-amber-600'
    },
    {
      tab: 'canales',
      title: 'Canales Adventistas',
      subtitle: 'Música, predicación y estudio bíblico',
      icon: Tv,
      color: 'from-red-600 to-rose-600'
    },
    {
      tab: 'oficial',
      title: 'Fuentes Oficiales IASD',
      subtitle: 'Páginas y departamentos verificados',
      icon: Church,
      color: 'from-emerald-600 to-teal-600'
    },
    {
      tab: 'iglesias',
      title: 'Distritos & Iglesias',
      subtitle: '5 Distritos de Buenaventura',
      icon: Building2,
      color: 'from-blue-600 to-indigo-600'
    },
  ];

  const isAdmin = currentUser.role === 'superadmin' || 
    currentUser.role === 'admin' || 
    currentUser.email?.toLowerCase() === 'armandoriascos16@gmail.com' ||
    currentUser.email === 'harmonymusis@gmail.com' || 
    currentUser.email === 'harmonyestampadosr@gmail.com';

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Menú lateral de navegación y herramientas"
    >
      <div 
        ref={drawerRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm sm:w-96 h-full bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col focus:outline-none animate-in slide-in-from-right duration-200"
      >
        {/* Sticky Drawer Header */}
        <div className="shrink-0 p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-600 shadow-md">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-tight font-heading leading-tight">
                  A PRUEBA DE FUEGO
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                  Menú Lateral de Herramientas
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Cerrar menú lateral"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* User Card inside Header */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar
                avatar={currentUser.avatar}
                name={`${currentUser.name} ${currentUser.lastName}`}
                size="sm"
                isOfficial={currentUser.role === 'admin' || currentUser.isOfficialVerified}
                showBadge={false}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-white truncate">
                    {currentUser.name} {currentUser.lastName}
                  </p>
                  {currentUser.isOfficialVerified && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      OFICIAL
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate">@{currentUser.username}</p>
              </div>
            </div>

            <button
              onClick={() => handleSelectTab('perfil')}
              className="flex flex-col items-end shrink-0 text-right group"
              title="Ir a mi ficha de jugador"
            >
              <span className="text-xs font-black text-amber-400 tabular-nums">
                {currentUser.points.toLocaleString()} pts
              </span>
              <span className="text-[9px] text-slate-400 group-hover:text-amber-300 transition-colors">
                Nivel {currentUser.level} →
              </span>
            </button>
          </div>
        </div>

        {/* Scrollable Content: Tools & Navigation List */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 space-y-4">
          
          {/* Quick Actions (Auth, Invite, QR) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
              Accesos Principales
            </span>

            <button
              onClick={() => {
                onClose();
                onOpenAuthModal();
              }}
              className="w-full text-left p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-amber-200">Acceder / Registrarse</p>
                  <p className="text-[10px] text-amber-400/80 font-normal">Sincroniza perfil y puntos con Firebase</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenInviteModal();
              }}
              className="w-full text-left p-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-sm">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-200">Invitar a un Amigo</p>
                  <p className="text-[10px] text-emerald-400/80">Comparte la app y gana +100 pts</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40 text-emerald-300">
                +100 pts
              </span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenQrModal();
              }}
              className="w-full text-left p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-semibold flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-amber-400 border border-slate-700">
                  <QrCode className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Abrir en el Móvil (QR)</p>
                  <p className="text-[10px] text-slate-400">Escanea el código para ver en tu celular</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Section: All App Tools & Portals */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 pt-2 pb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Todas las Herramientas ({primaryTools.length})
              </span>
              <span className="text-[10px] text-amber-500 font-medium">
                Desplazable ↓
              </span>
            </div>

            <div className="space-y-1">
              {primaryTools.map((item) => {
                const Icon = item.icon;
                const isCurrent = item.tab && activeTab === item.tab;

                return (
                  <button
                    key={item.title}
                    onClick={() => item.tab && handleSelectTab(item.tab)}
                    className={`w-full text-left p-2.5 rounded-2xl border transition-all flex items-center justify-between group active:scale-[0.98] ${
                      isCurrent
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-bold truncate ${isCurrent ? 'text-amber-300' : 'text-slate-100 group-hover:text-amber-400 transition-colors'}`}>
                            {item.title}
                          </p>
                          {item.badge && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isCurrent ? 'text-amber-400' : 'text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Admin Dashboard if applicable */}
          {isAdmin && (
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/80 px-2 block mb-1">
                Supervisión & Liderazgo
              </span>
              <button
                onClick={() => handleSelectTab('admin')}
                className="w-full text-left p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/40 text-amber-200 font-bold flex items-center justify-between hover:border-amber-400 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-md">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-amber-300">Panel Administrativo</p>
                    <p className="text-[10px] text-amber-400/70">Gestión de retos, evidencias y contenidos</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {/* Cuentas Guardadas en este Dispositivo (Máximo 2) */}
          <div className="pt-2 border-t border-slate-800/80">
            <AccountSwitcher
              onOpenAuthModal={() => {
                onClose();
                onOpenAuthModal();
              }}
              onAccountSwitched={onClose}
            />
          </div>

          {/* Account Profile & Session Management */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2 pb-24 sm:pb-8">
            <button
              onClick={() => handleSelectTab('onboarding')}
              className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Crear nuevo perfil / Reiniciar</span>
            </button>

            {auth.currentUser && (
              <button
                onClick={handleLogout}
                className="w-full py-2.5 px-3 rounded-2xl bg-red-950/40 hover:bg-red-900/50 border border-red-900/30 text-red-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
