import type { CareerMatchResult, CareerRoleResult } from "./schemas";

export function buildEmailSubject(result: Pick<CareerMatchResult, "strongestPath">) {
  return `CareerFit AI report: ${result.strongestPath}`;
}

export function buildPlainTextReport(result: Omit<CareerMatchResult, "emailReport" | "emailSubject">) {
  const roleSections = result.topRoles
    .map((role) => {
      return [
        `${role.rank}. ${role.roleTitle} (${role.roleLevel}) - ${role.matchScore}% ${role.confidence} confidence`,
        `Why: ${role.reasoning}`,
        `Supporting skills: ${role.supportingSkills.join(", ") || "None yet"}`,
        `Missing skills: ${role.missingSkills.join(", ") || "None"}`,
        `Projects: ${role.recommendedProjects.join(" | ")}`,
        `7-day plan: ${role.nextSevenDayPlan.join(" | ")}`
      ].join("\n");
    })
    .join("\n\n");

  const warnings = result.warnings.length ? `\n\nWarnings:\n- ${result.warnings.join("\n- ")}` : "";

  return [
    "CareerFit AI Report",
    "",
    result.overallSummary,
    "",
    `Strongest path: ${result.strongestPath}`,
    "",
    roleSections,
    warnings
  ]
    .join("\n")
    .slice(0, 6000);
}

export function toSafeReport(result: Omit<CareerMatchResult, "emailSubject" | "emailReport">): CareerMatchResult {
  const emailSubject = buildEmailSubject(result);
  const emailReport = buildPlainTextReport(result);

  return {
    ...result,
    emailSubject,
    emailReport
  };
}

export function buildHtmlReport(result: CareerMatchResult) {
  const escapeHtml = (value: string) =>
    value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

  const roleHtml = result.topRoles
    .map((role: CareerRoleResult) => {
      const list = (items: string[]) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");

      return `
        <section style="border:1px solid #d9e2e8;border-radius:12px;padding:16px;margin:16px 0;">
          <h2 style="margin:0 0 8px;">${role.rank}. ${escapeHtml(role.roleTitle)} - ${role.matchScore}%</h2>
          <p><strong>Level:</strong> ${escapeHtml(role.roleLevel)} | <strong>Confidence:</strong> ${escapeHtml(role.confidence)}</p>
          <p>${escapeHtml(role.reasoning)}</p>
          <p><strong>Supporting skills:</strong> ${escapeHtml(role.supportingSkills.join(", ") || "None yet")}</p>
          <p><strong>Missing skills:</strong> ${escapeHtml(role.missingSkills.join(", ") || "None")}</p>
          <p><strong>Recommended projects:</strong></p>
          <ul>${list(role.recommendedProjects)}</ul>
          <p><strong>7-day plan:</strong></p>
          <ol>${list(role.nextSevenDayPlan)}</ol>
        </section>
      `;
    })
    .join("");

  const warnings = result.warnings.length
    ? `<h2>Warnings</h2><ul>${result.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join("")}</ul>`
    : "";

  return `
    <main style="font-family:Arial,sans-serif;color:#111827;line-height:1.55;">
      <h1>CareerFit AI Report</h1>
      <p>${escapeHtml(result.overallSummary)}</p>
      <p><strong>Strongest path:</strong> ${escapeHtml(result.strongestPath)}</p>
      ${roleHtml}
      ${warnings}
    </main>
  `;
}

