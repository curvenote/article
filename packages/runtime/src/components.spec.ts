import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import ink, { types, actions } from '.';
import reducer from './store/reducers';
import { PropTypes } from './store/types';

const rangeProps = {
  value: { type: PropTypes.number, default: 0 },
  min: { type: PropTypes.number, default: 0 },
  max: { type: PropTypes.number, default: 100 },
};
const rangeEvents = {
  change: { args: ['value'] },
};

const store = createStore(
  combineReducers({ ink: reducer }),
  applyMiddleware(
    thunkMiddleware,
    ink.triggerEvaluate,
    ink.dangerousEvaluatation,
  ),
) as types.Store;

store.dispatch(actions.createComponentSpec(
  'range',
  rangeProps,
  rangeEvents,
));

describe('integration', () => {
  it('should evaluate the variable', () => {
    const x = store.dispatch(ink.actions.createVariable('scope.x', 3));
    const max = store.dispatch(ink.actions.createVariable('scope.max', 9));
    const otherMax = store.dispatch(ink.actions.createVariable('scope.max2', 8));

    const range = store.dispatch(ink.actions.createComponent(
      'range', 'scope.myRange',
      { value: { func: 'x' }, min: { value: 1 }, max },
      { change: { func: '{x: value}' } },
    ));

    expect(range.component?.properties.value.func).toBe('x');
    // You can set through the variable shortcut, which sets to a function
    expect(range.component?.properties.max.func).toBe('max');
    expect(range.state?.min).toBe(1);
    expect(x.get()).toBe(3);
    expect(range.state?.value).toBe(3);
    expect(range.state?.max).toBe(9);
    // Change through event
    range.dispatchEvent('change', [5]);
    expect(range.state?.min).toBe(1);
    expect(x.get()).toBe(5);
    expect(range.state?.value).toBe(5);
    expect(range.state?.max).toBe(9);
    // Change through setting the variable
    x.set(4);
    expect(range.state?.min).toBe(1);
    expect(x.get()).toBe(4);
    expect(range.state?.value).toBe(4);
    expect(range.state?.max).toBe(9);

    // Setting things to something else:
    range.set({ max: otherMax });
    expect(range.state?.min).toBe(1);
    expect(x.get()).toBe(4);
    expect(range.state?.value).toBe(4);
    expect(range.state?.max).toBe(8);

    // Ensure that noops do not trigger a state change
    const store1 = store.getState();
    const state1 = range.component;
    max.set(9);
    otherMax.set(8);
    range.set(
      { value: { func: 'x' }, max: otherMax },
      { change: { func: '{x: value}' } },
    );
    const store2 = store.getState();
    const state2 = range.component;
    expect(state1).toEqual(state2);
    expect(state1 === state2).toBe(true);
    expect(store1.ink.variables === store2.ink.variables).toBe(true);
    expect(store1.ink.components === store2.ink.components).toBe(true);
    range.set(
      { value: { func: 'x + 1' } },
    );
    const state3 = range.component;
    // Just to be sure it isn't giving back the same thing!
    expect(state1 === state3).toBe(false);

    // Remove it!
    range.remove();
    expect(x.get()).toBe(4);
    expect(range.state).toEqual({});
  });
});
