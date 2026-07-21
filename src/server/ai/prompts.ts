import type { AiFixContent } from "@/features/analysis/ai-contracts";

export const AI_PROMPT_VERSION = "website-audit-v2";

export interface AiAuditInput {
  website: string;
  scores: Record<string, number | null>;
  issueCount: number;
  criticalIssueCount: number;
  issues: Array<{
    id: string;
    category: string;
    severity: string;
    title: string;
    description: string;
    recommendation: string;
    estimatedFixTime: string;
  }>;
  recommendations: Array<{ title: string; description: string; expectedImpact: string }>;
}

export function buildSummaryInstructions(): string {
  return [
    "You are FixMySite AI, a pragmatic senior web engineer.",
    "Explain only the deterministic audit data supplied by the application; do not invent scan findings.",
    "Write a concise, professional executive summary of 250 words or fewer.",
    "Give exactly five prioritized actions when five issues exist, otherwise one action per supplied issue.",
    "Give concise explanations only for supplied issue IDs. Offer practical recommendations that add value beyond the supplied recommendation text.",
    "Do not claim suggested fixes are guaranteed. Do not mention unavailable data.",
  ].join(" ");
}

export function buildSummaryInput(input: AiAuditInput): string {
  return JSON.stringify(input);
}

export function buildFixInstructions(): string {
  return [
    "You are FixMySite AI, a pragmatic senior web engineer.",
    "Create a cautious implementation suggestion for the supplied deterministic issue only.",
    "Suggested code must be clearly AI-generated, generic when the stack is unknown, and never claimed to be guaranteed.",
    "Do not assume access to the site's source code or invent facts outside the issue.",
  ].join(" ");
}

export function buildFixInput(issue: {
  id: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
  estimatedFixTime: string;
}): string {
  return JSON.stringify({ issue });
}

export function fallbackFix(issue: {
  category: string;
  title: string;
  description: string;
  recommendation: string;
}): AiFixContent {
  return {
    problem: issue.title,
    explanation: issue.description,
    suggestedCode: buildFallbackCode(issue),
    implementationNotes: issue.recommendation,
    expectedResult: "The reported issue should improve after the recommended change is deployed.",
    testingAdvice: "Test the affected page in a staging environment, then rerun the audit.",
    rollbackNotes:
      "Keep the prior implementation available and revert the change if it causes regressions.",
  };
}

function buildFallbackCode(issue: {
  category: string;
  title: string;
  recommendation: string;
}): string {
  const hint = `${issue.category} ${issue.title} ${issue.recommendation}`.toLowerCase();
  if (/content-security-policy|csp|hsts|x-frame|security header/.test(hint)) {
    return `// middleware.ts (Next.js). Review directives for your domains before deployment.
import { NextResponse } from "next/server";

export function middleware() {
  const response = NextResponse.next();
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Content-Security-Policy", "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'");
  return response;
}

export const config = { matcher: "/:path*" };`;
  }
  if (/alt|image.*accessib|image.*text/.test(hint)) {
    return `<!-- Informative images need meaningful alt text. Decorative images use an empty alt. -->
<img src="/images/feature.png" alt="Dashboard showing website performance issues" width="1200" height="630" />
<img src="/images/decoration.svg" alt="" aria-hidden="true" />`;
  }
  if (/meta|title|description|seo|canonical/.test(hint)) {
    return `<head>
  <title>Descriptive page title | Your Brand</title>
  <meta name="description" content="A clear, unique description of this page for search results." />
  <link rel="canonical" href="https://www.example.com/current-page" />
  <meta property="og:title" content="Descriptive page title" />
  <meta property="og:description" content="A clear page summary for social sharing." />
</head>`;
  }
  if (/image|lcp|lazy|performance|render-block/.test(hint)) {
    return `<!-- Prioritize the above-the-fold image and defer non-critical images. -->
<link rel="preload" as="image" href="/images/hero.avif" fetchpriority="high" />
<img src="/images/hero.avif" width="1600" height="900" alt="Product preview" fetchpriority="high" decoding="async" />
<img src="/images/gallery-1.avif" width="800" height="600" alt="Feature detail" loading="lazy" decoding="async" />`;
  }
  return `/* AI-generated implementation starting point. Add this to the affected component stylesheet. */
:focus-visible { outline: 3px solid #0f766e; outline-offset: 3px; }
@media (max-width: 640px) { .interactive-control { min-width: 44px; min-height: 44px; } }`;
}
