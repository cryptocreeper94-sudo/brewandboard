import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  AlertTriangle,
  ArrowUpCircle,
  CreditCard,
  Check,
  Sparkles,
  Calendar,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SUBSCRIPTION_TIERS, getSubscriptionTier, getUpgradeTier } from "@/lib/mock-data";

interface SubscriptionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: string;
  ordersUsed: number;
  orderTotal: number;
  renewalDate?: string;
  onUpgrade: () => void;
  onPayFullPrice: () => void;
}

export function SubscriptionLimitModal({
  isOpen,
  onClose,
  currentTier,
  ordersUsed,
  orderTotal,
  renewalDate,
  onUpgrade,
  onPayFullPrice,
}: SubscriptionLimitModalProps) {
  const tier = getSubscriptionTier(currentTier);
  const upgradeTier = getUpgradeTier(currentTier);
  
  if (!tier) return null;
  
  const orderLimit = tier.orderLimit;
  const overageDiscount = tier.overageDiscount;
  const discountedTotal = orderTotal * (1 - overageDiscount / 100);
  const savings = orderTotal - discountedTotal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-900">
            <div className="p-2 rounded-full bg-amber-100">
              <Coffee className="h-5 w-5 text-amber-700" />
            </div>
            You've Used All Your Monthly Orders
          </DialogTitle>
          <DialogDescription className="text-amber-700">
            Your {tier.name} plan includes {orderLimit} orders per month
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-100/50 border border-amber-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">Orders this month</span>
            </div>
            <Badge className="bg-amber-600 text-white">
              {ordersUsed} / {orderLimit}
            </Badge>
          </div>

          {upgradeTier && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl border-2 border-amber-400 bg-gradient-to-br from-amber-100 to-orange-100 shadow-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold text-amber-900">Upgrade to {upgradeTier.name}</span>
                </div>
                <Badge className="bg-emerald-500 text-white">
                  ${upgradeTier.price}/mo
                </Badge>
              </div>
              <ul className="space-y-2 mb-4">
                <li className="flex items-center gap-2 text-sm text-amber-800">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  {upgradeTier.orderLimit === -1 ? 'Unlimited orders' : `${upgradeTier.orderLimit} orders per month`}
                </li>
                <li className="flex items-center gap-2 text-sm text-amber-800">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  {upgradeTier.overageDiscount}% off all orders
                </li>
                {upgradeTier.id === 'professional' && (
                  <li className="flex items-center gap-2 text-sm text-amber-800">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    Priority delivery
                  </li>
                )}
                {upgradeTier.id === 'enterprise' && (
                  <li className="flex items-center gap-2 text-sm text-amber-800">
                    <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    Dedicated account manager
                  </li>
                )}
              </ul>
              <Button
                onClick={onUpgrade}
                className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md"
                data-testid="button-upgrade-plan"
              >
                <ArrowUpCircle className="h-4 w-4" />
                Upgrade Now
              </Button>
            </motion.div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-amber-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 bg-gradient-to-br from-amber-50 to-orange-50 text-sm text-amber-600">
                or
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/70 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-amber-900">Pay for this order</span>
              {overageDiscount > 0 && (
                <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50">
                  {overageDiscount}% subscriber discount
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-2xl font-bold text-amber-900">
                  ${discountedTotal.toFixed(2)}
                </p>
                {savings > 0 && (
                  <p className="text-xs text-emerald-600">
                    You save ${savings.toFixed(2)} with your subscription
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={onPayFullPrice}
              variant="outline"
              className="w-full gap-2 border-amber-300 text-amber-800 hover:bg-amber-100"
              data-testid="button-pay-overage"
            >
              <CreditCard className="h-4 w-4" />
              Continue with This Order
            </Button>
          </div>

          {renewalDate && (
            <p className="text-center text-xs text-amber-600">
              Your plan renews on {renewalDate}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function SubscriptionUsageBanner({
  currentTier,
  ordersUsed,
  onViewPlans,
}: {
  currentTier: string;
  ordersUsed: number;
  onViewPlans?: () => void;
}) {
  const tier = getSubscriptionTier(currentTier);
  if (!tier || tier.orderLimit === -1) return null;
  
  const remaining = tier.orderLimit - ordersUsed;
  const percentUsed = (ordersUsed / tier.orderLimit) * 100;
  const isLow = remaining <= 2 && remaining > 0;
  const isOut = remaining <= 0;

  if (!isLow && !isOut) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-3 rounded-lg flex items-center justify-between ${
        isOut 
          ? 'bg-red-50 border border-red-200' 
          : 'bg-amber-50 border border-amber-200'
      }`}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className={`h-4 w-4 ${isOut ? 'text-red-500' : 'text-amber-500'}`} />
        <span className={`text-sm font-medium ${isOut ? 'text-red-700' : 'text-amber-700'}`}>
          {isOut 
            ? `You've used all ${tier.orderLimit} orders this month`
            : `Only ${remaining} order${remaining === 1 ? '' : 's'} left this month`
          }
        </span>
      </div>
      {onViewPlans && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewPlans}
          className={isOut ? 'text-red-600 hover:text-red-700' : 'text-amber-600 hover:text-amber-700'}
          data-testid="button-view-plans-banner"
        >
          Upgrade
        </Button>
      )}
    </motion.div>
  );
}
