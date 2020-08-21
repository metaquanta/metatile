// Reference: https://tilings.math.uni-bielefeld.de/substitution/penrose-rhomb/

import { Rhomb } from "../lib/math/2d/Polygon.js";
import { V } from "../lib/math/2d/V.js";
import { PrototileBuilder } from "../tiles/PrototileBuilder.js";
import { RuleBuilder } from "../tiles/RuleBuilder.js";

const SIN15 = Math.sin(Math.PI / 5);
const COS15 = Math.cos(Math.PI / 5);

const IF = (1 + 5 ** (1 / 2)) / 2;
const DF = 1 / IF;

const M = [V(COS15, -1 * SIN15), V(SIN15, COS15)];

const rotate = (u: V) => V(M[0].dot(u), M[1].dot(u));

export default RuleBuilder()
  .protoTile(
    PrototileBuilder<Rhomb>({
      name: "rhomb",
      rotationalSymmetryOrder: 2,
      reflectionSymmetry: true,
      volumeHierarchic: false,
      coveringGenerations: 4,
      intersectingGenerations: 2
    })
      .tile((u: V, p: V) => {
        const v = rotate(rotate(u));
        return Rhomb(V(0, 0), u, u.add(v), v).translate(p);
      })
      .parent((r1: Rhomb, rhomb) => {
        const r = r1.translate(r1.a.invert());
        const u = r.b.scale(IF);
        const v = r.d.scale(IF);
        rhomb(Rhomb(u.add(v), v, r.a, u).translate(r1.a));
      })
      .substitution((r1: Rhomb, rhombCreate, kiteCreate) => {
        const r = r1.translate(r1.c.invert());
        const u = r.b.scale(DF);
        const v = r.d.scale(DF);
        //Rhomb(r.d, u.add(v), v, r.d.add(u.invert()))
        //Rhomb(r.b, u.add(v), r.a, r.a.subtract(u.add(v)).add(r.b)),
        rhombCreate(Rhomb(r.c, v, u.add(v), u).translate(r1.c));
        rhombCreate(
          Rhomb(r.d, r.a.subtract(u.add(v)).add(r.d), r.a, u.add(v)).translate(
            r1.c
          )
        );
        kiteCreate(
          Rhomb(r.b, r.b.add(v.invert()), u, u.add(v)).translate(r1.c)
        );
      })
  )
  .protoTile(
    PrototileBuilder<Rhomb>({
      name: "kite",
      rotationalSymmetryOrder: 2,
      reflectionSymmetry: true,
      volumeHierarchic: false,
      coveringGenerations: 4,
      intersectingGenerations: 2
    }).substitution((r2: Rhomb, rhombCreate, kiteCreate) => {
      const r = r2.translate(r2.a.invert());
      const u = r.b.scale(DF);
      //const v = r.d.scale(DF);
      //tile1(Rhomb(r.b, r.b.add(v), r.a, v.invert()).translate(r2.a)),
      //tile2(Rhomb(r.c, r.a, v.add(r.b), r.c.add(v).add(r.b)).translate(r2.a)),
      rhombCreate(Rhomb(r.d, u.invert(), r.a, r.d.add(u)).translate(r2.a));
      kiteCreate(
        Rhomb(r.c, r.c.add(u).add(r.d), u.add(r.d), r.a).translate(r2.a)
      );
    })
  )
  .build();
