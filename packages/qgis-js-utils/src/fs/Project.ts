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

  isProjectUploaded() {
    return this.FS.readdir(PROJECTS_UPLOAD_DIR).includes(this.name);
  }
}
