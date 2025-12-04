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
  Trash2
} from "lucide-react";
import { SERVICE_FEE_PERCENT, DELIVERY_COORDINATION_FEE } from "@/lib/mock-data";
import { useCart } from "@/contexts/CartContext";
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
  preparing: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
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
  const { items: cartItems, vendorName: cartVendorName, clearCart, updateQuantity, removeItem, subtotal, serviceFee, deliveryFee, total, itemCount } = useCart();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ScheduledOrder | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
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

  const orderTotals = useMemo(() => {
    const subtotal = newOrder.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const serviceFee = subtotal * SERVICE_FEE_PERCENT;
    const deliveryFee = DELIVERY_COORDINATION_FEE;
    const total = subtotal + serviceFee + deliveryFee;
    return { subtotal, serviceFee, deliveryFee, total };
  }, [newOrder.items]);

  const handleCreateOrder = () => {
    const { subtotal, serviceFee, deliveryFee, total } = orderTotals;

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
      serviceFee: serviceFee.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      total: total.toFixed(2),
      specialInstructions: newOrder.specialInstructions || null,
    });
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4">Please log in to access the schedule</h2>
          <Button onClick={() => window.location.href = "/"}>Go to Login</Button>
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
            className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-amber-600" />
                <span className="font-medium text-amber-900">Your Cart from {cartVendorName}</span>
                <Badge className="bg-amber-600 text-white">{itemCount} items</Badge>
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
                    <span className="text-sm font-medium text-amber-900">{item.name}</span>
                    <span className="text-xs text-amber-600 ml-2">${item.price.toFixed(2)} ea</span>
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
            
            <div className="flex justify-between items-center pt-2 border-t border-amber-200">
              <div className="text-sm text-amber-700">
                <span>Subtotal: ${subtotal.toFixed(2)}</span>
                <span className="mx-2">+</span>
                <span>Fee: ${serviceFee.toFixed(2)}</span>
                <span className="mx-2">+</span>
                <span>Delivery: ${deliveryFee.toFixed(2)}</span>
              </div>
              <span className="font-bold text-amber-900">Total: ${total.toFixed(2)}</span>
            </div>
          </motion.div>
        )}

        {/* Lead Time Disclaimer */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-amber-800 font-medium text-sm">Delivery Lead Time Notice</p>
            <p className="text-amber-700 text-sm">
              Orders must be placed at least <strong>{MINIMUM_ORDER_LEAD_TIME_HOURS} hours</strong> before your requested delivery time. For guaranteed on-time delivery, we recommend <strong>24+ hours advance notice</strong> when possible.
            </p>
            <p className="text-amber-600 text-xs">
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
                      ? "border-amber-300 bg-amber-50" 
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
                    <Coffee className="h-3 w-3 text-amber-600" />
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
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                            <Coffee className="h-5 w-5 text-amber-700" />
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

              {/* Delivery Instructions */}
              <div className="space-y-2">
                <Label>Delivery Instructions</Label>
                <Textarea
                  placeholder="Building access codes, where to leave order, etc..."
                  value={newOrder.deliveryInstructions}
                  onChange={(e) => setNewOrder({ ...newOrder, deliveryInstructions: e.target.value })}
                  data-testid="input-delivery-instructions"
                />
              </div>

              {/* Order Summary */}
              {orderTotals.subtotal > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <h4 className="font-medium text-amber-800 flex items-center gap-2">
                    <Coffee className="h-4 w-4" />
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
                        Delivery Coordination
                      </span>
                      <span>${orderTotals.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-amber-200 mt-2">
                      <span>Total</span>
                      <span className="text-amber-700">${orderTotals.total.toFixed(2)}</span>
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
                onClick={handleCreateOrder}
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
                    <Coffee className="h-4 w-4 text-amber-600" />
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
      </div>
    </div>
  );
}
