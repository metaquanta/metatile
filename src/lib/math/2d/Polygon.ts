import V from "./V";

export interface Polygon {
  readonly vertices: () => V[];
  readonly triangles: () => Triangle[];
  readonly edges: () => [V, V][];
  readonly sides: () => number;
  readonly contains: (p: V | Polygon) => boolean;
  readonly intersects: (p: Polygon) => boolean;
  readonly center: () => V;
  readonly area: () => number;
  readonly boundingBox: () => Rect;
  readonly translate: (v: V) => this;
  readonly equals: (p: Polygon) => boolean;
  readonly toString: () => string;
}

export namespace Polygon {
  export function isInstance<T>(p: Polygon | T): p is Polygon {
    return (p as { vertices?: unknown }).vertices !== undefined;
  }

  export function create(vertices: V[]): Polygon {
    return new _Polygon(vertices);
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

  export function getCanvasPath<
    T extends {
      moveTo: (x: number, y: number) => void;
      lineTo: (x: number, y: number) => void;
      closePath: () => void;
    }
  >(poly: Polygon, path: T): T {
    path.moveTo(poly.vertices()[0].x * 2, poly.vertices()[0].y * 2);
    poly
      .vertices()
      .slice(1)
      .forEach((v) => path.lineTo(v.x * 2, v.y * 2));
    path.closePath();
    return path;
  }

  // For SVG Path element.
  export function getSvgPathFrom(poly: Polygon): string {
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
  export function getSvgPoints(p: Polygon): string {
    return p
      .vertices()
      .map((v) => `${v.x},${v.y}`)
      .join(" ");
  }
}

export type Triangle = Polygon & {
  a: V;
  b: V;
  c: V;
  translate: (v: V) => Triangle;
};

export namespace Triangle {
  export const create = (a: V, b: V, c: V): Triangle => new _Triangle(a, b, c);
}

// Looks nicer than "Quadrilateral".
export type Tetragon = Polygon & {
  a: V;
  b: V;
  c: V;
  d: V;
  translate: (v: V) => Tetragon;
};

export namespace Tetragon {
  export const create = (a: V, b: V, c: V, d: V): Tetragon =>
    new _Tetragon(a, b, c, d);
}

// We gotta have a "Rhomb" for Penrose.
export type Rhomb = Tetragon;

export namespace Rhomb {
  export const create = (a: V, b: V, c: V, d: V): Tetragon =>
    Tetragon.create(a, b, c, d);
}

export interface Rect extends Polygon {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export namespace Rect {
  export const create = (
    x0: number,
    y0: number,
    xf: number,
    yf: number
  ): Rect => new _Rect(x0, y0, xf, yf);

  export function from(
    obj:
      | SVGAnimatedRect
      | { x: number; y: number; width: number; height: number }
  ): Rect {
    if ((obj as { animVal: unknown }).animVal) {
      return from((obj as SVGAnimatedRect).animVal);
    }
    if (
      (obj as { x?: unknown }).x !== undefined &&
      (obj as { height?: unknown }).height !== undefined
    ) {
      const rect = obj as DOMRect | SVGRect;
      return create(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
    }
    throw new Error(`Bad cast! unreachable!!!`);
  }

  export function isInstance(p: Polygon): p is Rect {
    return (p as { bottom?: unknown }).bottom !== undefined;
  }
}

// These don't implement the interfaces here to trick the polymorphic this
// nonsense. They're still treated as though they do elsewhere.
class _Polygon {
  readonly #vertices: V[];
  constructor(vertices: V[]) {
    if (vertices.length < 3)
      throw new Error("!!A polygon must have at least three vertices.!!");
    this.#vertices = vertices;
  }

  triangles() {
    return this.#vertices
      .slice(2)
      .map((_, i) =>
        Triangle.create(
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
    return new _Polygon(this.#vertices.map((u) => u.add(v)));
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
  constructor(readonly a: V, readonly b: V, readonly c: V) {
    super([a, b, c]);
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
  constructor(readonly a: V, readonly b: V, readonly c: V, readonly d: V) {
    super([a, b, c, d]);
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
  // note: by computer graphics conventions, top is the bottom
  // note: by computer graphics conventions, bottom is the top
  constructor(
    readonly left: number,
    readonly bottom: number,
    readonly right: number,
    readonly top: number
  ) {
    super([
      V.create(left, bottom),
      V.create(right, bottom),
      V.create(right, top),
      V.create(left, top)
    ]);
  }

  pad(n: number) {
    return new _Rect(
      this.left - n,
      this.bottom - n,
      this.right + n,
      this.top + n
    );
  }

  translate(v: V): Rect {
    return new _Rect(
      this.left + v.x,
      this.bottom + v.y,
      this.right + v.x,
      this.top + v.y
    );
  }
  toString() {
    // note: bottom and top are really top and bottom by computer graphics
    // convention
    return `⟮↤${this.left}, ↧${this.bottom}, ↦${this.right}, ↥${this.top}⟯`;
  }
}

function contains(p: Polygon, q: Polygon | V): boolean {
  if (Polygon.isInstance(q)) {
    return q.vertices().every((v) => contains(p, v));
  }
  return p.triangles().some((t) => triangleContains(t, q));
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

function boundingBox(p: Polygon): Rect {
  return Rect.create(
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

export default Polygon;
