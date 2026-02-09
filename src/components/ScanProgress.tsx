import { motion } from "framer-motion";
import { Activity, Wifi, Shield, AlertTriangle, Eye, Server } from "lucide-react";

interface ScanProgressProps {
  phase: number;
  progress: number;
  currentTask: string;
}

const phases = [
  { icon: Wifi, label: "CONNECTIVITY", description: "Network reachability check" },
  { icon: Eye, label: "RECONNAISSANCE", description: "OS fingerprinting & banner grab" },
  { icon: Shield, label: "VULNERABILITY SCAN", description: "CVE database correlation" },
  { icon: AlertTriangle, label: "INFECTION ANALYSIS", description: "Malware & IOC detection" },
  { icon: Server, label: "DEEP FORENSICS", description: "Persistence & lateral movement" },
  { icon: Activity, label: "THREAT ASSESSMENT", description: "Final risk calculation" },
];

const ScanProgress = ({ phase, progress, currentTask }: ScanProgressProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-3xl mx-auto space-y-6"
    >
      <div className="border-glow rounded-lg p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs text-muted-foreground font-code">SCAN PROGRESS</div>
          <div className="text-xs text-primary font-code font-bold">{Math.round(progress)}%</div>
        </div>

        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            style={{ boxShadow: "0 0 10px hsl(140 100% 50% / 0.5)" }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {phases.map((p, i) => {
            const Icon = p.icon;
            const isActive = i === phase;
            const isDone = i < phase;
            return (
              <div
                key={i}
                className={`p-3 rounded border transition-all ${
                  isActive
                    ? "border-primary bg-primary/5 glow-primary"
                    : isDone
                    ? "border-primary/30 bg-primary/5"
                    : "border-border bg-muted/20"
                }`}
              >
                <Icon
                  className={`w-4 h-4 mb-1 ${
                    isActive ? "text-primary animate-pulse-glow" : isDone ? "text-primary/60" : "text-muted-foreground/40"
                  }`}
                />
                <div className={`text-[10px] font-code font-bold ${isActive ? "text-primary" : isDone ? "text-primary/60" : "text-muted-foreground/40"}`}>
                  {p.label}
                </div>
                <div className="text-[9px] text-muted-foreground/50">{p.description}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs font-code text-muted-foreground">
          <span className="text-primary animate-terminal-blink">▌</span>
          {currentTask}
        </div>
      </div>
    </motion.div>
  );
};

export default ScanProgress;
