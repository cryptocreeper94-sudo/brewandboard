import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Minimize2, Maximize2, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  type: 'user' | 'support' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

interface SupportChatProps {
  userId?: string;
  userName?: string;
}

const QUICK_RESPONSES = [
  "Track my order",
  "Change delivery address",
  "Request a refund",
  "Speak to a human",
];

const AUTO_RESPONSES: Record<string, string> = {
  'track': "I can help you track your order! Please provide your order number or check the 'My Orders' section in your account for real-time tracking.",
  'refund': "For refund requests, please go to My Orders, select the order, and click 'Request Cancellation'. Our refund policy: 100% refund if cancelled 2+ hours before delivery, 50% if 1-2 hours, no refund within 1 hour of delivery.",
  'address': "To change your delivery address, please cancel your current order and place a new one with the correct address. Orders in progress cannot have their address modified for food safety reasons.",
  'human': "I'm connecting you to our support team. A representative will respond within 2-5 minutes during business hours (8am-8pm CST). Leave your message and we'll get back to you!",
  'hello': "Hello! Welcome to Brew & Board Coffee support. How can I help you today?",
  'hi': "Hi there! How can I assist you with your coffee delivery today?",
};

export function SupportChat({ userId, userName }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bb_chat_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } catch (e) {
        console.error('Failed to parse saved messages');
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('bb_chat_messages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'system',
        content: `Hello${userName ? `, ${userName}` : ''}! Welcome to Brew & Board support. How can I help you today?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, isMinimized, userName]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const lowerInput = inputValue.toLowerCase();
      let response = "Thanks for your message! Our team will review it shortly. For immediate help, try one of the quick options below.";

      for (const [keyword, autoResponse] of Object.entries(AUTO_RESPONSES)) {
        if (lowerInput.includes(keyword)) {
          response = autoResponse;
          break;
        }
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'support',
        content: response,
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages(prev => [...prev, botMessage]);
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickResponse = (text: string) => {
    setInputValue(text);
    setTimeout(() => handleSend(), 100);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('bb_chat_messages');
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-amber-700 hover:bg-amber-800 shadow-lg"
          data-testid="button-open-chat"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50"
        data-testid="support-chat-widget"
      >
        <Card className={`w-[360px] shadow-2xl ${isMinimized ? 'h-auto' : 'h-[500px]'} flex flex-col`}>
          <CardHeader className="bg-gradient-to-r from-amber-800 to-amber-700 text-white rounded-t-lg py-3 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Support Chat
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setIsMinimized(!isMinimized)}
                  data-testid="button-minimize-chat"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                  data-testid="button-close-chat"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {!isMinimized && (
              <div className="flex items-center gap-2 text-sm text-amber-100 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                Online | Typically replies in minutes
              </div>
            )}
          </CardHeader>

          {!isMinimized && (
            <>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea className="h-full p-4" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        data-testid={`chat-message-${message.id}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.type === 'user'
                              ? 'bg-amber-700 text-white'
                              : message.type === 'system'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {message.type === 'user' && message.status && (
                              <CheckCircle className="w-3 h-3 opacity-70" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-lg px-4 py-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              <div className="px-4 py-2 border-t bg-gray-50">
                <div className="flex flex-wrap gap-1 mb-2">
                  {QUICK_RESPONSES.map((text) => (
                    <Badge
                      key={text}
                      variant="outline"
                      className="cursor-pointer hover:bg-amber-100 text-xs"
                      onClick={() => handleQuickResponse(text)}
                      data-testid={`quick-response-${text.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      {text}
                    </Badge>
                  ))}
                </div>
              </div>

              <CardFooter className="p-4 pt-2">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2 w-full"
                >
                  <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="flex-1"
                    data-testid="input-chat-message"
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="bg-amber-700 hover:bg-amber-800"
                    disabled={!inputValue.trim()}
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardFooter>
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default SupportChat;
