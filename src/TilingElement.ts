import FixedCanvasElement from "./lib/browser/FixedCanvasElement";
import Polygon from "./lib/math/2d/Polygon";
import { getTagParameters } from "./params";
import Colorer from "./renderer/Colorer.js";
import Renderer from "./renderer/Renderer";

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
  readonly #rendererBuilder: Renderer.Builder = Renderer.builder();
  #renderedCanvas:
    | Promise<HTMLCanvasElement | SVGSVGElement>
    | undefined = undefined;
  constructor() {
    super();
    console.debug(
      `TilingElement ⭬ created! [${this.isConnected}, ${this.parentElement}]`
    );
  }

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
    console.debug(`P: ${p} [pinwheel]`);
    _attribute(this, "pinwheelP", p);
  }
  set pinwheelQ(q: string) {
    console.debug(`Q: ${q} [pinwheel]`);
    _attribute(this, "pinwheelQ", q);
  }

  adoptedCallback(): void {
    console.debug(
      `TilingElement ⭬ adopted! [${this.isConnected}, ${this.parentElement}]`
    );
    super.adoptedCallback();
  }

  attributeChangedCallback(): void {
    console.debug("TilingElement ⭬ changed!");
    super.attributeChangedCallback();
  }

  connectedCallback(): void {
    console.debug(
      `TilingElement ⭬ connected! [${this.isConnected}, ${this.parentElement}]`
    );
    super.connectedCallback();
    this.render();
  }

  async toRenderedDataURL(): Promise<string> {
    const c = await (this.#renderedCanvas as Promise<HTMLCanvasElement>);
    return c.toDataURL();
  }

  render(): void {
    if (!this.isConnected) return;
    const params = getTagParameters(this);

    const rule = params.getRule();

    const colorOptions = params.getColorOptions();

    if (this.#renderedCanvas === undefined) {
      this.#renderedCanvas = this.#rendererBuilder
        .canvas(this)
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
        .build(params.getRenderer())
        .render();
    }
  }
}

customElements.define("mq-tiling", TilingElement);

export default TilingElement;
