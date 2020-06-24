
const Vec2 = (x, y) => ({
    x, y,
    add: (u) => Vec2(x + u.x, y + u.y),
    invert: () => Vec2(-x, -y),
    subtract(u) {
        return this.add(u.invert());
    },
    scale: (a) => Vec2(a*x, a*y),
    perp: () => Vec2(y, -x),
    dot: (u) => x*u.x + y*u.y
});

const Triangle = (a, b, c) => ({
    a, b, c,
    translate: (v) =>
            Triangle(a.add(v), b.add(v), c.add(v)),

    draw(context, colorizer = () => 'black')  {
        let p = new Path2D();
        p.moveTo(this.a.x, this.a.y);
        p.lineTo(this.b.x, this.b.y);
        p.lineTo(this.c.x, this.c.y);
        p.closePath();
        context.fillStyle = colorizer(this);
        context.fill(p);
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

const isInTriangle = (p, t) => {
    const c = t.c.subtract(t.a);
    const b = t.b.subtract(t.a);
    const q = p.subtract(t.a);
    
    const s0 = c.dot(c);
    const s1 = c.dot(b);
    const s2 = c.dot(q);
    const s3 = b.dot(b);
    const s4 = b.dot(q);
    
    const x = 1/(s0*s3 - s1*s1);
    const e1 = (s3*s2 - s1*s4)*x;
    const e2 = (s0*s4 - s1*s2)*x;

    //console.log(e1,e2)
    
    return (e1 >= 0) && (e2 >= 0) && (e1 + e2 < 1)
}

function* triangles(viewport, parent_f, children_f, seed, depth) {

    const grow = (t, p) => {
        //console.log(t,p);
        if(
            p.x > Math.max(t.a.x, t.b.x, t.c.x) ||
            p.y > Math.max(t.a.y, t.b.y, t.c.y) ||
            p.x < Math.min(t.a.x, t.b.x, t.c.x) ||
            p.y < Math.min(t.a.y, t.b.y, t.c.y))
        return grow(parent_f(t), p);
        if(isInTriangle(p, t)) return t;
        return grow(parent_f(t), p);
    }

    const root = grow(
        grow(
            grow(
                grow(seed, viewport), 
                Vec2(0,0)), 
            Vec2(0, viewport.y)), 
        Vec2(viewport.x, 0));

    function* descend(triangle, d = 1) {
        if(d > depth) return;
        for(t of children_f(triangle)
            .filter(t => intersectsViewport(t, viewport))) {
                if(d == depth) yield t;
                else yield* descend(t, d + 1);
            }
    }

    yield* descend(root);
}

function tileViewport(context, parent_f, children_f, color_f, seed_f, depth, speed, repeat) {
    console.log("tileViewport()", depth, speed, repeat)
    const _tile = function* () {
        const cf = color_f();
            const tg = triangles(
                Vec2(context.canvas.width, context.canvas.height), 
                parent_f, children_f, 
                seed_f(),             
                depth);
            for(t of tg) {
                yield () => t.draw(context, cf);
            }
    }

    const _tile_forever = (function* () {
        while(true) {
            yield* _tile();
        }
    });

    const generator = repeat ? _tile_forever() : _tile();
    
    window.setInterval(() => {
        const i = generator.next();
        if(!i.done) i.value();
    }, speed);//*/
}