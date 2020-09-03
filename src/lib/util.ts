export function mapOf<K, V>(...entries: [K, V][]): Map<K, V> {
  const m = new Map<K, V>();
  entries.forEach((pair) => m.set(pair[0], pair[1]));
  return m;
}

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

export function range(n: number): number[] {
  return [...Array(n).keys()];
}

export function isCallable<T, V>(f: ((p: V) => T) | T): f is (p: V) => T {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return (f as (p: V) => T).call !== undefined;
}

export function isArray<T, V>(a: V | T[]): a is T[] {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return (a as T[]).entries !== undefined;
}

export function isDone<T>(
  result: IteratorYieldResult<T> | IteratorReturnResult<T>
): result is IteratorReturnResult<T> {
  return result.done != undefined && result.done;
}
