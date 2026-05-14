import { describe, expect, it } from "vitest";
import { buildPromptCandidates, hasVisibleRefinementChanges } from "../lib/career/ai";
import { buildRuleBasedResult } from "../lib/career/scoring";
import { skillToCategory } from "../lib/career/catalog";
import { AiCareerRoleRefinementSchema, CareerRoleResultSchema, type SkillInput, type SkillLevel } from "../lib/career/schemas";

function input(name: string, level: SkillLevel = "strong", experienceMonths = 12): SkillInput {
  const category = skillToCategory[name];

  if (!category) {
    throw new Error(`Missing test category for ${name}`);
  }

  return { name, category, level, experienceMonths };
}

describe("AI refinement prompt helpers", () => {
  it("does not expose deterministic reasoning text inside prompt candidates", () => {
    const deterministicResult = buildRuleBasedResult([
      input("React", "strong", 12),
      input("JavaScript", "strong", 12),
      input("HTML", "strong", 12),
      input("CSS", "strong", 12),
      input("REST API", "basic", 6)
    ]);

    const promptCandidates = buildPromptCandidates(deterministicResult);

    expect(promptCandidates).toHaveLength(3);
    expect(promptCandidates[0]).not.toHaveProperty("reasoning");
    expect(promptCandidates[0]).toHaveProperty("supportingSkills");
    expect(promptCandidates[0]).toHaveProperty("missingSkills");
  });

  it("treats unchanged refinement text as no visible AI change", () => {
    const deterministicResult = buildRuleBasedResult([
      input("Laravel", "strong", 12),
      input("PHP", "strong", 12),
      input("MySQL", "basic", 6),
      input("REST API", "basic", 6),
      input("Git", "basic", 6)
    ]);

    expect(
      hasVisibleRefinementChanges(
        {
          topRoles: deterministicResult.topRoles.map((role) => ({
            rank: role.rank,
            roleTitle: role.roleTitle,
            reasoning: role.reasoning
          })),
          overallSummary: deterministicResult.overallSummary
        },
        deterministicResult
      )
    ).toBe(false);
  });

  it("accepts rewritten reasoning as a visible AI change", () => {
    const deterministicResult = buildRuleBasedResult([
      input("AWS", "strong", 12),
      input("Terraform", "strong", 12),
      input("Linux", "basic", 6),
      input("Docker", "basic", 6),
      input("CI/CD", "basic", 6)
    ]);

    expect(
      hasVisibleRefinementChanges(
        {
          topRoles: deterministicResult.topRoles.map((role, index) => ({
            rank: role.rank,
            roleTitle: role.roleTitle,
            reasoning: index === 0 ? "This path fits because your cloud setup skills already align with deployment and infrastructure work." : role.reasoning
          })),
          overallSummary: deterministicResult.overallSummary
        },
        deterministicResult
      )
    ).toBe(true);
  });

  it("rejects reasoning that is too short to be useful", () => {
    const deterministicResult = buildRuleBasedResult([
      input("React", "strong", 12),
      input("TypeScript", "basic", 6),
      input("REST API", "basic", 6),
      input("Git", "basic", 6)
    ]);
    const role = deterministicResult.topRoles[0];
    const shortReasoning = "Strong React fit with API exposure, but the explanation is still too thin.";

    expect(
      AiCareerRoleRefinementSchema.safeParse({
        rank: role.rank,
        roleTitle: role.roleTitle,
        reasoning: shortReasoning
      }).success
    ).toBe(false);

    expect(
      CareerRoleResultSchema.safeParse({
        ...role,
        reasoning: shortReasoning
      }).success
    ).toBe(false);
  });
});
