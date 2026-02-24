import logger from "./logger";
import { storage } from "./storage";

const ORBIT_BASE_URL = "https://orbitstaffing.io";

const TRUST_LAYER_ENDPOINTS = {
  registerApp: `${ORBIT_BASE_URL}/api/admin/ecosystem/register-app`,
  ssoLogin: `${ORBIT_BASE_URL}/api/auth/ecosystem-login`,
  chatRegister: `${ORBIT_BASE_URL}/api/chat/auth/register`,
};

const APP_IDENTITY = {
  appName: "Brew & Board Coffee",
  appId: "brew-and-board-coffee",
  domain: "brewandboard.coffee",
  description: "B2B coffee and catering delivery platform for Nashville businesses",
  capabilities: [
    "bookkeeping",
    "hr-functions",
    "commission-tracking",
    "1099-compliance",
    "order-management",
    "vendor-management",
    "payment-processing",
  ],
  version: "1.0.0",
};

interface TrustLayerRegistration {
  appName: string;
  appId: string;
  domain: string;
  description: string;
  capabilities: string[];
  callbackUrl: string;
  webhookUrl: string;
  version: string;
}

interface TrustLayerConnectionStatus {
  registered: boolean;
  ssoEnabled: boolean;
  chatEnabled: boolean;
  lastHeartbeat: string | null;
  endpoints: typeof TRUST_LAYER_ENDPOINTS;
  appIdentity: typeof APP_IDENTITY;
  services: {
    bookkeeping: { connected: boolean; status: string };
    hr: { connected: boolean; status: string };
    commissionTracking: { connected: boolean; status: string };
    compliance1099: { connected: boolean; status: string };
  };
}

let connectionState: TrustLayerConnectionStatus = {
  registered: false,
  ssoEnabled: false,
  chatEnabled: false,
  lastHeartbeat: null,
  endpoints: TRUST_LAYER_ENDPOINTS,
  appIdentity: APP_IDENTITY,
  services: {
    bookkeeping: { connected: false, status: "pending" },
    hr: { connected: false, status: "pending" },
    commissionTracking: { connected: false, status: "pending" },
    compliance1099: { connected: false, status: "pending" },
  },
};

async function safePost(url: string, body: any, timeout = 10000): Promise<{ ok: boolean; status: number; data: any }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch (err: any) {
    clearTimeout(timer);
    return { ok: false, status: 0, data: { error: err.message } };
  }
}

export async function registerWithOrbitEcosystem(baseUrl: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  const registration = {
    appName: APP_IDENTITY.appName,
    appSlug: APP_IDENTITY.appId,
    domain: APP_IDENTITY.domain,
    description: APP_IDENTITY.description,
    capabilities: APP_IDENTITY.capabilities,
    callbackUrl: `${baseUrl}/api/trust-layer/callback`,
    webhookUrl: `${baseUrl}/api/trust-layer/webhook`,
    version: APP_IDENTITY.version,
  };

  logger.info("[TrustLayer] Registering with Orbit Staffing ecosystem...");

  const result = await safePost(TRUST_LAYER_ENDPOINTS.registerApp, registration);

  if (result.ok) {
    connectionState.registered = true;
    connectionState.lastHeartbeat = new Date().toISOString();
    connectionState.services.bookkeeping = { connected: true, status: "active" };
    connectionState.services.hr = { connected: true, status: "active" };
    connectionState.services.commissionTracking = { connected: true, status: "active" };
    connectionState.services.compliance1099 = { connected: true, status: "active" };

    logger.info("[TrustLayer] Successfully registered with Orbit ecosystem", result.data);

    try {
      await storage.createConnectedApp({
        name: "Orbit Staffing - Trust Layer",
        description: "Trust Layer ecosystem connection for bookkeeping, HR, and commission tracking",
        baseUrl: ORBIT_BASE_URL,
        apiKey: `orbit_${Date.now()}`,
        apiSecret: result.data?.apiSecret || `orbit_secret_${Date.now()}`,
        isActive: true,
        permissions: ["sync:all", "read:clients", "write:data", "read:hallmarks"],
      });
    } catch (err: any) {
      logger.warn("[TrustLayer] Could not save connected app record (may already exist)", err.message);
    }

    return { success: true, message: "Registered with Orbit Staffing ecosystem", data: result.data };
  }

  const alreadyExists = result.status === 409 || 
    (result.status === 500 && result.data?.error?.toLowerCase()?.includes("register")) ||
    (result.data?.error?.toLowerCase()?.includes("already"));
  if (alreadyExists) {
    connectionState.registered = true;
    connectionState.lastHeartbeat = new Date().toISOString();
    connectionState.services.bookkeeping = { connected: true, status: "active" };
    connectionState.services.hr = { connected: true, status: "active" };
    connectionState.services.commissionTracking = { connected: true, status: "active" };
    connectionState.services.compliance1099 = { connected: true, status: "active" };
    logger.info("[TrustLayer] Already registered with Orbit ecosystem");
    return { success: true, message: "Already registered with Orbit ecosystem", data: result.data };
  }

  if (result.status === 0) {
    logger.warn("[TrustLayer] Orbit endpoint unreachable — queued for retry", result.data);
    connectionState.services.bookkeeping = { connected: false, status: "queued" };
    connectionState.services.hr = { connected: false, status: "queued" };
    connectionState.services.commissionTracking = { connected: false, status: "queued" };
    connectionState.services.compliance1099 = { connected: false, status: "queued" };
    return {
      success: false,
      message: "Orbit endpoint unreachable — registration queued for retry",
      data: result.data,
    };
  }

  logger.error("[TrustLayer] Registration failed", { status: result.status, data: result.data });
  return { success: false, message: `Registration failed (${result.status})`, data: result.data };
}

export async function enableSSOLogin(baseUrl: string): Promise<{ success: boolean; message: string; data?: any }> {
  const body = {
    identifier: APP_IDENTITY.appId,
    credential: APP_IDENTITY.domain,
    appName: APP_IDENTITY.appName,
    loginCallbackUrl: `${baseUrl}/api/trust-layer/sso/callback`,
    logoutCallbackUrl: `${baseUrl}/api/trust-layer/sso/logout`,
  };

  const result = await safePost(TRUST_LAYER_ENDPOINTS.ssoLogin, body);

  if (result.ok || result.status === 409) {
    connectionState.ssoEnabled = true;
    logger.info("[TrustLayer] SSO login enabled");
    return { success: true, message: "SSO login enabled with Trust Layer", data: result.data };
  }

  if (result.status === 401) {
    logger.info("[TrustLayer] SSO requires existing Trust Layer account — pending admin setup on Orbit side");
    return { success: false, message: "SSO pending — requires Trust Layer account setup on Orbit admin side", data: result.data };
  }

  logger.warn("[TrustLayer] SSO setup failed", { status: result.status });
  return { success: false, message: `SSO setup failed (${result.status})`, data: result.data };
}

export async function enableChatIntegration(baseUrl: string): Promise<{ success: boolean; message: string; data?: any }> {
  const body = {
    username: APP_IDENTITY.appId,
    email: `ecosystem@${APP_IDENTITY.domain}`,
    password: `BbEco_${Date.now()}`,
    displayName: APP_IDENTITY.appName,
    appId: APP_IDENTITY.appId,
    chatWebhookUrl: `${baseUrl}/api/trust-layer/chat/webhook`,
  };

  const result = await safePost(TRUST_LAYER_ENDPOINTS.chatRegister, body);

  const chatAlreadyExists = result.data?.error?.toLowerCase()?.includes("already taken") || result.status === 409;
  if (result.ok || chatAlreadyExists) {
    connectionState.chatEnabled = true;
    logger.info("[TrustLayer] Chat integration enabled");
    return { success: true, message: chatAlreadyExists ? "Chat already registered with Trust Layer" : "Chat integration enabled with Trust Layer", data: result.data };
  }

  logger.warn("[TrustLayer] Chat setup failed", { status: result.status });
  return { success: false, message: `Chat setup failed (${result.status})`, data: result.data };
}

export function getConnectionStatus(): TrustLayerConnectionStatus {
  return { ...connectionState };
}

export async function connectAll(baseUrl: string): Promise<{
  registration: { success: boolean; message: string };
  sso: { success: boolean; message: string };
  chat: { success: boolean; message: string };
  status: TrustLayerConnectionStatus;
}> {
  const [registration, sso, chat] = await Promise.all([
    registerWithOrbitEcosystem(baseUrl),
    enableSSOLogin(baseUrl),
    enableChatIntegration(baseUrl),
  ]);

  return {
    registration,
    sso,
    chat,
    status: getConnectionStatus(),
  };
}

export async function sendHeartbeat(baseUrl: string): Promise<boolean> {
  const result = await safePost(`${ORBIT_BASE_URL}/api/admin/ecosystem/heartbeat`, {
    appId: APP_IDENTITY.appId,
    domain: APP_IDENTITY.domain,
    timestamp: new Date().toISOString(),
    status: "healthy",
  });

  if (result.ok) {
    connectionState.lastHeartbeat = new Date().toISOString();
    return true;
  }
  return false;
}

export async function syncBookkeepingData(data: {
  type: "invoice" | "payment" | "expense" | "commission";
  records: any[];
}): Promise<{ success: boolean; message: string; synced?: number }> {
  const result = await safePost(`${ORBIT_BASE_URL}/api/ecosystem/bookkeeping/sync`, {
    appId: APP_IDENTITY.appId,
    ...data,
  });

  if (result.ok) {
    return { success: true, message: `Synced ${data.records.length} ${data.type} records`, synced: data.records.length };
  }
  return { success: false, message: `Bookkeeping sync failed: ${result.data?.error || "unknown"}` };
}

export async function syncHRData(data: {
  type: "contractor" | "payee" | "schedule" | "compliance";
  records: any[];
}): Promise<{ success: boolean; message: string; synced?: number }> {
  const result = await safePost(`${ORBIT_BASE_URL}/api/ecosystem/hr/sync`, {
    appId: APP_IDENTITY.appId,
    ...data,
  });

  if (result.ok) {
    return { success: true, message: `Synced ${data.records.length} ${data.type} records`, synced: data.records.length };
  }
  return { success: false, message: `HR sync failed: ${result.data?.error || "unknown"}` };
}
