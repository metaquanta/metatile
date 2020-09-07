import { ViewPort } from "../lib/browser/ViewPort";
import {
    canvasPathFromPolygon, Polygon, rectFrom, svgPointsFromPolygon
} from "../lib/math/2d/Polygon.js";
import { isCallable, isDone } from "../lib/util";
import { Tile } from "../tiles/Tile";
import { WebGlCanvas } from "../WebGlCanvas";
import { Color, Colorer, StaticColorer } from "./Colorer";
import Runner from "./Runner";

function Renderer(
  draw: (p: Polygon, s: Color, f: Color) => void,
  block: () => void,
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

      runner.start(rendertile, block, clear);
    }
  };
}

class Builder {
  #canvas: HTMLCanvasElement | undefined;
  #svg: SVGSVGElement | undefined;
  #viewPort: ViewPort | undefined;
  #tiles: ((vp: Polygon) => Iterable<Tile>) | undefined;
  #fillColorer: Colorer | undefined;
  #strokeColorer: Colorer | undefined;

  tiles(tiles: ((vp: Polygon) => Iterable<Tile>) | Iterable<Tile>) {
    if (!isCallable(tiles)) {
      this.#tiles = (_) => tiles;
    } else {
      this.#tiles = tiles;
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

  svg(svg: SVGSVGElement) {
    this.#svg = svg;
    return this;
  }

  viewport(vp: ViewPort) {
    this.#viewPort = vp;
    return this;
  }

  build() {
    const vp =
      this.#viewPort ?? (this.#svg ? rectFrom(this.#svg.viewBox) : undefined);
    if (vp === undefined) throw new Error();
    const tileIterator = this.#tiles as (vp: Polygon) => Iterable<Tile>;

    const fill = this.#fillColorer ?? StaticColorer(0, 0, 50, 1);
    const stroke = this.#strokeColorer ?? StaticColorer(0, 0, 0, 1);

    if (this.#canvas) {
      const gl = this.#canvas.getContext("webgl");
      if (gl) {
        const glc = WebGlCanvas(gl);
        glc.clear();
        return {
          render: () => {
            let i = 0;
            // ~ 12MiB
            const vertices = new Float32Array(2 ** 21);
            const colors = new Float32Array(2 ** 22);
            for (const t of tileIterator(vp)) {
              const color = fill(t);
              for (const v of t
                .polygon()
                .triangles()
                .flatMap((t) => t.vertices())) {
                vertices[2 * i] = v.x;
                vertices[2 * i + 1] = v.y;
                colors[4 * i] = color.h;
                colors[4 * i + 1] = color.s;
                colors[4 * i + 2] = color.v;
                colors[4 * i + 3] = color.a;
                i = i + 1;
              }
            }
            glc.colors(colors).vertices(vertices).render(gl.TRIANGLES);
            i = 0;
            for (const t of tileIterator(vp)) {
              const color = stroke(t);
              const v = t.polygon().vertices();
              for (let j = 0; j < v.length; j++) {
                vertices[4 * i] = v[j].x;
                vertices[4 * i + 1] = v[j].y;
                vertices[4 * i + 2] = v[(j + 1) % v.length].x;
                vertices[4 * i + 3] = v[(j + 1) % v.length].y;
                colors[8 * i] = color.h;
                colors[8 * i + 1] = color.s;
                colors[8 * i + 2] = color.v;
                // webgl lines are too thick/dark
                colors[8 * i + 3] = color.a * 0.3;
                colors[8 * i + 4] = color.h;
                colors[8 * i + 5] = color.s;
                colors[8 * i + 6] = color.v;
                colors[8 * i + 7] = color.a * 0.3;
                i = i + 1;
              }
            }
            glc.colors(colors).vertices(vertices).render(gl.LINES);
          }
        };
      }
      const ctx = this.#canvas.getContext("2d");
      if (ctx)
        return Renderer(
          (p, s, f) => drawCanvas(p, s, f, ctx),
          () => undefined,
          () => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height),
          stroke,
          fill,
          tileIterator(vp)[Symbol.iterator]()
        );
    }

    if (this.#svg !== undefined) {
      return Renderer(
        (p, s, f) => drawSvg(p, s, f, this.#svg as SVGSVGElement),
        () => undefined,
        () => {
          (this.#svg as SVGSVGElement).innerHTML = "";
        },
        stroke,
        fill,
        tileIterator(vp)[Symbol.iterator]()
      );
    }

    throw new Error("No canvas or svg!");
  }
}

export function RendererBuilder(): Builder {
  return new Builder();
}

function drawCanvas(
  tile: Polygon,
  strokeColor: Color,
  fillColor: Color,
  ctx: CanvasRenderingContext2D
): void {
  ctx.fillStyle = fillColor.toString();
  ctx.strokeStyle = strokeColor.toString();
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
