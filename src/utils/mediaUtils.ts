/**
 * Utilidades para manejo, compresión y optimización de fotos y videos
 * desde la galería del dispositivo para el Feed y los Estados (Stories).
 * Proporciona almacenamiento persistente en disco del servidor (/uploads/)
 * con transcodificación universal (H.264/AAC), extracción de poster y
 * caché durable en IndexedDB para disponibilidad permanente entre sesiones.
 */

import { 
  validateVideoFile, 
  validateImageFile, 
  validateAudioFile, 
  validateMediaFile, 
  MediaValidationResult, 
  MediaTargetContext 
} from '../services/mediaValidationService';

export { 
  validateVideoFile, 
  validateImageFile, 
  validateAudioFile, 
  validateMediaFile 
};
export type { MediaValidationResult, MediaTargetContext };

export interface ProcessedImage {
  dataUrl: string;
  url?: string;
  name: string;
  sizeKb: number;
  width: number;
  height: number;
}

export interface ProcessedVideo {
  url: string;
  name: string;
  sizeMb: number;
  duration?: number;
  width?: number;
  height?: number;
  posterUrl?: string;
  wasConverted?: boolean;
  codec?: string;
  validation?: MediaValidationResult;
}

export interface UploadMediaResult {
  url: string;
  filename: string;
  sizeMb: number;
  posterUrl?: string;
  wasConverted?: boolean;
  duration?: number;
  width?: number;
  height?: number;
  codec?: string;
  mimeType?: string;
}

// ============================================================================
// INDEXEDDB PERSISTENT MEDIA CACHE (Respaldo offline & durabilidad local)
// ============================================================================
const DB_NAME = 'apdf_media_cache_v1';
const STORE_NAME = 'media_blobs';

function getMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB no disponible en este entorno.'));
    }
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMediaBlobToLocalDb(id: string, blob: Blob, meta?: any): Promise<void> {
  try {
    const db = await getMediaDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      id,
      blob,
      meta,
      savedAt: Date.now()
    });
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Advertencia al guardar en IndexedDB local:', err);
  }
}

export async function getMediaBlobFromLocalDb(id: string): Promise<Blob | null> {
  try {
    const db = await getMediaDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result?.blob || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// ============================================================================
// SERVER MEDIA UPLOAD & SAFE DELETION
// ============================================================================

/**
 * Lee un archivo como Data URL (base64)
 */
export function readFileAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Error al leer el archivo en memoria.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Sube un archivo de video o foto al servidor Express (/api/media/upload)
 * El servidor transcodifica videos incompatibles a MP4 (H.264/AAC + faststart),
 * genera un poster thumbnail y devuelve la URL permanente en /uploads/.
 */
export async function uploadMediaFile(
  file: File | Blob, 
  customFilename?: string
): Promise<UploadMediaResult> {
  const filename = customFilename || (file instanceof File ? file.name : `media_${Date.now()}`);
  const dataUrl = await readFileAsDataUrl(file);

  try {
    const res = await fetch('/api/media/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        dataUrl,
        mimeType: file.type || 'application/octet-stream'
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        // También guardar en IndexedDB local por resiliencia
        const mediaId = data.url;
        await saveMediaBlobToLocalDb(mediaId, file, { filename, sizeMb: data.sizeMb });
        return {
          url: data.url,
          filename: data.filename || filename,
          sizeMb: data.sizeMb || Number((file.size / (1024 * 1024)).toFixed(2)),
          posterUrl: data.posterUrl,
          wasConverted: data.wasConverted,
          duration: data.duration,
          width: data.width,
          height: data.height,
          codec: data.codec,
          mimeType: data.mimeType
        };
      }
    }
  } catch (err) {
    console.warn('Aviso: Falló la subida directa al servidor, aplicando respaldo local persistente:', err);
  }

  // Fallback: guardar en IndexedDB y usar objectUrl
  const fallbackId = `local_media_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  await saveMediaBlobToLocalDb(fallbackId, file, { filename });
  const objectUrl = URL.createObjectURL(file);

  return {
    url: objectUrl,
    filename,
    sizeMb: Number((file.size / (1024 * 1024)).toFixed(2))
  };
}

/**
 * Elimina un archivo multimedia de /uploads/ en el servidor de forma segura
 */
export async function deleteMediaFileFromServer(url: string): Promise<boolean> {
  if (!url || !url.startsWith('/uploads/')) return false;
  try {
    const res = await fetch('/api/media/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return res.ok;
  } catch (err) {
    console.warn('Advertencia al eliminar archivo del servidor:', err);
    return false;
  }
}

/**
 * Comprime y redimensiona una imagen desde la galería usando Canvas
 * para que no consuma memoria excesiva y cargue a máxima velocidad.
 */
export async function compressImageFromGallery(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 1200,
  quality: number = 0.72
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular relación de aspecto manteniendo proporciones
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: e.target?.result as string,
            name: file.name,
            sizeKb: Math.round(file.size / 1024),
            width: img.width,
            height: img.height,
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const compressedDataUrl = canvas.toDataURL(mimeType, quality);
        const approxSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

        resolve({
          dataUrl: compressedDataUrl,
          name: file.name,
          sizeKb: approxSizeKb,
          width,
          height,
        });
      };

      img.onerror = () => reject(new Error('No se pudo decodificar la imagen seleccionada de la galería.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo de la galería.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Procesa un archivo de video seleccionado desde la galería.
 * Realiza validación estricta de MIME, tamaño y duración con el servicio especializado,
 * extrae metadatos y lo sube de forma persistente a /uploads/ en el servidor
 * con transcodificación universal (H.264/AAC + faststart).
 */
export async function processVideoFromGallery(
  file: File, 
  context: MediaTargetContext = 'feed_post'
): Promise<ProcessedVideo> {
  // 1. Validar el archivo con el servicio de validación multimedia
  const validation = await validateVideoFile(file, context);
  if (!validation.isValid) {
    throw new Error(validation.error || 'El archivo de video no cumple con los requisitos del reproductor.');
  }

  // 2. Subir persistentemente al servidor y transcodificar si es necesario
  const uploadRes = await uploadMediaFile(file);

  return {
    url: uploadRes.url,
    name: uploadRes.filename,
    sizeMb: uploadRes.sizeMb,
    duration: uploadRes.duration || validation.duration,
    width: uploadRes.width || validation.width,
    height: uploadRes.height || validation.height,
    posterUrl: uploadRes.posterUrl,
    wasConverted: uploadRes.wasConverted,
    codec: uploadRes.codec,
    validation
  };
}

/**
 * Detecta si una URL corresponde a un video o a una imagen.
 */
export function isVideoSource(url?: string, explicitType?: 'image' | 'video'): boolean {
  if (explicitType === 'video') return true;
  if (explicitType === 'image') return false;
  if (!url) return false;

  if (url.startsWith('data:video/')) return true;
  if (url.startsWith('blob:') && explicitType !== 'image') {
    return true;
  }
  const cleanUrl = url.split('?')[0].toLowerCase();
  return (
    cleanUrl.endsWith('.mp4') ||
    cleanUrl.endsWith('.webm') ||
    cleanUrl.endsWith('.mov') ||
    cleanUrl.endsWith('.m4v') ||
    cleanUrl.endsWith('.ogg') ||
    cleanUrl.endsWith('.avi') ||
    cleanUrl.endsWith('.mkv') ||
    cleanUrl.endsWith('.flv') ||
    cleanUrl.endsWith('.wmv') ||
    cleanUrl.endsWith('.3gp') ||
    cleanUrl.includes('video')
  );
}
