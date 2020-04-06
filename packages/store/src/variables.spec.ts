import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import inkStore, { types } from '.';
import { getVariable, getVariableByName } from './store/variables/selectors';
import { updateVariable } from './store/actions';
import reducer from './store/reducers';

const store = createStore(
  reducer,
  applyMiddleware(
    thunkMiddleware,
    inkStore.triggerEvaluateMiddleware,
    inkStore.evaluateMiddleware,
  ),
) as types.Store;

describe('integration', () => {
  it('should evaluate the variable', () => {
    const x = store.dispatch(inkStore.actions.createVariable('scope.x', null, '1 + 1'));

    // Ensure that noops do not trigger a state change
    const store1 = store.getState();
    const state1 = x.variable;
    x.set(null, '1 + 1');
    const store2 = store.getState();
    const state2 = x.variable;
    expect(state1 === state2).toBe(true);
    expect(store1.variables === store2.variables).toBe(true);
    x.set(null, '0 + 2');
    const state3 = x.variable;
    // Just to be sure it isn't giving back the same thing!
    expect(state1 === state3).toBe(false);

    expect(getVariable(store.getState(), x.id)?.current).toEqual(2);

    const name2 = 'scope.y';
    const y = store.dispatch(inkStore.actions.createVariable(name2, null, 'x + 1'));
    expect(getVariableByName(store.getState(), name2)?.current).toEqual(3);
    expect(y.scope).toEqual(name2.split('.')[0]);
    expect(y.name).toEqual(name2.split('.')[1]);
    expect(y.variable?.value).toBeNull();
    expect(y.variable?.current).toEqual(3);
    expect(y.variable?.func).toEqual('x + 1');
    expect(y.get()).toEqual(3);
    y.set(42);
    expect(y.get()).toEqual(42);
    expect(y.variable?.func).toEqual('');
    y.set(null, 'y');
    expect(y.variable?.error).toBeTruthy();
    // Update it another way and get a different object
    const otherY = store.dispatch(updateVariable(y.id, null, 'x'));
    expect(otherY === y).toBeFalsy();
    expect(y.get()).toEqual(2);
    expect(y.variable?.error).toBeUndefined();
    expect(otherY.get()).toEqual(2);
    expect(otherY.variable?.error).toBeUndefined();

    // Set to a different scope
    y.set(null, 'x', { scope: 'other' });
    expect(y.get()).toBeNull();
    expect(y.variable?.error).toBeTruthy();
    // Bad scope/name
    expect(() => y.set(null, 'x', { scope: '+' })).toThrow();
    expect(() => y.set(null, 'x', { name: '⭐' })).toThrow();

    // After remove, things are undefined and you cannot set
    otherY.remove();
    expect(y.get()).toBeUndefined();
    expect(y.variable).toBeUndefined();
    expect(() => y.set(42)).toThrow();
  });

  it('should return NaN and Infinity', () => {
    const nan = store.dispatch(inkStore.actions.createVariable('scope.nan', NaN));
    expect(nan.get()).toBeNaN();
    nan.set(null, 'NaN');
    expect(nan.get()).toBeNaN();
    nan.set(Infinity);
    expect(nan.get()).toBe(Infinity);
    nan.set(null, 'Infinity');
    expect(nan.get()).toBe(Infinity);
    nan.set(-Infinity);
    expect(nan.get()).toBe(-Infinity);
    nan.set(null, '-Infinity');
    expect(nan.get()).toBe(-Infinity);
  });
});
