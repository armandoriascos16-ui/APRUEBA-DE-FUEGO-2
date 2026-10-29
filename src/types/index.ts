export type ReactionType = 
  | 'amen' 
  | 'aleluya' 
  | 'gloriaDios' 
  | 'diosEsBueno' 
  | 'bendiciones' 
  | 'estoyOrando' 
  | 'meInspiro';

export interface ReactionConfig {
  type: ReactionType;
  label: string;
  emoji: string;
  bgActive: string;
  textActive: string;
}

export const REACTION_CONFIGS: ReactionConfig[] = [
  { type: 'amen', label: 'Amén', emoji: '🙏', bgActive: 'bg-amber-500/20 border-amber-500/40', textActive: 'text-amber-400' },
  { type: 'aleluya', label: 'Aleluya', emoji: '🔥', bgActive: 'bg-orange-500/20 border-orange-500/40', textActive: 'text-orange-400' },
  { type: 'gloriaDios', label: 'Gloria a Dios', emoji: '❤️', bgActive: 'bg-rose-500/20 border-rose-500/40', textActive: 'text-rose-400' },
  { type: 'diosEsBueno', label: 'Dios es Bueno', emoji: '🙌', bgActive: 'bg-emerald-500/20 border-emerald-500/40', textActive: 'text-emerald-400' },
  { type: 'bendiciones', label: 'Bendiciones', emoji: '💪', bgActive: 'bg-blue-500/20 border-blue-500/40', textActive: 'text-blue-400' },
  { type: 'estoyOrando', label: 'Estoy Orando', emoji: '🙏', bgActive: 'bg-purple-500/20 border-purple-500/40', textActive: 'text-purple-400' },
  { type: 'meInspiro', label: 'Me Inspiró', emoji: '✨', bgActive: 'bg-yellow-500/20 border-yellow-500/40', textActive: 'text-yellow-400' },
];

export interface Badge {
  id: string;
  name: string;
  icon: string;
  imageUrl?: string;
  description: string;
  category: 'reto' | 'servicio' | 'fe' | 'puntos' | 'liderazgo';
  unlockedAt?: string;
}

export interface UserStats {
  challengesCompleted: number;
  eventsAttended: number;
  missionsDone: number;
  badgesCount: number;
  prayerStreak: number;
  bibleReadingStreak: number;
  activeStreakDays: number;
}

export interface UserPrivacy {
  isProfilePublic: boolean;
  showLocation: boolean;
  allowDirectMessages: boolean;
  allowPrayerMentions: boolean;
}

export interface User {
  id: string;
  name: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string;
  coverImage?: string;
  age: number;
  birthDate: string;
  city: string;
  state?: string;
  country: string;
  
  // Church and Ministry info
  church: string;
  district: string;
  zone: string;
  isAdventist: boolean;
  yearsServing: number;
  ministries: string[];
  activities: string[];
  maritalStatus: 'soltero' | 'casado';
  interests: string[];
  bio: string;
  
  // Gamification & Role
  points: number;
  level: number;
  levelName: string;
  role: 'superadmin' | 'admin' | 'moderator' | 'organizer' | 'user';
  isOfficialVerified: boolean;
  emailVerified?: boolean;
  isDemo?: boolean;
  badges: Badge[];
  completedChallengesCount?: number;
  stats: UserStats;
  privacy: UserPrivacy;
  
  // Social
  followingIds: string[];
  followerIds: string[];
  savedPostIds: string[];
  joinedEventIds: string[];

  // Persistence & Access Audit
  createdAt?: string;
  lastActive?: string;
  isProfileComplete?: boolean;
  loginCount?: number;
}

export interface AuthEvent {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  eventType: 'login' | 'register';
  timestamp: string;
  providerId?: string;
  userAgent?: string;
}

export interface SavedAccount {
  id: string; // Firebase Auth UID
  email: string;
  name: string;
  username?: string;
  avatar?: string;
  church?: string;
  points?: number;
  level?: number;
  lastActive: string;
  slot?: 1 | 2;
  providerId?: string; // 'google.com' | 'password'
}

export interface Comment {
  id: string;
  postId?: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorChurch?: string;
  content: string;
  sticker?: string;
  createdAt: string;
  likes: number;
  likedUserIds?: string[];
  parentId?: string | null; // ID del comentario padre si es una respuesta anidada
  replyToUsername?: string; // Nombre del usuario respondido (ej. @daniela_ja)
  replyToUserId?: string;
  replies?: Comment[]; // Respuestas anidadas
  repliesCount?: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorPoints: number;
  authorIsOfficial: boolean;
  authorChurch?: string;
  authorLevel?: number;
  createdAt: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  videoPoster?: string;
  videoDuration?: number;
  mediaType?: 'image' | 'video';
  bibleVerse?: string;
  tags: string[];
  viewsCount: number;
  reactions: Record<ReactionType, number>;
  userReactions: Record<string, ReactionType[]>; // userId -> ReactionType[]
  comments: Comment[];
  sharesCount: number;
  isOfficial?: boolean;
  officialSource?: {
    organization: string;
    url: string;
    verified: boolean;
  };
  recommendationReason?: string;
}

export interface StoryAudioMeta {
  audioUrl: string;
  duration: number; // en segundos (máximo 30s)
  type: 'recording' | 'upload' | 'catalog' | 'external';
  title: string;
  artist?: string;
  license?: string;
  attribution?: string;
  category?: string;
  mood?: string;
  sourceUrl?: string;
  trimStart?: number;
  trimEnd?: number;
  volume?: number;
}

export interface ChristianSticker {
  id: string;
  category: 
    | 'jesus' 
    | 'biblia' 
    | 'cruz' 
    | 'oracion' 
    | 'fe' 
    | 'paz' 
    | 'iglesia' 
    | 'segunda_venida' 
    | 'mensajes' 
    | 'simbolos';
  categoryLabel: string;
  title: string;
  verse?: string;
  emoji: string;
  shortPhrase: string;
  gradient: string;
  borderColor: string;
  textColor: string;
  iconType: 'cross' | 'heart' | 'book' | 'pray' | 'flame' | 'dove' | 'crown' | 'anchor' | 'shield' | 'sparkle' | 'sun' | 'fish';
}

export type StoryNormalEmoji = '❤️' | '👍' | '😂' | '😮' | '🙏' | '👏';

export interface StoryComment {
  id: string;
  storyId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorChurch?: string;
  content: string;
  sticker?: string;
  stickerData?: ChristianSticker;
  createdAt: string;
  likes: number;
  likedUserIds?: string[];
  parentId?: string | null;
  replyToUsername?: string;
  replyToUserId?: string;
  replies?: StoryComment[];
  repliesCount?: number;
}

export interface StoryReaction {
  id: string;
  storyId: string;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  userChurch?: string;
  type: 'emoji' | 'sticker';
  reactionKey: string; // '❤️', '👍', o el ID del sticker 'stk_...'
  emoji?: string;
  label?: string;
  stickerId?: string;
  stickerData?: ChristianSticker;
  createdAt: string;
}

export interface StoryView {
  id: string;
  storyId: string;
  viewerId: string;
  viewerName: string;
  viewerUsername: string;
  viewerAvatar: string;
  viewerChurch?: string;
  viewedAt: string;
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  category: 'oracion' | 'versiculo' | 'testimonio' | 'reflexion' | 'musica' | 'iglesia' | 'campamento';
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  textContent?: string;
  bibleVerse?: string;
  createdAt: string; // ISO string confiable
  expiresAt: string; // ISO string exacta (createdAt + 24h)
  viewsCount: number;
  views?: StoryView[];
  reactionsCount?: number;
  reactionsBreakdown?: Record<string, number>; // emoji o stickerId -> conteo
  userReactions?: Record<string, string>; // userId -> reactionKey activa
  commentsCount?: number;
  comments?: StoryComment[];
  // Audio opcional para estados con música cristiana (hasta 30 segundos)
  audio?: StoryAudioMeta;
  audioUrl?: string;
  audioTitle?: string;
  audioArtist?: string;
  audioDuration?: number;
  audioType?: 'recording' | 'upload' | 'catalog' | 'external';
  audioLicense?: string;
  audioAttribution?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  objective?: string;
  instructions?: string;
  category: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Épico';
  points: number;
  participantsCount: number;
  deadline: string;
  startDate?: string;
  requiredEvidence: string;
  evidenceType?: 'photo' | 'video' | 'text' | 'any';
  icon: string;
  imageUrl?: string;
  isOfficial: boolean;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'more_info';

export interface ChallengeSubmission {
  id: string;
  challengeId: string;
  challengeTitle: string;
  challengePoints: number;
  userId: string;
  userName: string;
  userUsername: string;
  userAvatar: string;
  userChurch: string;
  date: string;
  approximateLocation: string;
  commentReflection: string;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  status: SubmissionStatus;
  adminFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  studyTheme?: string;
  bibleVerseUsed?: string;
  materialsUsed?: string;
  verifiedAutomatically?: boolean;
  verificationConfidence?: number;
  verificationReason?: string;
  awardedPoints?: number;
  moderatorFeedback?: string;
}

export type EventTerritory = 'buenaventura' | 'asopacifico' | 'ucsur' | 'interamerica' | 'mundial';
export type EventStatus = 'proximo' | 'en_curso' | 'finalizado' | 'por_confirmar';

export interface EventItem {
  id: string;
  title: string;
  description: string;
  category: 'campamento' | 'retiro' | 'congreso' | 'mision_caleb' | 'concierto' | 'ja_especial' | 'capacitacion' | 'oracion' | 'asamblea';
  date: string;
  startDate?: string;
  endDate?: string;
  time: string;
  city: string;
  country: string;
  venue: string;
  organizer: string;
  isOfficialSource: boolean;
  officialSourceUrl?: string;
  officialOrganization?: string;
  officialSourceName?: string;
  verifiedAt?: string;
  status?: EventStatus;
  territory?: EventTerritory;
  isVirtual?: boolean;
  interestedCount: number;
  attendingCount: number;
  imageUrl: string;
  isAttending?: boolean;
  isInterested?: boolean;
  scope: 'local' | 'ciudad' | 'asociacion' | 'union' | 'nacional' | 'division' | 'internacional';
}

export interface OfficialSource {
  id: string;
  name: string;
  organization: string;
  region: string;
  websiteUrl: string;
  logo: string;
  verified: boolean;
  description: string;
  lastUpdated: string;
  eventCount: number;
}

export interface PrayerRequest {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorChurch: string;
  title: string;
  description: string;
  isAnswered: boolean;
  testimony?: string;
  prayingCount: number;
  prayingUserIds: string[];
  createdAt: string;
  category: 'salud' | 'familia' | 'mision' | 'estudios' | 'espiritual';
}

export interface Testimonial {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorChurch: string;
  title: string;
  story: string;
  category: 'milagro' | 'oracion_respondida' | 'mision_caleb' | 'fe_en_crisis';
  date: string;
  amenCount: number;
  praisedUserIds: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  mediaUrl?: string;
  sticker?: string;
  isVoiceNote?: boolean;
  voiceDuration?: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  isGroup: boolean;
  name: string;
  avatar: string;
  participantIds: string[];
  category?: 'musica' | 'evangelismo' | 'jovenes' | 'campamentos' | 'estudios_biblicos' | 'ministerios';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  verseRef: string;
  explanation: string;
  points: number;
}

export interface Church {
  id: string;
  name: string;
  district: string;
  zone: string;
  city: string;
  country: string;
  address: string;
  pastor: string;
  youthLeader: string;
  youthCount: number;
  websiteUrl?: string;
  activeEventsCount: number;
  officialSourceUrl?: string;
  verifiedAt?: string;
}

export interface DistrictPlan {
  id: string;
  title: string;
  districtId: string;
  districtName: string;
  organizerDepartment: string;
  date: string;
  time?: string;
  venue: string;
  description: string;
  officialSourceUrl: string;
  officialSourceName: string;
  verifiedAt: string;
  status: 'proximo' | 'en_curso' | 'finalizado' | 'por_confirmar';
  isZonalOrDistrictWide?: boolean;
}

export interface BuenaventuraChurch {
  id: string;
  districtId: string;
  name: string;
  address: string;
  neighborhoodOrSector: string;
  city: string;
  pastor: string;
  youthLeader?: string;
  schedule: string;
  officialSourceUrl: string;
  officialSourceName: string;
  verifiedAt: string;
  verificationStatus: 'verificado_oficial' | 'en_proceso_secretaria';
  notes?: string;
}

export interface BuenaventuraDistrict {
  id: string;
  name: string;
  zone: 'Zona Buenaventura';
  association: 'Asociación del Pacífico';
  union: 'Unión Colombiana del Sur';
  headquartersChurch: string;
  verificationStatus: 'verificado_oficial' | 'en_proceso_secretaria';
  officialSourceUrl: string;
  officialSourceName: string;
  lastVerifiedAt: string;
  pastor?: string;
  churches: BuenaventuraChurch[];
  plans: DistrictPlan[];
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId?: string; // Recipient user ID in Firestore
  actorId?: string; // User who generated the notification
  actorName?: string;
  actorUsername?: string;
  actorAvatar?: string;
  type: 'reaction' | 'comment' | 'follow' | 'challenge_approved' | 'challenge_new' | 'event' | 'badge_earned' | 'prayer';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  targetId?: string; // ID of the referenced post, user, challenge, event, or prayer
  targetType?: 'post' | 'comment' | 'user' | 'challenge' | 'event' | 'prayer';
  pointsAwarded?: number;
}

export interface ChannelItem {
  id: string;
  title: string;
  category: 'musica' | 'predicaciones' | 'estudios_biblicos' | 'devocionales' | 'noticias_iasd';
  creator: string;
  thumbnail: string;
  duration: string;
  views: string;
  verifiedOfficial: boolean;
  url: string;
}

export interface ReactionRecord {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  type: ReactionType;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'post' | 'user' | 'comment' | 'submission';
  targetId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
  reviewedBy?: string;
  resolutionNotes?: string;
}

export type NewsCategory = 
  | 'institucional' 
  | 'juvenil' 
  | 'mision' 
  | 'campamentos' 
  | 'internacional'
  | 'nacionales_internacionales'
  | 'iglesias_comunidades'
  | 'evangelismo_misiones'
  | 'educacion_formacion'
  | 'musica_eventos'
  | 'salud_familia_servicio';

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  sourceName: string;
  sourceUrl?: string;
  category: NewsCategory | string;
  publishedAt: string;
  imageUrl?: string;
  verified: boolean;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  category: 'trivia' | 'verdadero_falso' | 'completa_versiculo' | 'personajes';
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  questionsCount: number;
  pointsReward: number;
  icon: string;
  active: boolean;
}

export interface GameScore {
  id: string;
  gameId: string;
  gameTitle: string;
  userId: string;
  userName: string;
  userAvatar: string;
  score: number;
  pointsAwarded: number;
  correctAnswers: number;
  totalQuestions: number;
  playedAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
  description: string;
  pointsAwarded: number;
  unlockedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: 'musica' | 'evangelismo' | 'jovenes' | 'campamentos' | 'estudios_biblicos' | 'ministerios';
  leaderId: string;
  leaderName: string;
  memberIds: string[];
  isPublic: boolean;
  createdAt: string;
}

export interface BiblePlanDay {
  dayNumber: number;
  title: string;
  reading: string;
  verseText: string;
  completed: boolean;
}

export interface BiblePlan {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  category: 'jesus' | 'oracion' | 'evangelio' | 'fe' | 'jovenes';
  coverImage: string;
  days: BiblePlanDay[];
  participantsCount: number;
  joinedUserIds: string[];
}

export interface PrayerCircle {
  id: string;
  name: string;
  description: string;
  avatar: string;
  isPrivate: boolean;
  church?: string;
  memberIds: string[];
  createdAt: string;
  requestsCount: number;
}

export interface DailyVerse {
  reference: string;
  text: string;
  theme: string;
  date: string;
  imageUrl?: string;
}

export type CommunityCategory = 
  | 'jovenes'
  | 'conquistadores'
  | 'musica'
  | 'evangelismo'
  | 'mision'
  | 'estudiantes_universitarios';

export interface Community {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: CommunityCategory;
  avatar: string;
  bannerUrl: string;
  membersCount: number;
  memberIds: string[];
  isJoined?: boolean;
  topicsCount: number;
  featuredVerse: string;
  rules: string[];
  moderators: { id: string; name: string; avatar: string }[];
  accentColor: string;
  activities: string[];
}export interface ChristianBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  category: 'Elena G. de White' | 'Vida Devocional' | 'Juventud y Crecimiento' | 'Liderazgo y Misión' | 'Biblia y Doctrina';
  year?: number;
  description: string;
  language: string;
  format: 'Lector Digital' | 'PDF Oficial' | 'Enlace Autorizado';
  officialSourceUrl: string;
  isPublicDomainOrAuthorized: boolean;
  chapters: {
    chapterNumber: number;
    title: string;
    content: string[];
  }[];
}

export interface AdventistHymn {
  number: number;
  title: string;
  category: 'Alabanza y Adoración' | 'Jesucristo y Gracia' | 'Sábado y Descanso' | 'Esperanza y Segunda Venida' | 'Misión y Servicio' | 'Consagración';
  stanzas: string[][];
  chorus?: string[];
  biblicalTheme: string;
  key?: string;
  officialSourceUrl: string;
}

export interface LiveStreamSession {
  id: string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  hostAvatar: string;
  isOfficial: boolean;
  startedAt: string;
  viewerCount: number;
  isActive: boolean;
  category: 'culto_juvenil' | 'oracion_en_vivo' | 'musica_y_alabanza' | 'estudio_biblico' | 'taller';
  streamType?: 'youtube' | 'audio' | 'camera' | 'hls' | 'webrtc';
  streamUrl?: string;
  audioUrl?: string;
  youtubeId?: string;
  teveoToken?: string;
  officialSiteUrl?: string;
  dialOrFrequency?: string;
  city?: string;
  status?: 'preparing' | 'connecting' | 'live' | 'ended';
  signaling?: Record<string, any>;
  chatMessages: {
    id: string;
    userName: string;
    message: string;
    timestamp: string;
  }[];
}

export interface PointTransaction {
  id: string;
  userId: string;
  userName: string;
  points: number;
  type: 'challenge_approved' | 'daily_challenge' | 'quiz_game' | 'mission_event' | 'admin_adjustment';
  referenceId: string;
  description: string;
  createdAt: string;
  awardedBy: string;
}

export interface FriendInvitation {
  id: string;
  inviterUserId: string;
  inviterName: string;
  inviterChurch?: string;
  recipientName?: string;
  message: string;
  activityType: 'app' | 'church_service' | 'youth_society' | 'prayer' | 'bible_reading';
  activityTitle?: string;
  inviteCode: string;
  inviteUrl: string;
  status: 'sent' | 'opened' | 'accepted';
  createdAt: string;
}


export interface VerifiedCreator {
  id: string;
  name: string;
  platform: 'YouTube' | 'Instagram' | 'Facebook' | 'TikTok';
  handle: string;
  profileUrl: string;
  avatarUrl: string;
  description: string;
  verifiedOfficial: boolean;
  accountType?: 'institucional' | 'creador_independiente';
  category: 'Música y Alabanza' | 'Predicaciones y Sermones' | 'Juventud JA' | 'Estudio Bíblico y Escuela Sabática' | 'Institucional' | string;
  lastVerifiedDate: string;
}

export interface AdventistVideo {
  id: string;
  title: string;
  channelName: string;
  channelUrl?: string;
  youtubeId: string;
  thumbnailUrl: string;
  description: string;
  category: 'musica' | 'predicacion' | 'testimonios' | 'estudios_biblicos' | 'jovenes' | 'evangelismo' | 'eventos';
  duration: string;
  publishedDate: string;
  isOfficialChannel: boolean;
  sourceUrl: string;
}

export interface AdventistCampEvent {
  id: string;
  title: string;
  description: string;
  organization: string;
  region: string;
  startDate: string;
  endDate: string;
  location: string;
  bulletinPdfUrl?: string;
  registrationUrl: string;
  registrationDeadline: string;
  officialCost: string;
  requirements: string[];
  lastVerifiedDate: string;
  imageUrl: string;
  category: 'camporee' | 'congreso' | 'retiro' | 'mision_caleb';
  scope: 'local' | 'asociacion' | 'union' | 'division';
}

// ============================================================================
// PORTAL: IDEAS JA & FONDOS (BIBLIOTECA COLABORATIVA Y PLANES DE TRABAJO)
// ============================================================================

export type IdeaStatus = 
  | 'draft'               // Borrador
  | 'pending'             // Pendiente de revisión
  | 'in_review'           // En revisión
  | 'approved'            // Aprobada y publicada
  | 'changes_requested'   // Requiere cambios
  | 'rejected'            // Rechazada
  | 'withdrawn';          // Retirada

export type IdeaType = 'propuesta' | 'experiencia' | 'experiencia_revisada' | 'plan_trabajo';

export interface IdeaBudgetItem {
  item: string;
  quantity?: number;
  unitCost?: string;
  totalCost?: string;
  sourceOfFunding?: string;
}

export interface IdeaAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'pdf';
  sizeKb: number;
}

export interface IdeaComment {
  id: string;
  ideaId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorChurch?: string;
  content: string;
  createdAt: string;
  likesCount?: number;
  likedUserIds?: string[];
}

export interface IdeaRating {
  id: string;
  ideaId: string;
  userId: string;
  rating: number; // 1 to 5
  createdAt: string;
}

export interface IdeaAuditLog {
  action: 'submitted' | 'updated' | 'approved' | 'changes_requested' | 'rejected' | 'withdrawn';
  actorId: string;
  actorName: string;
  timestamp: string;
  notes?: string;
}

export interface IdeaItem {
  id: string;
  title: string;
  category: string;
  type: IdeaType;
  status: IdeaStatus;
  
  // Autor
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorChurch?: string;
  isAuthorAdmin?: boolean;

  // Descripción general y objetivos
  description: string;
  objective: string;
  problemOrNeedAddressed?: string;
  targetAudience: string;
  approxParticipants?: string;
  estimatedDuration: string;
  
  // Preparación y ejecución
  materialsRequired: string[];
  priorPreparation?: string;
  stepByStepGuide: string[];
  teamResponsibilities?: { role: string; responsibility: string }[];
  
  // Presupuesto y planificación
  budgetOverview?: string;
  currency?: string;
  budgetItems?: IdeaBudgetItem[];
  availableResources?: string;
  neededResources?: string;
  possibleFundingSources?: string;
  
  // Post-ejecución (para experiencias compartidas)
  whatWentWell?: string;
  difficultiesEncountered?: string;
  observedResults?: string;
  recommendationsForNextTime?: string;
  tipsForOtherChurches?: string;
  dateConducted?: string;
  
  // Adaptabilidad y evaluación
  adaptationsForChurchSize?: string;
  evaluationMethod?: string;
  
  // Adjuntos y derechos
  attachments?: IdeaAttachment[];
  rightsConfirmed?: boolean;
  
  // Moderación
  moderationNotes?: string;
  moderatorId?: string;
  moderatorName?: string;
  moderatedAt?: string;
  auditTrail?: IdeaAuditLog[];
  
  // Métricas y comunidad
  featured?: boolean;
  ratingsCount: number;
  ratingAverage: number;
  favoritesCount: number;
  commentsCount: number;
  viewsCount?: number;
  
  createdAt: string;
  updatedAt: string;
}
