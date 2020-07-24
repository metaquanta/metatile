import { Polygon } from "./Polygon";
import { V } from "./V";

/*export type Tile = {
  polygon: Polygon,
  parent?: () => Tile,
  children: () => Tile[],
  draw: (ctx: CanvasRenderingContext2D) => void,
  contains: (p: V) => boolean,
  intersectsRect: (p: V) => boolean,
  translate: (v: V) => Tile
}

export type Polygon = {
  vertices: V[],
  triangles: () => Triangle[],
  contains: (p: V) => boolean,
  intersectsRect: (p: V) => boolean,
  draw: (ctx: CanvasRenderingContext2D) => void,
  translate: (v: V) => Polygon
}
*/

test("polygon translates", () => {
  const p = Polygon([V(0, 0), V(1, 1), V(0, 2)]).translate(V(1, 1));
  const q = p.vertices()[0];
  const r = p.vertices()[1];
  const s = p.vertices()[2];
  expect(q.x).toBe(1);
  expect(q.y).toBe(1);
  expect(r.x).toBe(2);
  expect(r.y).toBe(2);
  expect(s.x).toBe(1);
  expect(s.y).toBe(3);
});

/*export type V = {
  x: number,
  y: number,
  add: (u: V) => V,
  invert: () => V,
  subtract: (u: V) => V,
  scale: (a: number) => V,
  perp: () => V,
  dot: (u: V) => number,
  toString: () => string,
  magnitude: () => number
}

export type Triangle = {
  a: V,
  b: V,
  c: V,
  translate: (v: V) => Triangle,
  polygon: () => Polygon
}

export type Rhomb = {
  a: V,
  b: V,
  c: V,
  d: V,
  translate: (v: V) => Rhomb,
  polygon: () => Polygon
}

*/
