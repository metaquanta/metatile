// Reference: https://tilings.math.uni-bielefeld.de/substitution/pinwheel-variant-13-tiles/

import { Triangle } from "../lib/math/2d/Polygon";
import V from "../lib/math/2d/V";
import Prototile from "../tiles/Prototile";
import Rule from "../tiles/Rule";

export default Rule.builder()
  .protoTile(
    Prototile.builder<Triangle>({
      name: "tile",
      rotationalSymmetryOrder: 1,
      reflectionSymmetry: false
    })
      .parent((t, tileConsumer) => {
        // A->B is S side, B->C is M side, C->A is L side.
        tileConsumer(
          Triangle.create(
            t.c.add(t.b.subtract(t.a)).add(t.c.subtract(t.b).scale(4 / 3)),
            t.c.add(t.a.subtract(t.b).scale(2)),
            t.b.add(t.b.subtract(t.a)).add(t.b.subtract(t.c).scale(2))
          )
        );
      })
      .substitution((t: Triangle, tileConsumer) => {
        // m1
        // 2  3  m4
        // m5  m6  7  8  m9
        // 10 11 m12
        // m13
        const m = t.b.subtract(t.c);
        const l = t.a.subtract(t.c);
        const s = t.b.subtract(t.a);

        const c1 = Triangle.create(
          m.scale(1 / 3).add(t.c),
          l.scale(3 / 13).add(t.c),
          t.c
        );
        const c4 = c1.translate(m.scale(1 / 3));
        const c5 = c1.translate(c1.b.subtract(c1.c).scale(2));
        const c2 = Triangle.create(c1.a, c1.b, c1.b.add(c1.b.subtract(c1.c)));
        const c7 = c2.translate(m.scale(1 / 3));
        const c3 = Triangle.create(c2.c, c4.b, c2.a);
        const c6 = Triangle.create(c3.a, c3.b, c3.a.add(m.scale(1 / 3)));
        const c10 = Triangle.create(
          c5.b,
          c5.b.add(l.scale(2 / 13)),
          t.a.add(s.scale(1 / 2))
        );
        const c11 = Triangle.create(c10.c, c10.b.add(s.scale(1 / 2)), c10.a);

        tileConsumer(c1);
        tileConsumer(c2);
        tileConsumer(c3);
        tileConsumer(c4);
        tileConsumer(c5);
        tileConsumer(c6);
        tileConsumer(c7); //
        tileConsumer(c3.translate(m.scale(1 / 3)));
        tileConsumer(c1.translate(m.scale(2 / 3)));
        tileConsumer(c10); //
        tileConsumer(c11);
        tileConsumer(Triangle.create(c11.a, c11.b, t.b));
        tileConsumer(Triangle.create(t.a, c10.b, c10.c));
      })
      .tile(
        (l: V, j: V, u: V): Triangle =>
          Triangle.create(j.scale(2 / 3), V.create(0, 0), l).translate(u)
      )
  )
  .build();
