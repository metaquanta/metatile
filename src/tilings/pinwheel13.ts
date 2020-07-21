// Reference: https://tilings.math.uni-bielefeld.de/substitution/pinwheel-variant-13-tiles/

import { TileWithParent, Triangle, Vec2 } from "./Tile";
import { tileGenerator, Tiling } from "./Tiling";

// A->B is S side, B->C is M side, C->A is L side.
const parent = (t: Triangle) => {
  return Triangle(
    t.c.add(t.b.subtract(t.a)).add(t.c.subtract(t.b).scale(4 / 3)),
    t.c.add(t.a.subtract(t.b).scale(2)),
    t.b.add(t.b.subtract(t.a)).add(t.b.subtract(t.c).scale(2))
  );
};

const children = (t: Triangle, v: number): [Triangle, number][] => {
  // 1
  // m2  m3  4
  // 5  6  m7  m8  9
  // m10 m11 12
  // 13
  const m = t.b.subtract(t.c);
  const l = t.a.subtract(t.c);
  const s = t.b.subtract(t.a);

  const c1 = Triangle(m.scale(1 / 3).add(t.c), l.scale(3 / 13).add(t.c), t.c);
  const c4 = c1.translate(m.scale(1 / 3));
  const c5 = c1.translate(c1.b.subtract(c1.c).scale(2));

  const c2 = Triangle(c1.a, c1.b, c1.b.add(c1.b.subtract(c1.c)));
  const c7 = c2.translate(m.scale(1 / 3));

  const c3 = Triangle(c2.c, c4.b, c2.a);

  const c6 = Triangle(c3.a, c3.b, c3.a.add(m.scale(1 / 3)));

  const c10 = Triangle(
    c5.b,
    c5.b.add(l.scale(2 / 13)),
    t.a.add(s.scale(1 / 2))
  );
  const c11 = Triangle(c10.c, c10.b.add(s.scale(1 / 2)), c10.a);

  return [
    [c7, (v + 1) % 2],
    [c1, v],
    [c2, (v + 1) % 2],
    [c3, (v + 1) % 2],
    [c4, v],
    [c5, v],
    [c6, v],
    [c3.translate(m.scale(1 / 3)), (v + 1) % 2],
    [c1.translate(m.scale(2 / 3)), v],
    [c10, (v + 1) % 2],
    [c11, (v + 1) % 2],
    [Triangle(c11.a, c11.b, t.b), v],
    [Triangle(t.a, c10.b, c10.c), v],
  ];
};

const root = (l: Vec2, o: Vec2 = Vec2(0, 0)): TileWithParent =>
  tile(Triangle(l.perp().scale(2 / 3), Vec2(0, 0), l).translate(o), 0, 0);

const tile = (t: Triangle, v: number, depth: number): TileWithParent =>
  TileWithParent(
    t.polygon(),
    () => children(t, v).map((c) => tile(c[0], c[1], depth - 1)),
    () => tile(parent(t), (v + 1) % 2, depth + 1),
    depth,
    v
  );

export default (): Tiling => ({
  getTile: (seed, origin) => root(seed, origin),
  tileGenerator: (tile, includeAncestors?, viewport?) =>
    tileGenerator(tile, 0, includeAncestors, viewport),
  numVariants: 2,
});
