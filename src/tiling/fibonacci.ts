import { Tetragon } from "../classes/Polygon";
import { oneWayPrototile, Prototile, Tile } from "../classes/Tile";
import { V } from "../classes/V";
import { Rule } from "../classes/Rule";

const PHI = (1 + 5 ** (1 / 2)) / 2;
const PHI_INV = 1 / PHI;
const CHI = 1 / (PHI - 1) + 1;

const square1: Prototile = oneWayPrototile((t) => [square2.create(t)], 4, true);

const square2: Prototile = oneWayPrototile<Tetragon>(
  (t) => {
    const r = t.translate(t.a.invert());

    const l = r.b.scale(PHI_INV);
    const k = r.d.scale(PHI_INV);

    const e = k.add(r.b);
    const f = l.add(r.d);

    const g = l.add(k);
    return [
      square1.create(Tetragon(g, e, r.c, f).translate(t.a)),
      square2.create(Tetragon(r.a, l, g, k).translate(t.a)),
      rectangle.create(Tetragon(l, r.b, e, g).translate(t.a)),
      rectangle.create(Tetragon(g, f, r.d, k).translate(t.a))
    ];
  },
  4,
  true
);

const rectangle: Prototile = Prototile<Tetragon>(
  (t) => {
    const l = t.a.subtract(t.b).scale(CHI);
    return rectangle.create(Tetragon(l.add(t.c), l.add(t.b), t.b, t.c));
  },
  (r) => {
    const e = r.c.subtract(r.b).scale(PHI_INV).add(r.b);
    const f = r.d.subtract(r.a).scale(PHI_INV).add(r.a);
    return [
      rectangle.create(Tetragon(e, r.c, r.d, f)),
      square2.create(Tetragon(r.a, r.b, e, f))
    ];
  },
  2,
  true
);

export default Rule(
  (l: V, u: V): Tile =>
    rectangle.create(
      Tetragon(
        V(0, 0),
        l,
        l.perp().scale(PHI).add(l),
        l.perp().scale(PHI)
      ).translate(u)
    ),
  [square1, square2, rectangle]
);
