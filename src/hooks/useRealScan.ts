import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";

const SCAN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vulnerability-scan`;
const AUTH_HEADER = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
};

export interface ScanRisk {
  id: string;
  title: string;
  description: string;
  severity: string;
  cvss_score: number | null;
  cve: string | null;
  port: number | null;
  protocol: string | null;
  service: string | null;
  state: string;
  target: string;
  solution: string | null;
  references: string[];
}

export interface RealScanResult {
  target: string;
  scanId: string;
  risks: ScanRisk[];
  scan: any;
  completedAt: string;
}

type ScanState = "idle" | "starting" | "scanning" | "completed" | "error";

export function useRealScan() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState("");
  const [scanResult, setScanResult] = useState<RealScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startScan = useCallback(async (target: string) => {
    setScanState("starting");
    setScanProgress(0);
    setCurrentTask("Initiating scan request...");
    setError(null);
    setScanResult(null);

    try {
      // Start the scan
      const startRes = await fetch(`${SCAN_URL}?action=start-scan`, {
        method: "POST",
        headers: AUTH_HEADER,
        body: JSON.stringify({ target }),
      });

      if (!startRes.ok) {
        const errData = await startRes.json().catch(() => ({ error: "Failed to start scan" }));
        throw new Error(errData.error || "Failed to start scan");
      }

      const { scan_id } = await startRes.json();
      setScanState("scanning");
      setCurrentTask("Scan submitted — waiting for results from HostedScan...");
      setScanProgress(10);

      // Poll for status
      const pollStatus = async () => {
        try {
          const statusRes = await fetch(
            `${SCAN_URL}?action=scan-status&scan_id=${scan_id}`,
            { headers: AUTH_HEADER }
          );

          if (!statusRes.ok) throw new Error("Failed to check scan status");

          const statusData = await statusRes.json();
          const progress = statusData.progress ?? 0;
          const mappedProgress = 10 + progress * 0.85;
          setScanProgress(Math.min(mappedProgress, 95));

          // Update task messages based on progress
          if (progress < 20) setCurrentTask("Performing port discovery...");
          else if (progress < 40) setCurrentTask("Service fingerprinting in progress...");
          else if (progress < 60) setCurrentTask("Running vulnerability checks...");
          else if (progress < 80) setCurrentTask("Analyzing detected services...");
          else setCurrentTask("Finalizing scan results...");

          if (statusData.status === "SUCCESS" || statusData.status === "COMPLETED") {
            stopPolling();
            setCurrentTask("Fetching vulnerability results...");
            setScanProgress(95);

            // Fetch results
            const resultsRes = await fetch(
              `${SCAN_URL}?action=scan-results&scan_id=${scan_id}`,
              { headers: AUTH_HEADER }
            );

            if (!resultsRes.ok) throw new Error("Failed to fetch results");

            const resultsData = await resultsRes.json();

            const risks: ScanRisk[] = (resultsData.risks || []).map((r: any) => ({
              id: r.id || crypto.randomUUID(),
              title: r.title || r.name || "Unknown Risk",
              description: r.description || "",
              severity: (r.severity || r.risk_level || "INFO").toUpperCase(),
              cvss_score: r.cvss_score ?? r.cvss ?? null,
              cve: r.cve || null,
              port: r.port ?? null,
              protocol: r.protocol || null,
              service: r.service || null,
              state: r.state || "open",
              target: r.target || target,
              solution: r.solution || null,
              references: r.references || [],
            }));

            setScanResult({
              target,
              scanId: scan_id,
              risks,
              scan: resultsData.scan,
              completedAt: new Date().toISOString(),
            });

            setScanProgress(100);
            setCurrentTask("Scan complete!");
            setScanState("completed");
            toast.success(`Scan complete: ${risks.length} findings detected`);
          } else if (statusData.status === "FAILED" || statusData.status === "ERROR") {
            stopPolling();
            throw new Error("Scan failed on the scanning server");
          }
        } catch (e) {
          stopPolling();
          const msg = e instanceof Error ? e.message : "Polling error";
          setError(msg);
          setScanState("error");
          toast.error(msg);
        }
      };

      // Poll every 5 seconds
      pollRef.current = setInterval(pollStatus, 5000);
      // Also poll immediately after a short delay
      setTimeout(pollStatus, 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to start scan";
      setError(msg);
      setScanState("error");
      toast.error(msg);
    }
  }, [stopPolling]);

  const reset = useCallback(() => {
    stopPolling();
    setScanState("idle");
    setScanProgress(0);
    setCurrentTask("");
    setScanResult(null);
    setError(null);
  }, [stopPolling]);

  return {
    scanState,
    scanProgress,
    currentTask,
    scanResult,
    error,
    startScan,
    reset,
  };
}
