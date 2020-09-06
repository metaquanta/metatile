import { getUrlParameters } from "./params";
import { RotationColorer, StaticColorer } from "./renderer/Colorer";
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
    .strokeColorer(StaticColorer(0, 0, 0, colorOptions.strokeAlpha ?? 1))
    .tiles(rule.tiling(tile, params.getTilingOptions()).cover)
    .build()
    .render();
}
