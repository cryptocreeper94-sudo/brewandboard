/**
 * Firebase Admin Stub
 * 
 * Firebase has been removed. Authentication now uses native email/password with bcrypt.
 * This file is kept for compatibility but returns null/false for all operations.
 */

export function isFirebaseConfigured(): boolean {
  return false;
}

export async function verifyFirebaseToken(idToken: string): Promise<null> {
  return null;
}
