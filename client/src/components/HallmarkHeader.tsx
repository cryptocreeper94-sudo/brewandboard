import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AppHallmark {
  serialNumber: string;
  assetName: string;
  solanaTxSignature?: string;
  solanaNetwork?: string;
  status: string;
}

export function HallmarkHeader() {
  const [hallmark, setHallmark] = useState<AppHallmark | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAppHallmark() {
      try {
        const res = await fetch('/api/hallmark/app');
        if (res.ok) {
          const data = await res.json();
          setHallmark(data);
        }
      } catch (error) {
        console.log('App hallmark not available');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAppHallmark();
  }, []);

  if (isLoading || !hallmark) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={`/verify/${hallmark.serialNumber}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 cursor-pointer transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10"
              data-testid="link-hallmark-badge"
            >
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[10px] font-semibold text-emerald-700 tracking-wide">
                SOLANA CERTIFIED
              </span>
              {hallmark.solanaTxSignature && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                />
              )}
            </motion.div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="text-xs space-y-1">
            <p className="font-semibold">Blockchain Verified</p>
            <p className="text-muted-foreground">
              This application is verified on the Solana blockchain
            </p>
            <p className="font-mono text-[10px] text-emerald-600">
              {hallmark.serialNumber}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default HallmarkHeader;
