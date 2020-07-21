import { Tile } from "./Tile";
import { Polygon } from "./Polygon";
import { Vec2 } from "./Vec2";

/*export type Tile = {
  polygon: Polygon,
  parent?: () => Tile,
  children: () => Tile[],
  draw: (ctx: CanvasRenderingContext2D) => void,
  contains: (p: Vec2) => boolean,
  intersectsRect: (p: Vec2) => boolean,
  translate: (v: Vec2) => Tile
}

export type Polygon = {
  vertices: Vec2[],
  triangles: () => Triangle[],
  contains: (p: Vec2) => boolean,
  intersectsRect: (p: Vec2) => boolean,
  draw: (ctx: CanvasRenderingContext2D) => void,
  translate: (v: Vec2) => Polygon
}
*/

test("polygon translates", () => {
  const p = Polygon([Vec2(0, 0), Vec2(1, 1), Vec2(0, 2)]).translate(Vec2(1, 1));
  const q = p.vertices[0];
  const r = p.vertices[1];
  const s = p.vertices[2];
  expect(q.x).toBe(1);
  expect(q.y).toBe(1);
  expect(r.x).toBe(2);
  expect(r.y).toBe(2);
  expect(s.x).toBe(1);
  expect(s.y).toBe(3);
});

test("tile translates", () => {
  const p = Tile(
    Polygon([Vec2(0, 0), Vec2(1, 1), Vec2(0, 2)]).translate(Vec2(1, 1)),
    () => []
  );
  const q = p.polygon.vertices[0];
  const r = p.polygon.vertices[1];
  const s = p.polygon.vertices[2];
  expect(q.x).toBe(1);
  expect(q.y).toBe(1);
  expect(r.x).toBe(2);
  expect(r.y).toBe(2);
  expect(s.x).toBe(1);
  expect(s.y).toBe(3);
});

/*export type Vec2 = {
  x: number,
  y: number,
  add: (u: Vec2) => Vec2,
  invert: () => Vec2,
  subtract: (u: Vec2) => Vec2,
  scale: (a: number) => Vec2,
  perp: () => Vec2,
  dot: (u: Vec2) => number,
  toString: () => string,
  magnitude: () => number
}

export type Triangle = {
  a: Vec2,
  b: Vec2,
  c: Vec2,
  translate: (v: Vec2) => Triangle,
  polygon: () => Polygon
}

export type Rhomb = {
  a: Vec2,
  b: Vec2,
  c: Vec2,
  d: Vec2,
  translate: (v: Vec2) => Rhomb,
  polygon: () => Polygon
}

*/
