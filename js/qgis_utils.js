
// qtloader does not seem to have a callback to know when the module has started
// so we're polling to see when we can start executing code (we may want to get
// rid of qtloader later)
function waitForWasmModuleStart() {
    if (qtLoader.module())
        on_qgis_module_started();
    else
        window.setTimeout(waitForWasmModuleStart, 100);
}
window.setTimeout(waitForWasmModuleStart, 100);

var Q;
var last_extent;
var img_width = 512;
var img_height = 512;

    function on_qgis_module_started() {
        console.log("QGIS loaded!");
        Q = qtLoader.module();
        fetch_project_files("village", function(first_file) {
            console.log("loading project");
            Q.loadProject(first_file);   // synchronous
            console.log("loading finished");
            extent = Q.fullExtent();
            console.log("project extent: ", extent.xMinimum, extent.yMinimum, extent.xMaximum, extent.yMaximum);
            last_extent = extent;

            render_map();
        });
        
    }

    function render_map() {
        console.log("starting rendering.");
        Q.renderMap(last_extent, img_width, img_height, function() {
            console.log("finished rendering.");
            show_last_image();
        });
    }

    function fetch_project_files(dirname, callbackFinished) {

        // read list of project files, then fetch individual files
        // and write them to emscripten's virtual filesystem,
        // then load the QGIS project (should be the first file in files.json)

        fetch(dirname + '/files.json').then((response) => response.json().then((fileList) => {
            //console.log(fileList);
            let urls = [];
            for(let filename of fileList) {
                let url = dirname + "/" + filename;
                urls.push(url);
            }
        
            let promises = [];
            //set_qgis_status("Fetching QGIS project...");
            urls.forEach( (url, index) => {
            promises.push(
                fetch(url).then((response) => response.blob().then((blob) => blob.arrayBuffer()))
                );
            });

            Promise.all(promises).then((arrayBuffers) => {
                //console.log("got results " + arrayBuffers);
                qtLoader.module().FS.mkdir(dirname);
                arrayBuffers.forEach( (arrayBuffer, index) => {
                    //console.log(urls[index] + " finished");
                    let res = qtLoader.module().FS.writeFile(urls[index], new Uint8Array(arrayBuffer));
                });

                callbackFinished(urls[0]);  // the first file is meant to be QGIS project file
            });
        }))
    }

    function show_last_image() {
        let bufferSize = img_width * img_height*4;
        // TODO: what is more efficient?
        let my_uint8_buffer = new Uint8ClampedArray(qtLoader.module().mapData());
        //let ptr = qtLoader.module().mapPtr();
        //let my_uint8_buffer = new Uint8ClampedArray(Q.HEAPU8.buffer, ptr, bufferSize);
        last_image_data = new ImageData(my_uint8_buffer, img_width, img_height);

        let c = document.getElementById("qqq");
        let ctx = c.getContext("2d");
        ctx.putImageData(last_image_data, 0, 0);
    }
