export function invertFunction(
  f: (x: number) => number,
  range: [number, number],
  // This is about ten times | ln(x)+ln(y) - ln(xy) |
  epsilon = 1e-15
): (y: number) => number {
  const left = isFinite(f(range[0])) ? range[0] : range[0] + epsilon;
  const right = isFinite(f(range[1])) ? range[1] : range[1] - epsilon;
  const leftY = f(left);
  const rightY = f(right);
  return function (y: number) {
    if (Math.abs(leftY - y) < epsilon) return range[0];
    if (Math.abs(rightY - y) < epsilon) return range[1];

    // The function names are misleading. Both falsiMethod() and
    // bisectionMethod() result in alternating calls to both. This speeds up
    // bisection and prevents falsi from getting stuck on poorly conditioned
    // functions.
    return falsiMethod((x) => f(x) - y, left, right, epsilon);
  };
}

export function findRoot(
  f: (x: number) => number,
  range: [number, number],
  epsilon = 1e-15
): number {
  const left = isFinite(f(range[0])) ? range[0] : range[0] + epsilon;
  const right = isFinite(f(range[1])) ? range[1] : range[1] - epsilon;
  return falsiMethod(f, left, right, epsilon);
}

function falsiMethod(
  f: (x: number) => number,
  x0: number,
  x1: number,
  epsilon: number,
  y0 = f(x0),
  y1 = f(x1),
  i = 0
): number {
  if (isNaN(x0) || isNaN(x1) || isNaN(y0) || isNaN(y1))
    throw new Error(
      `falsiMethod(f, ${x0}, ${x1}, ${epsilon}, ${y0} NaN supplied.`
    );
  if (y0 < 0 === y1 < 0)
    throw new Error(
      `falsiMethod(f, ${x0}, ${x1}, ${epsilon}, ${y0}) ` +
        `[${y0}, ${y1}] solution is not bracketed.`
    );
  const x2 = x1 - (y1 * x1 - y1 * x0) / (y1 - y0);
  const y2 = f(x2);
  /*console.debug(
    `falsiMethod(f, ${x0}, ${x1}) = [${y2}, ${x2}] (${Math.abs(y2)}) (${i})`
  );*/

  if (Math.abs(y2) < epsilon) {
    return x2;
  }

  return bisectionMethod(
    f,
    y0 < 0 === y2 < 0 ? x2 : x0,
    y1 < 0 === y2 < 0 ? x2 : x1,
    epsilon,
    y0 < 0 === y2 < 0 ? y2 : y0,
    y1 < 0 === y2 < 0 ? y2 : y1,
    i + 1
  );
}

function bisectionMethod(
  f: (x: number) => number,
  x0: number,
  x1: number,
  epsilon: number,
  y0 = f(x0),
  y1 = f(x1),
  i = 0
): number {
  if (isNaN(x0) || isNaN(x1) || isNaN(y0) || isNaN(y1))
    throw new Error(
      `bisectionMethod(f, ${x0}, ${x1}, ${epsilon}, ${y0} NaN supplied.`
    );
  if (y0 < 0 === y1 < 0)
    throw new Error(
      `bisectionMethod(f, ${x0}, ${x1}, ${epsilon}, ${y0}) ` +
        `[${y0}, ${y1}] solution is not bracketed.`
    );
  const x2 = (x0 + x1) / 2;
  const y2 = f(x2);
  /*console.debug(
    `bisectionMethod(f, ${x0}, ${x1}) = [${y2}, ${x2}] (${Math.abs(y2)}) (${i})`
  );*/

  if (Math.abs(x1 - x2) < epsilon) {
    return x2;
  }

  return falsiMethod(
    f,
    y0 < 0 === y2 < 0 ? x2 : x0,
    y1 < 0 === y2 < 0 ? x2 : x1,
    epsilon,
    y0 < 0 === y2 < 0 ? y2 : y0,
    y1 < 0 === y2 < 0 ? y2 : y1,
    i + 1
  );
}
