import type { EmscriptenFS } from "qgis-js";

import { Project, PROJECTS_UPLOAD_DIR } from "./Project";

import { Folder, flatFolders, flatFiles } from "./FileSystem";

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
    sha: string;
  }>;
  return content;
}

/**
 * Fetches a list of relative file paths in a GitHub repository tree via the GitHub REST API.
 *
 * Be aware of the GitHub API rate limits: https://docs.github.com/en/rest/overview/rate-limits-for-the-rest-api
 *
 * @param owner The owner of the repository.
 * @param repo The name of the repository.
 * @param sha The SHA of the tree to fetch the files from.
 * @returns A Promise that resolves to an array of relative file paths in the specified tree.
 */
export async function fetchGithubTreeFiles(
  owner: string,
  repo: string,
  sha: string,
) {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`;
  const response = await fetch(url);
  const content = (await response.json()) as {
    tree: {
      type: "tree" | "blob";
      path: string;
    }[];
  };
  return content.tree
    .filter((entry) => entry.type === "blob")
    .map((entry) => entry.path);
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

/**
 * Maps an array of file paths to a "Folder" structure.
 *
 * @param name - The name of the root folder.
 * @param path - The path of the root folder.
 * @param files - An array of relative file paths.
 * @returns The root folder with the mapped "Folder" structure.
 */
export function mapFilesToFolder(
  name: string,
  path: string,
  files: string[],
): Folder {
  const root: File | Folder = { name, path, type: "Folder", entries: [] };
  files.sort().forEach((path) => {
    const parts = path.split("/");
    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const entry = current.entries.find((entry) => entry.name === part);
      if (entry) {
        current = entry as Folder;
      } else {
        const folder: Folder = {
          name: part,
          path: current.path + "/" + part,
          type: "Folder",
          entries: [],
        };
        current.entries.push(folder);
        current = folder;
      }
    }
    current.entries.push({
      name: parts[parts.length - 1],
      path,
      type: "File",
    });
  });
  return root;
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
    return [this.path, ...flatFolders(this.folder.entries, this.path)];
  }

  getFiles(): string[] {
    return flatFiles(this.folder.entries, this.path);
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
    // ensure directories exist
    this.ensureDirectories();
    // write files to the runtime FS
    for (const file of this.getFiles()) {
      const data = new Uint8Array(await downloads[file]);
      this.FS.writeFile(PROJECTS_UPLOAD_DIR + "/" + file, data);
    }
  }
}
