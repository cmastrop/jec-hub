import { Dropbox } from "dropbox";
import { createAdminClient } from "@/lib/supabase/admin";
import { refreshAccessToken } from "./oauth";

export function getDropboxClient(accessToken: string): Dropbox {
  return new Dropbox({ accessToken, fetch: globalThis.fetch.bind(globalThis) });
}

/**
 * Get a fresh Dropbox access token for a user using their stored refresh token.
 * This is the key function that eliminates token expiration issues.
 */
export async function getFreshAccessToken(userId: string): Promise<string> {
  const admin = createAdminClient();
  const { data: tokenRow } = await admin
    .from("dropbox_tokens")
    .select("refresh_token")
    .eq("user_id", userId)
    .single();

  if (!tokenRow?.refresh_token) {
    throw new Error("DROPBOX_NOT_CONNECTED");
  }

  const { access_token } = await refreshAccessToken(tokenRow.refresh_token);
  return access_token;
}

export interface DropboxFileEntry {
  path: string;
  name: string;
  size: number;
  folder: string;
}

export async function listAllDropboxFiles(
  accessToken: string
): Promise<DropboxFileEntry[]> {
  const dbx = getDropboxClient(accessToken);
  const allFiles: DropboxFileEntry[] = [];

  let result = await dbx.filesListFolder({ path: "", recursive: true });

  for (const entry of result.result.entries) {
    if (entry[".tag"] === "file") {
      allFiles.push({
        path: entry.path_lower || entry.path_display || "",
        name: entry.name,
        size: (entry as unknown as { size: number }).size || 0,
        folder: extractFolder(entry.path_lower || ""),
      });
    }
  }

  while (result.result.has_more) {
    result = await dbx.filesListFolderContinue({
      cursor: result.result.cursor,
    });
    for (const entry of result.result.entries) {
      if (entry[".tag"] === "file") {
        allFiles.push({
          path: entry.path_lower || entry.path_display || "",
          name: entry.name,
          size: (entry as unknown as { size: number }).size || 0,
          folder: extractFolder(entry.path_lower || ""),
        });
      }
    }
  }

  return allFiles;
}

export async function downloadDropboxFile(
  accessToken: string,
  path: string
): Promise<{ data: Buffer; name: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s per file

  const res = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Dropbox-API-Arg": JSON.stringify({ path }),
    },
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Dropbox download failed: ${err}`);
  }

  const apiResult = res.headers.get("dropbox-api-result");
  const meta = apiResult ? JSON.parse(apiResult) : { name: path.split("/").pop() || "file" };
  const arrayBuffer = await res.arrayBuffer();

  return {
    data: Buffer.from(arrayBuffer),
    name: meta.name,
  };
}

function extractFolder(path: string): string {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/") || "/";
}
