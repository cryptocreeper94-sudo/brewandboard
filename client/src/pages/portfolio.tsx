import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Book, 
  Plus, 
  Save, 
  Trash2, 
  Briefcase, 
  Users, 
  Paintbrush, 
  Wrench, 
  HardHat, 
  Building2,
  MoreHorizontal,
  PenTool,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Templates for different industries
const TEMPLATES = {
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
  const [notes, setNotes] = useState([
    { 
      id: 1, 
      title: "Morning Standup", 
      date: "2024-05-20", 
      type: "general", 
      preview: "Discussed the new inventory shipment...",
      data: {} 
    },
    { 
      id: 2, 
      title: "Job #4022 - West End Reno", 
      date: "2024-05-19", 
      type: "painter", 
      preview: "Crew Leader: Mike. Colors: Sherwin Williams Alabaster...",
      data: { job_number: "4022", crew_leader: "Mike", paint_colors: "SW Alabaster" }
    }
  ]);

  const [activeNote, setActiveNote] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("general");
  const [isEditing, setIsEditing] = useState(false);

  const handleNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: "New Note",
      date: new Date().toISOString().split('T')[0],
      type: selectedTemplate,
      preview: "No content yet...",
      data: {}
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    setIsEditing(true);
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
    // Update the preview text based on the first field or content
    const updatedNotes = notes.map(n => 
      n.id === activeNote.id ? { ...activeNote, preview: "Updated content..." } : n
    );
    setNotes(updatedNotes);
  };

  const handleDelete = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    if (activeNote && activeNote.id === id) {
      setActiveNote(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold mb-1 flex items-center gap-3">
              <Book className="h-8 w-8 text-primary" />
              My Portfolio
            </h1>
            <p className="text-muted-foreground">Meeting notes, job details, and templates.</p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="h-4 w-4" /> New Entry
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
                      onClick={() => setSelectedTemplate(key)}
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
                <Button onClick={handleNewNote} className="w-full mt-2">
                  Create Note
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

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
                     onClick={() => { setActiveNote(note); setIsEditing(true); }}
                     className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                       activeNote?.id === note.id 
                         ? 'bg-primary/5 border-primary/20 shadow-sm' 
                         : 'bg-card border-border/50 hover:border-primary/20'
                     }`}
                   >
                     <div className="flex justify-between items-start mb-1">
                       <h3 className="font-semibold truncate pr-2">{note.title}</h3>
                       <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-background/50">
                         {TEMPLATES[note.type]?.name.split(' ')[0]}
                       </Badge>
                     </div>
                     <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                       {note.preview}
                     </p>
                     <div className="text-[10px] text-muted-foreground/60 flex justify-between items-center">
                       <span>{note.date}</span>
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
                        {TEMPLATES[activeNote.type]?.icon}
                        {TEMPLATES[activeNote.type]?.name} Template
                      </span>
                      <span>•</span>
                      <span>{activeNote.date}</span>
                    </div>
                  </div>
                  <Button onClick={handleSave} size="sm" className="gap-2">
                    <Save className="h-4 w-4" /> Save
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
                      
                      {TEMPLATES[activeNote.type]?.fields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            {field.label}
                          </label>
                          {field.type === 'textarea' ? (
                            <Textarea 
                              className="bg-background resize-none" 
                              rows={3}
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                              value={activeNote.data[field.id] || ''}
                              onChange={(e) => setActiveNote({
                                ...activeNote,
                                data: { ...activeNote.data, [field.id]: e.target.value }
                              })}
                            />
                          ) : (
                            <Input 
                              className="bg-background"
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                              value={activeNote.data[field.id] || ''}
                              onChange={(e) => setActiveNote({
                                ...activeNote,
                                data: { ...activeNote.data, [field.id]: e.target.value }
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
                        defaultValue="Notes from the meeting..."
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
