import { M } from "./M";
import { Polygon } from "./Polygon";
import { V } from "./V";

export interface AffineTransform {
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
