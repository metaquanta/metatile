// Reference: https://tilings.math.uni-bielefeld.de/substitution/viper/

import { Triangle } from "../classes/Polygon";
import { V } from "../classes/V";
import { singlePrototileRule } from "../classes/Rule";

const ISQRT15 = 15 ** (-1 / 2);

const fromVec = (l: V) => {
  const r = l.perp().scale(ISQRT15);
  return Triangle(r, l, r.invert());
};

const parent = (t: Triangle) => {
  const u = t.b.subtract(t.a);
  const v = t.b.subtract(t.c);
  return Triangle(
    t.c.add(u.scale(2)),
    t.c.add(u.invert()),
    t.a.add(v.scale(2))
  );
};

const children = (t: Triangle) => {
  //         1
  //       2(3)4
  //        5
  //          6
  //         7
  //      9    8
  const u = t.b.subtract(t.a).scale(1 / 3);
  const v = t.b.subtract(t.c).scale(1 / 3);
  const c9 = Triangle(t.a, t.a.add(u), t.a.add(u).subtract(v));
  const c8 = Triangle(t.c, c9.c, t.c.add(v.scale(1 / 2)));
  const c7 = Triangle(c9.c.add(v.scale(1 / 2)), c8.c, c9.c);
  const c6 = Triangle(c8.c, c7.a, t.c.add(v));
  const c5 = Triangle(c9.b, c6.c, c7.a);
  const c1 = Triangle(t.b.subtract(u), t.b, t.b.subtract(v));
  const c2 = Triangle(c9.b, c1.a, c1.a.subtract(v));
  const c3 = Triangle(c1.c, c2.c, c1.a);
  const c4 = Triangle(c2.c, c1.c, c5.b);
  return [c3, c1, c2, c4, c5, c6, c7, c8, c9];
};

export default singlePrototileRule(fromVec, parent, children, 1);
