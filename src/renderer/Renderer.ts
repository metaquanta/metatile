import { canvasPathFromPolygon, Polygon } from "../lib/math/2d/Polygon.js";
import { ViewPort } from "../lib/browser/ViewPort.js";
import { isCallable } from "../lib/util.js";
import { Colorer } from "./Colorer.js";
import Runner from "./Runner.js";
import { Tile } from "../tiles/Tile.js";

export type Renderer = {
  render: () => void;
};

class Builder {
  #canvas: HTMLCanvasElement | undefined;
  #viewPort: ViewPort | undefined;
  #tiles: ((vp: Polygon) => Iterable<Tile>) | undefined;
  #fillColorer: Colorer | undefined;
  #strokeColorer: Colorer | undefined;

  tiles(tiles: ((vp: Polygon) => Iterable<Tile>) | Iterable<Tile>) {
    if (!isCallable(tiles)) {
      this.#tiles = (_) => tiles as Iterable<Tile>;
    } else {
      this.#tiles = tiles as (vp: Polygon) => Iterable<Tile>;
    }
    return this;
  }

  fillColorer(c: Colorer) {
    this.#fillColorer = c;
    return this;
  }
  strokeColorer(c: Colorer) {
    this.#strokeColorer = c;
    return this;
  }

  canvas(c: HTMLCanvasElement) {
    this.#canvas = c;
    return this;
  }

  viewport(vp: ViewPort) {
    this.#viewPort = vp;
    return this;
  }

  build() {
    const runner = Runner();
    const ctx =
      (this.#canvas as HTMLCanvasElement).getContext("2d") || undefined;
    const tileIterator = (this.#tiles as (vp: Polygon) => Iterable<Tile>)(
      this.#viewPort as Polygon
    )[Symbol.iterator]();

    const clearCanvas = () => {
      if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };
    const getFill = (tile: Tile) => {
      return this.#fillColorer
        ? this.#fillColorer(tile)
        : "rgba(255, 192, 203, 0.3)"; //todo
    };
    const getStroke = (tile: Tile) => {
      return this.#strokeColorer ? this.#strokeColorer(tile) : "black";
    };

    console.debug(`Renderer() [${this.#viewPort}]`);
    const renderNext = () => {
      const { done: tilesDone, value: tilesValue } = tileIterator.next();
      if (!tilesDone && tilesValue) {
        if (ctx) {
          drawCanvas(
            tilesValue.polygon(),
            getStroke(tilesValue),
            getFill(tilesValue),
            ctx
          );
          return true;
        }
      }
      if (tilesDone) {
        console.debug(
          `Renderer.renderNext() - DONE! [${tilesDone}, ${tilesValue}]`
        );
        runner.stop();
        return false;
      }
      return false;
    };

    return {
      render: () => {
        runner.start(
          () => renderNext(),
          () => clearCanvas()
        );
      }
    };
  }
}

export function RendererBuilder(): Builder {
  return new Builder();
}

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
