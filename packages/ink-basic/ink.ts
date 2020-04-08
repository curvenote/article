import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import inkStore, { types } from '@iooxa/runtime';
import * as components from './src/components';
import './src/index.css';

import { setup } from './src/provider';

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
    inkStore.reducer,
    applyMiddleware(
      thunkMiddleware,
      inkStore.triggerEvaluateMiddleware,
      inkStore.evaluateMiddleware,
    ),
  ),
};

setup(window.ink.store);
components.register();
