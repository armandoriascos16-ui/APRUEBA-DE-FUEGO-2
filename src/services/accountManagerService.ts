import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { User, SavedAccount } from '../types';

export interface SessionAccount {
  uid: string;
  id?: string;
  email: string;
  displayName: string;
  name?: string;
  username?: string;
  photoURL?: string;
  avatar?: string;
  church?: string;
  city?: string;
  country?: string;
  points?: number;
  level?: number;
  levelName?: string;
  role?: string;
  slot: 1 | 2;
  lastActive: string;
  providerId?: string; // 'google.com' | 'password'
}

const SESSIONS_STORAGE_KEY = 'apdf_auth_sessions_v2';
const SAVED_ACCOUNTS_KEY = 'apdf_saved_accounts';
const ACTIVE_SESSION_KEY = 'apdf_active_session_uid';
const MAX_SESSIONS = 2;

/**
 * Normaliza una cuenta asegurando compatibilidad cruzada entre SessionAccount y SavedAccount.
 */
function normalizeSession(raw: any, defaultSlot: 1 | 2 = 1): SessionAccount {
  const uid = raw.uid || raw.id || '';
  const email = raw.email || '';
  const displayName = raw.displayName || raw.name || 'Joven Cristiano';
  const avatar = raw.avatar || raw.photoURL || '';

  return {
    uid,
    id: uid,
    email,
    displayName,
    name: displayName,
    username: raw.username || (email ? email.split('@')[0] : `joven_${uid.slice(0, 5)}`),
    photoURL: avatar,
    avatar: avatar,
    church: raw.church || 'Iglesia Adventista del Séptimo Día',
    city: raw.city || 'Bogotá',
    country: raw.country || 'Colombia',
    points: typeof raw.points === 'number' ? raw.points : 0,
    level: typeof raw.level === 'number' ? raw.level : 1,
    levelName: raw.levelName || 'Explorador de la Fe',
    role: raw.role || 'user',
    slot: raw.slot === 2 ? 2 : defaultSlot,
    lastActive: raw.lastActive || new Date().toISOString(),
    providerId: raw.providerId || 'google.com'
  };
}

/**
 * Obtiene las cuentas/sesiones autorizadas guardadas en este dispositivo (máx. 2),
 * fusionando de forma segura ambos almacenamientos locales para no perder ninguna cuenta.
 */
export function getSavedSessions(): SessionAccount[] {
  try {
    const sessionsMap = new Map<string, SessionAccount>();

    // 1. Leer de SESSIONS_STORAGE_KEY
    const rawSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (rawSessions) {
      try {
        const parsed = JSON.parse(rawSessions);
        if (Array.isArray(parsed)) {
          parsed.forEach((item, idx) => {
            if (item && (item.uid || item.id)) {
              const norm = normalizeSession(item, idx === 0 ? 1 : 2);
              sessionsMap.set(norm.uid, norm);
            }
          });
        }
      } catch (e) {
        console.warn('Error al parsear sesiones:', e);
      }
    }

    // 2. Leer de SAVED_ACCOUNTS_KEY y combinar
    const rawAccounts = localStorage.getItem(SAVED_ACCOUNTS_KEY);
    if (rawAccounts) {
      try {
        const parsed = JSON.parse(rawAccounts);
        if (Array.isArray(parsed)) {
          parsed.forEach((item, idx) => {
            if (item && (item.id || item.uid)) {
              const uid = item.id || item.uid;
              if (sessionsMap.has(uid)) {
                // Merge data
                const existing = sessionsMap.get(uid)!;
                sessionsMap.set(uid, {
                  ...existing,
                  ...normalizeSession(item, existing.slot),
                  slot: existing.slot
                });
              } else if (sessionsMap.size < MAX_SESSIONS) {
                const norm = normalizeSession(item, sessionsMap.size === 0 ? 1 : 2);
                sessionsMap.set(uid, norm);
              }
            }
          });
        }
      } catch (e) {
        console.warn('Error al parsear cuentas guardadas:', e);
      }
    }

    const list = Array.from(sessionsMap.values()).slice(0, MAX_SESSIONS);
    // Asignar slots limpios 1 y 2
    if (list.length > 0) list[0].slot = 1;
    if (list.length > 1) list[1].slot = 2;

    return list;
  } catch (err) {
    console.warn('Error al leer sesiones guardadas:', err);
    return [];
  }
}

/**
 * Guarda o actualiza una sesión en el dispositivo, asegurando el límite estricto de 2 cuentas.
 * Sincroniza atómicamente ambas claves en localStorage.
 */
export function saveSession(account: SessionAccount): { success: boolean; sessions: SessionAccount[]; message?: string } {
  try {
    const currentSessions = getSavedSessions();
    const targetUid = account.uid || account.id || '';
    if (!targetUid) {
      return { success: false, sessions: currentSessions, message: 'UID de cuenta inválido.' };
    }

    const existingIndex = currentSessions.findIndex(
      s => s.uid === targetUid || (account.email && s.email.toLowerCase() === account.email.toLowerCase())
    );

    let updatedSessions: SessionAccount[];

    if (existingIndex >= 0) {
      // Actualizar sesión existente manteniendo su slot
      updatedSessions = [...currentSessions];
      const prevSlot = updatedSessions[existingIndex].slot;
      updatedSessions[existingIndex] = {
        ...updatedSessions[existingIndex],
        ...normalizeSession(account, prevSlot),
        slot: prevSlot,
        lastActive: new Date().toISOString()
      };
    } else {
      // Si ya hay 2 cuentas guardadas y esta es una tercera, bloquear
      if (currentSessions.length >= MAX_SESSIONS) {
        return {
          success: false,
          sessions: currentSessions,
          message: 'Límite de 2 cuentas alcanzado en este dispositivo. Para agregar otra, primero quita una de la lista.'
        };
      }

      // Determinar slot disponible
      const hasSlot1 = currentSessions.some(s => s.slot === 1);
      const assignedSlot: 1 | 2 = hasSlot1 ? 2 : 1;

      const newSession = normalizeSession(account, assignedSlot);
      updatedSessions = [...currentSessions, newSession];
    }

    // Persistir en ambas claves locales para consistencia absoluta
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));

    const savedAccountsFormat: SavedAccount[] = updatedSessions.map(s => ({
      id: s.uid,
      email: s.email,
      name: s.displayName,
      username: s.username,
      avatar: s.photoURL,
      church: s.church,
      points: s.points,
      level: s.level,
      lastActive: s.lastActive,
      slot: s.slot,
      providerId: s.providerId
    }));
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(savedAccountsFormat));

    return { success: true, sessions: updatedSessions };
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
    const filtered = current.filter(s => s.uid !== uid && s.id !== uid);
    
    // Reasignar slot 1 a la cuenta restante si queda una
    if (filtered.length === 1) {
      filtered[0].slot = 1;
    }

    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered));

    const savedAccountsFormat: SavedAccount[] = filtered.map(s => ({
      id: s.uid,
      email: s.email,
      name: s.displayName,
      username: s.username,
      avatar: s.photoURL,
      church: s.church,
      points: s.points,
      level: s.level,
      lastActive: s.lastActive,
      slot: s.slot,
      providerId: s.providerId
    }));
    localStorage.setItem(SAVED_ACCOUNTS_KEY, JSON.stringify(savedAccountsFormat));

    // Si la sesión activa fue la eliminada, cambiar a la otra disponible si existe
    const activeUid = getActiveSessionUid();
    if (activeUid === uid) {
      if (filtered.length > 0) {
        setActiveSessionUid(filtered[0].uid);
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
        localStorage.removeItem('apdf_current_user_id');
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
    return localStorage.getItem(ACTIVE_SESSION_KEY) || localStorage.getItem('apdf_current_user_id');
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
 * Crea un objeto User completo a partir de una sesión guardada para evitar pantallas en blanco.
 */
export function createDefaultProfileFromSession(session: SessionAccount): User {
  const nameParts = (session.displayName || 'Joven Cristiano').split(' ');
  const firstName = nameParts[0] || 'Joven';
  const lastName = nameParts.slice(1).join(' ') || 'Cristiano';

  return {
    id: session.uid,
    name: firstName,
    lastName: lastName,
    username: session.username || (session.email ? session.email.split('@')[0].replace(/\./g, '_') : `joven_${session.uid.slice(0, 5)}`),
    email: session.email,
    avatar: session.photoURL || session.avatar || '',
    emailVerified: true,
    age: 19,
    birthDate: '2007-05-15',
    city: session.city || 'Bogotá',
    country: session.country || 'Colombia',
    church: session.church || 'Iglesia Adventista del Séptimo Día',
    district: 'Distrito Central',
    zone: 'Zona 1',
    isAdventist: true,
    yearsServing: 2,
    ministries: ['Ministerio Juvenil JA'],
    activities: ['trabajar_jovenes'],
    maritalStatus: 'soltero',
    interests: ['Biblia', 'Música', 'Misión'],
    bio: '¡Creciendo en la fe y participando en retos para la gloria de Dios!',
    points: typeof session.points === 'number' ? session.points : 0,
    level: typeof session.level === 'number' ? session.level : 1,
    levelName: session.levelName || 'Explorador de la Fe',
    role: (session.email?.toLowerCase() === 'armandoriascos16@gmail.com' || session.email === 'harmonymusis@gmail.com' || session.email === 'harmonyestampadosr@gmail.com' || session.role === 'admin' || session.role === 'superadmin') ? 'admin' : 'user',
    isOfficialVerified: false,
    badges: [],
    stats: {
      challengesCompleted: 0,
      eventsAttended: 0,
      missionsDone: 0,
      badgesCount: 0,
      prayerStreak: 1,
      bibleReadingStreak: 1,
      activeStreakDays: 1,
    },
    privacy: {
      isProfilePublic: true,
      showLocation: true,
      allowDirectMessages: true,
      allowPrayerMentions: true,
    },
    followingIds: ['admin_official'],
    followerIds: [],
    savedPostIds: [],
    joinedEventIds: [],
    createdAt: session.lastActive || new Date().toISOString(),
    lastActive: new Date().toISOString(),
    isProfileComplete: true,
    loginCount: 1,
  };
}

/**
 * Carga el perfil real del usuario desde Firestore asegurando aislamiento total de datos.
 */
export async function fetchUserProfileByUid(uid: string): Promise<User | null> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as User;
    }
    return null;
  } catch (err: any) {
    const isPermission = err?.code === 'permission-denied' || String(err?.message).includes('insufficient permissions');
    console.error('[Firestore Profile Read Audit]', JSON.stringify({
      operation: 'getDoc',
      collection: 'users',
      documentIdPrefix: uid ? `${uid.slice(0, 6)}...` : 'none',
      isAuthenticated: Boolean(auth.currentUser),
      authUidPrefix: auth.currentUser?.uid ? `${auth.currentUser.uid.slice(0, 6)}...` : 'none',
      errorCategory: isPermission ? 'PERMISSION_DENIED' : 'NETWORK_OR_TRANSPORT',
      code: err?.code || 'unknown',
      message: err?.message || String(err),
      timestamp: new Date().toISOString()
    }));
    throw err;
  }
}
