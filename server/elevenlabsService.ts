import logger from './logger';

const apiKey = process.env.ELEVENLABS_API_KEY;
const defaultVoiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default: Sarah

export function isElevenLabsConfigured(): boolean {
  return !!apiKey;
}

export interface TextToSpeechOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
}

export interface TextToSpeechResult {
  success: boolean;
  audioBuffer?: Buffer;
  contentType?: string;
  error?: string;
}

export async function textToSpeech(options: TextToSpeechOptions): Promise<TextToSpeechResult> {
  if (!apiKey) {
    logger.warn('system', 'ElevenLabs not configured - ELEVENLABS_API_KEY missing');
    return { success: false, error: 'Text-to-speech service not configured' };
  }

  const voiceId = options.voiceId || defaultVoiceId;
  const modelId = options.modelId || 'eleven_monolingual_v1';

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: options.text,
        model_id: modelId,
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
          style: options.style ?? 0,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    logger.info('system', `Text-to-speech generated`, { textLength: options.text.length, voiceId });
    return {
      success: true,
      audioBuffer,
      contentType: 'audio/mpeg',
    };
  } catch (error: any) {
    logger.error('system', 'Failed to generate text-to-speech', error);
    return { success: false, error: error.message };
  }
}

export async function getAvailableVoices(): Promise<{ success: boolean; voices?: any[]; error?: string }> {
  if (!apiKey) {
    return { success: false, error: 'Text-to-speech service not configured' };
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, voices: data.voices };
  } catch (error: any) {
    logger.error('system', 'Failed to fetch ElevenLabs voices', error);
    return { success: false, error: error.message };
  }
}

export async function generateOrderAnnouncement(
  orderId: string,
  customerName: string,
  vendorName: string
): Promise<TextToSpeechResult> {
  const text = `Attention: Order number ${orderId.slice(-6).toUpperCase()} for ${customerName} from ${vendorName} is ready for pickup.`;
  return textToSpeech({ text });
}

export async function generateDeliveryAnnouncement(
  orderId: string,
  customerName: string
): Promise<TextToSpeechResult> {
  const text = `Your order number ${orderId.slice(-6).toUpperCase()} has arrived, ${customerName}. Thank you for choosing Brew and Board Coffee.`;
  return textToSpeech({ text });
}

export async function generateWelcomeMessage(customerName: string): Promise<TextToSpeechResult> {
  const text = `Welcome to Brew and Board Coffee, ${customerName}. We're delighted to serve you Nashville's finest artisan coffee.`;
  return textToSpeech({ text });
}
