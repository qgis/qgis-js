import { QGIS_JS_VERSION, qgis } from "qgis-js";

import { QgisApi } from "qgis-js";

import { Project } from "qgis-js/src/fs/Project";
import { useProjects } from "./fs";

import { jsDemo } from "./js";

import { QgisOpenLayers } from "@qgis-js/ol";
import { olDemoXYZ, olDemoCanvas } from "./ol";
import { layersControl } from "./layers";

const printVersion = true;
const apiTest = true;

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

  // boot the runtime
  console.time("boot");
  const { api, fs } = await qgis({
    prefix: "/assets/wasm",
  });
  console.timeEnd("boot");

  // prepare project management
  const updates: Array<Function> = [];
  const { openProject, loadLocalProject, loadRemoteProjects } = useProjects(
    fs,
    (project: string) => {
      console.time("project");
      api.loadProject(project);
      console.timeEnd("project");
      // update all demos
      setTimeout(() => {
        updates.forEach((update) => update());
      }, 0);
    },
  );
  const projects = new Map<string, Project>();
  const projectSelect = document.getElementById(
    "projects",
  )! as HTMLSelectElement;
  projectSelect.addEventListener("change", () => {
    const project = projects.get(projectSelect.value);
    if (project) {
      openProject(project);
    }
  });
  const listProject = (project: Project) => {
    projects.set(project.name, project);
    const option = document.createElement("option");
    option.value = project.name;
    option.text = project.name;
    projectSelect.add(option, null);
  };
  document.getElementById("local-project")!.onclick = async function () {
    const localProject = await loadLocalProject();
    await openProject(localProject);
    listProject(localProject);
    projectSelect.value = localProject.name;
  };

  // load remote projects
  console.time("remote projects");
  const remoteProjects = await loadRemoteProjects();
  remoteProjects.forEach((project) => listProject(project));
  console.timeEnd("remote projects");

  // open first project
  await openProject(remoteProjects[0]);

  // API tests
  if (apiTest) testApi(api);

  // paint a first dummy frame
  console.time("first frame");
  await api.renderImage(api.srid(), api.fullExtent(), 42, 42);
  console.timeEnd("first frame");

  const layersControlDiv = document.getElementById(
    "layers-control",
  ) as HTMLDivElement | null;
  if (layersControlDiv) {
    updates.push(
      layersControl(layersControlDiv, api, () => {
        // update all demos
        setTimeout(() => {
          updates.forEach((update) => update());
        }, 0);
      }),
    );
  }

  // js demo
  const jsDemoCanvas = document.getElementById(
    "js-demo-canvas",
  ) as HTMLCanvasElement;
  updates.push(jsDemo(jsDemoCanvas, api));

  // ol demo
  const qgisOl = new QgisOpenLayers();
  if (qgisOl) {
    const olDemoXYZDiv = document.getElementById(
      "ol-demo-xyz",
    ) as HTMLDivElement | null;
    if (olDemoXYZDiv) {
      updates.push(olDemoXYZ(olDemoXYZDiv, api, qgisOl));
    }

    const olDemoCanvasDiv = document.getElementById(
      "ol-demo-canvas",
    ) as HTMLDivElement | null;
    if (olDemoCanvasDiv) {
      updates.push(olDemoCanvas(olDemoCanvasDiv, api, qgisOl));
    }
  }
}

initDemo();
