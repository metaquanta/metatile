import { Polygon } from "../classes/Polygon";
import { Tile } from "../classes/Tile";
import { ViewPort } from "../classes/ViewPort";
import { Colorer } from "./Colorer";
import draw from "./DrawTile";

export type Renderer = {
  setTileStream: (tiles: (vp: Polygon) => Generator<Tile>) => void;
  setFillColorer: (c: Colorer) => void;
  setStrokeColorer: (c: Colorer) => void;
};

type Looper = {
  speed: number;
  stopped: boolean;
  resolveStopped: (() => void) | undefined;
  start: (r: () => void) => void;
  stop: () => Promise<unknown>;
  iter: (() => void) | undefined;
};

type PrivateRenderer = Renderer & {
  tiles: Generator<Tile> | undefined;
  renderNext: () => void;
  clearCanvas: () => void;
  ctx: CanvasRenderingContext2D;
  vp: ViewPort;
  stop: () => void;
  fillColorer: Colorer | undefined;
  strokeColorer: Colorer | undefined;
};

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
    speed: 100,
    resolveStopped: undefined,
    iter: undefined,
    start(task) {
      console.log(`Renderer:Looper.start()`);
      if (!this.stopped) {
        this.stop().then(() => this.start(task));
      }
      this.stopped = false;
      this.iter = () => {
        if (this.stopped) {
          if (this.resolveStopped) this.resolveStopped();
        } else {
          for (let i = 0; i < this.speed; i++) {
            task();
          }
          window.requestAnimationFrame(() => this.iter && this.iter());
        }
      };
      window.requestAnimationFrame(() => this.iter && this.iter());
    },
    stop(): Promise<unknown> {
      console.log(`Renderer:Looper.stop() [${this.stopped}]`);
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

  const renderer: PrivateRenderer = {
    tiles: undefined,
    ctx: <CanvasRenderingContext2D>canvas.getContext("2d"), //todo
    vp: viewPort,
    fillColorer: undefined,
    strokeColorer: undefined,
    setTileStream(tiles) {
      this.tiles = tiles(this.vp);
      console.log(`Renderer.setTileStream() - tiles:${tiles}`);
      looper.start(() => this.renderNext());
    },
    setFillColorer(c) {
      this.fillColorer = c;
      if (this.tiles) {
        console.log(`Renderer.setFillColorer(${c}) - tiles:${this.tiles}`);
        looper.start(() => this.renderNext());
      }
    },
    setStrokeColorer(c) {
      this.strokeColorer = c;
      if (this.tiles) {
        console.log(`Renderer.setStrokeColorer(${c}) - tiles:${this.tiles}`);
        looper.start(() => this.renderNext());
      }
    },
    renderNext() {
      if (this.tiles) {
        const { done: tilesDone, value: tilesValue } = this.tiles.next();
        if (!tilesDone && tilesValue) {
          this.ctx.fillStyle = "rgba(255, 192, 203, 0.3)"; //todo

          this.ctx.strokeStyle = "black"; //todo
          draw(tilesValue, this.ctx);
        }
        if (tilesDone) {
          console.log(`DONE [${tilesDone}, ${tilesValue}]`);
          looper.stop();
        }
      }
    },
    clearCanvas() {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    },
    stop() {
      looper.stop().then(() => this.clearCanvas());
    }
  };

  rrElem.___renderer = renderer;
  return renderer;
}
