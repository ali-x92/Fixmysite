import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import {
  aiFixContentSchema,
  aiGeneratedContentSchema,
  type AiFixContent,
  type AiGeneratedContent,
} from "@/features/analysis/ai-contracts";

import {
  buildFixInput,
  buildFixInstructions,
  buildSummaryInput,
  buildSummaryInstructions,
  type AiAuditInput,
} from "./prompts";

const AI_MODEL = "openai/gpt-oss-20b";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export interface AiService {
  generateSummary(input: AiAuditInput): Promise<AiGeneratedContent>;
  generateFix(input: AiAuditInput["issues"][number]): Promise<AiFixContent>;
}

export function createGroqService(): AiService | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  // The client is configured exclusively with Groq's endpoint and API key.
  // Its structured-output helper validates Groq responses against our Zod schemas.
  const groqClient = new OpenAI({
    apiKey,
    baseURL: GROQ_BASE_URL,
    maxRetries: 0,
    timeout: 20_000,
  });
  return {
    async generateSummary(input) {
      return requestWithRetry(() =>
        groqClient.responses
          .parse({
            model: AI_MODEL,
            store: false,
            instructions: buildSummaryInstructions(),
            input: buildSummaryInput(input),
            text: { format: zodTextFormat(aiGeneratedContentSchema, "website_audit_summary") },
          })
          .then((response) => {
            if (!response.output_parsed) throw new Error("Groq returned no structured summary");
            return aiGeneratedContentSchema.parse(response.output_parsed);
          }),
      );
    },
    async generateFix(input) {
      return requestWithRetry(() =>
        groqClient.responses
          .parse({
            model: AI_MODEL,
            store: false,
            instructions: buildFixInstructions(),
            input: buildFixInput(input),
            text: { format: zodTextFormat(aiFixContentSchema, "website_issue_fix") },
          })
          .then((response) => {
            if (!response.output_parsed) throw new Error("Groq returned no structured fix");
            return aiFixContentSchema.parse(response.output_parsed);
          }),
      );
    },
  };
}

async function requestWithRetry<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch {
    return request();
  }
}
