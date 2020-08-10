import { V } from "./classes/V";
import { ViewPort } from "./classes/ViewPort";
import { colorRotation, ColorRotationParameters } from "./renderer/Colorer";
import { Renderer } from "./renderer/Renderer";
import { Rule } from "./classes/Rule";
import rules from "./tiling/rules";
import { TilingOptions } from "./classes/Tiling";

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
  "tilingIncludeAncestors"
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
  set colorSaturation(colorSaturation: string) {
    _attribute(this, "colorSaturation", colorSaturation);
  }
  set colorLightness(colorLightness: string) {
    _attribute(this, "colorLightness", colorLightness);
  }
  set colorHueSpan(colorHueSpan: string) {
    _attribute(this, "colorHueSpan", colorHueSpan);
  }
  set colorHueOffset(colorHueOffset: string) {
    _attribute(this, "colorHueOffset", colorHueOffset);
  }
  set colorAlpha(colorAlpha: string) {
    _attribute(this, "colorAlpha", colorAlpha);
  }
  set tilingIncludeAncestors(tilingIncludeAncestors: string) {
    _attribute(this, "tilingIncludeAncestors", tilingIncludeAncestors);
  }

  colorParameters(): ColorRotationParameters {
    const p = {
      saturation: parseFloat(this.getAttribute("colorSaturation")),
      lightness: parseFloat(this.getAttribute("colorLightness")),
      hueSpan: parseFloat(this.getAttribute("colorHueSpan")),
      hueOffset: parseFloat(this.getAttribute("colorHueOffset")),
      alpha: parseFloat(this.getAttribute("colorAlpha"))
    };
    //console.debug(`colorParameters(): ${p} [${this.colorSaturation}]`);
    return p;
  }

  tilingOptions(): TilingOptions {
    return {
      includeAncestors: parseBool(this.getAttribute("tilingIncludeAncestors"))
    };
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

    const rule = ruleForString(this.getAttribute("rule"));
    this.renderer.setFillColorer(
      colorRotation({
        ...this.colorParameters(),
        protos: rule.protos
      })
    );
    const tile = rule.tileFromEdge(
      parseVector(this.getAttribute("v"), V(11, 17)),
      parseVector(this.getAttribute("u"), V(1500, 1500))
    );
    this.renderer.setTileStream(rule.tiling(tile, this.tilingOptions()).cover);
  }
}

customElements.define("mq-tiling", Tiling);

export default Tiling;
