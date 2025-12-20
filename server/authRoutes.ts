import type { Express, Request, Response } from 'express';
import { storage } from './storage';

export function registerAuthRoutes(app: Express) {
  
  app.get('/api/auth/config', (req, res) => {
    res.json({
      replitAuth: true,
      providers: {
        google: true,
        apple: true,
        github: true,
        pin: true
      }
    });
  });

  app.post('/api/auth/pin', async (req: Request, res: Response) => {
    try {
      const { pin } = req.body;
      
      if (!pin) {
        return res.status(400).json({ error: 'PIN is required' });
      }
      
      // Developer PIN
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

      // David's admin PIN
      if (pin === '2424') {
        return res.json({
          success: true,
          user: {
            id: 'admin-david-2424',
            name: 'David',
            email: 'david@brewandboard.coffee',
            company: 'Brew & Board Coffee',
            provider: 'pin',
            isAdmin: true
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

      if (userId === 'admin-david-2424') {
        return res.json({
          id: 'admin-david-2424',
          name: 'David',
          email: 'david@brewandboard.coffee',
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
