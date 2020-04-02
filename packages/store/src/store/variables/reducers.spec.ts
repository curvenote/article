import reducer from './reducers';
import * as actions from './actions';
import { VariableKinds } from './types';

const initialState = {
  scopes: {},
};

describe('todos reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual(initialState);
  });

  it('should create a variable', () => {
    expect(
      reducer(initialState, actions.createVariable('myScope', 'myScope', {
        name: 'myVar',
        description: '',
        type: VariableKinds.number,
        value: 42,
        valueFunction: '',
        format: '.2f',
      })),
    ).toEqual({
      scopes: {
        myScope: {
          transforms: {},
          variables: {
            myVar: {
              current: 42,
              derived: false,
              description: '',
              format: '.2f',
              name: 'myVar',
              type: 'Number',
              value: 42,
              valueFunction: '',
            },
          },
        },
      },
    });
  });

  it('should not evaluate the variable', () => {
    expect(
      reducer(initialState, actions.createVariable('myScope', 'myScope', {
        name: 'myVar',
        description: '',
        type: VariableKinds.number,
        value: null,
        valueFunction: '1 + 1',
        format: '.2f',
      })),
    ).toEqual({
      scopes: {
        myScope: {
          transforms: {},
          variables: {
            myVar: {
              current: null,
              derived: true,
              description: '',
              format: '.2f',
              name: 'myVar',
              type: 'Number',
              value: null,
              valueFunction: '1 + 1',
            },
          },
        },
      },
    });
  });
});
