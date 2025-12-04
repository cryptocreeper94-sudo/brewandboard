import { useState, useEffect } from "react";
import { CreditCard, Bitcoin, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface PaymentCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description?: string;
  orderId?: string;
  onSuccess?: () => void;
}

export function PaymentCheckout({ isOpen, onClose, amount, description, orderId, onSuccess }: PaymentCheckoutProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<'stripe' | 'coinbase' | null>(null);
  const [stripeConfig, setStripeConfig] = useState<{ isConfigured: boolean } | null>(null);
  const [coinbaseConfig, setCoinbaseConfig] = useState<{ isConfigured: boolean } | null>(null);

  useEffect(() => {
    fetch('/api/config/stripe')
      .then(res => res.json())
      .then(data => setStripeConfig(data))
      .catch(() => setStripeConfig({ isConfigured: false }));
    
    fetch('/api/config/coinbase')
      .then(res => res.json())
      .then(data => setCoinbaseConfig(data))
      .catch(() => setCoinbaseConfig({ isConfigured: false }));
  }, []);

  const getUser = () => {
    const storedUser = localStorage.getItem('coffee_user');
    return storedUser ? JSON.parse(storedUser) : null;
  };

  const handleStripePayment = async () => {
    const user = getUser();
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a payment.",
        variant: "destructive"
      });
      return;
    }

    setLoading('stripe');
    try {
      const response = await fetch('/api/payments/create-order-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          orderId,
          amount: amount.toFixed(2),
          description: description || 'Coffee Talk Order',
          successUrl: `${window.location.origin}/payment-success?type=order`,
          cancelUrl: window.location.href
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const handleCoinbasePayment = async () => {
    const user = getUser();
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to make a payment.",
        variant: "destructive"
      });
      return;
    }

    setLoading('coinbase');
    try {
      const response = await fetch('/api/payments/create-coinbase-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          orderId,
          amount: amount.toFixed(2),
          description: description || 'Coffee Talk Order',
          successUrl: `${window.location.origin}/payment-success?type=order`,
          cancelUrl: window.location.href
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create crypto checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const neitherConfigured = !stripeConfig?.isConfigured && !coinbaseConfig?.isConfigured;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Complete Payment</DialogTitle>
          <DialogDescription>
            Choose your preferred payment method to complete your order.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="text-center mb-6 p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
            <p className="text-sm text-muted-foreground">Order Total</p>
            <p className="text-3xl font-bold gradient-text">${amount.toFixed(2)}</p>
          </div>

          {neitherConfigured ? (
            <div className="text-center p-6 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-muted-foreground">
                Payment methods are being configured. Please check back soon or contact support.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stripeConfig?.isConfigured && (
                <Button
                  className="w-full h-14 text-lg gap-3"
                  onClick={handleStripePayment}
                  disabled={loading !== null}
                  data-testid="button-pay-stripe"
                >
                  {loading === 'stripe' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CreditCard className="h-5 w-5" />
                  )}
                  Pay with Card
                  <ExternalLink className="h-4 w-4 ml-auto opacity-50" />
                </Button>
              )}

              {coinbaseConfig?.isConfigured && (
                <Button
                  variant="outline"
                  className="w-full h-14 text-lg gap-3 border-orange-200 hover:bg-orange-50"
                  onClick={handleCoinbasePayment}
                  disabled={loading !== null}
                  data-testid="button-pay-crypto"
                >
                  {loading === 'coinbase' ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Bitcoin className="h-5 w-5 text-orange-500" />
                  )}
                  Pay with Crypto
                  <span className="text-xs text-muted-foreground ml-auto">BTC, ETH, USDC</span>
                </Button>
              )}

              {!coinbaseConfig?.isConfigured && stripeConfig?.isConfigured && (
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Crypto payments coming soon
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
