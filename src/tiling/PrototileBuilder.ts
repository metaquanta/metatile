import { Polygon } from "../classes/Polygon";
import { Tile, Prototile } from "../classes/Tile";
import { Rule } from "../classes/Rule";
import { V } from "../classes/V";
import { ColorRotationParameters } from "../renderer/Colorer";

export interface PrototileBuilder<T extends Polygon> {
  readonly substitution: (
    f: (p: T, ...consumers: ((p: Polygon) => Tile)[]) => void
  ) => this;
  readonly parent: (
    f: (c: T, ...consumers: ((p: Polygon) => Tile)[]) => void
  ) => this;
  readonly tile: (f: (l: V, p: V) => T) => this;
}

export interface RuleBuilder {
  readonly protoTile: <T extends Polygon>(p: PrototileBuilder<T>) => this;
  readonly build: () => Rule;
}

export type Substitution<T extends Polygon> = (
  c: T,
  ...consumers: ((p: Polygon) => Tile)[]
) => void;

const defaultPrototileParams = {
  name: "tile",
  rotationalSymmetryOrder: 1,
  reflectionSymmetry: false,
  volumeHierarchic: true
};

export function PrototileBuilder<T extends Polygon>(params: {
  name?: string;
  rotationalSymmetryOrder?: number;
  reflectionSymmetry?: boolean;
  volumeHierarchic?: boolean;
  // N.V.H - Non-Volume-Hierarchic:
  // NVH implies t's descendents don't cover t, coveringGenerations is the min.
  // levels above t with leaves that cover t.
  // Once a covering tile is found, apply .parent() this many more times.
  // 4 for Penrose Rhombs.
  coveringGenerations?: number;
  // NVH implies t doesn't cover t's descendents, intersectingGenerations is
  // the min.levels above t that covers all of t's leaves.
  // If t intersects the viewport, t', t'', ...t^n are assumed to also.
  intersectingGenerations?: number;
}): PrototileBuilder<T> {
  return new _PrototileBuilder<T>({ ...defaultPrototileParams, ...params });
}

export function RuleBuilder(params?: {
  colors?: ColorRotationParameters;
}): RuleBuilder {
  return new _RuleBuilder({ colors: params?.colors });
}

class _PrototileBuilder<T extends Polygon> implements PrototileBuilder<T> {
  #substitution: Substitution<T> | undefined;
  #parent: Substitution<T> | undefined;
  #tile: ((l: V, p: V) => T) | undefined;
  readonly name: string;
  readonly rotationalSymmetryOrder: number;
  readonly reflectionSymmetry: boolean;
  readonly volumeHierarchic: boolean;
  readonly coveringGenerations?: number;
  readonly intersectingGenerations?: number;

  constructor(params: {
    name: string;
    rotationalSymmetryOrder: number;
    reflectionSymmetry: boolean;
    volumeHierarchic: boolean;
    coveringGenerations?: number;
    intersectingGenerations?: number;
  }) {
    this.name = params.name;
    this.rotationalSymmetryOrder = params.rotationalSymmetryOrder;
    this.reflectionSymmetry = params.reflectionSymmetry;
    this.volumeHierarchic = params.volumeHierarchic;
    this.coveringGenerations = params.coveringGenerations;
    this.intersectingGenerations = params.intersectingGenerations;
  }

  substitution(f: Substitution<T>) {
    this.#substitution = f;
    return this;
  }

  parent(f: Substitution<T>) {
    this.#parent = f;
    return this;
  }

  tile(f: (l: V, p: V) => T) {
    this.#tile = f;
    return this;
  }

  build(creators: ((p: Polygon) => Tile)[]): Prototile {
    if (this.#substitution === undefined)
      throw new Error(`Prototiles must have a substitution!!`);
    return Prototile({
      children: (p: Polygon) =>
        childTiles(this.#substitution as Substitution<T>, p, creators),
      parent:
        this.#parent === undefined
          ? undefined
          : (p: Polygon) =>
              parentTile(this.#parent as Substitution<T>, p as T, creators),
      tile: this.#tile,
      rotationalSymmetryOrder: this.rotationalSymmetryOrder,
      reflectionSymmetry: this.reflectionSymmetry,
      name: this.name,
      volumeHierarchic: this.volumeHierarchic,
      coveringGenerations: this.coveringGenerations,
      intersectingGenerations: this.intersectingGenerations
    });
  }
}

function childTiles<T extends Polygon>(
  substitution: Substitution<T>,
  p: Polygon,
  creators: ((p: Polygon) => Tile)[]
): Tile[] {
  const children: Tile[] = [];
  const consumers = creators.map((f) => (p: Polygon) => {
    const child = f(p);
    children.push(child);
    return child;
  });
  substitution(p as T, ...consumers);
  return children;
}

function parentTile<T extends Polygon>(
  substitution: Substitution<T>,
  p: T,
  creators: ((p: Polygon) => Tile)[]
): Tile {
  let parent: Tile | undefined = undefined;
  const consumers = creators.map((f) => (p: Polygon) => {
    parent = f(p);
    return parent;
  });
  substitution(p, ...consumers);
  if (parent === undefined)
    throw new Error("Prototile parent method failed to create parent.");
  return parent;
}

class _RuleBuilder implements RuleBuilder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protos: _PrototileBuilder<any>[];
  readonly colors?: { hueSpan?: number; hueOffset?: number };

  constructor(params?: { colors?: ColorRotationParameters }) {
    this.colors = params?.colors;
    this.protos = [];
  }

  protoTile<T extends Polygon>(p: PrototileBuilder<T>): this {
    this.protos.push(p as _PrototileBuilder<T>);
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
