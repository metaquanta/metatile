import { TileSet } from "./classes/Tile";
import { V } from "./classes/V";
import { ViewPort } from "./classes/ViewPort";
import { colorRotation, ColorRotationParameters } from "./renderer/Colorer";
import { Renderer } from "./renderer/Renderer";
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

function ruleForString(name: string | null): TileSet {
  switch (name) {
    case "Ammann-Beenker":
      return rules["Ammann-Beenker"];
    case "Penrose-Rhomb":
      return rules["Penrose-Rhomb"];
    case "Fibonacci":
      return rules["Fibonacci"];
    case "Viper":
      return rules["Viper"];
    case "Pinwheel":
      return rules["Pinwheel"];
    case "Pinwheel10":
      return rules["Pinwheel10"];
    case "Pinwheel13":
      return rules["Pinwheel13"];
    case "Cubic-Pinwheel":
      return rules["Cubic-Pinwheel"];
  }
  console.debug(
    `TilingComponent:ruleForString() - "${name}" not found. Using default.`
  );
  return rules["Fibonacci"];
}

function parseVectorString(vs: string | undefined | null, def: V): V {
  console.debug(`TilingComponent:parseVectorString(${vs}, ${def})`);
  if (vs === undefined || vs === null) return def;
  const components = vs.split(",").map((s) => Number.parseFloat(s));
  if (components.length === 2) {
    return V(components[0], components[1]);
  }
  return def;
}

function parseColorString(color: string | null): ColorRotationParameters {
  if (color === null) return {};
  try {
    return JSON.parse(color);
  } catch {
    console.debug(
      `TilingComponent:parseColorString() - failed to parse color: ${color}`
    );
  }
  return {};
}

class Tiling extends HTMLElement {
  viewPort: ViewPort | undefined = undefined;
  renderer: Renderer | undefined = undefined;

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return ["rule", "v", "u", "colors"];
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

  set colors(colors: string) {
    if (colors) {
      this.setAttribute("colors", colors);
    } else {
      this.removeAttribute("colors");
    }
    this.render();
  }

  attributeChangedCallback(name: string): void {
    if (name === "u" || name === "v" || name === "colors" || name === "rule") {
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
        ...parseColorString(this.getAttribute("color")),
        protos: tileSet.kinds
      })
    );
    const tile = tileSet.tileFromEdge(
      parseVectorString(this.getAttribute("v"), V(11, 17)),
      parseVectorString(this.getAttribute("u"), V(1500, 1500))
    );
    this.renderer.drawTile(tile);
    this.renderer.setTileStream(tileSet.tiling(tile).cover);
  }
}

customElements.define("mq-tiling", Tiling);

export default Tiling;
