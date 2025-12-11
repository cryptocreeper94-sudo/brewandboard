import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  CheckCircle2, 
  Circle,
  Coffee, 
  Truck,
  MapPin,
  Phone,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Package
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface OrderEvent {
  id: number;
  status: string;
  changedAt: string;
  changedBy?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

interface ActiveOrder {
  id: number;
  vendorName: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  deliveryAddress: string;
  contactPhone?: string;
  estimatedArrival?: string;
  driverName?: string;
  driverPhone?: string;
  events: OrderEvent[];
}

const statusSteps = [
  { key: "scheduled", label: "Scheduled", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: Coffee },
  { key: "picked_up", label: "Picked Up", icon: Package },
  { key: "out_for_delivery", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 }
];

function getStatusIndex(status: string): number {
  const idx = statusSteps.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  
  if (diffMins < 0) return "Arrived";
  if (diffMins < 60) return `${diffMins} min`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}

export function OrderStatusTimeline({ userId }: { userId: string }) {
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const { data: activeOrders = [], isLoading, refetch } = useQuery<ActiveOrder[]>({
    queryKey: ["/api/orders/active", userId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/active/${userId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-green-500/5 border-emerald-500/20">
        <div className="flex items-center gap-2 mb-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="h-5 w-5 text-emerald-500" />
          </motion.div>
          <h3 className="font-serif text-lg">Loading Orders...</h3>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (!activeOrders.length) {
    return (
      <Card className="p-6 bg-gradient-to-br from-emerald-500/5 to-green-500/5 border-emerald-500/20 text-center">
        <Truck className="h-12 w-12 mx-auto mb-3 text-emerald-400/40" />
        <h3 className="font-serif text-lg mb-2">No Active Orders</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Your order tracking will appear here when you have active deliveries
        </p>
        <Link href="/schedule">
          <Button 
            variant="outline"
            className="border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600"
            data-testid="button-place-order"
          >
            <Coffee className="h-4 w-4 mr-2" />
            Place Order
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-emerald-500/5 to-green-500/5 border-emerald-500/20">
      <div className="p-4 border-b border-emerald-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Truck className="h-5 w-5 text-emerald-500" />
            </motion.div>
            <h3 className="font-serif text-lg">Active Orders</h3>
            <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700">
              {activeOrders.length} Active
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="h-7 px-2"
            data-testid="button-refresh-tracking"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <AnimatePresence>
          {activeOrders.map((order) => {
            const currentStepIndex = getStatusIndex(order.status);
            const progressPercent = ((currentStepIndex + 1) / statusSteps.length) * 100;
            const isExpanded = expandedOrder === order.id;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div 
                  className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                  data-testid={`order-tracking-${order.id}`}
                >
                  <div 
                    className="p-3 cursor-pointer"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, #2d1810 0%, #5c4033 100%)' }}
                        >
                          <Coffee className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{order.vendorName}</h4>
                          <p className="text-[10px] text-muted-foreground">
                            {order.scheduledDate} at {order.scheduledTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`text-[10px] ${
                            order.status === "delivered" 
                              ? "bg-emerald-100 text-emerald-700" 
                              : order.status === "out_for_delivery"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {statusSteps[currentStepIndex]?.label || order.status}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="mb-2">
                      <Progress value={progressPercent} className="h-1.5" />
                    </div>

                    <div className="flex justify-between text-[10px]">
                      {statusSteps.slice(0, 4).map((step, idx) => {
                        const StepIcon = step.icon;
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        return (
                          <div 
                            key={step.key} 
                            className={`flex flex-col items-center gap-0.5 ${
                              isCompleted ? "text-emerald-600" : "text-muted-foreground"
                            }`}
                          >
                            {isCurrent ? (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <StepIcon className="h-3.5 w-3.5" />
                              </motion.div>
                            ) : (
                              <StepIcon className="h-3.5 w-3.5" />
                            )}
                            <span className="hidden md:block">{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t"
                      >
                        <div className="p-3 space-y-3 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Delivery Address</p>
                              <p className="text-sm">{order.deliveryAddress}</p>
                            </div>
                          </div>

                          {order.estimatedArrival && (
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <p className="text-xs text-muted-foreground">Estimated Arrival</p>
                                <p className="text-sm font-medium text-emerald-600">
                                  {formatRelativeTime(order.estimatedArrival)}
                                </p>
                              </div>
                            </div>
                          )}

                          {order.driverName && (
                            <div className="flex items-start gap-2">
                              <Truck className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Driver</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-sm">{order.driverName}</p>
                                  {order.driverPhone && (
                                    <a href={`tel:${order.driverPhone}`}>
                                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                                        <Phone className="h-3 w-3" />
                                        Call
                                      </Button>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {order.events && order.events.length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground mb-2">Timeline</p>
                              <div className="space-y-2">
                                {order.events.slice(-4).map((event, idx) => (
                                  <div key={event.id} className="flex items-start gap-2">
                                    <div className={`h-2 w-2 rounded-full mt-1.5 ${
                                      idx === 0 ? "bg-emerald-500" : "bg-muted-foreground/30"
                                    }`} />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium">
                                          {event.status.replace(/_/g, " ")}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">
                                          {formatTime(event.changedAt)}
                                        </span>
                                      </div>
                                      {event.notes && (
                                        <p className="text-[10px] text-muted-foreground">{event.notes}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
}
