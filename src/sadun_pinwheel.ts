import { getUrlParameters, setRandomParameters } from "./params";
import TilingElement from "./TilingElement";

let params = getUrlParameters();
params.rule = "Pinwheel";
params.colorHueOffset = "0";
console.debug("params:", params);
if (
  params.colorSaturation === undefined ||
  params.colorLightness === undefined ||
  params.colorHueSpan === undefined ||
  params.v === undefined ||
  params.u === undefined
) {
  setRandomParameters(params);
  params = getUrlParameters();
}

const doc = document.getElementsByTagName("div")[0];
for (let i = 2; i < 30; i++) {
  for (let p = 1; p < i; p++) {
    const q = i - p;
    if (p < 6 && q < 20 && q > p) {
      params.pinwheelP = p.toString();
      params.pinwheelQ = q.toString();
      const div = document.createElement("div");
      const anchor = document.createElement("a");
      doc.appendChild(div);
      div.appendChild(anchor);
      anchor.setAttribute(
        "href",
        `/?rule=Pinwheel&pinwheelP=${p}&pinwheelQ=${q}`
      );
      div.style.boxSizing = "border-box";
      div.style.width = "170px";
      div.style.height = "20%";
      div.style.position = "absolute";
      div.style.left = `${((q - 2) * 170).toString()}px`;
      div.style.top = `${((p - 1) * 20).toString()}%`;
      div.style.borderBottom = "1px solid";
      div.style.borderLeft = "1px solid";
      const cvs = new TilingElement();
      console.debug("created element");
      params.setAttributes(cvs);
      cvs.setAttribute("pinwheelP", p.toString());
      cvs.setAttribute("pinwheelQ", q.toString());
      anchor.appendChild(cvs);
      console.debug("attached element");
    }
  }
}
