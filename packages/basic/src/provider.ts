import { Unsubscribe } from 'redux';
import { v4 as uuid } from 'uuid';
import { types } from '@iooxa/ink-store';

class Ref {
  #current?: types.Store = undefined;

  get current() {
    if (this.#current === undefined) throw new Error('Must init store.');
    return this.#current;
  }

  set current(store: types.Store) {
    this.#current = store;
  }
}

const storeRef = new Ref();

const subscriptions: {[index: string]: {id: string, listener:()=>void}} = {};

function subscribe(id: string, listener: () => void): Unsubscribe {
  const key = uuid();
  subscriptions[key] = { id, listener };
  return () => delete subscriptions[key];
}

let currentState: types.State;
function notify(store: types.Store) {
  const previousState = currentState;
  const state = store.getState();
  currentState = { variables: state.variables, components: state.components };
  if (
    previousState.variables === currentState.variables
    && previousState.components === currentState.components
  ) return;
  Object.keys(subscriptions).forEach((key: string) => {
    const { id, listener } = subscriptions[key];
    const prev = previousState.variables[id] ?? previousState.components.components[id];
    const next = currentState.variables[id] ?? currentState.components.components[id];
    if (prev === next) return;
    listener();
  });
}


export function setup(store: types.Store) {
  // eslint-disable-next-line no-underscore-dangle
  storeRef.current = store;
  currentState = { variables: store.getState().variables, components: store.getState().components };
  store.subscribe(() => notify(store));
}

export const store = {
  get getState() { return storeRef.current.getState; },
  get dispatch() { return storeRef.current.dispatch; },
  subscribe: (id: string, listener: () => void): Unsubscribe => subscribe(id, listener),
};
