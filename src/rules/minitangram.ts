// https://tilings.math.uni-bielefeld.de/substitution/minitangram/

import { Tetragon, Triangle } from "../lib/math/2d/Polygon";
import V from "../lib/math/2d/V";
import Prototile from "../tiles/Prototile";
import Rule from "../tiles/Rule";

export default Rule.builder()
  .protoTile(
    Prototile.builder<Tetragon>({
      name: "square",
      rotationalSymmetryOrder: 4,
      reflectionSymmetry: true
    }).substitution(
      (square: Tetragon, squareConsumer, triangleConsumer, pgramConsumer) => {
        // d  __  c
        //   |  |
        // a  --  b
        const a = V.midpoint(square.a, square.b);
        const b = V.midpoint(square.b, square.c);
        const c = V.midpoint(square.c, square.d);
        const d = V.midpoint(square.d, square.a);
        const center = V.midpoint(square.a, square.c);

        squareConsumer(Tetragon.create(center, b, square.c, c));
        triangleConsumer(Triangle.create(a, square.b, b));
        triangleConsumer(Triangle.create(c, square.d, d));
        pgramConsumer(Tetragon.create(square.a, a, b, center));
        pgramConsumer(Tetragon.create(square.a, d, c, center));
      }
    )
  )
  .protoTile(
    Prototile.builder<Triangle>({
      name: "triangle",
      rotationalSymmetryOrder: 1,
      reflectionSymmetry: true
    }).substitution((triangle: Triangle, squareConsumer, triangleConsumer) => {
      //  a
      //  |\
      //b --- c
      const a = V.midpoint(triangle.a, triangle.b);
      const b = V.midpoint(triangle.b, triangle.c);
      const c = V.midpoint(triangle.c, triangle.a);

      squareConsumer(Tetragon.create(triangle.b, b, c, a));
      triangleConsumer(Triangle.create(triangle.a, a, c));
      triangleConsumer(Triangle.create(c, b, triangle.c));
    })
  )
  .protoTile(
    Prototile.builder<Tetragon>({
      name: "parallelogram",
      rotationalSymmetryOrder: 1,
      reflectionSymmetry: false
    })
      .substitution((pgram: Tetragon, _, triangleConsumer, pgramConsumer) => {
        //  c
        //  |\ b
        // d \|
        //    a
        const a = V.midpoint(pgram.a, pgram.b);
        const b = V.midpoint(pgram.b, pgram.c);
        const c = V.midpoint(pgram.c, pgram.d);
        const d = V.midpoint(pgram.d, pgram.a);
        const center = V.midpoint(pgram.a, pgram.c);

        pgramConsumer(Tetragon.create(center, b, pgram.c, c));
        pgramConsumer(Tetragon.create(center, d, pgram.a, a));
        triangleConsumer(Triangle.create(a, pgram.b, center));
        triangleConsumer(Triangle.create(b, center, pgram.b));
        triangleConsumer(Triangle.create(c, pgram.d, center));
        triangleConsumer(Triangle.create(d, center, pgram.d));
      })
      .parent((child: Tetragon, _1, _2, pgramConsumer) => {
        const l = child.d.subtract(child.c).scale(2);
        const k = child.b.subtract(child.c).scale(2);

        pgramConsumer(
          Tetragon.create(
            child.c,
            child.c.add(l),
            child.c.add(l).add(k),
            child.c.add(k)
          )
        );
      })
      .tile((l: V, k: V, p: V) => {
        return Tetragon.create(
          V.origin,
          l,
          l.scale(2).add(k),
          l.add(k)
        ).translate(p);
      })
  )
  .build();
