import type { QgisApi, QgsLayerTreeNode, QgsLayerTreeLayer } from "qgis-js";

function renderNode(
  parent: HTMLElement,
  node: QgsLayerTreeNode,
  redraw: () => void,
  update: () => void,
  parentVisible: boolean = true,
) {
  const el = document.createElement("div");

  const header = document.createElement("div");
  header.className = "layer-header";
  const visible = parentVisible && node.itemVisibilityChecked;
  if (!visible) header.classList.add("disabled");

  if (node.isGroup()) {
    const toggle = document.createElement("span");
    toggle.className = "layer-toggle";
    toggle.textContent = node.expanded ? "\u25BE" : "\u25B8";
    toggle.addEventListener("click", () => {
      node.expanded = !node.expanded;
      update();
    });
    header.appendChild(toggle);
  } else {
    const spacer = document.createElement("span");
    spacer.className = "layer-toggle";
    header.appendChild(spacer);
  }

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = node.itemVisibilityChecked;
  checkbox.addEventListener("change", () => {
    node.itemVisibilityChecked = checkbox.checked;
    redraw();
    update();
  });
  header.appendChild(checkbox);

  const name = document.createElement("span");
  name.className = "layer-name";
  if (node.isGroup()) name.classList.add("is-group");
  name.textContent = node.name;
  header.appendChild(name);

  if (node.isLayer()) {
    const layer = node as QgsLayerTreeLayer;
    const slider = document.createElement("input");
    slider.className = "layer-slider";
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = "" + layer.opacity * 100;
    slider.step = "1";
    slider.addEventListener("change", () => {
      layer.opacity = parseInt(slider.value) / 100;
      redraw();
    });
    header.appendChild(slider);
  }

  el.appendChild(header);

  if (node.isGroup()) {
    const childContainer = document.createElement("div");
    childContainer.className = "layer-children";
    if (!node.expanded) childContainer.style.display = "none";
    const children = node.children();
    for (const child of children) {
      renderNode(childContainer, child, redraw, update, visible);
    }
    el.appendChild(childContainer);
  }

  parent.appendChild(el);
}

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

    const tree = document.createElement("div");
    tree.className = "layer-tree";
    layerContainer.appendChild(tree);

    const root = api.layerTreeRoot();
    for (const child of root.children()) {
      renderNode(tree, child, redraw, update);
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
