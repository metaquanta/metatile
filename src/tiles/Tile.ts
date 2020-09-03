import { chirality, Polygon } from "../lib/math/2d/Polygon";
import { Prototile } from "./Prototile";

export interface Tile {
  readonly proto: Prototile;
  readonly parent: () => Tile;
  readonly children: () => Tile[];
  readonly intersects: (p: Readonly<Polygon>, depth?: number) => boolean;
  readonly contains: (p: Readonly<Polygon>, depth?: number) => boolean;
  readonly polygon: () => Polygon;
  readonly equals: (t: this) => boolean;
  readonly reflected: () => boolean;
}

export function Tile(
  polygon: Readonly<Polygon>,
  proto: Prototile,
  volumeHierarchic: boolean,
  intersectingGenerations?: number
): Tile {
  if (volumeHierarchic) return new _Tile(polygon, proto);
  else return new _NvhTile(polygon, proto, intersectingGenerations ?? 4);
}

class _Tile implements Tile {
  readonly #polygon: Polygon;

  constructor(p: Readonly<Polygon>, readonly proto: Prototile) {
    this.#polygon = p;
  }

  parent() {
    if (this.proto.parent !== undefined) return this.proto.parent(this);
    console.trace("!!!Unreachable reached!!!");
    throw new Error(`tile.parent() not supported on ${this}`);
  }

  reflected() {
    return !this.proto.reflectionSymmetry && chirality(this.polygon());
  }

  children() {
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
    //TODO/fixme - assuming p is always the same/only viewport.
    if (!hasElement(this.#intersectsMemo, depth)) {
      this.#intersectsMemo[depth] = this._intersects(p, depth);
    }
    return this.#intersectsMemo[depth];
  }
}

function hasElement<T>(arr: T[], i: number): boolean {
  return arr[i] !== undefined;
}
