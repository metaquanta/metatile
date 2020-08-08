import { canvasPathFromPolygon, Polygon } from "../classes/Polygon";
import { Prototile } from "../classes/Tile";
import { ViewPort } from "../classes/ViewPort";
import { isCallable } from "../util";
import { Colorer } from "./Colorer";

export type Renderer = {
  setTileStream: (
    tiles:
      | ((
          vp: Polygon
        ) => Iterable<{
          polygon: () => Polygon;
          proto: Prototile;
          reflected: boolean;
        }>)
      | Iterable<{ polygon: () => Polygon }>
  ) => void;
  setFillColorer: (c: Colorer) => void;
  setStrokeColorer: (c: Colorer) => void;
  drawTile: (t: {
    polygon: () => Polygon;
    proto: Prototile;
    reflected: boolean;
  }) => void;
};

type Looper = {
  speedTiles: number;
  speedMs: number;
  lastMs: number;
  stopped: boolean;
  resolveStopped: (() => void) | undefined;
  start: (r: () => void, c: () => void) => void;
  stop: () => Promise<unknown>;
  iter: (() => void) | undefined;
  cleanUp: (() => void) | undefined;
  cnt: number;
};

type PrivateRenderer = Renderer & {
  tiles:
    | Iterable<{ polygon: () => Polygon; proto: Prototile; reflected: boolean }>
    | undefined;
  tileIterator:
    | Iterator<{ polygon: () => Polygon; proto: Prototile; reflected: boolean }>
    | undefined;
  renderNext: () => boolean;
  clearCanvas: () => void;
  ctx: CanvasRenderingContext2D | undefined;
  svg: SVGElement | undefined;
  vp: ViewPort;
  stop: () => void;
  fillColorer: Colorer | undefined;
  strokeColorer: Colorer | undefined;
  getFill: (t: {
    polygon: () => Polygon;
    proto: Prototile;
    reflected: boolean;
  }) => string;
  getStroke: (t: {
    polygon: () => Polygon;
    proto: Prototile;
    reflected: boolean;
  }) => string;
};

export function drawCanvas(
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
  canvas: HTMLCanvasElement | SVGElement,
  viewPort: ViewPort
): Renderer {
  const looper: Looper = {
    stopped: true,
    speedTiles: 100,
    // Apparently, Chrome calls a requestAnimationFrame() over 50ms a
    // "violation". (sometimes)
    speedMs: 50,
    lastMs: Date.now(),
    resolveStopped: undefined,
    iter: undefined,
    cleanUp: undefined,
    cnt: 0,
    start(task, cleanUp) {
      console.debug(`Renderer:Looper.start() [${this.cnt}]`);
      if (!this.stopped) {
        this.stop().then(() => this.start(task, cleanUp));
        return;
      }
      this.stopped = false;
      if (this.cleanUp) this.cleanUp();
      this.cleanUp = cleanUp;
      this.lastMs = Date.now();
      this.iter = () => {
        if (this.stopped) {
          if (this.resolveStopped) this.resolveStopped();
        } else {
          let i = 0;
          for (; i < this.speedTiles && task(); i++) {
            this.cnt++;
          }
          const ms = Date.now();
          console.log(
            `Renderer:Looper - ${i} tiles in ${ms - this.lastMs}ms. [${
              this.lastMs
            }, ${ms}]`
          );
          this.speedTiles = Math.max(
            (this.speedMs / (ms - this.lastMs)) * this.speedTiles,
            1
          );
          this.lastMs = Date.now();
          window.requestAnimationFrame(() => this.iter && this.iter());
        }
      };
      window.requestAnimationFrame(() => this.iter && this.iter());
    },
    stop(): Promise<unknown> {
      console.debug(`Renderer:Looper.stop() [${this.cnt} ${this.stopped}]`);
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

  console.debug(`Renderer() [${viewPort}]`);
  const renderer: PrivateRenderer = {
    tiles: undefined,
    tileIterator: undefined,
    ctx: isCanvas(canvas)
      ? (canvas as HTMLCanvasElement).getContext("2d") || undefined
      : undefined,
    svg: isSvg(canvas) ? (canvas as SVGElement) : undefined,
    vp: viewPort,
    fillColorer: undefined,
    strokeColorer: undefined,
    setTileStream(tiles) {
      if (isCallable(tiles)) {
        this.tiles = (tiles as (
          vp: Polygon
        ) => Iterable<{
          polygon: () => Polygon;
          proto: Prototile;
          reflected: boolean;
        }>)(this.vp);
      } else {
        this.tiles = tiles as Iterable<{
          polygon: () => Polygon;
          proto: Prototile;
          reflected: boolean;
        }>;
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
      if (this.svg) this.svg.innerHTML = "";
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
    drawTile(t: {
      polygon: () => Polygon;
      proto: Prototile;
      reflected: boolean;
    }) {
      if (this.ctx) {
        drawCanvas(t.polygon(), this.getStroke(t), this.getFill(t), this.ctx);
      } else {
        console.error("Renderer.drawTile() No canvas!");
      }
    }
  };
  return renderer;
}

function isCanvas(c: HTMLCanvasElement | SVGElement): boolean {
  return (c as HTMLCanvasElement).getContext !== undefined;
}

function isSvg(c: HTMLCanvasElement | SVGElement): boolean {
  return (c as HTMLCanvasElement).getContext === undefined;
}
