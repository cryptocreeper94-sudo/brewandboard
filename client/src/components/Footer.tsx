import { motion } from "framer-motion";

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-t border-border/30"
    >
      <div className="container max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Powered by</span>
          <a 
            href="https://darkwavestudios.io" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-serif font-semibold text-foreground hover:text-amber-600 transition-colors underline-offset-2 hover:underline"
            data-testid="link-darkwave"
          >
            Darkwave Studios, LLC
          </a>
          <span className="mx-1">•</span>
          <span>&copy; 2025</span>
        </div>
      </div>
    </motion.footer>
  );
}

export default Footer;
