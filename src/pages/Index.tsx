import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Radar, Cpu, Activity } from "lucide-react";
import ScanInput from "../components/ScanInput";
import ScanProgress from "../components/ScanProgress";
import ScanResults from "../components/ScanResults";

const scanTasks = [
  "Initiating ICMP probe...",
  "Performing TCP handshake analysis...",
  "Extracting service banners...",
  "OS fingerprinting via TTL analysis...",
  "Querying CVE database (NVD, ExploitDB)...",
  "Cross-referencing CISA KEV catalog...",
  "Scanning for open ports...",
  "Checking known C2 server patterns...",
  "Analyzing DNS query patterns...",
  "Detecting persistence mechanisms...",
  "Searching for lateral movement evidence...",
  "Checking for data exfiltration signatures...",
  "Running malware signature matching...",
  "Computing infection confidence score...",
  "Generating threat assessment report...",
];

type AppState = "idle" | "scanning" | "results";

const Index = () => {
  const [state, setState] = useState<AppState>("idle");
  const [target, setTarget] = useState("");
  const [scanPhase, setScanPhase] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");

  const startScan = useCallback((t: string) => {
    setTarget(t);
    setState("scanning");
    setScanPhase(0);
    setScanProgress(0);
  }, []);

  useEffect(() => {
    if (state !== "scanning") return;

    let progress = 0;
    const totalDuration = 6000;
    const interval = 100;
    const increment = 100 / (totalDuration / interval);

    const timer = setInterval(() => {
      progress += increment;
      setScanProgress(Math.min(progress, 100));

      const taskIndex = Math.floor((progress / 100) * scanTasks.length);
      setCurrentTask(scanTasks[Math.min(taskIndex, scanTasks.length - 1)]);

      const phaseIndex = Math.floor((progress / 100) * 6);
      setScanPhase(Math.min(phaseIndex, 5));

      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(() => setState("results"), 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [state]);

  const resetScan = () => {
    setState("idle");
    setTarget("");
    setScanProgress(0);
    setScanPhase(0);
  };

  return (
    <div className="min-h-screen bg-background grid-bg scanline relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        {/* Top bar */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-sm text-foreground tracking-wider">E-SCANV</h1>
                <p className="text-[9px] text-muted-foreground font-code">ADVANCED THREAT HUNTER v3.0</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-code text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-alert-green animate-pulse-glow" />
                SYSTEMS ONLINE
              </div>
              <div className="hidden md:flex items-center gap-1">
                <Activity className="w-3 h-3" />
                THREAT FEEDS: 52 ACTIVE
              </div>
              {state === "results" && (
                <button
                  onClick={resetScan}
                  className="px-3 py-1 border border-primary/30 text-primary hover:bg-primary/10 rounded transition-all"
                >
                  NEW SCAN
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[70vh] space-y-8"
              >
                {/* Hero */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-4"
                >
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center glow-primary">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h1 className="font-display font-black text-4xl md:text-5xl text-foreground text-glow-primary tracking-tight">
                    E-SCANV
                  </h1>
                  <p className="font-display text-lg text-secondary text-glow-secondary">
                    Advanced Threat Hunter
                  </p>
                  <p className="text-sm text-muted-foreground max-w-lg mx-auto font-code">
                    Next-generation AI cybersecurity platform combining vulnerability assessment,
                    intrusion detection, malware analysis, and incident response.
                  </p>
                </motion.div>

                {/* Feature badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap justify-center gap-2 max-w-xl"
                >
                  {[
                    { icon: Radar, label: "Threat Intelligence" },
                    { icon: Cpu, label: "Forensic Analysis" },
                    { icon: Zap, label: "Zero-Day Detection" },
                    { icon: Activity, label: "Real-time Monitoring" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-muted/30 text-[10px] font-code text-muted-foreground"
                    >
                      <Icon className="w-3 h-3 text-primary" />
                      {label}
                    </div>
                  ))}
                </motion.div>

                <ScanInput onScan={startScan} isScanning={false} />

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-3 gap-8 text-center mt-8"
                >
                  {[
                    { value: "50+", label: "Threat Feeds" },
                    { value: "250K+", label: "CVE Database" },
                    { value: "99.7%", label: "Detection Rate" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-2xl font-display font-bold text-primary text-glow-primary">{s.value}</div>
                      <div className="text-[10px] text-muted-foreground font-code mt-1">{s.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {state === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[70vh]"
              >
                <div className="text-center mb-8">
                  <h2 className="font-display font-bold text-xl text-foreground mb-2">
                    SCANNING TARGET: <span className="text-primary">{target}</span>
                  </h2>
                  <p className="text-xs text-muted-foreground font-code">Do not close this window during analysis</p>
                </div>
                <ScanProgress phase={scanPhase} progress={scanProgress} currentTask={currentTask} />
              </motion.div>
            )}

            {state === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ScanResults target={target} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Index;
