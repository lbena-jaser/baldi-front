import api from '../core/api.js';
import cacheService from '../core/cache.js';
import { API_ENDPOINTS, CACHE_KEYS } from '../config/constants.js';

class MealService {
  // Get all meals
  async getMeals(params = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.MEALS, { params });
      
      // Cache meals
      if (response.data && response.data.length > 0) {
        await cacheService.set(CACHE_KEYS.MEALS, response.data);
      }
      
      return response;
    } catch (error) {
      // Try to return cached data if offline
      if (!navigator.onLine) {
        const cachedMeals = await cacheService.getAll(CACHE_KEYS.MEALS);
        if (cachedMeals.length > 0) {
          return { data: cachedMeals };
        }
      }
      throw error;
    }
  }
  
  // Get meal by ID
  async getMeal(id) {
    try {
      const response = await api.get(API_ENDPOINTS.MEAL(id));
      
      // Cache meal
      await cacheService.set(CACHE_KEYS.MEALS, id, response.data);
      
      return response.data;
    } catch (error) {
      // Try cached version
      if (!navigator.onLine) {
        const cachedMeal = await cacheService.get(CACHE_KEYS.MEALS, id);
        if (cachedMeal) {
          return cachedMeal;
        }
      }
      throw error;
    }
  }
  
  // Get current week menu
  async getCurrentWeekMenu() {
    try {
      const response = await api.get(API_ENDPOINTS.WEEKLY_MENU);
      
      // Cache menu
      if (response.data) {
        await cacheService.set(CACHE_KEYS.MENUS, response.data.id, response.data);
      }
      
      return response.data;
    } catch (error) {
      // Try cached version
      if (!navigator.onLine) {
        const cachedMenus = await cacheService.getAll(CACHE_KEYS.MENUS);
        if (cachedMenus.length > 0) {
          return cachedMenus[0]; // Return latest
        }
      }
      throw error;
    }
  }
  
  // Get add-ons
  async getAddOns(params = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.ADD_ONS, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  // Filter meals by category
  filterByCategory(meals, category) {
    if (!category) {
      return meals;
    }
    return meals.filter((meal) => meal.category === category);
  }
  
  // Filter meals by availability
  filterByAvailability(meals, isAvailable = true) {
    return meals.filter((meal) => meal.isAvailable === isAvailable);
  }
  
  // Search meals
  searchMeals(meals, query) {
    if (!query) {
      return meals;
    }
    
    const lowerQuery = query.toLowerCase();
    
    return meals.filter((meal) => {
      return (
        meal.name.toLowerCase().includes(lowerQuery) ||
        (meal.nameAr && meal.nameAr.includes(query)) ||
        (meal.description && meal.description.toLowerCase().includes(lowerQuery))
      );
    });
  }
  
  // Sort meals
  sortMeals(meals, sortBy = 'name', order = 'asc') {
    const sorted = [...meals].sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });
    
    return sorted;
  }
  
  // Calculate macros for multiple meals
  calculateTotalMacros(meals) {
    return meals.reduce(
      (totals, item) => {
        const quantity = item.quantity || 1;
        return {
          calories: totals.calories + item.meal.calories * quantity,
          protein: totals.protein + item.meal.protein * quantity,
          carbs: totals.carbs + item.meal.carbs * quantity,
          fats: totals.fats + item.meal.fats * quantity,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  }
}

export default new MealService();