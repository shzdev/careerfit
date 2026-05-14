import { describe, expect, it } from "vitest";
import { allSkills, allowedRoleCatalog, roleProfiles, skillToCategory } from "../lib/career/catalog";
import { buildRuleBasedResult } from "../lib/career/scoring";
import type { SkillInput, SkillLevel } from "../lib/career/schemas";

function input(name: string, level: SkillLevel = "strong", experienceMonths = 12): SkillInput {
  const category = skillToCategory[name];

  if (!category) {
    throw new Error(`Missing test category for ${name}`);
  }

  return { name, category, level, experienceMonths };
}

function topRoles(skills: SkillInput[]) {
  return buildRuleBasedResult(skills).topRoles.map((role) => role.roleTitle);
}

function strongestRole(skills: SkillInput[]) {
  return buildRuleBasedResult(skills).topRoles[0]?.roleTitle;
}

describe("Malaysia career catalog", () => {
  it("removes PHP Developer from the allowed catalog and role profiles", () => {
    expect(allowedRoleCatalog).not.toContain("PHP Developer");
    expect(roleProfiles.map((role) => role.title)).not.toContain("PHP Developer");
  });

  it("keeps duplicate-category skills unique for UI selection", () => {
    expect(new Set(allSkills).size).toBe(allSkills.length);
    expect(skillToCategory.Python).toBe("Programming");
    expect(skillToCategory.SQL).toBe("Programming");
    expect(skillToCategory.Kotlin).toBe("Programming");
    expect(skillToCategory.Swift).toBe("Programming");
    expect(skillToCategory.Firebase).toBe("Database");
  });
});

describe("buildRuleBasedResult Malaysia role gates", () => {
  it("does not recommend WordPress Developer without WordPress", () => {
    const roles = topRoles([
      input("HTML", "strong", 18),
      input("CSS", "strong", 18),
      input("PHP", "basic", 8),
      input("MySQL", "basic", 8)
    ]);

    expect(roles).not.toContain("WordPress Developer");
    expect(roles).toContain("Web Developer");
  });

  it("requires Laravel for Laravel Developer", () => {
    const withoutLaravel = topRoles([
      input("PHP", "strong", 12),
      input("MySQL", "basic", 6),
      input("REST API", "basic", 6)
    ]);

    const withLaravel = topRoles([
      input("PHP", "strong", 12),
      input("Laravel", "strong", 12),
      input("MySQL", "basic", 6),
      input("REST API", "basic", 6),
      input("PHPUnit", "basic", 3)
    ]);

    expect(withoutLaravel).not.toContain("Laravel Developer");
    expect(withLaravel).toContain("Laravel Developer");
  });

  it("requires React for React Developer", () => {
    const withoutReact = topRoles([
      input("JavaScript", "strong", 12),
      input("TypeScript", "basic", 6),
      input("HTML", "strong", 12),
      input("CSS", "strong", 12)
    ]);

    const withReact = topRoles([
      input("JavaScript", "strong", 12),
      input("TypeScript", "basic", 6),
      input("HTML", "strong", 12),
      input("CSS", "strong", 12),
      input("React", "strong", 12)
    ]);

    expect(withoutReact).not.toContain("React Developer");
    expect(withReact).toContain("React Developer");
  });

  it("requires both Next.js and React for Next.js Developer", () => {
    const withoutReact = topRoles([
      input("Next.js", "strong", 12),
      input("TypeScript", "basic", 6),
      input("Tailwind CSS", "basic", 6)
    ]);

    const withReact = topRoles([
      input("Next.js", "strong", 12),
      input("React", "strong", 12),
      input("TypeScript", "basic", 6),
      input("Tailwind CSS", "basic", 6)
    ]);

    expect(withoutReact).not.toContain("Next.js Developer");
    expect(withReact).toContain("Next.js Developer");
  });

  it("requires frontend, backend, and database evidence for Full Stack Developer", () => {
    const frontendOnly = topRoles([
      input("HTML", "strong", 12),
      input("CSS", "strong", 12),
      input("React", "strong", 12),
      input("Tailwind CSS", "basic", 6)
    ]);

    const fullStack = topRoles([
      input("HTML", "strong", 12),
      input("CSS", "strong", 12),
      input("React", "strong", 12),
      input("Node.js", "strong", 12),
      input("REST API", "basic", 6),
      input("PostgreSQL", "basic", 6),
      input("Git", "basic", 6)
    ]);

    expect(frontendOnly).not.toContain("Full Stack Developer");
    expect(fullStack).toContain("Full Stack Developer");
  });

  it("maps AI API-only profiles to AI Integration Developer, not AI/ML Engineer", () => {
    const roles = topRoles([
      input("Hugging Face", "strong", 6),
      input("OpenAI API", "strong", 6),
      input("LangChain", "basic", 3),
      input("RAG", "basic", 3)
    ]);

    expect(roles).toContain("AI Integration Developer");
    expect(roles).not.toContain("AI/ML Engineer");
  });

  it("allows AI/ML Engineer when Python and ML library evidence exist", () => {
    const roles = topRoles([
      input("Python", "strong", 18),
      input("TensorFlow", "basic", 6),
      input("scikit-learn", "basic", 6),
      input("Pandas", "basic", 6)
    ]);

    expect(roles).toContain("AI/ML Engineer");
  });

  it("maps Power BI and SQL to Data Analyst or BI Developer", () => {
    const roles = topRoles([
      input("SQL", "strong", 12),
      input("Power BI", "strong", 12),
      input("Excel", "basic", 6)
    ]);

    expect(roles.some((role) => role === "Data Analyst" || role === "BI Developer")).toBe(true);
  });

  it("maps Flutter and Dart to Flutter Developer", () => {
    const roles = topRoles([
      input("Flutter", "strong", 12),
      input("Dart", "strong", 12),
      input("Firebase", "basic", 6),
      input("REST API", "basic", 6)
    ]);

    expect(roles).toContain("Flutter Developer");
  });

  it("requires a cloud provider for Cloud Engineer", () => {
    const withoutProvider = topRoles([
      input("Linux", "strong", 12),
      input("Docker", "basic", 6),
      input("Terraform", "basic", 6)
    ]);

    const withProvider = topRoles([
      input("AWS", "strong", 12),
      input("Linux", "strong", 12),
      input("Docker", "basic", 6),
      input("Terraform", "basic", 6)
    ]);

    expect(withoutProvider).not.toContain("Cloud Engineer");
    expect(withProvider).toContain("Cloud Engineer");
  });

  it("ranks React Developer above broad web roles for a clear React profile", () => {
    expect(
      strongestRole([
        input("React", "strong", 18),
        input("JavaScript", "strong", 18),
        input("TypeScript", "basic", 8),
        input("HTML", "strong", 18),
        input("CSS", "strong", 18),
        input("REST API", "basic", 6)
      ])
    ).toBe("React Developer");
  });

  it("ranks Next.js Developer above broad web roles for a clear Next.js profile", () => {
    expect(
      strongestRole([
        input("Next.js", "strong", 12),
        input("React", "strong", 12),
        input("TypeScript", "basic", 8),
        input("Tailwind CSS", "basic", 6),
        input("REST API", "basic", 6),
        input("Vercel", "basic", 3)
      ])
    ).toBe("Next.js Developer");
  });

  it("ranks Laravel Developer above broad web roles for a clear Laravel profile", () => {
    expect(
      strongestRole([
        input("Laravel", "strong", 12),
        input("PHP", "strong", 12),
        input("HTML", "basic", 6),
        input("CSS", "basic", 6),
        input("JavaScript", "basic", 6),
        input("MySQL", "basic", 8),
        input("REST API", "basic", 6),
        input("PHPUnit", "basic", 3),
        input("Git", "basic", 6)
      ])
    ).toBe("Laravel Developer");
  });

  it("ranks WordPress Developer above broad web roles for a clear WordPress profile", () => {
    expect(
      strongestRole([
        input("WordPress", "strong", 12),
        input("PHP", "basic", 8),
        input("MySQL", "basic", 8),
        input("HTML", "strong", 12),
        input("CSS", "strong", 12),
        input("JavaScript", "basic", 6),
        input("REST API", "basic", 3),
        input("Elementor", "basic", 6)
      ])
    ).toBe("WordPress Developer");
  });

  it("ranks Flutter Developer above broad mobile roles for a clear Flutter profile", () => {
    expect(
      strongestRole([
        input("Flutter", "strong", 12),
        input("Dart", "strong", 12),
        input("Firebase", "basic", 6),
        input("REST API", "basic", 6),
        input("Android Studio", "basic", 3)
      ])
    ).toBe("Flutter Developer");
  });

  it("ranks BI Developer above broad data roles for a clear BI profile", () => {
    expect(
      strongestRole([
        input("Power BI", "strong", 12),
        input("SQL", "strong", 12),
        input("Excel", "basic", 8),
        input("Tableau", "basic", 6),
        input("Looker Studio", "basic", 3)
      ])
    ).toBe("BI Developer");
  });

  it("ranks AI/ML Engineer above broad data roles for a clear AI/ML profile", () => {
    expect(
      strongestRole([
        input("Python", "strong", 18),
        input("TensorFlow", "strong", 12),
        input("PyTorch", "basic", 6),
        input("scikit-learn", "basic", 6),
        input("NumPy", "basic", 6),
        input("Pandas", "basic", 6)
      ])
    ).toBe("AI/ML Engineer");
  });

  it("ranks Cloud Engineer above broad DevOps roles for a clear cloud profile", () => {
    expect(
      strongestRole([
        input("AWS", "strong", 12),
        input("Terraform", "strong", 12),
        input("Linux", "basic", 8),
        input("Docker", "basic", 6),
        input("Kubernetes", "basic", 6),
        input("CI/CD", "basic", 6)
      ])
    ).toBe("Cloud Engineer");
  });
});
