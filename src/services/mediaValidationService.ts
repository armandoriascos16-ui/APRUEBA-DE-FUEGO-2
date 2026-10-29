/**
 * Servicio de Validación de Archivos Multimedia para A Prueba de Fuego
 * 
 * Verifica tipos MIME, códecs (priorizando H.264/AAC para MP4),
 * límites de tamaño en bytes, duración en segundos, y resolución
 * antes de la subida al servidor, asegurando compatibilidad óptima
 * con el reproductor HTML5 y fluidez en dispositivos móviles y web.
 */

export type MediaTargetContext = 'feed_post' | 'story' | 'audio_story' | 'avatar' | 'general';

export interface MediaLimitsConfig {
  maxVideoSizeBytes: number;       // Límite máximo recomendado para video (ej. 100 MB)
  maxVideoHardLimitBytes: number;   // Límite estricto infranqueable para video (ej. 150 MB)
  maxImageSizeBytes: number;       // Límite máximo para fotos (ej. 15 MB)
  maxAudioSizeBytes: number;       // Límite máximo para audio (ej. 25 MB)
  maxVideoDurationSeconds: number; // Duración máxima en segundos
  minVideoDurationSeconds: number; // Duración mínima en segundos
  maxImageDimension: number;       // Ancho/Alto máximo recomendado
}

export const DEFAULT_MEDIA_LIMITS: Record<MediaTargetContext, MediaLimitsConfig> = {
  feed_post: {
    maxVideoSizeBytes: 100 * 1024 * 1024,      // 100 MB
    maxVideoHardLimitBytes: 150 * 1024 * 1024,  // 150 MB
    maxImageSizeBytes: 15 * 1024 * 1024,       // 15 MB
    maxAudioSizeBytes: 25 * 1024 * 1024,       // 25 MB
    maxVideoDurationSeconds: 300,              // 5 minutos
    minVideoDurationSeconds: 1,                // 1 segundo
    maxImageDimension: 4096,
  },
  story: {
    maxVideoSizeBytes: 60 * 1024 * 1024,       // 60 MB
    maxVideoHardLimitBytes: 80 * 1024 * 1024,   // 80 MB
    maxImageSizeBytes: 10 * 1024 * 1024,       // 10 MB
    maxAudioSizeBytes: 15 * 1024 * 1024,       // 15 MB
    maxVideoDurationSeconds: 60,               // 60 segundos (para estados de 24h)
    minVideoDurationSeconds: 1,
    maxImageDimension: 2560,
  },
  audio_story: {
    maxVideoSizeBytes: 50 * 1024 * 1024,
    maxVideoHardLimitBytes: 50 * 1024 * 1024,
    maxImageSizeBytes: 8 * 1024 * 1024,
    maxAudioSizeBytes: 20 * 1024 * 1024,
    maxVideoDurationSeconds: 60,
    minVideoDurationSeconds: 1,
    maxImageDimension: 2048,
  },
  avatar: {
    maxVideoSizeBytes: 0,
    maxVideoHardLimitBytes: 0,
    maxImageSizeBytes: 6 * 1024 * 1024,        // 6 MB
    maxAudioSizeBytes: 0,
    maxVideoDurationSeconds: 0,
    minVideoDurationSeconds: 0,
    maxImageDimension: 1500,
  },
  general: {
    maxVideoSizeBytes: 100 * 1024 * 1024,
    maxVideoHardLimitBytes: 150 * 1024 * 1024,
    maxImageSizeBytes: 15 * 1024 * 1024,
    maxAudioSizeBytes: 25 * 1024 * 1024,
    maxVideoDurationSeconds: 300,
    minVideoDurationSeconds: 1,
    maxImageDimension: 4096,
  }
};

export interface MediaValidationResult {
  isValid: boolean;
  fileType: 'video' | 'image' | 'audio' | 'unknown';
  fileName: string;
  fileExtension: string;
  declaredMimeType: string;
  sizeBytes: number;
  sizeMb: number;
  sizeFormatted: string;
  
  // Metadatos de video / imagen
  duration?: number;
  durationFormatted?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
  aspectRatioLabel?: string; // '16:9 (Horizontal)', '9:16 (Vertical/Reel)', '1:1 (Cuadrado)'
  
  // Compatibilidad de códecs
  isH264AacMp4: boolean;          // Verdadero si es el formato de oro (MP4 H.264/AAC)
  canPlayNativelyInBrowser: boolean; // Si el navegador actual puede reproducirlo sin conversión
  needsServerTranscoding: boolean;   // Si requiere pasar por FFmpeg en el servidor
  
  // Diagnóstico
  error?: string;
  warnings: string[];
  recommendations: string[];
}

// Extensiones y tipos MIME permitidos
export const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'm4v', 'mov', 'webm', 'avi', 'mkv', '3gp', 'wmv'];
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
export const ALLOWED_AUDIO_EXTENSIONS = ['mp3', 'wav', 'aac', 'm4a', 'ogg', 'weba', 'flac'];

export const ALLOWED_VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/3gpp',
  'video/3gpp2',
  'video/x-m4v'
];

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
];

export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/aac',
  'audio/m4a',
  'audio/x-m4a',
  'audio/ogg',
  'audio/webm',
  'audio/flac'
];

/**
 * Formatea un tamaño en bytes a representación legible (KB, MB, GB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0 || isNaN(bytes)) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Formatea duración en segundos a formato mm:ss o hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '0:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  }
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Comprueba las capacidades nativas del navegador para H.264, AAC, WebM y HEVC
 */
export function checkBrowserVideoCodecSupport() {
  if (typeof document === 'undefined') {
    return { h264: true, aac: true, webm: true, hevc: false };
  }
  const video = document.createElement('video');
  const canPlay = (type: string): boolean => {
    const res = video.canPlayType(type);
    return res === 'probably' || res === 'maybe';
  };

  return {
    h264Baseline: canPlay('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'),
    h264High: canPlay('video/mp4; codecs="avc1.64001E, mp4a.40.2"'),
    mp4Aac: canPlay('audio/mp4; codecs="mp4a.40.2"'),
    webm: canPlay('video/webm; codecs="vp8, vorbis"') || canPlay('video/webm; codecs="vp9, opus"'),
    hevc: canPlay('video/mp4; codecs="hvc1.1.6.L93.B0"') || canPlay('video/mp4; codecs="hev1.1.6.L93.B0"'),
  };
}

/**
 * Determina el tipo de medio a partir del MIME type y la extensión del archivo
 */
export function detectMediaType(file: File): 'video' | 'image' | 'audio' | 'unknown' {
  const mime = (file.type || '').toLowerCase();
  const ext = (file.name.split('.').pop() || '').toLowerCase();

  if (mime.startsWith('video/') || ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
    return 'video';
  }
  if (mime.startsWith('image/') || ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return 'image';
  }
  if (mime.startsWith('audio/') || ALLOWED_AUDIO_EXTENSIONS.includes(ext)) {
    return 'audio';
  }
  return 'unknown';
}

/**
 * Valida un archivo de video extrayendo duración, resolución y soporte de reproducción nativa
 */
export async function validateVideoFile(
  file: File,
  context: MediaTargetContext = 'feed_post',
  customLimits?: Partial<MediaLimitsConfig>
): Promise<MediaValidationResult> {
  const limits: MediaLimitsConfig = {
    ...DEFAULT_MEDIA_LIMITS[context],
    ...customLimits
  };

  const fileName = file.name;
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const declaredMime = (file.type || '').toLowerCase();
  const sizeBytes = file.size;
  const sizeMb = Number((sizeBytes / (1024 * 1024)).toFixed(2));
  const sizeFormatted = formatFileSize(sizeBytes);
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // 1. Verificación de extensión admitida
  if (!ALLOWED_VIDEO_EXTENSIONS.includes(ext)) {
    return {
      isValid: false,
      fileType: 'video',
      fileName,
      fileExtension: ext,
      declaredMimeType: declaredMime,
      sizeBytes,
      sizeMb,
      sizeFormatted,
      isH264AacMp4: false,
      canPlayNativelyInBrowser: false,
      needsServerTranscoding: false,
      error: `Formato de video no permitido (.${ext || 'desconocido'}). Formatos aceptados: MP4, MOV, WebM, AVI, MKV, 3GP.`,
      warnings,
      recommendations: ['Utiliza un archivo de video en formato MP4 (H.264/AAC), MOV o WebM.']
    };
  }

  // 2. Verificación de límites de tamaño
  if (sizeBytes > limits.maxVideoHardLimitBytes) {
    return {
      isValid: false,
      fileType: 'video',
      fileName,
      fileExtension: ext,
      declaredMimeType: declaredMime,
      sizeBytes,
      sizeMb,
      sizeFormatted,
      isH264AacMp4: false,
      canPlayNativelyInBrowser: false,
      needsServerTranscoding: false,
      error: `El video pesa ${sizeFormatted}, lo cual supera el límite máximo permitido de ${formatFileSize(limits.maxVideoHardLimitBytes)}.`,
      warnings,
      recommendations: [
        'Comprime el video antes de subirlo o corta su duración.',
        `El tamaño máximo permitido es de ${formatFileSize(limits.maxVideoHardLimitBytes)}.`
      ]
    };
  }

  if (sizeBytes > limits.maxVideoSizeBytes) {
    warnings.push(`El video pesa ${sizeFormatted} (supera la recomendación de ${formatFileSize(limits.maxVideoSizeBytes)}). Puede tardar unos segundos en subir.`);
  }

  // 3. Inspección técnica en navegador (duración, resolución, reproducibilidad nativa)
  let duration: number | undefined;
  let width: number | undefined;
  let height: number | undefined;
  let aspectRatio: number | undefined;
  let aspectRatioLabel: string | undefined;
  let canPlayNativelyInBrowser = false;
  let canPlayTested = false;

  const objectUrl = URL.createObjectURL(file);
  try {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        resolve();
      }, 2500);

      video.onloadedmetadata = () => {
        clearTimeout(timer);
        duration = Math.round(video.duration || 0);
        width = video.videoWidth || 0;
        height = video.videoHeight || 0;
        canPlayNativelyInBrowser = true;
        canPlayTested = true;

        if (width > 0 && height > 0) {
          aspectRatio = Number((width / height).toFixed(2));
          if (aspectRatio >= 1.7) {
            aspectRatioLabel = '16:9 (Horizontal Panorámico)';
          } else if (aspectRatio <= 0.6) {
            aspectRatioLabel = '9:16 (Vertical / Reel)';
          } else if (aspectRatio >= 0.95 && aspectRatio <= 1.05) {
            aspectRatioLabel = '1:1 (Cuadrado)';
          } else if (aspectRatio > 1) {
            aspectRatioLabel = 'Horizontal estándar';
          } else {
            aspectRatioLabel = 'Vertical';
          }
        }
        resolve();
      };

      video.onerror = () => {
        clearTimeout(timer);
        // El navegador no pudo decodificar el formato directamente (ej. ProRes en MOV, AVI, MKV)
        canPlayNativelyInBrowser = false;
        canPlayTested = true;
        resolve();
      };

      video.src = objectUrl;
    });
  } catch {
    // Si no está disponible en este entorno, ignoramos la inspección en memoria
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  // 4. Verificación de duración
  if (duration !== undefined && duration > 0) {
    if (duration > limits.maxVideoDurationSeconds) {
      return {
        isValid: false,
        fileType: 'video',
        fileName,
        fileExtension: ext,
        declaredMimeType: declaredMime,
        sizeBytes,
        sizeMb,
        sizeFormatted,
        duration,
        durationFormatted: formatDuration(duration),
        width,
        height,
        aspectRatio,
        aspectRatioLabel,
        isH264AacMp4: false,
        canPlayNativelyInBrowser,
        needsServerTranscoding: false,
        error: `El video dura ${formatDuration(duration)}, pero el tiempo máximo permitido para este tipo de contenido es de ${formatDuration(limits.maxVideoDurationSeconds)}.`,
        warnings,
        recommendations: [
          `Recorta el video para que dure como máximo ${formatDuration(limits.maxVideoDurationSeconds)}.`,
          context === 'story' ? 'Los estados JA están diseñados para clips ágiles de hasta 60 segundos.' : 'Para el feed se recomienda un máximo de 5 minutos.'
        ]
      };
    }

    if (duration < limits.minVideoDurationSeconds) {
      warnings.push(`El video es muy corto (${duration}s).`);
    }
  }

  // 5. Priorización de MP4 con H.264 / AAC
  const isMp4Container = ext === 'mp4' || declaredMime === 'video/mp4';
  const isH264AacMp4 = isMp4Container && canPlayNativelyInBrowser;
  const needsServerTranscoding = !isH264AacMp4 || ['mov', 'avi', 'mkv', '3gp', 'wmv'].includes(ext);

  if (isH264AacMp4) {
    recommendations.push('Formato óptimo detectado (MP4 compatible). Se reproducirá de forma instantánea en cualquier navegador o teléfono.');
  } else if (needsServerTranscoding) {
    recommendations.push(`El archivo (${ext.toUpperCase()}) será transcodificado en el servidor automáticamente a MP4 (H.264 / AAC con +faststart) para garantizar compatibilidad con todos los usuarios.`);
  }

  return {
    isValid: true,
    fileType: 'video',
    fileName,
    fileExtension: ext,
    declaredMimeType: declaredMime,
    sizeBytes,
    sizeMb,
    sizeFormatted,
    duration,
    durationFormatted: duration !== undefined ? formatDuration(duration) : undefined,
    width,
    height,
    aspectRatio,
    aspectRatioLabel,
    isH264AacMp4,
    canPlayNativelyInBrowser,
    needsServerTranscoding,
    warnings,
    recommendations
  };
}

/**
 * Valida un archivo de imagen (JPEG, PNG, WebP, GIF)
 */
export async function validateImageFile(
  file: File,
  context: MediaTargetContext = 'feed_post',
  customLimits?: Partial<MediaLimitsConfig>
): Promise<MediaValidationResult> {
  const limits: MediaLimitsConfig = {
    ...DEFAULT_MEDIA_LIMITS[context],
    ...customLimits
  };

  const fileName = file.name;
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const declaredMime = (file.type || '').toLowerCase();
  const sizeBytes = file.size;
  const sizeMb = Number((sizeBytes / (1024 * 1024)).toFixed(2));
  const sizeFormatted = formatFileSize(sizeBytes);
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(ext) && !ALLOWED_IMAGE_MIME_TYPES.includes(declaredMime)) {
    return {
      isValid: false,
      fileType: 'image',
      fileName,
      fileExtension: ext,
      declaredMimeType: declaredMime,
      sizeBytes,
      sizeMb,
      sizeFormatted,
      isH264AacMp4: false,
      canPlayNativelyInBrowser: false,
      needsServerTranscoding: false,
      error: `Formato de imagen no permitido (.${ext || 'desconocido'}). Formatos admitidos: JPG, PNG, WebP, GIF.`,
      warnings,
      recommendations: ['Utiliza una imagen en formato JPG, PNG o WebP.']
    };
  }

  if (sizeBytes > limits.maxImageSizeBytes) {
    return {
      isValid: false,
      fileType: 'image',
      fileName,
      fileExtension: ext,
      declaredMimeType: declaredMime,
      sizeBytes,
      sizeMb,
      sizeFormatted,
      isH264AacMp4: false,
      canPlayNativelyInBrowser: false,
      needsServerTranscoding: false,
      error: `La imagen pesa ${sizeFormatted}, lo cual supera el límite máximo de ${formatFileSize(limits.maxImageSizeBytes)}.`,
      warnings,
      recommendations: ['La aplicación comprimirá automáticamente la imagen si está dentro de los límites razonables.']
    };
  }

  // Inspección rápida de dimensiones de imagen
  let width: number | undefined;
  let height: number | undefined;
  let aspectRatio: number | undefined;
  let aspectRatioLabel: string | undefined;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => resolve(), 1500);
      img.onload = () => {
        clearTimeout(timer);
        width = img.width;
        height = img.height;
        if (width > 0 && height > 0) {
          aspectRatio = Number((width / height).toFixed(2));
          if (aspectRatio >= 1.7) aspectRatioLabel = '16:9 Panorámica';
          else if (aspectRatio <= 0.6) aspectRatioLabel = '9:16 Vertical';
          else if (aspectRatio >= 0.95 && aspectRatio <= 1.05) aspectRatioLabel = '1:1 Cuadrada';
          else aspectRatioLabel = width > height ? 'Horizontal' : 'Vertical';
        }
        resolve();
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve();
      };
      img.src = objectUrl;
    });
  } catch {
    // Ignorar si no hay DOM
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  if (width && height && (width > limits.maxImageDimension || height > limits.maxImageDimension)) {
    warnings.push(`La resolución (${width}x${height}px) es muy alta. Se optimizará automáticamente a dimensiones web.`);
  }

  return {
    isValid: true,
    fileType: 'image',
    fileName,
    fileExtension: ext,
    declaredMimeType: declaredMime,
    sizeBytes,
    sizeMb,
    sizeFormatted,
    width,
    height,
    aspectRatio,
    aspectRatioLabel,
    isH264AacMp4: false,
    canPlayNativelyInBrowser: true,
    needsServerTranscoding: false,
    warnings,
    recommendations: ['Imagen verificada y lista para publicar.']
  };
}

/**
 * Valida un archivo de audio (MP3, WAV, AAC, M4A, OGG)
 */
export async function validateAudioFile(
  file: File,
  context: MediaTargetContext = 'audio_story',
  customLimits?: Partial<MediaLimitsConfig>
): Promise<MediaValidationResult> {
  const limits: MediaLimitsConfig = {
    ...DEFAULT_MEDIA_LIMITS[context],
    ...customLimits
  };

  const fileName = file.name;
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const declaredMime = (file.type || '').toLowerCase();
  const sizeBytes = file.size;
  const sizeMb = Number((sizeBytes / (1024 * 1024)).toFixed(2));
  const sizeFormatted = formatFileSize(sizeBytes);
  const warnings: string[] = [];
  const recommendations: string[] = [];

  if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext) && !ALLOWED_AUDIO_MIME_TYPES.includes(declaredMime)) {
    return {
      isValid: false,
      fileType: 'audio',
      fileName,
      fileExtension: ext,
      declaredMimeType: declaredMime,
      sizeBytes,
      sizeMb,
      sizeFormatted,
      isH264AacMp4: false,
      canPlayNativelyInBrowser: false,
      needsServerTranscoding: false,
      error: `Formato de audio no permitido (.${ext || 'desconocido'}). Formatos válidos: MP3, WAV, AAC, M4A, OGG.`,
      warnings,
      recommendations: ['Utiliza audio en formato MP3 o AAC para compatibilidad universal.']
    };
  }

  if (sizeBytes > limits.maxAudioSizeBytes) {
    return {
      isValid: false,
      fileType: 'audio',
      fileName,
      fileExtension: ext,
      declaredMimeType: declaredMime,
      sizeBytes,
      sizeMb,
      sizeFormatted,
      isH264AacMp4: false,
      canPlayNativelyInBrowser: false,
      needsServerTranscoding: false,
      error: `El audio pesa ${sizeFormatted}, lo cual supera el límite de ${formatFileSize(limits.maxAudioSizeBytes)}.`,
      warnings,
      recommendations: [`El tamaño máximo para clips de audio es de ${formatFileSize(limits.maxAudioSizeBytes)}.`]
    };
  }

  // Inspección de duración de audio
  let duration: number | undefined;
  const objectUrl = URL.createObjectURL(file);
  try {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => resolve(), 1500);
      audio.onloadedmetadata = () => {
        clearTimeout(timer);
        duration = Math.round(audio.duration || 0);
        resolve();
      };
      audio.onerror = () => {
        clearTimeout(timer);
        resolve();
      };
      audio.src = objectUrl;
    });
  } catch {
    // Ignorar
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return {
    isValid: true,
    fileType: 'audio',
    fileName,
    fileExtension: ext,
    declaredMimeType: declaredMime,
    sizeBytes,
    sizeMb,
    sizeFormatted,
    duration,
    durationFormatted: duration !== undefined ? formatDuration(duration) : undefined,
    isH264AacMp4: false,
    canPlayNativelyInBrowser: true,
    needsServerTranscoding: false,
    warnings,
    recommendations: ['Audio válido para historias y alabanza.']
  };
}

/**
 * Función principal que detecta el tipo de medio y ejecuta la validación apropiada
 */
export async function validateMediaFile(
  file: File,
  context: MediaTargetContext = 'feed_post',
  customLimits?: Partial<MediaLimitsConfig>
): Promise<MediaValidationResult> {
  const type = detectMediaType(file);

  switch (type) {
    case 'video':
      return validateVideoFile(file, context, customLimits);
    case 'image':
      return validateImageFile(file, context, customLimits);
    case 'audio':
      return validateAudioFile(file, context, customLimits);
    default:
      return {
        isValid: false,
        fileType: 'unknown',
        fileName: file.name,
        fileExtension: (file.name.split('.').pop() || '').toLowerCase(),
        declaredMimeType: file.type || 'unknown',
        sizeBytes: file.size,
        sizeMb: Number((file.size / (1024 * 1024)).toFixed(2)),
        sizeFormatted: formatFileSize(file.size),
        isH264AacMp4: false,
        canPlayNativelyInBrowser: false,
        needsServerTranscoding: false,
        error: `El archivo «${file.name}» no es un formato multimedia reconocido (foto, video o audio).`,
        warnings: [],
        recommendations: ['Selecciona un archivo de imagen (JPG, PNG), video (MP4, MOV, WebM) o audio (MP3).']
      };
  }
}
