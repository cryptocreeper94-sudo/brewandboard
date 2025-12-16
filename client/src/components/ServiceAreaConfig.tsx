import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, Edit, Save, X, DollarSign, Users, Crown, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

interface ServiceArea {
  id: string;
  name: string;
  ownerId?: string;
  zipCodes: string[];
  counties: string[];
  isActive: boolean;
  whiteGloveEnabled: boolean;
  doordashEnabled: boolean;
  whiteGloveMinLeadTime: number;
  standardMinLeadTime: number;
  createdAt: string;
}

interface PricingTier {
  id: string;
  serviceAreaId: string;
  tierName: string;
  minHeadcount: number;
  maxHeadcount: number;
  setupFeeCents: number;
  perPersonFeeCents: number;
  percentageFee: string;
  description: string;
  includesSetup: boolean;
  includesPresentation: boolean;
  includesCleanup: boolean;
  isActive: boolean;
  sortOrder: number;
}

export function ServiceAreaConfig() {
  const { toast } = useToast();
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArea, setEditingArea] = useState<string | null>(null);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaZips, setNewAreaZips] = useState("");
  const [newAreaCounties, setNewAreaCounties] = useState("");
  const [showNewAreaForm, setShowNewAreaForm] = useState(false);
  const [showNewTierForm, setShowNewTierForm] = useState<string | null>(null);

  const [newTier, setNewTier] = useState({
    tierName: "",
    minHeadcount: 1,
    maxHeadcount: 10,
    setupFeeCents: 5000,
    perPersonFeeCents: 0,
    percentageFee: "0",
    description: "",
    includesSetup: true,
    includesPresentation: false,
    includesCleanup: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [areasRes, tiersRes] = await Promise.all([
        fetch("/api/service-areas"),
        fetch("/api/white-glove/pricing")
      ]);
      
      const areas = await areasRes.json();
      const tiers = await tiersRes.json();
      
      setServiceAreas(areas);
      setPricingTiers(tiers);
    } catch (error) {
      toast({ title: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const createServiceArea = async () => {
    if (!newAreaName.trim()) {
      toast({ title: "Please enter an area name", variant: "destructive" });
      return;
    }

    try {
      const res = await fetch("/api/service-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAreaName,
          zipCodes: newAreaZips.split(",").map(z => z.trim()).filter(Boolean),
          counties: newAreaCounties.split(",").map(c => c.trim()).filter(Boolean),
          isActive: true,
          whiteGloveEnabled: true,
          doordashEnabled: true,
          whiteGloveMinLeadTime: 24,
          standardMinLeadTime: 2
        })
      });

      if (!res.ok) throw new Error("Failed to create");
      
      toast({ title: "Service area created!" });
      setNewAreaName("");
      setNewAreaZips("");
      setNewAreaCounties("");
      setShowNewAreaForm(false);
      fetchData();
    } catch (error) {
      toast({ title: "Failed to create service area", variant: "destructive" });
    }
  };

  const updateServiceArea = async (id: string, updates: Partial<ServiceArea>) => {
    try {
      await fetch(`/api/service-areas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      toast({ title: "Service area updated" });
      fetchData();
    } catch (error) {
      toast({ title: "Failed to update", variant: "destructive" });
    }
  };

  const deleteServiceArea = async (id: string) => {
    if (!confirm("Delete this service area?")) return;
    
    try {
      await fetch(`/api/service-areas/${id}`, { method: "DELETE" });
      toast({ title: "Service area deleted" });
      fetchData();
    } catch (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const createPricingTier = async (serviceAreaId: string) => {
    try {
      const res = await fetch("/api/white-glove/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTier,
          serviceAreaId,
          isActive: true,
          sortOrder: pricingTiers.filter(t => t.serviceAreaId === serviceAreaId).length
        })
      });

      if (!res.ok) throw new Error("Failed to create");
      
      toast({ title: "Pricing tier created!" });
      setNewTier({
        tierName: "",
        minHeadcount: 1,
        maxHeadcount: 10,
        setupFeeCents: 5000,
        perPersonFeeCents: 0,
        percentageFee: "0",
        description: "",
        includesSetup: true,
        includesPresentation: false,
        includesCleanup: false
      });
      setShowNewTierForm(null);
      fetchData();
    } catch (error) {
      toast({ title: "Failed to create pricing tier", variant: "destructive" });
    }
  };

  const deletePricingTier = async (id: string) => {
    if (!confirm("Delete this pricing tier?")) return;
    
    try {
      await fetch(`/api/white-glove/pricing/${id}`, { method: "DELETE" });
      toast({ title: "Pricing tier deleted" });
      fetchData();
    } catch (error) {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-[#2a1810]/90 to-[#1a0f09]/90 border-[#5c4033]/30">
        <CardContent className="p-8 text-center text-[#a0896c]">
          Loading service area configuration...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[#2a1810]/90 to-[#1a0f09]/90 border-[#5c4033]/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[#c4a47c] flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Service Area Configuration
              </CardTitle>
              <CardDescription className="text-[#a0896c]">
                Configure delivery zones and White Glove pricing
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowNewAreaForm(!showNewAreaForm)}
              className="bg-[#5c4033] hover:bg-[#6d5040] text-white"
              data-testid="button-add-service-area"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service Area
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showNewAreaForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-4 mb-6 rounded-lg bg-[#1a0f09]/50 border border-[#5c4033]/30"
            >
              <h4 className="text-[#c4a47c] font-semibold mb-4">New Service Area</h4>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-[#c4a47c]">Area Name</Label>
                  <Input
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    placeholder="e.g., Nashville Metro"
                    className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
                    data-testid="input-new-area-name"
                  />
                </div>
                <div>
                  <Label className="text-[#c4a47c]">Zip Codes (comma-separated)</Label>
                  <Input
                    value={newAreaZips}
                    onChange={(e) => setNewAreaZips(e.target.value)}
                    placeholder="37201, 37203, 37212"
                    className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
                    data-testid="input-new-area-zips"
                  />
                </div>
                <div>
                  <Label className="text-[#c4a47c]">Counties (comma-separated)</Label>
                  <Input
                    value={newAreaCounties}
                    onChange={(e) => setNewAreaCounties(e.target.value)}
                    placeholder="Davidson, Williamson"
                    className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white"
                    data-testid="input-new-area-counties"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={createServiceArea}
                  className="bg-[#c4a47c] hover:bg-[#d4b48c] text-[#1a0f09]"
                  data-testid="button-save-new-area"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Area
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowNewAreaForm(false)}
                  className="text-[#a0896c]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          <Accordion type="single" collapsible className="space-y-4">
            {serviceAreas.map((area) => (
              <AccordionItem
                key={area.id}
                value={area.id}
                className="border border-[#5c4033]/30 rounded-lg overflow-hidden"
                data-testid={`accordion-service-area-${area.id}`}
              >
                <AccordionTrigger className="px-4 py-3 bg-[#1a0f09]/30 hover:bg-[#1a0f09]/50 text-[#c4a47c]">
                  <div className="flex items-center gap-3 flex-1">
                    <MapPin className="w-4 h-4" />
                    <span className="font-semibold">{area.name}</span>
                    <div className="flex gap-2 ml-auto mr-4">
                      {area.whiteGloveEnabled && (
                        <Badge className="bg-[#c4a47c]/20 text-[#c4a47c]">
                          <Crown className="w-3 h-3 mr-1" />
                          White Glove
                        </Badge>
                      )}
                      {area.doordashEnabled && (
                        <Badge className="bg-red-500/20 text-red-400">
                          <Truck className="w-3 h-3 mr-1" />
                          DoorDash
                        </Badge>
                      )}
                      {!area.isActive && (
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4 bg-[#1a0f09]/20">
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-[#a0896c] text-sm">Zip Codes</Label>
                        <p className="text-white text-sm">
                          {area.zipCodes?.join(", ") || "None configured"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-[#a0896c] text-sm">Counties</Label>
                        <p className="text-white text-sm">
                          {area.counties?.join(", ") || "None configured"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`switch-active-${area.id}`}
                          checked={area.isActive}
                          onCheckedChange={(checked) => updateServiceArea(area.id, { isActive: checked })}
                          data-testid={`switch-active-${area.id}`}
                        />
                        <Label htmlFor={`switch-active-${area.id}`} className="text-[#a0896c]">Active</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`switch-white-glove-${area.id}`}
                          checked={area.whiteGloveEnabled}
                          onCheckedChange={(checked) => updateServiceArea(area.id, { whiteGloveEnabled: checked })}
                          data-testid={`switch-white-glove-${area.id}`}
                        />
                        <Label htmlFor={`switch-white-glove-${area.id}`} className="text-[#a0896c]">White Glove</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`switch-doordash-${area.id}`}
                          checked={area.doordashEnabled}
                          onCheckedChange={(checked) => updateServiceArea(area.id, { doordashEnabled: checked })}
                          data-testid={`switch-doordash-${area.id}`}
                        />
                        <Label htmlFor={`switch-doordash-${area.id}`} className="text-[#a0896c]">DoorDash</Label>
                      </div>
                    </div>

                    <div className="border-t border-[#5c4033]/30 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-[#c4a47c] font-semibold flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          White Glove Pricing Tiers
                        </h5>
                        <Button
                          size="sm"
                          onClick={() => setShowNewTierForm(area.id)}
                          className="bg-[#5c4033] hover:bg-[#6d5040] text-white"
                          data-testid={`button-add-tier-${area.id}`}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Tier
                        </Button>
                      </div>

                      {showNewTierForm === area.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 mb-4 rounded-lg bg-[#1a0f09]/50 border border-[#5c4033]/30"
                        >
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-[#c4a47c] text-sm">Tier Name</Label>
                              <Input
                                value={newTier.tierName}
                                onChange={(e) => setNewTier({ ...newTier, tierName: e.target.value })}
                                placeholder="e.g., Standard"
                                className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white text-sm"
                                data-testid="input-new-tier-name"
                              />
                            </div>
                            <div>
                              <Label className="text-[#c4a47c] text-sm">Min Headcount</Label>
                              <Input
                                type="number"
                                value={newTier.minHeadcount}
                                onChange={(e) => setNewTier({ ...newTier, minHeadcount: parseInt(e.target.value) || 1 })}
                                className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white text-sm"
                                data-testid="input-new-tier-min"
                              />
                            </div>
                            <div>
                              <Label className="text-[#c4a47c] text-sm">Max Headcount</Label>
                              <Input
                                type="number"
                                value={newTier.maxHeadcount}
                                onChange={(e) => setNewTier({ ...newTier, maxHeadcount: parseInt(e.target.value) || 10 })}
                                className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white text-sm"
                                data-testid="input-new-tier-max"
                              />
                            </div>
                            <div>
                              <Label className="text-[#c4a47c] text-sm">Setup Fee ($)</Label>
                              <Input
                                type="number"
                                value={(newTier.setupFeeCents / 100).toFixed(2)}
                                onChange={(e) => setNewTier({ ...newTier, setupFeeCents: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                                className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white text-sm"
                                data-testid="input-new-tier-setup"
                              />
                            </div>
                            <div>
                              <Label className="text-[#c4a47c] text-sm">Per Person Fee ($)</Label>
                              <Input
                                type="number"
                                value={(newTier.perPersonFeeCents / 100).toFixed(2)}
                                onChange={(e) => setNewTier({ ...newTier, perPersonFeeCents: Math.round(parseFloat(e.target.value) * 100) || 0 })}
                                className="bg-[#1a0f09]/50 border-[#5c4033]/50 text-white text-sm"
                                data-testid="input-new-tier-perperson"
                              />
                            </div>
                            <div className="flex items-end gap-4">
                              <div className="flex items-center gap-2">
                                <Switch
                                  id="switch-new-tier-setup"
                                  checked={newTier.includesSetup}
                                  onCheckedChange={(checked) => setNewTier({ ...newTier, includesSetup: checked })}
                                  data-testid="switch-new-tier-setup"
                                />
                                <Label htmlFor="switch-new-tier-setup" className="text-[#a0896c] text-xs">Setup</Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  id="switch-new-tier-presentation"
                                  checked={newTier.includesPresentation}
                                  onCheckedChange={(checked) => setNewTier({ ...newTier, includesPresentation: checked })}
                                  data-testid="switch-new-tier-presentation"
                                />
                                <Label htmlFor="switch-new-tier-presentation" className="text-[#a0896c] text-xs">Present</Label>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              onClick={() => createPricingTier(area.id)}
                              className="bg-[#c4a47c] hover:bg-[#d4b48c] text-[#1a0f09]"
                              data-testid="button-save-new-tier"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save Tier
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowNewTierForm(null)}
                              className="text-[#a0896c]"
                            >
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      )}

                      <div className="space-y-2">
                        {pricingTiers
                          .filter((t) => t.serviceAreaId === area.id)
                          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                          .map((tier) => (
                            <div
                              key={tier.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-[#1a0f09]/30 border border-[#5c4033]/20"
                              data-testid={`tier-${tier.id}`}
                            >
                              <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-[#a0896c]" />
                                <div>
                                  <p className="text-white font-medium">{tier.tierName}</p>
                                  <p className="text-[#a0896c] text-sm">
                                    {tier.minHeadcount}-{tier.maxHeadcount} guests • 
                                    ${((tier.setupFeeCents || 0) / 100).toFixed(2)} setup
                                    {tier.perPersonFeeCents ? ` + $${(tier.perPersonFeeCents / 100).toFixed(2)}/person` : ""}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {tier.includesSetup && (
                                  <Badge className="bg-green-500/20 text-green-400 text-xs">Setup</Badge>
                                )}
                                {tier.includesPresentation && (
                                  <Badge className="bg-blue-500/20 text-blue-400 text-xs">Present</Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deletePricingTier(tier.id)}
                                  className="text-red-400 hover:text-red-300"
                                  data-testid={`button-delete-tier-${tier.id}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        {pricingTiers.filter((t) => t.serviceAreaId === area.id).length === 0 && (
                          <p className="text-[#a0896c] text-sm italic">No pricing tiers configured</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[#5c4033]/30">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteServiceArea(area.id)}
                        className="text-red-400 hover:text-red-300"
                        data-testid={`button-delete-area-${area.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Area
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {serviceAreas.length === 0 && !showNewAreaForm && (
            <div className="text-center py-8 text-[#a0896c]">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No service areas configured</p>
              <p className="text-sm mt-1">Default Nashville Metro area will be used</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
