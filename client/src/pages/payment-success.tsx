import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Coffee, Crown, ArrowRight, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentSuccessPage() {
  const [, setLocation] = useLocation();
  const [paymentType, setPaymentType] = useState<string>('order');
  
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type) {
      setPaymentType(type);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 luxury-pattern grain-overlay flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="premium-card border-0 overflow-hidden">
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg"
            >
              <CheckCircle className="h-12 w-12 text-white" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="font-serif text-3xl font-bold gradient-text mb-3">
                {paymentType === 'subscription' ? 'Welcome to Brew & Board!' : 'Payment Successful!'}
              </h1>
              
              <p className="text-muted-foreground mb-8">
                {paymentType === 'subscription' ? (
                  <>Your subscription is now active. Enjoy your 14-day free trial with full access to all premium features.</>
                ) : (
                  <>Your order has been confirmed. We'll coordinate with the vendor and delivery service to ensure timely delivery.</>
                )}
              </p>
              
              {paymentType === 'subscription' && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 mb-6">
                  <div className="flex items-center justify-center gap-3">
                    <Crown className="h-6 w-6 text-amber-500" />
                    <span className="font-semibold text-amber-800">Premium Member</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-2">
                    Your service fee discounts are now active on all orders.
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <Link href="/dashboard">
                  <Button className="w-full btn-premium text-white" data-testid="button-go-dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
                {paymentType !== 'subscription' && (
                  <Link href="/schedule">
                    <Button variant="outline" className="w-full" data-testid="button-view-orders">
                      View My Orders
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t border-amber-100"
            >
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Coffee className="h-5 w-5" />
                <span className="text-sm">Thank you for choosing Brew & Board</span>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
