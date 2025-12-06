import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Briefcase,
  CreditCard,
  Users,
  FolderOpen,
  Mic,
  MicOff,
  Sparkles,
  ChevronLeft,
  Plus,
  Edit3,
  Trash2,
  Share2,
  Download,
  Phone,
  Mail,
  MapPin,
  Globe,
  Linkedin,
  Building2,
  Clock,
  FileText,
  Camera,
  QrCode,
  Send,
  UserPlus,
  Tag,
  Calendar,
  MessageSquare,
  ExternalLink,
  MoreHorizontal,
  Search,
  X,
  Check,
  Save,
  Eye,
  Calculator,
  Percent,
  Delete,
  Equal,
  Bookmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import QRCode from "react-qr-code";
import { jsPDF } from "jspdf";

interface BusinessCard {
  id: string;
  userId: string;
  fullName: string;
  jobTitle: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  linkedIn: string | null;
  twitter: string | null;
  tagline: string | null;
  logoUrl: string | null;
  avatarUrl: string | null;
  colorTheme: string;
  isDefault: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  address: string | null;
  website: string | null;
  linkedIn: string | null;
  twitter: string | null;
  tags: string[] | null;
  preferredContactChannel: string | null;
  notes: string | null;
  lastInteractionAt: string | null;
  createdAt: string;
}

interface Activity {
  id: string;
  userId: string;
  type: string;
  description: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
}

interface ScannedDocument {
  id: string;
  userId: string;
  title: string;
  extractedText: string | null;
  pdfUrl: string | null;
  createdAt: string;
}

const colorThemes: { id: string; name: string; gradient: string; text: string }[] = [
  { id: "coffee", name: "Coffee", gradient: "from-[#1a0f09] via-[#2d1810] to-[#3d2418]", text: "text-amber-100" },
  { id: "midnight", name: "Midnight", gradient: "from-slate-900 via-slate-800 to-slate-700", text: "text-slate-100" },
  { id: "forest", name: "Forest", gradient: "from-emerald-900 via-emerald-800 to-emerald-700", text: "text-emerald-100" },
  { id: "ocean", name: "Ocean", gradient: "from-blue-900 via-blue-800 to-blue-700", text: "text-blue-100" },
  { id: "berry", name: "Berry", gradient: "from-purple-900 via-purple-800 to-purple-700", text: "text-purple-100" },
];

export default function PortfolioPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTranscript, setRecordingTranscript] = useState("");
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  
  const [isCardEditorOpen, setIsCardEditorOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<Client | null>(null);
  
  const [cardForm, setCardForm] = useState<Partial<BusinessCard>>({
    fullName: "",
    jobTitle: "",
    company: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    linkedIn: "",
    tagline: "",
    colorTheme: "coffee",
  });
  
  const [contactForm, setContactForm] = useState<Partial<Client>>({
    name: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    notes: "",
    tags: [],
  });
  
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcPrevValue, setCalcPrevValue] = useState<number | null>(null);
  const [calcOperator, setCalcOperator] = useState<string | null>(null);
  const [calcWaitingForOperand, setCalcWaitingForOperand] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState<{ label: string; value: string; date: string }[]>([]);
  const [saveLabel, setSaveLabel] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem("coffee_saved_calculations");
    if (saved) {
      setSavedCalculations(JSON.parse(saved));
    }
  }, []);
  
  const saveCalculation = () => {
    if (!saveLabel.trim()) {
      toast({ title: "Required", description: "Please enter a label for this calculation.", variant: "destructive" });
      return;
    }
    const newCalc = {
      label: saveLabel.trim(),
      value: calcDisplay,
      date: new Date().toISOString()
    };
    const updated = [newCalc, ...savedCalculations].slice(0, 20);
    setSavedCalculations(updated);
    localStorage.setItem("coffee_saved_calculations", JSON.stringify(updated));
    setSaveLabel("");
    setShowSaveInput(false);
    toast({ title: "Saved!", description: `"${saveLabel}" saved to your calculations.` });
  };
  
  const deleteSavedCalc = (index: number) => {
    const updated = savedCalculations.filter((_, i) => i !== index);
    setSavedCalculations(updated);
    localStorage.setItem("coffee_saved_calculations", JSON.stringify(updated));
  };
  
  const calcInputDigit = (digit: string) => {
    if (calcWaitingForOperand) {
      setCalcDisplay(digit);
      setCalcWaitingForOperand(false);
    } else {
      setCalcDisplay(calcDisplay === "0" ? digit : calcDisplay + digit);
    }
  };
  
  const calcInputDecimal = () => {
    if (calcWaitingForOperand) {
      setCalcDisplay("0.");
      setCalcWaitingForOperand(false);
    } else if (!calcDisplay.includes(".")) {
      setCalcDisplay(calcDisplay + ".");
    }
  };
  
  const calcClear = () => {
    setCalcDisplay("0");
    setCalcPrevValue(null);
    setCalcOperator(null);
    setCalcWaitingForOperand(false);
  };
  
  const calcPerformOperation = (nextOperator: string) => {
    const inputValue = parseFloat(calcDisplay);
    
    if (calcPrevValue === null) {
      setCalcPrevValue(inputValue);
    } else if (calcOperator && !calcWaitingForOperand) {
      const currentValue = calcPrevValue;
      let newValue = currentValue;
      
      switch (calcOperator) {
        case "+": newValue = currentValue + inputValue; break;
        case "-": newValue = currentValue - inputValue; break;
        case "×": newValue = currentValue * inputValue; break;
        case "÷": newValue = inputValue !== 0 ? currentValue / inputValue : 0; break;
      }
      
      setCalcDisplay(String(newValue));
      setCalcPrevValue(newValue);
    }
    
    setCalcWaitingForOperand(true);
    setCalcOperator(nextOperator);
  };
  
  const calcEquals = () => {
    if (!calcOperator || calcPrevValue === null) return;
    
    const inputValue = parseFloat(calcDisplay);
    let newValue = calcPrevValue;
    
    switch (calcOperator) {
      case "+": newValue = calcPrevValue + inputValue; break;
      case "-": newValue = calcPrevValue - inputValue; break;
      case "×": newValue = calcPrevValue * inputValue; break;
      case "÷": newValue = inputValue !== 0 ? calcPrevValue / inputValue : 0; break;
    }
    
    setCalcDisplay(String(newValue));
    setCalcPrevValue(null);
    setCalcOperator(null);
    setCalcWaitingForOperand(true);
  };
  
  const calcPercent = () => {
    const value = parseFloat(calcDisplay);
    setCalcDisplay(String(value / 100));
  };
  
  const calcToggleSign = () => {
    const value = parseFloat(calcDisplay);
    setCalcDisplay(String(value * -1));
  };

  const userStr = localStorage.getItem("coffee_user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  const isDemoMode = localStorage.getItem("coffee_demo_mode") === "true";
  
  const exitDemoMode = () => {
    localStorage.removeItem("coffee_demo_mode");
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
  
  const { data: businessCard } = useQuery<BusinessCard | null>({
    queryKey: ["businessCard", userId],
    queryFn: async () => {
      if (!userId || isDemoMode) return null;
      const res = await fetch(`/api/business-cards/default?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch business card");
      return res.json();
    },
    enabled: !!userId && !isDemoMode
  });
  
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients", userId],
    queryFn: async () => {
      if (!userId || isDemoMode) return [];
      const res = await fetch(`/api/clients?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch clients");
      return res.json();
    },
    enabled: !!userId && !isDemoMode
  });
  
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["activities", userId],
    queryFn: async () => {
      if (!userId || isDemoMode) return [];
      const res = await fetch(`/api/activities?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch activities");
      return res.json();
    },
    enabled: !!userId && !isDemoMode
  });
  
  const { data: documents = [] } = useQuery<ScannedDocument[]>({
    queryKey: ["documents", userId],
    queryFn: async () => {
      if (!userId || isDemoMode) return [];
      const res = await fetch(`/api/scanned-documents?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
    enabled: !!userId && !isDemoMode
  });
  
  const createCardMutation = useMutation({
    mutationFn: async (data: Partial<BusinessCard>) => {
      const res = await fetch("/api/business-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId, isDefault: true })
      });
      if (!res.ok) throw new Error("Failed to create card");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessCard", userId] });
      setIsCardEditorOpen(false);
      toast({ title: "Success", description: "Business card created!" });
    }
  });
  
  const updateCardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BusinessCard> }) => {
      const res = await fetch(`/api/business-cards/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update card");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businessCard", userId] });
      setIsCardEditorOpen(false);
      toast({ title: "Success", description: "Business card updated!" });
    }
  });
  
  const createContactMutation = useMutation({
    mutationFn: async (data: Partial<Client>) => {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId })
      });
      if (!res.ok) throw new Error("Failed to create contact");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", userId] });
      setIsContactModalOpen(false);
      setContactForm({ name: "", email: "", phone: "", company: "", jobTitle: "", notes: "", tags: [] });
      toast({ title: "Success", description: "Contact added!" });
    }
  });
  
  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed to update contact");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", userId] });
      setIsContactModalOpen(false);
      setEditingContact(null);
      toast({ title: "Success", description: "Contact updated!" });
    }
  });
  
  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete contact");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", userId] });
      setSelectedContact(null);
      toast({ title: "Deleted", description: "Contact removed." });
    }
  });
  
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
      toast({ title: "Recording Started", description: "Speak now... Click stop when done." });
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
        toast({ title: "Voice Note Captured", description: finalText.slice(0, 100) + (finalText.length > 100 ? "..." : "") });
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      recognitionRef.current = null;
      
      if (event.error !== "aborted") {
        toast({ title: "Recording Error", description: "Could not capture your voice.", variant: "destructive" });
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
  
  const handleSaveCard = () => {
    if (!cardForm.fullName) {
      toast({ title: "Required", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    
    if (businessCard) {
      updateCardMutation.mutate({ id: businessCard.id, data: cardForm });
    } else {
      createCardMutation.mutate(cardForm);
    }
  };
  
  const handleSaveContact = () => {
    if (!contactForm.name) {
      toast({ title: "Required", description: "Please enter a name.", variant: "destructive" });
      return;
    }
    
    if (editingContact) {
      updateContactMutation.mutate({ id: editingContact.id, data: contactForm });
    } else {
      createContactMutation.mutate(contactForm);
    }
  };
  
  const openEditContact = (contact: Client) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      jobTitle: contact.jobTitle || "",
      notes: contact.notes || "",
      tags: contact.tags || [],
    });
    setIsContactModalOpen(true);
  };
  
  const openNewContact = () => {
    setEditingContact(null);
    setContactForm({ name: "", email: "", phone: "", company: "", jobTitle: "", notes: "", tags: [] });
    setIsContactModalOpen(true);
  };
  
  const openCardEditor = () => {
    if (businessCard) {
      setCardForm({
        fullName: businessCard.fullName,
        jobTitle: businessCard.jobTitle || "",
        company: businessCard.company || "",
        email: businessCard.email || "",
        phone: businessCard.phone || "",
        website: businessCard.website || "",
        address: businessCard.address || "",
        linkedIn: businessCard.linkedIn || "",
        tagline: businessCard.tagline || "",
        colorTheme: businessCard.colorTheme || "coffee",
      });
    }
    setIsCardEditorOpen(true);
  };
  
  const exportCardToPDF = async () => {
    if (!businessCard) return;
    
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [90, 55] });
    
    doc.setFillColor(26, 15, 9);
    doc.rect(0, 0, 90, 55, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(businessCard.fullName, 5, 12);
    
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 180, 150);
    
    let y = 18;
    if (businessCard.jobTitle) { doc.text(businessCard.jobTitle, 5, y); y += 4; }
    if (businessCard.company) { doc.text(businessCard.company, 5, y); y += 6; }
    if (businessCard.email) { doc.text(businessCard.email, 5, y); y += 4; }
    if (businessCard.phone) { doc.text(businessCard.phone, 5, y); y += 4; }
    if (businessCard.website) { doc.text(businessCard.website, 5, y); }
    
    doc.save(`${businessCard.fullName.replace(/\s+/g, "_")}_card.pdf`);
    toast({ title: "Downloaded", description: "Business card exported to PDF!" });
  };
  
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const currentTheme = colorThemes.find(t => t.id === (businessCard?.colorTheme || cardForm.colorTheme)) || colorThemes[0];
  
  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Briefcase className="h-16 w-16 mx-auto mb-4 text-amber-600" />
          <h2 className="text-2xl font-serif mb-2">Access Your Digital Briefcase</h2>
          <p className="text-muted-foreground mb-6">
            Sign in to manage your business card, contacts, documents, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => window.location.href = "/dashboard?action=register"}
              className="bg-amber-600 hover:bg-amber-700 text-white shine-effect"
              data-testid="button-register"
            >
              Create Account
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = "/dashboard?action=login"}
              data-testid="button-login"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0705] to-[#1a0f09] text-foreground pb-20 overflow-x-hidden">
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-3 flex items-center justify-between gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Demo Mode - Data is temporary</span>
          </div>
          <Button variant="ghost" size="sm" onClick={exitDemoMode} className="text-white hover:bg-white/20 text-xs" data-testid="button-exit-demo">
            Exit
          </Button>
        </div>
      )}
      
      <div className={`max-w-7xl mx-auto p-4 md:p-6 lg:p-8 ${isDemoMode ? 'pt-14' : ''}`}>
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-white/5" data-testid="button-back">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100 flex items-center gap-2">
                <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 text-amber-500" />
                Digital Briefcase
              </h1>
              <p className="text-amber-200/60 text-sm hidden sm:block">Your CRM, business card, and documents in one place</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 lg:col-span-1 lg:row-span-2"
          >
            <div className="h-full bg-gradient-to-br from-[#1a0f09]/80 to-[#2d1810]/60 border border-amber-900/30 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg text-amber-100 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-500" />
                  Business Card
                </h2>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-900/30" onClick={openCardEditor} data-testid="button-edit-card">
                    <Edit3 className="h-4 w-4 text-amber-400" />
                  </Button>
                  {businessCard && (
                    <>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-900/30" onClick={exportCardToPDF} data-testid="button-export-card">
                        <Download className="h-4 w-4 text-amber-400" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-amber-900/30" data-testid="button-share-card">
                            <Share2 className="h-4 w-4 text-amber-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/card/${businessCard.id}`);
                            toast({ title: "Copied!", description: "Card link copied to clipboard" });
                          }}>
                            <ExternalLink className="h-4 w-4 mr-2" /> Copy Link
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <QrCode className="h-4 w-4 mr-2" /> Show QR Code
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>
              
              {businessCard ? (
                <div className={`bg-gradient-to-br ${currentTheme.gradient} rounded-xl p-5 shadow-xl relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
                  
                  <div className="relative z-10">
                    <h3 className={`font-serif text-xl font-bold ${currentTheme.text} mb-1`}>{businessCard.fullName}</h3>
                    {businessCard.jobTitle && <p className={`text-sm ${currentTheme.text} opacity-80`}>{businessCard.jobTitle}</p>}
                    {businessCard.company && <p className={`text-sm ${currentTheme.text} opacity-60 mb-4`}>{businessCard.company}</p>}
                    
                    <div className="space-y-2 mt-4">
                      {businessCard.email && (
                        <div className={`flex items-center gap-2 text-xs ${currentTheme.text} opacity-80`}>
                          <Mail className="h-3.5 w-3.5" />
                          <span>{businessCard.email}</span>
                        </div>
                      )}
                      {businessCard.phone && (
                        <div className={`flex items-center gap-2 text-xs ${currentTheme.text} opacity-80`}>
                          <Phone className="h-3.5 w-3.5" />
                          <span>{businessCard.phone}</span>
                        </div>
                      )}
                      {businessCard.website && (
                        <div className={`flex items-center gap-2 text-xs ${currentTheme.text} opacity-80`}>
                          <Globe className="h-3.5 w-3.5" />
                          <span>{businessCard.website}</span>
                        </div>
                      )}
                    </div>
                    
                    {businessCard.tagline && (
                      <p className={`mt-4 text-xs italic ${currentTheme.text} opacity-60 border-t border-white/10 pt-3`}>
                        "{businessCard.tagline}"
                      </p>
                    )}
                  </div>
                  
                  {businessCard.viewCount > 0 && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs text-white/40">
                      <Eye className="h-3 w-3" />
                      {businessCard.viewCount}
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  onClick={openCardEditor}
                  className="bg-gradient-to-br from-[#2d1810]/50 to-[#3d2418]/30 rounded-xl p-8 border-2 border-dashed border-amber-900/40 cursor-pointer hover:border-amber-600/50 transition-colors flex flex-col items-center justify-center min-h-[200px]"
                  data-testid="button-create-card"
                >
                  <CreditCard className="h-12 w-12 text-amber-700/50 mb-3" />
                  <p className="text-amber-200/60 text-sm text-center">Create your digital business card</p>
                  <Button variant="ghost" size="sm" className="mt-3 text-amber-500 hover:text-amber-400">
                    <Plus className="h-4 w-4 mr-1" /> Design Card
                  </Button>
                </div>
              )}
              
              {businessCard && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="bg-white p-2 rounded-lg">
                    <QRCode value={`${window.location.origin}/card/${businessCard.id}`} size={80} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="h-full bg-gradient-to-br from-[#1a0f09]/80 to-[#2d1810]/60 border border-amber-900/30 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg text-amber-100 flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-500" />
                  Contacts
                  <Badge variant="secondary" className="ml-1 bg-amber-900/50 text-amber-200">{clients.length}</Badge>
                </h2>
                <Button size="sm" onClick={openNewContact} className="bg-amber-600 hover:bg-amber-700 text-white gap-1" data-testid="button-add-contact">
                  <UserPlus className="h-4 w-4" /> Add
                </Button>
              </div>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-600/50" />
                <Input 
                  placeholder="Search contacts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#0d0705]/50 border-amber-900/30 text-amber-100 placeholder:text-amber-700/50"
                  data-testid="input-search-contacts"
                />
              </div>
              
              <ScrollArea className="h-[180px]">
                {filteredClients.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-amber-600/50 py-8">
                    <Users className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">{searchQuery ? "No contacts found" : "No contacts yet"}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredClients.slice(0, 5).map((client) => (
                      <div 
                        key={client.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-[#0d0705]/40 hover:bg-[#0d0705]/60 transition-colors cursor-pointer group"
                        onClick={() => setSelectedContact(client)}
                        data-testid={`contact-row-${client.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-amber-100 font-medium text-sm shrink-0">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-amber-100 font-medium text-sm truncate">{client.name}</p>
                            <p className="text-amber-600/60 text-xs truncate">{client.company || client.email || "—"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEditContact(client); }}>
                            <Edit3 className="h-3.5 w-3.5 text-amber-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              
              {clients.length > 5 && (
                <Button variant="ghost" className="w-full mt-2 text-amber-500 hover:text-amber-400 text-xs" onClick={() => setLocation("/contacts")}>
                  View all {clients.length} contacts
                </Button>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-full bg-gradient-to-br from-[#1a0f09]/80 to-[#2d1810]/60 border border-amber-900/30 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg text-amber-100 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-500" />
                  Activity
                </h2>
              </div>
              
              <ScrollArea className="h-[200px]">
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-amber-600/50">
                    <Clock className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.slice(0, 10).map((activity) => (
                      <div key={activity.id} className="flex gap-3 text-sm">
                        <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <div>
                          <p className="text-amber-200/80">{activity.description}</p>
                          <p className="text-amber-600/50 text-xs">{new Date(activity.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="h-full bg-gradient-to-br from-[#1a0f09]/80 to-[#2d1810]/60 border border-amber-900/30 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg text-amber-100 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-amber-500" />
                  Filing Cabinet
                </h2>
                <Link href="/scan">
                  <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400 gap-1" data-testid="button-scan-document">
                    <Camera className="h-4 w-4" /> Scan
                  </Button>
                </Link>
              </div>
              
              <ScrollArea className="h-[200px]">
                {documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-amber-600/50">
                    <FolderOpen className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm text-center">No documents yet</p>
                    <Link href="/scan">
                      <Button variant="ghost" size="sm" className="mt-2 text-amber-500">
                        <Camera className="h-4 w-4 mr-1" /> Scan your first document
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {documents.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#0d0705]/40 hover:bg-[#0d0705]/60 transition-colors cursor-pointer">
                        <FileText className="h-5 w-5 text-amber-600 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-amber-100 text-sm truncate">{doc.title}</p>
                          <p className="text-amber-600/50 text-xs">{new Date(doc.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="h-full bg-gradient-to-br from-[#1a0f09]/80 to-[#2d1810]/60 border border-amber-900/30 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg text-amber-100 flex items-center gap-2">
                  <Mic className="h-5 w-5 text-amber-500" />
                  Voice Notes
                </h2>
              </div>
              
              <div className="flex flex-col items-center justify-center py-6">
                <motion.button
                  onClick={isRecording ? stopVoiceNote : startVoiceNote}
                  animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className={`h-20 w-20 rounded-full flex items-center justify-center transition-all ${
                    isRecording 
                      ? "bg-red-600 shadow-lg shadow-red-600/30" 
                      : "bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600"
                  }`}
                  data-testid="button-voice-record"
                >
                  {isRecording ? (
                    <MicOff className="h-8 w-8 text-white" />
                  ) : (
                    <Mic className="h-8 w-8 text-white" />
                  )}
                </motion.button>
                
                <p className="text-amber-200/60 text-sm mt-4 text-center">
                  {isRecording ? "Recording... Tap to stop" : "Tap to record a voice note"}
                </p>
                
                {recordingTranscript && (
                  <div className="mt-4 p-3 bg-[#0d0705]/50 rounded-lg w-full">
                    <p className="text-amber-100 text-sm">{recordingTranscript}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-1"
          >
            <div className="h-full bg-gradient-to-br from-[#1a0f09]/80 to-[#2d1810]/60 border border-amber-900/30 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-lg text-amber-100 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-amber-500" />
                  Calculator
                </h2>
                {savedCalculations.length > 0 && (
                  <Badge variant="secondary" className="bg-amber-900/50 text-amber-200">{savedCalculations.length}</Badge>
                )}
              </div>
              
              <div 
                onClick={() => setIsCalculatorOpen(true)}
                className="bg-[#0d0705]/60 rounded-xl p-4 cursor-pointer hover:bg-[#0d0705]/80 transition-colors"
                data-testid="button-open-calculator"
              >
                <div className="text-right mb-3">
                  <div className="text-amber-100 text-2xl font-mono font-bold truncate">
                    {calcDisplay}
                  </div>
                  {calcOperator && (
                    <div className="text-amber-600/60 text-xs">
                      {calcPrevValue} {calcOperator}
                    </div>
                  )}
                </div>
                
                <p className="text-amber-200/50 text-xs text-center">Tap to use full calculator</p>
              </div>
              
              {savedCalculations.length > 0 && (
                <div className="mt-3">
                  <p className="text-amber-600/60 text-xs mb-2">Saved ({savedCalculations.length})</p>
                  <div className="space-y-1 max-h-[80px] overflow-y-auto">
                    {savedCalculations.slice(0, 3).map((calc, i) => (
                      <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-[#0d0705]/40">
                        <span className="text-amber-200/80 truncate flex-1">{calc.label}</span>
                        <span className="text-amber-500 font-mono ml-2">{calc.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-[#1a0f09]/80 to-[#2d1810]/60 border border-amber-900/30 rounded-2xl p-5 backdrop-blur-sm">
              <h2 className="font-serif text-lg text-amber-100 flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Quick Actions
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2 bg-[#0d0705]/40 border-amber-900/30 hover:bg-amber-900/20 hover:border-amber-600/40"
                  onClick={openNewContact}
                  data-testid="action-new-contact"
                >
                  <UserPlus className="h-5 w-5 text-amber-500" />
                  <span className="text-amber-200 text-xs">New Contact</span>
                </Button>
                
                <Link href="/scan" className="contents">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2 bg-[#0d0705]/40 border-amber-900/30 hover:bg-amber-900/20 hover:border-amber-600/40"
                    data-testid="action-scan"
                  >
                    <Camera className="h-5 w-5 text-amber-500" />
                    <span className="text-amber-200 text-xs">Scan Document</span>
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2 bg-[#0d0705]/40 border-amber-900/30 hover:bg-amber-900/20 hover:border-amber-600/40"
                  onClick={() => businessCard ? exportCardToPDF() : openCardEditor()}
                  data-testid="action-share-card"
                >
                  <Share2 className="h-5 w-5 text-amber-500" />
                  <span className="text-amber-200 text-xs">Share Card</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col gap-2 bg-[#0d0705]/40 border-amber-900/30 hover:bg-amber-900/20 hover:border-amber-600/40"
                  onClick={() => setIsCalculatorOpen(true)}
                  data-testid="action-calculator"
                >
                  <Calculator className="h-5 w-5 text-amber-500" />
                  <span className="text-amber-200 text-xs">Calculator</span>
                </Button>
                
                <Link href="/schedule" className="contents">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex-col gap-2 bg-[#0d0705]/40 border-amber-900/30 hover:bg-amber-900/20 hover:border-amber-600/40"
                    data-testid="action-schedule"
                  >
                    <Calendar className="h-5 w-5 text-amber-500" />
                    <span className="text-amber-200 text-xs">Schedule Order</span>
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <Dialog open={isCardEditorOpen} onOpenChange={setIsCardEditorOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#1a0f09] border-amber-900/50 text-amber-100">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{businessCard ? "Edit" : "Create"} Business Card</DialogTitle>
            <DialogDescription className="text-amber-200/60">
              Design your professional digital business card
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-amber-200/80 mb-1 block">Full Name *</label>
                <Input 
                  value={cardForm.fullName || ""} 
                  onChange={(e) => setCardForm({ ...cardForm, fullName: e.target.value })}
                  placeholder="John Smith"
                  className="bg-[#0d0705] border-amber-900/50"
                  data-testid="input-card-name"
                />
              </div>
              <div>
                <label className="text-sm text-amber-200/80 mb-1 block">Job Title</label>
                <Input 
                  value={cardForm.jobTitle || ""} 
                  onChange={(e) => setCardForm({ ...cardForm, jobTitle: e.target.value })}
                  placeholder="CEO & Founder"
                  className="bg-[#0d0705] border-amber-900/50"
                  data-testid="input-card-title"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-amber-200/80 mb-1 block">Company</label>
              <Input 
                value={cardForm.company || ""} 
                onChange={(e) => setCardForm({ ...cardForm, company: e.target.value })}
                placeholder="Acme Corporation"
                className="bg-[#0d0705] border-amber-900/50"
                data-testid="input-card-company"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-amber-200/80 mb-1 block">Email</label>
                <Input 
                  type="email"
                  value={cardForm.email || ""} 
                  onChange={(e) => setCardForm({ ...cardForm, email: e.target.value })}
                  placeholder="john@example.com"
                  className="bg-[#0d0705] border-amber-900/50"
                  data-testid="input-card-email"
                />
              </div>
              <div>
                <label className="text-sm text-amber-200/80 mb-1 block">Phone</label>
                <Input 
                  value={cardForm.phone || ""} 
                  onChange={(e) => setCardForm({ ...cardForm, phone: e.target.value })}
                  placeholder="(615) 555-1234"
                  className="bg-[#0d0705] border-amber-900/50"
                  data-testid="input-card-phone"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-amber-200/80 mb-1 block">Website</label>
              <Input 
                value={cardForm.website || ""} 
                onChange={(e) => setCardForm({ ...cardForm, website: e.target.value })}
                placeholder="https://example.com"
                className="bg-[#0d0705] border-amber-900/50"
                data-testid="input-card-website"
              />
            </div>
            
            <div>
              <label className="text-sm text-amber-200/80 mb-1 block">LinkedIn</label>
              <Input 
                value={cardForm.linkedIn || ""} 
                onChange={(e) => setCardForm({ ...cardForm, linkedIn: e.target.value })}
                placeholder="linkedin.com/in/johnsmith"
                className="bg-[#0d0705] border-amber-900/50"
                data-testid="input-card-linkedin"
              />
            </div>
            
            <div>
              <label className="text-sm text-amber-200/80 mb-1 block">Tagline</label>
              <Input 
                value={cardForm.tagline || ""} 
                onChange={(e) => setCardForm({ ...cardForm, tagline: e.target.value })}
                placeholder="Helping businesses grow"
                className="bg-[#0d0705] border-amber-900/50"
                data-testid="input-card-tagline"
              />
            </div>
            
            <div>
              <label className="text-sm text-amber-200/80 mb-2 block">Color Theme</label>
              <div className="flex gap-2 flex-wrap">
                {colorThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setCardForm({ ...cardForm, colorTheme: theme.id })}
                    className={`h-10 w-10 rounded-lg bg-gradient-to-br ${theme.gradient} border-2 transition-all ${
                      cardForm.colorTheme === theme.id ? "border-white scale-110" : "border-transparent hover:scale-105"
                    }`}
                    title={theme.name}
                    data-testid={`theme-${theme.id}`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCardEditorOpen(false)} className="text-amber-200">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveCard} 
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={createCardMutation.isPending || updateCardMutation.isPending}
              data-testid="button-save-card"
            >
              <Save className="h-4 w-4 mr-2" />
              {createCardMutation.isPending || updateCardMutation.isPending ? "Saving..." : "Save Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isContactModalOpen} onOpenChange={(open) => { setIsContactModalOpen(open); if (!open) setEditingContact(null); }}>
        <DialogContent className="sm:max-w-[500px] bg-[#1a0f09] border-amber-900/50 text-amber-100">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{editingContact ? "Edit" : "Add"} Contact</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-amber-200/80 mb-1 block">Name *</label>
                <Input 
                  value={contactForm.name || ""} 
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Contact name"
                  className="bg-[#0d0705] border-amber-900/50"
                  data-testid="input-contact-name"
                />
              </div>
              <div>
                <label className="text-sm text-amber-200/80 mb-1 block">Company</label>
                <Input 
                  value={contactForm.company || ""} 
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                  placeholder="Company name"
                  className="bg-[#0d0705] border-amber-900/50"
                  data-testid="input-contact-company"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-amber-200/80 mb-1 block">Email</label>
                <Input 
                  type="email"
                  value={contactForm.email || ""} 
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="email@example.com"
                  className="bg-[#0d0705] border-amber-900/50"
                  data-testid="input-contact-email"
                />
              </div>
              <div>
                <label className="text-sm text-amber-200/80 mb-1 block">Phone</label>
                <Input 
                  value={contactForm.phone || ""} 
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="bg-[#0d0705] border-amber-900/50"
                  data-testid="input-contact-phone"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm text-amber-200/80 mb-1 block">Job Title</label>
              <Input 
                value={contactForm.jobTitle || ""} 
                onChange={(e) => setContactForm({ ...contactForm, jobTitle: e.target.value })}
                placeholder="Their role"
                className="bg-[#0d0705] border-amber-900/50"
                data-testid="input-contact-jobtitle"
              />
            </div>
            
            <div>
              <label className="text-sm text-amber-200/80 mb-1 block">Notes</label>
              <Textarea 
                value={contactForm.notes || ""} 
                onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                placeholder="Meeting notes, preferences, etc."
                className="bg-[#0d0705] border-amber-900/50 min-h-[80px]"
                data-testid="input-contact-notes"
              />
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {editingContact && (
              <Button 
                variant="destructive" 
                onClick={() => {
                  deleteContactMutation.mutate(editingContact.id);
                  setIsContactModalOpen(false);
                }}
                className="sm:mr-auto"
                data-testid="button-delete-contact"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
            <Button variant="ghost" onClick={() => setIsContactModalOpen(false)} className="text-amber-200">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveContact} 
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={createContactMutation.isPending || updateContactMutation.isPending}
              data-testid="button-save-contact"
            >
              <Save className="h-4 w-4 mr-2" />
              {createContactMutation.isPending || updateContactMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <DialogContent className="sm:max-w-[450px] bg-[#1a0f09] border-amber-900/50 text-amber-100">
          {selectedContact && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-amber-100 font-bold text-xl">
                    {selectedContact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <DialogTitle className="font-serif text-xl">{selectedContact.name}</DialogTitle>
                    {selectedContact.company && (
                      <p className="text-amber-200/60 text-sm">{selectedContact.company}</p>
                    )}
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-3 py-4">
                {selectedContact.jobTitle && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-200">{selectedContact.jobTitle}</span>
                  </div>
                )}
                {selectedContact.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-amber-600" />
                    <a href={`mailto:${selectedContact.email}`} className="text-amber-200 hover:text-amber-100">{selectedContact.email}</a>
                  </div>
                )}
                {selectedContact.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-amber-600" />
                    <a href={`tel:${selectedContact.phone}`} className="text-amber-200 hover:text-amber-100">{selectedContact.phone}</a>
                  </div>
                )}
                {selectedContact.notes && (
                  <div className="pt-3 border-t border-amber-900/30">
                    <p className="text-xs text-amber-600 mb-1">Notes</p>
                    <p className="text-amber-200/80 text-sm">{selectedContact.notes}</p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="ghost" onClick={() => openEditContact(selectedContact)} className="text-amber-500">
                  <Edit3 className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button onClick={() => setSelectedContact(null)} className="bg-amber-600 hover:bg-amber-700">
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#1a0f09] border-amber-900/50 text-amber-100 p-0 overflow-hidden">
          <div className="p-4 border-b border-amber-900/30">
            <DialogTitle className="font-serif text-xl flex items-center gap-2">
              <Calculator className="h-5 w-5 text-amber-500" />
              Calculator
            </DialogTitle>
          </div>
          
          <div className="p-4">
            <div className="bg-[#0d0705] rounded-xl p-4 mb-4">
              <div className="text-right">
                {calcOperator && (
                  <div className="text-amber-600/60 text-sm mb-1">
                    {calcPrevValue} {calcOperator}
                  </div>
                )}
                <div className="text-amber-100 text-3xl font-mono font-bold truncate" data-testid="calc-display">
                  {calcDisplay}
                </div>
              </div>
            </div>
            
            {showSaveInput ? (
              <div className="mb-4 flex gap-2">
                <Input
                  value={saveLabel}
                  onChange={(e) => setSaveLabel(e.target.value)}
                  placeholder="Label (e.g., Project Bid)"
                  className="bg-[#0d0705] border-amber-900/50 flex-1"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && saveCalculation()}
                  data-testid="input-calc-label"
                />
                <Button size="icon" onClick={saveCalculation} className="bg-amber-600 hover:bg-amber-700">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => { setShowSaveInput(false); setSaveLabel(""); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                className="w-full mb-4 border-amber-900/30 text-amber-200 hover:bg-amber-900/20"
                onClick={() => setShowSaveInput(true)}
                data-testid="button-save-calc"
              >
                <Bookmark className="h-4 w-4 mr-2" /> Save This Result
              </Button>
            )}
            
            <div className="grid grid-cols-4 gap-2">
              <Button 
                variant="outline" 
                className="h-14 text-lg font-medium bg-amber-900/30 border-amber-900/50 text-amber-200 hover:bg-amber-900/50"
                onClick={calcClear}
                data-testid="calc-clear"
              >
                AC
              </Button>
              <Button 
                variant="outline" 
                className="h-14 text-lg font-medium bg-amber-900/30 border-amber-900/50 text-amber-200 hover:bg-amber-900/50"
                onClick={calcToggleSign}
                data-testid="calc-toggle-sign"
              >
                +/-
              </Button>
              <Button 
                variant="outline" 
                className="h-14 text-lg font-medium bg-amber-900/30 border-amber-900/50 text-amber-200 hover:bg-amber-900/50"
                onClick={calcPercent}
                data-testid="calc-percent"
              >
                %
              </Button>
              <Button 
                variant="outline" 
                className={`h-14 text-lg font-medium border-amber-600/50 hover:bg-amber-600/30 ${calcOperator === "÷" ? "bg-amber-600 text-white" : "bg-amber-600/20 text-amber-400"}`}
                onClick={() => calcPerformOperation("÷")}
                data-testid="calc-divide"
              >
                ÷
              </Button>
              
              {["7", "8", "9"].map((d) => (
                <Button 
                  key={d}
                  variant="outline" 
                  className="h-14 text-xl font-medium bg-[#0d0705] border-amber-900/50 text-amber-100 hover:bg-amber-900/30"
                  onClick={() => calcInputDigit(d)}
                  data-testid={`calc-${d}`}
                >
                  {d}
                </Button>
              ))}
              <Button 
                variant="outline" 
                className={`h-14 text-lg font-medium border-amber-600/50 hover:bg-amber-600/30 ${calcOperator === "×" ? "bg-amber-600 text-white" : "bg-amber-600/20 text-amber-400"}`}
                onClick={() => calcPerformOperation("×")}
                data-testid="calc-multiply"
              >
                ×
              </Button>
              
              {["4", "5", "6"].map((d) => (
                <Button 
                  key={d}
                  variant="outline" 
                  className="h-14 text-xl font-medium bg-[#0d0705] border-amber-900/50 text-amber-100 hover:bg-amber-900/30"
                  onClick={() => calcInputDigit(d)}
                  data-testid={`calc-${d}`}
                >
                  {d}
                </Button>
              ))}
              <Button 
                variant="outline" 
                className={`h-14 text-lg font-medium border-amber-600/50 hover:bg-amber-600/30 ${calcOperator === "-" ? "bg-amber-600 text-white" : "bg-amber-600/20 text-amber-400"}`}
                onClick={() => calcPerformOperation("-")}
                data-testid="calc-subtract"
              >
                −
              </Button>
              
              {["1", "2", "3"].map((d) => (
                <Button 
                  key={d}
                  variant="outline" 
                  className="h-14 text-xl font-medium bg-[#0d0705] border-amber-900/50 text-amber-100 hover:bg-amber-900/30"
                  onClick={() => calcInputDigit(d)}
                  data-testid={`calc-${d}`}
                >
                  {d}
                </Button>
              ))}
              <Button 
                variant="outline" 
                className={`h-14 text-lg font-medium border-amber-600/50 hover:bg-amber-600/30 ${calcOperator === "+" ? "bg-amber-600 text-white" : "bg-amber-600/20 text-amber-400"}`}
                onClick={() => calcPerformOperation("+")}
                data-testid="calc-add"
              >
                +
              </Button>
              
              <Button 
                variant="outline" 
                className="h-14 text-xl font-medium bg-[#0d0705] border-amber-900/50 text-amber-100 hover:bg-amber-900/30 col-span-2"
                onClick={() => calcInputDigit("0")}
                data-testid="calc-0"
              >
                0
              </Button>
              <Button 
                variant="outline" 
                className="h-14 text-xl font-medium bg-[#0d0705] border-amber-900/50 text-amber-100 hover:bg-amber-900/30"
                onClick={calcInputDecimal}
                data-testid="calc-decimal"
              >
                .
              </Button>
              <Button 
                className="h-14 text-lg font-medium bg-amber-600 hover:bg-amber-700 text-white"
                onClick={calcEquals}
                data-testid="calc-equals"
              >
                =
              </Button>
            </div>
            
            {savedCalculations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-amber-900/30">
                <p className="text-amber-600/80 text-xs font-medium mb-2">Saved Calculations</p>
                <ScrollArea className="h-[120px]">
                  <div className="space-y-2">
                    {savedCalculations.map((calc, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#0d0705]/60 group">
                        <div className="min-w-0 flex-1">
                          <p className="text-amber-200 text-sm truncate">{calc.label}</p>
                          <p className="text-amber-600/60 text-xs">{new Date(calc.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 font-mono font-medium">{calc.value}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-red-400"
                            onClick={() => deleteSavedCalc(i)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
