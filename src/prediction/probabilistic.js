/**
 * Probabilistic Prediction Model
 * 
 * Implements a conditional probability based model for component usage prediction,
 * using the formula: P(c_i|c_j) = N(c_i,c_j) / ∑_k N(c_k,c_j)
 */

/**
 * ProbabilisticModel for component usage prediction based on conditional probabilities
 */
class ProbabilisticModel {
    /**
     * Create a new ProbabilisticModel instance
     * @param {Object} options - Configuration options
     * @param {number} options.learningRate - Learning rate for model updates (default: 0.03)
     * @param {number} options.decayFactor - Decay factor for older transitions (default: 0.95)
     * @param {number} options.highPriorityThreshold - Threshold for high priority (default: 0.75)
     * @param {number} options.mediumPriorityThreshold - Threshold for medium priority (default: 0.4)
     */
    constructor(options = {}) {
      this.options = {
        learningRate: 0.03,
        decayFactor: 0.95,
        highPriorityThreshold: 0.75,
        mediumPriorityThreshold: 0.4,
        ...options
      };
      
      // Initialize data structures
      this.transitionMatrix = new Map(); // Stores P(c_i|c_j)
      this.componentFrequency = new Map(); // Stores component usage frequency
      this.cooccurrenceMatrix = new Map(); // Stores N(c_i,c_j)
      
      // Metrics for performance tracking
      this.metrics = {
        totalPredictions: 0,
        correctPredictions: 0,
        lastUpdateTime: Date.now()
      };
    }
    
    /**
     * Process a transition between components
     * @param {string} sourceComponent - Source component ID
     * @param {string} targetComponent - Target component ID
     * @param {number} weight - Weight of the transition (default: 1)
     */
    observeTransition(sourceComponent, targetComponent, weight = 1) {
      if (!sourceComponent || !targetComponent) return;
      
      // Update component frequency
      this.componentFrequency.set(
        sourceComponent, 
        (this.componentFrequency.get(sourceComponent) || 0) + weight
      );
      this.componentFrequency.set(
        targetComponent, 
        (this.componentFrequency.get(targetComponent) || 0) + weight
      );
      
      // Update co-occurrence matrix
      if (!this.cooccurrenceMatrix.has(sourceComponent)) {
        this.cooccurrenceMatrix.set(sourceComponent, new Map());
      }
      
      const sourceMap = this.cooccurrenceMatrix.get(sourceComponent);
      const currentCount = sourceMap.get(targetComponent) || 0;
      
      // Apply learning rate to update
      const newCount = currentCount * (1 - this.options.learningRate) + 
                      weight * this.options.learningRate;
      
      sourceMap.set(targetComponent, newCount);
      
      // Update transition matrix
      this.updateTransitionProbabilities(sourceComponent);
    }
    
    /**
     * Process a sequence of component transitions
     * @param {Array} sequence - Sequence of component IDs
     */
    observeSequence(sequence) {
      if (!sequence || sequence.length < 2) return;
      
      // Process each pair of adjacent components in the sequence
      for (let i = 0; i < sequence.length - 1; i++) {
        this.observeTransition(sequence[i], sequence[i + 1]);
      }
    }
    
    /**
     * Update transition probabilities for a specific source component
     * @param {string} sourceComponent - Source component ID
     */
    updateTransitionProbabilities(sourceComponent) {
      if (!this.cooccurrenceMatrix.has(sourceComponent)) return;
      
      const sourceMap = this.cooccurrenceMatrix.get(sourceComponent);
      const total = Array.from(sourceMap.values()).reduce((sum, count) => sum + count, 0);
      
      // Skip if no transitions have been observed
      if (total === 0) return;
      
      // Ensure transition matrix has an entry for this component
      if (!this.transitionMatrix.has(sourceComponent)) {
        this.transitionMatrix.set(sourceComponent, new Map());
      }
      
      const transitionMap = this.transitionMatrix.get(sourceComponent);
      
      // Update transition probabilities
      sourceMap.forEach((count, targetComponent) => {
        // P(c_i|c_j) = N(c_i,c_j) / ∑_k N(c_k,c_j)
        transitionMap.set(targetComponent, count / total);
      });
    }
    
    /**
     * Get the transition probability between two components
     * @param {string} sourceComponent - Source component ID
     * @param {string} targetComponent - Target component ID
     * @returns {number} - Transition probability P(target|source)
     */
    getTransitionProbability(sourceComponent, targetComponent) {
      const transitionMap = this.transitionMatrix.get(sourceComponent);
      
      if (!transitionMap) return 0;
      
      return transitionMap.get(targetComponent) || 0;
    }
    
    /**
     * Predict next components based on current components
     * @param {Array} currentComponents - Currently active component IDs
     * @param {Array} availableComponents - Available components to predict from
     * @returns {Array} - Predictions with probabilities
     */
    predict(currentComponents, availableComponents) {
      if (!currentComponents || !availableComponents || 
          currentComponents.length === 0 || availableComponents.length === 0) {
        return [];
      }
      
      const predictions = new Map();
      
      // For each current component, get transition probabilities to other components
      currentComponents.forEach(currentId => {
        const transitionMap = this.transitionMatrix.get(currentId);
        
        if (!transitionMap) return;
        
        // For each available component, calculate probability
        availableComponents.forEach(component => {
          const componentId = component.id;
          
          // Skip if the component is already in the current set
          if (currentComponents.includes(componentId)) return;
          
          // Get transition probability
          const probability = transitionMap.get(componentId) || 0;
          
          // If we already have a prediction for this component, take the maximum
          if (predictions.has(componentId)) {
            const currentPrediction = predictions.get(componentId);
            if (probability > currentPrediction.probability) {
              currentPrediction.probability = probability;
              currentPrediction.sourceComponent = currentId;
            }
          } else {
            predictions.set(componentId, {
              componentId,
              probability,
              sourceComponent: currentId,
              confidence: probability > 0 ? 0.7 : 0.3
            });
          }
        });
      });
      
      // Convert to array and sort by probability
      const result = Array.from(predictions.values());
      
      // Add priority based on thresholds
      result.forEach(prediction => {
        prediction.priority = this.getPriorityFromProbability(prediction.probability);
      });
      
      // Sort by probability (highest first)
      result.sort((a, b) => b.probability - a.probability);
      
      return result;
    }
    
    /**
     * Get priority level based on probability
     * @param {number} probability - Prediction probability
     * @returns {string} - Priority level ('high', 'medium', 'low')
     */
    getPriorityFromProbability(probability) {
      if (probability >= this.options.highPriorityThreshold) {
        return 'high';
      } else if (probability >= this.options.mediumPriorityThreshold) {
        return 'medium';
      } else {
        return 'low';
      }
    }
    
    /**
     * Apply time decay to all transition counts
     * This gradually reduces the influence of old transitions
     */
    applyTimeDecay() {
      const now = Date.now();
      const timeSinceLastUpdate = (now - this.metrics.lastUpdateTime) / 1000; // in seconds
      
      // Skip if not enough time has passed
      if (timeSinceLastUpdate < 60) return; // Only decay after at least a minute
      
      // Calculate decay factor based on time passed
      const decayFactor = Math.pow(this.options.decayFactor, timeSinceLastUpdate / 3600); // Hourly base
      
      // Apply decay to co-occurrence matrix
      this.cooccurrenceMatrix.forEach((sourceMap, sourceId) => {
        sourceMap.forEach((count, targetId) => {
          sourceMap.set(targetId, count * decayFactor);
        });
        
        // Update transition probabilities after decay
        this.updateTransitionProbabilities(sourceId);
      });
      
      // Update last update time
      this.metrics.lastUpdateTime = now;
    }
    
    /**
     * Update metrics based on prediction accuracy
     * @param {string} actualComponent - Component that was actually used
     * @param {Array} predictions - Predictions that were made
     */
    updateMetrics(actualComponent, predictions) {
      this.metrics.totalPredictions++;
      
      // Check if the actual component was among the top predictions
      const predictedComponents = predictions.slice(0, 3).map(p => p.componentId);
      
      if (predictedComponents.includes(actualComponent)) {
        this.metrics.correctPredictions++;
      }
    }
    
    /**
     * Get current prediction accuracy
     * @returns {number} - Accuracy as a value between 0 and 1
     */
    getAccuracy() {
      if (this.metrics.totalPredictions === 0) return 0;
      
      return this.metrics.correctPredictions / this.metrics.totalPredictions;
    }
    
    /**
     * Get metrics about the model's performance
     * @returns {Object} - Model metrics
     */
    getMetrics() {
      return {
        accuracy: this.getAccuracy(),
        totalPredictions: this.metrics.totalPredictions,
        correctPredictions: this.metrics.correctPredictions,
        componentCount: this.componentFrequency.size,
        transitionCount: Array.from(this.cooccurrenceMatrix.values())
          .reduce((sum, map) => sum + map.size, 0),
        mostFrequentComponents: this.getMostFrequentComponents(5)
      };
    }
    
    /**
     * Get the most frequently used components
     * @param {number} count - Number of components to return
     * @returns {Array} - Most frequent components with their frequencies
     */
    getMostFrequentComponents(count = 5) {
      return Array.from(this.componentFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([componentId, frequency]) => ({ componentId, frequency }));
    }
    
    /**
     * Serialize the model for storage
     * @returns {Object} - Serialized model
     */
    serialize() {
      return {
        options: { ...this.options },
        metrics: { ...this.metrics },
        componentFrequency: Array.from(this.componentFrequency.entries()).map(([id, freq]) => ({
          id, frequency: freq
        })),
        cooccurrenceMatrix: Array.from(this.cooccurrenceMatrix.entries()).map(([sourceId, targetMap]) => ({
          sourceId,
          targets: Array.from(targetMap.entries()).map(([targetId, count]) => ({
            targetId, count
          }))
        }))
      };
    }
    
    /**
     * Deserialize a model from storage
     * @param {Object} serialized - Serialized model data
     * @returns {ProbabilisticModel} - Deserialized model
     */
    static deserialize(serialized) {
      if (!serialized) throw new Error('Invalid serialized model data');
      
      const model = new ProbabilisticModel(serialized.options || {});
      
      // Restore metrics
      if (serialized.metrics) {
        model.metrics = { ...serialized.metrics };
      }
      
      // Restore component frequency
      if (serialized.componentFrequency) {
        serialized.componentFrequency.forEach(({ id, frequency }) => {
          model.componentFrequency.set(id, frequency);
        });
      }
      
      // Restore co-occurrence matrix
      if (serialized.cooccurrenceMatrix) {
        serialized.cooccurrenceMatrix.forEach(({ sourceId, targets }) => {
          const targetMap = new Map();
          targets.forEach(({ targetId, count }) => {
            targetMap.set(targetId, count);
          });
          model.cooccurrenceMatrix.set(sourceId, targetMap);
          
          // Update transition probabilities
          model.updateTransitionProbabilities(sourceId);
        });
      }
      
      return model;
    }
    
    /**
     * Reset the model
     */
    reset() {
      this.transitionMatrix.clear();
      this.componentFrequency.clear();
      this.cooccurrenceMatrix.clear();
      
      this.metrics = {
        totalPredictions: 0,
        correctPredictions: 0,
        lastUpdateTime: Date.now()
      };
    }
    
    /**
     * Find the most likely path between components
     * @param {string} startComponent - Starting component ID
     * @param {string} endComponent - Ending component ID
     * @param {number} maxLength - Maximum path length to consider
     * @returns {Array} - Most likely path between the components
     */
    findMostLikelyPath(startComponent, endComponent, maxLength = 5) {
      if (!startComponent || !endComponent) return [];
      if (startComponent === endComponent) return [startComponent];
      
      // Simple breadth-first search to find paths
      const queue = [[startComponent]];
      const visited = new Set([startComponent]);
      const paths = [];
      
      while (queue.length > 0 && paths.length < 3) {
        const path = queue.shift();
        const lastComponent = path[path.length - 1];
        
        // If we reached the maximum path length, skip
        if (path.length > maxLength) continue;
        
        // Get transitions from the last component
        const transitions = this.transitionMatrix.get(lastComponent);
        if (!transitions) continue;
        
        // Check each possible next component
        transitions.forEach((probability, nextComponent) => {
          // Skip if probability is too low
          if (probability < 0.1) return;
          
          // Skip if already visited (to avoid cycles)
          if (visited.has(nextComponent)) return;
          
          // Create a new path with this component
          const newPath = [...path, nextComponent];
          
          // If we reached the end component, add to paths
          if (nextComponent === endComponent) {
            paths.push({
              path: newPath,
              probability: this.calculatePathProbability(newPath)
            });
          } else {
            // Otherwise, add to queue for further exploration
            queue.push(newPath);
            visited.add(nextComponent);
          }
        });
      }
      
      // Sort paths by probability
      paths.sort((a, b) => b.probability - a.probability);
      
      // Return the most likely path, or empty if none found
      return paths.length > 0 ? paths[0].path : [];
    }
    
    /**
     * Calculate the probability of a path
     * @param {Array} path - Sequence of component IDs
     * @returns {number} - Path probability
     */
    calculatePathProbability(path) {
      if (!path || path.length < 2) return 0;
      
      let probability = 1;
      
      // Multiply probabilities of each transition in the path
      for (let i = 0; i < path.length - 1; i++) {
        const transitionProb = this.getTransitionProbability(path[i], path[i + 1]);
        probability *= transitionProb;
      }
      
      return probability;
    }
    
    /**
     * Identify clusters of components that are frequently used together
     * @param {number} minClusterSize - Minimum size of clusters to identify
     * @param {number} probabilityThreshold - Minimum transition probability to consider
     * @returns {Array} - Clusters of related components
     */
    identifyComponentClusters(minClusterSize = 3, probabilityThreshold = 0.3) {
      // Build an adjacency list of components with strong relationships
      const adjacencyList = new Map();
      
      this.transitionMatrix.forEach((transitions, sourceId) => {
        adjacencyList.set(sourceId, []);
        
        transitions.forEach((probability, targetId) => {
          if (probability >= probabilityThreshold) {
            adjacencyList.get(sourceId).push(targetId);
          }
        });
      });
      
      // Perform simple clustering (a basic form of community detection)
      const componentIds = Array.from(this.componentFrequency.keys());
      const visited = new Set();
      const clusters = [];
      
      componentIds.forEach(componentId => {
        if (visited.has(componentId)) return;
        
        // Start a new cluster
        const cluster = [];
        const queue = [componentId];
        
        while (queue.length > 0) {
          const current = queue.shift();
          
          if (visited.has(current)) continue;
          visited.add(current);
          cluster.push(current);
          
          // Add neighbors to the queue
          const neighbors = adjacencyList.get(current) || [];
          neighbors.forEach(neighbor => {
            if (!visited.has(neighbor)) {
              queue.push(neighbor);
            }
          });
        }
        
        // Only add clusters that meet the minimum size
        if (cluster.length >= minClusterSize) {
          clusters.push(cluster);
        }
      });
      
      return clusters;
    }
  }
  
  export default ProbabilisticModel;