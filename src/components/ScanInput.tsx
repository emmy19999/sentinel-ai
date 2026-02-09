import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Terminal } from "lucide-react";

interface ScanInputProps {
  onScan: (target: string) => void;
  isScanning: boolean;
}

const ScanInput = ({ onScan, isScanning }: ScanInputProps) => {
  const [target, setTarget] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (target.trim()) onScan(target.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 mb-2 text-muted-foreground text-xs font-code">
          <Terminal className="w-3 h-3" />
          <span>TARGET ACQUISITION</span>
        </div>
        <div className="relative border-glow rounded-lg overflow-hidden bg-card">
          <div className="flex items-center px-4 py-1 border-b border-border bg-muted/30">
            <Shield className="w-3 h-3 text-primary mr-2" />
            <span className="text-[10px] text-muted-foreground font-code">E-SCANV://THREAT_HUNTER</span>
          </div>
          <div className="flex">
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Enter IP address or domain (e.g., 192.168.1.1)"
              className="flex-1 bg-transparent px-4 py-4 text-foreground font-code text-sm placeholder:text-muted-foreground/50 focus:outline-none"
              disabled={isScanning}
            />
            <button
              type="submit"
              disabled={isScanning || !target.trim()}
              className="px-6 py-4 bg-primary text-primary-foreground font-display font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <span className="flex items-center gap-2">
                  <span className="animate-pulse-glow">●</span> SCANNING
                </span>
              ) : (
                "INITIATE SCAN"
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default ScanInput;
