import React, {MutableRefObject, useEffect, useRef} from 'react';
//import penrose from './tilings/penrose';
import pinwheel5 from './tilings/pinwheel5';
import {Vec2} from './tilings/Tile';
import {tileViewport, ViewPort} from './tilings/Tiling';

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
    console.log(
      `setPosition(): ${canvas.parentElement.parentElement.clientWidth}×${canvas.parentElement.parentElement.clientHeight} - ${canvas.parentElement.clientWidth}×${canvas.parentElement.clientHeight} - (${canvas.parentElement.style.top},${canvas.parentElement.style.left})`
    );
    const outerWidth = canvas.parentElement.parentElement.clientWidth;
    const outerHeight = canvas.parentElement.parentElement.clientHeight;
    const innerWidth = Math.max(window.screen.height, window.screen.width);
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
    console.log(
      `setPosition(): ${canvas.parentElement.parentElement.clientWidth}×${canvas.parentElement.parentElement.clientHeight} - ${canvas.parentElement.clientWidth}×${canvas.parentElement.clientHeight} - (${canvas.parentElement.style.top},${canvas.parentElement.style.left})`
    );
    canvas.parentElement.style.top = `${origin.y}px`;
    canvas.parentElement.style.left = `${origin.x}px`;
    console.log(
      `             ⤷ ${canvas.parentElement.parentElement.clientWidth}×${canvas.parentElement.parentElement.clientHeight} - ${canvas.parentElement.clientWidth}×${canvas.parentElement.clientHeight} - (${canvas.parentElement.style.top},${canvas.parentElement.style.left})`
    );
  }
};

const getSize = (canvas: HTMLCanvasElement): number => {
  if (canvas.parentElement && canvas.parentElement.parentElement) {
    console.log(
      `setSize(): ${window.screen.width}×${window.screen.height} - ${canvas.parentElement.style.width}×${canvas.parentElement.style.height} - ${canvas.width}×${canvas.height}`
    );
    return Math.round(Math.max(window.screen.height, window.screen.width));
  }
  return 1920;
};

const setSize = (canvas: HTMLCanvasElement) => {
  if (canvas.parentElement && canvas.parentElement.parentElement) {
    console.log(
      `setSize(): ${window.screen.width}×${window.screen.height} - ${canvas.parentElement.style.width}×${canvas.parentElement.style.height} - ${canvas.width}×${canvas.height}`
    );
    const size = getSize(canvas);
    canvas.parentElement.style.height = `${size}px`;
    canvas.parentElement.style.width = `${size}px`;
    canvas.height = size * Math.round(window.devicePixelRatio);
    canvas.width = size * Math.round(window.devicePixelRatio);
    console.log(
      `         ⤷ ${window.screen.width}×${window.screen.height} - ${canvas.parentElement.style.width}×${canvas.parentElement.style.height} - ${canvas.width}×${canvas.height}`
    );
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

const canvasRender = (canvas: HTMLCanvasElement) => {
  if (canvas instanceof HTMLCanvasElement) {
    setPosition(canvas);
    //const context = canvas.getContext('2d', { alpha: false });
    const context = canvas.getContext('2d', {alpha: false});
    if (context instanceof CanvasRenderingContext2D) {
      setSize(canvas);
      watermark(context);
      tileViewport(
        context,
        pinwheel5().getTile(Vec2(100, 0), Vec2(1000,1000)),
        pinwheel5(),
        ViewPort(getViewport(canvas), getPosition(canvas).invert().scale(2))
      );
    }
  }
};

export default () => {
  const el: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
  const render = () => {
    if (el.current instanceof HTMLCanvasElement) {
      canvasRender(el.current);
    }
  };
  const update = () => {
    if (el.current instanceof HTMLCanvasElement) {
      setPosition(el.current);
    }
  };

  useEffect(() => {
    if (el.current instanceof HTMLCanvasElement) {
      render();
    }
  });
  useEffect(() => {
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  });
  return <canvas ref={el} />;
};
