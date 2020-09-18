import { Polygon } from "./lib/math/2d/Polygon";
import { getUrlParameters } from "./params";
import { RotationColorer } from "./renderer/Colorer";
import { RendererBuilder } from "./renderer/Renderer";

const params = getUrlParameters();

const svg = document.getElementsByTagName("svg").item(0);

const rule = params.getRule();

const tile = rule.tileFromEdge(params.getV(), params.getU());

const colorOptions = params.getColorOptions();

if (svg) {
  RendererBuilder()
    .svg(svg)
    .fillColorer(
      RotationColorer({
        ...colorOptions,
        protos: rule.protos
      })
    )
    .stroke(colorOptions.strokeAlpha ?? 1)
    .tiles((mask: Polygon) =>
      rule.tiling(tile, params.getTilingOptions()).cover(mask)
    )
    .build("svg")
    .render();
}
