import Twilio from 'twilio';
import logger from './logger';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? Twilio(accountSid, authToken) : null;

export function isTwilioConfigured(): boolean {
  return client !== null && !!fromPhone;
}

export interface SmsOptions {
  to: string;
  message: string;
}

export interface VoiceCallOptions {
  to: string;
  message: string;
  voice?: 'alice' | 'man' | 'woman';
}

export async function sendSms(options: SmsOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!client || !fromPhone) {
    logger.warn('system', 'Twilio not configured - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_PHONE_NUMBER missing');
    return { success: false, error: 'SMS service not configured' };
  }

  try {
    const message = await client.messages.create({
      body: options.message,
      from: fromPhone,
      to: options.to,
    });

    logger.info('system', `SMS sent to ${options.to}`, { messageId: message.sid });
    return { success: true, messageId: message.sid };
  } catch (error: any) {
    logger.error('system', 'Failed to send SMS', error, { to: options.to });
    return { success: false, error: error.message };
  }
}

export async function makeVoiceCall(options: VoiceCallOptions): Promise<{ success: boolean; callId?: string; error?: string }> {
  if (!client || !fromPhone) {
    logger.warn('system', 'Twilio not configured for voice calls');
    return { success: false, error: 'Voice service not configured' };
  }

  try {
    const twiml = `<Response><Say voice="${options.voice || 'alice'}">${escapeXml(options.message)}</Say></Response>`;
    
    const call = await client.calls.create({
      twiml,
      from: fromPhone,
      to: options.to,
    });

    logger.info('system', `Voice call initiated to ${options.to}`, { callId: call.sid });
    return { success: true, callId: call.sid };
  } catch (error: any) {
    logger.error('system', 'Failed to make voice call', error, { to: options.to });
    return { success: false, error: error.message };
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function sendOrderConfirmationSms(
  phone: string,
  orderId: string,
  vendorName: string,
  scheduledTime: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Brew & Board: Your order #${orderId.slice(-6).toUpperCase()} from ${vendorName} is confirmed for ${scheduledTime}. We'll notify you when it's on the way!`;
  return sendSms({ to: phone, message });
}

export async function sendOrderReadySms(
  phone: string,
  orderId: string,
  eta: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Brew & Board: Your order #${orderId.slice(-6).toUpperCase()} is on the way! Estimated arrival: ${eta}`;
  return sendSms({ to: phone, message });
}

export async function sendOrderDeliveredSms(
  phone: string,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Brew & Board: Your order #${orderId.slice(-6).toUpperCase()} has been delivered. Enjoy! Rate your experience in the app.`;
  return sendSms({ to: phone, message });
}

export async function sendDriverAlertSms(
  phone: string,
  orderId: string,
  pickupAddress: string,
  deliveryAddress: string
): Promise<{ success: boolean; error?: string }> {
  const message = `Brew & Board Driver Alert: New order #${orderId.slice(-6).toUpperCase()}. Pickup: ${pickupAddress}. Deliver to: ${deliveryAddress}`;
  return sendSms({ to: phone, message });
}
