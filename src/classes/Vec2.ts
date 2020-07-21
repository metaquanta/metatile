export type Vec2 = {
  x: number;
  y: number;
  add: (u: Vec2) => Vec2;
  invert: () => Vec2;
  subtract: (u: Vec2) => Vec2;
  scale: (a: number) => Vec2;
  perp: () => Vec2;
  dot: (u: Vec2) => number;
  toString: () => string;
  magnitude: () => number;
};

export const Vec2 = (x: number, y: number): Vec2 => ({
  x,
  y,
  add: (u) => Vec2(x + u.x, y + u.y),
  invert: () => Vec2(-x, -y),
  subtract(u) {
    return this.add(u.invert());
  },
  scale: (a) => Vec2(a * x, a * y),
  perp: () => Vec2(y, -x),
  dot: (u) => x * u.x + y * u.y,
  magnitude: () => Math.sqrt(x * x + y * y),
  toString: () => `⟨${x}, ${y}⟩`,
});
