import { Folder } from "qgis-js/src/fs/FileSystem";

import { PROJECTS_UPLOAD_DIR, Project } from "qgis-js/src/fs/Project";
import {
  LocalEntries,
  LocalProject,
  openLocalDirectory,
} from "qgis-js/src/fs/LocalProject";
import { RemoteProject } from "qgis-js/src/fs/RemoteProject";

import { EmscriptenFS } from "qgis-js/src/emscripten";

export function useProjects(
  fs: EmscriptenFS,
  onProjectLoaded: (projectFile: string) => void,
) {
  // ensure PROJECTS_UPLOAD_DIR (and its parent dirs) exist
  let projectUploadDirs = PROJECTS_UPLOAD_DIR.split("/");
  for (let i = 1; i < projectUploadDirs.length; i++) {
    fs.mkdir(projectUploadDirs.slice(0, i + 1).join("/"));
  }

  const openProject = async (project: Project) => {
    if (!project) {
      return;
    } else {
      if (!project.isValid()) {
        throw new Error(`Project "${project.name}" is not valid`);
      }
      if (!project.isProjectUploaded()) {
        await project.uploadProject();
      }
      loadProject(project);
    }
  };

  const loadProject = (project: Project) => {
    const projectFile = PROJECTS_UPLOAD_DIR + "/" + project.getProjectFile();
    onProjectLoaded(projectFile);
  };

  const loadLocalProject = () =>
    new Promise<LocalProject>(async (resolve) => {
      const entries: LocalEntries = (await openLocalDirectory({
        recursive: true,
        mode: "read",
      })) as LocalEntries; //TODO: This cast is probably not working when "fs-browser-fs-access" is using the fallback implementation
      const localProject = new LocalProject(fs, entries);
      resolve(localProject);
    });

  const loadRemoteProjects = () =>
    new Promise<RemoteProject[]>((resolve) => {
      // @ts-ignore (provided by the DirectoryListingPlugin (see vite.config.ts))
      import(`public/projects`).then((folder) => {
        resolve(
          (folder.default as Folder).entries
            .filter((entry) => entry.type === "Folder")
            .map((entry) => new RemoteProject(fs, entry as Folder)),
        );
      });
    });

  return {
    openProject,
    loadLocalProject,
    loadRemoteProjects,
  };
}
