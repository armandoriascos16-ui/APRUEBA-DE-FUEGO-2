export interface AdventistMovie {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  duration: string;
  genre: string;
  rating: string;
  posterUrl: string;
  backdropUrl?: string;
  synopsis: string;
  spiritualThemes: string[];
  discussionQuestions: string[];
  watchUrl: string;
  trailerUrl?: string;
  platform: 'Feliz7Play' | 'Hope Channel' | 'YouTube Oficial' | 'Enlace Seguro';
  isOfficialAdventist: boolean;
}

export interface YouthActivityIdea {
  id: string;
  title: string;
  category: 'rompehielos' | 'drama' | 'gymkhana' | 'programa_ja' | 'vigilia' | 'mision_social';
  durationMinutes: number;
  difficulty: 'Fácil' | 'Media' | 'Avanzada';
  biblicalTheme: string;
  bibleVerse: string;
  objective: string;
  materialsRequired: string[];
  stepByStepGuide: string[];
  directorTips: string;
  discussionPrompt: string;
}

export interface FundraisingGuide {
  id: string;
  title: string;
  category: 'gastronomia_saludable' | 'servicios' | 'eventos_beneficos' | 'manualidades_estampados';
  estimatedEarnings: string;
  timeline: string;
  objective: string;
  materialsNeeded: string[];
  executionSteps: string[];
  adventistPrinciplesNote: string;
  budgetSample: { item: string; cost: number; expectedReturn: number }[];
}

export interface WorkPlanTemplate {
  id: string;
  title: string;
  year: number;
  scope: 'Anual JA' | 'Trimestral JA' | 'Club de Conquistadores';
  motto: string;
  bibleVerse: string;
  spiritualGoals: string[];
  missionaryGoals: string[];
  monthlySchedule: { month: string; mainEvent: string; weeklyFocus: string[] }[];
  leadershipRoles: { role: string; responsibility: string }[];
}

export interface YouthMaterial {
  id: string;
  title: string;
  category: 'manuales_oficiales' | 'guias_estudio' | 'himnarios_musica' | 'logos_graficos' | 'escuela_sabatica';
  authorOrEntity: string;
  format: 'PDF' | 'PPTX' | 'MP3/Cifrado' | 'ZIP/PNG';
  size: string;
  description: string;
  howToAccess: string;
  downloadUrl: string;
  isOfficial: boolean;
}

export interface DailyChallengeSchedule {
  dayOfWeek: number; // 0: Domingo, 1: Lunes, ..., 6: Sábado
  dayName: string;
  title: string;
  theme: string;
  verseRef: string;
  verseText: string;
  description: string;
  points: number;
  difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Épico';
  evidenceType: string;
  icon: string;
}

// ============================================================================
// 1. PORTAL DE PELÍCULAS ADVENTISTAS Y CRISTIANAS
// ============================================================================
export const ADVENTIST_MOVIES: AdventistMovie[] = [
  {
    id: 'mov_tell_the_world',
    title: 'Dile al Mundo (Tell The World)',
    originalTitle: 'Tell The World',
    year: 2016,
    duration: '2h 35min',
    genre: 'Histórica / Biográfica / Fe',
    rating: 'Todo Público (Recomendada JA)',
    posterUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=800&auto=format&fit=crop&q=80',
    synopsis: 'La mayor producción cinematográfica sobre los orígenes de la Iglesia Adventista del Séptimo Día. Narra el doloroso chasco de 1844, la firmeza de Guillermo Miller, las visiones de Elena G. de White y el redescubrimiento del Santo Sábado bíblico.',
    spiritualThemes: ['Perseverancia en la prueba', 'Fidelidad profética', 'El valor de la verdad presente', 'La Segunda Venida de Jesús'],
    discussionQuestions: [
      '¿Cómo superaron los pioneros la desilusión de 1844 cuando sus expectativas humanas fallaron?',
      '¿Qué papel jugó el estudio profundo de la Biblia en lugar de las opiniones personales?',
      '¿Qué mensaje profético nos toca llevar hoy a los jóvenes en Buenaventura y el mundo?'
    ],
    watchUrl: 'https://www.youtube.com/watch?v=Fj-c1k-g8n0',
    platform: 'YouTube Oficial',
    isOfficialAdventist: true,
  },
  {
    id: 'mov_hacksaw_ridge_doss',
    title: 'Desmond Doss: El Soldado de la Fe',
    originalTitle: 'The Conscientious Objector / Desmond Doss Story',
    year: 2016,
    duration: '2h 19min',
    genre: 'Drama Histórico / Biografía / Testimonio',
    rating: '+12 años',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    synopsis: 'La asombrosa historia real del cabo adventista Desmond Doss, quien se negó a portar armas y guardó el sábado en la batalla de Okinawa, salvando a 75 camaradas heridos con la oración constante: "Señor, ayúdame a salvar a uno más". Medalla de Honor del Congreso.',
    spiritualThemes: ['Lealtad a los 10 Mandamientos', 'El poder de la oración bajo fuego', 'Amor a los enemigos', 'Sábado bíblico innegociable'],
    discussionQuestions: [
      '¿Qué presiones enfrentó Desmond por defender el mandamiento "No matarás" y el sábado?',
      '¿Cómo impactó su testimonio a los compañeros que antes se burlaban de su fe?',
      '¿En qué situaciones de tu vida académica o laboral sientes que debes ser un "Desmond Doss" de tu generación?'
    ],
    watchUrl: 'https://www.youtube.com/results?search_query=desmond+doss+adventist+documentary',
    platform: 'YouTube Oficial',
    isOfficialAdventist: true,
  },
  {
    id: 'mov_silencio_de_dios',
    title: 'El Silencio de Dios',
    originalTitle: 'The Silence of God',
    year: 2020,
    duration: '1h 38min',
    genre: 'Drama / Fe contemporánea',
    rating: 'Familiar',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    synopsis: 'Una conmovedora historia producida por Feliz7Play que explora el dolor, la pérdida y las preguntas que nacen cuando Dios parece guardar silencio frente a las tragedias de la vida.',
    spiritualThemes: ['Confianza en la oscuridad', 'Consuelo en Cristo', 'El propósito del sufrimiento'],
    discussionQuestions: [
      '¿Qué hacer cuando oramos intensamente y la respuesta de Dios no llega de inmediato?',
      '¿Cómo podemos los jóvenes consolar a alguien de nuestra iglesia que está pasando por duelo?'
    ],
    watchUrl: 'https://www.feliz7play.com/es/',
    platform: 'Feliz7Play',
    isOfficialAdventist: true,
  },
  {
    id: 'mov_el_pastor',
    title: 'El Pastor (The Shepherd)',
    originalTitle: 'The Shepherd',
    year: 2018,
    duration: '1h 25min',
    genre: 'Misión / Drama Rural',
    rating: 'Todo Público',
    posterUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800&auto=format&fit=crop&q=80',
    synopsis: 'Un joven pastor recién graduado es enviado a un distrito remoto y dividido. Con humildad, sacrificio y el ministerio de la reconciliación, transforma a la comunidad por el poder del Espíritu Santo.',
    spiritualThemes: ['Vocación pastoral', 'Liderazgo de servicio', 'Unidad en la congregación'],
    discussionQuestions: [
      '¿Cómo un líder joven puede ganarse el respeto sin imponer autoridad sino sirviendo?',
      '¿Qué conflictos de nuestra Sociedad de Jóvenes pueden sanar con el perdón cristiano?'
    ],
    watchUrl: 'https://www.feliz7play.com/es/',
    platform: 'Feliz7Play',
    isOfficialAdventist: true,
  },
  {
    id: 'mov_cuarto_de_guerra',
    title: 'Cuarto de Guerra (War Room)',
    originalTitle: 'War Room',
    year: 2015,
    duration: '2h 00min',
    genre: 'Cristiano / Drama Familiar',
    rating: 'Todo Público',
    posterUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop&q=80',
    synopsis: 'Una pareja cuya familia se desmorona descubre el poder de la oración estratégica en un "cuarto de guerra" secreto, aprendiendo a pelear las batallas de rodillas.',
    spiritualThemes: ['Guerra espiritual', 'Estrategia de intercesión', 'Restauración del hogar'],
    discussionQuestions: [
      '¿Tienes un lugar y momento específico en tu día para tu comunión a solas con Dios?',
      '¿Cómo podemos transformar nuestro grupo de oración JA en un verdadero ejército intercesor?'
    ],
    watchUrl: 'https://www.youtube.com/results?search_query=cuarto+de+guerra+pelicula+cristiana',
    platform: 'YouTube Oficial',
    isOfficialAdventist: false,
  },
  {
    id: 'mov_gran_esperanza',
    title: 'La Gran Esperanza: El Rescate Final',
    originalTitle: 'The Great Hope',
    year: 2022,
    duration: '1h 45min',
    genre: 'Profecía / Esperanza / Aventura',
    rating: 'Todo Público',
    posterUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
    synopsis: 'Un recorrido visual impactante sobre los eventos finales del conflicto cósmico entre Cristo y Satanás, enfocado en la promesa inquebrantable de la Nueva Jerusalén y la pronta venida de nuestro Señor.',
    spiritualThemes: ['Esperanza bienaventurada', 'Profecías de Daniel y Apocalipsis', 'Preparación espiritual'],
    discussionQuestions: [
      '¿Cómo podemos vivir sin temor a los tiempos finales con la mirada puesta en Jesús?',
      '¿Qué esperanza le podemos dar a los jóvenes sin rumbo en nuestra ciudad?'
    ],
    watchUrl: 'https://www.feliz7play.com/es/',
    platform: 'Feliz7Play',
    isOfficialAdventist: true,
  }
];

// ============================================================================
// 2. PORTAL DE IDEAS PARA ACTIVIDADES JUVENILES (SOCIEDAD DE JÓVENES)
// ============================================================================
export const YOUTH_ACTIVITY_IDEAS: YouthActivityIdea[] = [
  {
    id: 'act_1',
    title: 'El Laberinto de la Fe (Rompehielos a Ciegas)',
    category: 'rompehielos',
    durationMinutes: 25,
    difficulty: 'Fácil',
    biblicalTheme: 'Confianza y Escucha de la Voz de Dios',
    bibleVerse: 'Juan 10:27 — "Mis ovejas oyen mi voz, y yo las conozco, y me siguen."',
    objective: 'Fomentar la confianza mutua entre los jóvenes y enseñar a distinguir la voz de Dios en medio del ruido del mundo.',
    materialsRequired: ['Pañuelos para vendar los ojos', 'Sillas o conos para crear obstáculos', 'Campanitas o aplausos'],
    stepByStepGuide: [
      '1. Forma parejas: uno tendrá los ojos vendados (el caminante) y el otro será su guía vocal.',
      '2. Coloca obstáculos en el salón (sillas, almohadones, botellas plásticas).',
      '3. El guía solo puede hablar con palabras suaves desde el otro extremo del salón, sin tocar a su compañero.',
      '4. Para añadir dificultad, los demás jóvenes harán ruido ambiental o darán direcciones falsas.',
      '5. Al terminar, reúnan al grupo y reflexionen con Juan 10:27.'
    ],
    directorTips: 'Asegura que el suelo no tenga objetos punzantes. Esta dinámica es perfecta para el inicio de un sábado de tarde antes del mensaje central.',
    discussionPrompt: '¿Qué distracciones de las redes sociales o amistades te impiden escuchar los susurros del Espíritu Santo?'
  },
  {
    id: 'act_2',
    title: 'Juicio a un Personaje Bíblico (Drama Interactivo)',
    category: 'programa_ja',
    durationMinutes: 50,
    difficulty: 'Media',
    biblicalTheme: 'Gracia, Justicia y Arrepentimiento',
    bibleVerse: 'Romanos 8:33-34 — "¿Quién acusará a los escogidos de Dios? Dios es el que justifica."',
    objective: 'Profundizar en la historia bíblica desde una perspectiva jurídica y teológica participativa.',
    materialsRequired: ['Un podio o mesa para el juez', 'Martillo de juez', 'Copias de textos bíblicos para fiscales y defensores'],
    stepByStepGuide: [
      '1. Elige un personaje bíblico controvertido (ejemplo: Jonás por desobediencia, Pedro por negar a Jesús, o Rahab por su fe).',
      '2. Asigna roles: Juez (Pastor o anciano), Fiscal Acusador (Líder JA), Abogado Defensor (Joven estudiante de teología/derecho), Testigos bíblicos y Jurado (toda la congregación).',
      '3. El fiscal expone las faltas del acusado con versículos.',
      '4. La defensa presenta las evidencias de conversión, la gracia divina y el plan de salvación.',
      '5. El jurado vota y el Juez da el veredicto final fundamentado en Cristo como nuestro Abogado Intercesor.'
    ],
    directorTips: 'Prepara con una semana de anticipación a los tres oradores principales para que sus argumentos bíblicos sean sólidos y edificantes.',
    discussionPrompt: 'Si Satanás nos acusara hoy ante el tribunal celestial, ¿cuál es nuestra única garantía de absolución?'
  },
  {
    id: 'act_3',
    title: 'Rally Bíblico "Los Secretos de la Reforma"',
    category: 'gymkhana',
    durationMinutes: 60,
    difficulty: 'Avanzada',
    biblicalTheme: 'Sola Scriptura y Valor Heroico',
    bibleVerse: 'Hebreos 11:38 — "De los cuales el mundo no era digno..."',
    objective: 'Aprender la historia de los pioneros y héroes de la fe mediante estaciones de acertijos físicos y teológicos.',
    materialsRequired: ['Pistas impresas en pergaminos', 'Biblias físicas', 'Pañuelos de colores para equipos', 'Premios simbólicos'],
    stepByStepGuide: [
      '1. Divide a los jóvenes en 4 tribus o equipos con pañuelos distintivos.',
      '2. Establece 5 estaciones: Estación Valdense (memorización de textos en silencio), Estación Lutero (clavar tesis de fe), Estación Desmond Doss (rescate de heridos en camilla), Estación Guillermo Miller (cálculo de fechas proféticas en Daniel) y Estación Misión Pacífica (creación de una maqueta misionera).',
      '3. En cada estación, el equipo debe responder una prueba bíblica y superar un reto cooperativo.',
      '4. El primer equipo en completar el papiro gana una medalla espiritual para su sociedad.'
    ],
    directorTips: 'Ideal para realizarse al aire libre, en un parque o durante un retiro campestre en San Cipriano o zonas verdes de Buenaventura.',
    discussionPrompt: '¿Estarías dispuesto a copiar la Biblia a mano como los valdenses para que otros conozcan a Jesús?'
  },
  {
    id: 'act_4',
    title: 'Impacto Semáforo: "Jesús te Ama en Buenaventura"',
    category: 'mision_social',
    durationMinutes: 90,
    difficulty: 'Media',
    biblicalTheme: 'Servicio Urbano Desinteresado',
    bibleVerse: 'Mateo 5:14 — "Vosotros sois la luz del mundo; una ciudad asentada sobre un monte no se puede esconder."',
    objective: 'Llevar alegría, oración y literatura de esperanza a conductores y peatones en puntos neurálgicos.',
    materialsRequired: ['Pancartas con mensajes positivos ("Dios cree en ti", "Sonríe, Cristo viene")', 'Agua embotellada fría', 'Folletos El Camino a Cristo / La Gran Esperanza', 'Chalecos o pañuelos JA'],
    stepByStepGuide: [
      '1. Reunión de oración y consagración en el templo adventista antes de salir.',
      '2. Ubicarse en intersecciones seguras autorizadas (con permiso municipal o de líderes de barrio).',
      '3. En la luz roja, mostrar pancartas con sonrisas y entregar volantes con botellas de agua.',
      '4. Un equipo de jóvenes ofrece orar en 30 segundos por quienes lo deseen en sus vehículos o a los transeúntes.',
      '5. Regreso a la iglesia para compartir testimonios de las personas impactadas.'
    ],
    directorTips: 'Mantener la seguridad vial como máxima prioridad. No bloquear el tráfico ni pedir dinero.',
    discussionPrompt: '¿Qué rostro de Jesús vio la comunidad de Buenaventura a través de nuestra sonrisa hoy?'
  }
];

// ============================================================================
// 3. GUÍAS PARA RECAUDACIÓN DE FONDOS JUVENILES ÉTICOS (PRO-FONDOS JA)
// ============================================================================
export const FUNDRAISING_GUIDES: FundraisingGuide[] = [
  {
    id: 'fund_1',
    title: 'Banquete Gastronómico Vegetariano "Sabores de Esperanza"',
    category: 'gastronomia_saludable',
    estimatedEarnings: '$1.500.000 - $3.000.000 COP',
    timeline: '3 a 4 semanas de preparación',
    objective: 'Financiar la inscripción y transporte de jóvenes de escasos recursos al Camporee Nacional o Misión Caleb.',
    materialsNeeded: ['Ingredientes para menú gourmet vegetariano (proteínas vegetales, ensaladas tropicales, postres saludables)', 'Mesas vestidas y ambientación formal', 'Boletas de preventa numeradas', 'Programa musical sacro en vivo'],
    executionSteps: [
      '1. Conformar comisión de cocina, protocolo, finanzas y programa espiritual.',
      '2. Establecer un precio por boleta familiar o individual accesible para la hermandad.',
      '3. Vender el 100% de los boletos en preventa para comprar solo los insumos exactos sin desperdicios.',
      '4. Ofrecer una experiencia elegante el domingo al mediodía con música en vivo de cuartetos de la iglesia.',
      '5. Rendir cuentas transparentes a la junta de iglesia y directiva el mismo día.'
    ],
    adventistPrinciplesNote: 'Promueve el mensaje pro-salud de la iglesia (temperancia y alimentación basada en plantas) sin rifas de azar ni cobros desmedidos.',
    budgetSample: [
      { item: 'Insumos de cocina (para 100 platos)', cost: 600000, expectedReturn: 2000000 },
      { item: 'Decoración y menaje', cost: 150000, expectedReturn: 0 },
      { item: 'Ganancia neta para fondo juvenil', cost: 0, expectedReturn: 1250000 }
    ]
  },
  {
    id: 'fund_2',
    title: 'Lavado de Autos Misionero "Limpio por Fuera y por Dentro"',
    category: 'servicios',
    estimatedEarnings: '$800.000 - $1.600.000 COP',
    timeline: '1 semana de preparación (Se realiza un domingo)',
    objective: 'Recaudar fondos para uniformes de Guías Mayores, Conquistadores y pañuelos JA.',
    materialsNeeded: ['Mangueras e hidrolavadora prestada', 'Shampoo biodegradable para autos', 'Esponjas, microfibras y cubetas', 'Tarjeta con mensaje bíblico y dulce para colocar en el retrovisor'],
    executionSteps: [
      '1. Solicitar permiso para usar el parqueadero de la iglesia o de un miembro voluntario.',
      '2. Vender fichas de lavado anticipadas a los miembros de iglesia y vecinos del barrio.',
      '3. Organizar brigadas: aspirado, enjabonado, secado y detalle misionero.',
      '4. Mientras los clientes esperan, ofrecerles una sala con té aromático y revistas cristianas Prioridades.',
      '5. Finalizar con una oración de bendición por el vehículo y la familia del conductor.'
    ],
    adventistPrinciplesNote: 'Fomenta el trabajo en equipo, la laboriosidad y el servicio manual digno sin costo excesivo.',
    budgetSample: [
      { item: 'Jabón biodegradable y esponjas', cost: 90000, expectedReturn: 1000000 },
      { item: 'Tarjetas misioneras de obsequio', cost: 30000, expectedReturn: 0 },
      { item: 'Ganancia neta directa', cost: 0, expectedReturn: 880000 }
    ]
  },
  {
    id: 'fund_3',
    title: 'Taller de Emprendimiento y Estampados Cristianos JA',
    category: 'manualidades_estampados',
    estimatedEarnings: '$1.200.000 - $2.500.000 COP',
    timeline: '2 semanas',
    objective: 'Crear camisetas con lemas de fe para campamentos, pañuelos y bolsas ecológicas misioneras.',
    materialsNeeded: ['Camisetas de algodón en blanco compradas al por mayor', 'Diseños vectoriales de esperanza', 'Técnica de serigrafía o estampado textil térmico', 'Catálogo digital en WhatsApp'],
    executionSteps: [
      '1. Diseñar 3 modelos con versículos impactantes (ej: "A Prueba de Fuego", "Misión Caleb Pacífico", "1 Timoteo 4:12").',
      '2. Tomar pedidos bajo encargo de las iglesias del distrito.',
      '3. Los jóvenes aprenden el oficio de estampación textil, desarrollando una habilidad técnica para la vida.',
      '4. Entregar los pedidos con empaque ecológico y dedicatoria personalizada.'
    ],
    adventistPrinciplesNote: 'Enseña educación técnica vocacional recomendada por Elena G. de White en el libro La Educación.',
    budgetSample: [
      { item: 'Camisetas al por mayor (50 unds)', cost: 750000, expectedReturn: 1750000 },
      { item: 'Insumos de estampación', cost: 200000, expectedReturn: 0 },
      { item: 'Ganancia neta para proyectos misioneros', cost: 0, expectedReturn: 800000 }
    ]
  }
];

// ============================================================================
// 4. PLANES DE TRABAJO DIDÁCTICOS PARA DIRECTIVAS JA
// ============================================================================
export const WORK_PLAN_TEMPLATES: WorkPlanTemplate[] = [
  {
    id: 'plan_anual_2026',
    title: 'Plan Anual de Sociedad de Jóvenes JA 2026: "Inquebrantables"',
    year: 2026,
    scope: 'Anual JA',
    motto: '"El amor de Cristo nos motiva" — 2 Corintios 5:14',
    bibleVerse: '1 Timoteo 4:12 — "Ninguno tenga en poco tu juventud..."',
    spiritualGoals: [
      'Lograr que el 85% de los jóvenes mantengan su devoción personal matutina.',
      'Formar 2 Grupos Pequeños juveniles de discipulado.',
      'Involucrar a cada joven en al menos un ministerio activo de la iglesia.'
    ],
    missionaryGoals: [
      'Bautizar a 10 jóvenes para el reino de Dios a través de Misión Caleb y Semanas de Oración.',
      'Realizar 4 impactos comunitarios en barrios necesitados de Buenaventura y sus distritos.',
      'Distribuir 500 libros misioneros de esperanza.'
    ],
    monthlySchedule: [
      { month: 'Enero', mainEvent: 'Misión Caleb de Vacaciones', weeklyFocus: ['Consagración', 'Limpieza comunitaria', 'Campaña evangelística', 'Bautismos'] },
      { month: 'Febrero', mainEvent: 'Inicio de Grupos Pequeños JA', weeklyFocus: ['Liderazgo', 'Integración', 'Estudio de Romanos', 'Social juvenil'] },
      { month: 'Marzo', mainEvent: 'Día Mundial de la Juventud (Global Youth Day)', weeklyFocus: ['Ser el Sermón', 'Donación de sangre', 'Visita a asilos', 'Celebración'] },
      { month: 'Abril', mainEvent: 'Semana Santa de Esperanza', weeklyFocus: ['La Cruz', 'El Sacrificio', 'La Resurrección', 'Llamados de fe'] },
      { month: 'Mayo', mainEvent: 'Homenaje a la Familia y Madres', weeklyFocus: ['Honra', 'Hogar cristiano', 'Sanidad familiar', 'Cena especial'] },
      { month: 'Junio', mainEvent: 'Vigilia Zonal de Oración del Pacífico', weeklyFocus: ['Espíritu Santo', 'Clamor nocturno', 'Testimonios', 'Renovación'] },
      { month: 'Julio', mainEvent: 'Campamento de Liderazgo y Supervivencia', weeklyFocus: ['Pioneros', 'Nudos y amarres', 'Primeros auxilios', 'Pacto con Dios'] },
      { month: 'Agosto', mainEvent: 'Feria de Salud y Temperancia Comunitaria', weeklyFocus: ['8 Remedios naturales', 'Cocina saludable', 'Chequeos médicos', 'Testimonio'] },
      { month: 'Septiembre', mainEvent: 'Mes de la Juventud y Semana de Oración JA', weeklyFocus: ['Pureza', 'Noviazgo cristiano', 'Identidad adventista', 'Decisión'] },
      { month: 'Octubre', mainEvent: 'Festival de Música y Talentos Sacros', weeklyFocus: ['Alabanza', 'Uso de dones', 'Concierto distrital', 'Gratitud'] },
      { month: 'Noviembre', mainEvent: 'Camporee Nacional de Conquistadores y JA', weeklyFocus: ['Marcha', 'Investidura', 'Hermandad nacional', 'Fuego de campamento'] },
      { month: 'Diciembre', mainEvent: 'Cena de Acción de Gracias y Evaluación', weeklyFocus: ['Gratitud', 'Logros alcanzados', 'Entrega a nuevos líderes', 'Cierre de año'] }
    ],
    leadershipRoles: [
      { role: 'Director(a) JA', responsibility: 'Coordina la directiva, lidera la visión general y vela por la vida espiritual de cada joven.' },
      { role: 'Secretario(a)', responsibility: 'Lleva el registro de asistencia, actas, estadísticas y comunicación digital en la app.' },
      { role: 'Tesorero(a)', responsibility: 'Administra los fondos con honradez y transparencia, presentando informes periódicos.' },
      { role: 'Director(a) de Música', responsibility: 'Planifica las alabanzas reverentes de cada sábado y promueve coros e instrumentos.' },
      { role: 'Capellán', responsibility: 'Atiende pastoralmente a los jóvenes en crisis, coordina vigilias y momentos de intercesión.' },
      { role: 'Director(a) de Acción Social', responsibility: 'Planifica visitas comunitarias, brigadas de salud y donaciones solidarias.' }
    ]
  }
];

// ============================================================================
// 5. PORTAL DE MATERIALES JUVENILES OFICIALES Y CÓMO ACCEDER A ELLOS
// ============================================================================
export const OFFICIAL_YOUTH_MATERIALS: YouthMaterial[] = [
  {
    id: 'mat_1',
    title: 'Manual del Ministerio Juvenil Adventista (Edición Oficial)',
    category: 'manuales_oficiales',
    authorOrEntity: 'División Interamericana (DIA)',
    format: 'PDF',
    size: '14.2 MB',
    description: 'La guía completa con los reglamentos, ideales (Blasón, Lema, Voto), estructura de directiva, directrices de uniformidad y ceremonias de investidura.',
    howToAccess: 'Disponible para lectura y descarga gratuita desde esta app. Para ejemplares físicos impresos, solicítalo en la librería IADPA de tu Asociación/Misión local.',
    downloadUrl: 'https://interamerica.org/resources/',
    isOfficial: true,
  },
  {
    id: 'mat_2',
    title: 'Himnario Adventista Oficial con Acordes de Guitarra y Piano',
    category: 'himnarios_musica',
    authorOrEntity: 'Asociación Publicadora Interamericana (IADPA)',
    format: 'PDF',
    size: '22.8 MB',
    description: 'Colección de los 613 himnos oficiales con cifrado armónico completo para grupos de alabanza, coros y directores de música en cultos y campamentos.',
    howToAccess: 'Accede a la partitura digital en PDF o búscalo en la aplicación oficial de Himnario Adventista en Google Play y App Store.',
    downloadUrl: 'https://www.adventistas.org/es/musica/',
    isOfficial: true,
  },
  {
    id: 'mat_3',
    title: 'Guía de Escuela Sabática Universitaria: inVerse 2026',
    category: 'escuela_sabatica',
    authorOrEntity: 'Conferencia General de los Adventistas del Séptimo Día',
    format: 'PDF',
    size: '6.5 MB',
    description: 'El folleto trimestral de estudio bíblico diseñado para jóvenes y universitarios, con análisis teológico profundo, preguntas contemporáneas y aplicación práctica.',
    howToAccess: 'Puedes estudiarlo semanalmente en la app o ingresar a https://inversedv.org para acceder a audios, podcasts y videos de debate.',
    downloadUrl: 'https://inversetv.org',
    isOfficial: true,
  },
  {
    id: 'mat_4',
    title: 'Kit Gráfico Oficial JA: Logos en Alta Definición y Manual de Marca',
    category: 'logos_graficos',
    authorOrEntity: 'Ministerio Joven DIA',
    format: 'ZIP/PNG',
    size: '48.0 MB',
    description: 'Logotipos vectoriales del Ministerio Joven (JA), Conquistadores, Aventureros y Medallones en formatos PNG transparente, SVG y plantillas editables para camisetas y afiches.',
    howToAccess: 'Descarga el paquete comprimido directamente a tu celular o computadora para usarlo en tus diseños distritales.',
    downloadUrl: 'https://interamerica.org/ministerio-juvenil/recursos/',
    isOfficial: true,
  },
  {
    id: 'mat_5',
    title: 'Serie de Estudios Bíblicos "Fe Real para Tiempos Reales"',
    category: 'guias_estudio',
    authorOrEntity: 'Ministerio de Jóvenes Unión Colombiana',
    format: 'PDF',
    size: '8.4 MB',
    description: '12 lecciones dinámicas para discipular a nuevos conversos y amigos: Desde la Creación, el Sábado y la Ley, hasta el Santuario, el Estado de los Muertos y la Segunda Venida.',
    howToAccess: 'Descarga en PDF imprimible para fotocopiar o compartir por WhatsApp con tus estudiantes de la Biblia.',
    downloadUrl: 'https://unioncolombiana.org.co/recursos',
    isOfficial: true,
  }
];

// ============================================================================
// 6. IGLESIAS DE BUENAVENTURA (VALLE DEL CAUCA, COLOMBIA) Y SUS PROYECTOS ACTIVOS
// ============================================================================
export interface BuenaventuraChurchProject {
  churchName: string;
  district: string;
  address: string;
  phone: string;
  pastor: string;
  youthLeader: string;
  youthMembers: number;
  activeProjects: string[];
  schedule: string;
  impactZone: string;
  coordinates?: { lat: number; lng: number };
}

export const BUENAVENTURA_CHURCHES: BuenaventuraChurchProject[] = [
  {
    churchName: 'Iglesia Adventista Central de Buenaventura',
    district: 'Distrito Central Buenaventura',
    address: 'Calle 1ª # 4-22, Centro Histórico',
    phone: '+57 (315) 840-2190',
    pastor: 'Pr. Carlos Andrés Riascos',
    youthLeader: 'Yeison Valencia',
    youthMembers: 125,
    activeProjects: [
      'Brigada médica y de salud mental en la Casa de la Cultura',
      'Coro Juvenil Polifónico "Voces de la Bahía"',
      'Campamento distrital en San Cipriano (Noviembre 2026)',
      'Escuela de música sacra para niños de bajamar'
    ],
    schedule: 'Sábado: Escuela Sabática 08:30 AM · Culto 10:30 AM · Sociedad JA 04:00 PM',
    impactZone: 'Zona Céntrica, Malecón Bahía de la Cruz y Muelle Turístico',
  },
  {
    churchName: 'Iglesia Adventista Cascajal',
    district: 'Distrito Cascajal',
    address: 'Isla Cascajal, Barrio El Carmen',
    phone: '+57 (318) 732-1144',
    pastor: 'Pr. Hermógenes Mosquera',
    youthLeader: 'Lina María Caicedo',
    youthMembers: 84,
    activeProjects: [
      'Comedor solidario "Pan de Vida" para niños del sector pesquero',
      'Club de Conquistadores "Centinelas del Pacífico"',
      'Limpieza de playas y costas en La Bocana y Piangüita',
      'Campaña de temperancia contra adicciones en jóvenes'
    ],
    schedule: 'Sábado: 09:00 AM y 03:30 PM (Sociedad JA)',
    impactZone: 'Isla Cascajal y comunidad pesquera',
  },
  {
    churchName: 'Iglesia Adventista Bellavista',
    district: 'Distrito Comuna 8',
    address: 'Carrera 45 # 6-18, Barrio Bellavista',
    phone: '+57 (312) 654-9812',
    pastor: 'Pr. Wilson Palacios',
    youthLeader: 'Brayan Estacio',
    youthMembers: 96,
    activeProjects: [
      'Misión Caleb Comuna 8: Pintura de la escuela comunitaria',
      'Grupo pequeño universitario de la Universidad del Pacífico',
      'Vigilia mensual de oración intercesora por la paz de la ciudad'
    ],
    schedule: 'Sábado: 08:45 AM y 04:00 PM',
    impactZone: 'Comuna 8, Bellavista y sectores aledaños',
  },
  {
    churchName: 'Iglesia Adventista Juan XXIII',
    district: 'Distrito Comuna 7',
    address: 'Calle 10 con Carrera 52, Barrio Juan XXIII',
    phone: '+57 (316) 431-7788',
    pastor: 'Pr. Alexander Mina',
    youthLeader: 'Cindy Hurtado',
    youthMembers: 72,
    activeProjects: [
      'Refuerzo escolar gratuito en matemáticas y lectura bíblica',
      'Banda Marcial de Conquistadores y Aventureros',
      'Evangelismo juvenil en canchas barriales'
    ],
    schedule: 'Sábado: 09:00 AM y 04:00 PM',
    impactZone: 'Barrio Juan XXIII y Comuna 7',
  },
  {
    churchName: 'Iglesia Adventista Gamboa',
    district: 'Distrito Gamboa - Vía Alterna Interna',
    address: 'Avenida Simón Bolívar # 78-15',
    phone: '+57 (311) 902-3341',
    pastor: 'Pr. José Luis Murillo',
    youthLeader: 'Jhonatan Cuero',
    youthMembers: 65,
    activeProjects: [
      'Huerto comunitario ecológico "Edén del Pacífico"',
      'Taller de manualidades y costura para madres jóvenes',
      'Club de Guías Mayores "Orión"'
    ],
    schedule: 'Sábado: 08:30 AM y 03:30 PM',
    impactZone: 'Corredor vial Gamboa y Vía Alterna',
  },
  {
    churchName: 'Iglesia Adventista San Antonio',
    district: 'Distrito San Antonio',
    address: 'Calle 5ª # 62-30, Barrio San Antonio',
    phone: '+57 (314) 555-8901',
    pastor: 'Pr. Daniel Angulo',
    youthLeader: 'Maritza Obando',
    youthMembers: 58,
    activeProjects: [
      'Visitas semanales con canastas de alimentos a familias de escasos recursos',
      'Círculo de oración para jóvenes con depresión y ansiedad'
    ],
    schedule: 'Sábado: 09:00 AM y 04:00 PM',
    impactZone: 'Barrio San Antonio y zonas de bajamar',
  }
];

// ============================================================================
// 7. MOTOR DE RETOS DIARIOS (1 RETO DIFERENTE CADA DÍA DE LA SEMANA)
// ============================================================================
export const DAILY_CHALLENGES_SCHEDULE: DailyChallengeSchedule[] = [
  {
    dayOfWeek: 0, // Domingo
    dayName: 'Domingo',
    title: 'Misión Familiar & Gratitud al Creador',
    theme: 'Familia & Servicio en el Hogar',
    verseRef: 'Josué 24:15',
    verseText: '"Pero yo y mi casa serviremos a Jehová."',
    description: 'Dedica 1 hora a realizar una labor especial de servicio en tu casa (cocinar para tu familia, ordenar o limpiar un área compartida) y lidera un devocional familiar de 10 minutos orando por la semana que inicia.',
    points: 120,
    difficulty: 'Fácil',
    evidenceType: 'Foto del devocional familiar o de la comida preparada con una breve reflexión.',
    icon: '🏠',
  },
  {
    dayOfWeek: 1, // Lunes
    dayName: 'Lunes',
    title: 'Impulso Misionero Digital: Versículo de Esperanza',
    theme: 'Evangelismo en Redes y Amistades',
    verseRef: 'Marcos 16:15',
    verseText: '"Id por todo el mundo y predicad el evangelio a toda criatura."',
    description: 'Diseña o comparte una imagen con un versículo bíblico y una palabra de ánimo sincera en tu estado de WhatsApp o red social, y escríbele un mensaje privado a una persona que esté pasando por pruebas.',
    points: 100,
    difficulty: 'Fácil',
    evidenceType: 'Captura de pantalla de la publicación y del mensaje de bendición enviado.',
    icon: '📱',
  },
  {
    dayOfWeek: 2, // Martes
    dayName: 'Martes',
    title: 'Cadena de Oración e Intercesión por los Enfermos',
    theme: 'Poder de la Oración Sanadora',
    verseRef: 'Santiago 5:16',
    verseText: '"Confesaos vuestras ofensas unos a otros, y orad unos por otros, para que seáis sanados."',
    description: 'Comunícate con al menos 2 personas enfermas o afligidas de tu congregación o vecindario (en Buenaventura o tu ciudad) y haz una videollamada o visita corta de oración pidiendo sanidad divina.',
    points: 150,
    difficulty: 'Medio',
    evidenceType: 'Nombre de las dos personas (resguardando privacidad) y versículo bíblico leído con ellas.',
    icon: '🙏',
  },
  {
    dayOfWeek: 3, // Miércoles
    dayName: 'Miércoles',
    title: 'Culto de Oración & Testimonio en Vivo',
    theme: 'Comunión de Mitad de Semana',
    verseRef: 'Salmos 122:1',
    verseText: '"Yo me alegré con los que me decían: A la casa de Jehová iremos."',
    description: 'Asiste presencialmente o conéctate al culto de oración de miércoles en tu templo adventista local, y comparte un testimonio de cómo Dios ha cuidado de ti en estos días.',
    points: 130,
    difficulty: 'Medio',
    evidenceType: 'Foto en el templo o captura del culto de oración con el resumen de tu testimonio.',
    icon: '⛪',
  },
  {
    dayOfWeek: 4, // Jueves
    dayName: 'Jueves',
    title: 'Acción Solidaria "Mano Amiga"',
    theme: 'Amor en Acción & Filantropía',
    verseRef: 'Mateo 25:40',
    verseText: '"En cuanto lo hicisteis a uno de estos mis hermanos más pequeños, a mí lo hicisteis."',
    description: 'Obsequia un alimento, fruta o refrigerio a un trabajador humilde de la calle (vendedor ambulante, barrendero o reciclador) y dile: "Jesús te ama y nunca te desampara".',
    points: 160,
    difficulty: 'Medio',
    evidenceType: 'Foto de la comida o del momento de entrega con relato de la reacción.',
    icon: '🎁',
  },
  {
    dayOfWeek: 5, // Viernes
    dayName: 'Viernes',
    title: 'Preparación para el Santo Sábado & Recepción',
    theme: 'Santificación del Sábado',
    verseRef: 'Isaías 58:13-14',
    verseText: '"Si retrajeres del día de reposo tu pie... y lo llamares delicia, santo, glorioso de Jehová..."',
    description: 'Deja todas tus tareas seculares listas antes de la puesta de sol, prepara tu ropa de culto, apaga las pantallas distractoras y reúne a tu familia o amigos para cantar himnos y recibir el sábado.',
    points: 180,
    difficulty: 'Difícil',
    evidenceType: 'Foto de la mesa de recepción de sábado con la puesta de sol o cantando himnos.',
    icon: '🕯️',
  },
  {
    dayOfWeek: 6, // Sábado
    dayName: 'Sábado',
    title: 'Día del Señor: Participación Activa en Sociedad JA',
    theme: 'Adoración, Comunión y Servicio JA',
    verseRef: 'Hechos 20:7',
    verseText: '"El primer día de la semana... estábamos reunidos para partir el pan."',
    description: 'Participa activamente en el programa de Sociedad de Jóvenes de tu iglesia este sábado en la tarde (leyendo la Biblia, cantando, en una dramatización o invitando a un amigo no adventista).',
    points: 200,
    difficulty: 'Épico',
    evidenceType: 'Foto participando en el podio o en el salón de jóvenes con tu distintivo JA.',
    icon: '🔥',
  }
];
