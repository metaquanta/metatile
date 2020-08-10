import { Polygon, chirality } from "../classes/Polygon";
import {
  Tile,
  Prototile,
  oneWayPrototile,
  nonVolumeHierarchical
} from "../classes/Tile";
import { Rule } from "../classes/Rule";
import { V } from "../classes/V";
import { ColorRotationParameters } from "../renderer/Colorer";

export interface PrototileBuilder<T extends Polygon> {
  substitution: (
    f: (p: T, ...consumers: ((p: Polygon) => Tile)[]) => void
  ) => this;

  parent: (f: (c: T, ...consumers: ((p: Polygon) => Tile)[]) => void) => this;

  tile: (f: (l: V, p: V) => T) => this;
}

export interface RuleBuilder {
  protoTile: <T extends Polygon>(p: PrototileBuilder<T>) => this;

  build: () => Rule;
}

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
  // the min.levels about t that covers all of t's leaves.
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
  _substitution:
    | ((p: T, ...consumers: ((p: Polygon) => Tile)[]) => void)
    | undefined;
  _parent: ((c: T, ...consumers: ((p: Polygon) => Tile)[]) => void) | undefined;
  _tile: ((l: V, p: V) => T) | undefined;
  name: string;
  rotationalSymmetryOrder: number;
  reflectionSymmetry: boolean;
  volumeHierarchic: boolean;
  coveringGenerations?: number;
  intersectingGenerations?: number;

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

  substitution(f: (p: T, ...consumers: ((p: Polygon) => Tile)[]) => void) {
    this._substitution = f;
    return this;
  }

  parent(f: (c: T, ...consumers: ((p: Polygon) => Tile)[]) => void) {
    this._parent = f;
    return this;
  }

  tile(f: (l: V, p: V) => T) {
    this._tile = f;
    return this;
  }

  _getChildrenTiles(p: Polygon, creators: ((p: Polygon) => Tile)[]): Tile[] {
    const children: Tile[] = [];
    const consumers = creators.map((f) => (p: Polygon) => {
      const child = f(p);
      children.push(child);
      return child;
    });
    if (this._substitution === undefined)
      throw new Error("Prototile missing children method.");
    this._substitution(p as T, ...consumers);
    return children;
  }

  _getParentTile(p: T, creators: ((p: Polygon) => Tile)[]): Tile {
    let parent: Tile | undefined = undefined;
    const consumers = creators.map((f) => (p: Polygon) => {
      parent = f(p);
      return parent;
    });
    if (this._parent === undefined)
      throw new Error("Prototile missing parent method.");
    this._parent(p, ...consumers);
    if (parent === undefined)
      throw new Error("Prototile parent method failed to create parent.");
    return parent;
  }

  build(creators: ((p: Polygon) => Tile)[]): Prototile {
    if (this._parent === undefined) {
      return oneWayPrototile(
        (p: Polygon) => this._getChildrenTiles(p, creators),
        this.rotationalSymmetryOrder,
        this.reflectionSymmetry,
        this.name
      );
    }
    if (this.volumeHierarchic) {
      return Prototile(
        (p: Polygon) => this._getParentTile(p as T, creators),
        (p: Polygon) => this._getChildrenTiles(p, creators),
        this.rotationalSymmetryOrder,
        this.reflectionSymmetry,
        this.name
      );
    } else {
      return nonVolumeHierarchical(
        Prototile(
          (p: Polygon) => this._getParentTile(p as T, creators),
          (p: Polygon) => this._getChildrenTiles(p, creators),
          this.rotationalSymmetryOrder,
          this.reflectionSymmetry,
          this.name
        ),
        this.coveringGenerations || 2,
        this.intersectingGenerations || 2
      );
    }
  }
}

class _RuleBuilder implements RuleBuilder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protos: _PrototileBuilder<any>[];
  colors?: { hueSpan?: number; hueOffset?: number };

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

    const tileIndex = this.protos
      .map((proto, i) => (proto._tile != undefined ? i : -1))
      .filter((i) => i >= 0)[0];

    if (tileIndex === undefined)
      throw new Error("No Prototile has a seed tile method.");

    const tile = (u: V, v: V) =>
      creators[tileIndex](
        (this.protos[tileIndex]._tile as (u: V, v: V) => Polygon)(u, v)
      );

    builtProtos = this.protos.map((proto) => proto.build(creators));

    return Rule(tile, builtProtos, this.colors);
  }
}
