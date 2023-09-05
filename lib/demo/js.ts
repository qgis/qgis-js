import { QgisApi } from "../api/public";

import { Rectangle } from "../api/model";

import { EmscriptenFS } from "../emscripten";

const debugOutput = false;

const testApi = false;

export function jsDemo(
  canvas: HTMLCanvasElement,
  api: QgisApi,
  fs: EmscriptenFS,
) {
  let last_extent: Rectangle | null = null;

  if (testApi) {
    const p1 = api.PointXY();
    console.dir(p1);

    const r1 = api.Rectangle();
    console.log(r1);

    const r2 = api.Rectangle(1, 2, 3, 4);
    console.log(r2.xMinimum, r2.yMinimum, r2.xMaximum, r2.yMaximum);
    r2.scale(5);
    console.log(r2.xMinimum, r2.yMinimum, r2.xMaximum, r2.yMaximum);
  }

  function on_qgis_module_started() {
    if (debugOutput) console.log("QGIS loaded!");

    fetch_project_files("projects/village", function (first_file: string) {
      if (debugOutput) console.log("loading project");
      api.loadProject(first_file); // TODO make this async
      if (debugOutput) console.log("loading finished");
      let extent = api.fullExtent();
      if (debugOutput) console.dir("project extent: ", extent);
      last_extent = extent;

      render_map();
    });
  }

  async function render_map() {
    if (debugOutput) console.log("starting rendering.");

    var devicePixelRatio = window.devicePixelRatio || 1;

    var cssRect = canvas.getBoundingClientRect();

    const imageWidth = cssRect.width * devicePixelRatio;
    const imageHeight = cssRect.height * devicePixelRatio;

    const image = await api.render(last_extent!, imageWidth, imageHeight);

    let ctx = canvas.getContext("2d");

    canvas.width = imageWidth;
    canvas.height = imageHeight;

    ctx!.scale(devicePixelRatio, devicePixelRatio);
    ctx!.putImageData(image, 0, 0);
  }

  function fetch_project_files(
    dirname: string,
    callbackFinished: (projectUrl: string) => void,
  ) {
    // read list of project files, then fetch individual files
    // and write them to emscripten's virtual filesystem,
    // then load the QGIS project (should be the first file in files.json)

    fetch(dirname + "/files.json").then((response) =>
      response.json().then((fileList) => {
        //if(debugOutput) console.log(fileList);
        let urls: string[] = [];
        for (let filename of fileList) {
          let url = dirname + "/" + filename;
          urls.push(url);
        }

        let promises: Promise<any>[] = [];
        //set_qgis_status("Fetching QGIS project...");
        urls.forEach((url) => {
          promises.push(
            fetch(url).then((response) =>
              response.blob().then((blob) => blob.arrayBuffer()),
            ),
          );
        });

        Promise.all(promises).then((arrayBuffers) => {
          // ensure dirname (and its parent dirs) exist
          let projectUploadDirs = dirname.split("/");
          for (let i = 1; i < projectUploadDirs.length; i++) {
            fs.mkdir(projectUploadDirs.slice(0, i).join("/"));
          }

          //if(debugOutput) console.log("got results " + arrayBuffers);
          fs.mkdir(dirname);
          arrayBuffers.forEach((arrayBuffer, index) => {
            //if(debugOutput) console.log(urls[index] + " finished");
            fs.writeFile(urls[index], new Uint8Array(arrayBuffer));
          });

          callbackFinished(urls[0]); // the first file is meant to be QGIS project file
        });
      }),
    );
  }

  let map_scale_factor = 1.5;
  let map_move_factor = 0.1;

  document.getElementById("zoomin")!.onclick = function () {
    last_extent!.scale(1 / map_scale_factor);
    render_map();
  };
  document.getElementById("zoomout")!.onclick = function () {
    last_extent!.scale(map_scale_factor);
    render_map();
  };
  document.getElementById("panleft")!.onclick = function () {
    last_extent!.move(
      (last_extent!.xMaximum - last_extent!.xMinimum) * map_move_factor,
      0,
    );
    render_map();
  };
  document.getElementById("panright")!.onclick = function () {
    last_extent!.move(
      -(last_extent!.xMaximum - last_extent!.xMinimum) * map_move_factor,
      0,
    );
    render_map();
  };
  document.getElementById("panup")!.onclick = function () {
    last_extent!.move(
      0,
      -(last_extent!.yMaximum - last_extent!.yMinimum) * map_move_factor,
    );
    render_map();
  };
  document.getElementById("pandown")!.onclick = function () {
    last_extent!.move(
      0,
      (last_extent!.yMaximum - last_extent!.yMinimum) * map_move_factor,
    );
    render_map();
  };

  on_qgis_module_started();
}
