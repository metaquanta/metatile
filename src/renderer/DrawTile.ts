import { pathFromPolygon, Polygon } from "../classes/Polygon";

export default function draw(
  tile: Polygon,
  context: CanvasRenderingContext2D
): void {
  const p = pathFromPolygon(tile);
  context.stroke(p);
  context.fill(p);
}
