import FixedCanvasElement from "./lib/browser/FixedCanvasElement";
import { rectFrom } from "./lib/math/2d/Polygon";
import { getTagParameters } from "./params";
import { RotationColorer, SolidRgbColorer } from "./renderer/Colorer.js";
import { Renderer, RendererBuilder } from "./renderer/Renderer";

function _attribute(
  comp: TilingElement,
  attribute: string,
  value: string
): void {
  if (value !== "") {
    comp.setAttribute(attribute, value);
  } else {
    comp.removeAttribute(attribute);
  }
}

const observedAttributes = [
  "rule",
  "v",
  "u",
  "colorSaturation",
  "colorLightness",
  "colorHueSpan",
  "colorHueOffset",
  "colorAlpha",
  "colorStrokeAlpha",
  "tilingIncludeAncestors",
  "pinwheelP",
  "pinwheelQ",
  "renderer"
];

class TilingElement extends FixedCanvasElement {
  readonly #rendererBuilder: RendererBuilder = RendererBuilder();
  #renderer: Renderer | undefined = undefined;

  static get observedAttributes(): string[] {
    return observedAttributes;
  }

  set renderer(renderer: string) {
    _attribute(this, "renderer", renderer);
  }

  set rule(rule: string) {
    _attribute(this, "rule", rule);
  }
  set v(v: string) {
    _attribute(this, "v", v);
  }
  set u(u: string) {
    _attribute(this, "u", u);
  }
  set colorSaturation(saturation: string) {
    _attribute(this, "colorSaturation", saturation);
  }
  set colorLightness(lightness: string) {
    _attribute(this, "colorLightness", lightness);
  }
  set colorHueSpan(hueSpan: string) {
    _attribute(this, "colorHueSpan", hueSpan);
  }
  set colorHueOffset(hueOffset: string) {
    _attribute(this, "colorHueOffset", hueOffset);
  }
  set colorAlpha(alpha: string) {
    _attribute(this, "colorAlpha", alpha);
  }
  set colorStrokeAlpha(alpha: string) {
    _attribute(this, "colorStrokeAlpha", alpha);
  }
  set tilingIncludeAncestors(tilingIncludeAncestors: string) {
    _attribute(this, "tilingIncludeAncestors", tilingIncludeAncestors);
  }
  set pinwheelP(p: string) {
    _attribute(this, "pinwheelP", p);
  }
  set pinwheelQ(q: string) {
    _attribute(this, "pinwheelQ", q);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.render();
  }

  render(): void {
    const params = getTagParameters(this);

    const rule = params.getRule();

    const colorOptions = params.getColorOptions();

    if (this.#renderer === undefined) {
      this.#renderer = this.#rendererBuilder
        .canvas(this.getContext("2d") as CanvasRenderingContext2D)
        .viewport(rectFrom(this.canvasViewPort))
        .fillColorer(
          RotationColorer({
            ...colorOptions,
            protos: rule.protos
          })
        )
        .strokeColorer(SolidRgbColorer(0, 0, 0, colorOptions.strokeAlpha ?? 1))
        .tiles(
          rule.tiling(
            rule.tileFromEdge(params.getV(), params.getU()),
            params.getTilingOptions()
          ).cover
        )
        .build(params.getRenderer());

      this.#renderer.render();
    }
  }
}

customElements.define("mq-tiling", TilingElement);

export default TilingElement;
