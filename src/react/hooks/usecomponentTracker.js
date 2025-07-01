import { useContext, useRef, useEffect, useCallback } from 'react';
import { ReactSmartContext } from '../ReactSmartProvider';

/**
 * Hook for tracking component interactions and usage patterns
 * 
 * This hook provides methods to track interactions with components,
 * allowing the prediction engine to learn from user behavior.
 * 
 * @param {string} componentId - Unique identifier for the component
 * @param {Object} options - Configuration options for the tracker
 * @param {boolean} options.trackMounts - Whether to track component mounts (default: true)
 * @param {boolean} options.trackUnmounts - Whether to track component unmounts (default: true)
 * @param {boolean} options.trackClicks - Whether to track clicks within the component (default: true)
 * @param {boolean} options.trackHovers - Whether to track hover interactions (default: true)
 * @param {boolean} options.trackVisibility - Whether to track visibility in viewport (default: true)
 * @param {Array} options.dependencies - Component dependencies to preload
 * @param {string} options.importance - Component importance ('high', 'medium', 'low')
 * @returns {Object} Component tracking methods and state
 */
const useComponentTracker = (componentId, options = {}) => {
  const {
    trackMounts = true,
    trackUnmounts = true,
    trackClicks = true,
    trackHovers = true,
    trackVisibility = true,
    dependencies = [],
    importance = 'medium'
  } = options;
  
  // Get ReactSmart context
  const {
    trackInteraction,
    registerComponent,
    preloadComponent,
    getLoadingPriority,
    isInitialized
  } = useContext(ReactSmartContext);
  
  // Create refs to track component state
  const rootRef = useRef(null);
  const isVisibleRef = useRef(false);
  const visibilityObserverRef = useRef(null);
  const mountTimeRef = useRef(null);
  
  // Generate a stable component ID if not provided
  const resolvedComponentId = componentId || 'anonymous-component';
  
  // Register the component with ReactSmart
  useEffect(() => {
    if (!isInitialized) return;
    
    // Register this component
    registerComponent(resolvedComponentId, {
      id: resolvedComponentId,
      type: 'component',
      importance,
      dependencies,
      metadata: {
        registeredAt: Date.now(),
        ...options
      }
    });
    
    // Component might have dependencies to preload
    dependencies.forEach(depId => {
      registerComponent(depId, {
        id: depId,
        type: 'dependency',
        parentComponent: resolvedComponentId
      });
    });
    
    // Track mount event
    if (trackMounts) {
      trackInteraction(resolvedComponentId, {
        type: 'mount',
        timestamp: Date.now()
      });
      
      mountTimeRef.current = Date.now();
    }
    
    // Return cleanup function
    return () => {
      // Track unmount event
      if (trackUnmounts && mountTimeRef.current) {
        const duration = Date.now() - mountTimeRef.current;
        
        trackInteraction(resolvedComponentId, {
          type: 'unmount',
          timestamp: Date.now(),
          duration
        });
      }
      
      // Disconnect observer if it exists
      if (visibilityObserverRef.current) {
        visibilityObserverRef.current.disconnect();
        visibilityObserverRef.current = null;
      }
    };
  }, [isInitialized, resolvedComponentId, trackMounts, trackUnmounts, ...dependencies]);
  
  // Set up visibility tracking if requested
  useEffect(() => {
    if (!isInitialized || !trackVisibility || !rootRef.current) return;
    
    // Check if Intersection Observer API is available
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('ReactSmart: IntersectionObserver not supported in this browser. Visibility tracking disabled.');
      return;
    }
    
    // Initialize last visibility timestamp
    let lastVisibilityTimestamp = 0;
    
    // Create an observer to track component visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const isVisible = entry.isIntersecting;
          const timestamp = Date.now();
          
          // Only track visibility changes
          if (isVisible !== isVisibleRef.current) {
            isVisibleRef.current = isVisible;
            
            if (isVisible) {
              // Component became visible
              trackInteraction(resolvedComponentId, {
                type: 'visibility',
                subType: 'visible',
                timestamp,
                viewportCoverage: entry.intersectionRatio
              });
              
              lastVisibilityTimestamp = timestamp;
            } else {
              // Component is no longer visible
              const duration = timestamp - lastVisibilityTimestamp;
              
              // Only track if it was visible for a meaningful time
              if (duration > 100) {
                trackInteraction(resolvedComponentId, {
                  type: 'visibility',
                  subType: 'hidden',
                  timestamp,
                  duration
                });
              }
            }
          }
        });
      },
      {
        threshold: [0, 0.1, 0.5, 0.9],
        rootMargin: '0px'
      }
    );
    
    // Start observing the component
    observer.observe(rootRef.current);
    visibilityObserverRef.current = observer;
    
    // Cleanup on unmount
    return () => {
      if (observer) {
        observer.disconnect();
        visibilityObserverRef.current = null;
      }
    };
  }, [isInitialized, resolvedComponentId, trackVisibility]);
  
  // Track click events
  const trackClickEvent = useCallback((event, customData = {}) => {
    if (!isInitialized) return;
    
    trackInteraction(resolvedComponentId, {
      type: 'click',
      timestamp: Date.now(),
      target: event.target.tagName,
      position: {
        x: event.clientX,
        y: event.clientY
      },
      ...customData
    });
  }, [isInitialized, resolvedComponentId, trackInteraction]);
  
  // Track hover events
  const trackHoverEvent = useCallback((event, customData = {}) => {
    if (!isInitialized) return;
    
    trackInteraction(resolvedComponentId, {
      type: 'hover',
      timestamp: Date.now(),
      target: event.target.tagName,
      position: {
        x: event.clientX,
        y: event.clientY
      },
      ...customData
    });
  }, [isInitialized, resolvedComponentId, trackInteraction]);
  
  // Generic interaction tracking function
  const trackCustomInteraction = useCallback((interactionType, data = {}) => {
    if (!isInitialized) return;
    
    trackInteraction(resolvedComponentId, {
      type: interactionType,
      timestamp: Date.now(),
      ...data
    });
  }, [isInitialized, resolvedComponentId, trackInteraction]);
  
  // Set up click event listener if requested
  useEffect(() => {
    if (!isInitialized || !trackClicks || !rootRef.current) return;
    
    const element = rootRef.current;
    
    // Add click event listener
    element.addEventListener('click', trackClickEvent);
    
    // Cleanup on unmount
    return () => {
      element.removeEventListener('click', trackClickEvent);
    };
  }, [isInitialized, trackClicks, trackClickEvent]);
  
  // Set up hover event listener if requested
  useEffect(() => {
    if (!isInitialized || !trackHovers || !rootRef.current) return;
    
    const element = rootRef.current;
    let hoverTimeout;
    let isHovering = false;
    
    // Track mouseenter with debounce
    const handleMouseEnter = (event) => {
      if (!isHovering) {
        isHovering = true;
        trackHoverEvent(event, { subType: 'enter' });
      }
    };
    
    // Track mouseleave with debounce
    const handleMouseLeave = (event) => {
      if (isHovering) {
        isHovering = false;
        trackHoverEvent(event, { subType: 'leave' });
      }
    };
    
    // Add hover event listeners
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    // Cleanup on unmount
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(hoverTimeout);
    };
  }, [isInitialized, trackHovers, trackHoverEvent]);
  
  // Manual preload function for dependencies
  const preloadDependencies = useCallback(() => {
    if (!isInitialized) return;
    
    dependencies.forEach(depId => {
      preloadComponent(depId);
    });
  }, [isInitialized, dependencies, preloadComponent]);
  
  return {
    rootRef, // Ref to attach to the root element of the component
    isVisible: isVisibleRef.current,
    trackInteraction: trackCustomInteraction, // Method to track custom interactions
    trackClick: trackClickEvent, // Method to track click events
    trackHover: trackHoverEvent, // Method to track hover events
    preloadDependencies, // Method to manually preload dependencies
    priority: getLoadingPriority(resolvedComponentId), // Current loading priority
    componentId: resolvedComponentId // The resolved component ID
  };
};

export default useComponentTracker;