"use client";

import type { CareerMatchResult } from "@/lib/career/schemas";

type SavedResultsSectionProps = {
  savedResults: CareerMatchResult[];
  onLoadResult: (result: CareerMatchResult) => void;
  onClear: () => void;
};

export function SavedResultsSection({ savedResults, onLoadResult, onClear }: SavedResultsSectionProps) {
  if (!savedResults.length) {
    return null;
  }

  return (
    <section className="rounded-lg border border-line bg-white/[0.045] p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-white">Saved results</h2>
        <button type="button" onClick={onClear} className="rounded-md border border-line px-3 py-2 text-sm text-zinc-300 hover:text-white">
          Clear
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {savedResults.map((result, index) => (
          <button
            key={`${result.strongestPath}-${index}`}
            type="button"
            onClick={() => onLoadResult(result)}
            className="rounded-lg border border-line bg-black/25 p-3 text-left transition hover:border-cyan-300"
          >
            <div className="text-sm text-zinc-500">Saved match</div>
            <div className="mt-1 font-medium text-white">{result.strongestPath}</div>
            <div className="mt-2 text-sm text-zinc-400">{result.topRoles.map((role) => role.roleTitle).join(", ")}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

