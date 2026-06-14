import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHouseholdStore } from '@/stores/household-store';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/new-ui/input';
import { ArrowLeft, Send, Sparkles, ShoppingCart, Package, AlertTriangle, TrendingDown } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const suggestions = [
  { label: 'What’s running low?', icon: AlertTriangle },
  { label: 'What should I buy this week?', icon: ShoppingCart },
  { label: 'Do we have enough toilet paper?', icon: Package },
  { label: 'What’s running out next week?', icon: TrendingDown },
];

export default function NewAIChatPage() {
  const { currentHousehold, currentHousehold: household } = useHouseholdStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (message?: string) => {
    const msg = message || input.trim();
    if (!msg || !currentHousehold) return;

    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post(`/ai/${currentHousehold.id}/chat`, { message: msg });
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.message }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I’m having trouble connecting. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 safe-top bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-secondary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full ai-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">HomeStock AI</h1>
              <p className="text-xs text-muted-foreground">Ask about {household?.name || 'your home'}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl ai-gradient flex items-center justify-center mb-4 shadow-glow">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ask me anything</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              I can check stock levels, suggest shopping items, and help manage your household inventory.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSend(s.label)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border border-border/50 text-left text-sm hover:shadow-card transition-all"
                >
                  <s.icon className="w-4 h-4 text-primary" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full ai-gradient flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-card border border-border/50 rounded-bl-md'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full ai-gradient flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-muted-foreground">
                  <span className="animate-pulse-soft">Thinking...</span>
                </div>
              </div>
            )}
          </>
        )}

      </div>

      <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 safe-bottom">
        <div className="flex gap-2 max-w-2xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask HomeStock..."
            className="flex-1 rounded-full px-5"
            disabled={isLoading}
          />
          <Button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="rounded-full w-12 h-12 p-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
