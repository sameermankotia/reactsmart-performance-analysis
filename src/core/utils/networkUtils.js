/**
 * Network Utilities
 * 
 * Utilities for detecting and monitoring network conditions
 * to optimize component loading strategies.
 */

/**
 * Detect current network conditions
 * @returns {Object} Network condition information
 */
export const detectNetworkConditions = () => {
    // Default network condition values
    const defaultConditions = {
      type: '4g',
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
      online: true
    };
    
    // Use Network Information API if available
    if (navigator.connection) {
      const connection = navigator.connection;
      
      return {
        type: connection.type || defaultConditions.type,
        effectiveType: connection.effectiveType || defaultConditions.effectiveType,
        downlink: connection.downlink || defaultConditions.downlink,
        rtt: connection.rtt || defaultConditions.rtt,
        saveData: connection.saveData || defaultConditions.saveData,
        online: navigator.onLine
      };
    }
    
    // If Network Information API is not available, estimate based on
    // navigator.onLine and potentially performance.timing metrics
    return {
      ...defaultConditions,
      online: navigator.onLine
    };
  };
  
  /**
   * Set up ongoing network monitoring
   * @param {Function} callback - Function to call when network conditions change
   * @returns {Function} Cleanup function to remove listeners
   */
  export const monitorNetworkConditions = (callback) => {
    if (!callback || typeof callback !== 'function') {
      throw new Error('monitorNetworkConditions requires a callback function');
    }
    
    // Function to handle network changes
    const handleNetworkChange = () => {
      const conditions = detectNetworkConditions();
      callback(conditions);
    };
    
    // Set up Network Information API listeners if available
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleNetworkChange);
    }
    
    // Set up online/offline listeners
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
    
    // Return cleanup function
    return () => {
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleNetworkChange);
      }
      
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  };
  
  /**
   * Categorize network quality based on conditions
   * @param {Object} conditions - Network conditions
   * @returns {string} Network quality category ('excellent', 'good', 'fair', 'poor', 'offline')
   */
  export const categorizeNetworkQuality = (conditions) => {
    if (!conditions) {
      conditions = detectNetworkConditions();
    }
    
    const { effectiveType, downlink, rtt, online } = conditions;
    
    // Check if offline
    if (!online) {
      return 'offline';
    }
    
    // Categorize based on effective connection type if available
    if (effectiveType) {
      switch (effectiveType) {
        case '4g':
          return 'excellent';
        case '3g':
          return 'good';
        case '2g':
          return 'fair';
        case 'slow-2g':
          return 'poor';
        default:
          // If unknown, use downlink and RTT
          break;
      }
    }
    
    // Categorize based on downlink and RTT
    if (downlink && rtt) {
      if (downlink >= 5 && rtt < 100) {
        return 'excellent';
      } else if (downlink >= 2 && rtt < 200) {
        return 'good';
      } else if (downlink >= 0.5 && rtt < 400) {
        return 'fair';
      } else {
        return 'poor';
      }
    }
    
    // Fallback: categorize based on downlink only
    if (downlink) {
      if (downlink >= 5) return 'excellent';
      if (downlink >= 2) return 'good';
      if (downlink >= 0.5) return 'fair';
      return 'poor';
    }
    
    // Fallback: categorize based on RTT only
    if (rtt) {
      if (rtt < 100) return 'excellent';
      if (rtt < 200) return 'good';
      if (rtt < 400) return 'fair';
      return 'poor';
    }
    
    // If we can't determine, assume 'good'
    return 'good';
  };
  
  /**
   * Calculate appropriate batch size for component loading based on network quality
   * @param {string} networkQuality - Network quality category
   * @param {number} baseBatchSize - Base number of components to load at once
   * @returns {number} Adjusted batch size
   */
  export const calculateBatchSize = (networkQuality, baseBatchSize = 3) => {
    switch (networkQuality) {
      case 'excellent':
        return baseBatchSize;
      case 'good':
        return Math.max(1, Math.floor(baseBatchSize * 0.7));
      case 'fair':
        return Math.max(1, Math.floor(baseBatchSize * 0.5));
      case 'poor':
        return 1;
      case 'offline':
        return 0;
      default:
        return baseBatchSize;
    }
  };
  
  /**
   * Estimate load time for a resource based on size and network conditions
   * @param {number} sizeKB - Size of the resource in KB
   * @param {Object} networkConditions - Current network conditions
   * @returns {number} Estimated load time in milliseconds
   */
  export const estimateLoadTime = (sizeKB, networkConditions) => {
    if (!networkConditions) {
      networkConditions = detectNetworkConditions();
    }
    
    const { downlink, rtt } = networkConditions;
    
    // Base latency on RTT
    const latency = rtt || 100; // default to 100ms if RTT is unknown
    
    // Base bandwidth on downlink
    const bandwidth = downlink || 1; // default to 1Mbps if downlink is unknown
    
    // Calculate transfer time: size (in bits) / bandwidth (in bits per second)
    // Convert KB to bits (× 8 × 1024), and Mbps to bps (× 1024 × 1024)
    const transferTime = (sizeKB * 8 * 1024) / (bandwidth * 1024 * 1024) * 1000;
    
    // Total load time = latency + transfer time
    return latency + transferTime;
  };
  
  /**
   * Prioritize resources based on network conditions
   * @param {Object} resources - Resources to prioritize, with sizes in KB
   * @param {Object} networkConditions - Current network conditions
   * @returns {Object} Resources categorized by priority
   */
  export const prioritizeResources = (resources, networkConditions) => {
    if (!networkConditions) {
      networkConditions = detectNetworkConditions();
    }
    
    const networkQuality = categorizeNetworkQuality(networkConditions);
    
    // Prioritization thresholds based on network quality
    let sizeThresholds;
    
    switch (networkQuality) {
      case 'excellent':
        sizeThresholds = { high: 200, medium: 500 }; // in KB
        break;
      case 'good':
        sizeThresholds = { high: 100, medium: 300 };
        break;
      case 'fair':
        sizeThresholds = { high: 50, medium: 150 };
        break;
      case 'poor':
        sizeThresholds = { high: 20, medium: 50 };
        break;
      case 'offline':
        // When offline, only prioritize resources that might be in cache
        sizeThresholds = { high: 0, medium: 0 };
        break;
      default:
        sizeThresholds = { high: 100, medium: 300 };
    }
    
    // Categorize resources by priority
    const prioritized = {
      high: {},
      medium: {},
      low: {}
    };
    
    Object.entries(resources).forEach(([id, resource]) => {
      const size = resource.size || 0;
      
      if (size <= sizeThresholds.high) {
        prioritized.high[id] = resource;
      } else if (size <= sizeThresholds.medium) {
        prioritized.medium[id] = resource;
      } else {
        prioritized.low[id] = resource;
      }
    });
    
    return prioritized;
  };
  
  /**
   * Create a resource hint (preload, prefetch, preconnect) for a resource
   * @param {string} type - Type of hint ('preload', 'prefetch', 'preconnect')
   * @param {string} url - URL of the resource
   * @param {string} as - Resource type (for preload and prefetch)
   * @returns {HTMLElement} Created link element
   */
  export const createResourceHint = (type, url, as) => {
    if (!type || !url) {
      throw new Error('createResourceHint requires type and url parameters');
    }
    
    // Validate hint type
    if (!['preload', 'prefetch', 'preconnect', 'dns-prefetch'].includes(type)) {
      throw new Error(`Invalid resource hint type: ${type}`);
    }
    
    // Create link element
    const link = document.createElement('link');
    link.rel = type;
    link.href = url;
    
    // Add 'as' attribute for preload and prefetch
    if (['preload', 'prefetch'].includes(type) && as) {
      link.as = as;
    }
    
    // Add to document head
    document.head.appendChild(link);
    
    return link;
  };
  
  /**
   * Extract domain from a URL
   * @param {string} url - URL to extract domain from
   * @returns {string|null} Domain URL or null if invalid
   */
  export const extractDomain = (url) => {
    try {
      if (typeof url === 'string' && (url.startsWith('http') || url.startsWith('//'))) {
        const parsedUrl = new URL(url.startsWith('//') ? `https:${url}` : url);
        return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
      }
      return null;
    } catch (error) {
      return null;
    }
  };
  
  /**
   * Measure and track network performance for a resource load
   * @param {string} resourceUrl - URL of the resource to measure
   * @param {Function} callback - Callback function with performance data
   */
  export const measureResourceLoad = (resourceUrl, callback) => {
    if (!resourceUrl) {
      throw new Error('measureResourceLoad requires a resourceUrl parameter');
    }
    
    if (!callback || typeof callback !== 'function') {
      throw new Error('measureResourceLoad requires a callback function');
    }
    
    // Create a new performance observer
    if (window.PerformanceObserver) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        // Find matching resource
        const resourceEntry = entries.find(entry => 
          entry.name.includes(resourceUrl) && entry.entryType === 'resource'
        );
        
        if (resourceEntry) {
          // Calculate performance metrics
          const metrics = {
            duration: resourceEntry.duration,
            transferSize: resourceEntry.transferSize,
            encodedBodySize: resourceEntry.encodedBodySize,
            decodedBodySize: resourceEntry.decodedBodySize,
            startTime: resourceEntry.startTime,
            // Calculate bandwidth in Mbps
            bandwidth: resourceEntry.transferSize > 0 
              ? (resourceEntry.transferSize * 8 / 1024 / 1024) / (resourceEntry.duration / 1000)
              : 0
          };
          
          // Call callback with metrics
          callback(metrics);
          
          // Disconnect observer
          observer.disconnect();
        }
      });
      
      // Start observing resource timing entries
      observer.observe({ entryTypes: ['resource'] });
    } else {
      // Fallback if PerformanceObserver is not available
      console.warn('PerformanceObserver not supported, cannot measure resource load');
      callback(null);
    }
  };
  
  export default {
    detectNetworkConditions,
    monitorNetworkConditions,
    categorizeNetworkQuality,
    calculateBatchSize,
    estimateLoadTime,
    prioritizeResources,
    createResourceHint,
    extractDomain,
    measureResourceLoad
  };