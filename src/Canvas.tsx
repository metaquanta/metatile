import React, {MutableRefObject, useEffect, useRef} from 'react';
import pinwheel10 from './tilings/pinwheel10';
import pinwheel13 from './tilings/pinwheel13';
import pinwheel5 from './tilings/pinwheel5';
import penrose from './tilings/penrose';
import viper from './tilings/viper';
import {Vec2} from './tilings/Tile';
import {tileViewport, ViewPort} from './tilings/Tiling';

const tilings = [pinwheel5(), pinwheel10(), pinwheel13(), penrose(), viper()];

const watermark = (c: CanvasRenderingContext2D) => {
  if (c.canvas.parentElement && c.canvas.parentElement.parentElement) {
    const pr = Math.round(window.devicePixelRatio);

    const size = getSize(c.canvas);
    c.fillStyle = 'grey';
    c.fillRect(0, 0, size * pr, size * pr);

    const th = 3 * pr;
    const width = Math.round(
      c.canvas.parentElement.parentElement.clientWidth * pr - 3 * th
    );
    const height = Math.round(
      c.canvas.parentElement.parentElement.clientHeight * pr - 3 * th
    );
    const left = Math.round((c.canvas.width - width) / 2);
    const top = Math.round((c.canvas.height - height) / 2);

    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(left, top);
    c.lineTo(width + left, top);
    c.lineTo(width + left, height + top);
    c.lineTo(left, height + top);
    c.lineTo(left, top);
    c.stroke();
  }
};

const getPosition = (canvas: HTMLCanvasElement): Vec2 => {
  if (canvas.parentElement && canvas.parentElement.parentElement) {
    const outerWidth = canvas.parentElement.parentElement.clientWidth;
    const outerHeight = canvas.parentElement.parentElement.clientHeight;
    const innerWidth = Math.max(window.screen.height, window.screen.width);
    console.log(
      `setPosition(): ${outerWidth}×${outerHeight}`+
      ` - ${canvas.parentElement.clientWidth}×${canvas.parentElement.clientHeight}`+
      ` - (${canvas.parentElement.style.top},${canvas.parentElement.style.left})`
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
      `setSize(): ${window.screen.width}×${window.screen.height}`+
      ` - ${canvas.parentElement.style.width}×${canvas.parentElement.style.height}`+
      ` - ${canvas.width}×${canvas.height}`
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

function getViewport(canvas: HTMLCanvasElement): Vec2 {
  if (canvas.parentElement && canvas.parentElement.parentElement)
    return Vec2(
      canvas.parentElement.parentElement.clientWidth,
      canvas.parentElement.parentElement.clientHeight
    ).scale(window.devicePixelRatio);
  return Vec2(1920, 1080);
}

function getViewportPosition(canvas: HTMLCanvasElement): Vec2 {
  return getPosition(canvas).invert().scale(window.devicePixelRatio);
}

const canvasRender = (canvas: HTMLCanvasElement) => {
  if (canvas instanceof HTMLCanvasElement) {
    setPosition(canvas);
    const context = canvas.getContext('2d', {alpha: false});
    if (context instanceof CanvasRenderingContext2D) {
      setSize(canvas);
      watermark(context);
      const t = 2;
      tileViewport(
        context,
        tilings[t].getTile(Vec2(100, 100), Vec2(1500, 1500)),
        tilings[t],
        ViewPort(getViewport(canvas), getViewportPosition(canvas))
      );
    }
  }
};

export default () => {
  const el: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
  const update = () => {
    if (el.current instanceof HTMLCanvasElement) {
      setPosition(el.current);
    }
  };

  useEffect(() => {
    if (el.current instanceof HTMLCanvasElement) {
      if (el.current instanceof HTMLCanvasElement) {
        canvasRender(el.current);
      }
    }
  });
  useEffect(() => {
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  });
  return <canvas ref={el} />;
};
