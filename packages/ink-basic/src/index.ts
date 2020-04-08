import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import inkStore, { types } from '@iooxa/runtime';
import * as components from './components';
import './index.css';

import { setup } from './provider';

export const go = () => {
  const store: types.Store = createStore(
    inkStore.reducer,
    applyMiddleware(
      thunkMiddleware,
      inkStore.triggerEvaluateMiddleware,
      inkStore.evaluateMiddleware,
    ),
  );
  setup(store);
  window.ink.store = store;
  components.register();
};

export { components };
declare global {
  interface Window {
    ink: {
      go: () => void;
      store: types.Store;
      components: { [index: string]: any};
    }
  }
}

window.ink = {
  ...window.ink,
  go,
  components: { ...window.ink?.components, ...components },
};
