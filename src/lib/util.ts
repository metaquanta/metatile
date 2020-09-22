// create collections
export function mapOf<K, V>(...entries: [K, V][]): Map<K, V> {
  const m = new Map<K, V>();
  entries.forEach((pair) => m.set(pair[0], pair[1]));
  return m;
}

export function iterableFrom<T>(iter: Iterable<T> | Iterator<T>): Iterable<T> {
  return isIterable(iter)
    ? iter
    : {
        [Symbol.iterator]: () => iter
      };
}

export function range(n: number): number[] {
  return [...Array(n).keys()];
}

export function* breadthFirst<L>(
  root: L,
  f: ((l: L) => Iterator<L>) | ((l: L) => Iterable<L>)
): Generator<L> {
  const arr = Array.from(iterableFrom(f(root)));
  arr.forEach((l) => yield l);
  arr.forEach((l) => yield* breadthFirst(l, f));
}

export function* depthFirst<L>(
  root: L,
  f: ((l: L) => Iterator<L>) | ((l: L) => Iterable<L>)
): Generator<L> {
  yield root;
  for (const l of iterableFrom(f(root))) {
    yield* depthFirst(l, f);
  }
}

// work with collections
export function indexOf<T>(a: T[], p: (e: T) => boolean): number {
  for (let i = 0; i < a.length; i++) {
    if (p(a[i])) return i;
  }
  return -1;
}

export function first<T>(a: Iterable<T>, p: (e: T) => boolean): T | undefined {
  for (const e of a) {
    if (p(e)) return e;
  }
  return undefined;
}

// Type guards
export function isDone<T>(
  result: IteratorYieldResult<T> | IteratorReturnResult<T>
): result is IteratorReturnResult<T> {
  return result.done != undefined && result.done;
}

export function isCallable<T, V>(f: T | ((p: V) => T)): f is (p: V) => T {
  return (f as { call?: unknown }).call !== undefined;
}

export function isArray<T>(a: unknown): a is T[] {
  return (a as { entries?: unknown }).entries !== undefined;
}

export function isIterable<T>(iter: unknown): iter is Iterable<T> {
  return (
    (iter as { [Symbol.iterator]?: unknown })[Symbol.iterator] !== undefined
  );
}

//other
export function insist<T>(v: T | undefined | null): T {
  if (v === null || v === undefined) throw new Error("Missing required value!");
  return v;
}
