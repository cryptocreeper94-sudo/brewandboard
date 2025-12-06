import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Sparkles, MessageCircle, Send, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import mascotImage from "@assets/generated_images/cute_female_coffee_cup_mascot_nobg.png";

interface MascotButtonProps {
  onSpeechStart?: () => void;
  onSpeechEnd?: (text: string) => void;
  onTextSubmit?: (text: string) => void;
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

const INTRO_GREETING = "Hi! I'm Happy Coffee, your AI assistant! ☕✨";
const RECALL_MESSAGE = "Tap me anytime you need help!";

export function MascotButton({
  onSpeechStart,
  onSpeechEnd,
  onTextSubmit,
  onChatOpen,
  showChat = true,
  className = "",
}: MascotButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSpeechBubble, setShowSpeechBubble] = useState(false);
  const [speechBubbleText, setSpeechBubbleText] = useState("");
  const [displayTranscript, setDisplayTranscript] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const introSeen = localStorage.getItem("mascot_intro_seen");
    if (!introSeen) {
      setIsMinimized(false);
      setTimeout(() => {
        setSpeechBubbleText(INTRO_GREETING);
        setShowSpeechBubble(true);
        setTimeout(() => {
          setSpeechBubbleText(RECALL_MESSAGE);
          setTimeout(() => {
            setShowSpeechBubble(false);
            setIsMinimized(true);
            localStorage.setItem("mascot_intro_seen", "true");
          }, 2500);
        }, 3000);
      }, 1000);
    } else {
      setIsMinimized(true);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleMascotClick = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsExpanded(true);
      setShowSpeechBubble(true);
      setSpeechBubbleText(MASCOT_PHRASES[Math.floor(Math.random() * MASCOT_PHRASES.length)]);
      setTimeout(() => setShowSpeechBubble(false), 3000);
    } else if (!isExpanded) {
      setIsExpanded(true);
      setShowSpeechBubble(true);
      setSpeechBubbleText(MASCOT_PHRASES[Math.floor(Math.random() * MASCOT_PHRASES.length)]);
      setTimeout(() => setShowSpeechBubble(false), 3000);
    } else {
      setIsExpanded(false);
      setShowSpeechBubble(false);
    }
  };

  const handleMinimize = () => {
    setIsExpanded(false);
    setShowTextInput(false);
    setIsMinimized(true);
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

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      if (onTextSubmit) {
        onTextSubmit(textInput.trim());
      }
      const responses = [
        "I'd love to help you with that! Let me look into it. ☕",
        "Great question! Here's what I think...",
        "Absolutely! I'm on it. ✨",
        "That's a wonderful idea! Let me assist you.",
        "Sure thing! Coffee makes everything possible!",
        "I'm here to help! What else can I do for you?",
      ];
      setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
      setTextInput("");
      setTimeout(() => setAiResponse(""), 5000);
    }
  };

  const toggleTextInput = () => {
    setShowTextInput(!showTextInput);
    if (!showTextInput) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  if (isMinimized) {
    return (
      <div className={`fixed bottom-14 right-4 z-[9999] ${className}`}>
        <motion.button
          onClick={handleMascotClick}
          className="relative group bg-transparent border-none p-0 focus:outline-none outline-none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          data-testid="button-mascot-minimized"
        >
          <div 
            className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg"
            style={{ 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)',
              boxShadow: '0 0 20px rgba(251,191,36,0.5)'
            }}
          >
            <img
              src={mascotImage}
              alt="Happy Coffee"
              className="w-full h-full object-cover scale-150 translate-y-2"
            />
          </div>
          <motion.div
            className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-amber-400 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
            }}
          >
            <Sparkles className="h-3 w-3 text-white" />
          </motion.div>
        </motion.button>
      </div>
    );
  }

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
                {speechBubbleText}
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

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={toggleTextInput}
                className={`rounded-full w-14 h-14 shadow-lg ${
                  showTextInput
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                }`}
                data-testid="button-text-input"
              >
                <Keyboard className="h-6 w-6 text-white" />
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
                onClick={handleMinimize}
                variant="outline"
                className="rounded-full w-14 h-14 shadow-lg bg-white"
                data-testid="button-minimize-mascot"
              >
                <X className="h-6 w-6" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTextInput && isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className="absolute bottom-0 right-20 w-72 bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden"
            data-testid="text-input-panel"
          >
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2">
              <p className="text-white text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Chat with Coffee Cup ☕
              </p>
            </div>
            
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 bg-amber-50 border-b border-amber-100"
              >
                <p className="text-sm text-amber-900">{aiResponse}</p>
              </motion.div>
            )}
            
            <div className="p-3">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleTextSubmit();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1 text-sm border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  data-testid="input-ai-chat"
                />
                <Button
                  onClick={handleTextSubmit}
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  data-testid="button-send-message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
        <img
          src={mascotImage}
          alt="Happy Coffee - Your AI Assistant"
          className="w-32 h-32 object-contain"
          style={{ 
            filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.55)) drop-shadow(0 5px 10px rgba(180,83,9,0.3))'
          }}
        />

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
