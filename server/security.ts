import crypto from 'crypto';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS);
}

export async function verifyPin(pin: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  
  if (!storedHash.startsWith('$2')) {
    return pin === storedHash;
  }
  
  return bcrypt.compare(pin, storedHash);
}

export function hashPinSync(pin: string): string {
  return bcrypt.hashSync(pin, SALT_ROUNDS);
}

export function verifyPinSync(pin: string, storedHash: string): boolean {
  if (!storedHash) return false;
  
  if (!storedHash.startsWith('$2')) {
    return pin === storedHash;
  }
  
  return bcrypt.compareSync(pin, storedHash);
}

export interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;
  maxAttempts: number;
  blockDurationMs: number;
}

const AUTH_RATE_LIMIT: RateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  blockDurationMs: 30 * 60 * 1000,
};

const API_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000,
  maxAttempts: 100,
  blockDurationMs: 60 * 1000,
};

export function checkRateLimit(
  key: string, 
  config: RateLimitConfig = AUTH_RATE_LIMIT
): { allowed: boolean; retryAfter?: number; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
      remaining: 0 
    };
  }
  
  if (!entry || now - entry.firstRequest > config.windowMs) {
    rateLimitStore.set(key, { count: 1, firstRequest: now });
    return { allowed: true, remaining: config.maxAttempts - 1 };
  }
  
  entry.count++;
  
  if (entry.count > config.maxAttempts) {
    entry.blockedUntil = now + config.blockDurationMs;
    return { 
      allowed: false, 
      retryAfter: Math.ceil(config.blockDurationMs / 1000),
      remaining: 0 
    };
  }
  
  return { allowed: true, remaining: config.maxAttempts - entry.count };
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

export function getRateLimitMiddleware(config: RateLimitConfig = API_RATE_LIMIT) {
  return (req: any, res: any, next: any) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const result = checkRateLimit(`api:${key}`, config);
    
    res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
    
    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter?.toString() || '60');
      return res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: result.retryAfter 
      });
    }
    
    next();
  };
}

export function getAuthRateLimitMiddleware() {
  return getRateLimitMiddleware(AUTH_RATE_LIMIT);
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>'"&]/g, (char) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
      '&': '&amp;',
    };
    return entities[char] || char;
  });
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
  return phoneRegex.test(phone);
}

export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `BB-${timestamp}-${random}`;
}

setInterval(() => {
  const now = Date.now();
  const keys = Array.from(rateLimitStore.keys());
  for (const key of keys) {
    const entry = rateLimitStore.get(key);
    if (entry) {
      if (entry.blockedUntil && now > entry.blockedUntil + 60000) {
        rateLimitStore.delete(key);
      } else if (now - entry.firstRequest > 3600000) {
        rateLimitStore.delete(key);
      }
    }
  }
}, 60000);
