import { QgisApi } from "qgis-js";

export function layersControl(
  target: HTMLDivElement,
  api: QgisApi,
  redraw: () => void = () => {},
): () => void {
  const update = () => {
    target.innerHTML = "";

    const container = document.createElement("div");
    container.className = "layers";
    target.appendChild(container);

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
      container.appendChild(node);
    }
  };

  update();

  return update;
}
