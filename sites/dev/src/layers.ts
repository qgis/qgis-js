import type {
  QgisApi,
  QgsLayerTreeNode,
  QgsLayerTreeLayer,
  QgsVectorLayer,
} from "qgis-js";
import { LayerType } from "qgis-js";

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

  let filterRow: HTMLDivElement | undefined;
  let legendContainer: HTMLDivElement | undefined;
  if (node.isLayer()) {
    const treeLayer = node as QgsLayerTreeLayer;
    const mapLayer = treeLayer.layer();
    if (mapLayer && mapLayer.type() === LayerType.Vector) {
      const vectorLayer = mapLayer as QgsVectorLayer;
      const hasFilter = vectorLayer.subsetString() !== "";

      const filterIcon = document.createElement("span");
      filterIcon.className = "layer-filter-icon";
      if (hasFilter) filterIcon.classList.add("active");
      filterIcon.title = "SQL filter";
      filterIcon.textContent = "\u2AF6";
      header.appendChild(filterIcon);

      filterRow = document.createElement("div");
      filterRow.className = "layer-filter";
      filterRow.style.display = "none";

      const filterInput = document.createElement("input");
      filterInput.type = "text";
      filterInput.placeholder = "SQL filter expression";
      filterInput.value = vectorLayer.subsetString();
      const applyFilter = () => {
        const success = vectorLayer.setSubsetString(filterInput.value);
        filterInput.classList.toggle("filter-error", !success);
        filterIcon.classList.toggle("active", filterInput.value !== "");
        if (success) redraw();
      };
      filterInput.addEventListener("change", applyFilter);
      filterRow.appendChild(filterInput);

      filterIcon.addEventListener("click", () => {
        const isVisible = filterRow!.style.display !== "none";
        filterRow!.style.display = isVisible ? "none" : "";
        if (!isVisible) filterInput.focus();
      });
    }

    const legendIcon = document.createElement("span");
    legendIcon.className = "layer-legend-icon";
    legendIcon.title = "Legend";
    legendIcon.textContent = "\u2630";
    header.appendChild(legendIcon);

    legendContainer = document.createElement("div");
    legendContainer.className = "layer-legend";
    legendContainer.style.display = "none";

    legendIcon.addEventListener("click", () => {
      const isVisible = legendContainer!.style.display !== "none";
      legendContainer!.style.display = isVisible ? "none" : "";
      legendIcon.classList.toggle("active", !isVisible);
      if (!isVisible && legendContainer!.childElementCount === 0) {
        for (const legendNode of treeLayer.legendNodes()) {
          const row = document.createElement("div");
          row.className = "legend-item";
          const icon = legendNode.symbolImage(16);
          if (icon) {
            const img = document.createElement("img");
            img.className = "legend-icon";
            img.src = icon;
            row.appendChild(img);
          }
          const label = document.createElement("span");
          label.className = "legend-label";
          label.textContent = legendNode.label();
          row.appendChild(label);
          legendContainer!.appendChild(row);
        }
      }
    });

    if (mapLayer) {
      const slider = document.createElement("input");
      slider.className = "layer-slider";
      slider.type = "range";
      slider.min = "0";
      slider.max = "100";
      slider.value = "" + mapLayer.opacity * 100;
      slider.step = "1";
      slider.addEventListener("change", () => {
        mapLayer.opacity = parseInt(slider.value) / 100;
        redraw();
      });
      header.appendChild(slider);
    }
  }

  el.appendChild(header);
  if (filterRow) el.appendChild(filterRow);
  if (legendContainer) el.appendChild(legendContainer);

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

    const toolbar = document.createElement("div");
    toolbar.className = "layers-toolbar";

    const downloadIcon = document.createElement("span");
    downloadIcon.className = "layers-download";
    downloadIcon.title = "Download legend as PNG";
    downloadIcon.textContent = "\u2630";
    downloadIcon.addEventListener("click", () => {
      const dataUrl = api.renderLegend(300);
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "legend.png";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
    });
    toolbar.appendChild(downloadIcon);
    layerContainer.appendChild(toolbar);

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
