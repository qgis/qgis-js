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
