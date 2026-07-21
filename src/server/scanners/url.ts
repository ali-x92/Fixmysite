import { z } from "zod";

import { normalizeWebsiteUrl } from "@/features/analysis/contracts";

const privateIpv4 = /^(127\.|10\.|0\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[0-1])\.)/;

export const submittedUrlSchema = z
  .string()
  .trim()
  .transform(normalizeWebsiteUrl)
  .pipe(z.string().url())
  .transform((value, context) => {
    const url = new URL(value);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.hostname === "localhost" ||
      privateIpv4.test(url.hostname) ||
      url.hostname === "::1"
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only public HTTP(S) URLs are supported",
      });
      return z.NEVER;
    }
    url.hash = "";
    if (url.pathname === "/") url.pathname = "";
    return { url: url.toString().replace(/\/$/, ""), domain: url.hostname.toLowerCase() };
  });

export type NormalizedUrl = z.infer<typeof submittedUrlSchema>;
