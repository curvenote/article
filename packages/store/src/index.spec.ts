import { createStore, combineReducers, applyMiddleware } from 'redux';
import inkStore, { types } from '.';

const rootReducer = combineReducers({
  variables: inkStore.variablesReducer,
});

const store = createStore(
  rootReducer,
  applyMiddleware(inkStore.triggerEvaluateMiddleware, inkStore.evaluateMiddleware),
);

describe('store and middleaware', () => {
  it('should evaluate the variable', () => {
    store.dispatch(inkStore.actions.createVariable('myScope', 'myScope', {
      name: 'myVar',
      description: '',
      type: types.VariableKinds.number,
      value: null,
      valueFunction: '1 + 1',
      format: '.2f',
    }));

    expect(
      store.getState(),
    ).toEqual({
      variables: {
        scopes: {
          myScope: {
            transforms: {},
            variables: {
              myVar: {
                current: 2,
                derived: true,
                description: '',
                error: undefined,
                format: '.2f',
                name: 'myVar',
                type: 'Number',
                value: null,
                valueFunction: '1 + 1',
              },
            },
          },
        },
      },
    } as types.State);
  });
});
