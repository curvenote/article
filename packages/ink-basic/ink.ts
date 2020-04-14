import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import ink, { types, setup } from '@iooxa/runtime';
import * as components from './src/components';
import './src/index.css';

declare global {
  interface Window {
    ink: {
      store: types.Store;
      components: { [index: string]: any};
    }
  }
}

window.ink = {
  ...window.ink,
  components: { ...window.ink?.components, ...components },
  store: createStore(
    combineReducers({ ink: ink.reducer }),
    applyMiddleware(
      thunkMiddleware,
      ink.triggerEvaluate,
      ink.dangerousEvaluatation,
    ),
  ) as types.Store,
};

setup(window.ink.store);
components.register();
