import { format } from 'd3-format';
import { types, DEFAULT_FORMAT } from '@iooxa/runtime';

// eslint-disable-next-line import/prefer-default-export
export function formatter(
  value: any, formatString?: string, variable?: types.Variable,
) {
  if (typeof value === 'string') { return value; }
  if (typeof value === 'boolean') { return value ? 'true' : 'false'; }
  try {
    return format(formatString ?? variable?.format ?? DEFAULT_FORMAT)(value);
  } catch (error) {
    try {
      return format(DEFAULT_FORMAT)(value);
    } catch (error2) {
      return value;
    }
  }
}
