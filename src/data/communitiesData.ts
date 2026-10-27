import { Community } from '../types';

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: 'com_jovenes',
    name: 'Sociedad de Jóvenes (JA)',
    tagline: 'El mensaje del advenimiento a todo el mundo en mi generación',
    description: 'Comunidad principal de la juventud adventista. Espacio para cultivar la amistad cristiana, organizar cultos jóvenes los sábados de tarde, compartir testimonios de victoria, dinámicas bíblicas y forjar una fe sólida e inquebrantable.',
    category: 'jovenes',
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop&q=80',
    membersCount: 1840,
    memberIds: ['u_david', 'u_sofia', 'u_samuel', 'u_andres', 'u_valeria'],
    isJoined: true,
    topicsCount: 142,
    featuredVerse: 'Ninguno tenga en poco tu juventud, sino sé ejemplo de los creyentes en palabra, conducta, amor, espíritu, fe y pureza. — 1 Timoteo 4:12',
    rules: [
      'Respeto mutuo y edificación fraternal en todo momento.',
      'Publicaciones centradas en la fe, la esperanza y el compañerismo cristiano.',
      'No contenido comercial ajeno a la misión ni lenguaje inapropiado.',
      'Fomentar la unidad entre todas las iglesias y distritos.'
    ],
    moderators: [
      { id: 'u_david', name: 'David Meneses', avatar: '' },
      { id: 'u_valeria', name: 'Valeria Rios', avatar: '' }
    ],
    accentColor: 'from-amber-500 via-orange-600 to-red-600',
    activities: [
      'Cultos Jóvenes semanales (Sábados 4:00 PM)',
      'Semanas de Oración Juvenil',
      'Vigilias zonales de consagración',
      'Rallys bíblicos y fogatas espirituales'
    ]
  },
  {
    id: 'com_conquistadores',
    name: 'Conquistadores & Guías Mayores',
    tagline: 'Salvar del pecado y guiar en el servicio',
    description: 'Comunidad dedicada al pañuelo amarillo: Conquistadores, Guías Mayores y Aventureros. Especialidades de naturaleza, técnicas de campamento, nudos, primeros auxilios, marchas, lemas y vida al aire libre en comunión con el Creador.',
    category: 'conquistadores',
    avatar: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&auto=format&fit=crop&q=80',
    membersCount: 2310,
    memberIds: ['u_david', 'u_carlos', 'u_andres'],
    isJoined: true,
    topicsCount: 215,
    featuredVerse: 'Por la gracia de Dios, seré puro, bondadoso y leal; guardaré la ley del conquistador, seré siervo de Dios y amigo de la humanidad. — Voto del Conquistador',
    rules: [
      'Vivir el Voto y la Ley del Conquistador en cada interacción.',
      'Compartir recursos didácticos, manuales de especialidades y experiencias de campamento.',
      'Fomentar el cuidado de la creación de Dios y el amor por la naturaleza.',
      'Apoyar el crecimiento integral de los niños y adolescentes.'
    ],
    moderators: [
      { id: 'u_carlos', name: 'Carlos Arboleda', avatar: '' },
      { id: 'u_david', name: 'David Meneses', avatar: '' }
    ],
    accentColor: 'from-amber-600 via-yellow-600 to-amber-700',
    activities: [
      'Camporees Distritales y de Asociación',
      'Clínicas de especialidades de naturaleza',
      'Caminatas ecológicas de supervivencia',
      'Día Mundial del Conquistador'
    ]
  },
  {
    id: 'com_musica',
    name: 'Música & Alabanza',
    tagline: 'Alabadle con salterio y arpa, alabadle con pandero y danza',
    description: 'Para cantantes, instrumentistas, directores de alabanza, coros y compositores cristianos. Compartimos partituras, pistas, devocionales para músicos, técnicas vocales y organizamos conciertos de adoración para la gloria de Dios.',
    category: 'musica',
    avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
    membersCount: 1470,
    memberIds: ['u_sofia', 'u_lucia', 'u_mateo'],
    isJoined: false,
    topicsCount: 98,
    featuredVerse: 'Cantad a Jehová cántico nuevo; cantad a Jehová, toda la tierra. Cantad a Jehová, bendecid su nombre; anunciad de día en día su salvación. — Salmos 96:1-2',
    rules: [
      'Música sacra que eleve el pensamiento y rinda reverencia a Dios.',
      'Compartir recursos legales, acordes, cifrados y arreglos corales.',
      'Crítica constructiva que edifique el talento de los jóvenes.',
      'Fomentar la excelencia y la espiritualidad en la plataforma de la iglesia.'
    ],
    moderators: [
      { id: 'u_sofia', name: 'Sofía Carabalí', avatar: '' },
      { id: 'u_lucia', name: 'Lucía Montaño', avatar: '' }
    ],
    accentColor: 'from-purple-600 via-indigo-600 to-blue-600',
    activities: [
      'Festivales de música sacra juvenil',
      'Talleres de técnica vocal y respiración',
      'Encuentros de directores de música y coros',
      'Noches de adoración y vigilias acústicas'
    ]
  },
  {
    id: 'com_evangelismo',
    name: 'Evangelismo Juvenil',
    tagline: 'Id por todo el mundo y predicad el evangelio a toda criatura',
    description: 'Movimiento de jóvenes proclamadores de la verdad. Grupos pequeños, semanas de la Voz de la Juventud, estudios bíblicos interactivos, literatura misionera y evangelismo digital en redes sociales.',
    category: 'evangelismo',
    avatar: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?w=1200&auto=format&fit=crop&q=80',
    membersCount: 1650,
    memberIds: ['u_samuel', 'u_david', 'u_gabriel'],
    isJoined: true,
    topicsCount: 164,
    featuredVerse: '¿Cómo, pues, invocarán a aquel en el cual no han creído? ¿Y cómo creerán en aquel de quien no han oído? ¿Y cómo oirán sin haber quien les predique? — Romanos 10:14',
    rules: [
      'Compartir planes de estudios bíblicos y testimonios de conversión.',
      'Respetar doctrinas bíblicas fundamentales de la Iglesia Adventista.',
      'Trabajo en equipo para campañas de la Voz de la Juventud.',
      'Oración continua por las personas que están recibiendo la palabra.'
    ],
    moderators: [
      { id: 'u_samuel', name: 'Samuel Hurtado', avatar: '' },
      { id: 'u_gabriel', name: 'Gabriel Perea', avatar: '' }
    ],
    accentColor: 'from-emerald-600 via-teal-600 to-cyan-600',
    activities: [
      'Campañas de la Voz de la Juventud',
      'Siembra de literatura y "El Conflicto de los Siglos"',
      'Discipulado juvenil y clases bautismales',
      'Evangelismo digital e impacto en TikTok/Instagram'
    ]
  },
  {
    id: 'com_mision',
    name: 'Misión & Caleb',
    tagline: 'Dejar una huella de esperanza en el corazón de la comunidad',
    description: 'Voluntariado radical: Misión Caleb, brigadas médicas, ayuda humanitaria ADRA, pintura de escuelas, donación de sangre y rescate de espacios públicos. Demostramos el amor de Cristo con las manos en acción.',
    category: 'mision',
    avatar: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1200&auto=format&fit=crop&q=80',
    membersCount: 2190,
    memberIds: ['u_david', 'u_sofia', 'u_samuel'],
    isJoined: true,
    topicsCount: 188,
    featuredVerse: 'Entonces Jesús le dijo: Ve, y haz tú lo mismo. — Lucas 10:37',
    rules: [
      'Compromiso genuino con el servicio voluntario desinteresado.',
      'Reportar proyectos comunitarios con fotos y resultados reales.',
      'Cuidar la dignidad y privacidad de las familias beneficiadas.',
      'Seguir protocolos de seguridad en zonas vulnerables.'
    ],
    moderators: [
      { id: 'u_david', name: 'David Meneses', avatar: '' },
      { id: 'u_sofia', name: 'Sofía Carabalí', avatar: '' }
    ],
    accentColor: 'from-rose-600 via-pink-600 to-amber-600',
    activities: [
      'Misión Caleb Pacífico (Buenaventura)',
      'Brigadas comunitarias de salud y odontología',
      'Limpieza ecológica de playas y ríos',
      'Remodelación de hogares de adultos mayores'
    ]
  },
  {
    id: 'com_universitarios',
    name: 'Estudiantes Universitarios (FEJA / AMiCUS)',
    tagline: 'Fe sólida en el campus, excelencia académica para Dios',
    description: 'Comunidad de jóvenes en educación superior técnica y universitaria. Defendemos nuestra fe ante el secularismo, creacionismo vs evolucionismo, santificación del sábado en exámenes, mentoría profesional y compañerismo en el campus.',
    category: 'estudiantes_universitarios',
    avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1200&auto=format&fit=crop&q=80',
    membersCount: 1120,
    memberIds: ['u_sofia', 'u_samuel', 'u_mateo'],
    isJoined: false,
    topicsCount: 76,
    featuredVerse: 'A estos cuatro muchachos Dios les dio conocimiento e inteligencia en todas las letras y ciencias; y Daniel tuvo entendimiento en toda visión y sueños. — Daniel 1:17',
    rules: [
      'Diálogo respetuoso, argumentación bíblica fundamentada y cortesía.',
      'Apoyo en trámites de libertad religiosa y exámenes en sábado.',
      'Networking profesional y tutorías académicas gratuitas.',
      'Testimonio fiel en las universidades públicas y privadas.'
    ],
    moderators: [
      { id: 'u_samuel', name: 'Samuel Hurtado', avatar: '' },
      { id: 'u_mateo', name: 'Mateo Riascos', avatar: '' }
    ],
    accentColor: 'from-blue-600 via-indigo-700 to-purple-800',
    activities: [
      'Congresos de Universitarios AMiCUS',
      'Foros sobre fe y ciencia (Creacionismo)',
      'Asesoría jurídica en Libertad Religiosa',
      'Grupos de estudio y oración en campus universitarios'
    ]
  }
];

export interface CommunityDiscussion {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorChurch: string;
  title: string;
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  tags: string[];
  isPinned?: boolean;
}

export const INITIAL_DISCUSSIONS: CommunityDiscussion[] = [
  {
    id: 'disc_1',
    communityId: 'com_jovenes',
    authorId: 'u_david',
    authorName: 'David Meneses',
    authorAvatar: '',
    authorChurch: 'Iglesia Central Buenaventura',
    title: '¿Qué temas de actualidad juvenil les gustaría abordar en los próximos cultos JA?',
    content: 'Hermanos, estamos planificando el trimestre de la Sociedad de Jóvenes. Queremos abordar salud mental desde la perspectiva bíblica, vocación, pureza y relaciones. ¿Qué opiniones y dinámicas sugieren?',
    createdAt: 'Hace 2 horas',
    likesCount: 28,
    commentsCount: 14,
    tags: ['SociedadJA', 'Planificación', 'Juventud'],
    isPinned: true
  },
  {
    id: 'disc_2',
    communityId: 'com_conquistadores',
    authorId: 'u_carlos',
    authorName: 'Carlos Arboleda',
    authorAvatar: '',
    authorChurch: 'Distrito Bellavista',
    title: 'Guía práctica para la especialidad de Climatología y Nubes en zona costera',
    content: 'Comparto con los directores y consejeros la ficha didáctica para enseñar nubes cúmulos, estratos y cirros adaptada a nuestro clima tropical húmedo del Pacífico.',
    createdAt: 'Ayer',
    likesCount: 39,
    commentsCount: 8,
    tags: ['Especialidades', 'Campismo', 'Conquistadores'],
    isPinned: true
  },
  {
    id: 'disc_3',
    communityId: 'com_musica',
    authorId: 'u_sofia',
    authorName: 'Sofía Carabalí',
    authorAvatar: '',
    authorChurch: 'Iglesia El Jordán',
    title: 'Pistas y partituras corales para la Vigilia Zonal de Noviembre',
    content: 'Hemos subido los arreglos a cuatro voces para los himnos "Firme y Adelante" y "Cuán Grande es Él" en tonalidades cómodas para los coros juveniles distritales.',
    createdAt: 'Hace 1 día',
    likesCount: 45,
    commentsCount: 19,
    tags: ['Alabanza', 'Arreglos', 'CoroJA']
  },
  {
    id: 'disc_4',
    communityId: 'com_mision',
    authorId: 'u_david',
    authorName: 'David Meneses',
    authorAvatar: '',
    authorChurch: 'Iglesia Central Buenaventura',
    title: 'Convocatoria Caleb: Brigada de salud y pintura en La Bocana',
    content: 'Este fin de semana salimos en lancha desde el muelle turístico hacia La Bocana. Necesitamos 15 voluntarios más para odontología preventiva y apoyo en carpa infantil.',
    createdAt: 'Hace 3 días',
    likesCount: 64,
    commentsCount: 22,
    tags: ['MisionCaleb', 'Voluntariado', 'Buenaventura'],
    isPinned: true
  },
  {
    id: 'disc_5',
    communityId: 'com_universitarios',
    authorId: 'u_samuel',
    authorName: 'Samuel Hurtado',
    authorAvatar: '',
    authorChurch: 'Iglesia El Cristal',
    title: 'Plantilla de solicitud de Libertad Religiosa para exámenes de sábado',
    content: 'Para todos los universitarios que están enfrentando exámenes o parciales programados en horas de sábado, les comparto el formato legal avalado por la Asociación para radicar ante sus decanaturas.',
    createdAt: 'Hace 4 días',
    likesCount: 52,
    commentsCount: 17,
    tags: ['AMiCUS', 'LibertadReligiosa', 'Universidad'],
    isPinned: true
  }
];
