import type { QgsPoint } from "./QgsPoint";
import type { QgsRectangle } from "./QgsRectangle";

/**
 * Axis-aligned 3D bounding box. The 3D companion of {@link QgsRectangle}.
 *
 * {@link https://api.qgis.org/api/classQgsBox3D.html}
 */
export interface QgsBox3D {
  xMinimum: number;
  yMinimum: number;
  zMinimum: number;
  xMaximum: number;
  yMaximum: number;
  zMaximum: number;
  width(): number;
  height(): number;
  depth(): number;
  /** Volume in CRS units cubed. 0 for collapsed/2D boxes. */
  volume(): number;
  isNull(): boolean;
  isEmpty(): boolean;
  /** True when zMin == zMax (the box collapses to a plane). */
  is2d(): boolean;
  center(): QgsPoint;
  /** Drop the Z dimension and return the XY footprint. */
  toRectangle(): QgsRectangle;
  contains(p: QgsPoint): boolean;
  intersects(other: QgsBox3D): boolean;
  toString(): string;
}

export interface QgsBox3DConstructors {
  QgsBox3D: {
    new (): QgsBox3D;
    new (
      xMin: number,
      yMin: number,
      zMin: number,
      xMax: number,
      yMax: number,
      zMax: number,
    ): QgsBox3D;
  };
}
