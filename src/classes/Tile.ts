import { Polygon, chirality } from "./Polygon";
import { V } from "./V";

export interface Prototile {
  readonly rotationalSymmetryOrder: number;
  readonly reflectionSymmetry: boolean;
  readonly coveringGenerations?: number; // See N.V.H. below
  readonly parent?: (t: Tile) => Tile;
  readonly children: (t: Tile) => Tile[];
  readonly tile?: (v: V, p: V) => Tile;
  readonly create: (polygon: Polygon, parent?: Tile) => Tile;
  readonly name?: string;
  readonly toString: () => string;
}

export interface Tile {
  readonly proto: Prototile;
  readonly parent: () => Tile;
  readonly children: () => Tile[];
  readonly intersects: (p: Polygon, depth?: number) => boolean;
  readonly contains: (p: Polygon, depth?: number) => boolean;
  readonly polygon: () => Polygon;
  readonly equals: (t: this) => boolean;
  readonly reflected: () => boolean;
}

export type PrototileParameters<P extends Polygon> = {
  parent?: (t: P) => Tile;
  children: (t: P) => Tile[];
  tile?: (v: V, p: V) => Polygon;
  rotationalSymmetryOrder: number;
  reflectionSymmetry: boolean;
  name: string;
  volumeHierarchic: boolean;
  // Non-volume-hierarchical. A.K.A. N.V.H.
  // NVH implies t's descendents don't cover t, coveringGenerations is the min.
  // levels above t with leaves that cover t.
  // Once a covering tile is found, apply .parent() this many more times.
  coveringGenerations?: number;
  // NVH implies t doesn't cover t's descendents, intersectingGenerations is
  // the min.levels about t that covers all of t's leaves.
  // If t intersects the viewport, t', t'', ...t^n are assumed to also.
  intersectingGenerations?: number;
};

export function Prototile<P extends Polygon>(
  params: PrototileParameters<P>
): Prototile {
  const proto: Prototile = {
    rotationalSymmetryOrder: params.rotationalSymmetryOrder,
    reflectionSymmetry: params.reflectionSymmetry,
    name: params.name,
    parent(t) {
      if (params.parent) return params.parent(t.polygon() as P);
      throw new Error(`Prototile.parent() - unsupported by ${this}!!`);
    },
    children(t) {
      return params.children(t.polygon() as P);
    },
    create(p): Tile {
      if (params.volumeHierarchic) return new _Tile(p, this);
      else return new _NvhTile(p, this, params.intersectingGenerations || 4);
    },
    toString() {
      return `Prototile(□,□,${this.rotationalSymmetryOrder},${this.reflectionSymmetry},${this.name})`;
    }
  };

  if (params.tile === undefined) return proto;
  return {
    ...proto,
    tile(u, v) {
      return this.create((params.tile as (v: V, p: V) => Polygon)(u, v));
    }
  };
}

class _Tile implements Tile {
  readonly #polygon: Polygon;

  readonly proto: Prototile;

  constructor(p: Polygon, proto: Prototile) {
    this.#polygon = p;
    this.proto = proto;
  }

  parent(): Tile {
    if (this.proto.parent !== undefined) return this.proto.parent(this);
    console.trace("!!!Unreachable reached!!!");
    throw new Error(`tile.parent() not supported on ${this}`);
  }

  reflected(): boolean {
    return !this.proto.reflectionSymmetry && chirality(this.polygon());
  }

  children(): Tile[] {
    return this.proto.children(this);
  }

  polygon() {
    return this.#polygon;
  }

  intersects(p: Polygon) {
    return this.#polygon.intersects(p);
  }

  contains(p: Polygon) {
    return this.#polygon.contains(p);
  }

  equals(t: Tile) {
    return t.proto === this.proto && this.#polygon.equals(t.polygon());
  }

  toString() {
    return `Tile(${this.#polygon}) [${this.proto}]`;
  }
}

class _NvhTile extends _Tile {
  readonly #intersectingGenerations: number;
  readonly #intersectsMemo: boolean[];
  readonly #parent?: Tile;

  constructor(p: Polygon, proto: Prototile, intersectingGenerations: number) {
    super(p, proto);
    this.#intersectingGenerations = intersectingGenerations;
    this.#intersectsMemo = [];
  }

  _intersects(p: Polygon, depth: number): boolean {
    if (depth === 0) return super.intersects(p);
    if (this.#parent === undefined) return true;
    return super.intersects(p) || this.#parent.intersects(p, depth - 1);
  }

  intersects(p: Polygon, depth?: number): boolean {
    if (depth === undefined)
      return this.intersects(p, this.#intersectingGenerations);
    //TODO/fixme - assume p is always the one viewport.
    if (this.#intersectsMemo[depth] === undefined) {
      this.#intersectsMemo[depth] = this._intersects(p, depth);
    }
    return this.#intersectsMemo[depth];
  }
}
