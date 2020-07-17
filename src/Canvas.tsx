import React, { MutableRefObject, useEffect, useRef } from 'react';
import tile, { testTileSet } from './tilings/ammann-beenker';
import { tileViewport, Vec2 } from './Tiles';

const watermark = (c: CanvasRenderingContext2D) => {
    c.canvas.height = c.canvas.clientHeight * window.devicePixelRatio;
    c.canvas.width = c.canvas.clientWidth * window.devicePixelRatio;
    const width = c.canvas.width;
    const height = c.canvas.height;
    const th = 5 * window.devicePixelRatio;
    c.beginPath();
    c.moveTo(width - 3 * th, height - 2 * th);
    c.lineTo(width - 2 * th, height - th);
    c.lineTo(width - th, height - 2 * th);
    c.lineTo(width - 2 * th, height - 3 * th);
    c.lineTo(width - 3 * th, height - 2 * th);
    c.stroke();
}

const canvasRender = (canvas: HTMLCanvasElement, f: (c: CanvasRenderingContext2D) => void) => {
    if (canvas instanceof HTMLCanvasElement) {
        const context = canvas.getContext('2d');
        if (context instanceof CanvasRenderingContext2D) {
            watermark(context);
            f(context);
        }
    }
}

export default () => {
    const el: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
    const render = () => {
        if (el.current instanceof HTMLCanvasElement) {
            canvasRender(el.current, (ctx) => tileViewport(ctx, tile(Vec2(1500, 0), Vec2(1000, 1500)), 5));
        }
    }
    useEffect(() => {
        if (el.current instanceof HTMLCanvasElement) {
            render();
        }
    });
    useEffect(() => {
        window.addEventListener('resize', render);
        return () => window.removeEventListener('resize', render);
    });
    return (<canvas ref={el} />);
}