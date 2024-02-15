import { QgisApi } from "qgis-js";

export function layersControl(
  target: HTMLDivElement,
  api: QgisApi,
  redraw: () => void = () => {},
): () => void {
  const update = () => {
    target.innerHTML = "";

    const layerContainer = document.createElement("div");
    layerContainer.className = "layers";
    target.appendChild(layerContainer);

    const layers = api.mapLayers();
    for (const layer of layers) {
      const node = document.createElement("div");
      node.className = "layer";

      // create checkbox in node
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      if (layer.visible) {
        checkbox.checked = true;
      }
      checkbox.addEventListener("change", () => {
        layer.visible = checkbox.checked;
        redraw();
        update();
      });
      node.appendChild(checkbox);

      // create name as text node
      const textnode = document.createTextNode(layer.name);
      node.appendChild(textnode);

      // create opacity slider in node
      const slider = document.createElement("input");
      if (!layer.visible) {
        slider.style.visibility = "hidden";
      }
      slider.type = "range";
      slider.min = "0";
      slider.max = "100";
      slider.value = "" + layer.opacity * 100;
      slider.step = "1";
      slider.addEventListener("change", () => {
        layer.opacity = parseInt(slider.value) / 100;
        redraw();
      });

      node.appendChild(slider);
      layerContainer.appendChild(node);
    }

    if (api.mapThemes().length > 0) {
      const themeContainer = document.createElement("div");
      themeContainer.className = "themes";
      target.appendChild(themeContainer);

      const select = document.createElement("select");
      select.addEventListener("change", () => {
        if (select.value) {
          api.setMapTheme(select.value);
          redraw();
          update();
        }
      });
      themeContainer.appendChild(select);

      const currentTheme = api.getMapTheme();

      const option = document.createElement("option");
      option.value = "";
      option.text = "";
      if (!currentTheme) {
        option.selected = true;
      }
      select.appendChild(option);

      for (const theme of api.mapThemes()) {
        const option = document.createElement("option");
        option.value = theme;
        option.text = theme;
        if (theme === currentTheme) {
          option.selected = true;
        }
        select.appendChild(option);
      }
    }
  };

  update();

  return update;
}
