import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Circle, ChevronRight, Terminal, Copy, Check, Shield } from "lucide-react";

interface Step {
  title: string;
  description: string;
  command?: string;
  priority: "IMMEDIATE" | "URGENT" | "HIGH" | "MEDIUM";
  details: string[];
}

const remediationSteps: Step[] = [
  {
    title: "Block Malicious Outbound Traffic",
    description: "Immediately block communication to known C2 server at 185.159.82.142",
    command: "sudo iptables -A OUTPUT -d 185.159.82.142 -j DROP\nsudo iptables -A INPUT -s 185.159.82.142 -j DROP",
    priority: "IMMEDIATE",
    details: [
      "Prevents active data exfiltration",
      "Cuts C2 communication channel",
      "Verify with: netstat -an | grep 185.159.82.142",
    ],
  },
  {
    title: "Patch OpenSSH (CVE-2024-6387)",
    description: "Critical RCE vulnerability — upgrade OpenSSH to version 9.8+",
    command: "sudo apt-get update\nsudo apt-get install --only-upgrade openssh-server\nsshd -V  # Verify version",
    priority: "URGENT",
    details: [
      "regreSSHion allows unauthenticated remote code execution",
      "Affects OpenSSH < 9.8 on glibc-based Linux",
      "Test in staging before production deployment",
    ],
  },
  {
    title: "Restrict MySQL Access",
    description: "Port 3306 is exposed — restrict to trusted IPs only",
    command: "sudo ufw deny 3306\nsudo ufw allow from 10.0.0.0/8 to any port 3306\nsudo ufw reload",
    priority: "HIGH",
    details: [
      "MySQL should never be publicly accessible",
      "Use SSH tunneling for remote access",
      "Consider switching to socket authentication",
    ],
  },
  {
    title: "Investigate Rootkit Artifacts",
    description: "Suspicious file detected at /tmp/.X11-unix/.systemd (95% confidence)",
    command: "ls -la /tmp/.X11-unix/\nfile /tmp/.X11-unix/.systemd\nmd5sum /tmp/.X11-unix/.systemd\nrkhunter --checkall",
    priority: "HIGH",
    details: [
      "Hidden binary in temp directory is a strong rootkit indicator",
      "Capture hash for threat intel lookup before removal",
      "Run rkhunter and chkrootkit for comprehensive scan",
    ],
  },
  {
    title: "Enable Comprehensive Audit Logging",
    description: "Deploy audit rules for monitoring critical system changes",
    command: "sudo apt-get install auditd\nsudo systemctl enable auditd\nsudo auditctl -w /etc/passwd -p wa -k identity\nsudo auditctl -w /etc/shadow -p wa -k identity",
    priority: "MEDIUM",
    details: [
      "Tracks file modifications to critical system files",
      "Enables forensic timeline reconstruction",
      "Forward logs to SIEM for correlation",
    ],
  },
  {
    title: "Deploy EDR Solution",
    description: "Install endpoint detection and response for real-time monitoring",
    command: "# Example with OSSEC:\nwget https://github.com/ossec/ossec-hids/releases/latest\nsudo ./install.sh\nsudo /var/ossec/bin/ossec-control start",
    priority: "MEDIUM",
    details: [
      "Provides real-time file integrity monitoring",
      "Detects anomalous process behavior",
      "Integrates with threat intelligence feeds",
    ],
  },
];

const priorityColors: Record<string, string> = {
  IMMEDIATE: "text-alert-red",
  URGENT: "text-alert-orange",
  HIGH: "text-alert-yellow",
  MEDIUM: "text-alert-blue",
};

const priorityBg: Record<string, string> = {
  IMMEDIATE: "bg-alert-red/10 border-alert-red/30",
  URGENT: "bg-alert-orange/10 border-alert-orange/30",
  HIGH: "bg-alert-yellow/10 border-alert-yellow/30",
  MEDIUM: "bg-alert-blue/10 border-alert-blue/30",
};

const RemediationGuide = ({ onOpenAI }: { onOpenAI: () => void }) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const toggleComplete = (index: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const copyCommand = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const progress = (completedSteps.size / remediationSteps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="border-glow rounded-lg p-6 bg-card liquid-bg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-lg liquid-text">REMEDIATION GUIDE</h2>
          </div>
          <button
            onClick={onOpenAI}
            className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-code hover:bg-primary/20 transition-all glow-primary flex items-center gap-2"
          >
            <Terminal className="w-3 h-3" />
            AI PATCH ASSISTANT
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(140 100% 50%), hsl(185 100% 45%))",
                backgroundSize: "200% 100%",
                animation: "liquid-flow 3s ease-in-out infinite",
              }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-xs font-code text-primary">
            {completedSteps.size}/{remediationSteps.length}
          </span>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {remediationSteps.map((step, i) => {
          const isCompleted = completedSteps.has(i);
          const isExpanded = expandedStep === i;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-lg border bg-card overflow-hidden transition-all ${
                isCompleted ? "border-primary/30 opacity-60" : priorityBg[step.priority]
              }`}
            >
              {/* Step header */}
              <button
                onClick={() => setExpandedStep(isExpanded ? null : i)}
                className="w-full flex items-center gap-3 p-4 text-left"
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleComplete(i); }}
                  className="shrink-0"
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-code font-bold ${priorityColors[step.priority]}`}>
                      {step.priority}
                    </span>
                    <span className="text-[10px] font-code text-muted-foreground">
                      STEP {i + 1}
                    </span>
                  </div>
                  <div className={`text-sm font-display font-bold ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {step.title}
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pl-12 space-y-3">
                      <p className="text-xs text-muted-foreground">{step.description}</p>

                      {step.command && (
                        <div className="relative rounded bg-background border border-border p-3">
                          <button
                            onClick={() => copyCommand(step.command!, i)}
                            className="absolute top-2 right-2 p-1 rounded hover:bg-muted transition-colors"
                          >
                            {copiedIndex === i ? (
                              <Check className="w-3 h-3 text-primary" />
                            ) : (
                              <Copy className="w-3 h-3 text-muted-foreground" />
                            )}
                          </button>
                          <pre className="text-[11px] font-code text-primary whitespace-pre-wrap pr-8">
                            {step.command}
                          </pre>
                        </div>
                      )}

                      <ul className="space-y-1">
                        {step.details.map((d, j) => (
                          <li key={j} className="text-[11px] font-code text-muted-foreground flex items-start gap-2">
                            <span className="text-primary mt-0.5">▸</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RemediationGuide;
