import { format } from 'd3-format';
import { types } from '@iooxa/ink-store';

export const DEFAULT_FORMAT = '.1f';

// eslint-disable-next-line import/prefer-default-export
export function formatter(
  value: any, formatString?: string, variable?: types.Variable,
) {
  if (typeof value === 'string') { return value; }
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
