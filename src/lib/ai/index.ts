import type { AIExtractor, AIProvider } from "./types";
import { GeminiAdapter } from "./gemini-adapter";
import { ClaudeAdapter } from "./claude-adapter";

export function getAIExtractor(provider: AIProvider = "gemini"): AIExtractor {
  switch (provider) {
    case "claude":
      return new ClaudeAdapter();
    case "gemini":
    default:
      return new GeminiAdapter();
  }
}

export type { AIProvider, ExtractionResult, AIExtractor } from "./types";
