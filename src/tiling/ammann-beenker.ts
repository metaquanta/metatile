// Reference: https://tilings.math.uni-bielefeld.de/substitution/ammann-beenker/

import { RhombTile, TileSet } from "../classes/Tile";
import { Polygon, Rhomb } from "../classes/Polygon";
import { V } from "../classes/V";

const SQRT2 = Math.sqrt(2);

const squareChildren = (sq: Rhomb): [Rhomb[], Rhomb[]] => {
  const r = sq.translate(sq.a.invert());
  const unit_d = r.c.scale(1 / (2 + SQRT2));
  const inner_sq = firstChild(sq);
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
  return [
    [
      inner_sq,
      Rhomb(sq.b, inner_sq.d, a, sq.b.subtract(unit_d)),
      Rhomb(sq.c, inner_sq.a, b, b.add(unit_d))

      //Rhomb(sq.c, c.add(unit_d), c, inner_sq.a)
      //Rhomb(sq.d, sq.d.subtract(unit_d), d, inner_sq.b)
    ],
    [
      Rhomb(sq.a, a, inner_sq.d, inner_sq.c),
      Rhomb(sq.b, b, inner_sq.a, inner_sq.d),
      Rhomb(sq.d, inner_sq.b, inner_sq.a, c),
      Rhomb(sq.a, inner_sq.c, inner_sq.b, d)
    ]
  ];
};

const firstChild = (sq: Rhomb) => {
  const r = sq.translate(sq.a.invert());
  const unit_d = r.c.scale(1 / (2 + SQRT2));
  const unit_d2 = r.d.subtract(r.b).scale(1 / (2 + SQRT2));
  return Rhomb(
    unit_d.scale(1 + SQRT2),
    unit_d2.scale(1 + SQRT2).add(r.b),
    unit_d,
    unit_d2.add(r.b)
  ).translate(sq.a);
};

const rhombChildren = (rh: Rhomb): [Rhomb[], Rhomb[]] => {
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
  return [
    [
      Rhomb(rh.b, rh1.c, rh1.b, rh.b.subtract(rh1.c).add(rh1.b)),
      Rhomb(rh.d, rh2.c, rh2.b, rh2.b.subtract(rh2.c).add(rh.d))

      //Rhomb(rh.d, rh1.d.subtract(rh1.c).add(rh.d), rh1.d, rh1.c),
      //Rhomb(rh.b, rh.b.subtract(rh2.c).add(rh2.d), rh2.d, rh2.c)
    ],
    [rh1, rh2, rh3]
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

function AmmBeeRhomb(
  rhomb: Rhomb,
  parent: (r: Rhomb) => RhombTile,
  children: (r: Rhomb) => [Rhomb[], Rhomb[]],
  kind: string
): RhombTile {
  return {
    ...rhomb,
    rotationalSymmetry: kind == "square" ? 4 : 2,
    contains(p: Polygon | V, depth = 0) {
      if (depth === 0) return rhomb.contains(p);
      return rhomb.contains(p) && firstChild(rhomb).contains(p);
    },
    intersects(p: Polygon, depth = 0) {
      if (depth < 0) return rhomb.intersects(p);
      return rhomb.intersects(p) || this.parent().intersects(p, depth - 1);
    },
    parent() {
      return parent(this);
    },
    children() {
      const [fatChildren, thinChildren] = children(this);
      return fatChildren
        .map((c) => AmmBeeRhomb(c, () => this, squareChildren, "square"))
        .concat(
          thinChildren.map((c) =>
            AmmBeeRhomb(c, () => this, rhombChildren, "rhomb")
          )
        );
    },
    translate: (v) => AmmBeeRhomb(rhomb.translate(v), parent, children, kind),
    kind
  };
}

function RootAmmBeeRhomb(r1: Rhomb): RhombTile {
  return AmmBeeRhomb(
    r1,
    (r) => RootAmmBeeRhomb(parent(r)),
    squareChildren,
    "square"
  );
}

export default TileSet((seed) => RootAmmBeeRhomb(root(seed)), [
  "square",
  "rhomb"
]);
