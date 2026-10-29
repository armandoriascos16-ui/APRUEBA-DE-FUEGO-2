import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { HomeFeed } from './components/feed/HomeFeed';
import { DiscoverYouth } from './components/discover/DiscoverYouth';
import { ChallengesView } from './components/challenges/ChallengesView';
import { EventsView } from './components/events/EventsView';
import { PlayerCardProfile } from './components/profile/PlayerCardProfile';
import { ChatView } from './components/chat/ChatView';
import { PrayerWall } from './components/prayer/PrayerWall';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { NotificationTargetModal } from './components/notifications/NotificationTargetModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthGateScreen } from './components/auth/AuthGateScreen';
import { CreateActionSheetModal } from './components/feed/CreateActionSheetModal';
import { CreatePostModal } from './components/feed/CreatePostModal';
import { CreateStoryModal } from './components/feed/CreateStoryModal';
import { LiveStreamingPortal } from './components/live/LiveStreamingPortal';
import { testConnection } from './firebase/config';
import { Loader2, Flame } from 'lucide-react';

// Lazy load heavy secondary portals for optimal bundle size and instant initial load
const ChristianAIHub = lazy(() => import('./components/ai/ChristianAIHub').then(m => ({ default: m.ChristianAIHub })));
const BibleGames = lazy(() => import('./components/games/BibleGames').then(m => ({ default: m.BibleGames })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const ChristianCinemaPortal = lazy(() => import('./components/cinema/ChristianCinemaPortal').then(m => ({ default: m.ChristianCinemaPortal })));
const LiveTVPortal = lazy(() => import('./components/tv/LiveTVPortal').then(m => ({ default: m.LiveTVPortal })));
const ChristianBooksPortal = lazy(() => import('./components/library/ChristianBooksPortal').then(m => ({ default: m.ChristianBooksPortal })));
const AdventistHymnalPortal = lazy(() => import('./components/hymnal/AdventistHymnalPortal').then(m => ({ default: m.AdventistHymnalPortal })));
const YouthActivitiesPortal = lazy(() => import('./components/activities/YouthActivitiesPortal').then(m => ({ default: m.YouthActivitiesPortal })));
const YouthMaterialsPortal = lazy(() => import('./components/materials/YouthMaterialsPortal').then(m => ({ default: m.YouthMaterialsPortal })));
const CommunitiesPortal = lazy(() => import('./components/communities/CommunitiesPortal').then(m => ({ default: m.CommunitiesPortal })));
const ComunidadJuvenilView = lazy(() => import('./components/comunidadJuvenil/ComunidadJuvenilView').then(m => ({ default: m.ComunidadJuvenilView })));
const AdventistNewsView = lazy(() => import('./components/news/AdventistNewsView').then(m => ({ default: m.AdventistNewsView })));
const ChannelsView = lazy(() => import('./components/channels/ChannelsView').then(m => ({ default: m.ChannelsView })));
const ChurchesView = lazy(() => import('./components/churches/ChurchesView').then(m => ({ default: m.ChurchesView })));
const LeaderboardView = lazy(() => import('./components/ranking/LeaderboardView').then(m => ({ default: m.LeaderboardView })));
const OfficialSourcesView = lazy(() => import('./components/official/OfficialSourcesView').then(m => ({ default: m.OfficialSourcesView })));
const NotificationsView = lazy(() => import('./components/notifications/NotificationsView').then(m => ({ default: m.NotificationsView })));

const ViewLoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[350px] p-8 space-y-3">
    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
    <span className="text-xs text-slate-400 font-medium">Cargando sección...</span>
  </div>
);

const MainLayout: React.FC = () => {
  const { 
    isAuthenticated,
    isAuthReady,
    activeTab, 
    setActiveTab, 
    selectedUserId, 
    isAccountSwitching,
    accountSwitchingMessage 
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [showCreateActionSheet, setShowCreateActionSheet] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [createPostMediaType, setCreatePostMediaType] = useState<'photo' | 'video'>('photo');
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [onboardingInitialData, setOnboardingInitialData] = useState<{
    uid?: string;
    email?: string;
    name?: string;
    avatar?: string;
  } | undefined>(undefined);

  // Initialize and test Firebase connection
  useEffect(() => {
    testConnection();
  }, []);

  // 1. Splash screen while Firebase Auth state is initializing
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-xl shadow-amber-500/10 animate-pulse">
          <Flame className="h-8 w-8 text-amber-500" />
        </div>
        <div className="text-center space-y-1.5">
          <h1 className="text-xl font-black text-white tracking-wider font-heading uppercase">
            A Prueba de Fuego
          </h1>
          <p className="text-xs text-amber-400 font-medium tracking-wide">
            Comunidad Juvenil Cristiana
          </p>
        </div>
        <Loader2 className="w-5 h-5 text-amber-500 animate-spin mt-4" />
      </div>
    );
  }

  // 2. Mandatory Auth Gate: Block unauthenticated users from internal screens
  if (!isAuthenticated && activeTab !== 'onboarding') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
        <AuthGateScreen 
          onOpenLogin={() => {
            setAuthModalMode('login');
            setShowAuthModal(true);
          }}
          onOpenRegister={() => {
            setAuthModalMode('register');
            setShowAuthModal(true);
          }}
        />

        {/* Auth Modal for Email/Password */}
        <AuthModal
          isOpen={showAuthModal}
          initialMode={authModalMode}
          onClose={() => setShowAuthModal(false)}
          onRegistrationSuccess={(userData) => {
            setOnboardingInitialData(userData);
            setActiveTab('onboarding');
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Navbar */}
      <Navbar 
        onOpenNotifications={() => setShowNotifications(true)} 
        onOpenSearch={() => setShowSearch(true)}
        onOpenAuthModal={() => {
          setAuthModalMode('login');
          setShowAuthModal(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 pt-2">
        <Suspense fallback={<ViewLoadingFallback />}>
          {activeTab === 'inicio' && <HomeFeed />}
          {activeTab === 'descubrir' && <DiscoverYouth />}
          {activeTab === 'retos' && <ChallengesView />}
          {activeTab === 'eventos' && <EventsView />}
          {activeTab === 'perfil' && (
            <PlayerCardProfile userId={selectedUserId} />
          )}
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'oracion' && <PrayerWall />}
          {activeTab === 'juegos' && <BibleGames />}
          {activeTab === 'canales' && <ChannelsView />}
          {activeTab === 'ranking' && <LeaderboardView />}
          {activeTab === 'oficial' && <OfficialSourcesView />}
          {activeTab === 'iglesias' && <ChurchesView />}
          {activeTab === 'cine' && <ChristianCinemaPortal />}
          {activeTab === 'actividades' && <YouthActivitiesPortal />}
          {activeTab === 'materiales' && <YouthMaterialsPortal />}
          {activeTab === 'comunidades' && <CommunitiesPortal />}
          {activeTab === 'en_vivo' && <LiveStreamingPortal />}
          {activeTab === 'tv' && <LiveTVPortal />}
          {activeTab === 'libros' && <ChristianBooksPortal />}
          {activeTab === 'himnario' && <AdventistHymnalPortal />}
          {activeTab === 'noticias' && <AdventistNewsView />}
          {activeTab === 'comunidad_juvenil' && <ComunidadJuvenilView />}
          {activeTab === 'ia_studio' && <ChristianAIHub />}
          {activeTab === 'admin' && <AdminDashboard />}
          {activeTab === 'notificaciones' && <NotificationsView />}
          {activeTab === 'onboarding' && (
            <OnboardingFlow 
              onCancel={() => setActiveTab('inicio')}
              initialUserData={onboardingInitialData}
              onOpenAuthModal={() => {
                setAuthModalMode('login');
                setShowAuthModal(true);
              }}
            />
          )}
        </Suspense>
      </main>

      {/* Bottom Navigation */}
      {activeTab !== 'onboarding' && (
        <BottomNav onOpenCreate={() => setShowCreateActionSheet(true)} />
      )}

      {/* Drawers and Modals */}
      {showNotifications && (
        <NotificationsDrawer onClose={() => setShowNotifications(false)} />
      )}

      {/* Detail or unavailable content modal for notifications */}
      <NotificationTargetModal />

      {showSearch && (
        <GlobalSearchModal onClose={() => setShowSearch(false)} />
      )}

      {/* Action sheet for Mobile + Button */}
      <CreateActionSheetModal
        isOpen={showCreateActionSheet}
        onClose={() => setShowCreateActionSheet(false)}
        onSelectAction={(action) => {
          if (action === 'photo') {
            setCreatePostMediaType('photo');
            setShowCreatePost(true);
          } else if (action === 'video') {
            setCreatePostMediaType('video');
            setShowCreatePost(true);
          } else if (action === 'story') {
            setShowCreateStory(true);
          } else if (action === 'text') {
            setCreatePostMediaType('photo');
            setShowCreatePost(true);
          } else if (action === 'live') {
            setActiveTab('en_vivo');
          }
        }}
      />

      {/* Global Post Creation Modal */}
      {showCreatePost && (
        <CreatePostModal
          defaultMediaType={createPostMediaType}
          onClose={() => setShowCreatePost(false)}
        />
      )}

      {/* Global Story Creation Modal */}
      {showCreateStory && (
        <CreateStoryModal
          onClose={() => setShowCreateStory(false)}
        />
      )}

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authModalMode}
        onClose={() => setShowAuthModal(false)}
        onRegistrationSuccess={(userData) => {
          setOnboardingInitialData(userData);
          setActiveTab('onboarding');
        }}
      />

      {/* Account Switching Transition Overlay */}
      {isAccountSwitching && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white font-heading">
                {accountSwitchingMessage || 'Cambiando de cuenta...'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Cargando sesión y sincronizando tu perfil sin perder publicaciones ni estados.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
