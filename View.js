export class View {
  constructor() {
    this.canvas = document.querySelector("#myCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.slider = document.getElementById("meinSlider");
    this.spaceButton = document.getElementById("btnSpace");
    this.randomButton = document.getElementById("btnRrr");
    this.kanonenButton = document.getElementById("btnKkk");
    this.leerenButton = document.getElementById("btnCcc");
  }

  render(model) {
    this.canvas.width = model.width;
    this.canvas.height = model.height;

    let count = 0;
    let hell = 0;
    model.grid.forEach((column, x) => {
      column.forEach((cellState, y) => {
        const posX = x * model.cellSize;
        const posY = y * model.cellSize;

        // Farbe basierend auf dem Zustand (1 = Schwarz, 0 = Weiß)
        this.ctx.fillStyle = cellState === 1 ? "#000" : "#fff";
        //quadrat
        //this.ctx.fillRect(posX, posY, model.cellSize, model.cellSize);

        //vollkreis
        this.ctx.beginPath();
        this.ctx.arc(
          posX + model.cellSize / 2,
          posY + model.cellSize / 2,
          model.cellSize / 2,
          0,
          2 * Math.PI,
        );
        this.ctx.fill();

        // Gitterlinien zeichnen
        this.ctx.strokeStyle = "#eee";
        this.ctx.strokeRect(posX, posY, model.cellSize, model.cellSize);
        count++;
      });
    });
    console.log(count);
  }
}