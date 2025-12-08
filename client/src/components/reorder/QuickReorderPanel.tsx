import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  RotateCcw, 
  Clock, 
  Coffee, 
  ChevronRight, 
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Heart
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface PastOrder {
  id: number;
  vendorName: string;
  vendorLogo?: string;
  items: string[];
  total: number;
  date: string;
  deliveryAddress: string;
  headcount?: number;
}

export function QuickReorderPanel({ userId }: { userId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [reordering, setReordering] = useState<number | null>(null);

  const { data: pastOrders = [], isLoading } = useQuery<PastOrder[]>({
    queryKey: ["/api/recent-orders", userId],
    queryFn: async () => {
      const res = await fetch(`/api/recent-orders/${userId}?limit=5`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderId: number) => {
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
        description: "Your reorder has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/recent"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place reorder. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => setReordering(null),
  });

  const handleReorder = (orderId: number) => {
    setReordering(orderId);
    reorderMutation.mutate(orderId);
  };

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-[#2d1810]/10 to-[#5c4033]/5 border-[#5c4033]/20">
        <div className="flex items-center gap-2 mb-4">
          <RotateCcw className="h-5 w-5 text-[#5c4033] animate-spin" />
          <h3 className="font-serif text-lg">Loading Orders...</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (!pastOrders.length) {
    return (
      <Card className="p-6 bg-gradient-to-br from-[#2d1810]/10 to-[#5c4033]/5 border-[#5c4033]/20 text-center">
        <Coffee className="h-12 w-12 mx-auto mb-3 text-[#5c4033]/40" />
        <h3 className="font-serif text-lg mb-2">No Past Orders Yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your order history will appear here for quick reordering
        </p>
        <Link href="/schedule">
          <Button 
            className="shine-effect"
            style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
            data-testid="button-place-first-order"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Place Your First Order
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-[#2d1810]/10 to-[#5c4033]/5 border-[#5c4033]/20">
      <div className="p-4 border-b border-[#5c4033]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <RotateCcw className="h-5 w-5 text-[#5c4033]" />
            </motion.div>
            <h3 className="font-serif text-lg">Quick Reorder</h3>
            <Badge variant="secondary" className="text-[10px]">
              {pastOrders.length} recent
            </Badge>
          </div>
          <Link href="/orders/history">
            <Button variant="ghost" size="sm" className="text-xs gap-1" data-testid="link-view-all-orders">
              View All <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>

      <ScrollArea className="h-[280px]">
        <div className="p-3 space-y-3">
          <AnimatePresence>
            {pastOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative bg-card border rounded-xl p-3 hover:shadow-md transition-all hover:border-[#5c4033]/30">
                  <div className="flex items-start gap-3">
                    <div 
                      className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg, #2d1810 0%, #5c4033 100%)' }}
                    >
                      {order.vendorLogo ? (
                        <img src={order.vendorLogo} alt={order.vendorName} className="h-8 w-8 rounded" />
                      ) : (
                        <Coffee className="h-6 w-6 text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-sm line-clamp-1">{order.vendorName}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {order.items.slice(0, 3).join(", ")}
                            {order.items.length > 3 && ` +${order.items.length - 3} more`}
                          </p>
                        </div>
                        <span className="font-semibold text-sm whitespace-nowrap">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {order.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {order.deliveryAddress}
                        </span>
                        {order.headcount && (
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {order.headcount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleReorder(order.id)}
                      disabled={reordering === order.id}
                      className="flex-1 h-8 text-xs text-white shine-effect"
                      style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                      data-testid={`button-reorder-${order.id}`}
                    >
                      {reordering === order.id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </motion.div>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1" />
                          Reorder
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 border-[#5c4033]/20 hover:bg-[#5c4033]/10"
                      data-testid={`button-save-template-${order.id}`}
                    >
                      <Heart className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  );
}
