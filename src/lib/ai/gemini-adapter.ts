import { extractChordProFromImage } from "@/lib/gemini/extract";
import type { AIExtractor, ExtractionResult } from "./types";

export class GeminiAdapter implements AIExtractor {
  provider = "gemini" as const;

  async extractChordPro(
    fileData: Buffer | Uint8Array,
    mimeType: string
  ): Promise<ExtractionResult> {
    const result = await extractChordProFromImage(fileData, mimeType);
    return { ...result, provider: "gemini" };
  }
}
