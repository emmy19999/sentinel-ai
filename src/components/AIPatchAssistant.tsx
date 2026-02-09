import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Terminal, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_CONTEXT = `You are E-scanV AI Patch Assistant — an expert cybersecurity remediation AI. You help users fix vulnerabilities, remove malware, harden their systems, and respond to incidents.

Current scan findings:
- OpenSSH 7.4 with CVE-2024-6387 (regreSSHion RCE) on port 22
- Apache 2.4.6 on port 80, nginx 1.18 on port 443
- MySQL 5.7.34 publicly exposed on port 3306 (HIGH RISK)
- HTTP-Proxy on port 8080 (unknown version, HIGH RISK)
- Suspicious C2 communication to 185.159.82.142
- Cryptominer XMRig variant detected (82% confidence)
- Cobalt Strike Beacon detected (68% confidence)
- Rootkit artifact at /tmp/.X11-unix/.systemd (95% confidence)
- HTTP/2 Rapid Reset DDoS vulnerability (CVE-2023-44487)

Provide specific, actionable commands. Be concise but thorough. Use code blocks for commands. Always warn about risks before destructive operations.`;

const SUGGESTED_PROMPTS = [
  "How do I remove the XMRig cryptominer?",
  "Walk me through patching CVE-2024-6387",
  "How to secure MySQL port 3306?",
  "Help me investigate the rootkit at /tmp/.X11-unix/",
  "Create a firewall hardening script",
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
        "🛡️ **E-scanV AI Patch Assistant Online**\n\nI've analyzed your scan results and I'm ready to help you remediate the detected threats. I can:\n\n- Guide you through **vulnerability patching**\n- Help **remove detected malware** (XMRig, Cobalt Strike)\n- Assist with **firewall hardening**\n- Investigate **rootkit artifacts**\n\nWhat would you like to fix first?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (will be replaced with real Lovable AI call)
    setTimeout(() => {
      const response = generateLocalResponse(text.trim());
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsLoading(false);
    }, 1500);
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
                <p className="text-[9px] font-code text-muted-foreground">POWERED BY E-SCANV</p>
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

            {/* Suggested prompts (show only at start) */}
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

/** Local response generator — fallback until AI backend is connected */
function generateLocalResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("xmrig") || q.includes("cryptominer") || q.includes("miner")) {
    return `**Removing XMRig Cryptominer**\n\n**Step 1:** Identify the process:\n\`\`\`bash\nps aux | grep -iE '(xmrig|minerd|kworker)' | grep -v grep\n\`\`\`\n\n**Step 2:** Kill the process:\n\`\`\`bash\nkill -9 <PID>\n\`\`\`\n\n**Step 3:** Remove the binary and persistence:\n\`\`\`bash\nfind / -name "xmrig*" -type f 2>/dev/null\nfind / -name ".xmrig*" -type f 2>/dev/null\ncrontab -l | grep -v 'miner\\|xmrig' | crontab -\n\`\`\`\n\n**Step 4:** Block mining pool connections:\n\`\`\`bash\nsudo iptables -A OUTPUT -p tcp --dport 3333 -j DROP\nsudo iptables -A OUTPUT -p tcp --dport 5555 -j DROP\n\`\`\`\n\n⚠️ **Important:** Also check for the Cobalt Strike beacon — miners are often deployed alongside RATs.`;
  }

  if (q.includes("cve-2024-6387") || q.includes("openssh") || q.includes("regresshion")) {
    return `**Patching CVE-2024-6387 (regreSSHion)**\n\nThis is a **critical RCE** in OpenSSH < 9.8.\n\n**Step 1:** Check current version:\n\`\`\`bash\nsshd -V\n\`\`\`\n\n**Step 2:** Update OpenSSH:\n\`\`\`bash\nsudo apt-get update\nsudo apt-get install --only-upgrade openssh-server\n\`\`\`\n\n**Step 3:** If package manager doesn't have 9.8+, build from source:\n\`\`\`bash\nwget https://cdn.openbsd.org/pub/OpenBSD/OpenSSH/portable/openssh-9.8p1.tar.gz\ntar xzf openssh-9.8p1.tar.gz\ncd openssh-9.8p1\n./configure && make && sudo make install\n\`\`\`\n\n**Step 4:** Temporary mitigation (if patching is delayed):\n\`\`\`bash\n# Set LoginGraceTime to 0 in sshd_config\necho "LoginGraceTime 0" | sudo tee -a /etc/ssh/sshd_config\nsudo systemctl restart sshd\n\`\`\`\n\n⚠️ Setting LoginGraceTime to 0 may cause DoS — monitor connections.`;
  }

  if (q.includes("mysql") || q.includes("3306") || q.includes("database")) {
    return `**Securing MySQL Port 3306**\n\n**Step 1:** Block public access:\n\`\`\`bash\nsudo ufw deny 3306\nsudo ufw allow from 10.0.0.0/8 to any port 3306\n\`\`\`\n\n**Step 2:** Bind to localhost only:\n\`\`\`bash\n# Edit /etc/mysql/mysql.conf.d/mysqld.cnf\nbind-address = 127.0.0.1\nsudo systemctl restart mysql\n\`\`\`\n\n**Step 3:** Remove anonymous users:\n\`\`\`sql\nDELETE FROM mysql.user WHERE User='';\nFLUSH PRIVILEGES;\n\`\`\`\n\n**Step 4:** Use SSH tunnel for remote access:\n\`\`\`bash\nssh -L 3306:localhost:3306 user@server\n\`\`\``;
  }

  if (q.includes("rootkit") || q.includes("/tmp") || q.includes(".systemd") || q.includes("investigate")) {
    return `**Investigating Rootkit at /tmp/.X11-unix/.systemd**\n\n⚠️ **Do NOT delete immediately** — preserve evidence first.\n\n**Step 1:** Capture the hash:\n\`\`\`bash\nmd5sum /tmp/.X11-unix/.systemd\nsha256sum /tmp/.X11-unix/.systemd\n\`\`\`\n\n**Step 2:** Check file details:\n\`\`\`bash\nfile /tmp/.X11-unix/.systemd\nstat /tmp/.X11-unix/.systemd\nstrings /tmp/.X11-unix/.systemd | head -50\n\`\`\`\n\n**Step 3:** Check if it's running:\n\`\`\`bash\nlsof /tmp/.X11-unix/.systemd\nps aux | grep systemd | grep -v /usr\n\`\`\`\n\n**Step 4:** Run rootkit scanners:\n\`\`\`bash\nsudo apt-get install rkhunter chkrootkit\nrkhunter --checkall\nchkrootkit\n\`\`\`\n\n**Step 5:** Quarantine and remove:\n\`\`\`bash\nmkdir -p /forensics/quarantine\ncp /tmp/.X11-unix/.systemd /forensics/quarantine/\nrm -f /tmp/.X11-unix/.systemd\n\`\`\``;
  }

  if (q.includes("firewall") || q.includes("harden") || q.includes("script")) {
    return `**Firewall Hardening Script**\n\n\`\`\`bash\n#!/bin/bash\n# E-scanV Firewall Hardening Script\nset -e\n\necho "[*] Resetting firewall rules..."\nsudo ufw --force reset\n\n# Default policies\nsudo ufw default deny incoming\nsudo ufw default allow outgoing\n\n# Allow SSH (restrict to your IP)\nsudo ufw allow from YOUR_IP to any port 22\n\n# Allow HTTP/HTTPS\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\n\n# Block known malicious IPs\nsudo ufw deny from 185.159.82.142\n\n# Block common attack ports\nsudo ufw deny 3306  # MySQL\nsudo ufw deny 8080  # HTTP-Proxy\n\n# Enable\nsudo ufw --force enable\n\necho "[+] Firewall hardened successfully"\nsudo ufw status verbose\n\`\`\`\n\nSave as \`harden.sh\`, run with \`sudo bash harden.sh\`. Replace YOUR_IP with your management IP.`;
  }

  return `I can help with that. Based on the scan results, here are the key areas I can assist with:\n\n1. **Malware Removal** — XMRig cryptominer and Cobalt Strike beacon\n2. **Vulnerability Patching** — CVE-2024-6387 (OpenSSH), CVE-2023-44487 (HTTP/2)\n3. **Access Control** — MySQL exposure, HTTP-Proxy hardening\n4. **Forensics** — Rootkit investigation at /tmp/.X11-unix/\n5. **Monitoring** — Audit logging and EDR deployment\n\nAsk me about any specific issue and I'll provide step-by-step commands to fix it.`;
}

export default AIPatchAssistant;
