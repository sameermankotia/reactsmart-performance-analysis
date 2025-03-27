/**
 * Performance Metric Calculation Utility
 * 
 * Calculates performance metrics and statistical measures from extracted data.
 * This utility is used to process the raw data into meaningful performance
 * indicators that can be used to evaluate ReactSmart's effectiveness.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const d3 = require('d3-array'); // For statistical calculations

/**
 * Calculate performance metrics from a dataset
 * @param {Array} data - Processed performance data
 * @param {Object} options - Calculation options
 * @returns {Object} - Calculated metrics
 */
function calculateMetrics(data, options = {}) {
  const {
    groupBy = null,           // Group data by a specific metadata field
    compareField = null,      // Field to use for comparison (e.g., 'optimizationEnabled')
    compareValues = null,     // Values to compare (e.g., [true, false])
    confidenceLevel = 0.95,   // Confidence level for intervals (0.95 = 95%)
    metricDefinitions = {},   // Custom metric definitions
    includeAllDataPoints = false // Whether to include all data points in results
  } = options;
  
  // Validate data
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid or empty dataset');
  }
  
  // Group data if requested
  let groupedData;
  if (groupBy) {
    groupedData = groupDataBy(data, groupBy);
  } else if (compareField && compareValues) {
    // Group by comparison field
    groupedData = compareValues.reduce((acc, value) => {
      acc[value] = data.filter(item => 
        item.metadata && item.metadata[compareField] === value
      );
      return acc;
    }, {});
  } else {
    // No grouping, use all data
    groupedData = { 'all': data };
  }
  
  // Calculate metrics for each group
  const results = {};
  
  for (const [groupName, groupData] of Object.entries(groupedData)) {
    if (groupData.length === 0) continue;
    
    // Calculate standard metrics
    const metrics = calculateStandardMetrics(groupData, confidenceLevel);
    
    // Calculate custom metrics if defined
    if (Object.keys(metricDefinitions).length > 0) {
      const customMetrics = calculateCustomMetrics(groupData, metricDefinitions);
      Object.assign(metrics, customMetrics);
    }
    
    // Include all data points if requested
    if (includeAllDataPoints) {
      metrics.dataPoints = groupData.map(item => ({
        metadata: item.metadata,
        metrics: item.metrics
      }));
    }
    
    results[groupName] = metrics;
  }
  
  // If we're comparing two groups, calculate improvements
  if (compareField && compareValues && compareValues.length === 2) {
    const [baselineValue, improvedValue] = compareValues;
    const baselineData = results[baselineValue];
    const improvedData = results[improvedValue];
    
    if (baselineData && improvedData) {
      results.improvements = calculateImprovements(baselineData, improvedData);
    }
  }
  
  return results;
}

/**
 * Group data by a specific metadata field
 * @param {Array} data - Performance data
 * @param {string} field - Metadata field to group by
 * @returns {Object} - Grouped data
 */
function groupDataBy(data, field) {
  return data.reduce((groups, item) => {
    const value = item.metadata && item.metadata[field];
    
    if (value !== undefined) {
      const groupName = String(value);
      
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      
      groups[groupName].push(item);
    }
    
    return groups;
  }, {});
}

/**
 * Calculate standard performance metrics from a dataset
 * @param {Array} data - Performance data
 * @param {number} confidenceLevel - Confidence level for intervals
 * @returns {Object} - Calculated standard metrics
 */
function calculateStandardMetrics(data, confidenceLevel) {
  // Extract metrics from all data points
  const metricNames = new Set();
  const metricValues = {};
  
  data.forEach(item => {
    if (item.metrics) {
      Object.entries(item.metrics).forEach(([name, value]) => {
        // Skip non-numeric and histogram values
        if (typeof value === 'number' && !name.includes('histogram')) {
          metricNames.add(name);
          
          if (!metricValues[name]) {
            metricValues[name] = [];
          }
          
          metricValues[name].push(value);
        }
      });
    }
  });
  
  // Calculate statistics for each metric
  const results = {};
  
  metricNames.forEach(name => {
    const values = metricValues[name];
    
    // Only calculate if we have values
    if (values && values.length > 0) {
      // Sort values for percentile calculations
      values.sort((a, b) => a - b);
      
      // Basic statistics
      const stats = {
        mean: d3.mean(values),
        median: d3.median(values),
        min: d3.min(values),
        max: d3.max(values),
        count: values.length,
        sum: d3.sum(values),
        std: d3.deviation(values)
      };
      
      // Percentiles
      stats.p25 = d3.quantile(values, 0.25);
      stats.p75 = d3.quantile(values, 0.75);
      stats.p90 = d3.quantile(values, 0.9);
      stats.p95 = d3.quantile(values, 0.95);
      stats.p99 = d3.quantile(values, 0.99);
      
      // Confidence interval for mean
      const confidenceStats = calculateConfidenceInterval(values, confidenceLevel);
      stats.ci_lower = confidenceStats.lower;
      stats.ci_upper = confidenceStats.upper;
      stats.ci_margin = confidenceStats.margin;
      
      results[name] = stats;
    }
  });
  
  return results;
}

/**
 * Calculate confidence interval for a dataset
 * @param {Array} values - Numeric values
 * @param {number} confidenceLevel - Confidence level (0-1)
 * @returns {Object} - Confidence interval statistics
 */
function calculateConfidenceInterval(values, confidenceLevel) {
  const n = values.length;
  const mean = d3.mean(values);
  const std = d3.deviation(values);
  
  // t-value for the confidence level and degrees of freedom
  // This is an approximation using the normal distribution
  const alpha = 1 - confidenceLevel;
  const z = getZScore(1 - alpha / 2);
  
  // Standard error of the mean
  const se = std / Math.sqrt(n);
  
  // Margin of error
  const margin = z * se;
  
  return {
    lower: mean - margin,
    upper: mean + margin,
    margin: margin
  };
}

/**
 * Get Z-score for a probability (using approximation)
 * @param {number} p - Probability
 * @returns {number} - Z-score
 */
function getZScore(p) {
  // Approximation of the inverse of the standard normal CDF
  // Source: https://stackoverflow.com/questions/36575743
  if (p <= 0 || p >= 1) {
    throw new Error('Probability must be between 0 and 1');
  }
  
  if (p === 0.5) return 0;
  
  const a1 = -39.6968302866538;
  const a2 = 220.946098424521;
  const a3 = -275.928510446969;
  const a4 = 138.357751867269;
  const a5 = -30.6647980661472;
  const a6 = 2.50662827745924;
  
  const b1 = -54.4760987982241;
  const b2 = 161.585836858041;
  const b3 = -155.698979859887;
  const b4 = 66.8013118877197;
  const b5 = -13.2806815528857;
  
  let q = p - 0.5;
  
  if (Math.abs(q) <= 0.425) {
    const r = 0.180625 - q * q;
    return q * (((((a6 * r + a5) * r + a4) * r + a3) * r + a2) * r + a1) /
           (((((b5 * r + b4) * r + b3) * r + b2) * r + b1) * r + 1);
  }
  
  let r = p;
  if (q > 0) r = 1 - p;
  
  r = Math.sqrt(-Math.log(r));
  
  if (r <= 5) {
    r -= 1.6;
    const val = (((((a6 * r + a5) * r + a4) * r + a3) * r + a2) * r + a1) /
                (((((b5 * r + b4) * r + b3) * r + b2) * r + b1) * r + 1);
    return q < 0 ? -val : val;
  }
  
  r -= 5;
  const val = -0.000200214257;
  return q < 0 ? -val : val;
}

/**
 * Calculate custom metrics based on provided definitions
 * @param {Array} data - Performance data
 * @param {Object} metricDefinitions - Custom metric definitions
 * @returns {Object} - Calculated custom metrics
 */
function calculateCustomMetrics(data, metricDefinitions) {
  const customMetrics = {};
  
  // Process each custom metric definition
  Object.entries(metricDefinitions).forEach(([metricName, definition]) => {
    try {
      if (typeof definition === 'function') {
        // Definition is a direct calculation function
        customMetrics[metricName] = definition(data);
      } else if (definition.formula) {
        // Definition uses a formula with existing metrics
        const formula = definition.formula;
        const dependencies = definition.dependencies || [];
        
        // Calculate or retrieve dependent metrics
        const dependentValues = {};
        
        dependencies.forEach(depName => {
          // Check if this is a standard metric that's already calculated
          const metricValues = data.map(item => 
            item.metrics && item.metrics[depName]
          ).filter(val => val !== undefined);
          
          if (metricValues.length > 0) {
            dependentValues[depName] = d3.mean(metricValues);
          }
        });
        
        // Execute the formula with dependent values
        customMetrics[metricName] = formula(dependentValues);
      }
    } catch (error) {
      console.error(`Error calculating custom metric ${metricName}:`, error);
    }
  });
  
  return customMetrics;
}

/**
 * Calculate improvements between baseline and optimized metrics
 * @param {Object} baseline - Baseline metrics
 * @param {Object} optimized - Optimized metrics
 * @returns {Object} - Calculated improvements
 */
function calculateImprovements(baseline, optimized) {
  const improvements = {};
  
  // Process metrics common to both datasets
  Object.keys(baseline)
    .filter(key => optimized[key] && typeof baseline[key].mean === 'number')
    .forEach(metricName => {
      const baseValue = baseline[metricName].mean;
      const optimizedValue = optimized[metricName].mean;
      
      // Calculate absolute and percentage changes
      const absoluteChange = optimizedValue - baseValue;
      const percentageChange = (absoluteChange / baseValue) * 100;
      
      // For time-based metrics, negative change is improvement
      // For accuracy metrics, positive change is improvement
      const isTimeBased = [
        'initialLoad', 'ttfb', 'fcp', 'lcp', 'tbt', 'fid', 'tti'
      ].includes(metricName);
      
      const isAccuracyBased = [
        'predictionAccuracy', 'hitRate'
      ].includes(metricName);
      
      const isImprovement = (isTimeBased && absoluteChange < 0) || 
                           (isAccuracyBased && absoluteChange > 0) ||
                           (!isTimeBased && !isAccuracyBased);
      
      improvements[metricName] = {
        baseline: baseValue,
        optimized: optimizedValue,
        absoluteChange,
        percentageChange,
        isImprovement
      };
    });
  
  return improvements;
}

/**
 * Calculate statistical significance using t-test
 * @param {Array} group1 - First group values
 * @param {Array} group2 - Second group values
 * @returns {Object} - T-test results
 */
function calculateTTest(group1, group2) {
  if (!group1 || !group2 || group1.length < 2 || group2.length < 2) {
    return { significant: false, pValue: 1, tValue: 0 };
  }
  
  // Calculate means
  const mean1 = d3.mean(group1);
  const mean2 = d3.mean(group2);
  
  // Calculate variances
  const var1 = d3.variance(group1);
  const var2 = d3.variance(group2);
  
  // Sample sizes
  const n1 = group1.length;
  const n2 = group2.length;
  
  // Pooled standard error
  const se = Math.sqrt((var1 / n1) + (var2 / n2));
  
  // T-value
  const tValue = (mean1 - mean2) / se;
  
  // Degrees of freedom (Welch-Satterthwaite approximation)
  const df = Math.pow((var1 / n1 + var2 / n2), 2) / 
             (Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1));
  
  // P-value approximation
  const pValue = 2 * (1 - tCDF(Math.abs(tValue), df));
  
  return {
    tValue,
    pValue,
    significant: pValue < 0.05,
    degreesOfFreedom: df
  };
}

/**
 * Calculate cumulative distribution function for t-distribution
 * @param {number} t - T-value
 * @param {number} df - Degrees of freedom
 * @returns {number} - Cumulative probability
 */
function tCDF(t, df) {
  // This is an approximation using beta distribution
  const x = df / (df + t * t);
  return 1 - 0.5 * incompleteBeta(x, df / 2, 0.5);
}

/**
 * Calculate incomplete beta function (approximation)
 * @param {number} x - Value
 * @param {number} a - Alpha parameter
 * @param {number} b - Beta parameter
 * @returns {number} - Incomplete beta value
 */
function incompleteBeta(x, a, b) {
  // This is a simplified implementation
  // For production use, a more accurate algorithm should be used
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  
  // Simple approximation for common case
  return Math.pow(x, a) * Math.pow(1 - x, b);
}

/**
 * Analyze component loading performance
 * @param {Array} data - Performance data with component information
 * @returns {Object} - Component loading analysis
 */
function analyzeComponentLoading(data) {
  // Collect components across all data points
  const componentMap = new Map();
  
  data.forEach(item => {
    if (item.components && Array.isArray(item.components)) {
      item.components.forEach(component => {
        const componentId = component.name || component.id;
        
        if (!componentId) return;
        
        // Get or create component data
        if (!componentMap.has(componentId)) {
          componentMap.set(componentId, {
            id: componentId,
            loadTimes: [],
            renderCounts: [],
            preloadedCount: 0,
            usedCount: 0,
            predictedCount: 0,
            totalSize: 0,
            occurrences: 0
          });
        }
        
        const componentData = componentMap.get(componentId);
        componentData.occurrences++;
        
        // Track load time if available
        if (component.loadTime) {
          componentData.loadTimes.push(component.loadTime);
        }
        
        // Track render count if available
        if (component.renderCount) {
          componentData.renderCounts.push(component.renderCount);
        }
        
        // Track preloading and usage
        if (component.preloaded) {
          componentData.preloadedCount++;
        }
        
        if (component.used) {
          componentData.usedCount++;
        }
        
        if (component.predicted) {
          componentData.predictedCount++;
        }
        
        // Track size
        if (component.size && typeof component.size === 'number') {
          componentData.totalSize += component.size;
        }
      });
    }
  });
  
  // Calculate statistics for each component
  const componentsAnalysis = Array.from(componentMap.values()).map(component => {
    const loadTimes = component.loadTimes;
    const renderCounts = component.renderCounts;
    
    return {
      id: component.id,
      occurrences: component.occurrences,
      averageLoadTime: loadTimes.length > 0 ? d3.mean(loadTimes) : null,
      medianLoadTime: loadTimes.length > 0 ? d3.median(loadTimes) : null,
      averageRenderCount: renderCounts.length > 0 ? d3.mean(renderCounts) : null,
      preloadedPercentage: component.occurrences > 0 ? 
        (component.preloadedCount / component.occurrences) * 100 : 0,
      usedPercentage: component.occurrences > 0 ? 
        (component.usedCount / component.occurrences) * 100 : 0,
      predictedPercentage: component.occurrences > 0 ? 
        (component.predictedCount / component.occurrences) * 100 : 0,
      averageSize: component.occurrences > 0 ? 
        component.totalSize / component.occurrences : 0,
      preloadAccuracy: component.preloadedCount > 0 ? 
        (component.usedCount / component.preloadedCount) * 100 : 0
    };
  });
  
  // Sort by occurrence frequency
  componentsAnalysis.sort((a, b) => b.occurrences - a.occurrences);
  
  // Overall statistics
  const totalComponents = componentsAnalysis.length;
  const totalOccurrences = componentsAnalysis.reduce((sum, comp) => sum + comp.occurrences, 0);
  const totalPreloaded = componentsAnalysis.reduce((sum, comp) => sum + comp.preloadedCount, 0);
  const totalUsed = componentsAnalysis.reduce((sum, comp) => sum + comp.usedCount, 0);
  const totalPredicted = componentsAnalysis.reduce((sum, comp) => sum + comp.predictedCount, 0);
  
  return {
    components: componentsAnalysis,
    summary: {
      totalComponents,
      totalOccurrences,
      totalPreloaded,
      totalUsed,
      totalPredicted,
      overallPreloadAccuracy: totalPreloaded > 0 ? 
        (totalUsed / totalPreloaded) * 100 : 0,
      overallPredictionAccuracy: totalPredicted > 0 ? 
        (totalUsed / totalPredicted) * 100 : 0
    }
  };
}

/**
 * Analyze resource loading performance
 * @param {Array} data - Performance data with resource information
 * @returns {Object} - Resource loading analysis
 */
function analyzeResourceLoading(data) {
  // Group resources by type
  const resourcesByType = {};
  let totalResources = 0;
  let totalSize = 0;
  let totalTransferSize = 0;
  let totalDuration = 0;
  
  data.forEach(item => {
    if (item.resources && Array.isArray(item.resources)) {
      item.resources.forEach(resource => {
        const type = resource.type || 'other';
        
        // Initialize type if not exists
        if (!resourcesByType[type]) {
          resourcesByType[type] = {
            count: 0,
            size: 0,
            transferSize: 0,
            durations: []
          };
        }
        
        // Add resource to stats
        resourcesByType[type].count++;
        resourcesByType[type].size += resource.size || 0;
        resourcesByType[type].transferSize += resource.transferSize || 0;
        
        if (resource.duration) {
          resourcesByType[type].durations.push(resource.duration);
        }
        
        // Update totals
        totalResources++;
        totalSize += resource.size || 0;
        totalTransferSize += resource.transferSize || 0;
        totalDuration += resource.duration || 0;
      });
    }
  });
  
  // Calculate statistics for each resource type
  const resourcesAnalysis = Object.entries(resourcesByType).map(([type, stats]) => {
    return {
      type,
      count: stats.count,
      totalSize: stats.size,
      totalTransferSize: stats.transferSize,
      averageSize: stats.count > 0 ? stats.size / stats.count : 0,
      averageTransferSize: stats.count > 0 ? stats.transferSize / stats.count : 0,
      averageDuration: stats.durations.length > 0 ? d3.mean(stats.durations) : 0,
      medianDuration: stats.durations.length > 0 ? d3.median(stats.durations) : 0,
      percentage: totalResources > 0 ? (stats.count / totalResources) * 100 : 0
    };
  });
  
  // Sort by count
  resourcesAnalysis.sort((a, b) => b.count - a.count);
  
  return {
    resourceTypes: resourcesAnalysis,
    summary: {
      totalResources,
      totalSize,
      totalTransferSize,
      averageResourcesPerPage: data.length > 0 ? totalResources / data.length : 0,
      averageSizePerPage: data.length > 0 ? totalSize / data.length : 0,
      averageTransferSizePerPage: data.length > 0 ? totalTransferSize / data.length : 0,
      averageDurationPerResource: totalResources > 0 ? totalDuration / totalResources : 0
    }
  };
}

/**
 * Process a dataset and calculate all metrics
 * @param {string} inputPath - Path to input data file
 * @param {string} outputPath - Path to output results
 * @param {Object} options - Processing options
 */
async function processDataset(inputPath, outputPath, options = {}) {
  try {
    // Read input data
    const data = JSON.parse(await readFile(inputPath, 'utf8'));
    
    // Calculate metrics
    const metrics = calculateMetrics(data, options);
    
    // Analyze component loading if data contains component information
    if (data.some(item => item.components && item.components.length > 0)) {
      metrics.componentAnalysis = analyzeComponentLoading(data);
    }
    
    // Analyze resource loading if data contains resource information
    if (data.some(item => item.resources && item.resources.length > 0)) {
      metrics.resourceAnalysis = analyzeResourceLoading(data);
    }
    
    // Add statistical significance tests for comparisons
    if (options.compareField && options.compareValues && options.compareValues.length === 2) {
      const [baselineValue, improvedValue] = options.compareValues;
      const baselineData = data.filter(item => 
        item.metadata && item.metadata[options.compareField] === baselineValue
      );
      const improvedData = data.filter(item => 
        item.metadata && item.metadata[options.compareField] === improvedValue
      );
      
      // Run t-tests for each metric
      const significanceTests = {};
      const commonMetrics = new Set();
      
      // Find metrics common to both datasets
      baselineData.forEach(item => {
        if (item.metrics) {
          Object.keys(item.metrics).forEach(key => commonMetrics.add(key));
        }
      });
      
      improvedData.forEach(item => {
        if (item.metrics) {
          Object.keys(item.metrics).forEach(key => {
            if (!commonMetrics.has(key)) {
              commonMetrics.delete(key);
            }
          });
        }
      });
      
      // Run t-tests for common metrics
      Array.from(commonMetrics).forEach(metricName => {
        const baselineValues = baselineData
          .map(item => item.metrics && item.metrics[metricName])
          .filter(val => typeof val === 'number');
        
        const improvedValues = improvedData
          .map(item => item.metrics && item.metrics[metricName])
          .filter(val => typeof val === 'number');
        
        if (baselineValues.length > 1 && improvedValues.length > 1) {
          significanceTests[metricName] = calculateTTest(baselineValues, improvedValues);
        }
      });
      
      metrics.significanceTests = significanceTests;
    }
    
    // Save results
    await writeFile(outputPath, JSON.stringify(metrics, null, 2));
    console.log(`Metrics calculated and saved to ${outputPath}`);
    
    return metrics;
  } catch (error) {
    console.error('Error processing dataset:', error);
    throw error;
  }
}

module.exports = {
  calculateMetrics,
  analyzeComponentLoading,
  analyzeResourceLoading,
  calculateTTest,
  processDataset
};