import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are E-scanV AI Patch Assistant — an expert cybersecurity remediation AI. You help users fix vulnerabilities, remove malware, harden systems, and respond to incidents.

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

Guidelines:
- Provide specific, actionable commands in code blocks
- Be concise but thorough
- Always warn about risks before destructive operations
- Suggest backup/rollback steps
- Prioritize by severity (Critical > High > Medium > Low)
- Include validation commands to verify fixes
- For each fix, provide: the command, what it does, and potential side effects`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-patch-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
