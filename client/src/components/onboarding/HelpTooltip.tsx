import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface HelpTooltipProps {
  children?: ReactNode;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  showIcon?: boolean;
  iconSize?: "sm" | "md" | "lg";
}

export function HelpTooltip({ 
  children, 
  content, 
  side = "top",
  showIcon = true,
  iconSize = "sm"
}: HelpTooltipProps) {
  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children ? (
            <span className="inline-flex items-center gap-1 cursor-help">
              {children}
              {showIcon && (
                <HelpCircle className={`${iconSizes[iconSize]} text-amber-500/60 hover:text-amber-400 transition-colors`} />
              )}
            </span>
          ) : (
            <button type="button" className="inline-flex cursor-help">
              <HelpCircle className={`${iconSizes[iconSize]} text-amber-500/60 hover:text-amber-400 transition-colors`} />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="max-w-xs bg-[#2d1810] border-amber-700/50 text-amber-100 text-sm"
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const HELP_CONTENT = {
  orderLeadTime: "Orders require a minimum 2-hour lead time to ensure quality and timely delivery.",
  serviceFee: "Our 15% concierge fee covers order coordination, quality assurance, and customer support.",
  deliveryFee: "Delivery fees are calculated based on distance from the vendor to your location.",
  gratuity: "100% of tips go to your delivery driver. We never take a cut of gratuity.",
  subscriptions: "Subscribers save 15% on service fees and get priority support.",
  hallmark: "Blockchain hallmarks provide tamper-proof verification for important documents.",
  virtualHost: "Virtual Host lets you order for attendees at multiple locations from a single meeting invite.",
  orderCapacity: "We limit orders per time slot to ensure quality. Book early for popular times!",
};
