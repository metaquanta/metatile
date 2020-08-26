import { V } from "./V";

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
