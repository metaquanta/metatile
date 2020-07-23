import { Polygon } from "./Polygon";
import { Vec2 } from "./Vec2";

export type Tile = {
  polygon: Polygon;
  children: () => Tile[];
  getPath: () => Path2D;
  contains: (p: Vec2) => boolean;
  variant?: number;
};

export const Tile = (
  polygon: Polygon,
  children: () => Tile[],
  variant?: number
): Tile => ({
  polygon,
  children,
  getPath: () => polygon.getPath(),
  contains: (point) => {
    const b = polygon.contains(point);
    console.log(`${polygon}.contains(${point}) = ${b}`);
    return b;
  },
  variant
});

export type TileWithParent = Tile & {
  parent: () => TileWithParent;
  depth: number;
};

export const TileWithParent = (
  polygon: Polygon,
  children: () => Tile[],
  parent: () => TileWithParent,
  depth: number,
  variant?: number
): TileWithParent => ({
  polygon,
  children,
  parent,
  depth,
  getPath: () => polygon.getPath(),
  contains: (point) => polygon.contains(point),
  variant
});
