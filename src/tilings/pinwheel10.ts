// Reference: https://tilings.math.uni-bielefeld.de/substitution/pinwheel-variant-10-tiles/

import {TileWithParent, Triangle, Vec2} from './Tile';
import {tileGenerator, Tiling} from './Tiling';

// A->B is S side, B->C is M side, C->A is L side.
const parent = (t: Triangle) => {
  const m = t.c.subtract(t.b);
  const s = t.b.subtract(t.a);
  //console.log(m,s)
  return Triangle(
    t.a.add(m.scale(1 / 3).invert()),
    t.b.add(s.scale(2)),
    t.a.add(m.scale(3))
  );
};

const children = (t: Triangle) => {
  //        10
  //     7 8 9
  // 2 3 4 5 6
  //       1
  const l = t.c.subtract(t.a).scale(1 / 10);
  const c1 = Triangle(t.a, t.a.add(l), t.b);

  const c5b = c1.c
    .subtract(c1.b)
    .scale(1 / 3)
    .add(c1.b);
  const c5 = Triangle(c1.b, c5b, c5b.add(l.scale(3)));
  const c3 = c5.translate(c5.b.subtract(c5.a));
  const c2 = Triangle(c3.b.subtract(c3.a).add(c3.b), c3.b, c3.c);
  const c4 = Triangle(c2.c, c5.c, c3.a);
  const c6 = c4.translate(c4.b.subtract(c4.a));
  const c7 = c2.translate(c2.c.subtract(c2.a));
  return [
    c5,
    c1,
    c2,
    c3,
    c4,
    c6,
    c7,
    c5.translate(c5.c.subtract(c5.b)),
    c6.translate(c6.b.subtract(c6.c)),
    c7.translate(c7.c.subtract(c7.a)),
  ];
};

const root = (l: Vec2, o: Vec2 = Vec2(0, 0)): TileWithParent =>
  tile(
    Triangle(l.perp().scale(-1 / 9), l.scale(1 / 3), l.perp()).translate(o),
    0
  );

const tile = (t: Triangle, depth: number): TileWithParent =>
  TileWithParent(
    t.polygon(),
    () => children(t).map(c => tile(c, depth - 1)),
    () => tile(parent(t), depth + 1),
    depth
  );

export default (): Tiling => ({
  getTile: (seed, origin) => root(seed, origin),
  tileGenerator: (tile, includeAncestors?, viewport?) =>
    tileGenerator(tile, 0, includeAncestors, viewport),
});
