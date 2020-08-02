// Reference: https://tilings.math.uni-bielefeld.de/substitution/penrose-rhomb/

import { RhombTile, TileSet } from "../classes/Tile";
import { Polygon, Rhomb } from "../classes/Polygon";
import { V } from "../classes/V";

const SIN15 = Math.sin(Math.PI / 5);
const COS15 = Math.cos(Math.PI / 5);

const IF = (1 + Math.sqrt(5)) / 2;
const DF = 1 / IF;

const M = [V(COS15, -1 * SIN15), V(SIN15, COS15)];

const rotate = (u: V) => V(M[0].dot(u), M[1].dot(u));

const rhomb1 = (u: V) => {
  const v = rotate(rotate(u));
  return Rhomb(V(0, 0), u, u.add(v), v);
};

type PenroseRhomb = RhombTile;

function PenroseRhomb(
  rhomb: Rhomb,
  parent: (r: Rhomb) => PenroseRhomb,
  children: (r: Rhomb) => [Rhomb[], Rhomb[]],
  kind: string
): PenroseRhomb {
  return {
    ...rhomb,
    proto: kind,
    rotationalSymmetry: 2,
    contains(p: Polygon | V, depth = 0) {
      if (!rhomb.contains(p)) return false;
      const d = Math.min(depth, 5);
      let rh = rhomb;
      for (let i = 0; i <= d; i++) {
        if (!rh.contains(p)) return false;
        rh = firstChild(rh);
      }
      return true;
    },
    intersects(p: Polygon, depth = 0) {
      if (rhomb.intersects(p)) return true;
      if (depth <= 0) return false;
      return this.parent().intersects(p, Math.min(depth - 1, 5));
    },
    parent() {
      return parent(this);
    },
    children() {
      const [fatChildren, thinChildren] = children(this);
      return fatChildren
        .map((c) => PenroseRhomb(c, () => this, children1, "fat rhomb"))
        .concat(
          thinChildren.map((c) =>
            PenroseRhomb(c, () => this, children2, "skinny rhomb")
          )
        );
    },
    translate: (v) => PenroseRhomb(rhomb.translate(v), parent, children, kind)
  };
}

function root(r1: Rhomb): PenroseRhomb {
  const r = r1.translate(r1.a.invert());
  const u = r.b.scale(IF);
  const v = r.d.scale(IF);
  const p = Rhomb(u.add(v), v, r.a, u).translate(r1.a);
  return PenroseRhomb(p, root, children1, "fat rhomb");
}

const firstChild = (p: Rhomb): Rhomb => {
  const r = p.translate(p.c.invert());
  const u = r.b.scale(DF);
  const v = r.d.scale(DF);
  return Rhomb(r.c, v, u.add(v), u).translate(p.c);
};

const children1 = (r1: Rhomb): [Rhomb[], Rhomb[]] => {
  const r = r1.translate(r1.c.invert());
  const u = r.b.scale(DF);
  const v = r.d.scale(DF);
  //Rhomb(r.d, u.add(v), v, r.d.add(u.invert()))
  //Rhomb(r.b, u.add(v), r.a, r.a.subtract(u.add(v)).add(r.b)),
  return [
    [
      firstChild(r1),
      Rhomb(r.d, r.a.subtract(u.add(v)).add(r.d), r.a, u.add(v)).translate(r1.c)
    ],
    [Rhomb(r.b, r.b.add(v.invert()), u, u.add(v)).translate(r1.c)]
  ];
};

const children2 = (r2: Rhomb): [Rhomb[], Rhomb[]] => {
  const r = r2.translate(r2.a.invert());
  const u = r.b.scale(DF);
  //const v = r.d.scale(DF);
  //tile1(Rhomb(r.b, r.b.add(v), r.a, v.invert()).translate(r2.a)),
  //tile2(Rhomb(r.c, r.a, v.add(r.b), r.c.add(v).add(r.b)).translate(r2.a)),
  return [
    [Rhomb(r.d, u.invert(), r.a, r.d.add(u)).translate(r2.a)],
    [Rhomb(r.c, r.c.add(u).add(r.d), u.add(r.d), r.a).translate(r2.a)]
  ];
};

export default TileSet((seed) => root(rhomb1(seed)), [
  "fat rhomb",
  "skinny rhomb"
]);
