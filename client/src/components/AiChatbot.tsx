import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  recommendedProducts?: any[];
}

export function AiChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", {
        message,
        sessionId,
        visitorId: getVisitorId(),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.message,
        recommendedProducts: data.recommendedProducts,
      }]);
    },
  });

  const getVisitorId = () => {
    let visitorId = localStorage.getItem("healthywaze_visitor_id");
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem("healthywaze_visitor_id", visitorId);
    }
    return visitorId;
  };

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    chatMutation.mutate(userMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
        data-testid="button-open-chatbot"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-3rem)] shadow-xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-3 px-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">Wellness Advisor</CardTitle>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          data-testid="button-close-chatbot"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/40" />
              <p className="text-sm">
                Hi! I'm your wellness advisor. How can I help you find the right natural products today?
              </p>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index}>
                <div
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                    data-testid={`chat-message-${msg.role}-${index}`}
                  >
                    {msg.content}
                  </div>
                </div>

                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="mt-2 ml-2 space-y-2">
                    <p className="text-xs text-muted-foreground">Recommended products:</p>
                    {msg.recommendedProducts.map((product: any) => (
                      <Link key={product.id} href={`/product/${product.id}`}>
                        <div
                          className="flex items-center gap-2 p-2 rounded-md bg-background border hover-elevate cursor-pointer"
                          data-testid={`recommended-product-${product.id}`}
                        >
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{product.name}</p>
                            <p className="text-xs text-primary">${product.price}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about wellness products..."
              disabled={chatMutation.isPending}
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              size="icon"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
