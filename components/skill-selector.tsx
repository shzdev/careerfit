"use client";

import { useMemo, useState } from "react";
import { skillCatalog, type SkillCategory } from "@/lib/career/catalog";
import type { SkillInput } from "@/lib/career/schemas";

type SkillSelectorProps = {
  selectedSkills: SkillInput[];
  onAddSkill: (skill: SkillInput) => void;
};

export function SkillSelector({ selectedSkills, onAddSkill }: SkillSelectorProps) {
  const [query, setQuery] = useState("");
  const selectedNames = new Set(selectedSkills.map((skill) => skill.name));

  const filteredCatalog = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return Object.entries(skillCatalog)
      .map(([category, skills]) => ({
        category: category as SkillCategory,
        skills: skills.filter((skill) => {
          return !selectedNames.has(skill) && (!normalizedQuery || skill.toLowerCase().includes(normalizedQuery));
        })
      }))
      .filter((group) => group.skills.length > 0);
  }, [query, selectedNames]);

  return (
    <div className="rounded-lg border border-line bg-white/[0.045] p-4 shadow-glow">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">Build your skill profile</h2>
          <p className="mt-1 text-sm text-zinc-400">Choose up to 30 skills, then rate strength and experience.</p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search skills"
          className="min-h-11 rounded-md border border-line bg-black/35 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300"
        />
      </div>

      <div className="mt-4 max-h-[21rem] space-y-4 overflow-y-auto pr-1">
        {filteredCatalog.map((group) => (
          <div key={group.category}>
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{group.category}</div>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() =>
                    onAddSkill({
                      name: skill,
                      category: group.category,
                      level: "basic",
                      experienceMonths: 0
                    })
                  }
                  className="min-h-10 rounded-md border border-line bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 transition hover:border-cyan-300 hover:text-white"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        ))}

        {!filteredCatalog.length ? <p className="text-sm text-zinc-500">No matching skills available.</p> : null}
      </div>
    </div>
  );
}

