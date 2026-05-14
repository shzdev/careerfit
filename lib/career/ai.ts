import { allowedRoleCatalog } from "./catalog";
import { buildEmailSubject, buildPlainTextReport } from "./report";
import { AiCareerRefinementSchema, CareerMatchResultSchema, type CareerMatchResult, type SkillInput } from "./schemas";
import { parseModelJson } from "./safe-json";

type HuggingFaceResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  generated_text?: string;
  text?: string;
};

export async function refineWithHuggingFace(params: {
  skills: SkillInput[];
  deterministicResult: CareerMatchResult;
  token: string;
  model: string;
}): Promise<CareerMatchResult | null> {
  debugAi("request", {
    model: params.model,
    skillCount: params.skills.length,
    deterministicCandidates: params.deterministicResult.topRoles.map((role) => role.roleTitle)
  });

  const firstAttempt = await requestRefinement(params, false);

  if (firstAttempt.result) {
    return firstAttempt.result;
  }

  if (!firstAttempt.retryable) {
    return null;
  }

  debugAi("retry_attempted", {
    reason: firstAttempt.reason
  });

  const retryAttempt = await requestRefinement(params, true);

  debugAi("retry_finished", {
    success: Boolean(retryAttempt.result),
    reason: retryAttempt.reason
  });

  return retryAttempt.result;
}

async function requestRefinement(
  params: {
    skills: SkillInput[];
    deterministicResult: CareerMatchResult;
    token: string;
    model: string;
  },
  retry: boolean
): Promise<{ result: CareerMatchResult | null; retryable: boolean; reason: string }> {
  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        {
          role: "system",
          content:
            "You refine CareerFit AI career reports. Return one valid compact JSON object only. Do not use markdown. Do not include explanations outside JSON. Preserve the three deterministic candidate roles exactly. Do not invent roles. Do not exaggerate experience. If framework, deployment, or testing skills are weak, keep role levels conservative."
        },
        {
          role: "user",
          content: buildUserPrompt(params.skills, params.deterministicResult, retry)
        }
      ],
      temperature: 0.2,
      max_tokens: retry ? 1400 : 1800
    })
  });

  if (!response.ok) {
    debugAi("provider_error", {
      status: response.status,
      statusText: response.statusText
    });
    return { result: null, retryable: false, reason: "provider_error" };
  }

  const data = (await response.json()) as HuggingFaceResponse;
  const content = extractContent(data);

  if (!content) {
    debugAi("empty_content", {
      responseKeys: Object.keys(data)
    });
    return { result: null, retryable: false, reason: "empty_content" };
  }

  debugAi("content_preview", {
    preview: content.slice(0, 500)
  });

  const parsed = parseModelJson<unknown>(content);

  if (!parsed) {
    debugAi("json_parse_failed", {
      retry,
      length: content.length,
      tail: content.slice(-500),
      preview: content.slice(0, 500)
    });
    return { result: null, retryable: !retry, reason: "json_parse_failed" };
  }

  debugAi("json_parse_success", {
    parsedType: Array.isArray(parsed) ? "array" : typeof parsed
  });

  const refinement = AiCareerRefinementSchema.safeParse(parsed);

  if (!refinement.success) {
    debugAi("ai_schema_validation_failed", {
      retry,
      issues: refinement.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return { result: null, retryable: !retry, reason: "ai_schema_validation_failed" };
  }

  const deterministicTitles = new Set(params.deterministicResult.topRoles.map((role) => role.roleTitle));
  const aiTitlesAreAllowed = refinement.data.topRoles.every((role) => deterministicTitles.has(role.roleTitle));

  if (!aiTitlesAreAllowed) {
    debugAi("role_title_mismatch", {
      retry,
      deterministicTitles: Array.from(deterministicTitles),
      aiTitles: refinement.data.topRoles.map((role) => role.roleTitle)
    });
    return { result: null, retryable: !retry, reason: "role_title_mismatch" };
  }

  if (!hasVisibleRefinementChanges(refinement.data, params.deterministicResult)) {
    debugAi("no_effective_change", {
      retry
    });
    return { result: null, retryable: !retry, reason: "no_effective_change" };
  }

  const finalResult = normalizeRefinement(refinement.data, params.deterministicResult);
  const validatedResult = CareerMatchResultSchema.safeParse(finalResult);

  if (!validatedResult.success) {
    debugAi("final_schema_validation_failed", {
      retry,
      issues: validatedResult.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
    return { result: null, retryable: !retry, reason: "final_schema_validation_failed" };
  }

  debugAi("refinement_success", {
    retry,
    topRoles: validatedResult.data.topRoles.map((role) => role.roleTitle)
  });

  return { result: validatedResult.data, retryable: false, reason: "success" };
}

function buildUserPrompt(skills: SkillInput[], deterministicResult: CareerMatchResult, retry: boolean) {
  const promptCandidates = buildPromptCandidates(deterministicResult);

  if (retry) {
    return `Return only minified valid JSON. No markdown. No explanations. No literal line breaks inside string values. Do not include emailReport body. Use only exact candidate role titles. The root keys must be topRoles, overallSummary, strongestPath, warnings, emailSubject. warnings must be [] unless deterministicSummary has warnings. Each topRoles item must include only rank, roleTitle, reasoning. Preserve rank and roleTitle exactly from candidateRoles.
Rewrite overallSummary and every reasoning field with fresh wording.
Do not copy any full sentence from deterministic summary text.
Use supportingSkills and missingSkills from candidateRoles to explain fit and gaps.
Each reasoning should be 2-3 concise sentences, at least 80 characters long, and visibly different from the deterministic text.

candidateRoles:${JSON.stringify(promptCandidates)}
selectedSkills:${JSON.stringify(skills)}
deterministicSummary:${JSON.stringify({
      overallSummary: deterministicResult.overallSummary,
      warnings: deterministicResult.warnings
    })}
strongestPath:${JSON.stringify(deterministicResult.topRoles[0]?.roleTitle ?? deterministicResult.strongestPath)}`;
  }

  return `Create the final CareerMatchResult JSON object from this deterministic scoring data.
Do not echo this prompt.
The first character of your response must be "{" and the last character must be "}".
Return compact JSON only. Do not use markdown. Do not pretty-print.
Do not put literal line breaks inside any JSON string value.
Do not include emailReport. The server will generate emailReport after validation.
The root object must have exactly these keys: topRoles, overallSummary, strongestPath, warnings, emailSubject.
topRoles must contain exactly 3 short role objects.
Each topRoles item must include only these keys: rank, roleTitle, reasoning.
Preserve each candidate rank and roleTitle exactly.
roleTitle values must be exact values from allowedRoleCatalog and exact values from candidateRoles.
strongestPath must be "${deterministicResult.topRoles[0]?.roleTitle ?? deterministicResult.strongestPath}".
warnings must be [] unless deterministicSummary contains warnings.
emailSubject must be a short email subject.
You may improve only the user-facing wording fields: reasoning, overallSummary, and emailSubject.
Write fresh wording for overallSummary and every reasoning field.
Do not copy any full sentence from deterministic summary text.
Use supportingSkills and missingSkills from candidateRoles to explain fit and gaps.
Each reasoning should be 2-3 concise sentences, at least 80 characters long, and visibly different from the deterministic wording.

allowedRoleCatalog:
${JSON.stringify(allowedRoleCatalog)}

selectedSkills:
${JSON.stringify(skills)}

candidateRoles:
${JSON.stringify(promptCandidates)}

deterministicSummary:
${JSON.stringify({
  overallSummary: deterministicResult.overallSummary,
  strongestPath: deterministicResult.strongestPath,
  warnings: deterministicResult.warnings
})}`;
}

export function buildPromptCandidates(deterministicResult: CareerMatchResult) {
  return deterministicResult.topRoles.map((role) => ({
    rank: role.rank,
    roleTitle: role.roleTitle,
    roleLevel: role.roleLevel,
    matchScore: role.matchScore,
    confidence: role.confidence,
    supportingSkills: role.supportingSkills,
    missingSkills: role.missingSkills
  }));
}

export function hasVisibleRefinementChanges(
  refinement: {
    topRoles: Array<{
      rank: number;
      roleTitle: CareerMatchResult["topRoles"][number]["roleTitle"];
      reasoning: string;
    }>;
    overallSummary: string;
  },
  deterministicResult: CareerMatchResult
) {
  if (normalizeComparableText(refinement.overallSummary) !== normalizeComparableText(deterministicResult.overallSummary)) {
    return true;
  }

  const deterministicByTitle = new Map(deterministicResult.topRoles.map((role) => [role.roleTitle, role.reasoning]));
  return refinement.topRoles.some((role) => {
    const deterministicReasoning = deterministicByTitle.get(role.roleTitle) ?? "";
    return normalizeComparableText(role.reasoning) !== normalizeComparableText(deterministicReasoning);
  });
}

function normalizeRefinement(refinement: {
  topRoles: Array<{
    rank: number;
    roleTitle: CareerMatchResult["topRoles"][number]["roleTitle"];
    reasoning: string;
  }>;
  overallSummary: string;
  strongestPath: string;
  warnings: string[];
  emailSubject?: string;
}, deterministicResult: CareerMatchResult): CareerMatchResult {
  const refinementByTitle = new Map(refinement.topRoles.map((role) => [role.roleTitle, role]));
  const topRoles = deterministicResult.topRoles.map((role) => ({
    ...role,
    reasoning: refinementByTitle.get(role.roleTitle)?.reasoning ?? role.reasoning
  }));

  const resultWithoutReport = {
    topRoles,
    overallSummary: refinement.overallSummary,
    strongestPath: refinement.strongestPath,
    warnings: refinement.warnings
  };

  return {
    ...resultWithoutReport,
    emailSubject: refinement.emailSubject ?? buildEmailSubject(resultWithoutReport),
    emailReport: buildPlainTextReport(resultWithoutReport)
  };
}

function extractContent(data: HuggingFaceResponse) {
  return data.choices?.[0]?.message?.content ?? data.generated_text ?? data.text;
}

function normalizeComparableText(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function debugAi(event: string, details: Record<string, unknown>) {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  console.info(`[careerfit-ai] ${event}`, details);
}

