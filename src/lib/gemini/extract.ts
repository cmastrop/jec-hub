import { getGeminiModel } from "./client";
import { CHORD_EXTRACTION_PROMPT, CHORD_EXTRACTION_PDF_PROMPT } from "./prompts";

interface ExtractionResult {
  chordpro: string;
  success: boolean;
  error?: string;
}

export async function extractChordProFromImage(
  imageData: Buffer | Uint8Array,
  mimeType: string = "image/jpeg"
): Promise<ExtractionResult> {
  try {
    const model = getGeminiModel();

    const base64Data = Buffer.from(imageData).toString("base64");

    const prompt = mimeType === "application/pdf"
      ? CHORD_EXTRACTION_PDF_PROMPT
      : CHORD_EXTRACTION_PROMPT;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ]);

    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      return { chordpro: "", success: false, error: "Gemini returned empty response" };
    }

    // Clean up response - remove markdown code blocks if present
    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:chordpro)?\n?/, "").replace(/\n?```$/, "");
    }

    return { chordpro: cleaned, success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { chordpro: "", success: false, error: message };
  }
}
