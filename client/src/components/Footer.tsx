import { motion } from "framer-motion";
import { Link } from "wouter";

export function Footer() {
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
          {/* Navigation Links - First Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
            <Link href="/contact">
              <span className="hover:text-amber-300 cursor-pointer transition-colors" data-testid="link-contact">Contact</span>
            </Link>
            <span className="mx-0.5">•</span>
            <Link href="/vendors">
              <span className="hover:text-amber-300 cursor-pointer transition-colors" data-testid="link-vendors">Vendors</span>
            </Link>
            <span className="mx-0.5">•</span>
            <Link href="/investor">
              <span className="hover:text-amber-300 cursor-pointer transition-colors" data-testid="link-investor">Investors</span>
            </Link>
            <span className="mx-0.5">•</span>
            <Link href="/admin">
              <span className="hover:text-amber-300 cursor-pointer transition-colors" data-testid="link-admin">Admin</span>
            </Link>
            <span className="mx-0.5">•</span>
            <Link href="/terms">
              <span className="hover:text-amber-300 cursor-pointer transition-colors" data-testid="link-terms">Terms</span>
            </Link>
          </div>
          
          {/* Portal Login Links - Second Row */}
          <div className="flex items-center gap-2 text-amber-400/40">
            <Link href="/developers">
              <span className="hover:text-amber-400 cursor-pointer transition-colors font-medium" data-testid="link-dev-login">Dev</span>
            </Link>
            <span className="mx-0.5">•</span>
            <Link href="/partner">
              <span className="hover:text-amber-400 cursor-pointer transition-colors font-medium" data-testid="link-partner-login">Partner</span>
            </Link>
            <span className="mx-0.5">•</span>
            <Link href="/regional-manager">
              <span className="hover:text-amber-400 cursor-pointer transition-colors font-medium" data-testid="link-rm-login">RM</span>
            </Link>
          </div>
          
          {/* Attribution and Version - Third Row */}
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
            <span className="mx-0.5">•</span>
            <span className="text-amber-400/60 font-medium">v1.2.1</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
