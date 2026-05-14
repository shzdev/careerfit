"use client";

type SelectedSkillDraft = {
  name: string;
  category: string;
  level: "strong" | "basic" | "weak" | null;
  experienceMonths: number | "";
};

type SkillRowProps = {
  skill: SelectedSkillDraft;
  validationMessage: string;
  onChange: (skill: SelectedSkillDraft) => void;
  onRemove: () => void;
};

const maxMonths = 120;

export function SkillRow({ skill, validationMessage, onChange, onRemove }: SkillRowProps) {
  function setMonths(value: string) {
    if (value.trim() === "") {
      onChange({ ...skill, experienceMonths: "" });
      return;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      onChange({ ...skill, experienceMonths: "" });
      return;
    }

    onChange({ ...skill, experienceMonths: clampMonth(Math.trunc(numericValue)) });
  }

  function adjustMonths(delta: number) {
    const current = typeof skill.experienceMonths === "number" ? skill.experienceMonths : 0;
    onChange({ ...skill, experienceMonths: clampMonth(current + delta) });
  }

  return (
    <article className="rounded-lg border border-line bg-white/[0.045] p-4">
      <div className="flex gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-line bg-zinc-900/80 text-xs font-semibold uppercase text-zinc-500">
          Icon
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-semibold text-white">{skill.name}</h3>
              <p className="mt-1 text-sm text-zinc-500">{skill.category}</p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              className="rounded-md border border-line px-3 py-2 text-sm text-zinc-300 transition hover:border-red-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
            >
              Remove
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_12rem]">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-300">Skill level</span>
              <div className="relative">
                <select
                  value={skill.level ?? ""}
                  onChange={(event) =>
                    onChange({
                      ...skill,
                      level: event.target.value ? (event.target.value as SelectedSkillDraft["level"]) : null
                    })
                  }
                  aria-label={`${skill.name} skill level`}
                  className="min-h-11 w-full appearance-none rounded-md border border-line bg-[#07100f] px-3 pr-10 text-sm text-white outline-none transition hover:border-cyan-300/60 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                >
                  <option className="bg-[#07100f] text-white" value="">
                    Select level
                  </option>
                  <option className="bg-[#07100f] text-white" value="strong">
                    Strong
                  </option>
                  <option className="bg-[#07100f] text-white" value="basic">
                    Basic
                  </option>
                  <option className="bg-[#07100f] text-white" value="weak">
                    Weak
                  </option>
                </select>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-zinc-300">Experience months</span>
              <div className="grid min-h-11 grid-cols-[2.75rem_1fr_2.75rem] rounded-md border border-line bg-black/35">
                <button
                  type="button"
                  onClick={() => adjustMonths(-1)}
                  aria-label={`Decrease ${skill.name} experience`}
                  className="text-lg text-zinc-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
                >
                  -
                </button>
                <input
                  type="number"
                  min={0}
                  max={maxMonths}
                  value={skill.experienceMonths}
                  onChange={(event) => setMonths(event.target.value)}
                  aria-label={`${skill.name} experience months`}
                  className="min-w-0 border-x border-line bg-transparent px-2 text-center text-sm text-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => adjustMonths(1)}
                  aria-label={`Increase ${skill.name} experience`}
                  className="text-lg text-zinc-300 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
                >
                  +
                </button>
              </div>
            </label>
          </div>

          {validationMessage ? <p className="mt-3 text-sm text-amber-200">{validationMessage}</p> : null}
        </div>
      </div>
    </article>
  );
}

function clampMonth(value: number) {
  return Math.max(0, Math.min(maxMonths, value));
}
