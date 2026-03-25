import type { Express, Request, Response } from 'express';
import crypto from 'crypto';

const DWTL_BASE = process.env.TRUST_LAYER_URL || 'https://dwtl.io';
const APP_SLUG = 'brewandboard';

export function registerTrustLayerSSO(app: Express) {
  app.post("/api/auth/trust-layer/login", async (req: Request, res: Response) => {
    try {
      const { sso_token, auth_token } = req.body;
      const token = sso_token || auth_token;
      if (!token) return res.status(400).json({ success: false, error: "SSO token is required" });
      let ecosystemUser: any = null;
      try {
        const r = await fetch(DWTL_BASE+"/api/auth/exchange-token", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({hubSessionToken:token}) });
        if (r.ok) ecosystemUser = await r.json();
      } catch {}
      if (!ecosystemUser && token.length >= 48) {
        try {
          const r = await fetch(DWTL_BASE+"/api/auth/me", { headers:{Authorization:"Bearer "+token} });
          if (r.ok) { const d = await r.json(); ecosystemUser = d.user || d; }
        } catch {}
      }
      if (!ecosystemUser?.email) return res.status(401).json({ success: false, error: "Invalid or expired SSO token" });
      res.json({ success:true, user:{ email:ecosystemUser.email, username:ecosystemUser.username||ecosystemUser.email.split("@")[0], displayName:ecosystemUser.displayName||ecosystemUser.firstName||ecosystemUser.username, uniqueHash:ecosystemUser.uniqueHash||null }, sessionToken:crypto.randomBytes(48).toString("hex"), trustLayerId:ecosystemUser.uniqueHash||ecosystemUser.userId||null, ssoLinked:true });
      console.log("[TL SSO] "+APP_SLUG+": Verified "+ecosystemUser.email);
    } catch (e:any) { console.error("[TL SSO] "+APP_SLUG+":",e?.message); res.status(500).json({ success:false, error:"SSO login failed" }); }
  });
  app.get("/api/auth/trust-layer/login-url", (req:Request, res:Response) => {
    const cb = (req.query.callback as string) || "/";
    res.json({ url:DWTL_BASE+"/login?app="+APP_SLUG+"&redirect="+encodeURIComponent(cb), provider:"Trust Layer", baseUrl:DWTL_BASE });
  });
  app.get("/api/auth/trust-layer/status", (_:Request, res:Response) => {
    res.json({ sso:true, provider:"Trust Layer", app:APP_SLUG, dwtlBase:DWTL_BASE });
  });
  console.log("[TL SSO] "+APP_SLUG+": SSO consumer endpoints registered");
}
