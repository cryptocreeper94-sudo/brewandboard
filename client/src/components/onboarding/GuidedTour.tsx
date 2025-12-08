import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { createPortal } from "react-dom";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="hero"]',
    title: 'Welcome to Your Dashboard',
    content: 'This is your command center for managing coffee orders, viewing vendor options, and tracking deliveries.',
    position: 'bottom',
  },
  {
    target: '[data-tour="vendors"]',
    title: 'Browse Local Vendors',
    content: 'Explore Nashville\'s best coffee shops, bakeries, and juice bars. Each vendor shows their specialties and estimated delivery times.',
    position: 'top',
  },
  {
    target: '[data-tour="schedule"]',
    title: 'Schedule Your Orders',
    content: 'Plan ahead! Schedule orders for meetings with at least 2 hours lead time. We handle delivery coordination.',
    position: 'top',
  },
  {
    target: '[data-tour="portfolio"]',
    title: 'Your Business Portfolio',
    content: 'Keep notes, manage client contacts, and track your meeting history all in one place.',
    position: 'top',
  },
  {
    target: '[data-tour="quick-actions"]',
    title: 'Quick Actions',
    content: 'Fast access to web search, news, and your favorite vendors. Everything you need at your fingertips.',
    position: 'left',
  },
];

interface GuidedTourProps {
  isActive: boolean;
  onComplete: () => void;
  onDismiss: () => void;
  userId: string;
  initialStep?: number;
}

export function GuidedTour({ isActive, onComplete, onDismiss, userId, initialStep = 0 }: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const updateTargetPosition = () => {
      const step = TOUR_STEPS[currentStep];
      if (!step) return;

      const element = document.querySelector(step.target);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    updateTargetPosition();

    observerRef.current = new MutationObserver(updateTargetPosition);
    observerRef.current.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [isActive, currentStep]);

  const saveTourProgress = async (step: number, completed: boolean) => {
    try {
      await fetch(`/api/onboarding/tour-progress/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, completed }),
      });
    } catch (error) {
      console.error('Failed to save tour progress:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveTourProgress(nextStep, false);
    } else {
      saveTourProgress(currentStep, true);
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    saveTourProgress(currentStep, true);
    onDismiss();
  };

  if (!isActive || !mounted) return null;

  const step = TOUR_STEPS[currentStep];
  const position = step?.position || 'bottom';

  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 180;

    switch (position) {
      case 'top':
        return {
          top: targetRect.top - tooltipHeight - padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        };
      case 'bottom':
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.left - tooltipWidth - padding,
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.right + padding,
        };
      default:
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        };
    }
  };

  const tooltipPosition = getTooltipPosition();

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60"
          onClick={handleSkip}
        />

        {targetRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute pointer-events-none"
            style={{
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
              borderRadius: 12,
              border: '2px solid rgba(251, 191, 36, 0.6)',
            }}
          />
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="absolute w-80 bg-gradient-to-br from-[#1a0f09] via-[#2d1810] to-[#3d2418] rounded-xl border border-amber-700/50 shadow-2xl overflow-hidden"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400/80 text-sm font-medium">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              <button
                onClick={handleSkip}
                className="text-amber-400/60 hover:text-amber-400 transition-colors"
                data-testid="button-tour-close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-serif font-bold text-amber-100 mb-2">
              {step?.title}
            </h3>
            <p className="text-amber-200/70 text-sm leading-relaxed mb-4">
              {step?.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentStep ? 'bg-amber-400 w-4' : i < currentStep ? 'bg-amber-600' : 'bg-amber-800'
                    }`}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="text-amber-300 hover:text-amber-100 hover:bg-amber-900/50"
                    data-testid="button-tour-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-amber-600 hover:bg-amber-500 text-white"
                  data-testid="button-tour-next"
                >
                  {currentStep === TOUR_STEPS.length - 1 ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Done
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
