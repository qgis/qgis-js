export type FileSystemEntryType = "File" | "Folder";

export interface FileSystemEntry {
  name: string;
  path: string;
  type: FileSystemEntryType;
}

export interface File extends FileSystemEntry {}

export interface Folder extends FileSystemEntry {
  entries: FolderEntries;
}

export type FolderEntries = Array<File | Folder>;

/**
 * Flattens the "Folder" hierarchy and returns an array of folder paths.
 *
 * @param entries - The entries of the root folder.
 * @param basePath - The base path of the root folder.
 * @returns An array of folder paths.
 */
export function flatFolders(
  entries: Folder["entries"],
  basePath: string,
): string[] {
  return entries.reduce<string[]>((acc, entry) => {
    if (entry.type === "Folder") {
      return acc.concat([
        basePath + "/" + entry.name,
        ...flatFolders((entry as Folder).entries, basePath + "/" + entry.name),
      ]);
    } else {
      return acc;
    }
  }, []);
}

/**
 * Flattens the files in a "Folder" hierarchy and returns an array of file paths.
 *
 * @param entries - The entries of the root folder.
 * @param basePath - The base path of the root folder.
 * @returns An array of file paths.
 */
export function flatFiles(
  entries: Folder["entries"],
  basePath: string,
): string[] {
  return entries.reduce<string[]>((acc, entry) => {
    if (entry.type === "Folder") {
      return acc.concat(
        flatFiles((entry as Folder).entries, basePath + "/" + entry.name),
      );
    } else {
      return acc.concat(basePath + "/" + entry.name);
    }
  }, []);
}
