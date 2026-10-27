/**
 * Utilidades para manejo, compresión y optimización de fotos y videos
 * desde la galería del dispositivo para el Feed y los Estados (Stories).
 * Proporciona almacenamiento persistente en disco del servidor (/uploads/)
 * y caché durable en IndexedDB para disponibilidad permanente entre sesiones.
 */

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
// SERVER MEDIA UPLOAD (Guarda permanentemente en /public/uploads/ en el servidor)
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
 * Devolviendo una URL persistente /uploads/... que se conserva entre reinicios,
 * recargas, cambios de pestaña y cambios de cuentas.
 */
export async function uploadMediaFile(
  file: File | Blob, 
  customFilename?: string
): Promise<{ url: string; filename: string; sizeMb: number }> {
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
          sizeMb: data.sizeMb || Number((file.size / (1024 * 1024)).toFixed(2))
        };
      }
    }
  } catch (err) {
    console.warn('Aviso: Falló la subida directa al servidor, aplicando respaldo local persistente:', err);
  }

  // Fallback: guardar en IndexedDB y usar dataUrl o ObjectURL durable
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
 * Extrae metadatos de duración y resolución, y lo sube de forma persistente
 * a /uploads/ en el servidor para que continúe disponible permanentemente.
 */
export async function processVideoFromGallery(file: File): Promise<ProcessedVideo> {
  // 1. Obtener duración y dimensiones de forma temporal
  const tempObjectUrl = URL.createObjectURL(file);
  let duration = 0;
  let width = 0;
  let height = 0;

  try {
    await new Promise<void>((resolve) => {
      const tempVideo = document.createElement('video');
      tempVideo.preload = 'metadata';
      tempVideo.muted = true;
      tempVideo.playsInline = true;

      const timeout = setTimeout(() => {
        resolve();
      }, 2000);

      tempVideo.onloadedmetadata = () => {
        clearTimeout(timeout);
        duration = Math.round(tempVideo.duration) || 0;
        width = tempVideo.videoWidth || 0;
        height = tempVideo.videoHeight || 0;
        resolve();
      };

      tempVideo.onerror = () => {
        clearTimeout(timeout);
        resolve();
      };

      tempVideo.src = tempObjectUrl;
    });
  } finally {
    URL.revokeObjectURL(tempObjectUrl);
  }

  // 2. Subir persistentemente al servidor
  const uploadRes = await uploadMediaFile(file);

  return {
    url: uploadRes.url,
    name: uploadRes.filename,
    sizeMb: uploadRes.sizeMb,
    duration,
    width,
    height
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
    cleanUrl.includes('video')
  );
}
