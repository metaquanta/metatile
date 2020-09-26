import Polygon from "./lib/math/2d/Polygon";
import { getUrlParameters, setRandomParameters } from "./params";
import TilingElement from "./TilingElement";
import Colorer from "./renderer/Colorer";
import Renderer from "./renderer/Renderer";

const svgNs = "http://www.w3.org/2000/svg";

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
document.getElementsByTagName("div")[0].appendChild(tag);

const rule = params.getRule();
const colorOptions = params.getColorOptions();

const svgButton = document.getElementsByClassName("svg")[0];
svgButton.addEventListener("click", () => downloadSvg());

const pngButton = document.getElementsByClassName("png")[0];
pngButton.addEventListener("click", () => downloadPng());

const svg = document.createElementNS(svgNs, "svg");
svg.setAttributeNS(null, "viewBox", "0 0 1618 1000");
svg.setAttributeNS(null, "width", "1618");
svg.setAttributeNS(null, "height", "1000");

function downloadSvg() {
  Renderer.builder()
    .svg(svg)
    .fillColorer(
      Colorer.rotation({
        ...colorOptions,
        protos: rule.protos
      })
    )
    .stroke(colorOptions.strokeAlpha ?? 1)
    .tiles((mask: Polygon) =>
      rule
        .tiling(
          rule.tileFromEdge(params.getV(), params.getU()),
          params.getTilingOptions()
        )
        .cover(mask)
    )
    .build("svg")
    .render()
    .then((svg) =>
      URL.createObjectURL(
        new Blob(
          [
            '<?xml version="1.0" encoding="utf-8" standalone="no"?>',
            svg.outerHTML
          ],
          { type: "image/svg+xml" }
        )
      )
    )
    .then((svg) => {
      const anchor = document.createElement("a");
      anchor.href = svg;
      anchor.setAttribute("download", filename("svg"));
      anchor.click();
    });
}

function downloadPng() {
  const anchor = document.createElement("a");
  anchor.href = tag.toDataURL();
  anchor.setAttribute("download", filename("png"));
  anchor.click();
}

function filename(ext: string) {
  const s = new URLSearchParams(window.location.search);
  const r = s.get("rule");
  if (r === "Pinwheel")
    return (
      `${r}_` +
      `T${s.get("pinwheelP") ?? 1}-${s.get("pinwheelQ") ?? 1}` +
      `_${Date.now()}.${ext}`
    );
  return `${r}_${Date.now()}.${ext}`;
}
