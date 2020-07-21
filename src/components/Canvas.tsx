import React, { MutableRefObject, useEffect, useRef } from "react";
import { Tiling } from "../classes/Tiling";
import { Vec2 } from "../classes/Vec2";
import { ViewPort } from "../classes/ViewPort";
import { colorAngles, colorStreamer } from "../renderer/Colorer";
import draw from "../renderer/DrawTile";
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

function setPosition(canvas: HTMLCanvasElement) {
  const origin = getPosition(canvas);
  if (canvas.parentElement && canvas.parentElement.parentElement) {
    canvas.parentElement.style.top = `${origin.y}px`;
    canvas.parentElement.style.left = `${origin.x}px`;
  }
}

function getSize(canvas: HTMLCanvasElement): number {
  if (canvas.parentElement && canvas.parentElement.parentElement) {
    console.log(
      `getSize(): ${window.screen.width}×${window.screen.height} - ${canvas.parentElement.style.width}×${canvas.parentElement.style.height} - ${canvas.width}×${canvas.height}`
    );
    return Math.round(Math.max(window.screen.height, window.screen.width));
  }
  return 1920;
}

function setSize(canvas: HTMLCanvasElement) {
  if (canvas.parentElement && canvas.parentElement.parentElement) {
    const size = getSize(canvas);
    canvas.parentElement.style.height = `${size}px`;
    canvas.parentElement.style.width = `${size}px`;
    canvas.height = Math.round(size * window.devicePixelRatio);
    canvas.width = Math.round(size * window.devicePixelRatio);
  }
}

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

class Canvas extends React.Component<
  { tiling: Tiling; renderer: Renderer },
  {}
> {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  constructor(props: { tiling: Tiling; renderer: Renderer }) {
    super(props);
    this.canvasRef = React.createRef();
  }

  resize() {
    if (this.canvasRef.current) {
      setPosition(this.canvasRef.current);
    }
  }

  componentDidMount() {
    this.resize.bind(this);
    if (this.canvasRef.current) {
      setSize(this.canvasRef.current);
      setPosition(this.canvasRef.current);
      window.addEventListener("resize", this.resize);
      const ctx = this.canvasRef.current.getContext("2d");
      if (ctx) {
        const v = Vec2(20, 30);
        const u = Vec2(1000, 500);
        this.props.renderer.setContext(ctx);
        this.props.renderer.setViewPort(getViewport(this.canvasRef.current));
        //this.props.renderer.setfillColorer(colorStreamer(colorAngles(4, 2, 50, 50))());
        this.props.renderer.setDrawTiles(draw);
      }
    }
  }

  render() {
    console.log("Canvas()");

    //getViewport(el.current));

    return (
      <div className="canvas">
        <canvas ref={this.canvasRef} />
      </div>
    );
  }
}

export default Canvas;
