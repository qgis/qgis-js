import type { EmscriptenFS } from "qgis-js";

export type ProjectType = "Remote" | "Local" | "Github";

export const PROJECTS_UPLOAD_DIR = "/upload/projects";

export abstract class Project {
  protected FS;
  type: ProjectType;
  name!: string;

  constructor(FS: EmscriptenFS, type: ProjectType) {
    this.FS = FS;
    this.type = type;
  }

  abstract getDirectories(): string[];
  abstract getFiles(): string[];

  abstract uploadProject(): Promise<void>;

  isValid(): boolean {
    return this.getFiles().length > 0 && this.getProjectFile() !== undefined;
  }

  getProjectFile(): string | undefined {
    const candidates = this.getFiles().filter(
      (f) => f.endsWith(".qgs") || f.endsWith(".qgz"),
    );
    if (candidates.length == 1) {
      return candidates[0];
    } else if (candidates.length > 1) {
      console.warn("Found multiple project file candiates");
      return candidates[0];
    } else {
      return undefined;
    }
  }

  getDirectoriesToCreate(): string[] {
    const directories = new Set<string>();
    for (const directory of this.getDirectories()) {
      let direcotryDirs = directory.split("/");
      for (let i = 0; i < direcotryDirs.length; i++) {
        const dirToCreate = direcotryDirs.slice(0, i + 1).join("/");
        directories.add(dirToCreate);
      }
    }
    return Array.from(directories).sort();
  }

  ensureDirectories() {
    // create directories in the runtime FS (if not already existing)
    for (const directory of this.getDirectoriesToCreate()) {
      const dirToCreate = PROJECTS_UPLOAD_DIR + "/" + directory;
      // @ts-ignore (FS by @types/emscripten is missing the analyzePath method...)
      const node = this.FS.analyzePath(dirToCreate, false);
      // @ts-ignore
      if (!node || !node.exists) {
        this.FS.mkdir(dirToCreate);
      }
    }
  }

  isProjectUploaded() {
    return this.FS.readdir(PROJECTS_UPLOAD_DIR).includes(this.name);
  }
}
