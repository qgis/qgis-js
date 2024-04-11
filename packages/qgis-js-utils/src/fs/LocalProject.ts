import type { EmscriptenFS } from "qgis-js";

import { Project, PROJECTS_UPLOAD_DIR } from "./Project";

import {
  directoryOpen,
  FileWithDirectoryAndFileHandle,
} from "browser-fs-access";

export type LocalEntries = Array<FileWithDirectoryAndFileHandle>;

export { directoryOpen as openLocalDirectory };

export class LocalProject extends Project {
  protected entries: LocalEntries;

  constructor(FS: EmscriptenFS, entries: LocalEntries) {
    super(FS, "Local");

    this.entries = entries;

    const possibleNames = entries
      .map((e) => e.webkitRelativePath)
      .filter((p) => p && p.length > 0 && p.includes("/"))
      .map((p) => p.split("/", 1)[0]);

    if (possibleNames.length < 1) {
      throw new Error("Could not determine project name");
    }
    // just use the first possible name as final project name
    this.name = possibleNames[0];
  }

  getDirectories(): string[] {
    const subFoldersToCreate = new Set<string>();
    subFoldersToCreate.add(this.name);
    for (const entry of this.entries) {
      const path = (entry as FileWithDirectoryAndFileHandle).webkitRelativePath;
      subFoldersToCreate.add(path.substring(0, path.lastIndexOf("/")));
    }
    return Array.from(subFoldersToCreate);
  }

  getFiles(): string[] {
    return this.entries.map((e) => e.webkitRelativePath);
  }

  async uploadProject(): Promise<void> {
    // ensure directories exist
    this.ensureDirectories();
    // write files to the runtime FS
    for (const file of this.entries) {
      this.FS.writeFile(
        PROJECTS_UPLOAD_DIR + "/" + file.webkitRelativePath,
        new Uint8Array(await file.arrayBuffer()),
      );
    }
  }
}
