import { Tile } from "../classes/Tile";
import { Colorer } from "./Colorer";

export type Renderer = {
  setSpeed: (s: number) => void;
  setDrawTiles: (f: (t: Tile, ctx: CanvasRenderingContext2D) => void) => void;
  setTileStream: (t: Generator<Tile>) => void;
  setfillColorer: (c: Generator<Colorer>) => void;
  setStrokeColorer: (c: Generator<Colorer>) => void;
};

type Looper = {
  speed: number;
  stop: boolean;
  intervalId: number | undefined;
  resolveStop: (() => void) | undefined;
  startInterval: (f: () => void) => number;
  stopInterval: () => Promise<unknown>;
  restart: (r: { renderNext: () => void }) => void;
};

type PrivateRenderer = Renderer & {
  tiles: Generator<Tile, Tile> | undefined;
  fillColorers: Generator<(t: Tile) => string> | undefined;
  strokeColorers: Generator<(t: Tile) => string> | undefined;
  drawTile: ((t: Tile, ctx: CanvasRenderingContext2D) => void) | undefined;
  renderNext: () => void;
};

export function Renderer(ctx: CanvasRenderingContext2D): Renderer {
  const looper: Looper = {
    intervalId: undefined,
    stop: false,
    resolveStop: undefined,
    speed: 100,
    startInterval(f): number {
      return window.setInterval(() => {
        if (this.stop) {
          this.stop = false;
          window.clearInterval(this.intervalId);
          if (this.resolveStop) this.resolveStop();
          return;
        }
        for (let i = 0; i < this.speed; i++) {
          f();
        }
      }, 0);
    },
    stopInterval(): Promise<unknown> {
      const promise = new Promise((res, rej) => {
        this.resolveStop = res;
      });
      this.stop = true;
      return promise;
    },
    restart(r) {
      if (this.intervalId) {
        this.stopInterval().then(() => {
          ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
          this.intervalId = this.startInterval(() => r.renderNext());
        });
      } else {
        this.intervalId = this.startInterval(() => r.renderNext());
      }
    },
  };

  const renderer: PrivateRenderer = {
    tiles: undefined,
    fillColorers: undefined,
    strokeColorers: undefined,
    drawTile: undefined,

    setSpeed(s) {
      looper.speed = s;
    },
    setDrawTiles(f) {
      this.drawTile = f;
    },
    setTileStream(t) {
      this.tiles = t;
      looper.restart(this);
    },
    setfillColorer(c) {
      this.fillColorers = c;
      looper.restart(this);
    },
    setStrokeColorer(c) {
      this.strokeColorers = c;
      looper.restart(this);
    },
    renderNext() {
      if (this.tiles && this.drawTile) {
        const { done: tilesDone, value: tilesValue } = this.tiles.next();
        if (!tilesDone && tilesValue) {
          if (this.fillColorers) {
            const {
              done: fillsDone,
              value: fillsValue,
            } = this.fillColorers.next();
            if (!fillsDone && fillsValue) {
              ctx.fillStyle = fillsValue(tilesValue);
            }
          }
          if (this.strokeColorers) {
            const {
              done: strokesDone,
              value: strokesValue,
            } = this.strokeColorers.next();
            if (!strokesDone && strokesValue) {
              ctx.strokeStyle = strokesValue(tilesValue);
            }
          }
          this.drawTile(tilesValue, ctx);
        }
        if (tilesDone) {
          console.log("DONE");
          looper.stopInterval();
        }
      }
    },
  };

  return renderer;
}
