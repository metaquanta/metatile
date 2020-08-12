import { V } from "./V";

export interface Polygon {
  vertices: () => V[];
  triangles: () => Triangle[];
  edges: () => [V, V][];
  sides: () => number;
  contains: (p: V | Polygon) => boolean;
  intersects: (p: Polygon) => boolean;
  center: () => V;
  area: () => number;
  boundingBox: () => Rect;
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

// Looks nicer than "Quadrilateral".
export type Tetragon = Polygon & {
  a: V;
  b: V;
  c: V;
  d: V;
  translate: (v: V) => Tetragon;
};

// We gotta have a "Rhomb" for Penrose.
export type Rhomb = Tetragon;

export type Rect = Polygon & {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export function isRect<T>(p: Rect | T): boolean {
  return (p as Rect).bottom !== undefined;
}

export function Polygon(vertices: V[]): Polygon {
  return new _Polygon(vertices);
}

// These don't implement the interfaces here to trick the polymorphic this
// nonsense. They're still treated as though they do elsewhere.
class _Polygon {
  #vertices: V[];
  constructor(vertices: V[]) {
    if (vertices.length < 3)
      throw new Error("!!A polygon must have at least three vertices.!!");
    this.#vertices = vertices;
  }

  triangles() {
    return this.#vertices
      .slice(2)
      .map((_, i) =>
        Triangle(
          this.#vertices[0],
          this.#vertices[i + 1],
          this.#vertices[i + 2]
        )
      );
  }

  edges(): [V, V][] {
    return this.#vertices.map((_, i) => [
      this.#vertices[i],
      this.#vertices[(i + 1) % this.#vertices.length]
    ]);
  }

  vertices() {
    return this.#vertices;
  }

  sides() {
    return this.#vertices.length;
  }

  area() {
    return area(this);
  }

  contains(p: V | Polygon): boolean {
    return contains(this, p);
  }

  intersects(p: Polygon): boolean {
    return intersects(this, p);
  }

  center() {
    return this.#vertices
      .reduce((a, b) => a.add(b))
      .scale(1 / this.#vertices.length);
  }

  translate(v: V): Polygon {
    return Polygon(this.#vertices.map((u) => u.add(v)));
  }

  equals(p: Polygon): boolean {
    return equals(this, p);
  }

  boundingBox(): Rect {
    return boundingBox(this);
  }

  toString() {
    return `⦗${this.#vertices
      .map((v) => v.toString())
      .join(
        this.#vertices.length < 6
          ? ["⯅", "⯁", "⯂"][this.#vertices.length - 3]
          : "⬣"
      )}⦘`;
  }
}

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

class _Rect extends _Polygon {
  left: number;
  right: number;
  top: number; // note: by computer graphics conventions, this is the bottom
  bottom: number; // note: by computer graphics conventions, this is the top
  constructor(x0: number, y0: number, xf: number, yf: number) {
    super([V(x0, y0), V(xf, y0), V(xf, yf), V(x0, yf)]);
    this.left = x0;
    this.right = xf;
    this.top = yf;
    this.bottom = y0;
  }

  pad(n: number) {
    return new _Rect(
      this.left - n,
      this.bottom - n,
      this.right + n,
      this.top + n
    );
  }

  toString() {
    // note: bottom and top are really top and bottom by computer graphics
    // convention
    return `⟮↤${this.left}, ↧${this.bottom}, ↦${this.right}, ↥${this.top}⟯`;
  }
}

export const Triangle = (a: V, b: V, c: V): Triangle => new _Triangle(a, b, c);

export const Tetragon = (a: V, b: V, c: V, d: V): Tetragon =>
  new _Tetragon(a, b, c, d);

export const Rhomb = (a: V, b: V, c: V, d: V): Tetragon => Tetragon(a, b, c, d);

export const Rect = (x0: number, y0: number, xf: number, yf: number): Rect =>
  new _Rect(x0, y0, xf, yf);

function contains(p: Polygon, q: Polygon | V): boolean {
  if (isPolygon(q)) {
    return (q as Polygon).vertices().every((v) => contains(p, v));
  }
  return p.triangles().some((t) => triangleContains(t, q as V));
}

function triangleContains(t: Polygon, p: V): boolean {
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
}

function area(p: Polygon): number {
  return Math.abs(
    p
      .edges()
      .map(([u, v]) => ((u.y + v.y) / 2) * (v.x - u.x))
      .reduce((l, r) => l + r)
  );
}

export function chirality(p: Polygon): boolean {
  // Yup, I realized my area alg can determine chirality.
  return (
    p
      .edges()
      .map(([u, v]) => ((u.y + v.y) / 2) * (v.x - u.x))
      .reduce((l, r) => l + r) > 0
  );
}

function boundingBox(p: Polygon): Rect {
  return Rect(
    Math.min(...p.vertices().map((p) => p.x)),
    Math.min(...p.vertices().map((p) => p.y)),
    Math.max(...p.vertices().map((p) => p.x)),
    Math.max(...p.vertices().map((p) => p.y))
  );
}

function intersects(p: Polygon, q: Polygon): boolean {
  // ...or, their bounding boxes intersect. Add only necessary complexity.
  const pbb = boundingBox(p);
  const qbb = boundingBox(q);
  return !(
    pbb.right < qbb.left ||
    pbb.left > qbb.right ||
    pbb.top < qbb.bottom ||
    pbb.bottom > qbb.top
  );
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

export function canvasPathFromPolygon<
  T extends {
    moveTo: (x: number, y: number) => void;
    lineTo: (x: number, y: number) => void;
    closePath: () => void;
  }
>(poly: Polygon, path: T): T {
  path.moveTo(poly.vertices()[0].x, poly.vertices()[0].y);
  poly
    .vertices()
    .slice(1)
    .forEach((v) => path.lineTo(v.x, v.y));
  path.closePath();
  return path;
}

// For SVG Path element.
export function svgPathFromPolygon(poly: Polygon): string {
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

// For SVG Polygon's points attribute.
export function svgPointsFromPolygon(p: Polygon): string {
  return p
    .vertices()
    .map((v) => `${v.x},${v.y}`)
    .join(" ");
}