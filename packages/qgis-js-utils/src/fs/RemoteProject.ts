import type { EmscriptenFS } from "qgis-js";

import { Project, PROJECTS_UPLOAD_DIR } from "./Project";

import { Folder, flatFolders, flatFiles } from "./FileSystem";

export class RemoteProject extends Project {
  protected folder: Folder;
  protected path: string;

  private baseUrl: URL;

  constructor(FS: EmscriptenFS, basePath: string, projectFolder: Folder) {
    super(FS, "Remote");

    this.baseUrl = new URL(basePath);
    this.folder = projectFolder;

    const bsaeFolder = this.baseUrl.pathname.split("/").pop();

    this.name = projectFolder.name;
    this.path = projectFolder.path.replace(new RegExp(`^${bsaeFolder}\/`), "");
  }

  getDirectories(): string[] {
    return [this.path, ...flatFolders(this.folder.entries, this.path)];
  }

  getFiles(): string[] {
    return flatFiles(this.folder.entries, this.path);
  }

  async uploadProject() {
    // download all files in parallel
    const downloads = Object.fromEntries(
      this.getFiles().map((file) => {
        return [
          file,
          new Promise<ArrayBuffer>((resolve, _reject) => {
            const remoteUrl = new URL(`${this.baseUrl.href}/${file}`);
            fetch(remoteUrl).then((response) =>
              response.arrayBuffer().then((buffer) => {
                resolve(buffer);
              }),
            );
          }),
        ];
      }),
    );
    // wait for all responses
    await Promise.all([Object.values(downloads)]);
    // ensure directories exist
    this.ensureDirectories();
    // write files to the runtime FS
    for (const file of this.getFiles()) {
      const data = new Uint8Array(await downloads[file]);
      this.FS.writeFile(PROJECTS_UPLOAD_DIR + "/" + file, data);
    }
  }
}
