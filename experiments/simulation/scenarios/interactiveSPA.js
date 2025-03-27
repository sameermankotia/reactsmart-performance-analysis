/**
 * interactiveSPA.js
 * 
 * Simulation scenario for testing ReactSmart performance with interactive Single Page Applications.
 * This module simulates user interactions with state-heavy, interactive React applications
 * to evaluate the effectiveness of ReactSmart's predictive loading capabilities in highly
 * dynamic applications with frequent state changes and component re-renders.
 */

const { performance } = require('perf_hooks');
const { SimulationEnvironment } = require('../simulator');
const { calculateMetrics } = require('../../dataProcessing/metricCalculation');
const { networkProfiles } = require('../../utils/networkProfiles');
const { deviceProfiles } = require('../../utils/deviceProfiles');

/**
 * Interactive SPA component map
 * Represents the component structure of a typical interactive single-page application
 */
const interactiveSPAComponents = {
  core: {
    AppShell: { size: 58.7, dependencies: ['Header', 'Sidebar', 'MainContent', 'Footer'] },
    Header: { size: 28.4, dependencies: ['Navigation', 'UserMenu', 'NotificationCenter'] },
    Sidebar: { size: 35.2, dependencies: ['Menu', 'ContextualHelp'] },
    MainContent: { size: 22.8, dependencies: [] },
    Footer: { size: 18.5, dependencies: [] },
    Navigation: { size: 32.6, dependencies: ['NavigationItem'] },
    NavigationItem: { size: 8.4, dependencies: [] },
    UserMenu: { size: 26.3, dependencies: ['UserAvatar', 'UserMenuItems'] },
    UserAvatar: { size: 12.5, dependencies: [] },
    UserMenuItems: { size: 18.7, dependencies: [] },
    NotificationCenter: { size: 42.8, dependencies: ['NotificationItem', 'NotificationList'] },
    NotificationItem: { size: 15.3, dependencies: [] },
    NotificationList: { size: 24.6, dependencies: [] },
    Menu: { size: 28.9, dependencies: ['MenuItem'] },
    MenuItem: { size: 10.2, dependencies: [] },
    ContextualHelp: { size: 36.5, dependencies: ['HelpContent'] },
    HelpContent: { size: 22.7, dependencies: [] }
  },
  forms: {
    FormBuilder: { size: 75.4, dependencies: ['FormField', 'FormValidation', 'FormSection'] },
    FormField: { size: 28.6, dependencies: ['InputText', 'InputSelect', 'InputCheckbox', 'InputRadio', 'InputDate'] },
    FormValidation: { size: 45.3, dependencies: ['ValidationError'] },
    ValidationError: { size: 12.8, dependencies: [] },
    FormSection: { size: 32.5, dependencies: [] },
    InputText: { size: 18.7, dependencies: [] },
    InputSelect: { size: 36.4, dependencies: ['SelectOptions'] },
    SelectOptions: { size: 24.3, dependencies: [] },
    InputCheckbox: { size: 15.8, dependencies: [] },
    InputRadio: { size: 16.2, dependencies: [] },
    InputDate: { size: 48.9, dependencies: ['DatePicker'] },
    DatePicker: { size: 65.7, dependencies: ['Calendar', 'TimePicker'] },
    Calendar: { size: 56.8, dependencies: [] },
    TimePicker: { size: 42.3, dependencies: [] },
    FormActions: { size: 22.5, dependencies: ['Button'] },
    Button: { size: 16.3, dependencies: [] }
  },
  dataDisplay: {
    DataGrid: { size: 85.6, dependencies: ['GridHeader', 'GridRow', 'GridCell', 'GridPagination', 'GridFilter'] },
    GridHeader: { size: 24.7, dependencies: ['GridHeaderCell'] },
    GridHeaderCell: { size: 18.5, dependencies: [] },
    GridRow: { size: 22.8, dependencies: ['GridCell'] },
    GridCell: { size: 15.2, dependencies: [] },
    GridPagination: { size: 28.9, dependencies: [] },
    GridFilter: { size: 35.4, dependencies: ['FilterPanel'] },
    FilterPanel: { size: 42.6, dependencies: ['FilterItem'] },
    FilterItem: { size: 18.3, dependencies: [] },
    DataCard: { size: 32.8, dependencies: ['CardHeader', 'CardContent', 'CardActions'] },
    CardHeader: { size: 15.2, dependencies: [] },
    CardContent: { size: 12.5, dependencies: [] },
    CardActions: { size: 14.8, dependencies: ['Button'] },
    DetailView: { size: 54.3, dependencies: ['DetailItem', 'DetailActions'] },
    DetailItem: { size: 22.6, dependencies: [] },
    DetailActions: { size: 26.4, dependencies: ['Button'] }
  },
  dataVisualization: {
    ChartContainer: { size: 24.5, dependencies: [] },
    LineChart: { size: 72.3, dependencies: ['ChartAxis', 'ChartTooltip', 'ChartLegend'] },
    BarChart: { size: 68.2, dependencies: ['ChartAxis', 'ChartTooltip', 'ChartLegend'] },
    PieChart: { size: 54.7, dependencies: ['ChartTooltip', 'ChartLegend'] },
    ChartAxis: { size: 32.4, dependencies: [] },
    ChartTooltip: { size: 26.8, dependencies: [] },
    ChartLegend: { size: 28.5, dependencies: [] },
    DataMap: { size: 92.6, dependencies: ['MapLayer', 'MapControls', 'MapTooltip'] },
    MapLayer: { size: 45.2, dependencies: [] },
    MapControls: { size: 35.7, dependencies: [] },
    MapTooltip: { size: 24.3, dependencies: [] }
  },
  interactions: {
    DragDropContainer: { size: 64.2, dependencies: ['DraggableItem', 'DropZone'] },
    DraggableItem: { size: 38.5, dependencies: [] },
    DropZone: { size: 32.7, dependencies: [] },
    ResizableContainer: { size: 58.6, dependencies: ['ResizeHandle'] },
    ResizeHandle: { size: 15.4, dependencies: [] },
    InfiniteScroll: { size: 42.8, dependencies: ['LoadingIndicator'] },
    LoadingIndicator: { size: 18.6, dependencies: [] },
    ContextMenu: { size: 36.4, dependencies: ['ContextMenuItem'] },
    ContextMenuItem: { size: 14.2, dependencies: [] },
    Tooltip: { size: 22.5, dependencies: [] },
    Modal: { size: 45.8, dependencies: ['ModalHeader', 'ModalContent', 'ModalFooter'] },
    ModalHeader: { size: 16.4, dependencies: [] },
    ModalContent: { size: 14.2, dependencies: [] },
    ModalFooter: { size: 18.5, dependencies: ['Button'] }
  },
  stateManagement: {
    StateProvider: { size: 48.3, dependencies: [] },
    StateConsumer: { size: 26.4, dependencies: [] },
    ActionDispatcher: { size: 32.5, dependencies: [] },
    StoreConnector: { size: 38.7, dependencies: [] },
    ErrorBoundary: { size: 28.9, dependencies: ['ErrorDisplay'] },
    ErrorDisplay: { size: 35.6, dependencies: [] },
    LoadingManager: { size: 24.3, dependencies: ['LoadingIndicator'] },
    CacheManager: { size: 42.7, dependencies: [] }
}

/**
 * Simulates component re-renders based on state changes
 * @param {Object} state - Current application state
 * @param {number} complexityMultiplier - Multiplier affecting render count
 * @returns {number} Number of components re-rendered
 */
function simulateRerenders(state, complexityMultiplier) {
  // Base number of components that would re-render on state change
  const baseRenderCount = 3; 
  
  // Calculate render count based on complexity and state version
  // More complex apps and more accumulated state changes lead to more re-renders
  const renderCount = Math.ceil(
    baseRenderCount * 
    complexityMultiplier * 
    (1 + Math.log10(state.stateVersion) / 2)
  );
  
  return renderCount;
}

/**
 * Calculates SPA-specific metrics
 * @param {Object} metrics - Raw metrics data
 * @param {number} sessionCount - Total number of sessions
 * @returns {Object} Aggregated metrics
 */
function calculateSPAMetrics(metrics, sessionCount) {
  // General performance metrics
  const standardMetrics = calculateMetrics(metrics);
  
  // SPA-specific metrics
  const spaMetrics = {
    averageStateTransitionTime: metrics.stateTransitionTimes.length > 0 
      ? metrics.stateTransitionTimes.reduce((sum, time) => sum + time, 0) / metrics.stateTransitionTimes.length
      : 0,
    averageRenderTime: metrics.renderTimes.length > 0
      ? metrics.renderTimes.reduce((sum, time) => sum + time, 0) / metrics.renderTimes.length
      : 0,
    averageInteractionDelay: metrics.interactionDelays.length > 0
      ? metrics.interactionDelays.reduce((sum, delay) => sum + delay, 0) / metrics.interactionDelays.length
      : 0,
    totalStateChanges: metrics.stateChanges,
    averageStateChangesPerSession: metrics.stateChanges / sessionCount,
    totalRerenders: metrics.rerenders,
    averageRerendersPerSession: metrics.rerenders / sessionCount,
    rerendersPerStateChange: metrics.stateChanges > 0
      ? metrics.rerenders / metrics.stateChanges
      : 0
  };
  
  return {
    ...standardMetrics,
    ...spaMetrics
  };
}

/**
 * Compares ReactSmart performance against baseline for interactive SPAs
 * Runs two simulations side by side - one with ReactSmart enabled and one without
 */
async function runInteractiveSPAComparison(options = {}) {
  console.log('Starting interactive SPA performance comparison...');
  
  // Run baseline simulation (ReactSmart disabled)
  console.log('Running baseline simulation (ReactSmart disabled)...');
  const baselineResults = await simulateInteractiveSPA({
    ...options,
    enableReactSmart: false
  });
  
  // Run optimized simulation (ReactSmart enabled)
  console.log('Running optimized simulation (ReactSmart enabled)...');
  const optimizedResults = await simulateInteractiveSPA({
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
    interactionDelay: calculateImprovement(
      baselineResults.metrics.averageInteractionDelay,
      optimizedResults.metrics.averageInteractionDelay
    ),
    stateTransitionTime: calculateImprovement(
      baselineResults.metrics.averageStateTransitionTime,
      optimizedResults.metrics.averageStateTransitionTime
    ),
    renderTime: calculateImprovement(
      baselineResults.metrics.averageRenderTime,
      optimizedResults.metrics.averageRenderTime
    ),
    predictionAccuracy: optimizedResults.metrics.averagePredictionAccuracy
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
    componentImprovements,
    timestamp: new Date().toISOString()
  };
  
  // Log summary of improvements
  console.log('Interactive SPA comparison completed.');
  console.log('Performance improvements:');
  console.log(`Initial load time: ${(technicalImprovements.initialLoadTime * 100).toFixed(2)}%`);
  console.log(`Time to interactive: ${(technicalImprovements.timeToInteractive * 100).toFixed(2)}%`);
  console.log(`First input delay: ${(technicalImprovements.firstInputDelay * 100).toFixed(2)}%`);
  console.log(`Interaction delay: ${(technicalImprovements.interactionDelay * 100).toFixed(2)}%`);
  console.log(`State transition time: ${(technicalImprovements.stateTransitionTime * 100).toFixed(2)}%`);
  console.log(`Render time: ${(technicalImprovements.renderTime * 100).toFixed(2)}%`);
  console.log(`Memory usage: ${(technicalImprovements.memoryUsage * 100).toFixed(2)}%`);
  console.log(`CPU usage: ${(technicalImprovements.cpuUsage * 100).toFixed(2)}%`);
  console.log(`Prediction accuracy: ${(technicalImprovements.predictionAccuracy * 100).toFixed(2)}%`);
  
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

module.exports = {
  simulateInteractiveSPA,
  runInteractiveSPAComparison,
  interactiveSPAComponents,
  interactionPatterns,
  complexityMultipliers
};;

/**
 * Simulated user interaction patterns for interactive SPAs
 * Defines common sequences of component interactions based on typical user workflows
 */
const interactionPatterns = [
  // Data grid exploration pattern
  {
    name: 'data-grid-exploration',
    sequence: [
      { component: 'AppShell', duration: 2000 },
      { component: 'DataGrid', duration: 10000 },
      { component: 'GridFilter', duration: 5000 },
      { component: 'FilterPanel', duration: 3000 },
      { component: 'FilterItem', duration: 2000, repeat: 3 },
      { component: 'DataGrid', duration: 8000 },
      { component: 'GridPagination', duration: 1500 },
      { component: 'DataGrid', duration: 7000 },
      { component: 'DetailView', duration: 12000 }
    ],
    probability: 0.8,
    stateChanges: [
      { after: 'GridFilter', state: { activeFilters: true } },
      { after: 'FilterItem', state: { filterCount: 'increment' } },
      { after: 'GridPagination', state: { currentPage: 'increment' } }
    ]
  },
  // Form interaction pattern
  {
    name: 'form-interaction',
    sequence: [
      { component: 'AppShell', duration: 2000 },
      { component: 'FormBuilder', duration: 15000 },
      { component: 'InputText', duration: 4000, repeat: 2 },
      { component: 'InputSelect', duration: 3000 },
      { component: 'SelectOptions', duration: 2500 },
      { component: 'InputDate', duration: 3500 },
      { component: 'DatePicker', duration: 5000 },
      { component: 'FormValidation', duration: 2000 },
      { component: 'FormActions', duration: 2500 },
      { component: 'Button', duration: 1500 }
    ],
    probability: 0.7,
    stateChanges: [
      { after: 'InputText', state: { formDirty: true, formValues: 'update' } },
      { after: 'SelectOptions', state: { formValues: 'update' } },
      { after: 'DatePicker', state: { formValues: 'update' } },
      { after: 'FormValidation', state: { formErrors: Math.random() > 0.7 } },
      { after: 'Button', state: { formSubmitted: true } }
    ]
  },
  // Data visualization interaction
  {
    name: 'data-visualization',
    sequence: [
      { component: 'AppShell', duration: 2000 },
      { component: 'ChartContainer', duration: 3000 },
      { component: 'LineChart', duration: 8000 },
      { component: 'ChartTooltip', duration: 2000, repeat: 4 },
      { component: 'BarChart', duration: 7500 },
      { component: 'ChartTooltip', duration: 2000, repeat: 3 },
      { component: 'PieChart', duration: 6000 },
      { component: 'ChartLegend', duration: 3000 },
      { component: 'DataMap', duration: 12000 },
      { component: 'MapControls', duration: 4000 }
    ],
    probability: 0.6,
    stateChanges: [
      { after: 'LineChart', state: { activeChartType: 'line' } },
      { after: 'BarChart', state: { activeChartType: 'bar' } },
      { after: 'PieChart', state: { activeChartType: 'pie' } },
      { after: 'ChartLegend', state: { legendVisible: 'toggle' } },
      { after: 'MapControls', state: { mapZoom: 'increment' } }
    ]
  },
  // Drag and drop interaction
  {
    name: 'drag-drop-interaction',
    sequence: [
      { component: 'AppShell', duration: 2000 },
      { component: 'DragDropContainer', duration: 5000 },
      { component: 'DraggableItem', duration: 2500, repeat: 5 },
      { component: 'DropZone', duration: 2000, repeat: 5 },
      { component: 'ResizableContainer', duration: 6000 },
      { component: 'ResizeHandle', duration: 3000, repeat: 2 }
    ],
    probability: 0.5,
    stateChanges: [
      { after: 'DraggableItem', state: { dragging: true, itemPosition: 'update' } },
      { after: 'DropZone', state: { dragging: false, itemParent: 'update' } },
      { after: 'ResizeHandle', state: { containerSize: 'update' } }
    ]
  },
  // Modal and context menu interaction
  {
    name: 'context-interaction',
    sequence: [
      { component: 'AppShell', duration: 2000 },
      { component: 'DataCard', duration: 4000 },
      { component: 'ContextMenu', duration: 3000 },
      { component: 'ContextMenuItem', duration: 1500, repeat: 2 },
      { component: 'Modal', duration: 8000 },
      { component: 'ModalContent', duration: 5000 },
      { component: 'FormField', duration: 4000, repeat: 2 },
      { component: 'ModalFooter', duration: 2000 },
      { component: 'Button', duration: 1500 }
    ],
    probability: 0.65,
    stateChanges: [
      { after: 'ContextMenu', state: { menuOpen: true, menuPosition: 'update' } },
      { after: 'ContextMenuItem', state: { menuOpen: false, selectedAction: 'update' } },
      { after: 'Modal', state: { modalOpen: true } },
      { after: 'Button', state: { modalOpen: false, itemUpdated: true } }
    ]
  },
  // Navigation and user menu interaction
  {
    name: 'navigation-interaction',
    sequence: [
      { component: 'AppShell', duration: 2000 },
      { component: 'Navigation', duration: 3000 },
      { component: 'NavigationItem', duration: 1500, repeat: 3 },
      { component: 'UserMenu', duration: 2500 },
      { component: 'UserMenuItems', duration: 2000 },
      { component: 'NotificationCenter', duration: 4000 },
      { component: 'NotificationList', duration: 3000 },
      { component: 'NotificationItem', duration: 1500, repeat: 3 }
    ],
    probability: 0.75,
    stateChanges: [
      { after: 'NavigationItem', state: { currentView: 'update' } },
      { after: 'UserMenu', state: { userMenuOpen: 'toggle' } },
      { after: 'NotificationCenter', state: { notificationsOpen: true } },
      { after: 'NotificationItem', state: { notificationCount: 'decrement' } }
    ]
  },
  // Infinite scroll interaction
  {
    name: 'infinite-scroll',
    sequence: [
      { component: 'AppShell', duration: 2000 },
      { component: 'DataGrid', duration: 5000 },
      { component: 'InfiniteScroll', duration: 15000 },
      { component: 'LoadingIndicator', duration: 2000, repeat: 4 },
      { component: 'DataCard', duration: 3000, repeat: 5 }
    ],
    probability: 0.55,
    stateChanges: [
      { after: 'InfiniteScroll', state: { loading: 'toggle' } },
      { after: 'LoadingIndicator', state: { itemCount: 'increment', loading: false } }
    ]
  }
];

/**
 * Interaction complexity multipliers
 * Adjusts the number of state changes and re-renders based on application complexity
 */
const complexityMultipliers = {
  low: {
    stateChanges: 0.7,
    componentRenders: 0.8,
    initialLoadSize: 0.8
  },
  medium: {
    stateChanges: 1.0,
    componentRenders: 1.0,
    initialLoadSize: 1.0
  },
  high: {
    stateChanges: 1.3,
    componentRenders: 1.5,
    initialLoadSize: 1.2
  },
  extreme: {
    stateChanges: 1.8,
    componentRenders: 2.2,
    initialLoadSize: 1.4
  }
};

/**
 * Simulates user sessions with an interactive SPA
 * @param {Object} options - Simulation options
 * @returns {Object} Simulation results including performance metrics
 */
async function simulateInteractiveSPA(options = {}) {
  const {
    sessionCount = 1000,
    networkProfile = 'cable',
    deviceProfile = 'desktop',
    enableReactSmart = true,
    randomizationFactor = 0.2,
    simulationDuration = 300000,
    complexityLevel = 'medium',
    stateChangeFrequency = 0.5, // Probability of state change during interactions
    reRenderThreshold = 0.7    // CPU/Memory threshold that triggers potential re-renders
  } = options;

  console.log(`Starting interactive SPA simulation with ${sessionCount} sessions...`);
  console.log(`Network profile: ${networkProfile}, Device profile: ${deviceProfile}`);
  console.log(`Complexity level: ${complexityLevel}, ReactSmart ${enableReactSmart ? 'enabled' : 'disabled'}`);

  // Get complexity multipliers
  const complexity = complexityMultipliers[complexityLevel] || complexityMultipliers.medium;

  // Initialize simulation environment
  const environment = new SimulationEnvironment({
    components: interactiveSPAComponents,
    networkConditions: networkProfiles[networkProfile],
    deviceCapabilities: deviceProfiles[deviceProfile],
    enableReactSmart: enableReactSmart,
    complexityMultipliers: complexity
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
    // SPA-specific metrics
    stateChanges: 0,
    rerenders: 0,
    stateTransitionTimes: [],
    renderTimes: [],
    interactionDelays: []
  };

  // Initialize component load time tracking
  Object.keys(interactiveSPAComponents).forEach(category => {
    Object.keys(interactiveSPAComponents[category]).forEach(component => {
      metrics.componentLoadTimes[component] = [];
    });
  });

  // Run simulated sessions
  for (let i = 0; i < sessionCount; i++) {
    const sessionId = `interactive-spa-session-${i}`;
    const sessionStartTime = performance.now();
    let sessionStateChanges = 0;
    let sessionRerenders = 0;

    // Create a new session in the simulation environment
    environment.createSession(sessionId);
    
    // Apply complexity multiplier to initial load
    const initialLoadOptions = {
      sizeMultiplier: complexity.initialLoadSize,
      includeCriticalComponents: true
    };
    
    // Simulate initial page load
    const initialLoadMetrics = await environment.simulateInitialLoad(sessionId, initialLoadOptions);
    
    metrics.initialLoadTime.push(initialLoadMetrics.loadTime);
    metrics.timeToInteractive.push(initialLoadMetrics.timeToInteractive);
    metrics.firstInputDelay.push(initialLoadMetrics.firstInputDelay);
    
    // Track memory and CPU at start
    const initialResourceMetrics = environment.getResourceMetrics(sessionId);
    
    // Select interaction patterns for this session based on probabilities
    const sessionPatterns = interactionPatterns.filter(pattern => 
      Math.random() < pattern.probability
    );
    
    // If no patterns were selected randomly, pick at least one
    if (sessionPatterns.length === 0) {
      sessionPatterns.push(interactionPatterns[
        Math.floor(Math.random() * interactionPatterns.length)
      ]);
    }
    
    // Initialize session state
    const sessionState = {
      stateVersion: 1,
      activeFilters: false,
      filterCount: 0,
      currentPage: 1,
      formDirty: false,
      formValues: {},
      formErrors: false,
      formSubmitted: false,
      activeChartType: null,
      legendVisible: false,
      mapZoom: 1,
      dragging: false,
      itemPosition: { x: 0, y: 0 },
      itemParent: null,
      containerSize: { width: 400, height: 300 },
      menuOpen: false,
      menuPosition: { x: 0, y: 0 },
      selectedAction: null,
      modalOpen: false,
      itemUpdated: false,
      currentView: 'default',
      userMenuOpen: false,
      notificationsOpen: false,
      notificationCount: 5,
      loading: false,
      itemCount: 20
    };
    
    // Simulate the interaction patterns
    for (const pattern of sessionPatterns) {
      let patternStateChanges = 0;
      let patternRerenders = 0;
      
      // Simulate each interaction step
      for (const step of pattern.sequence) {
        const stepStartTime = performance.now();
        
        // Simulate the component interaction
        const stepResult = await environment.simulateComponentInteraction(sessionId, step.component, {
          duration: step.duration,
          repeat: step.repeat || 1,
          randomizationFactor,
          state: sessionState
        });
        
        // Track component load time
        if (stepResult.loadTime) {
          if (metrics.componentLoadTimes[step.component]) {
            metrics.componentLoadTimes[step.component].push(stepResult.loadTime);
          }
        }
        
        // Calculate interaction delay (time from click to visible response)
        const interactionDelay = stepResult.initialResponseTime || 0;
        metrics.interactionDelays.push(interactionDelay);
        
        // Check for state changes defined in the pattern
        const stateChange = pattern.stateChanges && 
                            pattern.stateChanges.find(sc => sc.after === step.component);
        
        // Apply state changes if defined or by random chance
        if (stateChange || (Math.random() < stateChangeFrequency * complexity.stateChanges)) {
          const stateChangeStartTime = performance.now();
          
          // Apply specific state change if defined in pattern
          if (stateChange) {
            applyStateChange(sessionState, stateChange.state);
          } else {
            // Apply random state change
            applyRandomStateChange(sessionState);
          }
          
          sessionState.stateVersion++; // Increment state version
          sessionStateChanges++;
          patternStateChanges++;
          
          // Record state transition time
          const stateTransitionTime = performance.now() - stateChangeStartTime;
          metrics.stateTransitionTimes.push(stateTransitionTime);
          
          // Determine if re-renders should happen based on the complexity and thresholds
          const resourceMetrics = environment.getResourceMetrics(sessionId);
          const resourceIntensity = (resourceMetrics.cpu / 100) + (resourceMetrics.memory / 1000);
          
          if (resourceIntensity > reRenderThreshold * complexity.componentRenders) {
            const renderStartTime = performance.now();
            
            // Simulate component re-renders
            const renderCount = simulateRerenders(sessionState, complexity.componentRenders);
            sessionRerenders += renderCount;
            patternRerenders += renderCount;
            
            // Record render time
            const renderTime = performance.now() - renderStartTime;
            metrics.renderTimes.push(renderTime);
          }
        }
        
        // Get component metrics after step
        const componentMetrics = environment.getComponentMetrics(sessionId);
        
        // Track unnecessary loads
        metrics.unnecessaryLoads.push(componentMetrics.unnecessaryLoads);
      }
      
      // Log pattern metrics
      // console.log(`Pattern ${pattern.name} complete: ${patternStateChanges} state changes, ${patternRerenders} re-renders`);
    }
    
    // Update SPA-specific metrics totals
    metrics.stateChanges += sessionStateChanges;
    metrics.rerenders += sessionRerenders;
    
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
      stateChanges: sessionStateChanges,
      rerenders: sessionRerenders
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
  const aggregateMetrics = calculateSPAMetrics(metrics, sessionCount);
  
  // Generate final simulation report
  const simulationResults = {
    config: {
      sessionCount,
      networkProfile,
      deviceProfile,
      enableReactSmart,
      randomizationFactor,
      simulationDuration,
      complexityLevel,
      stateChangeFrequency,
      reRenderThreshold
    },
    metrics: aggregateMetrics,
    sessions: sessions,
    rawMetrics: metrics,
    timestamp: new Date().toISOString()
  };
  
  console.log('Interactive SPA simulation completed.');
  console.log(`Average initial load time: ${aggregateMetrics.averageInitialLoadTime.toFixed(2)}ms`);
  console.log(`Average time to interactive: ${aggregateMetrics.averageTimeToInteractive.toFixed(2)}ms`);
  console.log(`Average state transition time: ${aggregateMetrics.averageStateTransitionTime.toFixed(2)}ms`);
  console.log(`Average render time: ${aggregateMetrics.averageRenderTime.toFixed(2)}ms`);
  console.log(`Total state changes: ${metrics.stateChanges}`);
  console.log(`Total re-renders: ${metrics.rerenders}`);
  
  if (enableReactSmart) {
    console.log(`Prediction accuracy: ${(aggregateMetrics.averagePredictionAccuracy * 100).toFixed(2)}%`);
  }
  
  return simulationResults;
}

/**
 * Applies a specific state change to the session state
 * @param {Object} state - Current session state
 * @param {Object|string} change - State change to apply
 */
function applyStateChange(state, change) {
  if (typeof change === 'object') {
    // Apply direct object updates
    Object.keys(change).forEach(key => {
      state[key] = change[key];
    });
  } else if (typeof change === 'string') {
    // Handle special state change instructions
    switch (change) {
      case 'toggle':
        // Toggle boolean state if it exists
        if (typeof state[key] === 'boolean') {
          state[key] = !state[key];
        }
        break;
        
      case 'increment':
        // Increment numeric state if it exists
        if (typeof state[key] === 'number') {
          state[key]++;
        }
        break;
        
      case 'decrement':
        // Decrement numeric state if it exists
        if (typeof state[key] === 'number') {
          state[key] = Math.max(0, state[key] - 1);
        }
        break;
        
      case 'update':
        // Update with random value based on type
        if (typeof state[key] === 'number') {
          state[key] = Math.random() * 100;
        } else if (typeof state[key] === 'string') {
          state[key] = `updated-${Date.now()}`;
        } else if (typeof state[key] === 'object' && state[key] !== null) {
          // For objects, update a random property
          const objKeys = Object.keys(state[key]);
          if (objKeys.length > 0) {
            const randomKey = objKeys[Math.floor(Math.random() * objKeys.length)];
            if (typeof state[key][randomKey] === 'number') {
              state[key][randomKey] = Math.random() * 100;
            } else {
              state[key][randomKey] = `updated-${Date.now()}`;
            }
          }
        }
        break;
    }
  }
}

/**
 * Applies a random state change to simulate dynamic application behavior
 * @param {Object} state - Current session state
 */
function applyRandomStateChange(state) {
  // Get all state keys
  const stateKeys = Object.keys(state);
  
  // Skip stateVersion and select another random key
  const randomKey = stateKeys.filter(k => k !== 'stateVersion')[
    Math.floor(Math.random() * (stateKeys.length - 1))
  ];
  
  // Apply change based on value type
  if (typeof state[randomKey] === 'boolean') {
    state[randomKey] = !state[randomKey];
  } else if (typeof state[randomKey] === 'number') {
    // Randomly increment or decrement
    state[randomKey] += Math.random() > 0.5 ? 
      Math.ceil(Math.random() * 5) : 
      -Math.ceil(Math.random() * 5);
    
    // Ensure non-negative for counts
    if (randomKey.includes('Count') || randomKey.includes('count')) {
      state[randomKey] = Math.max(0, state[randomKey]);
    }
  } else if (typeof state[randomKey] === 'string' && state[randomKey] !== null) {
    state[randomKey] = `updated-${Date.now()}`;
  } else if (typeof state[randomKey] === 'object' && state[randomKey] !== null) {
    // For objects like coordinates or dimensions, update with random values
    const objKeys = Object.keys(state[randomKey]);
    if (objKeys.length > 0) {
      objKeys.forEach(objKey => {
        if (typeof state[randomKey][objKey] === 'number') {
          state[randomKey][objKey] += Math.random() * 20 - 10; // Add or subtract up to 10
        }
      });
    }
  }