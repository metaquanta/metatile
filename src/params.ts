import { V } from "./lib/math/2d/V";
import { RotationColorerOptions } from "./renderer/Colorer";
import { PinwheelPQ } from "./rules/pinwheel";
import rules, { RuleOptions } from "./rules/rules";
import { Rule } from "./tiles/Rule";
import { TilingOptions } from "./tiles/Tiling";
import TilingElement from "./TilingElement";

export type ParameterStrings = {
  rule?: string;
  v?: string;
  u?: string;
  colorSaturation?: string;
  colorLightness?: string;
  colorHueSpan?: string;
  colorHueOffset?: string;
  colorAlpha?: string;
  colorStrokeAlpha?: string;
  tilingIncludeAncestors?: string;
  pinwheelP?: string;
  pinwheelQ?: string;
  renderer?: string;
};

export type Parameters = ParameterStrings & {
  getRule: () => Rule;
  getV: () => V;
  getU: () => V;
  getColorOptions: () => ColorOptions;
  getTilingOptions: () => TilingOptions;
  setAttributes: (tag: TilingElement) => void;
  getRenderer: () => "canvas" | "webgl" | "svg";
};

export type ColorOptions = RotationColorerOptions & { strokeAlpha?: number };

export function getUrlParameters(): Parameters {
  const params = new URLSearchParams(window.location.search);
  return parameters(parameterStrings((name) => params.get(name)));
}

export function getTagParameters(tag: TilingElement): Parameters {
  return parameters(parameterStrings((name) => tag.getAttribute(name)));
}

export function setRandomParameters(params: Parameters): void {
  const location = new URL(window.location.href);
  const random = getRandomParameters();
  location.searchParams.set("rule", params.rule ?? random.rule);
  location.searchParams.set("v", params.v ?? random.v);
  location.searchParams.set("u", params.u ?? random.u);
  location.searchParams.set(
    "colorSaturation",
    params.colorSaturation ?? random.colorSaturation
  );
  location.searchParams.set(
    "colorLightness",
    params.colorLightness ?? random.colorLightness
  );
  location.searchParams.set(
    "colorHueSpan",
    params.colorHueSpan ?? random.colorHueSpan
  );
  location.searchParams.set(
    "colorHueOffset",
    params.colorHueOffset ?? random.colorHueOffset
  );
  if (params.colorAlpha)
    location.searchParams.set("colorAlpha", params.colorAlpha);
  if (params.colorStrokeAlpha)
    location.searchParams.set("colorStrokeAlpha", params.colorStrokeAlpha);
  if (params.tilingIncludeAncestors)
    location.searchParams.set(
      "tilingIncludeAncestors",
      params.tilingIncludeAncestors
    );
  if (params.pinwheelP)
    location.searchParams.set("pinwheelP", params.pinwheelP);
  if (params.pinwheelQ)
    location.searchParams.set("pinwheelQ", params.pinwheelQ);
  window.history.pushState(
    {},
    window.document.title,
    // Use actual ',' characters in the vectors.
    location.toString().replace(/%2C/g, ",")
  );
}

function ruleOptions(params: ParameterStrings): RuleOptions | undefined {
  if (params.pinwheelP && params.pinwheelQ) {
    return {
      pinwheel: {
        p: parseInt(params.pinwheelP),
        q: parseInt(params.pinwheelQ)
      }
    };
  }
  return undefined;
}

function colorOptions(params: ParameterStrings): ColorOptions {
  const p = {
    saturation: parseFloat(params.colorSaturation),
    lightness: parseFloat(params.colorLightness),
    hueSpan: parseFloat(params.colorHueSpan),
    hueOffset: parseFloat(params.colorHueOffset),
    alpha: parseFloat(params.colorAlpha),
    strokeAlpha: parseFloat(params.colorStrokeAlpha)
  };
  //console.debug(`colorParameters(): `, p);
  return p;
}

function tilingOptions(params: ParameterStrings): TilingOptions {
  return {
    includeAncestors: parseBool(params.tilingIncludeAncestors)
  };
}

function parameterStrings(
  get: (s: string) => string | null | undefined
): ParameterStrings {
  return {
    rule: get("rule") ?? undefined,
    v: get("v") ?? undefined,
    u: get("u") ?? undefined,
    colorSaturation: get("colorSaturation") ?? undefined,
    colorLightness: get("colorLightness") ?? undefined,
    colorHueSpan: get("colorHueSpan") ?? undefined,
    colorHueOffset: get("colorHueOffset") ?? undefined,
    colorAlpha: get("colorAlpha") ?? undefined,
    colorStrokeAlpha: get("colorStrokeAlpha") ?? undefined,
    tilingIncludeAncestors: get("tilingIncludeAncestors") ?? undefined,
    pinwheelP: get("pinwheelP") ?? undefined,
    pinwheelQ: get("pinwheelQ") ?? undefined,
    renderer: get("renderer") ?? undefined
  };
}

function parameters(paramStrings: ParameterStrings): Parameters {
  return {
    ...paramStrings,
    getRule: () => {
      const options = ruleOptions(paramStrings);
      if (paramStrings.rule === "Pinwheel" && options) {
        return PinwheelPQ(
          options.pinwheel?.p as number,
          options.pinwheel?.q as number
        );
      }
      return ruleForString(paramStrings.rule);
    },
    getV: () => parseVector(paramStrings.v, V(11, 17)),
    getU: () => parseVector(paramStrings.u, V(1500, 1500)),
    getColorOptions: () => colorOptions(paramStrings),
    getTilingOptions: () => tilingOptions(paramStrings),
    setAttributes: (tag) =>
      Object.entries(paramStrings).forEach((k) =>
        tag.setAttribute(k[0], k[1] ?? "")
      ),
    getRenderer: () => parseRenderer(paramStrings.renderer ?? "")
  };
}

function round(n: number, p = 0) {
  return Math.round(n * 10 ** p) / 10 ** p;
}

function random(n = 1) {
  return Math.random() * n;
}

function rV() {
  return `${round(random(40) + 10)},${round(random(40) + 10)}`;
}

function rU() {
  return `${round(random(3000))},${round(random(3000))}`;
}

function randomRule(): string {
  const r = round(random(1000)) % 9;
  switch (r) {
    case 0:
      return "Ammann-Beenker";
    case 1:
      return "Penrose-Rhomb";
    case 2:
      return "Fibonacci";
    case 3:
      return "Viper";
    case 4:
      return "Pinwheel";
    case 5:
      return "Pinwheel10";
    case 6:
      return "Pinwheel13";
    case 7:
      return "MiniTangram";
    case 8:
      return "Penrose-Kite-Dart";
  }
  console.error(`randomRule() - UNREACHABLE!!! [${r}]`);
  throw new Error(`!!!Unreachable reached!!!`);
}

function getRandomParameters(): {
  rule: string;
  v: string;
  u: string;
  colorSaturation: string;
  colorLightness: string;
  colorHueSpan: string;
  colorHueOffset: string;
} {
  return {
    rule: randomRule(),
    v: rV(),
    u: rU(),
    colorSaturation: "" + round(random(0.8) + 0.1, 2),
    colorLightness: "" + round(random(0.5) + 0.25, 2),
    colorHueSpan: "" + round(random(0.5), 2),
    colorHueOffset: "" + round(random(), 2)
  };
}

function ruleForString(name: string | undefined): Rule {
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

function parseRenderer(r: string): "canvas" | "webgl" | "svg" {
  if (r === "webgl") return "webgl";
  if (r === "svg") return "svg";
  return "canvas";
}
