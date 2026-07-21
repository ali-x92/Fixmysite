import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { cpSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";

function copyLighthouseLocales(preset: string): Plugin {
  return {
    name: "copy-lighthouse-locales",
    apply: "build",
    // Run after Nitro's own `compiled` hook. Registering another `compiled`
    // hook in the Nitro config replaces the Netlify preset's hook, which is
    // responsible for creating the catch-all server function.
    closeBundle() {
      const functionDirectory =
        preset === "netlify"
          ? join(process.cwd(), ".netlify/functions-internal/server")
          : preset === "vercel"
            ? join(process.cwd(), ".vercel/output/functions/__server.func")
            : undefined;
      if (!functionDirectory) return;
      const librariesDirectory = join(functionDirectory, "_libs");
      // Vite invokes this hook for the client build before Nitro has generated
      // the server function. Only package assets after the function exists.
      if (!existsSync(librariesDirectory)) return;
      const source = join(process.cwd(), "node_modules/lighthouse/shared/localization/locales");
      const destination = join(librariesDirectory, "locales");
      const chromiumSource = join(process.cwd(), "node_modules/@sparticuz/chromium/bin");
      const chromiumDestination = join(functionDirectory, "node_modules/@sparticuz/chromium/bin");
      const flowReportSource = join(process.cwd(), "node_modules/lighthouse/flow-report/assets");
      const flowReportDestination = join(functionDirectory, "flow-report/assets");
      const reportAssetsSource = join(process.cwd(), "node_modules/lighthouse/report/assets");
      const reportAssetsDestination = join(functionDirectory, "assets");
      const reportScriptsSource = join(process.cwd(), "node_modules/lighthouse/dist/report");
      const reportScriptsDestination = join(functionDirectory, "dist/report");
      cpSync(source, destination, { recursive: true });
      // Nitro bundles Chromium's JavaScript loader, but its Brotli browser
      // files are runtime assets. Put them beside the generated function so
      // `chromium.executablePath()` can unpack the browser on Netlify.
      cpSync(chromiumSource, chromiumDestination, { recursive: true });
      // Lighthouse resolves these files from its bundled `_libs` module. Nitro
      // keeps the code but does not trace the non-code assets, so they must be
      // copied beside each generated serverless function.
      cpSync(flowReportSource, flowReportDestination, { recursive: true });
      cpSync(reportAssetsSource, reportAssetsDestination, { recursive: true });
      cpSync(reportScriptsSource, reportScriptsDestination, { recursive: true });
      patchLighthouseFlowAssetPath(librariesDirectory);
      if (!existsSync(join(destination, "ar.json"))) {
        throw new Error("Lighthouse locale assets were not copied into the Netlify function.");
      }
      if (!existsSync(join(chromiumDestination, "chromium.br"))) {
        throw new Error("Chromium browser assets were not copied into the Netlify function.");
      }
      if (
        !existsSync(join(flowReportDestination, "standalone-flow-template.html")) ||
        !existsSync(join(reportAssetsDestination, "styles.css")) ||
        !existsSync(join(reportAssetsDestination, "standalone-template.html")) ||
        !existsSync(join(reportScriptsDestination, "flow.js")) ||
        !existsSync(join(reportScriptsDestination, "standalone.js"))
      ) {
        throw new Error("Lighthouse report assets were not copied into the serverless function.");
      }
      console.info(
        `[${preset}] Included ${readdirSync(destination).filter((file) => file.endsWith(".json")).length} Lighthouse locale files.`,
      );
    },
  };
}

function patchLighthouseFlowAssetPath(librariesDirectory: string): void {
  const lighthouseBundle = readdirSync(librariesDirectory).find(
    (file) => file.startsWith("lighthouse+") && file.endsWith(".mjs"),
  );
  if (!lighthouseBundle) throw new Error("The bundled Lighthouse module was not found.");

  const bundlePath = join(librariesDirectory, lighthouseBundle);
  const source = readFileSync(bundlePath, "utf8");
  const expectedPath = "../../flow-report/assets";
  if (!source.includes(expectedPath)) {
    throw new Error("The Lighthouse flow-report asset reference could not be patched.");
  }
  // Nitro flattens `_libs` to the Netlify function root. Lighthouse's original
  // two-level path then escapes `/var/task`; use the sibling runtime asset path.
  writeFileSync(
    bundlePath,
    source
      .replaceAll(expectedPath, "../flow-report/assets")
      .replaceAll("../../dist/report", "../dist/report"),
  );
}

// Netlify is the supported production target for this project. Keeping the
// preset explicit guarantees Nitro emits Netlify's internal function manifest
// instead of relying on hosting-provider auto-detection.
const deploymentPreset = process.env.NITRO_PRESET ?? "netlify";

export default defineConfig({
  plugins: [
    tailwindcss(),
    ...tanstackStart({
      // This dashboard is authenticated and app-like. Rendering it as a SPA
      // avoids an SSR hydration dependency on Netlify's generated function
      // while preserving all server routes under /api for scanning and AI.
      spa: { enabled: true },
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    // Nitro writes Netlify's serverless function plus the static client assets.
    nitro({ preset: deploymentPreset }),
    react(),
    copyLighthouseLocales(deploymentPreset),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: { "@": `${process.cwd()}/src` },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  server: { host: "::", port: 8080 },
});
