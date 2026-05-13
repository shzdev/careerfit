import { describe, expect, it } from "vitest";
import { buildRuleBasedResult } from "../lib/career/scoring";
import type { SkillInput } from "../lib/career/schemas";

describe("buildRuleBasedResult", () => {
  it("prioritizes React/front-end roles for a strong React profile", () => {
    const skills: SkillInput[] = [
      { name: "JavaScript", category: "Programming", level: "strong", experienceMonths: 18 },
      { name: "TypeScript", category: "Programming", level: "basic", experienceMonths: 10 },
      { name: "React", category: "Frontend", level: "strong", experienceMonths: 16 },
      { name: "HTML", category: "Frontend", level: "strong", experienceMonths: 24 },
      { name: "CSS", category: "Frontend", level: "strong", experienceMonths: 24 },
      { name: "Responsive Design", category: "Design", level: "basic", experienceMonths: 10 },
      { name: "Git", category: "DevOps", level: "basic", experienceMonths: 12 }
    ];

    const result = buildRuleBasedResult(skills);
    const roleTitles = result.topRoles.map((role) => role.roleTitle);

    expect(result.topRoles).toHaveLength(3);
    expect(roleTitles).toContain("React Developer");
    expect(result.topRoles[0].matchScore).toBeGreaterThan(55);
    expect(result.emailReport.length).toBeLessThanOrEqual(6000);
  });
});
