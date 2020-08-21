// Reference: https://tilings.math.uni-bielefeld.de/substitution/pinwheel-variant-10-tiles/

import { Triangle } from "../lib/math/2d/Polygon.js";
import { V } from "../lib/math/2d/V.js";
import { PrototileBuilder } from "../tiles/PrototileBuilder.js";
import { RuleBuilder } from "../tiles/RuleBuilder.js";

export default RuleBuilder()
  .protoTile(
    PrototileBuilder<Triangle>({
      name: "tile",
      rotationalSymmetryOrder: 1,
      reflectionSymmetry: false
    })
      .parent((t: Triangle, tileConsumer) => {
        // A->B is S side, B->C is M side, C->A is L side.
        const m = t.c.subtract(t.b);
        const s = t.b.subtract(t.a);
        tileConsumer(
          Triangle(
            t.a.add(m.scale(1 / 3).invert()),
            t.b.add(s.scale(2)),
            t.a.add(m.scale(3))
          )
        );
      })
      .substitution((t: Triangle, tileConsumer) => {
        //        10m
        //     7m 8 9
        // 2m 3 4 5 6
        //       1m
        const l = t.c.subtract(t.a).scale(1 / 10);
        const c1 = Triangle(t.a, t.a.add(l), t.b);

        const c5b = c1.c
          .subtract(c1.b)
          .scale(1 / 3)
          .add(c1.b);
        const c5 = Triangle(c1.b, c5b, c5b.add(l.scale(3)));
        const c3 = c5.translate(c5.b.subtract(c5.a));
        const c2 = Triangle(c3.b.subtract(c3.a).add(c3.b), c3.b, c3.c);
        const c4 = Triangle(c2.c, c5.c, c3.a);
        const c6 = c4.translate(c4.b.subtract(c4.a));
        const c7 = c2.translate(c2.c.subtract(c2.a));

        tileConsumer(c5);
        tileConsumer(c1);
        tileConsumer(c2);
        tileConsumer(c3);
        tileConsumer(c4);
        tileConsumer(c6);
        tileConsumer(c7);
        tileConsumer(c5.translate(c5.c.subtract(c5.b)));
        tileConsumer(c6.translate(c6.b.subtract(c6.c)));
        tileConsumer(c7.translate(c7.c.subtract(c7.a)));
      })
      .tile(
        (l: V): Triangle =>
          Triangle(l.perp().scale(-1 / 9), l.scale(1 / 3), l.perp())
      )
  )
  .build();
