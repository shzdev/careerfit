import { allowedRoleCatalog } from "./catalog";
import { CareerMatchResultSchema, type CareerMatchResult, type SkillInput } from "./schemas";
import { parseModelJson } from "./safe-json";

type HuggingFaceResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function refineWithHuggingFace(params: {
  skills: SkillInput[];
  deterministicResult: CareerMatchResult;
  token: string;
  model: string;
}): Promise<CareerMatchResult | null> {
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
            "You refine CareerFit AI career reports. Return only valid JSON. Choose roles only from allowedRoleCatalog. Do not invent roles. Do not exaggerate experience. If framework, deployment, or testing skills are weak, keep role levels conservative. Preserve the deterministic candidate roles; explain and format them realistically."
        },
        {
          role: "user",
          content: JSON.stringify({
            allowedRoleCatalog,
            selectedSkills: params.skills,
            deterministicCandidates: params.deterministicResult.topRoles,
            requiredShape: {
              topRoles: "array of exactly 3 role objects",
              overallSummary: "string",
              strongestPath: "string",
              warnings: "array of strings",
              emailSubject: "string",
              emailReport: "string under 6000 chars"
            }
          })
        }
      ],
      temperature: 0.2,
      max_tokens: 2200,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as HuggingFaceResponse;
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    return null;
  }

  const parsed = parseModelJson<unknown>(content);
  const result = CareerMatchResultSchema.safeParse(parsed);

  if (!result.success) {
    return null;
  }

  const deterministicTitles = new Set(params.deterministicResult.topRoles.map((role) => role.roleTitle));
  const aiTitlesAreAllowed = result.data.topRoles.every((role) => deterministicTitles.has(role.roleTitle));

  if (!aiTitlesAreAllowed) {
    return null;
  }

  return result.data;
}

