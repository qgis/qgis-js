

export function bootQt() {
    //@ts-ignore
    import("../build-wasm/qtloader.js").then(({QtLoader}) => {

        const spinner = document.querySelector('#qtspinner') as HTMLDivElement | null;
        const canvas = document.querySelector('#screen')  as HTMLDivElement | null;
        const status = document.querySelector('#qtstatus') as HTMLDivElement | null;

        let qtLoader = new QtLoader({
            canvasElements : [canvas],
            moduleConfig: {
                onAbort() {
                    console.error("Abort!")
                    document.body.innerHTML = "";
                },
            },
            showLoader: function(loaderStatus: string) {
                if(spinner)
                spinner.style.display = 'block';
                canvas.style.display = 'none';
                status.innerHTML = loaderStatus + "...";
            },
            showError: function(errorText: string) {
                status.innerHTML = errorText;
                spinner.style.display = 'block';
                canvas.style.display = 'none';
            },
            showExit: function() {
                status.innerHTML = "Application exit";
                if (qtLoader.exitCode !== undefined)
                    status.innerHTML += " with code " + qtLoader.exitCode;
                if (qtLoader.exitText !== undefined)
                    status.innerHTML += " (" + qtLoader.exitText + ")";
                spinner.style.display = 'block';
                canvas.style.display = 'none';
            },
            showCanvas: function() {
                spinner.style.display = 'none';
                canvas.style.display = 'block';
            },
        });
        qtLoader.loadEmscriptenModule("test_vcpkg");
    });
}