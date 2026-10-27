import React, { useState, useEffect } from 'react';
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
import { BibleGames } from './components/games/BibleGames';
import { ChannelsView } from './components/channels/ChannelsView';
import { LeaderboardView } from './components/ranking/LeaderboardView';
import { OfficialSourcesView } from './components/official/OfficialSourcesView';
import { ChurchesView } from './components/churches/ChurchesView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { NotificationsView } from './components/notifications/NotificationsView';
import { NotificationTargetModal } from './components/notifications/NotificationTargetModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { AuthModal } from './components/auth/AuthModal';
import { ChristianCinemaPortal } from './components/cinema/ChristianCinemaPortal';
import { YouthActivitiesPortal } from './components/activities/YouthActivitiesPortal';
import { YouthMaterialsPortal } from './components/materials/YouthMaterialsPortal';
import { CommunitiesPortal } from './components/communities/CommunitiesPortal';
import { CreateActionSheetModal } from './components/feed/CreateActionSheetModal';
import { CreatePostModal } from './components/feed/CreatePostModal';
import { CreateStoryModal } from './components/feed/CreateStoryModal';
import { LiveStreamingPortal } from './components/live/LiveStreamingPortal';
import { LiveTVPortal } from './components/tv/LiveTVPortal';
import { ChristianBooksPortal } from './components/library/ChristianBooksPortal';
import { AdventistHymnalPortal } from './components/hymnal/AdventistHymnalPortal';
import { AdventistNewsView } from './components/news/AdventistNewsView';
import { ComunidadJuvenilView } from './components/comunidadJuvenil/ComunidadJuvenilView';
import { ChristianAIHub } from './components/ai/ChristianAIHub';
import { auth, db, testConnection } from './firebase/config';
import { Loader2 } from 'lucide-react';
import { User } from './types';

const MainLayout: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedUserId, 
    setSelectedUserId,
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

    // Check if user has registered; if not, open registration flow first
    const isRegistered = localStorage.getItem('apdf_registered');
    if (!isRegistered) {
      setActiveTab('onboarding');
    }
  }, []);

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
