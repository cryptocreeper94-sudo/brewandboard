import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string | null;
  message: string;
  createdAt: string;
}

export function TeamChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const userName = localStorage.getItem('user_name') || 'Guest';
  const userId = localStorage.getItem('user_id') || 'guest';
  const userRole = localStorage.getItem('user_role') || 'Team Member';

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['team-chat'],
    queryFn: async () => {
      const res = await fetch('/api/team-chat/messages?limit=50');
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    refetchInterval: isOpen ? 5000 : false, // Poll every 5s when open
  });

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch('/api/team-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          senderName: userName,
          senderRole: userRole,
          message
        })
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-chat'] });
      setNewMessage('');
    }
  });

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage.mutate(newMessage.trim());
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center shine-effect"
        style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-toggle-chat"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-gradient-to-br from-[#1a0f09] to-[#2d1810] rounded-xl shadow-2xl border border-[#3d2418]/50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#3d2418]/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}>
                <Users className="h-5 w-5 text-[#d4c4b0]" />
              </div>
              <div>
                <h3 className="font-serif text-stone-100 font-semibold">Team Chat</h3>
                <p className="text-xs text-stone-400">Delivery Operators</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-80 p-4" ref={scrollRef}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-stone-400 text-sm">Loading messages...</div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="h-12 w-12 text-stone-600 mb-3" />
                  <p className="text-stone-400 text-sm">No messages yet</p>
                  <p className="text-stone-500 text-xs mt-1">Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => {
                    const isMe = msg.senderId === userId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback 
                            className="text-xs"
                            style={{ 
                              background: isMe 
                                ? 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' 
                                : '#3d2418',
                              color: '#d4c4b0'
                            }}
                          >
                            {getInitials(msg.senderName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-stone-400">{msg.senderName}</span>
                            <span className="text-xs text-stone-500">{formatTime(msg.createdAt)}</span>
                          </div>
                          <div
                            className={`px-3 py-2 rounded-xl text-sm ${
                              isMe
                                ? 'bg-[#5c4033] text-stone-100'
                                : 'bg-black/30 text-stone-200'
                            }`}
                          >
                            {msg.message}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-[#3d2418]/50 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-black/20 border-[#3d2418]/50 text-stone-200 placeholder:text-stone-500"
                data-testid="input-chat-message"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!newMessage.trim() || sendMessage.isPending}
                className="shine-effect"
                style={{ background: 'linear-gradient(135deg, #5c4033 0%, #3d2418 100%)' }}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
