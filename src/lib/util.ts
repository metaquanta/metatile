import { V } from "./math/2d/V";

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

export function isCallable<T, V>(f: ((p: V) => T) | T): boolean {
  return (f as () => T).call !== undefined;
}

export function isArray<T, V>(a: V | Array<T>): boolean {
  return (a as Array<T>).entries !== undefined;
}
