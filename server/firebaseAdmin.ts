import admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';

let firebaseApp: admin.app.App | null = null;

const isFirebaseConfigured = (): boolean => {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
};

if (isFirebaseConfigured()) {
  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
    console.log('Firebase Admin SDK initialized');
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error);
  }
}

export async function verifyFirebaseToken(idToken: string): Promise<DecodedIdToken | null> {
  if (!firebaseApp) {
    console.warn('Firebase Admin not configured');
    return null;
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function getFirebaseAdmin(): admin.app.App | null {
  return firebaseApp;
}

export { isFirebaseConfigured };
