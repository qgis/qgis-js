import type { EmscriptenFS } from "qgis-js";

import { Project, PROJECTS_UPLOAD_DIR } from "./Project";

import { Folder } from "./FileSystem";

export const GIT_DEFAULT_BRANCH = "main";

/**
 * Fetches the contents of a directory in a GitHub repository via the GitHub REST API.
 *
 * Be aware of the GitHub API rate limits: https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api
 *
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @param path The path to the directory to fetch. Defaults to the root directory.
 * @param branch The branch to fetch the directory from. Defaults to the default branch of the repository.
 * @returns A Promise that resolves to an array of objects representing the files and directories in the specified directory.
 */
export async function fetchGithubDirectory(
  owner: string,
  repo: string,
  path: string = "/",
  branch: string = GIT_DEFAULT_BRANCH,
) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents${path}?ref=${branch}`;
  const response = await fetch(url);
  const content = (await response.json()) as Array<{
    type: "file" | "dir";
    name: string;
    path: string;
  }>;
  return content;
}

/**
 * Fetches the content of a file from a GitHub repository via the GitHub REST API.
 *
 * Be aware of the GitHub API rate limits: https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api
 *
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @param path The path to the file. Defaults to the root directory.
 * @param branch The branch to fetch the file from. Defaults to the default branch of the repository.
 * @returns A Promise that resolves to the file content as a buffer.
 * @throws An error if the file content is not found.
 */
export async function fetchGithubFileContent(
  owner: string,
  repo: string,
  path: string = "/",
  branch: string = GIT_DEFAULT_BRANCH,
) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents${path}?ref=${branch}`;
  const response = await fetch(url);
  const file = (await response.json()) as {
    type: "file" | "dir";
    content?: string;
    download_url?: string;
  };
  if (file.content && file.content !== "") {
    return Uint8Array.from(atob(file.content), (c) => c.charCodeAt(0)).buffer;
  } else if (file.download_url && file.download_url !== "") {
    const response = await fetch(file.download_url);
    return response.arrayBuffer();
  } else {
    throw new Error("File content of " + path + " not found.");
  }
}

export class GithubProject extends Project {
  protected folder: Folder;
  protected path: string;

  protected owner: string;
  protected repo: string;
  protected branch: string;

  constructor(
    FS: EmscriptenFS,
    projectFolder: Folder,
    owner: string,
    repo: string,
    branch: string = GIT_DEFAULT_BRANCH,
  ) {
    super(FS, "Github");

    this.folder = projectFolder;

    this.name = projectFolder.name;
    this.path = projectFolder.path;

    this.owner = owner;
    this.repo = repo;
    this.branch = branch;
  }

  getDirectories(): string[] {
    return [
      this.path,
      ...this.folder.entries
        .filter((e) => e.type === "Folder")
        .map((e) => this.path + "/" + e.name),
    ];
  }

  getFiles(): string[] {
    return this.folder.entries
      .filter((e) => e.type === "File")
      .map((e) => this.path + "/" + e.name);
  }

  async uploadProject() {
    // prepare to download all files in parallel
    const downloads = Object.fromEntries(
      this.getFiles().map((file) => {
        return [
          file,
          new Promise<ArrayBuffer>(async (resolve, _reject) => {
            // note that we don't use fetchGithubFileContent here because of the GitHub API rate limits
            // instead we use the raw.githubusercontent.com URL directly
            const url = `https://raw.githubusercontent.com/${this.owner}/${this.repo}/${this.branch}/${file}`;
            const response = await fetch(url);
            resolve(response.arrayBuffer());
          }),
        ];
      }),
    );
    // wait for all the responses
    await Promise.all([Object.values(downloads)]);

    // create directories in the runtime FS
    for (const directory of this.getDirectories()) {
      let direcotryDirs = (PROJECTS_UPLOAD_DIR + "/" + directory).split("/");
      for (let i = 1; i < direcotryDirs.length; i++) {
        const dirToCreate = direcotryDirs.slice(0, i + 1).join("/");
        // @ts-ignore (FS by @types/emscripten is missing the analyzePath method...)
        const node = this.FS.analyzePath(dirToCreate, false);
        // @ts-ignore
        if (!node || !node.exists) {
          this.FS.mkdir(dirToCreate);
        }
      }
    }

    // write files to the runtime FS
    for (const file of this.getFiles()) {
      const data = new Uint8Array(await downloads[file]);
      this.FS.writeFile(PROJECTS_UPLOAD_DIR + "/" + file, data);
    }
  }
}
