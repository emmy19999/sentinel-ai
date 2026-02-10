import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Terminal, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-patch-assistant`;

const SUGGESTED_PROMPTS = [
  "How do I remove the XMRig cryptominer?",
  "Walk me through patching CVE-2024-6387",
  "How to secure MySQL port 3306?",
  "Help me investigate the rootkit at /tmp/.X11-unix/",
  "Create a firewall hardening script",
  "Generate a complete remediation script for all findings",
];

interface AIPatchAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIPatchAssistant = ({ isOpen, onClose }: AIPatchAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "🛡️ **E-scanV AI Patch Assistant Online**\n\nI've analyzed your scan results and I'm ready to help you remediate the detected threats. I can:\n\n- Guide you through **vulnerability patching**\n- Help **remove detected malware** (XMRig, Cobalt Strike)\n- Assist with **firewall hardening**\n- Investigate **rootkit artifacts**\n- Generate **automated remediation scripts**\n\nWhat would you like to fix first?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const streamChat = useCallback(async (allMessages: Message[]) => {
    abortRef.current = new AbortController();

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: allMessages }),
      signal: abortRef.current.signal,
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({ error: "Request failed" }));
      if (resp.status === 429) {
        toast.error("Rate limit exceeded. Please wait a moment.");
      } else if (resp.status === 402) {
        toast.error("AI credits exhausted. Please add credits in Settings.");
      }
      throw new Error(errData.error || "AI request failed");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";
    let streamDone = false;

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      const content = assistantSoFar;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
        }
        return [...prev, { role: "assistant", content }];
      });
    };

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { streamDone = true; break; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) upsert(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // flush remaining
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) upsert(content);
        } catch { /* ignore */ }
      }
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(newMessages);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error("AI chat error:", e);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "⚠️ **Error:** Failed to get AI response. Please try again." },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full md:w-[480px] z-50 flex flex-col bg-card border-l border-border shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-foreground">AI PATCH ASSISTANT</h3>
                <p className="text-[9px] font-code text-primary">● LIVE AI — STREAMING</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg p-3 text-xs font-code ${
                    msg.role === "user"
                      ? "bg-primary/10 border border-primary/30 text-foreground"
                      : "bg-muted/30 border border-border text-foreground/90"
                  }`}
                >
                  <MessageContent content={msg.content} />
                </div>
                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded bg-muted border border-border flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3 h-3 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                <div className="w-6 h-6 rounded bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3 text-primary" />
                </div>
                <div className="bg-muted/30 border border-border rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 text-primary animate-spin" />
                  <span className="text-[10px] font-code text-muted-foreground">Analyzing...</span>
                </div>
              </motion.div>
            )}

            {/* Suggested prompts */}
            {messages.length <= 1 && (
              <div className="space-y-2 pt-2">
                <p className="text-[10px] font-code text-muted-foreground">SUGGESTED ACTIONS:</p>
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="w-full text-left px-3 py-2 rounded border border-border hover:border-primary/30 hover:bg-primary/5 text-[11px] font-code text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Terminal className="w-3 h-3 inline mr-2 text-primary" />
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about patching, hardening, removal..."
                className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2 text-xs font-code text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/** Simple markdown-like renderer */
const MessageContent = ({ content }: { content: string }) => {
  const parts = content.split(/(```[\s\S]*?```|\*\*.*?\*\*|\n)/g);
  return (
    <div className="space-y-1 leading-relaxed">
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const code = part.replace(/```\w*\n?/g, "").replace(/```$/, "");
          return (
            <pre key={i} className="bg-background border border-border rounded p-2 text-[10px] text-primary whitespace-pre-wrap my-2 overflow-x-auto">
              {code}
            </pre>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i} className="text-foreground font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part === "\n") return <br key={i} />;
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

export default AIPatchAssistant;
