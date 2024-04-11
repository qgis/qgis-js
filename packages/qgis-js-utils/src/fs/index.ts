import type { EmscriptenFS } from "qgis-js";

import { Folder } from "./FileSystem";

import { PROJECTS_UPLOAD_DIR, Project } from "./Project";
import { LocalEntries, LocalProject, openLocalDirectory } from "./LocalProject";
import { RemoteProject } from "./RemoteProject";
import {
  GithubProject,
  fetchGithubDirectory,
  fetchGithubTreeFiles,
  mapFilesToFolder,
} from "./GithubProject";

export function useProjects(
  fs: EmscriptenFS,
  onProjectLoaded: (projectFile: string) => void,
) {
  // ensure PROJECTS_UPLOAD_DIR (and its parent dirs) exist
  let projectUploadDirs = PROJECTS_UPLOAD_DIR.split("/");
  for (let i = 1; i < projectUploadDirs.length; i++) {
    fs.mkdir(projectUploadDirs.slice(0, i + 1).join("/"));
  }

  const openProject = async (project: Project | Promise<Project>) => {
    if (!project) {
      return;
    } else {
      if (project instanceof Promise) {
        project = await project;
      }

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
    new Promise<LocalProject>(async (resolve, reject) => {
      try {
        const entries: LocalEntries = (await openLocalDirectory({
          recursive: true,
          mode: "read",
        })) as LocalEntries; //TODO: This cast is probably not working when "fs-browser-fs-access" is using the fallback implementation
        const localProject = new LocalProject(fs, entries);
        resolve(localProject);
      } catch (error) {
        reject(error);
      }
    });

  const loadRemoteProjects = (
    remoteProjects: string | Folder = "./projects/directory-listing.json",
  ) =>
    new Promise<RemoteProject[]>(async (resolve, reject) => {
      // if remoteProjects is a string, try to fetch it
      if (typeof remoteProjects === "string") {
        try {
          const remoteProjectsResponse = await fetch(remoteProjects);
          const remoteProjectsResponseJson =
            await remoteProjectsResponse.json();
          remoteProjects = remoteProjectsResponseJson as Folder;
        } catch (error) {
          reject(error);
        }
      }
      // validate the remoteProjects
      resolve(
        (remoteProjects as Folder).entries
          .filter((entry) => entry.type === "Folder")
          .map((entry) => new RemoteProject(fs, entry as Folder)),
      );
    });

  const loadGithubProjects = (
    owner: string,
    repo: string,
    path: string = "/",
    branch: string = "main",
  ) =>
    new Promise<{ [key: string]: () => Promise<GithubProject> }>(
      async (resolve, reject) => {
        try {
          const projects = await fetchGithubDirectory(
            owner,
            repo,
            path,
            branch,
          );
          // check if the response got an error message
          if (!(projects instanceof Array)) {
            console.warn(projects);
            resolve({});
            return;
          } else {
            resolve(
              Object.fromEntries(
                projects
                  .filter((entry) => entry.type === "dir")
                  .map((entry) => {
                    return [
                      entry.name,
                      () => {
                        return new Promise<GithubProject>(async (resolve) => {
                          const files = await fetchGithubTreeFiles(
                            owner,
                            repo,
                            entry.sha,
                          );
                          resolve(
                            new GithubProject(
                              fs,
                              mapFilesToFolder(entry.name, entry.path, files),
                              owner,
                              repo,
                              branch,
                            ),
                          );
                        });
                      },
                    ];
                  }),
              ),
            );
          }
        } catch (error) {
          reject(error);
        }
      },
    );

  return {
    openProject,
    loadLocalProject,
    loadRemoteProjects,
    loadGithubProjects,
  };
}
