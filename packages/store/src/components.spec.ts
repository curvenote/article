import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import ink, { types, actions } from '.';
import rootReducer from './store/reducers';
import { PropTypes } from './store/types';

const rangeProps = {
  value: { type: PropTypes.number, default: 0 },
  min: { type: PropTypes.number, default: 0 },
  max: { type: PropTypes.number, default: 100 },
};
const rangeEvents = {
  change: { args: ['value'] },
};

const store: types.Store = createStore(
  rootReducer,
  applyMiddleware(
    thunkMiddleware,
    ink.triggerEvaluateMiddleware,
    ink.evaluateMiddleware,
  ),
);

store.dispatch(actions.createComponentSpec(
  'range',
  rangeProps,
  rangeEvents,
));

describe('integration', () => {
  it('should evaluate the variable', () => {
    const x = store.dispatch(ink.actions.createVariable('scope.x', 3));
    const max = store.dispatch(ink.actions.createVariable('scope.max', 9));

    const range = store.dispatch(ink.actions.createComponent(
      'range', 'scope.myRange',
      { value: { func: 'x' }, min: { value: 1 }, max },
      { change: { func: '{x: value}' } },
    ));

    expect(range.component?.properties.value.func).toBe('x');
    // You can set through the variable shortcut, which sets to a function
    expect(range.component?.properties.max.func).toBe('max');
    expect(range.state.min).toBe(1);
    expect(x.get()).toBe(3);
    expect(range.state.value).toBe(3);
    expect(range.state.max).toBe(9);
    // Change through event
    range.dispatchEvent('change', [5]);
    expect(range.state.min).toBe(1);
    expect(x.get()).toBe(5);
    expect(range.state.value).toBe(5);
    expect(range.state.max).toBe(9);
    // Change through setting the variable
    x.set(4);
    expect(range.state.min).toBe(1);
    expect(x.get()).toBe(4);
    expect(range.state.value).toBe(4);
    expect(range.state.max).toBe(9);
  });
});
