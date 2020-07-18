import React, { MutableRefObject, useEffect, useRef } from 'react';
import getTile from './tilings/penrose';
import { tileViewport, Vec2 } from './Tiles';

const watermark = (c: CanvasRenderingContext2D) => {
    if (c.canvas.parentElement && c.canvas.parentElement.parentElement) {
        const pr = Math.round(window.devicePixelRatio);
        //c.scale(1 / pr, 1 / pr);

        const th = 3 * pr;
        const width = Math.round(c.canvas.parentElement.parentElement.clientWidth * pr - 3 * th);
        const height = Math.round(c.canvas.parentElement.parentElement.clientHeight * pr - 3 * th);
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
}

const setPosition = (canvas: HTMLCanvasElement) => {
    if (canvas.parentElement && canvas.parentElement.parentElement) {
        console.log(`setPosition(): ${canvas.parentElement.parentElement.clientWidth}x${canvas.parentElement.parentElement.clientHeight} - ${canvas.parentElement.clientWidth}x${canvas.parentElement.clientHeight} - (${canvas.parentElement.style.top},${canvas.parentElement.style.left})`);
        const outerWidth = canvas.parentElement.parentElement.clientWidth;
        const outerHeight = canvas.parentElement.parentElement.clientHeight;
        const innerWidth = Math.max(window.screen.height, window.screen.width);
        canvas.parentElement.style.top = `${Math.round((outerHeight - innerWidth) / 2)}px`;
        canvas.parentElement.style.left = `${Math.round((outerWidth - innerWidth) / 2)}px`;
        console.log(`             - ${canvas.parentElement.parentElement.clientWidth}x${canvas.parentElement.parentElement.clientHeight} - ${canvas.parentElement.clientWidth}x${canvas.parentElement.clientHeight} - (${canvas.parentElement.style.top},${canvas.parentElement.style.left})`);
    }
}

const setSize = (canvas: HTMLCanvasElement) => {
    if (canvas.parentElement && canvas.parentElement.parentElement) {
        console.log(`setSize(): ${window.screen.width}x${window.screen.height} - ${canvas.parentElement.style.width}x${canvas.parentElement.style.height} - ${canvas.width}x${canvas.height}`);
        const innerWidth = Math.round(Math.max(window.screen.height, window.screen.width));
        canvas.parentElement.style.height = `${innerWidth}px`;
        canvas.parentElement.style.width = `${innerWidth}px`;
        canvas.height = innerWidth * Math.round(window.devicePixelRatio);
        canvas.width = innerWidth * Math.round(window.devicePixelRatio);
        console.log(`         - ${window.screen.width}x${window.screen.height} - ${canvas.parentElement.style.width} x ${canvas.parentElement.style.height} - ${canvas.width}x${canvas.height}`);
    }
}

const getCenter = (): Vec2 => {
    const c = Math.round(Math.max(window.screen.height, window.screen.width) * window.devicePixelRatio / 2);
    return Vec2(c, c);
}

const getViewport = (canvas: HTMLCanvasElement): Vec2 => {
    if (canvas.parentElement && canvas.parentElement.parentElement)
        return Vec2(canvas.parentElement.parentElement.clientWidth, canvas.parentElement.parentElement.clientHeight).scale(window.devicePixelRatio);
    return Vec2(1920, 1080);
}

const canvasRender = (canvas: HTMLCanvasElement) => {
    if (canvas instanceof HTMLCanvasElement) {
        setPosition(canvas);
        const context = canvas.getContext('2d');
        if (context instanceof CanvasRenderingContext2D) {
            setSize(canvas);
            watermark(context);
            tileViewport(context, getCenter(), getViewport(canvas), (v) => getTile(v).tile, 14);
        }
    }
}

export default () => {
    const el: MutableRefObject<HTMLCanvasElement | null> = useRef(null);
    const render = () => {
        if (el.current instanceof HTMLCanvasElement) {
            //const { tile } = getTile(Vec2(1600, 0))
            //canvasRender(el.current, (ctx) => tileViewport(ctx, tile, 14));
            canvasRender(el.current);
            //canvasRender(el.current, (ctx) => test(ctx))
        }
    }
    const update = () => {
        if (el.current instanceof HTMLCanvasElement) {
            setPosition(el.current);
        }
    }

    useEffect(() => {
        if (el.current instanceof HTMLCanvasElement) {
            render();
        }
    });
    useEffect(() => {
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    });
    return (<canvas ref={el} />);
}