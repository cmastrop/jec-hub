export type AIProvider = "gemini" | "claude";

export interface ExtractionResult {
  chordpro: string;
  success: boolean;
  error?: string;
  provider: AIProvider;
}

export interface AIExtractor {
  provider: AIProvider;
  extractChordPro(
    fileData: Buffer | Uint8Array,
    mimeType: string
  ): Promise<ExtractionResult>;
}
