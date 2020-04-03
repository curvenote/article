import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import inkStore, { types } from '.';
import { getVariable, getVariableByName } from './store/variables/selectors';
import { updateVariable } from './store/actions';

const rootReducer = combineReducers({
  variables: inkStore.variablesReducer,
});

const store: types.Store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware,
    inkStore.triggerEvaluateMiddleware,
    inkStore.evaluateMiddleware,
  ),
);

describe('integration', () => {
  it('should evaluate the variable', () => {
    const x = store.dispatch(inkStore.actions.createVariable('scope.x', null, '1 + 1'));

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
});
