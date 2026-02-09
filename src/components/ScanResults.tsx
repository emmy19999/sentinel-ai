import { motion } from "framer-motion";
import ThreatLevelIndicator from "./ThreatLevelIndicator";
import { Shield, Globe, Clock, Hash, AlertTriangle, FileWarning, Network, Terminal, Lock, Bug } from "lucide-react";

interface ScanResult {
  target: string;
  threatLevel: number;
  confidence: number;
  infectionStatus: string;
  openPorts: { port: number; service: string; version: string; risk: string }[];
  vulnerabilities: { cve: string; severity: string; description: string; exploitable: boolean }[];
  iocs: { type: string; value: string; confidence: number }[];
  malware: { name: string; type: string; confidence: number }[];
  recommendations: string[];
}

const mockResult: ScanResult = {
  target: "",
  threatLevel: 3,
  confidence: 78,
  infectionStatus: "SUSPICIOUS ACTIVITY DETECTED",
  openPorts: [
    { port: 22, service: "SSH", version: "OpenSSH 7.4", risk: "MEDIUM" },
    { port: 80, service: "HTTP", version: "Apache 2.4.6", risk: "LOW" },
    { port: 443, service: "HTTPS", version: "nginx 1.18", risk: "LOW" },
    { port: 3306, service: "MySQL", version: "5.7.34", risk: "HIGH" },
    { port: 8080, service: "HTTP-Proxy", version: "Unknown", risk: "HIGH" },
  ],
  vulnerabilities: [
    { cve: "CVE-2024-6387", severity: "CRITICAL", description: "OpenSSH RCE - regreSSHion", exploitable: true },
    { cve: "CVE-2023-44487", severity: "HIGH", description: "HTTP/2 Rapid Reset DDoS", exploitable: true },
    { cve: "CVE-2024-21762", severity: "CRITICAL", description: "FortiOS Out-of-Bounds Write", exploitable: false },
    { cve: "CVE-2023-46805", severity: "HIGH", description: "Ivanti Connect Secure Auth Bypass", exploitable: false },
  ],
  iocs: [
    { type: "IP", value: "185.159.82.142", confidence: 92 },
    { type: "Domain", value: "c2-relay.darknet.tk", confidence: 87 },
    { type: "Hash", value: "a94a8fe5ccb19ba61c4c0873d391e987", confidence: 75 },
    { type: "Process", value: "/tmp/.X11-unix/.systemd", confidence: 95 },
  ],
  malware: [
    { name: "XMRig Variant", type: "Cryptominer", confidence: 82 },
    { name: "Cobalt Strike Beacon", type: "C2 Framework", confidence: 68 },
  ],
  recommendations: [
    "IMMEDIATE: Block outbound traffic to 185.159.82.142",
    "URGENT: Patch OpenSSH to version 9.8+ (CVE-2024-6387)",
    "HIGH: Restrict MySQL (3306) access to trusted IPs only",
    "HIGH: Investigate /tmp/.X11-unix/.systemd for rootkit artifacts",
    "MEDIUM: Enable comprehensive audit logging",
    "MEDIUM: Deploy EDR solution for real-time monitoring",
  ],
};

const riskColors: Record<string, string> = {
  CRITICAL: "text-alert-red",
  HIGH: "text-alert-orange",
  MEDIUM: "text-alert-yellow",
  LOW: "text-alert-green",
};

const ScanResults = ({ target }: { target: string }) => {
  const result = { ...mockResult, target };
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={item} className="border-glow rounded-lg p-6 bg-card">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-lg liquid-text">THREAT ASSESSMENT REPORT</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-code">
          <div>
            <div className="text-muted-foreground mb-1">TARGET</div>
            <div className="text-foreground flex items-center gap-1"><Globe className="w-3 h-3" />{result.target}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">ASSESSMENT ID</div>
            <div className="text-foreground flex items-center gap-1"><Hash className="w-3 h-3" />THREAT-{Date.now().toString(36).toUpperCase()}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">TIMESTAMP</div>
            <div className="text-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{new Date().toISOString().split("T")[0]}</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">CONFIDENCE</div>
            <div className="text-primary font-bold">{result.confidence}%</div>
          </div>
        </div>
      </motion.div>

      {/* Threat Level + Status */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ThreatLevelIndicator level={result.threatLevel} />
        <div className="border-glow rounded-lg p-4 bg-card">
          <div className="text-[10px] text-muted-foreground mb-2 font-code">INFECTION STATUS</div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-alert-yellow" />
            <span className="font-display font-bold liquid-text-warm">{result.infectionStatus}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 font-code">
            Multiple indicators suggest unauthorized activity. Deep forensic analysis recommended.
          </p>
        </div>
      </motion.div>

      {/* Open Ports */}
      <motion.div variants={item} className="border-glow rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Network className="w-4 h-4 text-secondary" />
          <span className="text-xs font-code text-muted-foreground">OPEN PORTS & SERVICES</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-code">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 px-2">PORT</th>
                <th className="text-left py-2 px-2">SERVICE</th>
                <th className="text-left py-2 px-2">VERSION</th>
                <th className="text-left py-2 px-2">RISK</th>
              </tr>
            </thead>
            <tbody>
              {result.openPorts.map((p) => (
                <tr key={p.port} className="border-b border-border/30 hover:bg-muted/20">
                  <td className="py-2 px-2 text-primary">{p.port}</td>
                  <td className="py-2 px-2 text-foreground">{p.service}</td>
                  <td className="py-2 px-2 text-muted-foreground">{p.version}</td>
                  <td className={`py-2 px-2 font-bold ${riskColors[p.risk]}`}>{p.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Vulnerabilities */}
      <motion.div variants={item} className="border-glow rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Bug className="w-4 h-4 text-alert-red" />
          <span className="text-xs font-code text-muted-foreground">VULNERABILITIES DETECTED</span>
        </div>
        <div className="space-y-2">
          {result.vulnerabilities.map((v) => (
            <div key={v.cve} className="flex items-start gap-3 p-2 rounded bg-muted/20 border border-border/30">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                v.severity === "CRITICAL" ? "bg-alert-red/20 text-alert-red" : "bg-alert-orange/20 text-alert-orange"
              }`}>{v.severity}</span>
              <div className="flex-1">
                <div className="text-xs text-foreground font-code">{v.cve}</div>
                <div className="text-[11px] text-muted-foreground">{v.description}</div>
              </div>
              {v.exploitable && (
                <span className="text-[9px] bg-alert-red/10 text-alert-red px-1.5 py-0.5 rounded font-code">EXPLOITABLE</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* IOCs */}
      <motion.div variants={item} className="border-glow rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 mb-3">
          <FileWarning className="w-4 h-4 text-alert-orange" />
          <span className="text-xs font-code text-muted-foreground">INDICATORS OF COMPROMISE (IOC)</span>
        </div>
        <div className="space-y-1.5">
          {result.iocs.map((ioc, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-code p-2 bg-muted/20 rounded">
              <span className="text-muted-foreground w-16">{ioc.type}</span>
              <span className="text-foreground flex-1 break-all">{ioc.value}</span>
              <span className="text-primary">{ioc.confidence}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Malware Detection */}
      <motion.div variants={item} className="border-glow rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Lock className="w-4 h-4 text-alert-red" />
          <span className="text-xs font-code text-muted-foreground">MALWARE DETECTION</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {result.malware.map((m, i) => (
            <div key={i} className="p-3 rounded border border-alert-red/20 bg-alert-red/5">
              <div className="text-sm font-display font-bold liquid-text-warm">{m.name}</div>
              <div className="text-xs text-muted-foreground font-code">{m.type} — Confidence: {m.confidence}%</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div variants={item} className="border-glow rounded-lg p-4 bg-card">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="text-xs font-code text-muted-foreground">REMEDIATION RECOMMENDATIONS</span>
        </div>
        <div className="space-y-2">
          {result.recommendations.map((r, i) => {
            const priority = r.split(":")[0];
            const colorClass = priority === "IMMEDIATE" ? "text-alert-red" : priority === "URGENT" ? "text-alert-orange" : priority === "HIGH" ? "text-alert-yellow" : "text-alert-blue";
            return (
              <div key={i} className="flex items-start gap-2 text-xs font-code">
                <span className={`${colorClass} font-bold shrink-0`}>▸</span>
                <span className="text-foreground/80">{r}</span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div variants={item} className="text-center text-[10px] text-muted-foreground/50 font-code py-4">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mb-4" />
        E-scanV Advanced Threat Hunter v3.0 | Report Classification: CONFIDENTIAL<br />
        © 2026 Made by emmy-brain-codes | Your Security First
      </motion.div>
    </motion.div>
  );
};

export default ScanResults;
