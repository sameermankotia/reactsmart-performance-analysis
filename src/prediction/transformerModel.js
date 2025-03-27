/**
 * Transformer-based Prediction Model
 * 
 * Implements a simplified transformer architecture for sequence prediction
 * of component usage. This is an experimental approach that provides better
 * handling of long-range dependencies in user interaction sequences.
 */

/**
 * TransformerModel for sequence-based component prediction
 */
class TransformerModel {
    /**
     * Create a new TransformerModel
     * @param {Object} options - Configuration options
     * @param {number} options.embeddingSize - Size of component embeddings (default: 32)
     * @param {number} options.sequenceLength - Maximum sequence length to consider (default: 10)
     * @param {number} options.numHeads - Number of attention heads (default: 4)
     * @param {number} options.learningRate - Learning rate for updates (default: 0.01)
     */
    constructor(options = {}) {
      this.options = {
        embeddingSize: 32,
        sequenceLength: 10,
        numHeads: 4,
        learningRate: 0.01,
        ...options
      };
      
      // Component embeddings (id -> vector)
      this.embeddings = new Map();
      
      // Attention matrices
      this.attentionMatrices = Array(this.options.numHeads).fill().map(() => new Map());
      
      // Output projection matrix
      this.outputProjection = new Map();
      
      // Component ID mapping (for internal use)
      this.componentToIndex = new Map();
      this.indexToComponent = new Map();
      this.nextIndex = 0;
      
      // Training metrics
      this.metrics = {
        sequencesTrained: 0,
        predictions: 0,
        correctPredictions: 0,
        accuracy: 0
      };
    }
    
    /**
     * Get or create an index for a component ID
     * @param {string} componentId - Component ID
     * @returns {number} Component index
     */
    getComponentIndex(componentId) {
      if (!this.componentToIndex.has(componentId)) {
        const index = this.nextIndex++;
        this.componentToIndex.set(componentId, index);
        this.indexToComponent.set(index, componentId);
        
        // Initialize embedding vector with small random values
        this.embeddings.set(componentId, this.createRandomVector());
      }
      
      return this.componentToIndex.get(componentId);
    }
    
    /**
     * Create a random vector for initialization
     * @returns {Array} Random vector of size embeddingSize
     */
    createRandomVector() {
      return Array(this.options.embeddingSize).fill().map(() => 
        (Math.random() - 0.5) * 0.1
      );
    }
    
    /**
     * Train the model on a sequence of component interactions
     * @param {Array} sequence - Sequence of component IDs
     */
    trainOnSequence(sequence) {
      if (!sequence || sequence.length < 2) return;
      
      this.metrics.sequencesTrained++;
      
      // Process only the most recent part of the sequence if it's too long
      const effectiveSequence = sequence.slice(-this.options.sequenceLength);
      
      // Register all components in the sequence
      effectiveSequence.forEach(componentId => this.getComponentIndex(componentId));
      
      // For each position, predict the next component
      for (let i = 0; i < effectiveSequence.length - 1; i++) {
        const context = effectiveSequence.slice(0, i + 1);
        const targetComponent = effectiveSequence[i + 1];
        
        // Update model based on this example
        this.updateModelForExample(context, targetComponent);
      }
    }
    
    /**
     * Update model parameters for a single training example
     * @param {Array} context - Context sequence of component IDs
     * @param {string} targetComponent - Target component ID to predict
     */
    updateModelForExample(context, targetComponent) {
      // Compute attention over the context
      const attentionOutputs = this.computeAttention(context);
      
      // Make a prediction based on current model
      const prediction = this.predictNextComponent(attentionOutputs);
      
      // Compute error (very simplified for this implementation)
      const targetIndex = this.getComponentIndex(targetComponent);
      
      // Simple "error signal" - 1 for correct component, -1 for others
      const errorSignal = new Map();
      
      for (const [componentId] of this.embeddings) {
        const componentIndex = this.getComponentIndex(componentId);
        errorSignal.set(componentId, componentIndex === targetIndex ? 1 : -1);
      }
      
      // Update embeddings and attention matrices (simplified gradient descent)
      this.updateParameters(context, errorSignal, attentionOutputs);
    }
    
    /**
     * Compute multi-head attention over a sequence
     * @param {Array} sequence - Sequence of component IDs
     * @returns {Array} Attention outputs
     */
    computeAttention(sequence) {
      // This is a very simplified implementation of multi-head attention
      // A real transformer would have more complex operations
      
      // Get embeddings for each component in the sequence
      const embeddings = sequence.map(componentId => 
        this.embeddings.get(componentId) || this.createRandomVector()
      );
      
      // Compute attention outputs for each head
      const headOutputs = this.options.numHeads.map((_, headIndex) => {
        const attentionMatrix = this.attentionMatrices[headIndex];
        
        // Compute attention scores (simplified)
        const attentionScores = [];
        
        for (let i = 0; i < sequence.length; i++) {
          const scores = [];
          for (let j = 0; j < sequence.length; j++) {
            // Get or create attention weight between these components
            const sourceId = sequence[i];
            const targetId = sequence[j];
            const key = `${sourceId}|${targetId}`;
            
            if (!attentionMatrix.has(key)) {
              // Initialize with a small random value
              attentionMatrix.set(key, Math.random() * 0.1);
            }
            
            scores.push(attentionMatrix.get(key));
          }
          
          // Apply softmax to get attention weights
          const softmaxScores = this.softmax(scores);
          attentionScores.push(softmaxScores);
        }
        
        // Apply attention weights to values (embeddings)
        const outputs = [];
        for (let i = 0; i < sequence.length; i++) {
          const weightedSum = new Array(this.options.embeddingSize).fill(0);
          
          for (let j = 0; j < sequence.length; j++) {
            const weight = attentionScores[i][j];
            const embedding = embeddings[j];
            
            // Add weighted embedding
            for (let k = 0; k < this.options.embeddingSize; k++) {
              weightedSum[k] += weight * embedding[k];
            }
          }
          
          outputs.push(weightedSum);
        }
        
        return outputs;
      });
      
      // Combine outputs from all heads (just average for simplicity)
      const combinedOutputs = [];
      for (let i = 0; i < sequence.length; i++) {
        const combined = new Array(this.options.embeddingSize).fill(0);
        
        for (let head = 0; head < this.options.numHeads; head++) {
          const headOutput = headOutputs[head][i];
          
          for (let j = 0; j < this.options.embeddingSize; j++) {
            combined[j] += headOutput[j] / this.options.numHeads;
          }
        }
        
        combinedOutputs.push(combined);
      }
      
      return combinedOutputs;
    }
    
    /**
     * Apply softmax function to an array of scores
     * @param {Array} scores - Array of scores
     * @returns {Array} Softmax probabilities
     */
    softmax(scores) {
      // Numerical stability: subtract max score
      const maxScore = Math.max(...scores);
      const expScores = scores.map(score => Math.exp(score - maxScore));
      const sumExpScores = expScores.reduce((sum, exp) => sum + exp, 0);
      return expScores.map(exp => exp / sumExpScores);
    }
    
    /**
     * Predict the next component based on attention outputs
     * @param {Array} attentionOutputs - Outputs from attention mechanism
     * @returns {Map} Probabilities for each component
     */
    predictNextComponent(attentionOutputs) {
      if (!attentionOutputs || attentionOutputs.length === 0) {
        return new Map();
      }
      
      // Use the last position's output for prediction
      const lastOutput = attentionOutputs[attentionOutputs.length - 1];
      
      // Compute scores for each possible next component
      const scores = new Map();
      
      for (const [componentId, embedding] of this.embeddings.entries()) {
        // Compute dot product between last output and component embedding
        let score = 0;
        for (let i = 0; i < this.options.embeddingSize; i++) {
          score += lastOutput[i] * embedding[i];
        }
        
        // Apply output projection if available
        if (this.outputProjection.has(componentId)) {
          score += this.outputProjection.get(componentId);
        } else {
          this.outputProjection.set(componentId, 0);
        }
        
        scores.set(componentId, score);
      }
      
      // Convert scores to probabilities with softmax
      const scoreValues = Array.from(scores.values());
      const probabilities = this.softmax(scoreValues);
      
      // Create component to probability mapping
      const result = new Map();
      let i = 0;
      for (const componentId of scores.keys()) {
        result.set(componentId, probabilities[i++]);
      }
      
      return result;
    }
    
    /**
     * Update model parameters based on error signal
     * @param {Array} context - Context sequence
     * @param {Map} errorSignal - Error signal for each component
     * @param {Array} attentionOutputs - Outputs from attention mechanism
     */
    updateParameters(context, errorSignal, attentionOutputs) {
      // Update output projection weights
      for (const [componentId, signal] of errorSignal.entries()) {
        const currentValue = this.outputProjection.get(componentId) || 0;
        this.outputProjection.set(
          componentId,
          currentValue + this.options.learningRate * signal
        );
      }
      
      // Update embeddings (very simplified)
      for (const [componentId, signal] of errorSignal.entries()) {
        const embedding = this.embeddings.get(componentId);
        if (embedding) {
          // Small adjustment based on signal
          for (let i = 0; i < embedding.length; i++) {
            embedding[i] += this.options.learningRate * signal * 0.01;
          }
        }
      }
      
      // Update attention matrices (very simplified)
      for (let head = 0; head < this.options.numHeads; head++) {
        const attentionMatrix = this.attentionMatrices[head];
        
        for (let i = 0; i < context.length; i++) {
          for (let j = 0; j < context.length; j++) {
            const sourceId = context[i];
            const targetId = context[j];
            const key = `${sourceId}|${targetId}`;
            
            // Get current attention weight
            const currentWeight = attentionMatrix.get(key) || 0;
            
            // Simple update based on target component's error signal
            const targetSignal = errorSignal.get(context[context.length - 1]) || 0;
            
            // Update weight
            attentionMatrix.set(
              key,
              currentWeight + this.options.learningRate * targetSignal * 0.01
            );
          }
        }
      }
    }
    
    /**
     * Predict the next component given a context sequence
     * @param {Array} context - Context sequence of component IDs
     * @param {Array} availableComponents - List of available components to consider
     * @returns {Array} Predictions with probabilities
     */
    predict(context, availableComponents) {
      if (!context || context.length === 0 || !availableComponents || availableComponents.length === 0) {
        return [];
      }
      
      // Process only the most recent part of the sequence if it's too long
      const effectiveContext = context.slice(-this.options.sequenceLength);
      
      // Register any new components
      effectiveContext.forEach(componentId => this.getComponentIndex(componentId));
      
      // Compute attention over the context
      const attentionOutputs = this.computeAttention(effectiveContext);
      
      // Get probabilities for each component
      const probabilities = this.predictNextComponent(attentionOutputs);
      
      // Create predictions array
      const predictions = [];
      
      // Add predictions for available components
      for (const component of availableComponents) {
        const componentId = component.id;
        
        // Skip components already in context
        if (effectiveContext.includes(componentId)) continue;
        
        // Get probability, defaulting to a small value if not found
        const probability = probabilities.get(componentId) || 0.01;
        
        predictions.push({
          componentId,
          probability,
          confidence: 0.8, // Transformers generally have higher confidence
          priority: this.getPriorityFromProbability(probability),
          model: 'transformer'
        });
      }
      
      // Sort by probability (highest first)
      predictions.sort((a, b) => b.probability - a.probability);
      
      return predictions;
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
      
      // Check if the actual component was the top prediction
      if (predictions.length > 0 && predictions[0].componentId === actualComponent) {
        this.metrics.correctPredictions++;
      }
      
      // Update accuracy
      this.metrics.accuracy = this.metrics.correctPredictions / this.metrics.predictions;
    }
    
    /**
     * Get model metrics
     * @returns {Object} Model metrics
     */
    getMetrics() {
      return {
        ...this.metrics,
        modelSize: {
          components: this.embeddings.size,
          embeddingSize: this.options.embeddingSize,
          attentionHeads: this.options.numHeads,
          parameters: this.calculateParameterCount()
        }
      };
    }
    
    /**
     * Calculate the total number of parameters in the model
     * @returns {number} Parameter count
     */
    calculateParameterCount() {
      const numComponents = this.embeddings.size;
      
      // Embedding parameters
      const embeddingParams = numComponents * this.options.embeddingSize;
      
      // Attention matrix parameters
      let attentionParams = 0;
      for (const matrix of this.attentionMatrices) {
        attentionParams += matrix.size;
      }
      
      // Output projection parameters
      const outputParams = this.outputProjection.size;
      
      return embeddingParams + attentionParams + outputParams;
    }
    
    /**
     * Serialize the model for storage
     * @returns {Object} Serialized model
     */
    serialize() {
      return {
        options: { ...this.options },
        metrics: { ...this.metrics },
        embeddings: Array.from(this.embeddings.entries()).map(([id, vector]) => ({
          id,
          vector: [...vector]
        })),
        attentionMatrices: this.attentionMatrices.map(matrix => 
          Array.from(matrix.entries()).map(([key, value]) => ({ key, value }))
        ),
        outputProjection: Array.from(this.outputProjection.entries()).map(([id, value]) => ({
          id,
          value
        })),
        componentMapping: Array.from(this.componentToIndex.entries()).map(([id, index]) => ({
          id,
          index
        })),
        nextIndex: this.nextIndex
      };
    }
    
    /**
     * Deserialize a model from storage
     * @param {Object} serialized - Serialized model
     * @returns {TransformerModel} Deserialized model
     */
    static deserialize(serialized) {
      if (!serialized || !serialized.options || !serialized.embeddings) {
        throw new Error('Invalid serialized Transformer model');
      }
      
      const model = new TransformerModel(serialized.options);
      
      // Restore metrics
      if (serialized.metrics) {
        model.metrics = { ...serialized.metrics };
      }
      
      // Restore embeddings
      serialized.embeddings.forEach(({ id, vector }) => {
        model.embeddings.set(id, [...vector]);
      });
      
      // Restore attention matrices
      serialized.attentionMatrices.forEach((matrixData, index) => {
        const matrix = new Map();
        matrixData.forEach(({ key, value }) => {
          matrix.set(key, value);
        });
        model.attentionMatrices[index] = matrix;
      });
      
      // Restore output projection
      serialized.outputProjection.forEach(({ id, value }) => {
        model.outputProjection.set(id, value);
      });
      
      // Restore component mapping
      serialized.componentMapping.forEach(({ id, index }) => {
        model.componentToIndex.set(id, index);
        model.indexToComponent.set(index, id);
      });
      
      // Restore next index
      model.nextIndex = serialized.nextIndex;
      
      return model;
    }
    
    /**
     * Reset the model
     */
    reset() {
      // Clear all data structures
      this.embeddings.clear();
      this.attentionMatrices.forEach(matrix => matrix.clear());
      this.outputProjection.clear();
      this.componentToIndex.clear();
      this.indexToComponent.clear();
      this.nextIndex = 0;
      
      // Reset metrics
      this.metrics = {
        sequencesTrained: 0,
        predictions: 0,
        correctPredictions: 0,
        accuracy: 0
      };
    }
    
    /**
     * Optimize the model by pruning rarely used components
     * @param {number} usageThreshold - Minimum usage count to keep a component
     */
    pruneComponents(usageThreshold = 5) {
      // Get component usage counts
      const usageCounts = new Map();
      
      // Count occurrences in attention matrices
      this.attentionMatrices.forEach(matrix => {
        Array.from(matrix.keys()).forEach(key => {
          const [sourceId, targetId] = key.split('|');
          usageCounts.set(sourceId, (usageCounts.get(sourceId) || 0) + 1);
          usageCounts.set(targetId, (usageCounts.get(targetId) || 0) + 1);
        });
      });
      
      // Identify components to remove
      const componentsToRemove = [];
      
      for (const [componentId] of this.embeddings) {
        const usageCount = usageCounts.get(componentId) || 0;
        if (usageCount < usageThreshold) {
          componentsToRemove.push(componentId);
        }
      }
      
      // Remove embeddings for these components
      componentsToRemove.forEach(componentId => {
        this.embeddings.delete(componentId);
        this.outputProjection.delete(componentId);
        
        // Remove from component mapping
        const index = this.componentToIndex.get(componentId);
        if (index !== undefined) {
          this.componentToIndex.delete(componentId);
          this.indexToComponent.delete(index);
        }
      });
      
      // Clean up attention matrices
      this.attentionMatrices.forEach(matrix => {
        const keysToRemove = [];
        
        for (const key of matrix.keys()) {
          const [sourceId, targetId] = key.split('|');
          if (componentsToRemove.includes(sourceId) || componentsToRemove.includes(targetId)) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => matrix.delete(key));
      });
      
      return componentsToRemove.length;
    }
  }
  
  export default TransformerModel;