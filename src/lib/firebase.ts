import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, arrayUnion } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCGiYhVhkfLu7_YAqy02K5P9O1vvriLUfA",
  authDomain: "mithila-catering.firebaseapp.com",
  projectId: "mithila-catering",
  storageBucket: "mithila-catering.firebasestorage.app",
  messagingSenderId: "124823748394",
  appId: "1:124823748394:web:1fb7674865c60726f76853",
  measurementId: "G-G61G1L629Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore error handler as required by skill guidelines
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function logUserActivity(action: string, details?: any) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  try {
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, {
      activities: arrayUnion({
        action,
        details: details || null,
        timestamp: new Date().toISOString()
      })
    }, { merge: true });
  } catch (err) {
    console.error('Failed to log user activity', err);
  }
}
