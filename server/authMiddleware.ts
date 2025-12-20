import type { Request, Response, NextFunction } from 'express';
import { verifyFirebaseToken, isFirebaseConfigured } from './firebaseAdmin';
import { storage } from './storage';

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email?: string;
        name?: string;
        provider: 'firebase' | 'pin';
        firebaseUid?: string;
      };
    }
  }
}

export async function authenticateFirebase(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No authorization token provided' });
    return;
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  
  if (!isFirebaseConfigured()) {
    res.status(503).json({ error: 'Authentication service not configured' });
    return;
  }
  
  const decodedToken = await verifyFirebaseToken(idToken);
  
  if (!decodedToken) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
  
  let user = await storage.getUserByEmail(decodedToken.email || '');
  
  if (!user && decodedToken.email) {
    user = await storage.createUser({
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email.split('@')[0],
      pin: null
    });
  }
  
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }
  
  req.authUser = {
    id: user.id,
    email: user.email || undefined,
    name: user.name || undefined,
    provider: 'firebase',
    firebaseUid: decodedToken.uid
  };
  
  next();
}

export async function authenticateOptional(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }
  
  const idToken = authHeader.split('Bearer ')[1];
  
  if (isFirebaseConfigured()) {
    const decodedToken = await verifyFirebaseToken(idToken);
    
    if (decodedToken && decodedToken.email) {
      const user = await storage.getUserByEmail(decodedToken.email);
      
      if (user) {
        req.authUser = {
          id: user.id,
          email: user.email || undefined,
          name: user.name || undefined,
          provider: 'firebase',
          firebaseUid: decodedToken.uid
        };
      }
    }
  }
  
  next();
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.authUser) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  next();
}
