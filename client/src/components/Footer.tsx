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
      <div className="container max-w-5xl mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-[10px] text-amber-300/50">
          <Link href="/terms">
            <span className="hover:text-amber-300 cursor-pointer transition-colors">Terms</span>
          </Link>
          <span className="mx-0.5">•</span>
          <Link href="/contact">
            <span className="hover:text-amber-300 cursor-pointer transition-colors">Contact</span>
          </Link>
          <span className="mx-0.5">•</span>
          <Link href="/investor">
            <span className="hover:text-amber-300 cursor-pointer transition-colors">Investors</span>
          </Link>
          <span className="mx-0.5">•</span>
          <Link href="/admin">
            <span className="hover:text-amber-300 cursor-pointer transition-colors">Admin</span>
          </Link>
          <span className="mx-1.5">|</span>
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
          <span>&copy; 2025</span>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
