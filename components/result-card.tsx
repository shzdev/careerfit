import type { CareerRoleResult } from "@/lib/career/schemas";

type ResultCardProps = {
  role: CareerRoleResult;
};

export function ResultCard({ role }: ResultCardProps) {
  return (
    <article className="rounded-lg border border-line bg-white/[0.045] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm text-cyan-200">#{role.rank} match</div>
          <h3 className="mt-1 font-display text-2xl font-semibold text-white">{role.roleTitle}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {role.roleLevel} - {role.confidence} confidence
          </p>
        </div>
        <div className="w-fit rounded-md border border-cyan-300/45 bg-cyan-300/10 px-3 py-2 text-2xl font-semibold text-cyan-100">
          {role.matchScore}%
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-zinc-300">{role.reasoning}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <InfoList title="Supporting skills" items={role.supportingSkills} />
        <InfoList title="Missing skills" items={role.missingSkills} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <InfoList title="Recommended projects" items={role.recommendedProjects} />
        <InfoList title="7-day plan" items={role.nextSevenDayPlan} ordered />
      </div>
    </article>
  );
}

function InfoList({ title, items, ordered = false }: { title: string; items: string[]; ordered?: boolean }) {
  const ListTag = ordered ? "ol" : "ul";

  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-white">{title}</h4>
      <ListTag className={`space-y-2 text-sm leading-5 text-zinc-400 ${ordered ? "list-decimal pl-5" : ""}`}>
        {items.length ? (
          items.map((item) => (
            <li key={item} className={ordered ? "" : "rounded-md border border-line bg-black/25 px-3 py-2"}>
              {item}
            </li>
          ))
        ) : (
          <li className={ordered ? "" : "rounded-md border border-line bg-black/25 px-3 py-2"}>None yet</li>
        )}
      </ListTag>
    </div>
  );
}
