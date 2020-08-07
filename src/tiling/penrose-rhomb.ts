// Reference: https://tilings.math.uni-bielefeld.de/substitution/penrose-rhomb/

import {
  nonVolumeHierarchical,
  oneWayPrototile,
  Prototile,
  Tile
} from "../classes/Tile";
import { Rhomb } from "../classes/Polygon";
import { V } from "../classes/V";
import { Rule } from "../classes/Rule";

const SIN15 = Math.sin(Math.PI / 5);
const COS15 = Math.cos(Math.PI / 5);

const IF = (1 + 5 ** (1 / 2)) / 2;
const DF = 1 / IF;

const M = [V(COS15, -1 * SIN15), V(SIN15, COS15)];

const rotate = (u: V) => V(M[0].dot(u), M[1].dot(u));

const rhomb1 = (u: V) => {
  const v = rotate(rotate(u));
  return Rhomb(V(0, 0), u, u.add(v), v);
};

function root(r1: Rhomb): Rhomb {
  const r = r1.translate(r1.a.invert());
  const u = r.b.scale(IF);
  const v = r.d.scale(IF);
  return Rhomb(u.add(v), v, r.a, u).translate(r1.a);
}

const children1 = (
  r1: Rhomb,
  rhombCreate: (r: Rhomb) => Tile,
  kiteCreate: (r: Rhomb) => Tile
): Tile[] => {
  const r = r1.translate(r1.c.invert());
  const u = r.b.scale(DF);
  const v = r.d.scale(DF);
  //Rhomb(r.d, u.add(v), v, r.d.add(u.invert()))
  //Rhomb(r.b, u.add(v), r.a, r.a.subtract(u.add(v)).add(r.b)),
  return [
    rhombCreate(Rhomb(r.c, v, u.add(v), u).translate(r1.c)),
    rhombCreate(
      Rhomb(r.d, r.a.subtract(u.add(v)).add(r.d), r.a, u.add(v)).translate(r1.c)
    ),
    kiteCreate(Rhomb(r.b, r.b.add(v.invert()), u, u.add(v)).translate(r1.c))
  ];
};

const children2 = (
  r2: Rhomb,
  rhombCreate: (r: Rhomb) => Tile,
  kiteCreate: (r: Rhomb) => Tile
): Tile[] => {
  const r = r2.translate(r2.a.invert());
  const u = r.b.scale(DF);
  //const v = r.d.scale(DF);
  //tile1(Rhomb(r.b, r.b.add(v), r.a, v.invert()).translate(r2.a)),
  //tile2(Rhomb(r.c, r.a, v.add(r.b), r.c.add(v).add(r.b)).translate(r2.a)),
  return [
    rhombCreate(Rhomb(r.d, u.invert(), r.a, r.d.add(u)).translate(r2.a)),
    kiteCreate(Rhomb(r.c, r.c.add(u).add(r.d), u.add(r.d), r.a).translate(r2.a))
  ];
};

const rhomb: Prototile = nonVolumeHierarchical(
  Prototile<Rhomb>(
    (t) => rhomb.create(root(t)),
    (t) =>
      children1(
        t,
        (t) => rhomb.create(t),
        (t) => kite.create(t)
      ),
    2,
    true
  ),
  4,
  2
);

const kite: Prototile = nonVolumeHierarchical(
  oneWayPrototile<Rhomb>(
    (t) =>
      children2(
        t,
        (t) => rhomb.create(t),
        (t) => kite.create(t)
      ),
    4,
    true
  ),
  4,
  2
);

export default Rule(
  (l, v) => rhomb.create(rhomb1(l).translate(v)),
  [rhomb, kite],
  { hueSpan: 0.25, hueOffset: 0.65 }
);
