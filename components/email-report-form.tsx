"use client";

import { useState } from "react";
import type { CareerMatchResult } from "@/lib/career/schemas";

type EmailReportFormProps = {
  result: CareerMatchResult;
};

export function EmailReportForm({ result }: EmailReportFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function sendReport() {
    setStatus("sending");
    setMessage("");

    try {
      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, report: result })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? "Unable to send report.");
        return;
      }

      setStatus("sent");
      setMessage("Report sent.");
    } catch {
      setStatus("error");
      setMessage("Unable to send report right now. Please try again.");
    }
  }

  return (
    <div className="rounded-lg border border-line bg-white/[0.045] p-4">
      <h3 className="font-display text-lg font-semibold text-white">Email report</h3>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="min-h-11 flex-1 rounded-md border border-line bg-black/35 px-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300"
        />
        <button
          type="button"
          onClick={sendReport}
          disabled={status === "sending"}
          className="min-h-11 rounded-md bg-white px-4 text-sm font-semibold text-black transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? "Sending..." : "Send"}
        </button>
      </div>
      {message ? (
        <p className={`mt-2 text-sm ${status === "error" ? "text-red-300" : "text-cyan-200"}`}>{message}</p>
      ) : null}
    </div>
  );
}
