import { intersects, Rect, Rhomb, Triangle } from "./Polygon";
import { TriangleTile } from "./Tile";
import { V } from "./V";

/*
import { V } from "./V";

export interface Polygon {
  vertices: () => V[];
  triangles: () => Triangle[];
  contains: (p: V | Polygon) => boolean;
  intersects: (p: Polygon) => boolean;
  translate: (v: V) => this;
  toString: () => string;
}

export type Triangle = Polygon & {
  a: V;
  b: V;
  c: V;
};

export type Rhomb = Polygon & {
  a: V;
  b: V;
  c: V;
  d: V;
};

export type Rect = Rhomb;

function isPolygon(p: Polygon | V): boolean {
  return (p as Polygon).vertices !== undefined;
}

export const Polygon = (vertices: V[]): Polygon => {
  const triangles = () =>
    vertices
      .slice(2)
      .map((_, i) => Triangle(vertices[0], vertices[i + 1], vertices[i + 2]));
  return {
    vertices: () => vertices,
    triangles,
    contains(p) {
      return contains(this, p);
    },
    intersects(p) {
      return intersects(this, p);
    },
    translate: (v) => Polygon(vertices.map((u) => u.add(v))),
    toString: () => {
      if (vertices.length === 0) return "∅";
      if (vertices.length === 1) return "⋅" + vertices[0];
      return `⦗${vertices
        .map((v) => v.toString())
        .join(
          vertices.length < 6 ? ["⭎", "⯅", "⯁", "⯂"][vertices.length - 2] : "⬣"
        )}⦘`;
    }
  };
};

export const Triangle = (a: V, b: V, c: V): Triangle => ({
  a,
  b,
  c,
  vertices: () => [a, b, c],
  triangles() {
    return [this];
  },
  contains(v) {
    if (isPolygon(v)) {
      return (v as Polygon).vertices().every((v) => this.contains(v));
    }
    return triangleContains(this, v as V);
  },
  intersects(p) {
    return this.vertices().some((v) => p.contains(v));
  },
  translate: (v) => Triangle(a.add(v), b.add(v), c.add(v)),
  toString: () => `⟮${a}▽${b}▼${c}⟯`
});

export const Rhomb = (a: V, b: V, c: V, d: V): Rhomb => ({
  a,
  b,
  c,
  d,
  vertices: () => [a, b, c, d],
  triangles: () => [Triangle(a, b, c), Triangle(a, c, d)],
  contains(p) {
    return contains(this, p);
  },
  intersects(p) {
    return intersects(this, p);
  },
  translate: (v) => Rhomb(a.add(v), b.add(v), c.add(v), d.add(v)),
  toString: () => `⟮${a}▱${b}▰${c}▱${d}⟯`
});

export const Rect = (x0: number, y0: number, xf: number, yf: number): Rect =>
  Rhomb(V(x0, y0), V(xf, y0), V(xf, yf), V(x0, yf));
  */

test("Rect.translate()", () => {
  const v = V(23, 75);
  const p = Rect(5, 5, 136, 36);
  const q = p.translate(v);
  const a = q.vertices()[0];
  const b = q.vertices()[1];
  const c = q.vertices()[2];
  const d = q.vertices()[3];
  const i = V(5 + 23, 5 + 75);
  const j = V(136 + 23, 5 + 75);
  const k = V(136 + 23, 36 + 75);
  const l = V(5 + 23, 36 + 75);
  expect(vecsEqual(a, i)).toBeTruthy;
  expect(vecsEqual(b, j)).toBeTruthy;
  expect(vecsEqual(c, k)).toBeTruthy;
  expect(vecsEqual(d, l)).toBeTruthy;
});

test("Rect.vertices()", () => {
  const q = Rect(5, 5, 136, 36);
  const a = q.vertices()[0];
  const b = q.vertices()[1];
  const c = q.vertices()[2];
  const d = q.vertices()[3];
  const i = V(5, 5);
  const j = V(136, 5);
  const k = V(136, 36);
  const l = V(5, 36);
  expect(vecsEqual(a, i)).toBeTruthy;
  expect(vecsEqual(b, j)).toBeTruthy;
  expect(vecsEqual(c, k)).toBeTruthy;
  expect(vecsEqual(d, l)).toBeTruthy;
});

test("Rect.covers()", () => {
  const q = Rect(5, 5, 136, 36);
  const t = Triangle(V(6, 6), V(135, 27), V(100, 35));
  const s = Triangle(V(6, 6), V(135, 37), V(100, 35));
  expect(q.contains(t)).toBeTruthy;
  expect(q.contains(s)).toBeFalsy;
});

test("Triangle.covers()", () => {
  const t = Triangle(V(5, 5), V(55, 7), V(30, 30));
  const r = Rect(4, 4, 56, 31);
  const s = Rect(4, 4, 10, 10);
  expect(t.contains(r)).toBeFalsy;
  expect(t.contains(s)).toBeTruthy;
});

test("Triangle.contains()", () => {
  const t1 = Triangle(V(650, 134), V(656, 364), V(-25, 364));
  const t2 = Triangle(V(650, 134), V(-25, 134), V(-25, 364));
  for (let i = 0; i < 1000; i++) {
    const v = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    expect(t1.contains(v) || t2.contains(v)).toBeTruthy;
    expect(t1.contains(v) && t2.contains(v)).toBeFalsy;
  }
});

test("Triangle.intersects()", () => {
  const t1 = Triangle(V(650, 134), V(656, 364), V(-25, 364));
  const t2 = Triangle(V(650, 134), V(-25, 134), V(-25, 364));
  for (let i = 0; i < 1000; i++) {
    const v = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    const u = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    const w = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    const tp = Triangle(v, u, w);
    const c = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    const b = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    const a = V(Math.random() * 775, Math.random() * 230).add(V(-25, 134));
    const sp = Triangle(c, b, a);
    expect(intersects(tp, t1) || intersects(t2, tp)).toBeTruthy;
    expect(intersects(sp, tp) == intersects(tp, sp)).toBeTruthy;
    expect(intersects(tp, t1) == t1.intersects(tp)).toBeTruthy;
    expect(intersects(sp, t2) == t2.intersects(sp)).toBeTruthy;
  }
  expect(
    Triangle(
      V(231.33628675421036, 799.5215543539744),
      V(178.66371324578964, 1522.4784456460256),
      V(-125.2477849343422, 864.3911657654808)
    ).intersects(
      Rhomb(V(200, 1000), V(2500, 1000), V(2500, 2000), V(200, 2000))
    )
  ).toBeTruthy;
  expect(
    TriangleTile(
      Triangle(
        V(231.33628675421036, 799.5215543539744),
        V(178.66371324578964, 1522.4784456460256),
        V(-125.2477849343422, 864.3911657654808)
      ),
      (t) => t,
      (t) => [t]
    ).intersects(Rect(200, 1000, 2500, 2000))
  ).toBeTruthy;
});

/*
export function contains(p: Polygon, q: Polygon | V): boolean {
  if (isPolygon(q)) {
    return (q as Polygon).vertices().every((v) => contains(p, v));
  }
  return p.triangles().some((t) => t.contains(q));
}

export function intersects(p: Polygon, q: Polygon): boolean {
  // ...or, their bounding boxes intersect. Add only necessary complexity.
  const pxM = Math.max(...p.vertices().map((p) => p.x));
  const pxm = Math.min(...p.vertices().map((p) => p.x));
  const pyM = Math.max(...p.vertices().map((p) => p.x));
  const pym = Math.min(...p.vertices().map((p) => p.x));
  const qxM = Math.max(...q.vertices().map((p) => p.x));
  const qxm = Math.min(...q.vertices().map((p) => p.x));
  const qyM = Math.max(...q.vertices().map((p) => p.x));
  const qym = Math.min(...q.vertices().map((p) => p.x));
  return !(pxM < qxm || pxm > qxM || pyM < qym || pym > qyM);
}

export const triangleContains = (t: Triangle, p: V): boolean => {
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

export function pathFromPolygon(poly: Polygon): Path2D {
  const p = new Path2D();
  p.moveTo(poly.vertices()[0].x, poly.vertices()[0].y);
  poly
    .vertices()
    .slice(1)
    .forEach((v) => p.lineTo(v.x, v.y));
  p.closePath();
  return p;
}
*/

const vecsEqual = (u: V, v: V) => {
  expect(u.x).toBeCloseTo(v.x);
  expect(u.y).toBeCloseTo(v.y);
};
