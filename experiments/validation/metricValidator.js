/**
 * metricValidator.js
 * 
 * Implementation of performance metric validation for ReactSmart.
 * This module provides tools for validating and comparing performance metrics
 * between standard and ReactSmart-optimized component loading strategies.
 */

const { independentTTest } = require('../statistical/tTest');
const { calculateAllEffectSizes } = require('../statistical/effectSize');
const { bootstrapCI, bootstrapComparison } = require('../statistical/bootstrap');
const { SimulationEnvironment } = require('../simulation/simulator');

/**
 * Validates performance metrics between standard and optimized loading strategies
 * @param {Array<Object>} baselineMetrics - Performance metrics from baseline loading strategy
 * @param {Array<Object>} optimizedMetrics - Performance metrics from ReactSmart loading strategy
 * @param {Object} options - Configuration options
 * @param {boolean} options.excludeOutliers - Whether to exclude outliers (default: true)
 * @param {number} options.outlierThreshold - Z-score threshold for outlier detection (default: 2.5)
 * @param {boolean} options.bootstrap - Whether to use bootstrap comparison (default: true)
 * @param {number} options.bootstrapIterations - Number of bootstrap iterations (default: 10000)
 * @returns {Object} Validation results
 */
function validatePerformanceMetrics(baselineMetrics, optimizedMetrics, options = {}) {
  const {
    excludeOutliers = true,
    outlierThreshold = 2.5,
    bootstrap = true,
    bootstrapIterations = 10000
  } = options;

  if (!Array.isArray(baselineMetrics) || !Array.isArray(optimizedMetrics)) {
    throw new Error('Both baseline and optimized metrics must be arrays');
  }

  if (baselineMetrics.length === 0 || optimizedMetrics.length === 0) {
    throw new Error('Metrics arrays cannot be empty');
  }

  console.log(`Validating metrics: ${baselineMetrics.length} baseline samples, ${optimizedMetrics.length} optimized samples`);

  // First, extract the metrics to compare
  const metricTypes = extractMetricTypes(baselineMetrics[0]);
  
  if (metricTypes.length === 0) {
    throw new Error('No valid metrics found in provided data');
  }

  // Process metrics and optionally remove outliers
  const processedBaseline = excludeOutliers 
    ? removeOutliers(baselineMetrics, metricTypes, outlierThreshold)
    : baselineMetrics;
  
  const processedOptimized = excludeOutliers 
    ? removeOutliers(optimizedMetrics, metricTypes, outlierThreshold)
    : optimizedMetrics;

  console.log(`After outlier removal: ${processedBaseline.length} baseline samples, ${processedOptimized.length} optimized samples`);

  // Prepare results structure
  const results = {
    metricComparisons: {},
    overall: {
      sampleSizes: {
        baseline: processedBaseline.length,
        optimized: processedOptimized.length
      },
      outlierRemoval: excludeOutliers,
      outlierThreshold: excludeOutliers ? outlierThreshold : null,
      significantImprovements: 0,
      totalMetrics: metricTypes.length
    }
  };

  // Analyze each metric type
  metricTypes.forEach(metricType => {
    const baselineValues = extractMetricValues(processedBaseline, metricType);
    const optimizedValues = extractMetricValues(processedOptimized, metricType);

    // Skip if we don't have enough data
    if (baselineValues.length < 5 || optimizedValues.length < 5) {
      console.warn(`Insufficient data for metric ${metricType}, skipping validation`);
      results.metricComparisons[metricType] = {
        error: 'Insufficient data',
        baselineSampleSize: baselineValues.length,
        optimizedSampleSize: optimizedValues.length
      };
      return;
    }

    // Determine if lower values are better for this metric
    const lowerIsBetter = isLowerBetter(metricType);

    // Calculate basic statistics
    const baselineStats = calculateMetricStatistics(baselineValues);
    const optimizedStats = calculateMetricStatistics(optimizedValues);

    // Perform t-test comparison
    const tTestResult = independentTTest(
      lowerIsBetter ? baselineValues : optimizedValues, 
      lowerIsBetter ? optimizedValues : baselineValues, 
      { equalVariance: false }
    );

    // Perform bootstrap comparison if requested
    let bootstrapResult = null;
    if (bootstrap) {
      bootstrapResult = bootstrapComparison(
        lowerIsBetter ? baselineValues : optimizedValues,
        lowerIsBetter ? optimizedValues : baselineValues,
        bootstrapIterations
      );
    }

    // Calculate effect sizes
    const effectSizes = calculateAllEffectSizes(
      baselineValues, 
      optimizedValues, 
      { 
        lowerIsBetter,
        baseline: baselineStats.mean,
        improved: optimizedStats.mean
      }
    );

    // Calculate improvement percentage
    const improvementPercent = calculateImprovementPercentage(
      baselineStats.mean, 
      optimizedStats.mean, 
      lowerIsBetter
    );

    // Store results for this metric
    results.metricComparisons[metricType] = {
      baseline: baselineStats,
      optimized: optimizedStats,
      improvement: {
        absolute: Math.abs(baselineStats.mean - optimizedStats.mean),
        percent: improvementPercent,
        direction: determineBenefit(baselineStats.mean, optimizedStats.mean, lowerIsBetter)
      },
      statistical: {
        tTest: {
          t: tTestResult.t,
          df: tTestResult.df,
          pValue: tTestResult.pValue,
          significant: tTestResult.significant
        },
        bootstrap: bootstrap ? {
          pValue: bootstrapResult.pValue,
          confidenceInterval: bootstrapResult.percentileCI,
          significant: bootstrapResult.pValue < 0.05
        } : null,
        effectSizes: {
          cohensD: effectSizes.cohensD.d,
          interpretation: effectSizes.cohensD.interpretation,
          percentageImprovement: effectSizes.percentageImprovement.percentage
        }
      },
      lowerIsBetter
    };

    // Increment count of significant improvements
    if (tTestResult.significant && 
        determineBenefit(baselineStats.mean, optimizedStats.mean, lowerIsBetter) === 'improvement') {
      results.overall.significantImprovements++;
    }
  });

  // Calculate overall validation success rate
  results.overall.validationSuccessRate = results.overall.significantImprovements / results.overall.totalMetrics;
  results.overall.timestamp = new Date().toISOString();

  return results;
}

/**
 * Extracts metric types from a sample metric object
 * @param {Object} sampleMetric - Sample metric object to extract types from
 * @returns {Array<string>} Array of metric type names
 */
function extractMetricTypes(sampleMetric) {
  // Extract top-level metrics only (ignore nested objects)
  return Object.keys(sampleMetric).filter(key => 
    typeof sampleMetric[key] === 'number' && 
    !key.startsWith('_') && 
    key !== 'timestamp'
  );
}

/**
 * Extracts values for a specific metric from an array of metric objects
 * @param {Array<Object>} metrics - Array of metric objects
 * @param {string} metricType - Type of metric to extract
 * @returns {Array<number>} Array of metric values
 */
function extractMetricValues(metrics, metricType) {
  return metrics
    .map(metric => metric[metricType])
    .filter(value => typeof value === 'number' && !isNaN(value));
}

/**
 * Removes statistical outliers from an array of metric objects
 * @param {Array<Object>} metrics - Array of metric objects
 * @param {Array<string>} metricTypes - Types of metrics to check for outliers
 * @param {number} threshold - Z-score threshold for outlier detection
 * @returns {Array<Object>} Filtered array of metric objects
 */
function removeOutliers(metrics, metricTypes, threshold) {
  // First identify which metric objects are outliers
  const outlierFlags = metrics.map(() => false);
  
  metricTypes.forEach(metricType => {
    const values = extractMetricValues(metrics, metricType);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const sd = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    );
    
    // Mark as outlier if z-score exceeds threshold
    values.forEach((value, index) => {
      const zScore = Math.abs((value - mean) / sd);
      if (zScore > threshold) {
        outlierFlags[index] = true;
      }
    });
  });
  
  // Return only non-outlier metrics
  return metrics.filter((_, index) => !outlierFlags[index]);
}

/**
 * Calculates basic statistics for an array of metric values
 * @param {Array<number>} values - Array of metric values
 * @returns {Object} Basic statistics (mean, median, sd, etc.)
 */
function calculateMetricStatistics(values) {
  const n = values.length;
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  
  // Sort values for percentile calculations
  const sortedValues = [...values].sort((a, b) => a - b);
  
  // Calculate median (50th percentile)
  const median = n % 2 === 0
    ? (sortedValues[n / 2 - 1] + sortedValues[n / 2]) / 2
    : sortedValues[Math.floor(n / 2)];
  
  // Calculate standard deviation
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
  const sd = Math.sqrt(variance);
  
  // Calculate 95% confidence interval for the mean
  const se = sd / Math.sqrt(n);
  const tCritical = 1.96; // Approximate for large samples
  
  // Calculate percentiles
  const p25 = sortedValues[Math.floor(n * 0.25)];
  const p75 = sortedValues[Math.floor(n * 0.75)];
  const p95 = sortedValues[Math.floor(n * 0.95)];
  
  return {
    n,
    mean,
    median,
    sd,
    min: sortedValues[0],
    max: sortedValues[n - 1],
    confidenceInterval: {
      lower: mean - tCritical * se,
      upper: mean + tCritical * se,
      level: 0.95
    },
    percentiles: {
      p25,
      p75,
      p95
    }
  };
}

/**
 * Determines if lower values are better for a specific metric type
 * @param {string} metricType - Type of metric
 * @returns {boolean} Whether lower values are better
 */
function isLowerBetter(metricType) {
  // Metrics where lower values are considered better
  const lowerIsBetterMetrics = [
    'loadTime', 'initialLoadTime', 'timeToInteractive', 'firstInputDelay',
    'memoryUsage', 'cpuUsage', 'renderTime', 'networkTime', 'parseTime',
    'executionTime', 'layoutTime', 'paintTime', 'blockedTime', 'idleTime',
    'firstPaint', 'firstContentfulPaint', 'largestContentfulPaint',
    'cumulativeLayoutShift', 'firstMeaningfulPaint', 'totalBlockingTime',
    'timeToFirstByte', 'domContentLoaded', 'domInteractive', 'loadEvent',
    'unnecessaryLoads', 'bundleSize', 'transferSize', 'compilationTime',
    'evaluationTime', 'interactionDelay', 'stateTransitionTime'
  ];
  
  // Metrics where higher values are considered better
  const higherIsBetterMetrics = [
    'fps', 'throughput', 'accuracy', 'predictionAccuracy', 'precision',
    'recall', 'f1Score', 'score', 'successRate', 'completionRate',
    'conversionRate', 'userSatisfaction', 'resourceSaved'
  ];
  
  // Check if metric is in either list
  if (lowerIsBetterMetrics.some(m => metricType.toLowerCase().includes(m.toLowerCase()))) {
    return true;
  }
  
  if (higherIsBetterMetrics.some(m => metricType.toLowerCase().includes(m.toLowerCase()))) {
    return false;
  }
  
  // Default assumption: lower is better for most performance metrics
  return true;
}

/**
 * Calculates improvement percentage between baseline and optimized metrics
 * @param {number} baseline - Baseline metric value
 * @param {number} optimized - Optimized metric value
 * @param {boolean} lowerIsBetter - Whether lower values are better
 * @returns {number} Improvement percentage
 */
function calculateImprovementPercentage(baseline, optimized, lowerIsBetter) {
  if (baseline === 0) {
    return optimized === 0 ? 0 : Infinity; // Avoid division by zero
  }
  
  if (lowerIsBetter) {
    // For metrics where lower is better (e.g., load time)
    return ((baseline - optimized) / baseline) * 100;
  } else {
    // For metrics where higher is better (e.g., accuracy)
    return ((optimized - baseline) / baseline) * 100;
  }
}

/**
 * Determines if the change between baseline and optimized is an improvement
 * @param {number} baseline - Baseline metric value
 * @param {number} optimized - Optimized metric value
 * @param {boolean} lowerIsBetter - Whether lower values are better
 * @returns {string} 'improvement', 'regression', or 'no change'
 */
function determineBenefit(baseline, optimized, lowerIsBetter) {
  const diff = optimized - baseline;
  
  if (Math.abs(diff) < 0.001) {
    return 'no change';
  }
  
  if ((lowerIsBetter && diff < 0) || (!lowerIsBetter && diff > 0)) {
    return 'improvement';
  }
  
  return 'regression';
}

/**
 * Validates performance metrics collected from actual deployments
 * @param {Object} deploymentData - Performance data from real-world deployments
 * @param {Object} simulationData - Performance data from simulations
 * @param {Array<string>} metricsToValidate - List of metrics to validate
 * @returns {Object} Validation results comparing simulation to real-world data
 */
function validateDeploymentMetrics(deploymentData, simulationData, metricsToValidate) {
  if (!deploymentData || !simulationData) {
    throw new Error('Both deployment and simulation data must be provided');
  }
  
  if (!Array.isArray(metricsToValidate) || metricsToValidate.length === 0) {
    throw new Error('At least one metric must be specified for validation');
  }
  
  // Results object
  const results = {
    validatedMetrics: {},
    overall: {
      simulationAccuracy: 0,
      withinErrorMargin: 0,
      totalMetrics: metricsToValidate.length
    }
  };
  
  // Validate each metric
  metricsToValidate.forEach(metric => {
    // Skip if metric doesn't exist in either dataset
    if (!deploymentData[metric] || !simulationData[metric]) {
      results.validatedMetrics[metric] = {
        error: 'Metric not found in one or both datasets'
      };
      return;
    }
    
    const realValue = deploymentData[metric].mean || deploymentData[metric];
    const simulatedValue = simulationData[metric].mean || simulationData[metric];
    
    // Calculate error and deviation
    const absoluteError = Math.abs(realValue - simulatedValue);
    const relativeError = (absoluteError / realValue) * 100;
    
    // Get confidence intervals if available
    const realCI = deploymentData[metric].confidenceInterval;
    const simulatedCI = simulationData[metric].confidenceInterval;
    
    // Check if simulation value is within real-world confidence interval
    let withinCI = false;
    if (realCI) {
      withinCI = simulatedValue >= realCI.lower && simulatedValue <= realCI.upper;
    }
    
    // Determine if the error is acceptable (within 10% by default)
    const errorThreshold = 10; // 10% relative error threshold
    const acceptableError = relativeError <= errorThreshold;
    
    // Store validation results for this metric
    results.validatedMetrics[metric] = {
      real: {
        value: realValue,
        confidenceInterval: realCI
      },
      simulated: {
        value: simulatedValue,
        confidenceInterval: simulatedCI
      },
      errors: {
        absolute: absoluteError,
        relative: relativeError,
        withinConfidenceInterval: withinCI,
        acceptableError
      }
    };
    
    // Update overall statistics
    if (acceptableError) {
      results.overall.withinErrorMargin++;
    }
  });
  
  // Calculate overall simulation accuracy
  results.overall.simulationAccuracy = results.overall.withinErrorMargin / results.overall.totalMetrics;
  results.overall.timestamp = new Date().toISOString();
  
  return results;
}

/**
 * Validates prediction accuracy by comparing predicted components with actual used components
 * @param {Array<Object>} predictionData - Array of prediction records (predicted vs actual components)
 * @param {Object} options - Validation options
 * @param {number} options.lookAheadWindow - Number of future components to consider (default: 3)
 * @param {number} options.timeWindow - Time window to consider predictions valid (ms) (default: 30000)
 * @returns {Object} Prediction accuracy validation results
 */
function validatePredictionAccuracy(predictionData, options = {}) {
  const {
    lookAheadWindow = 3,
    timeWindow = 30000 // 30 seconds
  } = options;

  if (!Array.isArray(predictionData) || predictionData.length === 0) {
    throw new Error('Prediction data must be a non-empty array');
  }

  // Initialize counts for accuracy metrics
  let totalPredictions = 0;
  let correctPredictions = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  
  // Track individual prediction outcomes
  const predictionOutcomes = [];
  
  // Process each prediction record
  predictionData.forEach(record => {
    if (!record.predicted || !record.actual) {
      return; // Skip invalid records
    }
    
    totalPredictions++;
    
    // Predicted components (may be multiple)
    const predictedComponents = Array.isArray(record.predicted) ? 
      record.predicted : [record.predicted];
    
    // Actual components used within the window
    const actualComponents = Array.isArray(record.actual) ? 
      record.actual.slice(0, lookAheadWindow) : [record.actual];
    
    // Check for correct predictions
    let correctCount = 0;
    let recordFalsePositives = 0;
    
    predictedComponents.forEach(predicted => {
      if (actualComponents.includes(predicted)) {
        correctCount++;
      } else {
        recordFalsePositives++;
        falsePositives++;
      }
    });
    
    // Count false negatives (actual components that weren't predicted)
    const missedComponents = actualComponents.filter(actual => 
      !predictedComponents.includes(actual)
    );
    
    const recordFalseNegatives = missedComponents.length;
    falseNegatives += recordFalseNegatives;
    
    // Was this prediction record considered successful?
    // (At least one component was correctly predicted)
    const wasSuccessful = correctCount > 0;
    if (wasSuccessful) {
      correctPredictions++;
    }
    
    // Store individual prediction outcome for detailed analysis
    predictionOutcomes.push({
      timestamp: record.timestamp,
      predictedCount: predictedComponents.length,
      actualCount: actualComponents.length,
      correctCount,
      falsePositives: recordFalsePositives,
      falseNegatives: recordFalseNegatives,
      successful: wasSuccessful
    });
  });

  // Calculate accuracy metrics
  const accuracy = correctPredictions / totalPredictions;
  const precision = totalPredictions > 0 ? 
    correctPredictions / (correctPredictions + falsePositives) : 0;
  const recall = (correctPredictions + falseNegatives) > 0 ? 
    correctPredictions / (correctPredictions + falseNegatives) : 0;
  const f1Score = (precision + recall) > 0 ? 
    2 * (precision * recall) / (precision + recall) : 0;

  // Calculate bootstrap confidence interval for accuracy
  const successArray = predictionOutcomes.map(outcome => outcome.successful ? 1 : 0);
  const accuracyCI = bootstrapCI(successArray, 10000, 0.05);

  return {
    overall: {
      totalPredictions,
      correctPredictions,
      falsePositives,
      falseNegatives,
      accuracy,
      precision,
      recall,
      f1Score
    },
    confidenceIntervals: {
      accuracy: {
        lower: accuracyCI.percentileCI.lower,
        upper: accuracyCI.percentileCI.upper,
        level: 0.95
      }
    },
    parameters: {
      lookAheadWindow,
      timeWindow
    },
    predictionOutcomes: predictionOutcomes.length > 100 ? 
      `${predictionOutcomes.length} outcomes (not included due to size)` : 
      predictionOutcomes
  };
}

/**
 * Validates performance improvement against a target threshold
 * @param {Array<Object>} baselineMetrics - Performance metrics from baseline loading strategy
 * @param {Array<Object>} optimizedMetrics - Performance metrics from ReactSmart loading strategy
 * @param {Object} targets - Target improvement thresholds for different metrics
 * @returns {Object} Validation results against targets
 */
function validateAgainstTargets(baselineMetrics, optimizedMetrics, targets) {
  if (!targets || Object.keys(targets).length === 0) {
    throw new Error('Target thresholds must be provided');
  }

  // First validate the performance metrics
  const validationResults = validatePerformanceMetrics(baselineMetrics, optimizedMetrics);
  
  // Results object
  const results = {
    targetValidation: {},
    overall: {
      targetsAchieved: 0,
      totalTargets: Object.keys(targets).length
    }
  };
  
  // Check each target
  Object.keys(targets).forEach(metricName => {
    if (!validationResults.metricComparisons[metricName]) {
      results.targetValidation[metricName] = {
        error: 'Metric not found in validation results'
      };
      return;
    }
    
    const targetImprovement = targets[metricName];
    const actualImprovement = validationResults.metricComparisons[metricName].improvement.percent;
    const achieved = actualImprovement >= targetImprovement;
    
    results.targetValidation[metricName] = {
      target: targetImprovement,
      actual: actualImprovement,
      achieved,
      difference: actualImprovement - targetImprovement
    };
    
    if (achieved) {
      results.overall.targetsAchieved++;
    }
  });
  
  // Calculate overall success rate
  results.overall.successRate = results.overall.targetsAchieved / results.overall.totalTargets;
  results.overall.validationResults = validationResults;
  results.overall.timestamp = new Date().toISOString();
  
  return results;
}

module.exports = {
  validatePerformanceMetrics,
  validateDeploymentMetrics,
  validatePredictionAccuracy,
  validateAgainstTargets,
  removeOutliers,
  calculateMetricStatistics,
  isLowerBetter
};