/**
 * @public
 */
export interface Rectangle {
  xMaximum: number;
  xMinimum: number;
  yMaximum: number;
  yMinimum: number;

  scale(factor: number): void;
  move(dx: number, dy: number): void;
}

/**
 * @public
 */
export interface RectangleConstructors {
  Rectangle(): Rectangle;
  Rectangle(xMin: number, yMin: number, xMax: number, yMax: number): Rectangle;
}
