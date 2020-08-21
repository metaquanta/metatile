import Tiling from "./TilingComponent.js";

type Parameters = {
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
};

let params = getUrlParameters();
if (
  params.colorSaturation === undefined ||
  params.colorLightness === undefined ||
  params.colorHueSpan === undefined ||
  params.colorHueOffset === undefined ||
  params.v === undefined ||
  params.u === undefined ||
  params.rule === undefined
) {
  params = getRandomParameters(params);
  setParameters(params);
}

const tag = new Tiling();
Object.entries(params).forEach((k) => tag.setAttribute(k[0], k[1] || ""));

(<HTMLDivElement>document.getElementsByTagName("div")[0]).appendChild(tag);

function getUrlParameters(): Parameters {
  const params = new URLSearchParams(window.location.search);
  return {
    rule: params.get("rule") || undefined,
    v: params.get("v") || undefined,
    u: params.get("u") || undefined,
    colorSaturation: params.get("colorSaturation") || undefined,
    colorLightness: params.get("colorLightness") || undefined,
    colorHueSpan: params.get("colorHueSpan") || undefined,
    colorHueOffset: params.get("colorHueOffset") || undefined,
    colorAlpha: params.get("colorAlpha") || undefined,
    colorStrokeAlpha: params.get("colorStrokeAlpha") || undefined,
    tilingIncludeAncestors: params.get("tilingIncludeAncestors") || undefined,
    pinwheelP: params.get("pinwheelP") || undefined,
    pinwheelQ: params.get("pinwheelQ") || undefined
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

function getRandomParameters(params: Parameters): Parameters {
  return {
    rule: params.rule || randomRule(),
    v: params.v || rV(),
    u: params.u || rU(),
    colorSaturation: params.colorSaturation || "" + round(random(0.8) + 0.1, 2),
    colorLightness: params.colorLightness || "" + round(random(0.5) + 0.25, 2),
    colorHueSpan: params.colorHueSpan || "" + round(random(0.5), 2),
    colorHueOffset: params.colorHueOffset || "" + round(random(), 2)
  };
}
function setParameters(params: Parameters) {
  const location = new URL(window.location.href);
  if (params.rule) location.searchParams.set("rule", params.rule);
  if (params.v) location.searchParams.set("v", params.v);
  if (params.u) location.searchParams.set("u", params.u);
  if (params.colorSaturation)
    location.searchParams.set("colorSaturation", params.colorSaturation);
  if (params.colorLightness)
    location.searchParams.set("colorLightness", params.colorLightness);
  if (params.colorHueSpan)
    location.searchParams.set("colorHueSpan", params.colorHueSpan);
  if (params.colorHueOffset)
    location.searchParams.set("colorHueOffset", params.colorHueOffset);
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
