import { pathFromPolygon } from "../classes/Polygon";
import { Tile } from "../classes/Tile";

export default function draw(
  tile: Tile,
  context: CanvasRenderingContext2D
): void {
  const p = pathFromPolygon(tile);
  context.stroke(p);
  context.fill(p);
}
