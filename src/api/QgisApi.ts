import {
  QgisModelConstructors,
  QgsMapRendererParallelJob,
  QgsRectangle,
  QgsLayerTreeGroup,
} from "./QgisModel";

/**
 * Common QGIS API which exposes the {@link QgisModelConstructors} and methods that can be accessed from both the public {@link QgisApi} and the {@link InternalQgisApi}.
 */
export interface CommonQgisApi extends QgisModelConstructors {
  /**
   * Loads a QGIS project file.
   *
   * @param filename - The path to the QGIS project file.
   * @returns true if the project was loaded successfully, false otherwise.
   */
  loadProject(filename: string): boolean;

  /**
   * Returns the full extent of the loaded project.
   *
   * @returns The full extent of the loaded project.
   */
  fullExtent(): QgsRectangle;

  /**
   * Returns the SRID of the loaded project.
   *
   * @returns The SRID of the loaded project.
   */
  srid(): string;

  /**
   * Transforms a rectangle from one SRID to another.
   *
   * @param rect - The rectangle to transform.
   * @param inputSrid - The SRID of the input rectangle.
   * @param outputSrid - The SRID of the output rectangle.
   * @returns The transformed rectangle.
   */
  transformRectangle(
    rect: QgsRectangle,
    inputSrid: string,
    outputSrid: string,
  ): QgsRectangle;

  /**
   * Gets the current map theme of the current project.
   *
   * @returns The name of the current map theme. An empty string if no map theme is set.
   */
  getMapTheme(): string;

  /**
   * Sets a map theme of the current project.
   *
   * @param
   * @returns true if the map theme was loaded successfully, false otherwise.
   */
  setMapTheme(mapTheme: string): boolean;

  /**
   * Returns the global expression variables.
   *
   * These are system-level variables such as `qgis_version`, `qgis_locale`,
   * `qgis_os_name`, `qgis_platform`, etc.
   *
   * @returns A record of variable names to their string values.
   */
  globalVariables(): Record<string, string>;

  /**
   * Returns the project expression variables.
   *
   * These are project-level variables such as `project_crs`, `project_title`,
   * `project_filename`, `layer_ids`, `project_area_units`, etc.
   * Only available after a project has been loaded.
   *
   * @returns A record of variable names to their string values.
   */
  projectVariables(): Record<string, string>;

  /**
   * Sets global expression variables.
   *
   * Custom variables that will be available in all expression contexts.
   * Note: This replaces all custom global variables.
   *
   * @param variables - A record of variable names to their string values.
   */
  setGlobalVariables(variables: Record<string, string>): void;

  /**
   * Sets project expression variables.
   *
   * Custom variables that will be available in the project's expression contexts.
   * Note: This replaces all custom project variables.
   *
   * @param variables - A record of variable names to their string values.
   */
  setProjectVariables(variables: Record<string, string>): void;

  /**
   * Returns the root of the project's layer tree.
   *
   * @returns The root layer tree node.
   */
  layerTreeRoot(): QgsLayerTreeGroup;

  /**
   * Renders an image of the loaded project and provides a QgsMapRendererParallelJob object to monitor the rendering progress and to retrieve preview images.
   *
   * @param srid - The SRID of the image.
   * @param extent - The extent of the image.
   * @param width - The width of the image.
   * @param height - The height of the image.
   * @param pixelRatio - The optional pixel ratio of the image which defaults to 1.
   * @returns A QgsMapRendererParallelJob object that can be used to monitor the rendering progress and to retrieve preview images.
   */
  renderJob(
    srid: string,
    extent: QgsRectangle,
    width: number,
    height: number,
    pixelRatio: number,
  ): QgsMapRendererParallelJob;
}

/**
 * The QgisApiAdapter provides convenience methods in addition to the CommonQgisApi.
 */
export interface QgisApiAdapter {
  /**
   * Renders an image of the loaded project.
   *
   * @param srid - The SRID of the image.
   * @param extent - The extent of the image.
   * @param width - The width of the image.
   * @param height - The height of the image.
   * @param pixelRatio - The optional pixel ratio of the image which defaults to 1.
   * @returns The rendered tile as an ImageData object.
   */
  renderImage(
    srid: string,
    extent: QgsRectangle,
    width: number,
    height: number,
    pixelRatio?: number,
  ): Promise<ImageData>;

  /**
   * Renders a tile of the loaded project in the XYZ scheme (EPSG:3857).
   *
   * @param x - The x coordinate of the tile.
   * @param y - The y coordinate of the tile.
   * @param z - The z coordinate of the tile.
   * @param tileSize - The optional size of the tile which defaults to 256.
   * @param pixelRatio - The optional pixel ratio of the tile which defaults to 1.
   * @param extentBufferFactor - The optional extent buffer factor of the tile which defaults to 0.
   * @returns The rendered tile as an ImageData object.
   */
  renderXYZTile(
    x: number,
    y: number,
    z: number,
    tileSize?: number,
    pixelRatio?: number,
    extentBufferFactor?: number,
  ): Promise<ImageData>;

  /**
   * Returns the map themes of the loaded project.
   *
   * @returns The map themes of the loaded project.
   */
  mapThemes(): readonly string[];
}

/**
 * Interface representing the public QgisApi.
 */
export interface QgisApi extends CommonQgisApi, QgisApiAdapter {}

/**
 * The internal Qgis API which can be accessed from the QgisRuntimeModule
 *
 * This interface is not a stable API and may change at any time. Use the public {@link QgisApi} instead.
 */
export interface InternalQgisApi extends CommonQgisApi {
  renderImage(
    srid: string,
    extent: QgsRectangle,
    width: number,
    height: number,
    pixelRatio: number,
    callback: (tileData: ArrayBufferLike) => void,
  ): void;
  renderXYZTile(
    x: number,
    y: number,
    z: number,
    tileSize: number,
    pixelRatio: number,
    extentBuffer: number,
    callback: (tileData: ArrayBufferLike) => void,
  ): number;
  mapThemes(): any;
}
