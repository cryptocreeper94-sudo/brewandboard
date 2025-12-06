import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Book, 
  Plus, 
  Save, 
  Trash2, 
  Paintbrush, 
  Wrench, 
  HardHat, 
  Building2,
  Briefcase,
  PenTool,
  FileText,
  Mic,
  MicOff,
  Sparkles,
  Search,
  ChevronLeft,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { WebSearch } from "@/components/WebSearch";

type TemplateType = "general" | "painter" | "construction" | "real_estate" | "plumbing";

interface TemplateField {
  id: string;
  label: string;
  type: string;
}

interface Template {
  name: string;
  icon: React.ReactNode;
  fields: TemplateField[];
}

interface Note {
  id: string;
  userId: string;
  title: string;
  templateType: TemplateType;
  structuredData: Record<string, string> | null;
  freeformNotes: string | null;
  isPinned: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

// Templates for different industries
const TEMPLATES: Record<TemplateType, Template> = {
  general: {
    name: "General Meeting",
    icon: <Briefcase className="h-4 w-4" />,
    fields: [
      { id: "agenda", label: "Meeting Agenda", type: "textarea" },
      { id: "action_items", label: "Action Items", type: "textarea" },
      { id: "attendees", label: "Attendees", type: "text" }
    ]
  },
  painter: {
    name: "Painting Contractor",
    icon: <Paintbrush className="h-4 w-4" />,
    fields: [
      { id: "job_number", label: "Job Number", type: "text" },
      { id: "crew_leader", label: "Crew Leader Information", type: "text" },
      { id: "paint_colors", label: "Paint Colors / Codes", type: "textarea" },
      { id: "surface_prep", label: "Surface Prep Notes", type: "textarea" }
    ]
  },
  construction: {
    name: "Construction / GC",
    icon: <HardHat className="h-4 w-4" />,
    fields: [
      { id: "project_id", label: "Project ID", type: "text" },
      { id: "site_supervisor", label: "Site Supervisor", type: "text" },
      { id: "safety_check", label: "Safety Compliance Check", type: "textarea" },
      { id: "materials_needed", label: "Materials Request", type: "textarea" }
    ]
  },
  real_estate: {
    name: "Real Estate",
    icon: <Building2 className="h-4 w-4" />,
    fields: [
      { id: "property_address", label: "Property Address", type: "text" },
      { id: "client_budget", label: "Client Budget", type: "text" },
      { id: "must_haves", label: "Must Haves", type: "textarea" },
      { id: "viewing_notes", label: "Viewing Feedback", type: "textarea" }
    ]
  },
  plumbing: {
    name: "Plumbing Service",
    icon: <Wrench className="h-4 w-4" />,
    fields: [
      { id: "ticket_number", label: "Service Ticket #", type: "text" },
      { id: "issue_desc", label: "Issue Description", type: "textarea" },
      { id: "parts_used", label: "Parts Used", type: "textarea" },
      { id: "recommendations", label: "Recommendations", type: "textarea" }
    ]
  }
};

export default function PortfolioPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("general");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTranscript, setRecordingTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  
  // Demo mode state
  const [demoNotes, setDemoNotes] = useState<Note[]>([]);

  // Get current user ID from localStorage
  const userStr = localStorage.getItem("coffee_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  const isDemoMode = localStorage.getItem("coffee_demo_mode") === "true";
  
  // Load demo notes from localStorage on mount
  useEffect(() => {
    if (isDemoMode) {
      const savedDemoNotes = localStorage.getItem("coffee_demo_notes");
      if (savedDemoNotes) {
        setDemoNotes(JSON.parse(savedDemoNotes));
      }
    }
  }, [isDemoMode]);
  
  // Save demo notes to localStorage whenever they change
  useEffect(() => {
    if (isDemoMode) {
      if (demoNotes.length > 0) {
        localStorage.setItem("coffee_demo_notes", JSON.stringify(demoNotes));
      } else {
        localStorage.removeItem("coffee_demo_notes");
      }
    }
  }, [demoNotes, isDemoMode]);
  
  // Exit demo mode
  const exitDemoMode = () => {
    localStorage.removeItem("coffee_demo_mode");
    localStorage.removeItem("coffee_demo_notes");
    localStorage.removeItem("coffee_user");
    window.location.href = "/";
  };
  
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  const startVoiceNote = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Not Supported",
        description: "Voice recording is not supported in your browser. Try Chrome or Edge.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    
    transcriptRef.current = "";
    setRecordingTranscript("");

    recognition.onstart = () => {
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak now... Click stop when done.",
      });
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      transcriptRef.current = finalTranscript;
      setRecordingTranscript(finalTranscript + interimTranscript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
      
      const finalText = transcriptRef.current.trim();
      if (finalText) {
        createVoiceNote(finalText);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      recognitionRef.current = null;
      
      if (event.error !== "aborted") {
        toast({
          title: "Recording Error",
          description: "Could not capture your voice. Please try again.",
          variant: "destructive"
        });
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };
  
  const stopVoiceNote = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  
  const createVoiceNote = (text: string) => {
    const now = new Date();
    const timestamp = now.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
    
    createNoteMutation.mutate({
      userId,
      title: `Voice Note - ${timestamp}`,
      templateType: "general",
      structuredData: {},
      freeformNotes: text,
      isPinned: false,
      color: "default"
    });
    
    toast({
      title: "Voice Note Saved!",
      description: "Your spoken note has been captured.",
    });
  };

  // Fetch notes (API or demo mode)
  const { data: apiNotes = [] } = useQuery<Note[]>({
    queryKey: ["notes", userId],
    queryFn: async () => {
      if (!userId || isDemoMode) return [];
      const res = await fetch(`/api/notes?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch notes");
      return res.json();
    },
    enabled: !!userId && !isDemoMode
  });
  
  // Use demo notes or API notes
  const notes = isDemoMode ? demoNotes : apiNotes;

  // Demo mode CRUD helpers
  const createDemoNote = (note: Partial<Note>) => {
    const newNote: Note = {
      id: `demo-${Date.now()}`,
      userId: userId || "demo-user",
      title: note.title || "New Note",
      templateType: note.templateType || "general",
      structuredData: note.structuredData || null,
      freeformNotes: note.freeformNotes || null,
      isPinned: note.isPinned || false,
      color: note.color || "default",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setDemoNotes(prev => [newNote, ...prev]);
    setActiveNote(newNote);
    setIsDialogOpen(false);
    toast({ title: "Success", description: "Note created! (Demo Mode - not saved to server)" });
    return newNote;
  };
  
  const updateDemoNote = (id: string, data: Partial<Note>) => {
    setDemoNotes(prev => prev.map(n => 
      n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n
    ));
    setActiveNote(prev => prev?.id === id ? { ...prev, ...data } as Note : prev);
    toast({ title: "Saved", description: "Note updated! (Demo Mode)" });
  };
  
  const deleteDemoNote = (id: string) => {
    setDemoNotes(prev => prev.filter(n => n.id !== id));
    setActiveNote(null);
    toast({ title: "Deleted", description: "Note deleted! (Demo Mode)" });
  };

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (note: Partial<Note>) => {
      if (isDemoMode) {
        return createDemoNote(note);
      }
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note)
      });
      if (!res.ok) throw new Error("Failed to create note");
      return res.json();
    },
    onSuccess: (newNote) => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ["notes", userId] });
        setActiveNote(newNote);
        setIsDialogOpen(false);
        toast({ title: "Success", description: "Note created successfully!" });
      }
    }
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Note> }) => {
      if (isDemoMode) {
        updateDemoNote(id, data);
        return data;
      }
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update note");
      return res.json();
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ["notes", userId] });
        toast({ title: "Saved", description: "Note updated successfully!" });
      }
    }
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isDemoMode) {
        deleteDemoNote(id);
        return {};
      }
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete note");
      return res.json();
    },
    onSuccess: () => {
      if (!isDemoMode) {
        queryClient.invalidateQueries({ queryKey: ["notes", userId] });
        setActiveNote(null);
        toast({ title: "Deleted", description: "Note deleted successfully!" });
      }
    }
  });

  const handleNewNote = () => {
    createNoteMutation.mutate({
      userId,
      title: "New Note",
      templateType: selectedTemplate,
      structuredData: {},
      freeformNotes: "",
      isPinned: false,
      color: "default"
    });
  };

  const handleSave = () => {
    if (!activeNote) return;
    updateNoteMutation.mutate({
      id: activeNote.id,
      data: {
        title: activeNote.title,
        structuredData: activeNote.structuredData,
        freeformNotes: activeNote.freeformNotes
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteNoteMutation.mutate(id);
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Book className="h-16 w-16 mx-auto mb-4 text-amber-600" />
          <h2 className="text-2xl font-serif mb-2">Create an Account for Portfolio</h2>
          <p className="text-muted-foreground mb-6">
            To save meeting notes and access your portfolio, please create a free account with a 4-digit PIN.
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
          <p className="text-sm text-muted-foreground mt-4">
            Or <button onClick={() => window.location.href = "/portfolio?demo=true"} className="text-amber-600 hover:underline">try the demo</button> to explore without an account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 p-4 md:p-8 overflow-x-hidden">
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-3 flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium min-w-0">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="truncate">Demo Mode - Notes saved locally only</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={exitDemoMode}
            className="text-white hover:bg-white/20 text-xs shrink-0"
            data-testid="button-exit-demo"
          >
            Exit
          </Button>
        </div>
      )}
      
      <div className={`max-w-6xl mx-auto overflow-x-hidden ${isDemoMode ? 'pt-12' : ''}`}>
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={isDemoMode ? "/" : "/dashboard"}>
              <Button variant="ghost" size="icon" className="hover-3d shrink-0" data-testid="button-back">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2">
                <Book className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
                <span className="truncate">Portfolio & CRM</span>
              </h1>
              <p className="text-muted-foreground text-sm">Notes, job details, and industry templates</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <motion.div
              animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Button
                onClick={isRecording ? stopVoiceNote : startVoiceNote}
                variant={isRecording ? "destructive" : "outline"}
                size="sm"
                className={`gap-1.5 ${isRecording ? "animate-pulse" : "hover-3d"}`}
                data-testid="button-voice-note"
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    <span className="hidden sm:inline">Record</span>
                  </>
                )}
              </Button>
            </motion.div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5" data-testid="button-new-entry">
                  <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Entry</span><span className="sm:hidden">New</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Choose a Template</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(TEMPLATES).map(([key, template]) => (
                      <Button
                        key={key}
                        variant={selectedTemplate === key ? "default" : "outline"}
                        className="justify-start h-auto py-3 px-4"
                        onClick={() => setSelectedTemplate(key as TemplateType)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${selectedTemplate === key ? 'bg-white/20' : 'bg-muted'}`}>
                            {template.icon}
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">{template.name}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                  <Button onClick={handleNewNote} className="w-full mt-2" disabled={createNoteMutation.isPending}>
                    {createNoteMutation.isPending ? "Creating..." : "Create Note"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Quick Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="font-medium">Quick Search</span>
            <span className="text-muted-foreground/60">• Search the web while working</span>
          </div>
          <WebSearch />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
          
          {/* Sidebar List */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-4">
             <div className="relative">
               <Input placeholder="Search notes..." className="pl-9" />
               <Book className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             </div>
             
             <ScrollArea className="flex-1 pr-4">
               <div className="space-y-3">
                 {notes.map((note) => (
                   <motion.div
                     key={note.id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     onClick={() => setActiveNote(note)}
                     className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                       activeNote?.id === note.id 
                         ? 'bg-primary/5 border-primary/20 shadow-sm' 
                         : 'bg-card border-border/50 hover:border-primary/20'
                     }`}
                   >
                     <div className="flex justify-between items-start mb-1">
                       <h3 className="font-semibold truncate pr-2">{note.title}</h3>
                       <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-background/50">
                         {TEMPLATES[note.templateType]?.name.split(' ')[0]}
                       </Badge>
                     </div>
                     <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                       {note.freeformNotes || "No content yet..."}
                     </p>
                     <div className="text-[10px] text-muted-foreground/60 flex justify-between items-center">
                       <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 -mr-2 hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                     </div>
                   </motion.div>
                 ))}
               </div>
             </ScrollArea>
          </div>

          {/* Main Editor Area */}
          <div className="md:col-span-8 lg:col-span-9 bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {activeNote ? (
              <>
                <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
                  <div className="flex-1 mr-4">
                    <Input 
                      value={activeNote.title} 
                      onChange={(e) => setActiveNote({ ...activeNote, title: e.target.value })}
                      className="text-2xl font-serif font-bold bg-transparent border-none shadow-none px-0 focus-visible:ring-0 h-auto placeholder:text-muted-foreground/50"
                      placeholder="Note Title..."
                    />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        {TEMPLATES[activeNote.templateType]?.icon}
                        {TEMPLATES[activeNote.templateType]?.name} Template
                      </span>
                      <span>•</span>
                      <span>{new Date(activeNote.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button onClick={handleSave} size="sm" className="gap-2" disabled={updateNoteMutation.isPending}>
                    <Save className="h-4 w-4" /> {updateNoteMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-6">
                  <div className="max-w-3xl mx-auto space-y-8">
                    {/* Dynamic Template Fields */}
                    <div className="grid grid-cols-1 gap-6 p-6 bg-muted/20 rounded-xl border border-border/50">
                      <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-primary">
                        <FileText className="h-4 w-4" />
                        Structured Data
                      </div>
                      
                      {TEMPLATES[activeNote.templateType]?.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            {field.label}
                          </label>
                          {field.type === 'textarea' ? (
                            <Textarea 
                              className="bg-background resize-none" 
                              rows={3}
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                              value={(activeNote.structuredData && activeNote.structuredData[field.id]) || ''}
                              onChange={(e) => setActiveNote({
                                ...activeNote,
                                structuredData: { ...(activeNote.structuredData || {}), [field.id]: e.target.value }
                              })}
                            />
                          ) : (
                            <Input 
                              className="bg-background"
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                              value={(activeNote.structuredData && activeNote.structuredData[field.id]) || ''}
                              onChange={(e) => setActiveNote({
                                ...activeNote,
                                structuredData: { ...(activeNote.structuredData || {}), [field.id]: e.target.value }
                              })}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Freeform Notes */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <PenTool className="h-4 w-4" />
                        Additional Notes
                      </div>
                      <Textarea 
                        className="min-h-[300px] p-4 text-lg leading-relaxed bg-transparent border-none resize-none focus-visible:ring-0 shadow-none" 
                        placeholder="Start typing your freeform notes here..."
                        value={activeNote.freeformNotes || ""}
                        onChange={(e) => setActiveNote({ ...activeNote, freeformNotes: e.target.value })}
                      />
                    </div>
                  </div>
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                <div className="h-24 w-24 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                  <Book className="h-10 w-10 opacity-50" />
                </div>
                <h3 className="text-xl font-serif font-medium mb-2">Select a Note or Create New</h3>
                <p className="max-w-md text-sm opacity-70">
                  Choose a note from the sidebar to view details, or create a new entry using one of our industry-specific templates.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
