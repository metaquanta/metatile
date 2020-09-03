import { ViewPort } from "./lib/browser/ViewPort";
import { Rect } from "./lib/math/2d/Polygon";
import { getTagParameters } from "./params";
import { RotationColorer, SolidRgbColorer } from "./renderer/Colorer.js";
import { RendererBuilder } from "./renderer/Renderer";

function getRenderer(root: ShadowRoot): [HTMLCanvasElement, ViewPort] {
  root.innerHTML = `<style>
      :host {
        display: block;
        contain: content;
      }
      :host, div {
        margin: 0;
      }
      :host, #canvas_vp, canvas {
        width: 100%;
        height: 100%;
      }
      #canvas_vp > div {
        position: fixed;
      }
    </style>`;
  const outerDiv = document.createElement("div");
  outerDiv.id = "canvas_vp";
  const innerDiv = document.createElement("div");
  const canvas = document.createElement("canvas");
  innerDiv.appendChild(canvas);
  outerDiv.appendChild(innerDiv);
  root.appendChild(outerDiv);
  const vp = ViewPort(outerDiv);
  return [canvas, vp];
}

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
  comp.render();
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
  "pinwheelQ"
];

class TilingElement extends HTMLElement {
  viewPort: ViewPort | undefined = undefined;
  canvas: HTMLCanvasElement | undefined = undefined;

  static get observedAttributes(): string[] {
    return observedAttributes;
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

  attributeChangedCallback(name: string): void {
    if (observedAttributes.indexOf(name) >= 0) {
      this.render();
    }
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: "open" });
    [this.canvas, this.viewPort] = getRenderer(shadowRoot);
    this.render();
  }

  render(): void {
    if (this.canvas === undefined) return;

    const params = getTagParameters(this);

    const rule = params.getRule();

    const tile = rule.tileFromEdge(params.getV(), params.getU());

    const colorOptions = params.getColorOptions();

    RendererBuilder()
      .canvas(this.canvas)
      .viewport(this.viewPort as Rect)
      .fillColorer(
        RotationColorer({
          ...colorOptions,
          protos: rule.protos
        })
      )
      .strokeColorer(SolidRgbColorer(0, 0, 0, colorOptions.strokeAlpha ?? 1))
      .tiles(rule.tiling(tile, params.getTilingOptions()).cover)
      .build()
      .render();
  }
}

customElements.define("mq-tiling", TilingElement);

export default TilingElement;
