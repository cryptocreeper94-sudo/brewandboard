import { useRef, useCallback } from "react";
import { Link } from "wouter";

const socialLinks = [
  { name: "Twitter", url: "https://x.com/TrustSignal26", d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { name: "Discord", url: "https://discord.gg/PtkWpzE6", d: "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" },
  { name: "Telegram", url: "https://t.me/dwsccommunity", d: "M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" },
  { name: "Facebook", url: "https://www.facebook.com/profile.php?id=61585553137979", d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
];

export function Footer() {
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleShieldClick = useCallback(() => {
    clickCountRef.current += 1;
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      window.open("https://dwtl.io/developer-portal", "_blank");
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 2000);
    }
  }, []);

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#070b16]" data-testid="footer">
      {/* Site Links */}
      <div className="border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
            <div>
              <h4 className="font-bold text-white/90 mb-4 text-xs uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2 text-xs text-white/40">
                <li><Link href="/menu" className="hover:text-cyan-400 transition-colors">Menu</Link></li>
                <li><Link href="/events" className="hover:text-cyan-400 transition-colors">Events</Link></li>
                <li><Link href="/games" className="hover:text-cyan-400 transition-colors">Board Games</Link></li>
                <li><Link href="/reservations" className="hover:text-cyan-400 transition-colors">Reservations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white/90 mb-4 text-xs uppercase tracking-wider">Ecosystem</h4>
              <ul className="space-y-2 text-xs text-white/40">
                <li><a href="https://dwtl.io" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Trust Layer</a></li>
                <li><a href="https://darkwavestudios.io" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">DarkWave Studios</a></li>
                <li><a href="https://happyeats.app" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">HappyEats</a></li>
                <li><a href="https://trustshield.tech" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">TrustShield</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white/90 mb-4 text-xs uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-xs text-white/40">
                <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
                <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white/90 mb-4 text-xs uppercase tracking-wider">Community</h4>
              <ul className="space-y-2 text-xs text-white/40">

              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-5xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-white/40">
          <span className="text-white/60">DarkWave Studios, LLC</span>
          <span className="text-white/20">•</span>
          <span>&copy; 2026</span>
          <span className="text-white/20">•</span>
          <a href="https://dwtl.io" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">Trust Layer</a>
          <span className="text-white/20">•</span>
          <button
            onClick={handleShieldClick}
            className="text-white/10 hover:text-white/20 transition-colors"
            data-testid="shield-easter-egg"
            aria-label="Shield"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
