// Reference: https://tilings.math.uni-bielefeld.de/substitution/pinwheel-variant-13-tiles/

import { TileSet, TriangleTile } from "../classes/Tile";
import { Triangle } from "../classes/Polygon";
import { V } from "../classes/V";

const kinds = ["triangle", "mirrored"];

const kinded = (t: Triangle, i: number | string) => ({
  ...t,
  kind: typeof i === "string" ? i : kinds[i % 2]
});

// A->B is S side, B->C is M side, C->A is L side.
const parent = (t: TriangleTile) => {
  return kinded(
    Triangle(
      t.c.add(t.b.subtract(t.a)).add(t.c.subtract(t.b).scale(4 / 3)),
      t.c.add(t.a.subtract(t.b).scale(2)),
      t.b.add(t.b.subtract(t.a)).add(t.b.subtract(t.c).scale(2))
    ),
    "triangle"
  );
};

const children = (t: TriangleTile): (Triangle & { kind: string })[] => {
  // m1
  // 2  3  m4
  // m5  m6  7  8  m9
  // 10 11 m12
  // m13
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
  const i = kinds.indexOf(t.kind);
  return ([
    [c1, 1],
    [c2, 0],
    [c3, 0],
    [c4, 1],
    [c5, 1],
    [c6, 1],
    [c7, 0],
    [c3.translate(m.scale(1 / 3)), 0],
    [c1.translate(m.scale(2 / 3)), 1],
    [c10, 0],
    [c11, 0],
    [Triangle(c11.a, c11.b, t.b), 1],
    [Triangle(t.a, c10.b, c10.c), 1]
  ] as [Triangle, number][]).map((t) => kinded(t[0], (t[1] + i) % 2));
};

const root = (l: V): TriangleTile =>
  TriangleTile(Triangle(l.perp().scale(2 / 3), V(0, 0), l), parent, children);

export default TileSet(root, ["triangle", "mirrored"]);
