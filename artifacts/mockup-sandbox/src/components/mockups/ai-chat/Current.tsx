import "./_group.css";

import { useState } from "react";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const INITIAL_REPLY =
  "Hi! I'm Trivenix Partners' AI assistant. I can answer questions about our services, how we work, pricing philosophy, and more. What would you like to know?";

export function Current() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([{ role: "assistant", text: INITIAL_REPLY }]);
  const [input, setInput] = useState("");

  const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = input.trim();
    if (!message) return;
    setMessages((current) => [
      ...current,
      { role: "user", text: message },
      {
        role: "assistant",
        text: "Thanks for your question. Our team can help you choose the right service and prepare a quote.",
      },
    ]);
    setInput("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-full flex-col gap-2 sm:w-80 sm:max-w-[400px]">
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full bg-white text-[#1D1D1F] shadow-lg sm:ml-auto"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <Card className="flex h-[500px] w-full flex-col border-[#E8E8ED] shadow-2xl sm:ml-auto">
          <CardContent className="flex flex-col p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-bold text-[#1D1D1F]">Trivenix Assistant</h3>
              <p className="text-xs text-[#6E6E73]">AI · Informational only</p>
            </div>
            <div className="mb-3 flex-1 space-y-3 overflow-y-auto pr-2">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    message.role === "user"
                      ? "ml-auto bg-blue-600 text-white"
                      : "mr-auto bg-[#F5F5F7] text-[#1D1D1F]"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="mb-1 flex items-center gap-1">
                      <Bot className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-bold uppercase text-[#6E6E73]">
                        Trivenix Assistant
                      </span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about services, pricing, how we work…"
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!input.trim()}
                size="sm"
                className="h-9 px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
