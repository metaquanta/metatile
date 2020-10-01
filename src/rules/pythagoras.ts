// Reference: https://arxiv.org/abs/0704.2521

import { Triangle } from "../lib/math/2d/Polygon";
import V from "../lib/math/2d/V";
import { findRoot } from "../lib/math/numerical";
import Prototile from "../tiles/Prototile";
import Rule from "../tiles/Rule";

const z = (m: number, j: number) => (lambda: number) =>
  lambda ** (2 * m) - lambda ** (2 * j) - 1;

function generatePythagoras(m: number, j: number): Rule.Builder {
  if (j >= m || j <= 0 || m <= 2)
    throw new Error("m, j must satisfy m > j, m > 2, j > 0.");
  const lambda = findRoot(z(m, j), [1, m * j]);
  const ls = lambda ** -m;
  const lm = lambda ** (j - m);

  const tile = (i: V, j: V, u: V): Triangle =>
    Triangle.create(i.scale(ls), V.create(0, 0), j.scale(lm)).translate(u);

  const subdivision = (
    t: Triangle,
    ...tileConsumer: ((t: Triangle) => void)[]
  ) => {
    const hp = t.c
      .subtract(t.a)
      .scale(1 / lambda ** (2 * m))
      .add(t.a);

    tileConsumer[0](Triangle.create(t.a, hp, t.b));
    tileConsumer[j](Triangle.create(t.b, hp, t.c));
  };

  // This leaves the tile unchanged but now labeled relatively larger.
  const inflate = (i: number) => (
    t: Triangle,
    ...tileConsumers: ((t: Triangle) => void)[]
  ) => {
    tileConsumers[i + 1](t);
  };

  // This is the inverse of subdivision() for the smaller tile.
  const parent0 = (t: Triangle, ...tileConsumer: ((t: Triangle) => void)[]) => {
    const hp = t.b
      .subtract(t.a)
      .scale(lambda ** (2 * m))
      .add(t.a);
    //console.log(`inflating: ${t}`);
    tileConsumer[m - 1](Triangle.create(t.a, t.c, hp));
  };

  let alt = 0;

  const parentj = (t: Triangle, ...tileConsumer: ((t: Triangle) => void)[]) => {
    // we need to alternate parent funcs to cover arbitrary space.
    alt++;
    if (alt % 2 === 0) return deflate(j)(t, ...tileConsumer);
    const hp = t.b
      .subtract(t.c)
      .scale(lambda ** (2 * m) / lambda ** (2 * j))
      .add(t.c);
    //console.log(`inflating: ${t}`);
    tileConsumer[m - 1](Triangle.create(hp, t.a, t.c));
  };

  // This is the inverse of inflate().
  const deflate = (i: number) => (
    t: Triangle,
    ...tileConsumers: ((t: Triangle) => void)[]
  ) => {
    tileConsumers[i - 1](t);
  };

  const builder = Rule.builder();

  for (let i = 0; i < m; i++) {
    builder.protoTile(
      ((proto: Prototile.Builder<Triangle>) =>
        i === j ? proto.tile(tile) : proto)(
        Prototile.builder<Triangle>({
          name: `tile_${i}`,
          rotationalSymmetryOrder: 1,
          reflectionSymmetry: true
        })
          // last proto gets subdivision
          .substitution(i === m - 1 ? subdivision : inflate(i))
          .parent(i === 0 ? parent0 : i === j ? parentj : deflate(i))
      )
    );
  }
  return builder;
}

export default generatePythagoras(3, 1).build();

export const PythagorasMJ = (m: number, j: number): Rule =>
  generatePythagoras(m, j).build();
