// Reference: https://arxiv.org/abs/math/9712263

import { Triangle } from "../lib/math/2d/Polygon";
import V from "../lib/math/2d/V";
import { invertFunction } from "../lib/math/numerical";
import { gcd } from "../lib/math/util";
import Prototile from "../tiles/Prototile";
import Rule from "../tiles/Rule";

const z = (theta: number) =>
  Math.log(Math.sin(theta)) / Math.log(Math.cos(theta) / 2);

const zInv = invertFunction(z, [0, Math.PI / 2]);

// Produce one of the countably infinite family of Pinwheel tilings, T(p/q)
// described by Sadun in arxiv:math/9712263.
function generatePinwheel(p: number, q: number): Rule.Builder {
  if (!(Number.isInteger(p) && Number.isInteger(q))) {
    throw new Error("pinwheel::generatePinwheel(p, q) - p and q must be in ℤ");
  }
  // reduce p/q
  const c = gcd(q, p);
  if (c > 1) return generatePinwheel(p / c, q / c);

  const theta = zInv(p / q);
  const opp = Math.sin(theta);
  const adj = Math.cos(theta);

  // T(p/q) has n=max(p,q) prototiles. Or, equivalently, n sizes of the single
  // proto.
  const n = Math.max(p, q);

  const tile = (l: V, j: V, u: V): Triangle =>
    Triangle.create(l.scale(opp), V.create(0, 0), j.scale(adj)).translate(u);

  // The n protos are named tile_0, tile_1, ⋯ The substitution scheme
  // has tile_0 → tile_1 → ⋯ → tile_(n-1) → (4tile_0 + tile_(q-p)) when
  // p < q and ⋯ → tile_(n-1) → (4×tile_(p-q) + tile_0) when q < p.
  // tiles are labelled tile_n when they're the largest and tile_m, n > m
  // when they're not.
  // This is the decomposition of the largest tiles.
  const subdivision = (
    t: Triangle,
    ...tileConsumer: ((t: Triangle) => void)[]
  ) => {
    // A-B is S side, B-C is M side, C-A is hyp.
    const m = t.b.subtract(t.c);
    const h = t.a.subtract(t.c);

    const mmid = t.c.add(m.scale(1 / 2));
    const hp2 = t.c.add(h.scale(m.norm() ** 2 / h.norm() ** 2));
    const hp1 = hp2
      .subtract(t.c)
      .scale(1 / 2)
      .add(t.c);
    const int = mmid.subtract(hp1).add(hp2);

    tileConsumer[Math.max(q - p, 0)](Triangle.create(t.a, hp2, t.b));
    tileConsumer[Math.max(p - q, 0)](Triangle.create(t.b, int, mmid));
    tileConsumer[Math.max(p - q, 0)](Triangle.create(hp2, int, mmid));
    tileConsumer[Math.max(p - q, 0)](Triangle.create(mmid, hp1, hp2));
    tileConsumer[Math.max(p - q, 0)](Triangle.create(mmid, hp1, t.c));
  };

  // This leaves the tile unchanged but now labeled relatively larger.
  const inflate = (i: number) => (
    t: Triangle,
    ...tileConsumers: ((t: Triangle) => void)[]
  ) => {
    tileConsumers[i + 1](t);
  };

  // This is the inverse of subdivision() for a representative of the children.
  const parent = (t: Triangle, ...tileConsumer: ((t: Triangle) => void)[]) => {
    const b = t.b.subtract(t.a).add(t.b);
    const c = t.c.subtract(b).add(t.c);
    const a = c
      .subtract(b)
      .perp()
      .scale(opp / adj)
      .invert()
      .add(b);
    tileConsumer[n - 1](Triangle.create(a, b, c));
  };

  // This is the inverse of inflate().
  const deflate = (i: number) => (
    t: Triangle,
    ...tileConsumers: ((t: Triangle) => void)[]
  ) => {
    // if p>q, parent isn't 0, but 0 should be skipped when ascending.
    if (i === 0) throw new Error("!!unreachable!!");
    tileConsumers[i - 1](t);
  };

  const builder = Rule.builder();

  for (let i = 0; i < n; i++) {
    builder.protoTile(
      // This IIF is to call .tail() only on the last builder
      ((proto: Prototile.Builder<Triangle>) =>
        i + 1 === n ? proto.tile(tile) : proto)(
        Prototile.builder<Triangle>({
          name: `tile_${i}`,
          rotationalSymmetryOrder: 1,
          reflectionSymmetry: false
        })
          // last proto gets subdivision
          .substitution(i === n - 1 ? subdivision : inflate(i))
          // first proto gets inverser subdivision, unless p<q.
          // p<q ⇒ first protos aren't part of reversible cycle.
          .parent(i === Math.max(p - q, 0) ? parent : deflate(i))
      )
    );
  }
  return builder;
}

// T(1) is the classic Pinwheel with only one prototile.
export default generatePinwheel(1, 1).build();

export const PinwheelPQ = (p: number, q: number): Rule =>
  generatePinwheel(p, q).build();
