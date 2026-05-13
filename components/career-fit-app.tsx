"use client";

import { useEffect, useMemo, useState } from "react";
import { HeroSection } from "./hero-section";
import { SkillSelector } from "./skill-selector";
import { SkillRow } from "./skill-row";
import { ResultCard } from "./result-card";
import { EmailReportForm } from "./email-report-form";
import { SavedResultsSection } from "./saved-results-section";
import type { CareerMatchResult, SkillInput } from "@/lib/career/schemas";

const storageKey = "careerfit-ai-results";

export function CareerFitApp() {
  const [skills, setSkills] = useState<SkillInput[]>([]);
  const [result, setResult] = useState<CareerMatchResult | null>(null);
  const [savedResults, setSavedResults] = useState<CareerMatchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setSavedResults(JSON.parse(stored) as CareerMatchResult[]);
      }
    } catch {
      setSavedResults([]);
    }
  }, []);

  const canAnalyze = skills.length > 0 && status !== "loading";
  const selectedSummary = useMemo(() => {
    const strongCount = skills.filter((skill) => skill.level === "strong").length;
    const months = skills.reduce((sum, skill) => sum + skill.experienceMonths, 0);
    return `${skills.length}/30 skills - ${strongCount} strong - ${months} months total`;
  }, [skills]);

  function addSkill(skill: SkillInput) {
    setError("");
    setSkills((current) => {
      if (current.length >= 30 || current.some((item) => item.name === skill.name)) {
        return current;
      }
      return [...current, skill];
    });
  }

  function updateSkill(index: number, nextSkill: SkillInput) {
    setSkills((current) => current.map((skill, skillIndex) => (skillIndex === index ? nextSkill : skill)));
  }

  function removeSkill(index: number) {
    setSkills((current) => current.filter((_, skillIndex) => skillIndex !== index));
  }

  async function analyze() {
    setStatus("loading");
    setError("");
    setCopyStatus("");

    try {
      const response = await fetch("/api/analyze-career", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills })
      });

      const data = (await response.json()) as CareerMatchResult | { error?: string };

      if (!response.ok) {
        const errorData = data as { error?: string };
        setStatus("error");
        setError(errorData.error || "Unable to analyze your skill profile.");
        return;
      }

      setResult(data as CareerMatchResult);
      setStatus("idle");
      document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setStatus("error");
      setError("Unable to analyze your skill profile right now. Please try again.");
    }
  }

  function saveResult() {
    if (!result) return;

    const nextResults = [result, ...savedResults.filter((saved) => saved.emailReport !== result.emailReport)].slice(0, 5);
    setSavedResults(nextResults);
    window.localStorage.setItem(storageKey, JSON.stringify(nextResults));
  }

  async function copyReport() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.emailReport);
      setCopyStatus("Copied.");
    } catch {
      setCopyStatus("Copy failed. Please copy manually.");
    }
  }

  function clearSavedResults() {
    setSavedResults([]);
    window.localStorage.removeItem(storageKey);
  }

  return (
    <main className="min-h-screen overflow-x-hidden text-white">
      <HeroSection />

      <section id="matcher" className="mx-auto grid w-full max-w-6xl gap-5 px-4 pb-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <div className="space-y-5">
          <SkillSelector selectedSkills={skills} onAddSkill={addSkill} />

          <div className="rounded-lg border border-line bg-white/[0.045] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-white">Selected skills</h2>
                <p className="mt-1 text-sm text-zinc-400">{selectedSummary}</p>
              </div>
              <button
                type="button"
                onClick={analyze}
                disabled={!canAnalyze}
                className="min-h-11 rounded-md bg-white px-5 text-sm font-semibold text-black transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? "Analyzing..." : "Analyze career fit"}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {skills.length ? (
                skills.map((skill, index) => (
                  <SkillRow
                    key={skill.name}
                    skill={skill}
                    onChange={(nextSkill) => updateSkill(index, nextSkill)}
                    onRemove={() => removeSkill(index)}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-line p-4 text-sm text-zinc-500">
                  Select a few skills to start. JavaScript, React, Git, and REST API are enough to test the flow.
                </div>
              )}
            </div>

            {error ? <p className="mt-3 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
          </div>
        </div>

        <div id="results" className="space-y-5">
          {status === "loading" ? (
            <div className="rounded-lg border border-line bg-white/[0.045] p-5 shadow-glow">
              <div className="h-2 w-24 animate-pulse rounded-full bg-cyan-300" />
              <h2 className="mt-5 font-display text-2xl font-semibold text-white">Scoring your role fit</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Running deterministic matching first, then asking AI to refine the explanation if configured.
              </p>
            </div>
          ) : null}

          {result ? (
            <>
              <div className="rounded-lg border border-line bg-white/[0.045] p-4 shadow-glow">
                <p className="text-sm uppercase tracking-[0.16em] text-cyan-200">Your strongest path</p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-white">{result.strongestPath}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{result.overallSummary}</p>
                {result.warnings.length ? (
                  <div className="mt-3 space-y-2">
                    {result.warnings.map((warning) => (
                      <p key={warning} className="rounded-md border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
                        {warning}
                      </p>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button type="button" onClick={saveResult} className="min-h-11 rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-cyan-100">
                    Save result
                  </button>
                  <button type="button" onClick={copyReport} className="min-h-11 rounded-md border border-line px-4 text-sm text-zinc-200 hover:text-white">
                    Copy report
                  </button>
                </div>
                {copyStatus ? <p className="mt-2 text-sm text-cyan-200">{copyStatus}</p> : null}
              </div>

              <div className="space-y-4">
                {result.topRoles.map((role) => (
                  <ResultCard key={`${role.rank}-${role.roleTitle}`} role={role} />
                ))}
              </div>

              <EmailReportForm result={result} />
            </>
          ) : (
            <div className="rounded-lg border border-line bg-white/[0.045] p-5">
              <h2 className="font-display text-2xl font-semibold text-white">Top 3 roles will appear here</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                The result includes match score, level, supporting skills, missing skills, projects, and a 7-day learning plan.
              </p>
            </div>
          )}

          <SavedResultsSection savedResults={savedResults} onLoadResult={setResult} onClear={clearSavedResults} />
        </div>
      </section>
    </main>
  );
}
