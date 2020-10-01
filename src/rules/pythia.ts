// Reference: https://arxiv.org/abs/0704.2521

import { Triangle } from "../lib/math/2d/Polygon";
import V from "../lib/math/2d/V";
import { findRoot } from "../lib/math/numerical";
import Prototile from "../tiles/Prototile";
import Rule from "../tiles/Rule";

const z = (m: number, j: number) => (lambda: number) =>
  lambda ** (2 * m) - lambda ** (2 * j) - 1;

function generatePythia(m: number, j: number): Rule.Builder {
  if (j >= m || j <= 0 || m <= 2)
    throw new Error("m, j must satisfy m > j, m > 2, j > 0.");
  console.debug(`Pythia-${m}-${j}`);
  const lambda = findRoot(z(m, j), [1, 2]);
  const ls = lambda ** -m;
  const lm = lambda ** (j - m);

  const tile = (i: V, j: V, u: V): Triangle => {
    console.log(`tile() -> ${ls}, ${lm}`);
    return Triangle.create(i.scale(ls), V.create(0, 0), j.scale(lm)).translate(
      u
    );
  };

  const subdivision = (
    t: Triangle,
    i: number,
    tileConsumer: ((t: Triangle) => void)[]
  ) => {
    if (i >= m) {
      const hp = t.c
        .subtract(t.a)
        .scale(1 / lambda ** (2 * m))
        .add(t.a);

      subdivision(Triangle.create(t.a, hp, t.b), i - m, tileConsumer);
      subdivision(Triangle.create(t.b, hp, t.c), i - m + j, tileConsumer);
    } else {
      tileConsumer[i](t);
    }
  };

  const children = (i: number) => (
    t: Triangle,
    ...tileConsumer: ((t: Triangle) => void)[]
  ) => {
    const lp = t.c
      .subtract(t.b)
      .scale(1 / (1 + lambda ** (2 * j)))
      .add(t.b);
    const sp = t.b
      .subtract(t.a)
      .scale(1 / (1 + lambda ** (2 * j)))
      .add(t.a);
    const hp = lp.add(sp.subtract(t.b));

    subdivision(Triangle.create(hp, lp, t.c), i + 2 * j, tileConsumer);
    tileConsumer[i](Triangle.create(t.a, sp, hp));
    subdivision(Triangle.create(sp, hp, lp), i + j, tileConsumer);
    subdivision(Triangle.create(lp, t.b, sp), i + j, tileConsumer);
  };

  const parent = (i: number) => (
    t: Triangle,
    ...tileConsumer: ((t: Triangle) => void)[]
  ) => {
    const b = t.c.add(t.a.subtract(t.b));
    const a = t.a
      .subtract(b)
      .scale(1 + lambda ** (-2 * j))
      .add(b);
    const c = t.c
      .subtract(b)
      .scale(1 + lambda ** (2 * j))
      .add(b);
    const p = Triangle.create(a, b, c);
    // This is a hack that seems to approximately work
    const ps = p.scale(lambda ** (j - 1));
    tileConsumer[(i - j + 2 * m) % m](ps.translate(ps.b.invert().add(p.b)));
  };

  const builder = Rule.builder();
  for (let i = 0; i < m; i++) {
    builder.protoTile(
      ((proto: Prototile.Builder<Triangle>) => proto.tile(tile))(
        Prototile.builder<Triangle>({
          name: `tile_${i}`,
          rotationalSymmetryOrder: 1,
          reflectionSymmetry: false
        })
          .substitution(children(i))
          .parent(parent(i))
      )
    );
  }
  return builder;
}

export default generatePythia(6, 1).build();

export const PythiaMJ = (m: number, j: number): Rule =>
  generatePythia(m, j).build();
