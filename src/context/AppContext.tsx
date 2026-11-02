import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  User, 
  Post, 
  Comment,
  Story, 
  StoryComment,
  StoryReaction,
  StoryView,
  ChristianSticker,
  Challenge, 
  ChallengeSubmission, 
  EventItem, 
  OfficialSource, 
  PrayerRequest, 
  Testimonial, 
  Church, 
  NotificationItem, 
  ChatConversation, 
  ChatMessage, 
  ReactionType,
  SubmissionStatus,
  Badge,
  BiblePlan,
  PrayerCircle,
  DailyVerse,
  Community,
  CommunityCategory,
  PointTransaction,
  FriendInvitation,
  IdeaItem,
  IdeaStatus,
  IdeaComment,
  IdeaRating,
  SavedAccount,
  AuthEvent
} from '../types';
import {
  SessionAccount,
  getSavedSessions,
  saveSession,
  removeSession,
  getActiveSessionUid,
  setActiveSessionUid,
  fetchUserProfileByUid,
  createDefaultProfileFromSession
} from '../services/accountManagerService';
import { INITIAL_IDEAS, INITIAL_IDEA_CATEGORIES } from '../data/ideasJaData';
import { 
  INITIAL_COMMUNITIES, 
  INITIAL_DISCUSSIONS, 
  CommunityDiscussion 
} from '../data/communitiesData';
import { 
  INITIAL_USERS, 
  INITIAL_POSTS, 
  INITIAL_STORIES, 
  INITIAL_CHALLENGES, 
  INITIAL_SUBMISSIONS, 
  INITIAL_EVENTS, 
  OFFICIAL_SOURCES, 
  INITIAL_PRAYER_REQUESTS, 
  INITIAL_TESTIMONIALS, 
  INITIAL_CHURCHES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_CONVERSATIONS, 
  INITIAL_MESSAGES,
  calculateLevel,
  INITIAL_BADGES,
  ADMIN_USER,
  INITIAL_BIBLE_PLANS,
  INITIAL_PRAYER_CIRCLES,
  TODAY_VERSE
} from '../data/seedData';
import confetti from 'canvas-confetti';
import { verifyChallengeEvidence, VerificationResult } from '../services/challengeVerificationService';
import { deleteMediaFileFromServer } from '../utils/mediaUtils';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import {
  initializeFirestoreData,
  createPostInFirestore,
  updatePostInFirestore,
  deletePostInFirestore,
  getPostsFromFirestore,
  getPostTimestamp,
  parseTimeToMillis,
  subscribeToPostsFromFirestore,
  createChallengeInFirestore,
  updateChallengeInFirestore,
  deleteChallengeInFirestore,
  getChallengesFromFirestore,
  createSubmissionInFirestore,
  updateSubmissionStatusInFirestore,
  deleteSubmissionInFirestore,
  getSubmissionsFromFirestore,
  createEventInFirestore,
  updateEventInFirestore,
  deleteEventInFirestore,
  getEventsFromFirestore,
  createPrayerInFirestore,
  updatePrayerInFirestore,
  deletePrayerInFirestore,
  getPrayersFromFirestore,
  createTestimonialInFirestore,
  updateTestimonialInFirestore,
  deleteTestimonialInFirestore,
  getTestimonialsFromFirestore,
  saveUserToFirestore,
  updateUserInFirestore,
  getAllUsersFromFirestore,
  createStoryInFirestore,
  updateStoryInFirestore,
  deleteStoryInFirestore,
  getStoriesFromFirestore,
  subscribeToStoriesFromFirestore,
  toggleFollowUserInFirestore,
  addStoryCommentInFirestore,
  getStoryCommentsFromFirestore,
  subscribeStoryCommentsFromFirestore,
  toggleStoryCommentLikeInFirestore,
  deleteStoryCommentInFirestore,
  saveStoryReactionInFirestore,
  deleteStoryReactionInFirestore,
  getStoryReactionsFromFirestore,
  subscribeStoryReactionsFromFirestore,
  recordStoryViewInFirestore,
  getStoryViewsFromFirestore,
  subscribeStoryViewsFromFirestore,
  createCommentInFirestore,
  saveReactionInFirestore,
  deleteReactionInFirestore,
  createMessageInFirestore,
  saveDailyChallengeRewardInFirestore,
  getRealUsersCountFromFirestore,
  subscribeToUsersFromFirestore,
  createPointTransactionInFirestore,
  getPointTransactionsForUser,
  getAllPointTransactionsFromFirestore,
  createInvitationInFirestore,
  getInvitationsForUser,
  createGameScoreInFirestore,
  createReportInFirestore,
  createIdeaInFirestore,
  updateIdeaInFirestore,
  deleteIdeaInFirestore,
  getIdeasFromFirestore,
  createIdeaCommentInFirestore,
  getIdeaCommentsFromFirestore,
  saveIdeaRatingInFirestore,
  getIdeaRatingsFromFirestore,
  toggleIdeaFavoriteInFirestore,
  getUserIdeaFavoritesFromFirestore,
  createNotificationInFirestore,
  getUserNotificationsFromFirestore,
  subscribeToUserNotificationsFromFirestore,
  markNotificationReadInFirestore,
  markAllUserNotificationsReadInFirestore,
  deleteNotificationInFirestore,
  recordAuthEventInFirestore,
  getAuthEventsFromFirestore,
  subscribeToAuthEventsFromFirestore
} from '../firebase/firestoreService';

/**
 * Almacena de forma segura datos en localStorage previniendo QuotaExceededError.
 * En caso de que se supere la cuota de almacenamiento, compacta imágenes base64
 * pesadas y limpia cachés transitorias.
 */
function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    console.warn(`LocalStorage quota warning al guardar "${key}":`, err?.message || err);
    try {
      if (key === 'apdf_stories' || key === 'apdf_posts') {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          const fallbackImg = 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800&auto=format&fit=crop&q=80';
          const compacted = parsed.slice(0, 10).map((item: any) => {
            const copy = { ...item };
            if (copy.mediaUrl && copy.mediaUrl.startsWith('data:') && copy.mediaUrl.length > 25000) {
              copy.mediaUrl = fallbackImg;
            }
            if (copy.imageUrl && copy.imageUrl.startsWith('data:') && copy.imageUrl.length > 25000) {
              copy.imageUrl = fallbackImg;
            }
            return copy;
          });
          localStorage.setItem(key, JSON.stringify(compacted));
          return;
        }
      }
      // Limpiar colecciones secundarias si la cuota continúa llena
      localStorage.removeItem('apdf_notifications');
      localStorage.removeItem('apdf_messages');
      localStorage.setItem(key, value);
    } catch (fallbackError) {
      console.warn(`No se pudo persistir en localStorage para ${key}:`, fallbackError);
    }
  }
}

export type TabType = 
  | 'inicio' 
  | 'descubrir' 
  | 'retos' 
  | 'eventos' 
  | 'perfil' 
  | 'chat' 
  | 'oracion' 
  | 'juegos' 
  | 'canales' 
  | 'ranking' 
  | 'oficial' 
  | 'admin' 
  | 'iglesias' 
  | 'notificaciones'
  | 'onboarding'
  | 'cine'
  | 'actividades'
  | 'materiales'
  | 'comunidades'
  | 'planes'
  | 'clips'
  | 'guardados'
  | 'noticias'
  | 'libros'
  | 'himnario'
  | 'en_vivo'
  | 'tv'
  | 'comunidad_juvenil'
  | 'ia_studio';

interface AppContextType {
  currentUser: User;
  allUsers: User[];

  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  posts: Post[];
  stories: Story[];
  challenges: Challenge[];
  submissions: ChallengeSubmission[];
  events: EventItem[];
  officialSources: OfficialSource[];
  prayerRequests: PrayerRequest[];
  prayerCircles: PrayerCircle[];
  biblePlans: BiblePlan[];
  dailyVerse: DailyVerse;
  testimonials: Testimonial[];
  churches: Church[];
  communities: Community[];
  discussions: CommunityDiscussion[];
  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  selectedPostForDetail: Post | null;
  setSelectedPostForDetail: (post: Post | null) => void;
  contentUnavailableMessage: string | null;
  setContentUnavailableMessage: (msg: string | null) => void;
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedUserId: string | null;
  setSelectedUserId: (id: string | null) => void;
  viewingSubmissionId: string | null;
  setViewingSubmissionId: (id: string | null) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  
  // Actions
  loginAs: (userId: string) => void;
  registerUser: (userData: Partial<User>) => void;
  createPost: (post: Partial<Post>) => void;
  toggleReaction: (postId: string, reaction: ReactionType) => void;
  addComment: (postId: string, content: string, sticker?: string, parentId?: string | null, replyToUsername?: string) => void;
  toggleLikeComment: (postId: string, commentId: string) => void;
  incrementPostViews: (postId: string) => void;
  createStory: (story: Partial<Story>) => void;
  deleteStory: (storyId: string) => void;
  addStoryComment: (
    storyId: string, 
    content: string, 
    stickerData?: ChristianSticker, 
    parentId?: string | null, 
    replyToUsername?: string,
    replyToUserId?: string
  ) => Promise<void>;
  toggleStoryReaction: (
    storyId: string, 
    reactionKey: string, 
    type: 'emoji' | 'sticker', 
    emoji?: string, 
    label?: string, 
    stickerData?: ChristianSticker
  ) => Promise<void>;
  recordStoryView: (storyId: string) => Promise<boolean>;
  toggleLikeStoryComment: (storyId: string, commentId: string, parentId?: string | null) => Promise<void>;
  getStoryComments: (storyId: string) => StoryComment[];
  getStoryReactions: (storyId: string) => StoryReaction[];
  getStoryViews: (storyId: string) => StoryView[];
  isStoryExpired: (story: Story) => boolean;
  submitChallengeEvidence: (submission: Omit<ChallengeSubmission, 'id' | 'status' | 'submittedAt'>) => Promise<VerificationResult>;
  adminReviewSubmission: (submissionId: string, status: SubmissionStatus, feedback?: string, pointsOverride?: number) => void;
  adminCreateChallenge: (challenge: Omit<Challenge, 'id' | 'participantsCount'>) => void;
  adminCreateEvent: (event: Omit<EventItem, 'id' | 'interestedCount' | 'attendingCount'>) => void;
  toggleEventParticipation: (eventId: string, type: 'attend' | 'interest') => void;
  prayForRequest: (requestId: string) => void;
  createPrayerRequest: (request: Omit<PrayerRequest, 'id' | 'authorId' | 'authorName' | 'authorUsername' | 'authorAvatar' | 'authorChurch' | 'prayingCount' | 'prayingUserIds' | 'createdAt' | 'isAnswered'>) => void;
  markPrayerAnswered: (requestId: string, testimony: string) => void;
  createTestimonial: (testimonial: Omit<Testimonial, 'id' | 'authorId' | 'authorName' | 'authorUsername' | 'authorAvatar' | 'authorChurch' | 'date' | 'amenCount' | 'praisedUserIds'>) => void;
  sendMessage: (conversationId: string, content: string, sticker?: string, isVoiceNote?: boolean) => void;
  followUser: (targetUserId: string) => void;
  awardQuizPoints: (points: number, reason: string) => void;
  savePost: (postId: string) => void;
  reportPost: (postId: string, reason: string) => void;
  deletePost: (postId: string) => void;
  deleteChallenge: (challengeId: string) => void;
  deleteEvent: (eventId: string) => void;
  deletePrayerRequest: (prayerId: string) => void;
  deleteTestimonial: (testId: string) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (notificationId: string, read?: boolean) => void;
  deleteNotification: (notificationId: string) => void;
  handleNotificationClick: (notif: NotificationItem) => void;
  triggerCelebration: () => void;
  completeDailyChallenge: (badge: Badge, points: number, challengeId: string, reflection?: string) => Promise<{ updatedUser: User; badge: Badge }>;
  toggleJoinBiblePlan: (planId: string) => void;
  toggleCompleteBiblePlanDay: (planId: string, dayNumber: number) => void;
  joinPrayerCircle: (circleId: string) => void;
  createPrayerCircle: (name: string, description: string, isPrivate: boolean) => void;
  toggleJoinCommunity: (communityId: string) => void;
  createDiscussion: (data: { communityId: string; title: string; content: string; tags: string[] }) => void;
  registeredUsersCount: number;
  pointTransactions: PointTransaction[];
  invitations: FriendInvitation[];
  sendFriendInvitation: (data: Omit<FriendInvitation, 'id' | 'inviterUserId' | 'inviterName' | 'inviterChurch' | 'status' | 'createdAt'>) => Promise<FriendInvitation>;
  refreshUsersCount: () => Promise<number>;
  likeDiscussion: (discussionId: string) => void;
  savedAccounts: SavedAccount[];
  addSavedAccount: (account: SavedAccount) => boolean;
  removeSavedAccount: (accountId: string) => void;
  switchAccount: (accountId: string) => Promise<boolean>;
  savedSessions: SessionAccount[];
  switchAccountSession: (uid: string) => Promise<boolean>;
  removeAccountSession: (uid: string) => void;
  addAccountSession: (session: SessionAccount) => boolean;
  isAccountSwitching: boolean;
  accountSwitchingMessage: string | null;
  setIsAccountSwitching: (loading: boolean) => void;
  isAuthenticated: boolean;
  isAuthReady: boolean;
  authEvents: AuthEvent[];
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state or default — ensuring demo profiles are isolated from real data
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('apdf_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(u => 
            !['user_david', 'user_sarah', 'user_mateo', 'user_valeria', 'user_samuel'].includes(u.id) &&
            !u.email?.endsWith('@ejemplo.com') &&
            !u.isDemo
          );
          if (cleaned.length > 0) return cleaned;
        }
      } catch (e) {
        console.warn('Error reading cached users:', e);
      }
    }
    return INITIAL_USERS;
  });

  // Servicio de sesiones autenticadas (hasta 2 sesiones con persistencia atómica)
  const [savedSessions, setSavedSessions] = useState<SessionAccount[]>(() => getSavedSessions());
  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => {
    const list = getSavedSessions();
    return list.map(s => ({
      id: s.uid,
      email: s.email,
      name: s.displayName,
      username: s.username,
      avatar: s.photoURL,
      church: s.church,
      points: s.points,
      level: s.level,
      lastActive: s.lastActive,
      slot: s.slot,
      providerId: s.providerId
    }));
  });

  const [isAccountSwitching, setIsAccountSwitching] = useState<boolean>(false);
  const [accountSwitchingMessage, setAccountSwitchingMessage] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const activeStored = getActiveSessionUid();
    if (activeStored && !['user_david', 'user_sarah', 'user_mateo', 'user_valeria', 'user_samuel'].includes(activeStored)) {
      return activeStored;
    }
    const savedId = localStorage.getItem('apdf_current_user_id');
    if (savedId && !['user_david', 'user_sarah', 'user_mateo', 'user_valeria', 'user_samuel'].includes(savedId)) {
      return savedId;
    }
    const firstSession = getSavedSessions()[0];
    if (firstSession?.uid) return firstSession.uid;
    return auth.currentUser?.uid || '';
  });

  const isAuthenticated = useMemo(() => {
    if (auth.currentUser && auth.currentUser.uid) return true;
    if (currentUserId && currentUserId !== '' && currentUserId !== 'admin_official' && !currentUserId.startsWith('mock_')) return true;
    const activeStored = getActiveSessionUid();
    if (activeStored && savedSessions.some(s => s.uid === activeStored || s.id === activeStored)) return true;
    if (savedSessions.length > 0) return true;
    return false;
  }, [currentUserId, savedSessions]);

  const rawCurrentUser = useMemo(() => {
    if (!currentUserId) return null;
    const found = allUsers.find(u => u.id === currentUserId);
    if (found) return found;

    const matchedSession = savedSessions.find(s => s.uid === currentUserId || s.id === currentUserId);
    if (matchedSession) {
      return createDefaultProfileFromSession(matchedSession);
    }

    return null;
  }, [currentUserId, allUsers, savedSessions]);

  const currentUser: User = useMemo(() => {
    if (!rawCurrentUser) {
      return {
        id: currentUserId || 'unauthenticated_guest',
        name: 'Joven',
        lastName: 'Cristiano',
        username: currentUserId ? `joven_${currentUserId.slice(0, 5)}` : 'invitado',
        email: '',
        avatar: '',
        age: 18,
        birthDate: '2008-01-01',
        city: 'Colombia',
        country: 'Colombia',
        church: 'Iglesia Adventista del Séptimo Día',
        district: 'Distrito Juvenil',
        zone: 'Zona Misionera',
        isAdventist: true,
        yearsServing: 1,
        ministries: ['Ministerio Juvenil JA'],
        activities: ['trabajar_jovenes'],
        maritalStatus: 'soltero',
        interests: ['Biblia', 'Música', 'Misión'],
        bio: 'Joven adventista participando en la comunidad A Prueba de Fuego.',
        points: 0,
        level: 1,
        levelName: 'Explorador de la Fe',
        role: 'user',
        isOfficialVerified: false,
        emailVerified: false,
        badges: [],
        followingIds: [],
        followerIds: [],
        savedPostIds: [],
        joinedEventIds: [],
        stats: {
          challengesCompleted: 0,
          eventsAttended: 0,
          missionsDone: 0,
          badgesCount: 0,
          prayerStreak: 0,
          bibleReadingStreak: 0,
          activeStreakDays: 0,
        },
        privacy: {
          isProfilePublic: true,
          showLocation: true,
          allowDirectMessages: true,
          allowPrayerMentions: true,
        }
      };
    }

    return {
      ...rawCurrentUser,
      id: rawCurrentUser.id,
      name: rawCurrentUser.name || 'Joven Cristiano',
      lastName: rawCurrentUser.lastName || '',
      username: rawCurrentUser.username || `joven_${(rawCurrentUser.id || 'user').slice(0, 5)}`,
      email: rawCurrentUser.email || '',
      avatar: rawCurrentUser.avatar || '',
      points: typeof rawCurrentUser.points === 'number' ? rawCurrentUser.points : 0,
      level: typeof rawCurrentUser.level === 'number' ? rawCurrentUser.level : 1,
      levelName: rawCurrentUser.levelName || 'Explorador de la Fe',
      role: (rawCurrentUser.email?.toLowerCase() === 'armandoriascos16@gmail.com' || rawCurrentUser.email === 'harmonymusis@gmail.com' || rawCurrentUser.email === 'harmonyestampadosr@gmail.com' || rawCurrentUser.role === 'admin' || rawCurrentUser.role === 'superadmin') ? (rawCurrentUser.role || 'admin') : 'user',
      badges: Array.isArray(rawCurrentUser.badges) ? rawCurrentUser.badges : [],
      followingIds: Array.isArray(rawCurrentUser.followingIds) ? rawCurrentUser.followingIds : [],
      followerIds: Array.isArray(rawCurrentUser.followerIds) ? rawCurrentUser.followerIds : [],
      savedPostIds: Array.isArray(rawCurrentUser.savedPostIds) ? rawCurrentUser.savedPostIds : [],
      joinedEventIds: Array.isArray(rawCurrentUser.joinedEventIds) ? rawCurrentUser.joinedEventIds : [],
      stats: rawCurrentUser.stats || {
        challengesCompleted: 0,
        eventsAttended: 0,
        missionsDone: 0,
        badgesCount: 0,
        prayerStreak: 0,
        bibleReadingStreak: 0,
        activeStreakDays: 0,
      },
      privacy: rawCurrentUser.privacy || {
        isProfilePublic: true,
        showLocation: true,
        allowDirectMessages: true,
        allowPrayerMentions: true,
      }
    };
  }, [rawCurrentUser, currentUserId]);


  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('apdf_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [stories, setStories] = useState<Story[]>(() => {
    const saved = localStorage.getItem('apdf_stories');
    const parsed: Story[] = saved ? JSON.parse(saved) : INITIAL_STORIES;
    const now = Date.now();
    return parsed.filter(s => {
      const expTime = parseTimeToMillis(s.expiresAt);
      if (expTime > 0) return expTime > now;
      const createdTime = parseTimeToMillis(s.createdAt);
      if (createdTime > 0) return now - createdTime < 24 * 60 * 60 * 1000;
      return true;
    });
  });

  const [storyCommentsMap, setStoryCommentsMap] = useState<Record<string, StoryComment[]>>(() => {
    const saved = localStorage.getItem('apdf_story_comments');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading cached story comments:', e);
      }
    }
    const initialMap: Record<string, StoryComment[]> = {};
    if (INITIAL_STORIES[0] && INITIAL_STORIES[0].comments) {
      initialMap[INITIAL_STORIES[0].id] = INITIAL_STORIES[0].comments;
    }
    return initialMap;
  });

  const [storyReactionsMap, setStoryReactionsMap] = useState<Record<string, StoryReaction[]>>(() => {
    const saved = localStorage.getItem('apdf_story_reactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading cached story reactions:', e);
      }
    }
    return {};
  });

  const [storyViewsMap, setStoryViewsMap] = useState<Record<string, StoryView[]>>(() => {
    const saved = localStorage.getItem('apdf_story_views');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Error reading cached story views:', e);
      }
    }
    return {};
  });

  // Limpieza en tiempo real de estados que alcancen las 24 horas exactas
  useEffect(() => {
    const purgeExpiredStories = () => {
      const now = Date.now();
      setStories(prev => {
        const active = prev.filter(s => {
          if (!s.expiresAt) return true;
          const exp = new Date(s.expiresAt).getTime();
          return isNaN(exp) || exp > now;
        });
        if (active.length !== prev.length) {
          safeLocalStorageSet('apdf_stories', JSON.stringify(active));
          return active;
        }
        return prev;
      });
    };

    purgeExpiredStories();
    const interval = setInterval(purgeExpiredStories, 15000);
    return () => clearInterval(interval);
  }, []);

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    const saved = localStorage.getItem('apdf_challenges');
    return saved ? JSON.parse(saved) : INITIAL_CHALLENGES;
  });

  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>(() => {
    const saved = localStorage.getItem('apdf_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('apdf_events_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some((e: any) => e.officialSourceName)) {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_EVENTS;
  });

  const [officialSources] = useState<OfficialSource[]>(OFFICIAL_SOURCES);

  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(() => {
    const saved = localStorage.getItem('apdf_prayers');
    return saved ? JSON.parse(saved) : INITIAL_PRAYER_REQUESTS;
  });

  const [prayerCircles, setPrayerCircles] = useState<PrayerCircle[]>(() => {
    const saved = localStorage.getItem('apdf_prayer_circles');
    return saved ? JSON.parse(saved) : INITIAL_PRAYER_CIRCLES;
  });

  const [biblePlans, setBiblePlans] = useState<BiblePlan[]>(() => {
    const saved = localStorage.getItem('apdf_bible_plans');
    return saved ? JSON.parse(saved) : INITIAL_BIBLE_PLANS;
  });

  const [dailyVerse] = useState<DailyVerse>(TODAY_VERSE);

  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('apdf_testimonials');
    return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
  });

  const [churches] = useState<Church[]>(INITIAL_CHURCHES);

  const [communities, setCommunities] = useState<Community[]>(() => {
    const saved = localStorage.getItem('apdf_communities');
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITIES;
  });

  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>(() => {
    const saved = localStorage.getItem('apdf_discussions');
    return saved ? JSON.parse(saved) : INITIAL_DISCUSSIONS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const userSaved = localStorage.getItem(`apdf_notifications_${currentUserId}`);
    if (userSaved) {
      try {
        return JSON.parse(userSaved);
      } catch {
        // fallback
      }
    }
    const saved = localStorage.getItem('apdf_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);
  const [contentUnavailableMessage, setContentUnavailableMessage] = useState<string | null>(null);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const [conversations, setConversations] = useState<ChatConversation[]>(() => {
    const saved = localStorage.getItem('apdf_conversations');
    return saved ? JSON.parse(saved) : INITIAL_CONVERSATIONS;
  });

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('apdf_messages');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewingSubmissionId, setViewingSubmissionId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // MÓDULO 3: Contador Real de Usuarios & Ledger de Puntos
  const [registeredUsersCount, setRegisteredUsersCount] = useState<number>(1);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [invitations, setInvitations] = useState<FriendInvitation[]>([]);

  useEffect(() => {
    safeLocalStorageSet('apdf_saved_accounts', JSON.stringify(savedAccounts.slice(0, 2)));
  }, [savedAccounts]);


  const refreshUsersCount = async (): Promise<number> => {
    try {
      const count = await getRealUsersCountFromFirestore();
      setRegisteredUsersCount(count > 0 ? count : 1);
      return count;
    } catch {
      return allUsers.length;
    }
  };

  // Sync with localStorage safely
  useEffect(() => {
    safeLocalStorageSet('apdf_users', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    safeLocalStorageSet('apdf_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    safeLocalStorageSet('apdf_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    safeLocalStorageSet('apdf_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    safeLocalStorageSet('apdf_challenges', JSON.stringify(challenges));
  }, [challenges]);

  useEffect(() => {
    safeLocalStorageSet('apdf_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    safeLocalStorageSet('apdf_events_v2', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    safeLocalStorageSet('apdf_prayers', JSON.stringify(prayerRequests));
  }, [prayerRequests]);

  useEffect(() => {
    safeLocalStorageSet('apdf_prayer_circles', JSON.stringify(prayerCircles));
  }, [prayerCircles]);

  useEffect(() => {
    safeLocalStorageSet('apdf_bible_plans', JSON.stringify(biblePlans));
  }, [biblePlans]);

  useEffect(() => {
    safeLocalStorageSet('apdf_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    safeLocalStorageSet('apdf_communities', JSON.stringify(communities));
  }, [communities]);

  useEffect(() => {
    safeLocalStorageSet('apdf_discussions', JSON.stringify(discussions));
  }, [discussions]);

  useEffect(() => {
    safeLocalStorageSet('apdf_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    safeLocalStorageSet('apdf_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (currentUserId) {
      safeLocalStorageSet(`apdf_notifications_${currentUserId}`, JSON.stringify(notifications));
    }
    safeLocalStorageSet('apdf_notifications', JSON.stringify(notifications));
  }, [notifications, currentUserId]);

  // Real-time synchronization of notifications from Cloud Firestore for the active user
  useEffect(() => {
    if (!currentUserId) return;

    // Load cached notifications for this user first
    const cached = localStorage.getItem(`apdf_notifications_${currentUserId}`);
    if (cached) {
      try {
        setNotifications(JSON.parse(cached));
      } catch (e) {
        console.warn('Error reading cached user notifications:', e);
      }
    }

    // Subscribe to real-time notifications from Firestore for this user
    const unsubscribe = subscribeToUserNotificationsFromFirestore(currentUserId, (userNotifs: NotificationItem[]) => {
      if (userNotifs && userNotifs.length > 0) {
        setNotifications(userNotifs);
        safeLocalStorageSet(`apdf_notifications_${currentUserId}`, JSON.stringify(userNotifs));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserId]);

  // Synchronize with Cloud Firestore on mount
  useEffect(() => {
    const initAndSyncFirestore = async () => {
      await initializeFirestoreData();
      try {
        const [
          postsRes, 
          challengesRes, 
          eventsRes, 
          prayersRes, 
          testimonialsRes, 
          submissionsRes, 
          usersRes, 
          storiesRes,
          countRes,
          txsRes
        ] = await Promise.allSettled([
          getPostsFromFirestore(),
          getChallengesFromFirestore(),
          getEventsFromFirestore(),
          getPrayersFromFirestore(),
          getTestimonialsFromFirestore(),
          getSubmissionsFromFirestore(),
          getAllUsersFromFirestore(),
          getStoriesFromFirestore(),
          getRealUsersCountFromFirestore(),
          auth.currentUser ? getAllPointTransactionsFromFirestore() : Promise.resolve([]),
        ]);

        if (postsRes.status === 'fulfilled' && postsRes.value.length > 0) {
          const cloudPosts = postsRes.value;
          setPosts(prev => {
            const map = new Map<string, Post>();
            prev.forEach(p => map.set(p.id, p));
            cloudPosts.forEach(p => map.set(p.id, p));
            return Array.from(map.values()).sort(
              (a, b) => getPostTimestamp(b) - getPostTimestamp(a)
            );
          });
        }

        if (storiesRes.status === 'fulfilled' && storiesRes.value.length > 0) {
          const cloudStories = storiesRes.value;
          setStories(prev => {
            const now = Date.now();
            const map = new Map<string, Story>();
            prev.forEach(s => {
              const expTime = parseTimeToMillis(s.expiresAt);
              const createdTime = parseTimeToMillis(s.createdAt);
              const isUnexpired = expTime > 0 ? expTime > now : (createdTime > 0 ? now - createdTime < 24 * 60 * 60 * 1000 : true);
              if (isUnexpired) map.set(s.id, s);
            });
            cloudStories.forEach(s => {
              const expTime = parseTimeToMillis(s.expiresAt);
              const createdTime = parseTimeToMillis(s.createdAt);
              const isUnexpired = expTime > 0 ? expTime > now : (createdTime > 0 ? now - createdTime < 24 * 60 * 60 * 1000 : true);
              if (isUnexpired) map.set(s.id, s);
            });
            const merged = Array.from(map.values()).sort(
              (a, b) => parseTimeToMillis(b.createdAt) - parseTimeToMillis(a.createdAt)
            );
            safeLocalStorageSet('apdf_stories', JSON.stringify(merged));
            return merged;
          });
        }

        if (challengesRes.status === 'fulfilled' && challengesRes.value.length > 0) setChallenges(challengesRes.value);
        if (eventsRes.status === 'fulfilled' && eventsRes.value.length > 0) setEvents(eventsRes.value);
        if (prayersRes.status === 'fulfilled' && prayersRes.value.length > 0) setPrayerRequests(prayersRes.value);
        if (testimonialsRes.status === 'fulfilled' && testimonialsRes.value.length > 0) setTestimonials(testimonialsRes.value);
        if (submissionsRes.status === 'fulfilled' && submissionsRes.value.length > 0) setSubmissions(submissionsRes.value);
        if (txsRes.status === 'fulfilled' && txsRes.value.length > 0) setPointTransactions(txsRes.value);
        if (countRes.status === 'fulfilled' && countRes.value > 0) {
          setRegisteredUsersCount(countRes.value);
        }

        // Only real users from Firestore without demo mocks
        if (usersRes.status === 'fulfilled' && usersRes.value.length > 0) {
          const authenticUsers = usersRes.value.filter(u => 
            !['user_david', 'user_sarah', 'user_mateo', 'user_valeria', 'user_samuel'].includes(u.id) &&
            !u.email?.endsWith('@ejemplo.com') &&
            !u.isDemo
          );
          if (authenticUsers.length > 0) {
            setAllUsers(authenticUsers);
            setRegisteredUsersCount(authenticUsers.length);
          }
        }
      } catch (err: any) {
        const isPermission = err?.code === 'permission-denied' || String(err?.message).includes('insufficient permissions');
        if (isPermission) {
          console.warn('[Firestore] Consulta inicial con restricciones de permisos de seguridad:', err?.code || err?.message);
        } else {
          console.info('[Firestore] Sincronización en proceso con datos verificados en almacenamiento local.');
        }
      }
    };

    initAndSyncFirestore();
  }, []);

  // Suscripción en tiempo real a usuarios registrados reales en Cloud Firestore
  useEffect(() => {
    const unsubscribeUsers = subscribeToUsersFromFirestore((liveUsers) => {
      const realUsers = liveUsers.filter(u => 
        !['user_david', 'user_sarah', 'user_mateo', 'user_valeria', 'user_samuel'].includes(u.id) &&
        !u.email?.endsWith('@ejemplo.com') &&
        !u.isDemo
      );
      if (realUsers.length > 0) {
        setAllUsers(realUsers);
        setRegisteredUsersCount(realUsers.length);
      }
    });

    return () => {
      unsubscribeUsers();
    };
  }, []);

  // Suscripción en tiempo real a publicaciones en Cloud Firestore (con fusión segura)
  useEffect(() => {
    const unsubscribe = subscribeToPostsFromFirestore((cloudPosts) => {
      if (cloudPosts && cloudPosts.length > 0) {
        setPosts(prev => {
          const map = new Map<string, Post>();
          prev.forEach(p => map.set(p.id, p));
          cloudPosts.forEach(p => map.set(p.id, p));
          const merged = Array.from(map.values()).sort(
            (a, b) => getPostTimestamp(b) - getPostTimestamp(a)
          );
          safeLocalStorageSet('apdf_posts', JSON.stringify(merged));
          return merged;
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Suscripción en tiempo real a estados de 24 horas en Cloud Firestore (con fusión segura)
  useEffect(() => {
    const unsubscribeStories = subscribeToStoriesFromFirestore((cloudStories) => {
      if (cloudStories && cloudStories.length > 0) {
        setStories(prev => {
          const now = Date.now();
          const map = new Map<string, Story>();
          prev.forEach(s => {
            const exp = s.expiresAt ? new Date(s.expiresAt).getTime() : 0;
            if (!exp || exp > now) map.set(s.id, s);
          });
          cloudStories.forEach(s => {
            const exp = s.expiresAt ? new Date(s.expiresAt).getTime() : 0;
            if (!exp || exp > now) map.set(s.id, s);
          });
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          safeLocalStorageSet('apdf_stories', JSON.stringify(merged));
          return merged;
        });
      }
    });

    return () => {
      unsubscribeStories();
    };
  }, []);

  // Sincronización continua de sesión activa con Firebase Auth y gestor de 2 cuentas
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Carga inicial de datos de perfil con try-catch detallado (sin secretos)
          let profile: User | null = null;
          try {
            profile = await fetchUserProfileByUid(user.uid);
            if (profile) {
              setAllUsers(prev => {
                const exists = prev.some(u => u.id === user.uid);
                if (exists) return prev.map(u => u.id === user.uid ? { ...u, ...profile } : u);
                return [profile!, ...prev];
              });
            }
          } catch (profileReadError: any) {
            const isPermission = profileReadError?.code === 'permission-denied' || String(profileReadError?.message).includes('insufficient permissions');
            console.error('[Initial Profile Load Capture]', JSON.stringify({
              operation: 'getDoc',
              collection: 'users',
              targetDocId: user.uid ? `${user.uid.slice(0, 8)}...` : 'empty',
              isAuthenticated: true,
              authUidPrefix: user.uid ? `${user.uid.slice(0, 8)}...` : 'empty',
              errorCode: profileReadError?.code || 'unknown',
              errorMessage: profileReadError?.message || String(profileReadError),
              errorCategory: isPermission ? 'PERMISSION_DENIED' : 'NETWORK_OR_TRANSPORT',
              timestamp: new Date().toISOString()
            }));
          }

          const sessionData: SessionAccount = {
            uid: user.uid,
            email: user.email || profile?.email || '',
            displayName: user.displayName || (profile ? `${profile.name} ${profile.lastName}`.trim() : 'Joven Cristiano'),
            username: profile?.username || user.email?.split('@')[0],
            photoURL: user.photoURL || profile?.avatar || '',
            church: profile?.church,
            city: profile?.city,
            points: profile?.points || 0,
            level: profile?.level || 1,
            slot: 1,
            lastActive: new Date().toISOString(),
            providerId: user.providerData?.[0]?.providerId || 'google.com'
          };
          const res = saveSession(sessionData);
          setSavedSessions(res.sessions);
          setSavedAccounts(res.sessions.map(s => ({
            id: s.uid,
            email: s.email,
            name: s.displayName,
            username: s.username,
            avatar: s.photoURL,
            church: s.church,
            points: s.points,
            level: s.level,
            lastActive: s.lastActive,
            slot: s.slot,
            providerId: s.providerId
          })));

          // La cuenta autenticada en Firebase Auth es el usuario activo primario
          const targetUid = user.uid;

          setCurrentUserId(targetUid);
          setActiveSessionUid(targetUid);
          setSelectedUserId(null); // Limpiar perfil seleccionado anterior para que siempre cargue el propio

          // Registrar evento de auditoría de autenticación
          recordAuthEventInFirestore({
            id: `ev_${Date.now()}_${user.uid.slice(0, 5)}`,
            userId: user.uid,
            userEmail: user.email || '',
            userName: user.displayName || profile?.name || 'Usuario',
            eventType: 'login',
            providerId: user.providerData?.[0]?.providerId || 'password',
            timestamp: new Date().toISOString()
          }).catch(() => {});
        } catch (err) {
          console.warn('Error al procesar sesión activa:', err);
        }
      } else {
        const activeStored = getActiveSessionUid();
        const storedSessions = getSavedSessions();
        if (activeStored && storedSessions.some(s => s.uid === activeStored || s.id === activeStored)) {
          setCurrentUserId(activeStored);
        } else if (storedSessions.length > 0) {
          setCurrentUserId(storedSessions[0].uid);
          setActiveSessionUid(storedSessions[0].uid);
        }
      }
      setIsAuthReady(true);
    });

    const unsubscribeAuthEvents = subscribeToAuthEventsFromFirestore((events) => {
      if (events && events.length > 0) {
        setAuthEvents(events);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeAuthEvents();
    };
  }, []);

  // Dark mode class toggle
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#ef4444', '#f97316', '#fbbf24', '#ffffff']
      });
    } catch {
      // Safe fallback
    }
  };

  const loginAs = (userId: string) => {
    setCurrentUserId(userId);
    setActiveSessionUid(userId);
    setSelectedUserId(null);
    localStorage.setItem('apdf_current_user_id', userId);
    localStorage.setItem('apdf_registered', 'true');
  };

  // Registro automático de la cuenta activa en la lista de cuentas guardadas en el dispositivo (máximo 2)
  useEffect(() => {
    if (!currentUser || !currentUser.id || currentUser.isDemo) return;
    if (currentUser.id === ADMIN_USER.id && !currentUser.email) return;

    setSavedAccounts(prev => {
      const existingIndex = prev.findIndex(a => a.id === currentUser.id || (currentUser.email && a.email.toLowerCase() === currentUser.email.toLowerCase()));
      const accountData: SavedAccount = {
        id: currentUser.id,
        email: currentUser.email || '',
        name: `${currentUser.name} ${currentUser.lastName}`.trim(),
        username: currentUser.username,
        avatar: currentUser.avatar,
        church: currentUser.church,
        points: currentUser.points,
        level: currentUser.level,
        lastActive: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...accountData };
        return updated;
      }

      if (prev.length < 2) {
        return [...prev, accountData];
      }

      return prev;
    });
  }, [currentUser.id, currentUser.email, currentUser.name, currentUser.avatar, currentUser.points, currentUser.level]);

  const addSavedAccount = (account: SavedAccount): boolean => {
    const sessionData: SessionAccount = {
      uid: account.id,
      email: account.email,
      displayName: account.name,
      username: account.username,
      photoURL: account.avatar,
      church: account.church,
      points: account.points,
      level: account.level,
      lastActive: new Date().toISOString(),
      slot: account.slot || 1,
      providerId: account.providerId || 'password'
    };
    const res = saveSession(sessionData);
    setSavedSessions(res.sessions);
    setSavedAccounts(res.sessions.map(s => ({
      id: s.uid,
      email: s.email,
      name: s.displayName,
      username: s.username,
      avatar: s.photoURL,
      church: s.church,
      points: s.points,
      level: s.level,
      lastActive: s.lastActive,
      slot: s.slot,
      providerId: s.providerId
    })));
    return res.success;
  };

  const removeSavedAccount = (accountId: string) => {
    const updated = removeSession(accountId);
    setSavedSessions(updated);
    setSavedAccounts(updated.map(s => ({
      id: s.uid,
      email: s.email,
      name: s.displayName,
      username: s.username,
      avatar: s.photoURL,
      church: s.church,
      points: s.points,
      level: s.level,
      lastActive: s.lastActive,
      slot: s.slot,
      providerId: s.providerId
    })));
  };

  const switchAccountSession = async (targetUid: string): Promise<boolean> => {
    setIsAccountSwitching(true);
    setAccountSwitchingMessage('Cambiando a cuenta...');
    try {
      // 1. Reset selectedUserId para que PlayerCardProfile muestre la cuenta recién activada
      setSelectedUserId(null);

      // 2. Obtener o verificar perfil de la cuenta destino
      let profile = allUsers.find(u => u.id === targetUid);
      if (!profile) {
        const matched = savedSessions.find(s => s.uid === targetUid || s.id === targetUid);
        if (matched) {
          const fallbackProfile = createDefaultProfileFromSession(matched);
          profile = fallbackProfile;
          setAllUsers(prev => {
            const exists = prev.some(u => u.id === targetUid);
            if (exists) return prev;
            return [fallbackProfile, ...prev];
          });
        }
        // Buscar perfil más reciente en la nube de fondo
        fetchUserProfileByUid(targetUid).then(fetched => {
          if (fetched) {
            setAllUsers(prev => {
              const exists = prev.some(u => u.id === targetUid);
              if (exists) return prev.map(u => u.id === targetUid ? { ...u, ...fetched } : u);
              return [fetched, ...prev];
            });
          }
        }).catch(() => {});
      }

      // 3. Establecer como cuenta activa en estado y localStorage
      setCurrentUserId(targetUid);
      setActiveSessionUid(targetUid);
      localStorage.setItem('apdf_current_user_id', targetUid);
      localStorage.setItem('apdf_registered', 'true');

      // 4. Cargar notificaciones específicas de este usuario
      const cachedNotifs = localStorage.getItem(`apdf_notifications_${targetUid}`);
      if (cachedNotifs) {
        try {
          setNotifications(JSON.parse(cachedNotifs));
        } catch {
          // ignore
        }
      }

      // 5. Actualizar fecha de actividad en las sesiones y cuentas guardadas
      setSavedSessions(prev => {
        const updated = prev.map(s => 
          (s.uid === targetUid || s.id === targetUid) ? { ...s, lastActive: new Date().toISOString() } : s
        );
        safeLocalStorageSet('apdf_auth_sessions_v2', JSON.stringify(updated));
        return updated;
      });

      setSavedAccounts(prev => prev.map(a => 
        a.id === targetUid ? { ...a, lastActive: new Date().toISOString() } : a
      ));

      // 6. Limpiar modales y estados temporales
      setSelectedPostForDetail(null);
      setContentUnavailableMessage(null);

      return true;
    } catch (err) {
      console.warn('Error al cambiar de sesión de cuenta:', err);
      return false;
    } finally {
      setTimeout(() => {
        setIsAccountSwitching(false);
        setAccountSwitchingMessage(null);
      }, 150);
    }
  };

  const switchAccount = async (accountId: string): Promise<boolean> => {
    return switchAccountSession(accountId);
  };

  const removeAccountSession = (uid: string) => {
    const updated = removeSession(uid);
    setSavedSessions(updated);
    setSavedAccounts(prev => prev.filter(a => a.id !== uid));
  };

  const addAccountSession = (session: SessionAccount): boolean => {
    const res = saveSession(session);
    if (res.success) {
      setSavedSessions(res.sessions);
      return true;
    }
    return false;
  };

  const registerUser = (userData: Partial<User>) => {
    const authUid = auth.currentUser?.uid;
    const newId = userData.id || authUid || `user_${Date.now()}`;
    const levelInfo = calculateLevel(0);
    const newUser: User = {
      id: newId,
      name: userData.name || 'Joven',
      lastName: userData.lastName || 'Cristiano',
      username: (userData.username || (userData.name ? userData.name.toLowerCase().replace(/\s+/g, '_') : `joven_${Date.now()}`)),
      email: userData.email || auth.currentUser?.email || 'joven@ejemplo.com',
      avatar: userData.avatar || auth.currentUser?.photoURL || '',
      emailVerified: auth.currentUser?.emailVerified || false,
      age: userData.age || 18,
      birthDate: userData.birthDate || '2008-01-01',
      city: userData.city || 'Bogotá',
      country: userData.country || 'Colombia',
      church: userData.church || 'Iglesia Adventista Central',
      district: userData.district || 'Distrito Central',
      zone: userData.zone || 'Zona 1',
      isAdventist: userData.isAdventist ?? true,
      yearsServing: userData.yearsServing || 1,
      ministries: userData.ministries || ['Ministerio Juvenil JA'],
      activities: userData.activities || ['trabajar_jovenes'],
      maritalStatus: userData.maritalStatus || 'soltero',
      interests: userData.interests || ['Biblia', 'Música', 'Misión'],
      bio: userData.bio || '¡Comenzando mi aventura en A Prueba de Fuego con 00 puntos para la gloria de Dios!',
      points: 0,
      level: levelInfo.level,
      levelName: levelInfo.name,
      role: 'user',
      isOfficialVerified: false,
      badges: [],
      stats: {
        challengesCompleted: 0,
        eventsAttended: 0,
        missionsDone: 0,
        badgesCount: 0,
        prayerStreak: 1,
        bibleReadingStreak: 1,
        activeStreakDays: 1,
      },
      privacy: {
        isProfilePublic: true,
        showLocation: true,
        allowDirectMessages: true,
        allowPrayerMentions: true,
      },
      followingIds: ['admin_official'],
      followerIds: [],
      savedPostIds: [],
      joinedEventIds: [],
    };

    setAllUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newId);
    setActiveTab('inicio');
    triggerCelebration();

    // Persist user to Firestore if authenticated with Firebase
    if (auth.currentUser) {
      saveUserToFirestore(newUser).catch(e => console.warn('Cloud user save fallback:', e));
    }

    // Welcome notification
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        type: 'challenge_new',
        title: '¡Bienvenido a A Prueba de Fuego!',
        message: 'Tu aventura comienza con 00 puntos. Participa en retos y eventos para forjar tu carácter.',
        read: false,
        createdAt: 'Hace un momento',
      },
      ...prev
    ]);
  };

  const createPost = (newPostData: Partial<Post>) => {
    const authorUid = auth.currentUser?.uid || currentUser.id;
    const newPost: Post = {
      id: `p_${Date.now()}`,
      authorId: authorUid,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      authorPoints: currentUser.points,
      authorIsOfficial: currentUser.isOfficialVerified,
      authorChurch: currentUser.church,
      authorLevel: currentUser.level,
      createdAt: 'Justo ahora',
      content: newPostData.content || '',
      imageUrl: newPostData.imageUrl || '',
      videoUrl: newPostData.videoUrl || '',
      videoPoster: newPostData.videoPoster || '',
      videoDuration: newPostData.videoDuration,
      mediaType: newPostData.mediaType || (newPostData.videoUrl ? 'video' : newPostData.imageUrl ? 'image' : 'image'),
      bibleVerse: newPostData.bibleVerse?.trim() || '',
      tags: newPostData.tags || ['AbaPadre', 'JuventudAdventista'],
      viewsCount: 1,
      reactions: {
        amen: 0,
        aleluya: 0,
        gloriaDios: 0,
        diosEsBueno: 0,
        bendiciones: 0,
        estoyOrando: 0,
        meInspiro: 0,
      },
      userReactions: {},
      comments: [],
      sharesCount: 0,
      isOfficial: (currentUser.role === 'superadmin' || currentUser.role === 'admin') 
        ? Boolean(newPostData.isOfficial) 
        : false,
    };

    setPosts(prev => {
      const remaining = prev.filter(p => p.id !== newPost.id);
      const updated = [newPost, ...remaining];
      safeLocalStorageSet('apdf_posts', JSON.stringify(updated));
      return updated;
    });
    createPostInFirestore(newPost).catch(e => console.warn('Firestore post creation fallback:', e));
    triggerCelebration();
  };

  const toggleReaction = (postId: string, reaction: ReactionType) => {
    setPosts(prev => prev.map(post => {
      if (post.id !== postId) return post;
      
      const currentList = post.userReactions[currentUser.id] || [];
      const hasReaction = currentList.includes(reaction);

      const nextList = hasReaction 
        ? currentList.filter(r => r !== reaction)
        : [...currentList, reaction];

      const diff = hasReaction ? -1 : 1;
      const newCount = Math.max(0, (post.reactions[reaction] || 0) + diff);

      const updatedReactions = {
        ...post.reactions,
        [reaction]: newCount,
      };

      const updatedUserReactions = {
        ...post.userReactions,
        [currentUser.id]: nextList,
      };

      updatePostInFirestore(postId, {
        reactions: updatedReactions,
        userReactions: updatedUserReactions
      }).catch(e => console.warn('Firestore update reaction fallback:', e));

      // Sync reaction record
      if (!hasReaction) {
        saveReactionInFirestore({
          id: `react_${postId}_${currentUser.id}_${reaction}`,
          postId,
          userId: currentUser.id,
          userName: `${currentUser.name} ${currentUser.lastName}`.trim(),
          type: reaction,
          createdAt: new Date().toISOString()
        }).catch(e => console.warn('Firestore reaction save fallback:', e));

        // Notificar al autor de la publicación si no es el mismo usuario
        if (post.authorId && post.authorId !== currentUser.id) {
          const notifId = `notif_react_${postId}_${currentUser.id}`;
          const reactionNotification: NotificationItem = {
            id: notifId,
            userId: post.authorId,
            actorId: currentUser.id,
            actorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
            actorUsername: currentUser.username,
            actorAvatar: currentUser.avatar,
            type: 'reaction',
            title: 'Nueva reacción',
            message: `${currentUser.name} reaccionó a tu publicación.`,
            read: false,
            createdAt: new Date().toISOString(),
            targetId: postId,
            targetType: 'post'
          };
          createNotificationInFirestore(reactionNotification, post.authorId)
            .catch(e => console.warn('Notification reaction fallback:', e));
        }
      } else {
        deleteReactionInFirestore(`react_${postId}_${currentUser.id}_${reaction}`)
          .catch(e => console.warn('Firestore reaction delete fallback:', e));
      }

      return {
        ...post,
        reactions: updatedReactions,
        userReactions: updatedUserReactions,
      };
    }));
  };

  const addComment = (
    postId: string, 
    content: string, 
    sticker?: string, 
    parentId?: string | null, 
    replyToUsername?: string
  ) => {
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      postId,
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      authorChurch: currentUser.church,
      content,
      sticker,
      createdAt: 'Hace un momento',
      likes: 0,
      likedUserIds: [],
      parentId: parentId || null,
      replyToUsername: replyToUsername || undefined,
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const nextComments = [...p.comments, newComment];
        updatePostInFirestore(postId, { comments: nextComments })
          .catch(e => console.warn('Firestore comment fallback:', e));
        createCommentInFirestore(newComment, postId)
          .catch(e => console.warn('Firestore create comment fallback:', e));

        // Notificar al autor de la publicación si no es el mismo usuario
        if (p.authorId && p.authorId !== currentUser.id) {
          const commentNotification: NotificationItem = {
            id: `notif_comment_${Date.now()}_${currentUser.id}`,
            userId: p.authorId,
            actorId: currentUser.id,
            actorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
            actorUsername: currentUser.username,
            actorAvatar: currentUser.avatar,
            type: 'comment',
            title: 'Nuevo comentario',
            message: `${currentUser.name} comentó en tu publicación: "${content.length > 50 ? content.slice(0, 47) + '...' : content}"`,
            read: false,
            createdAt: new Date().toISOString(),
            targetId: postId,
            targetType: 'post'
          };
          createNotificationInFirestore(commentNotification, p.authorId)
            .catch(e => console.warn('Notification comment fallback:', e));
        }

        return {
          ...p,
          comments: nextComments,
        };
      }
      return p;
    }));
  };

  const toggleLikeComment = (postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const updatedComments = p.comments.map(c => {
          if (c.id === commentId) {
            const likedIds = c.likedUserIds || [];
            const hasLiked = likedIds.includes(currentUser.id);
            const nextLikedIds = hasLiked
              ? likedIds.filter(uid => uid !== currentUser.id)
              : [...likedIds, currentUser.id];
            const nextLikes = hasLiked ? Math.max(0, c.likes - 1) : c.likes + 1;
            return {
              ...c,
              likes: nextLikes,
              likedUserIds: nextLikedIds,
            };
          }
          return c;
        });

        updatePostInFirestore(postId, { comments: updatedComments })
          .catch(e => console.warn('Firestore comment like update fallback:', e));

        return { ...p, comments: updatedComments };
      }
      return p;
    }));
  };

  const incrementPostViews = (postId: string) => {
    try {
      const sessionKey = `apdf_viewed_${currentUser.id}_${postId}`;
      if (sessionStorage.getItem(sessionKey)) {
        return; // Deduplicado: ya contado en esta sesión
      }
      sessionStorage.setItem(sessionKey, '1');
    } catch {
      // fallback seguro si sessionStorage no está accesible
    }

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newViews = (p.viewsCount || 0) + 1;
        updatePostInFirestore(postId, { viewsCount: newViews })
          .catch(e => console.warn('Firestore view counter fallback:', e));
        return { ...p, viewsCount: newViews };
      }
      return p;
    }));
  };

  const isStoryExpired = (story: Story): boolean => {
    if (!story || !story.expiresAt) return false;
    const exp = new Date(story.expiresAt).getTime();
    return !isNaN(exp) && exp <= Date.now();
  };

  const getStoryComments = (storyId: string): StoryComment[] => {
    return storyCommentsMap[storyId] || [];
  };

  const getStoryReactions = (storyId: string): StoryReaction[] => {
    return storyReactionsMap[storyId] || [];
  };

  const getStoryViews = (storyId: string): StoryView[] => {
    return storyViewsMap[storyId] || [];
  };

  const createStory = (storyData: Partial<Story>) => {
    const createdAtIso = new Date().toISOString();
    // Expiración calculada exactamente a las 24 horas (86,400,000 milisegundos)
    const expiresAtIso = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const authorUid = auth.currentUser?.uid || currentUser.id;

    const newStory: Story = {
      id: `st_${Date.now()}`,
      authorId: authorUid,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      category: storyData.category || 'reflexion',
      mediaUrl: storyData.mediaUrl || 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800&auto=format&fit=crop&q=80',
      mediaType: storyData.mediaType || (storyData.mediaUrl?.startsWith('data:video') ? 'video' : 'image'),
      textContent: storyData.textContent?.trim() || '',
      bibleVerse: storyData.bibleVerse?.trim() || '',
      createdAt: createdAtIso,
      expiresAt: expiresAtIso,
      viewsCount: 0,
      reactionsCount: 0,
      reactionsBreakdown: {},
      userReactions: {},
      commentsCount: 0,
      comments: [],
      audio: storyData.audio,
      audioUrl: storyData.audioUrl || storyData.audio?.audioUrl,
      audioTitle: storyData.audioTitle || storyData.audio?.title,
      audioArtist: storyData.audioArtist || storyData.audio?.artist,
      audioDuration: storyData.audioDuration || storyData.audio?.duration,
      audioType: storyData.audioType || storyData.audio?.type,
      audioLicense: storyData.audioLicense || storyData.audio?.license,
      audioAttribution: storyData.audioAttribution || storyData.audio?.attribution,
    };

    setStories(prev => {
      const remaining = prev.filter(s => s.id !== newStory.id);
      const updated = [newStory, ...remaining];
      safeLocalStorageSet('apdf_stories', JSON.stringify(updated));
      return updated;
    });

    createStoryInFirestore(newStory).catch(e => console.warn('Firestore create story fallback:', e));
  };

  const deleteStory = (storyId: string) => {
    setStories(prev => {
      const remaining = prev.filter(s => s.id !== storyId);
      safeLocalStorageSet('apdf_stories', JSON.stringify(remaining));
      return remaining;
    });
    deleteStoryInFirestore(storyId).catch(e => console.warn('Firestore delete story fallback:', e));
  };

  const addStoryComment = async (
    storyId: string, 
    content: string, 
    stickerData?: ChristianSticker, 
    parentId?: string | null, 
    replyToUsername?: string,
    replyToUserId?: string
  ): Promise<void> => {
    const targetStory = stories.find(s => s.id === storyId);
    if (!targetStory) throw new Error('El estado no fue encontrado.');
    if (isStoryExpired(targetStory)) {
      throw new Error('El estado ha expirado y ya no puede recibir nuevos comentarios.');
    }

    const newComment: StoryComment = {
      id: `stc_${Date.now()}`,
      storyId,
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      authorChurch: currentUser.church,
      content: content.trim(),
      sticker: stickerData?.id,
      stickerData,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedUserIds: [],
      parentId: parentId || null,
      replyToUsername,
      replyToUserId,
    };

    // Actualización local
    setStoryCommentsMap(prev => {
      const currentList = prev[storyId] || [];
      const nextList = [...currentList, newComment];
      const nextMap = { ...prev, [storyId]: nextList };
      safeLocalStorageSet('apdf_story_comments', JSON.stringify(nextMap));
      return nextMap;
    });

    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      const count = (s.commentsCount || 0) + 1;
      return {
        ...s,
        commentsCount: count,
        comments: [...(s.comments || []), newComment]
      };
    }));

    // Sincronización en Cloud Firestore
    try {
      await addStoryCommentInFirestore(storyId, newComment);
    } catch (err) {
      console.warn('Firestore addStoryComment fallback:', err);
    }
  };

  const toggleStoryReaction = async (
    storyId: string, 
    reactionKey: string, 
    type: 'emoji' | 'sticker', 
    emoji?: string, 
    label?: string, 
    stickerData?: ChristianSticker
  ): Promise<void> => {
    const targetStory = stories.find(s => s.id === storyId);
    if (!targetStory) throw new Error('El estado no fue encontrado.');
    if (isStoryExpired(targetStory)) {
      throw new Error('El estado ha expirado y ya no admite nuevas reacciones.');
    }

    const currentReactions = storyReactionsMap[storyId] || [];
    const existing = currentReactions.find(r => r.userId === currentUser.id);
    const isRemoving = existing && existing.reactionKey === reactionKey;

    let updatedList: StoryReaction[];
    if (isRemoving) {
      updatedList = currentReactions.filter(r => r.userId !== currentUser.id);
    } else {
      const newReaction: StoryReaction = {
        id: `react_${storyId}_${currentUser.id}`,
        storyId,
        userId: currentUser.id,
        userName: `${currentUser.name} ${currentUser.lastName}`.trim(),
        userUsername: currentUser.username,
        userAvatar: currentUser.avatar,
        userChurch: currentUser.church,
        type,
        reactionKey,
        emoji,
        label,
        stickerId: stickerData?.id,
        stickerData,
        createdAt: new Date().toISOString(),
      };
      updatedList = [...currentReactions.filter(r => r.userId !== currentUser.id), newReaction];
    }

    // Actualizar mapa
    setStoryReactionsMap(prev => {
      const nextMap = { ...prev, [storyId]: updatedList };
      safeLocalStorageSet('apdf_story_reactions', JSON.stringify(nextMap));
      return nextMap;
    });

    // Actualizar story
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      const userReactions = { ...(s.userReactions || {}) };
      if (isRemoving) {
        delete userReactions[currentUser.id];
      } else {
        userReactions[currentUser.id] = reactionKey;
      }
      return {
        ...s,
        reactionsCount: updatedList.length,
        userReactions,
      };
    }));

    // Firestore
    try {
      if (isRemoving) {
        await deleteStoryReactionInFirestore(storyId, currentUser.id);
      } else {
        const reactionDoc: StoryReaction = {
          id: `react_${storyId}_${currentUser.id}`,
          storyId,
          userId: currentUser.id,
          userName: `${currentUser.name} ${currentUser.lastName}`.trim(),
          userUsername: currentUser.username,
          userAvatar: currentUser.avatar,
          userChurch: currentUser.church,
          type,
          reactionKey,
          emoji,
          label,
          stickerId: stickerData?.id,
          stickerData,
          createdAt: new Date().toISOString(),
        };
        await saveStoryReactionInFirestore(storyId, reactionDoc);
      }
    } catch (err) {
      console.warn('Firestore toggleStoryReaction fallback:', err);
    }
  };

  const recordStoryView = async (storyId: string): Promise<boolean> => {
    const targetStory = stories.find(s => s.id === storyId);
    if (!targetStory) return false;

    // Regla 6: No contar al propietario como espectador de su propio estado
    if (currentUser.id === targetStory.authorId) {
      return false;
    }

    // Regla 4: Máximo una visualización por usuario autenticado durante la vida del estado
    const currentViews = storyViewsMap[storyId] || [];
    const alreadyViewed = currentViews.some(v => v.viewerId === currentUser.id);
    if (alreadyViewed) {
      return false;
    }

    const newView: StoryView = {
      id: currentUser.id,
      storyId,
      viewerId: currentUser.id,
      viewerName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      viewerUsername: currentUser.username,
      viewerAvatar: currentUser.avatar,
      viewerChurch: currentUser.church,
      viewedAt: new Date().toISOString(),
    };

    const nextViews = [...currentViews, newView];
    setStoryViewsMap(prev => {
      const nextMap = { ...prev, [storyId]: nextViews };
      safeLocalStorageSet('apdf_story_views', JSON.stringify(nextMap));
      return nextMap;
    });

    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s;
      return {
        ...s,
        viewsCount: (s.viewsCount || 0) + 1,
      };
    }));

    try {
      await recordStoryViewInFirestore(storyId, newView);
    } catch (err) {
      console.warn('Firestore recordStoryView fallback:', err);
    }
    return true;
  };

  const toggleLikeStoryComment = async (storyId: string, commentId: string, parentId?: string | null): Promise<void> => {
    setStoryCommentsMap(prev => {
      const list = prev[storyId] || [];
      const updated = list.map(c => {
        if (c.id === commentId) {
          const likedUserIds = c.likedUserIds || [];
          const hasLiked = likedUserIds.includes(currentUser.id);
          const nextLiked = hasLiked ? likedUserIds.filter(id => id !== currentUser.id) : [...likedUserIds, currentUser.id];
          const nextLikes = hasLiked ? Math.max(0, (c.likes || 1) - 1) : (c.likes || 0) + 1;
          return {
            ...c,
            likes: nextLikes,
            likedUserIds: nextLiked,
          };
        }
        return c;
      });
      const nextMap = { ...prev, [storyId]: updated };
      safeLocalStorageSet('apdf_story_comments', JSON.stringify(nextMap));
      return nextMap;
    });

    toggleStoryCommentLikeInFirestore(storyId, commentId, currentUser.id, parentId).catch(e => console.warn('Firestore toggleStoryCommentLike fallback:', e));
  };

  const submitChallengeEvidence = async (
    submissionData: Omit<ChallengeSubmission, 'id' | 'status' | 'submittedAt'>
  ): Promise<VerificationResult> => {
    // 1. Prevent duplicate rewards: check if already approved
    const existingApproved = submissions.find(
      s => s.userId === submissionData.userId && 
           s.challengeId === submissionData.challengeId && 
           s.status === 'approved'
    );
    if (existingApproved) {
      const errorResult: VerificationResult = {
        status: 'rejected',
        confidence: 1.0,
        pointsToAward: 0,
        feedbackMessage: 'Ya has completado este reto anteriormente y recibido sus puntos. Cada reto otorga puntos una sola vez.',
        reason: 'Ya has completado este reto anteriormente y recibido sus puntos. Cada reto otorga puntos una sola vez.',
        suggestedFeedback: '¡Excelente trabajo previo! Explora otros retos disponibles en la lista para seguir sumando puntos.'
      };
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          type: 'challenge_new',
          title: 'Reto ya aprobado',
          message: `Ya has completado "${submissionData.challengeTitle}" y tus puntos ya están acreditados.`,
          read: false,
          createdAt: 'Hace un momento',
        },
        ...prev
      ]);
      return errorResult;
    }

    // 2. Prevent concurrent pending submissions for the same challenge
    const existingPending = submissions.find(
      s => s.userId === submissionData.userId && 
           s.challengeId === submissionData.challengeId && 
           s.status === 'pending'
    );
    if (existingPending) {
      const pendingResult: VerificationResult = {
        status: 'pending',
        confidence: 0.9,
        pointsToAward: 0,
        feedbackMessage: 'Ya tienes una evidencia registrada para este reto en proceso de revisión de moderación.',
        reason: 'Ya tienes una evidencia registrada para este reto en proceso de revisión de moderación.',
        suggestedFeedback: 'Tu evidencia anterior sigue siendo evaluada con diligencia. Te notificaremos en cuanto cambie de estado.'
      };
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          type: 'challenge_new',
          title: 'Evidencia en revisión',
          message: `Tu evidencia previa para "${submissionData.challengeTitle}" ya está en cola de moderación.`,
          read: false,
          createdAt: 'Hace un momento',
        },
        ...prev
      ]);
      return pendingResult;
    }

    // 3. Find matching challenge
    const challenge = challenges.find(c => c.id === submissionData.challengeId);
    const pointsToAward = challenge?.points ?? 10;

    // 4. Run automated verification engine
    const verification = verifyChallengeEvidence(challenge, submissionData);

    const subId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const isApproved = verification.status === 'approved';

    const newSub: ChallengeSubmission = {
      ...submissionData,
      id: subId,
      status: verification.status,
      submittedAt: 'Justo ahora',
      verifiedAutomatically: isApproved,
      verificationConfidence: verification.confidence,
      verificationReason: verification.reason,
      moderatorFeedback: verification.suggestedFeedback,
      reviewedAt: isApproved ? 'Verificado automáticamente' : undefined,
      awardedPoints: isApproved ? pointsToAward : 0
    };

    // 5. Update submissions state & Firestore
    setSubmissions(prev => [newSub, ...prev]);
    createSubmissionInFirestore(newSub).catch(e => console.warn('Firestore submission fallback:', e));

    // 6. Handle outcomes
    if (isApproved) {
      // Award points atomically to user
      try {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.7 } });
      } catch {
        // Safe confetti fallback
      }

      setAllUsers(prevUsers => {
        return prevUsers.map(u => {
          if (u.id === submissionData.userId) {
            const nextPoints = (u.points || 0) + pointsToAward;
            const nextLevel = calculateLevel(nextPoints);
            const updatedUser: User = {
              ...u,
              points: nextPoints,
              level: nextLevel.level,
              levelName: nextLevel.name,
              completedChallengesCount: (u.completedChallengesCount || 0) + 1,
              stats: {
                ...u.stats,
                challengesCompleted: (u.stats?.challengesCompleted || 0) + 1
              }
            };
            // Persist to Firestore
            updateUserInFirestore(u.id, {
              points: nextPoints,
              level: nextLevel.level,
              levelName: nextLevel.name,
              completedChallengesCount: updatedUser.completedChallengesCount
            }).catch(e => console.warn('Firestore user update fallback:', e));
            return updatedUser;
          }
          return u;
        });
      });

      // Record PointTransaction
      const pointTx: PointTransaction = {
        id: `pt_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        userId: submissionData.userId,
        userName: submissionData.userName,
        points: pointsToAward,
        type: 'challenge_approved',
        description: `Reto juvenil cumplido: ${submissionData.challengeTitle}`,
        referenceId: subId,
        createdAt: new Date().toISOString(),
        awardedBy: 'Automático / Retos Juveniles'
      };
      setPointTransactions(prev => [pointTx, ...prev]);
      createPointTransactionInFirestore(pointTx).catch(e => console.warn('Firestore pt fallback:', e));

      // Increment challenge participant count
      setChallenges(prev => prev.map(c => 
        c.id === submissionData.challengeId ? { ...c, participantsCount: (c.participantsCount || 0) + 1 } : c
      ));

      // Notification
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          type: 'challenge_approved',
          title: `¡Reto Aprobado! +${pointsToAward} pts`,
          message: `Tu evidencia para "${submissionData.challengeTitle}" cumple con los requisitos. Se han sumado ${pointsToAward} puntos a tu perfil.`,
          read: false,
          createdAt: 'Hace un momento',
        },
        ...prev
      ]);
    } else if (verification.status === 'pending') {
      // Pending human moderation
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          type: 'challenge_new',
          title: 'Evidencia en revisión responsable',
          message: `Tu evidencia para "${submissionData.challengeTitle}" ha sido enviada a moderación. ${verification.reason}`,
          read: false,
          createdAt: 'Hace un momento',
        },
        ...prev
      ]);
    } else if (verification.status === 'more_info') {
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          type: 'challenge_new',
          title: 'Se requiere información adicional',
          message: `Para aprobar "${submissionData.challengeTitle}": ${verification.reason}`,
          read: false,
          createdAt: 'Hace un momento',
        },
        ...prev
      ]);
    }

    return verification;
  };

  const completeDailyChallenge = async (
    badge: Badge,
    points: number,
    challengeId: string,
    reflection?: string
  ): Promise<{ updatedUser: User; badge: Badge }> => {
    const nextPoints = currentUser.points + points;
    const nextLevel = calculateLevel(nextPoints);
    const updatedBadges = [...currentUser.badges];
    
    if (!updatedBadges.some(b => b.id === badge.id)) {
      updatedBadges.push({
        ...badge,
        unlockedAt: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
      });
    }

    // Milestone: Primer reto
    if (!updatedBadges.some(b => b.id === 'b1')) {
      updatedBadges.push(INITIAL_BADGES[0]);
    }
    // Milestone: 1,000 puntos
    if (nextPoints >= 1000 && !updatedBadges.some(b => b.id === 'b10')) {
      updatedBadges.push(INITIAL_BADGES[9]);
    }

    const updatedStats = {
      ...currentUser.stats,
      challengesCompleted: currentUser.stats.challengesCompleted + 1,
      badgesCount: updatedBadges.length,
      activeStreakDays: currentUser.stats.activeStreakDays + 1,
    };

    const updatedUser: User = {
      ...currentUser,
      points: nextPoints,
      level: nextLevel.level,
      levelName: nextLevel.name,
      badges: updatedBadges,
      stats: updatedStats,
    };

    // 1. Actualizar estado local
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    // 2. Guardar en Cloud Firestore (Usuario, Subcolección de Badges, Logro global y Submission aprobada)
    saveDailyChallengeRewardInFirestore(
      currentUser.id,
      updatedUser,
      badge,
      points,
      challengeId
    ).catch(e => console.warn('Error al persistir reto diario en Firestore:', e));

    // 3. Añadir a submissions aprobadas localmente
    const newSubmission: ChallengeSubmission = {
      id: `sub_daily_${currentUser.id}_${Date.now()}`,
      challengeId,
      challengeTitle: badge.name,
      challengePoints: points,
      userId: currentUser.id,
      userName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      userUsername: currentUser.username,
      userAvatar: currentUser.avatar,
      userChurch: currentUser.church,
      date: new Date().toISOString().split('T')[0],
      approximateLocation: currentUser.city || 'Buenaventura, Colombia',
      commentReflection: reflection || `¡Reto diario completado con éxito! Desbloqueada la insignia virtual: ${badge.name}`,
      mediaType: 'photo',
      mediaUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
      status: 'approved',
      submittedAt: 'Justo ahora',
      reviewedAt: 'Justo ahora',
      reviewedBy: 'Sistema de Recompensas JA',
    };
    setSubmissions(prev => [newSubmission, ...prev]);

    // Registrar en Ledger de Puntos
    const dailyTx: PointTransaction = {
      id: `tx_daily_${Date.now()}_${currentUser.id}`,
      userId: currentUser.id,
      userName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      points: points,
      type: 'daily_challenge',
      referenceId: challengeId,
      description: `Reto diario: "${badge.name}"`,
      createdAt: new Date().toISOString(),
      awardedBy: 'Sistema de Recompensas JA',
    };
    createPointTransactionInFirestore(dailyTx).catch(e => console.warn('Point tx error:', e));
    setPointTransactions(prev => [dailyTx, ...prev]);


    // 4. Notificación de logro
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        type: 'badge_earned',
        title: `¡Nueva Insignia Virtual: ${badge.name}!`,
        message: `Has completado el reto diario. Ganaste +${points} puntos y desbloqueaste la insignia "${badge.name}". Progreso guardado en Firestore.`,
        read: false,
        createdAt: 'Hace un momento',
      },
      ...prev
    ]);

    triggerCelebration();

    return { updatedUser, badge };
  };

  const adminReviewSubmission = (submissionId: string, status: SubmissionStatus, feedback?: string, pointsOverride?: number) => {
    const sub = submissions.find(s => s.id === submissionId);
    if (!sub) return;

    const awardedPoints = pointsOverride ?? sub.challengePoints;

    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          status,
          adminFeedback: feedback || (status === 'approved' ? `¡Evidencia verificada y aprobada por moderación! +${awardedPoints} puntos.` : 'Revisión actualizada.'),
          reviewedAt: 'Hace un momento',
          reviewedBy: currentUser.name,
        };
      }
      return s;
    }));

    // Update in Cloud Firestore
    updateSubmissionStatusInFirestore(submissionId, status, feedback, currentUser.name)
      .catch(e => console.warn('Firestore update submission status fallback:', e));

    if (status === 'approved') {
      // Award points to the user who submitted
      let updatedUserToSync: User | null = null;
      setAllUsers(prev => prev.map(u => {
        if (u.id === sub.userId) {
          const nextPoints = u.points + awardedPoints;
          const nextLevel = calculateLevel(nextPoints);
          const hadFirstChallengeBadge = u.badges.some(b => b.id === 'b1');
          const updatedBadges = [...u.badges];
          if (!hadFirstChallengeBadge) {
            updatedBadges.push(INITIAL_BADGES[0]);
          }
          if (nextPoints >= 1000 && !u.badges.some(b => b.id === 'b10')) {
            updatedBadges.push(INITIAL_BADGES[9]);
          }

          const updatedUser: User = {
            ...u,
            points: nextPoints,
            level: nextLevel.level,
            levelName: nextLevel.name,
            badges: updatedBadges,
            stats: {
              ...u.stats,
              challengesCompleted: u.stats.challengesCompleted + 1,
              badgesCount: updatedBadges.length,
            }
          };
          updatedUserToSync = updatedUser;
          return updatedUser;
        }
        return u;
      }));

      if (updatedUserToSync) {
        saveUserToFirestore(updatedUserToSync).catch(e => console.warn('Firestore award points fallback:', e));

        // Registrar movimiento de puntos auditable (Módulo 9)
        const newTx: PointTransaction = {
          id: `tx_${Date.now()}_${sub.userId}`,
          userId: sub.userId,
          userName: sub.userName,
          points: awardedPoints,
          type: 'challenge_approved',
          referenceId: sub.challengeId,
          description: `Reto aprobado: "${sub.challengeTitle}"`,
          createdAt: new Date().toISOString(),
          awardedBy: currentUser.name || 'Administración JA',
        };
        createPointTransactionInFirestore(newTx).catch(e => console.warn('Point tx save error:', e));
        setPointTransactions(prev => [newTx, ...prev]);
      }


      // Add notification for the user
      setNotifications(prev => [
        {
          id: `notif_${Date.now()}`,
          type: 'challenge_approved',
          title: '✅ ¡Reto Aprobado por el Administrador!',
          message: `Tu reto "${sub.challengeTitle}" fue verificado exitosamente. ¡Ganaste +${awardedPoints} puntos!`,
          read: false,
          createdAt: 'Hace un momento',
          pointsAwarded: awardedPoints,
        },
        ...prev
      ]);

      triggerCelebration();
    }
  };

  const adminCreateChallenge = (challengeData: Omit<Challenge, 'id' | 'participantsCount'>) => {
    const newChallenge: Challenge = {
      ...challengeData,
      id: `ch_${Date.now()}`,
      participantsCount: 1,
    };
    setChallenges(prev => [newChallenge, ...prev]);
    createChallengeInFirestore(newChallenge).catch(e => console.warn('Firestore challenge fallback:', e));
  };

  const adminCreateEvent = (eventData: Omit<EventItem, 'id' | 'interestedCount' | 'attendingCount'>) => {
    const newEvent: EventItem = {
      ...eventData,
      id: `ev_${Date.now()}`,
      interestedCount: 0,
      attendingCount: 0,
      isAttending: false,
      isInterested: false,
    };
    setEvents(prev => [newEvent, ...prev]);
    createEventInFirestore(newEvent).catch(e => console.warn('Firestore event fallback:', e));
  };

  const toggleEventParticipation = (eventId: string, type: 'attend' | 'interest') => {
    let newAttending = 0;
    let newInterested = 0;

    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      if (type === 'attend') {
        const nextAttending = !ev.isAttending;
        newAttending = ev.attendingCount + (nextAttending ? 1 : -1);
        newInterested = ev.interestedCount;
        return {
          ...ev,
          isAttending: nextAttending,
          attendingCount: newAttending,
        };
      } else {
        const nextInterested = !ev.isInterested;
        newInterested = ev.interestedCount + (nextInterested ? 1 : -1);
        newAttending = ev.attendingCount;
        return {
          ...ev,
          isInterested: nextInterested,
          interestedCount: newInterested,
        };
      }
    }));

    updateEventInFirestore(eventId, { attendingCount: Math.max(0, newAttending), interestedCount: Math.max(0, newInterested) })
      .catch(e => console.warn('Firestore event update fallback:', e));
  };

  const prayForRequest = (requestId: string) => {
    let nextCount = 0;
    const targetReq = prayerRequests.find(pr => pr.id === requestId);
    const wasAlreadyPraying = targetReq?.prayingUserIds.includes(currentUser.id) ?? false;

    setPrayerRequests(prev => prev.map(pr => {
      if (pr.id !== requestId) return pr;
      const alreadyPraying = pr.prayingUserIds.includes(currentUser.id);
      const nextUserIds = alreadyPraying 
        ? pr.prayingUserIds.filter(id => id !== currentUser.id)
        : [...pr.prayingUserIds, currentUser.id];
      
      nextCount = nextUserIds.length;
      return {
        ...pr,
        prayingCount: nextCount,
        prayingUserIds: nextUserIds,
      };
    }));

    // Si el usuario comenzó a orar y no es su propia petición, notificar al autor en Firestore
    if (!wasAlreadyPraying && targetReq && targetReq.authorId && targetReq.authorId !== currentUser.id) {
      const prayerNotif: NotificationItem = {
        id: `notif_pray_${Date.now()}_${currentUser.id}`,
        userId: targetReq.authorId,
        actorId: currentUser.id,
        actorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
        actorUsername: currentUser.username,
        actorAvatar: currentUser.avatar,
        type: 'prayer',
        title: '¡Están orando por ti! 🙏',
        message: `${currentUser.name} se unió en oración por tu petición: "${targetReq.title}".`,
        read: false,
        createdAt: new Date().toISOString(),
        targetId: requestId,
        targetType: 'prayer'
      };
      createNotificationInFirestore(prayerNotif, targetReq.authorId)
        .catch(e => console.warn('Notification prayer fallback:', e));
    }

    updatePrayerInFirestore(requestId, { prayingCount: nextCount })
      .catch(e => console.warn('Firestore pray update fallback:', e));
  };

  const toggleJoinBiblePlan = (planId: string) => {
    setBiblePlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      const alreadyJoined = p.joinedUserIds.includes(currentUser.id);
      const nextJoined = alreadyJoined 
        ? p.joinedUserIds.filter(id => id !== currentUser.id)
        : [...p.joinedUserIds, currentUser.id];
      return {
        ...p,
        joinedUserIds: nextJoined,
        participantsCount: p.participantsCount + (alreadyJoined ? -1 : 1),
      };
    }));
  };

  const toggleCompleteBiblePlanDay = (planId: string, dayNumber: number) => {
    setBiblePlans(prev => prev.map(p => {
      if (p.id !== planId) return p;
      return {
        ...p,
        days: p.days.map(d => d.dayNumber === dayNumber ? { ...d, completed: !d.completed } : d),
      };
    }));
    triggerCelebration();
  };

  const joinPrayerCircle = (circleId: string) => {
    setPrayerCircles(prev => prev.map(c => {
      if (c.id !== circleId) return c;
      const joined = c.memberIds.includes(currentUser.id);
      return {
        ...c,
        memberIds: joined ? c.memberIds.filter(id => id !== currentUser.id) : [...c.memberIds, currentUser.id],
      };
    }));
  };

  const createPrayerCircle = (name: string, description: string, isPrivate: boolean) => {
    const newCircle: PrayerCircle = {
      id: `circle_${Date.now()}`,
      name,
      description,
      avatar: '',
      isPrivate,
      church: currentUser.church,
      memberIds: [currentUser.id],
      createdAt: 'Justo ahora',
      requestsCount: 0,
    };
    setPrayerCircles(prev => [newCircle, ...prev]);
    triggerCelebration();
  };

  const createPrayerRequest = (data: Omit<PrayerRequest, 'id' | 'authorId' | 'authorName' | 'authorUsername' | 'authorAvatar' | 'authorChurch' | 'prayingCount' | 'prayingUserIds' | 'createdAt' | 'isAnswered'>) => {
    const newReq: PrayerRequest = {
      ...data,
      id: `pr_${Date.now()}`,
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      authorChurch: currentUser.church,
      isAnswered: false,
      prayingCount: 1,
      prayingUserIds: [currentUser.id],
      createdAt: 'Justo ahora',
    };
    setPrayerRequests(prev => [newReq, ...prev]);
    createPrayerInFirestore(newReq).catch(e => console.warn('Firestore prayer fallback:', e));
  };

  const markPrayerAnswered = (requestId: string, testimony: string) => {
    setPrayerRequests(prev => prev.map(pr => {
      if (pr.id === requestId) {
        return {
          ...pr,
          isAnswered: true,
          testimony,
        };
      }
      return pr;
    }));

    updatePrayerInFirestore(requestId, { isAnswered: true, testimony })
      .catch(e => console.warn('Firestore mark answered fallback:', e));

    // Also publish into testimonials automatically!
    const target = prayerRequests.find(p => p.id === requestId);
    if (target) {
      const newTestimonial: Testimonial = {
        id: `t_${Date.now()}`,
        authorId: target.authorId,
        authorName: target.authorName,
        authorUsername: target.authorUsername,
        authorAvatar: target.authorAvatar,
        authorChurch: target.authorChurch,
        title: `Respuesta a la oración: ${target.title}`,
        story: testimony,
        category: 'oracion_respondida',
        date: 'Hoy',
        amenCount: 1,
        praisedUserIds: [currentUser.id],
      };
      setTestimonials(prev => [newTestimonial, ...prev]);
      createTestimonialInFirestore(newTestimonial).catch(e => console.warn('Firestore testimonial fallback:', e));
    }
  };

  const createTestimonial = (data: Omit<Testimonial, 'id' | 'authorId' | 'authorName' | 'authorUsername' | 'authorAvatar' | 'authorChurch' | 'date' | 'amenCount' | 'praisedUserIds'>) => {
    const newT: Testimonial = {
      ...data,
      id: `t_${Date.now()}`,
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      authorChurch: currentUser.church,
      date: 'Hoy',
      amenCount: 1,
      praisedUserIds: [currentUser.id],
    };
    setTestimonials(prev => [newT, ...prev]);
    createTestimonialInFirestore(newT).catch(e => console.warn('Firestore testimonial fallback:', e));
  };

  const sendMessage = (conversationId: string, content: string, sticker?: string, isVoiceNote?: boolean) => {
    const newMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      senderId: currentUser.id,
      senderName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      senderAvatar: currentUser.avatar,
      content,
      sticker,
      isVoiceNote,
      voiceDuration: isVoiceNote ? '0:18' : undefined,
      timestamp: 'Ahora',
    };

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg],
    }));

    // Persist to Cloud Firestore
    createMessageInFirestore(newMsg, conversationId)
      .catch(e => console.warn('Firestore send message fallback:', e));

    setConversations(prev => prev.map(c => {
      if (c.id === conversationId) {
        return {
          ...c,
          lastMessage: sticker ? `Sticker: ${sticker}` : content,
          lastMessageTime: 'Ahora',
        };
      }
      return c;
    }));
  };

  const followUser = (targetUserId: string) => {
    const isFollowing = (currentUser.followingIds || []).includes(targetUserId);

    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          followingIds: isFollowing 
            ? (u.followingIds || []).filter(id => id !== targetUserId)
            : [...(u.followingIds || []), targetUserId],
        };
      }
      if (u.id === targetUserId) {
        return {
          ...u,
          followerIds: isFollowing 
            ? (u.followerIds || []).filter(id => id !== currentUser.id)
            : [...(u.followerIds || []), currentUser.id],
        };
      }
      return u;
    }));

    // Sincronización persistente en Cloud Firestore
    toggleFollowUserInFirestore(currentUser.id, targetUserId, isFollowing)
      .catch(e => console.warn('Firestore follow sync fallback:', e));

    // Notificar al usuario seguido cuando comienza el seguimiento
    if (!isFollowing && targetUserId !== currentUser.id) {
      const followNotif: NotificationItem = {
        id: `notif_follow_${Date.now()}_${currentUser.id}`,
        userId: targetUserId,
        actorId: currentUser.id,
        actorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
        actorUsername: currentUser.username,
        actorAvatar: currentUser.avatar,
        type: 'follow',
        title: 'Nuevo seguidor',
        message: `${currentUser.name} comenzó a seguirte.`,
        read: false,
        createdAt: new Date().toISOString(),
        targetId: currentUser.id,
        targetType: 'user'
      };
      createNotificationInFirestore(followNotif, targetUserId)
        .catch(e => console.warn('Notification follow fallback:', e));
    }
  };

  const awardQuizPoints = (points: number, reason: string) => {
    let updatedUserToSync: User | null = null;
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const nextPoints = u.points + points;
        const nextLevel = calculateLevel(nextPoints);
        const updated: User = {
          ...u,
          points: nextPoints,
          level: nextLevel.level,
          levelName: nextLevel.name,
        };
        updatedUserToSync = updated;
        return updated;
      }
      return u;
    }));

    if (updatedUserToSync) {
      saveUserToFirestore(updatedUserToSync).catch(e => console.warn('Firestore user points fallback:', e));
    }

    // Persist Game Score
    createGameScoreInFirestore({
      id: `score_${Date.now()}`,
      gameId: 'quiz_general',
      gameTitle: reason,
      userId: currentUser.id,
      userName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      userAvatar: currentUser.avatar,
      score: points,
      pointsAwarded: points,
      correctAnswers: 1,
      totalQuestions: 1,
      playedAt: new Date().toISOString()
    }).catch((e: any) => console.warn('Firestore game score fallback:', e));

    // Ledger de puntos auditable
    const quizTx: PointTransaction = {
      id: `tx_quiz_${Date.now()}_${currentUser.id}`,
      userId: currentUser.id,
      userName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      points: points,
      type: 'quiz_game',
      referenceId: `quiz_${Date.now()}`,
      description: `Trivia bíblica: "${reason}"`,
      createdAt: new Date().toISOString(),
      awardedBy: 'Sistema Bíblico JA',
    };
    createPointTransactionInFirestore(quizTx).catch(e => console.warn('Point tx save error:', e));
    setPointTransactions(prev => [quizTx, ...prev]);

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        type: 'badge_earned',
        title: '¡Puntos ganados en Juego Bíblico!',
        message: `Acabas de ganar +${points} puntos por completar "${reason}".`,
        read: false,
        createdAt: 'Hace un momento',
        pointsAwarded: points,
      },
      ...prev
    ]);

    triggerCelebration();
  };

  const sendFriendInvitation = async (
    data: Omit<FriendInvitation, 'id' | 'inviterUserId' | 'inviterName' | 'inviterChurch' | 'status' | 'createdAt'>
  ): Promise<FriendInvitation> => {
    const inviteId = `inv_${Date.now()}`;
    const newInvitation: FriendInvitation = {
      ...data,
      id: inviteId,
      inviterUserId: currentUser.id,
      inviterName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      inviterChurch: currentUser.church,
      status: 'sent',
      createdAt: new Date().toISOString(),
    };
    setInvitations(prev => [newInvitation, ...prev]);
    createInvitationInFirestore(newInvitation).catch(e => console.warn('Error saving invite to Firestore:', e));
    return newInvitation;
  };


  const savePost = (postId: string) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        const isSaved = u.savedPostIds.includes(postId);
        return {
          ...u,
          savedPostIds: isSaved 
            ? u.savedPostIds.filter(id => id !== postId)
            : [...u.savedPostIds, postId],
        };
      }
      return u;
    }));
  };

  const reportPost = (postId: string, reason: string) => {
    // Persist Report to Cloud Firestore
    createReportInFirestore({
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      targetType: 'post',
      targetId: postId,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    }).catch((e: any) => console.warn('Firestore report fallback:', e));

    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        type: 'comment',
        title: 'Publicación reportada para moderación',
        message: `El reporte por "${reason}" fue recibido por nuestro equipo de seguridad juvenil.`,
        read: false,
        createdAt: 'Justo ahora',
      },
      ...prev
    ]);
  };

  const deletePost = async (postId: string) => {
    const postToDelete = posts.find(p => p.id === postId);
    const remaining = posts.filter(p => p.id !== postId);
    setPosts(remaining);
    safeLocalStorageSet('apdf_posts', JSON.stringify(remaining));

    if (selectedPostForDetail?.id === postId) {
      setSelectedPostForDetail(null);
    }

    try {
      await deletePostInFirestore(postId);
    } catch (e) {
      console.warn('Firestore delete post fallback:', e);
    }

    // Clean up uploaded media file if not shared by other posts or stories
    if (postToDelete) {
      const mediaUrls = [postToDelete.videoUrl, postToDelete.imageUrl, postToDelete.videoPoster].filter(Boolean) as string[];
      for (const mUrl of mediaUrls) {
        if (mUrl && mUrl.includes('/uploads/')) {
          const isUsedByOtherPost = remaining.some(p => p.videoUrl === mUrl || p.imageUrl === mUrl || p.videoPoster === mUrl);
          const isUsedByStory = stories.some(s => s.mediaUrl === mUrl);
          if (!isUsedByOtherPost && !isUsedByStory) {
            deleteMediaFileFromServer(mUrl).catch(e => console.warn('Could not clean up file on server:', e));
          }
        }
      }
    }
  };

  const deleteChallenge = (challengeId: string) => {
    setChallenges(prev => prev.filter(c => c.id !== challengeId));
    deleteChallengeInFirestore(challengeId).catch(e => console.warn('Firestore delete challenge fallback:', e));
  };

  const deleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    deleteEventInFirestore(eventId).catch(e => console.warn('Firestore delete event fallback:', e));
  };

  const deletePrayerRequest = (prayerId: string) => {
    setPrayerRequests(prev => prev.filter(p => p.id !== prayerId));
    deletePrayerInFirestore(prayerId).catch(e => console.warn('Firestore delete prayer fallback:', e));
  };

  const deleteTestimonial = (testId: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== testId));
    deleteTestimonialInFirestore(testId).catch(e => console.warn('Firestore delete testimonial fallback:', e));
  };

  const updateUserProfile = (updates: Partial<User>) => {
    setAllUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, ...updates };
      }
      return u;
    }));

    // Sincronizar sesiones guardadas para que la privacidad y cambios persistan de inmediato
    setSavedSessions(prev => prev.map(s => {
      if (s.uid === currentUser.id || s.id === currentUser.id) {
        return {
          ...s,
          displayName: updates.name ? `${updates.name} ${updates.lastName || ''}`.trim() : s.displayName,
          photoURL: updates.avatar !== undefined ? updates.avatar : s.photoURL,
          church: updates.church !== undefined ? updates.church : s.church,
          city: updates.city !== undefined ? updates.city : s.city,
          points: updates.points !== undefined ? updates.points : s.points,
          level: updates.level !== undefined ? updates.level : s.level,
        };
      }
      return s;
    }));

    setSavedAccounts(prev => prev.map(a => {
      if (a.id === currentUser.id) {
        return {
          ...a,
          name: updates.name ? `${updates.name} ${updates.lastName || ''}`.trim() : a.name,
          avatar: updates.avatar !== undefined ? updates.avatar : a.avatar,
          church: updates.church !== undefined ? updates.church : a.church,
          points: updates.points !== undefined ? updates.points : a.points,
          level: updates.level !== undefined ? updates.level : a.level,
        };
      }
      return a;
    }));

    updateUserInFirestore(currentUser.id, updates).catch(e => console.warn('Firestore update profile fallback:', e));
  };

  const markNotificationRead = async (notificationId: string, read: boolean = true) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read } : n));
    try {
      await markNotificationReadInFirestore(notificationId, read);
    } catch (e) {
      console.warn('Could not update notification read status in Firestore:', e);
    }
  };

  const markAllNotificationsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await markAllUserNotificationsReadInFirestore(currentUser.id, unreadIds);
    } catch (e) {
      console.warn('Could not mark all notifications read in Firestore:', e);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    try {
      await deleteNotificationInFirestore(notificationId);
    } catch (e) {
      console.warn('Could not delete notification in Firestore:', e);
    }
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    // 1. Marcar automáticamente como leída
    if (!notif.read) {
      markNotificationRead(notif.id, true);
    }

    // 2. Destino según el tipo de interacción
    if (notif.type === 'follow' || notif.targetType === 'user') {
      const targetUserId = notif.actorId || notif.targetId;
      if (targetUserId) {
        setSelectedUserId(targetUserId);
        setActiveTab('perfil');
      }
      return;
    }

    if (notif.type === 'reaction' || notif.type === 'comment' || notif.targetType === 'post') {
      const postId = notif.targetId;
      if (postId) {
        const foundPost = posts.find(p => p.id === postId);
        if (foundPost) {
          setSelectedPostForDetail(foundPost);
        } else {
          setContentUnavailableMessage('Esta publicación ya no se encuentra disponible o fue eliminada por su autor.');
        }
      } else {
        setActiveTab('inicio');
      }
      return;
    }

    if (notif.type === 'challenge_approved' || notif.type === 'challenge_new' || notif.targetType === 'challenge') {
      setActiveTab('retos');
      return;
    }

    if (notif.type === 'event' || notif.targetType === 'event') {
      setActiveTab('eventos');
      return;
    }

    if (notif.type === 'prayer' || notif.targetType === 'prayer') {
      setActiveTab('oracion');
      return;
    }

    if (notif.type === 'badge_earned') {
      setSelectedUserId(currentUser.id);
      setActiveTab('perfil');
      return;
    }
  };

  const toggleJoinCommunity = (communityId: string) => {
    setCommunities(prev => prev.map(c => {
      if (c.id === communityId) {
        const isCurrentlyJoined = c.memberIds.includes(currentUser.id);
        const nextIds = isCurrentlyJoined
          ? c.memberIds.filter(id => id !== currentUser.id)
          : [...c.memberIds, currentUser.id];
        return {
          ...c,
          memberIds: nextIds,
          isJoined: !isCurrentlyJoined,
          membersCount: isCurrentlyJoined ? Math.max(1, c.membersCount - 1) : c.membersCount + 1,
        };
      }
      return c;
    }));
    triggerCelebration();
  };

  const createDiscussion = (data: { communityId: string; title: string; content: string; tags: string[] }) => {
    const newDiscussion: CommunityDiscussion = {
      id: `disc_${Date.now()}`,
      communityId: data.communityId,
      authorId: currentUser.id,
      authorName: `${currentUser.name} ${currentUser.lastName}`.trim(),
      authorAvatar: currentUser.avatar,
      authorChurch: currentUser.church,
      title: data.title,
      content: data.content,
      tags: data.tags,
      createdAt: 'Justo ahora',
      likesCount: 0,
      commentsCount: 0,
    };
    setDiscussions(prev => [newDiscussion, ...prev]);
    setCommunities(prev => prev.map(c => c.id === data.communityId ? { ...c, topicsCount: c.topicsCount + 1 } : c));
    triggerCelebration();
  };

  const likeDiscussion = (discussionId: string) => {
    setDiscussions(prev => prev.map(d => d.id === discussionId ? { ...d, likesCount: d.likesCount + 1 } : d));
  };

  const logout = async (): Promise<void> => {
    try {
      if (currentUserId) {
        removeSession(currentUserId);
      }
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut warning:', e);
    }
    const remaining = getSavedSessions();
    setSavedSessions(remaining);
    setSavedAccounts(remaining.map(s => ({
      id: s.uid,
      email: s.email,
      name: s.displayName,
      username: s.username,
      avatar: s.photoURL,
      church: s.church,
      points: s.points,
      level: s.level,
      lastActive: s.lastActive,
      slot: s.slot,
      providerId: s.providerId
    })));

    if (remaining.length > 0) {
      const nextAcc = remaining[0];
      setCurrentUserId(nextAcc.uid);
      setActiveSessionUid(nextAcc.uid);
      localStorage.setItem('apdf_current_user_id', nextAcc.uid);
    } else {
      setCurrentUserId('');
      localStorage.removeItem('apdf_current_user_id');
      localStorage.removeItem('apdf_active_session_uid');
      localStorage.removeItem('apdf_registered');
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      allUsers,
      setAllUsers,
      posts,
      stories,
      challenges,
      submissions,
      events,
      officialSources,
      prayerRequests,
      prayerCircles,
      biblePlans,
      dailyVerse,
      testimonials,
      churches,
      communities,
      discussions,
      notifications,
      conversations,
      messages,
      activeTab,
      setActiveTab,
      selectedUserId,
      setSelectedUserId,
      viewingSubmissionId,
      setViewingSubmissionId,
      activeConversationId,
      setActiveConversationId,
      isDarkMode,
      setIsDarkMode,
      loginAs,
      registerUser,
      createPost,
      toggleReaction,
      addComment,
      toggleLikeComment,
      incrementPostViews,
      createStory,
      deleteStory,
      addStoryComment,
      toggleStoryReaction,
      recordStoryView,
      toggleLikeStoryComment,
      getStoryComments,
      getStoryReactions,
      getStoryViews,
      isStoryExpired,
      submitChallengeEvidence,
      adminReviewSubmission,
      adminCreateChallenge,
      adminCreateEvent,
      toggleEventParticipation,
      prayForRequest,
      createPrayerRequest,
      markPrayerAnswered,
      createTestimonial,
      sendMessage,
      followUser,
      awardQuizPoints,
      savePost,
      reportPost,
      deletePost,
      deleteChallenge,
      deleteEvent,
      deletePrayerRequest,
      deleteTestimonial,
      updateUserProfile,
      unreadNotificationsCount,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      handleNotificationClick,
      selectedPostForDetail,
      setSelectedPostForDetail,
      contentUnavailableMessage,
      setContentUnavailableMessage,
      triggerCelebration,
      completeDailyChallenge,
      toggleJoinBiblePlan,
      toggleCompleteBiblePlanDay,
      joinPrayerCircle,
      createPrayerCircle,
      toggleJoinCommunity,
      createDiscussion,
      likeDiscussion,
      registeredUsersCount,
      pointTransactions,
      invitations,
      sendFriendInvitation,
      refreshUsersCount,
      savedAccounts,
      addSavedAccount,
      removeSavedAccount,
      switchAccount,
      savedSessions,
      switchAccountSession,
      removeAccountSession,
      addAccountSession,
      isAccountSwitching,
      accountSwitchingMessage,
      setIsAccountSwitching,
      isAuthenticated,
      isAuthReady,
      authEvents,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
