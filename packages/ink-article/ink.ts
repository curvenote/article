import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import inkStore, { types, setup } from '@iooxa/runtime';
import * as basic from '@iooxa/ink-basic';
import '@iooxa/ink-basic/dist/ink.css';
import * as components from './src/components';
import './styles/index.css';

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
  components: { ...window.ink?.components, ...basic, ...components },
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
basic.register();
components.register();
