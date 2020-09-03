import { Polygon } from "../lib/math/2d/Polygon";
import { Tile } from "./Tile";
import { Rule } from "./Rule";
import { RotationColorerOptions } from "../renderer/Colorer";
import { PrototileBuilder } from "./PrototileBuilder";
import { Prototile } from "./Prototile";

export interface RuleBuilder {
  readonly protoTile: <T extends Polygon>(p: PrototileBuilder<T>) => this;
  readonly build: () => Rule;
}

export type Substitution<T extends Polygon> = (
  c: T,
  ...consumers: ((p: Polygon) => Tile)[]
) => void;

export function RuleBuilder(params?: {
  colors?: RotationColorerOptions;
}): RuleBuilder {
  return new _RuleBuilder({ colors: params?.colors });
}

class _RuleBuilder implements RuleBuilder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protos: PrototileBuilder<any>[];
  readonly colors?: { hueSpan?: number; hueOffset?: number };

  constructor(params: { colors?: RotationColorerOptions } = {}) {
    this.colors = params.colors;
    this.protos = [];
  }

  protoTile<T extends Polygon>(p: PrototileBuilder<T>): this {
    this.protos.push(p);
    return this;
  }

  build() {
    let builtProtos: Prototile[] = [];
    const creators = this.protos.map((_, i) => (p: Polygon) =>
      builtProtos[i].create(p)
    );

    builtProtos = this.protos.map((proto) => proto.build(creators));

    return Rule(builtProtos, this.colors);
  }
}
