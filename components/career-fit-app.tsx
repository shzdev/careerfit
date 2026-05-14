"use client";

import { useEffect, useMemo, useState } from "react";
import { SkillSelector } from "./skill-selector";
import { SkillRow } from "./skill-row";
import { ResultCard } from "./result-card";
import { EmailReportForm } from "./email-report-form";
import { SavedResultsSection } from "./saved-results-section";
import type { CareerMatchResult, SkillInput } from "@/lib/career/schemas";

const storageKey = "careerfit-ai-results";
const loadingMessages = ["AI generating...", "AI thinking...", "AI deciding...", "Mapping your path...", "Checking skill fit..."];

type Screen = "entry" | "configure" | "results";

type SelectedSkillDraft = {
  name: string;
  category: string;
  level: "strong" | "basic" | "weak" | null;
  experienceMonths: number | "";
};

export function CareerFitApp() {
  const [screen, setScreen] = useState<Screen>("entry");
  const [selectedSkills, setSelectedSkills] = useState<SelectedSkillDraft[]>([]);
  const [result, setResult] = useState<CareerMatchResult | null>(null);
  const [savedResults, setSavedResults] = useState<CareerMatchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [entryError, setEntryError] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(0);

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

  useEffect(() => {
    if (status !== "loading") {
      setLoadingIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setLoadingIndex((current) => (current + 1) % loadingMessages.length);
    }, 1400);

    return () => window.clearInterval(interval);
  }, [status]);

  const validationMessages = useMemo(() => {
    return Object.fromEntries(selectedSkills.map((skill) => [skill.name, validateDraftSkill(skill)]));
  }, [selectedSkills]);

  const canAnalyze = selectedSkills.length > 0 && selectedSkills.every((skill) => !validationMessages[skill.name]) && status !== "loading";

  function addSkill(skill: { name: string; category: string }) {
    setEntryError("");
    setSelectedSkills((current) => {
      if (current.length >= 30 || current.some((item) => item.name === skill.name)) {
        return current;
      }

      return [
        ...current,
        {
          name: skill.name,
          category: skill.category,
          level: null,
          experienceMonths: ""
        }
      ];
    });
  }

  function removeSkill(skillName: string) {
    setSelectedSkills((current) => current.filter((skill) => skill.name !== skillName));
  }

  function updateSkill(index: number, nextSkill: SelectedSkillDraft) {
    setSelectedSkills((current) => current.map((skill, skillIndex) => (skillIndex === index ? nextSkill : skill)));
  }

  function continueToConfiguration() {
    if (!selectedSkills.length) {
      setEntryError("Select at least one matching skill first.");
      return;
    }

    setEntryError("");
    setScreen("configure");
  }

  async function analyze() {
    if (!canAnalyze) {
      setAnalysisError("Complete every skill level and month value before analyzing.");
      return;
    }

    setStatus("loading");
    setAnalysisError("");
    setCopyStatus("");

    const skills = toApiSkillInput(selectedSkills);

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
        setAnalysisError(errorData.error || "Unable to analyze your skill profile.");
        return;
      }

      setResult(data as CareerMatchResult);
      setStatus("idle");
      setScreen("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
      setAnalysisError("Unable to analyze your skill profile right now. Please try again.");
    }
  }

  function saveResult() {
    if (!result) return;

    try {
      const nextResults = [result, ...savedResults.filter((saved) => saved.emailReport !== result.emailReport)].slice(0, 5);
      setSavedResults(nextResults);
      window.localStorage.setItem(storageKey, JSON.stringify(nextResults));
    } catch {
      setSavedResults((current) => [result, ...current].slice(0, 5));
    }

    setCopyStatus("Result saved locally.");
  }

  async function copyReport() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.emailReport);
      setCopyStatus("Report copied to clipboard.");
    } catch {
      setCopyStatus("Copy failed. Please copy manually.");
    }
  }

  function clearSavedResults() {
    setSavedResults([]);
    window.localStorage.removeItem(storageKey);
  }

  function analyzeAgain() {
    setScreen("entry");
    setSelectedSkills([]);
    setResult(null);
    setStatus("idle");
    setEntryError("");
    setAnalysisError("");
    setCopyStatus("");
  }

  return (
    <main className="min-h-screen overflow-x-hidden text-white">
      {screen === "entry" ? (
        <SkillSelector
          selectedSkills={selectedSkills}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
          onContinue={continueToConfiguration}
          validationMessage={entryError}
        />
      ) : null}

      {screen === "configure" ? (
        <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="mb-6">
            <div>
              <p className="text-sm font-medium uppercase text-cyan-200">Configure your skills</p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-white sm:text-5xl">Skill strength and experience</h1>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Choose a level and month value for each selected skill before CareerFit AI maps your path.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {selectedSkills.map((skill, index) => (
              <SkillRow
                key={skill.name}
                skill={skill}
                validationMessage={validationMessages[skill.name]}
                onChange={(nextSkill) => updateSkill(index, nextSkill)}
                onRemove={() => removeSkill(skill.name)}
              />
            ))}
          </div>

          {analysisError ? (
            <p className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{analysisError}</p>
          ) : null}

          <div className="sticky bottom-0 mt-6 space-y-2 border-t border-line bg-ink/90 py-4 backdrop-blur">
            <button
              type="button"
              onClick={analyze}
              disabled={!canAnalyze}
              className="min-h-12 w-full rounded-md bg-white px-5 text-sm font-semibold text-black transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? loadingMessages[loadingIndex] : "Analyze my skills"}
            </button>
            <button
              type="button"
              onClick={() => setScreen("entry")}
              disabled={status === "loading"}
              className="min-h-11 w-full rounded-md border border-line px-4 text-sm text-zinc-200 transition hover:text-white disabled:opacity-50"
            >
              Back
            </button>
          </div>
        </section>
      ) : null}

      {screen === "results" && result ? (
        <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="rounded-lg border border-line bg-white/[0.045] p-5 shadow-glow">
            <p className="text-sm font-medium uppercase text-cyan-200">Your strongest path</p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-white">{result.strongestPath}</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{result.overallSummary}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <span key={skill.name} className="rounded-md border border-line bg-black/25 px-3 py-2 text-xs text-zinc-300">
                  {skill.name}: {skill.level} / {skill.experienceMonths} months
                </span>
              ))}
            </div>

            {result.warnings.length ? (
              <div className="mt-4 space-y-2">
                {result.warnings.map((warning) => (
                  <p key={warning} className="rounded-md border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
                    {warning}
                  </p>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-5 space-y-4">
            {result.topRoles.map((role) => (
              <ResultCard key={`${role.rank}-${role.roleTitle}`} role={role} />
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-line bg-white/[0.045] p-4">
            <h2 className="font-display text-xl font-semibold text-white">Export your report</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={saveResult} className="min-h-11 rounded-md bg-white px-4 text-sm font-semibold text-black hover:bg-cyan-100">
                Save result
              </button>
              <button type="button" onClick={copyReport} className="min-h-11 rounded-md border border-line px-4 text-sm text-zinc-200 hover:text-white">
                Copy report
              </button>
              <button type="button" onClick={analyzeAgain} className="min-h-11 rounded-md border border-line px-4 text-sm text-zinc-200 hover:text-white">
                Analyze again
              </button>
            </div>
            {copyStatus ? <p className="mt-2 text-sm text-cyan-200">{copyStatus}</p> : null}
          </div>

          <div className="mt-5 space-y-5">
            <EmailReportForm result={result} />
            <SavedResultsSection savedResults={savedResults} onLoadResult={setResult} onClear={clearSavedResults} />
          </div>
        </section>
      ) : null}
    </main>
  );
}

function validateDraftSkill(skill: SelectedSkillDraft) {
  if (!skill.level) {
    return "Choose Strong, Basic, or Weak.";
  }

  if (typeof skill.experienceMonths !== "number" || Number.isNaN(skill.experienceMonths)) {
    return "Enter experience months.";
  }

  if (skill.level === "strong" && skill.experienceMonths < 6) {
    return "Strong requires at least 6 months.";
  }

  if (skill.level === "basic" && skill.experienceMonths < 1) {
    return "Basic requires at least 1 month.";
  }

  return "";
}

function toApiSkillInput(skills: SelectedSkillDraft[]): SkillInput[] {
  return skills.map((skill) => ({
    name: skill.name,
    category: skill.category,
    level: skill.level as "strong" | "basic" | "weak",
    experienceMonths: skill.experienceMonths as number
  }));
}
