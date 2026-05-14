import { roleProfiles, type RoleProfile } from "./catalog";
import { toSafeReport } from "./report";
import type { CareerMatchResult, CareerRoleResult, SkillInput, SkillLevel } from "./schemas";

const levelWeights: Record<SkillLevel, number> = {
  strong: 1,
  basic: 0.64,
  weak: 0.28,
  unknown: 0.05
};

const genericSkillGroups: Record<string, string[]> = {
  Frontend: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Nuxt", "Angular", "Tailwind CSS", "Bootstrap", "jQuery"],
  Backend: ["Node.js", "Express", "NestJS", "Spring Boot", "Laravel", "Django", "FastAPI", "ASP.NET Core", "REST API", "GraphQL", "PHP", "Java", "C#"],
  Database: ["SQL", "MySQL", "PostgreSQL", "MongoDB", "Firebase", "Supabase", "Redis", "Oracle"],
  Testing: ["Postman", "Selenium", "Cypress", "Playwright", "Jest", "JUnit", "PHPUnit", "Cucumber", "SoapUI"],
  Cloud: ["AWS", "Azure", "GCP"],
  BI: ["Power BI", "Tableau", "Looker Studio"],
  AIIntegration: ["Hugging Face", "OpenAI API", "LangChain", "RAG", "Vector Database", "LLM API Integration"],
  MLLibrary: ["TensorFlow", "PyTorch", "scikit-learn"]
};

type ScoredRole = Omit<CareerRoleResult, "rank">;

export function buildRuleBasedResult(skills: SkillInput[], extraWarnings: string[] = []): CareerMatchResult {
  const normalized = dedupeSkills(skills);
  const scored = roleProfiles
    .map((profile) => scoreRole(profile, normalized))
    .filter((role): role is ScoredRole => role !== null)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3)
    .map((role, index) => ({ ...role, rank: index + 1 }));

  const top = scored[0];
  const weakProfile = normalized.every((skill) => skill.level === "weak" || skill.level === "unknown");
  const warnings = [
    ...extraWarnings,
    ...(weakProfile ? ["Skill profile is still early; treat these as learning direction, not job-readiness claims."] : [])
  ];

  return toSafeReport({
    topRoles: scored,
    overallSummary: top
      ? `Your strongest current direction is ${top.roleTitle}. The recommendation is based on your selected skills, stated strength, and capped experience duration.`
      : "Add at least one skill to generate a useful career direction.",
    strongestPath: top?.roleTitle ?? "Career Switcher",
    warnings
  });
}

function scoreRole(profile: RoleProfile, skills: SkillInput[]): ScoredRole | null {
  const skillMap = new Map(skills.map((skill) => [skill.name, skill]));

  if (!meetsRequiredSkillGroups(profile, skillMap)) {
    return null;
  }

  const supportingSkills = skills
    .filter((skill) => matchesRequirement(profile, skill.name) && skill.level !== "unknown")
    .map((skill) => skill.name);

  const missingSkills = profile.coreSkills
    .filter((requirement) => !hasRequirement(skillMap, requirement))
    .slice(0, 5);

  const coreScore = profile.coreSkills.reduce((sum, requirement) => sum + requirementScore(skillMap, requirement), 0);
  const helpfulScore = profile.helpfulSkills.reduce((sum, requirement) => sum + requirementScore(skillMap, requirement) * 0.42, 0);
  const maxScore = profile.coreSkills.length + profile.helpfulSkills.length * 0.42;
  const experienceBoost = Math.min(totalRelevantMonths(skills, profile) / 60, 1) * 10;
  const foundationPenalty = foundationPenaltyFor(profile, skillMap);
  const matchScore = Math.max(4, Math.min(100, Math.round(((coreScore + helpfulScore) / maxScore) * 90 + experienceBoost - foundationPenalty)));

  return {
    roleTitle: profile.title,
    roleLevel: inferRoleLevel(matchScore, skills, foundationPenalty),
    matchScore,
    confidence: matchScore >= 72 ? "High" : matchScore >= 45 ? "Medium" : "Low",
    reasoning: buildReasoning(profile, supportingSkills, missingSkills, matchScore),
    supportingSkills: supportingSkills.slice(0, 8),
    missingSkills,
    recommendedProjects: buildProjects(profile),
    nextSevenDayPlan: buildSevenDayPlan(profile, missingSkills)
  };
}

function dedupeSkills(skills: SkillInput[]) {
  return Array.from(new Map(skills.map((skill) => [skill.name, skill])).values());
}

function requirementScore(skillMap: Map<string, SkillInput>, requirement: string): number {
  if (genericSkillGroups[requirement]) {
    return Math.max(...genericSkillGroups[requirement].map((skill) => requirementScore(skillMap, skill)), 0);
  }

  const skill = skillMap.get(requirement);
  if (!skill) {
    return 0;
  }

  const experienceMultiplier = 1 + Math.min(skill.experienceMonths, 120) / 240;
  return levelWeights[skill.level] * experienceMultiplier;
}

function hasRequirement(skillMap: Map<string, SkillInput>, requirement: string): boolean {
  if (genericSkillGroups[requirement]) {
    return genericSkillGroups[requirement].some((skill) => {
      const input = skillMap.get(skill);
      return input && input.level !== "weak" && input.level !== "unknown";
    });
  }

  const skill = skillMap.get(requirement);
  return Boolean(skill && skill.level !== "weak" && skill.level !== "unknown");
}

function meetsRequiredSkillGroups(profile: RoleProfile, skillMap: Map<string, SkillInput>) {
  return (profile.requiredSkillGroups ?? []).every((group) => group.some((requirement) => hasRequirement(skillMap, requirement)));
}

function matchesRequirement(profile: RoleProfile, skillName: string) {
  return [...profile.coreSkills, ...profile.helpfulSkills].some((requirement) => {
    return requirement === skillName || genericSkillGroups[requirement]?.includes(skillName);
  });
}

function totalRelevantMonths(skills: SkillInput[], profile: RoleProfile) {
  return skills
    .filter((skill) => matchesRequirement(profile, skill.name))
    .reduce((sum, skill) => sum + Math.min(skill.experienceMonths, 120), 0);
}

function foundationPenaltyFor(profile: RoleProfile, skillMap: Map<string, SkillInput>) {
  let penalty = 0;

  if (["Web Developer", "Frontend Developer", "React Developer", "Next.js Developer", "Full Stack Developer"].includes(profile.title)) {
    if (!hasRequirement(skillMap, "Git")) penalty += 4;
  }

  if (["Backend Developer", "Node.js Developer", "Full Stack Developer", "Java Developer", "Laravel Developer"].includes(profile.title)) {
    if (!hasRequirement(skillMap, "REST API")) penalty += 7;
    if (!hasRequirement(skillMap, "Testing")) penalty += 5;
  }

  if (["Backend Developer", "Node.js Developer", "Full Stack Developer", "Laravel Developer", "Data Engineer"].includes(profile.title)) {
    if (!hasRequirement(skillMap, "Database")) penalty += 5;
  }

  if (["DevOps Engineer", "Cloud Engineer", "AI Integration Developer"].includes(profile.title)) {
    if (!hasRequirement(skillMap, "Git")) penalty += 5;
  }

  if (["Cloud Engineer", "DevOps Engineer"].includes(profile.title) && !hasRequirement(skillMap, "Linux")) {
    penalty += 4;
  }

  if (["Data Analyst", "BI Developer", "Data Engineer", "Data Scientist"].includes(profile.title) && !hasRequirement(skillMap, "SQL")) {
    penalty += 5;
  }

  if (["AI Integration Developer"].includes(profile.title) && !hasRequirement(skillMap, "REST API")) {
    penalty += 5;
  }

  return penalty;
}

function inferRoleLevel(score: number, skills: SkillInput[], penalty: number): CareerRoleResult["roleLevel"] {
  const totalStrongMonths = skills
    .filter((skill) => skill.level === "strong" || skill.level === "basic")
    .reduce((sum, skill) => sum + skill.experienceMonths, 0);

  if (score < 25) return "Career Switcher";
  if (score < 42 || totalStrongMonths < 6) return "Intern";
  if (score < 68 || penalty >= 10 || totalStrongMonths < 18) return "Junior";
  if (score < 84 || totalStrongMonths < 36) return "Junior-to-Mid";
  return "Mid-Level";
}

function buildReasoning(profile: RoleProfile, supportingSkills: string[], missingSkills: string[], score: number) {
  const support = supportingSkills.length ? supportingSkills.slice(0, 4).join(", ") : "your current foundation skills";
  const gap = missingSkills.length ? ` Priority gaps are ${missingSkills.slice(0, 3).join(", ")}.` : " Your current profile covers the main foundations.";
  const realism = score >= 70 ? "This is a realistic near-term path." : "This is a learning direction that needs focused project proof.";
  return `${profile.title} fits because it connects with ${support}. ${realism}${gap}`;
}

function buildProjects(profile: RoleProfile) {
  return [
    profile.projectTheme,
    `Document the build with screenshots, setup notes, and a short README.`,
    `Add one practical improvement that shows production awareness.`
  ];
}

function buildSevenDayPlan(profile: RoleProfile, missingSkills: string[]) {
  const firstGap = missingSkills[0] ?? profile.coreSkills[0];
  const secondGap = missingSkills[1] ?? profile.coreSkills[1] ?? profile.coreSkills[0];

  return [
    `Day 1: Review the ${profile.title} role and map your current skill gaps.`,
    `Day 2: Practice ${firstGap} with a small focused exercise.`,
    `Day 3: Practice ${secondGap} and write notes on what still feels unclear.`,
    `Day 4: Start the recommended project with a small working version.`,
    `Day 5: Add validation, error handling, or responsive polish.`,
    `Day 6: Test the main user flow and document setup steps.`,
    `Day 7: Publish or record a demo and list the next three improvements.`
  ];
}
