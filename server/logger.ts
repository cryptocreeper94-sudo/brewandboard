import { db } from './db';
import { sql } from 'drizzle-orm';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type LogCategory = 'payment' | 'delivery' | 'webhook' | 'auth' | 'order' | 'system' | 'api';

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  metadata?: Record<string, any>;
  orderId?: string;
  userId?: string;
  error?: Error;
}

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  critical: '\x1b[35m',
};

const RESET = '\x1b[0m';

class Logger {
  private inMemoryLogs: Array<LogEntry & { timestamp: Date }> = [];
  private maxInMemoryLogs = 1000;
  
  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date().toISOString();
    const color = LOG_COLORS[entry.level];
    const prefix = `[${entry.category.toUpperCase()}]`;
    
    let message = `${color}${timestamp} ${entry.level.toUpperCase()} ${prefix}${RESET} ${entry.message}`;
    
    if (entry.orderId) message += ` [Order: ${entry.orderId}]`;
    if (entry.userId) message += ` [User: ${entry.userId}]`;
    
    return message;
  }
  
  private async persistLog(entry: LogEntry & { timestamp: Date }): Promise<void> {
    this.inMemoryLogs.push(entry);
    
    if (this.inMemoryLogs.length > this.maxInMemoryLogs) {
      this.inMemoryLogs.shift();
    }
  }
  
  log(entry: LogEntry): void {
    const timestamp = new Date();
    console.log(this.formatMessage(entry));
    
    if (entry.metadata) {
      console.log('  Metadata:', JSON.stringify(entry.metadata, null, 2));
    }
    
    if (entry.error) {
      console.log('  Error:', entry.error.message);
      if (entry.error.stack) {
        console.log('  Stack:', entry.error.stack);
      }
    }
    
    this.persistLog({ ...entry, timestamp });
  }
  
  debug(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    this.log({ level: 'debug', category, message, metadata });
  }
  
  info(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    this.log({ level: 'info', category, message, metadata });
  }
  
  warn(category: LogCategory, message: string, metadata?: Record<string, any>): void {
    this.log({ level: 'warn', category, message, metadata });
  }
  
  error(category: LogCategory, message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log({ level: 'error', category, message, error, metadata });
  }
  
  critical(category: LogCategory, message: string, error?: Error, metadata?: Record<string, any>): void {
    this.log({ level: 'critical', category, message, error, metadata });
    this.sendAlert(message, error, metadata);
  }
  
  payment(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    this.log({ level, category: 'payment', message, metadata });
  }
  
  delivery(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    this.log({ level, category: 'delivery', message, metadata });
  }
  
  webhook(level: LogLevel, message: string, metadata?: Record<string, any>): void {
    this.log({ level, category: 'webhook', message, metadata });
  }
  
  order(level: LogLevel, message: string, orderId?: string, metadata?: Record<string, any>): void {
    this.log({ level, category: 'order', message, orderId, metadata });
  }
  
  auth(level: LogLevel, message: string, userId?: string, metadata?: Record<string, any>): void {
    this.log({ level, category: 'auth', message, userId, metadata });
  }
  
  private async sendAlert(message: string, error?: Error, metadata?: Record<string, any>): Promise<void> {
    console.log('\n🚨 CRITICAL ALERT 🚨');
    console.log('Message:', message);
    if (error) console.log('Error:', error.message);
    if (metadata) console.log('Metadata:', JSON.stringify(metadata, null, 2));
    console.log('Time:', new Date().toISOString());
    console.log('---');
  }
  
  getRecentLogs(options?: {
    level?: LogLevel;
    category?: LogCategory;
    limit?: number;
    since?: Date;
  }): Array<LogEntry & { timestamp: Date }> {
    let logs = [...this.inMemoryLogs];
    
    if (options?.level) {
      logs = logs.filter(l => l.level === options.level);
    }
    
    if (options?.category) {
      logs = logs.filter(l => l.category === options.category);
    }
    
    if (options?.since) {
      logs = logs.filter(l => l.timestamp >= options.since!);
    }
    
    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    if (options?.limit) {
      logs = logs.slice(0, options.limit);
    }
    
    return logs;
  }
  
  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<LogCategory, number>;
    recentErrors: number;
  } {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const byLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      critical: 0,
    };
    
    const byCategory: Record<LogCategory, number> = {
      payment: 0,
      delivery: 0,
      webhook: 0,
      auth: 0,
      order: 0,
      system: 0,
      api: 0,
    };
    
    let recentErrors = 0;
    
    for (const log of this.inMemoryLogs) {
      byLevel[log.level]++;
      byCategory[log.category]++;
      
      if ((log.level === 'error' || log.level === 'critical') && log.timestamp >= oneHourAgo) {
        recentErrors++;
      }
    }
    
    return {
      total: this.inMemoryLogs.length,
      byLevel,
      byCategory,
      recentErrors,
    };
  }
}

export const logger = new Logger();

export default logger;
