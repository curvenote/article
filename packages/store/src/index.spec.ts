import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import inkStore, { types } from '.';

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
    const id = store.dispatch(inkStore.actions.createVariable('myScope.myVar', null, '1 + 1'));

    expect(
      store.getState(),
    ).toEqual({
      variables: {
        scopes: {
          myScope: {
            transforms: {},
            variables: {
              [id]: {
                id,
                current: 2,
                derived: true,
                description: '',
                error: undefined,
                format: '.1f',
                scope: 'myScope',
                name: 'myVar',
                type: 'Number',
                value: null,
                func: '1 + 1',
              },
            },
          },
        },
      },
    } as types.State);
  });
});
