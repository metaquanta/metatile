import { V } from "./V";

export interface Polygon {
  vertices: () => V[];
  triangles: () => Triangle[];
  sides: () => number;
  contains: (p: V | Polygon) => boolean;
  intersects: (p: Polygon) => boolean;
  center: () => V;
  translate: (v: V) => this;
  equals: (p: Polygon) => boolean;
  toString: () => string;
}

export function isPolygon<T>(p: Polygon | T): boolean {
  return (p as Polygon).vertices !== undefined;
}

export type Triangle = Polygon & {
  a: V;
  b: V;
  c: V;
  translate: (v: V) => Triangle;
};

export type Tetragon = Polygon & {
  a: V;
  b: V;
  c: V;
  d: V;
  translate: (v: V) => Tetragon;
};

export type Rhomb = Tetragon;

export type Rect = Polygon & {
  left: number;
  right: number;
  top: number;
  bottom: number;
  pad: (n: number) => Rect;
};

export function isRect<T>(p: Rect | T): boolean {
  return (p as Rect).bottom !== undefined;
}

export const Polygon = (vertices: V[]): Polygon => {
  const triangles = () =>
    vertices
      .slice(2)
      .map((_, i) => Triangle(vertices[0], vertices[i + 1], vertices[i + 2]));
  return {
    vertices: () => vertices,
    triangles,
    sides: () => vertices.length,
    contains(p) {
      return contains(this, p);
    },
    intersects(p) {
      return intersects(this, p);
    },
    center() {
      return vertices.reduce((a, b) => a.add(b)).scale(1 / vertices.length);
    },
    translate: (v) => Polygon(vertices.map((u) => u.add(v))),
    equals(p) {
      return equals(this, p);
    },
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

// These don't implement the interfaces here to trick the polymorphic this
// nonsense. They're still treated as though they do elsewhere.
class _Polygon {
  _vertices: V[];
  constructor(vertices: V[]) {
    this._vertices = vertices;
  }

  triangles() {
    return this._vertices
      .slice(2)
      .map((_, i) =>
        Triangle(
          this._vertices[0],
          this._vertices[i + 1],
          this._vertices[i + 2]
        )
      );
  }

  vertices() {
    return this._vertices;
  }

  sides() {
    return this._vertices.length;
  }

  contains(p: V | Polygon): boolean {
    return contains(this, p);
  }

  intersects(p: Polygon): boolean {
    return intersects(this, p);
  }

  center() {
    return this._vertices
      .reduce((a, b) => a.add(b))
      .scale(1 / this._vertices.length);
  }

  translate(v: V): Polygon {
    return Polygon(this._vertices.map((u) => u.add(v)));
  }

  equals(p: Polygon): boolean {
    return equals(this, p);
  }

  toString() {
    if (this._vertices.length === 0) return "∅";
    if (this._vertices.length === 1) return "⋅" + this._vertices[0];
    return `⦗${this._vertices
      .map((v) => v.toString())
      .join(
        this._vertices.length < 6
          ? ["⭎", "⯅", "⯁", "⯂"][this._vertices.length - 2]
          : "⬣"
      )}⦘`;
  }
}

export const Triangle = (a: V, b: V, c: V): Triangle => new _Triangle(a, b, c);

class _Triangle extends _Polygon {
  a: V;
  b: V;
  c: V;

  constructor(a: V, b: V, c: V) {
    super([a, b, c]);
    this.a = a;
    this.b = b;
    this.c = c;
  }

  triangles() {
    return [this];
  }

  translate(v: V): Triangle {
    return new _Triangle(this.a.add(v), this.b.add(v), this.c.add(v));
  }
  toString() {
    return `⟮${this.a}▽${this.b}▼${this.c}⟯`;
  }
}

export const Tetragon = (a: V, b: V, c: V, d: V): Tetragon =>
  new _Tetragon(a, b, c, d);

export const Rhomb = (a: V, b: V, c: V, d: V): Tetragon => Tetragon(a, b, c, d);

class _Tetragon extends _Polygon {
  a: V;
  b: V;
  c: V;
  d: V;

  constructor(a: V, b: V, c: V, d: V) {
    super([a, b, c, d]);
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  translate(v: V): Tetragon {
    return new _Tetragon(
      this.a.add(v),
      this.b.add(v),
      this.c.add(v),
      this.d.add(v)
    );
  }
  toString() {
    return `⟮${this.a}▱${this.b}▰${this.c}▱${this.d}⟯`;
  }
}

export const Rect = (x0: number, y0: number, xf: number, yf: number): Rect => ({
  left: x0,
  right: xf,
  top: yf,
  bottom: y0,
  pad: (n: number) => Rect(x0 - n, y0 - n, xf + n, yf + n),
  ...Polygon([V(x0, y0), V(xf, y0), V(xf, yf), V(x0, yf)]),
  translate: (v) => Rect(x0 + v.x, y0 + v.y, xf + v.x, yf + v.y),
  toString: () => `⟮↤${x0}, ↥${y0}, ↦${xf}, ↧${yf}⟯`
});

function contains(p: Polygon, q: Polygon | V): boolean {
  if (isPolygon(q)) {
    return (q as Polygon).vertices().every((v) => contains(p, v));
  }
  return p.triangles().some((t) => triangleContains(t, q as V));
}

const triangleContains = (t: Polygon, p: V): boolean => {
  const [ta, tb, tc] = t.vertices();
  const c = tc.subtract(ta);
  const b = tb.subtract(ta);
  const q = p.subtract(ta);

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

function intersects(p: Polygon, q: Polygon): boolean {
  // ...or, their bounding boxes intersect. Add only necessary complexity.
  const pxM = Math.max(...p.vertices().map((p) => p.x));
  const pxm = Math.min(...p.vertices().map((p) => p.x));
  const pyM = Math.max(...p.vertices().map((p) => p.y));
  const pym = Math.min(...p.vertices().map((p) => p.y));
  const qxM = Math.max(...q.vertices().map((p) => p.x));
  const qxm = Math.min(...q.vertices().map((p) => p.x));
  const qyM = Math.max(...q.vertices().map((p) => p.y));
  const qym = Math.min(...q.vertices().map((p) => p.y));
  return !(pxM < qxm || pxm > qxM || pyM < qym || pym > qyM);
}

function equals(p: Polygon, q: Polygon) {
  const qv = q.vertices();
  const pv = p.vertices();
  if (qv.length !== pv.length) return false;
  const i = qv.findIndex((v) => v.equals(pv[0]));
  if (i === -1) return false;
  return qv
    .slice(i, qv.length)
    .concat(i > 0 ? qv.slice(0, i - 1) : [])
    .every((v, i) => v.equals(pv[i]));
}

export function canvasPathFromPolygon(poly: Polygon): Path2D {
  const p = new Path2D();
  p.moveTo(poly.vertices()[0].x, poly.vertices()[0].y);
  poly
    .vertices()
    .slice(1)
    .forEach((v) => p.lineTo(v.x, v.y));
  p.closePath();
  return p;
}

export function svgPathAttributeFromPolygon(poly: Polygon): string {
  return (
    `M ${poly.vertices()[0].x},${poly.vertices()[0].y} ` +
    poly
      .vertices()
      .slice(1)
      .map((v) => `L ${v.x},${v.y}`)
      .join(" \n") +
    " z"
  );
}

export function svgPointsStringFromPolygon(p: Polygon): string {
  return p
    .vertices()
    .map((v) => `${v.x},${v.y}`)
    .join(" ");
}
