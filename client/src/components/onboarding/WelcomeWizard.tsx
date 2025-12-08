import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Coffee, Building2, Users, Clock, ArrowRight, ArrowLeft, 
  Sparkles, Check, Briefcase, Heart, Utensils, Apple 
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";

const BUSINESS_TYPES = [
  { id: 'corporate', label: 'Corporate Office', icon: Building2 },
  { id: 'startup', label: 'Startup', icon: Sparkles },
  { id: 'agency', label: 'Agency', icon: Briefcase },
  { id: 'nonprofit', label: 'Non-Profit', icon: Heart },
  { id: 'healthcare', label: 'Healthcare', icon: Coffee },
  { id: 'education', label: 'Education', icon: Apple },
  { id: 'hospitality', label: 'Hospitality', icon: Utensils },
  { id: 'other', label: 'Other', icon: Building2 },
];

const MEETING_SIZES = [
  { id: 5, label: '1-5 people', description: 'Small meetings' },
  { id: 10, label: '6-10 people', description: 'Team huddles' },
  { id: 20, label: '11-20 people', description: 'Department meetings' },
  { id: 50, label: '20+ people', description: 'Large gatherings' },
];

const DELIVERY_WINDOWS = [
  { id: 'early_morning', label: 'Early Morning', time: '6am - 8am' },
  { id: 'morning', label: 'Morning', time: '8am - 11am' },
  { id: 'lunch', label: 'Lunch', time: '11am - 1pm' },
  { id: 'afternoon', label: 'Afternoon', time: '1pm - 4pm' },
];

const VENDOR_CATEGORIES = [
  { id: 'coffee', label: 'Coffee & Tea', emoji: '☕' },
  { id: 'donuts', label: 'Donuts & Pastries', emoji: '🍩' },
  { id: 'juice', label: 'Juice & Smoothies', emoji: '🧃' },
  { id: 'breakfast', label: 'Breakfast', emoji: '🥐' },
  { id: 'bubble_tea', label: 'Bubble Tea', emoji: '🧋' },
];

interface WelcomeWizardProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
}

export function WelcomeWizard({ open, onComplete, userId }: WelcomeWizardProps) {
  const [step, setStep] = useState(0);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [meetingSize, setMeetingSize] = useState<number | null>(null);
  const [deliveryWindows, setDeliveryWindows] = useState<string[]>([]);
  const [vendorCategories, setVendorCategories] = useState<string[]>([]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/onboarding/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType,
          typicalMeetingSize: meetingSize,
          preferredDeliveryWindows: deliveryWindows,
          preferredVendorCategories: vendorCategories,
          welcomeWizardCompleted: true,
        }),
      });
      if (!response.ok) throw new Error('Failed to save profile');
      return response.json();
    },
    onSuccess: () => {
      onComplete();
    },
  });

  const toggleDeliveryWindow = (id: string) => {
    setDeliveryWindows(prev => 
      prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
    );
  };

  const toggleVendorCategory = (id: string) => {
    setVendorCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 0: return true;
      case 1: return businessType !== null;
      case 2: return meetingSize !== null;
      case 3: return deliveryWindows.length > 0;
      case 4: return vendorCategories.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      saveProfile.mutate();
    }
  };

  const steps = [
    {
      title: "Welcome to Brew & Board",
      subtitle: "Nashville's Premier B2B Coffee Concierge",
      content: (
        <div className="text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600"
          >
            <Coffee className="w-12 h-12 text-white" />
          </motion.div>
          <div>
            <h3 className="text-xl font-serif text-amber-100 mb-2">Let's personalize your experience</h3>
            <p className="text-amber-200/70">
              Answer a few quick questions so we can recommend the perfect vendors and delivery times for your business.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline" className="border-amber-500/50 text-amber-300">Takes 30 seconds</Badge>
            <Badge variant="outline" className="border-amber-500/50 text-amber-300">Skip anytime</Badge>
          </div>
        </div>
      ),
    },
    {
      title: "What type of business are you?",
      subtitle: "This helps us tailor recommendations",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {BUSINESS_TYPES.map((type) => {
            const Icon = type.icon;
            const selected = businessType === type.id;
            return (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setBusinessType(type.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selected 
                    ? 'border-amber-500 bg-amber-500/20' 
                    : 'border-amber-800/50 bg-amber-900/20 hover:border-amber-600'
                }`}
                data-testid={`business-type-${type.id}`}
              >
                <Icon className={`w-6 h-6 mb-2 ${selected ? 'text-amber-400' : 'text-amber-500/70'}`} />
                <p className={`font-medium ${selected ? 'text-amber-100' : 'text-amber-200/80'}`}>
                  {type.label}
                </p>
              </motion.button>
            );
          })}
        </div>
      ),
    },
    {
      title: "How big are your typical meetings?",
      subtitle: "We'll suggest the right order quantities",
      content: (
        <div className="space-y-3">
          {MEETING_SIZES.map((size) => {
            const selected = meetingSize === size.id;
            return (
              <motion.button
                key={size.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setMeetingSize(size.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                  selected 
                    ? 'border-amber-500 bg-amber-500/20' 
                    : 'border-amber-800/50 bg-amber-900/20 hover:border-amber-600'
                }`}
                data-testid={`meeting-size-${size.id}`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-5 h-5 ${selected ? 'text-amber-400' : 'text-amber-500/70'}`} />
                  <div>
                    <p className={`font-medium ${selected ? 'text-amber-100' : 'text-amber-200/80'}`}>
                      {size.label}
                    </p>
                    <p className="text-sm text-amber-300/60">{size.description}</p>
                  </div>
                </div>
                {selected && <Check className="w-5 h-5 text-amber-400" />}
              </motion.button>
            );
          })}
        </div>
      ),
    },
    {
      title: "When do you usually need deliveries?",
      subtitle: "Select all that apply",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {DELIVERY_WINDOWS.map((window) => {
            const selected = deliveryWindows.includes(window.id);
            return (
              <motion.button
                key={window.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleDeliveryWindow(window.id)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selected 
                    ? 'border-amber-500 bg-amber-500/20' 
                    : 'border-amber-800/50 bg-amber-900/20 hover:border-amber-600'
                }`}
                data-testid={`delivery-window-${window.id}`}
              >
                <Clock className={`w-5 h-5 mb-2 ${selected ? 'text-amber-400' : 'text-amber-500/70'}`} />
                <p className={`font-medium ${selected ? 'text-amber-100' : 'text-amber-200/80'}`}>
                  {window.label}
                </p>
                <p className="text-sm text-amber-300/60">{window.time}</p>
              </motion.button>
            );
          })}
        </div>
      ),
    },
    {
      title: "What are you interested in?",
      subtitle: "Select your favorite categories",
      content: (
        <div className="space-y-3">
          {VENDOR_CATEGORIES.map((category) => {
            const selected = vendorCategories.includes(category.id);
            return (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleVendorCategory(category.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between ${
                  selected 
                    ? 'border-amber-500 bg-amber-500/20' 
                    : 'border-amber-800/50 bg-amber-900/20 hover:border-amber-600'
                }`}
                data-testid={`vendor-category-${category.id}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.emoji}</span>
                  <p className={`font-medium ${selected ? 'text-amber-100' : 'text-amber-200/80'}`}>
                    {category.label}
                  </p>
                </div>
                {selected && <Check className="w-5 h-5 text-amber-400" />}
              </motion.button>
            );
          })}
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-lg border-0 bg-gradient-to-br from-[#1a0f09] via-[#2d1810] to-[#3d2418] p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full transition-all ${
                    i <= step ? 'bg-amber-500' : 'bg-amber-800/50'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onComplete}
              className="text-amber-400/60 hover:text-amber-400 hover:bg-transparent"
              data-testid="button-skip-wizard"
            >
              Skip
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-serif font-bold text-amber-100 mb-1">
                {steps[step].title}
              </h2>
              <p className="text-amber-300/70 mb-6">{steps[step].subtitle}</p>
              
              <div className="min-h-[280px]">
                {steps[step].content}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="border-amber-700 text-amber-300 hover:bg-amber-900/50"
              data-testid="button-wizard-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || saveProfile.isPending}
              className="bg-amber-600 hover:bg-amber-500 text-white"
              data-testid="button-wizard-next"
            >
              {step === steps.length - 1 ? (
                saveProfile.isPending ? 'Saving...' : 'Get Started'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
