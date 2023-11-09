import { QGIS_JS_VERSION, qgis } from "qgis-js";

import { QgisApi } from "qgis-js";

import { useProjects } from "@qgis-js/utils";
import type { Project } from "@qgis-js/utils";

import { jsDemo } from "./js";

import { olDemoXYZ, olDemoCanvas } from "./ol";
import { layersControl } from "./layers";

const printVersion = true;
const apiTest = false;
const timer = false;

function isDev() {
  // @ts-ignore
  return import.meta.env.MODE === "development";
}

const GITHUB_REPOS: Array<{
  owner: string;
  repo: string;
  path?: string;
  branch?: string;
  prefix?: string;
}> = [
  {
    owner: "boardend",
    repo: "qgis-js-projects",
    path: "/demo",
    branch: "main",
    prefix: "Demo: ",
  },
  ...(isDev()
    ? [
        {
          owner: "boardend",
          repo: "qgis-js-projects",
          path: "/test",
          branch: "main",
          prefix: "Test: ",
        },
      ]
    : []),
];

function testApi(api: QgisApi) {
  const p1 = new api.PointXY();
  console.dir(p1);

  const r1 = new api.Rectangle();
  console.log(r1);

  const r2 = new api.Rectangle(1, 2, 3, 4);
  console.log(r2.xMinimum, r2.yMinimum, r2.xMaximum, r2.yMaximum);
  r2.scale(5);
  console.log(r2.xMinimum, r2.yMinimum, r2.xMaximum, r2.yMaximum);
}

async function initDemo() {
  if (printVersion) {
    console.log(`qgis-js (${QGIS_JS_VERSION})`);
  }

  const statusControl = document.getElementById("status")! as HTMLDivElement;
  const projectControl = document.getElementById("project")! as HTMLDivElement;

  let isError = false;
  const onStatus = (status: string) => {
    if (isError) return;
    (statusControl.firstElementChild! as HTMLDivElement).innerHTML = status;
  };
  const onError = (error: Error | any) => {
    isError = true;
    console.error(error);
    const message =
      "" + error && error["message"] ? error["message"] : "Runtime error";
    projectControl.style.visibility = "none";
    statusControl.style.display = "auto";
    statusControl.innerHTML = `<div class="alert alert-danger" role="alert">
      <b style="color: red">Error:&nbsp;</b>
      ${message}
    </div>`;
  };
  const onReady = () => {
    statusControl.style.display = "none";
    projectControl.style.visibility = "visible";
  };

  try {
    // boot the runtime
    if (timer) console.time("boot");
    const { api, fs } = await qgis({
      prefix: "/qgis-js/assets/wasm",
      onStatus: (status: string) => {
        onStatus(status);
      },
    });
    if (timer) console.timeEnd("boot");

    // prepare project management
    onStatus("Loading projects...");
    const updateCallbacks: Array<Function> = [];
    const renderCallbacks: Array<Function> = [];

    const {
      openProject,
      loadLocalProject,
      loadRemoteProjects,
      loadGithubProjects,
    } = useProjects(fs, (project: string) => {
      if (timer) console.time("project");
      api.loadProject(project);
      if (timer) console.timeEnd("project");
      // update all demos
      setTimeout(() => {
        updateCallbacks.forEach((update) => update());
      }, 0);
    });

    const projects = new Map<string, () => Project | Promise<Project>>();
    const projectSelect = document.getElementById(
      "projects",
    )! as HTMLSelectElement;
    projectSelect.addEventListener("change", () => {
      const project = projects.get(projectSelect.value);
      if (project) {
        openProject(project());
      }
    });
    const listProject = (
      name: string,
      projectLoadFunciton: () => Project | Promise<Project>,
    ) => {
      projects.set(name, projectLoadFunciton);
      const option = document.createElement("option");
      option.value = name;
      option.text = name;
      projectSelect.add(option, null);
    };
    document.getElementById("local-project")!.onclick = async function () {
      const localProject = await loadLocalProject();
      await openProject(localProject);
      listProject(localProject.name, () => localProject);
      projectSelect.value = localProject.name;
    };

    // load remote projects
    if (timer) console.time("remote projects");
    // - remote projects
    const remoteProjects = await loadRemoteProjects();
    remoteProjects.forEach((project) =>
      listProject(project.name, () => project),
    );
    if (timer) console.timeEnd("remote projects");

    // - github projects
    if (timer) console.time("github projects");
    for (const repo of GITHUB_REPOS) {
      const githubProjects = await loadGithubProjects(
        repo.owner,
        repo.repo,
        repo.path,
        repo.branch,
      );
      Object.entries(githubProjects).forEach(([name, projectLoadPromise]) => {
        listProject((repo.prefix || "") + name, projectLoadPromise);
      });
    }
    if (timer) console.timeEnd("github projects");

    // open first project
    onStatus("Opening first project...");
    await openProject(remoteProjects[0]);

    // API tests
    if (apiTest) testApi(api);

    // paint a first dummy frame
    onStatus("Rendering first frame...");
    if (timer) console.time("first frame");
    await api.renderImage(api.srid(), api.fullExtent(), 42, 42, 1);
    if (timer) console.timeEnd("first frame");

    onReady();

    const layersControlDiv = document.getElementById(
      "layers-control",
    ) as HTMLDivElement | null;
    if (layersControlDiv) {
      updateCallbacks.push(
        layersControl(layersControlDiv, api, () => {
          // update all demos
          setTimeout(() => {
            renderCallbacks.forEach((render) => render());
          }, 0);
        }),
      );
    }

    // js demo
    const jsDemoCanvas = document.getElementById(
      "js-demo-canvas",
    ) as HTMLCanvasElement | null;
    if (jsDemoCanvas) {
      const { update, render } = jsDemo(jsDemoCanvas, api);
      updateCallbacks.push(update);
      renderCallbacks.push(render);
      // ensure js demo gets refreshed when the section gets visible
      const jsButton = document.getElementById("tab1") as HTMLInputElement;
      jsButton.addEventListener("change", () => {
        if (jsButton.checked) update();
      });
    }

    // ol demo
    const olDemoXYZDiv = document.getElementById(
      "ol-demo-xyz",
    ) as HTMLDivElement | null;
    if (olDemoXYZDiv) {
      const { update, render } = olDemoXYZ(olDemoXYZDiv, api);
      updateCallbacks.push(update);
      renderCallbacks.push(render);
    }

    const olDemoCanvasDiv = document.getElementById(
      "ol-demo-canvas",
    ) as HTMLDivElement | null;
    if (olDemoCanvasDiv) {
      const { update, render } = olDemoCanvas(olDemoCanvasDiv, api);
      updateCallbacks.push(update);
      renderCallbacks.push(render);
    }
  } catch (error) {
    onError(error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initDemo();
});
