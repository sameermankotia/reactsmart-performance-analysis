import React, { useEffect, useContext } from 'react';
import { Route } from 'react-router-dom';
import { ReactSmartContext } from './ReactSmartProvider';
import PropTypes from 'prop-types';

/**
 * Enhanced Route component that integrates with ReactSmart for
 * intelligent route-based component loading.
 */
const SmartRoute = ({
  path,
  component: Component,
  preloadRelated = [],
  analyzeRouteUsage = true,
  trackRouteMetrics = true,
  priority = 'medium',
  ...rest
}) => {
  const { 
    trackInteraction, 
    registerComponent, 
    preloadComponent,
    isInitialized 
  } = useContext(ReactSmartContext);
  
  // Generate a stable component ID based on the route path
  const routeId = `route:${path}`;
  
  // Register this route with ReactSmart
  useEffect(() => {
    if (!isInitialized) return;
    
    // Register the route as a component
    registerComponent(routeId, {
      id: routeId,
      type: 'route',
      path,
      priority,
      dependencies: preloadRelated,
      metadata: {
        preloadRelated,
        analyzeRouteUsage,
        trackRouteMetrics
      }
    });
    
    // Register related components for preloading
    preloadRelated.forEach(relatedId => {
      // Mark related components as dependencies of this route
      registerComponent(relatedId, {
        id: relatedId,
        type: 'component',
        priority: 'medium',
        relatedRoute: routeId,
        isPreloadTarget: true
      });
    });
  }, [isInitialized, registerComponent, routeId, path, preloadRelated, priority, analyzeRouteUsage, trackRouteMetrics]);
  
  // Wrap the component to add tracking
  const WrappedComponent = props => {
    useEffect(() => {
      if (!isInitialized || !analyzeRouteUsage) return;
      
      // Track route usage when component mounts
      trackInteraction(routeId, {
        type: 'navigation',
        path,
        timestamp: Date.now(),
        routeProps: rest,
        queryParams: new URLSearchParams(props.location?.search).toString(),
        referrer: document.referrer || props.history?.action || null
      });
      
      // Preload related components
      preloadRelated.forEach(relatedId => {
        preloadComponent(relatedId);
      });
      
      // Start timing the route duration
      const routeEnterTime = Date.now();
      
      // Return cleanup function
      return () => {
        // Track route exit when component unmounts
        const duration = Date.now() - routeEnterTime;
        
        if (duration > 500) { // Only track meaningful visits
          trackInteraction(routeId, {
            type: 'navigation-exit',
            path,
            timestamp: Date.now(),
            duration,
            nextRoute: window.location.pathname
          });
        }
      };
    }, [props.location?.pathname]);
    
    // Render the wrapped component
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `SmartRoute(${Component.displayName || Component.name || 'Component'})`;
  
  // Return enhanced Route
  return (
    <Route
      path={path}
      {...rest}
      render={routeProps => <WrappedComponent {...routeProps} />}
    />
  );
};

// Add compatibility for React Router v6
// This section allows the component to work with both v5 and v6 API
if (typeof Route.render === 'undefined') {
  // We're using React Router v6
  const SmartRouteV6 = ({
    path,
    component: Component,
    preloadRelated = [],
    analyzeRouteUsage = true,
    trackRouteMetrics = true,
    priority = 'medium',
    ...rest
  }) => {
    const { 
      trackInteraction, 
      registerComponent, 
      preloadComponent,
      isInitialized 
    } = useContext(ReactSmartContext);
    
    // Generate a stable component ID based on the route path
    const routeId = `route:${path}`;
    
    // Register this route with ReactSmart
    useEffect(() => {
      if (!isInitialized) return;
      
      // Register the route as a component
      registerComponent(routeId, {
        id: routeId,
        type: 'route',
        path,
        priority,
        dependencies: preloadRelated,
        metadata: {
          preloadRelated,
          analyzeRouteUsage,
          trackRouteMetrics
        }
      });
      
      // Register related components for preloading
      preloadRelated.forEach(relatedId => {
        // Mark related components as dependencies of this route
        registerComponent(relatedId, {
          id: relatedId,
          type: 'component',
          priority: 'medium',
          relatedRoute: routeId,
          isPreloadTarget: true
        });
      });
    }, [isInitialized, registerComponent, routeId, path, preloadRelated, priority, analyzeRouteUsage, trackRouteMetrics]);
    
    // For v6, we use a wrapper component approach
    const SmartRouteElement = () => {
      const location = window.location;
      
      useEffect(() => {
        if (!isInitialized || !analyzeRouteUsage) return;
        
        // Track route usage when component mounts
        trackInteraction(routeId, {
          type: 'navigation',
          path,
          timestamp: Date.now(),
          routeProps: rest,
          queryParams: new URLSearchParams(location.search).toString(),
          referrer: document.referrer || null
        });
        
        // Preload related components
        preloadRelated.forEach(relatedId => {
          preloadComponent(relatedId);
        });
        
        // Start timing the route duration
        const routeEnterTime = Date.now();
        
        // Return cleanup function
        return () => {
          // Track route exit when component unmounts
          const duration = Date.now() - routeEnterTime;
          
          if (duration > 500) { // Only track meaningful visits
            trackInteraction(routeId, {
              type: 'navigation-exit',
              path,
              timestamp: Date.now(),
              duration,
              nextRoute: window.location.pathname
            });
          }
        };
      }, [location.pathname]);
      
      return <Component {...rest} />;
    };
    
    SmartRouteElement.displayName = `SmartRoute(${Component.displayName || Component.name || 'Component'})`;
    
    // Import necessary components from react-router-dom v6
    try {
      const { Routes, Route } = require('react-router-dom');
      
      // Return React Router v6 compatible route
      return (
        <Routes>
          <Route path={path} element={<SmartRouteElement />} />
        </Routes>
      );
    } catch (error) {
      console.error('Error importing react-router-dom components:', error);
      return <Component {...rest} />;
    }
  };
  
  // Replace the v5 implementation with v6 implementation
  SmartRoute = SmartRouteV6;
}

SmartRoute.propTypes = {
  path: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  component: PropTypes.elementType.isRequired,
  preloadRelated: PropTypes.arrayOf(PropTypes.string),
  analyzeRouteUsage: PropTypes.bool,
  trackRouteMetrics: PropTypes.bool,
  priority: PropTypes.oneOf(['high', 'medium', 'low']),
};

export default SmartRoute;