"use client";

import type { SkillInput, SkillLevel } from "@/lib/career/schemas";

type SkillRowProps = {
  skill: SkillInput;
  onChange: (skill: SkillInput) => void;
  onRemove: () => void;
};

const levelOptions: Array<{ value: SkillLevel; label: string }> = [
  { value: "strong", label: "Strong" },
  { value: "basic", label: "Basic" },
  { value: "weak", label: "Weak" },
  { value: "unknown", label: "Don't know" }
];

export function SkillRow({ skill, onChange, onRemove }: SkillRowProps) {
  return (
    <div className="grid gap-3 rounded-lg border border-line bg-black/25 p-3 sm:grid-cols-[1fr_1.35fr_8rem_auto] sm:items-center">
      <div>
        <div className="font-medium text-white">{skill.name}</div>
        <div className="text-xs text-zinc-500">{skill.category}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 min-[430px]:grid-cols-4">
        {levelOptions.map((option) => {
          const active = skill.level === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...skill, level: option.value })}
              className={`min-h-10 rounded-md border px-2 text-sm transition ${
                active
                  ? "border-cyan-300 bg-cyan-300 text-black"
                  : "border-line bg-zinc-950/80 text-zinc-300 hover:border-cyan-300 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <label className="block">
        <span className="mb-1 block text-xs text-zinc-500">Months</span>
        <input
          type="number"
          min={0}
          max={120}
          value={skill.experienceMonths}
          onChange={(event) =>
            onChange({
              ...skill,
              experienceMonths: Math.max(0, Math.min(120, Number(event.target.value) || 0))
            })
          }
          className="min-h-10 w-full rounded-md border border-line bg-black/35 px-3 text-sm text-white outline-none focus:border-cyan-300"
        />
      </label>

      <button
        type="button"
        onClick={onRemove}
        className="min-h-10 rounded-md border border-line px-3 text-sm text-zinc-300 transition hover:border-red-300 hover:text-white"
      >
        Remove
      </button>
    </div>
  );
}

