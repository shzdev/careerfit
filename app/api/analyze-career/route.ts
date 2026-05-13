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
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid skill input." }, { status: 400 });
  }

  const token = process.env.HF_TOKEN;
  const model = process.env.HF_MODEL;

  if (!token || !model) {
    return NextResponse.json(buildRuleBasedResult(parsed.data.skills, [aiUnavailableWarning]));
  }

  const deterministicResult = buildRuleBasedResult(parsed.data.skills);

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
  } catch {
    // Deterministic output keeps the MVP usable when the provider is unavailable.
  }

  return NextResponse.json(buildRuleBasedResult(parsed.data.skills, [aiUnavailableWarning]));
}

