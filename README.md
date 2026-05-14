# CareerFit AI

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Hugging Face](https://img.shields.io/badge/Hugging_Face-Inference-FCC72B?logo=huggingface&logoColor=black)](https://huggingface.co/)
[![Resend](https://img.shields.io/badge/Resend-Email-black)](https://resend.com/)
[![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)

CareerFit AI is a mobile-first MVP that helps IT learners and junior developers identify realistic best-fit career roles from their current technical skills. It combines deterministic role scoring with optional AI refinement to produce practical, junior-friendly recommendations, then lets users save or email the result.

## What It Does

- Lets users choose technical skills from a controlled catalog.
- Collects explicit skill level and experience months for each selected skill.
- Scores candidate roles with a deterministic rules engine first.
- Uses Hugging Face server-side only to refine explanation and formatting.
- Returns the top 3 role matches with score, level, reasoning, gaps, projects, and a 7-day learning plan.
- Saves reports locally and can send them by email through Resend.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod
- Hugging Face Inference Providers via `@huggingface/inference`
- Resend
- localStorage
- Vitest

## Features

- 3-screen mobile-first UI flow
- Catalog-only skill entry with autocomplete
- Explicit skill-level and experience validation
- Deterministic top-3 career scoring
- Safe AI fallback when Hugging Face is unavailable
- Structured career report with:
  - strongest path
  - match score
  - role level
  - confidence
  - supporting skills
  - missing skills
  - recommended projects
  - 7-day learning plan
- Local result saving
- Copy-to-clipboard report export
- Email report sending through secure server routes

## AI Decision Flow

1. User selects skills and configures strength plus experience.
2. The client sends validated input to `POST /api/analyze-career`.
3. The server validates payloads with Zod.
4. The deterministic scoring engine ranks allowed career roles first.
5. If `HF_TOKEN` and `HF_MODEL` are configured, Hugging Face refines the explanation only.
6. If AI fails, returns invalid output, or is unavailable, the app falls back to deterministic results.
7. The client renders the final Top 3 result cards and allows save, copy, or email actions.

## Environment Variables

Create `.env.local` with:

```bash
HF_TOKEN=
HF_MODEL=Qwen/Qwen2.5-7B-Instruct
RESEND_API_KEY=
RESEND_FROM_EMAIL=CareerFit AI <onboarding@resend.dev>
```

Notes:
- `HF_TOKEN` is optional if deterministic fallback mode is acceptable.
- `HF_MODEL` is configurable and should match the Hugging Face model you want to use.
- `RESEND_API_KEY` is optional if email sending is not required locally.
- `RESEND_FROM_EMAIL` should use a sender allowed by your Resend setup in real deployment.

## How To Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
npm test
npm run build
npm audit --audit-level=moderate
```

## Deployment

This project is Vercel-ready.

Recommended deployment flow:

1. Create a Vercel project from this repository.
2. Add the same environment variables used in `.env.local`.
3. Ensure server-side env vars are configured for production:
   - `HF_TOKEN`
   - `HF_MODEL`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
4. Deploy.

If Hugging Face is unavailable in production, the app still works with deterministic fallback results. If Resend is unavailable, analysis still works and only email sending fails gracefully.

## Known Limitations

- This is an MVP, not a production-grade career assessment system.
- Role recommendations are limited to the allowed internal role catalog.
- The deterministic engine is intentionally simple and heuristic-driven.
- AI refinement does not decide role ranking and may be skipped entirely in fallback mode.
- Saved results use browser `localStorage`, so they do not sync across devices.
- There is no authentication, database persistence, or admin workflow in this version.
