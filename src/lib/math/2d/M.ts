import { V } from "./V";

export interface M {
  multiply: (v: V) => V;
  compose: (m: M) => M;
  elements: () => number[];
  toString: () => string;
}

export const M = (
  m11: number,
  m21: number,
  m31: number,
  m12: number,
  m22: number,
  m32: number,
  m13: number,
  m23: number,
  m33: number
): M => {
  return new _M(m11, m21, m31, m12, m22, m32, m13, m23, m33);
};

class _M {
  #m: [number, number, number, number, number, number, number, number, number];
  constructor(
    m11: number,
    m21: number,
    m31: number,
    m12: number,
    m22: number,
    m32: number,
    m13: number,
    m23: number,
    m33: number
  ) {
    this.#m = [m11, m21, m31, m12, m22, m32, m13, m23, m33];
  }

  row(i: number): [number, number, number] {
    return this.#m.slice(i * 3, i * 3 + 3) as [number, number, number];
  }

  col(i: number): [number, number, number] {
    return [this.#m[i], this.#m[i + 3], this.#m[i + 6]];
  }

  multiply(v: V): V {
    // v.z is assumed to equal 1
    return V(
      v.x * this.#m[0] + v.y * this.#m[1] + this.#m[2],
      v.x * this.#m[3] + v.y * this.#m[4] + this.#m[5]
    );
  }

  elements() {
    return this.#m;
  }

  compose(m: M): M {
    console.log(
      `${this} ∙ ${m} =
      ${new _M(
        dot(this.row(0), (m as _M).col(0)),
        dot(this.row(0), (m as _M).col(1)),
        dot(this.row(0), (m as _M).col(2)),
        dot(this.row(1), (m as _M).col(0)),
        dot(this.row(1), (m as _M).col(1)),
        dot(this.row(1), (m as _M).col(2)),
        dot(this.row(2), (m as _M).col(0)),
        dot(this.row(2), (m as _M).col(1)),
        dot(this.row(2), (m as _M).col(2))
      )}`
    );
    return new _M(
      dot(this.row(0), (m as _M).col(0)),
      dot(this.row(0), (m as _M).col(1)),
      dot(this.row(0), (m as _M).col(2)),
      dot(this.row(1), (m as _M).col(0)),
      dot(this.row(1), (m as _M).col(1)),
      dot(this.row(1), (m as _M).col(2)),
      dot(this.row(2), (m as _M).col(0)),
      dot(this.row(2), (m as _M).col(1)),
      dot(this.row(2), (m as _M).col(2))
    );
  }

  toString(): string {
    return (
      "\n" +
      `⎡ ${this.#m[0]} ${this.#m[1]} ${this.#m[2]} ⎤\n` +
      `⎢ ${this.#m[3]} ${this.#m[4]} ${this.#m[5]} ⎥\n` +
      `⎣ ${this.#m[6]} ${this.#m[7]} ${this.#m[8]} ⎦\n`
    );
  }
}

function dot(a: [number, number, number], b: [number, number, number]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export const rotationM = (theta: number): M => {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return M(cos, -1 * sin, 0, sin, cos, 0, 0, 0, 1);
};

export const scalingM = (a: number): M => {
  return M(a, 0, 0, 0, a, 0, 0, 0, 1);
};

export const translationM = (v: V): M => {
  return M(1, 0, v.x, 0, 1, v.y, 0, 0, 1);
};
