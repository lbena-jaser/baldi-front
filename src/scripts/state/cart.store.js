import { createStore } from './index.js';
import storage from '../core/storage.js';
import { STORAGE_KEYS } from '../config/constants.js';
import eventBus, { EVENTS } from '../core/events.js';

export const cartStore = createStore('cart', (set, get) => ({
  // State
  items: storage.get(STORAGE_KEYS.CART)?.items || [],
  addOns: storage.get(STORAGE_KEYS.CART)?.addOns || [],
  discountCode: null,
  discountAmount: 0,
  deliveryAddressId: null,
  notes: '',
  
  // Actions
  addMeal: (meal, quantity = 1) => {
    const state = get();
    const existing = state.items.find((item) => item.mealId === meal.id);
    
    let newItems;
    if (existing) {
      newItems = state.items.map((item) =>
        item.mealId === meal.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...state.items, { mealId: meal.id, meal, quantity }];
    }
    
    set({ items: newItems });
    get().saveToStorage();
    eventBus.emit(EVENTS.CART_ITEM_ADDED, { meal, quantity });
    eventBus.emit(EVENTS.CART_UPDATED);
  },
  
  removeMeal: (mealId) => {
    const state = get();
    const newItems = state.items.filter((item) => item.mealId !== mealId);
    
    set({ items: newItems });
    get().saveToStorage();
    eventBus.emit(EVENTS.CART_ITEM_REMOVED, { mealId });
    eventBus.emit(EVENTS.CART_UPDATED);
  },
  
  updateMealQuantity: (mealId, quantity) => {
    if (quantity <= 0) {
      get().removeMeal(mealId);
      return;
    }
    
    const state = get();
    const newItems = state.items.map((item) =>
      item.mealId === mealId ? { ...item, quantity } : item
    );
    
    set({ items: newItems });
    get().saveToStorage();
    eventBus.emit(EVENTS.CART_UPDATED);
  },
  
  addAddOn: (addOn, quantity = 1) => {
    const state = get();
    const existing = state.addOns.find((item) => item.addOnId === addOn.id);
    
    let newAddOns;
    if (existing) {
      newAddOns = state.addOns.map((item) =>
        item.addOnId === addOn.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newAddOns = [...state.addOns, { addOnId: addOn.id, addOn, quantity }];
    }
    
    set({ addOns: newAddOns });
    get().saveToStorage();
    eventBus.emit(EVENTS.CART_UPDATED);
  },
  
  removeAddOn: (addOnId) => {
    const state = get();
    const newAddOns = state.addOns.filter((item) => item.addOnId !== addOnId);
    
    set({ addOns: newAddOns });
    get().saveToStorage();
    eventBus.emit(EVENTS.CART_UPDATED);
  },
  
  setDiscountCode: (code, amount) => {
    set({ discountCode: code, discountAmount: amount });
    get().saveToStorage();
    eventBus.emit(EVENTS.CART_UPDATED);
  },
  
  clearDiscount: () => {
    set({ discountCode: null, discountAmount: 0 });
    get().saveToStorage();
    eventBus.emit(EVENTS.CART_UPDATED);
  },
  
  setDeliveryAddress: (addressId) => {
    set({ deliveryAddressId: addressId });
    get().saveToStorage();
  },
  
  setNotes: (notes) => {
    set({ notes });
    get().saveToStorage();
  },
  
  clearCart: () => {
    set({
      items: [],
      addOns: [],
      discountCode: null,
      discountAmount: 0,
      deliveryAddressId: null,
      notes: '',
    });
    storage.remove(STORAGE_KEYS.CART);
    eventBus.emit(EVENTS.CART_CLEARED);
  },
  
  // Persistence
  saveToStorage: () => {
    const state = get();
    storage.set(STORAGE_KEYS.CART, {
      items: state.items,
      addOns: state.addOns,
    });
  },
  
  // Selectors
  getTotalMeals: () => {
    const state = get();
    return state.items.reduce((sum, item) => sum + item.quantity, 0);
  },
  
  getSubtotal: () => {
    const state = get();
    
    const mealsTotal = state.items.reduce(
      (sum, item) => sum + item.meal.price * item.quantity,
      0
    );
    
    const addOnsTotal = state.addOns.reduce(
      (sum, item) => sum + item.addOn.price * item.quantity,
      0
    );
    
    return mealsTotal + addOnsTotal;
  },
  
  getTotal: () => {
    const state = get();
    const subtotal = get().getSubtotal();
    return Math.max(0, subtotal - state.discountAmount);
  },
  
  isValidOrder: () => {
    const totalMeals = get().getTotalMeals();
    const state = get();
    return totalMeals >= 5 && totalMeals <= 20 && state.deliveryAddressId;
  },
}));

export default cartStore;