import { NextResponse } from "next/server";
import { refineWithHuggingFace } from "@/lib/career/ai";
import { buildRuleBasedResult } from "@/lib/career/scoring";
import { AnalyzeCareerRequestSchema } from "@/lib/career/schemas";

export const runtime = "nodejs";

const aiUnavailableWarning = "AI refinement unavailable; result generated using deterministic scoring.";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = AnalyzeCareerRequestSchema.safeParse(body);

  if (!parsed.success) {
    debugAnalyze("validation_failed", {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid skill input." }, { status: 400 });
  }

  const token = process.env.HF_TOKEN;
  const model = process.env.HF_MODEL;

  if (!token || !model) {
    debugAnalyze("fallback", { reason: "missing_hf_config" });
    return NextResponse.json(buildRuleBasedResult(parsed.data.skills, [aiUnavailableWarning]));
  }

  const deterministicResult = buildRuleBasedResult(parsed.data.skills);

  debugAnalyze("validated_request", {
    skillCount: parsed.data.skills.length,
    deterministicCandidates: deterministicResult.topRoles.map((role) => role.roleTitle)
  });

  try {
    const refined = await refineWithHuggingFace({
      skills: parsed.data.skills,
      deterministicResult,
      token,
      model
    });

    if (refined) {
      return NextResponse.json(refined);
    }

    debugAnalyze("fallback", { reason: "ai_refinement_returned_null" });
  } catch (error) {
    debugAnalyze("fallback", {
      reason: "ai_refinement_threw",
      message: error instanceof Error ? error.message : "Unknown error"
    });
    // Deterministic output keeps the MVP usable when the provider is unavailable.
  }

  return NextResponse.json(buildRuleBasedResult(parsed.data.skills, [aiUnavailableWarning]));
}

function debugAnalyze(event: string, details: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.info(`[careerfit-analyze] ${event}`, details);
}

