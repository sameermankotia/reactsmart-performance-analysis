import React, { useEffect, useRef, useContext } from 'react';
import { ReactSmartContext } from './ReactSmartProvider';

/**
 * Higher-order component that enhances a React component with ReactSmart capabilities.
 * This adds tracking, interaction analysis, and optimized loading.
 * 
 * @param {React.Component} WrappedComponent - Component to enhance
 * @param {Object} options - Configuration options
 * @param {boolean} options.analyzeInteractions - Whether to analyze user interactions
 * @param {number} options.predictionThreshold - Threshold for prediction confidence
 * @param {Array} options.preloadDependencies - Dependencies to preload with this component
 * @param {string} options.importance - Component importance ('high', 'medium', 'low')
 * @returns {React.Component} - Enhanced component
 */
const withReactSmart = (WrappedComponent, options = {}) => {
  const {
    analyzeInteractions = true,
    predictionThreshold = 0.6,
    preloadDependencies = [],
    importance = 'medium',
    trackMounts = true,
    trackClicks = true,
    trackVisibility = true,
    trackHovers = false
  } = options;
  
  // Component display name for better debugging
  const displayName = WrappedComponent.displayName || 
                      WrappedComponent.name || 
                      'Component';
  
  // Create the enhanced component
  const WithReactSmart = React.forwardRef((props, ref) => {
    // Get ReactSmart context
    const {
      trackInteraction,
      registerComponent,
      preloadComponent,
      isInitialized
    } = useContext(ReactSmartContext);
    
    // Create references
    const componentRef = useRef(null);
    const rootRef = useRef(null);
    const visibilityObserverRef = useRef(null);
    const mountTimeRef = useRef(null);
    
    // Generate component ID based on display name and props
    const componentId = `${displayName}:${props.id || props.key || 'instance'}`;
    
    // Register component with ReactSmart
    useEffect(() => {
      if (!isInitialized) return;
      
      // Register this component
      registerComponent(componentId, {
        id: componentId,
        type: 'component',
        importance,
        dependencies: preloadDependencies,
        size: options.size || 10, // Size in KB (estimated if not provided)
        predictionThreshold,
        metadata: {
          displayName,
          props: Object.keys(props),
          ...options
        }
      });
      
      // Register dependencies if any
      preloadDependencies.forEach(depId => {
        registerComponent(depId, {
          id: depId,
          type: 'dependency',
          parentComponent: componentId
        });
      });
      
      // Track mount event
      if (trackMounts) {
        trackInteraction(componentId, {
          type: 'mount',
          timestamp: Date.now()
        });
        
        mountTimeRef.current = Date.now();
      }
      
      // Return cleanup function
      return () => {
        // Track unmount event
        if (trackMounts && mountTimeRef.current) {
          const duration = Date.now() - mountTimeRef.current;
          
          trackInteraction(componentId, {
            type: 'unmount',
            timestamp: Date.now(),
            duration
          });
        }
        
        // Disconnect visibility observer if it exists
        if (visibilityObserverRef.current) {
          visibilityObserverRef.current.disconnect();
          visibilityObserverRef.current = null;
        }
      };
    }, [isInitialized, componentId, props.id, props.key]);
    
    // Set up visibility tracking
    useEffect(() => {
      if (!isInitialized || !analyzeInteractions || !trackVisibility || !rootRef.current) return;
      
      // Check if Intersection Observer API is available
      if (typeof IntersectionObserver === 'undefined') {
        console.warn(`ReactSmart: IntersectionObserver not supported in this browser. Visibility tracking disabled for ${componentId}.`);
        return;
      }
      
      // Track when component first becomes visible
      let firstVisibleTime = null;
      
      // Create observer instance
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const timestamp = Date.now();
              
              // Track first visibility
              if (!firstVisibleTime) {
                firstVisibleTime = timestamp;
                
                // Track visibility event
                trackInteraction(componentId, {
                  type: 'visibility',
                  subType: 'visible',
                  timestamp,
                  viewportCoverage: entry.intersectionRatio
                });
                
                // Preload dependencies when component becomes visible
                preloadDependencies.forEach(depId => {
                  preloadComponent(depId);
                });
              }
            } else if (firstVisibleTime) {
              // Component was visible but is now hidden
              const duration = Date.now() - firstVisibleTime;
              
              // Only track if visible for a meaningful time
              if (duration > 100) {
                trackInteraction(componentId, {
                  type: 'visibility',
                  subType: 'hidden',
                  timestamp: Date.now(),
                  duration
                });
              }
              
              // Reset first visible time
              firstVisibleTime = null;
            }
          });
        },
        {
          threshold: [0, 0.2, 0.5, 0.8, 1],
          rootMargin: '0px'
        }
      );
      
      // Start observing the component
      observer.observe(rootRef.current);
      visibilityObserverRef.current = observer;
      
      return () => {
        observer.disconnect();
      };
    }, [isInitialized, componentId, analyzeInteractions, trackVisibility, preloadDependencies]);
    
    // Set up click tracking
    useEffect(() => {
      if (!isInitialized || !analyzeInteractions || !trackClicks || !rootRef.current) return;
      
      const element = rootRef.current;
      
      const handleClick = (event) => {
        trackInteraction(componentId, {
          type: 'click',
          timestamp: Date.now(),
          target: event.target.tagName,
          position: {
            x: event.clientX,
            y: event.clientY
          }
        });
      };
      
      element.addEventListener('click', handleClick);
      
      return () => {
        element.removeEventListener('click', handleClick);
      };
    }, [isInitialized, componentId, analyzeInteractions, trackClicks]);
    
    // Set up hover tracking if enabled
    useEffect(() => {
      if (!isInitialized || !analyzeInteractions || !trackHovers || !rootRef.current) return;
      
      const element = rootRef.current;
      let hoverTimeout;
      let hoverStartTime;
      let isHovering = false;
      
      const handleMouseEnter = () => {
        if (!isHovering) {
          isHovering = true;
          hoverStartTime = Date.now();
          
          trackInteraction(componentId, {
            type: 'hover',
            subType: 'enter',
            timestamp: hoverStartTime
          });
        }
      };
      
      const handleMouseLeave = () => {
        if (isHovering) {
          isHovering = false;
          clearTimeout(hoverTimeout);
          
          const duration = Date.now() - hoverStartTime;
          
          // Only track hover if it lasted a significant time
          if (duration > 300) {
            trackInteraction(componentId, {
              type: 'hover',
              subType: 'leave',
              timestamp: Date.now(),
              duration
            });
          }
        }
      };
      
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        clearTimeout(hoverTimeout);
      };
    }, [isInitialized, componentId, analyzeInteractions, trackHovers]);
    
    // Combine provided ref with our internal ref
    const setRootRef = (element) => {
      rootRef.current = element;
      
      // If a ref was passed through props, update it too
      if (ref) {
        if (typeof ref === 'function') {
          ref(element);
        } else {
          ref.current = element;
        }
      }
    };
    
    // Custom tracking methods that can be called from the wrapped component
    const trackCustomInteraction = (type, data = {}) => {
      if (!isInitialized || !analyzeInteractions) return;
      
      trackInteraction(componentId, {
        type,
        timestamp: Date.now(),
        ...data
      });
    };
    
    // Method to manually preload dependencies
    const preloadDependency = (dependencyId) => {
      if (!isInitialized) return;
      preloadComponent(dependencyId);
    };
    
    // Render the wrapped component with the tracking ref and additional props
    return (
      <WrappedComponent
        {...props}
        ref={componentRef}
        rootRef={setRootRef}
        reactSmartId={componentId}
        trackInteraction={trackCustomInteraction}
        preloadDependency={preloadDependency}
        preloadDependencies={() => {
          preloadDependencies.forEach(preloadDependency);
        }}
      />
    );
  });
  
  // Set display name for better debugging
  WithReactSmart.displayName = `withReactSmart(${displayName})`;
  
  return WithReactSmart;
};

export default withReactSmart;