import { Polygon } from "../classes/Polygon";
import { Tile } from "../classes/Tile";
import { ViewPort } from "../classes/ViewPort";
import { Colorer } from "./Colorer";
import draw from "./DrawTile";

export type Renderer = {
  setTileStream: (
    tiles: ((vp: Polygon) => Iterable<Tile>) | Iterable<Tile>
  ) => void;
  setFillColorer: (c: Colorer) => void;
  setStrokeColorer: (c: Colorer) => void;
  drawTile: (t: Tile) => void;
};

type Looper = {
  speed: number;
  stopped: boolean;
  resolveStopped: (() => void) | undefined;
  start: (r: () => void, c: () => void) => void;
  stop: () => Promise<unknown>;
  iter: (() => void) | undefined;
  cleanUp: (() => void) | undefined;
  cnt: number;
};

type PrivateRenderer = Renderer & {
  tiles: Iterable<Tile> | undefined;
  tileIterator: Iterator<Tile> | undefined;
  renderNext: () => boolean;
  clearCanvas: () => void;
  ctx: CanvasRenderingContext2D;
  vp: ViewPort;
  stop: () => void;
  fillColorer: Colorer | undefined;
  strokeColorer: Colorer | undefined;
  getFill: (t: Tile) => string;
  getStroke: (t: Tile) => string;
};

function isCallable<T, V>(f: ((p: V) => T) | T): boolean {
  return (f as () => T).call !== undefined;
}

export function Renderer(
  canvas: HTMLCanvasElement,
  viewPort: ViewPort
): Renderer {
  const rrElem = canvas as HTMLCanvasElement & { ___renderer: PrivateRenderer };
  if (rrElem.___renderer) {
    if (rrElem.___renderer.vp === viewPort) {
      return rrElem.___renderer;
    } else {
      rrElem.___renderer.stop();
    }
  }

  const looper: Looper = {
    stopped: true,
    speed: 250,
    resolveStopped: undefined,
    iter: undefined,
    cleanUp: undefined,
    cnt: 0,
    start(task, cleanUp) {
      console.log(`Renderer:Looper.start() [${this.cnt}]`);
      if (!this.stopped) {
        this.stop().then(() => this.start(task, cleanUp));
        return;
      }
      this.stopped = false;
      if (this.cleanUp) this.cleanUp();
      this.cleanUp = cleanUp;
      this.iter = () => {
        if (this.stopped) {
          if (this.resolveStopped) this.resolveStopped();
        } else {
          for (let i = 0; i < this.speed && task(); i++) {
            this.cnt++;
          }
          window.requestAnimationFrame(() => this.iter && this.iter());
        }
      };
      window.requestAnimationFrame(() => this.iter && this.iter());
    },
    stop(): Promise<unknown> {
      console.log(`Renderer:Looper.stop() [${this.cnt} ${this.stopped}]`);
      if (this.stopped) {
        return Promise.resolve();
      }
      const promise = new Promise((f) => {
        this.resolveStopped = f;
      });
      this.stopped = true;
      return promise;
    }
  };

  console.log(`Renderer() [${viewPort}]`);
  const renderer: PrivateRenderer = {
    tiles: undefined,
    tileIterator: undefined,
    ctx: <CanvasRenderingContext2D>canvas.getContext("2d"),
    vp: viewPort,
    fillColorer: undefined,
    strokeColorer: undefined,
    setTileStream(tiles) {
      if (isCallable(tiles)) {
        this.tiles = (tiles as (vp: Polygon) => Iterable<Tile>)(this.vp);
      } else {
        this.tiles = tiles as Iterable<Tile>;
      }
      console.log(`Renderer.setTileStream() - tiles:${tiles}`);
      looper.start(
        () => this.renderNext(),
        () => this.clearCanvas()
      );
    },
    setFillColorer(c) {
      this.fillColorer = c;
      if (this.tiles) {
        console.log(`Renderer.setFillColorer(${c}) - tiles:${this.tiles}`);
        looper.start(
          () => this.renderNext(),
          () => this.clearCanvas()
        );
      }
    },
    setStrokeColorer(c) {
      this.strokeColorer = c;
      if (this.tiles) {
        console.log(`Renderer.setStrokeColorer(${c}) - tiles:${this.tiles}`);
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
          this.ctx.fillStyle = this.getFill(tilesValue);
          this.ctx.strokeStyle = this.getStroke(tilesValue);
          draw(tilesValue, this.ctx);
          return true;
        }
        if (tilesDone) {
          console.log(`DONE [${tilesDone}, ${tilesValue}]`);
          looper.stop();
          return false;
        }
      }
      return false;
    },
    clearCanvas() {
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
    },
    drawTile(t: Tile) {
      this.ctx.fillStyle = this.getFill(t);
      this.ctx.strokeStyle = this.getStroke(t);
      draw(t, this.ctx);
    }
  };

  rrElem.___renderer = renderer;
  return renderer;
}
