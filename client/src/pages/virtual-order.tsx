import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import {
  Coffee,
  MapPin,
  DollarSign,
  Check,
  AlertCircle,
  ShoppingCart,
  Plus,
  Minus,
  Clock,
  Building2,
  Send,
  Sparkles,
  User,
  CheckCircle2,
  ArrowLeft,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { COFFEE_SHOPS } from "@/lib/mock-data";

interface CartItem {
  name: string;
  quantity: number;
  priceCents: number;
  vendorName?: string;
  category?: string;
  notes?: string;
}

export default function VirtualOrderPage() {
  const [, params] = useRoute("/virtual-order/:token");
  const token = params?.token;
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitted, setSubmitted] = useState(false);
  
  // Address form
  const [address, setAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    deliveryInstructions: ""
  });

  // Fetch attendee data
  const { data: attendeeData, isLoading, error } = useQuery({
    queryKey: ["/api/virtual-attendee", token],
    queryFn: async () => {
      const res = await fetch(`/api/virtual-attendee/${token}`);
      if (!res.ok) throw new Error("Invalid or expired invite link");
      return res.json();
    },
    enabled: !!token
  });

  // Submit selection mutation
  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/virtual-attendee/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to submit order");
      return res.json();
    },
    onSuccess: (data: any) => {
      setSubmitted(true);
      toast({ 
        title: "Order Submitted!", 
        description: data.budgetStatus === 'over' 
          ? `Note: You exceeded the budget by $${(data.overageCents / 100).toFixed(2)}` 
          : "Your selection has been sent to the host"
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Pre-fill address if attendee already has one
  useEffect(() => {
    if (attendeeData?.attendee) {
      const a = attendeeData.attendee;
      setAddress({
        addressLine1: a.addressLine1 || "",
        addressLine2: a.addressLine2 || "",
        city: a.city || "",
        state: a.state || "",
        zipCode: a.zipCode || "",
        deliveryInstructions: a.deliveryInstructions || ""
      });
      
      // Check if already submitted
      if (a.inviteStatus === 'submitted' && attendeeData.selection) {
        setSubmitted(true);
        setCart(attendeeData.selection.items || []);
      }
    }
  }, [attendeeData]);

  const budget = attendeeData?.meeting?.perPersonBudgetCents || 1500;
  const cartTotal = cart.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
  const isOverBudget = cartTotal > budget;
  const budgetRemaining = budget - cartTotal;

  const addToCart = (item: { name: string; price: string | number; category?: string }, vendorName: string) => {
    const priceNum = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    const priceCents = Math.round(priceNum * 100);
    const existingIndex = cart.findIndex(c => c.name === item.name && c.vendorName === vendorName);
    
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, {
        name: item.name,
        quantity: 1,
        priceCents,
        vendorName,
        category: item.category
      }]);
    }
    
    toast({ title: "Added to cart", description: item.name });
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  const handleSubmit = () => {
    if (cart.length === 0) {
      toast({ title: "Empty Cart", description: "Please select at least one item", variant: "destructive" });
      return;
    }
    
    if (!address.addressLine1 || !address.city || !address.state || !address.zipCode) {
      toast({ title: "Address Required", description: "Please fill in your delivery address", variant: "destructive" });
      return;
    }
    
    submitMutation.mutate({
      items: cart,
      specialRequests,
      ...address
    });
  };

  // Get a subset of vendors for demo
  const vendors = COFFEE_SHOPS.slice(0, 6);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-100 to-background">
        <div className="text-center">
          <Coffee className="h-12 w-12 mx-auto text-amber-600 animate-pulse mb-4" />
          <p className="text-muted-foreground">Loading your invite...</p>
        </div>
      </div>
    );
  }

  if (error || !attendeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-100 to-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="font-serif text-xl font-bold mb-2">Invalid Link</h2>
            <p className="text-muted-foreground mb-4">
              This invite link is invalid or has expired. Please contact your host for a new link.
            </p>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { attendee, meeting } = attendeeData;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-stone-100 to-background p-4">
        <div className="container max-w-md mx-auto py-12">
          <Card className="border-emerald-200 shadow-lg">
            <CardContent className="pt-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
              </motion.div>
              <h2 className="font-serif text-2xl font-bold mb-2">Order Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Thanks, {attendee.name}! Your selection has been sent to {meeting.hostName || 'your host'}.
              </p>
              
              {cart.length > 0 && (
                <div className="bg-stone-50 dark:bg-stone-900/50 rounded-lg p-4 mb-4 text-left">
                  <h4 className="font-medium text-sm mb-2">Your Order:</h4>
                  {cart.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="text-muted-foreground">${((item.priceCents * item.quantity) / 100).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>${(cartTotal / 100).toFixed(2)}</span>
                  </div>
                </div>
              )}
              
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-left">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Delivery: {meeting.meetingDate} at {meeting.meetingTime}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-background pb-32">
      {/* Header */}
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 25%, #3d2418 50%, #5c4033 100%)'
        }}
      >
        <div className="relative z-10 px-4 py-6">
          <div className="container max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Badge className="mb-2 bg-white/20 text-white border-white/30">
                <User className="h-3 w-3 mr-1" />
                {attendee.name}
              </Badge>
              <h1 className="font-serif text-2xl text-white font-bold mb-1">
                {meeting.title}
              </h1>
              <p className="text-[#d4c4b0] text-sm">
                Hosted by {meeting.hostName || 'your host'}
                {meeting.hostCompany && ` • ${meeting.hostCompany}`}
              </p>
              <div className="flex items-center justify-center gap-4 mt-3 text-sm text-white/70">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {meeting.meetingTime}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  ${(budget / 100).toFixed(2)} budget
                </span>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 40" className="w-full h-6 fill-stone-100 dark:fill-background" preserveAspectRatio="none">
            <path d="M0,40 L0,20 Q150,0 300,15 T600,10 T900,20 T1200,10 L1200,40 Z" />
          </svg>
        </div>
      </div>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step >= s 
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' 
                    : 'bg-stone-200 dark:bg-stone-700 text-muted-foreground'
                }`}
              >
                {step > s ? <Check className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`flex-1 h-0.5 mx-2 ${step > s ? 'bg-amber-500' : 'bg-stone-200 dark:bg-stone-700'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground px-2">
          <span>Address</span>
          <span>Select Items</span>
          <span>Review</span>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Address */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-stone-200 dark:border-stone-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-amber-600" />
                    Delivery Address
                  </CardTitle>
                  <CardDescription>Where should we deliver your order?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address1">Street Address *</Label>
                    <Input
                      id="address1"
                      placeholder="123 Main St"
                      value={address.addressLine1}
                      onChange={(e) => setAddress({ ...address, addressLine1: e.target.value })}
                      data-testid="input-address-line1"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address2">Apt, Suite, Floor (optional)</Label>
                    <Input
                      id="address2"
                      placeholder="Apt 4B"
                      value={address.addressLine2}
                      onChange={(e) => setAddress({ ...address, addressLine2: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-6 gap-3">
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="Nashville"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="TN"
                        maxLength={2}
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="zip">ZIP *</Label>
                      <Input
                        id="zip"
                        placeholder="37203"
                        value={address.zipCode}
                        onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="instructions">Delivery Instructions</Label>
                    <Textarea
                      id="instructions"
                      placeholder="Gate code, building entrance, floor, etc."
                      value={address.deliveryInstructions}
                      onChange={(e) => setAddress({ ...address, deliveryInstructions: e.target.value })}
                      rows={2}
                    />
                  </div>
                  
                  <Button 
                    onClick={() => {
                      if (!address.addressLine1 || !address.city || !address.state || !address.zipCode) {
                        toast({ title: "Required Fields", description: "Please fill in all required address fields", variant: "destructive" });
                        return;
                      }
                      setStep(2);
                    }}
                    className="w-full text-white font-semibold shine-effect"
                    style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                    data-testid="button-continue-to-menu"
                  >
                    Continue to Menu
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Select Items */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Budget Display */}
              <Card className={`${isOverBudget ? 'border-amber-400' : 'border-emerald-400'}`}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className={`h-5 w-5 ${isOverBudget ? 'text-amber-600' : 'text-emerald-600'}`} />
                      <span className="font-medium">Budget</span>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${isOverBudget ? 'text-amber-600' : 'text-emerald-600'}`}>
                        ${(budgetRemaining / 100).toFixed(2)} remaining
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ${(cartTotal / 100).toFixed(2)} of ${(budget / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {isOverBudget && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      You're over budget. The host will see this.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Vendor Selection */}
              {!selectedVendor ? (
                <div className="space-y-3">
                  <h3 className="font-medium">Choose a vendor:</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {vendors.map((vendor) => (
                      <motion.div
                        key={vendor.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedVendor(vendor.id)}
                        className="cursor-pointer border rounded-xl p-4 hover:border-amber-400 hover:shadow-md transition-all"
                      >
                        <h4 className="font-medium text-sm mb-1">{vendor.name}</h4>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {vendor.location}
                        </p>
                        <Badge variant="secondary" className="mt-2 text-[10px]">
                          {vendor.menu.length} items
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedVendor(null)}
                      className="gap-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      All Vendors
                    </Button>
                    <h3 className="font-medium">{vendors.find(v => v.id === selectedVendor)?.name}</h3>
                  </div>
                  
                  <ScrollArea className="h-[400px] rounded-lg border p-4">
                    <div className="space-y-2">
                      {vendors.find(v => v.id === selectedVendor)?.menu.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-sm">${item.price}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addToCart(item, vendors.find(v => v.id === selectedVendor)!.name)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button 
                  onClick={() => {
                    if (cart.length === 0) {
                      toast({ title: "Empty Cart", description: "Please select at least one item", variant: "destructive" });
                      return;
                    }
                    setStep(3);
                  }}
                  disabled={cart.length === 0}
                  className="flex-1 text-white font-semibold shine-effect"
                  style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                >
                  Review Order ({cart.length})
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review & Submit */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="border-stone-200 dark:border-stone-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-amber-600" />
                    Review Your Order
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Delivery Address */}
                  <div className="bg-stone-50 dark:bg-stone-900/50 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Delivering to:</p>
                    <p className="text-sm">{address.addressLine1}</p>
                    {address.addressLine2 && <p className="text-sm">{address.addressLine2}</p>}
                    <p className="text-sm">{address.city}, {address.state} {address.zipCode}</p>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-2">
                    {cart.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.vendorName}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(i, -1)}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateQuantity(i, 1)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-medium text-sm w-16 text-right">
                            ${((item.priceCents * item.quantity) / 100).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className={`rounded-lg p-4 ${isOverBudget ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className={`font-bold text-lg ${isOverBudget ? 'text-amber-600' : 'text-emerald-600'}`}>
                        ${(cartTotal / 100).toFixed(2)}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isOverBudget ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {isOverBudget 
                        ? `$${((cartTotal - budget) / 100).toFixed(2)} over budget - host will be notified`
                        : `$${(budgetRemaining / 100).toFixed(2)} under budget`}
                    </p>
                  </div>

                  {/* Special Requests */}
                  <div className="space-y-2">
                    <Label htmlFor="requests">Special Requests (optional)</Label>
                    <Textarea
                      id="requests"
                      placeholder="Allergies, substitutions, etc."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending}
                      className="flex-1 text-white font-semibold shine-effect"
                      style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                      data-testid="button-submit-order"
                    >
                      {submitMutation.isPending ? (
                        "Submitting..."
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Order
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Cart Summary */}
      {step === 2 && cart.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-stone-900 border-t shadow-lg p-4"
        >
          <div className="container max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</p>
                <p className="text-sm text-muted-foreground">${(cartTotal / 100).toFixed(2)}</p>
              </div>
            </div>
            <Button 
              onClick={() => setStep(3)}
              className="text-white font-semibold shine-effect"
              style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
            >
              Review Order
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
