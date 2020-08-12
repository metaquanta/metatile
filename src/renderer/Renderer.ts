import { canvasPathFromPolygon, Polygon } from "../lib/math/2d/Polygon";
import { ViewPort } from "../lib/browser/ViewPort";
import { isCallable } from "../lib/util";
import { Colorer } from "./Colorer";
import { Prototile } from "../tiles/Prototile";

type Tile = {
  polygon: () => Polygon;
  proto: Prototile;
  reflected: () => boolean;
};

export type Renderer = {
  setTileStream: (
    tiles:
      | ((vp: Polygon) => Iterable<Tile>)
      | Iterable<{ polygon: () => Polygon }>
  ) => void;
  setFillColorer: (c: Colorer) => void;
  setStrokeColorer: (c: Colorer) => void;
};

type Looper = {
  speedTiles: number;
  speedMs: number;
  lastMs: number;
  stopped: boolean;
  finish: (() => void) | undefined;
  start: (r: () => void, c: () => void) => void;
  stop: () => Promise<unknown>;
  nextBatch: (() => void) | undefined;
  cleanUp: (() => void) | undefined;
  tasksCompleted: number;
};

type PrivateRenderer = Renderer & {
  tiles: Iterable<Tile> | undefined;
  tileIterator: Iterator<Tile> | undefined;
  renderNext: () => boolean;
  clearCanvas: () => void;
  ctx: CanvasRenderingContext2D | undefined;
  vp: Polygon;
  stop: () => void;
  fillColorer: Colorer | undefined;
  strokeColorer: Colorer | undefined;
  getFill: (t: Tile) => string;
  getStroke: (t: Tile) => string;
};

function drawCanvas(
  tile: Polygon,
  strokeColor: string,
  fillColor: string,
  ctx: CanvasRenderingContext2D
): void {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  const p = canvasPathFromPolygon(tile, new Path2D());
  ctx.stroke(p);
  ctx.fill(p);
}

export function Renderer(
  canvas: HTMLCanvasElement,
  viewPort: ViewPort
): Renderer {
  const looper: Looper = {
    stopped: true,
    speedTiles: 500,
    // Apparently, Chrome calls a requestAnimationFrame() over 50ms a
    // "violation". (sometimes). Fuck 'em.
    speedMs: 75,
    lastMs: Date.now(),
    finish: undefined,
    nextBatch: undefined,
    cleanUp: undefined,
    tasksCompleted: 0,
    start(task, cleanUp) {
      console.debug(`Renderer:Looper.start() [${this.tasksCompleted}]`);
      if (!this.stopped) {
        this.stop().then(() => this.start(task, cleanUp));
        return;
      }
      this.stopped = false;
      if (this.cleanUp) this.cleanUp();
      this.cleanUp = cleanUp;
      this.lastMs = Date.now();
      this.nextBatch = () => {
        if (this.stopped) {
          if (this.finish) this.finish();
        } else {
          let i = 0;
          for (; i < this.speedTiles && task(); i++) {
            this.tasksCompleted++;
          }
          const ms = Date.now();
          /*console.log(
            `Renderer:Looper - ${i} tiles in ${ms - this.lastMs}ms. [${
              this.lastMs
            }, ${ms}]`
          )*/
          this.speedTiles = Math.max(
            (this.speedMs * this.speedTiles) / (ms - this.lastMs),
            10 // It can get stuck too low and become /really/ slow
          );
          this.lastMs = Date.now();
          window.requestAnimationFrame(
            () => this.nextBatch && this.nextBatch()
          );
        }
      };
      window.requestAnimationFrame(() => this.nextBatch && this.nextBatch());
    },
    stop(): Promise<unknown> {
      console.debug(
        `Renderer:Looper.stop() [${this.tasksCompleted} ${this.stopped}]`
      );
      if (this.stopped) {
        return Promise.resolve();
      }
      const promise = new Promise((f) => {
        this.finish = f;
      });
      this.stopped = true;
      return promise;
    }
  };

  console.debug(`Renderer() [${viewPort}]`);
  const renderer: PrivateRenderer = {
    tiles: undefined,
    tileIterator: undefined,
    ctx: (canvas as HTMLCanvasElement).getContext("2d") || undefined,
    vp: viewPort,
    fillColorer: undefined,
    strokeColorer: undefined,
    setTileStream(tiles) {
      if (isCallable(tiles)) {
        this.tiles = (tiles as (vp: Polygon) => Iterable<Tile>)(this.vp);
      } else {
        this.tiles = tiles as Iterable<Tile>;
      }
      console.debug(`Renderer.setTileStream() - tiles:${tiles}`);
      looper.start(
        () => this.renderNext(),
        () => this.clearCanvas()
      );
    },
    setFillColorer(c) {
      this.fillColorer = c;
      if (this.tiles) {
        console.debug(`Renderer.setFillColorer(${c}) - tiles:${this.tiles}`);
        looper.start(
          () => this.renderNext(),
          () => this.clearCanvas()
        );
      }
    },
    setStrokeColorer(c) {
      this.strokeColorer = c;
      if (this.tiles) {
        console.debug(`Renderer.setStrokeColorer(${c}) - tiles:${this.tiles}`);
        looper.start(
          () => this.renderNext(),
          () => this.clearCanvas()
        );
      }
    },
    renderNext(): boolean {
      if (this.tiles) {
        if (this.tileIterator === undefined)
          this.tileIterator = this.tiles[Symbol.iterator]();
        const { done: tilesDone, value: tilesValue } = this.tileIterator.next();
        if (!tilesDone && tilesValue) {
          if (this.ctx) {
            drawCanvas(
              tilesValue.polygon(),
              this.getStroke(tilesValue),
              this.getFill(tilesValue),
              this.ctx
            );
            return true;
          }
        }
        if (tilesDone) {
          console.debug(
            `Renderer.renderNext() - DONE! [${tilesDone}, ${tilesValue}]`
          );
          looper.stop();
          return false;
        }
      }
      return false;
    },
    clearCanvas() {
      if (this.ctx)
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.tileIterator = undefined;
    },
    getFill(t) {
      return this.fillColorer
        ? this.fillColorer(t)
        : "rgba(255, 192, 203, 0.3)"; //todo
    },
    getStroke(t) {
      return this.strokeColorer ? this.strokeColorer(t) : "black";
    },
    stop() {
      looper.stop();
    }
  };
  return renderer;
}
