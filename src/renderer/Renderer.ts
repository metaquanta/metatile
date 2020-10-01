import FixedCanvasElement from "../lib/browser/FixedCanvasElement.js";
import Polygon, { Rect } from "../lib/math/2d/Polygon.js";
import { insist, isCallable, isDone } from "../lib/util";
import Prototile from "../tiles/Prototile.js";
import Colorer from "./Colorer";
import run from "./runner";
import WebGlRenderer from "./webGlRenderer.js";

export type Renderer = { render(): Promise<HTMLCanvasElement | SVGSVGElement> };

export namespace Renderer {
  export type Builder = _Builder;

  export function builder(): Builder {
    return new _Builder();
  }
}

function create(
  draw: (p: Polygon, s: number, f: Colorer.Color) => void,
  stroke: number,
  fillColorer: Colorer,
  tiles: Iterator<Tile>,
  canvas: HTMLCanvasElement | SVGSVGElement
) {
  return {
    render(): Promise<HTMLCanvasElement | SVGSVGElement> {
      return run(() => {
        const result = tiles.next();
        if (isDone(result)) {
          console.debug(`Renderer.renderNext() - DONE!`);
          return false;
        }
        draw(result.value.polygon(), stroke, fillColorer(result.value));
        return true;
      }).then(() => canvas);
    }
  };
}

class _Builder {
  #canvas: FixedCanvasElement | undefined;
  #svg: SVGSVGElement | undefined;
  #tiles: ((vp: Polygon) => Iterable<Tile>) | undefined;
  #fillColorer: Colorer | undefined;
  #stroke: number | undefined;

  tiles(tiles: ((vp: Polygon) => Iterable<Tile>) | Iterable<Tile>): this {
    if (!isCallable(tiles)) {
      this.#tiles = (_) => tiles;
    } else {
      this.#tiles = tiles;
    }
    return this;
  }

  fillColorer(c: Colorer): this {
    this.#fillColorer = c;
    return this;
  }

  stroke(a: number): this {
    this.#stroke = a;
    return this;
  }

  canvas(c: FixedCanvasElement): this {
    this.#canvas = c;
    return this;
  }

  svg(svg: SVGSVGElement): this {
    this.#svg = svg;
    return this;
  }

  build(mode: "canvas" | "webgl" | "svg") {
    console.debug(`Renderer.build("${mode}")`);
    const vp = Rect.from(insist(this.#svg?.viewBox ?? this.#canvas?.viewPort));
    const tileIterator = (this.#tiles as (vp: Rect) => Iterable<Tile>)(vp);

    const fill = this.#fillColorer ?? Colorer.fixed(0, 0, 50, 1);

    if (this.#canvas) {
      if (mode === "webgl") {
        const gl = this.#canvas.getContext("webgl2", {
          preserveDrawingBuffer: true
        });
        if (gl) {
          return WebGlRenderer(gl, fill, tileIterator);
        }
      }
      if (mode === "canvas") {
        const ctx = this.#canvas.getContext("2d");
        const scale = (this.#canvas as { pixelRatio?: number }).pixelRatio ?? 1;
        if (ctx) {
          const renderer = create(
            (p, s, f) => drawCanvas(p, s, f, ctx, scale),
            this.#stroke ?? 1,
            fill,
            tileIterator[Symbol.iterator](),
            this.#canvas
          );
          this.build = () => renderer;
          return renderer;
        }
      }
    }

    if (this.#svg !== undefined && mode === "svg") {
      return create(
        (p, _, f) => drawSvg(p, f, this.#svg as SVGSVGElement),
        this.#stroke ?? 1,
        fill,
        tileIterator[Symbol.iterator](),
        this.#svg
      );
    }

    throw new Error("No canvas or svg!");
  }
}

interface Tile {
  readonly proto: Prototile;
  polygon(): Polygon;
  reflected(): boolean;
}

function drawCanvas(
  tile: Polygon,
  stroke: number,
  fillColor: Colorer.Color,
  ctx: CanvasRenderingContext2D,
  scale: number
): void {
  ctx.fillStyle = fillColor.toString();
  ctx.strokeStyle = Colorer.fixed(0, 0, 0, stroke).toString();
  ctx.lineJoin = "round";
  const p = Polygon.getCanvasPath(tile.scale(scale), new Path2D());
  ctx.stroke(p);
  ctx.fill(p);
}

const svgNs = "http://www.w3.org/2000/svg";
function drawSvg(
  tile: Polygon,
  fillColor: Colorer.Color,
  svg: SVGElement
): void {
  const p = document.createElementNS(svgNs, "path");
  // For some reason ns MUST be null below.
  p.setAttributeNS(null, "d", Polygon.toSvgPath(tile));
  p.setAttributeNS(null, "fill", fillColor.toString());
  svg.appendChild(p);
}

export default Renderer;
