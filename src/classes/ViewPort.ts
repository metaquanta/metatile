import { Vec2 } from "./Vec2";

export type ViewPort = {
  x0: number;
  xf: number;
  y0: number;
  yf: number;
  vertices: () => Vec2[];
  toString: () => string;
};

export const ViewPort = (size: Vec2, origin: Vec2): ViewPort => ({
  x0: origin.x,
  xf: origin.x + size.x,
  y0: origin.y,
  yf: origin.y + size.y,
  vertices: () => [
    origin,
    Vec2(size.x, 0).add(origin),
    origin.add(size),
    Vec2(0, size.y).add(origin),
  ],
  toString: () =>
    `⦗↤${origin.x}, ↥${origin.y}, ↦${origin.x + size.x}, ↧${
      origin.y + size.y
    }⦘`,
});
