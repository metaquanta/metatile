import V from "./V";

export interface M {
  dot(v: V): V;
  dot(m: M): M;
  dot(s: number): M;
  invert(): M | undefined;
  det(): number;
  col(i: number): V;
  toArray(): number[];
  equals(m: M): boolean;
  toString(): string;
}

export namespace M {
  export function of(v: V, u: V, p = V.create(0, 0)): M {
    return new _M(v.x, v.y, 0, u.x, u.y, 0, p.x, p.y, 1);
  }

  export function rotation(theta: number): M {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    return of(V.create(cos, sin), V.create(-sin, cos));
  }

  export function scaling(a: number): M {
    return new _M(a, 0, 0, 0, a, 0, 0, 0, 1);
  }

  export function translation(v: V): M {
    return new _M(1, 0, 0, 0, 1, 0, v.x, v.y, 1);
  }

  export function isInstance(m: unknown): m is M {
    return (
      (m as { dot?: unknown }).dot !== undefined &&
      (m as { invert?: unknown }).invert !== undefined &&
      (m as { det?: unknown }).det !== undefined
    );
  }
}

const EPS = 1e-10;

class _M {
  #m: ConstructorParameters<typeof _M>;
  constructor(
    readonly m11: number,
    readonly m21: number,
    readonly m31: number,
    readonly m12: number,
    readonly m22: number,
    readonly m32: number,
    readonly m13: number,
    readonly m23: number,
    readonly m33: number
  ) {
    this.#m = [m11, m21, m31, m12, m22, m32, m13, m23, m33];
  }

  dot(v: V): V;
  dot(m: M): M;
  dot(s: number): M;
  dot(p: V | M | number): V | M {
    if (typeof p === "number") {
      return this.scale(p);
    }
    if (V.isInstance(p)) {
      return this.composeV(p);
    }
    if (M.isInstance(p)) {
      return this.composeM(p);
    }
    throw new Error("unsupported");
  }

  det(): number {
    return this.m11 * this.m22 - this.m21 * this.m12;
  }

  invert(): M | undefined {
    // This is only valid for augmented 2x2 matrices.
    if (this.m31 === 0 && this.m32 === 0) {
      const d = this.det();
      return new _M(
        this.m22 / d,
        -this.m21 / d,
        0,
        -this.m12 / d,
        this.m11 / d,
        0,
        (this.m12 * this.m23 - this.m22 * this.m13) / d,
        (this.m21 * this.m13 - this.m11 * this.m23) / d,
        1
      );
    }
    return undefined;
  }

  scale(s: number): M {
    return new _M(
      ...(this.#m.map((e) => s * e) as ConstructorParameters<typeof _M>)
    );
  }

  composeM(m: M): M {
    return new _M(
      dot(this.row(0), m.col(0), 0),
      dot(this.row(1), m.col(0), 0),
      0,
      dot(this.row(0), m.col(1), 0),
      dot(this.row(1), m.col(1), 0),
      0,
      dot(this.row(0), m.col(2), 1),
      dot(this.row(1), m.col(2), 1),
      1
    );
  }

  composeV(v: V): V {
    // v.z is assumed to be 1
    return V.create(
      this.m11 * v.x + this.m12 * v.y + this.m13,
      this.m21 * v.x + this.m22 * v.y + this.m23
    );
  }

  col(i: number): V {
    return V.create(this.#m[i * 3], this.#m[i * 3 + 1]);
  }

  row(i: number): [number, number, number] {
    return [this.#m[i], this.#m[i + 3], this.#m[i + 6]];
  }

  toArray(): ConstructorParameters<typeof _M> {
    return this.#m;
  }

  equals(m: M): boolean {
    for (let i = 0; i < this.#m.length; i++) {
      if (!(Math.abs((m as _M).#m[i] - this.#m[i]) < EPS)) return false;
    }
    return true;
  }

  toString(): string {
    const f = _format(8);
    return (
      "\n" +
      `⎡ ${f(this.m11)} ${f(this.m12)} ${f(this.m13)} ⎤\n` +
      `⎢ ${f(this.m21)} ${f(this.m22)} ${f(this.m23)} ⎥\n` +
      `⎣ ${f(this.m31)} ${f(this.m32)} ${f(this.m33)} ⎦\n`
    );
  }
}

function _format(w: number): (n: number) => string {
  return (n: number) => n.toFixed(3).padStart(w);
}

function dot(a: [number, number, number], b: V, c: number): number {
  return a[0] * b.x + a[1] * b.y + a[2] * c;
}

export default M;
