import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';
import { toast } from 'sonner';

// Message validation schema - max 2000 characters
const messageSchema = z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message is too long (max 2000 characters)');
interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    email: string | null;
  };
}

interface GroupChatProps {
  groupId: string;
  currentUserId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

const QUICK_EMOJIS = ['👍', '🔥', '💪', '🎉', '❤️', '😊'];

export const GroupChat = ({ groupId, currentUserId, messages, onSendMessage }: GroupChatProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isExpanded) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isExpanded]);

  const handleSend = () => {
    const result = messageSchema.safeParse(newMessage);
    if (!result.success) {
      toast.error(result.error.errors[0]?.message || 'Invalid message');
      return;
    }
    onSendMessage(result.data);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <span className="font-semibold">Group Chat</span>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {messages.length} messages
        </span>
      </button>

      {isExpanded && (
        <div className="border-t">
          <ScrollArea className="h-64 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                No messages yet. Start the conversation!
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isOwn = msg.user_id === currentUserId;
                  const userName = msg.profiles?.display_name || msg.profiles?.email?.split('@')[0] || 'User';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                    >
                      {!isOwn && (
                        <span className="text-xs text-muted-foreground mb-1">{userName}</span>
                      )}
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          <div className="p-3 border-t bg-muted/20">
            <div className="flex gap-1 mb-2">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-muted rounded-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value.slice(0, 2000))}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1"
                maxLength={2000}
              />
              <Button onClick={handleSend} size="icon" disabled={!newMessage.trim() || newMessage.length > 2000}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
