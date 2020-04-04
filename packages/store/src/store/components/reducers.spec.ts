import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducers';
import * as actions from './actions';
import { PropTypes } from '../variables/types';
import { getComponentSpec } from './selectors';
import { ComponentSpec, ComponentShortcut } from './types';

const initialState = {
  specs: {},
  components: {},
};

const store = createStore(
  combineReducers({ components: reducer }),
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
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual(initialState);
  });

  it('should create component specs', () => {
    const range = store.dispatch(actions.createComponentSpec(
      'range',
      rangeProps,
      rangeEvents,
    ) as any) as ComponentSpec;

    const rangeState = getComponentSpec(store.getState(), 'range');
    expect(rangeState).toBeTruthy();
    expect(range.properties.min.name).toBe('min');
    expect(range.properties.min.funcOnly).toBe(false);
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
    const range = store.dispatch(actions.createComponent('range', 'hi', { min: { value: 2 }, max: { value: null } }, {}) as any) as ComponentShortcut<keyof typeof rangeProps>;

    expect(range.scope).toBe('global');
    expect(range.name).toBe('hi');
    expect(range.state?.min).toBe(2);
    expect(range.state?.max).toBe(100);
  });
});
