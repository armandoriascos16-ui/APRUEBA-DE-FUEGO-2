/**
 * Tipos completos para el módulo independiente ComunidadJuvenilCristiana (Prompt 2)
 */

export type ComunidadArea = 
  | 'feed'
  | 'distritos'
  | 'grupos'
  | 'estudios'
  | 'oracion'
  | 'retos'
  | 'eventos'
  | 'talentos'
  | 'devocional'
  | 'offline';

export type CommunityRole = 'creador' | 'administrador' | 'moderador' | 'miembro';

export interface CommunityMember {
  userId: string;
  name: string;
  avatar: string;
  role: CommunityRole;
  joinedAt: string;
  district?: string;
  church?: string;
}

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userChurch?: string;
  userDistrict?: string;
  reason?: string; // Mensaje de presentación
  requestedAt: string;
  status: 'pendiente' | 'aprobada' | 'rechazada';
}

export type CommunityThemeCategory =
  | 'estudio_biblico'
  | 'oracion'
  | 'jovenes'
  | 'musica_cristiana'
  | 'evangelismo'
  | 'grupos_pequenos'
  | 'familias'
  | 'servicio_comunitario'
  | 'deportes'
  | 'capacitacion_formacion'
  | 'educacion_estudios'
  | 'emprendimiento_negocios'
  | 'tecnologia_informatica'
  | 'arte_cultura'
  | 'musica_canto'
  | 'salud_bienestar'
  | 'servicio_voluntariado'
  | 'familia_convivencia'
  | 'idiomas'
  | 'medio_ambiente'
  | 'otra';

export type MeetingModality = 'presencial' | 'virtual' | 'mixta';
export type MeetingStatus = 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
export type AttendanceResponse = 'asistire' | 'no_asistire' | 'tal_vez' | 'quizas';
export type AnnouncementType = 'general' | 'urgente' | 'cambio_horario' | 'cambio_lugar' | 'materiales' | 'especial' | 'oracion' | 'espiritual';

export interface ChurchCommunity {
  id: string;
  name: string;
  description: string;
  purpose?: string;
  verse?: string;
  church: string;
  district: string;
  city: string;
  theme: string;
  themeCategory?: CommunityThemeCategory;
  customThemeCategory?: string;
  specificTopics?: string[];
  imageUrl: string;
  isPrivate: boolean;
  creatorId: string;
  creatorName?: string;
  creatorAvatar?: string;
  creatorRole?: string;
  meetingDays?: string; // Días habituales (ej: Sábados y Miércoles)
  meetingTime?: string; // Horario habitual (ej: 5:00 PM - 7:00 PM)
  meetingScheduleDay?: string;
  meetingScheduleTime?: string;
  modality?: MeetingModality;
  meetingPlace?: string; // Lugar presencial si aplica
  virtualMeetingUrl?: string; // Enlace virtual si aplica
  requiredMaterials?: string[]; // Qué debe llevar (Biblia, cuaderno, himnario...)
  materialsNeeded?: string;
  membershipRequirements?: string; // Requisitos adicionales
  rules: string[];
  members: CommunityMember[];
  pendingRequests: JoinRequest[];
  createdAt: string;
  updatedAt?: string;
}

export interface CommunityMeeting {
  id: string;
  communityId: string;
  title: string;
  description: string;
  objective?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  timeZone: string; // ej. America/Bogota (UTC-5)
  modality: MeetingModality;
  location?: string;
  virtualMeetingUrl?: string;
  virtualLink?: string;
  theme: string;
  materialsNeeded: string[];
  materials?: string;
  bibleVerse?: string;
  verse?: string;
  additionalNotes?: string;
  isRecurring?: boolean;
  recurrenceFrequency?: 'semanal' | 'quincenal' | 'mensual';
  status: MeetingStatus;
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt?: string;
  attendees?: MeetingAttendance[];
}

export interface MeetingAttendance {
  id: string;
  meetingId: string;
  communityId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userChurch?: string;
  userDistrict?: string;
  response: AttendanceResponse;
  updatedAt: string;
}

export interface CommunityAnnouncement {
  id: string;
  communityId: string;
  title: string;
  content: string;
  type: AnnouncementType;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: CommunityRole;
  createdAt: string;
  date?: string;
  pinned?: boolean;
}

export type YouthMinistryCategory =
  | 'musica_coros'
  | 'alabanza_adoracion'
  | 'jovenes_misioneros'
  | 'estudio_biblico'
  | 'oracion'
  | 'evangelismo'
  | 'servicio_comunitario'
  | 'medios_tecnologia'
  | 'arte_creatividad'
  | 'liderazgo_juvenil'
  | 'talentos'
  | 'actividades_iglesia';

export interface MinistryGroup {
  id: string;
  name: string;
  category: YouthMinistryCategory;
  categoryLabel: string;
  description: string;
  creatorId: string;
  leaderName: string;
  leaderAvatar?: string;
  members: string[]; // userIds
  meetingSchedule: string;
  rules: string[];
  verseAnchor: string;
  icon: string;
  gradient: string;
  isPrivate: boolean;
  activities: {
    id: string;
    title: string;
    date: string;
    description: string;
  }[];
  createdAt: string;
}

export interface CommunityCommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface CommunityPostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  likes: number;
  replies?: CommunityCommentReply[];
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorDistrict: string;
  communityId?: string;
  communityName?: string;
  title?: string;
  content: string;
  category: 'reflexion' | 'testimonio' | 'oracion' | 'actividad' | 'general' | 'estudio';
  bibleVerse?: string;
  mediaType?: 'image' | 'video' | 'none';
  mediaUrl?: string;
  createdAt: string;
  updatedAt?: string;
  reactions: {
    amen: number;
    aleluya: number;
    gloriaDios: number;
    diosEsBueno: number;
  };
  likedUserIds: string[];
  comments: CommunityPostComment[];
  isFavoritedByUsers: string[];
  isEdited?: boolean;
}

export interface BibleStudyAnswer {
  id: string;
  questionId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  answerText: string;
  createdAt: string;
}

export interface BibleStudyItem {
  id: string;
  title: string;
  bookOfBible: string;
  chapterAndVerses: string;
  topic: string;
  authorId: string;
  authorName: string;
  content: string;
  materials: string[];
  keyVerses: { ref: string; text: string }[];
  reflectionQuestions: {
    id: string;
    question: string;
    answers: BibleStudyAnswer[];
  }[];
  createdAt: string;
}

export interface BibleStudySession {
  id: string;
  studyId: string;
  title: string;
  date: string;
  time: string;
  mode: 'presencial' | 'virtual';
  locationOrUrl: string;
  hostName: string;
}

export interface BibleReadingPlan {
  id: string;
  title: string;
  description: string;
  durationDays: number;
  days: {
    dayNumber: number;
    title: string;
    passages: string;
    reflection: string;
    completedUserIds: string[];
  }[];
}

export interface CommunityPrayerRequest {
  id: string;
  authorId: string;
  authorName: string;
  authorDistrict: string;
  authorAvatar: string;
  title: string;
  request: string;
  isPrivate: boolean;
  allowedGroupOrCommunityId?: string;
  createdAt: string;
  intercessorsUserIds: string[];
  isAnswered: boolean;
  testimony?: string;
  encouragementMessages: {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar: string;
    message: string;
    createdAt: string;
  }[];
}

export type ServiceChallengeStatus = 'pendiente' | 'en_progreso' | 'enviado' | 'completado';

export interface ServiceChallengeEvidence {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  description: string;
  evidenceUrl?: string;
  consentConfirmed: boolean;
  submittedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface ServiceChallenge {
  id: string;
  title: string;
  category: 
    | 'visita_adultos_mayores'
    | 'actividades_solidarias'
    | 'ayuda_comunitaria'
    | 'invitacion_juvenil'
    | 'jornada_servicio'
    | 'actividad_misionera'
    | 'reflexion_biblica'
    | 'oracion_estudio'
    | 'apoyo_iglesia';
  categoryLabel: string;
  description: string;
  instructions: string[];
  criteria: string;
  deadline?: string;
  responsibleName: string;
  responsibleId: string;
  bibleVerse: string;
  pointsReward?: number;
  enrolledUserIds: string[];
  userStatuses: Record<string, ServiceChallengeStatus>; // userId -> status
  evidences: ServiceChallengeEvidence[];
}

export type EventStatus = 'proximo' | 'realizado' | 'cancelado';

export interface YouthCommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  organizer: string;
  organizerId: string;
  communityId?: string;
  communityName?: string;
  contactInfo: string;
  capacity?: number;
  status: EventStatus;
  registeredUserIds: string[];
  remindersSetUserIds: string[];
  createdAt: string;
}

export type CreativeCategory = 
  | 'musica_canto'
  | 'coros_vocales'
  | 'composicion'
  | 'diseno_arte'
  | 'fotografia_video'
  | 'teatro_expresion'
  | 'escritura_reflexion'
  | 'servicio'
  | 'tecnologia_digital';

export interface CreativeProject {
  id: string;
  title: string;
  category: CreativeCategory;
  categoryLabel: string;
  authorId: string;
  authorName: string;
  authorDistrict: string;
  description: string;
  mediaType: 'audio' | 'image' | 'video' | 'text' | 'document';
  mediaUrl?: string;
  lyricsOrText?: string;
  isPublic: boolean;
  likesCount: number;
  likedUserIds: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface SpiritualJournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  date: string;
  passageRead?: string;
  gratitudeList: string[];
  isPrivateOnly: boolean;
  createdAt: string;
}

export interface SpiritualGoal {
  id: string;
  userId: string;
  title: string;
  targetCount: number;
  currentCount: number;
  frequency: 'diaria' | 'semanal' | 'mensual';
  type: 'oracion' | 'lectura_biblica' | 'servicio' | 'testimonio';
  completedDates: string[];
}

export interface UserPersonalMarker {
  id: string;
  userId: string;
  resourceId: string;
  resourceType: 'estudio' | 'devocional' | 'lectura';
  title: string;
  pointOrVerse: string;
  savedAt: string;
}

export interface OfflineResourceItem {
  id: string;
  title: string;
  category: string;
  authorOrSource: string;
  estimatedReadTime: string;
  summary: string;
  fullContent: string;
  isSavedOffline: boolean;
  savedAt?: string;
}

export interface CommunityNotification {
  id: string;
  userId: string;
  type: 'comentario' | 'solicitud' | 'evento' | 'grupo' | 'reto' | 'reaccion';
  title: string;
  message: string;
  read: boolean;
  targetArea?: ComunidadArea;
  targetId?: string;
  createdAt: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  contentType: 'post' | 'comment' | 'prayer' | 'project';
  contentId: string;
  reason: string;
  status: 'pendiente' | 'revisado' | 'descartado';
  createdAt: string;
}

// ============================================================================
// Tipos complementarios para compatibilidad de datos y recursos offline
// ============================================================================

export interface OfflineYouthResource {
  id: string;
  title: string;
  category: string;
  categoryLabel?: string;
  summary: string;
  fullContent: string;
  authorOrSource: string;
  estimatedReadTime: string;
  isSavedOffline: boolean;
  savedAt?: string;
}

export interface YouthGroup {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  leaderName: string;
  membersCount: number;
  meetingTime: string;
  verseAnchor: string;
  icon: string;
  gradient: string;
  joined: boolean;
}

export interface BibleQuestionAnswer {
  id: string;
  question: string;
  category: string;
  categoryLabel: string;
  biblicalAnswer: string;
  keyVerses: { ref: string; text: string }[];
  practicalApplication: string;
  ellenWhiteQuote?: string;
  tags: string[];
}

export interface YouthPrayerRequest {
  id: string;
  authorName: string;
  authorDistrict: string;
  authorAvatar: string;
  title: string;
  request: string;
  date: string;
  intercessorsCount: number;
  isAnswered: boolean;
  testimony?: string;
  hasPrayed?: boolean;
}

export interface YouthMissionChallenge {
  id: string;
  title: string;
  category: string;
  description: string;
  objective: string;
  bibleVerse: string;
  steps: string[];
  pointsReward: number;
  participantsCount: number;
  completed: boolean;
}

export interface YouthEventItem {
  id: string;
  title: string;
  type: string;
  typeLabel: string;
  date: string;
  time: string;
  venue: string;
  districtOrScope: string;
  description: string;
  organizer: string;
  confirmedCount: number;
  isConfirmed: boolean;
}

export interface YouthCreativeItem {
  id: string;
  title: string;
  authorName: string;
  authorDistrict: string;
  type: string;
  typeLabel: string;
  description: string;
  audioUrl?: string;
  lyricsOrText?: string;
  likesCount: number;
  isLiked: boolean;
}

export interface DailyDevotionalDay {
  dayNumber: number;
  title: string;
  bibleVerseRef: string;
  bibleVerseText: string;
  reflection: string;
  challengeOfDay: string;
  prayerPoint: string;
  isCompleted: boolean;
}

export interface YouthCommunityPostComment {
  id: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  time: string;
}

export interface YouthCommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorDistrict: string;
  ministryBadge: string;
  content: string;
  bibleVerse?: string;
  imageUrl?: string;
  createdAt: string;
  reactions: {
    amen: number;
    aleluya: number;
    gloriaDios: number;
    diosEsBueno: number;
  };
  comments: YouthCommunityPostComment[];
  userReaction?: 'amen' | 'aleluya' | 'gloriaDios' | 'diosEsBueno';
}

