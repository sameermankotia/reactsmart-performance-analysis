/**
 * Content-Heavy Application Simulation Scenario
 * 
 * This scenario simulates user behavior patterns and component structures
 * for content-heavy applications such as news sites, documentation portals,
 * blogs, and knowledge bases.
 * 
 * Content-heavy applications are characterized by:
 * - Large amount of text and media content
 * - Deep navigation hierarchies
 * - Low interaction-to-content ratio
 * - Sequential, hierarchical browsing patterns
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

/**
 * Generate a content-heavy application scenario for simulation
 * @param {Object} options - Scenario generation options
 * @returns {Object} - Generated scenario data
 */
async function generateContentHeavyScenario(options = {}) {
  const {
    sessionCount = 50,
    maxComponentsPerSession = 50,
    maxInteractionsPerSession = 60,
    includeRealWorldData = true,
    realWorldDataPath = null,
    randomSeed = 42,
    contentTypes = ['article', 'documentation', 'blog', 'knowledge-base'],
    contentCategories = ['technology', 'science', 'business', 'health', 'general'],
    outputPath = null
  } = options;
  
  // Initialize random number generator with seed for reproducibility
  const random = initializeRandom(randomSeed);
  
  console.log(`Generating content-heavy scenario with ${sessionCount} sessions`);
  
  // Define components common to content-heavy applications
  const components = defineContentHeavyComponents();
  
  // Define browsing patterns common to content-heavy applications
  const patterns = defineContentHeavyPatterns();
  
  // Generate sessions
  const sessions = [];
  
  for (let i = 0; i < sessionCount; i++) {
    // Select pattern for this session
    const patternIndex = randomInt(random, 0, patterns.length - 1);
    const pattern = patterns[patternIndex];
    
    // Select content type and category
    const contentType = contentTypes[randomInt(random, 0, contentTypes.length - 1)];
    const contentCategory = contentCategories[randomInt(random, 0, contentCategories.length - 1)];
    
    // Generate session
    const session = generateSession(
      random,
      components,
      pattern,
      i + 1,
      maxComponentsPerSession,
      maxInteractionsPerSession,
      contentType,
      contentCategory
    );
    
    sessions.push(session);
  }
  
  // Incorporate real-world data if available and requested
  if (includeRealWorldData && realWorldDataPath) {
    try {
      const realWorldSessions = await loadRealWorldData(realWorldDataPath);
      sessions.push(...realWorldSessions);
      console.log(`Added ${realWorldSessions.length} real-world sessions`);
    } catch (error) {
      console.error('Error loading real-world data:', error);
    }
  }
  
  // Create scenario data
  const scenario = {
    name: 'Content-Heavy Application Scenario',
    type: 'content-heavy',
    components,
    sessions,
    metadata: {
      generatedAt: new Date().toISOString(),
      sessionCount: sessions.length,
      componentCount: components.length,
      contentTypes,
      contentCategories,
      randomSeed
    }
  };
  
  // Save scenario if output path is provided
  if (outputPath) {
    await writeFile(outputPath, JSON.stringify(scenario, null, 2));
    console.log(`Scenario saved to ${outputPath}`);
  }
  
  return scenario;
}

/**
 * Define components common to content-heavy applications
 * @returns {Array} - Component definitions
 */
function defineContentHeavyComponents() {
  return [
    // Common structural components
    {
      id: 'Header',
      type: 'structural',
      size: 12,
      dependencies: ['Logo', 'MainNav'],
      importance: 'high'
    },
    {
      id: 'Footer',
      type: 'structural',
      size: 10,
      dependencies: ['FooterNav', 'Copyright'],
      importance: 'medium'
    },
    {
      id: 'Sidebar',
      type: 'structural',
      size: 15,
      dependencies: ['CategoryList', 'PopularArticles'],
      importance: 'high'
    },
    {
      id: 'Logo',
      type: 'ui',
      size: 5,
      dependencies: [],
      importance: 'medium'
    },
    {
      id: 'MainNav',
      type: 'navigation',
      size: 18,
      dependencies: ['SearchBar'],
      importance: 'high'
    },
    {
      id: 'FooterNav',
      type: 'navigation',
      size: 12,
      dependencies: [],
      importance: 'low'
    },
    {
      id: 'Copyright',
      type: 'ui',
      size: 3,
      dependencies: [],
      importance: 'low'
    },
    {
      id: 'SearchBar',
      type: 'interactive',
      size: 14,
      dependencies: ['SearchResults'],
      importance: 'high'
    },
    {
      id: 'SearchResults',
      type: 'data',
      size: 25,
      dependencies: ['ArticleCard'],
      importance: 'medium'
    },
    
    // Content browsing components
    {
      id: 'ArticleList',
      type: 'data',
      size: 35,
      dependencies: ['ArticleCard', 'Pagination'],
      importance: 'high'
    },
    {
      id: 'ArticleCard',
      type: 'ui',
      size: 12,
      dependencies: [],
      importance: 'high'
    },
    {
      id: 'CategoryList',
      type: 'navigation',
      size: 18,
      dependencies: [],
      importance: 'medium'
    },
    {
      id: 'TagCloud',
      type: 'navigation',
      size: 20,
      dependencies: [],
      importance: 'low'
    },
    {
      id: 'Breadcrumbs',
      type: 'navigation',
      size: 8,
      dependencies: [],
      importance: 'medium'
    },
    {
      id: 'Pagination',
      type: 'navigation',
      size: 10,
      dependencies: [],
      importance: 'medium'
    },
    {
      id: 'PopularArticles',
      type: 'data',
      size: 22,
      dependencies: ['ArticleCard'],
      importance: 'medium'
    },
    
    // Content display components
    {
      id: 'ArticleContent',
      type: 'content',
      size: 68,
      dependencies: ['RichTextRenderer', 'ImageGallery', 'RelatedArticles'],
      importance: 'high'
    },
    {
      id: 'RichTextRenderer',
      type: 'content',
      size: 42,
      dependencies: ['CodeBlock', 'TableRenderer'],
      importance: 'high'
    },
    {
      id: 'ImageGallery',
      type: 'content',
      size: 38,
      dependencies: ['LightboxViewer'],
      importance: 'medium'
    },
    {
      id: 'VideoPlayer',
      type: 'content',
      size: 120,
      dependencies: [],
      importance: 'medium'
    },
    {
      id: 'CodeBlock',
      type: 'content',
      size: 26,
      dependencies: ['SyntaxHighlighter'],
      importance: 'medium'
    },
    {
      id: 'SyntaxHighlighter',
      type: 'content',
      size: 85,
      dependencies: [],
      importance: 'medium'
    },
    {
      id: 'TableRenderer',
      type: 'content',
      size: 28,
      dependencies: [],
      importance: 'medium'
    },
    {
      id: 'TableOfContents',
      type: 'navigation',
      size: 15,
      dependencies: [],
      importance: 'high'
    },
    {
      id: 'LightboxViewer',
      type: 'ui',
      size: 45,
      dependencies: [],
      importance: 'low'
    },
    
    // Related content components
    {
      id: 'RelatedArticles',
      type: 'data',
      size: 32,
      dependencies: ['ArticleCard'],
      importance: 'medium'
    },
    {
      id: 'AuthorInfo',
      type: 'content',
      size: 14,
      dependencies: [],
      importance: 'low'
    },
    {
      id: 'ShareButtons',
      type: 'interactive',
      size: 18,
      dependencies: [],
      importance: 'low'
    },
    {
      id: 'CommentSection',
      type: 'interactive',
      size: 56,
      dependencies: ['CommentForm', 'CommentList'],
      importance: 'low'
    },
    {
      id: 'CommentForm',
      type: 'form',
      size: 22,
      dependencies: [],
      importance: 'low'
    },
    {
      id: 'CommentList',
      type: 'data',
      size: 38,
      dependencies: [],
      importance: 'low'
    },
    
    // Specialized documentation components
    {
      id: 'ApiReference',
      type: 'content',
      size: 130,
      dependencies: ['CodeBlock', 'TableRenderer'],
      importance: 'high'
    },
    {
      id: 'Playground',
      type: 'interactive',
      size: 95,
      dependencies: ['CodeBlock', 'ConsoleOutput'],
      importance: 'medium'
    },
    {
      id: 'ConsoleOutput',
      type: 'content',
      size: 18,
      dependencies: [],
      importance: 'medium'
    },
    {
      id: 'VersionSelector',
      type: 'ui',
      size: 12,
      dependencies: [],
      importance: 'medium'
    },
    
    // Knowledge base components
    {
      id: 'FaqSection',
      type: 'content',
      size: 42,
      dependencies: ['Accordion'],
      importance: 'high'
    },
    {
      id: 'Accordion',
      type: 'ui',
      size: 15,
      dependencies: [],
      importance: 'medium'
    },
    {
      id: 'SearchSuggestions',
      type: 'data',
      size: 18,
      dependencies: [],
      importance: 'medium'
    },
    
    // Analytics and ads components
    {
      id: 'AnalyticsTracker',
      type: 'utility',
      size: 35,
      dependencies: [],
      importance: 'low'
    },
    {
      id: 'AdBanner',
      type: 'ad',
      size: 40,
      dependencies: [],
      importance: 'low'
    },
    {
      id: 'NewsletterSignup',
      type: 'form',
      size: 22,
      dependencies: [],
      importance: 'low'
    }
  ];
}

/**
 * Define browsing patterns common to content-heavy applications
 * @returns {Array} - Browsing pattern definitions
 */
function defineContentHeavyPatterns() {
  return [
    // Deep content reading pattern (landing -> article -> related content)
    {
      name: 'Deep Reading',
      description: 'User lands on home page, browses to an article, reads deeply, and explores related content',
      steps: [
        { type: 'initial', components: ['Header', 'MainNav', 'ArticleList', 'Sidebar', 'Footer'] },
        { type: 'interaction', action: 'click', target: 'ArticleCard', 
          loads: ['Header', 'ArticleContent', 'TableOfContents', 'Sidebar', 'Footer'] },
        { type: 'interaction', action: 'scroll', target: 'ArticleContent', duration: 45000 },
        { type: 'interaction', action: 'click', target: 'TableOfContents', 
          loads: [] },
        { type: 'interaction', action: 'scroll', target: 'ArticleContent', duration: 30000 },
        { type: 'interaction', action: 'click', target: 'RelatedArticles', 
          loads: ['Header', 'ArticleContent', 'TableOfContents', 'Sidebar', 'Footer'] },
        { type: 'interaction', action: 'scroll', target: 'ArticleContent', duration: 60000 }
      ],
      probabilities: {
        bounceRate: 0.1,
        searchLikelihood: 0.3,
        commentLikelihood: 0.05,
        shareLikelihood: 0.08
      }
    },
    
    // Documentation browsing pattern (navigation-heavy)
    {
      name: 'Documentation Browsing',
      description: 'User navigates through documentation, scanning multiple pages and using search',
      steps: [
        { type: 'initial', components: ['Header', 'MainNav', 'Sidebar', 'ArticleContent', 'TableOfContents', 'Footer'] },
        { type: 'interaction', action: 'scroll', target: 'ArticleContent', duration: 15000 },
        { type: 'interaction', action: 'click', target: 'TableOfContents', 
          loads: [] },
        { type: 'interaction', action: 'scroll', target: 'ArticleContent', duration: 20000 },
        { type: 'interaction', action: 'click', target: 'CategoryList', 
          loads: ['Header', 'MainNav', 'Sidebar', 'ArticleContent', 'TableOfContents', 'Footer'] },
        { type: 'interaction', action: 'click', target: 'ArticleCard', 
          loads: ['Header', 'MainNav', 'Sidebar', 'ApiReference', 'TableOfContents', 'CodeBlock', 'Footer'] },
        { type: 'interaction', action: 'scroll', target: 'ApiReference', duration: 35000 },
        { type: 'interaction', action: 'click', target: 'SearchBar', 
          loads: ['SearchResults'] },
        { type: 'interaction', action: 'click', target: 'SearchResults', 
          loads: ['Header', 'MainNav', 'Sidebar', 'ArticleContent', 'CodeBlock', 'TableOfContents', 'Footer'] }
      ],
      probabilities: {
        bounceRate: 0.05,
        searchLikelihood: 0.8,
        apiReferenceLikelihood: 0.7,
        playgroundLikelihood: 0.3
      }
    },
    
    // News browsing pattern (headline skimming)
    {
      name: 'News Skimming',
      description: 'User skims multiple articles quickly without deep reading',
      steps: [
        { type: 'initial', components: ['Header', 'MainNav', 'ArticleList', 'Sidebar', 'Footer'] },
        { type: 'interaction', action: 'click', target: 'ArticleCard', 
          loads: ['Header', 'ArticleContent', 'RelatedArticles', 'Footer'] },
        { type: 'interaction', action: 'scroll', target: 'ArticleContent', duration: 10000 },
        { type: 'interaction', action: 'click', target: 'MainNav', 
          loads: ['Header', 'MainNav', 'ArticleList', 'Sidebar', 'Footer'] },
        { type: 'interaction', action: 'click', target: 'ArticleCard', 
          loads: ['Header', 'ArticleContent', 'RelatedArticles', 'Footer'] },
        { type: 'interaction', action: 'scroll', target: 'ArticleContent', duration: 8000 },
        { type: 'interaction', action: 'click', target: 'RelatedArticles', 
          loads: ['Header', 'ArticleContent', 'RelatedArticles', 'Footer'] },
        { type: 'interaction', action: 'scroll', target: 'ArticleContent', duration: 5000 },
        { type: 'interaction', action: 'click', target: 'SearchBar', 
          loads: ['SearchResults'] },
        { type: 'interaction', action: 'click', target: 'SearchResults', 
          loads: ['Header', 'ArticleContent', 'RelatedArticles', 'Footer'] }
      ],
      probabilities: {
        bounceRate: 0.2,
        searchLikelihood: 0.4,
        categoryBrowseLikelihood: 0.6,
        multipleArticleLikelihood: 0.9
      }
    },
    
    // Knowledge base pattern (problem-solving)
    {
      name: 'Knowledge Base',
      description: 'User searches for specific information to solve a problem',
      steps: [
        { type: 'initial', components: ['Header', 'MainNav', 'SearchBar', 'FaqSection', 'Sidebar', 'Footer'] },
        { type: 'interaction', action: 'click', target: 'SearchBar', 
          loads: ['SearchResults'] },
        { type: 'interaction', action: 'click', target: 'SearchResults', 
          loads: ['Header', 'ArticleContent', 'RelatedArticles', 'Footer'] },
        { type: 'interaction', action: 'scroll', target: 'ArticleContent', duration: 25000 },
        { type: 'interaction', action: 'click', target: 'TableOfContents', 
          loads: [] },
        { type: 'interaction', action: 'scroll', target: 'ArticleContent', duration: 15000 },
        { type: 'interaction', action: 'click', target: 'SearchBar', 
          loads: ['SearchResults'] },
        { type: 'interaction', action: 'click', target: 'SearchResults', 
          loads: ['Header', 'FaqSection', 'Accordion', 'Footer'] }
      ],
      probabilities: {
        bounceRate: 0.15,
        searchLikelihood: 0.9,
        faqLikelihood: 0.7,
        multipleSearchLikelihood: 0.8
      }
    }
  ];
}

/**
 * Generate a single session based on components and patterns
 * @param {Object} random - Random number generator
 * @param {Array} components - Component definitions
 * @param {Object} pattern - Browsing pattern
 * @param {number} sessionNum - Session number
 * @param {number} maxComponents - Maximum components per session
 * @param {number} maxInteractions - Maximum interactions per session
 * @param {string} contentType - Content type
 * @param {string} contentCategory - Content category
 * @returns {Object} - Generated session
 */
function generateSession(
  random,
  components,
  pattern,
  sessionNum,
  maxComponents,
  maxInteractions,
  contentType,
  contentCategory
) {
  // Create session object
  const session = {
    sessionId: `content-heavy-${sessionNum}`,
    metadata: {
      pattern: pattern.name,
      contentType,
      contentCategory,
      deviceType: randomDeviceType(random),
      browserType: randomBrowserType(random),
      timestamp: randomTimestamp(random),
      duration: 0
    },
    components: [],
    interactions: []
  };
  
  // Start with initial components from pattern
  const initialStep = pattern.steps.find(step => step.type === 'initial');
  if (initialStep && initialStep.components) {
    initialStep.components.forEach(componentId => {
      const component = findComponent(components, componentId);
      if (component) {
        session.components.push({
          ...component,
          loaded: true,
          loadTime: randomLoadTime(random, component.size)
        });
      }
    });
  }
  
  // Add random variations and additional components
  addRandomComponents(random, session, components, maxComponents);
  
  // Generate interactions based on pattern
  generateInteractions(random, session, pattern, components, maxInteractions);
  
  // Calculate session duration
  if (session.interactions.length > 0) {
    const lastInteraction = session.interactions[session.interactions.length - 1];
    session.metadata.duration = lastInteraction.timestamp + (lastInteraction.duration || 0);
  }
  
  return session;
}

/**
 * Add random components to a session
 * @param {Object} random - Random number generator
 * @param {Object} session - Session to add components to
 * @param {Array} components - All available components
 * @param {number} maxComponents - Maximum components per session
 */
function addRandomComponents(random, session, components, maxComponents) {
  // Calculate how many more components to add
  const currentCount = session.components.length;
  const additionalCount = Math.min(
    randomInt(random, 5, 15),
    maxComponents - currentCount
  );
  
  // Add random components not already in the session
  const existingIds = new Set(session.components.map(c => c.id));
  
  for (let i = 0; i < additionalCount; i++) {
    let attempts = 0;
    let component;
    
    // Try to find a component not already in the session
    while (attempts < 10) {
      const index = randomInt(random, 0, components.length - 1);
      const candidate = components[index];
      
      if (!existingIds.has(candidate.id)) {
        component = candidate;
        break;
      }
      
      attempts++;
    }
    
    // Add component if found
    if (component) {
      session.components.push({
        ...component,
        loaded: false, // These start as not loaded
        loadTime: randomLoadTime(random, component.size)
      });
      existingIds.add(component.id);
    }
  }
}

/**
 * Generate interactions for a session based on pattern
 * @param {Object} random - Random number generator
 * @param {Object} session - Session to add interactions to
 * @param {Object} pattern - Browsing pattern
 * @param {Array} components - All available components
 * @param {number} maxInteractions - Maximum interactions per session
 */
function generateInteractions(random, session, pattern, components, maxInteractions) {
  // Start with pattern's predefined interactions
  const interactionSteps = pattern.steps.filter(step => step.type === 'interaction');
  
  // Keep track of timestamp as we add interactions
  let currentTimestamp = 0;
  
  // Process each interaction step from the pattern
  interactionSteps.forEach(step => {
    // Skip if we've reached the maximum
    if (session.interactions.length >= maxInteractions) return;
    
    // Find target component
    const targetComponent = findComponentInSession(session, step.target);
    if (!targetComponent) return;
    
    // Add think time before interaction
    const thinkTime = randomInt(random, 1000, 5000);
    currentTimestamp += thinkTime;
    
    // Create interaction
    const interaction = {
      type: step.action,
      componentId: targetComponent.id,
      timestamp: currentTimestamp
    };
    
    // Add duration for scroll actions
    if (step.action === 'scroll') {
      interaction.duration = step.duration || randomInt(random, 5000, 30000);
      currentTimestamp += interaction.duration;
    } else {
      currentTimestamp += randomInt(random, 100, 500); // Action time
    }
    
    // Add loaded components for this interaction
    if (step.loads && step.loads.length > 0) {
      interaction.loadsComponents = step.loads;
      
      // Mark these components as loaded
      step.loads.forEach(componentId => {
        const component = findComponentInSession(session, componentId);
        if (component) {
          component.loaded = true;
        }
      });
      
      // Add loading time
      currentTimestamp += randomInt(random, 300, 2000);
    }
    
    // Add the interaction
    session.interactions.push(interaction);
  });
  
  // Add random additional interactions to reach desired count
  const additionalInteractions = maxInteractions - session.interactions.length;
  
  if (additionalInteractions > 0) {
    addRandomInteractions(
      random,
      session,
      Math.min(additionalInteractions, 20),
      currentTimestamp,
      pattern.probabilities
    );
  }
}

/**
 * Add random interactions to a session
 * @param {Object} random - Random number generator
 * @param {Object} session - Session to add interactions to
 * @param {number} count - Number of interactions to add
 * @param {number} startTimestamp - Starting timestamp
 * @param {Object} probabilities - Action probabilities
 */
function addRandomInteractions(random, session, count, startTimestamp, probabilities) {
  let currentTimestamp = startTimestamp;
  
  for (let i = 0; i < count; i++) {
    // Select a random component from the session
    const componentIndex = randomInt(random, 0, session.components.length - 1);
    const component = session.components[componentIndex];
    
    // Determine action type based on probabilities
    let actionType;
    const r = random();
    
    if (r < 0.5) {
      actionType = 'scroll';
    } else if (r < 0.7) {
      actionType = 'click';
    } else if (r < 0.85) {
      actionType = 'hover';
    } else {
      actionType = 'keyboard';
    }
    
    // Add think time
    const thinkTime = randomInt(random, 1000, 8000);
    currentTimestamp += thinkTime;
    
    // Create interaction
    const interaction = {
      type: actionType,
      componentId: component.id,
      timestamp: currentTimestamp
    };
    
    // Add appropriate properties based on action type
    if (actionType === 'scroll') {
      interaction.duration = randomInt(random, 5000, 40000);
      currentTimestamp += interaction.duration;
    } else if (actionType === 'keyboard') {
      interaction.keyCount = randomInt(random, 5, 50);
      interaction.duration = interaction.keyCount * 120; // Typing time
      currentTimestamp += interaction.duration;
    } else {
      currentTimestamp += randomInt(random, 100, 500); // Action time
    }
    
    // Determine if this interaction loads new components
    if (actionType === 'click' && random() < 0.3) {
      // Random number of components to load
      const loadCount = randomInt(random, 1, 5);
      const loadableComponents = session.components
        .filter(c => !c.loaded)
        .slice(0, loadCount);
      
      if (loadableComponents.length > 0) {
        interaction.loadsComponents = loadableComponents.map(c => c.id);
        
        // Mark these components as loaded
        loadableComponents.forEach(component => {
          component.loaded = true;
        });
        
        // Add loading time
        currentTimestamp += randomInt(random, 300, 2000);
      }
    }
    
    // Add the interaction
    session.interactions.push(interaction);
  }
}

/**
 * Find a component by ID in the session
 * @param {Object} session - Session to search in
 * @param {string} componentId - Component ID to find
 * @returns {Object|null} - Found component or null
 */
function findComponentInSession(session, componentId) {
  return session.components.find(c => c.id === componentId) || null;
}

/**
 * Find a component by ID in the component list
 * @param {Array} components - Component list to search in
 * @param {string} componentId - Component ID to find
 * @returns {Object|null} - Found component or null
 */
function findComponent(components, componentId) {
  return components.find(c => c.id === componentId) || null;
}

/**
 * Generate a random load time based on component size
 * @param {Object} random - Random number generator
 * @param {number} componentSize - Component size in KB
 * @returns {number} - Load time in milliseconds
 */
function randomLoadTime(random, componentSize) {
  // Base load time calculation
  const baseLoadTime = componentSize * 5; // 5ms per KB as a base
  
  // Add random variation
  const variation = (random() * 0.4 + 0.8); // 0.8 to 1.2
  
  return Math.round(baseLoadTime * variation);
}

/**
 * Generate a random device type
 * @param {Object} random - Random number generator
 * @returns {string} - Device type
 */
function randomDeviceType(random) {
  const r = random();
  if (r < 0.6) return 'desktop';
  if (r < 0.9) return 'mobile';
  return 'tablet';
}

/**
 * Generate a random browser type
 * @param {Object} random - Random number generator
 * @returns {string} - Browser type
 */
function randomBrowserType(random) {
  const r = random();
  if (r < 0.5) return 'Chrome';
  if (r < 0.7) return 'Firefox';
  if (r < 0.85) return 'Safari';
  if (r < 0.95) return 'Edge';
  return 'Other';
}

/**
 * Generate a random timestamp within the last 30 days
 * @param {Object} random - Random number generator
 * @returns {string} - ISO timestamp
 */
function randomTimestamp(random) {
  const now = new Date();
  const daysAgo = random() * 30;
  const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return timestamp.toISOString();
}

/**
 * Generate a random integer between min and max (inclusive)
 * @param {Object} random - Random number generator
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
function randomInt(random, min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

/**
 * Initialize a seeded random number generator
 * @param {number} seed - Random seed
 * @returns {Function} - Random number generator
 */
function initializeRandom(seed) {
  // Simple seeded random number generator
  let state = seed;
  
  return function() {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/**
 * Load real-world session data from a file
 * @param {string} filePath - Path to real-world data file
 * @returns {Array} - Loaded session data
 */
async function loadRealWorldData(filePath) {
    try {
      // Read and parse data file
      const content = await readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      
      // Validate data structure
      if (!Array.isArray(data)) {
        // If data is not an array, check if it has a sessions property
        if (data.sessions && Array.isArray(data.sessions)) {
          return data.sessions;
        }
        
        throw new Error('Invalid real-world data format: expected array or object with sessions array');
      }
      
      // Validate and process each session
      const validSessions = data.filter(session => {
        // Basic validation
        return session && 
               session.components && Array.isArray(session.components) &&
               session.interactions && Array.isArray(session.interactions);
      }).map(session => {
        // Add content-heavy metadata if not present
        if (!session.metadata) {
          session.metadata = {};
        }
        
        if (!session.metadata.contentType) {
          session.metadata.contentType = 'article';
        }
        
        if (!session.metadata.contentCategory) {
          session.metadata.contentCategory = 'general';
        }
        
        if (!session.metadata.pattern) {
          session.metadata.pattern = 'real-world';
        }
        
        return session;
      });
      
      return validSessions;
    } catch (error) {
      console.error(`Error loading real-world data from ${filePath}:`, error);
      return [];
    }
  }
  
  /**
   * Calculate statistical metrics for a generated scenario
   * @param {Object} scenario - Generated scenario
   * @returns {Object} - Statistical metrics
   */
  function calculateScenarioMetrics(scenario) {
    if (!scenario || !scenario.sessions || !Array.isArray(scenario.sessions)) {
      return {};
    }
    
    const sessions = scenario.sessions;
    
    // Component usage statistics
    const componentUsage = new Map();
    let totalComponents = 0;
    let totalLoadedComponents = 0;
    
    // Interaction statistics
    let totalInteractions = 0;
    const interactionTypes = new Map();
    
    // Session statistics
    let totalDuration = 0;
    const deviceTypes = new Map();
    const browserTypes = new Map();
    const contentTypes = new Map();
    const patterns = new Map();
    
    // Process each session
    sessions.forEach(session => {
      // Component statistics
      if (session.components && Array.isArray(session.components)) {
        totalComponents += session.components.length;
        
        // Count loaded components
        const loadedCount = session.components.filter(c => c.loaded).length;
        totalLoadedComponents += loadedCount;
        
        // Track component usage
        session.components.forEach(component => {
          const count = componentUsage.get(component.id) || 0;
          componentUsage.set(component.id, count + 1);
        });
      }
      
      // Interaction statistics
      if (session.interactions && Array.isArray(session.interactions)) {
        totalInteractions += session.interactions.length;
        
        // Track interaction types
        session.interactions.forEach(interaction => {
          const count = interactionTypes.get(interaction.type) || 0;
          interactionTypes.set(interaction.type, count + 1);
        });
      }
      
      // Session metadata statistics
      if (session.metadata) {
        // Duration
        if (session.metadata.duration) {
          totalDuration += session.metadata.duration;
        }
        
        // Device type
        if (session.metadata.deviceType) {
          const count = deviceTypes.get(session.metadata.deviceType) || 0;
          deviceTypes.set(session.metadata.deviceType, count + 1);
        }
        
        // Browser type
        if (session.metadata.browserType) {
          const count = browserTypes.get(session.metadata.browserType) || 0;
          browserTypes.set(session.metadata.browserType, count + 1);
        }
        
        // Content type
        if (session.metadata.contentType) {
          const count = contentTypes.get(session.metadata.contentType) || 0;
          contentTypes.set(session.metadata.contentType, count + 1);
        }
        
        // Pattern
        if (session.metadata.pattern) {
          const count = patterns.get(session.metadata.pattern) || 0;
          patterns.set(session.metadata.pattern, count + 1);
        }
      }
    });
    
    // Calculate averages
    const sessionCount = sessions.length;
    const avgComponentsPerSession = totalComponents / sessionCount;
    const avgLoadedComponentsPerSession = totalLoadedComponents / sessionCount;
    const avgInteractionsPerSession = totalInteractions / sessionCount;
    const avgSessionDuration = totalDuration / sessionCount;
    
    // Calculate most frequent values
    const mostFrequentDevice = getMostFrequent(deviceTypes);
    const mostFrequentBrowser = getMostFrequent(browserTypes);
    const mostFrequentContentType = getMostFrequent(contentTypes);
    const mostFrequentPattern = getMostFrequent(patterns);
    
    // Get most and least used components
    const componentUsageArray = Array.from(componentUsage.entries());
    componentUsageArray.sort((a, b) => b[1] - a[1]);
    
    const mostUsedComponents = componentUsageArray.slice(0, 5).map(([id, count]) => ({
      id,
      count,
      percentage: (count / sessionCount) * 100
    }));
    
    const leastUsedComponents = componentUsageArray.slice(-5).reverse().map(([id, count]) => ({
      id,
      count,
      percentage: (count / sessionCount) * 100
    }));
    
    // Get interaction type distribution
    const interactionDistribution = Array.from(interactionTypes.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: (count / totalInteractions) * 100
    }));
    
    interactionDistribution.sort((a, b) => b.count - a.count);
    
    return {
      sessionCount,
      totalComponents,
      totalLoadedComponents,
      totalInteractions,
      avgComponentsPerSession,
      avgLoadedComponentsPerSession,
      avgInteractionsPerSession,
      avgSessionDuration,
      deviceDistribution: Object.fromEntries(deviceTypes),
      browserDistribution: Object.fromEntries(browserTypes),
      contentTypeDistribution: Object.fromEntries(contentTypes),
      patternDistribution: Object.fromEntries(patterns),
      mostFrequentDevice,
      mostFrequentBrowser,
      mostFrequentContentType,
      mostFrequentPattern,
      mostUsedComponents,
      leastUsedComponents,
      interactionDistribution
    };
  }
  
  /**
   * Get the most frequent item from a Map of counts
   * @param {Map} countMap - Map of items to counts
   * @returns {Object} - Most frequent item and its count
   */
  function getMostFrequent(countMap) {
    let maxCount = 0;
    let maxItem = null;
    
    countMap.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        maxItem = item;
      }
    });
    
    return { item: maxItem, count: maxCount };
  }
  
  /**
   * Generate a report for a content-heavy scenario
   * @param {Object} scenario - Generated scenario
   * @returns {string} - HTML report
   */
  function generateScenarioReport(scenario) {
    // Calculate metrics
    const metrics = calculateScenarioMetrics(scenario);
    
    // Generate HTML report
    const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content-Heavy Application Scenario Report</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
      h1, h2, h3 { color: #2c3e50; }
      .container { max-width: 1200px; margin: 0 auto; }
      .metric-section { margin-bottom: 30px; background: #f9f9f9; padding: 20px; border-radius: 5px; }
      .metrics-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
      .metric-card { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
      .metric-title { font-weight: bold; margin-bottom: 5px; color: #2980b9; }
      .metric-value { font-size: 24px; font-weight: bold; }
      .metric-subtitle { color: #7f8c8d; font-size: 0.9em; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
      th { background-color: #2980b9; color: white; }
      tr:nth-child(even) { background-color: #f2f2f2; }
      .chart-container { height: 300px; margin-bottom: 20px; }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  </head>
  <body>
    <div class="container">
      <h1>Content-Heavy Application Scenario Report</h1>
      <p>Generated at: ${new Date().toLocaleString()}</p>
      
      <div class="metric-section">
        <h2>Overview</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-title">Sessions</div>
            <div class="metric-value">${metrics.sessionCount}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Total Components</div>
            <div class="metric-value">${metrics.totalComponents}</div>
            <div class="metric-subtitle">Avg ${metrics.avgComponentsPerSession.toFixed(1)} per session</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Loaded Components</div>
            <div class="metric-value">${metrics.totalLoadedComponents}</div>
            <div class="metric-subtitle">Avg ${metrics.avgLoadedComponentsPerSession.toFixed(1)} per session</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Total Interactions</div>
            <div class="metric-value">${metrics.totalInteractions}</div>
            <div class="metric-subtitle">Avg ${metrics.avgInteractionsPerSession.toFixed(1)} per session</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Avg Session Duration</div>
            <div class="metric-value">${formatDuration(metrics.avgSessionDuration)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Most Common Device</div>
            <div class="metric-value">${metrics.mostFrequentDevice.item || 'N/A'}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Most Common Browser</div>
            <div class="metric-value">${metrics.mostFrequentBrowser.item || 'N/A'}</div>
          </div>
          <div class="metric-card">
            <div class="metric-title">Most Common Content Type</div>
            <div class="metric-value">${metrics.mostFrequentContentType.item || 'N/A'}</div>
          </div>
        </div>
      </div>
      
      <div class="metric-section">
        <h2>Component Usage</h2>
        <div class="chart-container">
          <canvas id="componentUsageChart"></canvas>
        </div>
        
        <h3>Most Used Components</h3>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Count</th>
              <th>% of Sessions</th>
            </tr>
          </thead>
          <tbody>
            ${metrics.mostUsedComponents.map(comp => `
              <tr>
                <td>${comp.id}</td>
                <td>${comp.count}</td>
                <td>${comp.percentage.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <h3>Least Used Components</h3>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Count</th>
              <th>% of Sessions</th>
            </tr>
          </thead>
          <tbody>
            ${metrics.leastUsedComponents.map(comp => `
              <tr>
                <td>${comp.id}</td>
                <td>${comp.count}</td>
                <td>${comp.percentage.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="metric-section">
        <h2>Interaction Types</h2>
        <div class="chart-container">
          <canvas id="interactionChart"></canvas>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Interaction Type</th>
              <th>Count</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${metrics.interactionDistribution.map(interaction => `
              <tr>
                <td>${interaction.type}</td>
                <td>${interaction.count}</td>
                <td>${interaction.percentage.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="metric-section">
        <h2>Browsing Patterns</h2>
        <div class="chart-container">
          <canvas id="patternChart"></canvas>
        </div>
      </div>
    </div>
    
    <script>
      // Component usage chart
      const componentCtx = document.getElementById('componentUsageChart').getContext('2d');
      new Chart(componentCtx, {
        type: 'bar',
        data: {
          labels: ${JSON.stringify(metrics.mostUsedComponents.map(comp => comp.id))},
          datasets: [{
            label: 'Component Usage',
            data: ${JSON.stringify(metrics.mostUsedComponents.map(comp => comp.count))},
            backgroundColor: 'rgba(41, 128, 185, 0.7)',
            borderColor: 'rgba(41, 128, 185, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Number of Sessions'
              }
            }
          }
        }
      });
      
      // Interaction type chart
      const interactionCtx = document.getElementById('interactionChart').getContext('2d');
      new Chart(interactionCtx, {
        type: 'pie',
        data: {
          labels: ${JSON.stringify(metrics.interactionDistribution.map(int => int.type))},
          datasets: [{
            label: 'Interaction Types',
            data: ${JSON.stringify(metrics.interactionDistribution.map(int => int.count))},
            backgroundColor: [
              'rgba(41, 128, 185, 0.7)',
              'rgba(39, 174, 96, 0.7)',
              'rgba(243, 156, 18, 0.7)',
              'rgba(231, 76, 60, 0.7)',
              'rgba(142, 68, 173, 0.7)'
            ],
            borderColor: [
              'rgba(41, 128, 185, 1)',
              'rgba(39, 174, 96, 1)',
              'rgba(243, 156, 18, 1)',
              'rgba(231, 76, 60, 1)',
              'rgba(142, 68, 173, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
      
      // Pattern chart
      const patternCtx = document.getElementById('patternChart').getContext('2d');
      new Chart(patternCtx, {
        type: 'doughnut',
        data: {
          labels: ${JSON.stringify(Object.keys(metrics.patternDistribution || {}))},
          datasets: [{
            label: 'Browsing Patterns',
            data: ${JSON.stringify(Object.values(metrics.patternDistribution || {}))},
            backgroundColor: [
              'rgba(41, 128, 185, 0.7)',
              'rgba(39, 174, 96, 0.7)',
              'rgba(243, 156, 18, 0.7)',
              'rgba(231, 76, 60, 0.7)',
              'rgba(142, 68, 173, 0.7)'
            ],
            borderColor: [
              'rgba(41, 128, 185, 1)',
              'rgba(39, 174, 96, 1)',
              'rgba(243, 156, 18, 1)',
              'rgba(231, 76, 60, 1)',
              'rgba(142, 68, 173, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      });
    </script>
  </body>
  </html>`;
  
    return html;
  }
  
  /**
   * Format duration in milliseconds to human-readable format
   * @param {number} ms - Duration in milliseconds
   * @returns {string} - Formatted duration
   */
  function formatDuration(ms) {
    if (!ms || isNaN(ms)) return '0s';
    
    const seconds = Math.floor(ms / 1000);
    
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  }
  
  /**
   * Generate and save a scenario report
   * @param {Object} scenario - Generated scenario
   * @param {string} outputPath - Path to save the report
   */
  async function generateAndSaveReport(scenario, outputPath) {
    try {
      const report = generateScenarioReport(scenario);
      await writeFile(outputPath, report);
      console.log(`Report saved to ${outputPath}`);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  }
  
  /**
   * Run the content-heavy simulation
   * @param {Object} options - Simulation options
   */
  async function runContentHeavySimulation(options = {}) {
    const {
      outputDir = './output',
      sessionCount = 50,
      reportEnabled = true
    } = options;
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate scenario
    const scenario = await generateContentHeavyScenario({
      ...options,
      sessionCount,
      outputPath: path.join(outputDir, 'content-heavy-scenario.json')
    });
    
    // Generate report if enabled
    if (reportEnabled) {
      await generateAndSaveReport(
        scenario,
        path.join(outputDir, 'content-heavy-report.html')
      );
    }
    
    return scenario;
  }
  
  module.exports = {
    generateContentHeavyScenario,
    calculateScenarioMetrics,
    generateScenarioReport,
    generateAndSaveReport,
    runContentHeavySimulation
  };