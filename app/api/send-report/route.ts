import { NextResponse } from "next/server";
import { Resend } from "resend";
import { buildHtmlReport } from "@/lib/career/report";
import { SendReportRequestSchema } from "@/lib/career/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const parsed = SendReportRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid email report payload." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Email is unavailable because RESEND_API_KEY is not configured." }, { status: 503 });
  }

  const resend = new Resend(apiKey);
  const from = process.env.RESEND_FROM_EMAIL || "CareerFit AI <onboarding@resend.dev>";

  try {
    const { error } = await resend.emails.send({
      from,
      to: parsed.data.email,
      subject: parsed.data.report.emailSubject,
      text: parsed.data.report.emailReport,
      html: buildHtmlReport(parsed.data.report)
    });

    if (error) {
      return NextResponse.json({ error: error.message || "Unable to send email report." }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to send email report." }, { status: 502 });
  }
}

