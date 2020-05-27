import { Hex } from "./hex.js";
import { Point } from "./point.js";

/*
  Contains forward and inverse matrices for conversions between
  hex coordinates and screen coordinates. Also contains start
  angle which are used to draw the corners.
*/
class Orientation {
  constructor(forward_matrix, inverse_matrix, start_angle) {
    this.forward_matrix = forward_matrix;
    this.inverse_matrix = inverse_matrix;
    this.start_angle = start_angle;
  }
}

// TODO: Wrtite explanation
export class Layout {
  // Static properties for different orientations of hexagons
  static pointy = new Orientation(
    [Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0],
    [Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0],
    0.5
  );

  static flat = new Orientation(
    [3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0)],
    [2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0],
    0.0
  );

  constructor(orientation, size, origin) {
    // Orientation of the hexagons (pointy or flat-top)
    this.orientation = orientation;

    // Size of side of the hexagon
    this.size = size;

    // Screen coordinates of the origin point for the layout
    this.origin = origin;

    // Padding on vertical and horizontal axis of canvas
    this.padding = new Point(50, 50);
  }

  // Convert cube coordinates to screen coordinates
  convertHexToPixel(hex) {
    let x =
      (this.orientation.forward_matrix[0] * hex.q +
        this.orientation.forward_matrix[1] * hex.r) *
      this.size;
    let y =
      (this.orientation.forward_matrix[2] * hex.q +
        this.orientation.forward_matrix[3] * hex.r) *
      this.size;

    return new Point(x + this.origin.x, y + this.origin.y);
  }

  // Convert screen coordinates to cube coordinates
  convertPixelToHex(point) {
    let pt = new Point(
      (point.x - this.origin.x) / this.size,
      (point.y - this.origin.y) / this.size
    );

    let q =
      this.orientation.inverse_matrix[0] * pt.x +
      this.orientation.inverse_matrix[1] * pt.y;
    let r =
      this.orientation.inverse_matrix[2] * pt.x +
      this.orientation.inverse_matrix[3] * pt.y;

    return new Hex(q, r, -q - r);
  }

  // Get coordinates offset for the corner of the hexagon (relative to the center of the hexagon)
  getHexCornerOffset(corner) {
    let angle = (2.0 * Math.PI * (this.orientation.start_angle - corner)) / 6.0;

    return new Point(this.size * Math.cos(angle), this.size * Math.sin(angle));
  }

  // Get coordinates for all corners of the hexagon
  getPolygonCorners(hex) {
    let corners = [];
    let center = this.convertHexToPixel(hex);

    for (let i = 0; i < 6; i++) {
      let offset = this.getHexCornerOffset(i);
      corners.push(new Point(center.x + offset.x, center.y + offset.y));
    }

    return corners;
  }

  // Get number of hexes in row
  getGridWidth(canvasWidth) {
    let rowWidth = canvasWidth - this.padding.x;
    let hexWidth = Math.sqrt(3) * this.size;

    return Math.floor(rowWidth / hexWidth - 0.5);
  }

  // Get number of hexes in a column
  getGridHeight(canvasHeight) {
    let colHeight = canvasHeight - this.padding.y;
    let hexHeight = 2 * this.size;

    return Math.floor(((4 * colHeight) / hexHeight - 1) / 3);
  }
}
