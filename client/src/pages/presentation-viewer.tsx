import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Calendar, 
  Clock, 
  Download,
  Maximize,
  Minimize,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MeetingPresentation {
  id: string;
  title: string;
  description: string | null;
  templateType: string;
  meetingDate: string | null;
  meetingTime: string | null;
  viewCount: number;
}

interface ScannedDocument {
  id: string;
  title: string;
  category: string | null;
  extractedText: string | null;
  imageData: string | null;
  createdAt: string;
}

const TEMPLATE_THEMES = {
  executive: {
    bg: "from-slate-900 via-slate-800 to-slate-700",
    cardBg: "bg-slate-800/80",
    accent: "text-blue-400",
    accentBg: "bg-blue-600",
    border: "border-blue-500/30",
    text: "text-slate-100",
    subtext: "text-slate-400",
    headerGradient: "from-blue-600 to-blue-800",
  },
  board: {
    bg: "from-[#1a0f09] via-[#2d1810] to-[#3d2418]",
    cardBg: "bg-[#2d1810]/80",
    accent: "text-amber-400",
    accentBg: "bg-amber-600",
    border: "border-amber-500/30",
    text: "text-amber-100",
    subtext: "text-amber-200/60",
    headerGradient: "from-amber-600 to-amber-800",
  },
  huddle: {
    bg: "from-emerald-900 via-emerald-800 to-emerald-700",
    cardBg: "bg-emerald-800/80",
    accent: "text-emerald-300",
    accentBg: "bg-emerald-600",
    border: "border-emerald-400/30",
    text: "text-emerald-100",
    subtext: "text-emerald-200/60",
    headerGradient: "from-emerald-500 to-emerald-700",
  },
};

export default function PresentationViewerPage() {
  const { link } = useParams<{ link: string }>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { data, isLoading, error } = useQuery<{ presentation: MeetingPresentation; documents: ScannedDocument[] }>({
    queryKey: ["presentation-view", link],
    queryFn: async () => {
      const res = await fetch(`/api/meeting-presentations/view/${link}`);
      if (!res.ok) throw new Error("Presentation not found");
      return res.json();
    },
    enabled: !!link
  });
  
  const presentation = data?.presentation;
  const documents = data?.documents || [];
  const theme = presentation ? TEMPLATE_THEMES[presentation.templateType as keyof typeof TEMPLATE_THEMES] || TEMPLATE_THEMES.board : TEMPLATE_THEMES.board;
  
  const totalSlides = documents.length + 1;
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlide(prev => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        setIsFullscreen(false);
      } else if (e.key === "f") {
        setIsFullscreen(!isFullscreen);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalSlides, isFullscreen]);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} flex items-center justify-center`}>
        <div className="animate-pulse">
          <div className={`w-16 h-16 rounded-full ${theme.accentBg} flex items-center justify-center`}>
            <FileText className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !presentation) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className={`text-2xl font-serif ${theme.text} mb-4`}>Presentation Not Found</h1>
          <p className={theme.subtext}>This presentation may have been removed or the link is invalid.</p>
          <Button 
            onClick={() => window.location.href = "/"}
            className="mt-6"
          >
            <Home className="h-4 w-4 mr-2" /> Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} flex flex-col`}>
      {!isFullscreen && (
        <header className={`border-b ${theme.border} p-4 backdrop-blur-sm`}>
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.headerGradient} flex items-center justify-center`}>
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className={`font-serif text-xl ${theme.text}`}>{presentation.title}</h1>
                {presentation.meetingDate && (
                  <p className={`${theme.subtext} text-sm flex items-center gap-2`}>
                    <Calendar className="h-3 w-3" />
                    {new Date(presentation.meetingDate).toLocaleDateString()}
                    {presentation.meetingTime && (
                      <>
                        <Clock className="h-3 w-3 ml-2" />
                        {presentation.meetingTime}
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className={theme.text}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>
      )}
      
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          className={`absolute left-2 md:left-8 z-10 h-12 w-12 rounded-full ${theme.cardBg} ${theme.text} disabled:opacity-30`}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <div className="w-full max-w-5xl aspect-[16/9] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {currentSlide === 0 ? (
              <motion.div
                key="title"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className={`absolute inset-0 ${theme.cardBg} rounded-2xl ${theme.border} border p-8 md:p-16 flex flex-col items-center justify-center text-center`}
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${theme.headerGradient} flex items-center justify-center mb-8`}>
                  <FileText className="h-10 w-10 text-white" />
                </div>
                
                <h1 className={`font-serif text-3xl md:text-5xl ${theme.text} mb-4`}>
                  {presentation.title}
                </h1>
                
                {presentation.description && (
                  <p className={`${theme.subtext} text-lg md:text-xl max-w-2xl mb-8`}>
                    {presentation.description}
                  </p>
                )}
                
                <div className={`flex items-center gap-6 ${theme.subtext}`}>
                  {presentation.meetingDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>{new Date(presentation.meetingDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {presentation.meetingTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{presentation.meetingTime}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    <span>{documents.length} document{documents.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                
                <div className={`mt-12 ${theme.accent} text-sm animate-pulse`}>
                  Press → or click to continue
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`doc-${currentSlide}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className={`absolute inset-0 ${theme.cardBg} rounded-2xl ${theme.border} border overflow-hidden`}
              >
                {documents[currentSlide - 1] ? (
                  <div className="h-full flex flex-col">
                    <div className={`p-4 md:p-6 border-b ${theme.border} flex items-center justify-between`}>
                      <div>
                        <span className={`${theme.subtext} text-sm`}>Document {currentSlide} of {documents.length}</span>
                        <h2 className={`font-serif text-xl md:text-2xl ${theme.text}`}>
                          {documents[currentSlide - 1].title}
                        </h2>
                      </div>
                      {documents[currentSlide - 1].category && (
                        <span className={`px-3 py-1 rounded-full ${theme.accentBg} text-white text-sm`}>
                          {documents[currentSlide - 1].category}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 overflow-auto p-4 md:p-8">
                      {documents[currentSlide - 1].imageData ? (
                        <div className="flex items-center justify-center h-full">
                          <img 
                            src={documents[currentSlide - 1].imageData!}
                            alt={documents[currentSlide - 1].title}
                            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                          />
                        </div>
                      ) : documents[currentSlide - 1].extractedText ? (
                        <div className={`${theme.text} whitespace-pre-wrap text-base md:text-lg leading-relaxed`}>
                          {documents[currentSlide - 1].extractedText}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className={theme.subtext}>No content available</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className={theme.subtext}>Document not found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1))}
          disabled={currentSlide === totalSlides - 1}
          className={`absolute right-2 md:right-8 z-10 h-12 w-12 rounded-full ${theme.cardBg} ${theme.text} disabled:opacity-30`}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </main>
      
      <footer className={`border-t ${theme.border} p-4 backdrop-blur-sm`}>
        <div className="container mx-auto flex items-center justify-between">
          <div className={`${theme.subtext} text-sm`}>
            Powered by Brew & Board Coffee
          </div>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentSlide 
                    ? `${theme.accentBg} w-6` 
                    : `${theme.cardBg} hover:opacity-80`
                }`}
              />
            ))}
          </div>
          
          <div className={`${theme.subtext} text-sm`}>
            {currentSlide + 1} / {totalSlides}
          </div>
        </div>
      </footer>
    </div>
  );
}
