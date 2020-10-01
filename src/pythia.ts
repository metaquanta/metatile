import { getUrlParameters, setRandomParameters } from "./params";
import TilingElement from "./TilingElement";

let params = getUrlParameters();
params.rule = "Pythia";
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
for (let m = 3; m < 13; m++) {
  for (let j = m - 1; j > 0; j--) {
    params.pythiaJ = j.toString();
    params.pythiaM = m.toString();
    const div = document.createElement("div");
    const anchor = document.createElement("a");
    doc.appendChild(div);
    div.appendChild(anchor);
    anchor.setAttribute("href", `/?rule=Pythia&pythiaM=${m}&pythiaJ=${j}`);
    div.style.boxSizing = "border-box";
    div.style.width = "10%";
    div.style.height = "150px";
    div.style.position = "absolute";
    div.style.left = `${((m - 3) * 10).toString()}%`;
    div.style.top = `${((j - 1) * 150).toString()}px`;
    div.style.borderBottom = "1px solid";
    div.style.borderLeft = "1px solid";
    const cvs = new TilingElement();
    console.debug("created element");
    params.setAttributes(cvs);
    cvs.setAttribute("pythiaJ", j.toString());
    cvs.setAttribute("pythiaM", m.toString());
    anchor.appendChild(cvs);
    console.debug("attached element");
  }
}
