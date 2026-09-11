import { Model } from "./Model.js";
import { View } from "./View.js";

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.isRunning = false;
    this.lastTime = 0;
    this.fps = 16; // Geschwindigkeit der Simulation

    // Event-Listener: reagiert sofort beim Verschieben
    this.view.slider.addEventListener("input", () => {
      this.fps = this.view.slider.value;
      //console.info(this.fps)
    });

    // Im Controller constructor
    this.view.canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault(); // Verhindert das Scrollen der Seite
        this.model.changeZoom(e.deltaY);
        this.view.render(this.model);
        this.handleResize();
      },
      { passive: false },
    ); // Wichtig für preventDefault

    this.view.spaceButton.addEventListener("click", () => this.handleStartStop());
    this.view.randomButton.addEventListener("click", () => this.handleRandom());
    this.view.kanonenButton.addEventListener("click", () => this.handleMachKanone());
    this.view.leerenButton.addEventListener("click", () => this.handleLeeresFeld());

    // 1. Fenster-Größe überwachen
    window.addEventListener("resize", () => this.handleResize());

    // 2. Klicken zum Zeichnen einzelner Zellen
    this.view.canvas.addEventListener("click", (e) => this.handleClick(e));

    // 3. Tastatur-Steuerung
    window.addEventListener("keydown", (e) => {
      // Leertaste: Start/Stopp
      if (e.code === "Space") {
        this.handleStartStop(e);
      }

      // Taste R: Zufällig befüllen
      //alternative -> if (e.code === "KeyR")
      if (e.key.toLowerCase() === "r") {
        this.handleRandom();
      }

      // Taste C: Spielfeld leeren
      if (e.key.toLowerCase() === "c") {
        this.handleLeeresFeld();
      }

      // K: erstellt kanone
      if (e.key.toLowerCase() === "k") {
        this.handleMachKanone();
      }
    });

    // Initialisierung: Spielfeld berechnen und anzeigen
    this.handleResize();
  }

  toggleGame() {
    //this.isRunning = !this.isRunning;
    //if (this.isRunning) {
    //      this.loop();
    //}
    //kurze version
    (this.isRunning = !this.isRunning) && this.loop();
  }

  handleLeeresFeld() {
    this.isRunning = false;
    this.model.clear();
    this.view.render(this.model);
  }

  handleMachKanone() {
    this.isRunning = false; // Kurz stoppen für klares Bild
    this.model.drawGun();
    this.view.render(this.model);
  }

  handleRandom() {
    this.model.randomize();
    this.view.render(this.model);
  }

  handleStartStop(e) {
    if (e && e.type === "keydown" && e.code === "Space") {
      e.preventDefault();
    }
    this.toggleGame();
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    const delta = currentTime - this.lastTime;
    if (delta > 1000 / this.fps) {
      this.model.nextGeneration();
      this.view.render(this.model);
      this.lastTime = currentTime;
    }

    requestAnimationFrame((time) => this.loop(time));
  }

  handleResize() {
    const padding = 30;
    const offsetButtons = 40;
    const availableWidth = window.innerWidth - padding;
    const availableHeight = window.innerHeight - padding - offsetButtons;

    this.model.updateDimensions(availableWidth, availableHeight);
    this.view.render(this.model);
  }

  handleClick(event) {
    const rect = this.view.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / this.model.cellSize);
    const row = Math.floor(y / this.model.cellSize);

    // Zelle umschalten (1 -> 0 oder 0 -> 1)
    const currentState = this.model.grid[col][row];
    this.model.setCellColor(col, row, currentState === 1 ? 0 : 1);

    this.view.render(this.model);
  }
}

const APP = new Controller(new Model(), new View());