import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronLeft,
  Shield,
  Search,
  FileCheck,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle,
  Hash,
  QrCode,
  Download,
  Eye,
  Sparkles,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";

interface Hallmark {
  id: number;
  serialNumber: string;
  prefix: string;
  assetType: string;
  assetName?: string;
  userId?: string;
  issuedBy: string;
  isCompanyHallmark: boolean;
  contentHash: string;
  status: string;
  solanaTxSignature?: string;
  solanaNetwork?: string;
  solanaSlot?: number;
  solanaConfirmedAt?: string;
  verificationCount: number;
  lastVerifiedAt?: string;
  issuedAt: string;
}

interface HallmarkProfile {
  id: number;
  userId: string;
  hallmarkPrefix: string;
  isMinted: boolean;
  mintedAt?: string;
  documentsStampedThisMonth: number;
  totalDocumentsStamped: number;
  avatarData?: string;
}

interface LimitInfo {
  tier: string;
  allowed: boolean;
  remaining: number;
  limit: number;
}

export default function MyHallmarksPage() {
  const { toast } = useToast();
  const [hallmarks, setHallmarks] = useState<Hallmark[]>([]);
  const [profile, setProfile] = useState<HallmarkProfile | null>(null);
  const [limits, setLimits] = useState<LimitInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedHallmark, setSelectedHallmark] = useState<Hallmark | null>(null);

  const userStr = localStorage.getItem("coffee_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    if (!userId) return;
    
    setIsRefreshing(true);
    try {
      const [hallmarksRes, profileRes, limitsRes] = await Promise.all([
        fetch(`/api/hallmark/user/${userId}`),
        fetch(`/api/hallmark/profile/${userId}`),
        fetch(`/api/hallmark/user/${userId}/limits`),
      ]);

      if (hallmarksRes.ok) {
        const data = await hallmarksRes.json();
        setHallmarks(data);
      }

      if (profileRes.ok) {
        const data = await profileRes.json();
        setProfile(data);
      }

      if (limitsRes.ok) {
        const data = await limitsRes.json();
        setLimits(data);
      }
    } catch (error) {
      console.error('Failed to fetch hallmarks:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filteredHallmarks = hallmarks.filter(h => {
    const matchesSearch = 
      h.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.contentHash.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || h.assetType === filterType;
    
    return matchesSearch && matchesType;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Hash copied to clipboard" });
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-amber-600" />
            <h2 className="font-serif text-2xl font-bold mb-2">Create an Account</h2>
            <p className="text-muted-foreground mb-6">
              To view your blockchain-verified documents, please create a free account with a 4-digit PIN.
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => window.location.href = "/dashboard?action=register"}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Create Account
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/dashboard?action=login"}
              >
                I Have an Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 luxury-pattern grain-overlay">
      <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover-3d" data-testid="button-back">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-3xl font-bold flex items-center gap-3"
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <span className="gradient-text">My Hallmarks</span>
              </motion.h1>
              <p className="text-muted-foreground mt-1">Your blockchain-verified documents</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href="/blockchain-tutorial">
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                Learn More
              </Button>
            </Link>
          </div>
        </header>

        {/* Profile & Stats */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="premium-card border-0 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent" />
              <CardContent className="p-6 relative">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                      {profile.hallmarkPrefix.slice(3, 5)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{profile.hallmarkPrefix}</h3>
                      <p className="text-sm text-muted-foreground">Your Personal Hallmark Prefix</p>
                      {profile.isMinted && (
                        <Badge className="mt-1 bg-emerald-500/10 text-emerald-700 border-emerald-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Minted
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold">{profile.totalDocumentsStamped}</p>
                      <p className="text-xs text-muted-foreground">Total Stamped</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{profile.documentsStampedThisMonth}</p>
                      <p className="text-xs text-muted-foreground">This Month</p>
                    </div>
                    {limits && (
                      <div>
                        <p className="text-2xl font-bold">
                          {limits.limit === Infinity ? '∞' : limits.remaining}
                        </p>
                        <p className="text-xs text-muted-foreground">Remaining</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by serial number, name, or content hash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-premium"
                data-testid="input-hallmark-search"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="receipt">Receipts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Hallmarks Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading your hallmarks...</p>
            </div>
          ) : filteredHallmarks.length === 0 ? (
            <Card className="premium-card border-0">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                  <Hash className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="font-serif text-xl font-bold mb-2">No Hallmarks Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery 
                    ? "No hallmarks match your search. Try adjusting your filters."
                    : "Start verifying your documents with blockchain hallmarks. Each hallmark creates an immutable record on Solana."}
                </p>
                {!profile?.isMinted && (
                  <Link href="/pricing">
                    <Button className="btn-premium text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Get Your Personal Hallmark
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredHallmarks.map((hallmark, index) => (
                <motion.div
                  key={hallmark.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="premium-card border-0 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setSelectedHallmark(hallmark)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="font-mono text-sm font-semibold text-emerald-700">
                              {hallmark.serialNumber}
                            </code>
                            <Badge variant="outline" className="text-[10px]">
                              {hallmark.assetType}
                            </Badge>
                            {hallmark.solanaTxSignature && (
                              <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-200 text-[10px]">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                On-Chain
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium mb-1">{hallmark.assetName || 'Untitled Document'}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate max-w-md">
                            {hallmark.contentHash.slice(0, 32)}...
                          </p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p className="flex items-center gap-1 justify-end">
                            <Clock className="h-3 w-3" />
                            {new Date(hallmark.issuedAt).toLocaleDateString()}
                          </p>
                          <p className="flex items-center gap-1 justify-end mt-1">
                            <Eye className="h-3 w-3" />
                            {hallmark.verificationCount} views
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Hallmark Detail Dialog */}
        <Dialog open={!!selectedHallmark} onOpenChange={() => setSelectedHallmark(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                Document Verification
              </DialogTitle>
            </DialogHeader>
            {selectedHallmark && (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCode
                    value={`${window.location.origin}/verify/${selectedHallmark.serialNumber}`}
                    size={150}
                  />
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200">
                  <p className="text-xs text-muted-foreground mb-1">Serial Number</p>
                  <code className="font-mono text-lg font-bold text-emerald-700">
                    {selectedHallmark.serialNumber}
                  </code>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Asset Type</p>
                    <p className="text-sm font-medium">{selectedHallmark.assetType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge className={selectedHallmark.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}>
                      {selectedHallmark.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Issued</p>
                    <p className="text-sm font-medium">{new Date(selectedHallmark.issuedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Verifications</p>
                    <p className="text-sm font-medium">{selectedHallmark.verificationCount}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Content Hash (SHA-256)</p>
                  <div 
                    className="text-xs font-mono text-muted-foreground break-all bg-muted p-2 rounded cursor-pointer hover:bg-muted/80"
                    onClick={() => copyToClipboard(selectedHallmark.contentHash)}
                  >
                    {selectedHallmark.contentHash}
                  </div>
                </div>

                {selectedHallmark.solanaTxSignature && (
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
                    <p className="text-xs text-emerald-600 mb-2 flex items-center gap-1 font-semibold">
                      <CheckCircle className="h-3 w-3" />
                      Blockchain Verified
                    </p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Transaction</p>
                        <code className="text-xs font-mono text-emerald-700 break-all">
                          {selectedHallmark.solanaTxSignature.slice(0, 32)}...
                        </code>
                      </div>
                      <div className="flex gap-4 text-xs">
                        <div>
                          <p className="text-muted-foreground">Network</p>
                          <p className="font-medium">{selectedHallmark.solanaNetwork}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Slot</p>
                          <p className="font-medium">{selectedHallmark.solanaSlot}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Link href={`/verify/${selectedHallmark.serialNumber}`} className="flex-1">
                    <Button className="w-full">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Public Verification Page
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
