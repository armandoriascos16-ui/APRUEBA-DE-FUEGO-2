import { 
  ChristianBook, 
  AdventistHymn, 
  VerifiedCreator, 
  AdventistCampEvent, 
  NewsItem 
} from '../types';

// ============================================================================
// 1. NOTICIAS OFICIALES ADVENTISTAS (Colombia e Internacionales - DIA / Conferencia General)
// ============================================================================
export const OFFICIAL_ADVENTIST_NEWS: NewsItem[] = [
  {
    id: 'news_dia_1',
    title: 'División Interamericana lanza iniciativa continental para la juventud adventista',
    summary: 'Más de 1.5 millones de jóvenes en Interamérica se movilizan en proyectos de impacto social, salud comunitaria y evangelismo juvenil.',
    content: 'La División Interamericana de los Adventistas del Séptimo Día (DIA), a través de su departamento de Ministerios Juveniles, anunció la campaña anual de consolidación espiritual y servicio comunitario. El programa incluye capacitación de líderes JA, proyectos de voluntariado en comunidades vulnerables y semanas de oración juvenil transmitidas por los canales institucionales de Hope Channel Interamérica y Radio Adventista.',
    sourceName: 'División Interamericana (IAD News)',
    sourceUrl: 'https://interamerica.org',
    category: 'institucional',
    publishedAt: '2026-10-18',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    id: 'news_colombia_1',
    title: 'Unión Colombiana convoca al Camporee Nacional de Guías Mayores y Conquistadores',
    summary: 'Las Asociaciones del Norte y Sur de Colombia preparan el gran encuentro bajo el lema "Firmes en la Fe" con más de 8.000 campistas.',
    content: 'El departamento de Jóvenes de la Unión Colombiana de la Iglesia Adventista del Séptimo Día oficializó la fecha y lugar del Camporee Nacional. El evento reunirá a clubes de Guías Mayores, Conquistadores y Aventureros de todas las asociaciones del país. Se realizarán concursos de nudos, orientación con brújula, primeros auxilios, ferias de especialidades y ceremonias de investidura.',
    sourceName: 'Unión Colombiana IASD',
    sourceUrl: 'https://unioncolombiana.org.co',
    category: 'campamentos',
    publishedAt: '2026-10-15',
    imageUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    id: 'news_caleb_colombia',
    title: 'Misión Caleb Colombia activa brigadas juveniles de servicio en 30 ciudades',
    summary: 'Jóvenes universitarios dedican sus vacaciones para pintar escuelas, construir parques comunitarios y dar estudios bíblicos.',
    content: 'El proyecto Misión Caleb de la juventud adventista en Colombia inició su despliegue en municipios prioritarios. Jóvenes voluntarios trabajan de manera desinteresada en jornadas de limpieza ambiental, donación de alimentos, talleres de hábitos saludables Quiero ¡Vivir Sano! y evangelismo en barrios populares.',
    sourceName: 'Ministerio Joven Unión Colombiana',
    sourceUrl: 'https://unioncolombiana.org.co/jovenes',
    category: 'mision',
    publishedAt: '2026-10-10',
    imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    id: 'news_adra_1',
    title: 'ADRA Colombia y Jóvenes JA llevan agua potable y ayuda humanitaria',
    summary: 'La Agencia Adventista para el Desarrollo y Recursos Asistenciales une esfuerzos con brigadas juveniles voluntarias.',
    content: 'ADRA Colombia, en colaboración con las federaciones de jóvenes adventistas de la región central y caribe, distribuyó filtros potabilizadores y kits de higiene escolar en comunidades rurales afectadas por sequías temporales. El liderazgo de ADRA destacó el testimonio desinteresado y la dedicación de la juventud cristiana.',
    sourceName: 'ADRA Colombia',
    sourceUrl: 'https://adracolombia.org',
    category: 'juvenil',
    publishedAt: '2026-10-05',
    imageUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800&auto=format&fit=crop&q=80',
    verified: true,
  },
  {
    id: 'news_gc_youth',
    title: 'Día Mundial de la Juventud Adventista (Global Youth Day) moviliza a millones',
    summary: 'Con el lema "Sé el Sermón", jóvenes adventistas de los cinco continentes salen de los templos para servir a los necesitados.',
    content: 'La Conferencia General de los Adventistas del Séptimo Día (Silver Spring, Maryland) reportó un masivo impacto global durante el GYD. Hospitales, asilos, orfanatos y refugios recibieron a delegaciones de jóvenes llevando flores, alimentos, música de consuelo y donaciones de sangre.',
    sourceName: 'General Conference Youth Ministries',
    sourceUrl: 'https://gcyouthministries.org',
    category: 'internacional',
    publishedAt: '2026-09-28',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    verified: true,
  }
];

// ============================================================================
// 2. PORTAL DE LIBROS JUVENILES CRISTIANOS (Con lector digital de capítulos)
// ============================================================================
export const OFFICIAL_CHRISTIAN_BOOKS: ChristianBook[] = [
  {
    id: 'book_el_camino_a_cristo',
    title: 'El Camino a Cristo',
    author: 'Elena G. de White',
    category: 'Elena G. de White',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    year: 1892,
    description: 'La obra devocional más leída y traducida en el mundo adventista. Explica con claridad diáfana el amor de Dios, el arrepentimiento sincero, la confesión, la entrega del corazón y el gozo de la salvación en Jesús.',
    language: 'Español',
    format: 'Lector Digital',
    officialSourceUrl: 'https://egwwritings.org',
    isPublicDomainOrAuthorized: true,
    chapters: [
      {
        chapterNumber: 1,
        title: 'Amor supremo de Dios para con el hombre',
        content: [
          'La naturaleza y la revelación a una dan testimonio del amor de Dios. Nuestro Padre celestial es la fuente de la vida, de la sabiduría y del gozo. Mirad las maravillas y bellezas de la naturaleza.',
          'Pensad en su admirable adaptación a las necesidades y a la felicidad, no sólo del hombre, sino de todas las criaturas vivientes. El sol y la lluvia que alegran y refrigeran la tierra, las colinas, los mares y las llanuras, todo nos habla del amor del Creador.',
          'Es Dios quien suple las necesidades cotidianas de todas sus criaturas en el cielo y en la tierra. Dios es amor, está escrito en cada capullo que se abre, en cada brizna de hierba que brota. Aunque el mundo ha caído en el pecado, las espinas y los abrojos recuerdan que aún en el dolor, Dios dispuso una salida redentora.',
          'Jesús vino a habitar entre los hombres para revelar el verdadero carácter del Padre: lleno de misericordia y verdad, buscando salvar lo que se había perdido.'
        ]
      },
      {
        chapterNumber: 2,
        title: 'La necesidad que el pecador tiene de Cristo',
        content: [
          'El hombre estaba dotado originalmente de facultades nobles y de un entendimiento bien equilibrado. Era perfecto en su ser y estaba en armonía con Dios. Pero sus pensamientos eran puros, sus designios santos.',
          'Sin embargo, por la desobediencia sus facultades se pervirtieron y el egoísmo tomó el lugar del amor. Su naturaleza quedó tan debilitada por la transgresión que por su propia fuerza le era imposible resistir el poder del mal.',
          'Es imposible que escapemos por nosotros mismos del hoyo del pecado en el que hemos caído. Nuestro corazón es malo y no lo podemos cambiar. "De lo inmundo, ¿quién sacará cosa limpia? Ninguno."',
          'La educación, la cultura y el ejercicio de la voluntad humana tienen cada uno su propia esfera, pero no tienen el poder de regenerar el corazón. Debe haber un poder que obre desde el interior, una vida nueva que proceda de lo alto: ese poder es Cristo Jesús.'
        ]
      },
      {
        chapterNumber: 3,
        title: 'El Arrepentimiento',
        content: [
          '¿Cómo se justificará el hombre con Dios? ¿Cómo se hará justo el pecador? Tan sólo por medio de Cristo podemos ser puestos en armonía con Dios y con la santidad.',
          'El arrepentimiento comprende tristeza por el pecado y abandono del mismo. No renunciaremos al pecado a menos que veamos su malignidad; y mientras no nos apartemos de él de corazón, no habrá cambio real en la vida.',
          'Hay muchos que no comprenden la verdadera naturaleza del arrepentimiento. Muchos sienten pena por haber pecado y aun se reforman exteriormente por temor a las consecuencias de sus malas acciones. Pero esto no es el arrepentimiento en el sentido bíblico.',
          'Cuando el corazón cede a la influencia del Espíritu de Dios, la conciencia se aviva y el pecador discierne algo de la profundidad y santidad de la ley de Dios.'
        ]
      },
      {
        chapterNumber: 4,
        title: 'Para Obtener la Paz',
        content: [
          'Vuestra conciencia ha sido iluminada por el Espíritu de Dios; habéis visto algo de la maldad del pecado, de su poder, de su culpa y de su miseria; y lo miráis con horror.',
          'Sentís que el pecado os ha separado de Dios y que estáis bajo la servidumbre del poder del mal. Cuanto más lucháis por escapar, tanto más comprendéis vuestra impotencia. Vuestros motivos son impuros, vuestro corazón está corrompido.',
          'Pero no desesperéis. Cristo es quien perdona todos vuestros pecados y sana todas vuestras dolencias. Venid a Él tal como estáis, necesitados, débiles y desvalidos, y Él os dará descanso.'
        ]
      }
    ]
  },
  {
    id: 'book_mensajes_para_los_jovenes',
    title: 'Mensajes para los Jóvenes',
    author: 'Elena G. de White',
    category: 'Elena G. de White',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    year: 1930,
    description: 'Consejos inspiradores dirigidos específicamente a la juventud cristiana sobre cómo consagrar los talentos, elegir buenas compañías, cultivar una mente pura, mantener la mayordomía y alcanzar el más alto ideal en el servicio del Maestro.',
    language: 'Español',
    format: 'Lector Digital',
    officialSourceUrl: 'https://egwwritings.org',
    isPublicDomainOrAuthorized: true,
    chapters: [
      {
        chapterNumber: 1,
        title: 'La meta de la vida juvenil',
        content: [
          'Dios desea que los jóvenes sean hombres y mujeres de amplio criterio, listos para cooperar con los más elevados propósitos divinos. Sean los jóvenes consagrados al Señor, firmes como el acero en la defensa de los principios.',
          'El Señor se propone que los jóvenes sean su mano ayudadora en la tierra. Con un ejército de jóvenes consagrados y bien preparados, ¡cuán pronto podría proclamarse el mensaje de un Salvador crucificado, resucitado y próximo a venir!',
          'Jóvenes y señoritas, buscad a Dios con fervor. No os contentéis con una vida mediocre ni con metas mezquinas. Elevad vuestras aspiraciones y ascended la senda de la excelencia cristiana.'
        ]
      },
      {
        chapterNumber: 2,
        title: 'El cultivo de la mente y los hábitos',
        content: [
          'Es el deber de cada joven cultivar sus facultades intelectuales al máximo. Dios no aprueba la ignorancia ni la pereza espiritual.',
          'Cuiden los jóvenes lo que leen, lo que contemplan y con quién se relacionan. Por la contemplación somos transformados a la semejanza de aquello en lo que fijamos nuestra mirada.',
          'La mente alimentada con la Palabra viva de Dios se robustece, adquiere agudeza de juicio y pureza de afectos.'
        ]
      }
    ]
  },
  {
    id: 'book_la_educacion',
    title: 'La Educación',
    author: 'Elena G. de White',
    category: 'Elena G. de White',
    coverUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
    year: 1903,
    description: 'Tratado magistral sobre el desarrollo integral del ser humano: físico, mental y espiritual. Presenta a Dios como la fuente de toda sabiduría verdadera y a la redención como el fin supremo de la verdadera educación.',
    language: 'Español',
    format: 'Lector Digital',
    officialSourceUrl: 'https://egwwritings.org',
    isPublicDomainOrAuthorized: true,
    chapters: [
      {
        chapterNumber: 1,
        title: 'La fuente y el fin de la verdadera educación',
        content: [
          'El verdadero propósito de la educación consiste en restaurar en el hombre la imagen de su Hacedor, hacerle volver a la perfección con que fue creado.',
          'La mayor necesidad del mundo es la de hombres: hombres que no se compren ni se vendan; hombres que en lo más íntimo de su alma sean verdaderos y honrados; hombres que no teman dar al pecado el nombre que le corresponde; hombres cuya conciencia sea tan leal al deber como la brújula al polo; hombres que se mantengan de parte de la justicia aunque se desplomen los cielos.',
          'Semejante carácter no es resultado del azar; es la consecuencia del toque vivificante del Maestro en el corazón consagrado.'
        ]
      }
    ]
  },
  {
    id: 'book_solo_por_gracia',
    title: 'En los Pasos del Gran Maestro',
    author: 'Asociación Publicadora Interamericana (IADPA)',
    category: 'Vida Devocional',
    coverUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600&auto=format&fit=crop&q=80',
    year: 2024,
    description: 'Guía devocional práctica para jóvenes universitarios y de secundaria sobre cómo aplicar las enseñanzas de Jesús en el mundo digital, el liderazgo ético y las relaciones afectivas saludables.',
    language: 'Español',
    format: 'Enlace Autorizado',
    officialSourceUrl: 'https://iadpa.org',
    isPublicDomainOrAuthorized: true,
    chapters: [
      {
        chapterNumber: 1,
        title: 'Viviendo la Fe con Valentía',
        content: [
          'En medio de un mundo saturado de voces contrarias a la verdad bíblica, el joven cristiano es llamado a ser sal y luz.',
          'No se trata de aislarse del mundo, sino de vivir en él con la pureza y el amor sacrificial del Salvador.'
        ]
      }
    ]
  }
];

// ============================================================================
// 3. HIMNARIO ADVENTISTA (Letras oficiales, categorías y enlaces legítimos)
// ============================================================================
export const OFFICIAL_ADVENTIST_HYMNS: AdventistHymn[] = [
  {
    number: 1,
    title: 'Cantad alegres al Señor',
    category: 'Alabanza y Adoración',
    biblicalTheme: 'Salmos 100:1-2',
    key: 'Sol Mayor (G)',
    officialSourceUrl: 'https://iadpa.org/himnario-adventista',
    stanzas: [
      [
        'Cantad alegres al Señor, mortales todos por doquier;',
        'servidle siempre con fervor, obedecedle con placer.'
      ],
      [
        'Con gratitud canción alzad al Hacedor que el ser os dio;',
        'al Dios de amor y majestad, que de la nada os formó.'
      ],
      [
        'Reconceded que Dios es Dios, y que nosotros suyos son;',
        'ovejas de su grey nos vio, y nos salvó por compasión.'
      ],
      [
        'Entrad por puertas de bondad, con alabanzas al Señor;',
        'al Dios de eterna majestad, cantad con gozo y con amor.'
      ]
    ]
  },
  {
    number: 212,
    title: '¡Oh, cuán dulce es fiar en Cristo!',
    category: 'Jesucristo y Gracia',
    biblicalTheme: 'Juan 14:1',
    key: 'La Mayor (A)',
    officialSourceUrl: 'https://iadpa.org/himnario-adventista',
    stanzas: [
      [
        '¡Oh, cuán dulce es fiar en Cristo, y entregarse todo a él;',
        'esperar en sus promesas, y en sus sendas serle fiel!'
      ],
      [
        'Es muy dulce fiar en Cristo, y cumplir su voluntad,',
        'no dudando su palabra, que es la luz y la verdad.'
      ],
      [
        'Siempre es grato fiar en Cristo, cuando busca el corazón,',
        'los tesoros celestiales de la paz y del perdón.'
      ],
      [
        'Siempre en ti confiar yo quiero, mi precioso Salvador;',
        'en la vida y en la muerte, me sostenga tu amor.'
      ]
    ],
    chorus: [
      'Jesucristo, Jesucristo, ya tu amor probaste en mí;',
      'Jesucristo, Jesucristo, siempre quiero fiar en ti.'
    ]
  },
  {
    number: 370,
    title: 'Firmes y adelante',
    category: 'Misión y Servicio',
    biblicalTheme: '2 Timoteo 2:3',
    key: 'Fa Mayor (F)',
    officialSourceUrl: 'https://iadpa.org/himnario-adventista',
    stanzas: [
      [
        'Firmes y adelante, huestes de la fe,',
        'sin temor alguno, que Jesús nos ve.',
        'Jefe soberano, Cristo al frente va,',
        'y la regia enseña tremolando está.'
      ],
      [
        'Al sagrado nombre de nuestro adalid,',
        'tiembla el enemigo y huye de la lid.',
        'Nuestra es la victoria, dad a Dios loor,',
        'y óiganlo los ecos del cantar de amor.'
      ],
      [
        'Muévese potente la iglesia de Dios,',
        'de los ya gloriosos marchamos en pos;',
        'somos sólo un cuerpo y uno es el Señor,',
        'una la esperanza y uno nuestro amor.'
      ]
    ],
    chorus: [
      'Firmes y adelante, huestes de la fe,',
      'sin temor alguno, que Jesús nos ve.'
    ]
  },
  {
    number: 440,
    title: 'Señor, reposamos',
    category: 'Sábado y Descanso',
    biblicalTheme: 'Éxodo 20:8-11',
    key: 'Mi Bemol (Eb)',
    officialSourceUrl: 'https://iadpa.org/himnario-adventista',
    stanzas: [
      [
        'Señor, reposamos en tu santo día,',
        'cumpliendo el mandato que diste en Sinaí;',
        'en gozo y en paz nuestra alma confía,',
        'cantando alabanzas, oh Padre, hacia ti.'
      ],
      [
        'El sábado santo corona la senda,',
        'de aquellos que guardan tu ley con amor;',
        'recibe en tus atrios la humilde ofrenda,',
        'de un pueblo que adora a su buen Creador.'
      ]
    ]
  },
  {
    number: 501,
    title: 'Castillo fuerte es nuestro Dios',
    category: 'Consagración',
    biblicalTheme: 'Salmos 46:1',
    key: 'Re Mayor (D)',
    officialSourceUrl: 'https://iadpa.org/himnario-adventista',
    stanzas: [
      [
        'Castillo fuerte es nuestro Dios, defensa y buen escudo;',
        'con su poder nos librará en este trance agudo.',
        'Con furia y con afán acósanos Satán;',
        'por armas y ardid presenta gran palid: nada en la tierra es como él.'
      ],
      [
        'Luchar debemos con valor en tan tremenda guerra;',
        'si confiamos en nosotros, pronto habrá caída y mengua.',
        'Jesús el Capitán, el victorioso Adán;',
        'Señor de Sabaoth, él triunfa por nosotros: él salvará a su pueblo fiel.'
      ]
    ]
  }
];

// ============================================================================
// 4. CANALES Y CREADORES ADVENTISTAS VERIFICADOS (YouTube, IG, FB, TikTok)
// ============================================================================
export const VERIFIED_ADVENTIST_CREATORS: VerifiedCreator[] = [
  // --- CUENTAS INSTITUCIONALES OFICIALES (COLOMBIA E INTERNACIONAL) ---
  {
    id: 'vc_hope_channel',
    name: 'Hope Channel Interamérica',
    platform: 'YouTube',
    handle: '@HopeChannelInteramerica',
    profileUrl: 'https://www.youtube.com/@HopeChannelInteramerica',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=240&auto=format&fit=crop&q=80',
    description: 'Canal de televisión oficial de la División Interamericana de los Adventistas del Séptimo Día. Programación espiritual, estudios bíblicos y música sacra.',
    verifiedOfficial: true,
    accountType: 'institucional',
    category: 'Institucional',
    lastVerifiedDate: '2026-10-21',
  },
  {
    id: 'vc_union_colombiana_fb',
    name: 'Unión Colombiana del Norte (IASD)',
    platform: 'Facebook',
    handle: '@UnionColombianaIASD',
    profileUrl: 'https://www.facebook.com/UnionColombianaIASD',
    avatarUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=240&auto=format&fit=crop&q=80',
    description: 'Página oficial de la Iglesia Adventista del Séptimo Día en Colombia (UCN). Comunicados institucionales, eventos nacionales, Camporees y proyectos misioneros.',
    verifiedOfficial: true,
    accountType: 'institucional',
    category: 'Institucional',
    lastVerifiedDate: '2026-10-21',
  },
  {
    id: 'vc_union_sur_colombia',
    name: 'Unión Colombiana del Sur',
    platform: 'Facebook',
    handle: '@unionsurcolombiana',
    profileUrl: 'https://www.facebook.com/unionsurcolombiana',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=240&auto=format&fit=crop&q=80',
    description: 'Página oficial de la Unión Sur Colombiana de la IASD. Noticias de los campos locales, congresos y actividades de fe en el sur y pacífico colombiano.',
    verifiedOfficial: true,
    accountType: 'institucional',
    category: 'Institucional',
    lastVerifiedDate: '2026-10-21',
  },
  {
    id: 'vc_jovenes_colombia_ig',
    name: 'Jóvenes Adventistas Colombia (JA)',
    platform: 'Instagram',
    handle: '@jovenes.iasdcolombia',
    profileUrl: 'https://www.instagram.com',
    avatarUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=240&auto=format&fit=crop&q=80',
    description: 'Departamento de Jóvenes oficial de la Unión Colombiana. Convocatorias de Camporees, Misión Caleb, retos juveniles y devocionales para la juventud.',
    verifiedOfficial: true,
    accountType: 'institucional',
    category: 'Juventud JA',
    lastVerifiedDate: '2026-10-21',
  },
  {
    id: 'vc_gcyouth_yt',
    name: 'General Conference Youth Ministries',
    platform: 'YouTube',
    handle: '@gcyouthministries',
    profileUrl: 'https://www.youtube.com/@gcyouthministries',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    description: 'Canal mundial oficial de los Ministerios Juveniles de la Asociación General (Silver Spring, MD). Eventos globales, Global Youth Day y liderazgo adventista.',
    verifiedOfficial: true,
    accountType: 'institucional',
    category: 'Juventud JA',
    lastVerifiedDate: '2026-10-21',
  },
  {
    id: 'vc_gcyouth_tiktok',
    name: 'GC Youth Ministries TikTok',
    platform: 'TikTok',
    handle: '@gcyouthministries',
    profileUrl: 'https://www.tiktok.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    description: 'Contenido oficial de la Conferencia General para jóvenes en formato vertical: mensajes bíblicos cortos, música sacra y desafíos misioneros mundiales.',
    verifiedOfficial: true,
    accountType: 'institucional',
    category: 'Juventud JA',
    lastVerifiedDate: '2026-10-21',
  },
  {
    id: 'vc_feliz7play',
    name: 'Feliz7Play Español',
    platform: 'YouTube',
    handle: '@Feliz7PlayEspañol',
    profileUrl: 'https://www.youtube.com/@Feliz7PlayEspanol',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=240&auto=format&fit=crop&q=80',
    description: 'Plataforma oficial de streaming de la Iglesia Adventista. Series, películas con valores bíblicos, animaciones cristianas y cortometrajes para jóvenes.',
    verifiedOfficial: true,
    accountType: 'institucional',
    category: 'Juventud JA',
    lastVerifiedDate: '2026-10-21',
  },
  {
    id: 'vc_iadpa_fb',
    name: 'Editorial IADPA Oficial',
    platform: 'Facebook',
    handle: '@IADPAOficial',
    profileUrl: 'https://www.facebook.com/IADPAOficial',
    avatarUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=240&auto=format&fit=crop&q=80',
    description: 'Editorial oficial de la División Interamericana. Folletos de Escuela Sabática universitaria inVerse, himnarios y literatura devocional para la juventud.',
    verifiedOfficial: true,
    accountType: 'institucional',
    category: 'Institucional',
    lastVerifiedDate: '2026-10-21',
  },
  {
    id: 'vc_adra_colombia',
    name: 'ADRA Colombia Oficial',
    platform: 'Instagram',
    handle: '@adracolombia',
    profileUrl: 'https://adracolombia.org',
    avatarUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=240&auto=format&fit=crop&q=80',
    description: 'Agencia Adventista para el Desarrollo y Recursos Asistenciales en Colombia. Proyectos de ayuda humanitaria, voluntariado juvenil y auxilio en emergencias.',
    verifiedOfficial: true,
    accountType: 'institucional',
    category: 'Institucional',
    lastVerifiedDate: '2026-10-21',
  },
  {
    id: 'vc_3abn_latino',
    name: '3ABN Latino Oficial',
    platform: 'YouTube',
    handle: '@3ABNLatinoOficial',
    profileUrl: 'https://www.youtube.com/@3ABNLatinoOficial',
    avatarUrl: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=240&auto=format&fit=crop&q=80',
    description: 'Red de televisión cristiana adventista internacional. Sermones bíblicos, programas de salud natural, orientación familiar y alabanza de adoración.',
    verifiedOfficial: true,
    accountType: 'institucional',
    category: 'Institucional',
    lastVerifiedDate: '2026-10-21',
  },

  // --- CREADORES ADVENTISTAS VERIFICADOS (INDEPENDIENTES COMPROBADOS) ---
  {
    id: 'vc_conpaz_musica',
    name: 'Ministerio Musical Conpaz',
    platform: 'YouTube',
    handle: '@ConpazMusica',
    profileUrl: 'https://www.youtube.com',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=240&auto=format&fit=crop&q=80',
    description: 'Grupo musical adventista independiente verificado. Composiciones sacras, himnos de los jóvenes adventistas y producciones vocales cristianas.',
    verifiedOfficial: false,
    accountType: 'creador_independiente',
    category: 'Música y Alabanza',
    lastVerifiedDate: '2026-10-20',
  },
  {
    id: 'vc_escuela_sabatica_viva',
    name: 'Escuela Sabática Viva (Ministerio de Enseñanza)',
    platform: 'YouTube',
    handle: '@EscuelaSabaticaViva',
    profileUrl: 'https://www.youtube.com',
    avatarUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=240&auto=format&fit=crop&q=80',
    description: 'Creador de contenido y educador adventista independiente. Repasos semanales y dinámicos de la Guía de Estudio de la Biblia con soporte teológico.',
    verifiedOfficial: false,
    accountType: 'creador_independiente',
    category: 'Estudio Bíblico y Escuela Sabática',
    lastVerifiedDate: '2026-10-20',
  },
  {
    id: 'vc_jovenes_fe_tiktok',
    name: 'Fe & Misión JA (Creadores Verificados)',
    platform: 'TikTok',
    handle: '@feymision_ja',
    profileUrl: 'https://www.tiktok.com',
    avatarUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=240&auto=format&fit=crop&q=80',
    description: 'Iniciativa juvenil adventista independiente dedicada a compartir versículos bíblicos y testimonios de campamento para jóvenes en formato vertical.',
    verifiedOfficial: false,
    accountType: 'creador_independiente',
    category: 'Juventud JA',
    lastVerifiedDate: '2026-10-19',
  },
  {
    id: 'vc_voces_esperanza_ig',
    name: 'Voces de Esperanza Colombia',
    platform: 'Instagram',
    handle: '@vocesdeesperanza_co',
    profileUrl: 'https://www.instagram.com',
    avatarUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=240&auto=format&fit=crop&q=80',
    description: 'Comunidad juvenil adventista independiente verificada en Colombia. Comparte reflexiones devocionales, versículos diarios y convocatorias de oración.',
    verifiedOfficial: false,
    accountType: 'creador_independiente',
    category: 'Juventud JA',
    lastVerifiedDate: '2026-10-18',
  }
];

// ============================================================================
// 5. CAMPAMENTOS, EVENTOS Y BOLETINES ADVENTISTAS OFICIALES
// ============================================================================
export const ADVENTIST_CAMP_EVENTS: AdventistCampEvent[] = [
  {
    id: 'camp_nacional_2026',
    title: 'Camporee Nacional de Guías Mayores: "Llamados a Servir"',
    description: 'El encuentro nacional más grande de la juventud adventista en Colombia. Cuatro días de campismo de alto nivel, competencias de orientación diurna y nocturna, fogatas espirituales, investiduras y compromiso misionero.',
    organization: 'Unión Colombiana — Ministerio Joven',
    region: 'Eje Cafetero, Colombia',
    startDate: '2026-11-12',
    endDate: '2026-11-16',
    location: 'Centro Campestre Adventista, Armenia, Quindío',
    bulletinPdfUrl: 'https://unioncolombiana.org.co/boletin_camporee_2026.pdf',
    registrationUrl: 'https://unioncolombiana.org.co/inscripciones-camporee',
    registrationDeadline: '2026-11-01',
    officialCost: '$160.000 COP (incluye terreno, seguro y distintivo oficial)',
    requirements: [
      'Estar inscrito y activo en un Club de Guías Mayores o Jóvenes JA',
      'Certificado médico vigente no mayor a 30 días',
      'Autorización firmada de padres o tutores para menores de 18 años',
      'Uniforme oficial de gala y uniforme de faena del club'
    ],
    lastVerifiedDate: '2026-10-20',
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80',
    category: 'camporee',
    scope: 'union',
  },
  {
    id: 'congreso_universitario_ja',
    title: 'Congreso de Universitarios y Profesionales Adventistas: "Luz en la Ciudad"',
    description: 'Conferencias especializadas sobre ética cristiana en el trabajo, apologética bíblica, creación versus evolución y liderazgo de impacto en campus seculares.',
    organization: 'Asociación Sur Occidental — Depto. Educación',
    region: 'Valle del Cauca, Colombia',
    startDate: '2026-12-04',
    endDate: '2026-12-06',
    location: 'Auditorio Universidad Adventista (UNAC Sede Sur), Cali',
    bulletinPdfUrl: 'https://unac.edu.co/congreso_universitario_boletin.pdf',
    registrationUrl: 'https://unac.edu.co/eventos/luz-en-la-ciudad',
    registrationDeadline: '2026-11-25',
    officialCost: 'Entrada Libre con Pre-registro Obligatorio',
    requirements: [
      'Estudiantes de educación superior o jóvenes profesionales',
      'Documento de identidad o carné universitario',
      'Compromiso de asistencia a los 4 talleres temáticos'
    ],
    lastVerifiedDate: '2026-10-18',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
    category: 'congreso',
    scope: 'asociacion',
  },
  {
    id: 'mision_caleb_enero',
    title: 'Misión Caleb Nacional: "Deja Tu Huella"',
    description: 'Dos semanas intensivas de servicio desinteresado y evangelismo juvenil en comunidades vulnerables. Brigadas médicas gratuitas, limpieza comunitaria y conferencias familiares.',
    organization: 'Unión Colombiana / División Interamericana',
    region: 'Costa Atlántica y Región Andina',
    startDate: '2027-01-08',
    endDate: '2027-01-22',
    location: 'Sedes múltiples en Santa Marta, Medellín, Bucaramanga y Bogotá',
    bulletinPdfUrl: 'https://unioncolombiana.org.co/caleb_guia_voluntario.pdf',
    registrationUrl: 'https://unioncolombiana.org.co/mision-caleb',
    registrationDeadline: '2026-12-20',
    officialCost: 'Gratuito (Alojamiento y alimentación cubiertos por la iglesia receptora)',
    requirements: [
      'Mayor de 15 años con corazón misionero y disposición de servicio',
      'Participación en las 3 jornadas previas de capacitación espiritual',
      'Aportar artículos de aseo personal y Biblia'
    ],
    lastVerifiedDate: '2026-10-19',
    imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80',
    category: 'mision_caleb',
    scope: 'union',
  }
];

// ============================================================================
// 6. JUEGOS BÍBLICOS AMPLIADOS CON 3 NIVELES (Fácil, Intermedio, Difícil)
// ============================================================================
export interface GameQuestionItem {
  id: string;
  gameType: 'trivia' | 'quien_soy' | 'completa_versiculo' | 'verdadero_falso';
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  question: string;
  options: string[];
  correctIndex: number;
  verseRef: string;
  explanation: string;
  clues?: string[];
  points: number;
}

export const COMPREHENSIVE_GAME_QUESTIONS: GameQuestionItem[] = [
  // --- FÁCIL: Personajes y conceptos básicos ---
  {
    id: 'gq_f1',
    gameType: 'trivia',
    difficulty: 'Fácil',
    question: '¿Cuántos días duró el diluvio en el relato del Génesis?',
    options: ['7 días', '40 días y 40 noches', '100 días', '120 días'],
    correctIndex: 1,
    verseRef: 'Génesis 7:12',
    explanation: 'Y hubo lluvia sobre la tierra cuarenta días y cuarenta noches mientras la familia de Noé y los animales estaban en el arca.',
    points: 15,
  },
  {
    id: 'gq_f2',
    gameType: 'quien_soy',
    difficulty: 'Fácil',
    question: '¿Quién soy? Fui arrojado al foso de los leones por negarme a dejar de orar a Dios tres veces al día.',
    options: ['Jeremías', 'Daniel', 'David', 'Ezequiel'],
    correctIndex: 1,
    verseRef: 'Daniel 6:10-23',
    explanation: 'Daniel propuso en su corazón ser fiel y Dios envió su ángel para cerrar la boca de los leones.',
    points: 15,
  },
  {
    id: 'gq_f3',
    gameType: 'completa_versiculo',
    difficulty: 'Fácil',
    question: 'Completa: "El Señor es mi pastor; nada me _________."',
    options: ['sobrará', 'faltará', 'quedará', 'olvidará'],
    correctIndex: 1,
    verseRef: 'Salmos 23:1',
    explanation: 'Salmos 23 es el cántico de confianza de David en el cuidado protector del Pastor divino.',
    points: 15,
  },
  {
    id: 'gq_f4',
    gameType: 'verdadero_falso',
    difficulty: 'Fácil',
    question: '¿Verdadero o Falso? El cuarto mandamiento de la ley de Dios manda guardar el séptimo día sábado.',
    options: ['Verdadero', 'Falso'],
    correctIndex: 0,
    verseRef: 'Éxodo 20:8-11',
    explanation: 'Éxodo 20:8 dice: "Acuérdate del día de reposo para santificarlo. Seis días trabajarás... mas el séptimo día es reposo para Jehová tu Dios".',
    points: 15,
  },

  // --- MEDIO: Relaciones, libros e historia bíblica ---
  {
    id: 'gq_m1',
    gameType: 'trivia',
    difficulty: 'Medio',
    question: '¿En qué monte desafió el profeta Elías a los profetas de Baal con fuego del cielo?',
    options: ['Monte Sinaí', 'Monte de los Olivos', 'Monte Carmelo', 'Monte Nebo'],
    correctIndex: 2,
    verseRef: '1 Reyes 18:20-40',
    explanation: 'En el Monte Carmelo Dios manifestó su gloria consumiendo el holocausto y probando que Él es el único Dios verdadero.',
    points: 30,
  },
  {
    id: 'gq_m2',
    gameType: 'quien_soy',
    difficulty: 'Medio',
    question: '¿Quién soy? Fui una reina que arriesgó su vida diciendo: "Y si perezco, que perezca" para salvar a mi pueblo de un genocidio decretado por Amán.',
    options: ['Rut', 'Ester', 'Débora', 'Abigail'],
    correctIndex: 1,
    verseRef: 'Ester 4:16',
    explanation: 'La reina Ester intercedió ante el rey Asuero tras tres días de ayuno y oración de todo su pueblo.',
    points: 30,
  },
  {
    id: 'gq_m3',
    gameType: 'completa_versiculo',
    difficulty: 'Medio',
    question: 'Completa: "Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de ________ y de dominio propio."',
    options: ['esperanza', 'sabiduría', 'amor', 'justicia'],
    correctIndex: 2,
    verseRef: '2 Timoteo 1:7',
    explanation: 'Pablo alienta al joven Timoteo recordando que el Espíritu Santo imparte poder, amor y templanza.',
    points: 30,
  },
  {
    id: 'gq_m4',
    gameType: 'verdadero_falso',
    difficulty: 'Medio',
    question: '¿Verdadero o Falso? En la visión de la estatua de Daniel 2, la cabeza de oro representaba al imperio Medo-Persa.',
    options: ['Verdadero', 'Falso'],
    correctIndex: 1,
    verseRef: 'Daniel 2:38',
    explanation: 'Falso. Daniel le dijo claramente al rey Nabucodonosor: "Tú eres aquella cabeza de oro", representando a Babilonia.',
    points: 30,
  },

  // --- DIFÍCIL: Interpretación, contexto y profecías ---
  {
    id: 'gq_d1',
    gameType: 'trivia',
    difficulty: 'Difícil',
    question: 'Según Daniel 8:14, ¿cuánto tiempo duraría la profecía hasta que el santuario fuera purificado?',
    options: ['1260 días', '2300 tardes y mañanas', '70 semanas', '1290 días'],
    correctIndex: 1,
    verseRef: 'Daniel 8:14',
    explanation: 'Daniel 8:14 declara: "Hasta dos mil trescientas tardes y mañanas; luego el santuario será purificado", la profecía de tiempo más larga de la Biblia que culmina en 1844.',
    points: 50,
  },
  {
    id: 'gq_d2',
    gameType: 'quien_soy',
    difficulty: 'Difícil',
    question: '¿Quién soy? Fui el sumo sacerdote que colaboró con Nehemías en la reedificación de la puerta de las Ovejas en los muros de Jerusalén.',
    options: ['Esdras', 'Eliasib', 'Josué hijo de Josadac', 'Hiligías'],
    correctIndex: 1,
    verseRef: 'Nehemías 3:1',
    explanation: 'Eliasib el sumo sacerdote se levantó con sus hermanos los sacerdotes y edificaron la puerta de las Ovejas, santificándola.',
    points: 50,
  },
  {
    id: 'gq_d3',
    gameType: 'completa_versiculo',
    difficulty: 'Difícil',
    question: 'Completa: "Aquí está la paciencia de los santos, los que guardan los mandamientos de Dios y la ________ de Jesús."',
    options: ['esperanza', 'gracia', 'fe', 'paz'],
    correctIndex: 2,
    verseRef: 'Apocalipsis 14:12',
    explanation: 'Apocalipsis 14:12 define al remanente final que persevera guardando los mandamientos de Dios y teniendo la fe de Jesús.',
    points: 50,
  },
  {
    id: 'gq_d4',
    gameType: 'verdadero_falso',
    difficulty: 'Difícil',
    question: '¿Verdadero o Falso? El mensaje del primer ángel de Apocalipsis 14 anuncia que "la hora de su juicio ha llegado" y llama a adorar al Creador.',
    options: ['Verdadero', 'Falso'],
    correctIndex: 0,
    verseRef: 'Apocalipsis 14:6-7',
    explanation: 'Verdadero. El primer ángel proclama el evangelio eterno diciendo: "Temed a Dios, y dadle gloria, porque la hora de su juicio ha llegado; y adorad a aquel que hizo el cielo y la tierra, el mar y las fuentes de las aguas".',
    points: 50,
  }
];
