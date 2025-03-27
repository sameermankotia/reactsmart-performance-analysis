import React, { createContext, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import BehaviorAnalysis from '../core/BehaviorAnalysis';
import PredictionEngine from '../core/PredictionEngine';
import DynamicComponentLoader from '../core/DynamicComponentLoader';
import { detectNetworkConditions } from '../core/utils/networkUtils';
import { initializeStorage, cleanupOldData } from '../core/utils/storageUtils';
import { anonymizeInteractionData } from '../core/utils/privacyUtils';

// Create context for ReactSmart
export const ReactSmartContext = createContext({
  trackInteraction: () => {},
  registerComponent: () => {},
  preloadComponent: () => {},
  getLoadingPriority: () => 'medium',
  networkStatus: { type: '4g', effectiveType: '4g', downlink: 10, rtt: 50 },
  isInitialized: false
});

/**
 * Main provider component that initializes ReactSmart and provides
 * context to child components.
 */
const ReactSmartProvider = ({ 
  children, 
  options = {
    networkAdaptation: true,
    learningRate: 0.03,
    anonymizeData: true,
    privacyCompliance: 'gdpr',
    dataRetentionDays: 30,
    disabled: false,
    predictionModel: 'probabilistic',
    debug: false,
    logLevel: 'warn',
    maxConcurrentLoads: 5,
    maxCacheSize: 50,
    compatibility: 'modern'
  }
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({
    type: '4g',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    online: true
  });
  
  // Create refs for core modules to preserve instances
  const behaviorAnalysis = useRef(null);
  const predictionEngine = useRef(null);
  const componentLoader = useRef(null);
  const predictionWorker = useRef(null);
  
  // Debugging logger
  const logger = useRef({
    debug: (...args) => options.debug && options.logLevel === 'debug' && console.debug('[ReactSmart]', ...args),
    info: (...args) => options.debug && ['debug', 'info'].includes(options.logLevel) && console.info('[ReactSmart]', ...args),
    warn: (...args) => options.debug && ['debug', 'info', 'warn'].includes(options.logLevel) && console.warn('[ReactSmart]', ...args),
    error: (...args) => console.error('[ReactSmart]', ...args)
  }).current;
  
  // Initialize ReactSmart on component mount
  useEffect(() => {
    if (options.disabled) {
      logger.info('ReactSmart is disabled by configuration');
      return;
    }
    
    logger.info('Initializing ReactSmart with options:', options);
    
    // Initialize storage
    initializeStorage();
    
    // Clean up old data according to retention policy
    cleanupOldData(options.dataRetentionDays || 30);
    
    // Initialize core modules
    behaviorAnalysis.current = new BehaviorAnalysis({
      anonymizeData: options.anonymizeData,
      privacyCompliance: options.privacyCompliance
    });
    
    // Create prediction engine based on selected model
    predictionEngine.current = new PredictionEngine({
      learningRate: options.learningRate || 0.03,
      modelType: options.predictionModel || 'probabilistic'
    });
    
    componentLoader.current = new DynamicComponentLoader({
      networkAdaptation: options.networkAdaptation,
      preloadBatchSize: options.maxConcurrentLoads || 5,
      maxCacheSize: options.maxCacheSize || 50
    });
    
    // Initialize prediction worker if browser supports it and not in compatibility mode
    if (window.Worker && options.compatibility !== 'legacy') {
      try {
        predictionWorker.current = new Worker(
          new URL('../workers/prediction-worker.js', import.meta.url)
        );
        
        predictionWorker.current.onmessage = function(e) {
          const { type, predictions, error } = e.data;
          
          if (type === 'error') {
            logger.error('Prediction worker error:', error);
            return;
          }
          
          if (type === 'predictions' && predictions) {
            logger.debug('Received predictions from worker:', predictions.length);
            componentLoader.current.updateLoadingPriorities(predictions);
          }
        };
        
        // Configure worker
        predictionWorker.current.postMessage({
          action: 'configure',
          options: {
            learningRate: options.learningRate,
            modelType: options.predictionModel
          }
        });
        
        logger.info('Prediction worker initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize prediction worker:', error);
        logger.info('Falling back to main thread predictions');
      }
    } else {
      logger.info(
        window.Worker
          ? 'Running in legacy compatibility mode, prediction will run on main thread'
          : 'Web Workers not supported in this browser, prediction will run on main thread'
      );
    }
    
    // Monitor network conditions if enabled
    if (options.networkAdaptation) {
      const updateNetworkStatus = () => {
        const conditions = detectNetworkConditions();
        setNetworkStatus(conditions);
        
        if (componentLoader.current) {
          componentLoader.current.setNetworkConditions(conditions);
        }
        
        logger.debug('Network conditions updated:', conditions);
      };
      
      // Initial check
      updateNetworkStatus();
      
      // Set up network monitoring
      if (navigator.connection) {
        navigator.connection.addEventListener('change', updateNetworkStatus);
        logger.debug('Network Information API available, monitoring network changes');
      } else {
        logger.debug('Network Information API not available, using fallback polling');
      }
      
      // Periodic checking as fallback
      const networkCheckInterval = setInterval(updateNetworkStatus, 30000);
      
      // Online/offline events
      window.addEventListener('online', () => {
        logger.info('Device went online');
        updateNetworkStatus();
      });
      
      window.addEventListener('offline', () => {
        logger.info('Device went offline');
        updateNetworkStatus();
      });
      
      return () => {
        if (navigator.connection) {
          navigator.connection.removeEventListener('change', updateNetworkStatus);
        }
        clearInterval(networkCheckInterval);
        window.removeEventListener('online', updateNetworkStatus);
        window.removeEventListener('offline', updateNetworkStatus);
      };
    }
    
    // Make the instance available globally for debugging and metrics
    if (options.debug) {
      window.__REACTSMART_INSTANCE__ = {
        behaviorAnalysis: behaviorAnalysis.current,
        predictionEngine: predictionEngine.current,
        componentLoader: componentLoader.current,
        options,
        version: '1.0.0'
      };
      logger.info('Debug mode enabled, instance available at window.__REACTSMART_INSTANCE__');
    }
    
    setIsInitialized(true);
    logger.info('ReactSmart initialized successfully');
    
    return () => {
      // Clean up resources
      if (predictionWorker.current) {
        predictionWorker.current.terminate();
        logger.debug('Terminated prediction worker');
      }
      
      // Remove global debug reference
      if (options.debug) {
        delete window.__REACTSMART_INSTANCE__;
      }
      
      logger.info('ReactSmart cleanup complete');
    };
  }, [
    options.disabled, options.networkAdaptation, options.anonymizeData, 
    options.privacyCompliance, options.learningRate, options.dataRetentionDays,
    options.predictionModel, options.debug, options.logLevel,
    options.maxConcurrentLoads, options.maxCacheSize, options.compatibility,
    logger
  ]);
  
  /**
   * Track user interaction with a component
   * @param {string} componentId - ID of the component
   * @param {object} interactionData - Data about the interaction
   */
  const trackInteraction = (componentId, interactionData) => {
    if (!isInitialized || options.disabled) return;
    
    logger.debug('Tracking interaction:', componentId, interactionData.type);
    
    // Anonymize data if privacy settings require it
    const processedData = options.anonymizeData 
      ? anonymizeInteractionData(interactionData)
      : interactionData;
    
    // Add interaction to behavior analysis
    const interaction = behaviorAnalysis.current.recordInteraction(componentId, processedData);
    
    // Send data to prediction worker if available
    if (predictionWorker.current) {
      const userPatterns = behaviorAnalysis.current.getCurrentPatterns();
      predictionWorker.current.postMessage({
        action: 'predict',
        userPatterns,
        components: componentLoader.current.getRegisteredComponents()
      });
    } else {
      // Run prediction in main thread if worker not available
      const userPatterns = behaviorAnalysis.current.getCurrentPatterns();
      const predictions = predictionEngine.current.predictComponentUsage(
        userPatterns,
        componentLoader.current.getRegisteredComponents()
      );
      
      if (predictions && predictions.length > 0) {
        logger.debug('Generated predictions:', predictions.length);
        componentLoader.current.updateLoadingPriorities(predictions);
      }
    }
    
    // If this was a component usage event, mark it as used
    if (interactionData.type === 'use' || interactionData.type === 'render') {
      componentLoader.current.markComponentUsed(componentId);
    }
    
    return interaction;
  };
  
  /**
   * Register a component with ReactSmart
   * @param {string} componentId - ID of the component
   * @param {object} componentData - Metadata about the component
   */
  const registerComponent = (componentId, componentData) => {
    if (!isInitialized || options.disabled) return;
    
    logger.debug('Registering component:', componentId);
    componentLoader.current.registerComponent(componentId, componentData);
  };
  
  /**
   * Explicitly preload a component
   * @param {string} componentId - ID of the component to preload
   */
  const preloadComponent = (componentId) => {
    if (!isInitialized || options.disabled) return;
    
    logger.debug('Explicitly preloading component:', componentId);
    componentLoader.current.loadComponent(componentId, 'high');
  };
  
  /**
   * Get the current loading priority for a component
   * @param {string} componentId - ID of the component
   * @returns {string} Priority level ('high', 'medium', 'low')
   */
  const getLoadingPriority = (componentId) => {
    if (!isInitialized || options.disabled) return 'medium';
    return componentLoader.current.getComponentPriority(componentId);
  };
  
  /**
   * Check if a component is loaded
   * @param {string} componentId - ID of the component
   * @returns {boolean} Whether the component is loaded
   */
  const isComponentLoaded = (componentId) => {
    if (!isInitialized || options.disabled) return false;
    return componentLoader.current.isComponentLoaded(componentId);
  };
  
  /**
   * Get metrics about ReactSmart's performance
   * @returns {object} Performance metrics
   */
  const getMetrics = () => {
    if (!isInitialized || options.disabled) {
      return {
        predictionAccuracy: 0,
        preloadedCount: 0,
        usedPreloadedCount: 0,
        hitRate: 0,
        networkSavingsKB: 0
      };
    }
    
    const predictionMetrics = predictionEngine.current.getMetrics();
    const loaderMetrics = componentLoader.current.getMetrics();
    
    return {
      predictionAccuracy: predictionMetrics.lastAccuracy * 100,
      preloadedCount: loaderMetrics.preloadedComponentCount,
      usedPreloadedCount: loaderMetrics.usedPreloadedCount,
      hitRate: loaderMetrics.preloadHitRate * 100,
      networkSavingsKB: loaderMetrics.networkSavingsKB
    };
  };
  
  // Context value to be provided to consumers
  const contextValue = {
    trackInteraction,
    registerComponent,
    preloadComponent,
    getLoadingPriority,
    isComponentLoaded,
    getMetrics,
    networkStatus,
    isInitialized: isInitialized && !options.disabled
  };
  
  return (
    <ReactSmartContext.Provider value={contextValue}>
      {children}
    </ReactSmartContext.Provider>
  );
};

ReactSmartProvider.propTypes = {
  children: PropTypes.node.isRequired,
  options: PropTypes.shape({
    networkAdaptation: PropTypes.bool,
    learningRate: PropTypes.number,
    anonymizeData: PropTypes.bool,
    privacyCompliance: PropTypes.string,
    dataRetentionDays: PropTypes.number,
    disabled: PropTypes.bool,
    predictionModel: PropTypes.oneOf(['probabilistic', 'markovChain', 'transformer']),
    debug: PropTypes.bool,
    logLevel: PropTypes.oneOf(['debug', 'info', 'warn', 'error']),
    maxConcurrentLoads: PropTypes.number,
    maxCacheSize: PropTypes.number,
    compatibility: PropTypes.oneOf(['modern', 'legacy'])
  })
};

export default ReactSmartProvider;