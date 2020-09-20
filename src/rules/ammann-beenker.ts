// Reference: https://tilings.math.uni-bielefeld.de/substitution/ammann-beenker/

import { Rhomb, Tetragon } from "../lib/math/2d/Polygon";
import V from "../lib/math/2d/V";
import Prototile from "../tiles/Prototile";
import Rule from "../tiles/Rule";

const SQRT2 = 2 ** (1 / 2);

export default Rule.builder({ colors: { hueSpan: 0.25, hueOffset: 0.65 } })
  .protoTile(
    Prototile.builder<Tetragon>({
      name: "square",
      rotationalSymmetryOrder: 4,
      reflectionSymmetry: true,
      volumeHierarchic: false,
      coveringGenerations: 5,
      intersectingGenerations: 2
    })
      .substitution((sq: Tetragon, squareConsumer, rhombConsumer) => {
        const r = sq.translate(sq.a.invert());
        const unit_d = r.c.scale(1 / (2 + SQRT2));
        const unit_d2 = r.d.subtract(r.b).scale(1 / (2 + SQRT2));
        const inner_sq = Rhomb.create(
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
        squareConsumer(inner_sq);
        squareConsumer(
          Rhomb.create(sq.b, inner_sq.d, a, sq.b.subtract(unit_d))
        );
        squareConsumer(Rhomb.create(sq.c, inner_sq.a, b, b.add(unit_d)));

        rhombConsumer(Rhomb.create(sq.a, a, inner_sq.d, inner_sq.c));
        rhombConsumer(Rhomb.create(sq.b, b, inner_sq.a, inner_sq.d));
        rhombConsumer(Rhomb.create(sq.d, inner_sq.b, inner_sq.a, c));
        rhombConsumer(Rhomb.create(sq.a, inner_sq.c, inner_sq.b, d));
      })
      .parent((rh, squareConsumer) => {
        const u = rh.c.subtract(rh.a).scale(1 + 1 / SQRT2);
        const v = rh.d.subtract(rh.b).scale(1 + 1 / SQRT2);
        squareConsumer(
          Rhomb.create(
            rh.a.add(u),
            rh.b.add(v),
            rh.c.add(u.invert()),
            rh.d.add(v.invert())
          )
        );
      })
      .tile(
        (p: V, r: V): Rhomb => {
          const q = p.perp();
          return Rhomb.create(V.create(0, 0), p, q.add(p), q).translate(r);
        }
      )
  )
  .protoTile(
    Prototile.builder<Tetragon>({
      name: "rhomb",
      rotationalSymmetryOrder: 2,
      reflectionSymmetry: true,
      volumeHierarchic: false,
      coveringGenerations: 5,
      intersectingGenerations: 2
    }).substitution((rh: Rhomb, squareConsumer, rhombConsumer) => {
      const r = rh.translate(rh.a.invert());
      const u = r.b.scale(1 / (1 + SQRT2));
      const v = r.d.scale(1 / (1 + SQRT2));
      const rh1 = Rhomb.create(r.a, u, u.add(v), v).translate(rh.a);
      const rh2 = Rhomb.create(
        r.c,
        r.c.subtract(u),
        r.c.subtract(u.add(v)),
        r.c.subtract(v)
      ).translate(rh.a);
      const rh3 = Rhomb.create(rh.b, rh2.c, rh.d, rh1.c);

      //Rhomb.create(rh.d, rh1.d.subtract(rh1.c).add(rh.d), rh1.d, rh1.c),
      //Rhomb.create(rh.b, rh.b.subtract(rh2.c).add(rh2.d), rh2.d, rh2.c)

      squareConsumer(
        Rhomb.create(rh.b, rh1.c, rh1.b, rh.b.subtract(rh1.c).add(rh1.b))
      );
      squareConsumer(
        Rhomb.create(rh.d, rh2.c, rh2.b, rh2.b.subtract(rh2.c).add(rh.d))
      );
      rhombConsumer(rh1);
      rhombConsumer(rh2);
      rhombConsumer(rh3);
    })
  )
  .build();
