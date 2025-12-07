import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, startOfWeek, isSameDay, parseISO, addHours, isBefore } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Check,
  Truck,
  AlertTriangle,
  Package,
  Phone,
  User,
  Home,
  Percent,
  ShoppingCart,
  Minus,
  Trash2,
  Building2,
  KeyRound,
  ParkingCircle,
  DoorOpen,
  Lock
} from "lucide-react";
import { SERVICE_FEE_PERCENT, DELIVERY_COORDINATION_FEE, EXTENDED_DELIVERY_PREMIUM, EXTENDED_DELIVERY_RADIUS_MILES, NASHVILLE_ZIP_COORDS, isAtOrderLimit, getSubscriptionTier } from "@/lib/mock-data";
import { useCart } from "@/contexts/CartContext";
import { SubscriptionLimitModal, SubscriptionUsageBanner } from "@/components/SubscriptionLimitModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MINIMUM_ORDER_LEAD_TIME_HOURS } from "@shared/schema";

interface OrderItem {
  menuItemId?: string;
  name: string;
  quantity: number;
  price: string;
  notes?: string;
}

interface ScheduledOrder {
  id: string;
  userId: string;
  vendorName: string | null;
  deliveryAddress: string;
  deliveryInstructions: string | null;
  contactName: string | null;
  contactPhone: string | null;
  scheduledDate: string;
  scheduledTime: string;
  items: OrderItem[];
  subtotal: string;
  serviceFee: string;
  deliveryFee: string;
  total: string;
  status: string;
  fulfillmentChannel: string;
  fulfillmentRef: string | null;
  specialInstructions: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  scheduled: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  confirmed: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  preparing: { bg: "bg-stone-100", text: "text-stone-700", border: "border-stone-200" },
  out_for_delivery: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  delivered: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  cancelled: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function SchedulePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { items: cartItems, vendorName: cartVendorName, vendorLocation, clearCart, updateQuantity, removeItem, subtotal, salesTax, serviceFee, deliveryFee, gratuityOption, customGratuity, gratuityAmount, setGratuityOption, setCustomGratuity, total, itemCount, calculateDeliveryFee } = useCart();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ScheduledOrder | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [showSubscriptionLimit, setShowSubscriptionLimit] = useState(false);

  // Get user from localStorage
  const userStr = localStorage.getItem("coffee_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;

  // Generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  // Fetch orders for the current week
  const startDate = format(currentWeekStart, "yyyy-MM-dd");
  const endDate = format(addDays(currentWeekStart, 6), "yyyy-MM-dd");

  const { data: orders = [] } = useQuery<ScheduledOrder[]>({
    queryKey: ["orders", userId, startDate, endDate],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/orders?userId=${userId}&startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!userId,
  });

  // Fetch user subscription info
  const { data: subscription } = useQuery<{
    id: string;
    tier: string;
    ordersThisMonth: number;
    currentPeriodEnd: string;
  } | null>({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await fetch(`/api/subscriptions/user/${userId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!userId,
  });

  // Check if user is at order limit
  const userAtLimit = useMemo(() => {
    if (!subscription) return false;
    return isAtOrderLimit(subscription.tier, subscription.ordersThisMonth);
  }, [subscription]);

  // Get orders for selected date
  const ordersForSelectedDate = useMemo(() => {
    return orders.filter(order => isSameDay(parseISO(order.scheduledDate), selectedDate));
  }, [orders, selectedDate]);

  // New order form state
  const [newOrder, setNewOrder] = useState({
    vendorName: "",
    deliveryAddress: "",
    deliveryInstructions: "",
    contactName: "",
    contactPhone: "",
    scheduledDate: format(new Date(), "yyyy-MM-dd"),
    scheduledTime: "09:00",
    items: [{ name: "", quantity: 1, price: "0.00" }] as OrderItem[],
    specialInstructions: "",
  });

  // Sync order form with cart whenever cart changes
  useEffect(() => {
    if (itemCount > 0) {
      setNewOrder(prev => ({
        ...prev,
        vendorName: cartVendorName || "",
        items: cartItems.map(item => ({
          menuItemId: item.itemId,
          name: item.name,
          quantity: item.quantity,
          price: item.price.toFixed(2),
          notes: ""
        }))
      }));
      if (!isNewOrderOpen) {
        setIsNewOrderOpen(true);
      }
    }
  }, [itemCount, cartItems, cartVendorName]);

  // Calculate if order time is valid (at least 2 hours in advance)
  const isOrderTimeValid = useMemo(() => {
    const scheduledDateTime = new Date(`${newOrder.scheduledDate}T${newOrder.scheduledTime}`);
    const minValidTime = addHours(new Date(), MINIMUM_ORDER_LEAD_TIME_HOURS);
    return !isBefore(scheduledDateTime, minValidTime);
  }, [newOrder.scheduledDate, newOrder.scheduledTime]);

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create order");
      }
      return res.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      
      // Server-side handles subscription order count increment atomically
      // Optimistically update local cache and refetch for consistency
      if (subscription) {
        queryClient.setQueryData(
          ["subscription", userId],
          (oldData: typeof subscription) => oldData ? {
            ...oldData,
            ordersThisMonth: (oldData.ordersThisMonth || 0) + 1
          } : null
        );
        // Refetch to reconcile with server truth
        queryClient.invalidateQueries({ queryKey: ["subscription", userId] });
      }
      
      setIsNewOrderOpen(false);
      resetNewOrderForm();
      clearCart();
      toast({ title: "Success", description: "Order scheduled successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, fulfillmentRef, fulfillmentChannel }: any) => {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, fulfillmentRef, fulfillmentChannel }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setIsStatusDialogOpen(false);
      setSelectedOrder(null);
      toast({ title: "Updated", description: "Order status updated!" });
    },
  });

  const resetNewOrderForm = () => {
    setNewOrder({
      vendorName: "",
      deliveryAddress: "",
      deliveryInstructions: "",
      contactName: "",
      contactPhone: "",
      scheduledDate: format(new Date(), "yyyy-MM-dd"),
      scheduledTime: "09:00",
      items: [{ name: "", quantity: 1, price: "0.00" }],
      specialInstructions: "",
    });
  };

  const extractZipCode = (address: string): string | null => {
    const zipMatch = address.match(/\b(\d{5})\b/);
    return zipMatch ? zipMatch[1] : null;
  };

  const TN_SALES_TAX_RATE = 0.0925; // Tennessee state (7%) + Nashville local (2.25%)
  const AUTO_GRATUITY_THRESHOLD = 100; // $100+ orders get automatic 18% gratuity
  const AUTO_GRATUITY_RATE = 0.18; // 18% auto gratuity for large orders
  
  const orderTotals = useMemo(() => {
    const subtotal = newOrder.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const salesTax = subtotal * TN_SALES_TAX_RATE;
    const serviceFee = subtotal * SERVICE_FEE_PERCENT;
    
    let baseFee = DELIVERY_COORDINATION_FEE;
    let extendedFee = 0;
    let isExtendedDelivery = false;
    let deliveryDistance = 0;
    
    const deliveryZip = extractZipCode(newOrder.deliveryAddress);
    if (deliveryZip && vendorLocation && NASHVILLE_ZIP_COORDS[deliveryZip]) {
      const deliveryCoords = NASHVILLE_ZIP_COORDS[deliveryZip];
      const result = calculateDeliveryFee(deliveryCoords.lat, deliveryCoords.lng);
      baseFee = result.baseFee;
      extendedFee = result.extendedFee;
      isExtendedDelivery = result.isExtended;
      deliveryDistance = result.distance;
    }
    
    const deliveryFee = baseFee + extendedFee;
    // Enforce 18% auto-gratuity for orders $100+, otherwise use selected option
    const gratuityAmt = subtotal >= AUTO_GRATUITY_THRESHOLD 
      ? subtotal * AUTO_GRATUITY_RATE 
      : (gratuityOption === 'custom' ? customGratuity : subtotal * (gratuityOption / 100));
    const total = subtotal + salesTax + serviceFee + deliveryFee + gratuityAmt;
    return { subtotal, salesTax, serviceFee, deliveryFee, baseFee, extendedFee, isExtendedDelivery, deliveryDistance, gratuity: gratuityAmt, total };
  }, [newOrder.items, newOrder.deliveryAddress, vendorLocation, calculateDeliveryFee, gratuityOption, customGratuity]);

  const handleCreateOrder = (bypassLimit = false) => {
    const { subtotal, salesTax, serviceFee, deliveryFee, gratuity, total } = orderTotals;

    // Check subscription limit (unless bypassed for overage payment)
    if (!bypassLimit && userAtLimit) {
      setShowSubscriptionLimit(true);
      return;
    }

    createOrderMutation.mutate({
      userId,
      vendorName: newOrder.vendorName,
      deliveryAddress: newOrder.deliveryAddress,
      deliveryInstructions: newOrder.deliveryInstructions || null,
      contactName: newOrder.contactName || null,
      contactPhone: newOrder.contactPhone || null,
      scheduledDate: newOrder.scheduledDate,
      scheduledTime: newOrder.scheduledTime,
      items: newOrder.items.filter(i => i.name.trim()),
      subtotal: subtotal.toFixed(2),
      salesTax: salesTax.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      gratuity: gratuity.toFixed(2),
      total: total.toFixed(2),
      specialInstructions: newOrder.specialInstructions || null,
      isOverageOrder: bypassLimit && userAtLimit, // Mark as overage if paying full price
    });
  };

  const handleUpgradeFromLimit = () => {
    setShowSubscriptionLimit(false);
    setIsNewOrderOpen(false);
    window.location.href = '/pricing';
  };

  const handlePayOverage = () => {
    setShowSubscriptionLimit(false);
    handleCreateOrder(true); // Bypass limit, create order anyway
  };

  const addOrderItem = () => {
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, { name: "", quantity: 1, price: "0.00" }],
    });
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...newOrder.items];
    updated[index] = { ...updated[index], [field]: value };
    setNewOrder({ ...newOrder, items: updated });
  };

  const removeOrderItem = (index: number) => {
    if (newOrder.items.length > 1) {
      setNewOrder({
        ...newOrder,
        items: newOrder.items.filter((_, i) => i !== index),
      });
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-amber-600" />
          <h2 className="text-2xl font-serif mb-2">Create an Account to Order</h2>
          <p className="text-muted-foreground mb-6">
            To schedule coffee deliveries and access all features, please create a free account with a 4-digit PIN.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover-3d" data-testid="button-back">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-3xl font-bold mb-1 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-primary" />
                Order Schedule
              </h1>
              <p className="text-muted-foreground">Manage your coffee delivery orders</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsNewOrderOpen(true)} 
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            data-testid="button-new-order"
          >
            <Plus className="h-4 w-4" /> New Order
          </Button>
        </header>

        {/* Cart Summary */}
        {itemCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-stone-100 to-stone-50 border border-stone-200 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" style={{ color: '#5c4033' }} />
                <span className="font-medium" style={{ color: '#2d1810' }}>Your Cart from {cartVendorName}</span>
                <Badge className="text-white" style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}>{itemCount} items</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                data-testid="button-clear-cart"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            
            <div className="space-y-2 mb-3">
              {cartItems.map((item) => (
                <div key={item.itemId} className="flex items-center justify-between bg-white/60 p-2 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm font-medium" style={{ color: '#2d1810' }}>{item.name}</span>
                    <span className="text-xs ml-2" style={{ color: '#5c4033' }}>${item.price.toFixed(2)} ea</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                      data-testid={`button-decrease-${item.itemId}`}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                      data-testid={`button-increase-${item.itemId}`}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => removeItem(item.itemId)}
                      data-testid={`button-remove-${item.itemId}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Gratuity Selector - Conditional based on $100 threshold */}
            <div className="pt-3 border-t border-stone-200 mb-3">
              {subtotal >= 100 ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-2" style={{ color: '#2d1810' }}>
                      <Lock className="h-3.5 w-3.5" />
                      Auto Gratuity (18%)
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)', color: '#fef3c7' }}>Required</span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: '#5c4033' }}>
                    Orders $100+ include automatic 18% concierge gratuity for white-glove delivery service.
                  </p>
                  <div className="p-3 rounded-lg text-center" style={{ background: 'linear-gradient(135deg, rgba(92,64,51,0.15) 0%, rgba(61,36,24,0.15) 100%)', border: '1px solid rgba(92,64,51,0.3)' }}>
                    <span className="font-semibold" style={{ color: '#2d1810' }}>${(subtotal * 0.18).toFixed(2)}</span>
                    <span className="text-sm ml-1" style={{ color: '#5c4033' }}>gratuity included</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: '#2d1810' }}>Concierge Gratuity</span>
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>
                  <p className="text-xs mb-2" style={{ color: '#5c4033' }}>
                    Gratuity is optional for orders under $100. Orders $100+ include automatic 18% gratuity.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {([0, 15, 18, 20] as const).map((pct) => (
                      <Button
                        key={pct}
                        size="sm"
                        variant={gratuityOption === pct ? "default" : "outline"}
                        className={`flex-1 min-w-[60px] ${gratuityOption === pct ? "text-white shine-effect" : ""}`}
                        style={gratuityOption === pct ? { background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' } : {}}
                        onClick={() => setGratuityOption(pct)}
                        data-testid={`button-tip-${pct}`}
                      >
                        {pct === 0 ? "None" : `${pct}%`}
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant={gratuityOption === 'custom' ? "default" : "outline"}
                      className={`flex-1 min-w-[60px] ${gratuityOption === 'custom' ? "text-white shine-effect" : ""}`}
                      style={gratuityOption === 'custom' ? { background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' } : {}}
                      onClick={() => setGratuityOption('custom')}
                      data-testid="button-tip-custom"
                    >
                      Custom
                    </Button>
                  </div>
                  {gratuityOption === 'custom' && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={customGratuity}
                        onChange={(e) => setCustomGratuity(parseFloat(e.target.value) || 0)}
                        className="w-24"
                        placeholder="0.00"
                        data-testid="input-custom-tip"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex flex-col gap-1 pt-2 border-t border-stone-200">
              <div className="flex justify-between text-sm" style={{ color: '#5c4033' }}>
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: '#5c4033' }}>
                <span>TN Sales Tax (9.25%):</span>
                <span>${salesTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: '#5c4033' }}>
                <span>Service Fee (15%):</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: '#5c4033' }}>
                <span>Delivery:</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: '#5c4033' }}>
                <span>
                  {subtotal >= 100 ? (
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Auto Gratuity (18%)
                    </span>
                  ) : (
                    `Gratuity${gratuityOption !== 'custom' && gratuityOption > 0 ? ` (${gratuityOption}%)` : ''}`
                  )}:
                </span>
                <span>${gratuityAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-stone-200 mt-1" style={{ color: '#2d1810' }}>
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Lead Time Disclaimer */}
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: 'linear-gradient(135deg, rgba(92,64,51,0.1) 0%, rgba(61,36,24,0.1) 100%)', border: '1px solid rgba(61,36,24,0.2)' }}>
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#5c4033' }} />
          <div className="space-y-2">
            <p className="font-medium text-sm" style={{ color: '#2d1810' }}>Delivery Lead Time Notice</p>
            <p className="text-sm" style={{ color: '#3d2418' }}>
              Orders must be placed at least <strong>{MINIMUM_ORDER_LEAD_TIME_HOURS} hours</strong> before your requested delivery time. For guaranteed on-time delivery, we recommend <strong>24+ hours advance notice</strong> when possible.
            </p>
            <p className="text-xs" style={{ color: '#5c4033' }}>
              Delivery times are estimated and may vary based on Nashville traffic conditions. Orders placed with less than 4 hours notice are fulfilled on a best-effort basis.
            </p>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))}
            data-testid="button-prev-week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center">
            <p className="text-lg font-medium">
              {format(currentWeekStart, "MMMM d")} - {format(addDays(currentWeekStart, 6), "MMMM d, yyyy")}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
            data-testid="button-next-week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week Calendar */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {weekDays.map((day, index) => {
            const dayOrders = orders.filter(order => isSameDay(parseISO(order.scheduledDate), day));
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedDate(day)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : isToday 
                      ? "border-[#5c4033] bg-stone-50" 
                      : "border-border hover:border-primary/30"
                }`}
                data-testid={`button-day-${format(day, "yyyy-MM-dd")}`}
              >
                <div className="text-xs font-medium text-muted-foreground uppercase">
                  {format(day, "EEE")}
                </div>
                <div className={`text-2xl font-bold ${isSelected ? "text-primary" : ""}`}>
                  {format(day, "d")}
                </div>
                {dayOrders.length > 0 && (
                  <div className="mt-2 flex items-center gap-1">
                    <Coffee className="h-3 w-3" style={{ color: '#5c4033' }} />
                    <span className="text-xs font-medium">{dayOrders.length} order{dayOrders.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Day Orders */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/10">
            <h2 className="text-xl font-serif font-bold">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {ordersForSelectedDate.length} order{ordersForSelectedDate.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>

          <ScrollArea className="h-[400px]">
            {ordersForSelectedDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Coffee className="h-12 w-12 opacity-30 mb-4" />
                <p>No orders scheduled for this day</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => {
                    setNewOrder({ ...newOrder, scheduledDate: format(selectedDate, "yyyy-MM-dd") });
                    setIsNewOrderOpen(true);
                  }}
                >
                  Schedule an order
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {ordersForSelectedDate.map((order) => {
                  const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.scheduled;
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 hover:bg-muted/5 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsStatusDialogOpen(true);
                      }}
                      data-testid={`order-card-${order.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(92,64,51,0.1)' }}>
                            <Coffee className="h-5 w-5" style={{ color: '#5c4033' }} />
                          </div>
                          <div>
                            <p className="font-semibold">{order.vendorName || "Coffee Order"}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{order.scheduledTime}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-muted-foreground">{order.deliveryAddress}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''} · ${order.total}
                          </span>
                        </div>
                      </div>

                      {order.fulfillmentRef && (
                        <div className="mt-3 text-xs text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg inline-block">
                          <Truck className="h-3 w-3 inline mr-1" />
                          {order.fulfillmentChannel}: {order.fulfillmentRef}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* New Order Dialog */}
        <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl">Schedule Coffee Order</DialogTitle>
              <DialogDescription>
                Create a new coffee delivery order for your meeting
              </DialogDescription>
            </DialogHeader>

            {/* Lead time warning */}
            {!isOrderTimeValid && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  Orders must be scheduled at least {MINIMUM_ORDER_LEAD_TIME_HOURS} hours in advance. We recommend 24+ hours notice for guaranteed on-time delivery.
                </p>
              </div>
            )}

            {/* Best-effort notice for short notice orders */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
              <p className="text-xs text-stone-600">
                <strong>Delivery Note:</strong> Times are estimated and may vary based on Nashville traffic. Orders with less than 4 hours notice are fulfilled on a best-effort basis.
              </p>
            </div>

            <div className="grid gap-6 py-4">
              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Delivery Date</Label>
                  <Input
                    type="date"
                    value={newOrder.scheduledDate}
                    onChange={(e) => setNewOrder({ ...newOrder, scheduledDate: e.target.value })}
                    data-testid="input-order-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Time</Label>
                  <Input
                    type="time"
                    value={newOrder.scheduledTime}
                    onChange={(e) => setNewOrder({ ...newOrder, scheduledTime: e.target.value })}
                    data-testid="input-order-time"
                  />
                </div>
              </div>

              {/* Vendor & Delivery */}
              <div className="space-y-2">
                <Label>Coffee Shop / Vendor Name</Label>
                <Input
                  placeholder="e.g., Barista Parlor, Crema"
                  value={newOrder.vendorName}
                  onChange={(e) => setNewOrder({ ...newOrder, vendorName: e.target.value })}
                  data-testid="input-vendor-name"
                />
              </div>

              <div className="space-y-2">
                <Label>Delivery Address</Label>
                <Textarea
                  placeholder="Full delivery address..."
                  value={newOrder.deliveryAddress}
                  onChange={(e) => setNewOrder({ ...newOrder, deliveryAddress: e.target.value })}
                  data-testid="input-delivery-address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Contact Name</Label>
                  <Input
                    placeholder="Who should receive the order?"
                    value={newOrder.contactName}
                    onChange={(e) => setNewOrder({ ...newOrder, contactName: e.target.value })}
                    data-testid="input-contact-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input
                    type="tel"
                    placeholder="(615) 555-0123"
                    value={newOrder.contactPhone}
                    onChange={(e) => setNewOrder({ ...newOrder, contactPhone: e.target.value })}
                    data-testid="input-contact-phone"
                  />
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Order Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOrderItem}>
                    <Plus className="h-3 w-3 mr-1" /> Add Item
                  </Button>
                </div>
                
                {newOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                    <Input
                      placeholder="Item name (e.g., Latte)"
                      className="flex-1"
                      value={item.name}
                      onChange={(e) => updateOrderItem(index, "name", e.target.value)}
                    />
                    <Input
                      type="number"
                      className="w-20"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateOrderItem(index, "quantity", parseInt(e.target.value) || 1)}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      className="w-24"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => updateOrderItem(index, "price", e.target.value)}
                    />
                    {newOrder.items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeOrderItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label>Special Instructions</Label>
                <Textarea
                  placeholder="Any special requests, dietary notes, etc..."
                  value={newOrder.specialInstructions}
                  onChange={(e) => setNewOrder({ ...newOrder, specialInstructions: e.target.value })}
                  data-testid="input-special-instructions"
                />
              </div>

              {/* Building Access Instructions - Critical for secure locations */}
              <div className="space-y-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <div className="flex items-start gap-2">
                  <Building2 className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <Label className="text-orange-800 font-semibold text-base">Building Access Instructions</Label>
                    <p className="text-xs text-orange-600 mt-1">
                      Help us deliver on time! Many Nashville offices have security or restricted access.
                    </p>
                  </div>
                </div>
                
                <Textarea
                  placeholder="Please provide detailed access instructions:

• Security check-in: Do we need to sign in at a desk? Who should we ask for?
• Building access: Is there a code, key card, or call box?
• Parking: Where should our driver park? Visitor lot? Street parking?
• Floor & Suite: What floor? Suite or room number?
• Meet location: Lobby? Conference room? Your desk?
• Contact on arrival: Who should we call when we arrive?"
                  value={newOrder.deliveryInstructions}
                  onChange={(e) => setNewOrder({ ...newOrder, deliveryInstructions: e.target.value })}
                  className="min-h-[140px] bg-white placeholder:text-stone-400/70"
                  style={{ borderColor: 'rgba(61,36,24,0.2)' }}
                  data-testid="input-delivery-instructions"
                />
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ color: '#3d2418', background: 'rgba(92,64,51,0.1)' }}>
                    <KeyRound className="h-3 w-3" /> Access codes
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ color: '#3d2418', background: 'rgba(92,64,51,0.1)' }}>
                    <ParkingCircle className="h-3 w-3" /> Parking info
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ color: '#3d2418', background: 'rgba(92,64,51,0.1)' }}>
                    <DoorOpen className="h-3 w-3" /> Entry point
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ color: '#3d2418', background: 'rgba(92,64,51,0.1)' }}>
                    <Phone className="h-3 w-3" /> On-arrival contact
                  </span>
                </div>
              </div>

              {/* Order Summary */}
              {orderTotals.subtotal > 0 && (
                <div className="p-4 rounded-xl space-y-2" style={{ background: 'rgba(92,64,51,0.05)', border: '1px solid rgba(61,36,24,0.15)' }}>
                  <h4 className="font-medium flex items-center gap-2" style={{ color: '#2d1810' }}>
                    <Coffee className="h-4 w-4" style={{ color: '#5c4033' }} />
                    Order Summary
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${orderTotals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        Service Fee ({Math.round(SERVICE_FEE_PERCENT * 100)}%)
                      </span>
                      <span>${orderTotals.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        Base Delivery
                      </span>
                      <span>${orderTotals.baseFee.toFixed(2)}</span>
                    </div>
                    {orderTotals.isExtendedDelivery && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1" style={{ color: '#5c4033' }}>
                          <AlertTriangle className="h-3 w-3" />
                          Extended Delivery (+{orderTotals.deliveryDistance.toFixed(1)} mi)
                        </span>
                        <span style={{ color: '#5c4033' }}>+${orderTotals.extendedFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold pt-2 mt-2" style={{ borderTop: '1px solid rgba(61,36,24,0.15)' }}>
                      <span>Total</span>
                      <span style={{ color: '#3d2418' }}>${orderTotals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsNewOrderOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleCreateOrder()}
                disabled={!isOrderTimeValid || !newOrder.deliveryAddress || createOrderMutation.isPending}
                data-testid="button-submit-order"
              >
                {createOrderMutation.isPending ? "Scheduling..." : "Schedule Order"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Order Status Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Update Order Status</DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Coffee className="h-4 w-4" style={{ color: '#5c4033' }} />
                    <span className="font-medium">{selectedOrder.vendorName || "Coffee Order"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{selectedOrder.scheduledTime} on {format(parseISO(selectedOrder.scheduledDate), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{selectedOrder.deliveryAddress}</span>
                  </div>
                  {selectedOrder.contactName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{selectedOrder.contactName}</span>
                      {selectedOrder.contactPhone && (
                        <>
                          <Phone className="h-3 w-3 ml-2" />
                          <span>{selectedOrder.contactPhone}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Update Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(STATUS_LABELS).map(([value, label]) => {
                      const isActive = selectedOrder.status === value;
                      const style = STATUS_COLORS[value];
                      return (
                        <Button
                          key={value}
                          variant={isActive ? "default" : "outline"}
                          className={isActive ? "" : `hover:${style.bg}`}
                          onClick={() => updateStatusMutation.mutate({ id: selectedOrder.id, status: value })}
                          disabled={updateStatusMutation.isPending}
                        >
                          {isActive && <Check className="h-3 w-3 mr-1" />}
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fulfillment Reference (DoorDash/Uber Eats Order #)</Label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedOrder.fulfillmentChannel}
                      onValueChange={(value) => {
                        updateStatusMutation.mutate({
                          id: selectedOrder.id,
                          status: selectedOrder.status,
                          fulfillmentChannel: value,
                        });
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Channel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="doordash">DoorDash</SelectItem>
                        <SelectItem value="ubereats">Uber Eats</SelectItem>
                        <SelectItem value="direct">Direct</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Order confirmation #"
                      defaultValue={selectedOrder.fulfillmentRef || ""}
                      onBlur={(e) => {
                        if (e.target.value !== selectedOrder.fulfillmentRef) {
                          updateStatusMutation.mutate({
                            id: selectedOrder.id,
                            status: selectedOrder.status,
                            fulfillmentRef: e.target.value,
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Subscription Limit Modal */}
        <SubscriptionLimitModal
          isOpen={showSubscriptionLimit}
          onClose={() => setShowSubscriptionLimit(false)}
          currentTier={subscription?.tier || 'starter'}
          ordersUsed={subscription?.ordersThisMonth || 0}
          orderTotal={orderTotals.total}
          renewalDate={subscription?.currentPeriodEnd ? format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy') : undefined}
          onUpgrade={handleUpgradeFromLimit}
          onPayFullPrice={handlePayOverage}
        />
      </div>
    </div>
  );
}
