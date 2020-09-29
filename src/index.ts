import Polygon, { Rect } from "./lib/math/2d/Polygon";
import { getUrlParameters, setRandomParameters } from "./params";
import TilingElement from "./TilingElement";
import Colorer from "./renderer/Colorer";
import Renderer from "./renderer/Renderer";
import V from "./lib/math/2d/V";

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

const size = V.create(1618, 1000);
const origin = Rect.from(tag.viewPort)
  .centroid()
  .subtract(size.scale(1 / 2));
const svg = document.createElementNS(svgNs, "svg");
svg.setAttributeNS(
  null,
  "viewBox",
  `${origin.x} ${origin.y} ${size.x} ${size.y}`
);
svg.setAttributeNS(null, "width", `${size.x}`);
svg.setAttributeNS(null, "height", `${size.y}`);
svg.setAttributeNS(null, "version", "1.1");
svg.setAttribute("xmlns", svgNs);

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
        new Blob([`<?xml version="1.0" encoding="utf-8"?>`, svg.outerHTML], {
          type: "image/svg+xml"
        })
      )
    )
    .then((svg) => {
      const anchor = document.createElement("a");
      anchor.href = svg;
      anchor.setAttribute("download", filename("svg"));
      anchor.click();
    });
}

async function downloadPng() {
  const anchor = document.createElement("a");
  anchor.href = await tag.toRenderedDataURL();
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
