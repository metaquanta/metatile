import { Tetragon } from "../classes/Polygon";
import { Rule } from "../classes/Rule";
import { oneWayPrototile, Prototile, Tile } from "../classes/Tile";
import { V } from "../classes/V";

const SIN36 = (5 / 8 - 5 ** (1 / 2) / 8) ** (1 / 2);
const COS36 = (1 / 4) * (1 + 5 ** (1 / 2));

const PHI = (1 + 5 ** (1 / 2)) / 2;
const CONJPHI = (5 ** (1 / 2) - 1) / 2;

const kitePolygon = (l: V): Tetragon => {
  const t = l.scale(COS36);
  const u = l.perp().scale(SIN36);
  return Tetragon(V(0, 0), t.subtract(u), l, t.add(u));
};

/*const dartPolygon = (l: V): Tetragon => {
  const t = l.scale(COS36);
  const u = l.perp().scale(SIN36);
  return Tetragon(
    V(0, 0),
    t.subtract(u),
    l.subtract(t).add(t.subtract(l)),
    t.add(u)
  );
};*/

const kiteParent = (k: Tetragon): Tetragon => {
  const a = k.b.subtract(k.a).scale(PHI).add(k.a);
  const b = k.c
    .subtract(k.b)
    .scale(PHI + 1)
    .add(a);
  return Tetragon(a, b, k.d, k.a);
};

const kiteChildren = (
  k: Tetragon,
  createKite: (p: Tetragon) => Tile,
  createDart: (p: Tetragon) => Tile
): Tile[] => {
  const db = k.a.add(k.c.subtract(k.d));
  //const ed = k.a.add(k.c.subtract(k.b));
  const dd = k.c.subtract(k.a).scale(CONJPHI).add(k.a);
  const dc = k.a.subtract(k.b).scale(CONJPHI).add(k.b);
  const ec = k.a.subtract(k.d).scale(CONJPHI).add(k.d);
  return [
    createDart(Tetragon(k.a, db, dc, dd)),
    //createDart(Tetragon(k.a, dd, ec, ed)),
    createKite(Tetragon(k.b, k.c, dd, dc)),
    createKite(Tetragon(k.d, ec, dd, k.c))
  ];
};

const dartChildren = (
  d: Tetragon,
  createKite: (p: Tetragon) => Tile,
  createDart: (p: Tetragon) => Tile
): Tile[] => {
  //const dd = d.a.subtract(d.c).add(d.b);
  const eb = d.a.subtract(d.c).add(d.d);
  const dc = d.b.subtract(d.a).scale(CONJPHI).add(d.a);
  const ec = d.d.subtract(d.a).scale(CONJPHI).add(d.a);
  return [
    //createDart(Tetragon(d.b, d.c, dc, dd)),
    createDart(Tetragon(d.d, eb, ec, d.c)),
    createKite(Tetragon(d.a, dc, d.c, ec))
  ];
};

const kite: Prototile = Prototile<Tetragon>(
  (k) => kite.create(kiteParent(k)),
  (k) => {
    return kiteChildren(
      k,
      (c) => kite.create(c),
      (c) => dart.create(c)
    );
  },
  1,
  true
);

const dart: Prototile = oneWayPrototile<Tetragon>(
  (t) =>
    dartChildren(
      t,
      (c) => kite.create(c),
      (t) => dart.create(t)
    ),
  1,
  true
);

export default Rule((l, v) => kite.create(kitePolygon(l).translate(v)), [
  kite,
  dart
]);
