/**
 * Adaptive Loading Queue 
 * 
 * Manages prioritized component loading based on predictions,
 * network conditions, and resource constraints.
 */
class AdaptiveLoadingQueue {
    /**
     * Create a new AdaptiveLoadingQueue instance
     * @param {Object} options - Configuration options
     * @param {number} options.highPriorityThreshold - Probability threshold for high priority (default: 0.8)
     * @param {number} options.mediumPriorityThreshold - Probability threshold for medium priority (default: 0.5)
     * @param {number} options.maxConcurrentLoads - Maximum number of concurrent component loads (default: 5)
     * @param {boolean} options.adaptToNetwork - Whether to adapt loading strategy to network conditions (default: true)
     */
    constructor(options = {}) {
      this.options = {
        highPriorityThreshold: 0.8,
        mediumPriorityThreshold: 0.5,
        maxConcurrentLoads: 5,
        adaptToNetwork: true,
        ...options
      };
      
      // Priority queues
      this.highPriority = new Set();
      this.mediumPriority = new Set();
      this.lowPriority = new Set();
      
      // Component metadata registry
      this.componentRegistry = new Map();
      
      // Resource hint registry
      this.resourceHints = new Map();
      
      // Track currently loading components
      this.loadingComponents = new Set();
      
      // Track loaded components
      this.loadedComponents = new Set();
      
      // Network state
      this.network = {
        type: '4g',
        effectiveType: '4g',
        downlink: 10,
        rtt: 50
      };
      
      // Detect network conditions if available
      this.detectNetworkConditions();
      
      // Set up network monitoring
      this.setupNetworkMonitoring();
    }
    
    /**
     * Initialize network condition detection
     */
    detectNetworkConditions() {
      if (!this.options.adaptToNetwork) return;
      
      if (navigator.connection) {
        const connection = navigator.connection;
        this.network = {
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        };
      }
    }
    
    /**
     * Setup ongoing network monitoring
     */
    setupNetworkMonitoring() {
      if (!this.options.adaptToNetwork) return;
      
      // Listen for network changes if supported
      if (navigator.connection) {
        navigator.connection.addEventListener('change', () => {
          this.detectNetworkConditions();
          this.rebalanceQueues();
        });
      }
      
      // Fallback polling for browsers without Network Information API
      else {
        // No reliable way to detect network changes, so we'll
        // periodically check performance of resource loading
        this.networkCheckInterval = setInterval(() => {
          // Estimate network conditions based on recent load performance
          this.estimateNetworkConditions();
        }, 60000); // Check every minute
      }
    }
    
    /**
     * Estimate network conditions based on resource loading performance
     */
    estimateNetworkConditions() {
      // This is a simplified implementation
      // A real implementation would track resource load times
      // and use them to estimate network conditions
      
      // For now, we'll use navigator.connection if available,
      // or assume decent connectivity otherwise
      if (navigator.connection) {
        this.detectNetworkConditions();
      }
    }
    
    /**
     * Register a component with the loading queue
     * @param {string} componentId - ID of the component
     * @param {Object} metadata - Component metadata
     */
    registerComponent(componentId, metadata) {
      this.componentRegistry.set(componentId, {
        id: componentId,
        size: metadata.size || 0,
        dependencies: metadata.dependencies || [],
        path: metadata.path || null,
        importance: metadata.importance || 'normal',
        ...metadata
      });
    }
    
    /**
     * Update loading priorities based on predictions
     * @param {Array} predictions - Component predictions from the prediction engine
     */
    updatePriorities(predictions) {
      // Clear existing queue contents
      this.highPriority.clear();
      this.mediumPriority.clear();
      this.lowPriority.clear();
      
      // Process predictions and assign to appropriate queues
      predictions.forEach(pred => {
        const componentId = pred.componentId;
        
        // Skip already loaded or loading components
        if (this.loadedComponents.has(componentId) || this.loadingComponents.has(componentId)) {
          return;
        }
        
        // Assign to priority queues based on prediction probability
        if (pred.probability > this.options.highPriorityThreshold) {
          this.highPriority.add(componentId);
          this.prefetchResource(componentId);
        } else if (pred.probability > this.options.mediumPriorityThreshold) {
          this.mediumPriority.add(componentId);
          this.preconnectResource(componentId);
        } else {
          this.lowPriority.add(componentId);
        }
      });
      
      // Start loading components based on priorities
      this.processQueues();
    }
    
    /**
     * Process loading queues to load components in priority order
     */
    processQueues() {
      // Determine how many components we can load concurrently
      const availableSlots = this.calculateAvailableSlots();
      let remainingSlots = availableSlots - this.loadingComponents.size;
      
      // Process high priority queue first
      if (remainingSlots > 0) {
        remainingSlots = this.processQueue(this.highPriority, remainingSlots, 'high');
      }
      
      // Process medium priority queue next
      if (remainingSlots > 0) {
        remainingSlots = this.processQueue(this.mediumPriority, remainingSlots, 'medium');
      }
      
      // Process low priority queue if we still have slots and good network
      if (remainingSlots > 0 && this.hasGoodNetwork()) {
        this.processQueue(this.lowPriority, remainingSlots, 'low');
      }
    }
    
    /**
     * Process a specific queue to load components
     * @param {Set} queue - Priority queue to process
     * @param {number} slots - Number of available loading slots
     * @param {string} priority - Priority level ('high', 'medium', 'low')
     * @returns {number} - Remaining slots after processing
     */
    processQueue(queue, slots, priority) {
      let remainingSlots = slots;
      
      // Convert queue to array for easier processing
      const components = Array.from(queue);
      
      // Use slots for components from this queue
      for (let i = 0; i < components.length && remainingSlots > 0; i++) {
        const componentId = components[i];
        this.loadComponent(componentId, priority);
        remainingSlots--;
        
        // Remove from queue
        queue.delete(componentId);
      }
      
      return remainingSlots;
    }
    
    /**
     * Calculate the number of concurrent loads based on network conditions
     * @returns {number} - Number of components to load concurrently
     */
    calculateAvailableSlots() {
      if (!this.options.adaptToNetwork) {
        return this.options.maxConcurrentLoads;
      }
      
      // Adjust based on network conditions
      const { effectiveType, downlink } = this.network;
      
      switch (effectiveType) {
        case '4g':
          return this.options.maxConcurrentLoads;
        case '3g':
          return Math.max(2, Math.floor(this.options.maxConcurrentLoads * 0.6));
        case '2g':
          return 1;
        case 'slow-2g':
          return 1;
        default:
          // If we don't know, use a conservative value based on downlink
          if (downlink > 5) return this.options.maxConcurrentLoads;
          if (downlink > 2) return Math.floor(this.options.maxConcurrentLoads * 0.6);
          return 1;
      }
    }
    
    /**
     * Check if current network conditions are good
     * @returns {boolean} - Whether network conditions are good
     */
    hasGoodNetwork() {
      if (!this.options.adaptToNetwork) {
        return true;
      }
      
      const { effectiveType, downlink, rtt } = this.network;
      
      // Consider good network if:
      // - 4g or better effective type, or
      // - downlink > 1.5Mbps, or
      // - RTT < 300ms
      return (
        effectiveType === '4g' ||
        downlink > 1.5 ||
        (rtt && rtt < 300)
      );
    }
    
    /**
     * Rebalance queues when conditions change
     */
    rebalanceQueues() {
      // Adjust processing based on new network conditions
      this.processQueues();
    }
    
    /**
     * Load a component
     * @param {string} componentId - ID of the component to load
     * @param {string} priority - Priority level ('high', 'medium', 'low')
     */
    loadComponent(componentId, priority) {
      // Skip if already loaded or loading
      if (this.loadedComponents.has(componentId) || this.loadingComponents.has(componentId)) {
        return;
      }
      
      // Ensure component is registered
      const component = this.componentRegistry.get(componentId);
      if (!component) {
        console.warn(`AdaptiveLoadingQueue: Attempted to load unknown component: ${componentId}`);
        return;
      }
      
      // Mark as loading
      this.loadingComponents.add(componentId);
      
      // In a real implementation, this would load the actual component
      // through dynamic import or a similar mechanism
      
      // For this implementation, we'll simulate loading with a timeout
      const loadTime = this.estimateLoadTime(component);
      
      setTimeout(() => {
        // Mark as loaded
        this.loadedComponents.add(componentId);
        this.loadingComponents.delete(componentId);
        
        // Clean up any resource hints
        this.cleanupResourceHint(componentId);
        
        // Process dependencies
        this.processDependencies(component);
        
        // Process queues again in case we have room for more components
        this.processQueues();
        
        console.debug(`AdaptiveLoadingQueue: Loaded component ${componentId} with ${priority} priority`);
      }, loadTime);
    }
    
    /**
     * Process dependencies for a component
     * @param {Object} component - Component metadata
     */
    processDependencies(component) {
      if (!component.dependencies || component.dependencies.length === 0) {
        return;
      }
      
      // Load each dependency with medium priority
      component.dependencies.forEach(dependencyId => {
        if (!this.loadedComponents.has(dependencyId) && !this.loadingComponents.has(dependencyId)) {
          // Add to medium priority queue
          this.mediumPriority.add(dependencyId);
        }
      });
    }
    
    /**
     * Estimate load time for a component based on size and network conditions
     * @param {Object} component - Component metadata
     * @returns {number} - Estimated load time in milliseconds
     */
    estimateLoadTime(component) {
      if (!this.options.adaptToNetwork) {
        return 100; // Default load time
      }
      
      const { downlink, rtt } = this.network;
      const size = component.size || 10; // Size in KB, default 10KB if unknown
      
      // Basic formula: latency + (size / bandwidth)
      const latency = rtt || 100; // ms
      const bandwidth = downlink || 1; // Mbps
      
      // Convert KB to bits (× 8 × 1024), and Mbps to bps (× 1024 × 1024)
      const transferTime = (size * 8 * 1024) / (bandwidth * 1024 * 1024) * 1000;
      
      return latency + transferTime;
    }
    
    /**
     * Add a prefetch hint for a component
     * @param {string} componentId - ID of the component
     */
    prefetchResource(componentId) {
      // Skip if already loaded, loading, or hint already exists
      if (this.loadedComponents.has(componentId) || 
          this.loadingComponents.has(componentId) ||
          this.resourceHints.has(componentId)) {
        return;
      }
      
      const component = this.componentRegistry.get(componentId);
      if (!component || !component.path) return;
      
      // Create and add prefetch link
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'script';
      link.href = component.path;
      
      document.head.appendChild(link);
      
      // Register for cleanup
      this.resourceHints.set(componentId, link);
    }
    
    /**
     * Add a preconnect hint for a component
     * @param {string} componentId - ID of the component
     */
    preconnectResource(componentId) {
      // Skip if already loaded, loading, or hint already exists
      if (this.loadedComponents.has(componentId) || 
          this.loadingComponents.has(componentId) ||
          this.resourceHints.has(componentId)) {
        return;
      }
      
      const component = this.componentRegistry.get(componentId);
      if (!component || !component.path) return;
      
      // Extract domain from path
      let domain;
      try {
        if (component.path.startsWith('http')) {
          const url = new URL(component.path);
          domain = `${url.protocol}//${url.hostname}`;
        } else {
          // Assume same origin
          domain = window.location.origin;
        }
      } catch (error) {
        return;
      }
      
      // Create and add preconnect link
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      
      document.head.appendChild(link);
      
      // Register for cleanup
      this.resourceHints.set(componentId, link);
    }
    
    /**
     * Clean up resource hint for a component
     * @param {string} componentId - ID of the component
     */
    cleanupResourceHint(componentId) {
      const hint = this.resourceHints.get(componentId);
      if (hint) {
        // Remove from DOM
        if (hint.parentNode) {
          hint.parentNode.removeChild(hint);
        }
        
        // Remove from registry
        this.resourceHints.delete(componentId);
      }
    }
    
    /**
     * Check if a component is loaded
     * @param {string} componentId - ID of the component
     * @returns {boolean} - Whether the component is loaded
     */
    isLoaded(componentId) {
      return this.loadedComponents.has(componentId);
    }
    
    /**
     * Check if a component is currently loading
     * @param {string} componentId - ID of the component
     * @returns {boolean} - Whether the component is loading
     */
    isLoading(componentId) {
      return this.loadingComponents.has(componentId);
    }
    
    /**
     * Get the current queue state
     * @returns {Object} - Current queue state
     */
    getQueueState() {
      return {
        high: Array.from(this.highPriority),
        medium: Array.from(this.mediumPriority),
        low: Array.from(this.lowPriority),
        loading: Array.from(this.loadingComponents),
        loaded: Array.from(this.loadedComponents),
        network: { ...this.network }
      };
    }
    
    /**
     * Clean up and destroy the queue
     */
    destroy() {
      // Clear intervals if any
      if (this.networkCheckInterval) {
        clearInterval(this.networkCheckInterval);
      }
      
      // Remove network event listeners
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', this.detectNetworkConditions);
      }
      
      // Clean up all resource hints
      this.resourceHints.forEach(hint => {
        if (hint.parentNode) {
          hint.parentNode.removeChild(hint);
        }
      });
      
      // Clear all collections
      this.highPriority.clear();
      this.mediumPriority.clear();
      this.lowPriority.clear();
      this.loadingComponents.clear();
      this.loadedComponents.clear();
      this.componentRegistry.clear();
      this.resourceHints.clear();
    }
  }
  
  export default AdaptiveLoadingQueue;