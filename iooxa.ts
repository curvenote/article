import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import runtime, { types, actions, selectors } from '@iooxa/runtime';
import { register as basicRegister } from '@iooxa/components';
import { register as svgRegister } from '@iooxa/svg';
import * as components from './src/components';
import setupArticle from './src/components/article';

interface Iooxa {
  store: types.Store;
  getVariableByName: (name: string) => types.VariableShortcut | null;
  createVariable: (...args: Parameters<typeof actions.createVariable>) => types.VariableShortcut;
}

declare global {
  interface Window {
    iooxa: Iooxa;
  }
}

const store = createStore(
  combineReducers({ runtime: runtime.reducer }),
  applyMiddleware(
    thunkMiddleware,
    runtime.triggerEvaluate,
    runtime.dangerousEvaluatation,
  ),
) as types.Store;

function getVariableByName(name: string) {
  const variable = selectors.getVariableByName(store.getState(), name);
  if (variable == null) return null;
  return actions.variableShortcut(store.dispatch, store.getState, variable.id);
}

window.iooxa = {
  ...window.iooxa,
  store,
  getVariableByName,
  createVariable: (...args) => store.dispatch(actions.createVariable(...args)),
} as Iooxa;

basicRegister(window.iooxa.store);
svgRegister(window.iooxa.store);
components.register(window.iooxa.store);
setupArticle();
