import {Triangle, Vec2, TileWithParent} from './Tile';
import {tileGenerator, Tiling} from './Tiling';

const root = (l: Vec2, origin: Vec2 = Vec2(0, 0)): TileWithParent =>
  tile(Triangle(l.scale(1 / 2), Vec2(0, 0), l.perp()).translate(origin), 0);

const tile = (t: Triangle, depth: number): TileWithParent =>
  TileWithParent(
    t.polygon(),
    () => generateFromA(subAFromParent(t), depth - 1),
    () => parentFromC(t, depth + 1),
    depth
  );

// A->B is S side, B->C is M side, C->A is L side.
const parentFromC = (t: Triangle, depth: number) => {
  const m = t.b.subtract(t.c);
  const s = t.b.subtract(t.a);
  //console.log(m,s)
  return tile(
    Triangle(t.a.add(m.scale(0.5)), t.b.add(s), t.a.subtract(m.scale(2))),
    depth
  );
};

const subAFromParent = (t: Triangle) => {
  const l = t.a.subtract(t.c);
  const m = t.b.subtract(t.c);
  return Triangle(t.c.add(m.scale(0.5)), t.c.add(l.scale(2 / 5)), t.c);
};

const generateFromA = (t: Triangle, depth: number) => {
  //      A
  //   /  |
  // C----B
  const B = (a: Triangle) => Triangle(a.a, a.b, a.b.add(a.b.subtract(a.c)));

  // B----C
  // |  /
  // A
  const C = (b: Triangle) => Triangle(b.c, b.c.add(b.a.subtract(b.b)), b.a);
  // A
  // |  \
  // B----C
  const D = (c: Triangle) => Triangle(c.b.add(c.b.subtract(c.a)), c.b, c.c);
  //    C
  //   /|
  //  / |
  // A--B
  const E = (d: Triangle) => {
    const l = d.b.subtract(d.a);
    const eb = d.b.add(l);
    //const ea = eb.add(l.perp().invert());
    const ea = d.b.subtract(d.c).scale(0.5).add(d.b).add(d.b.subtract(d.a));
    //console.log(l, l.perp());
    return Triangle(ea, eb, d.a);
  };
  const b = B(t);
  const c = C(b);
  const d = D(c);
  return [
    tile(c, depth),
    tile(t, depth),
    tile(b, depth),
    tile(d, depth),
    tile(E(d), depth),
  ];
};

export default (): Tiling => ({
  getTile: (seed, origin) => root(seed, origin),
  tileGenerator: (tile, includeAncestors?, viewport?) =>
    tileGenerator(tile, 0, includeAncestors, viewport),
  numVariants: 2,
});
