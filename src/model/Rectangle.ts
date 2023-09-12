import { PointXY } from "./PointXY";

export interface Rectangle {
  xMaximum: number;
  xMinimum: number;
  yMaximum: number;
  yMinimum: number;

  scale(factor: number): void;
  move(dx: number, dy: number): void;
  center(): PointXY;
}

export interface RectangleConstructors {
  Rectangle: {
    new (): Rectangle;
    new (xMin: number, yMin: number, xMax: number, yMax: number): Rectangle;
  };
}
