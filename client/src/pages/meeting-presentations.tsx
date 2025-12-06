import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Users, 
  Send, 
  Eye, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  Presentation,
  Check,
  Mail,
  Calendar,
  Clock,
  Sparkles,
  LayoutGrid,
  X,
  Upload,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MeetingPresentation {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  templateType: string;
  documentIds: string[] | null;
  attendeeEmails: string[] | null;
  attendeeNames: string[] | null;
  meetingDate: string | null;
  meetingTime: string | null;
  shareableLink: string | null;
  status: string;
  sentAt: string | null;
  viewCount: number;
  createdAt: string;
}

interface ScannedDocument {
  id: string;
  title: string;
  category: string | null;
  extractedText: string | null;
  imageData: string | null;
  createdAt: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
}

const TEMPLATE_STYLES = {
  executive: {
    gradient: "from-slate-900 via-slate-800 to-slate-700",
    accent: "text-blue-400",
    badge: "bg-blue-900/50 text-blue-300",
  },
  board: {
    gradient: "from-[#1a0f09] via-[#2d1810] to-[#3d2418]",
    accent: "text-amber-400",
    badge: "bg-amber-900/50 text-amber-300",
  },
  huddle: {
    gradient: "from-emerald-900 via-emerald-800 to-emerald-700",
    accent: "text-emerald-400",
    badge: "bg-emerald-900/50 text-emerald-300",
  },
};

export default function MeetingPresentationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isCreating, setIsCreating] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendees, setAttendees] = useState<{ email: string; name: string }[]>([]);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    templateType: "executive",
    meetingDate: "",
    meetingTime: "",
  });
  
  const userStr = localStorage.getItem("coffee_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  
  const { data: presentations = [] } = useQuery<MeetingPresentation[]>({
    queryKey: ["meeting-presentations", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/meeting-presentations?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch presentations");
      return res.json();
    },
    enabled: !!userId
  });
  
  const { data: templates = [] } = useQuery<Template[]>({
    queryKey: ["presentation-templates"],
    queryFn: async () => {
      const res = await fetch("/api/meeting-presentations/templates");
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    }
  });
  
  const { data: documents = [] } = useQuery<ScannedDocument[]>({
    queryKey: ["documents", userId],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`/api/scanned-documents?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
    enabled: !!userId
  });
  
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/meeting-presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create presentation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-presentations"] });
      toast({ title: "Created!", description: "Your presentation is ready." });
      resetWizard();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/meeting-presentations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-presentations"] });
      toast({ title: "Deleted", description: "Presentation removed." });
    },
  });
  
  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/meeting-presentations/${id}/send`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meeting-presentations"] });
      toast({ title: "Sent!", description: "Presentation emailed to attendees." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const resetWizard = () => {
    setIsCreating(false);
    setWizardStep(1);
    setSelectedDocs([]);
    setAttendees([]);
    setAttendeeInput("");
    setForm({
      title: "",
      description: "",
      templateType: "executive",
      meetingDate: "",
      meetingTime: "",
    });
  };
  
  const addAttendee = () => {
    const parts = attendeeInput.split(",").map(s => s.trim());
    const email = parts[0];
    const name = parts[1] || email.split("@")[0];
    
    if (!email || !email.includes("@")) {
      toast({ title: "Invalid", description: "Please enter a valid email", variant: "destructive" });
      return;
    }
    
    if (attendees.some(a => a.email === email)) {
      toast({ title: "Duplicate", description: "This email is already added", variant: "destructive" });
      return;
    }
    
    setAttendees([...attendees, { email, name }]);
    setAttendeeInput("");
  };
  
  const removeAttendee = (email: string) => {
    setAttendees(attendees.filter(a => a.email !== email));
  };
  
  const toggleDocument = (id: string) => {
    setSelectedDocs(prev => 
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };
  
  const handleCreate = () => {
    if (!form.title.trim()) {
      toast({ title: "Required", description: "Please enter a title", variant: "destructive" });
      return;
    }
    
    createMutation.mutate({
      userId,
      title: form.title,
      description: form.description || null,
      templateType: form.templateType,
      documentIds: selectedDocs.length > 0 ? selectedDocs : null,
      attendeeEmails: attendees.length > 0 ? attendees.map(a => a.email) : null,
      attendeeNames: attendees.length > 0 ? attendees.map(a => a.name) : null,
      meetingDate: form.meetingDate || null,
      meetingTime: form.meetingTime || null,
    });
  };
  
  const getTemplateStyle = (type: string) => {
    return TEMPLATE_STYLES[type as keyof typeof TEMPLATE_STYLES] || TEMPLATE_STYLES.executive;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0705] via-[#1a0f09] to-[#2d1810]">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/portfolio">
              <Button variant="ghost" size="icon" className="text-amber-200 hover:text-amber-100" data-testid="button-back">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl text-amber-100 flex items-center gap-3">
                <Presentation className="h-7 w-7 text-amber-500" />
                Meeting Presentations
              </h1>
              <p className="text-amber-200/60 text-sm">Create & share professional meeting materials</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shine-effect"
            data-testid="button-new-presentation"
          >
            <Plus className="h-4 w-4 mr-2" /> New Presentation
          </Button>
        </div>
        
        {presentations.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-600/20 to-amber-800/20 flex items-center justify-center">
              <Presentation className="h-10 w-10 text-amber-500" />
            </div>
            <h2 className="font-serif text-xl text-amber-100 mb-2">No Presentations Yet</h2>
            <p className="text-amber-200/60 mb-6 max-w-md mx-auto">
              Create your first meeting presentation to share professional materials with your team and clients.
            </p>
            <Button 
              onClick={() => setIsCreating(true)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="h-4 w-4 mr-2" /> Create Your First Presentation
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {presentations.map((pres, i) => {
                const style = getTemplateStyle(pres.templateType);
                return (
                  <motion.div
                    key={pres.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-gradient-to-br ${style.gradient} rounded-2xl p-5 border border-white/10`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg text-white truncate">{pres.title}</h3>
                        {pres.description && (
                          <p className="text-white/60 text-sm truncate">{pres.description}</p>
                        )}
                      </div>
                      <Badge className={style.badge}>
                        {templates.find(t => t.id === pres.templateType)?.name || pres.templateType}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-white/70 mb-4">
                      {pres.meetingDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(pres.meetingDate).toLocaleDateString()}</span>
                          {pres.meetingTime && <span>at {pres.meetingTime}</span>}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{pres.documentIds?.length || 0} documents</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{pres.attendeeEmails?.length || 0} attendees</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <span>{pres.viewCount} views</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                      {pres.status === "sent" ? (
                        <Badge variant="secondary" className="bg-green-900/50 text-green-300">
                          <Check className="h-3 w-3 mr-1" /> Sent
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          className="bg-white/10 hover:bg-white/20 text-white"
                          onClick={() => sendMutation.mutate(pres.id)}
                          disabled={sendMutation.isPending || !pres.attendeeEmails?.length}
                        >
                          <Send className="h-3 w-3 mr-1" /> Send
                        </Button>
                      )}
                      
                      <Link href={`/presentation/${pres.shareableLink}`}>
                        <Button size="sm" variant="ghost" className="text-white/70 hover:text-white">
                          <Eye className="h-3 w-3 mr-1" /> Preview
                        </Button>
                      </Link>
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-400/70 hover:text-red-400 ml-auto"
                        onClick={() => deleteMutation.mutate(pres.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      
      <Dialog open={isCreating} onOpenChange={(open) => !open && resetWizard()}>
        <DialogContent className="sm:max-w-[600px] bg-[#1a0f09] border-amber-900/50 text-amber-100 p-0 overflow-hidden">
          <div className="p-4 border-b border-amber-900/30 bg-gradient-to-r from-amber-900/20 to-transparent">
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Create Presentation
            </DialogTitle>
            <div className="flex items-center gap-2 mt-3">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      wizardStep >= step 
                        ? "bg-amber-600 text-white" 
                        : "bg-amber-900/30 text-amber-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-8 h-0.5 ${wizardStep > step ? "bg-amber-600" : "bg-amber-900/30"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-6">
            {wizardStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-amber-100">Choose a Template</h3>
                <p className="text-amber-200/60 text-sm">Select the style that fits your meeting</p>
                
                <div className="grid gap-3">
                  {templates.map((template) => {
                    const style = getTemplateStyle(template.id);
                    return (
                      <div
                        key={template.id}
                        onClick={() => setForm({ ...form, templateType: template.id })}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          form.templateType === template.id
                            ? "border-amber-500 bg-amber-900/20"
                            : "border-amber-900/30 hover:border-amber-700/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                            <LayoutGrid className={`h-6 w-6 ${style.accent}`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-amber-100">{template.name}</h4>
                            <p className="text-amber-200/60 text-sm">{template.description}</p>
                          </div>
                          {form.templateType === template.id && (
                            <Check className="h-5 w-5 text-amber-500 ml-auto" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
            
            {wizardStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-amber-100">Presentation Details</h3>
                
                <div>
                  <label className="text-sm text-amber-200/80 mb-1 block">Title *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Q4 Strategy Review"
                    className="bg-[#0d0705] border-amber-900/50"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-amber-200/80 mb-1 block">Description</label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief overview of the presentation..."
                    className="bg-[#0d0705] border-amber-900/50 min-h-[80px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-amber-200/80 mb-1 block">Meeting Date</label>
                    <Input
                      type="date"
                      value={form.meetingDate}
                      onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
                      className="bg-[#0d0705] border-amber-900/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-amber-200/80 mb-1 block">Meeting Time</label>
                    <Input
                      type="time"
                      value={form.meetingTime}
                      onChange={(e) => setForm({ ...form, meetingTime: e.target.value })}
                      className="bg-[#0d0705] border-amber-900/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {wizardStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-amber-100">Select Documents</h3>
                <p className="text-amber-200/60 text-sm">Choose documents to include in your presentation</p>
                
                {documents.length === 0 ? (
                  <div className="text-center py-8 bg-[#0d0705]/50 rounded-xl">
                    <FileText className="h-10 w-10 mx-auto mb-3 text-amber-600/50" />
                    <p className="text-amber-200/60">No documents scanned yet</p>
                    <Link href="/scan">
                      <Button variant="link" className="text-amber-500 mt-2">
                        <Upload className="h-4 w-4 mr-2" /> Scan Documents
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <ScrollArea className="h-[250px]">
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          onClick={() => toggleDocument(doc.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedDocs.includes(doc.id)
                              ? "border-amber-500 bg-amber-900/20"
                              : "border-amber-900/30 hover:border-amber-700/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-[#0d0705] flex items-center justify-center">
                              <FileText className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-amber-100 truncate">{doc.title}</p>
                              <p className="text-amber-600/60 text-xs">
                                {new Date(doc.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {selectedDocs.includes(doc.id) && (
                              <Check className="h-5 w-5 text-amber-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
                
                <p className="text-amber-200/60 text-sm text-center">
                  {selectedDocs.length} document{selectedDocs.length !== 1 ? "s" : ""} selected
                </p>
              </motion.div>
            )}
            
            {wizardStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-medium text-amber-100">Add Attendees</h3>
                <p className="text-amber-200/60 text-sm">Enter email addresses to share the presentation</p>
                
                <div className="flex gap-2">
                  <Input
                    value={attendeeInput}
                    onChange={(e) => setAttendeeInput(e.target.value)}
                    placeholder="email@example.com, Name"
                    className="bg-[#0d0705] border-amber-900/50 flex-1"
                    onKeyDown={(e) => e.key === "Enter" && addAttendee()}
                  />
                  <Button onClick={addAttendee} className="bg-amber-600 hover:bg-amber-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {attendees.length > 0 && (
                  <div className="space-y-2">
                    {attendees.map((att) => (
                      <div key={att.email} className="flex items-center justify-between p-3 rounded-lg bg-[#0d0705]/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-900/50 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-amber-100 text-sm">{att.name}</p>
                            <p className="text-amber-600/60 text-xs">{att.email}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600/60 hover:text-red-400"
                          onClick={() => removeAttendee(att.email)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-amber-200/60 text-sm text-center">
                  You can add attendees later if needed
                </p>
              </motion.div>
            )}
          </div>
          
          <DialogFooter className="p-4 border-t border-amber-900/30 bg-[#0d0705]/50">
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : resetWizard()}
                className="text-amber-200"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {wizardStep === 1 ? "Cancel" : "Back"}
              </Button>
              
              {wizardStep < 4 ? (
                <Button
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                >
                  {createMutation.isPending ? "Creating..." : "Create Presentation"}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
