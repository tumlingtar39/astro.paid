import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocFromServer,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { db, auth } from './firebase';
import { KundaliInput, KundaliResult } from '../types';

export interface CloudKundaliRecord {
  id: string;
  timestamp: number;
  input: KundaliInput;
  result: KundaliResult;
  userId?: string;
  createdAt?: any;
  updatedAt?: any;
  notes?: string;
}

// 1. Connection Health Check as specified in Firebase guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) {
    console.warn('Firestore instance not available.');
    return false;
  }
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection verified successfully.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / configuration notice:', error.message);
    } else {
      console.info('Firestore ping note (normal if test doc is empty):', error);
    }
    return false;
  }
}

// Run initial connection test on module load
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testFirestoreConnection().catch(() => {});
  }, 1000);
}

// 2. Authentication Helper Functions
export async function loginWithGoogle(): Promise<User | null> {
  if (!auth) throw new Error('Firebase Auth not initialized');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  
  // Save user profile to Firestore
  if (db && result.user) {
    try {
      const userRef = doc(db, 'users', result.user.uid);
      await setDoc(
        userRef,
        {
          id: result.user.uid,
          displayName: result.user.displayName || 'Astrologer User',
          email: result.user.email || '',
          photoURL: result.user.photoURL || '',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Could not save user profile document:', e);
    }
  }
  return result.user;
}

export async function loginAnonymously(): Promise<User | null> {
  if (!auth) throw new Error('Firebase Auth not initialized');
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

export function onAuthStatusChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// 3. Kundali Cloud Storage Functions
export async function saveKundaliToCloud(
  input: KundaliInput,
  result: KundaliResult,
  userUid?: string
): Promise<CloudKundaliRecord> {
  const id = `k_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: CloudKundaliRecord = {
    id,
    timestamp: Date.now(),
    input,
    result,
    userId: userUid || 'anonymous',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!db) {
    console.warn('Firestore not ready, returning local record');
    return record;
  }

  try {
    if (userUid && userUid !== 'anonymous') {
      // Save under user's private collection
      const userKundaliRef = doc(db, 'users', userUid, 'kundalis', id);
      await setDoc(userKundaliRef, record);
    } else {
      // Save to general collection
      const kundaliRef = doc(db, 'kundalis', id);
      await setDoc(kundaliRef, record);
    }
    console.log(`Kundali saved to Firestore successfully (ID: ${id})`);
  } catch (error) {
    console.error('Error saving kundali to Firestore:', error);
    throw error;
  }

  return record;
}

export async function fetchUserKundalisFromCloud(userUid?: string): Promise<CloudKundaliRecord[]> {
  if (!db) return [];
  const records: CloudKundaliRecord[] = [];

  try {
    if (userUid && userUid !== 'anonymous') {
      const q = collection(db, 'users', userUid, 'kundalis');
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnap) => {
        records.push(docSnap.data() as CloudKundaliRecord);
      });
    } else {
      // Get recent public/guest kundalis
      const q = query(collection(db, 'kundalis'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((docSnap) => {
        records.push(docSnap.data() as CloudKundaliRecord);
      });
    }
    records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  } catch (error) {
    console.warn('Error fetching kundalis from Firestore:', error);
  }

  return records;
}

export async function deleteKundaliFromCloud(id: string, userUid?: string): Promise<void> {
  if (!db) return;
  try {
    if (userUid && userUid !== 'anonymous') {
      await deleteDoc(doc(db, 'users', userUid, 'kundalis', id));
    } else {
      await deleteDoc(doc(db, 'kundalis', id));
    }
    console.log(`Kundali ${id} deleted from Firestore`);
  } catch (error) {
    console.error('Error deleting kundali from Firestore:', error);
    throw error;
  }
}
