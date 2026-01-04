import admin from 'firebase-admin';

interface DecodedToken {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

let firebaseApp: admin.app.App | null = null;

function initializeFirebase(): boolean {
  if (firebaseApp) return true;
  
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  
  if (!projectId) {
    return false;
  }
  
  try {
    firebaseApp = admin.initializeApp({
      projectId: projectId,
    });
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    return false;
  }
}

export function isFirebaseConfigured(): boolean {
  return initializeFirebase();
}

export async function verifyFirebaseToken(idToken: string): Promise<DecodedToken | null> {
  if (!initializeFirebase() || !firebaseApp) {
    return null;
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0],
      picture: decodedToken.picture
    };
  } catch (error) {
    console.error('Failed to verify Firebase token:', error);
    return null;
  }
}
