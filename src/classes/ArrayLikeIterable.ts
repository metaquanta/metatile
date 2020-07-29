/**
 * An Iterable endowed with lazy versions of Array's
 * every, some, forEach, map, filter, reduce, and flatMap
 */
export interface ArrayLikeIterable<T> extends Iterable<T> {
  /**
   * Determines whether the predicate returns true for every value.
   * @param predicate The predicate is evaluated only until it produces true.
   */
  every(predicate: (value: T) => boolean): boolean;
  /**
   * Determines whether the predicate returns true for any value.
   * @param predicate The predicate is evaluated for every value.
   */
  some(predicate: (value: T) => unknown): boolean;
  /**
   * Performs the specified action for each value.
   * @param callbackfn forEach calls the callbackfn function one time for each value.
   */
  forEach(callbackfn: (value: T) => void): void;
  /**
   * Returns an iterable where each value is the result of the given function applied to this
   * iterable's values.
   * @param callbackfn
   */
  map<U>(callbackfn: (value: T) => U): ArrayLikeIterable<U>;
  /**
   * Returns an iterable that only produces values that the predicate evaluates to true.
   * @param predicate The filter method calls the predicate function one time for each value.
   */
  filter(predicate: (value: T) => unknown): ArrayLikeIterable<T>;
  /**
   * Calls the specified function with the first two values. Then for every following value, the
   * function is called with the result of the previous invocation and that value.
   * @param callbackfn
   */
  reduce(callbackfn: (previousValue: T, currentValue: T) => T): T | undefined;
  /**
   * Calls the specified function with initialValue and the first value. Then calls the function
   * for each following value with the result of the previous invocation.
   * @param callbackfn
   * @param initialValue
   */
  reduce<U>(
    callbackfn: (previousValue: U, currentValue: T) => U,
    initialValue: U
  ): U;
  /**
   * Maps every value with the given function. Then, instead of this producing the resulting
   * iterables, produce every value of the iterables in sequence.
   * @param callback A function that produces an iterable.
   */
  flatMap<U>(callback: (value: T) => Iterable<U>): ArrayLikeIterable<U>;
}

export function* flatMapIterable<T, U>(
  iter: Iterable<T>,
  f: (v: T) => Iterable<U>
): Iterable<U> {
  for (const i of iter) {
    yield* f(i);
  }
}

export function* mapIterable<T, U>(
  iter: Iterable<T>,
  f: (v: T) => U
): Iterable<U> {
  for (const i of iter) {
    yield f(i);
  }
}

export function* filterIterable<T>(
  iter: Iterable<T>,
  f: (v: T) => boolean
): Iterable<T> {
  for (const i of iter) {
    if (f(i)) yield i;
  }
}

export function reduceIterable<T>(iter: Iterable<T>, f: (l: T, r: T) => T): T {
  let a;
  for (const i of iter) {
    if (a === undefined) {
      a = i;
    } else a = f(a, i);
  }
  if (a === undefined) {
    throw new TypeError("reduce a done Iterable");
  }
  return a;
}

export function reduceIterableWithInitial<T, U>(
  iter: Iterable<T>,
  f: (l: U, r: T) => U,
  initial: U
): U {
  let a = initial;
  for (const i of iter) {
    a = f(a, i);
  }
  return a;
}

export default function ArrayLikeIterable<T>(
  iter: Iterable<T>
): ArrayLikeIterable<T> {
  return {
    [Symbol.iterator]: iter[Symbol.iterator],
    every(pred: (v: T) => boolean): boolean {
      for (const i of iter) {
        if (!pred(i)) return false;
      }
      return true;
    },
    some(pred: (v: T) => boolean): boolean {
      for (const i of iter) {
        if (pred(i)) return true;
      }
      return false;
    },
    forEach(f: (v: T) => void): void {
      for (const i of iter) {
        f(i);
      }
    },
    map<U>(f: (v: T) => U): ArrayLikeIterable<U> {
      return ArrayLikeIterable(mapIterable(iter, f));
    },
    filter(pred: (v: T) => boolean): ArrayLikeIterable<T> {
      return ArrayLikeIterable(filterIterable(iter, pred));
    },
    reduce<U>(f: (v: U, u: T) => U, initial?: U): U | undefined {
      if (initial === undefined)
        return (reduceIterable(
          iter,
          (f as unknown) as (l: T, r: T) => T
        ) as unknown) as U;
      else return reduceIterableWithInitial(iter, f, initial as U);
    },
    flatMap<U>(f: (v: T) => Iterable<U>): ArrayLikeIterable<U> {
      return ArrayLikeIterable(flatMapIterable(iter, f));
    }
  };
}
