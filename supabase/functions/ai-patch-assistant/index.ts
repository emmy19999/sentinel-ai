import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BASE_PROMPT = `You are E-scanV AI Patch Assistant — an expert cybersecurity remediation AI. You help users fix vulnerabilities, remove malware, harden systems, and respond to incidents.

Guidelines:
- Provide specific, actionable commands in code blocks
- Be concise but thorough
- Always warn about risks before destructive operations
- Suggest backup/rollback steps
- Prioritize by severity (Critical > High > Medium > Low)
- Include validation commands to verify fixes
- For each fix, provide: the command, what it does, and potential side effects
- Generate ready-to-use scripts (Bash, PowerShell, Ansible) when asked`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, scanContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build dynamic system prompt with real scan findings
    let systemPrompt = BASE_PROMPT;
    if (scanContext && Array.isArray(scanContext) && scanContext.length > 0) {
      const findings = scanContext.map((r: any) => {
        const parts = [`- ${r.title || "Unknown"} [${r.severity}]`];
        if (r.cve) parts.push(`CVE: ${r.cve}`);
        if (r.port) parts.push(`Port: ${r.port}`);
        if (r.service) parts.push(`Service: ${r.service}`);
        if (r.solution) parts.push(`Suggested fix: ${r.solution}`);
        return parts.join(" | ");
      }).join("\n");
      systemPrompt += `\n\nREAL SCAN FINDINGS (from live HostedScan NMAP scan):\n${findings}`;
    } else {
      systemPrompt += "\n\nNo scan data available yet. Help the user with general cybersecurity questions.";
    }

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
            { role: "system", content: systemPrompt },
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
