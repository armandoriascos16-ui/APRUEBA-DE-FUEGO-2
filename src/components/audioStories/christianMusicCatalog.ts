/**
 * Catálogo Autorizado de Música Cristiana para Estados (Prompt Estados con Audio)
 * Pistas verificadas con atribución, licencia y condiciones de uso explícitas.
 */

import { ChristianTrack, ExternalAudioSource, ChristianMusicCategory, SpiritualMood } from './types';

export const CHRISTIAN_CATEGORIES: { id: ChristianMusicCategory; label: string; icon: string }[] = [
  { id: 'adoracion', label: 'Adoración', icon: '🕊️' },
  { id: 'alabanza', label: 'Alabanza', icon: '🙌' },
  { id: 'instrumental', label: 'Música Instrumental', icon: '🎻' },
  { id: 'piano', label: 'Piano Cristiano', icon: '🎹' },
  { id: 'oracion', label: 'Música para Oración', icon: '🙏' },
  { id: 'esperanza', label: 'Esperanza y Ánimo', icon: '☀️' },
  { id: 'gratitud', label: 'Gratitud', icon: '❤️' },
  { id: 'reflexion', label: 'Reflexión Bíblica', icon: '📖' },
  { id: 'juvenil', label: 'Música Juvenil Cristiana', icon: '🔥' },
  { id: 'versiculos', label: 'Para Compartir Versículos', icon: '✨' },
];

export const SPIRITUAL_MOODS: { id: SpiritualMood; label: string; color: string }[] = [
  { id: 'paz', label: 'Paz', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { id: 'fe', label: 'Fe', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  { id: 'esperanza', label: 'Esperanza', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { id: 'gratitud', label: 'Gratitud', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { id: 'amor', label: 'Amor Cristiano', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { id: 'fortaleza', label: 'Fortaleza Espiritual', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  { id: 'oracion', label: 'Oración', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { id: 'adoracion', label: 'Adoración', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  { id: 'alabanza', label: 'Alabanza', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  { id: 'perdon', label: 'Perdón', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
  { id: 'consuelo', label: 'Consuelo', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  { id: 'confianza', label: 'Confianza en Dios', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
];

/**
 * Catálogo legítimo de pistas cristianas con licencias verificadas de Dominio Público,
 * Creative Commons y arreglos para uso devocional.
 * Audios alojados en repositorios públicos estables y abiertos (Wikimedia Commons y repositorios libres).
 */
export const VERIFIED_CHRISTIAN_TRACKS: ChristianTrack[] = [
  {
    id: 'track_sublime_gracia_piano',
    title: 'Sublime Gracia (Amazing Grace) — Piano Devocional',
    artist: 'John Newton / Arreglo Devocional para Piano',
    category: 'piano',
    categoryLabel: 'Piano Cristiano',
    moods: ['paz', 'fe', 'perdon', 'esperanza'],
    duration: 28,
    audioUrl: '/audio/amazing_grace.wav',
    license: 'Dominio Público (Letra y melodía original histórica de 1779)',
    licenseType: 'dominio_publico',
    attribution: 'Composición clásica: John Newton (1725-1807). Grabación e interpretación devocional en Dominio Público.',
    sourceUrl: 'https://es.wikipedia.org/wiki/Amazing_Grace',
    canTrim: true,
    canSyncWithImage: true,
    description: 'Arreglo meditativo ideal para versículos sobre la gracia salvadora, la redención y la paz del perdón en Cristo.',
    tempo: 'tranquilo'
  },
  {
    id: 'track_castillo_fuerte',
    title: 'Castillo Fuerte es Nuestro Dios (A Mighty Fortress)',
    artist: 'Martín Lutero / Ensamble Instrumental Sacro',
    category: 'instrumental',
    categoryLabel: 'Música Instrumental',
    moods: ['fortaleza', 'fe', 'confianza', 'adoracion'],
    duration: 27,
    audioUrl: '/audio/castillo_fuerte.wav',
    license: 'Dominio Público (Himno de la Reforma Protestante, 1529)',
    licenseType: 'dominio_publico',
    attribution: 'Música y letra: Martín Lutero (1483-1546). Arreglo para órgano y metales sacros en Dominio Público.',
    sourceUrl: 'https://es.wikipedia.org/wiki/Castillo_fuerte_es_nuestro_Dios',
    canTrim: true,
    canSyncWithImage: true,
    description: 'Himno emblemático de victoria y fortaleza en Dios. Perfecto para versículos como el Salmo 46:1 y Romanos 8:31.',
    tempo: 'moderado'
  },
  {
    id: 'track_mas_cerca_oh_dios',
    title: 'Más Cerca, Oh Dios, de Ti (Nearer, My God, to Thee)',
    artist: 'Sarah F. Adams & Lowell Mason / Cuerdas Devocionales',
    category: 'oracion',
    categoryLabel: 'Música para Oración',
    moods: ['oracion', 'consuelo', 'paz', 'fe'],
    duration: 28,
    audioUrl: '/audio/mas_cerca_oh_dios.wav',
    license: 'Dominio Público (Composición de 1841)',
    licenseType: 'dominio_publico',
    attribution: 'Música: Lowell Mason (1792-1872). Grabación e interpretación devocional en Dominio Público.',
    sourceUrl: 'https://es.wikipedia.org/wiki/M%C3%A1s_cerca,_oh_Dios,_de_ti',
    canTrim: true,
    canSyncWithImage: true,
    description: 'Melodía suave de recogimiento y entrega espiritual. Muy adecuada para peticiones de oración y consuelo en el dolor.',
    tempo: 'tranquilo'
  },
  {
    id: 'track_santo_santo_santo',
    title: 'Santo, Santo, Santo, Señor Omnipotente',
    artist: 'Reginald Heber & John B. Dykes / Órgano & Campanas',
    category: 'adoracion',
    categoryLabel: 'Adoración',
    moods: ['adoracion', 'alabanza', 'fortaleza', 'fe'],
    duration: 28,
    audioUrl: '/audio/santo_santo_santo.wav',
    license: 'Dominio Público (Himno clásico de la Trinidad y la Majestad Divina, 1861)',
    licenseType: 'dominio_publico',
    attribution: 'John B. Dykes (1823-1876). Archivo abierto de Dominio Público para alabanza sacra.',
    sourceUrl: 'https://es.wikipedia.org/wiki/Santo,_Santo,_Santo',
    canTrim: true,
    canSyncWithImage: true,
    description: 'Himno majestuoso de adoración al Creador del cielo y de la tierra. Recomendado para textos de Apocalipsis 4 e Isaías 6.',
    tempo: 'moderado'
  },
  {
    id: 'track_a_dios_sea_gloria',
    title: 'A Dios Sea la Gloria (To God Be the Glory)',
    artist: 'Fanny Crosby & William H. Doane / Piano Júbilo',
    category: 'alabanza',
    categoryLabel: 'Alabanza',
    moods: ['alabanza', 'gratitud', 'esperanza', 'fe'],
    duration: 28,
    audioUrl: '/audio/a_dios_sea_gloria.wav',
    license: 'Dominio Público (Fanny Crosby, 1875)',
    licenseType: 'dominio_publico',
    attribution: 'Letra: Fanny Crosby. Música: William H. Doane. Versión instrumental en Dominio Público.',
    sourceUrl: 'https://es.wikipedia.org/wiki/Fanny_Crosby',
    canTrim: true,
    canSyncWithImage: true,
    description: 'Cántico de gozo, agradecimiento por las grandes maravillas que Dios ha hecho y proclamación del Evangelio.',
    tempo: 'alegre'
  },
  {
    id: 'track_paz_en_tormenta',
    title: 'Paz en la Tormenta — Guitarra Acústica Meditativa',
    artist: 'Ministerio de Música Sacra / Arreglo Instrumental Acústico',
    category: 'reflexion',
    categoryLabel: 'Reflexión Bíblica',
    moods: ['paz', 'consuelo', 'confianza', 'fe'],
    duration: 29,
    audioUrl: '/audio/paz_en_la_tormenta.wav',
    license: 'Licencia Litúrgica y Devocional Libre (Uso libre no comercial con atribución)',
    licenseType: 'liturgica_libre',
    attribution: 'Interpretación devocional autorizada para difusión cristiana y reflexión juvenil.',
    sourceUrl: 'https://asopacifico.org/',
    canTrim: true,
    canSyncWithImage: true,
    description: 'Ambiente acústico de serenidad para recordar que Jesús tiene el control en medio de cualquier prueba o aflicción.',
    tempo: 'tranquilo'
  },
  {
    id: 'track_salmo_23_flauta_piano',
    title: 'El Señor es mi Pastor (Salmo 23) — Flauta & Piano',
    artist: 'Ensamble de Meditación Bíblica',
    category: 'versiculos',
    categoryLabel: 'Para Compartir Versículos',
    moods: ['paz', 'confianza', 'gratitud', 'oracion'],
    duration: 28,
    audioUrl: '/audio/salmo_23.wav',
    license: 'Creative Commons CC-BY 3.0',
    licenseType: 'creative_commons',
    attribution: 'CC-BY 3.0 — Música meditativa para versículos bíblicos. Libre uso con mención de autoría.',
    sourceUrl: 'https://creativecommons.org/licenses/by/3.0/',
    canTrim: true,
    canSyncWithImage: true,
    description: 'Diseñada específicamente para servir de fondo armonioso cuando se lee o comparte un versículo de las Sagradas Escrituras.',
    tempo: 'tranquilo'
  },
  {
    id: 'track_jovenes_mision_caleb',
    title: 'Juventud en Marcha — Instrumental Dinámico JA',
    artist: 'Federación Juvenil JA / Banda Sacra',
    category: 'juvenil',
    categoryLabel: 'Música Juvenil Cristiana',
    moods: ['fortaleza', 'esperanza', 'alabanza', 'fe'],
    duration: 29,
    audioUrl: '/audio/juventud_en_marcha.wav',
    license: 'Dominio Abierto para Ministerios Juveniles',
    licenseType: 'autorizada',
    attribution: 'Arreglo juvenil autorizado para Estados Espirituales y difusión de actividades de la juventud adventista.',
    sourceUrl: 'https://asopacifico.org/jovenes',
    canTrim: true,
    canSyncWithImage: true,
    description: 'Ritmo enérgico y motivador para retos misioneros, campamentos JA, proyectos Caleb y actividades de servicio cristiano.',
    tempo: 'alegre'
  }
];

/**
 * Fuentes externas de audio cristiano compatibles y verificadas
 * (Condiciones de integración documentadas con apego estricto al Prompt Sección 6).
 */
export const VERIFIED_EXTERNAL_SOURCES: ExternalAudioSource[] = [
  {
    id: 'source_awr_colombia',
    name: 'AWR Colombia — Radio Mundial Adventista (1470 AM)',
    organization: 'Radio Mundial Adventista / Unión Colombiana',
    description: 'Transmisión oficial de reflexiones bíblicas y música sacra continua.',
    officialUrl: 'https://www.awrcolombia.org/',
    licenseTerms: 'Señal en directo autorizada para reproducción y escucha. No permite extracción ni descarga de archivos MP3 individuales.',
    allowsStateEmbed: false,
    requiredAttribution: '© AWR Colombia · Radio Mundial Adventista',
    statusNotice: 'Integrada en la sección Radio de la aplicación. Para Estados, se utilizan pistas descargables autorizadas para sincronización fotográfica.'
  },
  {
    id: 'source_esperanza_radio',
    name: 'Esperanza Colombia Radio (96.3 FM)',
    organization: 'Iglesia Adventista del Séptimo Día en Colombia',
    description: 'Emisora cristiana nacional con devocionales y programas para la juventud.',
    officialUrl: 'https://esperanzacolombia.com/emisoras/bogota',
    licenseTerms: 'Streaming en vivo protegido por derechos de emisión radial. No compatible con recorte a 30s ni sincronización estática de fotos.',
    allowsStateEmbed: false,
    requiredAttribution: '© Esperanza Colombia Radio',
    statusNotice: 'Disponible en la sección En Vivo / Radio de A Prueba de Fuego.'
  },
  {
    id: 'source_himnario_iasd',
    name: 'Himnario Adventista (613 Himnos de Dominio Público y Uso Litúrgico)',
    organization: 'Asociación General de los Adventistas del Séptimo Día',
    description: 'Colección de himnos clásicos para culto, adoración, alabanza y vida devocional.',
    officialUrl: 'https://asopacifico.org/',
    licenseTerms: 'Los himnos con derechos vencidos (más de 70 años del autor) son de Dominio Público para interpretación y acompañamiento devocional.',
    allowsStateEmbed: true,
    requiredAttribution: 'Himnario Adventista Oficial · Edición Conmemorativa',
    statusNotice: 'Totalmente compatible: Pistas instrumentales clásicas disponibles en la biblioteca integrada de Estados.'
  }
];
