import type { Severity } from "@/server/db/database.types";
import type { NormalizedUrl } from "./url";

export type NormalizedIssue = {
  category: string;
  severity: Severity;
  title: string;
  description: string;
  recommendation: string;
  estimatedFixTime: string;
  source: "lighthouse" | "axe" | "security";
  evidence: Record<string, unknown>;
};
export type ScanResult = {
  scores: {
    performance: number;
    seo: number;
    accessibility: number;
    security: number;
    mobile: number;
    ux: number;
    overall: number;
  };
  issues: NormalizedIssue[];
};

const score = (value: unknown) => Math.round((typeof value === "number" ? value : 0) * 100);
const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

export async function scanHomepage(target: NormalizedUrl): Promise<ScanResult> {
  // A complete Lighthouse run needs a Chromium cold start plus two page loads.
  // That exceeds the 30-second Netlify function ceiling on many real sites.
  // The serverless audit deliberately uses deterministic HTTP checks instead,
  // while local development retains the full browser-backed audit below.
  if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return scanServerlessHomepage(target);
  }
  return scanBrowserHomepage(target);
}

async function scanBrowserHomepage(target: NormalizedUrl): Promise<ScanResult> {
  // Keep these imports statically analyzable so Nitro includes them in the
  // generated Netlify function instead of looking for the project node_modules
  // directory at runtime.
  const chromeLauncher = await import("chrome-launcher");
  const lighthouseModule = await import("lighthouse");
  const puppeteer = await import("puppeteer-core");
  const axe = await import("axe-core");
  const lighthouseLoadTimeout = 45_000;
  const axeNavigationTimeout = 30_000;
  const securityFetchTimeout = 20_000;
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const lighthouse = lighthouseModule.default;
    const lighthouseResult = await lighthouse(target.url, {
      port: chrome.port,
      output: "json",
      onlyCategories: ["performance", "seo", "accessibility", "best-practices"],
      disableStorageReset: true,
      maxWaitForLoad: lighthouseLoadTimeout,
      maxWaitForFcp: 20_000,
      pauseAfterLoadMs: 1_000,
    });
    if (!lighthouseResult) throw new Error("Lighthouse did not return a result");
    const lhr = asRecord(lighthouseResult.lhr);
    const categories = asRecord(lhr.categories);
    const audits = asRecord(lhr.audits);
    const performance = score(asRecord(categories.performance).score);
    const seo = score(asRecord(categories.seo).score);
    const accessibility = score(asRecord(categories.accessibility).score);
    const bestPractices = score(asRecord(categories["best-practices"]).score);
    const browser = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });
    let axeResults: Record<string, unknown> = {};
    try {
      const page = await browser.newPage();
      try {
        // networkidle2 frequently waits on analytics/chat widgets forever.
        // DOM content is sufficient for Axe's DOM-based rules.
        await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: axeNavigationTimeout });
        const axeSource = axe.default.source ?? axe.source;
        await page.evaluate(axeSource);
        axeResults = await page.evaluate(async () =>
          (
            globalThis as unknown as { axe: { run: () => Promise<Record<string, unknown>> } }
          ).axe.run(),
        );
      } catch (error) {
        // Lighthouse data is still useful if the optional second accessibility
        // pass cannot finish before the serverless deadline.
        console.warn("[scan] Axe pass skipped", error);
      } finally {
        await page.close().catch(() => undefined);
      }
    } finally {
      await browser.disconnect();
    }
    const securityHeaders = [
      "strict-transport-security",
      "content-security-policy",
      "x-frame-options",
    ];
    let securityMissing = securityHeaders;
    try {
      const response = await fetch(target.url, {
        redirect: "follow",
        signal: AbortSignal.timeout(securityFetchTimeout),
      });
      securityMissing = securityHeaders.filter((header) => !response.headers.get(header));
    } catch (error) {
      // A failed passive header check must not discard an otherwise completed
      // browser audit. Record the headers as unavailable/missing instead.
      console.warn("[scan] Security header check skipped", error);
    }
    const security = Math.round(
      (((target.url.startsWith("https://") ? 1 : 0) +
        (securityHeaders.length - securityMissing.length) / securityHeaders.length) /
        2) *
        100,
    );
    const issues: NormalizedIssue[] = [];
    for (const violation of ((axeResults.violations as unknown[]) ?? []).slice(0, 20)) {
      const item = asRecord(violation);
      const nodes = Array.isArray(item.nodes) ? item.nodes : [];
      const impact = String(item.impact ?? "moderate");
      issues.push({
        category: "accessibility",
        severity:
          impact === "critical"
            ? "critical"
            : impact === "serious"
              ? "high"
              : impact === "moderate"
                ? "medium"
                : "low",
        title: String(item.help ?? item.id),
        description: String(item.description ?? "Accessibility violation"),
        recommendation: String(item.helpUrl ?? "Resolve the reported accessibility rule"),
        estimatedFixTime: "15–60 min",
        source: "axe",
        evidence: {
          ruleId: item.id,
          helpUrl: item.helpUrl,
          affectedElements: nodes.length,
          selector: asRecord(nodes[0]).target,
        },
      });
    }
    for (const [id, auditValue] of Object.entries(audits)) {
      const audit = asRecord(auditValue);
      const details = asRecord(audit.details);
      if (
        details.type === "opportunity" &&
        typeof audit.numericValue === "number" &&
        audit.numericValue > 0
      )
        issues.push({
          category: "performance",
          severity: audit.numericValue > 1000 ? "high" : "medium",
          title: String(audit.title ?? id),
          description: String(audit.description ?? "Lighthouse opportunity"),
          recommendation: "Review and implement the Lighthouse recommendation.",
          estimatedFixTime: "30–90 min",
          source: "lighthouse",
          evidence: {
            auditId: id,
            savingsMs: audit.numericValue,
            displayValue: audit.displayValue,
          },
        });
    }
    for (const header of securityMissing)
      issues.push({
        category: "security",
        severity: header === "content-security-policy" ? "high" : "medium",
        title: `Missing ${header} header`,
        description: "The homepage response does not include this passive security header.",
        recommendation: `Configure the ${header} response header.`,
        estimatedFixTime: "15–30 min",
        source: "security",
        evidence: { header },
      });
    const mobile = performance;
    const ux = Math.round((accessibility + bestPractices + seo) / 3);
    return {
      scores: {
        performance,
        seo,
        accessibility,
        security,
        mobile,
        ux,
        overall: Math.round((performance + seo + accessibility + security + mobile + ux) / 6),
      },
      issues: issues.slice(0, 40),
    };
  } finally {
    // Chrome Launcher can fail while removing its Windows temporary profile
    // after the browser has already stopped. Cleanup must not invalidate a
    // completed audit.
    try {
      chrome.kill();
    } catch {
      // The browser is already stopped; there is no audit result to discard.
    }
  }
}

async function scanServerlessHomepage(target: NormalizedUrl): Promise<ScanResult> {
  const startedAt = Date.now();
  const securityHeaders = ["strict-transport-security", "content-security-policy", "x-frame-options"];
  try {
    const response = await fetch(target.url, {
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
      headers: { "user-agent": "FixMySiteAI/1.0 (+website audit)" },
    });
    const html = await response.text();
    const elapsedMs = Date.now() - startedAt;
    const hasTitle = /<title[^>]*>\s*[^<]+/i.test(html);
    const hasDescription = /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+/i.test(html);
    const hasH1 = /<h1\b[^>]*>\s*[^<]+/i.test(html);
    const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
    const hasLanguage = /<html[^>]+\blang=["'][^"']+/i.test(html);
    const imagesWithoutAlt = (html.match(/<img\b(?![^>]*\balt=)[^>]*>/gi) ?? []).length;
    const securityMissing = securityHeaders.filter((header) => !response.headers.get(header));
    const seoChecks = [hasTitle, hasDescription, hasH1];
    const accessibilityChecks = [hasLanguage, imagesWithoutAlt === 0];
    const performance = Math.max(20, Math.min(100, Math.round(100 - elapsedMs / 70)));
    const seo = Math.round((seoChecks.filter(Boolean).length / seoChecks.length) * 100);
    const accessibility = Math.round(
      (accessibilityChecks.filter(Boolean).length / accessibilityChecks.length) * 100,
    );
    const security = Math.round(
      (((target.url.startsWith("https://") ? 1 : 0) +
        (securityHeaders.length - securityMissing.length) / securityHeaders.length) /
        2) *
        100,
    );
    const issues: NormalizedIssue[] = [];
    const addIssue = (category: string, title: string, description: string, recommendation: string) =>
      issues.push({
        category,
        severity: "medium",
        title,
        description,
        recommendation,
        estimatedFixTime: "15–30 min",
        source: category === "security" ? "security" : "lighthouse",
        evidence: {},
      });
    if (!hasTitle) addIssue("seo", "Missing page title", "The homepage has no usable title tag.", "Add a concise, unique title tag.");
    if (!hasDescription)
      addIssue("seo", "Missing meta description", "The homepage has no meta description.", "Add a clear meta description for search results.");
    if (!hasH1) addIssue("seo", "Missing primary heading", "The homepage has no visible H1 heading.", "Add one descriptive H1 heading.");
    if (!hasViewport) addIssue("mobile", "Missing viewport setting", "The homepage may not scale correctly on mobile.", "Add a responsive viewport meta tag.");
    if (!hasLanguage) addIssue("accessibility", "Missing page language", "The HTML document has no language declaration.", "Set the lang attribute on the html element.");
    if (imagesWithoutAlt > 0)
      addIssue("accessibility", "Images missing alternative text", `${imagesWithoutAlt} image(s) have no alt attribute.`, "Add meaningful alt text or empty alt attributes for decorative images.");
    for (const header of securityMissing)
      addIssue("security", `Missing ${header} header`, "The homepage response does not include this security header.", `Configure the ${header} response header.`);
    const mobile = hasViewport ? Math.round((performance + accessibility) / 2) : Math.round((performance + accessibility) / 3);
    const ux = Math.round((accessibility + seo + performance) / 3);
    return {
      scores: { performance, seo, accessibility, security, mobile, ux, overall: Math.round((performance + seo + accessibility + security + mobile + ux) / 6) },
      issues: issues.slice(0, 40),
    };
  } catch (error) {
    console.error("[scan] Serverless homepage check failed", error);
    return {
      scores: { performance: 0, seo: 0, accessibility: 0, security: 0, mobile: 0, ux: 0, overall: 0 },
      issues: [
        {
          category: "availability",
          severity: "high",
          title: "Homepage could not be reached",
          description: "The audit service could not fetch the homepage within 12 seconds.",
          recommendation: "Confirm the URL is publicly accessible and try again.",
          estimatedFixTime: "15–30 min",
          source: "security",
          evidence: {},
        },
      ],
    };
  }
}
