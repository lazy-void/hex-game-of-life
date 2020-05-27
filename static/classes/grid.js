import { Permutation } from "./permutation.js";

export class Grid {
  constructor() {
    // Variable for all cells in the grid
    this.cells;

    // Dimensions of the grid
    this.gridWidth;
    this.gridHeight;
  }

  /* Update grid dimensions if canvas changed it's dimensions */
  updateGridDimensions(layout, canvas) {
    canvas.updateCanvasDimensions();

    this.gridWidth = layout.getGridWidth(canvas.canvasElem.width);
    this.gridHeight = layout.getGridHeight(canvas.canvasElem.height);
  }

  /* Create rectangular grid */
  shapeRectangle() {
    /*
      We store hex objects in two dimensional dict.
      I wanted to use two dimensional array but
      our coordinates can be negative and indexes can't.
      Also indexes aren't in the same order as the coordinates.
      (q, r) -> coordinates; [r][q] -> indexes
      Blame the algorithm that generates Hex's for this.
    */
    this.cells = {};

    // Get min and max q coordinates
    let qMin = -Math.floor(this.gridWidth / 2);
    let qMax = qMin + this.gridWidth;

    // Get min and max r coordinates
    let rMin = -Math.floor(this.gridHeight / 2);
    let rMax = rMin + this.gridHeight;

    // Create cells
    for (let r = rMin; r < rMax; r++) {
      let innerDict = {};
      let rOffset = -Math.floor(r / 2);

      for (let q = qMin + rOffset; q < qMax + rOffset; q++) {
        innerDict[q] = Permutation.QRS(q, r, -q - r);
      }

      this.cells[r] = innerDict;
    }
  }

  createEmptyGrid(layout, canvas) {
    this.updateGridDimensions(layout, canvas);

    // Create current cells
    this.shapeRectangle();
  }

  createRandomGrid(layout, canvas) {
    this.createEmptyGrid(layout, canvas);

    for (const r of Object.keys(this.cells)) {
      for (const q of Object.keys(this.cells[r])) {
        this.cells[r][q].isAlive = Boolean(Math.round(Math.random()));
      }
    }
  }

  createNextGeneration() {
    // Create new outer dict for hexes
    let newCells = {};

    // Iterate through all hexes and calculate their next state
    for (const r of Object.keys(this.cells)) {
      // Create inner dict for hexes
      let innerDict = {};

      for (const q of Object.keys(this.cells[r])) {
        let newCell = this.cells[r][q].clone();

        // Get number of alive neighbours
        let neighboursAlive = 0;
        for (let i = 0; i < 6; i++) {
          // Calculate neighbour hex
          let imaginaryNeighbour = newCell.getNeighbour(i);

          // Continue to the next iteration if neighbour doesn't exist
          // It is possible for hexes in the corners
          if (!(imaginaryNeighbour.r in this.cells)) {
            continue;
          }

          // Get the state of the neighbour
          // And increment neighboursAlive if neighbour is alive
          let realNeighbour = this.cells[imaginaryNeighbour.r][
            imaginaryNeighbour.q
          ];
          if (realNeighbour && realNeighbour.isAlive) {
            neighboursAlive++;
          }
        }

        // Change the state of the hex using rules
        if (newCell.isAlive && (neighboursAlive == 2 || neighboursAlive == 3)) {
          newCell.isAlive = true;
        }
        // We shouldn't check if hex is dead because all alive hexes
        // with 3 alive neighbours passed the first condition
        else if (neighboursAlive == 3) {
          newCell.isAlive = true;
        } else {
          newCell.isAlive = false;
        }

        // Append hex to the inner dictionary
        innerDict[q] = newCell;
      }

      // Append inner dictionary to the outer dictionary
      newCells[r] = innerDict;
    }

    this.cells = newCells;
  }
}
