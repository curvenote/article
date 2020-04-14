import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducers';
import * as actions from './actions';
import { PropTypes } from '../variables/types';
import { getComponentSpec } from './selectors';
import { ComponentSpec } from './types';
import { DEFAULT_SCOPE } from '../../constants';
import { ComponentShortcut } from '../shortcuts';

const store = createStore(
  combineReducers({ ink: combineReducers({ components: reducer }) }),
  applyMiddleware(
    thunkMiddleware,
  ),
);

const rangeProps = {
  value: { type: PropTypes.number, default: 0 },
  min: { type: PropTypes.number, default: 0 },
  max: { type: PropTypes.number, default: 100 },
};
const rangeEvents = {
  change: { args: ['value'] },
};

describe('Components reducer', () => {
  it('should create component specs', () => {
    const range = store.dispatch(actions.createComponentSpec(
      'range',
      rangeProps,
      rangeEvents,
    ) as any) as ComponentSpec;

    const rangeState = getComponentSpec(store.getState(), 'range');
    expect(rangeState).toBeTruthy();
    expect(range.properties.min.name).toBe('min');
    expect(range.properties.min.has.func).toBe(true);
    expect(range.properties.min.default).toBe(0);
    expect(range.properties.something).toBeUndefined();
  });

  it('should create component', () => {
    const badName = actions.createComponent('notRange', '', {}, {});
    expect(() => store.dispatch(badName as any)).toThrow();
    const notRange = actions.createComponent('notRange', 'a', {}, {});
    expect(() => store.dispatch(notRange as any)).toThrow();
    const badRange = actions.createComponent('range', 'a', { blah: { value: 2 } }, {});
    expect(() => store.dispatch(badRange as any)).toThrow();
    // The null max should likely throw?
    // TODO: The scope should be set rather than the var name.
    const range = store.dispatch(actions.createComponent('range', 'hi', { min: { value: 2 }, max: { value: null } }, {}) as any) as ComponentShortcut<Record<keyof typeof rangeProps, number>>;

    expect(range.scope).toBe(DEFAULT_SCOPE);
    expect(range.name).toBe('hi');
    expect(range.state?.min).toBe(2);
    expect(range.state?.max).toBe(100);
  });
});
