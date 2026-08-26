import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, initializeFirestore, Firestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';

// Default configuration provided for project astro-guru-91540 with env overrides
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyClHaLnMiukOt1GppFbf_mubvRpZ0vkmoc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'astro-guru-91540.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'astro-guru-91540',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'astro-guru-91540.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '885816368195',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:885816368195:web:30f4c23d7a728a847108f6'
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let appCheck: AppCheck | null = null;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  auth = getAuth(app);

  // Initialize Firestore with ignoreUndefinedProperties to prevent undefined values from crashing writes
  try {
    db = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
    });
  } catch (_initErr) {
    db = getFirestore(app);
  }

  // Ensure an anonymous session is active in browser so Firestore rules always allow reads/writes
  if (typeof window !== 'undefined' && auth) {
    onAuthStateChanged(auth, (user) => {
      if (!user && auth) {
        signInAnonymously(auth).catch((_anonErr) => {
          // Graceful fallback if anonymous sign in is disabled
        });
      }
    });
  }

  // Initialize App Check if configured
  if (typeof window !== 'undefined' && app) {
    const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_KEY;
    if (appCheckSiteKey) {
      try {
        appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(appCheckSiteKey),
          isTokenAutoRefreshEnabled: true,
        });
        console.log('Firebase App Check initialized successfully.');
      } catch (acErr) {
        console.warn('App Check initialization note:', acErr);
      }
    }
  }
} catch (error) {
  console.warn('Firebase initialization note (offline mode will be used):', error);
}

/**
 * Ensure Firebase Auth is ready before making cloud operations
 */
export async function ensureFirebaseAuth(): Promise<void> {
  if (!auth) return;
  if (auth.currentUser) return;
  try {
    await signInAnonymously(auth);
  } catch (_e) {}
}

export { app, auth, db, appCheck, firebaseConfig };
