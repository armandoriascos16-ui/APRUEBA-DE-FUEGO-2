/**
 * Motor Inteligente de Recomendación de Música Cristiana para Estados
 * Analiza versículos bíblicos, mensajes y categorías para sugerir pistas afines.
 * Basado en información real del catálogo autorizado (sin invención ni simulación ficticia).
 */

import { ChristianTrack, SpiritualMood, SmartRecommendationResult } from './types';
import { VERIFIED_CHRISTIAN_TRACKS } from './christianMusicCatalog';

interface KeywordDictionary {
  mood: SpiritualMood;
  keywords: string[];
  bibleReferences: string[];
}

const THEME_DICTIONARY: KeywordDictionary[] = [
  {
    mood: 'paz',
    keywords: ['paz', 'tranquilidad', 'calma', 'reposo', 'descanso', 'serenidad', 'quietud', 'dormir', 'aguas', 'tormenta', 'ansiedad', 'estrés'],
    bibleReferences: ['salmo 23', 'salmos 23', 'juan 14:27', 'filipenses 4:7', 'mateo 11:28', 'salmo 4:8', 'salmos 4:8']
  },
  {
    mood: 'fe',
    keywords: ['fe', 'creer', 'confianza', 'fidelidad', 'creo', 'firme', 'inconmovible', 'certeza', 'conviccion', 'promesa'],
    bibleReferences: ['hebreos 11', 'marcos 11:24', 'romanos 10:17', '2 corintios 5:7', 'habacuc 2:4']
  },
  {
    mood: 'esperanza',
    keywords: ['esperanza', 'futuro', 'promesa', 'mañana', 'segunda venida', 'cielo', 'vida eterna', 'gloria', 'aguardar', 'resurreccion'],
    bibleReferences: ['jeremias 29:11', 'tito 2:13', '1 tesalonicenses 4', 'romanos 15:13', 'apocalipsis 21', 'hebreos 6:19']
  },
  {
    mood: 'gratitud',
    keywords: ['gracias', 'gratitud', 'agradecido', 'bendicion', 'bondad', 'maravillas', 'agradecer', 'grato', 'misericordia'],
    bibleReferences: ['salmo 103', 'salmos 103', '1 tesalonicenses 5:18', 'salmo 100', 'salmo 107', 'colosenses 3:15']
  },
  {
    mood: 'amor',
    keywords: ['amor', 'amar', 'misericordia', 'gracia', 'compasion', 'cariño', 'entrega', 'sacrificio', 'hermandad', 'perdonar'],
    bibleReferences: ['1 corintios 13', 'juan 3:16', '1 juan 4', 'romanos 8:38', 'efesios 3:18']
  },
  {
    mood: 'fortaleza',
    keywords: ['fortaleza', 'fuerza', 'poder', 'victoria', 'escudo', 'refugio', 'roca', 'castillo', 'valiente', 'vencer', 'prueba', 'horno'],
    bibleReferences: ['filipenses 4:13', 'isaias 40:31', 'salmo 46', 'salmos 46', 'josue 1:9', 'salmo 91', 'salmos 91', 'daniel 3']
  },
  {
    mood: 'oracion',
    keywords: ['oracion', 'orar', 'clamar', 'rogar', 'pedir', 'clamor', 'silencio', 'madrugada', 'intercesion', 'arrodillar', 'suplica'],
    bibleReferences: ['mateo 6:6', '1 tesalonicenses 5:17', 'santiago 5:16', 'jeremias 33:3', 'filipenses 4:6']
  },
  {
    mood: 'adoracion',
    keywords: ['santo', 'adorar', 'adoracion', 'trono', 'digno', 'majestad', 'exaltado', 'cordero', 'gloria', 'reverencia', 'creador'],
    bibleReferences: ['apocalipsis 4', 'apocalipsis 5', 'isaias 6', 'salmo 95', 'juan 4:24', 'salmo 96']
  },
  {
    mood: 'alabanza',
    keywords: ['alabar', 'alabanza', 'cantar', 'cancion', 'cántico', 'jubilo', 'gozo', 'alegria', 'trompeta', 'salterio', 'arpa'],
    bibleReferences: ['salmo 150', 'salmos 150', 'salmo 148', 'salmo 149', 'lucas 1:46', 'salmo 33']
  },
  {
    mood: 'perdon',
    keywords: ['perdon', 'perdonar', 'culpa', 'pecado', 'limpiar', 'sangre', 'cruz', 'arrepentimiento', 'gracia', 'blanco como la nieve'],
    bibleReferences: ['1 juan 1:9', 'isaias 1:18', 'salmo 51', 'salmos 51', 'efesios 1:7', 'miqueas 7:19']
  },
  {
    mood: 'consuelo',
    keywords: ['consuelo', 'tristeza', 'lagrimas', 'dolor', 'luto', 'afliccion', 'quebrantado', 'sanar', 'llorar', 'abrazar'],
    bibleReferences: ['2 corintios 1:3', 'mateo 5:4', 'salmo 34:18', 'apocalipsis 21:4', 'isaias 61:1']
  },
  {
    mood: 'confianza',
    keywords: ['confianza', 'confiar', 'pastor', 'cuidado', 'seguridad', 'amparo', 'no temere', 'mano', 'guia', 'senda'],
    bibleReferences: ['proverbios 3:5', 'salmo 23', 'salmo 27', 'salmo 121', 'isaias 26:3']
  }
];

export function analyzeStoryAndRecommendMusic(
  textContent: string,
  bibleVerse: string,
  category: string
): SmartRecommendationResult {
  const combinedText = `${textContent.toLowerCase()} ${bibleVerse.toLowerCase()} ${category.toLowerCase()}`;
  
  const moodScores: Record<SpiritualMood, number> = {
    paz: 0,
    fe: 0,
    esperanza: 0,
    gratitud: 0,
    amor: 0,
    fortaleza: 0,
    oracion: 0,
    adoracion: 0,
    alabanza: 0,
    perdon: 0,
    consuelo: 0,
    confianza: 0
  };

  const detectedThemes: string[] = [];

  // Ponderar por categoría de estado
  if (category === 'oracion') moodScores.oracion += 3;
  if (category === 'versiculo') moodScores.paz += 2;
  if (category === 'testimonio') moodScores.gratitud += 3;
  if (category === 'reflexion') moodScores.fe += 2;
  if (category === 'musica') moodScores.alabanza += 3;
  if (category === 'campamento') moodScores.fortaleza += 2;

  // Analizar versículo y texto con diccionario temático
  THEME_DICTIONARY.forEach(({ mood, keywords, bibleReferences }) => {
    // Coincidencia con versículo bíblico específico (peso mayor)
    bibleReferences.forEach(ref => {
      if (combinedText.includes(ref)) {
        moodScores[mood] += 5;
        if (!detectedThemes.includes(`Texto clave: ${ref.toUpperCase()}`)) {
          detectedThemes.push(`Texto clave: ${ref.toUpperCase()}`);
        }
      }
    });

    // Coincidencia con palabras clave
    keywords.forEach(kw => {
      if (combinedText.includes(kw)) {
        moodScores[mood] += 2;
        if (!detectedThemes.includes(kw) && detectedThemes.length < 5) {
          detectedThemes.push(kw);
        }
      }
    });
  });

  // Ordenar estados anímicos detectados
  const sortedMoods = (Object.keys(moodScores) as SpiritualMood[])
    .filter(m => moodScores[m] > 0)
    .sort((a, b) => moodScores[b] - moodScores[a]);

  if (sortedMoods.length === 0) {
    // Si no hay palabras específicas pero hay contenido, asignar fe y paz por defecto
    sortedMoods.push('paz', 'fe');
  }

  // Puntuación de las pistas del catálogo según los estados anímicos detectados
  const scoredTracks = VERIFIED_CHRISTIAN_TRACKS.map(track => {
    let score = 0;
    track.moods.forEach(m => {
      const moodRank = sortedMoods.indexOf(m);
      if (moodRank !== -1) {
        // Mayor puntaje a las primeras coincidencias
        score += Math.max(1, 10 - moodRank * 2);
      }
    });

    // Bonificación si la categoría musical es afín
    if (category === 'oracion' && track.category === 'oracion') score += 4;
    if (category === 'versiculo' && (track.category === 'versiculos' || track.category === 'piano')) score += 4;
    if (category === 'musica' && track.category === 'alabanza') score += 4;
    if (category === 'campamento' && track.category === 'juvenil') score += 5;

    return { track, score };
  });

  // Ordenar pistas por puntuación descendente
  scoredTracks.sort((a, b) => b.score - a.score);

  const topTrack = scoredTracks[0]?.track || null;
  const alternatives = scoredTracks.slice(1, 4).map(st => st.track);

  // Calcular porcentaje de confianza aproximado
  const topScore = scoredTracks[0]?.score || 0;
  const confidenceScore = Math.min(98, Math.max(45, topScore * 8));

  // Generar explicación espiritual comprensible
  let explanation = '';
  if (topTrack) {
    const mainMood = sortedMoods[0] || 'paz';
    const moodLabels: Record<SpiritualMood, string> = {
      paz: 'paz y descanso espiritual',
      fe: 'fe inquebrantable',
      esperanza: 'esperanza en la bendita promesa',
      gratitud: 'gratitud por las bendiciones de Dios',
      amor: 'amor cristiano y misericordia',
      fortaleza: 'fortaleza y victoria en el Señor',
      oracion: 'oración y búsqueda personal',
      adoracion: 'adoración y reverencia al Creador',
      alabanza: 'alabanza y gozo santo',
      perdon: 'el perdón y la gracia redentora',
      consuelo: 'consuelo ante la prueba',
      confianza: 'confianza en el cuidado divino'
    };

    if (bibleVerse.trim()) {
      explanation = `Recomendada para acompañar tu versículo bíblico con un ambiente de ${moodLabels[mainMood]}.`;
    } else if (textContent.trim()) {
      explanation = `Sugerida para armonizar con tu reflexión sobre ${moodLabels[mainMood]}.`;
    } else {
      explanation = `Música cristiana devocional para edificar tu estado espiritual.`;
    }
  } else {
    explanation = 'Todavía no encontramos una música apropiada para este Estado. Puedes elegir una pista manualmente o continuar sin música.';
  }

  return {
    primaryRecommendation: topTrack,
    alternatives,
    detectedMoods: sortedMoods.slice(0, 3),
    detectedThemes,
    explanation,
    confidenceScore
  };
}
