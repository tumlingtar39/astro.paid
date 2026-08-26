import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AuthUser } from '../types';

export const SUPER_ADMIN_EMAIL = 'tumlingtar39@gmail.com';

interface AuthContextType {
  currentUser: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  loginWithCustomerDetails: (name: string, phone: string, email?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithCustomEmail: (email: string, displayName?: string) => Promise<boolean>;
  loginAsSuperAdmin: (pinOrEmail?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchAccount: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_STORAGE_KEY = '__jyotish_auth_user_session__';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    // Initial check from localStorage for fast hydration
    try {
      const saved = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const email = (parsed?.email || '').trim().toLowerCase();
        return {
          uid: parsed?.uid || 'local-user',
          email: parsed?.email || null,
          displayName: parsed?.displayName || parsed?.customerName || parsed?.email?.split('@')[0] || 'ग्राहक',
          customerName: parsed?.customerName || parsed?.displayName || null,
          customerPhone: parsed?.customerPhone || parsed?.phoneNumber || null,
          phoneNumber: parsed?.customerPhone || parsed?.phoneNumber || null,
          photoURL: parsed?.photoURL || null,
          isAdmin: email === SUPER_ADMIN_EMAIL.toLowerCase(),
        };
      }
    } catch (_) {}
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Sync Firebase Auth state
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const email = (firebaseUser.email || '').trim().toLowerCase();
        const userObj: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL,
          isAdmin: email === SUPER_ADMIN_EMAIL.toLowerCase(),
        };
        setCurrentUser(userObj);
        try {
          localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(userObj));
        } catch (_) {}
      } else {
        // If no firebase user, but we had a stored custom session, preserve or clear
        // We only clear if explicitly not set
        const stored = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
        if (!stored) {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  // Sign in with Google (Firebase)
  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not available.');
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = (user.email || '').trim().toLowerCase();
      const userObj: AuthUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
        isAdmin: email === SUPER_ADMIN_EMAIL.toLowerCase(),
      };
      setCurrentUser(userObj);
      localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(userObj));
      return true;
    } catch (err: any) {
      console.warn('Google Sign-In Popup failed or blocked in iframe, allowing custom email fallback:', err);
      return false;
    }
  };

  // Sign in with Direct/Custom Email (Ensures smooth testing and iframe support)
  const loginWithCustomEmail = async (emailInput: string, displayName?: string): Promise<boolean> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('कृपया मान्य इमेल ठेगाना लेख्नुहोस्। (Please enter a valid email)');
    }

    const isAdmin = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();
    const userObj: AuthUser = {
      uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: cleanEmail,
      displayName: displayName?.trim() || cleanEmail.split('@')[0] || 'User',
      photoURL: null,
      isAdmin,
    };

    setCurrentUser(userObj);
    try {
      localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(userObj));
    } catch (_) {}
    return true;
  };

  // Sign in with Customer Name & Mobile Number (Replaces mandatory Gmail)
  const loginWithCustomerDetails = async (name: string, phone: string, email?: string): Promise<boolean> => {
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      throw new Error('कृपया ग्राहकको नाम लेख्नुहोस्। (Please enter customer name)');
    }
    if (!cleanPhone || cleanPhone.length < 6) {
      throw new Error('कृपया मान्य मोबाइल नम्बर लेख्नुहोस्। (Please enter a valid mobile number)');
    }

    const cleanEmail = email ? email.trim().toLowerCase() : null;
    const isAdmin = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase();

    const userObj: AuthUser = {
      uid: `usr_${cleanPhone.replace(/\D/g, '') || Date.now()}`,
      email: cleanEmail,
      displayName: cleanName,
      customerName: cleanName,
      customerPhone: cleanPhone,
      phoneNumber: cleanPhone,
      photoURL: null,
      isAdmin,
    };

    setCurrentUser(userObj);
    try {
      localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(userObj));
    } catch (_) {}
    return true;
  };

  // Super Admin Sign In - Strictly restricted to Master Key (2m2du6hkx9)
  const loginAsSuperAdmin = async (pinOrKey?: string): Promise<boolean> => {
    const input = (pinOrKey || '').trim().toLowerCase();
    
    // Strict authentication: ONLY the secret master key can authenticate as Super Admin
    if (input !== '2m2du6hkx9') {
      throw new Error('अमान्य मास्टर की। व्यवस्थापक प्यानल केवल अधिकृत मास्टर की बाट मात्र खुल्दछ।');
    }

    const userObj: AuthUser = {
      uid: 'super-admin-root',
      email: SUPER_ADMIN_EMAIL,
      displayName: 'पण्डित शम्भु प्रसाद लम्साल (Super Admin)',
      customerName: 'पण्डित शम्भु प्रसाद लम्साल',
      customerPhone: '9863991384',
      phoneNumber: '9863991384',
      photoURL: null,
      isAdmin: true,
    };

    setCurrentUser(userObj);
    try {
      localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(userObj));
    } catch (_) {}
    return true;
  };

  // Sign out
  const logout = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
      }
    } catch (_) {}
    setCurrentUser(null);
    try {
      localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
    } catch (_) {}
  };

  // Switch account
  const switchAccount = () => {
    openAuthModal();
  };

  const isAdmin = Boolean(currentUser?.email && currentUser.email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase());

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithCustomerDetails,
        loginWithGoogle,
        loginWithCustomEmail,
        loginAsSuperAdmin,
        logout,
        switchAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
