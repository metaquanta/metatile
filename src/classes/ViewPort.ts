import { Rect } from "./Polygon";
import { V } from "./V";

export type ViewPort = Rect;

export const ViewPort = (outer: HTMLDivElement): ViewPort => {
  const inner = <HTMLDivElement>outer.firstElementChild;
  const canvas = <HTMLCanvasElement>inner.firstElementChild;

  const getOuterSize = (): V => {
    const width = outer.clientWidth;
    const height = outer.clientHeight;
    console.debug(`ViewPort:getOuterSize(): ${width}×${height}`);
    return V(width, height);
  };

  const getInnerPosition = (): V => {
    const max = getInnerSize();
    const size = getOuterSize();
    const width = Math.round((size.x - max) / 2);
    const height = Math.round((size.y - max) / 2);
    console.debug(
      `ViewPort:getInnerPosition(): ${width}×${height}, max=${max}`
    );
    return V(width, height);
  };

  function setInnerPosition() {
    const origin = getInnerPosition();
    inner.style.top = `${origin.y}px`;
    inner.style.left = `${origin.x}px`;
  }

  function getInnerSize(): number {
    const max = Math.round(Math.max(window.screen.height, window.screen.width));
    /*console.debug(
      `ViewPort:getInnerSize(): ${window.screen.width}×${window.screen.height}, max=${max}`
    );*/
    return max;
  }

  function setInnerSize() {
    const size = getInnerSize();
    inner.style.height = `${size}px`;
    inner.style.width = `${size}px`;
  }

  const getViewPortOrigin = () =>
    getInnerPosition().scale(window.devicePixelRatio).invert();
  const getViewPortSize = () => getOuterSize().scale(window.devicePixelRatio);

  function setCanvasSize() {
    const size = Math.round(getInnerSize() * window.devicePixelRatio);
    canvas.height = size;
    canvas.width = size;
  }

  function getViewPort(): ViewPort & { outerDiv: HTMLDivElement } {
    const origin = getViewPortOrigin();
    const size = getViewPortSize();
    const rect = Rect(origin.x, origin.y, origin.x + size.x, origin.y + size.y);
    return {
      ...rect,
      pad: (n) => rect.pad(n),
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
