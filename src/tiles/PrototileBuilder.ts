import { Polygon } from "../lib/math/2d/Polygon";
import { V } from "../lib/math/2d/V";
import { Prototile } from "./Prototile";
import { Tile } from "./Tile";

export interface PrototileBuilder<T extends Polygon> {
  readonly substitution: (
    f: (p: T, ...consumers: ((p: Polygon) => Tile)[]) => void
  ) => this;
  readonly parent: (
    f: (c: T, ...consumers: ((p: Polygon) => Tile)[]) => void
  ) => this;
  readonly tile: (f: (l: V, p: V) => T) => this;
  readonly build: (creators: ((p: Polygon) => Tile)[]) => Prototile;
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
