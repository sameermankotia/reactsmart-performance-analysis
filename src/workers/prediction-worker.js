/**
 * Prediction Worker
 * 
 * Web Worker that runs the prediction algorithm in a separate thread
 * to avoid blocking the main thread with CPU-intensive calculations.
 */

// Store persistent model data
let transitionMatrix = new Map();
const confidenceThresholds = {
  high: 0.75,
  medium: 0.40,
  low: 0.20
};
let learningRate = 0.03;
let modelType = 'probabilistic';

// Performance metrics
const metrics = {
  correctPredictions: 0,
  totalPredictions: 0,
  lastAccuracy: 0
};

/**
 * Handle messages from main thread
 */
self.onmessage = function(e) {
  const { userPatterns, components, action, options } = e.data;
  
  // Process different action types
  switch (action) {
    case 'configure':
      // Update configuration
      if (options) {
        if (options.learningRate) {
          learningRate = options.learningRate;
        }
        if (options.confidenceThresholds) {
          Object.assign(confidenceThresholds, options.confidenceThresholds);
        }
        if (options.modelType) {
          modelType = options.modelType;
        }
      }
      self.postMessage({ type: 'configurationUpdated' });
      break;
      
    case 'reset':
      // Reset model state
      transitionMatrix = new Map();
      metrics.correctPredictions = 0;
      metrics.totalPredictions = 0;
      metrics.lastAccuracy = 0;
      self.postMessage({ type: 'modelReset' });
      break;
      
    case 'predict':
    default:
      // Default action is prediction
      if (userPatterns && components) {
        // Compute predictions
        const predictions = predictComponentUsage(userPatterns, components);
        
        // Send predictions back to main thread
        self.postMessage({ 
          type: 'predictions',
          predictions 
        });
      } else {
        self.postMessage({ 
          type: 'error', 
          error: 'Missing required data for prediction' 
        });
      }
      break;
      
    case 'updateMetrics':
      // Update metrics with actual component usage
      if (e.data.componentId && e.data.predictions) {
        updateMetrics(e.data.componentId, e.data.predictions);
        self.postMessage({
          type: 'metricsUpdated',
          metrics: {
            correctPredictions: metrics.correctPredictions,
            totalPredictions: metrics.totalPredictions,
            lastAccuracy: metrics.lastAccuracy
          }
        });
      }
      break;
      
    case 'getMetrics':
      // Return current metrics
      self.postMessage({
        type: 'metrics',
        metrics: {
          correctPredictions: metrics.correctPredictions,
          totalPredictions: metrics.totalPredictions,
          lastAccuracy: metrics.lastAccuracy
        }
      });
      break;
      
    case 'getModelState':
      // Return serialized model state
      self.postMessage({
        type: 'modelState',
        modelState: getSerializableModelState()
      });
      break;
      
    case 'loadModelState':
      // Load model state from serialized data
      if (e.data.modelState) {
        loadModelState(e.data.modelState);
        self.postMessage({ type: 'modelLoaded' });
      } else {
        self.postMessage({ 
          type: 'error', 
          error: 'Invalid model state data' 
        });
      }
      break;
  }
};

/**
 * Predict which components will be needed based on user behavior
 * @param {Object} userPatterns - Current user behavior patterns
 * @param {Array} registeredComponents - List of registered components
 * @returns {Array} - Component predictions with probabilities
 */
function predictComponentUsage(userPatterns, registeredComponents) {
  const { recentInteractions, componentRelationships, primaryComponents, interactionDensity } = userPatterns;
  
  // Update transition matrix with new relationship data
  updateTransitionMatrix(componentRelationships);
  
  // Select the appropriate prediction model
  switch (modelType) {
    case 'markovChain':
      return predictUsingMarkovChain(recentInteractions, primaryComponents, registeredComponents);
    case 'transformer':
      return predictUsingTransformer(recentInteractions, primaryComponents, registeredComponents, interactionDensity);
    case 'probabilistic':
    default:
      return predictUsingProbabilistic(recentInteractions, primaryComponents, registeredComponents);
  }
}

/**
 * Predict component usage using probabilistic model
 * This is the default prediction model that uses simple conditional probabilities
 * 
 * @param {Array} recentInteractions - Recent user interactions
 * @param {Array} primaryComponents - Primary components based on usage
 * @param {Array} registeredComponents - All registered components
 * @returns {Array} - Predictions with probabilities
 */
function predictUsingProbabilistic(recentInteractions, primaryComponents, registeredComponents) {
  const predictions = [];
  
  // Use recent interactions to identify current context
  const currentComponents = new Set(
    recentInteractions
      .slice(0, 3)
      .map(interaction => interaction.componentId)
  );
  
  // Generate predictions for each registered component
  registeredComponents.forEach(component => {
    const componentId = component.id;
    
    // Skip components already in current context
    if (currentComponents.has(componentId)) {
      return;
    }
    
    let probability = 0;
    let confidence = 0;
    
    // Calculate probability based on component relationships
    currentComponents.forEach(currentId => {
      // Get transition probability using the conditional probability formula
      const transitionProb = getTransitionProbability(currentId, componentId);
      
      // Weighted sum of probabilities from different current components
      probability += transitionProb * 0.7;
      
      // Increase confidence if we have seen this transition before
      if (transitionProb > 0) {
        confidence += 0.3;
      }
    });
    
    // Incorporate primary component data
    const isPrimaryComponent = primaryComponents.some(
      pc => pc.componentId === componentId
    );
    
    if (isPrimaryComponent) {
      const primaryData = primaryComponents.find(
        pc => pc.componentId === componentId
      );
      
      // Normalize importance score to [0, 0.3] range
      const normalizedImportance = Math.min(primaryData.importance / 10, 0.3);
      
      // Boost probability based on component importance
      probability += normalizedImportance;
      confidence += 0.2;
    }
    
    // Ensure probability is in [0, 1] range
    probability = Math.max(0, Math.min(probability, 1));
    
    // Add prediction if probability exceeds low threshold
    if (probability > confidenceThresholds.low) {
      predictions.push({
        componentId,
        probability,
        confidence,
        priority: getPriorityFromProbability(probability),
        model: 'probabilistic'
      });
    }
  });
  
  // Sort by probability (highest first)
  return predictions.sort((a, b) => b.probability - a.probability);
}

/**
 * Predict component usage using Markov Chain model
 * This model considers sequences of component usage rather than
 * just pairwise relationships
 * 
 * @param {Array} recentInteractions - Recent user interactions
 * @param {Array} primaryComponents - Primary components based on usage
 * @param {Array} registeredComponents - All registered components
 * @returns {Array} - Predictions with probabilities
 */
function predictUsingMarkovChain(recentInteractions, primaryComponents, registeredComponents) {
  // Get sequence of components from recent interactions
  const sequence = recentInteractions
    .slice(0, 5)
    .map(interaction => interaction.componentId);
  
  const predictions = [];
  
  // Skip if sequence is too short
  if (sequence.length < 2) {
    return predictUsingProbabilistic(recentInteractions, primaryComponents, registeredComponents);
  }
  
  // Identify components that often follow this sequence pattern
  // This is a simplified version of a Markov Chain prediction
  const sequenceKey = sequence.slice(-2).join('|');
  
  // For each registered component, check if it follows this sequence
  registeredComponents.forEach(component => {
    const componentId = component.id;
    
    // Skip components already in the sequence
    if (sequence.includes(componentId)) {
      return;
    }
    
    // Check transition probability from the last component in sequence
    const lastComponent = sequence[sequence.length - 1];
    const transitionProb = getTransitionProbability(lastComponent, componentId);
    
    // Check if this component often follows the sequence pattern
    let probability = transitionProb;
    
    // Boost probability for primary components
    const isPrimaryComponent = primaryComponents.some(
      pc => pc.componentId === componentId
    );
    
    if (isPrimaryComponent) {
      const primaryData = primaryComponents.find(
        pc => pc.componentId === componentId
      );
      
      // Normalize importance score to [0, 0.3] range
      const normalizedImportance = Math.min(primaryData.importance / 10, 0.3);
      
      // Boost probability based on component importance
      probability += normalizedImportance;
    }
    
    // Ensure probability is in [0, 1] range
    probability = Math.max(0, Math.min(probability, 1));
    
    // Add prediction if probability exceeds low threshold
    if (probability > confidenceThresholds.low) {
      predictions.push({
        componentId,
        probability,
        confidence: Math.min(probability + 0.1, 1),
        priority: getPriorityFromProbability(probability),
        model: 'markovChain'
      });
    }
  });
  
  // If no predictions from Markov Chain, fall back to probabilistic
  if (predictions.length === 0) {
    return predictUsingProbabilistic(recentInteractions, primaryComponents, registeredComponents);
  }
  
  // Sort by probability (highest first)
  return predictions.sort((a, b) => b.probability - a.probability);
}

/**
 * Predict component usage using Transformer model
 * This is an experimental approach that uses attention mechanisms
 * for better sequence modeling
 * 
 * @param {Array} recentInteractions - Recent user interactions
 * @param {Array} primaryComponents - Primary components based on usage
 * @param {Array} registeredComponents - All registered components
 * @param {number} interactionDensity - User interaction density
 * @returns {Array} - Predictions with probabilities
 */
function predictUsingTransformer(recentInteractions, primaryComponents, registeredComponents, interactionDensity) {
  // This is a simplified simulation of a transformer model
  // In a real implementation, this would use an actual transformer architecture
  
  // For now, use probabilistic model with enhancements
  const basePredictions = predictUsingProbabilistic(recentInteractions, primaryComponents, registeredComponents);
  
  // Apply sequence-aware adjustments to simulate transformer behavior
  return basePredictions.map(prediction => {
    const { componentId, probability } = prediction;
    
    // Enhanced probability based on sequence awareness
    // Higher interaction density leads to more confident predictions
    const densityFactor = Math.min(interactionDensity / 10, 1);
    const enhancedProbability = Math.min(probability * (1 + densityFactor * 0.2), 1.0);
    
    return {
      ...prediction,
      probability: enhancedProbability,
      confidence: Math.min(enhancedProbability + 0.15, 1),
      priority: getPriorityFromProbability(enhancedProbability),
      model: 'transformer'
    };
  });
}

/**
 * Update the transition matrix with new relationship data
 * @param {Array} relationships - Component relationship data
 */
function updateTransitionMatrix(relationships) {
  relationships.forEach(relationship => {
    const { source, target, weight } = relationship;
    
    // Initialize source map if it doesn't exist
    if (!transitionMatrix.has(source)) {
      transitionMatrix.set(source, new Map());
    }
    
    const sourceMap = transitionMatrix.get(source);
    const currentWeight = sourceMap.get(target) || 0;
    
    // Update weight using exponential moving average with learning rate
    const newWeight = currentWeight * (1 - learningRate) + 
                      weight * learningRate;
    
    sourceMap.set(target, newWeight);
  });
  
  // Normalize transition probabilities
  normalizeTransitionMatrix();
}

/**
 * Normalize the transition matrix so probabilities sum to 1
 */
function normalizeTransitionMatrix() {
  transitionMatrix.forEach((transitions, sourceId) => {
    const total = Array.from(transitions.values()).reduce((sum, val) => sum + val, 0);
    
    if (total > 0) {
      transitions.forEach((value, targetId) => {
        transitions.set(targetId, value / total);
      });
    }
  });
}

/**
 * Get transition probability between two components
 * @param {string} sourceId - Source component ID
 * @param {string} targetId - Target component ID
 * @returns {number} - Transition probability
 */
function getTransitionProbability(sourceId, targetId) {
  const sourceTransitions = transitionMatrix.get(sourceId);
  
  if (!sourceTransitions) {
    return 0;
  }
  
  return sourceTransitions.get(targetId) || 0;
}

/**
 * Determine priority level based on probability
 * @param {number} probability - Prediction probability
 * @returns {string} - Priority level (high, medium, low)
 */
function getPriorityFromProbability(probability) {
  if (probability >= confidenceThresholds.high) {
    return 'high';
  } else if (probability >= confidenceThresholds.medium) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Update prediction metrics based on actual component usage
 * @param {string} componentId - Component that was actually used
 * @param {Array} predictions - Previous predictions
 */
function updateMetrics(componentId, predictions) {
  // Increment total predictions counter
  metrics.totalPredictions++;
  
  // Check if this component was predicted
  const wasCorrectlyPredicted = predictions.some(p => p.componentId === componentId);
  
  if (wasCorrectlyPredicted) {
    // This was a correct prediction
    metrics.correctPredictions++;
  }
  
  // Update accuracy
  metrics.lastAccuracy = metrics.correctPredictions / metrics.totalPredictions;
  
  // Return updated metrics
  return metrics;
}

/**
 * Get serializable model state for persistence
 * @returns {Object} Serializable model state
 */
function getSerializableModelState() {
  // Convert transitionMatrix (a Map of Maps) to a serializable format
  const serializableMatrix = [];
  
  transitionMatrix.forEach((transitions, sourceId) => {
    transitions.forEach((probability, targetId) => {
      serializableMatrix.push({
        source: sourceId,
        target: targetId,
        probability
      });
    });
  });
  
  return {
    transitionMatrix: serializableMatrix,
    confidenceThresholds,
    learningRate,
    modelType,
    metrics
  };
}

/**
 * Load model state from serialized data
 * @param {Object} modelState - Serialized model state
 */
function loadModelState(modelState) {
  if (!modelState) return;
  
  // Recreate transition matrix from serialized data
  transitionMatrix = new Map();
  
  if (modelState.transitionMatrix && Array.isArray(modelState.transitionMatrix)) {
    modelState.transitionMatrix.forEach(item => {
      const { source, target, probability } = item;
      
      if (!transitionMatrix.has(source)) {
        transitionMatrix.set(source, new Map());
      }
      
      transitionMatrix.get(source).set(target, probability);
    });
  }
  
  // Update other model parameters
  if (modelState.confidenceThresholds) {
    Object.assign(confidenceThresholds, modelState.confidenceThresholds);
  }
  
  if (modelState.learningRate) {
    learningRate = modelState.learningRate;
  }
  
  if (modelState.modelType) {
    modelType = modelState.modelType;
  }
  
  if (modelState.metrics) {
    Object.assign(metrics, modelState.metrics);
  }
}

/**
 * Merge predictions from different models
 * @param {Array} predictions1 - First set of predictions
 * @param {Array} predictions2 - Second set of predictions
 * @returns {Array} - Merged predictions
 */
function mergePredictions(predictions1, predictions2) {
  // Create a map of component IDs to predictions
  const predictionMap = new Map();
  
  // Add predictions from first set
  predictions1.forEach(prediction => {
    predictionMap.set(prediction.componentId, prediction);
  });
  
  // Merge or add predictions from second set
  predictions2.forEach(prediction => {
    if (predictionMap.has(prediction.componentId)) {
      // Take the higher probability
      const existing = predictionMap.get(prediction.componentId);
      if (prediction.probability > existing.probability) {
        predictionMap.set(prediction.componentId, prediction);
      }
    } else {
      predictionMap.set(prediction.componentId, prediction);
    }
  });
  
  // Convert back to array and sort by probability
  return Array.from(predictionMap.values())
    .sort((a, b) => b.probability - a.probability);
}