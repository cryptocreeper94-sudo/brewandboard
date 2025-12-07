import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  CheckCircle2,
  Package,
  Truck,
  XCircle,
  ChefHat,
  MapPin,
  Phone,
  User,
  Calendar,
  DollarSign,
  Coffee,
  RefreshCw,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit2,
  MessageSquare,
  Navigation,
  Users,
  Building2,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

const ORDER_STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50', Icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgLight: 'bg-emerald-50', Icon: CheckCircle },
  preparing: { label: 'Preparing', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-50', Icon: ChefHat },
  picked_up: { label: 'Picked Up', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50', Icon: Package },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-500', textColor: 'text-orange-700', bgLight: 'bg-orange-50', Icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-600', textColor: 'text-green-700', bgLight: 'bg-green-50', Icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50', Icon: XCircle },
};

const STATUS_FLOW = ['scheduled', 'confirmed', 'preparing', 'picked_up', 'out_for_delivery', 'delivered'];

interface OrderEvent {
  id: string;
  orderId: string;
  status: string;
  note?: string;
  changedBy?: string;
  changedByRole?: string;
  createdAt: string;
}

interface ScheduledOrder {
  id: string;
  userId: string;
  vendorName?: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  contactName?: string;
  contactPhone?: string;
  scheduledDate: string;
  scheduledTime: string;
  items: Array<{ name: string; quantity: number; price: string }>;
  subtotal: string;
  total: string;
  status: string;
  assignedDriverName?: string;
  driverPhone?: string;
  specialInstructions?: string;
  createdAt: string;
  events?: OrderEvent[];
}

export default function OperationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<ScheduledOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [driverName, setDriverName] = useState("");
  const [driverPhoneInput, setDriverPhoneInput] = useState("");

  const operatorRole = localStorage.getItem("userRole") || "admin";
  const operatorName = localStorage.getItem("userName") || "Operator";

  const { data: orders = [], isLoading, refetch: refetchOrders } = useQuery<ScheduledOrder[]>({
    queryKey: ["/api/operations/orders"],
    queryFn: async () => {
      const res = await fetch("/api/operations/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, note }: { orderId: string; status: string; note?: string }) => {
      const res = await fetch(`/api/operations/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status, 
          note, 
          changedBy: operatorName,
          changedByRole: operatorRole 
        }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operations/orders"] });
      toast({ title: "Status Updated", description: `Order moved to ${ORDER_STATUS_CONFIG[newStatus as keyof typeof ORDER_STATUS_CONFIG]?.label || newStatus}` });
      setIsUpdateStatusOpen(false);
      setNewStatus("");
      setStatusNote("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: async ({ orderId, driverName, driverPhone }: { orderId: string; driverName: string; driverPhone: string }) => {
      const res = await fetch(`/api/operations/orders/${orderId}/assign-driver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverName, driverPhone }),
      });
      if (!res.ok) throw new Error("Failed to assign driver");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operations/orders"] });
      toast({ title: "Driver Assigned", description: `${driverName} assigned to order` });
      setIsAssignDriverOpen(false);
      setDriverName("");
      setDriverPhoneInput("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const activeOrders = useMemo(() => 
    orders.filter(o => !['delivered', 'cancelled'].includes(o.status)),
    [orders]
  );

  const completedOrders = useMemo(() => 
    orders.filter(o => ['delivered', 'cancelled'].includes(o.status)),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const ordersToFilter = activeTab === "active" ? activeOrders : completedOrders;
    return ordersToFilter.filter(order => {
      const matchesSearch = !searchQuery || 
        order.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activeTab, activeOrders, completedOrders, searchQuery, statusFilter]);

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE, MMM d");
  };

  const getNextStatus = (currentStatus: string) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1) {
      return STATUS_FLOW[currentIndex + 1];
    }
    return null;
  };

  const handleQuickAdvance = (order: ScheduledOrder) => {
    const nextStatus = getNextStatus(order.status);
    if (nextStatus) {
      setSelectedOrder(order);
      setNewStatus(nextStatus);
      updateStatusMutation.mutate({ 
        orderId: order.id, 
        status: nextStatus, 
        note: `Advanced to ${ORDER_STATUS_CONFIG[nextStatus as keyof typeof ORDER_STATUS_CONFIG]?.label}` 
      });
    }
  };

  const openOrderDetail = (order: ScheduledOrder) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const openStatusUpdate = (order: ScheduledOrder) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsUpdateStatusOpen(true);
  };

  const openAssignDriver = (order: ScheduledOrder) => {
    setSelectedOrder(order);
    setDriverName(order.assignedDriverName || "");
    setDriverPhoneInput(order.driverPhone || "");
    setIsAssignDriverOpen(true);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG];
    if (!config) return <Badge variant="secondary">{status}</Badge>;
    const Icon = config.Icon;
    return (
      <Badge className={`${config.color} text-white gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const OrderCard = ({ order }: { order: ScheduledOrder }) => {
    const config = ORDER_STATUS_CONFIG[order.status as keyof typeof ORDER_STATUS_CONFIG];
    const nextStatus = getNextStatus(order.status);
    const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`border rounded-xl p-4 ${config?.bgLight || 'bg-white'} shadow-sm hover:shadow-md transition-all`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Coffee className="h-4 w-4 text-amber-600" />
              <span className="font-semibold text-sm">{order.vendorName || "Vendor"}</span>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {getDateLabel(order.scheduledDate)} at {order.scheduledTime}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <span className="text-xs line-clamp-2">{order.deliveryAddress}</span>
          </div>
          {order.contactName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs">{order.contactName}</span>
              {order.contactPhone && (
                <a href={`tel:${order.contactPhone}`} className="text-blue-600 hover:underline">
                  <Phone className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs">{itemCount} items • ${order.total}</span>
          </div>
          {order.assignedDriverName && (
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-purple-700">{order.assignedDriverName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {nextStatus && order.status !== 'cancelled' && (
            <Button
              size="sm"
              onClick={() => handleQuickAdvance(order)}
              disabled={updateStatusMutation.isPending}
              className="flex-1 text-white text-xs"
              style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
              data-testid={`button-advance-${order.id}`}
            >
              {updateStatusMutation.isPending ? "..." : `→ ${ORDER_STATUS_CONFIG[nextStatus as keyof typeof ORDER_STATUS_CONFIG]?.label}`}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openOrderDetail(order)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openStatusUpdate(order)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Update Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openAssignDriver(order)}>
                <Truck className="h-4 w-4 mr-2" />
                Assign Driver
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {order.contactPhone && (
                <DropdownMenuItem asChild>
                  <a href={`tel:${order.contactPhone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(order.deliveryAddress)}`} target="_blank">
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-background dark:from-[#1a0f09]/30 dark:via-background dark:to-background pb-20">
      <div 
        className="relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 25%, #3d2418 50%, #5c4033 100%)'
        }}
      >
        <motion.div 
          className="absolute inset-0 opacity-20"
          animate={{
            background: [
              'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              'linear-gradient(45deg, transparent 100%, rgba(255,255,255,0.3) 150%, transparent 200%)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="relative z-10 px-4 py-6">
          <div className="container max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="font-serif text-2xl text-white font-bold flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-amber-300" />
                    Operations Control Center
                  </h1>
                  <p className="text-sm text-[#d4c4b0]">Nashville Region • Live Orders</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">
                  <span className="animate-pulse mr-1">●</span> LIVE
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => refetchOrders()}
                  className="text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{activeOrders.length}</p>
                  <p className="text-xs text-white/70">Active Orders</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{orders.filter(o => o.status === 'out_for_delivery').length}</p>
                  <p className="text-xs text-white/70">En Route</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{completedOrders.filter(o => o.status === 'delivered').length}</p>
                  <p className="text-xs text-white/70">Delivered Today</p>
                </CardContent>
              </Card>
              <Card className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">${orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + parseFloat(o.total || '0'), 0).toFixed(0)}</p>
                  <p className="text-xs text-white/70">Revenue Today</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 40" className="w-full h-6 fill-stone-100 dark:fill-background" preserveAspectRatio="none">
            <path d="M0,40 L0,20 Q150,0 300,15 T600,10 T900,20 T1200,10 L1200,40 Z" />
          </svg>
        </div>
      </div>

      <main className="container max-w-6xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList>
              <TabsTrigger value="active" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Active ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Completed ({completedOrders.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                  data-testid="input-search-orders"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="active">
            {isLoading ? (
              <div className="text-center py-12">
                <Coffee className="h-12 w-12 mx-auto text-amber-600 animate-pulse mb-4" />
                <p className="text-muted-foreground">Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <h3 className="font-medium text-lg mb-2">All Clear!</h3>
                  <p className="text-muted-foreground">No active orders right now.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {filteredOrders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-2">No Completed Orders</h3>
                  <p className="text-muted-foreground">Completed orders will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-amber-600" />
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={selectedOrder.status} />
              </div>

              <div className="bg-stone-50 dark:bg-stone-900/50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Vendor</p>
                  <p className="font-medium">{selectedOrder.vendorName || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Delivery</p>
                  <p className="font-medium">{getDateLabel(selectedOrder.scheduledDate)} at {selectedOrder.scheduledTime}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Address</p>
                  <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                  {selectedOrder.deliveryInstructions && (
                    <p className="text-xs text-muted-foreground mt-1">{selectedOrder.deliveryInstructions}</p>
                  )}
                </div>
                {selectedOrder.contactName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Customer</p>
                    <p className="font-medium">{selectedOrder.contactName}</p>
                    {selectedOrder.contactPhone && (
                      <a href={`tel:${selectedOrder.contactPhone}`} className="text-blue-600 text-sm hover:underline">
                        {selectedOrder.contactPhone}
                      </a>
                    )}
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Items</p>
                <div className="space-y-1">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="text-muted-foreground">${item.price}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-medium">
                    <span>Total</span>
                    <span>${selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.specialInstructions && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                  <p className="text-xs text-amber-800 dark:text-amber-200 font-medium mb-1">Special Instructions</p>
                  <p className="text-sm">{selectedOrder.specialInstructions}</p>
                </div>
              )}

              {selectedOrder.assignedDriverName && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                  <p className="text-xs text-purple-800 dark:text-purple-200 font-medium mb-1">Assigned Driver</p>
                  <p className="text-sm font-medium">{selectedOrder.assignedDriverName}</p>
                  {selectedOrder.driverPhone && (
                    <a href={`tel:${selectedOrder.driverPhone}`} className="text-purple-600 text-sm hover:underline">
                      {selectedOrder.driverPhone}
                    </a>
                  )}
                </div>
              )}

              {selectedOrder.events && selectedOrder.events.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Timeline</p>
                  <div className="space-y-2">
                    {selectedOrder.events.map((event, i) => (
                      <div key={event.id || i} className="flex items-start gap-2 text-sm">
                        <div className={`h-2 w-2 rounded-full mt-1.5 ${ORDER_STATUS_CONFIG[event.status as keyof typeof ORDER_STATUS_CONFIG]?.color || 'bg-gray-400'}`} />
                        <div className="flex-1">
                          <p className="font-medium">{ORDER_STATUS_CONFIG[event.status as keyof typeof ORDER_STATUS_CONFIG]?.label || event.status}</p>
                          {event.note && <p className="text-xs text-muted-foreground">{event.note}</p>}
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(event.createdAt), "MMM d, h:mm a")}
                            {event.changedBy && ` • ${event.changedBy}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => openStatusUpdate(selectedOrder)} className="flex-1">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Update Status
                </Button>
                <Button variant="outline" onClick={() => openAssignDriver(selectedOrder)} className="flex-1">
                  <Truck className="h-4 w-4 mr-2" />
                  Assign Driver
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isUpdateStatusOpen} onOpenChange={setIsUpdateStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Change the status and add an optional note.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <config.Icon className="h-4 w-4" />
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Textarea
                placeholder="Add a note about this status change..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusOpen(false)}>Cancel</Button>
            <Button
              onClick={() => selectedOrder && updateStatusMutation.mutate({ 
                orderId: selectedOrder.id, 
                status: newStatus, 
                note: statusNote 
              })}
              disabled={!newStatus || updateStatusMutation.isPending}
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignDriverOpen} onOpenChange={setIsAssignDriverOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
            <DialogDescription>Assign a driver to this delivery.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Driver Name</Label>
              <Input
                placeholder="Enter driver name"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                data-testid="input-driver-name"
              />
            </div>
            <div className="space-y-2">
              <Label>Driver Phone</Label>
              <Input
                placeholder="(555) 123-4567"
                value={driverPhoneInput}
                onChange={(e) => setDriverPhoneInput(e.target.value)}
                data-testid="input-driver-phone"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDriverOpen(false)}>Cancel</Button>
            <Button
              onClick={() => selectedOrder && assignDriverMutation.mutate({ 
                orderId: selectedOrder.id, 
                driverName, 
                driverPhone: driverPhoneInput 
              })}
              disabled={!driverName || assignDriverMutation.isPending}
              className="text-white"
              style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
            >
              {assignDriverMutation.isPending ? "Assigning..." : "Assign Driver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
