import { V } from "./classes/V";
import { ViewPort } from "./classes/ViewPort";
import { colorRotation, ColorRotationParameters } from "./renderer/Colorer";
import { Renderer } from "./renderer/Renderer";
import { Rule } from "./classes/Rule";
import rules from "./tiling/rules";

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
  return rules["Cubic-Pinwheel"];
}

function parseVectorString(vs: string | undefined | null, def: V): V {
  console.debug(`TilingComponent:parseVectorString(${vs}, ${def})`);
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

class Tiling extends HTMLElement {
  viewPort: ViewPort | undefined = undefined;
  renderer: Renderer | undefined = undefined;

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return [
      "rule",
      "v",
      "u",
      "colorSaturation",
      "colorLightness",
      "colorHueSpan",
      "colorHueOffset"
    ];
  }

  set rule(rule: string) {
    if (rule) {
      this.setAttribute("rule", rule);
    } else {
      this.removeAttribute("rule");
    }
    this.render();
  }

  set v(v: string) {
    if (v) {
      this.setAttribute("v", v);
    } else {
      this.removeAttribute("v");
    }
    this.render();
  }

  set u(u: string) {
    if (u) {
      this.setAttribute("u", u);
    } else {
      this.removeAttribute("u");
    }
    this.render();
  }

  set colorSaturation(colorSaturation: string) {
    if (colorSaturation) {
      this.setAttribute("colorSaturation", colorSaturation);
    } else {
      this.removeAttribute("colorSaturation");
    }
    this.render();
  }
  set colorLightness(colorLightness: string) {
    if (colorLightness) {
      this.setAttribute("colorLightness", colorLightness);
    } else {
      this.removeAttribute("colorLightness");
    }
    this.render();
  }
  set colorHueSpan(colorHueSpan: string) {
    if (colorHueSpan) {
      this.setAttribute("colorHueSpan", colorHueSpan);
    } else {
      this.removeAttribute("colorHueSpan");
    }
    this.render();
  }
  set colorHueOffset(colorHueOffset: string) {
    if (colorHueOffset) {
      this.setAttribute("colorHueOffset", colorHueOffset);
    } else {
      this.removeAttribute("colorHueOffset");
    }
    this.render();
  }

  colorParameters(): ColorRotationParameters {
    const parseFloat = (f: string | null | undefined) => {
      if (f === undefined || f === null) return undefined;
      const n = Number.parseFloat(f);
      if (isNaN(n)) return undefined;
      return n;
    };
    const p = {
      saturation: parseFloat(this.getAttribute("colorSaturation")),
      lightness: parseFloat(this.getAttribute("colorLightness")),
      hueSpan: parseFloat(this.getAttribute("colorHueSpan")),
      hueOffset: parseFloat(this.getAttribute("colorHueOffset"))
    };
    console.log(`colorParameters(): ${p} [${this.colorSaturation}]`);
    return p;
  }

  attributeChangedCallback(name: string): void {
    if (
      name === "u" ||
      name === "v" ||
      name === "colorSaturation" ||
      name === "colorLightness" ||
      name === "colorHueSpan" ||
      name === "colorHueOffset" ||
      name === "rule"
    ) {
      this.render();
    }
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: "open" });
    this.renderer = getRenderer(shadowRoot);
    this.render();
  }

  render(): void {
    console.debug(`TilingComponent.render()`);
    if (this.renderer === undefined) return;
    const tileSet = ruleForString(this.getAttribute("rule"));
    this.renderer.setFillColorer(
      colorRotation({
        ...this.colorParameters(),
        protos: tileSet.protos
      })
    );
    const tile = tileSet.tileFromEdge(
      parseVectorString(this.getAttribute("v"), V(11, 17)),
      parseVectorString(this.getAttribute("u"), V(1500, 1500))
    );
    this.renderer.setTileStream(tileSet.tiling(tile).cover);
  }
}

customElements.define("mq-tiling", Tiling);

export default Tiling;
