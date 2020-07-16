const colorizer = (s,l) => (t) => "hsl(" + 
    (Math.round(3*(t.a.x-t.b.x)+7*(t.a.y-t.b.y)+11*(t.a.x-t.c.x)+17*(t.a.y-t.c.y))%360+360)%360 + 
    ", " + s + "%, " + l + "%)";

const fromSSide = (l) => Triangle(Vec2(0,0), l.perp(), l.scale(2).add(l.perp()));

// A->B is S side, B->C is M side, C->A is L side.
const parentFromC = (t) => {
    const m = t.b.subtract(t.c);
    const s = t.b.subtract(t.a);
    //console.log(m,s)
    return Triangle(
        t.a.add(m.scale(0.5)), 
        t.b.add(s),
        t.a.subtract(m.scale(2)));
}

const subAFromParent = (t) => {
    const l = t.a.subtract(t.c);
    const m = t.b.subtract(t.c);
    return Triangle(        
        t.c.add(m.scale(0.5)),
        t.c.add(l.scale(2/5)),
        t.c
    );
}

const generateFromA = (t) => {
    //      A
    //   /  |
    // C----B
    const B = (a) => 
        Triangle(a.a, a.b, a.b.add(a.b.subtract(a.c)));    
    
    // B----C
    // |  /
    // A
    const C = (b) => Triangle(b.c, b.c.add(b.a.subtract(b.b)),b.a);
    // A
    // |  \
    // B----C
    const D = (c) => Triangle(c.b.add(c.b.subtract(c.a)) ,c.b, c.c);
    //    C
    //   /|
    //  / |
    // A--B
    const E = (d) => {
        const l = d.b.subtract(d.a);
        const eb = d.b.add(l);
        //const ea = eb.add(l.perp().invert());
        const ea = d.b.subtract(d.c).scale(0.5).add(d.b).add(d.b.subtract(d.a));
        //console.log(l, l.perp());
        return Triangle(ea, eb, d.a);
    }
    const b = B(t);
    const c = C(b);
    const d = D(c);
    return [t, b, c, d, E(d)];
}

go((ctx) => tileViewport(
    ctx, 
    parentFromC,
    (t) => generateFromA(subAFromParent(t)),
    () => colorizer(Math.round(Math.random()*100), Math.round(Math.random()*100)),
    () => fromSSide(Vec2(Math.random()*200,Math.random()*200)).translate(Vec2(Math.random()*ctx.canvas.width*4+ctx.canvas.width/2,
    Math.random()*ctx.canvas.height*4+ctx.canvas.height/2)), 
    7));
