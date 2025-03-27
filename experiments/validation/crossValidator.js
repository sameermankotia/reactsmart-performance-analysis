/**
 * crossValidator.js
 * 
 * Implementation of k-fold cross-validation for ReactSmart prediction models.
 * This module provides tools for evaluating prediction accuracy and model robustness
 * by partitioning user session data into training and validation sets.
 */

const { calculateMetrics } = require('../dataProcessing/metricCalculation');
const { PredictionEngine } = require('../../src/core/PredictionEngine');
const { interpretCohensD } = require('../statistical/effectSize');

/**
 * Performs k-fold cross-validation on user session data to evaluate prediction model performance
 * @param {Array<Object>} sessions - Array of user session data
 * @param {Object} options - Configuration options
 * @param {number} options.folds - Number of folds for cross-validation (default: 5)
 * @param {boolean} options.stratify - Whether to stratify folds by session properties (default: true)
 * @param {Array<string>} options.stratifyBy - Session properties to stratify by (default: ['deviceType', 'networkType'])
 * @param {Object} options.modelConfig - Configuration for the prediction model
 * @returns {Object} Cross-validation results
 */
function crossValidate(sessions, options = {}) {
  const {
    folds = 5,
    stratify = true,
    stratifyBy = ['deviceType', 'networkType'],
    modelConfig = {}
  } = options;

  if (!Array.isArray(sessions) || sessions.length === 0) {
    throw new Error('Sessions must be a non-empty array');
  }

  if (folds < 2 || !Number.isInteger(folds)) {
    throw new Error('Number of folds must be an integer greater than 1');
  }

  if (folds > sessions.length) {
    throw new Error('Number of folds cannot exceed number of sessions');
  }

  // Stratify sessions if requested
  let foldIndices;
  if (stratify) {
    foldIndices = stratifySessions(sessions, folds, stratifyBy);
  } else {
    foldIndices = randomlySplitSessions(sessions, folds);
  }

  // Metrics to track across folds
  const foldResults = [];
  const aggregateMetrics = {
    accuracy: [],
    precision: [],
    recall: [],
    f1Score: [],
    auc: [],
    predictionTime: [],
    unnecessaryLoads: []
  };

  // Run cross-validation
  for (let fold = 0; fold < folds; fold++) {
    console.log(`Running fold ${fold + 1}/${folds}`);

    // Split data into training and validation sets
    const trainingSessions = [];
    const validationSessions = [];

    for (let i = 0; i < sessions.length; i++) {
      if (foldIndices[i] === fold) {
        validationSessions.push(sessions[i]);
      } else {
        trainingSessions.push(sessions[i]);
      }
    }

    // Train model on training set
    const model = trainModel(trainingSessions, modelConfig);

    // Validate model on validation set
    const foldResult = validateModel(model, validationSessions, modelConfig);

    // Add results to aggregate metrics
    Object.keys(aggregateMetrics).forEach(metric => {
      if (foldResult[metric] !== undefined) {
        aggregateMetrics[metric].push(foldResult[metric]);
      }
    });

    // Store detailed fold results
    foldResults.push({
      fold: fold + 1,
      trainingSize: trainingSessions.length,
      validationSize: validationSessions.length,
      ...foldResult
    });
  }

  // Calculate aggregate metrics across folds
  const results = {
    folds,
    totalSessions: sessions.length,
    stratified: stratify,
    stratifiedBy: stratify ? stratifyBy : null,
    aggregateMetrics: computeAggregateResults(aggregateMetrics),
    foldResults,
    modelConfig
  };

  return results;
}

/**
 * Divides sessions into folds with stratification to maintain distribution of specified properties
 * @param {Array<Object>} sessions - Array of user session data
 * @param {number} folds - Number of folds
 * @param {Array<string>} stratifyBy - Properties to stratify by
 * @returns {Array<number>} Array of fold indices for each session
 */
function stratifySessions(sessions, folds, stratifyBy) {
  // Group sessions by the stratification properties
  const stratGroups = {};

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    const groupKey = stratifyBy
      .map(prop => session[prop] || 'unknown')
      .join('|');

    if (!stratGroups[groupKey]) {
      stratGroups[groupKey] = [];
    }
    stratGroups[groupKey].push(i);
  }

  // Distribute sessions from each group evenly across folds
  const foldIndices = new Array(sessions.length);
  const foldCounts = new Array(folds).fill(0);

  Object.values(stratGroups).forEach(group => {
    // Shuffle indices within the group to randomize assignment
    shuffleArray(group);

    // Assign each session in the group to the fold with the fewest sessions
    group.forEach(sessionIndex => {
      const assignedFold = foldCounts.indexOf(Math.min(...foldCounts));
      foldIndices[sessionIndex] = assignedFold;
      foldCounts[assignedFold]++;
    });
  });

  return foldIndices;
}

/**
 * Randomly splits sessions into folds without stratification
 * @param {Array<Object>} sessions - Array of user session data
 * @param {number} folds - Number of folds
 * @returns {Array<number>} Array of fold indices for each session
 */
function randomlySplitSessions(sessions, folds) {
  const indices = Array.from({ length: sessions.length }, (_, i) => i);
  shuffleArray(indices);

  const foldIndices = new Array(sessions.length);
  
  for (let i = 0; i < indices.length; i++) {
    foldIndices[indices[i]] = i % folds;
  }

  return foldIndices;
}

/**
 * Trains a prediction model on a set of training sessions
 * @param {Array<Object>} trainingSessions - Array of session data for training
 * @param {Object} modelConfig - Configuration for the prediction model
 * @returns {Object} Trained prediction model
 */
function trainModel(trainingSessions, modelConfig) {
  const {
    learningRate = 0.03,
    interactionWeightMultiplier = 1.0,
    minConfidence = 0.3,
    featureExtraction = 'basic'
  } = modelConfig;

  // Create a new prediction engine with specified configuration
  const predictionEngine = new PredictionEngine({
    learningRate,
    interactionWeightMultiplier,
    minConfidence,
    featureExtraction
  });

  // Extract interaction data and sequence information from training sessions
  const trainingData = extractTrainingData(trainingSessions);

  // Train the model on extracted data
  console.log(`Training model on ${trainingSessions.length} sessions...`);
  const startTime = process.hrtime();
  
  predictionEngine.batchTrain(trainingData);
  
  const [seconds, nanoseconds] = process.hrtime(startTime);
  const trainingTime = seconds + nanoseconds / 1e9;
  
  console.log(`Model training completed in ${trainingTime.toFixed(3)} seconds`);

  // Return trained model and metadata
  return {
    engine: predictionEngine,
    trainingSize: trainingSessions.length,
    trainingTime,
    modelConfig
  };
}

/**
 * Extracts training data from user sessions
 * @param {Array<Object>} sessions - User session data
 * @returns {Object} Processed training data
 */
function extractTrainingData(sessions) {
  // Extract component interactions and sequences
  const interactions = [];
  const sequences = [];
  const componentUsage = {};
  
  sessions.forEach(session => {
    // Process interactions
    if (session.interactions) {
      session.interactions.forEach(interaction => {
        interactions.push({
          component: interaction.component,
          timestamp: interaction.timestamp,
          duration: interaction.duration,
          context: interaction.context || {},
          sessionId: session.id
        });
        
        // Track component usage
        if (!componentUsage[interaction.component]) {
          componentUsage[interaction.component] = 0;
        }
        componentUsage[interaction.component]++;
      });
    }
    
    // Process component sequences
    if (session.componentSequence) {
      sequences.push({
        sequence: session.componentSequence,
        sessionId: session.id,
        context: session.context || {}
      });
    }
  });
  
  return {
    interactions,
    sequences,
    componentUsage,
    sessionCount: sessions.length
  };
}

/**
 * Validates a trained model on validation sessions
 * @param {Object} model - Trained prediction model
 * @param {Array<Object>} validationSessions - Sessions for validation
 * @param {Object} modelConfig - Model configuration
 * @returns {Object} Validation metrics
 */
function validateModel(model, validationSessions, modelConfig) {
  console.log(`Validating model on ${validationSessions.length} sessions...`);
  
  const predictionEngine = model.engine;
  const predictions = [];
  const actuals = [];
  const predictionTimes = [];
  let correctPredictions = 0;
  let totalPredictions = 0;
  let unnecessaryLoads = 0;
  
  // Validation metrics
  validationSessions.forEach(session => {
    if (!session.componentSequence || session.componentSequence.length < 2) {
      return; // Skip sessions with insufficient data
    }
    
    // For each position in the sequence, predict the next component
    for (let i = 0; i < session.componentSequence.length - 1; i++) {
      const currentContext = {
        component: session.componentSequence[i],
        sessionContext: session.context || {},
        timestamp: session.timestamps ? session.timestamps[i] : Date.now()
      };
      
      // Measure prediction time
      const startTime = process.hrtime();
      const prediction = predictionEngine.predict(currentContext);
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const predictionTime = seconds + nanoseconds / 1e9;
      predictionTimes.push(predictionTime);
      
      // Get actual next component
      const actualNext = session.componentSequence[i + 1];
      
      // Calculate prediction accuracy
      if (prediction && prediction.components) {
        totalPredictions++;
        
        // Check if the actual component was in the top predictions
        const predictedComponents = prediction.components.map(p => p.component);
        const wasCorrect = predictedComponents.includes(actualNext);
        
        if (wasCorrect) {
          correctPredictions++;
        }
        
        // Count unnecessary loads (predicted but not used)
        const unusedComponents = predictedComponents.filter(comp => comp !== actualNext);
        unnecessaryLoads += unusedComponents.length;
        
        // Store prediction details for precision/recall calculation
        predictions.push({
          predicted: predictedComponents,
          confidence: prediction.components.map(p => p.probability),
          actual: actualNext,
          correct: wasCorrect
        });
        
        // Store binary outcomes for each component in the prediction
        predictedComponents.forEach(comp => {
          actuals.push(comp === actualNext ? 1 : 0);
        });
      }
    }
  });
  
  // Calculate metrics
  const accuracy = correctPredictions / totalPredictions;
  
  // Calculate precision, recall, and F1 score
  const { precision, recall, f1Score } = calculatePrecisionRecall(predictions);
  
  // Calculate AUC (Area Under ROC Curve)
  const auc = calculateAUC(actuals, predictions);
  
  // Calculate average prediction time
  const avgPredictionTime = predictionTimes.reduce((sum, time) => sum + time, 0) / predictionTimes.length;
  
  // Average unnecessary loads per prediction
  const avgUnnecessaryLoads = unnecessaryLoads / totalPredictions;

  console.log(`Validation completed with accuracy: ${(accuracy * 100).toFixed(2)}%`);
  
  return {
    accuracy,
    precision,
    recall,
    f1Score,
    auc,
    predictionTime: avgPredictionTime,
    unnecessaryLoads: avgUnnecessaryLoads,
    totalPredictions,
    correctPredictions,
    validationSize: validationSessions.length
  };
}

/**
 * Calculates precision, recall, and F1 score for predictions
 * @param {Array<Object>} predictions - Prediction results
 * @returns {Object} Precision, recall, and F1 metrics
 */
function calculatePrecisionRecall(predictions) {
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  
  predictions.forEach(p => {
    if (p.predicted.includes(p.actual)) {
      truePositives++;
    } else {
      falseNegatives++;
    }
    
    // Count predicted components that weren't the actual as false positives
    falsePositives += p.predicted.filter(comp => comp !== p.actual).length;
  });
  
  const precision = truePositives / (truePositives + falsePositives);
  const recall = truePositives / (truePositives + falseNegatives);
  const f1Score = 2 * (precision * recall) / (precision + recall);
  
  return {
    precision,
    recall,
    f1Score
  };
}

/**
 * Calculates the Area Under the ROC Curve (AUC)
 * @param {Array<number>} actuals - Actual outcomes (0 or 1)
 * @param {Array<Object>} predictions - Prediction results with confidence
 * @returns {number} AUC value
 */
function calculateAUC(actuals, predictions) {
  // This is a simplified AUC calculation
  // A more sophisticated implementation would use proper ROC curve calculation
  
  // Extract paired values of prediction confidence and actual outcome
  const pairs = [];
  let index = 0;
  
  predictions.forEach(p => {
    p.predicted.forEach((comp, i) => {
      if (index < actuals.length) {
        pairs.push({
          confidence: p.confidence[i],
          actual: actuals[index++]
        });
      }
    });
  });
  
  // Sort by confidence (descending)
  pairs.sort((a, b) => b.confidence - a.confidence);
  
  // Calculate AUC using the trapezoidal rule
  let auc = 0;
  let truePositives = 0;
  let falsePositives = 0;
  const totalPositives = actuals.filter(a => a === 1).length;
  const totalNegatives = actuals.filter(a => a === 0).length;
  
  if (totalPositives === 0 || totalNegatives === 0) {
    return 0.5; // Default value for degenerate case
  }
  
  let prevFpr = 0;
  let prevTpr = 0;
  
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i].actual === 1) {
      truePositives++;
    } else {
      falsePositives++;
    }
    
    const tpr = truePositives / totalPositives;
    const fpr = falsePositives / totalNegatives;
    
    // Add the trapezoid area
    auc += (fpr - prevFpr) * (tpr + prevTpr) / 2;
    
    prevFpr = fpr;
    prevTpr = tpr;
  }
  
  return auc;
}

/**
 * Computes aggregate results from fold metrics
 * @param {Object} aggregateMetrics - Metrics from each fold
 * @returns {Object} Aggregate results with mean, sd, and confidence intervals
 */
function computeAggregateResults(aggregateMetrics) {
  const results = {};
  
  Object.keys(aggregateMetrics).forEach(metric => {
    const values = aggregateMetrics[metric];
    if (values.length === 0) return;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const sd = Math.sqrt(variance);
    
    // Calculate 95% confidence interval
    const se = sd / Math.sqrt(values.length);
    const tCritical = 2.776; // Approximate t critical value for 95% CI with small df
    
    results[metric] = {
      mean,
      sd,
      min: Math.min(...values),
      max: Math.max(...values),
      confidenceInterval: {
        lower: mean - tCritical * se,
        upper: mean + tCritical * se,
        level: 0.95
      }
    };
  });
  
  return results;
}

/**
 * Performs nested cross-validation for hyperparameter tuning
 * @param {Array<Object>} sessions - Array of user session data
 * @param {Object} options - Configuration options
 * @param {number} options.outerFolds - Number of outer folds (default: 5)
 * @param {number} options.innerFolds - Number of inner folds (default: 3)
 * @param {Array<Object>} options.hyperparameterSets - Array of hyperparameter configurations to test
 * @returns {Object} Nested cross-validation results
 */
function nestedCrossValidate(sessions, options = {}) {
  const {
    outerFolds = 5,
    innerFolds = 3,
    hyperparameterSets = [
      { learningRate: 0.01, minConfidence: 0.2 },
      { learningRate: 0.03, minConfidence: 0.3 },
      { learningRate: 0.05, minConfidence: 0.4 }
    ]
  } = options;

  if (!Array.isArray(sessions) || sessions.length === 0) {
    throw new Error('Sessions must be a non-empty array');
  }

  // Split sessions into outer folds
  const outerFoldIndices = randomlySplitSessions(sessions, outerFolds);
  const outerResults = [];

  // For each outer fold
  for (let outerFold = 0; outerFold < outerFolds; outerFold++) {
    console.log(`Running outer fold ${outerFold + 1}/${outerFolds}`);

    // Split into training and test sets
    const trainingSessions = [];
    const testSessions = [];

    for (let i = 0; i < sessions.length; i++) {
      if (outerFoldIndices[i] === outerFold) {
        testSessions.push(sessions[i]);
      } else {
        trainingSessions.push(sessions[i]);
      }
    }

    // Perform inner cross-validation for hyperparameter tuning
    const hyperparameterResults = [];

    for (const hyperparams of hyperparameterSets) {
      console.log(`Testing hyperparameters: ${JSON.stringify(hyperparams)}`);

      const innerResult = crossValidate(trainingSessions, {
        folds: innerFolds,
        modelConfig: hyperparams
      });

      hyperparameterResults.push({
        hyperparams,
        accuracy: innerResult.aggregateMetrics.accuracy.mean,
        recall: innerResult.aggregateMetrics.recall.mean,
        precision: innerResult.aggregateMetrics.precision.mean,
        f1Score: innerResult.aggregateMetrics.f1Score.mean
      });
    }

    // Find best hyperparameters based on F1 score
    hyperparameterResults.sort((a, b) => b.f1Score - a.f1Score);
    const bestHyperparams = hyperparameterResults[0].hyperparams;
    
    console.log(`Best hyperparameters for fold ${outerFold + 1}: ${JSON.stringify(bestHyperparams)}`);

    // Train model with best hyperparameters on all training data
    const model = trainModel(trainingSessions, bestHyperparams);

    // Evaluate on test set
    const testResult = validateModel(model, testSessions, bestHyperparams);

    outerResults.push({
      outerFold: outerFold + 1,
      bestHyperparams,
      hyperparameterResults,
      testResult
    });
  }

  // Compute aggregate results across outer folds
  const aggregateResults = {
    accuracy: [],
    precision: [],
    recall: [],
    f1Score: []
  };

  outerResults.forEach(result => {
    aggregateResults.accuracy.push(result.testResult.accuracy);
    aggregateResults.precision.push(result.testResult.precision);
    aggregateResults.recall.push(result.testResult.recall);
    aggregateResults.f1Score.push(result.testResult.f1Score);
  });

  // Final results
  return {
    outerFolds,
    innerFolds,
    hyperparameterSets,
    outerResults,
    aggregateResults: computeAggregateResults(aggregateResults)
  };
}

/**
 * Compares model performance across different session characteristics
 * @param {Array<Object>} sessions - Array of user session data
 * @param {string} characteristic - Session characteristic to analyze (e.g., 'deviceType', 'networkType')
 * @param {Object} options - Cross-validation options
 * @returns {Object} Comparison results across different characteristic values
 */
function compareAcrossCharacteristic(sessions, characteristic, options = {}) {
  if (!sessions[0][characteristic]) {
    throw new Error(`Session data does not contain characteristic: ${characteristic}`);
  }

  // Group sessions by the characteristic
  const groups = {};
  
  sessions.forEach(session => {
    const value = session[characteristic] || 'unknown';
    
    if (!groups[value]) {
      groups[value] = [];
    }
    
    groups[value].push(session);
  });

  // Run cross-validation for each group
  const results = {};
  
  for (const [value, groupSessions] of Object.entries(groups)) {
    if (groupSessions.length < options.folds || groupSessions.length < 10) {
      console.log(`Skipping ${value} due to insufficient data (${groupSessions.length} sessions)`);
      continue;
    }
    
    console.log(`Running cross-validation for ${characteristic}=${value} (${groupSessions.length} sessions)`);
    results[value] = crossValidate(groupSessions, options);
  }

  // Perform statistical comparison between groups
  const comparisonResults = {};
  
  const values = Object.keys(results);
  for (let i = 0; i < values.length - 1; i++) {
    for (let j = i + 1; j < values.length; j++) {
      const value1 = values[i];
      const value2 = values[j];
      
      const group1 = results[value1].aggregateMetrics.accuracy.mean;
      const group2 = results[value2].aggregateMetrics.accuracy.mean;
      const diff = Math.abs(group1 - group2);
      
      // Simple effect size calculation
      const pooledSD = Math.sqrt(
        (Math.pow(results[value1].aggregateMetrics.accuracy.sd, 2) + 
         Math.pow(results[value2].aggregateMetrics.accuracy.sd, 2)) / 2
      );
      
      const effectSize = diff / pooledSD;
      
      comparisonResults[`${value1} vs ${value2}`] = {
        accuracyDifference: diff,
        effectSize,
        interpretation: interpretCohensD(effectSize)
      };
    }
  }

  return {
    characteristic,
    groups: Object.fromEntries(
      Object.entries(results).map(([key, value]) => [
        key, 
        {
          sessionCount: groups[key].length,
          accuracy: value.aggregateMetrics.accuracy.mean,
          precision: value.aggregateMetrics.precision.mean,
          recall: value.aggregateMetrics.recall.mean,
          f1Score: value.aggregateMetrics.f1Score.mean
        }
      ])
    ),
    comparisons: comparisonResults
  };
}

/**
 * Fisher-Yates shuffle algorithm for in-place array shuffling
 * @param {Array} array - Array to be shuffled
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

module.exports = {
  crossValidate,
  nestedCrossValidate,
  compareAcrossCharacteristic,
  validateModel,
  trainModel,
  stratifySessions
};