import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  UserCheck,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Send,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  Building2,
  Globe2,
  Sparkles,
  AlertCircle,
  Coffee,
  Eye,
  Package,
  ChevronRight,
  Mail,
  Phone,
  Edit2,
  ExternalLink
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Attendee {
  name: string;
  email?: string;
  phone?: string;
  locationLabel?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface VirtualMeeting {
  id: string;
  title: string;
  description?: string;
  hostUserId?: string;
  hostName?: string;
  hostCompany?: string;
  meetingDate: string;
  meetingTime: string;
  timezone: string;
  deliveryScope: string;
  budgetType: string;
  perPersonBudgetCents?: number;
  totalBudgetCents?: number;
  status: string;
  inviteToken: string;
  attendees?: any[];
  orders?: any[];
  events?: any[];
  createdAt: string;
}

export default function VirtualHostPage() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("create");
  const [step, setStep] = useState(1);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<VirtualMeeting | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meetingDate: "",
    meetingTime: "09:00",
    timezone: "America/Chicago",
    deliveryScope: "local",
    budgetType: "per_person",
    perPersonBudgetCents: 1500,
    totalBudgetCents: 0,
    hostName: localStorage.getItem("userName") || "",
    hostEmail: localStorage.getItem("userEmail") || "",
    hostCompany: "",
    hostUserId: localStorage.getItem("userId") || "guest"
  });

  const [attendees, setAttendees] = useState<Attendee[]>([
    { name: "", email: "", phone: "", locationLabel: "", addressLine1: "", city: "", state: "", zipCode: "" }
  ]);

  // Fetch existing meetings
  const { data: meetings, isLoading: loadingMeetings } = useQuery<VirtualMeeting[]>({
    queryKey: ["/api/virtual-meetings", formData.hostUserId],
    queryFn: async () => {
      const res = await fetch(`/api/virtual-meetings?hostUserId=${formData.hostUserId}`);
      if (!res.ok) throw new Error("Failed to fetch meetings");
      return res.json();
    }
  });

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/virtual-meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to create meeting");
      return res.json() as Promise<VirtualMeeting>;
    },
    onSuccess: (meeting: VirtualMeeting) => {
      toast({ title: "Meeting Created", description: "Now add your attendees" });
      setSelectedMeeting(meeting);
      setStep(2);
      queryClient.invalidateQueries({ queryKey: ["/api/virtual-meetings"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Add attendees mutation
  const addAttendeesMutation = useMutation({
    mutationFn: async ({ meetingId, attendees }: { meetingId: string; attendees: Attendee[] }) => {
      const res = await fetch(`/api/virtual-meetings/${meetingId}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attendees })
      });
      if (!res.ok) throw new Error("Failed to add attendees");
      return res.json() as Promise<any[]>;
    },
    onSuccess: (data: any[]) => {
      toast({ title: "Attendees Added", description: `${data.length} attendees invited` });
      queryClient.invalidateQueries({ queryKey: ["/api/virtual-meetings"] });
      setShowInviteModal(true);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleCreateMeeting = () => {
    if (!formData.title || !formData.meetingDate || !formData.meetingTime) {
      toast({ title: "Missing Info", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    createMeetingMutation.mutate(formData);
  };

  const handleAddAttendees = () => {
    const validAttendees = attendees.filter(a => a.name.trim());
    if (validAttendees.length === 0) {
      toast({ title: "No Attendees", description: "Add at least one attendee", variant: "destructive" });
      return;
    }
    if (!selectedMeeting) return;
    addAttendeesMutation.mutate({ meetingId: selectedMeeting.id, attendees: validAttendees });
  };

  const addAttendeeRow = () => {
    setAttendees([...attendees, { name: "", email: "", phone: "", locationLabel: "", addressLine1: "", city: "", state: "", zipCode: "" }]);
  };

  const removeAttendeeRow = (index: number) => {
    if (attendees.length > 1) {
      setAttendees(attendees.filter((_, i) => i !== index));
    }
  };

  const updateAttendee = (index: number, field: keyof Attendee, value: string) => {
    const updated = [...attendees];
    updated[index] = { ...updated[index], [field]: value };
    setAttendees(updated);
  };

  const copyInviteLink = (token: string, attendeeName?: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/virtual-order/${token}`;
    navigator.clipboard.writeText(link);
    toast({ 
      title: "Link Copied", 
      description: attendeeName ? `Invite link for ${attendeeName} copied` : "Invite link copied to clipboard" 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
      case 'collecting': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'ordered': return 'bg-amber-500/20 text-amber-700 dark:text-amber-300';
      case 'delivered': return 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300';
      case 'cancelled': return 'bg-red-500/20 text-red-700 dark:text-red-300';
      default: return 'bg-gray-500/20 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'collecting': return 'Collecting Orders';
      case 'ordered': return 'Orders Placed';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  // View meeting details
  const { data: meetingDetails, isLoading: loadingDetails } = useQuery<VirtualMeeting>({
    queryKey: ["/api/virtual-meetings", selectedMeeting?.id],
    queryFn: async () => {
      const res = await fetch(`/api/virtual-meetings/${selectedMeeting!.id}`);
      if (!res.ok) throw new Error("Failed to fetch meeting details");
      return res.json();
    },
    enabled: !!selectedMeeting?.id && activeTab === "manage"
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-background dark:from-[#1a0f09]/30 dark:via-background dark:to-background pb-20">
      {/* Header */}
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
          <div className="container max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="font-serif text-2xl text-white font-bold flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-amber-300" />
                  Virtual Host
                </h1>
                <p className="text-sm text-[#d4c4b0]">Order for your team at multiple locations</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 40" className="w-full h-6 fill-stone-100 dark:fill-background" preserveAspectRatio="none">
            <path d="M0,40 L0,20 Q150,0 300,15 T600,10 T900,20 T1200,10 L1200,40 Z" />
          </svg>
        </div>
      </div>

      <main className="container max-w-4xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="create" className="gap-2">
              <Plus className="h-4 w-4" />
              New Meeting
            </TabsTrigger>
            <TabsTrigger value="manage" className="gap-2">
              <Calendar className="h-4 w-4" />
              My Meetings
            </TabsTrigger>
          </TabsList>

          {/* Create New Meeting Tab */}
          <TabsContent value="create">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-stone-200 dark:border-stone-800 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                          1
                        </div>
                        <div>
                          <CardTitle>Meeting Details</CardTitle>
                          <CardDescription>Set up your virtual meeting or event</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Meeting Title */}
                      <div className="space-y-2">
                        <Label htmlFor="title">Meeting Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Monday Morning Standup, Team Kickoff"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          data-testid="input-meeting-title"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (optional)</Label>
                        <Textarea
                          id="description"
                          placeholder="Brief description for your attendees"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={2}
                        />
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                          <Label htmlFor="date">Delivery Date *</Label>
                          <Input
                            id="date"
                            type="date"
                            value={formData.meetingDate}
                            onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            data-testid="input-meeting-date"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Delivery Time *</Label>
                          <Input
                            id="time"
                            type="time"
                            value={formData.meetingTime}
                            onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                            data-testid="input-meeting-time"
                          />
                        </div>
                      </div>

                      {/* Delivery Scope */}
                      <div className="space-y-3">
                        <Label>Delivery Area</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, deliveryScope: 'local' })}
                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                              formData.deliveryScope === 'local'
                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                : 'border-stone-200 dark:border-stone-700 hover:border-amber-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Building2 className={`h-5 w-5 ${formData.deliveryScope === 'local' ? 'text-amber-600' : 'text-stone-400'}`} />
                              <div>
                                <p className="font-medium">Nashville Metro</p>
                                <p className="text-xs text-muted-foreground">Local delivery available now</p>
                              </div>
                            </div>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, deliveryScope: 'nationwide' })}
                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative ${
                              formData.deliveryScope === 'nationwide'
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-stone-200 dark:border-stone-700 hover:border-blue-300'
                            }`}
                          >
                            <Badge className="absolute -top-2 right-2 text-[9px] bg-blue-500 border-none">Coming Soon</Badge>
                            <div className="flex items-center gap-3">
                              <Globe2 className={`h-5 w-5 ${formData.deliveryScope === 'nationwide' ? 'text-blue-600' : 'text-stone-400'}`} />
                              <div>
                                <p className="font-medium">Nationwide</p>
                                <p className="text-xs text-muted-foreground">DoorDash / Uber Eats</p>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                        
                        {/* Multi-site/Multi-city Auto-Gratuity Notice */}
                        <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                          <p className="text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                            <DollarSign className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            <span>
                              <strong>Coordinated Order Gratuity:</strong> Orders delivering to multiple sites or cities automatically include a minimum 18% gratuity for our concierge team.
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="space-y-3">
                        <Label>Budget Per Person</Label>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-muted-foreground" />
                          <Input
                            type="number"
                            min={5}
                            max={100}
                            value={(formData.perPersonBudgetCents / 100).toFixed(2)}
                            onChange={(e) => setFormData({ ...formData, perPersonBudgetCents: Math.round(parseFloat(e.target.value || '15') * 100) })}
                            className="w-32"
                            data-testid="input-budget"
                          />
                          <span className="text-sm text-muted-foreground">per person</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Attendees will be notified of their budget when selecting items</p>
                      </div>

                      {/* Host Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                        <div className="space-y-2">
                          <Label htmlFor="hostName">Your Name</Label>
                          <Input
                            id="hostName"
                            placeholder="Your name"
                            value={formData.hostName}
                            onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hostCompany">Company</Label>
                          <Input
                            id="hostCompany"
                            placeholder="Optional"
                            value={formData.hostCompany}
                            onChange={(e) => setFormData({ ...formData, hostCompany: e.target.value })}
                          />
                        </div>
                      </div>

                      <Button 
                        onClick={handleCreateMeeting}
                        disabled={createMeetingMutation.isPending}
                        className="w-full text-white font-semibold shine-effect"
                        style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                        data-testid="button-create-meeting"
                      >
                        {createMeetingMutation.isPending ? (
                          <>Creating...</>
                        ) : (
                          <>
                            Continue to Attendees
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 2 && selectedMeeting && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="border-stone-200 dark:border-stone-800 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                            2
                          </div>
                          <div>
                            <CardTitle>Add Attendees</CardTitle>
                            <CardDescription>Who should receive deliveries?</CardDescription>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                          <ArrowLeft className="h-4 w-4 mr-1" />
                          Back
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Meeting Summary */}
                      <div className="bg-stone-50 dark:bg-stone-900/50 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium">{selectedMeeting.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedMeeting.meetingDate} at {selectedMeeting.meetingTime} • ${(selectedMeeting.perPersonBudgetCents || 1500) / 100} per person
                        </p>
                      </div>

                      {/* Attendee List */}
                      <div className="space-y-3">
                        {attendees.map((attendee, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border border-stone-200 dark:border-stone-700 rounded-lg p-4"
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <span className="text-xs font-medium text-muted-foreground">Attendee {index + 1}</span>
                              {attendees.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttendeeRow(index)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="col-span-2 sm:col-span-1">
                                <Input
                                  placeholder="Name *"
                                  value={attendee.name}
                                  onChange={(e) => updateAttendee(index, 'name', e.target.value)}
                                  data-testid={`input-attendee-name-${index}`}
                                />
                              </div>
                              <div className="col-span-2 sm:col-span-1">
                                <Input
                                  placeholder="Email (optional)"
                                  type="email"
                                  value={attendee.email}
                                  onChange={(e) => updateAttendee(index, 'email', e.target.value)}
                                />
                              </div>
                              <div className="col-span-2">
                                <Input
                                  placeholder="Location label (e.g., Downtown Office, Remote - NYC)"
                                  value={attendee.locationLabel}
                                  onChange={(e) => updateAttendee(index, 'locationLabel', e.target.value)}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={addAttendeeRow}
                        className="w-full gap-2"
                        data-testid="button-add-attendee"
                      >
                        <Plus className="h-4 w-4" />
                        Add Another Attendee
                      </Button>

                      <Button 
                        onClick={handleAddAttendees}
                        disabled={addAttendeesMutation.isPending}
                        className="w-full text-white font-semibold shine-effect mt-4"
                        style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                        data-testid="button-send-invites"
                      >
                        {addAttendeesMutation.isPending ? (
                          <>Sending Invites...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Invites & Get Links
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Manage Meetings Tab */}
          <TabsContent value="manage">
            <div className="space-y-4">
              {loadingMeetings ? (
                <div className="text-center py-12 text-muted-foreground">Loading meetings...</div>
              ) : meetings && meetings.length > 0 ? (
                meetings.map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <Card className="border-stone-200 dark:border-stone-800 hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{meeting.title}</h3>
                              <Badge className={getStatusColor(meeting.status)}>
                                {getStatusLabel(meeting.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5" />
                              {meeting.meetingDate} at {meeting.meetingTime}
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              ${((meeting.perPersonBudgetCents || 1500) / 100).toFixed(2)} per person
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <UserCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-4">No virtual meetings yet</p>
                  <Button
                    onClick={() => setActiveTab("create")}
                    className="shine-effect"
                    style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Meeting
                  </Button>
                </div>
              )}

              {/* Meeting Detail Panel */}
              {selectedMeeting && activeTab === "manage" && (
                <Dialog open={!!selectedMeeting && activeTab === "manage"} onOpenChange={() => setSelectedMeeting(null)}>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {selectedMeeting.title}
                        <Badge className={getStatusColor(selectedMeeting.status)}>
                          {getStatusLabel(selectedMeeting.status)}
                        </Badge>
                      </DialogTitle>
                      <DialogDescription>
                        {selectedMeeting.meetingDate} at {selectedMeeting.meetingTime}
                      </DialogDescription>
                    </DialogHeader>

                    {loadingDetails ? (
                      <div className="py-8 text-center text-muted-foreground">Loading details...</div>
                    ) : meetingDetails ? (
                      <div className="space-y-4">
                        {/* Attendees List */}
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Attendees ({meetingDetails.attendees?.length || 0})
                          </h4>
                          {meetingDetails.attendees && meetingDetails.attendees.length > 0 ? (
                            <div className="space-y-2">
                              {meetingDetails.attendees.map((attendee: any) => (
                                <div key={attendee.id} className="border rounded-lg p-3 flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{attendee.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {attendee.locationLabel || 'No location'} • {attendee.inviteStatus}
                                    </p>
                                    {attendee.selection && (
                                      <p className="text-xs text-emerald-600 mt-1">
                                        Selected: ${(attendee.selection.subtotalCents / 100).toFixed(2)}
                                        {attendee.selection.budgetStatus === 'over' && (
                                          <span className="text-amber-600"> (over budget)</span>
                                        )}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyInviteLink(attendee.attendeeToken, attendee.name)}
                                    className="gap-1"
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                    Copy Link
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No attendees added yet</p>
                          )}
                        </div>

                        {/* Activity Log */}
                        {meetingDetails.events && meetingDetails.events.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Activity
                            </h4>
                            <div className="space-y-1">
                              {meetingDetails.events.slice(0, 5).map((event: any) => (
                                <p key={event.id} className="text-xs text-muted-foreground">
                                  {event.message}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Invite Success Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Invites Created!
            </DialogTitle>
            <DialogDescription>
              Share these links with your attendees so they can select their items.
            </DialogDescription>
          </DialogHeader>

          {selectedMeeting && (
            <div className="space-y-3 py-2">
              {attendees.filter(a => a.name.trim()).map((attendee, index) => (
                <div key={index} className="flex items-center justify-between border rounded-lg p-3">
                  <div>
                    <p className="font-medium text-sm">{attendee.name}</p>
                    <p className="text-xs text-muted-foreground">{attendee.locationLabel || attendee.email || 'No location'}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const token = `demo-token-${index}`;
                      copyInviteLink(token, attendee.name);
                    }}
                    className="gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </Button>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button 
              onClick={() => {
                setShowInviteModal(false);
                setActiveTab("manage");
                setStep(1);
                setAttendees([{ name: "", email: "", phone: "", locationLabel: "", addressLine1: "", city: "", state: "", zipCode: "" }]);
              }}
              className="w-full"
            >
              Done - View Meetings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
