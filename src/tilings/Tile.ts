import {ViewPort} from './Tiling';

export type Tile = {
  polygon: Polygon;
  children: () => Tile[];
  getPath: () => Path2D;
  contains: (p: Vec2) => boolean;
  intersectsViewport: (vp: ViewPort) => boolean;
  variant?: number;
};

export const tileIntersectsViewport = (tile: Tile, viewport: ViewPort) =>
  tile.polygon
    .translate(Vec2(viewport.x0, viewport.y0).invert())
    .intersectsRect(Vec2(viewport.xf - viewport.x0, viewport.yf - viewport.y0));
export const Tile = (
  polygon: Polygon,
  children: () => Tile[],
  variant?: number
): Tile => ({
  polygon,
  children,
  getPath: () => polygon.getPath(),
  contains: point => {
    const b = polygon.contains(point);
    console.log(`${polygon}.contains(${point}) = ${b}`);
    return b;
  },
  intersectsViewport(rect) {
    return tileIntersectsViewport(this, rect);
  },
  variant,
});

export type TileWithParent = Tile & {
  parent: () => TileWithParent;
  depth: number;
};

export const TileWithParent = (
  polygon: Polygon,
  children: () => Tile[],
  parent: () => TileWithParent,
  depth: number,
  variant?: number
): TileWithParent => ({
  polygon,
  children,
  parent,
  depth,
  getPath: () => polygon.getPath(),
  contains: point => polygon.contains(point),
  intersectsViewport(rect) {
    return tileIntersectsViewport(this, rect);
  },
  variant,
});

export type Polygon = {
  vertices: Vec2[];
  triangles: () => Triangle[];
  contains: (p: Vec2) => boolean;
  intersectsRect: (p: Vec2) => boolean;
  getPath: () => Path2D;
  translate: (v: Vec2) => Polygon;
  toString: () => string;
};

export const Polygon = (vertices: Vec2[]): Polygon => {
  const triangles = () =>
    vertices
      .slice(2)
      .map((_, i) => Triangle(vertices[0], vertices[i + 1], vertices[i + 2]));
  return {
    vertices,
    triangles,
    intersectsRect: viewport => {
      if (
        Math.max(...vertices.map(p => p.x)) > 0 &&
        Math.min(...vertices.map(p => p.x)) < viewport.x &&
        Math.max(...vertices.map(p => p.y)) > 0 &&
        Math.min(...vertices.map(p => p.y)) < viewport.y
      ) {
        return true;
      }
      return false;
    },
    contains: p =>
      triangles()
        .map(t => t.containsPoint(p))
        .some(b => b),
    getPath: () => {
      const p = new Path2D();
      p.moveTo(vertices[0].x, vertices[0].y);
      vertices.slice(1).forEach(v => p.lineTo(v.x, v.y));
      p.closePath();
      return p;
    },
    translate: v => Polygon(vertices.map(u => u.add(v))),
    toString: () => {
      if (vertices.length === 0) return '∅';
      if (vertices.length === 1) return '⋅' + vertices[0];
      return `⦗${vertices
        .map(v => v.toString())
        .join(
          vertices.length < 6 ? ['⭎', '⯅', '⯁', '⯂'][vertices.length - 2] : '⬣'
        )}⦘`;
    },
  };
};

export type Vec2 = {
  x: number;
  y: number;
  add: (u: Vec2) => Vec2;
  invert: () => Vec2;
  subtract: (u: Vec2) => Vec2;
  scale: (a: number) => Vec2;
  perp: () => Vec2;
  dot: (u: Vec2) => number;
  toString: () => string;
  magnitude: () => number;
};

export const Vec2 = (x: number, y: number): Vec2 => ({
  x,
  y,
  add: u => Vec2(x + u.x, y + u.y),
  invert: () => Vec2(-x, -y),
  subtract(u) {
    return this.add(u.invert());
  },
  scale: a => Vec2(a * x, a * y),
  perp: () => Vec2(y, -x),
  dot: u => x * u.x + y * u.y,
  magnitude: () => Math.sqrt(x * x + y * y),
  toString: () => `⟨${x}, ${y}⟩`,
});

export type Triangle = {
  a: Vec2;
  b: Vec2;
  c: Vec2;
  translate: (v: Vec2) => Triangle;
  polygon: () => Polygon;
  containsPoint: (v: Vec2) => boolean;
  toString: () => string;
};

const triangleContainsPoint = (t: Triangle, p: Vec2): boolean => {
  const c = t.c.subtract(t.a);
  const b = t.b.subtract(t.a);
  const q = p.subtract(t.a);

  const s0 = c.dot(c);
  const s1 = c.dot(b);
  const s2 = c.dot(q);
  const s3 = b.dot(b);
  const s4 = b.dot(q);

  const x = 1 / (s0 * s3 - s1 * s1);
  const e1 = (s3 * s2 - s1 * s4) * x;
  const e2 = (s0 * s4 - s1 * s2) * x;

  return e1 >= 0 && e2 >= 0 && e1 + e2 < 1;
};

export const Triangle = (a: Vec2, b: Vec2, c: Vec2): Triangle => ({
  a,
  b,
  c,
  translate: v => Triangle(a.add(v), b.add(v), c.add(v)),
  polygon: () => Polygon([a, b, c]),
  containsPoint(v) {
    return triangleContainsPoint(this, v);
  },
  toString: () => `⟮${a}▽${b}▼${c}⟯`,
});

export type Rhomb = {
  a: Vec2;
  b: Vec2;
  c: Vec2;
  d: Vec2;
  translate: (v: Vec2) => Rhomb;
  polygon: () => Polygon;
  toString: () => string;
};

export const Rhomb = (a: Vec2, b: Vec2, c: Vec2, d: Vec2): Rhomb => ({
  a,
  b,
  c,
  d,
  translate: v => Rhomb(a.add(v), b.add(v), c.add(v), d.add(v)),
  polygon: () => Polygon([a, b, c, d]),
  toString: () => `⟮${a}▱${b}▰${c}▱${d}⟯`,
});
