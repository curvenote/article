import { Unsubscribe } from 'redux';
import { v4 as uuid } from 'uuid';
import { State, Store } from './store/types';

class Ref<T = Store> {
  #current?: T = undefined;

  get current() {
    if (this.#current === undefined) throw new Error('Must init store.');
    return this.#current;
  }

  set current(store: T) {
    this.#current = store;
  }
}

const storeRef = new Ref();

const subscriptions: {[index: string]: {id: string | null, listener:()=>void}} = {};

function subscribe(id: string | null, listener: () => void): Unsubscribe {
  const key = uuid();
  subscriptions[key] = { id, listener };
  return () => delete subscriptions[key];
}

let currentState: State;
function notify(store: Store) {
  const previousState = currentState;
  const state = store.getState();
  currentState = { variables: state.variables, components: state.components };
  if (
    previousState.variables === currentState.variables
    && previousState.components === currentState.components
  ) return;
  Object.keys(subscriptions).forEach((key: string) => {
    const { id, listener } = subscriptions[key];
    if (id == null) {
      listener();
      return;
    }
    const prev = previousState.variables[id] ?? previousState.components.components[id];
    const next = currentState.variables[id] ?? currentState.components.components[id];
    if (prev === next) return;
    listener();
  });
}

export function setup(store: Store) {
  storeRef.current = store;
  currentState = { variables: store.getState().variables, components: store.getState().components };
  store.subscribe(() => notify(store));
}

const provider = {
  get getState() { return storeRef.current.getState; },
  get dispatch() { return storeRef.current.dispatch; },
  subscribe: (id: string | null, listener: () => void): Unsubscribe => subscribe(id, listener),
};

export default provider;
