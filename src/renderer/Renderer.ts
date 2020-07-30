import {
  canvasPathFromPolygon,
  Polygon,
  svgPointsStringFromPolygon
} from "../classes/Polygon";
import { Tile } from "../classes/Tile";
import { ViewPort } from "../classes/ViewPort";
import { isCallable } from "../util";
import { Colorer } from "./Colorer";

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
  ctx: CanvasRenderingContext2D | undefined;
  svg: SVGElement | undefined;
  vp: ViewPort;
  stop: () => void;
  fillColorer: Colorer | undefined;
  strokeColorer: Colorer | undefined;
  getFill: (t: Tile) => string;
  getStroke: (t: Tile) => string;
};

export function drawCanvas(
  tile: Polygon,
  strokeColor: string,
  fillColor: string,
  ctx: CanvasRenderingContext2D
): void {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  const p = canvasPathFromPolygon(tile);
  ctx.stroke(p);
  ctx.fill(p);
}

export function drawSvg(
  tile: Polygon,
  strokeColor: string,
  fillColor: string,
  element: SVGElement
): void {
  const p = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  ((p: SVGPolygonElement) => {
    p.setAttribute("fill", fillColor);
    p.setAttribute("stroke", strokeColor);
    p.setAttribute("points", svgPointsStringFromPolygon(tile));
  })(p);
  element.appendChild(p);
}

export function Renderer(
  canvas: HTMLCanvasElement | SVGElement,
  viewPort: ViewPort
): Renderer {
  const looper: Looper = {
    stopped: true,
    speed: 250,
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
              tilesValue,
              this.getStroke(tilesValue),
              this.getFill(tilesValue),
              this.ctx
            );
            return true;
          } else if (this.svg) {
            drawSvg(
              tilesValue,
              this.getStroke(tilesValue),
              this.getFill(tilesValue),
              this.svg
            );
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
    drawTile(t: Tile) {
      if (this.ctx) {
        drawCanvas(t, this.getStroke(t), this.getFill(t), this.ctx);
      } else if (this.svg) {
        drawSvg(t, this.getStroke(t), this.getFill(t), this.svg);
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
