import { isV, V } from "./V";

export interface M {
  dot(v: V): V;
  dot(m: M): M;
  dot(s: number): M;
  invert(): M | undefined;
  transpose(): M;
  toArray(): number[];
  toString(): string;
}

export function M2x2(m11: number, m21: number, m12: number, m22: number): M {
  return new _M2(m11, m21, m12, m22);
}

export function M3x3(
  m11: number,
  m21: number,
  m31: number,
  m12: number,
  m22: number,
  m32: number,
  m13: number,
  m23: number,
  m33: number
): M {
  return new _M3(m11, m21, m31, m12, m22, m32, m13, m23, m33);
}

export function of(v: V, u: V): M {
  return M2x2(v.x, u.x, v.y, u.y);
}

export function Rotation(theta: number): M {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return M2x2(cos, -1 * sin, sin, cos);
}

export function Scaling(a: number): M {
  return M2x2(a, 0, 0, a);
}

export function Translation(v: V): M {
  return M3x3(1, 0, v.x, 0, 1, v.y, 0, 0, 1);
}

export function isM(m: unknown): m is M {
  return (m as { transpose?: unknown }).transpose !== undefined;
}

class _M2 implements M {
  #m: [number, number, number, number];
  constructor(
    readonly m11: number,
    readonly m21: number,
    readonly m12: number,
    readonly m22: number
  ) {
    this.#m = [m11, m21, m12, m22];
  }

  row(i: number): [number, number] {
    return [this.#m[i * 2], this.#m[i * 2 + 1]];
  }

  col(i: number): [number, number] {
    return [this.#m[i], this.#m[i + 2]];
  }

  invert(): _M2 {
    const a = 1 / (this.m11 * this.m22 - this.m21 * this.m12);
    return new _M2(this.m22 / a, -this.m21 / a, -this.m12 / a, this.m11 / a);
  }

  dot(v: V): V;
  dot(m: M): M;
  dot(s: number): M;
  dot(p: V | M | number): V | M {
    if (typeof p === "number") {
      return this.scale(p);
    }
    if (isV(p)) {
      return this.composeV(p);
    }
    if (isM(p)) {
      return this.composeM(p);
    }
    throw new Error("unsupported");
  }

  transpose(): M {
    return new _M2(this.m11, this.m12, this.m21, this.m22);
  }

  scale(s: number): M {
    return new _M2(s * this.m11, s * this.m21, s * this.m12, s * this.m22);
  }

  composeM(m: M): M {
    if (isM2(m)) {
      return new _M2(
        dot(this.row(0), m.col(0)),
        dot(this.row(0), m.col(1)),
        dot(this.row(1), m.col(0)),
        dot(this.row(1), m.col(1))
      );
    } else if (isM3(m)) {
      return new _M3(
        dot(m.row(0), [this.m11, this.m12, 0]),
        dot(m.row(0), [this.m21, this.m22, 0]),
        dot(m.row(0), [0, 0, 1]),
        dot(m.row(1), [this.m11, this.m12, 0]),
        dot(m.row(1), [this.m21, this.m22, 0]),
        dot(m.row(1), [0, 0, 1]),
        dot(m.row(2), [this.m11, this.m12, 0]),
        dot(m.row(2), [this.m21, this.m22, 0]),
        dot(m.row(2), [0, 0, 1])
      );
    }
    throw new Error("unsupported");
  }

  composeV(v: V): V {
    return V(this.m11 * v.x + this.m21 * v.y, this.m12 * v.x + this.m22 * v.y);
  }

  toArray(): [number, number, number, number] {
    return this.#m;
  }

  toString(): string {
    const f = _format(8);
    return (
      "\n" +
      `⎡ ${f(this.m11)} ${f(this.m21)} ⎤\n` + //-------don't wrap------------
      `⎣ ${f(this.m12)} ${f(this.m22)} ⎦\n`
    );
  }
}

class _M3 {
  #m: ConstructorParameters<typeof _M3>;
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
    if (isV(p)) {
      return this.composeV(p);
    }
    if (isM(p)) {
      return this.composeM(p);
    }
    throw new Error("unsupported");
  }

  invert(): _M3 {
    // This is only valid for augmented 2x2 matrices.
    const a = 1 / (this.m11 * this.m22 - this.m21 * this.m12);
    return new _M3(
      this.m22 / a,
      (this.m21 / a) * -1,
      -this.m31,
      (this.m12 / a) * -1,
      this.m11 / a,
      -this.m32,
      0,
      0,
      1
    );
  }

  transpose(): M {
    return new _M3(
      ...([this.col(0), this.col(1), this.col(2)].flatMap(
        (v) => v
      ) as ConstructorParameters<typeof _M3>)
    );
  }

  scale(s: number): M {
    return new _M3(
      ...(this.#m.map((e) => s * e) as ConstructorParameters<typeof _M3>)
    );
  }

  composeM(m: M): M {
    if (isM3(m)) {
      return new _M3(
        dot(this.row(0), m.col(0)),
        dot(this.row(0), m.col(1)),
        dot(this.row(0), m.col(2)),
        dot(this.row(1), m.col(0)),
        dot(this.row(1), m.col(1)),
        dot(this.row(1), m.col(2)),
        dot(this.row(2), m.col(0)),
        dot(this.row(2), m.col(1)),
        dot(this.row(2), m.col(2))
      );
    } else if (isM2(m)) {
      return new _M3(
        dot(this.row(0), [m.m11, m.m12, 0]),
        dot(this.row(0), [m.m21, m.m22, 0]),
        dot(this.row(0), [0, 0, 1]),
        dot(this.row(1), [m.m11, m.m12, 0]),
        dot(this.row(1), [m.m21, m.m22, 0]),
        dot(this.row(1), [0, 0, 1]),
        dot(this.row(2), [m.m11, m.m12, 0]),
        dot(this.row(2), [m.m21, m.m22, 0]),
        dot(this.row(2), [0, 0, 1])
      );
    }
    throw new Error("unsupported");
  }

  composeV(v: V): V {
    // v.z is assumed to be 1
    return V(
      this.m11 * v.x + this.m21 * v.y + this.m31,
      this.m12 * v.x + this.m22 * v.y + this.m32
    );
  }

  row(i: number): [number, number, number] {
    return this.#m.slice(i * 3, i * 3 + 3) as [number, number, number];
  }

  col(i: number): [number, number, number] {
    return [this.#m[i], this.#m[i + 3], this.#m[i + 6]];
  }

  toArray(): ConstructorParameters<typeof _M3> {
    return this.#m;
  }

  toString(): string {
    const f = _format(8);
    return (
      "\n" +
      `⎡ ${f(this.m11)} ${f(this.m21)} ${f(this.m31)} ⎤\n` +
      `⎢ ${f(this.m12)} ${f(this.m22)} ${f(this.m32)} ⎥\n` +
      `⎣ ${f(this.m13)} ${f(this.m23)} ${f(this.m33)} ⎦\n`
    );
  }
}

function _format(w: number): (n: number) => string {
  return (n: number) => n.toFixed(3).padStart(w);
}

function isM3(m: unknown): m is _M3 {
  return (m as { m33?: unknown }).m33 !== undefined;
}

function isM2(m: unknown): m is _M2 {
  return (
    (m as { m33?: unknown }).m33 === undefined &&
    (m as { m22?: unknown }).m22 !== undefined
  );
}

function dot(a: [number, number, number], b: [number, number, number]): number;
function dot(a: [number, number], b: [number, number]): number;
function dot(a: number[], b: number[]): number {
  return a[0] * b[0] + a[1] * b[1] + (a.length === 3 ? a[2] * b[2] : 0);
}
