import { V } from "./lib/math/2d/V";
import { ViewPort } from "./lib/browser/ViewPort";
import {
  RotationColorer,
  RotationColorerOptions,
  SolidRgbColorer
} from "./renderer/Colorer";
import { Renderer } from "./renderer/Renderer";
import { Rule } from "./tiles/Rule";
import rules, { RuleOptions } from "./rules/rules";
import { TilingOptions } from "./tiles/Tiling";
import { PinwheelPQ } from "./rules/pinwheel";

function getRenderer(root: ShadowRoot): Renderer {
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
  return Renderer(canvas, vp);
}

function ruleForString(name: string | null): Rule {
  if (name && name in rules) return rules[name as keyof typeof rules];
  console.debug(
    `TilingComponent:ruleForString() - "${name}" not found. Using default.`
  );
  return rules["Penrose-Rhomb"];
}

function parseVector(vs: string | undefined | null, def: V): V {
  //console.debug(`TilingComponent:parseVector(${vs}, ${def})`);
  if (vs === undefined || vs === null) return def;
  const components = vs.split(",").map((s) => Number.parseFloat(s));
  if (components.length === 2) {
    return V(components[0], components[1]);
  }
  console.debug(
    `TilingComponent:parseVectorString(${vs}) failed. Using default.`
  );
  return def;
}

function parseFloat(f: string | null | undefined): number | undefined {
  if (f === undefined || f === null) return undefined;
  const n = Number.parseFloat(f);
  if (isNaN(n)) return undefined;
  return n;
}

function parseBool(b: string | null | undefined): boolean | undefined {
  const truthStrings = ["true", "True", "yes", "Yes", "y", "Y", "1"];
  const falseStrings = ["false", "False", "no", "No", "n", "N", "0"];
  if (b === undefined || b === null) return undefined;
  if (truthStrings.indexOf(b) >= 0) return true;
  if (falseStrings.indexOf(b) >= 0) return false;
  return undefined;
}

function _attribute(comp: Tiling, attribute: string, value: string): void {
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

class Tiling extends HTMLElement {
  viewPort: ViewPort | undefined = undefined;
  renderer: Renderer | undefined = undefined;

  constructor() {
    super();
  }

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

  colorOptions(): RotationColorerOptions & { strokeAlpha?: number } {
    const p = {
      saturation: parseFloat(this.getAttribute("colorSaturation")),
      lightness: parseFloat(this.getAttribute("colorLightness")),
      hueSpan: parseFloat(this.getAttribute("colorHueSpan")),
      hueOffset: parseFloat(this.getAttribute("colorHueOffset")),
      alpha: parseFloat(this.getAttribute("colorAlpha")),
      strokeAlpha: parseFloat(this.getAttribute("colorStrokeAlpha"))
    };
    console.debug(`colorParameters(): `, p);
    return p;
  }

  tilingOptions(): TilingOptions {
    return {
      includeAncestors: parseBool(this.getAttribute("tilingIncludeAncestors"))
    };
  }

  ruleOptions(): RuleOptions | undefined {
    if (this.getAttribute("pinwheelP") && this.getAttribute("pinwheelQ")) {
      return {
        pinwheel: {
          p: parseInt(this.getAttribute("pinwheelP") as string),
          q: parseInt(this.getAttribute("pinwheelQ") as string)
        }
      };
    }
    return undefined;
  }

  attributeChangedCallback(name: string): void {
    if (observedAttributes.indexOf(name) >= 0) {
      this.render();
    }
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: "open" });
    this.renderer = getRenderer(shadowRoot);
    this.render();
  }

  render(): void {
    if (this.renderer === undefined) return;

    const rule =
      this.getAttribute("rule") === "Pinwheel" && this.ruleOptions()
        ? PinwheelPQ(
            this.ruleOptions()?.pinwheel?.p as number,
            this.ruleOptions()?.pinwheel?.q as number
          )
        : ruleForString(this.getAttribute("rule"));
    this.renderer.setFillColorer(
      RotationColorer({
        ...this.colorOptions(),
        protos: rule.protos
      })
    );
    this.renderer.setStrokeColorer(
      SolidRgbColorer(0, 0, 0, this.colorOptions().strokeAlpha || 1)
    );
    const tile = rule.tileFromEdge(
      parseVector(this.getAttribute("v"), V(11, 17)),
      parseVector(this.getAttribute("u"), V(1500, 1500))
    );

    this.renderer.setTileStream(rule.tiling(tile, {}).cover);
  }
}

customElements.define("mq-tiling", Tiling);

export default Tiling;
