/**
 * User Behavior Analysis Module
 * 
 * Tracks and analyzes user interactions to identify patterns and
 * predict future component requirements.
 */
class BehaviorAnalysis {
    /**
     * Create a new BehaviorAnalysis instance
     * @param {Object} options - Configuration options
     * @param {boolean} options.anonymizeData - Whether to anonymize interaction data
     * @param {string} options.privacyCompliance - Privacy compliance mode ('gdpr', 'ccpa', etc.)
     */
    constructor(options = {}) {
      this.options = {
        anonymizeData: true,
        privacyCompliance: 'gdpr',
        ...options
      };
      
      // Initialize data structures
      this.interactionHistory = [];
      this.componentGraph = new Map(); // Graph representing component relationships
      this.weightedEvents = new Map(); // Map of event types to weights
      this.sessionStart = Date.now();
      
      // Initialize event weights
      this.initializeEventWeights();
    }
    
    /**
     * Initialize weights for different event types
     * Higher weights indicate stronger predictive value
     */
    initializeEventWeights() {
      // Core navigation events have high weights
      this.weightedEvents.set('click', 0.9);
      this.weightedEvents.set('navigation', 0.95);
      this.weightedEvents.set('form-submit', 0.85);
      
      // Intent-signaling events have medium-high weights
      this.weightedEvents.set('hover', 0.7);
      this.weightedEvents.set('focus', 0.65);
      this.weightedEvents.set('scroll-end', 0.6);
      
      // Passive or incidental events have lower weights
      this.weightedEvents.set('mousemove', 0.2);
      this.weightedEvents.set('scroll', 0.4);
      this.weightedEvents.set('visibility', 0.5);
    }
    
    /**
     * Record a user interaction with a component
     * @param {string} componentId - ID of the component interacted with
     * @param {Object} data - Data about the interaction
     */
    recordInteraction(componentId, data) {
      const timestamp = Date.now();
      const eventType = data.type || 'unknown';
      const eventWeight = this.weightedEvents.get(eventType) || 0.3;
      
      // Calculate interaction metric using the weighted sum formula
      // InteractionMetric = ∑(w_i × EventWeight(e_i))
      const interactionMetric = this.calculateInteractionMetric(data, eventWeight);
      
      // Store the interaction
      const interaction = {
        componentId,
        timestamp,
        eventType,
        eventWeight,
        interactionMetric,
        sessionTime: timestamp - this.sessionStart,
        ...data
      };
      
      this.interactionHistory.push(interaction);
      
      // Update the component relationship graph
      this.updateComponentGraph(componentId, interaction);
      
      // Prune old data if necessary
      this.pruneOldData();
      
      return interaction;
    }
    
    /**
     * Calculate the interaction metric for an event
     * @param {Object} data - Interaction data
     * @param {number} baseWeight - Base weight for this event type
     * @returns {number} - Calculated interaction metric
     */
    calculateInteractionMetric(data, baseWeight) {
      let metric = baseWeight;
      
      // Adjust based on interaction duration if available
      if (data.duration) {
        // Normalize duration (longer interactions may indicate higher interest)
        const durationFactor = Math.min(data.duration / 1000, 10) / 10;
        metric *= (1 + durationFactor * 0.5);
      }
      
      // Adjust based on viewport coverage if available
      if (data.viewportCoverage) {
        // Higher coverage may indicate more significant content
        metric *= (1 + data.viewportCoverage * 0.3);
      }
      
      // Adjust based on recency (more recent interactions are more relevant)
      if (data.recency) {
        const recencyFactor = 1 - Math.min(data.recency / 60000, 5) / 5;
        metric *= recencyFactor;
      }
      
      return metric;
    }
    
    /**
     * Update the component relationship graph
     * @param {string} componentId - Current component ID
     * @param {Object} interaction - Interaction data
     */
    updateComponentGraph(componentId, interaction) {
      // Initialize this component in the graph if it doesn't exist
      if (!this.componentGraph.has(componentId)) {
        this.componentGraph.set(componentId, new Map());
      }
      
      // Find the previous interaction (if any) to establish relationship
      const recentInteractions = this.getRecentInteractions(5);
      
      if (recentInteractions.length > 1) {
        // Get the most recent different component interaction
        const previousInteractions = recentInteractions.filter(
          i => i.componentId !== componentId
        );
        
        if (previousInteractions.length > 0) {
          const previousInteraction = previousInteractions[0];
          const previousComponentId = previousInteraction.componentId;
          
          // Update edge weight between previous and current component
          const componentRelationships = this.componentGraph.get(previousComponentId) || new Map();
          const currentWeight = componentRelationships.get(componentId) || 0;
          
          // Weighted sum of previous weight and new interaction
          const newWeight = currentWeight * 0.7 + interaction.interactionMetric * 0.3;
          componentRelationships.set(componentId, newWeight);
          
          // Ensure the previous component exists in the graph
          if (!this.componentGraph.has(previousComponentId)) {
            this.componentGraph.set(previousComponentId, componentRelationships);
          } else {
            this.componentGraph.set(previousComponentId, componentRelationships);
          }
        }
      }
    }
    
    /**
     * Get the most recent interactions
     * @param {number} count - Number of interactions to return
     * @returns {Array} - Recent interactions
     */
    getRecentInteractions(count) {
      return this.interactionHistory
        .slice(-count)
        .sort((a, b) => b.timestamp - a.timestamp);
    }
    
    /**
     * Remove old interaction data to prevent memory growth
     */
    pruneOldData() {
      const now = Date.now();
      const maxAgeMs = 30 * 60 * 1000; // 30 minutes
      
      // Remove interactions older than maxAge
      this.interactionHistory = this.interactionHistory.filter(
        interaction => (now - interaction.timestamp) < maxAgeMs
      );
    }
    
    /**
     * Get current user behavior patterns
     * @returns {Object} - Current behavior patterns and component relationships
     */
    getCurrentPatterns() {
      return {
        recentInteractions: this.getRecentInteractions(10),
        componentRelationships: this.serializeComponentGraph(),
        interactionDensity: this.calculateInteractionDensity(),
        primaryComponents: this.identifyPrimaryComponents(5)
      };
    }
    
    /**
     * Convert the component graph to a serializable format
     * @returns {Array} - Serialized graph
     */
    serializeComponentGraph() {
      const serialized = [];
      
      // Convert the nested maps to an array of relationship objects
      this.componentGraph.forEach((relationships, sourceId) => {
        relationships.forEach((weight, targetId) => {
          serialized.push({
            source: sourceId,
            target: targetId,
            weight: weight
          });
        });
      });
      
      return serialized;
    }
    
    /**
     * Calculate interaction density (interactions per minute)
     * @returns {number} - Interaction density
     */
    calculateInteractionDensity() {
      const sessionDurationMinutes = (Date.now() - this.sessionStart) / 60000;
      return this.interactionHistory.length / Math.max(sessionDurationMinutes, 0.1);
    }
    
    /**
     * Identify the most important components based on interaction metrics
     * @param {number} count - Number of components to return
     * @returns {Array} - Primary components with their importance scores
     */
    identifyPrimaryComponents(count) {
      // Aggregate interaction metrics by component
      const componentMetrics = new Map();
      
      this.interactionHistory.forEach(interaction => {
        const currentMetric = componentMetrics.get(interaction.componentId) || 0;
        componentMetrics.set(
          interaction.componentId, 
          currentMetric + interaction.interactionMetric
        );
      });
      
      // Convert to array and sort by metric
      return Array.from(componentMetrics.entries())
        .map(([componentId, metric]) => ({ componentId, importance: metric }))
        .sort((a, b) => b.importance - a.importance)
        .slice(0, count);
    }
    
    /**
     * Calculate the user's interaction pattern complexity
     * Higher complexity may indicate more sophisticated user behavior
     * @returns {number} - Complexity score between 0 and 1
     */
    calculatePatternComplexity() {
      // Calculate based on variety of components and event types
      const uniqueComponents = new Set(
        this.interactionHistory.map(i => i.componentId)
      ).size;
      
      const uniqueEventTypes = new Set(
        this.interactionHistory.map(i => i.eventType)
      ).size;
      
      // Calculate graph density (ratio of actual to possible edges)
      const componentCount = this.componentGraph.size;
      let edgeCount = 0;
      
      this.componentGraph.forEach(relationships => {
        edgeCount += relationships.size;
      });
      
      const maxPossibleEdges = componentCount * (componentCount - 1);
      const graphDensity = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;
      
      // Combine factors into a single complexity score
      const componentVariety = Math.min(uniqueComponents / 10, 1);
      const eventVariety = Math.min(uniqueEventTypes / this.weightedEvents.size, 1);
      
      return (componentVariety * 0.4 + eventVariety * 0.3 + graphDensity * 0.3);
    }
    
    /**
     * Detect user navigation patterns
     * @returns {Object} - Detected patterns
     */
    detectNavigationPatterns() {
      const patterns = {
        linear: 0,
        branching: 0,
        cyclic: 0,
        dominant: 'unknown'
      };
      
      // Analyze component graph to detect patterns
      if (this.componentGraph.size > 3) {
        // Calculate outdegree distribution for linearity assessment
        const outDegrees = [];
        this.componentGraph.forEach(relationships => {
          outDegrees.push(relationships.size);
        });
        
        // Calculate average outdegree
        const avgOutDegree = outDegrees.reduce((sum, deg) => sum + deg, 0) / outDegrees.length;
        
        // Linear patterns have low average outdegree
        if (avgOutDegree < 1.5) {
          patterns.linear = 0.7;
        }
        
        // Branching patterns have high variance in outdegree
        const variance = outDegrees.reduce((sum, deg) => sum + Math.pow(deg - avgOutDegree, 2), 0) / outDegrees.length;
        if (variance > 1) {
          patterns.branching = 0.6 + Math.min(variance / 10, 0.3);
        }
        
        // Detect cyclic patterns using simple cycle detection
        const cycles = this.detectCycles();
        if (cycles > 0) {
          patterns.cyclic = Math.min(cycles / 5, 0.9);
        }
        
        // Determine dominant pattern
        const patternScores = [
          { type: 'linear', score: patterns.linear },
          { type: 'branching', score: patterns.branching },
          { type: 'cyclic', score: patterns.cyclic }
        ];
        
        const dominantPattern = patternScores.sort((a, b) => b.score - a.score)[0];
        patterns.dominant = dominantPattern.score > 0.3 ? dominantPattern.type : 'mixed';
      }
      
      return patterns;
    }
    
    /**
     * Detect cycles in the component graph
     * @returns {number} - Number of cycles detected
     */
    detectCycles() {
      let cycleCount = 0;
      const visited = new Set();
      const recursionStack = new Set();
      
      // Simple DFS-based cycle detection
      const detectCyclesFromNode = (nodeId, path = []) => {
        visited.add(nodeId);
        recursionStack.add(nodeId);
        path.push(nodeId);
        
        const neighbors = this.componentGraph.get(nodeId) || new Map();
        
        neighbors.forEach((weight, neighborId) => {
          if (!visited.has(neighborId)) {
            if (detectCyclesFromNode(neighborId, [...path])) {
              cycleCount++;
            }
          } else if (recursionStack.has(neighborId)) {
            // Found a cycle
            const cycleStart = path.indexOf(neighborId);
            if (cycleStart >= 0 && path.length - cycleStart >= 3) {
              cycleCount++;
            }
          }
        });
        
        recursionStack.delete(nodeId);
        return false;
      };
      
      // Check from each node
      this.componentGraph.forEach((_, nodeId) => {
        if (!visited.has(nodeId)) {
          detectCyclesFromNode(nodeId);
        }
      });
      
      return cycleCount;
    }
    
    /**
     * Generate a feature vector for machine learning models
     * @returns {Array} - Feature vector representing current user behavior
     */
    generateFeatureVector() {
      const features = [];
      
      // Add interaction density
      features.push(this.calculateInteractionDensity());
      
      // Add pattern complexity
      features.push(this.calculatePatternComplexity());
      
      // Add recency-weighted component usage
      const recentInteractions = this.getRecentInteractions(5);
      const recentComponentIds = recentInteractions.map(i => i.componentId);
      
      // Create a fixed-size feature vector for recent components
      // (using one-hot encoding for a predefined set of components)
      // This would typically be customized based on the application
      
      // Add navigation pattern features
      const patterns = this.detectNavigationPatterns();
      features.push(patterns.linear);
      features.push(patterns.branching);
      features.push(patterns.cyclic);
      
      return features;
    }
    
    /**
     * Reset the analysis data
     */
    reset() {
      this.interactionHistory = [];
      this.componentGraph = new Map();
      this.sessionStart = Date.now();
    }
    
    /**
     * Export analysis data in a standardized format
     * @returns {Object} - Exportable analysis data
     */
    exportAnalysisData() {
      return {
        sessionId: this.sessionStart.toString(),
        sessionDuration: (Date.now() - this.sessionStart) / 1000,
        interactionCount: this.interactionHistory.length,
        interactionDensity: this.calculateInteractionDensity(),
        patternComplexity: this.calculatePatternComplexity(),
        navigationPatterns: this.detectNavigationPatterns(),
        componentGraph: this.serializeComponentGraph(),
        primaryComponents: this.identifyPrimaryComponents(10)
      };
    }
  }
  
  export default BehaviorAnalysis;