import { applyMiddleware, createStore, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import ink, { types, setup } from '@iooxa/runtime';
import * as basic from '@iooxa/ink-basic';
import '@iooxa/ink-basic/dist/ink.css';
import * as components from './src/components';
import './styles/index.css';
import './index.css';

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
    combineReducers({ ink: ink.reducer }),
    applyMiddleware(
      thunkMiddleware,
      ink.triggerEvaluate,
      ink.dangerousEvaluatation,
    ),
  ) as types.Store,
};

setup(window.ink.store);
basic.register();
components.register();
