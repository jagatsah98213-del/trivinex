"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, X, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { customFetch, getBaseUrl } from "@workspace/api-client-react";

const INITIAL_REPLY =
  "Hi! I'm Trivenix Partners' AI assistant. I can answer questions about our services, how we work, pricing philosophy, and more. What would you like to know?";

export function AiAssistant({ pageContext }: { pageContext?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
    { role: "assistant", text: INITIAL_REPLY },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const baseUrl = getBaseUrl();

  const sendMessage = useCallback(async () => {
    if (!input.trim() || sending) return;
    const userText = input.trim();
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", text: userText }]);

    try {
      setSending(true);

      const apiUrl = baseUrl ? `${baseUrl}/api/public/ai-chat` : "/api/public/ai-chat";

      const data = await customFetch<{ reply: string }>(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, pageContext }),
        credentials: "include",
      });
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply || "I'm not sure how to answer that. Please contact Trivenix Partners directly." }]);
    } catch (err: any) {
      setError("I'm having trouble connecting right now. Please try our contact page instead.");
      setMessages((prev) => [...prev, { role: "assistant", text: err?.message || "I'm having trouble connecting right now. Please try our contact page instead." }]);
    } finally {
      setSending(false);
    }
  }, [input, sending, pageContext, error, baseUrl]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full sm:w-80 sm:max-w-[400px]">
      {/* Toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="w-12 h-12 rounded-full shadow-lg bg-white text-[#1D1D1F] sm:ml-auto"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </Button>

      {/* Chat panel */}
      {isOpen && (
        <Card className="flex flex-col h-[500px] w-full shadow-2xl border-[#E8E8ED] sm:ml-auto">
          <CardContent className="p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-[#1D1D1F]">Trivenix Assistant</h3>
              <p className="text-xs text-[#6E6E73]">AI · Informational only</p>
            </div>
            <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-2">
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[85%] p-3 rounded-2xl ${
                  m.role === "user"
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-[#F5F5F7] text-[#1D1D1F]"
                }`}>
                  {m.role === "assistant" && (
                    <div className="flex items-center gap-1 mb-1">
                      <Bot className="w-3 h-3 text-blue-600" />
                      <span className="text-xs font-bold text-[#6E6E73] uppercase">Trivenix Assistant</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{m.text}</p>
                </div>
              ))}
              {sending && (
                <div className="mr-auto p-3 bg-[#F5F5F7] text-[#1D1D1F] rounded-2xl animate-pulse">
                  <span className="text-sm">Typing…</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {error && (
              <div className="mb-3 p-2 rounded text-xs text-red-700 bg-red-50 border border-red-100">{error}</div>
            )}
            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about services, pricing, how we work…"
                disabled={sending}
                className="flex-1"
              />
              <Button type="submit" disabled={sending || !input.trim()} size="sm" className="h-9 px-3">
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <div ref={scrollEndRef} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
