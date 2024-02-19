import { File, Folder } from "../../packages/qgis-js-utils";

import type { Plugin, ResolvedConfig } from "vite";

import { basename, resolve, join } from "path";
import { readdir } from "fs/promises";
import { Dirent } from "fs";

const FILTER_LIST = [".DS_Store", ".git", ".gitignore", ".env"];
const DIRECTORY_LISTING_FILENAME = "directory-listing.json";

let config: ResolvedConfig;

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
    configResolved(_config) {
      config = _config;
    },
    configureServer(server) {
      const dirs = directoriesToList.map(
        (directory) =>
          config.base +
          directory.replace(/^public\//, "") +
          `/${DIRECTORY_LISTING_FILENAME}`,
      );
      server.middlewares.use(async (req, res, next) => {
        if (req.url && dirs.includes(req.url)) {
          let dir = req.url;
          // remove potential base from start of the url
          if (dir.startsWith(config.base)) {
            dir = dir.slice(config.base.length);
          }
          // remove filename from url at the end
          dir = dir.slice(0, -`/${DIRECTORY_LISTING_FILENAME}`.length);
          const drectoryListing = await createDirectoryListing(
            join(process.cwd(), "public"),
            dir,
            ".",
          );
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(drectoryListing, null, 2));
        } else {
          next();
        }
      });
    },
    async generateBundle() {
      for (const dir of directoriesToList.map((directory) =>
        directory.replace(/^public\//, ""),
      )) {
        const drectoryListing = await createDirectoryListing(
          join(process.cwd(), "public"),
          dir,
          ".",
        );
        this.emitFile({
          type: "asset",
          fileName: dir + `/${DIRECTORY_LISTING_FILENAME}`,
          source: JSON.stringify(drectoryListing, null, 2),
        });
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
