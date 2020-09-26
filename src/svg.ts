import Polygon from "./lib/math/2d/Polygon";
import { getUrlParameters } from "./params";
import Colorer from "./renderer/Colorer";
import Renderer from "./renderer/Renderer";

const svgNs = "http://www.w3.org/2000/svg";

function filename() {
  const s = new URLSearchParams(window.location.search);
  const r = s.get("rule");
  if (r === "Pinwheel")
    return (
      `${r}_` +
      `T${s.get("pinwheelP") ?? 1}-${s.get("pinwheelQ") ?? 1}` +
      `_${Date.now()}.svg`
    );
  return `${r}_${Date.now()}.svg`;
}

const params = getUrlParameters();
const rule = params.getRule();
const colorOptions = params.getColorOptions();

const anchor = document.createElement("a");
anchor.setAttribute("download", filename());
//anchor.setAttribute("href", "");

const svg = document.createElementNS(svgNs, "svg");
svg.setAttributeNS(null, "viewBox", "0 0 1618 1000");
svg.setAttributeNS(null, "width", "1618");
svg.setAttributeNS(null, "height", "1000");

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
    URL.createObjectURL(new Blob([svg.outerHTML], { type: "image/svg+xml" }))
  )
  .then((svg) => {
    anchor.href = svg;
    anchor.click();
  });
