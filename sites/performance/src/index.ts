import { qgis, QGIS_JS_VERSION } from "qgis-js";
import type { QgisApi, EmscriptenFS } from "qgis-js";

import { useProjects } from "@qgis-js/utils";
import type { Project } from "@qgis-js/utils";

let API: QgisApi;
let FS: EmscriptenFS;

const qgisJsDemoProjects = (path: string) => ({
  owner: "boardend",
  repo: "qgis-js-projects",
  path: "/" + path,
  branch: "main",
  prefix: `${path[0].toUpperCase()}${path.slice(1)}: `,
});

const GITHUB_REPOS: Array<{
  owner: string;
  repo: string;
  path?: string;
  branch?: string;
  prefix?: string;
}> = [qgisJsDemoProjects("performance")];

const PROJECTS = new Map<string, () => Project | Promise<Project>>();
let OPEN_PROJECT: any;

async function init() {
  // add option to boot input select
  const bootInput = document.querySelector("#boot-input") as HTMLSelectElement;
  // switching the Runtime is not supported yet
  bootInput.disabled = true;

  const option = document.createElement("option");
  option.value = "bundle";
  option.textContent = `Bundle (${QGIS_JS_VERSION})`;
  bootInput.appendChild(option);

  const response = await fetch(
    "https://api.github.com/repos/qgis/qgis-js/releases",
  );
  const json = await response.json();

  for (const release of json) {
    const option = document.createElement("option");
    option.value = release.tag_name;
    option.textContent = release.tag_name;
    bootInput.appendChild(option);
  }

  const btnBoot = document.querySelector("#boot");
  if (btnBoot) {
    btnBoot.removeAttribute("disabled");
  }
}
async function bootRuntime(_eClick: Event) {
  let qgisLoader;
  const runtime: string = (
    document.querySelector("#boot-input") as HTMLInputElement
  ).value;
  if (runtime === "bundle") {
    qgisLoader = qgis;
  } else {
    //TODO respect runtime selection and load npm packages from CDN
    /*
    //see https://github.com/emscripten-core/emscripten/issues/8338
    const { qgis } = await import(
      "https://cdn.jsdelivr.net/npm/qgis-js@0.0.1/dist/qgis.js"
    );
    */
    qgisLoader = qgis;
  }

  measureStart("boot");
  const { api, fs } = await qgisLoader({
    prefix: "/assets/wasm",
  });
  measureEnd("boot");

  API = api;
  FS = fs;

  const btnTest = document.querySelector("#project");
  if (btnTest) {
    btnTest.removeAttribute("disabled");
  }

  const { openProject, loadRemoteProjects, loadGithubProjects } = useProjects(
    FS,
    (project: string) => {
      measureStart("project");
      API.loadProject(project);
      measureEnd("project");

      const btnFrame = document.querySelector("#frame");
      if (btnFrame) {
        btnFrame.removeAttribute("disabled");
      }
    },
  );

  OPEN_PROJECT = openProject;

  const remoteProjects = await loadRemoteProjects();
  remoteProjects.forEach((project) =>
    PROJECTS.set(project.name, () => project),
  );

  for (const repo of GITHUB_REPOS) {
    try {
      const githubProjects = await loadGithubProjects(
        repo.owner,
        repo.repo,
        repo.path,
        repo.branch,
      );
      Object.entries(githubProjects).forEach(([name, projectLoadPromise]) => {
        PROJECTS.set(name, projectLoadPromise);
      });
    } catch (error) {
      console.warn(
        `Unable to load GitHub project "${repo.owner}/${repo.repo}"`,
        error,
      );
    }
  }

  const projectInput = document.querySelector(
    "#project-input",
  ) as HTMLInputElement;
  for (const project of PROJECTS.keys()) {
    const option = document.createElement("option");
    option.value = project;
    option.textContent = project;
    projectInput.appendChild(option);
  }
  projectInput.disabled = false;
}

async function loadProject(_eClick: Event) {
  const project = (document.querySelector("#project-input") as HTMLInputElement)
    .value;
  if (!project) {
    throw new Error("Project not found");
  }

  const selectedProject = PROJECTS.get(project)!;
  OPEN_PROJECT(selectedProject());
}

async function renderFirstFrame(_eClick: Event) {
  const [width, height] = JSON.parse(
    (document.querySelector("#frame-input") as HTMLInputElement).value,
  );
  if (!width || !height) {
    throw new Error("Could not determine width and height");
  }

  measureStart("frame");
  await API.renderImage(API.srid(), API.fullExtent(), width, height, 1);
  measureEnd("frame");

  const btnStart = document.querySelector("#start");
  if (btnStart) {
    btnStart.removeAttribute("disabled");
  }
}

async function startPerformanceTest(_eClick: Event) {
  const loader = document.createElement("div");
  loader.id = "loading";
  (
    _eClick.target as HTMLElement
  ).parentElement?.parentElement?.firstElementChild?.appendChild(loader);

  const optionShowResults = document.querySelector(
    "#option-show-results",
  ) as HTMLInputElement;

  const extents = JSON.parse(
    (document.querySelector("#start-extent-input") as HTMLInputElement).value,
  );
  if (!extents || !Array.isArray(extents) || extents.length === 0) {
    throw new Error("Invalid extent");
  }

  const resolutions = JSON.parse(
    (document.querySelector("#start-resolution-input") as HTMLInputElement)
      .value,
  );
  if (!resolutions || !Array.isArray(resolutions) || resolutions.length === 0) {
    throw new Error("Invalid resolution");
  }

  const amount = (
    document.querySelector("#start-amount-input") as HTMLInputElement
  ).valueAsNumber;
  const results = document.querySelector("#results");
  const table = document.createElement("table");

  // header
  const row = document.createElement("tr");
  const cell = document.createElement("td");
  row.appendChild(cell);
  for (const resolution of resolutions) {
    const cell = document.createElement("td");
    const [width, height] = resolution;
    cell.textContent = `${width}x${height}`;
    row.appendChild(cell);
  }
  table.appendChild(row);

  for (const extnet of extents) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    const title = document.createElement("strong");
    title.textContent = extnet.name;
    cell.appendChild(title);
    cell.appendChild(document.createTextNode("\u00A0"));
    const srid = document.createElement("span");
    srid.textContent = ` (${extnet.srid})`;
    cell.appendChild(srid);
    const br = document.createElement("br");
    cell.appendChild(br);
    const bbox = document.createElement("span");
    bbox.textContent =
      extnet.extent[0].join("/") + ", " + extnet.extent[1].join("/");
    cell.appendChild(bbox);

    row.appendChild(cell);
    for (const resolution of resolutions) {
      const cell = document.createElement("td");
      cell.classList.add("measure");

      for (let i = 0; i < amount; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.id = `measure-${extnet.name}-${resolution[0]}x${resolution[1]}-${i}`;
        input.dataset.extent = JSON.stringify(extnet.extent);
        input.dataset.resolution = JSON.stringify(resolution);
        input.dataset.amount = i.toString();
        input.disabled = true;
        cell.appendChild(input);
        cell.appendChild(document.createElement("br"));
      }

      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  results?.appendChild(table);

  const todoSelector = "#results td.measure > input:not([value])";
  while (document.querySelector(todoSelector)) {
    // find all open inputs
    const potentialJobs = Array.from(document.querySelectorAll(todoSelector));
    const randomJob = potentialJobs[
      Math.floor(Math.random() * potentialJobs.length)
    ] as HTMLInputElement;
    // get first input of this measure with input:not([value])
    const job = randomJob.parentElement?.querySelector(
      "input:not([value])",
    ) as HTMLInputElement;

    job.classList.add("active");

    const extent = JSON.parse(job.dataset.extent!);
    const resolution = JSON.parse(job.dataset.resolution!);

    measureStart(job.id);
    const result = await API.renderImage(
      API.srid(),
      new API.Rectangle(extent[0][0], extent[0][1], extent[1][0], extent[1][1]),
      resolution[0],
      resolution[1],
      1,
    );

    const time = measureEnd(job.id);
    job.setAttribute("value", "" + time);

    if (optionShowResults.checked) {
      // render the img to the DOM
      const canvas = new OffscreenCanvas(result.width, result.height);
      const context = canvas.getContext("2d");
      context!.putImageData(result, 0, 0);
      const img = document.createElement("img");
      img.src = URL.createObjectURL(await canvas.convertToBlob());
      job.insertAdjacentElement("afterend", img);
      img.addEventListener("click", () => {
        // open image in a new tab
        const newTab = window.open();
        newTab?.document.write(`<img src="${img.src}" />`);
      });
    }

    job.classList.remove("active");
  }
}

document.addEventListener("DOMContentLoaded", (_e) => {
  document
    .querySelector("#boot")
    ?.addEventListener("click", tryCatch(bootRuntime));
  document
    .querySelector("#project")
    ?.addEventListener("click", tryCatch(loadProject));
  document
    .querySelector("#frame")
    ?.addEventListener("click", tryCatch(renderFirstFrame));
  document
    .querySelector("#start")
    ?.addEventListener("click", tryCatch(startPerformanceTest));

  init();
});

// Utility functions

function measureStart(name: string) {
  performance.mark(`${name}-start`);
}

function measureEnd(name: string) {
  performance.mark(`${name}-end`);
  const measurement = performance.measure(
    `${name}-measure`,
    `${name}-start`,
    `${name}-end`,
  );
  const element = document.querySelector(`#${name}-measure`);
  if (element) {
    (element as HTMLInputElement).valueAsNumber = measurement.duration;
  }
  return measurement.duration;
}

function tryCatch(handler: (event: Event) => void) {
  return async (event: Event) => {
    try {
      await handler(event);
    } catch (error: any) {
      reportError(error);
      throw error;
    }
  };
}

function reportError(error: any) {
  document.body.style.backgroundColor = "#ffcccc";
  const errorDiv = document.createElement("div");
  errorDiv.style.marginTop = "2em";
  errorDiv.style.color = "red";
  errorDiv.textContent = error.message;
  document.body.appendChild(errorDiv);
}
