# FixMySite AI

FixMySite AI is an AI-powered website-audit platform that turns a homepage scan into a prioritized, understandable action plan. It combines Lighthouse performance data, axe accessibility findings, and security-header checks with Groq AI guidance.

## Why FixMySite AI

Website audit tools often provide long technical reports that are difficult to prioritize. FixMySite AI helps users move from raw findings to practical next steps: what matters most, why it matters, and how to fix it.

## Features

- Email/password authentication, password reset, and optional Google or GitHub OAuth
- Homepage audits for performance, SEO, accessibility, UX, mobile, and passive security checks
- Lighthouse, axe-core, Puppeteer, and security-header evidence
- Saved reports, issue history, recommendations, notifications, and usage credits
- Shareable reports and text export
- Firebase Analytics in supported browsers
- Groq AI-generated summaries, priority plans, issue explanations, recommendations, and implementation guidance
- Deterministic fallback content when an AI response is unavailable

## How Groq AI is used

Groq's GPT-OSS 20B model is used after the technical scan has completed. It does not replace Lighthouse or axe-core; instead, it interprets their structured findings for the user.

The server sends the model a validated, minimal audit context: scores, issue severity, category, evidence, and recommended actions. Groq then produces:

- An executive-friendly audit summary
- A prioritized plan for the highest-impact improvements
- Clear explanations of individual issues and their user or business impact
- Actionable fix guidance that developers can review before applying

Responses are requested in a structured format and validated with Zod before they are stored or shown in the interface. The Groq API key is used only on the server and must never be exposed in browser code or committed to GitHub.

## Architecture

```text
React + TanStack Start interface
              |
Typed API routes + Zod validation
              |
Services and repositories
              |
Supabase PostgreSQL + Row Level Security

Website scanner
  |- Lighthouse + Chromium
  |- axe-core accessibility checks
  `- passive security-header checks

Groq's OpenAI-compatible Responses API + GPT-OSS 20B
  `- structured summaries and fix guidance
```

## Tech stack

- TanStack Start, React 19, TypeScript, Vite, and Tailwind CSS
- Supabase Auth and PostgreSQL with Row Level Security
- Groq's OpenAI-compatible API and GPT-OSS 20B structured outputs
- Lighthouse, Puppeteer, chrome-launcher, axe-core, and Chromium
- Zod validation, Firebase Analytics, and Netlify Functions

## Project structure

```text
src/routes              Pages and typed API routes
src/features            Shared feature logic and validation contracts
src/server/scanners     Lighthouse, axe-core, URL, and header scanning
src/server/services     Application orchestration
src/server/repositories Supabase persistence adapters
src/server/ai           GPT prompts, service, and response validation
supabase/migrations     Database schema, RLS, AI, and usage migrations
```

## Prerequisites

- Node.js 22 or later
- npm 10 or later
- A Supabase project
- A Groq API key with access to the configured model
- Google Chrome or Chromium for local audit runs

## Local setup

1. Clone the repository and install dependencies.

   ```bash
   git clone <your-repository-url>
   cd fixmysite-ai
   npm install
   ```

2. Copy the environment template and add your own credentials.

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Apply the Supabase migrations in the order listed below.
4. Start the development server.

   ```bash
   npm run dev
   ```

5. Open `http://localhost:8080`.

## Environment variables

```dotenv
# Public browser settings
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Server-only settings
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GROQ_API_KEY=your-groq-api-key
```

`SUPABASE_SERVICE_ROLE_KEY` and `GROQ_API_KEY` are secrets. Do not give them a `VITE_` prefix, do not place them in client-side code, and do not commit a real `.env` file. The repository includes `.env.example` as a safe template.

## Supabase setup

Run these migrations in **Supabase Dashboard -> SQL Editor**, in order:

1. [20260717000000_backend_foundation.sql](supabase/migrations/20260717000000_backend_foundation.sql)
2. [20260717000001_auth_and_row_level_security.sql](supabase/migrations/20260717000001_auth_and_row_level_security.sql)
3. [20260717000002_analysis_evidence.sql](supabase/migrations/20260717000002_analysis_evidence.sql)
4. [20260718000000_ai_outputs.sql](supabase/migrations/20260718000000_ai_outputs.sql)
5. [20260719000000_usage_credits.sql](supabase/migrations/20260719000000_usage_credits.sql)

In **Authentication -> Providers**, enable Email/Password. For local development, add these redirect URLs in **Authentication -> URL Configuration**:

```text
http://localhost:8080
http://localhost:8080/
http://localhost:8080/reset-password
```

### Optional OAuth

To enable Google or GitHub sign-in, configure the provider in Supabase Authentication with its client ID and secret. Use the callback URL displayed by Supabase, typically:

```text
https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
```

## Deploy on Netlify

This repository includes [netlify.toml](netlify.toml) for the TanStack Start and Nitro serverless deployment.

1. Push the project to GitHub and import the repository in Netlify.
2. Use Node.js 22, build command `npm run build`, and publish directory `dist`.
3. Add every value from `.env.example` in **Project configuration -> Environment variables**. Give `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` the **Functions** runtime scope; the two `VITE_SUPABASE_*` values must also be available during the build.
4. Deploy the site.
5. Add your deployed Netlify URL to Supabase **Authentication -> URL Configuration**, including:

   ```text
   https://your-site.netlify.app
   https://your-site.netlify.app/reset-password
   ```

The deployment includes a serverless Chromium runtime for audits. The first scan after a cold start can take longer than a normal page request, so use a Netlify Functions plan with enough execution time and memory for browser workloads.

## Usage flow

1. Create an account or sign in.
2. Enter a public website URL on the **Analyze** page.
3. Review the health score, detected issues, and evidence.
4. Use the Groq summary and priority plan to decide what to fix first.
5. Open an issue for detailed AI-generated fix guidance, then save or share the report.

## Quality checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Security notes

- Only scan websites you are authorized to test.
- Keep the Supabase service-role key and Groq API key server-side.
- Rotate any key that was accidentally exposed in a public repository.
- Review AI-generated code and recommendations before using them in production.

## License

MIT. See [LICENSE](LICENSE).
