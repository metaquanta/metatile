// Reference: https://tilings.math.uni-bielefeld.de/substitution/pinwheel-variant-10-tiles/

import { Triangle } from "../classes/Polygon";
import { V } from "../classes/V";
import { TileSet, TriangleTile } from "../classes/Tile";

const kinds = ["triangle", "mirrored"];

const kinded = (t: Triangle, i: number | string) => ({
  ...t,
  kind: typeof i === "string" ? i : kinds[i % 2]
});

// A->B is S side, B->C is M side, C->A is L side.
const parent = (t: TriangleTile) => {
  const m = t.c.subtract(t.b);
  const s = t.b.subtract(t.a);
  //console.log(m,s)
  return kinded(
    Triangle(
      t.a.add(m.scale(1 / 3).invert()),
      t.b.add(s.scale(2)),
      t.a.add(m.scale(3))
    ),
    t.kind
  );
};

const children = (t: TriangleTile) => {
  //        10m
  //     7m 8 9
  // 2m 3 4 5 6
  //       1m
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
  const i = kinds.indexOf(t.kind);
  return [
    kinded(c5, i),
    kinded(c1, i + 1),
    kinded(c2, i + 1),
    kinded(c3, i),
    kinded(c4, i),
    kinded(c6, i),
    kinded(c7, i + 1),
    kinded(c5.translate(c5.c.subtract(c5.b)), i),
    kinded(c6.translate(c6.b.subtract(c6.c)), i),
    kinded(c7.translate(c7.c.subtract(c7.a)), i + 1)
  ];
};

const root = (l: V): TriangleTile =>
  TriangleTile(
    Triangle(l.perp().scale(-1 / 9), l.scale(1 / 3), l.perp()),
    parent,
    children
  );

export default TileSet(root, kinds);
