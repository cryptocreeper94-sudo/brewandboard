import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  MapPin,
  ShoppingCart,
  TrendingUp,
  Palette,
  Globe,
  Edit3,
  Save,
  Check,
  Copy,
  RefreshCw,
  ChevronRight,
  Crown,
  BarChart3,
  Calendar,
  DollarSign,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

interface Franchise {
  id: string;
  franchiseId: string;
  ownerName: string;
  ownerEmail: string;
  ownerCompany: string | null;
  regionName: string;
  regionCode: string;
  status: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  heroText?: string;
  customDomain?: string;
  faviconUrl?: string;
}

interface FranchiseAnalytics {
  totalOrders: number;
  totalRevenue: string;
  completedOrders: number;
  avgOrderValue: string;
  topVendors: Array<{ name: string; orders: number; revenue: number }>;
}

interface StaffMember {
  id: string;
  name: string;
  email: string;
  franchiseRole: string;
}

export function FranchiseAdminPanel() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<Franchise | null>(null);
  const [analytics, setAnalytics] = useState<FranchiseAnalytics | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingBranding, setEditingBranding] = useState(false);
  const [brandingForm, setBrandingForm] = useState({
    logoUrl: "",
    primaryColor: "#5c4033",
    secondaryColor: "#8b6914",
    accentColor: "#d4a574",
    fontFamily: "Playfair Display",
    heroText: "",
    customDomain: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadFranchises();
  }, []);

  const loadFranchises = async () => {
    try {
      const res = await fetch("/api/franchises");
      if (res.ok) {
        const data = await res.json();
        setFranchises(data);
        if (data.length > 0 && !selectedFranchise) {
          selectFranchise(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load franchises:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectFranchise = async (franchise: Franchise) => {
    setSelectedFranchise(franchise);
    setBrandingForm({
      logoUrl: franchise.logoUrl || "",
      primaryColor: franchise.primaryColor || "#5c4033",
      secondaryColor: franchise.secondaryColor || "#8b6914",
      accentColor: franchise.accentColor || "#d4a574",
      fontFamily: franchise.fontFamily || "Playfair Display",
      heroText: franchise.heroText || "",
      customDomain: franchise.customDomain || "",
    });
    await Promise.all([
      loadAnalytics(franchise.id),
      loadStaff(franchise.id)
    ]);
  };

  const loadAnalytics = async (franchiseId: string) => {
    try {
      const res = await fetch(`/api/franchises/${franchiseId}/analytics?range=30days`);
      if (res.ok) {
        setAnalytics(await res.json());
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
    }
  };

  const loadStaff = async (franchiseId: string) => {
    try {
      const res = await fetch(`/api/franchises/${franchiseId}/staff`);
      if (res.ok) {
        setStaff(await res.json());
      }
    } catch (error) {
      console.error("Failed to load staff:", error);
    }
  };

  const saveBranding = async () => {
    if (!selectedFranchise) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/franchises/${selectedFranchise.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandingForm)
      });
      if (res.ok) {
        toast({
          title: "Branding Saved",
          description: "White-label branding has been updated."
        });
        setEditingBranding(false);
        loadFranchises();
      } else {
        throw new Error("Failed to save branding");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save branding settings.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      owner: "bg-purple-100 text-purple-800",
      manager: "bg-blue-100 text-blue-800",
      staff: "bg-gray-100 text-gray-800",
      customer: "bg-amber-100 text-amber-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <Card className="border rounded-xl bg-white/50 backdrop-blur">
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-600" />
          <p className="text-gray-500 mt-2">Loading franchises...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border rounded-xl bg-white/50 backdrop-blur overflow-hidden" data-testid="franchise-admin-panel">
      <CardHeader className="bg-gradient-to-r from-amber-900 to-amber-700 text-white">
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5" />
          Franchise Administration
        </CardTitle>
        <CardDescription className="text-amber-100">
          Manage multi-tenant franchises, white-label branding, and regional operations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {franchises.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-gray-300" />
            <h3 className="text-lg font-medium text-gray-600 mt-4">No Franchises Yet</h3>
            <p className="text-gray-500 mt-2">Franchise opportunities are coming soon.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Franchises</h3>
              <div className="space-y-2">
                {franchises.map((f) => (
                  <motion.div
                    key={f.id}
                    whileHover={{ x: 4 }}
                    onClick={() => selectFranchise(f)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedFranchise?.id === f.id
                        ? "bg-amber-100 border-2 border-amber-500"
                        : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                    }`}
                    data-testid={`franchise-card-${f.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{f.regionName}</p>
                        <p className="text-sm text-gray-500">{f.franchiseId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(f.status)}>{f.status}</Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {selectedFranchise && (
              <div className="lg:col-span-2">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview" className="gap-1" data-testid="tab-overview">
                      <BarChart3 className="w-4 h-4" />
                      <span className="hidden sm:inline">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger value="branding" className="gap-1" data-testid="tab-branding">
                      <Palette className="w-4 h-4" />
                      <span className="hidden sm:inline">Branding</span>
                    </TabsTrigger>
                    <TabsTrigger value="team" className="gap-1" data-testid="tab-team">
                      <Users className="w-4 h-4" />
                      <span className="hidden sm:inline">Team</span>
                    </TabsTrigger>
                    <TabsTrigger value="regions" className="gap-1" data-testid="tab-regions">
                      <MapPin className="w-4 h-4" />
                      <span className="hidden sm:inline">Regions</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-blue-600">
                            <ShoppingCart className="w-4 h-4" />
                            <span className="text-xs font-medium">Total Orders</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-900 mt-1">
                            {analytics?.totalOrders || 0}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-green-600">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs font-medium">Revenue</span>
                          </div>
                          <p className="text-2xl font-bold text-green-900 mt-1">
                            ${analytics?.totalRevenue || "0.00"}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-purple-600">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-medium">Completed</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-900 mt-1">
                            {analytics?.completedOrders || 0}
                          </p>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gradient-to-br from-amber-50 to-amber-100">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 text-amber-600">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-xs font-medium">Avg Order</span>
                          </div>
                          <p className="text-2xl font-bold text-amber-900 mt-1">
                            ${analytics?.avgOrderValue || "0.00"}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {analytics?.topVendors && analytics.topVendors.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Top Vendors</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {analytics.topVendors.map((v, i) => (
                              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                <span className="font-medium">{v.name}</span>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>{v.orders} orders</span>
                                  <span className="font-medium text-green-600">${v.revenue.toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="branding" className="mt-4 space-y-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">White-Label Branding</CardTitle>
                          <CardDescription>Customize your franchise appearance</CardDescription>
                        </div>
                        {!editingBranding ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingBranding(true)}
                            data-testid="btn-edit-branding"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setEditingBranding(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm"
                              onClick={saveBranding}
                              disabled={saving}
                              data-testid="btn-save-branding"
                            >
                              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                              Save
                            </Button>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Logo URL</Label>
                            <Input
                              value={brandingForm.logoUrl}
                              onChange={(e) => setBrandingForm({...brandingForm, logoUrl: e.target.value})}
                              disabled={!editingBranding}
                              placeholder="https://example.com/logo.png"
                              data-testid="input-logo-url"
                            />
                          </div>
                          <div>
                            <Label>Custom Domain</Label>
                            <Input
                              value={brandingForm.customDomain}
                              onChange={(e) => setBrandingForm({...brandingForm, customDomain: e.target.value})}
                              disabled={!editingBranding}
                              placeholder="nashville.brewandboard.coffee"
                              data-testid="input-custom-domain"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Primary Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={brandingForm.primaryColor}
                                onChange={(e) => setBrandingForm({...brandingForm, primaryColor: e.target.value})}
                                disabled={!editingBranding}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                value={brandingForm.primaryColor}
                                onChange={(e) => setBrandingForm({...brandingForm, primaryColor: e.target.value})}
                                disabled={!editingBranding}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Secondary Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={brandingForm.secondaryColor}
                                onChange={(e) => setBrandingForm({...brandingForm, secondaryColor: e.target.value})}
                                disabled={!editingBranding}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                value={brandingForm.secondaryColor}
                                onChange={(e) => setBrandingForm({...brandingForm, secondaryColor: e.target.value})}
                                disabled={!editingBranding}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Accent Color</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={brandingForm.accentColor}
                                onChange={(e) => setBrandingForm({...brandingForm, accentColor: e.target.value})}
                                disabled={!editingBranding}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                value={brandingForm.accentColor}
                                onChange={(e) => setBrandingForm({...brandingForm, accentColor: e.target.value})}
                                disabled={!editingBranding}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Font Family</Label>
                            <Input
                              value={brandingForm.fontFamily}
                              onChange={(e) => setBrandingForm({...brandingForm, fontFamily: e.target.value})}
                              disabled={!editingBranding}
                              placeholder="Playfair Display"
                            />
                          </div>
                          <div>
                            <Label>Hero Text</Label>
                            <Input
                              value={brandingForm.heroText}
                              onChange={(e) => setBrandingForm({...brandingForm, heroText: e.target.value})}
                              disabled={!editingBranding}
                              placeholder="Nashville's Premium B2B Coffee"
                            />
                          </div>
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                          <div 
                            className="h-20 rounded-lg flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, ${brandingForm.primaryColor} 0%, ${brandingForm.secondaryColor} 100%)`
                            }}
                          >
                            <span 
                              className="text-white text-lg font-semibold"
                              style={{ fontFamily: brandingForm.fontFamily }}
                            >
                              {brandingForm.heroText || selectedFranchise.regionName}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="team" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Franchise Team</CardTitle>
                        <CardDescription>Staff members assigned to this franchise</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {staff.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <Users className="w-8 h-8 mx-auto text-gray-300" />
                            <p className="mt-2">No staff assigned yet</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {staff.map((s) => (
                              <div 
                                key={s.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                data-testid={`staff-row-${s.id}`}
                              >
                                <div>
                                  <p className="font-medium">{s.name || "Unnamed"}</p>
                                  <p className="text-sm text-gray-500">{s.email}</p>
                                </div>
                                <Badge className={getRoleBadge(s.franchiseRole)}>
                                  {s.franchiseRole || "staff"}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="regions" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Service Regions</CardTitle>
                        <CardDescription>Geographic territories managed by this franchise</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-gray-500">
                          <MapPin className="w-8 h-8 mx-auto text-gray-300" />
                          <p className="mt-2">Region management coming soon</p>
                          <p className="text-xs">Link regions to franchises for territory control</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
