import "./_group.css";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Bot, Circle, Send, Sparkles, X } from "lucide-react";

const INITIAL_REPLY =
  "Hi! I'm Trivenix Partners' AI assistant. I can answer questions about our services, how we work, pricing philosophy, and more. What would you like to know?";

const SAMPLE_REPLY =
  "Thanks for your question. Our team can help you choose the right service and prepare a quote.";

const SUGGESTIONS = [
  "What does the studio do?",
  "How do projects get started?",
];

type Message = {
  role: "user" | "assistant";
  text: string;
};

export function Frosted() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: INITIAL_REPLY },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendText = (value: string) => {
    const message = value.trim();
    if (!message) return;
    setMessages((current) => [
      ...current,
      { role: "user", text: message },
      { role: "assistant", text: SAMPLE_REPLY },
    ]);
    setInput("");
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendText(input);
  };

  return (
    <div className="tp-chat-stage">
      <div className="tp-chat-backdrop" aria-hidden="true">
        <div className="tp-chat-orb tp-chat-orb-one" />
        <div className="tp-chat-orb tp-chat-orb-two" />
        <div className="tp-chat-page">
          <div className="tp-chat-wordmark">
            <span className="tp-chat-monogram">T<span>/</span>P</span>
            <span className="tp-chat-brand-name">TRIVENIX<br />PARTNERS</span>
          </div>
          <div className="tp-chat-edition">INDEPENDENT CREATIVE STUDIO <span>·</span> WORLDWIDE</div>
          <h1>Make good work<br />matter everywhere.</h1>
          <p>Ideas, identity, and digital experiences for a world in motion.</p>
          <div className="tp-chat-page-link">A conversation starts here <ArrowUpRight aria-hidden="true" /></div>
        </div>
        <div className="tp-chat-background-mark">TP</div>
      </div>

      {isOpen ? (
        <section
          className="tp-chat-panel"
          role="dialog"
          aria-label="Trivenix Assistant"
          aria-modal="false"
        >
          <header className="tp-chat-header">
            <div className="tp-chat-identity">
              <div className="tp-chat-avatar" aria-hidden="true">
                <Sparkles />
              </div>
              <div className="tp-chat-heading">
                <h2>Trivenix Assistant</h2>
                <div className="tp-chat-status">
                  <Circle className="tp-chat-status-dot" aria-hidden="true" />
                  <span>AI <span className="tp-chat-separator">·</span> Informational only</span>
                </div>
              </div>
            </div>
            <button
              className="tp-chat-close"
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
              title="Close assistant"
            >
              <X aria-hidden="true" />
            </button>
          </header>

          <div className="tp-chat-conversation" aria-live="polite" aria-relevant="additions">
            <div className="tp-chat-day-divider"><span>Today</span></div>
            {messages.map((message, index) => (
              <article
                className={`tp-chat-message tp-chat-message-${message.role}`}
                key={`${message.role}-${index}`}
              >
                {message.role === "assistant" ? (
                  <div className="tp-chat-message-avatar" aria-hidden="true"><Bot /></div>
                ) : null}
                <div className="tp-chat-bubble-wrap">
                  {message.role === "assistant" ? (
                    <span className="tp-chat-speaker">TRIVENIX ASSISTANT</span>
                  ) : null}
                  <div className="tp-chat-bubble">
                    <p>{message.text}</p>
                  </div>
                  <span className="tp-chat-time">{message.role === "assistant" ? "Just now" : "You"}</span>
                </div>
              </article>
            ))}
            {messages.length === 1 ? (
              <div className="tp-chat-suggestions" aria-label="Suggested questions">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    className="tp-chat-suggestion"
                    key={suggestion}
                    type="button"
                    onClick={() => sendText(suggestion)}
                  >
                    {suggestion}
                    <ArrowUpRight aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>

          <div className="tp-chat-compose-area">
            <form className="tp-chat-form" onSubmit={sendMessage}>
              <label className="tp-chat-input-label" htmlFor="tp-chat-message">Your message</label>
              <input
                id="tp-chat-message"
                className="tp-chat-input"
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask us anything…"
                autoComplete="off"
                enterKeyHint="send"
              />
              <button
                className="tp-chat-send"
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                title="Send message"
              >
                <Send aria-hidden="true" />
              </button>
            </form>
            <p className="tp-chat-footnote">A quick answer, before the conversation.</p>
          </div>
        </section>
      ) : (
        <button
          className="tp-chat-launcher"
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Trivenix Assistant"
          aria-expanded={false}
        >
          <span className="tp-chat-launcher-icon"><Sparkles aria-hidden="true" /></span>
          <span>Ask Trivenix</span>
          <ArrowUpRight className="tp-chat-launcher-arrow" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
