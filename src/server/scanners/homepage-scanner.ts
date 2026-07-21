import type { Severity } from "@/server/db/database.types";
import { join } from "node:path";

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
  // Keep these imports statically analyzable so Nitro includes them in the
  // generated Netlify function instead of looking for the project node_modules
  // directory at runtime.
  const chromeLauncher = await import("chrome-launcher");
  const lighthouseModule = await import("lighthouse");
  const puppeteer = await import("puppeteer-core");
  const axe = await import("axe-core");
  const isServerless = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
  // Netlify stops this handler after 30 seconds. The audit deliberately uses
  // bounded waits so a slow third-party script on the target site cannot make
  // the entire analysis fail.
  const lighthouseLoadTimeout = isServerless ? 10_000 : 45_000;
  const axeNavigationTimeout = isServerless ? 7_000 : 30_000;
  const securityFetchTimeout = isServerless ? 7_000 : 20_000;
  const chromium = isServerless ? (await import("@sparticuz/chromium")).default : null;
  const chrome = await chromeLauncher.launch({
    // Netlify functions do not provide a system Chrome installation. The
    // packaged Chromium binary is only used there; local development retains
    // chrome-launcher's normal browser discovery.
    chromePath: chromium
      ? await chromium.executablePath(
          join(
            process.env.LAMBDA_TASK_ROOT ?? process.cwd(),
            "node_modules/@sparticuz/chromium/bin",
          ),
        )
      : undefined,
    chromeFlags: chromium
      ? chromium.args
      : ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const lighthouse = lighthouseModule.default;
    const lighthouseResult = await lighthouse(target.url, {
      port: chrome.port,
      output: "json",
      onlyCategories: ["performance", "seo", "accessibility", "best-practices"],
      disableStorageReset: true,
      maxWaitForLoad: lighthouseLoadTimeout,
      maxWaitForFcp: isServerless ? 8_000 : 20_000,
      pauseAfterLoadMs: isServerless ? 500 : 1_000,
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
