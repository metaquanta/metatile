import { Polygon } from "./Polygon";
import { Vec2 } from "./Vec2";

type Seg = [Vec2, Vec2];

export type ViewPort = {
  contains: (p: Vec2) => boolean;
  intersects: (s: Polygon) => boolean;
  vertices: () => [Vec2, Vec2, Vec2, Vec2];
  toString: () => string;
};

function intersectsPolygon(vp: ViewPort, p: Polygon): boolean {
  const verts = vp.vertices();
  const l = verts[0].x;
  const r = verts[2].x;
  const b = verts[0].y;
  const t = verts[2].y;
  if (Math.max(...p.vertices.map((v) => v.x)) < l) return false;
  if (Math.max(...p.vertices.map((v) => v.y)) < b) return false;
  if (Math.min(...p.vertices.map((v) => v.x)) > r) return false;
  if (Math.min(...p.vertices.map((v) => v.y)) > t) return false;
  return true; // well, maybe
}

let _VIEWPORT:
  | (ViewPort & { outerDiv: HTMLDivElement })
  | undefined = undefined;

export const ViewPort = (outer: HTMLDivElement): ViewPort | undefined => {
  if (_VIEWPORT && _VIEWPORT.outerDiv == outer) {
    return _VIEWPORT;
  }

  const inner = <HTMLDivElement>outer.firstElementChild;
  if (inner === undefined) {
    console.log(`ViewPort(): missing innder <div>!`);
    return;
  }

  const canvas = <HTMLCanvasElement>inner.firstElementChild;

  const getOuterSize = (): Vec2 => {
    const width = outer.clientWidth;
    const height = outer.clientHeight;
    console.log(`ViewPort:getOuterSize(): ${width}×${height}`);
    return Vec2(width, height);
  };

  const getInnerPosition = (): Vec2 => {
    const max = getInnerSize();
    const size = getOuterSize();
    const width = Math.round((size.x - max) / 2);
    const height = Math.round((size.y - max) / 2);
    console.log(`ViewPort:getInnerPosition(): ${width}×${height}, max=${max}`);
    return Vec2(width, height);
  };

  function setInnerPosition() {
    const origin = getInnerPosition();
    inner.style.top = `${origin.y}px`;
    inner.style.left = `${origin.x}px`;
  }

  function getInnerSize(): number {
    const max = Math.round(Math.max(window.screen.height, window.screen.width));
    console.log(
      `getInnerSize(): ${window.screen.width}×${window.screen.height}, max=${max}`
    );
    return max;
  }

  function setInnerSize() {
    const size = getInnerSize();
    inner.style.height = `${size}px`;
    inner.style.width = `${size}px`;
  }

  function setCanvasSize() {
    const size = Math.round(getInnerSize() * window.devicePixelRatio);
    canvas.height = size;
    canvas.width = size;
  }

  const getViewPortOrigin = () =>
    getInnerPosition().scale(window.devicePixelRatio).invert();
  const getViewPortSize = () => getOuterSize().scale(window.devicePixelRatio);

  function getViewPort(): ViewPort & { outerDiv: HTMLDivElement } {
    const origin = getViewPortOrigin();
    const size = getViewPortSize();
    return {
      vertices: () => [
        origin,
        Vec2(size.x, 0).add(origin),
        origin.add(size),
        Vec2(0, size.y).add(origin)
      ],
      outerDiv: outer,
      contains(p) {
        const verts = this.vertices();
        if (
          p.x >= verts[0].x &&
          p.x <= verts[2].x &&
          p.y >= verts[0].y &&
          p.y <= verts[2].y
        )
          return true;
        return false;
      },
      intersects(p) {
        return intersectsPolygon(this, p);
      },
      toString: () =>
        `⦗↤${origin.x}, ↥${origin.y}, ↦${origin.x + size.x}, ↧${
          origin.y + size.y
        }⦘`
    };
  }

  if (_VIEWPORT == undefined) {
    window.addEventListener("resize", () => setInnerPosition());

    setInnerSize();
    setCanvasSize();
    setInnerPosition();

    _VIEWPORT = getViewPort();
  }

  return _VIEWPORT;
};
