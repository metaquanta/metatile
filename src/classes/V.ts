const EPS = 0.0001;

export interface V {
  x: number;
  y: number;
  add: (u: V) => V;
  invert: () => V;
  subtract: (u: V) => V;
  scale: (a: number) => V;
  perp: () => V;
  dot: (u: V) => number;
  norm: () => number;
  equals: (u: V) => boolean;
  toString: () => string;
}

export interface M {
  m11: number;
  m21: number;
  m12: number;
  m22: number;
  rows: () => [V, V];
  columns: () => [V, V];
  multiply: (v: V) => V;
  compose: (m: M) => M;
}

class _V implements V {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  add(u: V): V {
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

export const V = (x: number, y: number): V => new _V(x, y);

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

export const M = (m11: number, m21: number, m12: number, m22: number): M => {
  return {
    m11,
    m21,
    m12,
    m22,
    rows() {
      return [V(m11, m21), V(m12, m22)];
    },
    columns() {
      return [V(m11, m12), V(m21, m22)];
    },
    multiply(v: V): V {
      return multiply(this, v);
    },
    compose(m: M): M {
      return compose(this, m);
    }
  };
};

export const rotationM = (theta: number): M => {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  return M(cos, -1 * sin, sin, cos);
};

export const scalingM = (a: number): M => {
  return M(a, 0, 0, a);
};

const multiply = (m: M, v: V) => {
  const rows = m.rows();
  return V(rows[0].dot(v), rows[1].dot(v));
};

const compose = (m: M, n: M) => {
  const rows = m.rows();
  const cols = n.columns();
  return M(
    rows[0].dot(cols[0]),
    rows[0].dot(cols[1]),
    rows[1].dot(cols[0]),
    rows[1].dot(cols[1])
  );
};
