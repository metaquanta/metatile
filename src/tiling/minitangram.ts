// https://tilings.math.uni-bielefeld.de/substitution/minitangram/

import { Tetragon, Triangle } from "../classes/Polygon";
import { RuleBuilder, PrototileBuilder } from "./PrototileBuilder";
import { midpoint, V } from "../classes/V";

export default RuleBuilder()
  .protoTile<Tetragon>(
    PrototileBuilder<Tetragon>({
      name: "square",
      rotationalSymmetryOrder: 4,
      reflectionSymmetry: true
    }).substitution(
      (square: Tetragon, squareConsumer, triangleConsumer, pgramConsumer) => {
        // d  __  c
        //   |  |
        // a  --  b
        const a = midpoint(square.a, square.b);
        const b = midpoint(square.b, square.c);
        const c = midpoint(square.c, square.d);
        const d = midpoint(square.d, square.a);
        const center = midpoint(square.a, square.c);

        squareConsumer(Tetragon(center, b, square.c, c));
        triangleConsumer(Triangle(a, square.b, b));
        triangleConsumer(Triangle(c, square.d, d));
        pgramConsumer(Tetragon(square.a, a, b, center));
        pgramConsumer(Tetragon(square.a, d, c, center));
      }
    )
  )
  .protoTile<Triangle>(
    PrototileBuilder<Triangle>({
      name: "triangle",
      rotationalSymmetryOrder: 1,
      reflectionSymmetry: true
    }).substitution(
      (triangle: Triangle, squareConsumer, triangleConsumer, _) => {
        //  a
        //  |\
        //b --- c
        const a = midpoint(triangle.a, triangle.b);
        const b = midpoint(triangle.b, triangle.c);
        const c = midpoint(triangle.c, triangle.a);

        squareConsumer(Tetragon(triangle.b, b, c, a));
        triangleConsumer(Triangle(triangle.a, a, c));
        triangleConsumer(Triangle(c, b, triangle.c));
      }
    )
  )
  .protoTile<Tetragon>(
    PrototileBuilder<Tetragon>({
      name: "parallelogram",
      rotationalSymmetryOrder: 1,
      reflectionSymmetry: false
    })
      .substitution((pgram: Tetragon, _, triangleConsumer, pgramConsumer) => {
        //  c
        //  |\ b
        // d \|
        //    a
        const a = midpoint(pgram.a, pgram.b);
        const b = midpoint(pgram.b, pgram.c);
        const c = midpoint(pgram.c, pgram.d);
        const d = midpoint(pgram.d, pgram.a);
        const center = midpoint(pgram.a, pgram.c);

        pgramConsumer(Tetragon(center, b, pgram.c, c));
        pgramConsumer(Tetragon(center, d, pgram.a, a));
        triangleConsumer(Triangle(a, pgram.b, center));
        triangleConsumer(Triangle(b, center, pgram.b));
        triangleConsumer(Triangle(c, pgram.d, center));
        triangleConsumer(Triangle(d, center, pgram.d));
      })
      .parent((child: Tetragon, _1, _2, pgramConsumer) => {
        const l = child.d.subtract(child.c).scale(2);
        const k = child.b.subtract(child.c).scale(2);

        pgramConsumer(
          Tetragon(
            child.c,
            child.c.add(l),
            child.c.add(l).add(k),
            child.c.add(k)
          )
        );
      })
      .tile((l: V, p: V) => {
        const k = l.perp();
        return Tetragon(V(0, 0), l, l.scale(2).add(k), l.add(k)).translate(p);
      })
  )
  .build();
