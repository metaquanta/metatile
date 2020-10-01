import Polygon from "../lib/math/2d/Polygon";
import Prototile from "./Prototile";

export interface Tile {
  readonly proto: Prototile;
  parent(): Tile;
  children(): Tile[];
  intersects(p: Readonly<Polygon>): boolean;
  contains(p: Readonly<Polygon>): boolean;
  polygon(): Polygon;
  equals(t: this): boolean;
  reflected(): boolean;
}

export namespace Tile {
  export function create(
    polygon: Readonly<Polygon>,
    proto: Prototile,
    volumeHierarchic: boolean
  ): Tile {
    if (volumeHierarchic) return new _Tile(polygon, proto);
    else return new _NvhTile(polygon, proto);
  }
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
    return !this.proto.reflectionSymmetry && Polygon.chirality(this.polygon());
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
  intersects(p: Polygon): boolean {
    const bt = this.polygon().scale(4);
    return bt
      .translate(this.polygon().centroid().subtract(bt.centroid()))
      .intersects(p);
  }
}

export default Tile;
