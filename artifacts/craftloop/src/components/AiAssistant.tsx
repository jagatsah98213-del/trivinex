"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customFetch } from "@workspace/api-client-react";

const INITIAL_REPLY =
  "Hi! I'm Trivenix Partners' AI assistant. I can answer questions about our services, how we work, pricing philosophy, and more. What would you like to know?";

type ChatMessage = { role: "user" | "assistant"; text: string };

export function AiAssistant({
  pageContext,
  onOpenChange,
}: {
  pageContext?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: INITIAL_REPLY },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    if (!isOpen || !messagesContainerRef.current) return;
    const container = messagesContainerRef.current;
    requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    });
  }, [isOpen, messages, sending]);

  const sendMessage = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const userText = input.trim();
      if (!userText || sending) return;

      setInput("");
      setError(null);
      setMessages((previous) => [...previous, { role: "user", text: userText }]);
      setSending(true);

      try {
        const data = await customFetch<{ reply: string }>("/api/public/ai-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userText, pageContext }),
          credentials: "include",
        });
        setMessages((previous) => [
          ...previous,
          {
            role: "assistant",
            text:
              data.reply ||
              "I'm not sure how to answer that. Please contact Trivenix Partners directly.",
          },
        ]);
      } catch {
        setError(
          "I couldn't connect just now. Please try again or contact our team directly.",
        );
      } finally {
        setSending(false);
      }
    },
    [input, sending, pageContext],
  );

  return (
    <div
      className="fixed right-4 z-50 flex w-[min(25rem,calc(100vw-2rem))] flex-col items-end gap-3"
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      {isOpen && (
        <section
          role="dialog"
          aria-label="Trivenix Assistant"
          className="flex w-full min-w-0 flex-col overflow-hidden rounded-[1.75rem] border border-white/65 text-[#1D1D1F] shadow-[0_24px_80px_rgba(18,35,70,0.24)] ring-1 ring-black/[0.04]"
          style={{
            height:
              "min(34rem, calc(100dvh - 6.25rem - env(safe-area-inset-bottom, 0px)))",
            background: "rgba(248, 250, 255, 0.74)",
            backdropFilter: "blur(30px) saturate(185%)",
            WebkitBackdropFilter: "blur(30px) saturate(185%)",
          }}
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-white/70 bg-white/35 px-4 py-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-900/15">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold tracking-tight">
                Trivenix Assistant
              </h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#667085]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                AI · Informational only
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full text-[#667085] hover:bg-white/70 hover:text-[#1D1D1F]"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </Button>
          </header>

          <div
            ref={messagesContainerRef}
            aria-live="polite"
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 [scrollbar-width:thin]"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] break-words rounded-[1.35rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === "user"
                      ? "rounded-br-md bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-900/10"
                      : "rounded-bl-md border border-white/75 bg-white/65 text-[#252B37]"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">
                      <Bot className="h-3 w-3" />
                      Trivenix Assistant
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start" aria-label="Assistant is responding">
                <div className="rounded-[1.35rem] rounded-bl-md border border-white/75 bg-white/65 px-4 py-3 text-sm text-[#667085]">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                    Thinking…
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-white/70 bg-white/35 p-3">
            {error && (
              <p className="mb-2 px-1 text-xs leading-relaxed text-red-700" role="alert">
                {error}
              </p>
            )}
            <form onSubmit={sendMessage} className="flex min-w-0 items-center gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about our services…"
                aria-label="Message the Trivenix assistant"
                autoComplete="off"
                enterKeyHint="send"
                disabled={sending}
                className="h-11 min-w-0 flex-1 rounded-2xl border-white/80 bg-white/75 px-4 text-base shadow-sm placeholder:text-[#8A91A0] focus-visible:ring-blue-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={sending || !input.trim()}
                aria-label="Send message"
                className="h-11 w-11 shrink-0 rounded-2xl bg-[#2563EB] text-white shadow-md shadow-blue-900/15 transition hover:bg-[#1D4ED8] disabled:opacity-45"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-2 text-center text-[10px] text-[#778092]">
              Please don&apos;t share sensitive information.
            </p>
          </div>
        </section>
      )}

      <Button
        type="button"
        size="icon"
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="h-14 w-14 rounded-full border border-white/60 text-white shadow-[0_8px_28px_rgba(26,52,100,0.32)] ring-1 ring-black/[0.04] transition hover:scale-[1.04]"
        style={{
          background: "rgba(43, 91, 214, 0.88)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
      </Button>
    </div>
  );
}
