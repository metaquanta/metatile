/* eslint-disable @typescript-eslint/no-namespace */
const EPS = 1e-10;

export interface V {
  readonly x: number;
  readonly y: number;
  add(u: V): V;
  invert(): V;
  subtract(u: V): V;
  scale(a: number): V;
  perp(): V;
  dot(u: V): number;
  norm(): number;
  equals(u: V): boolean;
  toString(): string;
}

export namespace V {
  export function create(x: number, y: number): V {
    return new _V(x, y);
  }

  export function theta(a: V): number {
    return (
      (Math.atan(a.y / a.x) + (a.x > 0 ? Math.PI : 0) + Math.PI * 2) %
      (Math.PI * 2)
    );
  }

  export function midpoint(u: V, v: V): V {
    return v
      .subtract(u)
      .scale(1 / 2)
      .add(u);
  }

  export function isInstance(v: unknown): v is V {
    return (v as { norm?: unknown }).norm !== undefined;
  }
}

class _V implements V {
  constructor(readonly x: number, readonly y: number) {}
  add(u: V) {
    return new _V(this.x + u.x, this.y + u.y);
  }
  invert() {
    return new _V(-this.x, -this.y);
  }
  subtract(u: V) {
    return this.add(u.invert());
  }
  scale(a: number) {
    return new _V(a * this.x, a * this.y);
  }
  perp() {
    return new _V(this.y, -this.x);
  }
  dot(u: V) {
    return this.x * u.x + this.y * u.y;
  }
  norm() {
    return (this.x ** 2 + this.y ** 2) ** (1 / 2);
  }
  equals(u: V) {
    return Math.abs(this.x - u.x) < EPS && Math.abs(this.y - u.y) < EPS;
  }
  toString() {
    return `⟨${this.x}, ${this.y}⟩`;
  }
}

export default V;
