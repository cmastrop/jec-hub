import { Dropbox } from "dropbox";

export function getDropboxClient(accessToken: string): Dropbox {
  return new Dropbox({ accessToken });
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
  const dbx = getDropboxClient(accessToken);
  const response = await dbx.filesDownload({ path });
  const fileBinary = (response.result as unknown as { fileBinary: ArrayBuffer })
    .fileBinary;
  return {
    data: Buffer.from(fileBinary),
    name: response.result.name,
  };
}

function extractFolder(path: string): string {
  const parts = path.split("/");
  parts.pop();
  return parts.join("/") || "/";
}
