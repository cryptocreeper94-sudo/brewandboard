import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  CalendarCheck,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  Sparkles,
  RefreshCw,
  Link2,
  Link2Off,
  Coffee
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  attendeeCount?: number;
  hasExistingOrder?: boolean;
}

interface CalendarSyncSettings {
  connected: boolean;
  email?: string;
  autoSuggest: boolean;
  reminderHours: number;
}

export function CalendarSyncWidget({ userId }: { userId: number }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSettings, setShowSettings] = useState(false);

  const { data: settings } = useQuery<CalendarSyncSettings>({
    queryKey: ["/api/calendar/settings", userId],
    queryFn: async () => {
      const res = await fetch(`/api/calendar/settings/${userId}`);
      if (!res.ok) return { connected: false, autoSuggest: false, reminderHours: 4 };
      return res.json();
    },
    enabled: !!userId,
  });

  const { data: upcomingMeetings = [], isLoading, refetch } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/upcoming", userId],
    queryFn: async () => {
      const res = await fetch(`/api/calendar/upcoming/${userId}?days=7`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!userId && settings?.connected,
  });

  const connectMutation = useMutation({
    mutationFn: async () => {
      window.open("/api/calendar/connect/google", "_blank", "width=500,height=600");
      return new Promise<void>((resolve) => {
        const checkConnection = setInterval(async () => {
          const res = await fetch(`/api/calendar/settings/${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.connected) {
              clearInterval(checkConnection);
              resolve();
            }
          }
        }, 2000);
        setTimeout(() => {
          clearInterval(checkConnection);
          resolve();
        }, 60000);
      });
    },
    onSuccess: () => {
      toast({ title: "Calendar connected!" });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar"] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<CalendarSyncSettings>) => {
      const res = await fetch(`/api/calendar/settings/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/settings"] });
    },
  });

  const formatMeetingTime = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let dayLabel = startDate.toLocaleDateString("en-US", { weekday: "short" });
    if (startDate.toDateString() === today.toDateString()) dayLabel = "Today";
    if (startDate.toDateString() === tomorrow.toDateString()) dayLabel = "Tomorrow";
    
    const timeStr = startDate.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit" 
    });
    
    return `${dayLabel} at ${timeStr}`;
  };

  if (!settings?.connected) {
    return (
      <Card 
        className="p-4 bg-gradient-to-br from-sky-500/5 to-blue-500/5 border-sky-500/20 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => connectMutation.mutate()}
        data-testid="card-connect-calendar"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Connect Calendar</h4>
              <p className="text-xs text-muted-foreground">Auto-suggest catering for meetings</p>
            </div>
          </div>
          {connectMutation.isPending ? (
            <RefreshCw className="h-5 w-5 text-sky-500 animate-spin" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden bg-gradient-to-br from-sky-500/5 to-blue-500/5 border-sky-500/20">
        <div className="p-4 border-b border-sky-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-sky-500" />
              <span className="font-serif text-lg">Upcoming Meetings</span>
              <Badge variant="secondary" className="text-[10px] bg-sky-100 text-sky-700">
                <Link2 className="h-2.5 w-2.5 mr-1" />
                Synced
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="h-7 px-2"
                data-testid="button-refresh-calendar"
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="h-7 px-2 text-xs"
                data-testid="button-calendar-settings"
              >
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-2 max-h-[280px] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : upcomingMeetings.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No meetings in the next 7 days</p>
            </div>
          ) : (
            <AnimatePresence>
              {upcomingMeetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="bg-card border rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">{meeting.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatMeetingTime(meeting.start, meeting.end)}
                          </span>
                          {meeting.attendeeCount && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {meeting.attendeeCount}
                            </span>
                          )}
                        </div>
                        {meeting.location && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {meeting.location}
                          </p>
                        )}
                      </div>
                      {meeting.hasExistingOrder ? (
                        <Badge className="text-[10px] bg-emerald-100 text-emerald-700 shrink-0">
                          <Coffee className="h-2.5 w-2.5 mr-1" />
                          Ordered
                        </Badge>
                      ) : (
                        <Link href={`/schedule?meeting=${meeting.id}&attendees=${meeting.attendeeCount || 1}`}>
                          <Button
                            size="sm"
                            className="h-7 text-[10px] text-white shrink-0 shine-effect"
                            style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                            data-testid={`button-order-for-meeting-${meeting.id}`}
                          >
                            <Sparkles className="h-3 w-3 mr-1" />
                            Order
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </Card>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-500" />
              Calendar Settings
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="text-sm font-medium">Connected</p>
                  <p className="text-[10px] text-muted-foreground">{settings?.email || "Google Calendar"}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs text-destructive"
                onClick={() => {
                  updateSettingsMutation.mutate({ connected: false });
                  setShowSettings(false);
                }}
              >
                <Link2Off className="h-3 w-3 mr-1" />
                Disconnect
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Smart Suggestions</p>
                <p className="text-xs text-muted-foreground">Get catering suggestions for meetings</p>
              </div>
              <Switch
                checked={settings?.autoSuggest ?? false}
                onCheckedChange={(checked) => updateSettingsMutation.mutate({ autoSuggest: checked })}
                data-testid="switch-auto-suggest"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Reminder Lead Time</p>
                <p className="text-xs text-muted-foreground">Hours before meeting to remind</p>
              </div>
              <select
                value={settings?.reminderHours ?? 4}
                onChange={(e) => updateSettingsMutation.mutate({ reminderHours: parseInt(e.target.value) })}
                className="text-sm border rounded px-2 py-1"
                data-testid="select-reminder-hours"
              >
                <option value={2}>2 hours</option>
                <option value={4}>4 hours</option>
                <option value={8}>8 hours</option>
                <option value={24}>1 day</option>
              </select>
            </div>

            <div className="pt-2 border-t text-center">
              <p className="text-[10px] text-muted-foreground">
                Powered by Google Calendar API
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
