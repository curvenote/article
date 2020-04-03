export type Dictionary<T> = { [index: string]: T };

export function forEachObject<T, O>(
  obj: Dictionary<T>,
  func: (keyValue: [string, T]) => [string, O],
): Dictionary<O> {
  return Object.fromEntries(Object.entries(obj).map(func));
}
