import { motion } from "framer-motion";
import ThreatLevelIndicator from "./ThreatLevelIndicator";
import { Shield, Globe, Clock, Hash, AlertTriangle, FileWarning, Network, Terminal, Lock, Bug } from "lucide-react";
import type { RealScanResult, ScanRisk } from "../hooks/useRealScan";

const riskColors: Record<string, string> = {
  CRITICAL: "text-alert-red",
  HIGH: "text-alert-orange",
  MEDIUM: "text-alert-yellow",
  LOW: "text-alert-green",
  INFO: "text-muted-foreground",
};

const severityBg: Record<string, string> = {
  CRITICAL: "bg-alert-red/20 text-alert-red",
  HIGH: "bg-alert-orange/20 text-alert-orange",
  MEDIUM: "bg-alert-yellow/20 text-alert-yellow",
  LOW: "bg-alert-green/20 text-alert-green",
  INFO: "bg-muted text-muted-foreground",
};

function computeThreatLevel(risks: ScanRisk[]): number {
  const hasCritical = risks.some((r) => r.severity === "CRITICAL");
  const hasHigh = risks.some((r) => r.severity === "HIGH");
  const hasMedium = risks.some((r) => r.severity === "MEDIUM");
  if (hasCritical) return 4;
  if (hasHigh) return 3;
  if (hasMedium) return 2;
  if (risks.length > 0) return 1;
  return 0;
}

function computeConfidence(risks: ScanRisk[]): number {
  if (risks.length === 0) return 100;
  const hasCVE = risks.some((r) => r.cve);
  const hasCVSS = risks.some((r) => r.cvss_score);
  let base = 70;
  if (hasCVE) base += 15;
  if (hasCVSS) base += 10;
  return Math.min(base, 98);
}

function getInfectionStatus(level: number): string {
  if (level >= 4) return "CRITICAL VULNERABILITIES DETECTED";
  if (level >= 3) return "HIGH RISK — IMMEDIATE ACTION REQUIRED";
  if (level >= 2) return "MODERATE RISK — REVIEW RECOMMENDED";
  if (level >= 1) return "LOW RISK — MINOR ISSUES FOUND";
  return "CLEAN — NO SIGNIFICANT ISSUES";
}

// Extract unique open ports from risks
function extractPorts(risks: ScanRisk[]): { port: number; service: string; protocol: string; severity: string }[] {
  const portsMap = new Map<number, { port: number; service: string; protocol: string; severity: string }>();
  for (const r of risks) {
    if (r.port && !portsMap.has(r.port)) {
      portsMap.set(r.port, {
        port: r.port,
        service: r.service || "unknown",
        protocol: r.protocol || "tcp",
        severity: r.severity,
      });
    }
  }
  return Array.from(portsMap.values()).sort((a, b) => a.port - b.port);
}

const ScanResults = ({ target, realData }: { target: string; realData?: RealScanResult }) => {
  const risks = realData?.risks || [];
  const threatLevel = computeThreatLevel(risks);
  const confidence = computeConfidence(risks);
  const infectionStatus = getInfectionStatus(threatLevel);
  const ports = extractPorts(risks);

  const criticalRisks = risks.filter((r) => r.severity === "CRITICAL");
  const highRisks = risks.filter((r) => r.severity === "HIGH");
  const mediumRisks = risks.filter((r) => r.severity === "MEDIUM");
  const lowRisks = risks.filter((r) => r.severity === "LOW" || r.severity === "INFO");

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={item} className="border-glow rounded-lg p-6 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-lg liquid-text">LIVE THREAT ASSESSMENT REPORT</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-code">
          <div>
            <div className="text-muted-foreground mb-1">TARGET</div>
            <div className="text-foreground flex items-center gap-1"><Globe className="w-3 h-3" />{target}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">SCAN ID</div>
            <div className="text-foreground flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {realData?.scanId ? realData.scanId.slice(0, 12).toUpperCase() : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">TIMESTAMP</div>
            <div className="text-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {realData?.completedAt ? new Date(realData.completedAt).toLocaleString() : new Date().toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">TOTAL FINDINGS</div>
            <div className="text-primary font-bold">{risks.length}</div>
          </div>
        </div>
      </motion.div>

      {/* Threat Level + Status */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ThreatLevelIndicator level={threatLevel} />
        <div className="border-glow rounded-lg p-4 bg-card">
          <div className="text-[10px] text-muted-foreground mb-2 font-code">STATUS</div>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${threatLevel >= 3 ? "text-alert-red" : threatLevel >= 2 ? "text-alert-yellow" : "text-alert-green"}`} />
            <span className={`font-display font-bold ${threatLevel >= 3 ? "liquid-text-warm" : "liquid-text"}`}>
              {infectionStatus}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3">
            <div className="text-center p-2 rounded bg-alert-red/10 border border-alert-red/20">
              <div className="text-lg font-bold text-alert-red">{criticalRisks.length}</div>
              <div className="text-[9px] font-code text-alert-red">CRITICAL</div>
            </div>
            <div className="text-center p-2 rounded bg-alert-orange/10 border border-alert-orange/20">
              <div className="text-lg font-bold text-alert-orange">{highRisks.length}</div>
              <div className="text-[9px] font-code text-alert-orange">HIGH</div>
            </div>
            <div className="text-center p-2 rounded bg-alert-yellow/10 border border-alert-yellow/20">
              <div className="text-lg font-bold text-alert-yellow">{mediumRisks.length}</div>
              <div className="text-[9px] font-code text-alert-yellow">MEDIUM</div>
            </div>
            <div className="text-center p-2 rounded bg-alert-green/10 border border-alert-green/20">
              <div className="text-lg font-bold text-alert-green">{lowRisks.length}</div>
              <div className="text-[9px] font-code text-alert-green">LOW</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Open Ports */}
      {ports.length > 0 && (
        <motion.div variants={item} className="border-glow rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Network className="w-4 h-4 text-secondary" />
            <span className="text-xs font-code text-muted-foreground">DISCOVERED PORTS & SERVICES</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-code">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="text-left py-2 px-2">PORT</th>
                  <th className="text-left py-2 px-2">PROTOCOL</th>
                  <th className="text-left py-2 px-2">SERVICE</th>
                  <th className="text-left py-2 px-2">RISK</th>
                </tr>
              </thead>
              <tbody>
                {ports.map((p) => (
                  <tr key={p.port} className="border-b border-border/30 hover:bg-muted/20">
                    <td className="py-2 px-2 text-primary">{p.port}</td>
                    <td className="py-2 px-2 text-foreground">{p.protocol}</td>
                    <td className="py-2 px-2 text-muted-foreground">{p.service}</td>
                    <td className={`py-2 px-2 font-bold ${riskColors[p.severity] || "text-muted-foreground"}`}>{p.severity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* All Vulnerabilities */}
      {risks.length > 0 && (
        <motion.div variants={item} className="border-glow rounded-lg p-4 bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Bug className="w-4 h-4 text-alert-red" />
            <span className="text-xs font-code text-muted-foreground">
              VULNERABILITIES DETECTED ({risks.length})
            </span>
          </div>
          <div className="space-y-2">
            {risks.map((v) => (
              <div key={v.id} className="flex items-start gap-3 p-3 rounded bg-muted/20 border border-border/30">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${severityBg[v.severity] || severityBg.INFO}`}>
                  {v.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-foreground font-code font-bold">{v.title}</div>
                  {v.cve && (
                    <div className="text-[10px] text-primary font-code mt-0.5">{v.cve}</div>
                  )}
                  {v.description && (
                    <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">{v.description}</div>
                  )}
                  {v.solution && (
                    <div className="text-[10px] text-secondary mt-1 font-code">
                      💡 {v.solution}
                    </div>
                  )}
                  <div className="flex gap-3 mt-1 text-[9px] font-code text-muted-foreground/70">
                    {v.port && <span>Port: {v.port}</span>}
                    {v.service && <span>Service: {v.service}</span>}
                    {v.cvss_score && <span>CVSS: {v.cvss_score}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No findings */}
      {risks.length === 0 && (
        <motion.div variants={item} className="border-glow rounded-lg p-8 bg-card text-center">
          <Lock className="w-12 h-12 text-alert-green mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg liquid-text mb-2">ALL CLEAR</h3>
          <p className="text-xs text-muted-foreground font-code">
            No vulnerabilities detected on this target. The system appears clean.
          </p>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div variants={item} className="text-center text-[10px] text-muted-foreground/50 font-code py-4">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-4" />
        E-scanV Advanced Threat Hunter v3.0 | LIVE SCAN RESULTS — NOT A DEMO<br />
        Powered by HostedScan NMAP Engine | © 2026 Made by emmy-brain-codes
      </motion.div>
    </motion.div>
  );
};

export default ScanResults;
