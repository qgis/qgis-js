export enum LayerType {
  Vector = 0,
  Raster = 1,
  Plugin = 2,
  Mesh = 3,
  VectorTile = 4,
  Annotation = 5,
  PointCloud = 6,
  Group = 7,
  TiledScene = 8,
}

export interface QgsMapLayer {
  name: string;
  opacity: number;

  isValid(): boolean;
  type(): LayerType;
  id(): string;
}

export interface QgsVectorLayer extends QgsMapLayer {
  subsetString(): string;
  setSubsetString(subset: string): boolean;
}
