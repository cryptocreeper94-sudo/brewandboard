import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  OAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey && 
    firebaseConfig.authDomain && 
    firebaseConfig.projectId
  );
};

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');

appleProvider.addScope('email');
appleProvider.addScope('name');

export async function signInWithGoogle(): Promise<{ user: User; idToken: string } | null> {
  if (!auth) {
    console.warn('Firebase Auth not configured');
    return null;
  }
  
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function signInWithFacebook(): Promise<{ user: User; idToken: string } | null> {
  if (!auth) {
    console.warn('Firebase Auth not configured');
    return null;
  }
  
  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (error: any) {
    console.error('Facebook sign-in error:', error);
    throw error;
  }
}

export async function signInWithApple(): Promise<{ user: User; idToken: string } | null> {
  if (!auth) {
    console.warn('Firebase Auth not configured');
    return null;
  }
  
  try {
    const result = await signInWithPopup(auth, appleProvider);
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken };
  } catch (error: any) {
    console.error('Apple sign-in error:', error);
    throw error;
  }
}

export async function firebaseSignOut(): Promise<void> {
  if (!auth) return;
  
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export function onFirebaseAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  
  return onAuthStateChanged(auth, callback);
}

export async function getFirebaseIdToken(): Promise<string | null> {
  if (!auth || !auth.currentUser) return null;
  
  try {
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
}

export { auth, isFirebaseConfigured };
