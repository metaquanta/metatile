// Reference: https://arxiv.org/abs/math/9712263

import { Triangle } from "../classes/Polygon";
import { RuleBuilder, PrototileBuilder } from "./PrototileBuilder";
import { V } from "../classes/V";
import { gcd } from "../util";
import { invertFunction } from "../numerical";

const z = (theta: number) =>
  Math.log(Math.sin(theta)) / Math.log(Math.cos(theta) / 2);

function generatePinwheel(p: number, q: number): RuleBuilder {
  const c = gcd(q, p);
  if (c > 1) return generatePinwheel(p / c, q / c);

  const theta = invertFunction(z, [0, Math.PI / 2])(p / q);
  const opp = Math.sin(theta);
  const adj = Math.cos(theta);
  const numProtoTiles = Math.max(p, q);

  const tile = (l: V, u: V): Triangle =>
    Triangle(l.scale(opp), V(0, 0), l.perp().scale(adj)).translate(u);

  const substitution = (
    t: Triangle,
    ...tileConsumer: ((t: Triangle) => void)[]
  ) => {
    // A->B is S side, B->C is M side, C->A is L side.
    const m = t.b.subtract(t.c);
    const h = t.a.subtract(t.c);

    const mmid = t.c.add(m.scale(1 / 2));
    const hp2 = t.c.add(h.scale(m.norm() ** 2 / h.norm() ** 2));
    const hp1 = hp2
      .subtract(t.c)
      .scale(1 / 2)
      .add(t.c);
    const int = mmid.subtract(hp1).add(hp2);

    tileConsumer[Math.max(q - p, 0)](Triangle(t.a, hp2, t.b));
    tileConsumer[Math.max(p - q, 0)](Triangle(t.b, int, mmid));
    tileConsumer[Math.max(p - q, 0)](Triangle(hp2, int, mmid));
    tileConsumer[Math.max(p - q, 0)](Triangle(mmid, hp1, hp2));
    tileConsumer[Math.max(p - q, 0)](Triangle(mmid, hp1, t.c));
  };

  const parent = (t: Triangle, ...tileConsumer: ((t: Triangle) => void)[]) => {
    const b = t.b.subtract(t.a).add(t.b);
    const c = t.c.subtract(b).add(t.c);
    const a = c
      .subtract(b)
      .perp()
      .scale(opp / adj)
      .invert()
      .add(b);
    tileConsumer[numProtoTiles - 1](Triangle(a, b, c));
  };

  const builder = RuleBuilder();

  for (let i = 0; i < numProtoTiles; i++) {
    builder.protoTile(
      PrototileBuilder<Triangle>({
        name: `tile${i}`,
        rotationalSymmetryOrder: 1,
        reflectionSymmetry: false
      })
        .substitution(
          i === numProtoTiles - 1
            ? substitution
            : (t: Triangle, ...tileConsumers: ((t: Triangle) => void)[]) => {
                tileConsumers[i + 1](t);
              }
        )
        .parent(
          i === 0
            ? parent
            : (t: Triangle, ...tileConsumers: ((t: Triangle) => void)[]) => {
                tileConsumers[i - 1](t);
              }
        )
        .tile(tile)
    );
  }
  return builder;
}

export default generatePinwheel(1, 1).build();
