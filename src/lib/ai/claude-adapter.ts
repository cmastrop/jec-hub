import Anthropic from "@anthropic-ai/sdk";
import { CHORD_EXTRACTION_PROMPT, CHORD_EXTRACTION_PDF_PROMPT } from "@/lib/gemini/prompts";
import type { AIExtractor, ExtractionResult } from "./types";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export class ClaudeAdapter implements AIExtractor {
  provider = "claude" as const;

  async extractChordPro(
    fileData: Buffer | Uint8Array,
    mimeType: string
  ): Promise<ExtractionResult> {
    try {
      const anthropic = getClient();
      const base64Data = Buffer.from(fileData).toString("base64");

      const isPdf = mimeType === "application/pdf";
      const prompt = isPdf ? CHORD_EXTRACTION_PDF_PROMPT : CHORD_EXTRACTION_PROMPT;

      // Build the content block based on file type
      const fileContent: Anthropic.Messages.ContentBlockParam = isPdf
        ? {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: base64Data,
            },
          } as unknown as Anthropic.Messages.ContentBlockParam
        : {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: base64Data,
            },
          };

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [fileContent, { type: "text", text: prompt }],
          },
        ],
      });

      const textBlock = response.content.find((b) => b.type === "text");
      const text = textBlock && "text" in textBlock ? textBlock.text : "";

      if (!text || text.trim().length === 0) {
        return { chordpro: "", success: false, error: "Claude returned empty response", provider: "claude" };
      }

      // Clean up response - remove markdown code blocks if present
      let cleaned = text.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```(?:chordpro)?\n?/, "").replace(/\n?```$/, "");
      }

      return { chordpro: cleaned, success: true, provider: "claude" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { chordpro: "", success: false, error: message, provider: "claude" };
    }
  }
}
