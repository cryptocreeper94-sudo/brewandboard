import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Users, 
  Plus, 
  ChevronRight,
  Mail,
  Shield,
  DollarSign,
  Settings,
  UserPlus,
  Crown,
  Building2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "admin" | "manager" | "member";
  spendingLimit?: number;
  ordersThisMonth: number;
  totalSpent: number;
}

interface CompanyAccount {
  id: number;
  companyName: string;
  monthlyBudget: number;
  spentThisMonth: number;
  teamSize: number;
  members: TeamMember[];
}

const roleConfig = {
  admin: { label: "Admin", color: "bg-purple-100 text-purple-700", icon: Crown },
  manager: { label: "Manager", color: "bg-blue-100 text-blue-700", icon: Shield },
  member: { label: "Member", color: "bg-gray-100 text-gray-700", icon: Users }
};

export function TeamManagementWidget({ userId }: { userId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"manager" | "member">("member");
  const [spendLimit, setSpendLimit] = useState("");

  const { data: company, isLoading } = useQuery<CompanyAccount>({
    queryKey: ["/api/company", userId],
    queryFn: async () => {
      const res = await fetch(`/api/company/${userId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!userId,
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/company/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: company?.id,
          email: inviteEmail,
          role: inviteRole,
          spendingLimit: spendLimit ? parseFloat(spendLimit) : undefined
        }),
      });
      if (!res.ok) throw new Error("Failed to send invite");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Invite sent!" });
      setShowInvite(false);
      setInviteEmail("");
      setSpendLimit("");
      queryClient.invalidateQueries({ queryKey: ["/api/company"] });
    },
    onError: () => {
      toast({ 
        title: "Failed to send invite", 
        variant: "destructive" 
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border-indigo-500/20">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Users className="h-5 w-5 text-indigo-500" />
          </motion.div>
          <span className="font-serif">Loading Team...</span>
        </div>
      </Card>
    );
  }

  if (!company) {
    return (
      <Link href="/company/setup">
        <Card 
          className="p-4 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border-indigo-500/20 cursor-pointer hover:shadow-md transition-shadow"
          data-testid="card-setup-company"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-sm">Set Up Company Account</h4>
                <p className="text-xs text-muted-foreground">Manage team ordering & budgets</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
      </Link>
    );
  }

  const budgetProgress = (company.spentThisMonth / company.monthlyBudget) * 100;

  return (
    <>
      <Card className="overflow-hidden bg-gradient-to-br from-indigo-500/5 to-blue-500/5 border-indigo-500/20">
        <div className="p-4 border-b border-indigo-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              <span className="font-serif text-lg">{company.companyName}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => setShowInvite(true)}
              data-testid="button-invite-member"
            >
              <UserPlus className="h-3 w-3" />
              Invite
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground">Monthly Budget</p>
              <p className="text-lg font-semibold">
                ${company.spentThisMonth.toLocaleString()} 
                <span className="text-sm text-muted-foreground font-normal">
                  / ${company.monthlyBudget.toLocaleString()}
                </span>
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px]">
              {company.teamSize} members
            </Badge>
          </div>

          <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(budgetProgress, 100)}%` }}
              className={`h-full ${
                budgetProgress > 90 ? "bg-red-500" :
                budgetProgress > 70 ? "bg-amber-500" : "bg-emerald-500"
              }`}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Team Members</p>
            <div className="flex -space-x-2">
              {company.members.slice(0, 5).map((member) => (
                <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="text-[10px] bg-gradient-to-br from-indigo-400 to-blue-500 text-white">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              {company.members.length > 5 && (
                <Avatar className="h-8 w-8 border-2 border-background">
                  <AvatarFallback className="text-[10px] bg-muted">
                    +{company.members.length - 5}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>

          <Link href="/company/manage">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4 text-xs gap-1"
              data-testid="button-manage-team"
            >
              <Settings className="h-3 w-3" />
              Manage Team
            </Button>
          </Link>
        </div>
      </Card>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-500" />
              Invite Team Member
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="pl-10"
                  data-testid="input-invite-email"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as "manager" | "member")}>
                <SelectTrigger className="mt-1" data-testid="select-invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Member - Can place orders</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="manager">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <span>Manager - Can approve & manage</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Spending Limit (Optional)</label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="No limit"
                  value={spendLimit}
                  onChange={(e) => setSpendLimit(e.target.value)}
                  className="pl-10"
                  data-testid="input-spend-limit"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Leave empty for no spending limit
              </p>
            </div>

            <Button
              onClick={() => inviteMutation.mutate()}
              disabled={!inviteEmail || inviteMutation.isPending}
              className="w-full shine-effect"
              style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
              data-testid="button-send-invite"
            >
              {inviteMutation.isPending ? "Sending..." : "Send Invite"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
