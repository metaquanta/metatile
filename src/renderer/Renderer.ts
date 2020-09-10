import {
    canvasPathFromPolygon, Polygon, Rect, rectFrom, svgPointsFromPolygon
} from "../lib/math/2d/Polygon.js";
import { isCallable } from "../lib/util";
import { Tile } from "../tiles/Tile";
import { Colorer } from "./Colorer";
import Runner from "./Runner";

export class Renderer {
  #draw: (p: Polygon, s: string, f: string) => void;
  #clear: () => void;
  #strokeColorer: (t: Tile) => string;
  #fillColorer: (t: Tile) => string;
  #tiles: Iterator<Tile>;

  constructor(
    draw: (p: Polygon, s: string, f: string) => void,
    clear: () => void,
    strokeColorer: (t: Tile) => string,
    fillColorer: (t: Tile) => string,
    tiles: Iterator<Tile>
  ) {
    this.#draw = draw;
    this.#clear = clear;
    this.#strokeColorer = strokeColorer;
    this.#fillColorer = fillColorer;
    this.#tiles = tiles;
  }

  render(): void {
    this.render = () => undefined;
    const runner = Runner();

    const renderNext = () => {
      const { done: tilesDone, value: tilesValue } = this.#tiles.next();
      if (!tilesDone && tilesValue) {
        this.#draw(
          tilesValue.polygon(),
          this.#strokeColorer(tilesValue),
          this.#fillColorer(tilesValue)
        );
        return true;
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

    runner.start(
      () => renderNext(),
      () => this.#clear()
    );
  }
}

class _RendererBuilder {
  #canvas: CanvasRenderingContext2D | undefined;
  #svg: SVGSVGElement | undefined;
  #viewPort: Rect | undefined;
  #tiles: ((vp: Polygon) => Iterable<Tile>) | undefined;
  #fillColorer: Colorer | undefined;
  #strokeColorer: Colorer | undefined;

  tiles(tiles: ((vp: Polygon) => Iterable<Tile>) | Iterable<Tile>): this {
    if (!isCallable(tiles)) {
      this.#tiles = (_) => tiles as Iterable<Tile>;
    } else {
      this.#tiles = tiles;
    }
    return this;
  }

  fillColorer(c: Colorer): this {
    this.#fillColorer = c;
    return this;
  }
  strokeColorer(c: Colorer): this {
    this.#strokeColorer = c;
    return this;
  }

  canvas(c: CanvasRenderingContext2D): this {
    this.#canvas = c;
    return this;
  }

  svg(svg: SVGSVGElement): this {
    this.#svg = svg;
    return this;
  }

  viewport(vp: Rect): this {
    this.#viewPort = vp;
    return this;
  }

  build(mode: "canvas" | "webgl" | "svg"): Renderer {
    const vp =
      this.#viewPort ?? (this.#svg ? rectFrom(this.#svg.viewBox) : undefined);
    const tileIterator = (this.#tiles as (vp: Polygon) => Iterable<Tile>)(
      vp as Polygon
    )[Symbol.iterator]();

    const getFill = (tile: Tile) => {
      return this.#fillColorer
        ? this.#fillColorer(tile)
        : "rgba(255, 192, 203, 0.3)"; //todo
    };
    const getStroke = (tile: Tile) => {
      return this.#strokeColorer ? this.#strokeColorer(tile) : "black";
    };

    if (this.#canvas && mode === "canvas") {
      const ctx = this.#canvas as CanvasRenderingContext2D;
      if (ctx) {
        const renderer = new Renderer(
          (p, s, f) => drawCanvas(p, s, f, ctx),
          () => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
          getStroke,
          getFill,
          tileIterator
        );
        this.build = () => renderer;
        return renderer;
      }
    }

    if (this.#svg !== undefined && mode === "svg") {
      return new Renderer(
        (p, s, f) => drawSvg(p, s, f, this.#svg as SVGSVGElement),
        () => {
          (this.#svg as SVGSVGElement).innerHTML = "";
        },
        getStroke,
        getFill,
        tileIterator
      );
    }

    throw new Error("No canvas or svg!");
  }
}

export type RendererBuilder = _RendererBuilder;
export function RendererBuilder(): RendererBuilder {
  return new _RendererBuilder();
}

function drawCanvas(
  tile: Polygon,
  strokeColor: string,
  fillColor: string,
  ctx: CanvasRenderingContext2D
): void {
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineJoin = "round";
  const p = canvasPathFromPolygon(tile, new Path2D());
  ctx.stroke(p);
  ctx.fill(p);
}

const svgNs = "http://www.w3.org/2000/svg";
function drawSvg(
  tile: Polygon,
  strokeColor: string,
  fillColor: string,
  svg: SVGElement
): void {
  const p = document.createElementNS(svgNs, "polygon");
  // For some reason ns MUST be null below.
  p.setAttributeNS(null, "points", svgPointsFromPolygon(tile));
  p.setAttributeNS(null, "fill", fillColor);
  p.setAttributeNS(null, "stroke", strokeColor);
  p.setAttributeNS(null, "stroke-width", "0.5");
  p.setAttributeNS(null, "stroke-linejoin", "round");
  svg.appendChild(p);
}
