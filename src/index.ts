import { getUrlParameters, setRandomParameters } from "./params";
import TilingElement from "./TilingComponent";

let params = getUrlParameters();
console.debug("params:", params);
if (
  params.colorSaturation === undefined ||
  params.colorLightness === undefined ||
  params.colorHueSpan === undefined ||
  params.colorHueOffset === undefined ||
  params.v === undefined ||
  params.u === undefined ||
  params.rule === undefined
) {
  setRandomParameters(params);
  params = getUrlParameters();
}

const tag = new TilingElement();
params.setAttributes(tag);

(<HTMLDivElement>document.getElementsByTagName("div")[0]).appendChild(tag);
