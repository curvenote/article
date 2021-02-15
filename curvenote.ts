import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import runtime, { types, actions, selectors } from '@curvenote/runtime';
import { register as basicRegister } from '@curvenote/components';
import { register as svgRegister } from '@curvenote/svg';
import * as components from './src/components';
import setupArticle from './src/components/article';

interface Curvenote {
  store: types.Store;
  getVariableByName: (name: string) => types.VariableShortcut | null;
  createVariable: (...args: Parameters<typeof actions.createVariable>) => types.VariableShortcut;
}

declare global {
  interface Window {
    curvenote: Curvenote;
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

window.curvenote = {
  ...window.curvenote,
  store,
  getVariableByName,
  createVariable: (...args) => store.dispatch(actions.createVariable(...args)),
} as Curvenote;

basicRegister(window.curvenote.store);
svgRegister(window.curvenote.store);
components.register(window.curvenote.store);
setupArticle();
