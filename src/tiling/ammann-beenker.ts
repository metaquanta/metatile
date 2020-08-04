// Reference: https://tilings.math.uni-bielefeld.de/substitution/ammann-beenker/

import {
  nonVolumeHierarchical,
  oneWayPrototile,
  Prototile,
  Tile
} from "../classes/Tile";
import { Rhomb } from "../classes/Polygon";
import { V } from "../classes/V";
import { Rule } from "../classes/Rule";

const SQRT2 = Math.sqrt(2);

const squareChildren = (
  sq: Rhomb,
  createSquare: (p: Rhomb) => Tile,
  createRhomb: (p: Rhomb) => Tile
): Tile[] => {
  const r = sq.translate(sq.a.invert());
  const unit_d = r.c.scale(1 / (2 + SQRT2));
  const unit_d2 = r.d.subtract(r.b).scale(1 / (2 + SQRT2));
  const inner_sq = Rhomb(
    unit_d.scale(1 + SQRT2),
    unit_d2.scale(1 + SQRT2).add(r.b),
    unit_d,
    unit_d2.add(r.b)
  ).translate(sq.a);
  const a = r.b.scale(1 / (1 + SQRT2)).add(sq.a);
  const b = r.c
    .subtract(r.b)
    .scale(1 / (1 + SQRT2))
    .add(r.b)
    .add(sq.a);
  const c = r.c
    .subtract(r.d)
    .scale(1 / (1 + SQRT2))
    .add(r.d)
    .add(sq.a);
  const d = r.d.scale(1 / (1 + SQRT2)).add(sq.a);

  //Rhomb(sq.c, c.add(unit_d), c, inner_sq.a)
  //Rhomb(sq.d, sq.d.subtract(unit_d), d, inner_sq.b)
  return [
    createSquare(inner_sq),
    createSquare(Rhomb(sq.b, inner_sq.d, a, sq.b.subtract(unit_d))),
    createSquare(Rhomb(sq.c, inner_sq.a, b, b.add(unit_d))),

    createRhomb(Rhomb(sq.a, a, inner_sq.d, inner_sq.c)),
    createRhomb(Rhomb(sq.b, b, inner_sq.a, inner_sq.d)),
    createRhomb(Rhomb(sq.d, inner_sq.b, inner_sq.a, c)),
    createRhomb(Rhomb(sq.a, inner_sq.c, inner_sq.b, d))
  ];
};

const rhombChildren = (
  rh: Rhomb,
  createSquare: (p: Rhomb) => Tile,
  createRhomb: (p: Rhomb) => Tile
): Tile[] => {
  const r = rh.translate(rh.a.invert());
  const u = r.b.scale(1 / (1 + SQRT2));
  const v = r.d.scale(1 / (1 + SQRT2));
  const rh1 = Rhomb(r.a, u, u.add(v), v).translate(rh.a);
  const rh2 = Rhomb(
    r.c,
    r.c.subtract(u),
    r.c.subtract(u.add(v)),
    r.c.subtract(v)
  ).translate(rh.a);
  const rh3 = Rhomb(rh.b, rh2.c, rh.d, rh1.c);

  //Rhomb(rh.d, rh1.d.subtract(rh1.c).add(rh.d), rh1.d, rh1.c),
  //Rhomb(rh.b, rh.b.subtract(rh2.c).add(rh2.d), rh2.d, rh2.c)
  return [
    createSquare(Rhomb(rh.b, rh1.c, rh1.b, rh.b.subtract(rh1.c).add(rh1.b))),
    createSquare(Rhomb(rh.d, rh2.c, rh2.b, rh2.b.subtract(rh2.c).add(rh.d))),
    createRhomb(rh1),
    createRhomb(rh2),
    createRhomb(rh3)
  ];
};

const parent = (rh: Rhomb) => {
  const u = rh.c.subtract(rh.a).scale(1 + 1 / SQRT2);
  const v = rh.d.subtract(rh.b).scale(1 + 1 / SQRT2);
  return Rhomb(
    rh.a.add(u),
    rh.b.add(v),
    rh.c.add(u.invert()),
    rh.d.add(v.invert())
  );
};

const root = (p: V): Rhomb => {
  const q = p.perp();
  return Rhomb(V(0, 0), p, q.add(p), q);
};

const rhomb: Prototile = nonVolumeHierarchical(
  oneWayPrototile<Rhomb>(
    (t) =>
      rhombChildren(
        t,
        (t) => square.create(t),
        (t) => rhomb.create(t)
      ),
    2,
    true
  ),
  4,
  2
);

const square: Prototile = nonVolumeHierarchical(
  Prototile<Rhomb>(
    (t) => square.create(parent(t)),
    (t) =>
      squareChildren(
        t,
        (t) => square.create(t),
        (t) => rhomb.create(t)
      ),
    4,
    true
  ),
  4,
  2
);

export default Rule(
  (l, v) => square.create(root(l).translate(v)),
  [square, rhomb],
  { hueSpan: 0.25, hueOffset: 0.65 }
);
