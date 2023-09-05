import { EmscriptenFS } from "../emscripten";

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
    const subFoldersToCreate: string[] = [this.name];
    for (const entry of this.entries) {
      const path = (entry as FileWithDirectoryAndFileHandle).webkitRelativePath;
      const parts = path.split("/");
      for (let i = 1; i < parts.length - 1; i++) {
        const folder = parts.slice(0, i + 1).join("/");
        if (!subFoldersToCreate.includes(folder)) {
          subFoldersToCreate.push(folder);
        }
      }
    }
    return subFoldersToCreate;
  }

  getFiles(): string[] {
    return this.entries.map((e) => e.webkitRelativePath);
  }

  async uploadProject(): Promise<void> {
    // create directories in the runtime FS
    for (const directory of this.getDirectories()) {
      this.FS.mkdir(PROJECTS_UPLOAD_DIR + "/" + directory);
    }
    // write files to the runtime FS
    for (const file of this.entries) {
      this.FS.writeFile(
        PROJECTS_UPLOAD_DIR + "/" + file.webkitRelativePath,
        new Uint8Array(await file.arrayBuffer()),
      );
    }
  }
}
