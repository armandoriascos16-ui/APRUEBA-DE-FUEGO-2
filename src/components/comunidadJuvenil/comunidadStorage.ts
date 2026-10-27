import { 
  ChurchCommunity, 
  MinistryGroup, 
  CommunityPost, 
  BibleStudyItem, 
  BibleReadingPlan,
  BibleStudySession,
  CommunityPrayerRequest, 
  ServiceChallenge, 
  YouthCommunityEvent, 
  CreativeProject, 
  SpiritualJournalEntry, 
  SpiritualGoal, 
  UserPersonalMarker, 
  OfflineResourceItem, 
  CommunityNotification, 
  ContentReport,
  CommunityMember,
  JoinRequest,
  ServiceChallengeEvidence,
  CommunityRole,
  CommunityMeeting,
  MeetingAttendance,
  CommunityAnnouncement,
  CommunityThemeCategory,
  MeetingModality,
  AttendanceResponse,
  AnnouncementType
} from './types';

// Helper to safely read from localStorage
function safeRead<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (err) {
    console.warn(`Error reading key ${key} from storage:`, err);
    return fallback;
  }
}

// Helper to safely write to localStorage
function safeWrite<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error writing key ${key} to storage:`, err);
  }
}

// ============================================================================
// INITIAL SEED DATA
// ============================================================================

export const SEED_COMMUNITIES: ChurchCommunity[] = [
  {
    id: 'comm_central_buenaventura',
    name: 'Jóvenes Adventistas Central Buenaventura',
    description: 'Comunidad oficial de la juventud de la Iglesia Adventista Central de Buenaventura. Coordinación de programas sabáticos, grupos pequeños y evangelismo portuario.',
    church: 'Iglesia Adventista Central de Buenaventura',
    district: 'Distrito Central',
    city: 'Buenaventura, Valle del Cauca',
    theme: 'Juventud en Misión y Fuego Espiritual',
    themeCategory: 'jovenes',
    specificTopics: ['Liderazgo Juvenil', 'Estudio de Profecías', 'Evangelismo Portuario', 'Grupos Pequeños', 'Música Sacra'],
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    isPrivate: false,
    creatorId: 'admin_central',
    creatorName: 'Pastor y Liderazgo JA Central',
    creatorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80',
    creatorRole: 'Pastor de Distrito',
    meetingDays: 'Sábados (tarde) y Miércoles (noche)',
    meetingTime: '4:30 PM - 6:30 PM',
    modality: 'mixta',
    meetingPlace: 'Salón Juvenil Piso 2, Templo Central Buenaventura',
    virtualMeetingUrl: 'https://meet.google.com/ja-central-bvt',
    requiredMaterials: ['Biblia (física o aplicación)', 'Cuaderno y bolígrafo', 'Himnario Adventista'],
    membershipRequirements: 'Compromiso con el crecimiento espiritual y respeto a los principios bíblicos adventistas.',
    rules: [
      'Mantener reverencia, respeto mutuo y amor cristiano en todas las publicaciones.',
      'Todo contenido debe estar fundamentado en las Sagradas Escrituras.',
      'Cero spam, mensajes comerciales o debates destructivos.',
      'Proteger la privacidad de los hermanos y menores de edad.'
    ],
    members: [
      {
        userId: 'admin_central',
        name: 'Pastor y Liderazgo JA Central',
        avatar: '',
        role: 'creador',
        joinedAt: 'Enero 2026',
        district: 'Distrito Central',
        church: 'Iglesia Central'
      }
    ],
    pendingRequests: [],
    createdAt: '2026-01-15'
  },
  {
    id: 'comm_manantial_buenaventura',
    name: 'Juventud Misionera Manantial',
    description: 'Comunidad de jóvenes y conquistadores de la Iglesia Manantial. Formación de parejas misioneras, actividades solidarias y desarrollo espiritual.',
    church: 'Iglesia Adventista Manantial',
    district: 'Distrito Manantial',
    city: 'Buenaventura, Valle del Cauca',
    theme: 'Manantial de Agua Viva para la Comunidad',
    themeCategory: 'servicio_comunitario',
    specificTopics: ['Impacto Comunitario', 'Club de Conquistadores', 'Brigadas Médicas y Solidarias'],
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    isPrivate: false,
    creatorId: 'admin_manantial',
    creatorName: 'Liderazgo JA Manantial',
    creatorAvatar: '',
    creatorRole: 'Director de Ministerio Joven',
    meetingDays: 'Sábados a las 4:00 PM',
    meetingTime: '4:00 PM - 6:00 PM',
    modality: 'presencial',
    meetingPlace: 'Cede Iglesia Manantial - Barrio El Jorge',
    requiredMaterials: ['Biblia', 'Uniforme JA o camiseta del club', 'Cuaderno misionero'],
    membershipRequirements: 'Deseo de servir al prójimo y participar en las brigadas de sábado por la tarde.',
    rules: [
      'Edificar con palabras de gracia y fe.',
      'Participación activa en los proyectos comunitarios de sábado de tarde.',
      'Cuidar el testimonio cristiano dentro y fuera de las redes.'
    ],
    members: [
      {
        userId: 'admin_manantial',
        name: 'Liderazgo JA Manantial',
        avatar: '',
        role: 'creador',
        joinedAt: 'Enero 2026',
        district: 'Distrito Manantial',
        church: 'Iglesia Manantial'
      }
    ],
    pendingRequests: [],
    createdAt: '2026-02-01'
  },
  {
    id: 'comm_emanuel_liderazgo',
    name: 'Red de Líderes JA Distrito Emanuel',
    description: 'Espacio de capacitación y planeación estratégica para directores y consejeros del Distrito Emanuel. Comunidad privada para coordinación interna.',
    church: 'Distrito Emanuel Buenaventura',
    district: 'Distrito Emanuel',
    city: 'Buenaventura, Valle del Cauca',
    theme: 'Liderazgo de Excelencia para el Reino de Dios',
    themeCategory: 'grupos_pequenos',
    specificTopics: ['Planeación de Campamentos', 'Liderazgo Distrital', 'Escuela Bíblica de Vacaciones'],
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80',
    isPrivate: true,
    creatorId: 'admin_emanuel',
    creatorName: 'Coordinador Juvenil Emanuel',
    creatorAvatar: '',
    creatorRole: 'Coordinador de Zona',
    meetingDays: 'Primer y tercer domingo de cada mes',
    meetingTime: '9:00 AM - 11:30 AM',
    modality: 'mixta',
    meetingPlace: 'Auditorio Distrital Emanuel',
    virtualMeetingUrl: 'https://meet.google.com/liderazgo-emanuel-bvt',
    requiredMaterials: ['Biblia', 'Carpeta de planeación JA', 'Manual de Iglesia'],
    membershipRequirements: 'Ser directivo u oficial de sociedad de jóvenes o club en el Distrito Emanuel.',
    rules: [
      'Comunidad exclusiva para oficiales, consejeros y directores JA en ejercicio.',
      'Las decisiones y acuerdos de junta se manejan con debida discreción eclesiástica.',
      'Trato cordial y fraterno entre líderes.'
    ],
    members: [
      {
        userId: 'admin_emanuel',
        name: 'Coordinador Juvenil Emanuel',
        avatar: '',
        role: 'creador',
        joinedAt: 'Enero 2026',
        district: 'Distrito Emanuel'
      }
    ],
    pendingRequests: [],
    createdAt: '2026-02-10'
  }
];

export const SEED_COMMUNITY_MEETINGS: CommunityMeeting[] = [
  {
    id: 'meet_central_01',
    communityId: 'comm_central_buenaventura',
    title: 'Culto Joven & Taller de Liderazgo Misionero',
    description: 'Encuentro juvenil con dinámicas de grupo, alabanzas especiales a Dios y taller de preparación para el impacto comunitario en el malecón.',
    objective: 'Fortalecer el compañerismo cristiano y capacitar a 30 jóvenes en evangelismo relacional.',
    date: '2026-10-31',
    startTime: '16:30',
    endTime: '18:30',
    timeZone: 'America/Bogota (UTC-5)',
    modality: 'presencial',
    location: 'Templo Central Buenaventura — Salón Juvenil Piso 2',
    theme: 'Juventud comprometida: Sal y Luz en el Puerto',
    materialsNeeded: ['Biblia física o digital', 'Cuaderno de notas', 'Himnario Nuevo'],
    bibleVerse: '1 Timoteo 4:12 — Ninguno tenga en poco tu juventud...',
    additionalNotes: 'Habrá un refrigerio fraterno al terminar el programa.',
    isRecurring: true,
    recurrenceFrequency: 'semanal',
    status: 'programada',
    createdById: 'admin_central',
    createdByName: 'Pastor y Liderazgo JA Central',
    createdAt: '2026-10-20'
  },
  {
    id: 'meet_central_02',
    communityId: 'comm_central_buenaventura',
    title: 'Círculo de Oración & Estudio Bíblico Online',
    description: 'Jornada virtual de clamor por los enfermos, los colegios de Buenaventura y las familias de la iglesia.',
    objective: 'Unir en oración a jóvenes que trabajan o estudian en semana.',
    date: '2026-11-04',
    startTime: '19:30',
    endTime: '20:30',
    timeZone: 'America/Bogota (UTC-5)',
    modality: 'virtual',
    virtualMeetingUrl: 'https://meet.google.com/ja-central-bvt',
    theme: 'El Poder de la Oración Intercesora',
    materialsNeeded: ['Biblia', 'Lista de motivos de oración'],
    bibleVerse: 'Filipenses 4:6-7 — Por nada estéis afanosos...',
    additionalNotes: 'El enlace se activará 10 minutos antes para probar audio.',
    isRecurring: true,
    recurrenceFrequency: 'semanal',
    status: 'programada',
    createdById: 'admin_central',
    createdByName: 'Pastor y Liderazgo JA Central',
    createdAt: '2026-10-22'
  },
  {
    id: 'meet_manantial_01',
    communityId: 'comm_manantial_buenaventura',
    title: 'Brigada de Servicio Social en el Barrio El Jorge',
    description: 'Entrega de canastas de alimentos, apoyo escolar a niños y oración por los hogares del sector.',
    objective: 'Llevar esperanza práctica al vecindario alrededor de la iglesia.',
    date: '2026-11-07',
    startTime: '15:00',
    endTime: '18:00',
    timeZone: 'America/Bogota (UTC-5)',
    modality: 'presencial',
    location: 'Iglesia Manantial — Punto de salida',
    theme: 'Manos que ayudan, corazones que aman',
    materialsNeeded: ['Camiseta o chaleco JA', 'Calzado cómodo', 'Literatura de esperanza'],
    bibleVerse: 'Mateo 25:40 — En cuanto lo hicisteis a uno de estos...',
    status: 'programada',
    createdById: 'admin_manantial',
    createdByName: 'Liderazgo JA Manantial',
    createdAt: '2026-10-24'
  }
];

export const SEED_ATTENDANCES: MeetingAttendance[] = [
  {
    id: 'att_01',
    meetingId: 'meet_central_01',
    communityId: 'comm_central_buenaventura',
    userId: 'user_samuel',
    userName: 'Samuel Caicedo',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
    userChurch: 'Iglesia Central',
    response: 'asistire',
    updatedAt: '2026-10-22 10:15'
  },
  {
    id: 'att_02',
    meetingId: 'meet_central_01',
    communityId: 'comm_central_buenaventura',
    userId: 'user_camila',
    userName: 'Camila Rentería',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    userChurch: 'Iglesia Central',
    response: 'asistire',
    updatedAt: '2026-10-22 11:30'
  },
  {
    id: 'att_03',
    meetingId: 'meet_central_02',
    communityId: 'comm_central_buenaventura',
    userId: 'user_samuel',
    userName: 'Samuel Caicedo',
    userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
    userChurch: 'Iglesia Central',
    response: 'asistire',
    updatedAt: '2026-10-23 09:00'
  }
];

export const SEED_ANNOUNCEMENTS: CommunityAnnouncement[] = [
  {
    id: 'ann_01',
    communityId: 'comm_central_buenaventura',
    title: '¡Bienvenidos al nuevo trimestre de actividades!',
    content: 'Querida juventud, iniciamos un ciclo de bendición con enfoque en el servicio comunitario y la formación de nuevas parejas misioneras. ¡Contamos con el talento de cada uno!',
    type: 'general',
    authorId: 'admin_central',
    authorName: 'Pastor y Liderazgo JA Central',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80',
    authorRole: 'creador',
    createdAt: '2026-10-20',
    pinned: true
  },
  {
    id: 'ann_02',
    communityId: 'comm_central_buenaventura',
    title: 'Horario especial de ensayo musical este sábado',
    content: 'Los jóvenes que participan en el coro y la alabanza por favor llegar 30 minutos antes (4:00 PM) para afinar instrumentos y orar juntos antes del culto joven.',
    type: 'cambio_horario',
    authorId: 'user_samuel',
    authorName: 'Samuel Caicedo',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
    authorRole: 'administrador',
    createdAt: '2026-10-24',
    pinned: false
  }
];

export const SEED_MINISTRY_GROUPS: MinistryGroup[] = [
  {
    id: 'grp_musica_coros',
    name: 'Coros y Ensamble Vocal Adventista',
    category: 'musica_coros',
    categoryLabel: 'Música y coros',
    description: 'Ensayos a 4 voces de himnos tradicionales del Himnario Adventista y cantos sacros para solemnizar los cultos divinos.',
    creatorId: 'user_samuel',
    leaderName: 'Coordinación de Música Sacra',
    members: ['admin_central', 'user_samuel', 'user_camila'],
    meetingSchedule: 'Sábados 5:30 PM (Templo Central)',
    rules: ['Puntualidad en los ensayos', 'Reverencia con los instrumentos sagrados'],
    verseAnchor: 'Salmos 100:1-2 — Cantad alegres a Dios, habitantes de toda la tierra.',
    icon: '🎵',
    gradient: 'from-amber-500 to-orange-600',
    isPrivate: false,
    activities: [
      { id: 'act_1', title: 'Ensayo Coral General', date: 'Próximo Sábado 5:30 PM', description: 'Arreglos de himnos 1 y 24 del Himnario.' }
    ],
    createdAt: '2026-01-20'
  },
  {
    id: 'grp_jovenes_misioneros',
    name: 'Misión Caleb & Evangelismo Urbano',
    category: 'jovenes_misioneros',
    categoryLabel: 'Jóvenes misioneros',
    description: 'Acción misionera directa en los barrios de Buenaventura: entrega de literatura misionera, estudios bíblicos en hogares y labor social.',
    creatorId: 'user_elena',
    leaderName: 'Elena Sinisterra',
    members: ['admin_manantial', 'user_elena'],
    meetingSchedule: 'Viernes 6:30 PM & Tardes Sabáticas',
    rules: ['Compromiso con el trabajo en pareja misionera', 'Fidelidad en el testimonio'],
    verseAnchor: 'Marcos 16:15 — Id por todo el mundo y predicad el evangelio.',
    icon: '🔥',
    gradient: 'from-rose-600 to-red-700',
    isPrivate: false,
    activities: [
      { id: 'act_2', title: 'Distribución de Literatura', date: 'Sábado 2:30 PM', description: 'Caminata misionera en el sector Malecón.' }
    ],
    createdAt: '2026-02-05'
  },
  {
    id: 'grp_estudio_biblico',
    name: 'Círculo de Indagación Bíblica Profética',
    category: 'estudio_biblico',
    categoryLabel: 'Estudio bíblico',
    description: 'Profundización en las profecías de Daniel y Apocalipsis, el santuario celestial y la doctrina bíblica adventista.',
    creatorId: 'admin_central',
    leaderName: 'Líder Teológico Zonal',
    members: ['admin_central', 'user_samuel'],
    meetingSchedule: 'Miércoles 7:00 PM (Culto de Oración y Estudio)',
    rules: ['Fundamentar cada afirmación con un «Así dice Jehová»', 'Espíritu de búsqueda sincera'],
    verseAnchor: 'Juan 5:39 — Escudriñad las Escrituras; porque a vosotros os parece que en ellas tenéis la vida eterna.',
    icon: '📖',
    gradient: 'from-emerald-600 to-teal-700',
    isPrivate: false,
    activities: [],
    createdAt: '2026-01-25'
  },
  {
    id: 'grp_medios_tecnologia',
    name: 'Medios Digitales & Streaming Cristiano',
    category: 'medios_tecnologia',
    categoryLabel: 'Medios de comunicación y tecnología',
    description: 'Producción audiovisual, transmisión técnica de cultos sabáticos, diseño gráfico para redes y proclamación digital.',
    creatorId: 'user_samuel',
    leaderName: 'Equipo Técnico Audiovisual',
    members: ['user_samuel'],
    meetingSchedule: 'Jueves 7:30 PM (Revisión técnica)',
    rules: ['Cuidar la calidad reverente de las transmisiones de culto', 'Protección de datos'],
    verseAnchor: 'Romanos 10:18 — Por toda la tierra ha salido la voz de ellos.',
    icon: '📹',
    gradient: 'from-blue-600 to-indigo-700',
    isPrivate: false,
    activities: [],
    createdAt: '2026-02-12'
  },
  {
    id: 'grp_servicio_comunitario',
    name: 'Dorcas Juvenil & Acción Solidaria',
    category: 'servicio_comunitario',
    categoryLabel: 'Servicio comunitario',
    description: 'Jornadas de alimentación, entrega de ropa limpia y visitas de consuelo a familias vulnerables del puerto.',
    creatorId: 'user_camila',
    leaderName: 'Camila Rentería',
    members: ['user_camila', 'user_elena'],
    meetingSchedule: 'Domingos 9:00 AM',
    rules: ['Amor compasivo incondicional', 'Respeto a la dignidad humana'],
    verseAnchor: 'Mateo 25:40 — En cuanto lo hicisteis a uno de estos mis hermanos más pequeños, a mí lo hicisteis.',
    icon: '🤝',
    gradient: 'from-purple-600 to-pink-600',
    isPrivate: false,
    activities: [],
    createdAt: '2026-02-18'
  }
];

export const SEED_POSTS: CommunityPost[] = [
  {
    id: 'post_cjc_1',
    authorId: 'user_samuel',
    authorName: 'Samuel Caicedo',
    authorUsername: 'samuel_ja_pacifico',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
    authorDistrict: 'Distrito Central',
    communityId: 'comm_central_buenaventura',
    communityName: 'Jóvenes Adventistas Central Buenaventura',
    title: 'La reverencia en la adoración sabática',
    content: 'Hermanos jóvenes: la verdadera música cristiana eleva el alma a la presencia de Dios. No busquemos el entretenimiento superficial, sino la consagración que transforma el carácter. ¡Nos vemos en el ensayo de este sábado!',
    category: 'reflexion',
    bibleVerse: 'Salmos 96:9 — Adorad a Jehová en la hermosura de la santidad.',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    createdAt: '2026-10-24 16:30',
    reactions: { amen: 18, aleluya: 12, gloriaDios: 9, diosEsBueno: 14 },
    likedUserIds: ['user_camila', 'admin_central'],
    comments: [
      {
        id: 'comm_1_1',
        authorId: 'user_camila',
        authorName: 'Camila Rentería',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
        text: 'Amén hermano Samuel. Que el Señor siga afinando nuestros corazones.',
        createdAt: '2026-10-24 17:00',
        likes: 4,
        replies: [
          {
            id: 'rep_1_1_1',
            authorId: 'user_samuel',
            authorName: 'Samuel Caicedo',
            authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
            text: '¡Gloria a Dios hermana! Allá los esperamos.',
            createdAt: '2026-10-24 17:15',
            likes: 2
          }
        ]
      }
    ],
    isFavoritedByUsers: ['user_camila']
  },
  {
    id: 'post_cjc_2',
    authorId: 'user_elena',
    authorName: 'Elena Sinisterra',
    authorUsername: 'elena_manantial',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
    authorDistrict: 'Distrito Manantial',
    communityId: 'comm_manantial_buenaventura',
    communityName: 'Juventud Misionera Manantial',
    title: 'Testimonio de visitación en el puerto',
    content: 'Hoy compartimos víveres y oramos con dos madres de familia en el sector insular. Una de ellas nos pidió estudios bíblicos para sus hijos. Dios abre caminos donde no los hay.',
    category: 'testimonio',
    bibleVerse: 'Isaías 43:19 — He aquí que yo hago cosa nueva; pronto saldrá a luz.',
    mediaType: 'none',
    createdAt: '2026-10-24 14:10',
    reactions: { amen: 26, aleluya: 20, gloriaDios: 15, diosEsBueno: 22 },
    likedUserIds: ['user_samuel'],
    comments: [],
    isFavoritedByUsers: []
  }
];

export const SEED_BIBLE_STUDIES: BibleStudyItem[] = [
  {
    id: 'study_daniel_2',
    title: 'Daniel 2: La Estatua y el Reino Eterno de Dios',
    bookOfBible: 'Daniel',
    chapterAndVerses: 'Daniel 2:1-49',
    topic: 'Profecía Bíblica y Soberanía Divina',
    authorId: 'admin_central',
    authorName: 'Pastor / Escuela Sabática',
    content: `El sueño de Nabucodonosor revela el curso de la historia universal desde Babilonia hasta el fin de los tiempos:
1. Cabeza de Oro: Imperio Babilónico (605 - 539 a.C.).
2. Pecho y Brazos de Plata: Imperio Medo-Persa (539 - 331 a.C.).
3. Vientre y Muslos de Bronce: Imperio Griego de Alejandro (331 - 168 a.C.).
4. Piernas de Hierro: Imperio Romano (168 a.C. - 476 d.C.).
5. Pies de Hierro y Barro: Naciones divididas de Europa.
6. La Piedra no cortada con mano: El regreso glorioso de Cristo y el establecimiento de su Reino sempiterno que jamás será destruido.`,
    materials: ['Biblia Versión Reina-Valera 1960', 'Folleto de Escuela Sabática', 'Comentario Bíblico Adventista'],
    keyVerses: [
      { ref: 'Daniel 2:44', text: 'Y en los días de estos reyes el Dios del cielo levantará un reino que no será jamás destruido...' }
    ],
    reflectionQuestions: [
      {
        id: 'q_d2_1',
        question: '¿De qué manera la exactitud histórica de Daniel 2 fortalece tu confianza en las promesas bíblicas aún por cumplirse?',
        answers: [
          {
            id: 'ans_1',
            questionId: 'q_d2_1',
            authorId: 'user_samuel',
            authorName: 'Samuel Caicedo',
            authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
            answerText: 'Me da total paz saber que la historia del mundo no está en manos del azar humano, sino en la mano soberana de Dios.',
            createdAt: '2026-10-24 18:00'
          }
        ]
      },
      {
        id: 'q_d2_2',
        question: '¿Qué significa en tu vida diaria pertenecer al Reino que representa la Piedra?',
        answers: []
      }
    ],
    createdAt: '2026-02-15'
  },
  {
    id: 'study_romanos_8',
    title: 'Romanos 8: Vida en el Espíritu y Certeza en Cristo',
    bookOfBible: 'Romanos',
    chapterAndVerses: 'Romanos 8:1-39',
    topic: 'Salvación, Gracia y Victoria',
    authorId: 'user_camila',
    authorName: 'Camila Rentería',
    content: `Romanos 8 es la cumbre teológica de la justificación por la fe. Comienza con «ninguna condenación hay para los que están en Cristo Jesús» (v. 1) y concluye con la gloriosa seguridad de que «ninguna cosa creada nos podrá separar del amor de Dios que es en Cristo Jesús Señor nuestro» (v. 38-39). El Espíritu Santo intercede por nosotros con gemidos indecibles aun cuando no sabemos cómo orar.`,
    materials: ['Biblia RVR 1960', 'El Camino a Cristo por Elena G. de White'],
    keyVerses: [
      { ref: 'Romanos 8:1', text: 'Ahora, pues, ninguna condenación hay para los que están en Cristo Jesús...' },
      { ref: 'Romanos 8:31', text: '¿Qué, pues, diremos a esto? Si Dios es por nosotros, ¿quién contra nosotros?' }
    ],
    reflectionQuestions: [
      {
        id: 'q_rom_1',
        question: '¿Cómo experimentas la libertad de la condenación en tu diario vivir cuando cometes errores?',
        answers: []
      }
    ],
    createdAt: '2026-03-01'
  }
];

export const SEED_STUDY_SESSIONS: BibleStudySession[] = [
  {
    id: 'sess_1',
    studyId: 'study_daniel_2',
    title: 'Sesión Zonal: Daniel 2 y los Eventos Finales',
    date: '2026-11-04',
    time: '07:00 PM',
    mode: 'presencial',
    locationOrUrl: 'Iglesia Central de Buenaventura / Salón de Jóvenes',
    hostName: 'Pr. Julián Rueda & Liderazgo JA'
  }
];

export const SEED_PRAYERS: CommunityPrayerRequest[] = [
  {
    id: 'pr_cjc_1',
    authorId: 'user_camila',
    authorName: 'Camila Rentería',
    authorDistrict: 'Distrito Central',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    title: 'Por la sanidad del Pr. Distrital y su familia',
    request: 'Pedimos a la comunidad juvenil que nos unamos en clamor por fortaleza física y salud para nuestro pastor distrital en sus jornadas ministeriales.',
    isPrivate: false,
    createdAt: '2026-10-24 12:00',
    intercessorsUserIds: ['user_samuel', 'user_elena'],
    isAnswered: false,
    encouragementMessages: [
      {
        id: 'enc_1',
        authorId: 'user_samuel',
        authorName: 'Samuel Caicedo',
        authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
        message: 'Unidos en oración hermana. Jehová Rapha tiene el control.',
        createdAt: '2026-10-24 13:00'
      }
    ]
  },
  {
    id: 'pr_cjc_2',
    authorId: 'user_elena',
    authorName: 'Elena Sinisterra',
    authorDistrict: 'Distrito Manantial',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
    title: '¡Testimonio! Provisión para matrícula y examen de sábado',
    request: 'Había pedido oración hace dos semanas por mi situación académica y el respeto al sábado.',
    isPrivate: false,
    createdAt: '2026-10-22 10:00',
    intercessorsUserIds: ['user_camila'],
    isAnswered: true,
    testimony: '¡Gloria al Creador! La decanatura universitaria autorizó oficialmente presentar las evaluaciones en jornada especial de lunes a jueves sin chocar con el Santo Sábado.',
    encouragementMessages: []
  }
];

export const SEED_CHALLENGES: ServiceChallenge[] = [
  {
    id: 'ch_visita_adultos',
    title: 'Visita Fraternal a Hermanos Mayores de la Iglesia',
    category: 'visita_adultos_mayores',
    categoryLabel: 'Acompañamiento a adultos mayores',
    description: 'Dedica una tarde sabática a visitar a un pionero de la fe o adulto mayor de tu congregación, llevando frutas, cantando un himno y escuchando su testimonio con su consentimiento.',
    instructions: [
      'Contactar previamente al anciano o su familia para coordinar la visita con consentimiento explícito.',
      'Llevar el Himnario Adventista y leer una promesa bíblica de consuelo.',
      'Cuidar estrictamente la privacidad: si tomas foto para evidencia, debe contar con permiso informado del hermano mayor.'
    ],
    criteria: 'Entregar reporte con versículo compartido y reflexión de la visita.',
    deadline: '2026-11-30',
    responsibleName: 'Liderazgo de Jóvenes y Diaconía',
    responsibleId: 'admin_central',
    bibleVerse: 'Levítico 19:32 — Delante de las canas te levantarás, y honrarás el rostro del anciano.',
    pointsReward: 100,
    enrolledUserIds: ['user_samuel', 'user_elena'],
    userStatuses: {
      'user_samuel': 'completado',
      'user_elena': 'en_progreso'
    },
    evidences: [
      {
        id: 'ev_1',
        userId: 'user_samuel',
        userName: 'Samuel Caicedo',
        userAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
        description: 'Visitamos a la hermana Teresa en el barrio Bellavista. Cantamos el Himno 298 y oramos por su salud. Contamos con su autorización.',
        consentConfirmed: true,
        submittedAt: '2026-10-24 17:30',
        reviewedBy: 'Liderazgo JA Central',
        reviewNotes: 'Excelente labor misionera. Aprobado con gozo cristiano.'
      }
    ]
  },
  {
    id: 'ch_canasta_amor',
    title: 'Canasta del Amor: Alimentos Solidarios',
    category: 'actividades_solidarias',
    categoryLabel: 'Actividades solidarias',
    description: 'Armar una canasta de alimentos básicos saludables (granos, cereales, aceite, frutas) y entregarla a una familia que esté pasando necesidad económica.',
    instructions: [
      'Identificar con la junta de iglesia o Dorcas una familia en condición de vulnerabilidad.',
      'Reunir los alimentos con otros 2 jóvenes.',
      'Entregar la ayuda con amabilidad, orando por bendición en el hogar.'
    ],
    criteria: 'Breve informe del número de alimentos entregados y oración realizada.',
    deadline: '2026-12-15',
    responsibleName: 'Coordinación de Acción Solidaria',
    responsibleId: 'user_camila',
    bibleVerse: 'Santiago 2:15-16 — Y si un hermano tiene necesidad del mantenimiento de cada día...',
    pointsReward: 120,
    enrolledUserIds: ['user_camila'],
    userStatuses: {
      'user_camila': 'en_progreso'
    },
    evidences: []
  }
];

export const SEED_EVENTS: YouthCommunityEvent[] = [
  {
    id: 'ev_cjc_vigilia_fuego',
    title: 'Vigilia Espiritual Zonal: «Fuego en el Altar 2026»',
    description: 'Noche de consagración juvenil de los 5 distritos de Buenaventura. Mensajes de la Palabra, conciertos de alabanza, vigilia de clamor y testimonios.',
    date: '2026-11-14',
    time: '08:00 PM - 04:00 AM',
    location: 'Templo Adventista Central de Buenaventura (Calle 1ª # 4-22, Cascajal)',
    isVirtual: false,
    organizer: 'Federación Juvenil Asociación del Pacífico',
    organizerId: 'admin_central',
    communityId: 'comm_central_buenaventura',
    communityName: 'Jóvenes Adventistas Central Buenaventura',
    contactInfo: 'Secretaría JA Buenaventura · contacto@asopacifico.org',
    capacity: 250,
    status: 'proximo',
    registeredUserIds: ['user_samuel', 'user_camila', 'user_elena'],
    remindersSetUserIds: ['user_samuel'],
    createdAt: '2026-10-10'
  },
  {
    id: 'ev_cjc_taller_liderazgo',
    title: 'Taller Virtual de Liderazgo JA & Oratoria Bíblica',
    description: 'Capacitación interactiva en línea para líderes de grupos pequeños, directores de sociedad de jóvenes y directores de cantos.',
    date: '2026-11-20',
    time: '07:30 PM - 09:00 PM',
    location: 'Plataforma Virtual Autorizada Asopacífico',
    isVirtual: true,
    virtualLink: 'https://meet.google.com/iasd-pacifico-lideres',
    organizer: 'Departamento de Jóvenes Asopacífico',
    organizerId: 'admin_emanuel',
    contactInfo: 'departamento.ja@asopacifico.org',
    capacity: 100,
    status: 'proximo',
    registeredUserIds: ['user_samuel'],
    remindersSetUserIds: [],
    createdAt: '2026-10-15'
  }
];

export const SEED_PROJECTS: CreativeProject[] = [
  {
    id: 'proj_coral_1',
    title: '«Castillo Fuerte es Nuestro Dios» — Ensamble Acústico Zonal',
    category: 'musica_canto',
    categoryLabel: 'Música y canto',
    authorId: 'user_samuel',
    authorName: 'Samuel Caicedo',
    authorDistrict: 'Distrito Central',
    description: 'Grabación en vivo con piano, violín y coro a 4 voces del himno tradicional reformador.',
    mediaType: 'audio',
    mediaUrl: 'https://archive.org/download/hymns-adventist/castillo_fuerte_demo.mp3',
    lyricsOrText: 'Castillo fuerte es nuestro Dios, defensa y buen escudo; con su poder nos librará en este trance agudo...',
    isPublic: true,
    likesCount: 34,
    likedUserIds: ['user_camila', 'user_elena'],
    createdAt: '2026-10-18'
  },
  {
    id: 'proj_poesia_1',
    title: '«Firme en el Mar del Puerto» — Poema de Consagración',
    category: 'escritura_reflexion',
    categoryLabel: 'Escritura y reflexiones',
    authorId: 'user_elena',
    authorName: 'Elena Sinisterra',
    authorDistrict: 'Distrito Manantial',
    description: 'Poema cristiano inspirado en la belleza del mar pacífico de Buenaventura y la seguridad de la redención.',
    mediaType: 'text',
    lyricsOrText: `Aun cuando el mar del puerto ruge con bravura,
mi barca tiene un Salvador de eterna gracia y fe;
Jesús de Nazaret sostiene mi andadura,
y en Sus pisadas santas yo caminaré.`,
    isPublic: true,
    likesCount: 28,
    likedUserIds: ['user_samuel'],
    createdAt: '2026-10-21'
  }
];

// ============================================================================
// STORE STATE AND CRUD MANAGER CLASS
// ============================================================================

class ComunidadStorageManager {
  private listeners: (() => void)[] = [];

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!localStorage.getItem('cjc_communities')) safeWrite('cjc_communities', SEED_COMMUNITIES);
    if (!localStorage.getItem('cjc_groups')) safeWrite('cjc_groups', SEED_MINISTRY_GROUPS);
    if (!localStorage.getItem('cjc_posts')) safeWrite('cjc_posts', SEED_POSTS);
    if (!localStorage.getItem('cjc_studies')) safeWrite('cjc_studies', SEED_BIBLE_STUDIES);
    if (!localStorage.getItem('cjc_study_sessions')) safeWrite('cjc_study_sessions', SEED_STUDY_SESSIONS);
    if (!localStorage.getItem('cjc_prayers')) safeWrite('cjc_prayers', SEED_PRAYERS);
    if (!localStorage.getItem('cjc_challenges')) safeWrite('cjc_challenges', SEED_CHALLENGES);
    if (!localStorage.getItem('cjc_events')) safeWrite('cjc_events', SEED_EVENTS);
    if (!localStorage.getItem('cjc_projects')) safeWrite('cjc_projects', SEED_PROJECTS);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  // --- A. COMUNIDADES ---
  public getCommunities(): ChurchCommunity[] {
    return safeRead('cjc_communities', SEED_COMMUNITIES);
  }

  public getCommunityById(id: string): ChurchCommunity | undefined {
    return this.getCommunities().find(c => c.id === id);
  }

  public createCommunity(data: Omit<ChurchCommunity, 'id' | 'createdAt' | 'members' | 'pendingRequests'>, creatorMember: CommunityMember): ChurchCommunity {
    const communities = this.getCommunities();
    const newCommunity: ChurchCommunity = {
      ...data,
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0],
      creatorId: creatorMember.userId,
      creatorName: creatorMember.name,
      creatorAvatar: creatorMember.avatar,
      members: [{ ...creatorMember, role: 'creador' }],
      pendingRequests: []
    };
    communities.unshift(newCommunity);
    safeWrite('cjc_communities', communities);
    this.notify();
    return newCommunity;
  }

  public updateCommunity(id: string, updates: Partial<ChurchCommunity>): ChurchCommunity | null {
    const communities = this.getCommunities();
    const index = communities.findIndex(c => c.id === id);
    if (index === -1) return null;

    communities[index] = {
      ...communities[index],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    safeWrite('cjc_communities', communities);
    this.notify();
    return communities[index];
  }

  public joinCommunity(communityId: string, member: CommunityMember, presentationMessage?: string): boolean {
    const communities = this.getCommunities();
    const comm = communities.find(c => c.id === communityId);
    if (!comm) return false;

    // Check if already member
    if (comm.members.some(m => m.userId === member.userId)) return false;

    if (comm.isPrivate) {
      // Add join request
      const existingReq = comm.pendingRequests.find(r => r.userId === member.userId);
      if (!existingReq) {
        comm.pendingRequests.push({
          id: `req_${Date.now()}`,
          userId: member.userId,
          userName: member.name,
          userAvatar: member.avatar,
          userDistrict: member.district,
          userChurch: member.church,
          reason: presentationMessage?.trim() || undefined,
          requestedAt: 'Hoy',
          status: 'pendiente'
        });
        safeWrite('cjc_communities', communities);
        this.addNotification({
          userId: comm.creatorId,
          type: 'solicitud',
          title: 'Nueva solicitud de ingreso',
          message: `${member.name} solicitó unirse a ${comm.name}.`,
          targetArea: 'distritos',
          targetId: comm.id
        });
        this.notify();
      }
      return true;
    } else {
      comm.members.push({ ...member, role: 'miembro' });
      safeWrite('cjc_communities', communities);
      this.notify();
      return true;
    }
  }

  public leaveCommunity(communityId: string, userId: string): boolean {
    const communities = this.getCommunities();
    const comm = communities.find(c => c.id === communityId);
    if (!comm) return false;

    comm.members = comm.members.filter(m => m.userId !== userId);
    safeWrite('cjc_communities', communities);
    this.notify();
    return true;
  }

  public removeMember(communityId: string, userId: string): boolean {
    const communities = this.getCommunities();
    const comm = communities.find(c => c.id === communityId);
    if (!comm) return false;

    // Do not allow removing creator
    if (comm.creatorId === userId) return false;

    comm.members = comm.members.filter(m => m.userId !== userId);
    safeWrite('cjc_communities', communities);
    this.notify();
    return true;
  }

  public handleJoinRequest(communityId: string, requestId: string, approve: boolean): boolean {
    const communities = this.getCommunities();
    const comm = communities.find(c => c.id === communityId);
    if (!comm) return false;

    const req = comm.pendingRequests.find(r => r.id === requestId);
    if (!req) return false;

    if (approve) {
      // Prevent duplicates
      if (!comm.members.some(m => m.userId === req.userId)) {
        comm.members.push({
          userId: req.userId,
          name: req.userName,
          avatar: req.userAvatar,
          role: 'miembro',
          joinedAt: 'Hoy',
          district: req.userDistrict,
          church: req.userChurch
        });
      }
      req.status = 'aprobada';
      this.addNotification({
        userId: req.userId,
        type: 'solicitud',
        title: 'Solicitud aprobada',
        message: `Fuiste aceptado en la comunidad ${comm.name}. Ya tienes acceso a sus contenidos y reuniones.`,
        targetArea: 'distritos',
        targetId: comm.id
      });
    } else {
      req.status = 'rechazada';
    }

    comm.pendingRequests = comm.pendingRequests.filter(r => r.id !== requestId);
    safeWrite('cjc_communities', communities);
    this.notify();
    return true;
  }

  public updateMemberRole(communityId: string, userId: string, newRole: CommunityRole): boolean {
    const communities = this.getCommunities();
    const comm = communities.find(c => c.id === communityId);
    if (!comm) return false;

    const member = comm.members.find(m => m.userId === userId);
    if (!member) return false;

    member.role = newRole;
    safeWrite('cjc_communities', communities);
    this.notify();
    return true;
  }

  // --- REUNIONES Y ACTIVIDADES DE COMUNIDAD ---
  public getMeetings(communityId?: string): CommunityMeeting[] {
    const all = safeRead<CommunityMeeting[]>('cjc_meetings', SEED_COMMUNITY_MEETINGS);
    const attendances = safeRead<MeetingAttendance[]>('cjc_attendances', SEED_ATTENDANCES);
    const enriched = all.map(m => ({
      ...m,
      virtualLink: m.virtualLink || m.virtualMeetingUrl,
      verse: m.verse || m.bibleVerse,
      materials: m.materials || (Array.isArray(m.materialsNeeded) ? m.materialsNeeded.join(', ') : ''),
      attendees: attendances.filter(a => a.meetingId === m.id)
    }));
    if (communityId) {
      return enriched.filter(m => m.communityId === communityId);
    }
    return enriched;
  }

  public createMeeting(data: Omit<CommunityMeeting, 'id' | 'createdAt' | 'status'>): CommunityMeeting {
    const meetings = this.getMeetings();
    const newMeeting: CommunityMeeting = {
      ...data,
      id: `meet_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      status: 'programada',
      createdAt: new Date().toISOString().split('T')[0]
    };
    meetings.unshift(newMeeting);
    safeWrite('cjc_meetings', meetings);

    // Notify community members
    const comm = this.getCommunityById(data.communityId);
    if (comm) {
      comm.members.forEach(member => {
        if (member.userId !== data.createdById) {
          this.addNotification({
            userId: member.userId,
            type: 'evento',
            title: `Nueva reunión: ${newMeeting.title}`,
            message: `${newMeeting.createdByName} programó una reunión para el ${newMeeting.date} a las ${newMeeting.startTime}.`,
            targetArea: 'distritos',
            targetId: newMeeting.communityId
          });
        }
      });
    }

    this.notify();
    return newMeeting;
  }

  public updateMeeting(meetingId: string, updates: Partial<CommunityMeeting>): CommunityMeeting | null {
    const meetings = this.getMeetings();
    const idx = meetings.findIndex(m => m.id === meetingId);
    if (idx === -1) return null;

    meetings[idx] = {
      ...meetings[idx],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    safeWrite('cjc_meetings', meetings);

    // Notify members of the update
    const meeting = meetings[idx];
    const comm = this.getCommunityById(meeting.communityId);
    if (comm) {
      comm.members.forEach(member => {
        this.addNotification({
          userId: member.userId,
          type: 'evento',
          title: `Reunión actualizada: ${meeting.title}`,
          message: `La información de la reunión del ${meeting.date} ha sido actualizada.`,
          targetArea: 'distritos',
          targetId: meeting.communityId
        });
      });
    }

    this.notify();
    return meetings[idx];
  }

  public cancelMeeting(meetingId: string): boolean {
    const meetings = this.getMeetings();
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return false;

    meeting.status = 'cancelada';
    meeting.updatedAt = new Date().toISOString().split('T')[0];
    safeWrite('cjc_meetings', meetings);

    // Notify members of cancellation
    const comm = this.getCommunityById(meeting.communityId);
    if (comm) {
      comm.members.forEach(member => {
        this.addNotification({
          userId: member.userId,
          type: 'evento',
          title: `Reunión cancelada: ${meeting.title}`,
          message: `La reunión programada para el ${meeting.date} fue cancelada por los administradores.`,
          targetArea: 'distritos',
          targetId: meeting.communityId
        });
      });
    }

    this.notify();
    return true;
  }

  public deleteMeeting(meetingId: string): boolean {
    let meetings = this.getMeetings();
    meetings = meetings.filter(m => m.id !== meetingId);
    safeWrite('cjc_meetings', meetings);

    // Also clean up attendances
    let attendances = safeRead<MeetingAttendance[]>('cjc_attendances', SEED_ATTENDANCES);
    attendances = attendances.filter(a => a.meetingId !== meetingId);
    safeWrite('cjc_attendances', attendances);

    this.notify();
    return true;
  }

  // --- CONFIRMACIÓN DE ASISTENCIA ---
  public getAttendances(meetingId: string): MeetingAttendance[] {
    const all = safeRead<MeetingAttendance[]>('cjc_attendances', SEED_ATTENDANCES);
    return all.filter(a => a.meetingId === meetingId);
  }

  public getUserAttendance(meetingId: string, userId: string): MeetingAttendance | undefined {
    return this.getAttendances(meetingId).find(a => a.userId === userId);
  }

  public setAttendance(
    meetingId: string, 
    communityIdOrUserId: string, 
    userOrResponse: any, 
    responseOrUserName?: any,
    userAvatar?: string,
    userDistrict?: string,
    userChurch?: string
  ): MeetingAttendance {
    const all = safeRead<MeetingAttendance[]>('cjc_attendances', SEED_ATTENDANCES);
    let userId: string;
    let userName: string;
    let avatar: string;
    let church: string | undefined;
    let district: string | undefined;
    let communityId: string;
    let response: AttendanceResponse;

    if (typeof userOrResponse === 'string') {
      // Called as setAttendance(meetingId, userId, response, userName, userAvatar, userDistrict, userChurch)
      userId = communityIdOrUserId;
      response = userOrResponse as AttendanceResponse;
      userName = responseOrUserName || 'Joven Adventista';
      avatar = userAvatar || '';
      district = userDistrict;
      church = userChurch;
      const m = this.getMeetings().find(item => item.id === meetingId);
      communityId = m?.communityId || '';
    } else {
      // Called as setAttendance(meetingId, communityId, userObj, response)
      communityId = communityIdOrUserId;
      userId = userOrResponse?.id || '';
      userName = userOrResponse?.name || 'Joven Adventista';
      avatar = userOrResponse?.avatar || '';
      church = userOrResponse?.church;
      district = userOrResponse?.district;
      response = responseOrUserName as AttendanceResponse;
    }

    // Ensure exactly 1 single response per member per meeting
    const filtered = all.filter(a => !(a.meetingId === meetingId && a.userId === userId));

    const newAttendance: MeetingAttendance = {
      id: `att_${meetingId}_${userId}`,
      meetingId,
      communityId,
      userId,
      userName,
      userAvatar: avatar,
      userChurch: church,
      userDistrict: district,
      response,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    filtered.push(newAttendance);
    safeWrite('cjc_attendances', filtered);
    this.notify();
    return newAttendance;
  }

  // --- ESPACIO DE AVISOS DE COMUNIDAD ---
  public getAnnouncements(communityId: string): CommunityAnnouncement[] {
    const all = safeRead<CommunityAnnouncement[]>('cjc_announcements', SEED_ANNOUNCEMENTS);
    return all.filter(a => a.communityId === communityId).map(a => ({
      ...a,
      date: a.date || a.createdAt
    }));
  }

  public createAnnouncement(data: Omit<CommunityAnnouncement, 'id' | 'createdAt'>): CommunityAnnouncement {
    const all = safeRead<CommunityAnnouncement[]>('cjc_announcements', SEED_ANNOUNCEMENTS);
    const newAnnouncement: CommunityAnnouncement = {
      ...data,
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    all.unshift(newAnnouncement);
    safeWrite('cjc_announcements', all);

    // Notify community members
    const comm = this.getCommunityById(data.communityId);
    if (comm) {
      comm.members.forEach(member => {
        if (member.userId !== data.authorId) {
          this.addNotification({
            userId: member.userId,
            type: 'grupo',
            title: `Aviso en ${comm.name}: ${newAnnouncement.title}`,
            message: `${newAnnouncement.authorName} publicó un aviso importante en tu comunidad.`,
            targetArea: 'distritos',
            targetId: comm.id
          });
        }
      });
    }

    this.notify();
    return newAnnouncement;
  }

  public deleteAnnouncement(announcementId: string): boolean {
    let all = safeRead<CommunityAnnouncement[]>('cjc_announcements', SEED_ANNOUNCEMENTS);
    all = all.filter(a => a.id !== announcementId);
    safeWrite('cjc_announcements', all);
    this.notify();
    return true;
  }

  // --- B. GRUPOS POR INTERESES ---
  public getMinistryGroups(): MinistryGroup[] {
    return safeRead('cjc_groups', SEED_MINISTRY_GROUPS);
  }

  public createMinistryGroup(data: Omit<MinistryGroup, 'id' | 'createdAt' | 'members' | 'activities' | 'creatorId'>, creatorUserId: string): MinistryGroup {
    const groups = this.getMinistryGroups();
    const newGroup: MinistryGroup = {
      ...data,
      id: `grp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      creatorId: creatorUserId,
      members: [creatorUserId],
      activities: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    groups.unshift(newGroup);
    safeWrite('cjc_groups', groups);
    this.notify();
    return newGroup;
  }

  public toggleJoinGroup(groupId: string, userId: string): boolean {
    const groups = this.getMinistryGroups();
    const grp = groups.find(g => g.id === groupId);
    if (!grp) return false;

    if (grp.members.includes(userId)) {
      grp.members = grp.members.filter(id => id !== userId);
    } else {
      grp.members.push(userId);
    }
    safeWrite('cjc_groups', groups);
    this.notify();
    return true;
  }

  // --- C. PUBLICACIONES ---
  public getPosts(): CommunityPost[] {
    return safeRead('cjc_posts', SEED_POSTS);
  }

  public createPost(data: Omit<CommunityPost, 'id' | 'createdAt' | 'reactions' | 'likedUserIds' | 'comments' | 'isFavoritedByUsers'>): CommunityPost {
    const posts = this.getPosts();
    const newPost: CommunityPost = {
      ...data,
      id: `post_cjc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: 'Justo ahora',
      reactions: { amen: 0, aleluya: 0, gloriaDios: 0, diosEsBueno: 0 },
      likedUserIds: [],
      comments: [],
      isFavoritedByUsers: []
    };
    posts.unshift(newPost);
    safeWrite('cjc_posts', posts);
    this.notify();
    return newPost;
  }

  public updatePost(postId: string, userId: string, updatedContent: string, updatedTitle?: string): boolean {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post || post.authorId !== userId) return false;

    post.content = updatedContent;
    if (updatedTitle !== undefined) post.title = updatedTitle;
    post.isEdited = true;
    post.updatedAt = 'Editado hace un momento';
    safeWrite('cjc_posts', posts);
    this.notify();
    return true;
  }

  public deletePost(postId: string, userId: string, isCommunityAdmin: boolean = false): boolean {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return false;
    if (post.authorId !== userId && !isCommunityAdmin) return false;

    const filtered = posts.filter(p => p.id !== postId);
    safeWrite('cjc_posts', filtered);
    this.notify();
    return true;
  }

  public toggleReaction(postId: string, userId: string, reactionType: 'amen' | 'aleluya' | 'gloriaDios' | 'diosEsBueno'): void {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const hasLiked = post.likedUserIds.includes(userId);
    if (hasLiked) {
      post.likedUserIds = post.likedUserIds.filter(id => id !== userId);
      post.reactions[reactionType] = Math.max(0, post.reactions[reactionType] - 1);
    } else {
      post.likedUserIds.push(userId);
      post.reactions[reactionType] = (post.reactions[reactionType] || 0) + 1;
      if (post.authorId !== userId) {
        this.addNotification({
          userId: post.authorId,
          type: 'reaccion',
          title: 'Reacción a tu publicación',
          message: `Un hermano reaccionó con "${reactionType}" a tu publicación.`,
          targetArea: 'feed',
          targetId: post.id
        });
      }
    }
    safeWrite('cjc_posts', posts);
    this.notify();
  }

  public toggleFavoritePost(postId: string, userId: string): boolean {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return false;

    const isFav = post.isFavoritedByUsers.includes(userId);
    if (isFav) {
      post.isFavoritedByUsers = post.isFavoritedByUsers.filter(id => id !== userId);
    } else {
      post.isFavoritedByUsers.push(userId);
    }
    safeWrite('cjc_posts', posts);
    this.notify();
    return !isFav;
  }

  public addComment(postId: string, authorId: string, authorName: string, authorAvatar: string, text: string): boolean {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return false;

    post.comments.push({
      id: `comm_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      authorId,
      authorName,
      authorAvatar,
      text,
      createdAt: 'Justo ahora',
      likes: 0,
      replies: []
    });

    if (post.authorId !== authorId) {
      this.addNotification({
        userId: post.authorId,
        type: 'comentario',
        title: 'Nuevo comentario',
        message: `${authorName} comentó en tu publicación.`,
        targetArea: 'feed',
        targetId: post.id
      });
    }

    safeWrite('cjc_posts', posts);
    this.notify();
    return true;
  }

  public addReplyToComment(postId: string, commentId: string, authorId: string, authorName: string, authorAvatar: string, text: string): boolean {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (!post) return false;

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) return false;

    if (!comment.replies) comment.replies = [];
    comment.replies.push({
      id: `rep_${Date.now()}`,
      authorId,
      authorName,
      authorAvatar,
      text,
      createdAt: 'Justo ahora',
      likes: 0
    });

    safeWrite('cjc_posts', posts);
    this.notify();
    return true;
  }

  // --- D. ESTUDIOS BÍBLICOS ---
  public getBibleStudies(): BibleStudyItem[] {
    return safeRead('cjc_studies', SEED_BIBLE_STUDIES);
  }

  public createBibleStudy(data: Omit<BibleStudyItem, 'id' | 'createdAt' | 'reflectionQuestions'>): BibleStudyItem {
    const studies = this.getBibleStudies();
    const newStudy: BibleStudyItem = {
      ...data,
      id: `study_${Date.now()}`,
      reflectionQuestions: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    studies.unshift(newStudy);
    safeWrite('cjc_studies', studies);
    this.notify();
    return newStudy;
  }

  public addAnswerToStudyQuestion(studyId: string, questionId: string, authorId: string, authorName: string, authorAvatar: string, answerText: string): boolean {
    const studies = this.getBibleStudies();
    const study = studies.find(s => s.id === studyId);
    if (!study) return false;

    const question = study.reflectionQuestions.find(q => q.id === questionId);
    if (!question) return false;

    question.answers.push({
      id: `ans_${Date.now()}`,
      questionId,
      authorId,
      authorName,
      authorAvatar,
      answerText,
      createdAt: 'Justo ahora'
    });
    safeWrite('cjc_studies', studies);
    this.notify();
    return true;
  }

  public getStudySessions(): BibleStudySession[] {
    return safeRead('cjc_study_sessions', SEED_STUDY_SESSIONS);
  }

  public createStudySession(data: Omit<BibleStudySession, 'id'>): BibleStudySession {
    const sessions = this.getStudySessions();
    const newSession: BibleStudySession = {
      ...data,
      id: `sess_${Date.now()}`
    };
    sessions.unshift(newSession);
    safeWrite('cjc_study_sessions', sessions);
    this.notify();
    return newSession;
  }

  // --- E. PETICIONES DE ORACIÓN Y TESTIMONIOS ---
  public getPrayers(currentUserId: string): CommunityPrayerRequest[] {
    const all = safeRead<CommunityPrayerRequest[]>('cjc_prayers', SEED_PRAYERS);
    // Filtrado de privacidad estricto: peticiones públicas visibles para todos,
    // peticiones privadas solo para el autor o si tiene acceso autorizado.
    return all.filter(p => !p.isPrivate || p.authorId === currentUserId);
  }

  public createPrayer(data: Omit<CommunityPrayerRequest, 'id' | 'createdAt' | 'intercessorsUserIds' | 'isAnswered' | 'encouragementMessages'>): CommunityPrayerRequest {
    const all = safeRead<CommunityPrayerRequest[]>('cjc_prayers', SEED_PRAYERS);
    const newPrayer: CommunityPrayerRequest = {
      ...data,
      id: `pr_cjc_${Date.now()}`,
      createdAt: 'Justo ahora',
      intercessorsUserIds: [],
      isAnswered: false,
      encouragementMessages: []
    };
    all.unshift(newPrayer);
    safeWrite('cjc_prayers', all);
    this.notify();
    return newPrayer;
  }

  public togglePrayFor(prayerId: string, userId: string): boolean {
    const all = safeRead<CommunityPrayerRequest[]>('cjc_prayers', SEED_PRAYERS);
    const prayer = all.find(p => p.id === prayerId);
    if (!prayer) return false;

    const hasPrayed = prayer.intercessorsUserIds.includes(userId);
    if (hasPrayed) {
      prayer.intercessorsUserIds = prayer.intercessorsUserIds.filter(id => id !== userId);
    } else {
      prayer.intercessorsUserIds.push(userId);
      if (prayer.authorId !== userId) {
        this.addNotification({
          userId: prayer.authorId,
          type: 'reaccion',
          title: 'Orando por tu motivo',
          message: 'Un hermano de la comunidad se unió en clamor por tu petición.',
          targetArea: 'oracion',
          targetId: prayer.id
        });
      }
    }
    safeWrite('cjc_prayers', all);
    this.notify();
    return !hasPrayed;
  }

  public addEncouragementMessage(prayerId: string, authorId: string, authorName: string, authorAvatar: string, message: string): boolean {
    const all = safeRead<CommunityPrayerRequest[]>('cjc_prayers', SEED_PRAYERS);
    const prayer = all.find(p => p.id === prayerId);
    if (!prayer) return false;

    prayer.encouragementMessages.push({
      id: `enc_${Date.now()}`,
      authorId,
      authorName,
      authorAvatar,
      message,
      createdAt: 'Justo ahora'
    });
    safeWrite('cjc_prayers', all);
    this.notify();
    return true;
  }

  public markPrayerAnswered(prayerId: string, userId: string, testimony: string): boolean {
    const all = safeRead<CommunityPrayerRequest[]>('cjc_prayers', SEED_PRAYERS);
    const prayer = all.find(p => p.id === prayerId);
    if (!prayer || prayer.authorId !== userId) return false;

    prayer.isAnswered = true;
    prayer.testimony = testimony;
    safeWrite('cjc_prayers', all);
    this.notify();
    return true;
  }

  public deletePrayer(prayerId: string, userId: string): boolean {
    const all = safeRead<CommunityPrayerRequest[]>('cjc_prayers', SEED_PRAYERS);
    const prayer = all.find(p => p.id === prayerId);
    if (!prayer || prayer.authorId !== userId) return false;

    const filtered = all.filter(p => p.id !== prayerId);
    safeWrite('cjc_prayers', filtered);
    this.notify();
    return true;
  }

  // --- F. RETOS DE SERVICIO CRISTIANO ---
  public getChallenges(): ServiceChallenge[] {
    return safeRead('cjc_challenges', SEED_CHALLENGES);
  }

  public enrollInChallenge(challengeId: string, userId: string): boolean {
    const challenges = this.getChallenges();
    const ch = challenges.find(c => c.id === challengeId);
    if (!ch) return false;

    if (!ch.enrolledUserIds.includes(userId)) {
      ch.enrolledUserIds.push(userId);
      ch.userStatuses[userId] = 'en_progreso';
      safeWrite('cjc_challenges', challenges);
      this.notify();
      return true;
    }
    return false;
  }

  public submitChallengeEvidence(challengeId: string, evidence: Omit<ServiceChallengeEvidence, 'id' | 'submittedAt'>): boolean {
    const challenges = this.getChallenges();
    const ch = challenges.find(c => c.id === challengeId);
    if (!ch) return false;

    const newEvidence: ServiceChallengeEvidence = {
      ...evidence,
      id: `ev_${Date.now()}`,
      submittedAt: 'Justo ahora'
    };
    ch.evidences.push(newEvidence);
    ch.userStatuses[evidence.userId] = 'enviado';
    safeWrite('cjc_challenges', challenges);

    this.addNotification({
      userId: ch.responsibleId,
      type: 'reto',
      title: 'Evidencia de reto enviada',
      message: `${evidence.userName} presentó evidencias para el reto "${ch.title}".`,
      targetArea: 'retos',
      targetId: ch.id
    });

    this.notify();
    return true;
  }

  public approveChallengeEvidence(challengeId: string, userId: string, reviewerName: string, notes?: string): boolean {
    const challenges = this.getChallenges();
    const ch = challenges.find(c => c.id === challengeId);
    if (!ch) return false;

    ch.userStatuses[userId] = 'completado';
    const ev = ch.evidences.find(e => e.userId === userId);
    if (ev) {
      ev.reviewedBy = reviewerName;
      ev.reviewNotes = notes || 'Aprobado con gozo.';
    }
    safeWrite('cjc_challenges', challenges);

    this.addNotification({
      userId,
      type: 'reto',
      title: '¡Reto cristiano aprobado!',
      message: `Tu evidencia para "${ch.title}" fue aprobada satisfactoriamente.`,
      targetArea: 'retos',
      targetId: ch.id
    });

    this.notify();
    return true;
  }

  // --- G. EVENTOS JUVENILES ---
  public getEvents(): YouthCommunityEvent[] {
    return safeRead('cjc_events', SEED_EVENTS);
  }

  public createEvent(data: Omit<YouthCommunityEvent, 'id' | 'createdAt' | 'registeredUserIds' | 'remindersSetUserIds'>): YouthCommunityEvent {
    const events = this.getEvents();
    const newEvent: YouthCommunityEvent = {
      ...data,
      id: `ev_cjc_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      registeredUserIds: [data.organizerId],
      remindersSetUserIds: []
    };
    events.unshift(newEvent);
    safeWrite('cjc_events', events);
    this.notify();
    return newEvent;
  }

  public toggleEventRegistration(eventId: string, userId: string): boolean {
    const events = this.getEvents();
    const ev = events.find(e => e.id === eventId);
    if (!ev) return false;

    const isRegistered = ev.registeredUserIds.includes(userId);
    if (isRegistered) {
      ev.registeredUserIds = ev.registeredUserIds.filter(id => id !== userId);
    } else {
      if (ev.capacity && ev.registeredUserIds.length >= ev.capacity) {
        return false; // Cupos llenos
      }
      ev.registeredUserIds.push(userId);
    }
    safeWrite('cjc_events', events);
    this.notify();
    return !isRegistered;
  }

  public toggleEventReminder(eventId: string, userId: string): boolean {
    const events = this.getEvents();
    const ev = events.find(e => e.id === eventId);
    if (!ev) return false;

    const hasReminder = ev.remindersSetUserIds.includes(userId);
    if (hasReminder) {
      ev.remindersSetUserIds = ev.remindersSetUserIds.filter(id => id !== userId);
    } else {
      ev.remindersSetUserIds.push(userId);
    }
    safeWrite('cjc_events', events);
    this.notify();
    return !hasReminder;
  }

  // --- H. TALENTOS Y PROYECTOS CREATIVOS ---
  public getProjects(): CreativeProject[] {
    return safeRead('cjc_projects', SEED_PROJECTS);
  }

  public createProject(data: Omit<CreativeProject, 'id' | 'createdAt' | 'likesCount' | 'likedUserIds'>): CreativeProject {
    const projects = this.getProjects();
    const newProject: CreativeProject = {
      ...data,
      id: `proj_${Date.now()}`,
      createdAt: 'Justo ahora',
      likesCount: 0,
      likedUserIds: []
    };
    projects.unshift(newProject);
    safeWrite('cjc_projects', projects);
    this.notify();
    return newProject;
  }

  public deleteProject(projectId: string, userId: string): boolean {
    const projects = this.getProjects();
    const proj = projects.find(p => p.id === projectId);
    if (!proj || proj.authorId !== userId) return false;

    const filtered = projects.filter(p => p.id !== projectId);
    safeWrite('cjc_projects', filtered);
    this.notify();
    return true;
  }

  public toggleProjectLike(projectId: string, userId: string): void {
    const projects = this.getProjects();
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    const hasLiked = proj.likedUserIds.includes(userId);
    if (hasLiked) {
      proj.likedUserIds = proj.likedUserIds.filter(id => id !== userId);
      proj.likesCount = Math.max(0, proj.likesCount - 1);
    } else {
      proj.likedUserIds.push(userId);
      proj.likesCount += 1;
    }
    safeWrite('cjc_projects', projects);
    this.notify();
  }

  // --- I. CRECIMIENTO ESPIRITUAL (DIARIO PRIVADO Y HÁBITOS) ---
  public getJournalEntries(userId: string): SpiritualJournalEntry[] {
    const all = safeRead<SpiritualJournalEntry[]>('cjc_journal', []);
    // Estricta privacidad: solo el propio usuario puede leer su diario personal
    return all.filter(e => e.userId === userId);
  }

  public addJournalEntry(userId: string, title: string, content: string, passageRead?: string, gratitudeList: string[] = []): SpiritualJournalEntry {
    const all = safeRead<SpiritualJournalEntry[]>('cjc_journal', []);
    const newEntry: SpiritualJournalEntry = {
      id: `j_${Date.now()}`,
      userId,
      title,
      content,
      date: new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
      passageRead,
      gratitudeList,
      isPrivateOnly: true,
      createdAt: new Date().toISOString()
    };
    all.unshift(newEntry);
    safeWrite('cjc_journal', all);
    this.notify();
    return newEntry;
  }

  public deleteJournalEntry(entryId: string, userId: string): boolean {
    const all = safeRead<SpiritualJournalEntry[]>('cjc_journal', []);
    const filtered = all.filter(e => !(e.id === entryId && e.userId === userId));
    safeWrite('cjc_journal', filtered);
    this.notify();
    return true;
  }

  public getSpiritualGoals(userId: string): SpiritualGoal[] {
    const all = safeRead<SpiritualGoal[]>('cjc_goals', [
      {
        id: 'g_oracion',
        userId,
        title: 'Oración matutina y vespertina',
        targetCount: 14,
        currentCount: 11,
        frequency: 'diaria',
        type: 'oracion',
        completedDates: []
      },
      {
        id: 'g_biblia',
        userId,
        title: 'Lectura diaria del Año Bíblico',
        targetCount: 7,
        currentCount: 6,
        frequency: 'diaria',
        type: 'lectura_biblica',
        completedDates: []
      }
    ]);
    return all.filter(g => g.userId === userId);
  }

  public incrementGoal(goalId: string, userId: string): void {
    const all = safeRead<SpiritualGoal[]>('cjc_goals', []);
    const goal = all.find(g => g.id === goalId && g.userId === userId);
    if (!goal) return;

    goal.currentCount = Math.min(goal.targetCount, goal.currentCount + 1);
    safeWrite('cjc_goals', all);
    this.notify();
  }

  // --- K. NOTIFICACIONES COMUNITARIAS ---
  public getNotifications(userId: string): CommunityNotification[] {
    const all = safeRead<CommunityNotification[]>('cjc_notifications', [
      {
        id: 'notif_init_1',
        userId,
        type: 'evento',
        title: 'Próxima Vigilia Zonal',
        message: 'La Vigilia «Fuego en el Altar» se realizará en el Templo Central.',
        read: false,
        targetArea: 'eventos',
        createdAt: 'Hoy'
      }
    ]);
    return all.filter(n => n.userId === userId);
  }

  public addNotification(notif: Omit<CommunityNotification, 'id' | 'read' | 'createdAt'>): void {
    const all = safeRead<CommunityNotification[]>('cjc_notifications', []);
    const newNotif: CommunityNotification = {
      ...notif,
      id: `notif_${Date.now()}`,
      read: false,
      createdAt: 'Justo ahora'
    };
    all.unshift(newNotif);
    safeWrite('cjc_notifications', all);
    this.notify();
  }

  public markNotificationAsRead(notifId: string): void {
    const all = safeRead<CommunityNotification[]>('cjc_notifications', []);
    const n = all.find(item => item.id === notifId);
    if (n) {
      n.read = true;
      safeWrite('cjc_notifications', all);
      this.notify();
    }
  }

  public markAllNotificationsAsRead(userId: string): void {
    const all = safeRead<CommunityNotification[]>('cjc_notifications', []);
    all.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    safeWrite('cjc_notifications', all);
    this.notify();
  }

  // --- L. REPORTES DE CONTENIDO ---
  public addReport(data: Omit<ContentReport, 'id' | 'createdAt' | 'status'>): void {
    const all = safeRead<ContentReport[]>('cjc_reports', []);
    all.unshift({
      ...data,
      id: `rep_${Date.now()}`,
      status: 'pendiente',
      createdAt: new Date().toISOString()
    });
    safeWrite('cjc_reports', all);
    this.notify();
  }

  // --- BÚSQUEDA GLOBAL COMUNITARIA (SECCIÓN K) ---
  public searchAll(query: string, currentUserId: string) {
    const q = query.toLowerCase().trim();
    if (!q) return { communities: [], groups: [], posts: [], studies: [], events: [], projects: [] };

    const communities = this.getCommunities().filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.church.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );

    const groups = this.getMinistryGroups().filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.categoryLabel.toLowerCase().includes(q)
    );

    const posts = this.getPosts().filter(p =>
      (p.title && p.title.toLowerCase().includes(q)) ||
      p.content.toLowerCase().includes(q) ||
      (p.bibleVerse && p.bibleVerse.toLowerCase().includes(q))
    );

    const studies = this.getBibleStudies().filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.bookOfBible.toLowerCase().includes(q) ||
      s.topic.toLowerCase().includes(q)
    );

    const events = this.getEvents().filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q)
    );

    const projects = this.getProjects().filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q)
    );

    return { communities, groups, posts, studies, events, projects };
  }
}

export const comunidadStorage = new ComunidadStorageManager();
