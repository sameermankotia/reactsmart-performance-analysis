/**
 * Markov Chain Model for component usage prediction
 * 
 * Implements a higher-order Markov Chain model to predict component usage
 * based on sequences of previous component interactions.
 */

/**
 * MarkovChain class for component usage prediction
 */
class MarkovChain {
    /**
     * Create a new MarkovChain instance
     * @param {Object} options - Configuration options
     * @param {number} options.order - Order of the Markov Chain (default: 2)
     * @param {number} options.learningRate - Learning rate for model updates (default: 0.05)
     * @param {boolean} options.useBackoff - Whether to use backoff to lower-order models (default: true)
     */
    constructor(options = {}) {
      this.options = {
        order: 2,
        learningRate: 0.05,
        useBackoff: true,
        ...options
      };
      
      // Initialize data structures
      this.transitionMatrices = new Map();
      
      // Initialize matrices for each order
      for (let i = 1; i <= this.options.order; i++) {
        this.transitionMatrices.set(i, new Map());
      }
      
      // Metrics for performance tracking
      this.metrics = {
        sequencesObserved: 0,
        predictions: 0,
        correctPredictions: 0
      };
    }
    
    /**
     * Process a new sequence of component usage
     * @param {Array} sequence - Sequence of component IDs
     */
    observeSequence(sequence) {
      if (!sequence || sequence.length < 2) return;
      
      this.metrics.sequencesObserved++;
      
      // Process each subsequence up to the specified order
      for (let order = 1; order <= this.options.order; order++) {
        if (sequence.length <= order) continue;
        
        // Process each subsequence of the current order
        for (let i = 0; i <= sequence.length - order - 1; i++) {
          const context = sequence.slice(i, i + order);
          const nextComponent = sequence[i + order];
          
          this.updateTransition(order, context, nextComponent);
        }
      }
    }
    
    /**
     * Update transition probabilities for a specific context and next component
     * @param {number} order - Order of the context
     * @param {Array} context - Context sequence
     * @param {string} nextComponent - Next component ID
     */
    updateTransition(order, context, nextComponent) {
      const contextKey = this.getContextKey(context);
      const matrix = this.transitionMatrices.get(order);
      
      // Initialize context map if not exists
      if (!matrix.has(contextKey)) {
        matrix.set(contextKey, new Map());
      }
      
      const transitions = matrix.get(contextKey);
      const currentCount = transitions.get(nextComponent) || 0;
      
      // Update count with learning rate
      const newCount = currentCount * (1 - this.options.learningRate) + this.options.learningRate;
      transitions.set(nextComponent, newCount);
      
      // Normalize the transition probabilities
      this.normalizeTransitions(order, contextKey);
    }
    
    /**
     * Normalize transition probabilities for a specific context
     * @param {number} order - Order of the context
     * @param {string} contextKey - Context key
     */
    normalizeTransitions(order, contextKey) {
      const matrix = this.transitionMatrices.get(order);
      const transitions = matrix.get(contextKey);
      
      if (!transitions) return;
      
      // Calculate sum of all counts
      const total = Array.from(transitions.values()).reduce((sum, count) => sum + count, 0);
      
      if (total > 0) {
        // Normalize each count to a probability
        transitions.forEach((count, component) => {
          transitions.set(component, count / total);
        });
      }
    }
    
    /**
     * Generate a key from a context sequence
     * @param {Array} context - Context sequence
     * @returns {string} Context key
     */
    getContextKey(context) {
      return context.join('|');
    }
    
    /**
     * Parse a context key back into an array
     * @param {string} key - Context key
     * @returns {Array} Context sequence
     */
    parseContextKey(key) {
      return key.split('|');
    }
    
    /**
     * Predict the next component based on a context sequence
     * @param {Array} context - Context sequence
     * @param {Array} availableComponents - Available components to choose from
     * @returns {Array} Predictions with probabilities
     */
    predict(context, availableComponents) {
      if (!context || context.length === 0 || !availableComponents || availableComponents.length === 0) {
        return [];
      }
      
      // Use the longest possible subsequence up to the model's order
      const effectiveContext = context.slice(-this.options.order);
      const predictions = new Map();
      
      // Try to predict using the highest order first, then back off if needed
      let usedOrder = 0;
      for (let order = Math.min(this.options.order, effectiveContext.length); order >= 1; order--) {
        const subContext = effectiveContext.slice(-order);
        const contextKey = this.getContextKey(subContext);
        const matrix = this.transitionMatrices.get(order);
        
        if (matrix.has(contextKey)) {
          const transitions = matrix.get(contextKey);
          
          // Add predictions from this order
          transitions.forEach((probability, componentId) => {
            if (!predictions.has(componentId)) {
              predictions.set(componentId, {
                componentId,
                probability: probability,
                confidence: order / this.options.order, // Higher order = higher confidence
                order
              });
            }
          });
          
          // If we got predictions and don't want to use backoff, stop here
          if (predictions.size > 0 && !this.options.useBackoff) {
            usedOrder = order;
            break;
          }
        }
      }
      
      // If no predictions were found, use a uniform distribution over available components
      if (predictions.size === 0) {
        const uniformProbability = 1 / availableComponents.length;
        availableComponents.forEach(component => {
          predictions.set(component.id, {
            componentId: component.id,
            probability: uniformProbability,
            confidence: 0.1, // Low confidence for uniform prediction
            order: 0
          });
        });
        usedOrder = 0;
      }
      
      // Convert predictions to array and sort by probability
      let result = Array.from(predictions.values());
      
      // Filter to only include available components
      const availableIds = new Set(availableComponents.map(c => c.id));
      result = result.filter(prediction => availableIds.has(prediction.componentId));
      
      // Sort by probability (highest first)
      result.sort((a, b) => b.probability - a.probability);
      
      // Add priority based on probability
      result = result.map(prediction => ({
        ...prediction,
        priority: this.getPriorityFromProbability(prediction.probability)
      }));
      
      return result;
    }
    
    /**
     * Get priority level based on probability
     * @param {number} probability - Probability value
     * @returns {string} Priority level ('high', 'medium', 'low')
     */
    getPriorityFromProbability(probability) {
      if (probability >= 0.7) {
        return 'high';
      } else if (probability >= 0.4) {
        return 'medium';
      } else {
        return 'low';
      }
    }
    
    /**
     * Update metrics based on prediction accuracy
     * @param {string} actualComponent - Component that was actually used
     * @param {Array} predictions - Predictions that were made
     */
    updateMetrics(actualComponent, predictions) {
      this.metrics.predictions++;
      
      // Check if the actual component was in the top predictions
      const topPredictions = predictions.slice(0, 3).map(p => p.componentId);
      if (topPredictions.includes(actualComponent)) {
        this.metrics.correctPredictions++;
      }
    }
    
    /**
     * Get current prediction accuracy
     * @returns {number} Prediction accuracy (0-1)
     */
    getAccuracy() {
      if (this.metrics.predictions === 0) return 0;
      return this.metrics.correctPredictions / this.metrics.predictions;
    }
    
    /**
     * Get model metrics
     * @returns {Object} Model metrics
     */
    getMetrics() {
      return {
        ...this.metrics,
        accuracy: this.getAccuracy(),
        order: this.options.order,
        matricesSizes: Array.from(this.transitionMatrices.entries()).map(([order, matrix]) => ({
          order,
          contexts: matrix.size,
          totalTransitions: Array.from(matrix.values()).reduce((sum, transitions) => sum + transitions.size, 0)
        }))
      };
    }
    
    /**
     * Serialize the model for storage
     * @returns {Object} Serialized model
     */
    serialize() {
      const serialized = {
        options: { ...this.options },
        metrics: { ...this.metrics },
        matrices: []
      };
      
      // Serialize transition matrices
      this.transitionMatrices.forEach((matrix, order) => {
        const serializedMatrix = [];
        
        matrix.forEach((transitions, contextKey) => {
          transitions.forEach((probability, componentId) => {
            serializedMatrix.push({
              context: contextKey,
              component: componentId,
              probability
            });
          });
        });
        
        serialized.matrices.push({
          order,
          transitions: serializedMatrix
        });
      });
      
      return serialized;
    }
    
    /**
     * Deserialize a model from storage
     * @param {Object} serialized - Serialized model
     * @returns {MarkovChain} Deserialized model
     */
    static deserialize(serialized) {
      if (!serialized || !serialized.options || !serialized.matrices) {
        throw new Error('Invalid serialized Markov Chain model');
      }
      
      const model = new MarkovChain(serialized.options);
      
      // Restore metrics
      if (serialized.metrics) {
        model.metrics = { ...serialized.metrics };
      }
      
      // Restore transition matrices
      serialized.matrices.forEach(matrixData => {
        const { order, transitions } = matrixData;
        const matrix = new Map();
        
        transitions.forEach(transitionData => {
          const { context, component, probability } = transitionData;
          
          if (!matrix.has(context)) {
            matrix.set(context, new Map());
          }
          
          matrix.get(context).set(component, probability);
        });
        
        model.transitionMatrices.set(order, matrix);
      });
      
      return model;
    }
    
    /**
     * Reset the model
     */
    reset() {
      // Clear all transition matrices
      this.transitionMatrices.forEach(matrix => matrix.clear());
      
      // Reset metrics
      this.metrics = {
        sequencesObserved: 0,
        predictions: 0,
        correctPredictions: 0
      };
    }
  }
  
  export default MarkovChain;