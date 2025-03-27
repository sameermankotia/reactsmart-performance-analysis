/**
 * Storage Utilities
 * 
 * Utilities for managing persistent storage of user interaction data,
 * prediction models, and component metrics in a privacy-conscious way.
 */

// Constants
const STORAGE_KEYS = {
    INTERACTION_DATA: 'reactsmart_interactions',
    COMPONENT_USAGE: 'reactsmart_component_usage',
    PREDICTION_MODEL: 'reactsmart_prediction_model',
    USER_PREFERENCES: 'reactsmart_user_prefs',
    SESSION_ID: 'reactsmart_session_id',
    LAST_CLEANUP: 'reactsmart_last_cleanup'
  };
  
  const DEFAULT_EXPIRY = 30; // days
  
  /**
   * Initialize storage for ReactSmart
   * Ensures required storage structures exist
   */
  export const initializeStorage = () => {
    try {
      // Check if localStorage is available
      if (!isLocalStorageAvailable()) {
        console.warn('ReactSmart: localStorage is not available, using in-memory storage');
        window._reactSmartMemoryStorage = window._reactSmartMemoryStorage || {};
        return false;
      }
      
      // Initialize interaction data if it doesn't exist
      if (!localStorage.getItem(STORAGE_KEYS.INTERACTION_DATA)) {
        localStorage.setItem(STORAGE_KEYS.INTERACTION_DATA, JSON.stringify([]));
      }
      
      // Initialize component usage data if it doesn't exist
      if (!localStorage.getItem(STORAGE_KEYS.COMPONENT_USAGE)) {
        localStorage.setItem(STORAGE_KEYS.COMPONENT_USAGE, JSON.stringify({}));
      }
      
      // Initialize session ID if it doesn't exist
      if (!localStorage.getItem(STORAGE_KEYS.SESSION_ID)) {
        const sessionId = generateSessionId();
        localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
      }
      
      // Record last cleanup time if it doesn't exist
      if (!localStorage.getItem(STORAGE_KEYS.LAST_CLEANUP)) {
        localStorage.setItem(STORAGE_KEYS.LAST_CLEANUP, Date.now().toString());
      }
      
      return true;
    } catch (error) {
      console.error('ReactSmart: Error initializing storage', error);
      return false;
    }
  };
  
  /**
   * Check if localStorage is available
   * @returns {boolean} Whether localStorage is available
   */
  export const isLocalStorageAvailable = () => {
    try {
      const testKey = 'reactsmart_test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Generate a unique session ID
   * @returns {string} Unique session ID
   */
  export const generateSessionId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };
  
  /**
   * Get current session ID
   * @returns {string} Current session ID
   */
  export const getSessionId = () => {
    if (isLocalStorageAvailable()) {
      return localStorage.getItem(STORAGE_KEYS.SESSION_ID) || generateSessionId();
    } else {
      return window._reactSmartMemoryStorage?.sessionId || generateSessionId();
    }
  };
  
  /**
   * Store interaction data
   * @param {Object} interaction - Interaction data to store
   */
  export const storeInteraction = (interaction) => {
    try {
      if (!interaction) return;
      
      // Add timestamp and session ID if not present
      const enhancedInteraction = {
        ...interaction,
        timestamp: interaction.timestamp || Date.now(),
        sessionId: getSessionId()
      };
      
      if (isLocalStorageAvailable()) {
        // Get existing interactions
        const interactionsJson = localStorage.getItem(STORAGE_KEYS.INTERACTION_DATA);
        const interactions = interactionsJson ? JSON.parse(interactionsJson) : [];
        
        // Add new interaction
        interactions.push(enhancedInteraction);
        
        // Store limited number of interactions (last 100)
        const limitedInteractions = interactions.slice(-100);
        
        // Save back to localStorage
        localStorage.setItem(STORAGE_KEYS.INTERACTION_DATA, JSON.stringify(limitedInteractions));
      } else {
        // In-memory storage fallback
        window._reactSmartMemoryStorage = window._reactSmartMemoryStorage || {};
        window._reactSmartMemoryStorage.interactions = window._reactSmartMemoryStorage.interactions || [];
        window._reactSmartMemoryStorage.interactions.push(enhancedInteraction);
        
        // Keep only the last 100 interactions
        if (window._reactSmartMemoryStorage.interactions.length > 100) {
          window._reactSmartMemoryStorage.interactions = window._reactSmartMemoryStorage.interactions.slice(-100);
        }
      }
    } catch (error) {
      console.error('ReactSmart: Error storing interaction data', error);
    }
  };
  
  /**
   * Get stored interaction data
   * @param {number} limit - Maximum number of interactions to return
   * @returns {Array} Stored interaction data
   */
  export const getInteractions = (limit = 100) => {
    try {
      if (isLocalStorageAvailable()) {
        const interactionsJson = localStorage.getItem(STORAGE_KEYS.INTERACTION_DATA);
        const interactions = interactionsJson ? JSON.parse(interactionsJson) : [];
        return interactions.slice(-limit);
      } else {
        return (window._reactSmartMemoryStorage?.interactions || []).slice(-limit);
      }
    } catch (error) {
      console.error('ReactSmart: Error retrieving interaction data', error);
      return [];
    }
  };
  
  /**
   * Update component usage data
   * @param {string} componentId - ID of the component
   * @param {Object} usageData - Usage data to store
   */
  export const updateComponentUsage = (componentId, usageData) => {
    try {
      if (!componentId) return;
      
      // Prepare usage data with timestamp
      const enhancedUsageData = {
        ...usageData,
        lastUsed: Date.now(),
        sessionId: getSessionId()
      };
      
      if (isLocalStorageAvailable()) {
        // Get existing usage data
        const usageJson = localStorage.getItem(STORAGE_KEYS.COMPONENT_USAGE);
        const usage = usageJson ? JSON.parse(usageJson) : {};
        
        // Update or initialize component usage
        if (usage[componentId]) {
          // Update existing data
          usage[componentId] = {
            ...usage[componentId],
            ...enhancedUsageData,
            useCount: (usage[componentId].useCount || 0) + 1
          };
        } else {
          // Initialize component data
          usage[componentId] = {
            ...enhancedUsageData,
            useCount: 1,
            firstUsed: Date.now()
          };
        }
        
        // Save back to localStorage
        localStorage.setItem(STORAGE_KEYS.COMPONENT_USAGE, JSON.stringify(usage));
      } else {
        // In-memory storage fallback
        window._reactSmartMemoryStorage = window._reactSmartMemoryStorage || {};
        window._reactSmartMemoryStorage.componentUsage = window._reactSmartMemoryStorage.componentUsage || {};
        
        if (window._reactSmartMemoryStorage.componentUsage[componentId]) {
          window._reactSmartMemoryStorage.componentUsage[componentId] = {
            ...window._reactSmartMemoryStorage.componentUsage[componentId],
            ...enhancedUsageData,
            useCount: (window._reactSmartMemoryStorage.componentUsage[componentId].useCount || 0) + 1
          };
        } else {
          window._reactSmartMemoryStorage.componentUsage[componentId] = {
            ...enhancedUsageData,
            useCount: 1,
            firstUsed: Date.now()
          };
        }
      }
    } catch (error) {
      console.error('ReactSmart: Error updating component usage data', error);
    }
  };
  
  /**
   * Get component usage data for a specific component or all components
   * @param {string} componentId - Optional ID of specific component
   * @returns {Object} Component usage data
   */
  export const getComponentUsage = (componentId) => {
    try {
      let usageData;
      
      if (isLocalStorageAvailable()) {
        const usageJson = localStorage.getItem(STORAGE_KEYS.COMPONENT_USAGE);
        usageData = usageJson ? JSON.parse(usageJson) : {};
      } else {
        usageData = window._reactSmartMemoryStorage?.componentUsage || {};
      }
      
      // Return specific component data if requested
      if (componentId) {
        return usageData[componentId] || null;
      }
      
      // Otherwise return all usage data
      return usageData;
    } catch (error) {
      console.error('ReactSmart: Error retrieving component usage data', error);
      return componentId ? null : {};
    }
  };
  
  /**
   * Store prediction model data
   * @param {Object} modelData - Model data to store
   */
  export const storePredictionModel = (modelData) => {
    try {
      if (!modelData) return;
      
      // Add metadata
      const enhancedModelData = {
        ...modelData,
        updated: Date.now(),
        version: modelData.version || 1
      };
      
      if (isLocalStorageAvailable()) {
        localStorage.setItem(STORAGE_KEYS.PREDICTION_MODEL, JSON.stringify(enhancedModelData));
      } else {
        window._reactSmartMemoryStorage = window._reactSmartMemoryStorage || {};
        window._reactSmartMemoryStorage.predictionModel = enhancedModelData;
      }
    } catch (error) {
      console.error('ReactSmart: Error storing prediction model', error);
    }
  };
  
  /**
   * Get stored prediction model
   * @returns {Object|null} Stored prediction model or null
   */
  export const getPredictionModel = () => {
    try {
      if (isLocalStorageAvailable()) {
        const modelJson = localStorage.getItem(STORAGE_KEYS.PREDICTION_MODEL);
        return modelJson ? JSON.parse(modelJson) : null;
      } else {
        return window._reactSmartMemoryStorage?.predictionModel || null;
      }
    } catch (error) {
      console.error('ReactSmart: Error retrieving prediction model', error);
      return null;
    }
  };
  
  /**
   * Store user preferences
   * @param {Object} preferences - User preferences to store
   */
  export const storeUserPreferences = (preferences) => {
    try {
      if (!preferences) return;
      
      if (isLocalStorageAvailable()) {
        // Get existing preferences
        const prefsJson = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
        const existingPrefs = prefsJson ? JSON.parse(prefsJson) : {};
        
        // Merge with new preferences
        const updatedPrefs = {
          ...existingPrefs,
          ...preferences,
          updated: Date.now()
        };
        
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPrefs));
      } else {
        window._reactSmartMemoryStorage = window._reactSmartMemoryStorage || {};
        window._reactSmartMemoryStorage.userPreferences = {
          ...(window._reactSmartMemoryStorage.userPreferences || {}),
          ...preferences,
          updated: Date.now()
        };
      }
    } catch (error) {
      console.error('ReactSmart: Error storing user preferences', error);
    }
  };
  
  /**
   * Get stored user preferences
   * @returns {Object} User preferences
   */
  export const getUserPreferences = () => {
    try {
      if (isLocalStorageAvailable()) {
        const prefsJson = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
        return prefsJson ? JSON.parse(prefsJson) : {};
      } else {
        return window._reactSmartMemoryStorage?.userPreferences || {};
      }
    } catch (error) {
      console.error('ReactSmart: Error retrieving user preferences', error);
      return {};
    }
  };
  
  /**
   * Clean up old data based on retention policy
   * @param {number} retentionDays - Number of days to retain data
   */
  export const cleanupOldData = (retentionDays = DEFAULT_EXPIRY) => {
    try {
      // Check if we need to run cleanup
      // (Only run once per day to avoid unnecessary processing)
      const now = Date.now();
      let lastCleanup = 0;
      
      if (isLocalStorageAvailable()) {
        lastCleanup = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_CLEANUP) || '0', 10);
      } else {
        lastCleanup = window._reactSmartMemoryStorage?.lastCleanup || 0;
      }
      
      const daysSinceLastCleanup = (now - lastCleanup) / (1000 * 60 * 60 * 24);
      
      // Skip if cleaned up in the last day
      if (daysSinceLastCleanup < 1) {
        return;
      }
      
      // Calculate retention threshold
      const retentionThreshold = now - (retentionDays * 24 * 60 * 60 * 1000);
      
      if (isLocalStorageAvailable()) {
        // Clean up interaction data
        const interactionsJson = localStorage.getItem(STORAGE_KEYS.INTERACTION_DATA);
        if (interactionsJson) {
          const interactions = JSON.parse(interactionsJson);
          const filteredInteractions = interactions.filter(
            interaction => (interaction.timestamp || 0) >= retentionThreshold
          );
          localStorage.setItem(STORAGE_KEYS.INTERACTION_DATA, JSON.stringify(filteredInteractions));
        }
        
        // Clean up component usage data
        const usageJson = localStorage.getItem(STORAGE_KEYS.COMPONENT_USAGE);
        if (usageJson) {
          const usage = JSON.parse(usageJson);
          Object.keys(usage).forEach(componentId => {
            // Remove components not used since threshold
            if ((usage[componentId].lastUsed || 0) < retentionThreshold) {
              delete usage[componentId];
            }
          });
          localStorage.setItem(STORAGE_KEYS.COMPONENT_USAGE, JSON.stringify(usage));
        }
        
        // Update last cleanup time
        localStorage.setItem(STORAGE_KEYS.LAST_CLEANUP, now.toString());
      } else {
        // Clean up in-memory storage
        if (window._reactSmartMemoryStorage?.interactions) {
          window._reactSmartMemoryStorage.interactions = window._reactSmartMemoryStorage.interactions.filter(
            interaction => (interaction.timestamp || 0) >= retentionThreshold
          );
        }
        
        if (window._reactSmartMemoryStorage?.componentUsage) {
          Object.keys(window._reactSmartMemoryStorage.componentUsage).forEach(componentId => {
            // Remove components not used since threshold
            if ((window._reactSmartMemoryStorage.componentUsage[componentId].lastUsed || 0) < retentionThreshold) {
              delete window._reactSmartMemoryStorage.componentUsage[componentId];
            }
          });
        }
        
        // Update last cleanup time
        window._reactSmartMemoryStorage.lastCleanup = now;
      }
    } catch (error) {
      console.error('ReactSmart: Error cleaning up old data', error);
    }
  };
  
  /**
   * Clear all ReactSmart storage data
   */
  export const clearAllData = () => {
    try {
      if (isLocalStorageAvailable()) {
        // Clear all ReactSmart data from localStorage
        Object.values(STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
      }
      
      // Clear in-memory storage
      window._reactSmartMemoryStorage = {};
      
      // Re-initialize storage
      initializeStorage();
    } catch (error) {
      console.error('ReactSmart: Error clearing data', error);
    }
  };
  
  /**
   * Get estimated storage size in KB
   * @returns {number} Estimated storage size in KB
   */
  export const getStorageSize = () => {
    try {
      let totalSize = 0;
      
      if (isLocalStorageAvailable()) {
        Object.values(STORAGE_KEYS).forEach(key => {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += value.length;
          }
        });
      } else if (window._reactSmartMemoryStorage) {
        totalSize = JSON.stringify(window._reactSmartMemoryStorage).length;
      }
      
      // Convert bytes to KB
      return Math.round(totalSize / 1024);
    } catch (error) {
      console.error('ReactSmart: Error calculating storage size', error);
      return 0;
    }
  };
  
  export default {
    initializeStorage,
    storeInteraction,
    getInteractions,
    updateComponentUsage,
    getComponentUsage,
    storePredictionModel,
    getPredictionModel,
    storeUserPreferences,
    getUserPreferences,
    cleanupOldData,
    clearAllData,
    getStorageSize,
    getSessionId
  };