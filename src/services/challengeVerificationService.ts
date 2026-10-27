import { Challenge } from '../types';

export interface EvidenceSubmissionInput {
  challengeId: string;
  challengeTitle: string;
  challengePoints: number;
  commentReflection: string;
  date: string;
  approximateLocation: string;
  mediaUrl?: string;
  mediaType?: 'photo' | 'video';
  studyTheme?: string;
  bibleVerseUsed?: string;
  materialsUsed?: string;
  activityDescription?: string;
}

export interface VerificationResult {
  status: 'approved' | 'pending' | 'more_info' | 'rejected';
  confidence: number; // 0 to 1
  pointsToAward: number;
  feedbackMessage: string;
  correctionInstructions?: string;
  reason?: string;
  suggestedFeedback?: string;
}

/**
 * Motor de Comprobación Automática Responsable para Retos Juveniles.
 * 
 * Reglas de comprobación:
 * 1. Valida campos obligatorios y formato de fecha.
 * 2. Protege la privacidad evitando números telefónicos o datos personales privados de terceros.
 * 3. Evalúa requisitos específicos de los 7 retos oficiales:
 *    - Si se cumplen los requisitos con alta certeza (>= 0.90) -> Aprobación automática y concesión de puntos.
 *    - Si la información es ambigua o incompleta -> Queda en estado "Pendiente de revisión" para moderador humano.
 *    - Si faltan datos esenciales o no hay coherencia -> Estado "more_info" (Requiere corrección) con instrucciones.
 */
export function verifyChallengeEvidence(
  challenge: Challenge | undefined,
  input: EvidenceSubmissionInput
): VerificationResult {
  const evaluate = (): VerificationResult => {
    if (!challenge) {
      return {
        status: 'pending',
        confidence: 0.5,
        pointsToAward: 10,
        feedbackMessage: 'Reto enviado a moderación general para su certificación.',
        reason: 'Reto enviado a moderación general para su certificación.'
      };
    }
    const text = (input.commentReflection || '').trim();
    const location = (input.approximateLocation || '').trim();
    const theme = (input.studyTheme || '').trim();
    const verse = (input.bibleVerseUsed || '').trim();
    const dateStr = (input.date || '').trim();

  // 1. Validaciones básicas obligatorias
  if (!text || text.length < 15) {
    return {
      status: 'more_info',
      confidence: 0.1,
      pointsToAward: 0,
      feedbackMessage: 'La evidencia presentada es demasiado breve. Describe con más detalle cómo realizaste la actividad.',
      correctionInstructions: 'Escribe al menos dos oraciones describiendo la experiencia, los aprendizajes espirituales y cómo se cumplió el objetivo del reto.'
    };
  }

  if (!location) {
    return {
      status: 'more_info',
      confidence: 0.2,
      pointsToAward: 0,
      feedbackMessage: 'Por favor indica la ciudad, barrio o iglesia local donde se desarrolló la actividad.',
      correctionInstructions: 'Ingresa un lugar aproximado respetando la privacidad (ej. "Barrio San Luis, Buenaventura" o "Iglesia Central").'
    };
  }

  // 2. Control de privacidad: No exigir ni admitir teléfonos personales o datos sensibles de terceros
  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/;
  if (phoneRegex.test(text)) {
    return {
      status: 'more_info',
      confidence: 0.3,
      pointsToAward: 0,
      feedbackMessage: 'Por seguridad y privacidad de menores y participantes, no está permitido incluir números de teléfono.',
      correctionInstructions: 'Edita tu descripción retirando números telefónicos u otra información privada de contacto.'
    };
  }

  // Comprobación de fecha no en el futuro lejano
  const parsedDate = Date.parse(dateStr);
  if (!isNaN(parsedDate) && parsedDate > Date.now() + 86400000) {
    return {
      status: 'more_info',
      confidence: 0.2,
      pointsToAward: 0,
      feedbackMessage: 'La fecha de realización no puede ser posterior a hoy.',
      correctionInstructions: 'Verifica la fecha en la que realizaste el reto.'
    };
  }

  const lowerText = text.toLowerCase();
  const lowerLocation = location.toLowerCase();
  const combinedText = `${lowerText} ${theme.toLowerCase()} ${verse.toLowerCase()}`;

  // 3. Reglas específicas por Reto
  switch (challenge.id) {
    // Reto 1: Invitar a un amigo a la iglesia (Fácil, 10 pts)
    case 'ch_reto_1_invitar_amigo': {
      const keywords = ['iglesia', 'culto', 'actividad', 'invit', 'amig', 'reuni', 'sábado', 'sabado', 'templo', 'asistir', 'acompañ', 'escuela sabática', 'sociedad de jóvenes'];
      const matchCount = keywords.filter(k => combinedText.includes(k)).length;

      if (text.length >= 30 && matchCount >= 2) {
        return {
          status: 'approved',
          confidence: 0.95,
          pointsToAward: challenge.points,
          feedbackMessage: `¡Excelente labor misionera! Has invitado a un amigo con respeto y amabilidad. Se te han acreditado +${challenge.points} puntos.`
        };
      }

      if (text.length >= 20 && matchCount >= 1) {
        return {
          status: 'pending',
          confidence: 0.75,
          pointsToAward: 0,
          feedbackMessage: 'Tu invitación ha sido registrada. Pasa a revisión de moderación para certificar los detalles de la actividad.'
        };
      }

      return {
        status: 'more_info',
        confidence: 0.4,
        pointsToAward: 0,
        feedbackMessage: 'Por favor detalla cómo realizaste la invitación a la iglesia o actividad juvenil.',
        correctionInstructions: 'Describe amablemente a qué actividad invitaste a tu amigo y cómo fue la conversación, sin compartir sus datos personales.'
      };
    }

    // Reto 2: Repartir literatura cristiana o regalar un libro (Fácil, 15 pts)
    case 'ch_reto_2_repartir_literatura': {
      const literatureKeywords = ['libro', 'literatura', 'folleto', 'tratado', 'revista', 'misioner', 'el camino a cristo', 'esperanza', 'lectura', 'comparti', 'regal', 'paz', 'fe'];
      const hasLitWord = literatureKeywords.some(k => combinedText.includes(k));
      const hasMedia = Boolean(input.mediaUrl);

      if (text.length >= 30 && hasLitWord) {
        return {
          status: 'approved',
          confidence: 0.94,
          pointsToAward: challenge.points,
          feedbackMessage: `¡Sembrando la semilla de la verdad! Literatura cristiana compartida con éxito. Se te han acreditado +${challenge.points} puntos.`
        };
      }

      if (text.length >= 20 || hasMedia) {
        return {
          status: 'pending',
          confidence: 0.72,
          pointsToAward: 0,
          feedbackMessage: 'Evidencia recibida con éxito. Queda en revisión por el equipo moderador para certificar la entrega de literatura.'
        };
      }

      return {
        status: 'more_info',
        confidence: 0.35,
        pointsToAward: 0,
        feedbackMessage: 'Falta especificar qué literatura o libro compartiste en la actividad.',
        correctionInstructions: 'Menciona el título del libro o el tipo de folleto que regalaste y añade una breve reflexión de la experiencia.'
      };
    }

    // Reto 3: Visitar a un adulto mayor y orar con él, con su consentimiento (Intermedio, 25 pts)
    case 'ch_reto_3_visitar_adulto_mayor': {
      const elderKeywords = ['abuel', 'adulto mayor', 'ancian', 'visita', 'orar', 'oración', 'consentimiento', 'convers', 'escuch', 'bendic', 'hogar', 'atención', 'compañía'];
      const matchCount = elderKeywords.filter(k => combinedText.includes(k)).length;

      if (text.length >= 35 && matchCount >= 2) {
        return {
          status: 'approved',
          confidence: 0.96,
          pointsToAward: challenge.points,
          feedbackMessage: `¡Puro amor de Cristo! Has brindado consuelo, compañía y oración a un adulto mayor con su consentimiento. +${challenge.points} puntos acreditados.`
        };
      }

      if (text.length >= 25 && matchCount >= 1) {
        return {
          status: 'pending',
          confidence: 0.78,
          pointsToAward: 0,
          feedbackMessage: 'Hermoso testimonio de visita registrado. Se encuentra en revisión para certificar el momento de acompañamiento.'
        };
      }

      return {
        status: 'more_info',
        confidence: 0.4,
        pointsToAward: 0,
        feedbackMessage: 'Por favor detalla cómo fue el momento de acompañamiento y oración con el adulto mayor.',
        correctionInstructions: 'Comparte una reflexión sobre cómo se sintió la persona y qué bendición representó la visita, respetando su privacidad.'
      };
    }

    // Reto 4: Realizar una actividad de obra misionera (Intermedio, 25 pts)
    case 'ch_reto_4_obra_misionera': {
      const missionKeywords = ['obra', 'misión', 'mision', 'servicio', 'comunidad', 'solidari', 'víveres', 'viveres', 'ayud', 'barrio', 'limpieza', 'salud', 'apoyo', 'necesitad', 'adra', 'caleb', 'impacto'];
      const matchCount = missionKeywords.filter(k => combinedText.includes(k)).length;

      if (text.length >= 35 && matchCount >= 2) {
        return {
          status: 'approved',
          confidence: 0.93,
          pointsToAward: challenge.points,
          feedbackMessage: `¡Manos que sirven reflejan a Jesús! Actividad misionera certificada con éxito. Se han sumado +${challenge.points} puntos a tu cuenta.`
        };
      }

      if (text.length >= 25) {
        return {
          status: 'pending',
          confidence: 0.74,
          pointsToAward: 0,
          feedbackMessage: 'Tu informe de obra misionera ha sido registrado. Queda pendiente de revisión por el moderador.'
        };
      }

      return {
        status: 'more_info',
        confidence: 0.35,
        pointsToAward: 0,
        feedbackMessage: 'Describe con mayor precisión en qué consistió la labor misionera o comunitaria.',
        correctionInstructions: 'Indica la labor realizada (ej. entrega de alimentos, servicio voluntario o apoyo vecinal) y su objetivo.'
      };
    }

    // Reto 5: Orar en el colegio o la universidad, respetando las normas del lugar (Intermedio, 20 pts)
    case 'ch_reto_5_orar_colegio_universidad': {
      const schoolKeywords = ['colegio', 'universidad', 'escuela', 'receso', 'descanso', 'clase', 'compañer', 'orar', 'oración', 'respet', 'norma', 'campus', 'instituc', 'estudio', 'fe'];
      const matchCount = schoolKeywords.filter(k => combinedText.includes(k)).length;

      if (text.length >= 30 && matchCount >= 2) {
        return {
          status: 'approved',
          confidence: 0.95,
          pointsToAward: challenge.points,
          feedbackMessage: `¡Luz en tu centro de estudios! Has orado respetando las normas de tu institución educativa. Has ganado +${challenge.points} puntos.`
        };
      }

      if (text.length >= 20 && matchCount >= 1) {
        return {
          status: 'pending',
          confidence: 0.76,
          pointsToAward: 0,
          feedbackMessage: 'Testimonio de oración en centro educativo registrado. Pasa a revisión para corroborar el cumplimiento.'
        };
      }

      return {
        status: 'more_info',
        confidence: 0.4,
        pointsToAward: 0,
        feedbackMessage: 'Describe cómo se llevó a cabo el momento de oración y cómo se respetaron las normas del centro.',
        correctionInstructions: 'Indica si oraste en el receso o tiempo libre y cómo fue la experiencia personal sin interrumpir actividades académicas.'
      };
    }

    // Reto 6: Dar un estudio bíblico (Avanzado, 35 pts)
    case 'ch_reto_6_dar_estudio_biblico': {
      const hasTopic = theme.length >= 4 || combinedText.includes('tema') || combinedText.includes('lección') || combinedText.includes('fe de jesús');
      const hasScripture = verse.length >= 4 || /\b(?:génesis|éxodo|levítico|números|deuteronomio|salmo|proverbios|isaías|jeremías|daniel|mateo|marcos|lucas|juan|hechos|romanos|corintios|gálatas|efesios|filipenses|colosenses|tesalonicenses|timoteo|hebreos|santiago|pedro|apocalipsis)\s*\d+/i.test(combinedText);
      const studyKeywords = ['estudio', 'biblia', 'pasaje', 'lección', 'enseñanza', 'cristo', 'dios', 'fe', 'salvación', 'gracia', 'esperanza'];
      const matchCount = studyKeywords.filter(k => combinedText.includes(k)).length;

      if (text.length >= 35 && hasTopic && hasScripture) {
        return {
          status: 'approved',
          confidence: 0.97,
          pointsToAward: challenge.points,
          feedbackMessage: `¡Maestro de la Palabra! Estudio bíblico comprobado con pasajes y tema verificado. +${challenge.points} puntos acreditados a tu perfil.`
        };
      }

      if (text.length >= 25 && (hasTopic || hasScripture || matchCount >= 2)) {
        return {
          status: 'pending',
          confidence: 0.79,
          pointsToAward: 0,
          feedbackMessage: 'Estudio bíblico registrado con éxito. Se enviará a revisión para validar las referencias bíblicas del estudio.'
        };
      }

      return {
        status: 'more_info',
        confidence: 0.35,
        pointsToAward: 0,
        feedbackMessage: 'Para aprobar este reto avanzado, se requiere indicar el tema estudiado y los pasajes bíblicos utilizados.',
        correctionInstructions: 'Indica el tema del estudio (ej. "La Segunda Venida de Cristo"), el texto bíblico clave (ej. "Juan 14:1-3") y un resumen de lo aprendido.'
      };
    }

    // Reto 7: Predicar en el colegio o la universidad, con autorización cuando corresponda (Avanzado, 40 pts)
    case 'ch_reto_7_predicar_colegio_universidad': {
      const preachKeywords = ['predic', 'mensaje', 'tema', 'devocional', 'autoriz', 'rector', 'docente', 'profesor', 'grupo', 'semana de oración', 'auditorio', 'aula', 'palabra', 'testimonio'];
      const matchCount = preachKeywords.filter(k => combinedText.includes(k)).length;
      const hasScripture = verse.length >= 3 || /\b(?:mateo|marcos|lucas|juan|hechos|romanos|salmo|isaías|filipenses|timoteo)\b/i.test(combinedText);

      if (text.length >= 40 && matchCount >= 2 && hasScripture) {
        return {
          status: 'approved',
          confidence: 0.96,
          pointsToAward: challenge.points,
          feedbackMessage: `¡Valiente proclamador de la fe! Mensaje bíblico en tu centro educativo certificado. +${challenge.points} puntos acreditados.`
        };
      }

      if (text.length >= 25 && matchCount >= 1) {
        return {
          status: 'pending',
          confidence: 0.77,
          pointsToAward: 0,
          feedbackMessage: 'Informe de predicación registrado. El equipo de moderadores corroborará la autorización y el contenido del mensaje.'
        };
      }

      return {
        status: 'more_info',
        confidence: 0.35,
        pointsToAward: 0,
        feedbackMessage: 'Por favor detalla el tema del mensaje, los textos bíblicos usados y cómo se obtuvo la autorización correspondiente.',
        correctionInstructions: 'Menciona el título de tu reflexión, los versículos bíblicos compartidos y el marco de la actividad estudiantil autorizada.'
      };
    }

    // Retos generales de la aplicación
    default: {
      if (text.length >= 40 && input.mediaUrl) {
        return {
          status: 'approved',
          confidence: 0.91,
          pointsToAward: challenge.points,
          feedbackMessage: `¡Reto superado! Evidencia completa verificada satisfactoriamente. +${challenge.points} puntos acreditados.`
        };
      }

      return {
        status: 'pending',
        confidence: 0.7,
        pointsToAward: 0,
        feedbackMessage: 'Tu evidencia ha sido registrada y está en la fila de revisión de moderación.'
      };
    }
  }
};

  const result = evaluate();
  return {
    ...result,
    reason: result.reason || result.feedbackMessage,
    suggestedFeedback: result.suggestedFeedback || result.correctionInstructions || result.feedbackMessage
  };
}
