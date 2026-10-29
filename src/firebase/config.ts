import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
/* CRITICAL: The app will break without this line */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const createGoogleAuthProvider = (promptSelectAccount: boolean = true) => {
  const provider = new GoogleAuthProvider();
  if (promptSelectAccount) {
    provider.setCustomParameters({
      prompt: 'select_account'
    });
  }
  return provider;
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const isPermission = (error as any)?.code === 'permission-denied' || String(error).includes('insufficient permissions');
  const safeLog = {
    operation: operationType,
    collectionOrPath: path,
    isAuthenticated: Boolean(auth.currentUser),
    uidPrefix: auth.currentUser?.uid ? `${auth.currentUser.uid.slice(0, 6)}...` : 'anonymous',
    errorCategory: isPermission ? 'PERMISSION_DENIED' : 'NETWORK_OR_TRANSPORT',
    code: (error as any)?.code || 'unknown',
  };
  if (isPermission) {
    console.warn('[Firestore Access Notice] Operación denegada por reglas de seguridad:', JSON.stringify(safeLog));
  } else {
    console.info('[Firestore Network Notice] Operación diferida por conexión de red:', JSON.stringify(safeLog));
  }
}

// Connection test
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration.");
    }
    return false;
  }
}
