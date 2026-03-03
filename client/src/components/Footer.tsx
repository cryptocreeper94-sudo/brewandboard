import { motion } from "framer-motion";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Facebook, Twitter, Shield } from "lucide-react";

export function Footer() {
  const [version, setVersion] = useState<string>("...");

  useEffect(() => {
    fetch('/api/version/tracking')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.version) {
          const v = data.version.startsWith('v') ? data.version : `v${data.version}`;
          setVersion(v);
        }
      })
      .catch(() => setVersion("v1.0.0"));
  }, []);

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-30"
      style={{ 
        background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 50%, #3d2216 100%)'
      }}
    >
      <div className="container max-w-5xl mx-auto px-3 md:px-4 py-2">
        <div className="flex flex-col items-center justify-center gap-1 text-[10px] text-amber-300/50">
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
            <Link href="/contact">
              <span className="hover:text-amber-300 cursor-pointer transition-colors" data-testid="link-contact">Contact</span>
            </Link>
            <span className="mx-0.5">·</span>
            <Link href="/vendors">
              <span className="hover:text-amber-300 cursor-pointer transition-colors" data-testid="link-vendors">Vendors</span>
            </Link>
            <span className="mx-0.5">·</span>
            <Link href="/investor">
              <span className="hover:text-amber-300 cursor-pointer transition-colors" data-testid="link-investor">Investors</span>
            </Link>
            <span className="mx-0.5">·</span>
            <Link href="/admin">
              <span className="hover:text-amber-300 cursor-pointer transition-colors" data-testid="link-admin">Admin</span>
            </Link>
            <span className="mx-0.5">·</span>
            <Link href="/terms">
              <span className="hover:text-amber-300 cursor-pointer transition-colors" data-testid="link-terms">Terms</span>
            </Link>
            <span className="mx-0.5">·</span>
            <Link href="/privacy">
              <span className="hover:text-amber-300 cursor-pointer transition-colors" data-testid="link-privacy">Privacy</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 text-amber-400/40">
            <Link href="/developers">
              <span className="hover:text-amber-400 cursor-pointer transition-colors font-medium" data-testid="link-dev-login">Dev</span>
            </Link>
            <span className="mx-0.5">·</span>
            <Link href="/partner">
              <span className="hover:text-amber-400 cursor-pointer transition-colors font-medium" data-testid="link-partner-login">Partner</span>
            </Link>
            <span className="mx-0.5">·</span>
            <Link href="/admin-view">
              <span className="hover:text-amber-400 cursor-pointer transition-colors font-medium" data-testid="link-admin-view">Admin</span>
            </Link>
            <span className="mx-0.5">·</span>
            <Link href="/regional">
              <span className="hover:text-amber-400 cursor-pointer transition-colors font-medium" data-testid="link-rm-login">RM</span>
            </Link>
            <span className="mx-0.5">·</span>
            <Link href="/operations">
              <span className="hover:text-amber-400 cursor-pointer transition-colors font-medium" data-testid="link-operations">Ops</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-amber-300/40 text-[9px]" data-testid="text-social-bb-label">Brew & Board</span>
            <a
              href="https://www.facebook.com/profile.php?id=61585553137979"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300/50 hover:text-blue-400 transition-colors"
              data-testid="link-bb-facebook"
              aria-label="Brew & Board Facebook"
            >
              <Facebook className="size-3" />
            </a>
            <a
              href="https://x.com/TrustSignal26"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300/50 hover:text-sky-400 transition-colors"
              data-testid="link-bb-x"
              aria-label="Brew & Board X"
            >
              <Twitter className="size-3" />
            </a>
            <span className="text-amber-300/20 mx-1">|</span>
            <span className="text-amber-300/40 text-[9px]" data-testid="text-social-tenant-label">Tenants</span>
            <span className="text-amber-300/30 text-[9px] italic">Coming Soon</span>
          </div>
          
          <Link href="/my-hallmarks">
            <div className="flex items-center gap-1 cursor-pointer hover:text-amber-300 transition-colors group" data-testid="link-genesis-hallmark">
              <Shield className="size-3 text-amber-500 group-hover:text-amber-300" />
              <span className="text-[9px] font-medium">Genesis Hallmark</span>
              <span className="text-[9px] font-mono text-amber-500 group-hover:text-amber-300">BB-00000001</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-1">
            <span>Powered by</span>
            <a 
              href="https://darkwavestudios.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-serif font-semibold text-amber-200/70 hover:text-amber-400 transition-colors underline-offset-2 hover:underline"
              data-testid="link-darkwave"
            >
              Darkwave Studios, LLC
            </a>
            <span className="mx-0.5">·</span>
            <span className="text-amber-400/60 font-medium" data-testid="footer-version">{version}</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
