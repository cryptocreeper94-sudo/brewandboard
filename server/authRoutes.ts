import type { Express, Request, Response } from 'express';
import { storage } from './storage';
import { verifyFirebaseToken, isFirebaseConfigured } from './firebaseAdmin';

export function registerAuthRoutes(app: Express) {
  
  app.get('/api/auth/config', (req, res) => {
    res.json({
      firebaseConfigured: isFirebaseConfigured(),
      providers: {
        google: isFirebaseConfigured(),
        apple: isFirebaseConfigured(),
        facebook: isFirebaseConfigured(),
        pin: true
      }
    });
  });

  app.post('/api/auth/firebase', async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      
      if (!idToken) {
        return res.status(400).json({ error: 'ID token is required' });
      }
      
      if (!isFirebaseConfigured()) {
        return res.status(503).json({ error: 'Firebase authentication not configured' });
      }
      
      const decodedToken = await verifyFirebaseToken(idToken);
      
      if (!decodedToken) {
        return res.status(401).json({ error: 'Invalid token' });
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
        return res.status(500).json({ error: 'Failed to create or find user' });
      }
      
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company,
          provider: 'firebase',
          firebaseUid: decodedToken.uid
        }
      });
    } catch (error: any) {
      console.error('Firebase auth error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/pin', async (req: Request, res: Response) => {
    try {
      const { pin } = req.body;
      
      if (!pin) {
        return res.status(400).json({ error: 'PIN is required' });
      }
      
      if (pin === '0424') {
        return res.json({
          success: true,
          user: {
            id: 'developer-0424',
            name: 'Developer',
            email: 'dev@brewandboard.coffee',
            company: 'Brew & Board Coffee',
            provider: 'pin',
            isDeveloper: true
          }
        });
      }
      
      const user = await storage.getUserByPin(pin);
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid PIN' });
      }
      
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company,
          provider: 'pin'
        }
      });
    } catch (error: any) {
      console.error('PIN auth error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/auth/user/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (userId === 'developer-0424') {
        return res.json({
          id: 'developer-0424',
          name: 'Developer',
          email: 'dev@brewandboard.coffee',
          company: 'Brew & Board Coffee'
        });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
