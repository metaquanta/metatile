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
    // NVH implies t doesn't cover t's descendents, intersectingGenerations is
    // the min.levels above t that covers all of t's leaves.
    // If t intersects the viewport, t', t'', ...t^n are assumed to also.
    intersectingGenerations?: number;
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
    const params = {
      children: (p: Polygon) =>
        childTiles(
          this.#substitution as Prototile.Substitution<T>,
          p,
          creators
        ),
      parent:
        this.#parent === undefined
          ? undefined
          : (p: Polygon) =>
              parentTile(
                this.#parent as Prototile.Substitution<T>,
                p as T,
                creators
              ),
      tile: this.#tile,
      rotationalSymmetryOrder: this.rotationalSymmetryOrder,
      reflectionSymmetry: this.reflectionSymmetry,
      name: this.name,
      volumeHierarchic: this.volumeHierarchic,
      coveringGenerations: this.coveringGenerations,
      intersectingGenerations: this.intersectingGenerations
    };
    return {
      rotationalSymmetryOrder: params.rotationalSymmetryOrder,
      reflectionSymmetry: params.reflectionSymmetry,
      name: params.name,
      tile(i, j, p) {
        return this.create(
          (params.tile as (i: V, j: V, p: V) => Polygon)(i, j, p)
        );
      },
      parent(t) {
        if (params.parent) return params.parent(t.polygon() as T);
        throw new Error(`Prototile.parent() - unsupported by ${this}!!`);
      },
      children(t) {
        return params.children(t.polygon() as T);
      },
      create(p): Tile {
        return Tile.create(
          p,
          this,
          params.volumeHierarchic,
          params.intersectingGenerations
        );
      },
      toString() {
        return `Prototile(□,□,${this.rotationalSymmetryOrder},${this.reflectionSymmetry},${this.name})`;
      }
    };
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
