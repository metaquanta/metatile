// Reference: https://tilings.math.uni-bielefeld.de/substitution/pinwheel-variant-13-tiles/

import { getColorizer, parity, theta, Tile, Triangle, Vec2 } from "../Tiles";

const fromSSide = (l: Vec2) => {
    console.log(`seed(x: ${l.x}, y: ${l.y})`)
    return Triangle(l, Vec2(0, 0), l.perp().scale(1.5))
}

// A->B is S side, B->C is M side, C->A is L side.
const parent = (t: Triangle) => {
    return Triangle(
        t.c.add(t.b.subtract(t.a)).add(t.c.subtract(t.b).scale(4 / 3)),
        t.c.add(t.a.subtract(t.b).scale(2)),
        t.b.add(t.b.subtract(t.a)).add(t.b.subtract(t.c).scale(2)));
}

const children = (t: Triangle) => {
    // 1
    // 2  3  4
    // 5  6  7  8  9
    // 10 11 12
    // 13
    const m = t.b.subtract(t.c);
    const l = t.a.subtract(t.c);
    const s = t.b.subtract(t.a);

    const c1 = Triangle(m.scale(1 / 3).add(t.c), l.scale(3 / 13).add(t.c), t.c);
    const c4 = c1.translate(m.scale(1 / 3));
    const c5 = c1.translate(c1.b.subtract(c1.c).scale(2));

    const c2 = Triangle(c1.a, c1.b, c1.b.add(c1.b.subtract(c1.c)));
    const c7 = c2.translate(m.scale(1 / 3));

    const c3 = Triangle(c2.c, c4.b, c2.a);

    const c6 = Triangle(c3.a, c3.b, c3.a.add(m.scale(1 / 3)));

    const c10 = Triangle(c5.b, c5.b.add(l.scale(2 / 13)), t.a.add(s.scale(1 / 2)));
    const c11 = Triangle(c10.c, c10.b.add(s.scale(1 / 2)), c10.a);

    return [c1, c2, c3, c4, c5, c6, c7,
        c3.translate(m.scale(1 / 3)),
        c1.translate(m.scale(2 / 3)),
        c10, c11,
        Triangle(c11.a, c11.b, t.b),
        Triangle(t.a, c10.b, c10.c)];
}

const root = (l: Vec2, o: Vec2): Tile => tile(fromSSide(l).translate(o));

const colorizer = getColorizer(2, 85, 50);

const tile = (t: Triangle): Tile =>
    ({
        parent: () => tile(parent(t)),
        children: () => children(t).map(c => tile(c)),
        draw: (ctx, alpha = 1) => t.polygon().draw(
            colorizer(parity(t.b.subtract(t.a), t.c.subtract(t.a)), theta(t.b.subtract(t.a)), alpha),
            ctx),
        contains: (p) => t.polygon().contains(p),
        intersectsRect: (p) => t.polygon().intersectsRect(p)
    })

export default (seed: Vec2, origin = Vec2(0, 0)) => root(seed, origin);