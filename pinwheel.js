
const Vec2 = (x, y) => ({
    x, y,
    add: (u) => Vec2(x + u.x, y + u.y),
    invert: () => Vec2(-x, -y),
    subtract(u) {
        return this.add(u.invert());
    },
    scale: (a) => Vec2(a*x, a*y),
    perp: () => Vec2(y, -x)
});

const Triangle = (a, b, c) => ({
    a, b, c,
    translate: (v) =>
            Triangle(a.add(v), b.add(v), c.add(v)),

    draw(context)  {
        context.beginPath();
        context.moveTo(this.a.x, this.a.y);
        context.lineTo(this.b.x, this.b.y);
        context.lineTo(this.c.x, this.c.y);
        context.lineTo(this.a.x, this.a.y);
        context.stroke();
    }
});

const intersectsViewport = (t, viewport) => {
    if(
        (Math.max(t.a.x, t.b.x, t.c.x) > 0) && 
        (Math.min(t.a.x, t.b.x, t.c.x) < viewport.x) &&
        (Math.max(t.a.y, t.b.y, t.c.y) > 0) && 
        (Math.min(t.a.y, t.b.y, t.c.y) < viewport.y)) {
        return true;
    }
    return false;
}

const fromSSide = (l) => Triangle(Vec2(0,0), l.perp(), l.scale(2).add(l.perp()));

// A->B is S side, B->C is M side, C->A is L side.
const parentFromC = (t) => {
    const m = t.b.subtract(t.c);
    const s = t.b.subtract(t.a);
    console.log(m,s)
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

function createPinwheelTilingViewport(viewport, context, origin, l) {

    const MIN_LENGTH = 50;

    children = (t) => {
        const l = t.b.subtract(t.a);
        const len = l.x*l.x+l.y*l.y;
        if(len < MIN_LENGTH * MIN_LENGTH) return [];
        return generateFromA(subAFromParent(t));
    }

    const containsViewport = (triangle) => {
        if(viewport.x > Math.max(triangle.a.x, triangle.b.x, triangle.c.x)) {
            return false;
        }
        if(viewport.x < Math.min(triangle.a.x, triangle.b.x, triangle.c.x)) {
            return false;
        }
        if(viewport.y > Math.max(triangle.a.y, triangle.b.y, triangle.c.y)) {
            return false;
        }
        if(viewport.y < Math.min(triangle.a.y, triangle.b.y, triangle.c.y)) {
            return false;
        }
        return true;
    }

    let triangle = fromSSide(l).translate(origin);
    triangle.draw(context);
    while(!containsViewport(triangle)) {
        triangle = parentFromC(triangle);
        triangle.draw(context);
    }
    for(let i = 0; i < 5; i++) {
        triangle = parentFromC(triangle);
        triangle.draw(context);
    }

    drawChildren = (triangle) => {
        children(triangle)
            .filter(t => intersectsViewport(t,viewport))
            .forEach(t => {
                t.draw(context);
                drawChildren(t);
        });
    }

    drawChildren(triangle);
    
}


go((ctx) =>
createPinwheelTilingViewport(
    Vec2(ctx.canvas.width,ctx.canvas.height), ctx, 
    Vec2(Math.random()*ctx.canvas.width*4+ctx.canvas.width/2,
        Math.random()*ctx.canvas.height*4+ctx.canvas.height/2), 
    Vec2(Math.random()*200,Math.random()*200)));
