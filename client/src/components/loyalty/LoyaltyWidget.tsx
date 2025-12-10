import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Award, 
  Star, 
  Gift,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  Crown,
  Coffee
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface LoyaltyAccount {
  id: number;
  currentPoints: number;
  lifetimePoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  referralCode: string;
  referralCount: number;
  nextTierPoints?: number;
}

const tierConfig = {
  bronze: { 
    color: "from-amber-600 to-amber-800", 
    textColor: "text-amber-600",
    bgColor: "bg-amber-100",
    threshold: 0,
    nextThreshold: 500,
    perks: ["5% off all orders", "Priority support"]
  },
  silver: { 
    color: "from-gray-400 to-gray-600", 
    textColor: "text-gray-600",
    bgColor: "bg-gray-100",
    threshold: 500,
    nextThreshold: 1500,
    perks: ["10% off all orders", "Free delivery on orders $50+", "Early access to new vendors"]
  },
  gold: { 
    color: "from-yellow-400 to-yellow-600", 
    textColor: "text-yellow-600",
    bgColor: "bg-yellow-100",
    threshold: 1500,
    nextThreshold: 5000,
    perks: ["15% off all orders", "Free delivery always", "Exclusive vendor access", "Priority scheduling"]
  },
  platinum: { 
    color: "from-purple-400 to-purple-700", 
    textColor: "text-purple-600",
    bgColor: "bg-purple-100",
    threshold: 5000,
    nextThreshold: null,
    perks: ["20% off all orders", "Dedicated account manager", "Custom catering options", "VIP events access"]
  }
};

export function LoyaltyWidget({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: account, isLoading } = useQuery<LoyaltyAccount>({
    queryKey: ["/api/loyalty", userId],
    queryFn: async () => {
      const res = await fetch(`/api/loyalty/${userId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!userId,
  });

  const handleCopyReferral = () => {
    if (account?.referralCode) {
      navigator.clipboard.writeText(`https://brewandboard.coffee/join?ref=${account.referralCode}`);
      setCopied(true);
      toast({ title: "Referral link copied!" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Award className="h-5 w-5 text-amber-500" />
          </motion.div>
          <span className="font-serif">Loading Rewards...</span>
        </div>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card 
        className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowDetails(true)}
        data-testid="card-join-loyalty"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Join Brew Rewards</h4>
              <p className="text-xs text-muted-foreground">Earn points on every order</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </Card>
    );
  }

  const tier = tierConfig[account.tier];
  const progress = tier.nextThreshold 
    ? ((account.lifetimePoints - tier.threshold) / (tier.nextThreshold - tier.threshold)) * 100
    : 100;
  const pointsToNext = tier.nextThreshold 
    ? tier.nextThreshold - account.lifetimePoints
    : 0;

  return (
    <>
      <Card 
        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setShowDetails(true)}
        data-testid="card-loyalty-widget"
      >
        <div className={`h-2 bg-gradient-to-r ${tier.color}`} />
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {account.tier === "platinum" ? (
                  <Crown className={`h-5 w-5 ${tier.textColor}`} />
                ) : (
                  <Award className={`h-5 w-5 ${tier.textColor}`} />
                )}
              </motion.div>
              <span className="font-serif text-lg capitalize">{account.tier}</span>
            </div>
            <Badge className={`${tier.bgColor} ${tier.textColor} text-[10px]`}>
              {account.currentPoints.toLocaleString()} pts
            </Badge>
          </div>

          {tier.nextThreshold && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-[10px] text-muted-foreground text-right">
                {pointsToNext.toLocaleString()} pts to {
                  account.tier === "bronze" ? "Silver" :
                  account.tier === "silver" ? "Gold" : "Platinum"
                }
              </p>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3 w-3" />
              <span>{account.referralCount} referrals</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              View Perks <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Award className={`h-5 w-5 ${tier.textColor}`} />
              Brew Rewards
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className={`p-4 rounded-xl bg-gradient-to-br ${tier.color} text-white`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg font-serif capitalize">{account.tier} Member</span>
                {account.tier === "platinum" && (
                  <Crown className="h-6 w-6" />
                )}
              </div>
              <div className="text-3xl font-bold mb-1">
                {account.currentPoints.toLocaleString()}
              </div>
              <div className="text-sm text-white/80">Available Points</div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Your Perks</h4>
              <div className="space-y-2">
                {tier.perks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Refer a Friend</span>
                <Badge variant="secondary" className="text-[10px]">
                  100 pts each
                </Badge>
              </div>
              <div className="flex gap-2">
                <code className="flex-1 bg-background border rounded px-3 py-2 text-xs truncate">
                  brewandboard.coffee/join?ref={account.referralCode}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyReferral();
                  }}
                  data-testid="button-copy-referral"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {tier.nextThreshold && (
              <div className="text-center text-sm text-muted-foreground">
                <Coffee className="h-4 w-4 inline mr-1" />
                Order {Math.ceil(pointsToNext / 10)} more times to reach {
                  account.tier === "bronze" ? "Silver" :
                  account.tier === "silver" ? "Gold" : "Platinum"
                }
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
