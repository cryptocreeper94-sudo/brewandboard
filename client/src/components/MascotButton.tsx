import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import mascotImage from "@assets/generated_images/cute_female_coffee_cup_mascot_nobg.png";

interface MascotButtonProps {
  onSpeechStart?: () => void;
  onSpeechEnd?: (text: string) => void;
  onChatOpen?: () => void;
  showChat?: boolean;
  className?: string;
}

const MASCOT_PHRASES = [
  "Have a nice day! ☕",
  "Need help with anything?",
  "I'm here to help! ✨",
  "Let's get things done!",
  "Coffee makes everything better!",
  "How can I assist you today?",
];

export function MascotButton({
  onSpeechStart,
  onSpeechEnd,
  onChatOpen,
  showChat = true,
  className = "",
}: MascotButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [displayTranscript, setDisplayTranscript] = useState("");
  
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleMascotClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setShowSpeechBubble(true);
      setCurrentPhrase(Math.floor(Math.random() * MASCOT_PHRASES.length));
      setTimeout(() => setShowSpeechBubble(false), 3000);
    } else {
      setIsExpanded(false);
      setShowSpeechBubble(false);
    }
  };

  const startListening = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    
    transcriptRef.current = "";
    setDisplayTranscript("");

    recognition.onstart = () => {
      setIsListening(true);
      onSpeechStart?.();
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        transcriptRef.current += finalTranscript;
        setDisplayTranscript(transcriptRef.current);
      } else if (interimTranscript) {
        setDisplayTranscript(transcriptRef.current + interimTranscript);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      if (transcriptRef.current.trim()) {
        onSpeechEnd?.(transcriptRef.current.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div className={`fixed bottom-14 right-4 z-[9999] ${className}`}>
      <AnimatePresence>
        {showSpeechBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute bottom-full right-0 mb-3 min-w-[200px]"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl border border-amber-200 p-4">
              <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-amber-200 transform rotate-45" />
              <p className="text-sm font-medium text-amber-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                {MASCOT_PHRASES[currentPhrase]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-20 right-0 flex flex-col gap-2"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={isListening ? stopListening : startListening}
                className={`rounded-full w-14 h-14 shadow-lg ${
                  isListening 
                    ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                    : "bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                }`}
                data-testid="button-voice-input"
              >
                {isListening ? (
                  <MicOff className="h-6 w-6 text-white" />
                ) : (
                  <Mic className="h-6 w-6 text-white" />
                )}
              </Button>
            </motion.div>

            {showChat && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onChatOpen}
                  className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  data-testid="button-chat"
                >
                  <MessageCircle className="h-6 w-6 text-white" />
                </Button>
              </motion.div>
            )}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => setIsExpanded(false)}
                variant="outline"
                className="rounded-full w-14 h-14 shadow-lg bg-white"
                data-testid="button-close-mascot"
              >
                <X className="h-6 w-6" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isListening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-full right-0 mb-3 bg-white rounded-xl shadow-xl border border-red-200 p-3 min-w-[250px]"
          data-testid="speech-indicator"
        >
          <div className="flex items-center gap-2 text-red-600">
            <div className="flex gap-1">
              <motion.div
                animate={{ scaleY: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="w-1 h-4 bg-red-500 rounded"
              />
              <motion.div
                animate={{ scaleY: [1, 2, 1] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
                className="w-1 h-4 bg-red-500 rounded"
              />
              <motion.div
                animate={{ scaleY: [1, 1.8, 1] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                className="w-1 h-4 bg-red-500 rounded"
              />
            </div>
            <span className="text-sm font-medium">Listening...</span>
          </div>
          {displayTranscript && (
            <p className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
              {displayTranscript}
            </p>
          )}
        </motion.div>
      )}

      <motion.button
        onClick={handleMascotClick}
        className="relative group bg-transparent border-none p-0 focus:outline-none outline-none"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: isExpanded ? 0 : [0, -8, 0],
        }}
        transition={{
          y: {
            repeat: isExpanded ? 0 : Infinity,
            duration: 2,
            ease: "easeInOut",
          },
        }}
        data-testid="button-mascot"
      >
        {/* Just the floating mascot image with drop-shadow glow - no containers */}
        <img
          src={mascotImage}
          alt="Happy Coffee - Your AI Assistant"
          className="w-32 h-32 object-contain"
          style={{ 
            filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.55)) drop-shadow(0 5px 10px rgba(180,83,9,0.3))'
          }}
        />

        {/* Sparkle indicator */}
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
        >
          <Sparkles className="h-4 w-4 text-amber-400" style={{ filter: 'drop-shadow(0 0 4px rgba(251,191,36,0.8))' }} />
        </motion.div>
      </motion.button>
    </div>
  );
}

export default MascotButton;
