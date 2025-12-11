import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from "date-fns";
import {
  ChevronLeft,
  Calendar,
  Coffee,
  MapPin,
  Clock,
  Download,
  RotateCcw,
  Filter,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Package,
  Truck,
  DollarSign,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface OrderItem {
  menuItemId?: string;
  name: string;
  quantity: number;
  price: string;
  notes?: string;
}

interface Order {
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
  salesTax?: string;
  serviceFee: string;
  deliveryFee: string;
  gratuity?: string;
  total: string;
  status: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  pending_payment: { label: "Awaiting Payment", color: "text-yellow-700", bg: "bg-yellow-100", icon: Clock },
  scheduled: { label: "Scheduled", color: "text-blue-700", bg: "bg-blue-100", icon: Calendar },
  confirmed: { label: "Confirmed", color: "text-purple-700", bg: "bg-purple-100", icon: CheckCircle2 },
  preparing: { label: "Preparing", color: "text-stone-700", bg: "bg-stone-100", icon: Coffee },
  picked_up: { label: "Picked Up", color: "text-amber-700", bg: "bg-amber-100", icon: Package },
  out_for_delivery: { label: "On the Way", color: "text-orange-700", bg: "bg-orange-100", icon: Truck },
  delivered: { label: "Delivered", color: "text-green-700", bg: "bg-green-100", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100", icon: XCircle },
};

export default function OrderHistoryPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [templateName, setTemplateName] = useState("");
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedOrderForTemplate, setSelectedOrderForTemplate] = useState<Order | null>(null);

  const userStr = localStorage.getItem("coffee_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["order-history", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/orders/history/${userId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/orders/${orderId}/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Order Placed!",
        description: "Your order has been scheduled for tomorrow. Check the Schedule page to adjust the time.",
      });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place reorder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveTemplateMutation = useMutation({
    mutationFn: async ({ order, name }: { order: Order; name: string }) => {
      const res = await fetch("/api/order-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name,
          vendorName: order.vendorName,
          items: order.items,
          deliveryAddress: order.deliveryAddress,
          deliveryInstructions: order.deliveryInstructions,
        }),
      });
      if (!res.ok) throw new Error("Failed to save template");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Template Saved!",
        description: "You can now quickly reorder this from your dashboard.",
      });
      setShowTemplateDialog(false);
      setSelectedOrderForTemplate(null);
      setTemplateName("");
      queryClient.invalidateQueries({ queryKey: ["/api/order-templates"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.vendorName?.toLowerCase().includes(query) ||
          order.deliveryAddress.toLowerCase().includes(query) ||
          order.items.some((item) => item.name.toLowerCase().includes(query))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      let startDate: Date;
      
      switch (dateFilter) {
        case "this_month":
          startDate = startOfMonth(now);
          break;
        case "last_month":
          startDate = startOfMonth(subMonths(now, 1));
          filtered = filtered.filter((order) => {
            const orderDate = parseISO(order.scheduledDate);
            return orderDate >= startDate && orderDate <= endOfMonth(subMonths(now, 1));
          });
          return filtered;
        case "last_3_months":
          startDate = subMonths(now, 3);
          break;
        case "last_6_months":
          startDate = subMonths(now, 6);
          break;
        default:
          startDate = new Date(0);
      }
      
      filtered = filtered.filter((order) => parseISO(order.scheduledDate) >= startDate);
    }

    return filtered.sort((a, b) => 
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    );
  }, [orders, searchQuery, statusFilter, dateFilter]);

  const generateReceiptPDF = (order: Order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFillColor(26, 15, 9);
    doc.rect(0, 0, pageWidth, 45, "F");
    
    doc.setTextColor(254, 243, 199);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Brew & Board Coffee", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Order Receipt", pageWidth / 2, 32, { align: "center" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    let y = 55;
    
    doc.setFont("helvetica", "bold");
    doc.text("Order Details", 20, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: ${order.id.slice(0, 8)}...`, 20, y);
    y += 6;
    doc.text(`Date: ${format(parseISO(order.scheduledDate), "MMMM d, yyyy")}`, 20, y);
    y += 6;
    doc.text(`Time: ${order.scheduledTime}`, 20, y);
    y += 6;
    doc.text(`Vendor: ${order.vendorName || "N/A"}`, 20, y);
    y += 6;
    doc.text(`Status: ${STATUS_CONFIG[order.status]?.label || order.status}`, 20, y);
    y += 12;
    
    doc.setFont("helvetica", "bold");
    doc.text("Delivery Information", 20, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    const addressLines = doc.splitTextToSize(order.deliveryAddress, pageWidth - 40);
    addressLines.forEach((line: string) => {
      doc.text(line, 20, y);
      y += 6;
    });
    
    if (order.contactName) {
      doc.text(`Contact: ${order.contactName}`, 20, y);
      y += 6;
    }
    if (order.contactPhone) {
      doc.text(`Phone: ${order.contactPhone}`, 20, y);
      y += 6;
    }
    y += 6;
    
    doc.setFont("helvetica", "bold");
    doc.text("Items Ordered", 20, y);
    y += 8;
    
    doc.setFont("helvetica", "normal");
    order.items.forEach((item) => {
      doc.text(`${item.quantity}x ${item.name}`, 20, y);
      doc.text(`$${(parseFloat(item.price) * item.quantity).toFixed(2)}`, pageWidth - 30, y, { align: "right" });
      y += 6;
    });
    
    y += 6;
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    y += 8;
    
    doc.text("Subtotal:", 20, y);
    doc.text(`$${order.subtotal}`, pageWidth - 30, y, { align: "right" });
    y += 6;
    
    if (order.salesTax) {
      doc.text("TN Sales Tax (9.25%):", 20, y);
      doc.text(`$${order.salesTax}`, pageWidth - 30, y, { align: "right" });
      y += 6;
    }
    
    doc.text("Service Fee (15%):", 20, y);
    doc.text(`$${order.serviceFee}`, pageWidth - 30, y, { align: "right" });
    y += 6;
    
    doc.text("Delivery Fee:", 20, y);
    doc.text(`$${order.deliveryFee}`, pageWidth - 30, y, { align: "right" });
    y += 6;
    
    if (order.gratuity && parseFloat(order.gratuity) > 0) {
      doc.text("Gratuity:", 20, y);
      doc.text(`$${order.gratuity}`, pageWidth - 30, y, { align: "right" });
      y += 6;
    }
    
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Total:", 20, y);
    doc.text(`$${order.total}`, pageWidth - 30, y, { align: "right" });
    
    y += 20;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text("Thank you for choosing Brew & Board Coffee!", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.text("Nashville's Premier B2B Coffee & Catering Service", pageWidth / 2, y, { align: "center" });
    y += 5;
    doc.text("brewandboard.coffee | sipandmeet@brewandboard.coffee", pageWidth / 2, y, { align: "center" });
    
    doc.save(`BrewBoard_Receipt_${format(parseISO(order.scheduledDate), "yyyy-MM-dd")}_${order.id.slice(0, 8)}.pdf`);
    
    toast({
      title: "Receipt Downloaded",
      description: "Your PDF receipt has been saved.",
    });
  };

  const handleSaveAsTemplate = (order: Order) => {
    setSelectedOrderForTemplate(order);
    setTemplateName(`${order.vendorName} Order`);
    setShowTemplateDialog(true);
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <FileText className="h-16 w-16 mx-auto mb-4 text-amber-600" />
          <h2 className="text-2xl font-serif mb-2">Sign In to View Order History</h2>
          <p className="text-muted-foreground mb-6">
            Access your complete order history, download receipts, and quickly reorder your favorites.
          </p>
          <Link href="/dashboard?action=login">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-background dark:from-[#1a0f09]/30 dark:via-background dark:to-background text-foreground pb-20">
      {/* Hero Header with Shimmering Effect */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, #1a0f09 0%, #2d1810 25%, #3d2216 50%, #4a2c1c 75%, #5a3620 100%)' }}
        />
        <motion.div 
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
              'linear-gradient(45deg, transparent 100%, rgba(255,255,255,0.3) 150%, transparent 200%)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ backgroundSize: '200% 200%' }}
        />
        <div className="relative z-10 px-4 py-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-amber-100 hover:bg-amber-100/20" data-testid="button-back">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-3xl font-bold text-amber-50 flex items-center gap-3">
                  <FileText className="h-8 w-8 text-amber-200" />
                  Order History
                </h1>
                <p className="text-amber-100/80 text-sm">View past orders, download receipts, and reorder favorites</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters with Glassmorphism */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-4">
        <div className="premium-card p-4 rounded-xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/50 dark:bg-black/20"
                data-testid="input-search-orders"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px] bg-white/50 dark:bg-black/20" data-testid="select-status-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[160px] bg-white/50 dark:bg-black/20" data-testid="select-date-filter">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="last_6_months">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 mt-6">

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="premium-card p-8 text-center rounded-xl">
            <Coffee className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="font-serif text-xl mb-2">No Orders Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters"
                : "Place your first order to see it here"}
            </p>
            <Link href="/schedule">
              <Button 
                style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                data-testid="button-browse-vendors"
              >
                <Coffee className="h-4 w-4 mr-2" />
                Browse Vendors
              </Button>
            </Link>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredOrders.map((order, index) => {
              const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.scheduled;
              const StatusIcon = statusConfig.icon;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AccordionItem 
                    value={order.id}
                    className="premium-card rounded-xl overflow-hidden border-0"
                    data-testid={`card-order-${order.id}`}
                  >
                    <AccordionTrigger className="p-4 hover:no-underline [&[data-state=open]>div>.chevron]:rotate-180">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 text-left">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                            >
                              <Coffee className="h-6 w-6 text-amber-100" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{order.vendorName || "Coffee Order"}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(parseISO(order.scheduledDate), "MMM d, yyyy")} at {order.scheduledTime}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${statusConfig.bg} ${statusConfig.color} ml-2`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${order.total}
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            {order.deliveryAddress.split(',')[0]}
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="pt-4 border-t space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Items Ordered</h4>
                          <div className="space-y-1">
                            {order.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="text-muted-foreground">
                                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="ml-2">${order.subtotal}</span>
                          </div>
                          {order.salesTax && (
                            <div>
                              <span className="text-muted-foreground">Tax:</span>
                              <span className="ml-2">${order.salesTax}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Service:</span>
                            <span className="ml-2">${order.serviceFee}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Delivery:</span>
                            <span className="ml-2">${order.deliveryFee}</span>
                          </div>
                          {order.gratuity && parseFloat(order.gratuity) > 0 && (
                            <div>
                              <span className="text-muted-foreground">Tip:</span>
                              <span className="ml-2">${order.gratuity}</span>
                            </div>
                          )}
                          <div className="font-semibold">
                            <span>Total:</span>
                            <span className="ml-2">${order.total}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); generateReceiptPDF(order); }}
                            data-testid={`button-download-receipt-${order.id}`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download Receipt
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); reorderMutation.mutate(order.id); }}
                            disabled={reorderMutation.isPending}
                            style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                            data-testid={`button-reorder-${order.id}`}
                          >
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reorder
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); handleSaveAsTemplate(order); }}
                            data-testid={`button-save-template-${order.id}`}
                          >
                            <Bookmark className="h-4 w-4 mr-1" />
                            Save as Template
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              );
            })}
          </Accordion>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Save as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Save this order as a template for quick reordering from your dashboard.
            </p>
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Monday Team Meeting"
                className="mt-1"
                data-testid="input-template-name"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplateDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedOrderForTemplate && templateName.trim()) {
                    saveTemplateMutation.mutate({
                      order: selectedOrderForTemplate,
                      name: templateName.trim(),
                    });
                  }
                }}
                disabled={!templateName.trim() || saveTemplateMutation.isPending}
                className="flex-1"
                style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                data-testid="button-confirm-save-template"
              >
                {saveTemplateMutation.isPending ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
