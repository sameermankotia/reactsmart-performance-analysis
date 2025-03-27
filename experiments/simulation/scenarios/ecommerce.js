/**
 * ecommerce.js
 * 
 * Simulation scenario for testing ReactSmart performance with e-commerce applications.
 * This module simulates user interactions with typical e-commerce components and flows
 * to evaluate the effectiveness of ReactSmart's predictive loading capabilities.
 */

const { performance } = require('perf_hooks');
const { SimulationEnvironment } = require('../simulator');
const { calculateMetrics } = require('../../dataProcessing/metricCalculation');
const { networkProfiles } = require('../../utils/networkProfiles');
const { deviceProfiles } = require('../../utils/deviceProfiles');

/**
 * E-commerce component map
 * Represents the component structure of a typical e-commerce application
 */
const ecommerceComponents = {
  layout: {
    MainLayout: { size: 46.8, dependencies: ['Header', 'Footer', 'Sidebar'] },
    Header: { size: 35.2, dependencies: ['SearchBar', 'CartPreview', 'Navigation'] },
    Footer: { size: 28.5, dependencies: [] },
    Sidebar: { size: 32.1, dependencies: ['CategoryFilter', 'PriceFilter'] },
    Navigation: { size: 24.3, dependencies: ['MegaMenu'] },
    MegaMenu: { size: 42.6, dependencies: [] }
  },
  product: {
    ProductGrid: { size: 38.7, dependencies: ['ProductCard', 'Pagination'] },
    ProductCard: { size: 28.3, dependencies: ['ProductImage', 'AddToCartButton', 'QuickView'] },
    ProductDetail: { size: 74.5, dependencies: ['ProductGallery', 'ProductInfo', 'RelatedProducts'] },
    ProductGallery: { size: 82.3, dependencies: ['ZoomableImage', 'ThumbnailSlider'] },
    ProductInfo: { size: 45.7, dependencies: ['PriceDisplay', 'ProductOptions', 'AddToCartForm'] },
    RelatedProducts: { size: 52.4, dependencies: ['ProductCard'] },
    QuickView: { size: 58.2, dependencies: ['ProductGallery', 'ProductInfo'] },
    ZoomableImage: { size: 65.8, dependencies: [] },
    ThumbnailSlider: { size: 34.7, dependencies: [] },
    Pagination: { size: 18.5, dependencies: [] }
  },
  cart: {
    CartPreview: { size: 26.3, dependencies: ['CartItem'] },
    CartPage: { size: 48.6, dependencies: ['CartItem', 'CartSummary', 'ShippingCalculator'] },
    CartItem: { size: 21.8, dependencies: ['QuantitySelector'] },
    CartSummary: { size: 32.4, dependencies: ['PromoCodeInput'] },
    PromoCodeInput: { size: 15.7, dependencies: [] },
    ShippingCalculator: { size: 36.2, dependencies: [] },
    QuantitySelector: { size: 12.4, dependencies: [] }
  },
  checkout: {
    CheckoutFlow: { size: 52.7, dependencies: ['ShippingForm', 'PaymentForm', 'OrderSummary'] },
    ShippingForm: { size: 45.6, dependencies: ['AddressForm'] },
    PaymentForm: { size: 68.3, dependencies: ['CreditCardForm', 'PaymentOptions'] },
    OrderSummary: { size: 38.9, dependencies: [] },
    AddressForm: { size: 39.5, dependencies: ['AddressLookup'] },
    CreditCardForm: { size: 42.1, dependencies: ['SecurityVerification'] },
    PaymentOptions: { size: 25.7, dependencies: [] },
    AddressLookup: { size: 43.2, dependencies: [] },
    SecurityVerification: { size: 32.8, dependencies: [] }
  },
  user: {
    UserAccount: { size: 36.5, dependencies: ['OrderHistory', 'SavedAddresses', 'PaymentMethods'] },
    OrderHistory: { size: 42.7, dependencies: ['OrderDetails'] },
    SavedAddresses: { size: 28.5, dependencies: ['AddressForm'] },
    PaymentMethods: { size: 34.3, dependencies: ['CreditCardForm'] },
    OrderDetails: { size: 53.6, dependencies: [] },
    WishList: { size: 44.3, dependencies: ['ProductCard'] }
  },
  utility: {
    SearchBar: { size: 21.4, dependencies: ['SearchSuggestions'] },
    SearchSuggestions: { size: 32.6, dependencies: [] },
    CategoryFilter: { size: 28.9, dependencies: [] },
    PriceFilter: { size: 24.3, dependencies: ['PriceSlider'] },
    PriceSlider: { size: 35.2, dependencies: [] },
    AddToCartButton: { size: 15.3, dependencies: [] },
    AddToCartForm: { size: 27.5, dependencies: ['QuantitySelector'] },
    PriceDisplay: { size: 12.5, dependencies: [] },
    ProductOptions: { size: 25.8, dependencies: ['ColorSelector', 'SizeSelector'] },
    ColorSelector: { size: 18.4, dependencies: [] },
    SizeSelector: { size: 16.7, dependencies: [] }
  }
};

/**
 * Simulated user interaction patterns for e-commerce
 * Defines common sequences of component interactions based on user behavior research
 */
const interactionPatterns = [
  // Browse and search pattern
  {
    name: 'browse-search',
    sequence: [
      { component: 'MainLayout', duration: 3000 },
      { component: 'Navigation', duration: 2500 },
      { component: 'MegaMenu', duration: 4000 },
      { component: 'ProductGrid', duration: 12000 },
      { component: 'Pagination', duration: 1500 },
      { component: 'ProductGrid', duration: 8000 },
      { component: 'SearchBar', duration: 3000 },
      { component: 'SearchSuggestions', duration: 2500 },
      { component: 'ProductGrid', duration: 10000 }
    ],
    probability: 0.85
  },
  // Product detail interaction pattern
  {
    name: 'product-detail',
    sequence: [
      { component: 'ProductGrid', duration: 5000 },
      { component: 'ProductCard', duration: 2000, repeat: 3 },
      { component: 'ProductDetail', duration: 15000 },
      { component: 'ProductGallery', duration: 8000 },
      { component: 'ZoomableImage', duration: 5000 },
      { component: 'ProductInfo', duration: 6000 },
      { component: 'ProductOptions', duration: 4000 },
      { component: 'ColorSelector', duration: 2000 },
      { component: 'SizeSelector', duration: 2000 },
      { component: 'AddToCartForm', duration: 3000 },
      { component: 'RelatedProducts', duration: 7000 }
    ],
    probability: 0.75
  },
  // Quick view interaction pattern
  {
    name: 'quick-view',
    sequence: [
      { component: 'ProductGrid', duration: 6000 },
      { component: 'ProductCard', duration: 2000 },
      { component: 'QuickView', duration: 8000 },
      { component: 'ProductInfo', duration: 5000 },
      { component: 'AddToCartButton', duration: 2000 },
      { component: 'ProductGrid', duration: 4000 },
      { component: 'ProductCard', duration: 2000, repeat: 2 }
    ],
    probability: 0.60
  },
  // Cart and checkout pattern
  {
    name: 'cart-checkout',
    sequence: [
      { component: 'ProductDetail', duration: 10000 },
      { component: 'AddToCartForm', duration: 3000 },
      { component: 'CartPreview', duration: 4000 },
      { component: 'CartPage', duration: 8000 },
      { component: 'CartSummary', duration: 5000 },
      { component: 'PromoCodeInput', duration: 4000 },
      { component: 'ShippingCalculator', duration: 6000 },
      { component: 'CheckoutFlow', duration: 20000 },
      { component: 'ShippingForm', duration: 12000 },
      { component: 'AddressForm', duration: 15000 },
      { component: 'PaymentForm', duration: 18000 },
      { component: 'CreditCardForm', duration: 12000 },
      { component: 'OrderSummary', duration: 8000 }
    ],
    probability: 0.40
  },
  // Filter and refine pattern
  {
    name: 'filter-refine',
    sequence: [
      { component: 'ProductGrid', duration: 5000 },
      { component: 'Sidebar', duration: 3000 },
      { component: 'CategoryFilter', duration: 4000 },
      { component: 'ProductGrid', duration: 6000 },
      { component: 'PriceFilter', duration: 3500 },
      { component: 'PriceSlider', duration: 2500 },
      { component: 'ProductGrid', duration: 8000 }
    ],
    probability: 0.70
  },
  // User account pattern
  {
    name: 'user-account',
    sequence: [
      { component: 'Header', duration: 2000 },
      { component: 'UserAccount', duration: 6000 },
      { component: 'OrderHistory', duration: 8000 },
      { component: 'OrderDetails', duration: 12000 },
      { component: 'SavedAddresses', duration: 5000 },
      { component: 'PaymentMethods', duration: 6000 }
    ],
    probability: 0.25
  },
  // Wishlist pattern
  {
    name: 'wishlist',
    sequence: [
      { component: 'ProductDetail', duration: 8000 },
      { component: 'WishList', duration: 5000 },
      { component: 'ProductGrid', duration: 6000 },
      { component: 'WishList', duration: 8000 }
    ],
    probability: 0.20
  }
];

/**
 * Device-specific interaction modifiers
 * Adjusts interaction patterns based on device type
 */
const deviceInteractionModifiers = {
  mobile: {
    durationMultiplier: 1.3,  // Mobile interactions typically take longer
    probabilityMultiplier: {
      'browse-search': 0.9,
      'product-detail': 0.8,
      'quick-view': 0.7,
      'cart-checkout': 0.7,
      'filter-refine': 0.8,
      'user-account': 0.9,
      'wishlist': 0.6
    }
  },
  tablet: {
    durationMultiplier: 1.1,
    probabilityMultiplier: {
      'browse-search': 0.95,
      'product-detail': 0.9,
      'quick-view': 0.8,
      'cart-checkout': 0.8,
      'filter-refine': 0.9,
      'user-account': 0.8,
      'wishlist': 0.7
    }
  },
  desktop: {
    durationMultiplier: 1.0,  // Baseline
    probabilityMultiplier: {
      'browse-search': 1.0,
      'product-detail': 1.0,
      'quick-view': 1.0,
      'cart-checkout': 1.0,
      'filter-refine': 1.0,
      'user-account': 1.0,
      'wishlist': 1.0
    }
  }
};

/**
 * Simulates user sessions with an e-commerce application
 * @param {Object} options - Simulation options
 * @returns {Object} Simulation results including performance metrics
 */
async function simulateEcommerce(options = {}) {
  const {
    sessionCount = 1000,
    networkProfile = 'cable',
    deviceProfile = 'desktop',
    enableReactSmart = true,
    randomizationFactor = 0.2,
    simulationDuration = 300000,
    abandonmentThreshold = 4000,  // Time in ms after which users may abandon if page is unresponsive
    conversionTracking = true     // Track conversion metrics (successful checkouts)
  } = options;

  console.log(`Starting e-commerce simulation with ${sessionCount} sessions...`);
  console.log(`Network profile: ${networkProfile}, Device profile: ${deviceProfile}`);
  console.log(`ReactSmart ${enableReactSmart ? 'enabled' : 'disabled'}`);

  // Initialize simulation environment
  const environment = new SimulationEnvironment({
    components: ecommerceComponents,
    networkConditions: networkProfiles[networkProfile],
    deviceCapabilities: deviceProfiles[deviceProfile],
    enableReactSmart: enableReactSmart
  });

  const sessions = [];
  const metrics = {
    initialLoadTime: [],
    timeToInteractive: [],
    firstInputDelay: [],
    memoryUsage: [],
    cpuUsage: [],
    predictionAccuracy: enableReactSmart ? [] : null,
    componentLoadTimes: {},
    unnecessaryLoads: [],
    // E-commerce specific metrics
    cartAdditions: 0,
    checkoutStarts: 0,
    checkoutCompletions: 0,
    abandonments: 0,
    productViews: 0
  };

  // Apply device-specific interaction modifiers
  const deviceModifiers = deviceInteractionModifiers[deviceProfile] || deviceInteractionModifiers.desktop;

  // Initialize component load time tracking
  Object.keys(ecommerceComponents).forEach(category => {
    Object.keys(ecommerceComponents[category]).forEach(component => {
      metrics.componentLoadTimes[component] = [];
    });
  });

  // Run simulated sessions
  for (let i = 0; i < sessionCount; i++) {
    const sessionId = `ecommerce-session-${i}`;
    const sessionStartTime = performance.now();
    let sessionAbandoned = false;
    let cartAdded = false;
    let checkoutStarted = false;
    let checkoutCompleted = false;

    // Create a new session in the simulation environment
    environment.createSession(sessionId);
    
    // Simulate initial page load
    const initialLoadMetrics = await environment.simulateInitialLoad(sessionId);
    
    metrics.initialLoadTime.push(initialLoadMetrics.loadTime);
    metrics.timeToInteractive.push(initialLoadMetrics.timeToInteractive);
    metrics.firstInputDelay.push(initialLoadMetrics.firstInputDelay);
    
    // Check for early abandonment based on initial load time
    if (initialLoadMetrics.loadTime > abandonmentThreshold * 1.5 || 
        initialLoadMetrics.timeToInteractive > abandonmentThreshold * 2) {
      sessionAbandoned = true;
      metrics.abandonments++;
      
      sessions.push({
        sessionId,
        duration: initialLoadMetrics.timeToInteractive,
        patterns: ['abandoned-early'],
        abandoned: true,
        conversion: false
      });
      
      // Skip rest of session simulation
      continue;
    }
    
    // Track memory and CPU at start
    const initialResourceMetrics = environment.getResourceMetrics(sessionId);
    
    // Select interaction patterns for this session based on probabilities and device modifiers
    const sessionPatterns = [];
    interactionPatterns.forEach(pattern => {
      const adjustedProbability = pattern.probability * 
        (deviceModifiers.probabilityMultiplier[pattern.name] || 1.0);
      
      if (Math.random() < adjustedProbability) {
        // Apply duration modifiers based on device
        const modifiedPattern = { ...pattern };
        modifiedPattern.sequence = pattern.sequence.map(step => ({
          ...step,
          duration: step.duration * deviceModifiers.durationMultiplier
        }));
        
        sessionPatterns.push(modifiedPattern);
      }
    });
    
    // If no patterns were selected randomly, pick at least one
    if (sessionPatterns.length === 0) {
      // Get random pattern
      const randomPattern = interactionPatterns[
        Math.floor(Math.random() * interactionPatterns.length)
      ];
      
      // Apply device modifiers
      const modifiedPattern = { ...randomPattern };
      modifiedPattern.sequence = randomPattern.sequence.map(step => ({
        ...step,
        duration: step.duration * deviceModifiers.durationMultiplier
      }));
      
      sessionPatterns.push(modifiedPattern);
    }
    
    // Simulate the interaction patterns
    for (const pattern of sessionPatterns) {
      // Skip simulation if session was abandoned
      if (sessionAbandoned) break;
      
      // Track e-commerce specific metrics based on the pattern
      if (pattern.name === 'product-detail' || pattern.name === 'quick-view') {
        metrics.productViews++;
      }
      
      let patternAbandoned = false;
      const patternComponentLoadTimes = [];
      
      // Simulate each interaction step
      for (const step of pattern.sequence) {
        // Skip if pattern was abandoned
        if (patternAbandoned) break;
        
        // Track cart additions
        if ((step.component === 'AddToCartButton' || step.component === 'AddToCartForm') && !cartAdded) {
          cartAdded = true;
          metrics.cartAdditions++;
        }
        
        // Track checkout starts
        if (step.component === 'CheckoutFlow' && !checkoutStarted) {
          checkoutStarted = true;
          metrics.checkoutStarts++;
        }
        
        // Track checkout completions (simplified - in reality would be more complex)
        if (step.component === 'OrderSummary' && checkoutStarted && !checkoutCompleted) {
          // Simulate some checkout failures
          if (Math.random() < 0.85) {
            checkoutCompleted = true;
            metrics.checkoutCompletions++;
          }
        }
        
        // Simulate the component interaction
        const stepResult = await environment.simulateComponentInteraction(sessionId, step.component, {
          duration: step.duration,
          repeat: step.repeat || 1,
          randomizationFactor
        });
        
        // Track component load time
        if (stepResult.loadTime) {
          patternComponentLoadTimes.push(stepResult.loadTime);
          
          if (metrics.componentLoadTimes[step.component]) {
            metrics.componentLoadTimes[step.component].push(stepResult.loadTime);
          }
        }
        
        // Check for mid-pattern abandonment based on component load time
        if (stepResult.loadTime > abandonmentThreshold) {
          patternAbandoned = true;
          sessionAbandoned = true;
          metrics.abandonments++;
        }
      }
      
      // Calculate average load time for the pattern
      const avgPatternLoadTime = patternComponentLoadTimes.length > 0 
        ? patternComponentLoadTimes.reduce((sum, time) => sum + time, 0) / patternComponentLoadTimes.length
        : 0;
      
      // Get component metrics after pattern
      const componentMetrics = environment.getComponentMetrics(sessionId);
      
      // Track unnecessary loads
      metrics.unnecessaryLoads.push(componentMetrics.unnecessaryLoads);
    }
    
    // Get final resource usage
    const finalResourceMetrics = environment.getResourceMetrics(sessionId);
    
    metrics.memoryUsage.push(finalResourceMetrics.memory - initialResourceMetrics.memory);
    metrics.cpuUsage.push(finalResourceMetrics.cpu);
    
    // If ReactSmart is enabled, collect prediction accuracy metrics
    if (enableReactSmart) {
      const predictionMetrics = environment.getPredictionMetrics(sessionId);
      metrics.predictionAccuracy.push(predictionMetrics.accuracy);
    }
    
    // Calculate session duration
    const sessionDuration = performance.now() - sessionStartTime;
    
    // Store session data
    sessions.push({
      sessionId,
      duration: sessionDuration,
      patterns: sessionPatterns.map(p => p.name),
      abandoned: sessionAbandoned,
      conversion: checkoutCompleted
    });
    
    // Optional early termination if we've reached simulation duration
    if (performance.now() - sessionStartTime >= simulationDuration) {
      console.log(`Simulation duration reached after ${i+1} sessions.`);
      break;
    }
    
    // Log progress
    if ((i + 1) % 100 === 0 || i === sessionCount - 1) {
      console.log(`Completed ${i + 1}/${sessionCount} sessions`);
    }
  }

  // Calculate aggregate metrics
  const aggregateMetrics = calculateEcommerceMetrics(metrics, sessionCount);
  
  // Generate final simulation report
  const simulationResults = {
    config: {
      sessionCount,
      networkProfile,
      deviceProfile,
      enableReactSmart,
      randomizationFactor,
      simulationDuration,
      abandonmentThreshold
    },
    metrics: aggregateMetrics,
    sessions: sessions,
    rawMetrics: metrics,
    timestamp: new Date().toISOString()
  };
  
  console.log('E-commerce simulation completed.');
  console.log(`Average initial load time: ${aggregateMetrics.averageInitialLoadTime.toFixed(2)}ms`);
  console.log(`Average time to interactive: ${aggregateMetrics.averageTimeToInteractive.toFixed(2)}ms`);
  
  if (enableReactSmart) {
    console.log(`Prediction accuracy: ${(aggregateMetrics.averagePredictionAccuracy * 100).toFixed(2)}%`);
  }
  
  console.log(`Conversion rate: ${(aggregateMetrics.conversionRate * 100).toFixed(2)}%`);
  console.log(`Abandonment rate: ${(aggregateMetrics.abandonmentRate * 100).toFixed(2)}%`);
  
  return simulationResults;
}

/**
 * Calculates e-commerce specific metrics
 * @param {Object} metrics - Raw metrics data
 * @param {number} sessionCount - Total number of sessions
 * @returns {Object} Aggregated metrics
 */
function calculateEcommerceMetrics(metrics, sessionCount) {
  // General performance metrics
  const standardMetrics = calculateMetrics(metrics);
  
  // E-commerce specific metrics
  const ecommerceMetrics = {
    cartAddRate: metrics.cartAdditions / sessionCount,
    checkoutRate: metrics.checkoutStarts / metrics.cartAdditions || 0,
    conversionRate: metrics.checkoutCompletions / sessionCount,
    cartAbandonmentRate: (metrics.cartAdditions - metrics.checkoutCompletions) / metrics.cartAdditions || 0,
    abandonmentRate: metrics.abandonments / sessionCount,
    checkoutCompletionRate: metrics.checkoutCompletions / metrics.checkoutStarts || 0
  };
  
  return {
    ...standardMetrics,
    ...ecommerceMetrics
  };
}

/**
 * Compares ReactSmart performance against baseline for e-commerce applications
 * Runs two simulations side by side - one with ReactSmart enabled and one without
 */
async function runEcommerceComparison(options = {}) {
  console.log('Starting e-commerce performance comparison...');
  
  // Run baseline simulation (ReactSmart disabled)
  console.log('Running baseline simulation (ReactSmart disabled)...');
  const baselineResults = await simulateEcommerce({
    ...options,
    enableReactSmart: false
  });
  
  // Run optimized simulation (ReactSmart enabled)
  console.log('Running optimized simulation (ReactSmart enabled)...');
  const optimizedResults = await simulateEcommerce({
    ...options,
    enableReactSmart: true
  });
  
  // Calculate technical improvements
  const technicalImprovements = {
    initialLoadTime: calculateImprovement(
      baselineResults.metrics.averageInitialLoadTime,
      optimizedResults.metrics.averageInitialLoadTime
    ),
    timeToInteractive: calculateImprovement(
      baselineResults.metrics.averageTimeToInteractive,
      optimizedResults.metrics.averageTimeToInteractive
    ),
    firstInputDelay: calculateImprovement(
      baselineResults.metrics.averageFirstInputDelay,
      optimizedResults.metrics.averageFirstInputDelay
    ),
    memoryUsage: calculateImprovement(
      baselineResults.metrics.averageMemoryUsage,
      optimizedResults.metrics.averageMemoryUsage
    ),
    cpuUsage: calculateImprovement(
      baselineResults.metrics.averageCpuUsage,
      optimizedResults.metrics.averageCpuUsage
    ),
    predictionAccuracy: optimizedResults.metrics.averagePredictionAccuracy
  };
  
  // Calculate business metric improvements
  const businessImprovements = {
    conversionRate: calculateBusinessImprovement(
      baselineResults.metrics.conversionRate,
      optimizedResults.metrics.conversionRate
    ),
    cartAbandonmentRate: calculateBusinessImprovement(
      baselineResults.metrics.cartAbandonmentRate,
      optimizedResults.metrics.cartAbandonmentRate,
      true  // Lower is better for abandonment
    ),
    checkoutCompletionRate: calculateBusinessImprovement(
      baselineResults.metrics.checkoutCompletionRate,
      optimizedResults.metrics.checkoutCompletionRate
    )
  };
  
  // Generate component-specific improvements
  const componentImprovements = {};
  Object.keys(baselineResults.metrics.componentLoadTimes || {}).forEach(component => {
    if (baselineResults.metrics.componentLoadTimes[component] && 
        optimizedResults.metrics.componentLoadTimes[component]) {
      componentImprovements[component] = calculateImprovement(
        baselineResults.metrics.componentLoadTimes[component],
        optimizedResults.metrics.componentLoadTimes[component]
      );
    }
  });
  
  // Compile comparison report
  const comparisonReport = {
    baseline: baselineResults,
    optimized: optimizedResults,
    technicalImprovements,
    businessImprovements,
    componentImprovements,
    timestamp: new Date().toISOString()
  };
  
  // Log summary of improvements
  console.log('E-commerce comparison completed.');
  console.log('Technical performance improvements:');
  console.log(`Initial load time: ${(technicalImprovements.initialLoadTime * 100).toFixed(2)}%`);
  console.log(`Time to interactive: ${(technicalImprovements.timeToInteractive * 100).toFixed(2)}%`);
  console.log(`First input delay: ${(technicalImprovements.firstInputDelay * 100).toFixed(2)}%`);
  console.log(`Memory usage: ${(technicalImprovements.memoryUsage * 100).toFixed(2)}%`);
  console.log(`CPU usage: ${(technicalImprovements.cpuUsage * 100).toFixed(2)}%`);
  console.log(`Prediction accuracy: ${(technicalImprovements.predictionAccuracy * 100).toFixed(2)}%`);
  
  console.log('Business metric improvements:');
  console.log(`Conversion rate: ${(businessImprovements.conversionRate * 100).toFixed(2)}%`);
  console.log(`Cart abandonment reduction: ${(businessImprovements.cartAbandonmentRate * 100).toFixed(2)}%`);
  console.log(`Checkout completion rate: ${(businessImprovements.checkoutCompletionRate * 100).toFixed(2)}%`);
  
  return comparisonReport;
}

/**
 * Calculates percentage improvement between baseline and optimized values
 * @param {number} baseline - Baseline value
 * @param {number} optimized - Optimized value
 * @returns {number} Improvement as a decimal (e.g., 0.25 for 25% improvement)
 */
function calculateImprovement(baseline, optimized) {
  // For metrics where lower is better (most performance metrics)
  return (baseline - optimized) / baseline;
}

/**
 * Calculates percentage improvement for business metrics
 * @param {number} baseline - Baseline value
 * @param {number} optimized - Optimized value
 * @param {boolean} lowerIsBetter - Whether a lower value is better (e.g., abandonment rate)
 * @returns {number} Improvement as a decimal (e.g., 0.25 for 25% improvement)
 */
function calculateBusinessImprovement(baseline, optimized, lowerIsBetter = false) {
  if (lowerIsBetter) {
    // For metrics where lower is better (e.g., abandonment)
    return (baseline - optimized) / baseline;
  } else {
    // For metrics where higher is better (e.g., conversion)
    return (optimized - baseline) / baseline;
  }
}

module.exports = {
  simulateEcommerce,
  runEcommerceComparison,
  ecommerceComponents,
  interactionPatterns,
  deviceInteractionModifiers
};