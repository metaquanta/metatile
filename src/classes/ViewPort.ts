import { Rect } from "./Polygon";
import { V } from "./V";

export type ViewPort = Rect;

export const ViewPort = (outer: HTMLDivElement): ViewPort => {
  const inner = <HTMLDivElement>outer.firstElementChild;
  const canvas = <HTMLOrSVGImageElement>inner.firstElementChild;

  const getOuterSize = (): V => {
    const width = outer.clientWidth;
    const height = outer.clientHeight;
    console.log(`ViewPort:getOuterSize(): ${width}×${height}`);
    return V(width, height);
  };

  const getInnerPosition = (): V => {
    const max = getInnerSize();
    const size = getOuterSize();
    const width = Math.round((size.x - max) / 2);
    const height = Math.round((size.y - max) / 2);
    console.log(`ViewPort:getInnerPosition(): ${width}×${height}, max=${max}`);
    return V(width, height);
  };

  function setInnerPosition() {
    const origin = getInnerPosition();
    inner.style.top = `${origin.y}px`;
    inner.style.left = `${origin.x}px`;
  }

  function getInnerSize(): number {
    const max = Math.round(Math.max(window.screen.height, window.screen.width));
    console.log(
      `getInnerSize(): ${window.screen.width}×${window.screen.height}, max=${max}`
    );
    return max;
  }

  function setInnerSize() {
    const size = getInnerSize();
    inner.style.height = `${size}px`;
    inner.style.width = `${size}px`;
  }

  const getViewPortOrigin = () =>
    //getInnerPosition().scale(window.devicePixelRatio).invert();
    getInnerPosition().invert();
  //const getViewPortSize = () => getOuterSize().scale(window.devicePixelRatio);
  const getViewPortSize = () => getOuterSize();

  function setCanvasSize() {
    if (isSVGElement(canvas)) {
      //const size = Math.round(getInnerSize() * window.devicePixelRatio);
      const size = Math.round(getInnerSize());
      canvas.setAttribute("height", "" + size);
      canvas.setAttribute("width", "" + size);
      canvas.setAttribute("viewPort", `0 0 ${size} ${size}`);
    }
  }

  function getViewPort(): ViewPort & { outerDiv: HTMLDivElement } {
    const origin = getViewPortOrigin();
    const size = getViewPortSize();
    return {
      ...Rect(origin.x, origin.y, origin.x + size.x, origin.y + size.y),
      translate() {
        return this;
      },
      vertices: () => [
        origin,
        V(size.x, 0).add(origin),
        origin.add(size),
        V(0, size.y).add(origin)
      ],
      outerDiv: outer,
      toString: () =>
        `⦗↤${origin.x}, ↥${origin.y}, ↦${origin.x + size.x}, ↧${
          origin.y + size.y
        }⦘`
    };
  }

  window.addEventListener("resize", () => setInnerPosition());

  setInnerSize();
  setCanvasSize();
  setInnerPosition();

  return getViewPort();
};

function isSVGElement(el: HTMLOrSVGImageElement): boolean {
  return (el as HTMLElement).style === undefined;
}
