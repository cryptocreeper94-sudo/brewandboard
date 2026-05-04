/**
 * Axiom Studio — Firebase Admin SDK
 * Verifies Firebase ID tokens on the server.
 * 
 * Uses FIREBASE_SERVICE_ACCOUNT env var (JSON string) or
 * FIREBASE_PROJECT_ID for Application Default Credentials.
 * 
 * DarkWave Studios LLC — Copyright 2026
 */

import admin from "firebase-admin";

let initialized = false;

function initFirebaseAdmin(): admin.app.App {
  if (initialized) return admin.app();

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log("[Firebase Admin] Initialized with service account");
    } catch (err: any) {
      console.error("[Firebase Admin] Failed to parse service account:", err.message);
      // Fallback to project ID only
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "darkwave-auth",
      });
      console.log("[Firebase Admin] Initialized with project ID fallback");
    }
  } else {
    // No service account — use project ID (works for token verification)
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "darkwave-auth",
    });
    console.log("[Firebase Admin] Initialized with project ID (no service account)");
  }

  initialized = true;
  return admin.app();
}

// Initialize on import
initFirebaseAdmin();

/**
 * Verify a Firebase ID token and return the decoded claims.
 * Returns null if the token is invalid.
 */
export async function verifyFirebaseToken(
  idToken: string
): Promise<admin.auth.DecodedIdToken | null> {
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded;
  } catch (err: any) {
    console.error("[Firebase Admin] Token verification failed:", err.message);
    return null;
  }
}

export default admin;
