import React, { MutableRefObject, useEffect, useRef } from "react";
import { Vec2 } from "../classes/Vec2";
import { ViewPort } from "../classes/ViewPort";
import { Renderer } from "../renderer/Renderer";

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
    return ViewPort(
      Vec2(
        canvas.parentElement.parentElement.clientWidth,
        canvas.parentElement.parentElement.clientHeight
      ).scale(window.devicePixelRatio),
      p
    );
  return ViewPort(Vec2(1920, 1080), p);
}

export default function Canvas(props: { renderer: Renderer }) {
  console.log("Canvas()");
  const el: MutableRefObject<HTMLCanvasElement | null> = useRef(null);

  useEffect(() => {
    console.log("Canvas.useEffect() [canvas/context]");
    if (el.current instanceof HTMLCanvasElement) {
      setSize(el.current);
      setPosition(el.current);
      props.renderer.setViewPort(getViewport(el.current));
      const ctx = el.current.getContext("2d", { alpha: false });
      if (ctx) {
        props.renderer.setContext(ctx);
      }
    }
  });

  const update = () => {
    if (el.current instanceof HTMLCanvasElement) {
      setPosition(el.current);
    }
  };

  useEffect(() => {
    console.log("Canvas.useEffect() [resize]");
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  });

  return (
    <div className="canvas">
      <canvas ref={el} />
    </div>
  );
}
