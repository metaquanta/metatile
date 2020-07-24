export type V = {
  x: number;
  y: number;
  add: (u: V) => V;
  invert: () => V;
  subtract: (u: V) => V;
  scale: (a: number) => V;
  perp: () => V;
  dot: (u: V) => number;
  toString: () => string;
  magnitude: () => number;
};

export const V = (x: number, y: number): V => ({
  x,
  y,
  add: (u) => V(x + u.x, y + u.y),
  invert: () => V(-x, -y),
  subtract(u) {
    return this.add(u.invert());
  },
  scale: (a) => V(a * x, a * y),
  perp: () => V(y, -x),
  dot: (u) => x * u.x + y * u.y,
  magnitude: () => Math.sqrt(x * x + y * y),
  toString: () => `⟨${x}, ${y}⟩`
});
