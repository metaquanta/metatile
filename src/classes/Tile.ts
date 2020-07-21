import { ViewPort } from "./ViewPort";
import { Polygon } from "./Polygon";
import { Vec2 } from "./Vec2";

export type Tile = {
  polygon: Polygon;
  children: () => Tile[];
  getPath: () => Path2D;
  contains: (p: Vec2) => boolean;
  intersectsViewport: (vp: ViewPort) => boolean;
  variant?: number;
};

export const tileIntersectsViewport = (tile: Tile, viewport: ViewPort) =>
  tile.polygon
    .translate(Vec2(viewport.x0, viewport.y0).invert())
    .intersectsRect(Vec2(viewport.xf - viewport.x0, viewport.yf - viewport.y0));

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
  intersectsViewport(rect) {
    return tileIntersectsViewport(this, rect);
  },
  variant,
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
  intersectsViewport(rect) {
    return tileIntersectsViewport(this, rect);
  },
  variant,
});
