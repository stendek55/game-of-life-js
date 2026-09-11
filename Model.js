export class Model {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.cellSize = 16; // Größe eines Karos
    this.grid = []; // 2D-Array: grid[spalte][zeile]
  }

  randomize() {
    const cols = this.grid.length;
    const rows = this.grid[0].length;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        // Ca. 50% Chance, dass eine Zelle lebt
        this.grid[c][r] = Math.random() > 0.5 ? 1 : 0;
      }
    }
  }

  clear() {
    this.grid.forEach((col) => col.fill(0));
  }

  changeZoom(delta) {
    // Zoom-Richtung: delta ist negativ beim Hochschieben (Zoom in)
    const zoomSpeed = 2;
    this.cellSize -= Math.sign(delta) * zoomSpeed;

    // Grenzen setzen (nicht kleiner als 4px, nicht größer als 100px)
    this.cellSize = Math.max(4, Math.min(this.cellSize, 100));

    // Dimensionen neu berechnen (nutzt vorhandene updateDimensions Logik)
    this.updateDimensions(window.innerWidth - 50, window.innerHeight - 50);
  }

  drawGun() {
    // 1. Koordinaten der Gosper Glider Gun (relativ zum Startpunkt)
    const gunPattern = [
      [24, 0],
      [22, 1],
      [24, 1],
      [12, 2],
      [13, 2],
      [20, 2],
      [21, 2],
      [34, 2],
      [35, 2],
      [11, 3],
      [15, 3],
      [20, 3],
      [21, 3],
      [34, 3],
      [35, 3],
      [0, 4],
      [1, 4],
      [10, 4],
      [16, 4],
      [20, 4],
      [21, 4],
      [0, 5],
      [1, 5],
      [10, 5],
      [14, 5],
      [16, 5],
      [17, 5],
      [22, 5],
      [24, 5],
      [10, 6],
      [16, 6],
      [24, 6],
      [11, 7],
      [15, 7],
      [12, 8],
      [13, 8],
    ];

    // 2. Mittelpunkt berechnen
    const midX = Math.floor(this.grid.length / 2) - 18;
    const midY = Math.floor(this.grid[0].length / 2) - 5;

    // 3. Erst das Feld leeren (optional, für sauberen Start)
    this.clear();

    // 4. Muster einzeichnen (mit Torus-Sicherheit)
    const cols = this.grid.length;
    const rows = this.grid[0].length;

    gunPattern.forEach(([x, y]) => {
      const targetX = (midX + x + cols) % cols;
      const targetY = (midY + y + rows) % rows;
      this.grid[targetX][targetY] = 1;
    });
  }

  updateDimensions(w, h) {
    // Berechne, wie viele volle Zellen in das Fenster passen
    const cols = Math.floor(w / this.cellSize);
    const rows = Math.floor(h / this.cellSize);

    // Setze die Canvas-Größe exakt auf das Vielfache der Zellen
    this.width = cols * this.cellSize;
    this.height = rows * this.cellSize;

    this.initGrid(cols, rows);
  }

  initGrid(cols, rows) {
    const oldGrid = this.grid;
    // Neues Gitter erstellen
    //this.grid = Array.from({ length: cols }, () => new Array(rows).fill(0));
    //diese variante finde ich leserlicher
    this.grid = new Array(cols).fill(null).map(() => new Array(rows).fill(0));

    // Alte Daten in das neue Gitter übertragen
    if (oldGrid.length > 0) {
      for (let c = 0; c < Math.min(cols, oldGrid.length); c++) {
        for (let r = 0; r < Math.min(rows, oldGrid[c].length); r++) {
          this.grid[c][r] = oldGrid[c][r];
        }
      }
    }
  }

  setCellColor(col, row, color) {
    if (this.grid[col] && this.grid[col][row] !== undefined) {
      this.grid[col][row] = color;
    }
  }

  countNeighbors(col, row) {
    let count = 0;
    const cols = this.grid.length;
    const rows = this.grid[0].length;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;

        // Die magische Formel für den Torus:
        // (Aktuelle Pos + Versatz + Maximum) % Maximum
        const c = (col + i + cols) % cols;
        const r = (row + j + rows) % rows;

        count += this.grid[c][r];
      }
    }
    return count;
  }

  nextGeneration() {
    const cols = this.grid.length;
    const rows = this.grid[0].length;

    // 1. Ein neues, leeres Gitter für die nächste Generation erstellen
    // Wir nutzen hier wieder Array.from, um keine Referenz-Kopien zu erzeugen
    //const nextGrid = Array.from({ length: cols }, () => new Array(rows).fill(0));
    const nextGrid = new Array(cols)
      .fill(null)
      .map(() => new Array(rows).fill(0));

    // 2. Durch jede Zelle des aktuellen Gitters laufen
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const neighbors = this.countNeighbors(c, r);
        const state = this.grid[c][r];

        // 3. Die Game of Life Regeln anwenden
        if (state === 1) {
          // Lebende Zelle: Überlebt nur mit 2 oder 3 Nachbarn
          nextGrid[c][r] = neighbors === 2 || neighbors === 3 ? 1 : 0;
        } else {
          // Tote Zelle: Wird bei exakt 3 Nachbarn geboren
          nextGrid[c][r] = neighbors === 3 ? 1 : 0;
        }
      }
    }

    // 4. Das alte Gitter durch das neue ersetzen
    this.grid = nextGrid;
  }
}