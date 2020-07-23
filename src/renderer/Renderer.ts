import { Tile } from "../classes/Tile";
import { ViewPort } from "../classes/ViewPort";
import draw from "./DrawTile";

export type Renderer = {
  //setDrawTiles: (f: (t: Tile, ctx: CanvasRenderingContext2D) => void) => void;
  setTileStream: (tiles: Generator<Tile, void, ViewPort>) => void;
  //setfillColorer: (c: Generator<Colorer>) => void;
  //setStrokeColorer: (c: Generator<Colorer>) => void;
  //setViewPort: (vp: ViewPort | undefined) => void;
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
  //f: ((vp: ViewPort | undefined) => Generator<Tile>) | undefined;
  tiles: Generator<Tile> | undefined;
  //fillColorers: Generator<(t: Tile) => string> | undefined;
  //strokeColorers: Generator<(t: Tile) => string> | undefined;
  //drawTile: ((t: Tile, ctx: CanvasRenderingContext2D) => void) | undefined;
  renderNext: () => void;
  clearCanvas: () => void;
  ctx: CanvasRenderingContext2D;
  vp: ViewPort;
};

const renderer = (
  canvas: HTMLCanvasElement,
  viewPort: ViewPort
): PrivateRenderer => {
  const looper: Looper = {
    stopped: true,
    speed: 100,
    resolveStopped: undefined,
    iter: undefined,
    start(task) {
      console.log(`Renderer:Looper.start()`);
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
      console.log(`Renderer:Looper.stop()`);
      const promise = new Promise((f) => {
        this.resolveStopped = f;
      });
      this.stopped = true;
      return promise;
    }
  };
  return {
    tiles: undefined,
    ctx: <CanvasRenderingContext2D>canvas.getContext("2d"), //todo
    vp: viewPort,

    /*setDrawTiles(f) {
      this.drawTile = f;
      console.log(
        `Renderer.setDrawTiles() - tiles:${this.f !== undefined}, ctx:${this.ctx !== undefined
        }, d():${this.drawTile !== undefined}`
      );
      if (this.f && this.ctx) looper.restart(this);
    },*/
    setTileStream(tiles) {
      this.tiles = tiles;
      console.log(`Renderer.setTileStream() - tiles:${tiles}`);
      looper.start(() => this.renderNext());
    },
    /*setfillColorer(c) {
      this.fillColorers = c;
      console.log(
        `Renderer.setfillColorer() - tiles:${this.f !== undefined}, ctx:${this.ctx !== undefined
        }, d():${this.drawTile !== undefined}`
      );
      if (this.f && this.ctx && this.drawTile) looper.restart(this);
    },
    setStrokeColorer(c) {
      this.strokeColorers = c;
      console.log(
        `Renderer.setStrokeColorer() - tiles:${this.f !== undefined}, ctx:${this.ctx !== undefined
        }, d():${this.drawTile !== undefined}`
      );
      if (this.f && this.ctx && this.drawTile) looper.restart(this);
    },
    setContext(ctx) {
      this.ctx = this.ctx || ctx;
      console.log(
        `Renderer.setContext() - tiles:${this.f !== undefined}, ctx:${this.ctx !== undefined
        }, d():${this.drawTile !== undefined}`
      );
      if (this.f && this.drawTile) looper.restart(this);
    },
    setViewPort(vp) {
      this.vp = vp;
      console.log(
        `Renderer.setViewPort() - tiles:${this.f !== undefined}, ctx:${this.ctx !== undefined
        }, d():${this.drawTile !== undefined}`
      );
      if (this.f && this.ctx && this.drawTile) looper.restart(this);
    },*/
    renderNext() {
      /*if (params.fillColorer && this.fillColorers === undefined) {
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
      }*/
      //if (this.f && this.drawTile && this.ctx) {
      if (this.tiles) {
        const { done: tilesDone, value: tilesValue } = this.tiles.next(this.vp);
        if (!tilesDone && tilesValue) {
          this.ctx.fillStyle = "pink"; //todo

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
    }
  };
};

export function Renderer(
  canvas: HTMLCanvasElement,
  viewport: ViewPort
): Renderer {
  return renderer(canvas, viewport);
}
