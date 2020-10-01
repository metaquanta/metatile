import { Polygon } from "../lib/math/2d/Polygon";
import { V } from "../lib/math/2d/V";
import Tile from "./Tile";

export interface Prototile {
  readonly rotationalSymmetryOrder: number;
  readonly reflectionSymmetry: boolean;
  readonly coveringGenerations?: number; // See N.V.H. below
  readonly name?: string;
  readonly parent?: (t: Tile) => Tile;
  children(t: Tile): Tile[];
  readonly tile?: (i: V, j: V, p: V) => Tile;
  create(polygon: Polygon, parent?: Tile): Tile;
  toString(): string;
}

export namespace Prototile {
  export interface Builder<T extends Polygon> {
    substitution(
      f: (p: T, ...consumers: ((p: Polygon) => Tile)[]) => void
    ): this;
    parent(f: (c: T, ...consumers: ((p: Polygon) => Tile)[]) => void): this;
    tile(f: (i: V, j: V, p: V) => T): this;
    build(creators: ((p: Polygon) => Tile)[]): Prototile;
  }

  export type Substitution<T extends Polygon> = (
    c: T,
    ...consumers: ((p: Polygon) => Tile)[]
  ) => void;

  export function builder<T extends Polygon>(params: {
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
  }): Builder<T> {
    return new Builder<T>({ ...defaultOptions, ...params });
  }
}

const defaultOptions = {
  name: "tile",
  rotationalSymmetryOrder: 1,
  reflectionSymmetry: false,
  volumeHierarchic: true
};

class Builder<T extends Polygon> implements Prototile.Builder<T> {
  #substitution: Prototile.Substitution<T> | undefined;
  #parent: Prototile.Substitution<T> | undefined;
  #tile: ((i: V, j: V, p: V) => T) | undefined;
  readonly name: string;
  readonly rotationalSymmetryOrder: number;
  readonly reflectionSymmetry: boolean;
  readonly volumeHierarchic: boolean;
  readonly coveringGenerations?: number;

  constructor(params: {
    name: string;
    rotationalSymmetryOrder: number;
    reflectionSymmetry: boolean;
    volumeHierarchic: boolean;
    coveringGenerations?: number;
  }) {
    this.name = params.name;
    this.rotationalSymmetryOrder = params.rotationalSymmetryOrder;
    this.reflectionSymmetry = params.reflectionSymmetry;
    this.volumeHierarchic = params.volumeHierarchic;
    this.coveringGenerations = params.coveringGenerations;
  }

  substitution(f: Prototile.Substitution<T>) {
    this.#substitution = f;
    return this;
  }

  parent(f: Prototile.Substitution<T>) {
    this.#parent = f;
    return this;
  }

  tile(f: (i: V, j: V, p: V) => T) {
    this.#tile = f;
    return this;
  }

  build(creators: ((p: Polygon) => Tile)[]): Prototile {
    if (this.#substitution === undefined)
      throw new Error(`Prototiles must have a substitution!!`);
    const proto = {
      rotationalSymmetryOrder: this.rotationalSymmetryOrder,
      reflectionSymmetry: this.reflectionSymmetry,
      coveringGenerations: this.coveringGenerations,
      name: this.name,
      tile:
        this.#tile !== undefined
          ? (i: V, j: V, p: V) => {
              return proto.create(
                (this.#tile as (i: V, j: V, p: V) => Polygon)(i, j, p)
              );
            }
          : undefined,
      parent: (t: Tile) => {
        if (this.#parent !== undefined)
          return parentTile(this.#parent, t.polygon() as T, creators);
        throw new Error(`Prototile.parent() - unsupported by ${proto}!!`);
      },
      children: (t: Tile) => {
        return childTiles(
          this.#substitution as Prototile.Substitution<T>,
          t.polygon(),
          creators
        );
      },
      create: (p: Polygon) => {
        return Tile.create(p, proto, this.volumeHierarchic);
      },
      toString() {
        return `Prototile(□,□,${this.rotationalSymmetryOrder},${this.reflectionSymmetry},${this.name})`;
      }
    };
    return proto;
  }
}

function childTiles<T extends Polygon>(
  substitution: Prototile.Substitution<T>,
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
  substitution: Prototile.Substitution<T>,
  p: T,
  creators: ((p: Polygon) => Tile)[]
): Tile {
  let parent: Tile | undefined;
  const consumers = creators.map((f) => (p: Polygon) => {
    parent = f(p);
    return parent;
  });
  substitution(p, ...consumers);
  if (parent === undefined)
    throw new Error("Prototile parent method failed to create parent.");
  return parent;
}

export default Prototile;
