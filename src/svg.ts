import { getUrlParameters } from "./params";
import { RotationColorer, SolidRgbColorer } from "./renderer/Colorer";
import { RendererBuilder } from "./renderer/Renderer";

const params = getUrlParameters();

const svg = <SVGSVGElement>document.getElementsByTagName("svg")[0];

const rule = params.getRule();

const tile = rule.tileFromEdge(params.getV(), params.getU());

const colorOptions = params.getColorOptions();

RendererBuilder()
  .svg(svg)
  .fillColorer(
    RotationColorer({
      ...colorOptions,
      protos: rule.protos
    })
  )
  .strokeColorer(SolidRgbColorer(0, 0, 0, colorOptions.strokeAlpha ?? 1))
  .tiles(rule.tiling(tile, params.getTilingOptions()).cover)
  .build("svg")
  .render();
