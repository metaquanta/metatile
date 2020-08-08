// Reference: https://tilings.math.uni-bielefeld.de/substitution/pinwheel/

import { Triangle } from "../classes/Polygon";
import { RuleBuilder, PrototileBuilder } from "./PrototileBuilder";
import { V } from "../classes/V";

export default RuleBuilder()
  .protoTile(
    PrototileBuilder<Triangle>({
      name: "tile",
      rotationalSymmetryOrder: 1,
      reflectionSymmetry: false
    })
      .substitution((t: Triangle, tileConsumer) => {
        // A->B is S side, B->C is M side, C->A is L side.
        const l = t.a.subtract(t.c);
        const m = t.b.subtract(t.c);

        const a = Triangle(t.c.add(m.scale(0.5)), t.c.add(l.scale(2 / 5)), t.c);

        //      A
        //   /  |
        // C----B
        const b = Triangle(a.a, a.b, a.b.add(a.b.subtract(a.c)));

        // B----C
        // |  /
        // A
        const c = Triangle(b.c, b.c.add(b.a.subtract(b.b)), b.a);

        // A
        // |  \
        // B----C
        const d = Triangle(c.b.add(c.b.subtract(c.a)), c.b, c.c);

        //    C
        //   /|
        //  / |
        // A--B
        const E = (d: Triangle) => {
          const l = d.b.subtract(d.a);
          const eb = d.b.add(l);
          const ea = d.b
            .subtract(d.c)
            .scale(0.5)
            .add(d.b)
            .add(d.b.subtract(d.a));
          return Triangle(ea, eb, d.a);
        };

        tileConsumer(c);
        tileConsumer(a);
        tileConsumer(b);
        tileConsumer(d);
        tileConsumer(E(d));
      })
      .parent((t, tileConsumer) => {
        const m = t.b.subtract(t.c);
        const s = t.b.subtract(t.a);
        tileConsumer(
          Triangle(t.a.add(m.scale(0.5)), t.b.add(s), t.a.subtract(m.scale(2)))
        );
      })
      .tile(
        (l: V, u: V): Triangle =>
          Triangle(l, V(0, 0), l.perp().scale(2)).translate(u)
      )
  )
  .build();
