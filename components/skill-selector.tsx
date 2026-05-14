"use client";

import { useMemo, useState } from "react";
import { allSkills, skillToCategory } from "@/lib/career/catalog";

type SelectedSkillDraft = {
  name: string;
  category: string;
  level: "strong" | "basic" | "weak" | null;
  experienceMonths: number | "";
};

type SkillSelectorProps = {
  selectedSkills: SelectedSkillDraft[];
  onAddSkill: (skill: { name: string; category: string }) => void;
  onRemoveSkill: (name: string) => void;
  onContinue: () => void;
  validationMessage: string;
};

export function SkillSelector({
  selectedSkills,
  onAddSkill,
  onRemoveSkill,
  onContinue,
  validationMessage
}: SkillSelectorProps) {
  const [query, setQuery] = useState("");
  const [hint, setHint] = useState("");
  const selectedNames = new Set(selectedSkills.map((skill) => skill.name.toLowerCase()));
  const normalizedQuery = query.trim().toLowerCase();

  const suggestions = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return allSkills
      .filter((skill) => {
        return skill.toLowerCase().includes(normalizedQuery) && !selectedNames.has(skill.toLowerCase());
      })
      .slice(0, 7);
  }, [normalizedQuery, selectedNames]);

  function addKnownSkill(skillName: string) {
    if (selectedNames.has(skillName.toLowerCase())) {
      setQuery("");
      setHint("");
      return;
    }

    onAddSkill({ name: skillName, category: skillToCategory[skillName] });
    setQuery("");
    setHint("");
  }

  function submitInput() {
    const exactMatch = allSkills.find((skill) => skill.toLowerCase() === normalizedQuery);

    if (!normalizedQuery) {
      onContinue();
      return;
    }

    if (!exactMatch) {
      setHint("Choose a matching skill from suggestions.");
      return;
    }

    addKnownSkill(exactMatch);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      submitInput();
    }

    if (event.key === "Escape") {
      setHint("");
      setQuery("");
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col justify-center px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-3xl text-center">
        <p className="text-sm font-medium uppercase text-cyan-200">IT CAREER ROLE MATCHER</p>
        <h1 className="mt-5 font-display text-5xl font-semibold leading-tight text-white sm:text-7xl">CareerFit AI</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">
          Match your current technical skills to realistic IT roles, then get a practical learning path you can act on this week.
        </p>
      </div>

      <div className="mx-auto mt-10 w-full max-w-3xl">
        <div className="rounded-lg border border-line bg-zinc-950/80 p-3 shadow-glow">
          {selectedSkills.length ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <span
                  key={skill.name}
                  className="inline-flex min-h-9 items-center gap-2 rounded-md border border-cyan-300/40 bg-cyan-300/10 px-3 text-sm font-medium text-cyan-100"
                >
                  {skill.name}
                  <button
                    type="button"
                    onClick={() => onRemoveSkill(skill.name)}
                    aria-label={`Remove ${skill.name}`}
                    className="rounded text-cyan-100 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setHint("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your skills, for example React"
              aria-label="Type a skill"
              className="min-h-12 flex-1 bg-transparent px-2 text-base text-white outline-none placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={query.trim() ? submitInput : onContinue}
              aria-label="Continue to skill configuration"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-lg font-semibold text-black transition hover:bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-300"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.25"
              >
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        {suggestions.length ? (
          <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-line bg-[#07100f]/95 p-2 shadow-glow">
            {suggestions.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => addKnownSkill(skill)}
                className="flex min-h-11 w-full items-center justify-between rounded-md px-3 text-left text-sm font-semibold text-zinc-100 transition hover:bg-cyan-300/10 hover:text-cyan-100 focus:bg-cyan-300/10 focus:outline-none"
              >
                <span>{skill}</span>
                <span className="text-xs font-medium text-zinc-500">{skillToCategory[skill]}</span>
              </button>
            ))}
          </div>
        ) : null}

        {hint || validationMessage ? (
          <p className="mt-3 text-center text-sm text-amber-200">{hint || validationMessage}</p>
        ) : null}
      </div>
    </section>
  );
}
