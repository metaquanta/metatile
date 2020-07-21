import { Tile } from "../classes/Tile";
import { ViewPort } from "../classes/ViewPort";
import { Colorer } from "./Colorer";

export type Renderer = {
  setSpeed: (s: number) => void;
  setDrawTiles: (f: (t: Tile, ctx: CanvasRenderingContext2D) => void) => void;
  setTileStream: (f: (vp: ViewPort | undefined) => Generator<Tile>) => void;
  setfillColorer: (c: Generator<Colorer>) => void;
  setStrokeColorer: (c: Generator<Colorer>) => void;
  setContext: (ctx: CanvasRenderingContext2D) => void;
  setViewPort: (vp: ViewPort | undefined) => void;
};

export type RendererOptions = {
  speed: number;
  fillColorer: boolean;
  strokeColorer: boolean;
  viewPort: boolean;
};

type Looper = {
  speed: number;
  stop: boolean;
  intervalId: number | undefined;
  resolveStop: (() => void) | undefined;
  startInterval: (r: { renderNext: () => void }) => number;
  stopInterval: () => Promise<unknown>;
  restart: (r: { renderNext: () => void; clearCanvas: () => void }) => void;
};

type PrivateRenderer = Renderer & {
  f: ((vp: ViewPort | undefined) => Generator<Tile>) | undefined;
  tiles: Generator<Tile> | undefined;
  fillColorers: Generator<(t: Tile) => string> | undefined;
  strokeColorers: Generator<(t: Tile) => string> | undefined;
  drawTile: ((t: Tile, ctx: CanvasRenderingContext2D) => void) | undefined;
  renderNext: () => void;
  clearCanvas: () => void;
  ctx: CanvasRenderingContext2D | undefined;
  vp: ViewPort | undefined;
};

const renderer = (params: RendererOptions): PrivateRenderer => {
  const looper: Looper = {
    intervalId: undefined,
    stop: false,
    resolveStop: undefined,
    speed: params.speed,
    startInterval(r): number {
      return window.setInterval(() => {
        if (this.stop) {
          this.stop = false;
          window.clearInterval(this.intervalId);
          if (this.resolveStop) this.resolveStop();
          return;
        }
        for (let i = 0; i < this.speed; i++) {
          r.renderNext();
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
          r.clearCanvas();
          this.intervalId = this.startInterval(r);
        });
      } else {
        this.intervalId = this.startInterval(r);
      }
    },
  };
  return {
    f: undefined,
    tiles: undefined,
    fillColorers: undefined,
    strokeColorers: undefined,
    drawTile: undefined,
    ctx: undefined,
    vp: undefined,

    setSpeed(s) {
      looper.speed = s;
    },
    setDrawTiles(f) {
      this.drawTile = f;
      console.log(
        `Renderer.setDrawTiles() - tiles:${this.f !== undefined}, ctx:${
          this.ctx !== undefined
        }, d():${this.drawTile !== undefined}`
      );
      if (this.f && this.ctx) looper.restart(this);
    },
    setTileStream(t) {
      this.f = t;
      this.tiles = undefined;
      console.log(
        `Renderer.setTileStream() - tiles:${this.f !== undefined}, ctx:${
          this.ctx !== undefined
        }, d():${this.drawTile !== undefined}`
      );
      if (this.ctx && this.drawTile) looper.restart(this);
    },
    setfillColorer(c) {
      this.fillColorers = c;
      console.log(
        `Renderer.setfillColorer() - tiles:${this.f !== undefined}, ctx:${
          this.ctx !== undefined
        }, d():${this.drawTile !== undefined}`
      );
      if (this.f && this.ctx && this.drawTile) looper.restart(this);
    },
    setStrokeColorer(c) {
      this.strokeColorers = c;
      console.log(
        `Renderer.setStrokeColorer() - tiles:${this.f !== undefined}, ctx:${
          this.ctx !== undefined
        }, d():${this.drawTile !== undefined}`
      );
      if (this.f && this.ctx && this.drawTile) looper.restart(this);
    },
    setContext(ctx) {
      this.ctx = this.ctx || ctx;
      console.log(
        `Renderer.setContext() - tiles:${this.f !== undefined}, ctx:${
          this.ctx !== undefined
        }, d():${this.drawTile !== undefined}`
      );
      if (this.f && this.drawTile) looper.restart(this);
    },
    setViewPort(vp) {
      this.vp = vp;
      console.log(
        `Renderer.setViewPort() - tiles:${this.f !== undefined}, ctx:${
          this.ctx !== undefined
        }, d():${this.drawTile !== undefined}`
      );
      if (this.f && this.ctx && this.drawTile) looper.restart(this);
    },
    renderNext() {
      if (params.fillColorer && this.fillColorers === undefined) {
        console.log(`Renderer - fillColorer required but missing`);
        return;
      }
      if (params.strokeColorer && this.strokeColorers === undefined) {
        console.log(`Renderer - strokeColorer required but missing`);
        return;
      }
      if (params.viewPort && this.vp === undefined) {
        console.log(`Renderer - viewPort required but missing`);
        return;
      }
      if (this.tiles === undefined && this.f) this.tiles = this.f(this.vp);
      if (this.tiles === undefined) {
        console.log(`Renderer - Tile Generator missing!!!`);
        return;
      }
      if (this.f && this.drawTile && this.ctx) {
        const { done: tilesDone, value: tilesValue } = this.tiles.next();
        if (!tilesDone && tilesValue) {
          if (this.fillColorers) {
            const {
              done: fillsDone,
              value: fillsValue,
            } = this.fillColorers.next();
            if (!fillsDone && fillsValue) {
              this.ctx.fillStyle = fillsValue(tilesValue);
            }
          }
          if (this.strokeColorers) {
            const {
              done: strokesDone,
              value: strokesValue,
            } = this.strokeColorers.next();
            if (!strokesDone && strokesValue) {
              this.ctx.strokeStyle = strokesValue(tilesValue);
            }
          }
          this.drawTile(tilesValue, this.ctx);
        }
        if (tilesDone) {
          console.log("DONE");
          looper.stopInterval();
        }
      }
    },
    clearCanvas() {
      if (this.ctx)
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    },
  };
};
export default renderer;
