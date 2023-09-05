import { File, Folder } from "../fs/FileSystem";

import type { Plugin } from "vite";

import { basename, resolve, join } from "path";
import { readdir } from "fs/promises";
import { Dirent } from "fs";

const FILTER_LIST = [".DS_Store", ".git", ".gitignore", ".env"];

export async function readDirectoryListing(
  directoryModule: any,
): Promise<Folder> {
  const directoryRaw = await directoryModule.default;
  return directoryRaw as Folder;
}

export default function DirectoryListingPlugin(
  directories: string | string[],
): Plugin {
  const directoriesToList =
    typeof directories === "string" ? [directories] : directories;
  for (const directory of directoriesToList) {
    if (!directory.startsWith("public/")) {
      throw new Error(
        `DirectoryListingPlugin: Directory ${directory} is not in the public folder`,
      );
    }
  }

  return {
    name: "DirectoryListingPlugin",
    enforce: "pre",
    resolveId(id: string) {
      if (directoriesToList.includes(id)) {
        return id;
      }
    },
    async load(id: string) {
      if (directoriesToList.includes(id)) {
        const drectoryListing = await createDirectoryListing(
          join(process.cwd(), "public"),
          id.replace("public/", ""),
          ".",
        );
        return (
          `export default ${JSON.stringify(drectoryListing, null, 2)}` + "\n"
        );
      }
    },
  };
}

async function readFolder(folder: string): Promise<Dirent[]> {
  return await readdir(folder, { withFileTypes: true });
}

async function createDirectoryListing(
  root: string,
  base: string,
  directory: string,
) {
  const directoryListing = await readFolder(join(root, base, directory));
  return directoryListing
    .filter((dirent) => dirent.isFile || dirent.isDirectory)
    .filter((dirent) => !FILTER_LIST.includes(dirent.name))
    .reduce(
      async (currentFolderPromise, entry: Dirent) => {
        const currentFolder = (await currentFolderPromise) as Folder;
        if (entry.isDirectory()) {
          currentFolder.entries.push(
            await createDirectoryListing(
              root,
              join(base, directory),
              entry.name,
            ),
          );
        } else {
          currentFolder.entries.push({
            name: entry.name,
            path: join(currentFolder.path, entry.name),
            type: "File",
          } as File);
        }
        return currentFolder;
      },
      Promise.resolve({
        name: basename(resolve(join(base, directory))),
        path: join(base, directory),
        type: "Folder",
        entries: [],
      } as Folder),
    );
}
