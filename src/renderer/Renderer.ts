import {
    canvasPathFromPolygon, Polygon, Rect, rectFrom, svgPointsFromPolygon
} from "../lib/math/2d/Polygon.js";
import { isCallable, isDone } from "../lib/util";
import { Tile } from "../tiles/Tile";
import { Color, Colorer, StaticColorer } from "./Colorer";
import Runner from "./Runner";
import { WebGlRenderer } from "./WebGlRenderer.js";

export type Renderer = { readonly render: () => void };

function Renderer(
  draw: (p: Polygon, s: Color, f: Color) => void,
  clear: () => void,
  strokeColorer: Colorer,
  fillColorer: Colorer,
  tiles: Iterator<Tile>
) {
  return {
    render() {
      const runner = Runner();

      const rendertile = () => {
        const result = tiles.next();
        if (!isDone(result)) {
          draw(
            result.value.polygon(),
            strokeColorer(result.value),
            fillColorer(result.value)
          );
          return true;
        }
        if (isDone(result)) {
          console.debug(`Renderer.renderNext() - DONE!`);
          runner.stop();
          return false;
        }
        return false;
      };

      runner.start(rendertile, () => undefined, clear);
    }
  };
}

class _RendererBuilder {
  #canvas: HTMLCanvasElement | undefined;
  #svg: SVGSVGElement | undefined;
  #viewPort: Rect | undefined;
  #tiles: ((vp: Polygon) => Iterable<Tile>) | undefined;
  #fillColorer: Colorer | undefined;
  #strokeColorer: Colorer | undefined;

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
  strokeColorer(c: Colorer): this {
    this.#strokeColorer = c;
    return this;
  }

  canvas(c: HTMLCanvasElement): this {
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

  build(mode: "canvas" | "webgl" | "svg") {
    console.debug(`Renderer.build("${mode}")`);
    const vp =
      this.#viewPort ?? (this.#svg ? rectFrom(this.#svg.viewBox) : undefined);
    if (vp === undefined) throw new Error();
    const tileIterator = (this.#tiles as (vp: Polygon) => Iterable<Tile>)(vp);

    const fill = this.#fillColorer ?? StaticColorer(0, 0, 50, 1);
    const stroke = this.#strokeColorer ?? StaticColorer(0, 0, 0, 1);

    if (this.#canvas) {
      if (mode === "webgl") {
        const gl = this.#canvas.getContext("webgl2");
        if (gl) {
          return WebGlRenderer(gl, fill, tileIterator);
        }
      }
      if (mode === "canvas") {
        const ctx = this.#canvas.getContext("2d");
        if (ctx) {
          const renderer = Renderer(
            (p, s, f) => drawCanvas(p, s, f, ctx),
            () => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
            stroke,
            fill,
            tileIterator[Symbol.iterator]()
          );
          this.build = () => renderer;
          return renderer;
        }
      }
    }

    if (this.#svg !== undefined && mode === "svg") {
      return Renderer(
        (p, s, f) => drawSvg(p, s, f, this.#svg as SVGSVGElement),
        () => {
          (this.#svg as SVGSVGElement).innerHTML = "";
        },
        stroke,
        fill,
        tileIterator[Symbol.iterator]()
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
  strokeColor: Color,
  fillColor: Color,
  ctx: CanvasRenderingContext2D
): void {
  ctx.fillStyle = fillColor.toString();
  ctx.strokeStyle = strokeColor.toString();
  ctx.lineJoin = "round";
  const p = canvasPathFromPolygon(tile, new Path2D());
  ctx.stroke(p);
  ctx.fill(p);
}

const svgNs = "http://www.w3.org/2000/svg";
function drawSvg(
  tile: Polygon,
  strokeColor: Color,
  fillColor: Color,
  svg: SVGElement
): void {
  const p = document.createElementNS(svgNs, "polygon");
  // For some reason ns MUST be null below.
  p.setAttributeNS(null, "points", svgPointsFromPolygon(tile));
  p.setAttributeNS(null, "fill", fillColor.toString());
  p.setAttributeNS(null, "stroke", strokeColor.toString());
  p.setAttributeNS(null, "stroke-width", "0.5");
  p.setAttributeNS(null, "stroke-linejoin", "round");
  svg.appendChild(p);
}
