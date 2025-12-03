import { motion } from "framer-motion";
import { Check, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "$29",
      description: "Perfect for small teams and occasional meetings.",
      features: ["10 orders/month", "Standard support", "Basic analytics", "1 User"],
      highlight: false
    },
    {
      name: "Professional",
      price: "$79",
      description: "For growing businesses with regular client meetings.",
      features: ["50 orders/month", "Priority scheduling", "Phone support", "Advanced analytics", "5 Users"],
      highlight: true
    },
    {
      name: "Enterprise",
      price: "$199",
      description: "Unlimited access for large organizations.",
      features: ["Unlimited orders", "Dedicated account manager", "Custom integrations", "SLA guarantee", "Unlimited Users"],
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your meeting schedule. All plans include our premium Nashville coffee network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full flex flex-col ${tier.highlight ? 'border-primary shadow-lg scale-105 relative z-10' : 'border-border/50'}`}>
                {tier.highlight && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="font-serif text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4 mb-2">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className={`w-full ${tier.highlight ? 'bg-primary hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                    {tier.name === "Enterprise" ? "Contact Sales" : "Start Trial"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-16 text-center bg-muted/30 rounded-2xl p-8">
          <h3 className="font-serif text-xl font-bold mb-2">Need a custom solution?</h3>
          <p className="text-muted-foreground mb-6">We offer tailored packages for multi-location enterprises.</p>
          <Button variant="outline">Contact Support</Button>
        </div>
      </div>
    </div>
  );
}
