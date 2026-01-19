import { Express, Request, Response, NextFunction } from 'express';
import { sendSms, makeVoiceCall, isTwilioConfigured } from './twilioService';
import { textToSpeech, getAvailableVoices, isElevenLabsConfigured } from './elevenlabsService';
import logger from './logger';

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const user = req.user as any;
  if (!user?.isAdmin && !user?.isDeveloper) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW = 60000;

const rateLimit = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as any;
  const key = user?.id || req.ip || 'unknown';
  const now = Date.now();
  
  const limit = rateLimitMap.get(key);
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }
  
  if (limit.count >= RATE_LIMIT) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }
  
  limit.count++;
  next();
};

export function registerCommunicationRoutes(app: Express) {
  app.get('/api/communication/status', async (_req: Request, res: Response) => {
    res.json({
      twilio: {
        configured: isTwilioConfigured(),
        features: ['sms', 'voice']
      },
      elevenlabs: {
        configured: isElevenLabsConfigured(),
        features: ['text-to-speech']
      }
    });
  });

  app.post('/api/communication/sms', requireAdmin, rateLimit, async (req: Request, res: Response) => {
    try {
      const { to, message } = req.body;
      
      if (!to || !message) {
        return res.status(400).json({ error: 'Phone number and message are required' });
      }

      if (!/^\+?[1-9]\d{1,14}$/.test(to.replace(/[\s-]/g, ''))) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }

      if (message.length > 1600) {
        return res.status(400).json({ error: 'Message exceeds maximum length' });
      }

      const result = await sendSms({ to, message });
      
      if (result.success) {
        res.json({ success: true, messageId: result.messageId });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      logger.error('api', 'SMS endpoint error', error);
      res.status(500).json({ error: 'Failed to send SMS' });
    }
  });

  app.post('/api/communication/voice', requireAdmin, rateLimit, async (req: Request, res: Response) => {
    try {
      const { to, message, voice } = req.body;
      
      if (!to || !message) {
        return res.status(400).json({ error: 'Phone number and message are required' });
      }

      if (!/^\+?[1-9]\d{1,14}$/.test(to.replace(/[\s-]/g, ''))) {
        return res.status(400).json({ error: 'Invalid phone number format' });
      }

      if (voice && !['alice', 'man', 'woman'].includes(voice)) {
        return res.status(400).json({ error: 'Invalid voice option' });
      }

      const result = await makeVoiceCall({ to, message, voice });
      
      if (result.success) {
        res.json({ success: true, callId: result.callId });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      logger.error('api', 'Voice call endpoint error', error);
      res.status(500).json({ error: 'Failed to make voice call' });
    }
  });

  app.post('/api/communication/tts', requireAuth, rateLimit, async (req: Request, res: Response) => {
    try {
      const { text, voiceId, stability, similarityBoost } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      if (text.length > 5000) {
        return res.status(400).json({ error: 'Text exceeds maximum length of 5000 characters' });
      }

      if (stability !== undefined && (typeof stability !== 'number' || stability < 0 || stability > 1)) {
        return res.status(400).json({ error: 'Stability must be a number between 0 and 1' });
      }

      if (similarityBoost !== undefined && (typeof similarityBoost !== 'number' || similarityBoost < 0 || similarityBoost > 1)) {
        return res.status(400).json({ error: 'Similarity boost must be a number between 0 and 1' });
      }

      const result = await textToSpeech({ text, voiceId, stability, similarityBoost });
      
      if (result.success && result.audioBuffer) {
        res.set('Content-Type', result.contentType || 'audio/mpeg');
        res.set('Content-Disposition', 'inline; filename="speech.mp3"');
        res.send(result.audioBuffer);
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      logger.error('api', 'TTS endpoint error', error);
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  });

  app.get('/api/communication/voices', requireAuth, async (_req: Request, res: Response) => {
    try {
      const result = await getAvailableVoices();
      
      if (result.success) {
        res.json({ success: true, voices: result.voices });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error: any) {
      logger.error('api', 'Voices endpoint error', error);
      res.status(500).json({ error: 'Failed to fetch voices' });
    }
  });
}
