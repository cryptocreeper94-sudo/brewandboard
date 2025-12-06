import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mic, MicOff, Sparkles, Coffee, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import mascotImage from "@assets/generated_images/cute_female_coffee_cup_mascot.png";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface StoredMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface MascotPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage?: (message: string) => Promise<string>;
}

const STORAGE_KEY = "mascot_chat_history";

const WELCOME_MESSAGES = [
  "Hi there! I'm Happy Coffee, your friendly assistant! ☕ How can I help you today?",
  "Welcome! I'm here to make your day a little brighter. What can I do for you?",
  "Hey friend! Ready to tackle some tasks together? Just ask away!",
];

const RETURN_MESSAGES = [
  "Welcome back! ☕ Where were we?",
  "Good to see you again! How can I help?",
  "I'm here and ready to assist! ✨",
];

function loadMessagesFromStorage(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: StoredMessage[] = JSON.parse(stored);
      return parsed.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
    }
  } catch (e) {
    console.error("Failed to load chat history:", e);
  }
  return [];
}

function saveMessagesToStorage(messages: Message[]) {
  try {
    const toStore: StoredMessage[] = messages.map(m => ({
      ...m,
      timestamp: m.timestamp.toISOString()
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (e) {
    console.error("Failed to save chat history:", e);
  }
}

export function MascotPopover({ isOpen, onClose, onSendMessage }: MascotPopoverProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { isListening, isSupported, startListening, stopListening, transcript, resetTranscript } = useSpeechToText({
    onResult: (text) => {
      setInputValue((prev) => prev + " " + text);
    },
  });

  useEffect(() => {
    if (isOpen && !initialized) {
      const storedMessages = loadMessagesFromStorage();
      
      if (storedMessages.length > 0) {
        setMessages(storedMessages);
        const returnMessage: Message = {
          id: `return-${Date.now()}`,
          role: "assistant",
          content: RETURN_MESSAGES[Math.floor(Math.random() * RETURN_MESSAGES.length)],
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, returnMessage]);
      } else {
        const welcomeMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: welcomeMessage,
          timestamp: new Date(),
        }]);
      }
      setInitialized(true);
    }
  }, [isOpen, initialized]);

  useEffect(() => {
    if (messages.length > 0 && initialized) {
      saveMessagesToStorage(messages);
    }
  }, [messages, initialized]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    resetTranscript();
    setIsLoading(true);

    try {
      if (onSendMessage) {
        const response = await onSendMessage(userMessage.content);
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: response,
            timestamp: new Date(),
          },
        ]);
      } else {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: "I'm still learning! Soon I'll be able to help you with orders, scheduling, and more. Stay tuned! ☕✨",
              timestamp: new Date(),
            },
          ]);
        }, 1000);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Oops! Something went wrong. Let me try that again for you.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    const welcomeMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
    setMessages([{
      id: "welcome-fresh",
      role: "assistant",
      content: welcomeMessage,
      timestamp: new Date(),
    }]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-28 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)]"
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
              </div>
              
              <div className="flex items-center gap-3 relative z-10">
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg"
                >
                  <img src={mascotImage} alt="Happy Coffee" className="w-full h-full object-cover" />
                </motion.div>
                
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    Happy Coffee
                    <Sparkles className="h-4 w-4" />
                  </h3>
                  <p className="text-amber-100 text-sm">Your AI Assistant</p>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearHistory}
                  className="text-white/70 hover:text-white hover:bg-white/20 rounded-full"
                  title="Clear chat history"
                  data-testid="button-clear-chat"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 rounded-full"
                  data-testid="button-close-chat"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <motion.div
                className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              />
            </div>

            <ScrollArea className="h-[300px] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-1">
                          <Coffee className="h-3 w-3 text-amber-600" />
                          <span className="text-xs font-medium text-amber-600">Happy Coffee</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                      <span className="text-sm text-gray-500">Thinking...</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex gap-2">
                {isSupported && (
                  <Button
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    onClick={isListening ? stopListening : startListening}
                    className={`rounded-full flex-shrink-0 ${isListening ? "animate-pulse" : ""}`}
                    data-testid="button-voice-chat"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
                
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-full border-gray-200 focus:border-amber-400"
                  data-testid="input-chat-message"
                />
                
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading}
                  className="rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  data-testid="button-send-chat"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 flex items-center gap-2 text-sm text-red-600"
                >
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-3 bg-red-500 rounded"
                        animate={{ scaleY: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                      />
                    ))}
                  </div>
                  <span>Listening... speak now</span>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MascotPopover;
