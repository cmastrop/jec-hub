export function getFileType(filename: string): string | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    pdf: "application/pdf",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    mp4: "video/mp4",
    wav: "audio/wav",
  };
  return map[ext || ""] || null;
}

export function isProcessableByGemini(mimeType: string | null): boolean {
  if (!mimeType) return false;
  return mimeType.startsWith("image/") || mimeType === "application/pdf";
}

export function toStoragePath(dropboxPath: string): string {
  return dropboxPath.replace(/^\//, "").toLowerCase();
}

export class RateLimiter {
  private timestamps: number[] = [];
  private dailyCount = 0;
  private dailyReset = Date.now() + 86400000;

  constructor(
    private maxPerMinute: number = 14,
    private maxPerDay: number = 1400
  ) {}

  async waitForSlot(): Promise<void> {
    if (Date.now() > this.dailyReset) {
      this.dailyCount = 0;
      this.dailyReset = Date.now() + 86400000;
    }
    if (this.dailyCount >= this.maxPerDay) {
      throw new Error("DAILY_LIMIT_REACHED");
    }

    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < 60000);

    if (this.timestamps.length >= this.maxPerMinute) {
      const oldest = this.timestamps[0];
      const waitMs = 60000 - (now - oldest) + 500;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    this.timestamps.push(Date.now());
    this.dailyCount++;
  }
}
