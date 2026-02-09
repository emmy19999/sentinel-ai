import { motion } from "framer-motion";

interface ThreatLevelProps {
  level: number; // 1-5
  label: string;
  color: string;
  isActive: boolean;
}

const levelConfig: Record<number, { label: string; colorClass: string; bgClass: string }> = {
  5: { label: "CONFIRMED ACTIVE INFECTION", colorClass: "text-alert-red", bgClass: "bg-alert-red" },
  4: { label: "HIGH LIKELIHOOD", colorClass: "text-alert-orange", bgClass: "bg-alert-orange" },
  3: { label: "SUSPICIOUS ACTIVITY", colorClass: "text-alert-yellow", bgClass: "bg-alert-yellow" },
  2: { label: "COMPROMISE INDICATORS", colorClass: "text-alert-blue", bgClass: "bg-alert-blue" },
  1: { label: "CLEAN", colorClass: "text-alert-green", bgClass: "bg-alert-green" },
};

const ThreatLevelIndicator = ({ level }: { level: number }) => {
  const config = levelConfig[level] || levelConfig[1];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-glow rounded-lg p-4 bg-card"
    >
      <div className="text-[10px] text-muted-foreground mb-2 font-code">THREAT LEVEL</div>
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full ${config.bgClass} animate-pulse-glow`} />
        <div>
          <div className={`text-lg font-display font-bold ${config.colorClass}`}>
            LEVEL {level}
          </div>
          <div className="text-xs text-muted-foreground font-code">{config.label}</div>
        </div>
      </div>
      <div className="flex gap-1 mt-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i <= level ? config.bgClass : "bg-muted"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ThreatLevelIndicator;
