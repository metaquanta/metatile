
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

    draw(context, colorizer)  {
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

function* triangles(viewport, parent_f, children_f, triangle, f, depth, height_buffer) {

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

    while(!containsViewport(triangle)) {
        triangle = parent_f(triangle);
    }
    for(let i = 0; i < height_buffer; i++) {
        triangle = parent_f(triangle);
    }

    function* descend(triangle, d = 1) {
        if(d > depth) return;
        for(t of children_f(triangle)
            .filter(t => intersectsViewport(t, viewport))) {
                if(d == depth) yield () => f(t);
                else yield* descend(t, d + 1);
            }
    }

    yield* descend(triangle);
    
}

function tileViewport(context, parent_f, children_f, color_f, seed_f, depth = 11, height_buffer = 5) {
    const generator = (function* () {
        while(true) {
            yield* triangles(
            Vec2(context.canvas.width,context.canvas.height), 
            parent_f, children_f, 
            seed_f(), 
            ((c_f) => ((t) => t.draw(context, c_f)))(color_f()),
            depth, height_buffer)
        }
    })();
    window.setInterval(() => {
        generator.next().value();
    }, 50);
}