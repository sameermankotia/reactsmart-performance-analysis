import { useContext, useState, useEffect, useCallback } from 'react';
import { ReactSmartContext } from '../ReactSmartProvider';
import { detectNetworkConditions, categorizeNetworkQuality } from '../../core/utils/networkUtils';

/**
 * Hook for making components network-aware
 * 
 * This hook provides network condition information and helper functions
 * to adapt component behavior based on network quality.
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.monitorChanges - Whether to monitor network changes (default: true)
 * @param {number} options.pollInterval - Polling interval in ms for browsers without NetworkInformation API (default: 30000)
 * @param {Function} options.onNetworkChange - Callback when network conditions change
 * @returns {Object} Network status information and helper functions
 */
const useNetworkAware = (options = {}) => {
  const {
    monitorChanges = true,
    pollInterval = 30000,
    onNetworkChange = null
  } = options;
  
  // Get ReactSmart context
  const { networkStatus, isInitialized } = useContext(ReactSmartContext);
  
  // Local state for network status (initial value from context)
  const [localNetworkStatus, setLocalNetworkStatus] = useState(networkStatus);
  
  // Local state for network quality category
  const [networkQuality, setNetworkQuality] = useState(() => 
    categorizeNetworkQuality(networkStatus)
  );
  
  // Helper variables for common checks
  const [isGoodConnection, setIsGoodConnection] = useState(() =>
    ['excellent', 'good'].includes(categorizeNetworkQuality(networkStatus))
  );
  
  const [isSaveDataMode, setIsSaveDataMode] = useState(() =>
    networkStatus.saveData === true
  );
  
  // Effect to synchronize with context network status
  useEffect(() => {
    if (isInitialized) {
      setLocalNetworkStatus(networkStatus);
      const quality = categorizeNetworkQuality(networkStatus);
      setNetworkQuality(quality);
      setIsGoodConnection(['excellent', 'good'].includes(quality));
      setIsSaveDataMode(networkStatus.saveData === true);
    }
  }, [isInitialized, networkStatus]);
  
  // Effect to set up additional monitoring if requested
  useEffect(() => {
    if (!isInitialized || !monitorChanges) return;
    
    let intervalId = null;
    
    const updateNetworkStatus = () => {
      const newStatus = detectNetworkConditions();
      setLocalNetworkStatus(newStatus);
      
      const quality = categorizeNetworkQuality(newStatus);
      setNetworkQuality(quality);
      setIsGoodConnection(['excellent', 'good'].includes(quality));
      setIsSaveDataMode(newStatus.saveData === true);
      
      if (onNetworkChange && typeof onNetworkChange === 'function') {
        onNetworkChange(newStatus, quality);
      }
    };
    
    // Set up event listener for Network Information API if available
    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateNetworkStatus);
    } 
    // Otherwise, poll at the specified interval
    else if (pollInterval > 0) {
      intervalId = setInterval(updateNetworkStatus, pollInterval);
    }
    
    // Additional event listeners for online/offline status
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Cleanup function
    return () => {
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateNetworkStatus);
      }
      
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [isInitialized, monitorChanges, pollInterval, onNetworkChange]);
  
  /**
   * Check if current network quality meets a minimum threshold
   * @param {string} minimumQuality - Minimum quality level ('excellent', 'good', 'fair', 'poor')
   * @returns {boolean} Whether current network meets the threshold
   */
  const meetsQualityThreshold = useCallback((minimumQuality) => {
    const qualityLevels = ['excellent', 'good', 'fair', 'poor', 'offline'];
    const currentIndex = qualityLevels.indexOf(networkQuality);
    const thresholdIndex = qualityLevels.indexOf(minimumQuality);
    
    return currentIndex !== -1 && thresholdIndex !== -1 && currentIndex <= thresholdIndex;
  }, [networkQuality]);
  
  /**
   * Calculate appropriate resource size based on network conditions
   * @param {Object} sizeOptions - Size options for different network qualities
   * @param {number} sizeOptions.excellent - Size for excellent connections (default: 1)
   * @param {number} sizeOptions.good - Size for good connections (default: 0.8)
   * @param {number} sizeOptions.fair - Size for fair connections (default: 0.6)
   * @param {number} sizeOptions.poor - Size for poor connections (default: 0.4)
   * @param {number} sizeOptions.offline - Size for offline mode (default: 0)
   * @returns {number} Appropriate resource size multiplier
   */
  const getAdaptiveSize = useCallback((sizeOptions = {}) => {
    const defaults = {
      excellent: 1,
      good: 0.8,
      fair: 0.6, 
      poor: 0.4,
      offline: 0
    };
    
    const options = { ...defaults, ...sizeOptions };
    return options[networkQuality] || options.fair;
  }, [networkQuality]);
  
  /**
   * Select the appropriate resource variant based on network quality
   * @param {Object} variants - Resource variants for different network qualities
   * @param {any} variants.excellent - Variant for excellent connections
   * @param {any} variants.good - Variant for good connections
   * @param {any} variants.fair - Variant for fair connections
   * @param {any} variants.poor - Variant for poor connections
   * @param {any} variants.offline - Variant for offline mode
   * @param {any} variants.default - Default variant if quality-specific one not provided
   * @returns {any} Selected resource variant
   */
  const selectResourceVariant = useCallback((variants) => {
    if (!variants || typeof variants !== 'object') {
      return variants;
    }
    
    if (variants[networkQuality] !== undefined) {
      return variants[networkQuality];
    }
    
    // Fall back to the next best quality
    const qualityOrder = ['excellent', 'good', 'fair', 'poor', 'offline'];
    const currentIndex = qualityOrder.indexOf(networkQuality);
    
    if (currentIndex === -1) {
      return variants.default || variants.fair;
    }
    
    // Look for the next available quality
    for (let i = currentIndex + 1; i < qualityOrder.length; i++) {
      const quality = qualityOrder[i];
      if (variants[quality] !== undefined) {
        return variants[quality];
      }
    }
    
    // Look for previous better quality
    for (let i = currentIndex - 1; i >= 0; i--) {
      const quality = qualityOrder[i];
      if (variants[quality] !== undefined) {
        return variants[quality];
      }
    }
    
    return variants.default;
  }, [networkQuality]);
  
  /**
   * Estimate loading time for a resource based on its size
   * @param {number} sizeKB - Size of the resource in kilobytes
   * @returns {number} Estimated loading time in milliseconds
   */
  const estimateLoadTime = useCallback((sizeKB) => {
    const { downlink, rtt } = localNetworkStatus;
    
    // Base latency on RTT
    const latency = rtt || 100; // default to 100ms if RTT is unknown
    
    // Base bandwidth on downlink
    const bandwidth = downlink || 1; // default to 1Mbps if downlink is unknown
    
    // Calculate transfer time: size (in bits) / bandwidth (in bits per second)
    // Convert KB to bits (× 8 × 1024), and Mbps to bps (× 1024 × 1024)
    const transferTime = (sizeKB * 8 * 1024) / (bandwidth * 1024 * 1024) * 1000;
    
    // Total load time = latency + transfer time
    return latency + transferTime;
  }, [localNetworkStatus]);
  
  return {
    networkStatus: localNetworkStatus,
    networkQuality,
    isOnline: localNetworkStatus.online,
    isGoodConnection,
    isFairConnection: networkQuality === 'fair',
    isPoorConnection: networkQuality === 'poor',
    isOffline: networkQuality === 'offline',
    isSaveDataMode,
    
    // Helper functions
    meetsQualityThreshold,
    getAdaptiveSize,
    selectResourceVariant,
    estimateLoadTime
  };
};

export default useNetworkAware;