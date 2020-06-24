// Reference: https://tilings.math.uni-bielefeld.de/substitution/pinwheel-variant-13-tiles/

const colorizer = (s,l) => {
    console.log(`colorizer(s: ${s}, l: ${l}`);
    return (t) => "hsl(" + 
    (Math.round(3*(t.a.x-t.b.x)+7*(t.a.y-t.b.y)+11*(t.a.x-t.c.x)+17*(t.a.y-t.c.y))%360+360)%360 + 
    ", " + s + "%, " + l + "%)";
}

const fromSSide = (l) => {
    console.log(`seed(x: ${l.x}, y: ${l.y})`)
    return Triangle(l, Vec2(0,0), l.perp().scale(1.5))
}

// A->B is S side, B->C is M side, C->A is L side.
const parent = (t) => {
    return Triangle(
        t.c.add(t.b.subtract(t.a)).add(t.c.subtract(t.b).scale(4/3)),
        t.c.add(t.a.subtract(t.b).scale(2)),
        t.b.add(t.b.subtract(t.a)).add(t.b.subtract(t.c).scale(2)));
}

const children = (t) => {
    // 1
    // 2  3  4
    // 5  6  7  8  9
    // 10 11 12
    // 13
    const m = t.b.subtract(t.c);
    const l = t.a.subtract(t.c);
    const s = t.b.subtract(t.a);
    
    const c1 = Triangle(m.scale(1/3).add(t.c), l.scale(3/13).add(t.c), t.c);
    const c4 = c1.translate(m.scale(1/3));
    const c5 = c1.translate(c1.b.subtract(c1.c).scale(2));

    const c2 = Triangle(c1.a, c1.b, c1.b.add(c1.b.subtract(c1.c)));
    const c7 = c2.translate(m.scale(1/3));

    const c3 = Triangle(c2.c, c4.b, c2.a);

    const c6 = Triangle(c3.a, c3.b, c3.a.add(m.scale(1/3)));

    const c10 = Triangle(c5.b, c5.b.add(l.scale(2/13)), t.a.add(s.scale(1/2)));
    const c11 = Triangle(c10.c, c10.b.add(s.scale(1/2)), c10.a);

    return [c1, c2, c3, c4, c5, c6, c7, 
        c3.translate(m.scale(1/3)),
        c1.translate(m.scale(2/3)),
        c10, c11,
        Triangle(c11.a, c11.b, t.b),
        Triangle(t.a, c10.b, c10.c)];
}

const testStr = (str) => str == "1" || str == "on" || str == "true" || str == "yes";

go((ctx, params) => {
    const lx = () => Number.parseInt(params.get('lx')) || Math.round(Math.random()*500+500);
    const ly = () => Number.parseInt(params.get('ly')) || Math.round(Math.random()*500+500);
    const ox = () => Number.parseInt(params.get('ox')) || Math.round(Math.random()*1000);
    const oy = () => Number.parseInt(params.get('oy')) || Math.round(Math.random()*1000);
    const cs = () => params.get('cs') || Math.round(Math.random()*100);
    const cl = () => params.get('cl') || Math.round(Math.random()*100);
    const speed = params.get('speed') || 50;
    const repeat = testStr(params.get('repeat') ? params.get('repeat') : "true");
    
    tileViewport(
        ctx, 
        parent,
        children,
        () => colorizer(cs(), cl()),
        () => fromSSide(Vec2(lx(), ly())).translate(Vec2(ox(), oy())), 
        4,
        speed,
        repeat);     
});