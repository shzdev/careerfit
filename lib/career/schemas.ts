import { z } from "zod";
import { allSkills, allowedRoleCatalog, skillToCategory } from "./catalog";

export const skillLevelValues = ["strong", "basic", "weak", "unknown"] as const;
export const roleLevelValues = ["Intern", "Junior", "Junior-to-Mid", "Mid-Level", "Career Switcher"] as const;
export const confidenceValues = ["Low", "Medium", "High"] as const;

export const SkillLevelSchema = z.enum(skillLevelValues);
export const RoleTitleSchema = z.enum(allowedRoleCatalog);

export const SkillInputSchema = z
  .object({
    name: z.string().trim(),
    category: z.string().trim(),
    level: SkillLevelSchema,
    experienceMonths: z.coerce.number().int().min(0).max(120)
  })
  .superRefine((skill, ctx) => {
    if (!allSkills.includes(skill.name as never)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Unknown skill name", path: ["name"] });
      return;
    }

    if (skillToCategory[skill.name] !== skill.category) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Skill category mismatch", path: ["category"] });
    }
  });

export const AnalyzeCareerRequestSchema = z.object({
  skills: z.array(SkillInputSchema).min(1, "Select at least one skill").max(30, "Select up to 30 skills")
});

const TextArraySchema = z.array(z.string().trim().min(1).max(180)).min(1).max(8);

export const CareerRoleResultSchema = z.object({
  rank: z.number().int().min(1).max(3),
  roleTitle: RoleTitleSchema,
  roleLevel: z.enum(roleLevelValues),
  matchScore: z.number().int().min(0).max(100),
  confidence: z.enum(confidenceValues),
  reasoning: z.string().trim().min(20).max(900),
  supportingSkills: z.array(z.string().trim().min(1).max(80)).max(12),
  missingSkills: z.array(z.string().trim().min(1).max(80)).max(12),
  recommendedProjects: TextArraySchema.max(4),
  nextSevenDayPlan: z.array(z.string().trim().min(1).max(180)).length(7)
});

export const CareerMatchResultSchema = z.object({
  topRoles: z.array(CareerRoleResultSchema).length(3),
  overallSummary: z.string().trim().min(20).max(1200),
  strongestPath: z.string().trim().min(2).max(120),
  warnings: z.array(z.string().trim().min(1).max(220)).max(6),
  emailSubject: z.string().trim().min(5).max(120),
  emailReport: z.string().trim().min(20).max(6000)
});

export const SendReportRequestSchema = z.object({
  email: z.string().trim().email().max(254),
  report: CareerMatchResultSchema.refine((result) => result.emailReport.length <= 6000, {
    message: "Report is too long"
  })
});

export type SkillLevel = z.infer<typeof SkillLevelSchema>;
export type SkillInput = z.infer<typeof SkillInputSchema>;
export type AnalyzeCareerRequest = z.infer<typeof AnalyzeCareerRequestSchema>;
export type CareerRoleResult = z.infer<typeof CareerRoleResultSchema>;
export type CareerMatchResult = z.infer<typeof CareerMatchResultSchema>;
export type SendReportRequest = z.infer<typeof SendReportRequestSchema>;

