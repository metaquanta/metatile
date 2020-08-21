import { M } from "./M.js";
import { Polygon } from "./Polygon.js";
import { V } from "./V.js";

export interface AffineTransform {
  // ...Transform or Transformation?
  translation: V;
  linearTransform: M;
  transform(p: Polygon): Polygon;
}

export function AffineTransform(
  linearTransform: M,
  translation: V
): AffineTransform {
  return {
    linearTransform,
    translation,
    transform: (p: Polygon) =>
      Polygon(
        p.vertices().map((v) => linearTransform.multiply(v).add(translation))
      )
  };
}
