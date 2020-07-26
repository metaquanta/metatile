import { Polygon, Rhomb } from "./Polygon";
import { V } from "./V";

export type ViewPort = Rhomb & {
  contains: (p: V) => boolean;
  intersects: (s: Polygon) => boolean;
  vertices: () => V[];
  toString: () => string;
};

export const ViewPort = (outer: HTMLDivElement): ViewPort => {
  // How is this supposed to be done in typescript?
  const vp = outer as HTMLDivElement & { ___viewPort: ViewPort };

  if (vp.___viewPort) {
    return vp.___viewPort;
  }

  const inner = <HTMLDivElement>outer.firstElementChild;
  const canvas = <HTMLCanvasElement>inner.firstElementChild;

  const getOuterSize = (): V => {
    const width = vp.clientWidth;
    const height = vp.clientHeight;
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

  function setCanvasSize() {
    const size = Math.round(getInnerSize() * window.devicePixelRatio);
    canvas.height = size;
    canvas.width = size;
  }

  const getViewPortOrigin = () =>
    getInnerPosition().scale(window.devicePixelRatio).invert();
  const getViewPortSize = () => getOuterSize().scale(window.devicePixelRatio);

  function getViewPort(): ViewPort & { outerDiv: HTMLDivElement } {
    const origin = getViewPortOrigin();
    const size = getViewPortSize();
    return {
      ...Rhomb(
        origin,
        origin.add(V(size.x, 0)),
        origin.add(size),
        origin.add(V(0, size.y))
      ),
      translate() {
        return this;
      },
      vertices: () => [
        origin,
        V(size.x, 0).add(origin),
        origin.add(size),
        V(0, size.y).add(origin)
      ],
      outerDiv: vp,
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
  vp.___viewPort = getViewPort();

  return vp.___viewPort;
};
