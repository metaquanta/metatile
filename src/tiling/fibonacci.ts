import { Rhomb } from "../classes/Polygon";
import { createTile, Tile, TileSet } from "../classes/Tile";
import { V } from "../classes/V";

const PHI = (1 + 5 ** (1 / 2)) / 2;
const PHI_INV = 1 / PHI;
const CHI = 1 / (PHI - 1) + 1;

const square1 = (r: Rhomb, p: Tile & Rhomb): Tile & Rhomb =>
  createTile("Square1", r, (t) => [square2(t, t)], p, 4);

const square2 = (r: Rhomb, p: Tile & Rhomb): Tile & Rhomb =>
  createTile(
    "Square2",
    r,
    (t) => {
      const r = t.translate(t.a.invert());

      const l = r.b.scale(PHI_INV);
      const k = r.d.scale(PHI_INV);

      const e = k.add(r.b);
      const f = l.add(r.d);

      const g = l.add(k);
      return [
        square1(Rhomb(g, e, r.c, f).translate(t.a), t),
        square2(Rhomb(r.a, l, g, k).translate(t.a), t),
        rectangle(Rhomb(l, r.b, e, g).translate(t.a)),
        rectangle(Rhomb(g, f, r.d, k).translate(t.a))
      ];
    },
    p,
    4
  );

const rectangle = (r: Rhomb): Tile & Rhomb =>
  createTile(
    "Rectangle",
    r,
    (t) => {
      const e = r.c.subtract(r.b).scale(PHI_INV).add(r.b);
      const f = r.d.subtract(r.a).scale(PHI_INV).add(r.a);
      return [
        rectangle(Rhomb(e, r.c, r.d, f)),
        square2(Rhomb(r.a, r.b, e, f), t)
      ];
    },
    (t) => {
      const l = t.a.subtract(t.b).scale(CHI);
      return rectangle(Rhomb(l.add(t.c), l.add(t.b), t.b, t.c));
    },
    2
  );

export default TileSet(
  (l, v) =>
    rectangle(
      Rhomb(
        V(0, 0),
        l,
        l.perp().scale(PHI).add(l),
        l.perp().scale(PHI)
      ).translate(v)
    ),
  ["Rectangle", "Square1", "Square2"],
  { hueSpan: 0.1, hueOffset: 0.6 }
);
