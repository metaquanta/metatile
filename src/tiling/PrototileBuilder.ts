import { Polygon, chirality } from "../classes/Polygon";
import { Tile, Prototile, oneWayPrototile, reflect } from "../classes/Tile";
import { Rule } from "../classes/Rule";
import { V } from "../classes/V";

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

export function PrototileBuilder<T extends Polygon>(params: {
  name: string;
  rotationalSymmetryOrder: number;
  reflectionSymmetry: boolean;
}): PrototileBuilder<T> {
  return new _PrototileBuilder<T>(params);
}

export function RuleBuilder(): RuleBuilder {
  return new _RuleBuilder();
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

  constructor(params: {
    name: string;
    rotationalSymmetryOrder: number;
    reflectionSymmetry: boolean;
  }) {
    this.name = params.name;
    this.rotationalSymmetryOrder = params.rotationalSymmetryOrder;
    this.reflectionSymmetry = params.reflectionSymmetry;
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
    let children: Tile[] = [];
    const consumers = creators.map((f) => (p: Polygon) => {
      const child = f(p);
      children.push(child);
      return child;
    });
    if (this._substitution === undefined)
      throw new Error("Prototile missing children method.");
    this._substitution(p as T, ...consumers);
    return children.map((c) => (chirality(c.polygon()) ? reflect(c) : c));
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
    return Prototile(
      (p: Polygon) => this._getParentTile(p as T, creators),
      (p: Polygon) => this._getChildrenTiles(p, creators),
      this.rotationalSymmetryOrder,
      this.reflectionSymmetry,
      this.name
    );
  }
}

class _RuleBuilder implements RuleBuilder {
  protos: _PrototileBuilder<any>[];

  constructor() {
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

    return Rule(tile, builtProtos);
  }
}
