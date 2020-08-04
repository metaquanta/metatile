// Reference: https://tilings.math.uni-bielefeld.de/substitution/pinwheel-variant-13-tiles/

import { Tile, Prototile, reflect } from "../classes/Tile";
import { Polygon, Triangle } from "../classes/Polygon";
import { V } from "../classes/V";
import { Rule } from "../classes/Rule";

// A->B is S side, B->C is M side, C->A is L side.
const parent = (t: Triangle) =>
  Triangle(
    t.c.add(t.b.subtract(t.a)).add(t.c.subtract(t.b).scale(4 / 3)),
    t.c.add(t.a.subtract(t.b).scale(2)),
    t.b.add(t.b.subtract(t.a)).add(t.b.subtract(t.c).scale(2))
  );

const children = (t: Triangle, create: (p: Polygon) => Tile): Tile[] => {
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

  return [
    reflect(create(c1)),
    create(c2),
    create(c3),
    reflect(create(c4)),
    reflect(create(c5)),
    reflect(create(c6)),
    create(c7), //
    create(c3.translate(m.scale(1 / 3))),
    reflect(create(c1.translate(m.scale(2 / 3)))),
    create(c10), //
    create(c11),
    reflect(create(Triangle(c11.a, c11.b, t.b))),
    reflect(create(Triangle(t.a, c10.b, c10.c)))
  ];
};

const root = (l: V): Triangle => Triangle(l.perp().scale(2 / 3), V(0, 0), l);

const prototile: Prototile = Prototile<Triangle>(
  (t) => prototile.create(parent(t)),
  (t) => children(t, (p) => prototile.create(p)),
  1,
  false
);

export default Rule(
  (l: V, u: V): Tile => prototile.create(root(l).translate(u)),
  [prototile]
);
