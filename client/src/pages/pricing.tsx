import { motion } from "framer-motion";
import { Check, ArrowLeft, Coffee, Sparkles, Crown, Percent, Info, ChevronLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_TIERS, SERVICE_FEE_PERCENT, DELIVERY_COORDINATION_FEE } from "@/lib/mock-data";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 luxury-pattern grain-overlay py-12 px-4">
      <div className="container mx-auto max-w-6xl relative z-10">
        <header className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover-3d" data-testid="button-back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-4xl font-bold gradient-text flex items-center gap-3">
              <Crown className="h-8 w-8 text-amber-500" />
              Concierge Pricing
            </h1>
            <p className="text-muted-foreground">Premium coffee delivery service for Nashville businesses</p>
          </div>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card className="premium-card border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-transparent" />
            <CardContent className="p-8 relative">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-4 bg-amber-100 text-amber-700 border-amber-200">
                    <Percent className="h-3 w-3 mr-1" /> Pay-As-You-Go
                  </Badge>
                  <h2 className="font-serif text-3xl font-bold mb-4 gradient-text">
                    One-Time Orders
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    No commitment required. Pay only for what you order with a simple, transparent fee structure.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/60 border border-amber-100">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xl">{Math.round(SERVICE_FEE_PERCENT * 100)}%</span>
                      </div>
                      <div>
                        <p className="font-semibold">Service Fee</p>
                        <p className="text-sm text-muted-foreground">Applied to your product subtotal</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/60 border border-amber-100">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">${DELIVERY_COORDINATION_FEE.toFixed(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold">Delivery Coordination</p>
                        <p className="text-sm text-muted-foreground">Per order, covers DoorDash/Uber dispatch</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden md:flex justify-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="relative"
                  >
                    <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-amber-100 to-orange-200 flex items-center justify-center shadow-xl border border-amber-200">
                      <Coffee className="h-20 w-20 text-amber-600" />
                    </div>
                    <motion.div
                      className="absolute -bottom-4 -right-4 w-20 h-20 rounded-2xl bg-white shadow-lg border border-amber-100 flex flex-col items-center justify-center"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <span className="text-xs text-muted-foreground">Example</span>
                      <span className="text-lg font-bold text-amber-600">$50</span>
                      <span className="text-xs text-muted-foreground">+$12.50</span>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif font-bold mb-2 gradient-text">Subscription Plans</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Save on service fees and get premium features with a monthly subscription. You still pay for products separately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {SUBSCRIPTION_TIERS.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              data-testid={`pricing-tier-${tier.id}`}
            >
              <Card className={`h-full flex flex-col premium-card border-0 ${tier.highlight ? 'ring-2 ring-amber-400 shadow-2xl scale-105 relative z-10' : ''}`}>
                {tier.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-lg">
                    <Sparkles className="h-3 w-3" /> Best Value
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="font-serif text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4 mb-2">
                    <span className="text-5xl font-bold gradient-text">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription className="text-base">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-100 text-center">
                    <p className="text-sm font-medium text-amber-800">
                      {tier.serviceFeeDiscount === 1 
                        ? "No service fees" 
                        : `${Math.round(tier.serviceFeeDiscount * 100)}% off service fees`}
                    </p>
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start text-sm">
                        <Check className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full ${tier.highlight ? 'btn-premium text-white' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                    data-testid={`button-select-${tier.id}`}
                  >
                    {tier.id === "enterprise" ? "Contact Sales" : "Start Free Trial"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="premium-card rounded-2xl p-8 border-0"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold mb-2">How It Works</h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">1. Product Cost</p>
                  <p>You pay for coffee, pastries, and catering items at vendor prices. This goes directly to the coffee shop.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">2. Service Fee</p>
                  <p>A {Math.round(SERVICE_FEE_PERCENT * 100)}% fee covers our platform, vendor coordination, and quality assurance. Subscribers get discounts!</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">3. Delivery</p>
                  <p>${DELIVERY_COORDINATION_FEE} per order for DoorDash/Uber dispatch. Professional subscribers get free delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
            <Crown className="h-5 w-5 text-amber-600" />
            <span className="text-amber-800 font-medium">
              All subscriptions include a 14-day free trial
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
