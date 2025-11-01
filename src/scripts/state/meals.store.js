import { createStore } from './index.js';

/**
 * Meals Store
 * Manages meals and weekly menu state
 */
export const mealsStore = createStore('meals', (set, get) => ({
  // State
  meals: [],
  weeklyMenu: null,
  addOns: [],
  selectedCategory: null,
  searchQuery: '',
  sortBy: 'name',
  sortOrder: 'asc',
  isLoading: false,
  
  // Actions
  setMeals: (meals) => {
    set({ meals });
  },
  
  setWeeklyMenu: (menu) => {
    set({ weeklyMenu: menu });
  },
  
  setAddOns: (addOns) => {
    set({ addOns });
  },
  
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },
  
  setSortBy: (sortBy) => {
    set({ sortBy });
  },
  
  setSortOrder: (order) => {
    set({ sortOrder: order });
  },
  
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  clearFilters: () => {
    set({
      selectedCategory: null,
      searchQuery: '',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  },
  
  // Selectors
  getFilteredMeals: () => {
    const { meals, selectedCategory, searchQuery, sortBy, sortOrder } = get();
    
    let filtered = [...meals];
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((meal) => meal.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (meal) =>
          meal.name.toLowerCase().includes(query) ||
          (meal.nameAr && meal.nameAr.includes(searchQuery)) ||
          (meal.description && meal.description.toLowerCase().includes(query))
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    
    return filtered;
  },
  
  getAvailableMeals: () => {
    const meals = get().meals;
    return meals.filter((meal) => meal.isAvailable);
  },
  
  getMealById: (id) => {
    const meals = get().meals;
    return meals.find((meal) => meal.id === id);
  },
  
  getWeeklyMenuMeals: () => {
    const menu = get().weeklyMenu;
    if (!menu || !menu.meals) {
      return [];
    }
    return menu.meals.map((item) => item.meal);
  },
}));

export default mealsStore;