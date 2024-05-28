import { reactive, useComputed } from './signal';

interface StoreOptions<S, G, A> {
  state?: S;
  getters?: G;
  actions?: A;
}
type PatchPayload = Record<string, any>;
type Callback = (value: any) => void;
export interface StoreActions {
  patch$: (payload: PatchPayload) => void;
  subscribe$: (callback: Callback) => void;
  unsubscribe$: (callback: Callback) => void;
  onAction$: (callback: Callback) => void;
  reset$: () => void;
}

let _id = 0;
const StoreMap = new Map<number, any>();

function createOptionsStore<S, G, A>(options: StoreOptions<S, G, A>) {
  const { state, getters, actions } = options as StoreOptions<
    Record<string | symbol, any>,
    Record<string, any>,
    Record<string, any>
  >;

  const initState = { ...(state ?? {}) };
  const reactiveState = reactive(state ?? {});

  const subscriptions: Callback[] = [];
  const actionCallbacks: Callback[] = [];
  const default_actions: StoreActions = {
    patch$(payload: PatchPayload) {
      Object.assign(reactiveState, payload);
      subscriptions.forEach(callback => callback(reactiveState));
      actionCallbacks.forEach(callback => callback(reactiveState));
    },
    subscribe$(callback: Callback) {
      subscriptions.push(callback);
    },
    unsubscribe$(callback: Callback) {
      const index = subscriptions.indexOf(callback);
      if (index !== -1) {
        subscriptions.splice(index, 1);
      }
    },
    onAction$(callback: Callback) {
      actionCallbacks.push(callback);
    },
    reset$() {
      Object.assign(reactiveState, initState);
    },
  };
  const gettersStates: Record<string | symbol, any> = {};
  const actionStates: Record<string | symbol, any> = {};
  for (const key in getters) {
    const getter = getters[key];
    if (getter) {
      gettersStates[key] = useComputed(() => {
        return getter.call(reactiveState, reactiveState);
      });
    }
  }

  for (const key in actions) {
    const action = actions[key];
    if (action) {
      actionStates[key] = action.bind(reactiveState);
    }
  }

  StoreMap.set(_id, reactiveState);
  ++_id;

  return new Proxy(
    {},
    {
      get(_, key) {
        if (key === 'state') {
          return reactiveState;
        }
        if (key in gettersStates) {
          return gettersStates[key].value;
        }
        if (key in actionStates) {
          return actionStates[key];
        }
        if (key in default_actions) {
          return default_actions[key];
        }
        return reactiveState[key];
      },
    },
  );
}

type Getters<S> = {
  [K in keyof S]: S[K] extends (...args: any[]) => any ? ReturnType<S[K]> : S[K];
};

export function createStore<S, G, A>(
  options: {
    state: S;
    getters?: G;
    actions?: A;
  } & ThisType<S & Getters<G> & A>,
): () => S & Getters<G> & A & StoreActions & { state: S } {
  return function () {
    if (StoreMap.has(_id)) {
      return StoreMap.get(_id)!;
    }

    return createOptionsStore<S, G, A>(options);
  };
}
