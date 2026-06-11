import type { QgsGeometry } from "./QgsGeometry";
import type { QgsPoint } from "./QgsPoint";

/**
 * An ellipse shape — center + semi-major + semi-minor axes + azimuth. The
 * parent type of {@link QgsCircle} in QGIS. Convert with {@link toPolygon}
 * for geometry operations.
 *
 * {@link https://api.qgis.org/api/classQgsEllipse.html}
 */
export interface QgsEllipse {
  center(): QgsPoint;
  semiMajorAxis(): number;
  semiMinorAxis(): number;
  /** Rotation of the major axis in degrees, clockwise from north. */
  azimuth(): number;
  setSemiMajorAxis(v: number): void;
  setSemiMinorAxis(v: number): void;
  setAzimuth(v: number): void;
  area(): number;
  perimeter(): number;
  isEmpty(): boolean;
  /** Distance from center to either focus. */
  focusDistance(): number;
  /** Eccentricity (0 for circle, → 1 for stretched). */
  eccentricity(): number;
  toPolygon(segments: number): QgsGeometry;
  asWkt(precision: number): string;
}

export interface QgsEllipseConstructors {
  QgsEllipse: {
    new (): QgsEllipse;
    new (center: QgsPoint, semiMajor: number, semiMinor: number): QgsEllipse;
    new (
      center: QgsPoint,
      semiMajor: number,
      semiMinor: number,
      azimuth: number,
    ): QgsEllipse;
  };
}
