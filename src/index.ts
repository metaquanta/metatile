import WebComponent from "./WebComponent";

const el = <HTMLDivElement>document.getElementsByTagName("div")[0];
el.appendChild(new WebComponent());
