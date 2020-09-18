import { Tetragon } from "../lib/math/2d/Polygon";
import { V } from "../lib/math/2d/V";
import * as Prototile from "../tiles/PrototileBuilder";
import { RuleBuilder } from "../tiles/RuleBuilder";

const SIN36 = (5 / 8 - 5 ** (1 / 2) / 8) ** (1 / 2);
const COS36 = (1 / 4) * (1 + 5 ** (1 / 2));

const PHI = (1 + 5 ** (1 / 2)) / 2;
const CONJPHI = (5 ** (1 / 2) - 1) / 2;

export default RuleBuilder()
  .protoTile(
    Prototile.Builder<Tetragon>({
      name: "kite",
      rotationalSymmetryOrder: 2,
      reflectionSymmetry: true,
      volumeHierarchic: false,
      coveringGenerations: 3,
      intersectingGenerations: 3
    })
      .tile(
        (l: V, p: V): Tetragon => {
          const t = l.scale(COS36);
          const u = l.perp().scale(SIN36);
          return Tetragon(V(0, 0), t.subtract(u), l, t.add(u)).translate(p);
        }
      )
      .parent((k: Tetragon, kite) => {
        const a = k.b.subtract(k.a).scale(PHI).add(k.a);
        const b = k.c
          .subtract(k.b)
          .scale(PHI + 1)
          .add(a);
        kite(Tetragon(a, b, k.d, k.a));
      })
      .substitution((k: Tetragon, kite, dart) => {
        const db = k.a.add(k.c.subtract(k.d));
        //const ed = k.a.add(k.c.subtract(k.b));
        const dd = k.c.subtract(k.a).scale(CONJPHI).add(k.a);
        const dc = k.a.subtract(k.b).scale(CONJPHI).add(k.b);
        const ec = k.a.subtract(k.d).scale(CONJPHI).add(k.d);
        dart(Tetragon(k.a, db, dc, dd));
        //createDart(Tetragon(k.a, dd, ec, ed)),
        kite(Tetragon(k.b, k.c, dd, dc));
        kite(Tetragon(k.d, ec, dd, k.c));
      })
  )
  .protoTile(
    Prototile.Builder<Tetragon>({
      name: "dart",
      rotationalSymmetryOrder: 2,
      reflectionSymmetry: true,
      volumeHierarchic: false,
      coveringGenerations: 3,
      intersectingGenerations: 3
    }).substitution((d: Tetragon, kite, dart) => {
      //const dd = d.a.subtract(d.c).add(d.b);
      const eb = d.a.subtract(d.c).add(d.d);
      const dc = d.b.subtract(d.a).scale(CONJPHI).add(d.a);
      const ec = d.d.subtract(d.a).scale(CONJPHI).add(d.a);
      //createDart(Tetragon(d.b, d.c, dc, dd)),
      dart(Tetragon(d.d, eb, ec, d.c));
      kite(Tetragon(d.a, dc, d.c, ec));
    })
  )
  .build();
