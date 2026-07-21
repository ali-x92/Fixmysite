# FixMySite AI

**Turn a website audit into a clear, prioritized plan to improve it.**

FixMySite AI scans a public homepage for performance, SEO, accessibility, UX, and basic security issues. It then uses the **Groq API** to turn the technical evidence into a plain-language summary, a ranked action plan, and practical AI-assisted fix guidance.

> Hackathon materials: see [HACKATHON.md](HACKATHON.md) for the project story, demo flow, architecture, and responsible AI disclosure.

## The problem

Most website-audit tools give people a long list of technical warnings. It is difficult for a founder, designer, or developer to tell which issue matters most, why it matters, and what to do next.

## The solution

FixMySite AI keeps the scan evidence separate from the AI guidance:

- **Scan:** Lighthouse, axe-core, Chromium, and passive security-header checks collect the evidence.
- **Explain:** Groq turns a small, validated audit context into an understandable summary and priority plan.
- **Act:** users can open an issue and request focused, reviewable fix guidance.

AI does not invent the audit results or replace the underlying checks. If an AI request is unavailable, the app shows deterministic fallback content based on the scan findings.

## Features

- Secure email/password authentication, password reset, and optional Google or GitHub OAuth
- Homepage audits for performance, SEO, accessibility, UX, mobile, and passive security checks
- Evidence from Lighthouse, axe-core, Puppeteer, and security-header inspection
- Saved reports, issue history, recommendations, notifications, usage credits, and shareable report exports
- Groq-powered executive summaries, prioritized plans, issue explanations, and AI-assisted fix guidance
- Structured model responses validated with Zod before storage or display

## How AI is used

After a scan completes, the server sends Groq only the structured audit context needed for the request: scores, issue severity, category, evidence, and recommended actions. Groq produces:

- an executive-friendly audit summary;
- a ranked plan for the highest-impact improvements;
- plain-language explanations of an issue and its impact; and
- implementation starting points that a developer must review before use.

The Groq API key stays server-side. Never expose it in browser code or commit it to source control.

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

Groq API + GPT-OSS 20B
  `- structured summaries and AI-assisted fix guidance
```

## Tech stack

- TanStack Start, React 19, TypeScript, Vite, and Tailwind CSS
- Supabase Auth and PostgreSQL with Row Level Security
- Groq API with GPT-OSS 20B structured outputs
- Lighthouse, Puppeteer, chrome-launcher, axe-core, and Chromium
- Zod validation, Firebase Analytics, and Netlify Functions

## Built with Codex

OpenAI Codex was used as a development collaborator for planning, implementation, refactoring, documentation, and verification. The deployed product's AI features use the **Groq API**; Codex is not a runtime dependency and does not process end-user audit requests.

## Project structure

```text
src/routes              Pages and typed API routes
src/features            Shared feature logic and validation contracts
src/server/scanners     Lighthouse, axe-core, URL, and header scanning
src/server/services     Application orchestration
src/server/repositories Supabase persistence adapters
src/server/ai           Groq prompts, service, and response validation
supabase/migrations     Database schema, RLS, AI, and usage migrations
```

## Local setup

### Prerequisites

- Node.js 22 or later
- npm 10 or later
- A Supabase project
- A Groq API key with access to the configured model
- Google Chrome or Chromium for local audits

### Run locally

1. Clone the repository and install dependencies.

   ```bash
   git clone <your-repository-url>
   cd fixmysite-ai
   npm install
   ```

2. Create your local environment file.

   ```bash
   cp .env.example .env
   ```

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Add your credentials and apply the Supabase migrations listed below.
4. Start the application with `npm run dev` and open `http://localhost:8080`.

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

`SUPABASE_SERVICE_ROLE_KEY` and `GROQ_API_KEY` are secrets. Do not prefix them with `VITE_`, put them in client-side code, or commit a real `.env` file.

## Supabase setup

Run these migrations in **Supabase Dashboard -> SQL Editor**, in order:

1. [20260717000000_backend_foundation.sql](supabase/migrations/20260717000000_backend_foundation.sql)
2. [20260717000001_auth_and_row_level_security.sql](supabase/migrations/20260717000001_auth_and_row_level_security.sql)
3. [20260717000002_analysis_evidence.sql](supabase/migrations/20260717000002_analysis_evidence.sql)
4. [20260718000000_ai_outputs.sql](supabase/migrations/20260718000000_ai_outputs.sql)
5. [20260719000000_usage_credits.sql](supabase/migrations/20260719000000_usage_credits.sql)

Enable Email/Password in **Authentication -> Providers**. For local development, add these redirect URLs in **Authentication -> URL Configuration**:

```text
http://localhost:8080
http://localhost:8080/
http://localhost:8080/reset-password
```

### Optional OAuth

Configure Google or GitHub in Supabase Authentication with its client ID and secret. The callback URL is typically:

```text
https://<your-supabase-project-ref>.supabase.co/auth/v1/callback
```

## Deploy on Netlify

The included [netlify.toml](netlify.toml) configures TanStack Start and Nitro for a serverless deployment.

1. Push the project to GitHub and import it into Netlify.
2. Use Node.js 22, build command `npm run build`, and publish directory `dist`.
3. Add each value from `.env.example` in Netlify environment variables. Set `GROQ_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` for the Functions runtime; the `VITE_SUPABASE_*` values are also needed at build time.
4. Add the deployed URL and `/reset-password` URL to Supabase Authentication redirect URLs.

The deployment includes a serverless Chromium runtime for audits. The first audit after a cold start may take longer than a normal page request.

## Quality checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Security and responsible use

- Only scan websites you are authorized to test.
- Keep Supabase service-role and Groq API keys server-side.
- Review all AI-assisted code and recommendations before production use.
- Rotate any key accidentally exposed in a public repository.

## License

MIT. See [LICENSE](LICENSE).
