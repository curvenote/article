import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import inkStore, { types } from '.';
import { getVariable } from './store/variables/selectors';

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

describe('store and middleaware', () => {
  it('should evaluate the variable', () => {
    const id1 = store.dispatch(inkStore.actions.createVariable('scope.x', null, '1 + 1'));

    expect(getVariable(store.getState(), id1)?.current).toEqual(2);

    const id2 = store.dispatch(inkStore.actions.createVariable('scope.y', null, 'x + 1'));

    expect(
      store.getState(),
    ).toEqual({
      variables: {
        transforms: {},
        variables: {
          [id1]: {
            id: id1,
            current: 2,
            derived: true,
            description: '',
            error: undefined,
            format: '.1f',
            scope: 'scope',
            name: 'x',
            type: 'Number',
            value: null,
            func: '1 + 1',
          },
          [id2]: {
            id: id2,
            current: 3,
            derived: true,
            description: '',
            error: undefined,
            format: '.1f',
            scope: 'scope',
            name: 'y',
            type: 'Number',
            value: null,
            func: 'x + 1',
          },
        },
      },
    } as types.State);
  });
});
