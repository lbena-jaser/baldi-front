import { create } from 'zustand';

// Helper to create store (vanilla JS compatible)
export function createStore(name, stateCreator) {
  const store = create(stateCreator);
  
  // Make it work with vanilla JS (no hooks needed)
  return {
    getState: store.getState,
    setState: store.setState,
    subscribe: store.subscribe,
    destroy: store.destroy,
  };
}

export default createStore;