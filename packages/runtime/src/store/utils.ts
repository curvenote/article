import { isEqual } from 'underscore';
import { Variable, CurrentValue } from './variables/types';
import { ComponentProperty } from './components/types';

export function forEachObject<T, O>(
  obj: Record<string, T>,
  func: (keyValue: [string, T]) => [string, O],
): Record<string, O> {
  return Object.fromEntries(Object.entries(obj).map(func));
}

export function compareDefine(
  prev: Variable | ComponentProperty,
  next: Variable | ComponentProperty,
) {
  const one = { ...prev };
  const two = { ...next };
  delete one.current;
  delete two.current;
  delete one.error;
  delete two.error;
  return isEqual(one, two);
}

export function compareEval(prev: CurrentValue, next: CurrentValue) {
  const one = { value: prev.current, error: prev.error };
  const two = { value: next.current, error: next.error };
  return isEqual(one, two);
}
