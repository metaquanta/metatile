import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { Vec2 } from "../classes/Vec2";
import { tileGenerator, Tiling } from "../tiling/Tiling";
import { ViewPort } from "../classes/ViewPort";
import { Renderer } from "../renderer/Renderer"; import draw from "../renderer/DrawTile";
import { Colorer } from "../renderer/Colorer";


const getPosition = (canvas: HTMLCanvasElement): Vec2 => {
  if (canvas.parentElement && canvas.parentElement.parentElement) {
    const outerWidth = canvas.parentElement.parentElement.clientWidth;
    const outerHeight = canvas.parentElement.parentElement.clientHeight;
    const innerWidth = Math.max(window.screen.height, window.screen.width);
    console.log(
      `getPosition(): ${outerWidth}×${outerHeight} - ${canvas.parentElement.clientWidth}×${canvas.parentElement.clientHeight} - (${canvas.parentElement.style.top},${canvas.parentElement.style.left})`
    );
    return Vec2(
      Math.round((outerWidth - innerWidth) / 2),
      Math.round((outerHeight - innerWidth) / 2)
    );
  }
  return Vec2(0, 0);
};

const setPosition = (canvas: HTMLCanvasElement) => {
  const origin = getPosition(canvas);
  if (canvas.parentElement && canvas.parentElement.parentElement) {
    canvas.parentElement.style.top = `${origin.y}px`;
    canvas.parentElement.style.left = `${origin.x}px`;
  }
};

const getSize = (canvas: HTMLCanvasElement): number => {
  if (canvas.parentElement && canvas.parentElement.parentElement) {
    console.log(
      `getSize(): ${window.screen.width}×${window.screen.height} - ${canvas.parentElement.style.width}×${canvas.parentElement.style.height} - ${canvas.width}×${canvas.height}`
    );
    return Math.round(Math.max(window.screen.height, window.screen.width));
  }
  return 1920;
};

const setSize = (canvas: HTMLCanvasElement) => {
  if (canvas.parentElement && canvas.parentElement.parentElement) {
    const size = getSize(canvas);
    canvas.parentElement.style.height = `${size}px`;
    canvas.parentElement.style.width = `${size}px`;
    canvas.height = Math.round(size * window.devicePixelRatio);
    canvas.width = Math.round(size * window.devicePixelRatio);
  }
};

function getViewport(canvas: HTMLCanvasElement): ViewPort {
  const p = getPosition(canvas).invert().scale(window.devicePixelRatio);
  if (canvas.parentElement && canvas.parentElement.parentElement)
    return ViewPort(Vec2(
      canvas.parentElement.parentElement.clientWidth,
      canvas.parentElement.parentElement.clientHeight
    ).scale(window.devicePixelRatio), p);
  return ViewPort(Vec2(1920, 1080), p);
}

const renderCanvas = (r: Renderer, tiling: Tiling, colorer: Generator<Colorer>, canvas: HTMLCanvasElement) => {
  setPosition(canvas);
  setSize(canvas);
  r.setDrawTiles(draw);
  r.setfillColorer(colorer);
  r.setTileStream(tileGenerator(tiling.getTile(Vec2(15, 35), Vec2(1000, 700)), 0, false, getViewport(canvas)))
}

export default function Canvas(props: { tiling: Tiling, colorer: Generator<Colorer> }) {
  const el: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
  const [state, setState] = useState<{ renderer: Renderer | undefined }>({ renderer: undefined });

  const setContext = (ctx: CanvasRenderingContext2D) => {
    const renderer = Renderer(ctx);
    setState({ renderer });
    if (state.renderer)
      renderCanvas(state.renderer, props.tiling, props.colorer, ctx.canvas);
  }

  useEffect(() => {
    if (el.current instanceof HTMLCanvasElement) {
      const ctx = el.current.getContext("2d", { alpha: false });
      if (ctx) {
        setContext(ctx);
      }
    }
  });

  const update = () => {
    if (el.current instanceof HTMLCanvasElement) {
      setPosition(el.current);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  });


  return (
    <div className="canvas">
      <canvas ref={el} />
    </div>
  );
}
