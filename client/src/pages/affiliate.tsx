import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Copy, Check, Share2, Gift, TrendingUp, Users, DollarSign, Award, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { staggerContainer, staggerItem, PageSpinner } from "@/components/ui/loading-skeletons";

const TIER_COLORS: Record<string, string> = {
  base: "text-amber-400 bg-amber-900/30 border-amber-700/40",
  silver: "text-gray-300 bg-gray-700/30 border-gray-500/40",
  gold: "text-yellow-300 bg-yellow-900/30 border-yellow-600/40",
  platinum: "text-cyan-300 bg-cyan-900/30 border-cyan-600/40",
  diamond: "text-purple-300 bg-purple-900/30 border-purple-500/40",
};

const TIER_TABLE = [
  { tier: "Base", min: 0, rate: "10%" },
  { tier: "Silver", min: 5, rate: "12.5%" },
  { tier: "Gold", min: 15, rate: "15%" },
  { tier: "Platinum", min: 30, rate: "17.5%" },
  { tier: "Diamond", min: 50, rate: "20%" },
];

export default function AffiliatePage() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const params = useParams<{ hash?: string }>();

  const storedUser = localStorage.getItem("brew_board_user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (params.hash) {
      fetch("/api/affiliate/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralHash: params.hash, platform: "brewandboard" }),
      }).catch(() => {});
      localStorage.setItem("brew_board_referral_hash", params.hash);
    }
  }, [params.hash]);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["/api/affiliate/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/affiliate/dashboard", {
        headers: currentUser ? { "x-user-id": currentUser.id } : {},
      });
      if (!res.ok) throw new Error("Failed to load affiliate data");
      return res.json();
    },
    enabled: !!currentUser,
  });

  const payoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/affiliate/request-payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(currentUser ? { "x-user-id": currentUser.id } : {}),
        },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payout Requested",
        description: `${data.amount} SIG payout processing within 48 hours.`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "Payout Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const copyLink = () => {
    if (dashboard?.referralLink) {
      navigator.clipboard.writeText(dashboard.referralLink);
      setCopied(true);
      toast({ title: "Link Copied", description: "Referral link copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLink = async () => {
    if (navigator.share && dashboard?.referralLink) {
      try {
        await navigator.share({
          title: "Join me on Brew & Board Coffee",
          text: "Join me on Brew & Board Coffee — part of the Trust Layer ecosystem!",
          url: dashboard.referralLink,
        });
      } catch {}
    } else {
      copyLink();
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0f09] to-[#0d0705] flex items-center justify-center">
        <div className="text-center text-amber-200">
          <p>Please log in to access the Affiliate Program.</p>
          <Link href="/">
            <Button className="mt-4 bg-amber-700 hover:bg-amber-600" data-testid="button-login-redirect">
              Go to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) return <PageSpinner message="Loading affiliate data..." />;

  const tier = dashboard?.tier;
  const stats = dashboard?.stats;
  const tierColorClass = tier ? TIER_COLORS[tier.tier] || TIER_COLORS.base : TIER_COLORS.base;

  const nextTierEntry = TIER_TABLE.find(
    (t) => t.min > (stats?.convertedReferrals || 0)
  );
  const progressToNext = nextTierEntry
    ? Math.min(100, ((stats?.convertedReferrals || 0) / nextTierEntry.min) * 100)
    : 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f09] to-[#0d0705] text-amber-100 p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="hover:bg-amber-900/30" data-testid="button-back-dashboard">
            <ArrowLeft className="h-5 w-5 text-amber-400" />
          </Button>
        </Link>
        <h1 className="font-serif text-2xl text-amber-100" data-testid="text-affiliate-title">
          Share & Earn
        </h1>
      </div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
        <motion.div variants={staggerItem} className={`rounded-2xl border p-5 ${tierColorClass}`} data-testid="card-tier-badge">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70">Current Tier</p>
              <p className="text-2xl font-serif font-bold flex items-center gap-2">
                <Award className="h-6 w-6" />
                {tier?.label || "Base"}
              </p>
              <p className="text-sm mt-1">
                {(tier?.rate || 0.1) * 100}% commission rate
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-60">Converted Referrals</p>
              <p className="text-3xl font-bold" data-testid="text-converted-count">
                {stats?.convertedReferrals || 0}
              </p>
            </div>
          </div>

          {nextTierEntry && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress to {nextTierEntry.tier}</span>
                <span>
                  {stats?.convertedReferrals || 0}/{nextTierEntry.min}
                </span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-500 to-amber-300 h-2 rounded-full transition-all"
                  style={{ width: `${progressToNext}%` }}
                  data-testid="progress-tier"
                />
              </div>
            </div>
          )}
        </motion.div>

        <motion.div variants={staggerItem} className="bg-gradient-to-br from-[#1a0f09]/80 to-[#2d1810]/60 border border-amber-900/30 rounded-2xl p-5" data-testid="card-referral-link">
          <h3 className="font-serif text-lg mb-3 flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-500" />
            Your Referral Link
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-sm text-amber-200/80 truncate font-mono" data-testid="text-referral-link">
              {dashboard?.referralLink || "Loading..."}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-amber-900/30 shrink-0"
              onClick={copyLink}
              data-testid="button-copy-link"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-400" />
              ) : (
                <Copy className="h-4 w-4 text-amber-400" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="hover:bg-amber-900/30 shrink-0"
              onClick={shareLink}
              data-testid="button-share-link"
            >
              <Share2 className="h-4 w-4 text-amber-400" />
            </Button>
          </div>
          <p className="text-xs text-amber-200/50 mt-2">
            Your link works across all 32 Trust Layer ecosystem apps
          </p>
        </motion.div>

        <motion.div variants={staggerItem}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Referrals", value: stats?.totalReferrals || 0, icon: Users, id: "total-referrals" },
              { label: "Converted", value: stats?.convertedReferrals || 0, icon: TrendingUp, id: "converted" },
              { label: "Pending (SIG)", value: stats?.pendingEarnings || "0.00", icon: DollarSign, id: "pending" },
              { label: "Paid (SIG)", value: stats?.paidEarnings || "0.00", icon: Award, id: "paid" },
            ].map((stat) => (
              <div
                key={stat.id}
                className="bg-gradient-to-br from-[#1a0f09]/80 to-[#2d1810]/60 border border-amber-900/30 rounded-xl p-3 stat-shimmer"
                data-testid={`stat-${stat.id}`}
              >
                <stat.icon className="h-4 w-4 text-amber-500 mb-1" />
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-amber-200/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="bg-gradient-to-br from-[#1a0f09]/80 to-[#2d1810]/60 border border-amber-900/30 rounded-2xl p-5" data-testid="card-tier-table">
          <h3 className="font-serif text-lg mb-3">Commission Tiers</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-900/30 text-amber-200/60">
                  <th className="text-left py-2">Tier</th>
                  <th className="text-left py-2">Min Referrals</th>
                  <th className="text-left py-2">Rate</th>
                </tr>
              </thead>
              <tbody>
                {TIER_TABLE.map((t) => (
                  <tr
                    key={t.tier}
                    className={`border-b border-amber-900/20 ${
                      tier?.label === t.tier ? "bg-amber-900/20" : ""
                    }`}
                    data-testid={`row-tier-${t.tier.toLowerCase()}`}
                  >
                    <td className="py-2 font-medium">
                      {t.tier}
                      {tier?.label === t.tier && (
                        <span className="ml-2 text-xs text-amber-500">
                          (current)
                        </span>
                      )}
                    </td>
                    <td className="py-2">{t.min}</td>
                    <td className="py-2">{t.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {dashboard?.commissions && dashboard.commissions.length > 0 && (
          <motion.div variants={staggerItem} className="bg-gradient-to-br from-[#1a0f09]/80 to-[#2d1810]/60 border border-amber-900/30 rounded-2xl p-5" data-testid="card-commissions">
            <h3 className="font-serif text-lg mb-3">Recent Commissions</h3>
            <div className="space-y-2">
              {dashboard.commissions.map((c: any) => (
                <div key={c.id} className="flex justify-between items-center text-sm border-b border-amber-900/20 pb-2" data-testid={`commission-${c.id}`}>
                  <div>
                    <span className="text-amber-200/60 capitalize">{c.tier}</span>
                    <span className="mx-2 text-amber-900/50">•</span>
                    <span className={c.status === "paid" ? "text-green-400" : "text-amber-400"}>
                      {c.status}
                    </span>
                  </div>
                  <span className="font-mono">{c.amount} SIG</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {dashboard?.referrals && dashboard.referrals.length > 0 && (
          <motion.div variants={staggerItem} className="bg-gradient-to-br from-[#1a0f09]/80 to-[#2d1810]/60 border border-amber-900/30 rounded-2xl p-5" data-testid="card-referrals-list">
            <h3 className="font-serif text-lg mb-3">Recent Referrals</h3>
            <div className="space-y-2">
              {dashboard.referrals.map((r: any) => (
                <div key={r.id} className="flex justify-between items-center text-sm border-b border-amber-900/20 pb-2" data-testid={`referral-${r.id}`}>
                  <span className="text-amber-200/60">{r.platform}</span>
                  <span className={r.status === "converted" ? "text-green-400" : "text-amber-400"}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div variants={staggerItem}>
          <Button
            className="w-full bg-amber-700 hover:bg-amber-600 text-white"
            disabled={!dashboard?.canRequestPayout || payoutMutation.isPending}
            onClick={() => payoutMutation.mutate()}
            data-testid="button-request-payout"
          >
            {payoutMutation.isPending
              ? "Processing..."
              : `Request Payout (min ${10} SIG)`}
          </Button>
          {!dashboard?.canRequestPayout && (
            <p className="text-xs text-amber-200/40 text-center mt-2">
              You need at least 10 SIG in pending earnings to request a payout
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
