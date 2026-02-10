import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Radar, Cpu, Activity } from "lucide-react";
import ScanInput from "../components/ScanInput";
import ScanProgress from "../components/ScanProgress";
import ScanResults from "../components/ScanResults";
import RemediationGuide from "../components/RemediationGuide";
import AIPatchAssistant from "../components/AIPatchAssistant";
import { useRealScan } from "../hooks/useRealScan";

type AppState = "idle" | "scanning" | "results" | "remediation";

const Index = () => {
  const [appState, setAppState] = useState<AppState>("idle");
  const [aiOpen, setAiOpen] = useState(false);
  const realScan = useRealScan();

  const handleStartScan = (target: string) => {
    setAppState("scanning");
    realScan.startScan(target);
  };

  // Watch for scan completion
  const prevState = realScan.scanState;
  if (prevState === "completed" && appState === "scanning") {
    setAppState("results");
  }
  if (prevState === "error" && appState === "scanning") {
    setAppState("idle");
  }

  const resetScan = () => {
    setAppState("idle");
    realScan.reset();
  };

  const target = realScan.scanResult?.target || "";

  return (
    <div className="min-h-screen bg-background grid-bg scanline relative overflow-hidden">
      {/* Liquid ambient blobs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full pointer-events-none animate-liquid-pulse" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full pointer-events-none animate-liquid-pulse" style={{ animationDelay: "3s" }} />
      <div className="fixed top-1/2 left-0 w-[300px] h-[300px] bg-primary/3 rounded-full pointer-events-none animate-liquid-morph" />

      <div className="relative z-10">
        {/* Top bar */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center glow-primary">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-sm liquid-text tracking-wider">E-SCANV</h1>
                <p className="text-[9px] text-muted-foreground font-code">ADVANCED THREAT HUNTER v3.0 — LIVE SCANNING</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-code text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-alert-green animate-pulse-glow" />
                SYSTEMS ONLINE
              </div>
              <div className="hidden md:flex items-center gap-1">
                <Activity className="w-3 h-3" />
                HOSTEDSCAN: CONNECTED
              </div>
              {appState === "results" && (
                <button
                  onClick={() => setAppState("remediation")}
                  className="px-3 py-1 border border-secondary/30 text-secondary hover:bg-secondary/10 rounded transition-all text-[10px] font-code"
                >
                  FIX GUIDE
                </button>
              )}
              {(appState === "results" || appState === "remediation") && (
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
            {appState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[70vh] space-y-8"
              >
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
                  <h1 className="font-display font-black text-4xl md:text-5xl liquid-text tracking-tight">
                    E-SCANV
                  </h1>
                  <p className="font-display text-lg liquid-text">
                    Advanced Threat Hunter
                  </p>
                  <p className="text-sm text-muted-foreground max-w-lg mx-auto font-code">
                    Real-time vulnerability scanning powered by HostedScan. Enter an IP or domain to
                    run a live NMAP scan with CVE detection and risk assessment.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-wrap justify-center gap-2 max-w-xl"
                >
                  {[
                    { icon: Radar, label: "Live NMAP Scanning" },
                    { icon: Cpu, label: "CVE Detection" },
                    { icon: Zap, label: "Risk Assessment" },
                    { icon: Activity, label: "AI Remediation" },
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

                <ScanInput onScan={handleStartScan} isScanning={false} />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-3 gap-8 text-center mt-8"
                >
                  {[
                    { value: "NMAP", label: "Scan Engine" },
                    { value: "REAL", label: "Live Results" },
                    { value: "AI", label: "Patch Assistant" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="text-2xl font-display font-bold text-primary text-glow-primary">{s.value}</div>
                      <div className="text-[10px] text-muted-foreground font-code mt-1">{s.label}</div>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {appState === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[70vh]"
              >
                <div className="text-center mb-8">
                  <h2 className="font-display font-bold text-xl text-foreground mb-2">
                    LIVE SCANNING: <span className="text-primary">{realScan.scanResult?.target || "..."}</span>
                  </h2>
                  <p className="text-xs text-muted-foreground font-code">
                    Real vulnerability scan in progress via HostedScan API
                  </p>
                </div>
                <ScanProgress
                  phase={Math.min(Math.floor((realScan.scanProgress / 100) * 6), 5)}
                  progress={realScan.scanProgress}
                  currentTask={realScan.currentTask}
                />
              </motion.div>
            )}

            {appState === "results" && realScan.scanResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ScanResults target={target} realData={realScan.scanResult} />
                <div className="flex justify-center mt-6 gap-4">
                  <button
                    onClick={() => setAppState("remediation")}
                    className="px-6 py-3 rounded-lg bg-primary/10 border border-primary/30 text-primary font-display font-bold text-sm hover:bg-primary/20 transition-all glow-primary liquid-border"
                  >
                    VIEW STEP-BY-STEP FIX GUIDE →
                  </button>
                  <button
                    onClick={() => setAiOpen(true)}
                    className="px-6 py-3 rounded-lg bg-secondary/10 border border-secondary/30 text-secondary font-display font-bold text-sm hover:bg-secondary/20 transition-all glow-secondary liquid-border"
                  >
                    ASK AI TO FIX →
                  </button>
                </div>
              </motion.div>
            )}

            {appState === "remediation" && (
              <motion.div
                key="remediation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <RemediationGuide
                  onOpenAI={() => setAiOpen(true)}
                  realRisks={realScan.scanResult?.risks}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AIPatchAssistant
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        scanFindings={realScan.scanResult?.risks}
      />
    </div>
  );
};

export default Index;
