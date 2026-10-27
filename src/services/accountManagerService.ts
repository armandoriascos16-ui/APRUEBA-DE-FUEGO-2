import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from '../types';

export interface SessionAccount {
  uid: string;
  email: string;
  displayName: string;
  username?: string;
  photoURL?: string;
  slot: 1 | 2;
  lastActive: string;
  providerId?: string; // 'google.com' | 'password'
}

const SESSIONS_STORAGE_KEY = 'apdf_auth_sessions_v2';
const ACTIVE_SESSION_KEY = 'apdf_active_session_uid';
const MAX_SESSIONS = 2;

/**
 * Obtiene las cuentas/sesiones autorizadas guardadas en este dispositivo (máx. 2).
 */
export function getSavedSessions(): SessionAccount[] {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.slice(0, MAX_SESSIONS);
    }
  } catch (err) {
    console.warn('Error al leer sesiones guardadas:', err);
  }
  return [];
}

/**
 * Guarda o actualiza una sesión en el dispositivo, asegurando el límite estricto de 2 cuentas.
 */
export function saveSession(account: SessionAccount): { success: boolean; sessions: SessionAccount[]; message?: string } {
  try {
    const currentSessions = getSavedSessions();
    const existingIndex = currentSessions.findIndex(
      s => s.uid === account.uid || (account.email && s.email.toLowerCase() === account.email.toLowerCase())
    );

    if (existingIndex >= 0) {
      // Actualizar sesión existente
      const updated = [...currentSessions];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...account,
        slot: account.slot || updated[existingIndex].slot || ((existingIndex === 0) ? 1 : 2),
        lastActive: new Date().toISOString()
      };
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      return { success: true, sessions: updated };
    }

    // Si no existe y ya hay 2 cuentas guardadas, bloquear
    if (currentSessions.length >= MAX_SESSIONS) {
      return {
        success: false,
        sessions: currentSessions,
        message: 'Límite de 2 cuentas alcanzado en este dispositivo. Para agregar otra, primero quita una de la lista.'
      };
    }

    // Determinar slot disponible (1 o 2)
    const hasSlot1 = currentSessions.some(s => s.slot === 1);
    const assignedSlot: 1 | 2 = account.slot || (hasSlot1 ? 2 : 1);

    const newSession: SessionAccount = {
      ...account,
      slot: assignedSlot,
      lastActive: new Date().toISOString()
    };

    const nextSessions = [...currentSessions, newSession];
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(nextSessions));
    return { success: true, sessions: nextSessions };
  } catch (err) {
    console.error('Error al guardar sesión:', err);
    return { success: false, sessions: getSavedSessions(), message: 'Error al persistir la sesión.' };
  }
}

/**
 * Elimina una sesión del dispositivo (sin tocar datos de la base de datos).
 */
export function removeSession(uid: string): SessionAccount[] {
  try {
    const current = getSavedSessions();
    const filtered = current.filter(s => s.uid !== uid);
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered));

    // Si la sesión activa fue la eliminada, cambiar a la otra disponible si existe
    const activeUid = getActiveSessionUid();
    if (activeUid === uid) {
      if (filtered.length > 0) {
        setActiveSessionUid(filtered[0].uid);
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    }
    return filtered;
  } catch (err) {
    console.error('Error al remover sesión:', err);
    return getSavedSessions();
  }
}

/**
 * Obtiene el UID de la sesión activa en el dispositivo.
 */
export function getActiveSessionUid(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch {
    return null;
  }
}

/**
 * Establece el UID de la sesión activa.
 */
export function setActiveSessionUid(uid: string): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, uid);
    localStorage.setItem('apdf_current_user_id', uid);
  } catch (err) {
    console.warn('Error al actualizar UID activo:', err);
  }
}

/**
 * Carga el perfil real del usuario desde Firestore asegurando aislamiento total de datos.
 */
export async function fetchUserProfileByUid(uid: string): Promise<User | null> {
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as User;
    }
  } catch (err) {
    console.warn('Error al cargar perfil desde Firestore para UID:', uid, err);
  }
  return null;
}
