"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface CheckResult {
  title: string;
  endpoint: string;
  status: number;
  durationMs: number;
  passed: boolean;
  data: unknown;
  error?: unknown;
}

export default function ApiCheckPage() {
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const [loading, setLoading] = useState<string | null>(null);

  async function runCheck(
    key: string,
    title: string,
    endpoint: string,
    method = "GET",
    body?: unknown,
    expectedStatus = 200
  ) {
    setLoading(key);
    const options: RequestInit = { method };
    if (body) options.body = JSON.stringify(body);

    const res = await apiFetch(endpoint, options);
    const passed = res.status === expectedStatus;

    setResults((prev) => ({
      ...prev,
      [key]: {
        title,
        endpoint,
        status: res.status,
        durationMs: res.durationMs,
        passed,
        data: res.data,
        error: res.error,
      },
    }));
    setLoading(null);
  }

  async function runAll() {
    await runCheck("ping", "Ping Check", "/api/v1/dev/ping");
    await runCheck(
      "echo",
      "Echo Payload",
      "/api/v1/dev/echo",
      "POST",
      { message: "Frontend handshake verified", data: { client: "Next.js" } }
    );
    await runCheck(
      "error",
      "Standard Error Handling",
      "/api/v1/dev/error-test",
      "GET",
      undefined,
      400
    );
    await runCheck(
      "services",
      "External Services (Supabase, Groq, Telegram)",
      "/api/v1/dev/services-check"
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px", fontFamily: "sans-serif" }}>
      <div style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: 16, marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
          NEPSE Sathi — API Connectivity Harness
        </h1>
        <p style={{ color: "#64748b", margin: "8px 0 0 0", fontSize: 14 }}>
          Verification tool for FastAPI (:8000) to Next.js (:3000) connectivity, CORS, and cloud services.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <button
          onClick={runAll}
          style={{
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Run All Connectivity Checks
        </button>
        <button
          onClick={() => runCheck("ping", "Ping Check", "/api/v1/dev/ping")}
          disabled={loading === "ping"}
          style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid #cbd5e1", cursor: "pointer" }}
        >
          Test Ping
        </button>
        <button
          onClick={() =>
            runCheck("echo", "Echo Payload", "/api/v1/dev/echo", "POST", {
              message: "Test roundtrip",
              data: { time: Date.now() },
            })
          }
          disabled={loading === "echo"}
          style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid #cbd5e1", cursor: "pointer" }}
        >
          Test Echo
        </button>
        <button
          onClick={() =>
            runCheck("error", "Error Handling", "/api/v1/dev/error-test", "GET", undefined, 400)
          }
          disabled={loading === "error"}
          style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid #cbd5e1", cursor: "pointer" }}
        >
          Test Error Format
        </button>
        <button
          onClick={() =>
            runCheck("services", "Cloud Services (All 4 AI Tiers + Supabase)", "/api/v1/dev/services-check")
          }
          disabled={loading === "services"}
          style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid #cbd5e1", cursor: "pointer" }}
        >
          Check All 4 AI Providers & DB
        </button>
        <button
          onClick={() =>
            runCheck("ai_outlook", "Live AI Outlook (NABIL)", "/api/v1/ai/outlook/NABIL")
          }
          disabled={loading === "ai_outlook"}
          style={{ padding: "10px 14px", borderRadius: 6, border: "1px solid #6366f1", background: "#eef2ff", color: "#4338ca", cursor: "pointer", fontWeight: 600 }}
        >
          Test Live AI Outlook (NABIL)
        </button>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {Object.entries(results).map(([key, res]) => (
          <div
            key={key}
            style={{
              padding: 16,
              borderRadius: 8,
              border: `1px solid ${res.passed ? "#86efac" : "#fca5a5"}`,
              backgroundColor: res.passed ? "#f0fdf4" : "#fef2f2",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700 }}>
                  {res.passed ? "✓ PASS" : "✗ FAIL"}
                </span>
                <strong style={{ fontSize: 16 }}>{res.title}</strong>
                <code style={{ fontSize: 12, background: "#e2e8f0", padding: "2px 6px", borderRadius: 4 }}>
                  {res.endpoint}
                </code>
              </div>
              <span style={{ fontSize: 13, color: "#64748b" }}>
                HTTP {res.status} · {res.durationMs}ms
              </span>
            </div>

            <pre
              style={{
                marginTop: 12,
                background: "#0f172a",
                color: "#f8fafc",
                padding: 12,
                borderRadius: 6,
                fontSize: 12,
                overflowX: "auto",
              }}
            >
              {JSON.stringify(res.data || res.error, null, 2)}
            </pre>
          </div>
        ))}

        {Object.keys(results).length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", border: "2px dashed #e2e8f0", borderRadius: 8 }}>
            Click &quot;Run All Connectivity Checks&quot; above to verify your backend connection, CORS, and cloud services.
          </div>
        )}
      </div>
    </div>
  );
}
