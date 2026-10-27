import { 
  YouthGroup, 
  BibleQuestionAnswer, 
  YouthPrayerRequest, 
  YouthMissionChallenge, 
  YouthEventItem, 
  YouthCreativeItem, 
  DailyDevotionalDay, 
  OfflineYouthResource, 
  YouthCommunityPost 
} from './types';

// ============================================================================
// 1. GRUPOS JUVENILES POR INTERESES Y MINISTERIOS
// ============================================================================
export const INITIAL_YOUTH_GROUPS: YouthGroup[] = [
  {
    id: 'grp_musica_alabanza',
    name: 'Música & Alabanza JA',
    category: 'musica',
    categoryLabel: 'Ministerio de Música',
    description: 'Ensayos corales, ensamble instrumental, pistas de adoración y preparación musical para cultos divinos, festivales y vigilias.',
    leaderName: 'Coordinación Musical Zonal',
    membersCount: 84,
    meetingTime: 'Sábados 5:30 PM (Post-JA)',
    verseAnchor: 'Salmos 150:6 — Todo lo que respira alabe a Jehová.',
    icon: '🎵',
    gradient: 'from-amber-500 to-orange-600',
    joined: true
  },
  {
    id: 'grp_conquistadores_guias',
    name: 'Club de Guías Mayores & Líderes Juveniles',
    category: 'guias_mayores',
    categoryLabel: 'Liderazgo & Naturaleza',
    description: 'Campismo, clases progresivas, especialidades de nudos, primeros auxilios, pionerismo y testimonio en la naturaleza.',
    leaderName: 'Liderazgo de Clubes',
    membersCount: 112,
    meetingTime: 'Domingos 9:00 AM',
    verseAnchor: '1 Timoteo 4:12 — Ninguno tenga en poco tu juventud, sino sé ejemplo de los creyentes.',
    icon: '⛺',
    gradient: 'from-emerald-600 to-teal-700',
    joined: false
  },
  {
    id: 'grp_mision_caleb',
    name: 'Misión Caleb & Evangelismo Urbano',
    category: 'mision_caleb',
    categoryLabel: 'Evangelismo & Acción',
    description: 'Parejas misioneras, brigadas de impacto comunitario, limpieza de playas y parques en Buenaventura, estudios bíblicos juveniles.',
    leaderName: 'Comisión Caleb Asopacífico',
    membersCount: 96,
    meetingTime: 'Viernes 6:30 PM & Tardes de Testimonio',
    verseAnchor: 'Josué 14:12 — Dame, pues, ahora este monte del cual habló Jehová aquel día.',
    icon: '🔥',
    gradient: 'from-rose-600 to-red-700',
    joined: true
  },
  {
    id: 'grp_medios_digitales',
    name: 'Medios Digitales & Creatividad Cristiana',
    category: 'medios',
    categoryLabel: 'Comunicaciones & Streaming',
    description: 'Fotografía, transmisión en vivo de cultos, diseño de versículos, producción audiovisual y podcasts de testimonio juvenil.',
    leaderName: 'Equipo Audiovisual JA',
    membersCount: 65,
    meetingTime: 'Jueves 7:00 PM (Virtual/Presencial)',
    verseAnchor: 'Marcos 16:15 — Id por todo el mundo y predicad el evangelio a toda criatura.',
    icon: '📹',
    gradient: 'from-blue-600 to-indigo-700',
    joined: false
  },
  {
    id: 'grp_accion_social_salud',
    name: 'Acción Solidaria & Salud Adventista',
    category: 'social_salud',
    categoryLabel: 'Servicio & Salud',
    description: 'Comedores comunitarios sabáticos, jornadas de donación de alimentos, talleres de los 8 remedios naturales de Dios y visitas a hogares geriátricos.',
    leaderName: 'Ministerio de Salud & Dorcas Juvenil',
    membersCount: 78,
    meetingTime: 'Sábados 2:30 PM',
    verseAnchor: 'Mateo 25:40 — En cuanto lo hicisteis a uno de estos mis hermanos más pequeños, a mí lo hicisteis.',
    icon: '🤝',
    gradient: 'from-purple-600 to-pink-600',
    joined: false
  }
];

// ============================================================================
// 2. ESTUDIOS BÍBLICOS Y PREGUNTAS SOBRE LA BIBLIA
// ============================================================================
export const BIBLE_QUESTIONS_AND_STUDIES: BibleQuestionAnswer[] = [
  {
    id: 'qa_sabado_senorio',
    question: '¿Por qué los adventistas guardamos el sábado del séptimo día y no el domingo?',
    category: 'doctrina',
    categoryLabel: 'Sábado y Descanso de Dios',
    biblicalAnswer: 'El sábado fue instituido por Dios en el Edén antes de que existiera el pecado o cualquier distinción étnica (Génesis 2:1-3). Dios lo bendijo, lo santificó y lo colocó en el corazón de los Diez Mandamientos (Éxodo 20:8-11). Jesús mismo guardó el sábado como su costumbre (Lucas 4:16) y declaró que «el sábado fue hecho por causa del hombre, no el hombre por causa del sábado» (Marcos 2:27-28). La iglesia apostólica continuó celebrándolo (Hechos 13:42-44; 17:2; 18:4). En la Tierra Nueva, todos los redimidos continuarán adorando a Dios de sábado en sábado (Isaías 66:22-23).',
    keyVerses: [
      { ref: 'Éxodo 20:8-11', text: 'Acuérdate del día de reposo para santificarlo. Seis días trabajarás, y harás toda tu obra; mas el séptimo día es reposo para Jehová tu Dios...' },
      { ref: 'Génesis 2:2-3', text: 'Y bendijo Dios al día séptimo, y lo santificó, porque en él reposó de toda la obra que había hecho en la creación.' },
      { ref: 'Lucas 4:16', text: 'Vino a Nazaret, donde se había criado; y en el día de reposo entró en la sinagoga, conforme a su costumbre.' }
    ],
    practicalApplication: 'El sábado es un recordativo semanal de que nuestro valor proviene de ser creados y redimidos por Dios, no de nuestra productividad económica. Es un oasis de 24 horas de desconexión del estrés secular y reconexión con Dios, la familia y la hermandad.',
    ellenWhiteQuote: '«El sábado es una señal del poder creador y redentor de Dios; señala hacia Dios como la fuente de la vida y del conocimiento» (La Educación, pág. 250).',
    tags: ['Sábado', 'Creación', 'Ley de Dios', 'Paz interior']
  },
  {
    id: 'qa_estado_muertos',
    question: '¿Qué le sucede al ser humano al morir según las Sagradas Escrituras?',
    category: 'doctrina',
    categoryLabel: 'Naturaleza Humana y Esperanza',
    biblicalAnswer: 'La Biblia describe la muerte como un sueño inconsciente a la espera de la resurrección. Eclesiastés 9:5 afirma: «Los vivos saben que han de morir; pero los muertos nada saben». El salmista declara en Salmos 146:4: «Pues sale su aliento, y vuelve a la tierra; en ese mismo día perecen sus pensamientos». Jesús mismo llamó al fallecimiento de su amigo Lázaro un «sueño» antes de levantarlo de la tumba (Juan 11:11-14). La esperanza cristiana reposa en la primera resurrección cuando Cristo regrese con voz de arcángel y trompeta de Dios (1 Tesalonicenses 4:16-17; 1 Corintios 15:51-54).',
    keyVerses: [
      { ref: 'Eclesiastés 9:5-6', text: 'Porque los que viven saben que han de morir; pero los muertos nada saben, ni tienen más paga; porque su memoria es puesta en olvido.' },
      { ref: 'Juan 11:11-14', text: 'Dicho esto, les dijo después: Nuestro amigo Lázaro duerme; mas voy para despertarle.' },
      { ref: '1 Tesalonicenses 4:16', text: 'Porque el Señor mismo con voz de mando, con voz de arcángel, y con trompeta de Dios, descenderá del cielo; y los muertos en Cristo resucitarán primero.' }
    ],
    practicalApplication: 'Esta verdad bíblica nos libra del temor a los espíritus, del espiritismo y del dolor sin esperanza. Nos asegura que nuestros seres queridos creyentes descansan en la paz de Dios sin sufrimiento presente, aguardando el glorioso despertar en la Segunda Venida.',
    tags: ['Muerte', 'Resurrección', 'Segunda Venida', 'Paz mental']
  },
  {
    id: 'qa_juventud_vencer_tentacion',
    question: '¿Cómo puede un joven cristiano vencer las tentaciones y presiones de la cultura contemporánea?',
    category: 'vida_cristiana',
    categoryLabel: 'Vida Cristiana Juvenil',
    biblicalAnswer: 'El Salmo 119:9 pregunta: «¿Con qué limpiará el joven su camino? Con guardar tu palabra». Vencer la tentación no es cuestión de fuerza de voluntad humana, sino de comunión constante con Cristo. 1 Corintios 10:13 promete que Dios «no os dejará ser tentados más de lo que podéis resistir, sino que dará también juntamente con la tentación la salida». Además, Santiago 4:7 nos instruye: «Someteos, pues, a Dios; resistid al diablo, y huirá de vosotros». Huir a tiempo, como hizo el joven José (Génesis 39:12), es sabiduría espiritual, no cobardía.',
    keyVerses: [
      { ref: 'Salmos 119:9,11', text: '¿Con qué limpiará el joven su camino? Con guardar tu palabra. En mi corazón he guardado tus dichos, para no pecar contra ti.' },
      { ref: '1 Corintios 10:13', text: 'Fiel es Dios, que no os dejará ser tentados más de lo que podéis resistir...' },
      { ref: 'Filipenses 4:13', text: 'Todo lo puedo en Cristo que me fortalece.' }
    ],
    practicalApplication: 'Dedica la primera hora del día a la oración y lectura bíblica antes de mirar redes sociales. Rodéate de amistades adventistas que compartan tus convicciones y pon filtros saludables en tus dispositivos.',
    tags: ['Pureza', 'Victoria', 'Oración Matutina', 'Amistades']
  }
];

// ============================================================================
// 3. PETICIONES DE ORACIÓN Y TESTIMONIOS
// ============================================================================
export const INITIAL_YOUTH_PRAYERS: YouthPrayerRequest[] = [
  {
    id: 'yp_1',
    authorName: 'Camila Rentería',
    authorDistrict: 'Distrito Central (Buenaventura)',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    title: 'Por mi hermano mayor que se alejó de los caminos del Señor',
    request: 'Pido oración sincera por mi hermano Carlos. Está enfrentando malas compañías y depresión en el puerto. Queremos que el Espíritu Santo toque su corazón para que regrese a la iglesia.',
    date: 'Hace 4 horas',
    intercessorsCount: 38,
    isAnswered: false,
    hasPrayed: true
  },
  {
    id: 'yp_2',
    authorName: 'Andrés Viveros',
    authorDistrict: 'Distrito Manantial (Buenaventura)',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    title: '¡Testimonio! Dios abrió puertas para el examen de admisión y el Sábado',
    request: 'Tenía programado el examen de la universidad un sábado por la mañana. Rogamos a Dios en la sociedad de jóvenes para que me permitieran cambio de jornada por libertad religiosa.',
    date: 'Hace 1 día',
    intercessorsCount: 52,
    isAnswered: true,
    testimony: '¡Gloria a Dios! Las autoridades académicas aceptaron la constancia oficial de la Iglesia Adventista y me reprogramaron para el lunes sin penalización alguna. ¡Dios honra a quienes le honran!',
    hasPrayed: false
  },
  {
    id: 'yp_3',
    authorName: 'Yuliana Mosquera',
    authorDistrict: 'Distrito Emanuel (Buenaventura)',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=240&auto=format&fit=crop&q=80',
    title: 'Por la salud pulmonar de nuestro director de Conquistadores',
    request: 'El hermano Jorge está hospitalizado con un cuadro respiratorio agudo. Rogamos al Médico de médicos por su pronta recuperación para que siga guiando a nuestros niños y adolescentes.',
    date: 'Hace 2 días',
    intercessorsCount: 47,
    isAnswered: false,
    hasPrayed: true
  }
];

// ============================================================================
// 4. RETOS DE SERVICIO CRISTIANO Y ACTIVIDADES MISIONERAS
// ============================================================================
export const INITIAL_MISSION_CHALLENGES: YouthMissionChallenge[] = [
  {
    id: 'ret_caleb_canasta',
    title: 'Canasta del Amor: Alimentos para una familia necesitada',
    category: 'accion_social',
    description: 'Arma junto a tu grupo pequeño o sociedad JA una canasta con alimentos no perecederos y llévala a una familia vulnerable de tu vecindario orando con ellos.',
    objective: 'Manifestar el amor práctico de Cristo en los sectores necesitados de Buenaventura.',
    bibleVerse: 'Santiago 2:15-16 — Y si un hermano o una hermana están desnudos, y tienen necesidad del mantenimiento de cada día...',
    steps: [
      'Reunir víveres con otros 2 jóvenes adventistas (arroz, granos, aceite, avena, frutas)',
      'Identificar con el liderazgo de tu iglesia una familia necesitada',
      'Visitar la casa, entregar los alimentos y ofrecer una oración de bendición'
    ],
    pointsReward: 120,
    participantsCount: 43,
    completed: false
  },
  {
    id: 'ret_visitacion_ancianos',
    title: 'Visita de Ánimo y Cantos a un Hermano Convaleciente',
    category: 'visitacion',
    description: 'Visita este sábado por la tarde a un anciano o miembro enfermo de tu congregación. Lleva tu himnario, entona dos cantos y léeles una promesa bíblica.',
    objective: 'Reconectar a los pioneros de la fe con el calor y la alegría de la juventud adventista.',
    bibleVerse: 'Levítico 19:32 — Delante de las canas te levantarás, y honrarás el rostro del anciano.',
    steps: [
      'Coordinar con el primer anciano de la iglesia la lista de hermanos enfermos',
      'Llevar flores, una tarjeta con un versículo y el Himnario Adventista',
      'Cantar con reverencia y orar por su sanidad y fortaleza'
    ],
    pointsReward: 90,
    participantsCount: 68,
    completed: true
  },
  {
    id: 'ret_sabado_joven_limpieza',
    title: 'Impacto Ecológico: Cuidado de la Creación de Dios',
    category: 'comunidad',
    description: 'Jornada dominical de recolección de plásticos y limpieza en el malecón o cuenca fluvial para ser testimonio de mayordomía de la Tierra creada por Dios.',
    objective: 'Demostrar que los jóvenes adventistas cuidamos el medio ambiente como mayordomos del Creador.',
    bibleVerse: 'Génesis 2:15 — Tomó, pues, Jehová Dios al hombre, y lo puso en el huerto de Edén, para que lo labrara y lo guardase.',
    steps: [
      'Reunirse con guantes y bolsas biodegradables a las 8:00 AM',
      'Recolectar residuos reciclables en el sector acordado',
      'Compartir agua fresca y folletos de esperanza a los transeúntes'
    ],
    pointsReward: 100,
    participantsCount: 54,
    completed: false
  }
];

// ============================================================================
// 5. EVENTOS Y ENCUENTROS JUVENILES
// ============================================================================
export const INITIAL_YOUTH_EVENTS: YouthEventItem[] = [
  {
    id: 'ev_encuentro_ja_2026',
    title: 'Vigilia Espiritual Zonal: «Fuego en el Altar»',
    type: 'vigilia',
    typeLabel: 'Vigilia Espiritual',
    date: '14 de Noviembre de 2026',
    time: '08:00 PM – 04:00 AM',
    venue: 'Templo Adventista Central de Buenaventura',
    districtOrScope: 'Zona Buenaventura (5 Distritos)',
    description: 'Noche de consagración, clamor por el derramamiento del Espíritu Santo, concierto de solistas y testimonios de impacto misionero juvenil.',
    organizer: 'Federación Juvenil Zonal Asopacífico',
    confirmedCount: 185,
    isConfirmed: true
  },
  {
    id: 'ev_tarde_misionera_puerto',
    title: 'Tarde Misionera: «Misión Urbana Buenaventura»',
    type: 'tarde_misionera',
    typeLabel: 'Tarde de Testimonio',
    date: '21 de Noviembre de 2026',
    time: '02:30 PM – 05:30 PM',
    venue: 'Sector Isla Cascajal & Malecón Bahía de la Cruz',
    districtOrScope: 'Distrito Central y Distrito Manantial',
    description: 'Distribución de libros misioneros del año, abrazos de esperanza, oración por transeúntes y música sacra al aire libre.',
    organizer: 'Ministerios Personales & Sociedad JA',
    confirmedCount: 120,
    isConfirmed: false
  },
  {
    id: 'ev_caminata_fe',
    title: 'Caminata y Retiro en la Naturaleza: «Cerca del Creador»',
    type: 'caminata',
    typeLabel: 'Naturaleza & Devoción',
    date: '6 de Diciembre de 2026',
    time: '07:30 AM – 03:00 PM',
    venue: 'Sendero Ecológico Río Dagua / Bajo Calima',
    districtOrScope: 'Distrito Bajo Calima & Conquistadores',
    description: 'Caminata espiritual, estudio de la Biblia en la naturaleza, meditación sobre las maravillas creadas y almuerzo campestre vegetariano.',
    organizer: 'Clubes de Guías Mayores Asopacífico',
    confirmedCount: 95,
    isConfirmed: false
  }
];

// ============================================================================
// 6. TALENTOS, MÚSICA Y PROYECTOS CREATIVOS CRISTIANOS
// ============================================================================
export const INITIAL_CREATIVE_ITEMS: YouthCreativeItem[] = [
  {
    id: 'crea_canto_1',
    title: '«Castillo Fuerte es Nuestro Dios» — Arreglo Coral Juvenil',
    authorName: 'Coro Juvenil Zona Buenaventura',
    authorDistrict: 'Distrito Central',
    type: 'alabanza_audio',
    typeLabel: 'Música Sacra',
    description: 'Arreglo a cuatro voces del clásico himno de la Reforma con instrumentación acústica grabado en el templo Central de Buenaventura.',
    audioUrl: 'https://archive.org/download/hymns-adventist/castillo_fuerte_demo.mp3',
    lyricsOrText: 'Castillo fuerte es nuestro Dios, defensa y buen escudo; con su poder nos librará en este trance agudo. Con furia y con afán acósanos Satán; por armas y torpeza redobla su fiereza; mas ya su fin presiente.',
    likesCount: 142,
    isLiked: true
  },
  {
    id: 'crea_poesia_1',
    title: '«Firme en la Tempestad del Mar»',
    authorName: 'Marlon Angulo',
    authorDistrict: 'Distrito Bajo Calima',
    type: 'poesia',
    typeLabel: 'Poesía Cristiana',
    description: 'Versos inspirados en las aguas del Pacífico y en la seguridad de que Jesús calma las tormentas de nuestra juventud.',
    lyricsOrText: `Aun cuando el mar del puerto ruge con bravura,
y la marea suba buscando zozobrar,
mi barca tiene un timonel de gran ternura:
Jesús de Nazaret, Señor de cielo y mar.

No temeré los vientos, ni la noche oscura,
si en el madero santo fijo mi mirar;
mi juventud anhela vivir en la estatura
de Aquel que vino al mundo para redimir y amar.`,
    likesCount: 89,
    isLiked: false
  },
  {
    id: 'crea_podcast_1',
    title: 'Podcast: «Jóvenes con Propósito en el Pacífico» — Episodio 1: Fe en la Universidad',
    authorName: 'Equipo de Medios JA',
    authorDistrict: 'Distrito Manantial',
    type: 'podcast',
    typeLabel: 'Podcast Juvenil',
    description: 'Conversatorio ameno con 3 jóvenes adventistas sobre cómo mantener los principios bíblicos y la observancia del sábado en las aulas universitarias.',
    lyricsOrText: 'Resumen del episodio: Estrategias para pedir permisos de sábado por libertad religiosa en Colombia, cómo testificar con excelencia académica y el valor de no avergonzarse del Evangelio.',
    likesCount: 115,
    isLiked: true
  }
];

// ============================================================================
// 7. CRECIMIENTO ESPIRITUAL Y PLANES DEVOCIONALES
// ============================================================================
export const DEVOTIONAL_DAYS_PLAN: DailyDevotionalDay[] = [
  {
    dayNumber: 1,
    title: 'Consagración Total: Entregando el Corazón',
    bibleVerseRef: 'Proverbios 23:26',
    bibleVerseText: '«Dame, hijo mío, tu corazón, y miren tus ojos por mis caminos.»',
    reflection: 'Dios no nos pide un porcentaje de nuestra vida, ni las sobras de nuestro tiempo libre. Él pide el trono de nuestro corazón para transformarlo, sanar nuestras heridas y llenarlo de su paz. Cuando le entregamos todo lo que somos, Él nos devuelve una vida con verdadero propósito eterno.',
    challengeOfDay: 'Aparta 15 minutos en silencio absoluto antes de dormir para orar entregando tus temores y metas a Jesús.',
    prayerPoint: 'Señor Jesús, hoy te entrego el timón de mi juventud. Toma mis decisiones, mis afectos y mis sueños.',
    isCompleted: true
  },
  {
    dayNumber: 2,
    title: 'Firmeza ante la Presión Social',
    bibleVerseRef: 'Daniel 1:8',
    bibleVerseText: '«Y Daniel propuso en su corazón no contaminarse con la porción de la comida del rey, ni con el vino que él bebía.»',
    reflection: 'Daniel era un joven cautivo en Babilonia, lejos de sus padres y de su templo. Sin embargo, su fidelidad a Dios estaba grabada en su alma. No necesitó que nadie lo estuviera vigilando para decidir hacer lo correcto. La verdadera lealtad a Dios se demuestra cuando nadie te ve.',
    challengeOfDay: 'Di un "No" amable y firme a una conversación, chisme o situación en redes sociales que no edifique tu mente.',
    prayerPoint: 'Padre celestial, dame la valentía santa de Daniel para permanecer leal a tus mandamientos en medio de un mundo seductor.',
    isCompleted: true
  },
  {
    dayNumber: 3,
    title: 'Luz que Alumbra en la Oscuridad',
    bibleVerseRef: 'Mateo 5:14-16',
    bibleVerseText: '«Vosotros sois la luz del mundo; una ciudad asentada sobre un monte no se puede esconder... Así alumbre vuestra luz delante de los hombres.»',
    reflection: 'No fuiste llamado a esconderte con temor, sino a brillar con el reflejo de Jesús. En el colegio, en la universidad, en tu barrio o en tu lugar de trabajo en Buenaventura, cada acto de bondad sincera y cada palabra de esperanza es un rayo de luz en medio de las tinieblas.',
    challengeOfDay: 'Envía un mensaje bíblico de ánimo a un amigo o compañero que esté pasando por dificultades.',
    prayerPoint: 'Señor, hazme un instrumento de tu luz hoy. Que otros vean a Cristo a través de mi conducta y amabilidad.',
    isCompleted: false
  },
  {
    dayNumber: 4,
    title: 'El Poder de la Oración Intercesora',
    bibleVerseRef: 'Santiago 5:16',
    bibleVerseText: '«Confesaos vuestras ofensas unos a otros, y orad unos por otros, para que seáis sanados. La oración eficaz del justo puede mucho.»',
    reflection: 'Cuando oras por otro joven, el cielo se moviliza. La intercesión rompe cadenas, abre puertas cerradas y acerca a los descarriados al redil de Cristo. No subestimes el poder de arrodillarte en favor de tu congregación y tus amigos.',
    challengeOfDay: 'Escribe el nombre de 3 amigos en un papel y ora por ellos al levantarte y al acostarte.',
    prayerPoint: 'Señor, pongo en tus manos a mis amigos que no te conocen. Despierta en ellos sed de tu verdad.',
    isCompleted: false
  }
];

// ============================================================================
// 8. RECURSOS CRISTIANOS GUARDADOS PARA CONSULTAR SIN CONEXIÓN (OFFLINE)
// ============================================================================
export const INITIAL_OFFLINE_RESOURCES: OfflineYouthResource[] = [
  {
    id: 'res_dinamicas_ja_completa',
    title: 'Guía Maestra: 20 Dinámicas Rompehielos y Juegos Bíblicos para Sociedad de Jóvenes',
    category: 'dinamicas_ja',
    categoryLabel: 'Dinámicas JA & Sociedad de Jóvenes',
    summary: 'Colección completa de dinámicas activas, concursos bíblicos con versículos y actividades de integración para sábados de tarde.',
    fullContent: `GUÍA MAESTRA DE DINÁMICAS BÍBLICAS JA (DISPONIBLE SIN CONEXIÓN)

1. EL TELEFONO DE LA FE
Objetivo: Recordar versículos bíblicos de memoria de forma divertida.
Materiales: Tarjetas con versículos (Ej: Juan 3:16, Filipenses 4:13, Romanos 8:28).
Desarrollo: Formar dos filas. El primer participante lee el versículo en secreto y lo susurra al oído del siguiente. El último debe recitarlo y escribirlo en la pizarra.

2. ¿QUIÉN SOY EN LAS ESCRITURAS?
Objetivo: Repasar biografías de héroes bíblicos (José, Rut, Daniel, Ester, Nehemías, Pablo).
Desarrollo: Se pega en la frente de un joven el nombre de un personaje bíblico sin que lo vea. Solo puede hacer preguntas que se respondan con "SÍ" o "NO" (Ej: ¿Viví en el Antiguo Testamento? ¿Fui rey? ¿Fui profeta?).

3. LA CADENA DEL AMOR CRISTIANO
Objetivo: Fomentar el aprecio y compañerismo en la hermandad juvenil.
Desarrollo: Cada joven recibe un ovillo de lana. Debe lanzar la punta a otro joven mencionando una virtud cristiana que admira en él (Ej: "Aprecio tu fidelidad en la alabanza"). Al final, se forma una red que simboliza la unidad del cuerpo de Cristo (Efesios 4:16).

4. TRIVIA RELÁMPAGO: LOS LIBROS DE LA BIBLIA
Objetivo: Memorizar el orden y clasificación de los 66 libros canónicos (Pentateuco, Históricos, Poéticos, Profetas Mayores y Menores, Evangelios, Epístolas).`,
    authorOrSource: 'Ministerio Juvenil de la Unión Colombiana del Sur',
    estimatedReadTime: '8 min de lectura',
    isSavedOffline: true,
    savedAt: 'Guardado en tu dispositivo'
  },
  {
    id: 'res_sermon_juvenil_listo',
    title: 'Bosquejo de Sermón Juvenil: «La Generación que No se Dobla»',
    category: 'sermones',
    categoryLabel: 'Bosquejos para Predicación JA',
    summary: 'Bosquejo homilético completo para predicar en culto divino de sábado o programa especial de jóvenes. Basado en Daniel 3.',
    fullContent: `BOSQUEJO HOMILÉTICO PARA CULTO JOVEN

TÍTULO: «La Generación que No se Dobla»
TEXTO BÍBLICO PRINCIPAL: Daniel 3:16-18
TEMA: Fidelidad incondicional a los principios divinos bajo presión social.

I. INTRODUCCIÓN
- El escenario de la llanura de Dura: una estatua de oro monumental y una multitud dispuesta a arrodillarse ante el decreto imperial.
- Las presiones contemporáneas que enfrentan los jóvenes adventistas: modas mundanas, transigencia en el sábado, popularidad superficial.

II. TRES JÓVENES CONVICCIÓN INQUEBRANTABLE
1. Sadrac, Mesac y Abed-nego no dudaron ni necesitaron deliberar: «No es necesario que te respondamos sobre este asunto».
2. Su fe no dependía del resultado material: «Nuestro Dios puede librarnos... Y si no, sabe, oh rey, que no serviremos a tus dioses».

III. LA CUARTA PERSONA EN EL HORNO
- El fuego no los destruyó; solo quemó sus ataduras.
- El Hijo de Dios pasea con nosotros en medio de las pruebas más ardientes.
- La promesa de Isaías 43:2: «Cuando pases por el fuego, no te quemarás, ni la llama arderá en ti».

IV. LLAMADO Y CONCLUSIÓN
- ¿Ante qué estatua te está pidiendo el mundo que te arrodilles?
- Invitación a ponerse en pie por Cristo y consagrar la juventud sin condiciones.
- Oración de entrega.`,
    authorOrSource: 'Departamento de Evangelismo JA',
    estimatedReadTime: '6 min de lectura',
    isSavedOffline: true,
    savedAt: 'Guardado en tu dispositivo'
  },
  {
    id: 'res_banco_preguntas_biblicas',
    title: 'Banco de 100 Preguntas Bíblicas con Respuestas y Textos para Campamentos',
    category: 'preguntas_biblicas',
    categoryLabel: 'Banco de Preguntas Bíblicas',
    summary: 'Preguntas clasificadas en niveles fácil, medio y avanzado con sustento bíblico para competencias y rallys espirituales.',
    fullContent: `BANCO DE PREGUNTAS BÍBLICAS CLASIFICADAS (USO SIN CONEXIÓN)

NIVEL 1: FÁCIL
1. ¿Quién construyó el arca por mandato de Dios? -> Noé (Génesis 6:14)
2. ¿Cuál es el versículo más corto de la Biblia en español? -> «Jesús lloró» (Juan 11:35)
3. ¿Cuántos días y noches llovió durante el diluvio? -> 40 días y 40 noches (Génesis 7:12)
4. ¿En qué monte recibió Moisés las tablas de la Ley? -> En el Monte Sinaí (Éxodo 19:20)
5. ¿Quién fue tragado por un gran pez por huir de Nínive? -> Jonás (Jonás 1:17)

NIVEL 2: MEDIO
6. ¿Quién era el rey de Babilonia cuando vio la escritura en la pared? -> Belsasar (Daniel 5:1)
7. ¿Cuáles eran los nombres de las dos columnas del templo de Salomón? -> Jaquín y Boaz (1 Reyes 7:21)
8. ¿Cuántos años vivió Matusalén, el hombre más longevo de la Biblia? -> 969 años (Génesis 5:27)
9. ¿Qué profeta vio un valle de huesos secos cobrar vida? -> Ezequiel (Ezequiel 37:1-10)
10. ¿Cuál es el capítulo del amor en el Nuevo Testamento? -> 1 Corintios 13

NIVEL 3: AVANZADO
11. ¿Cuál es el significado de los 2.300 días proféticos de Daniel 8:14? -> Comienzan en 457 a.C. y culminan en 1844 con el inicio del Juicio Investigador en el Santuario Celestial.
12. ¿Qué tres ángeles proclaman los mensajes finales en Apocalipsis 14:6-12? -> Mensaje del Evangelio eterno y juicio, caída de Babilonia, y advertencia contra la marca de la bestia y guarda de los mandamientos.`,
    authorOrSource: 'Comisión de Educación Bíblica JA',
    estimatedReadTime: '12 min de lectura',
    isSavedOffline: false,
  }
];

// ============================================================================
// 9. PUBLICACIONES Y PARTICIPACIÓN EN LA COMUNIDAD JUVENIL
// ============================================================================
export const INITIAL_YOUTH_POSTS: YouthCommunityPost[] = [
  {
    id: 'ypost_1',
    authorId: 'u_samuel_bv',
    authorName: 'Samuel Caicedo',
    authorUsername: 'samuel_ja_pacifico',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=240&auto=format&fit=crop&q=80',
    authorDistrict: 'Distrito Central (Buenaventura)',
    ministryBadge: 'Líder JA · Música',
    content: '¡Hermanos jóvenes! Terminamos un ensayo bendecido con el grupo de alabanza en la Iglesia Central. Recordemos que nuestra música no es para recibir aplausos del mundo, sino para rendir el más alto homenaje a Aquel que dio su vida por nosotros en la cruz del Calvario. ¡Feliz preparación para el Santo Sábado!',
    bibleVerse: 'Salmos 33:3 — Cantadle cántico nuevo; hacedlo bien, tañendo con júbilo.',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    createdAt: 'Hace 2 horas',
    reactions: {
      amen: 48,
      aleluya: 31,
      gloriaDios: 22,
      diosEsBueno: 19
    },
    comments: [
      {
        id: 'c_1',
        authorName: 'Valeria Mosquera',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
        text: '¡Amén! Qué gozo escuchar las alabanzas que ensayaron. Que el Señor siga afinando sus dones para su honra.',
        time: 'Hace 1 hora'
      },
      {
        id: 'c_2',
        authorName: 'David Riascos',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
        text: '¡Gloria a Dios! Allá estaremos apoyando el sábado de tarde.',
        time: 'Hace 40 min'
      }
    ],
    userReaction: 'amen'
  },
  {
    id: 'ypost_2',
    authorId: 'u_elena_manantial',
    authorName: 'Elena Sinisterra',
    authorUsername: 'elena_manantial',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=240&auto=format&fit=crop&q=80',
    authorDistrict: 'Distrito Manantial (Buenaventura)',
    ministryBadge: 'Misión Caleb',
    content: 'Testimonio de fe: Hoy visitamos con las parejas misioneras a dos familias que estaban atravesando luto. Oramos con ellos y les leímos 1 Tesalonicenses 4:16-17. Las lágrimas se convirtieron en paz cuando comprendieron la bendita esperanza de la resurrección. La misión de Cristo transforma los corazones.',
    bibleVerse: '1 Tesalonicenses 4:18 — Por tanto, alentaos los unos a los otros con estas palabras.',
    createdAt: 'Hace 6 horas',
    reactions: {
      amen: 62,
      aleluya: 44,
      gloriaDios: 38,
      diosEsBueno: 29
    },
    comments: [
      {
        id: 'c_3',
        authorName: 'Pastor Invitado',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80',
        text: '¡Qué bendición queridos jóvenes! Ese es el verdadero evangelismo que la Asociación del Pacífico promueve con Viviendo la Misión 7-70.',
        time: 'Hace 3 horas'
      }
    ]
  }
];
