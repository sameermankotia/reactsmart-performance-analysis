/**
 * Data Normalization Utility
 * 
 * Normalizes performance data from various sources to ensure
 * consistency across datasets and enable accurate comparisons.
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const d3 = require('d3-array');

/**
 * Normalize a dataset of performance records
 * @param {Array} data - Array of performance data objects
 * @param {Object} options - Normalization options
 * @returns {Array} - Normalized data
 */
function normalizeDataset(data, options = {}) {
  const {
    removeOutliers = true,
    outlierMethod = 'iqr',
    outlierThreshold = 1.5,
    standardizeMetrics = true,
    standardizeMethod = 'zscore',
    fillMissingValues = true,
    missingValueStrategy = 'mean',
    alignTimestamps = false,
    referenceTimestamp = null
  } = options;
  
  // Validate data
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid or empty dataset');
  }
  
  let normalizedData = [...data];
  
  // Remove outliers if requested
  if (removeOutliers) {
    normalizedData = removeOutliersFromData(normalizedData, outlierMethod, outlierThreshold);
  }
  
  // Fill missing values if requested
  if (fillMissingValues) {
    normalizedData = fillMissingValuesInData(normalizedData, missingValueStrategy);
  }
  
  // Standardize metrics if requested
  if (standardizeMetrics) {
    normalizedData = standardizeMetricsInData(normalizedData, standardizeMethod);
  }
  
  // Align timestamps if requested
  if (alignTimestamps && referenceTimestamp) {
    normalizedData = alignTimestampsInData(normalizedData, referenceTimestamp);
  }
  
  return normalizedData;
}

/**
 * Remove outliers from performance data
 * @param {Array} data - Performance data
 * @param {string} method - Outlier detection method ('iqr', 'zscore', 'percentile')
 * @param {number} threshold - Threshold for outlier detection
 * @returns {Array} - Data with outliers removed
 */
function removeOutliersFromData(data, method, threshold) {
  // Collect all metric names
  const metricNames = new Set();
  data.forEach(item => {
    if (item.metrics) {
      Object.keys(item.metrics).forEach(key => {
        if (typeof item.metrics[key] === 'number') {
          metricNames.add(key);
        }
      });
    }
  });
  
  // Process each metric
  const metricOutliers = {};
  
  metricNames.forEach(metric => {
    // Extract values for this metric
    const values = data
      .map(item => item.metrics && item.metrics[metric])
      .filter(val => typeof val === 'number');
    
    // Skip if insufficient data
    if (values.length < 5) return;
    
    // Detect outliers based on specified method
    let outlierIndices;
    
    switch (method) {
      case 'iqr':
        outlierIndices = detectOutliersIQR(values, threshold);
        break;
      case 'zscore':
        outlierIndices = detectOutliersZScore(values, threshold);
        break;
      case 'percentile':
        outlierIndices = detectOutliersPercentile(values, threshold);
        break;
      default:
        outlierIndices = detectOutliersIQR(values, threshold);
    }
    
    // Record outlier indices for this metric
    metricOutliers[metric] = outlierIndices;
  });
  
  // Create a set of indices to remove (data points that are outliers in multiple metrics)
  const indicesToRemove = new Set();
  
  // Count how many times each data point is an outlier
  const outlierCounts = new Array(data.length).fill(0);
  
  Object.values(metricOutliers).forEach(indices => {
    indices.forEach(index => {
      outlierCounts[index]++;
    });
  });
  
  // Remove data points that are outliers in at least 2 metrics
  outlierCounts.forEach((count, index) => {
    if (count >= 2) {
      indicesToRemove.add(index);
    }
  });
  
  // Filter out outliers
  return data.filter((_, index) => !indicesToRemove.has(index));
}

/**
 * Detect outliers using Interquartile Range (IQR) method
 * @param {Array} values - Numeric values
 * @param {number} threshold - IQR multiplier threshold
 * @returns {Array} - Indices of outliers
 */
function detectOutliersIQR(values, threshold) {
  // Calculate quartiles
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = d3.quantile(sorted, 0.25);
  const q3 = d3.quantile(sorted, 0.75);
  const iqr = q3 - q1;
  
  // Define outlier bounds
  const lowerBound = q1 - threshold * iqr;
  const upperBound = q3 + threshold * iqr;
  
  // Find outliers
  return values
    .map((val, index) => (val < lowerBound || val > upperBound) ? index : -1)
    .filter(index => index !== -1);
}

/**
 * Detect outliers using Z-Score method
 * @param {Array} values - Numeric values
 * @param {number} threshold - Z-score threshold
 * @returns {Array} - Indices of outliers
 */
function detectOutliersZScore(values, threshold) {
  const mean = d3.mean(values);
  const std = d3.deviation(values);
  
  if (std === 0) return []; // No variation, no outliers
  
  // Find outliers
  return values
    .map((val, index) => (Math.abs((val - mean) / std) > threshold) ? index : -1)
    .filter(index => index !== -1);
}

/**
 * Detect outliers using Percentile method
 * @param {Array} values - Numeric values
 * @param {number} threshold - Percentile threshold (0-0.5)
 * @returns {Array} - Indices of outliers
 */
function detectOutliersPercentile(values, threshold) {
  // Ensure threshold is within valid range
  const validThreshold = Math.max(0, Math.min(threshold, 0.5));
  
  // Calculate percentile bounds
  const lowerBound = d3.quantile(values, validThreshold);
  const upperBound = d3.quantile(values, 1 - validThreshold);
  
  // Find outliers
  return values
    .map((val, index) => (val < lowerBound || val > upperBound) ? index : -1)
    .filter(index => index !== -1);
}

/**
 * Fill missing values in performance data
 * @param {Array} data - Performance data
 * @param {string} strategy - Strategy for filling missing values ('mean', 'median', 'zero', 'previous')
 * @returns {Array} - Data with missing values filled
 */
function fillMissingValuesInData(data, strategy) {
  // Collect all metric names
  const metricNames = new Set();
  data.forEach(item => {
    if (item.metrics) {
      Object.keys(item.metrics).forEach(key => {
        if (typeof item.metrics[key] === 'number') {
          metricNames.add(key);
        }
      });
    }
  });
  
  // Calculate representative values for each metric
  const metricValues = {};
  
  metricNames.forEach(metric => {
    // Extract values for this metric
    const values = data
      .map(item => item.metrics && item.metrics[metric])
      .filter(val => typeof val === 'number');
    
    // Skip if no values
    if (values.length === 0) return;
    
    // Calculate representative value based on strategy
    let representativeValue;
    
    switch (strategy) {
      case 'mean':
        representativeValue = d3.mean(values);
        break;
      case 'median':
        representativeValue = d3.median(values);
        break;
      case 'zero':
        representativeValue = 0;
        break;
      default:
        representativeValue = d3.mean(values);
    }
    
    metricValues[metric] = representativeValue;
  });
  
  // Fill missing values
  return data.map(item => {
    if (!item.metrics) {
      item.metrics = {};
    }
    
    // Fill missing metrics
    metricNames.forEach(metric => {
      if (item.metrics[metric] === undefined || 
          item.metrics[metric] === null || 
          Number.isNaN(item.metrics[metric])) {
        item.metrics[metric] = metricValues[metric];
      }
    });
    
    return item;
  });
}

/**
 * Standardize metrics in performance data
 * @param {Array} data - Performance data
 * @param {string} method - Standardization method ('zscore', 'minmax', 'robust')
 * @returns {Array} - Data with standardized metrics
 */
function standardizeMetricsInData(data, method) {
  // Collect all metric names
  const metricNames = new Set();
  data.forEach(item => {
    if (item.metrics) {
      Object.keys(item.metrics).forEach(key => {
        if (typeof item.metrics[key] === 'number') {
          metricNames.add(key);
        }
      });
    }
  });
  
  // Process each metric
  const standardizationParams = {};
  
  metricNames.forEach(metric => {
    // Extract values for this metric
    const values = data
      .map(item => item.metrics && item.metrics[metric])
      .filter(val => typeof val === 'number');
    
    // Skip if insufficient data
    if (values.length < 2) return;
    
    // Calculate standardization parameters based on method
    let params;
    
    switch (method) {
      case 'zscore':
        params = {
          mean: d3.mean(values),
          std: d3.deviation(values)
        };
        break;
      case 'minmax':
        params = {
          min: d3.min(values),
          max: d3.max(values)
        };
        break;
      case 'robust':
        params = {
          median: d3.median(values),
          iqr: d3.quantile(values, 0.75) - d3.quantile(values, 0.25)
        };
        break;
      default:
        params = {
          mean: d3.mean(values),
          std: d3.deviation(values)
        };
    }
    
    standardizationParams[metric] = params;
  });
  
  // Apply standardization
  return data.map(item => {
    if (!item.metrics) return item;
    
    const standardizedMetrics = { ...item.metrics };
    
    // Store original metrics for reference
    item.originalMetrics = { ...item.metrics };
    
    // Standardize each metric
    metricNames.forEach(metric => {
      if (typeof item.metrics[metric] !== 'number') return;
      
      const params = standardizationParams[metric];
      if (!params) return;
      
      let standardizedValue;
      
      switch (method) {
        case 'zscore':
          // Skip if standard deviation is 0
          if (params.std === 0) {
            standardizedValue = 0;
          } else {
            standardizedValue = (item.metrics[metric] - params.mean) / params.std;
          }
          break;
        case 'minmax':
          // Skip if min equals max
          if (params.min === params.max) {
            standardizedValue = 0.5;
          } else {
            standardizedValue = (item.metrics[metric] - params.min) / (params.max - params.min);
          }
          break;
        case 'robust':
          // Skip if IQR is 0
          if (params.iqr === 0) {
            standardizedValue = 0;
          } else {
            standardizedValue = (item.metrics[metric] - params.median) / params.iqr;
          }
          break;
        default:
          standardizedValue = item.metrics[metric];
      }
      
      standardizedMetrics[metric] = standardizedValue;
    });
    
    item.metrics = standardizedMetrics;
    return item;
  });
}

/**
 * Align timestamps in performance data
 * @param {Array} data - Performance data
 * @param {number} referenceTimestamp - Reference timestamp for alignment
 * @returns {Array} - Data with aligned timestamps
 */
function alignTimestampsInData(data, referenceTimestamp) {
  // Parse reference timestamp if it's a string
  const refTimestamp = typeof referenceTimestamp === 'string' 
    ? new Date(referenceTimestamp).getTime() 
    : referenceTimestamp;
  
  return data.map(item => {
    if (!item.metadata || !item.metadata.datetime) return item;
    
    // Parse item timestamp
    const itemTimestamp = new Date(item.metadata.datetime).getTime();
    
    // Calculate time difference in milliseconds
    const timeDiff = itemTimestamp - refTimestamp;
    
    // Store original timestamp
    item.metadata.originalDatetime = item.metadata.datetime;
    
    // Update timestamp and add time difference
    item.metadata.datetime = new Date(refTimestamp).toISOString();
    item.metadata.timeOffset = timeDiff;
    
    return item;
  });
}

/**
 * Normalize metrics to ensure consistency across different sources
 * @param {Array} data - Performance data
 * @returns {Array} - Data with normalized metric units
 */
function normalizeMetricUnits(data) {
  return data.map(item => {
    if (!item.metrics) return item;
    
    const metrics = { ...item.metrics };
    
    // Store original metrics for reference
    item.originalMetrics = { ...item.metrics };
    
    // Normalize time-based metrics to milliseconds
    ['initialLoad', 'ttfb', 'fcp', 'lcp', 'tti', 'tbt', 'fid'].forEach(metricName => {
      if (typeof metrics[metricName] === 'number') {
        // If value is very small (likely in seconds), convert to ms
        if (metrics[metricName] > 0 && metrics[metricName] < 60) {
          metrics[metricName] *= 1000;
        }
      }
    });
    
    // Normalize layout shift to be between 0 and 1
    if (typeof metrics.cls === 'number') {
      if (metrics.cls > 1) {
        metrics.cls /= 100;
      }
    }
    
    // Normalize accuracy metrics to percentages (0-100)
    ['predictionAccuracy', 'hitRate'].forEach(metricName => {
      if (typeof metrics[metricName] === 'number') {
        if (metrics[metricName] <= 1) {
          metrics[metricName] *= 100;
        }
      }
    });
    
    item.metrics = metrics;
    return item;
  });
}

/**
 * Create a unified schema for performance data from different sources
 * @param {Array} data - Performance data
 * @returns {Array} - Data with unified schema
 */
function unifyDataSchema(data) {
  // Define standard schema
  const standardSchema = {
    metadata: {
      source: null,
      url: null,
      datetime: null,
      browser: null,
      device: null,
      network: null,
      sessionId: null,
      optimizationEnabled: null
    },
    metrics: {
      initialLoad: null,
      ttfb: null,
      fcp: null,
      lcp: null,
      cls: null,
      tbt: null,
      fid: null,
      tti: null,
      predictionAccuracy: null,
      preloadedCount: null,
      usedPreloadedCount: null,
      hitRate: null,
      networkSavingsKB: null
    },
    resources: [],
    components: []
  };
  
  return data.map(item => {
    // Create a new object with standard schema
    const unified = {
      metadata: { ...standardSchema.metadata },
      metrics: { ...standardSchema.metrics },
      resources: [],
      components: []
    };
    
    // Copy metadata
    if (item.metadata) {
      Object.keys(standardSchema.metadata).forEach(key => {
        if (item.metadata[key] !== undefined) {
          unified.metadata[key] = item.metadata[key];
        }
      });
    }
    
    // Copy metrics
    if (item.metrics) {
      Object.keys(standardSchema.metrics).forEach(key => {
        if (item.metrics[key] !== undefined) {
          unified.metrics[key] = item.metrics[key];
        }
      });
    }
    
    // Copy resources
    if (item.resources && Array.isArray(item.resources)) {
      unified.resources = [...item.resources];
    }
    
    // Copy components
    if (item.components && Array.isArray(item.components)) {
      unified.components = [...item.components];
    }
    
    return unified;
  });
}

/**
 * Process a dataset and normalize it
 * @param {string} inputPath - Path to input data file
 * @param {string} outputPath - Path to output normalized data
 * @param {Object} options - Normalization options
 */
async function normalizeDataFile(inputPath, outputPath, options = {}) {
  try {
    // Read input data
    const data = JSON.parse(await readFile(inputPath, 'utf8'));
    
    // Normalize data
    let normalizedData = data;
    
    // Normalize metric units
    normalizedData = normalizeMetricUnits(normalizedData);
    
    // Unify schema
    normalizedData = unifyDataSchema(normalizedData);
    
    // Apply general normalization
    normalizedData = normalizeDataset(normalizedData, options);
    
    // Save normalized data
    await writeFile(outputPath, JSON.stringify(normalizedData, null, 2));
    console.log(`Data normalized and saved to ${outputPath}`);
    
    return normalizedData;
  } catch (error) {
    console.error('Error normalizing data file:', error);
    throw error;
  }
}

/**
 * Apply metadata normalization to ensure consistency
 * @param {Array} data - Performance data
 * @returns {Array} - Data with normalized metadata
 */
function normalizeMetadata(data) {
  // Normalize browser names
  const browserMapping = {
    'chrome': 'Chrome',
    'google chrome': 'Chrome',
    'googlechrome': 'Chrome',
    'firefox': 'Firefox',
    'mozilla firefox': 'Firefox',
    'mozillafirefox': 'Firefox',
    'safari': 'Safari',
    'edge': 'Edge',
    'microsoft edge': 'Edge',
    'microsoftedge': 'Edge',
    'opera': 'Opera'
  };
  
  // Normalize device categories
  const deviceMapping = {
    'desktop': 'Desktop',
    'pc': 'Desktop',
    'laptop': 'Desktop',
    'mobile': 'Mobile',
    'phone': 'Mobile',
    'smartphone': 'Mobile',
    'iphone': 'Mobile',
    'android': 'Mobile',
    'tablet': 'Tablet',
    'ipad': 'Tablet'
  };
  
  // Normalize network conditions
  const networkMapping = {
    'wifi': 'WiFi',
    'wi-fi': 'WiFi',
    'ethernet': 'Ethernet',
    'lan': 'Ethernet',
    '4g': '4G',
    'lte': '4G',
    '3g': '3G',
    '2g': '2G',
    'slow': 'Slow',
    'fast': 'Fast',
    'average': 'Average'
  };
  
  return data.map(item => {
    if (!item.metadata) return item;
    
    const metadata = { ...item.metadata };
    
    // Normalize browser
    if (metadata.browser) {
      const lowerBrowser = metadata.browser.toLowerCase();
      Object.entries(browserMapping).forEach(([key, value]) => {
        if (lowerBrowser.includes(key)) {
          metadata.browser = value;
        }
      });
    }
    
    // Normalize device
    if (metadata.device) {
      const lowerDevice = metadata.device.toLowerCase();
      Object.entries(deviceMapping).forEach(([key, value]) => {
        if (lowerDevice.includes(key)) {
          metadata.device = value;
        }
      });
    }
    
    // Normalize network
    if (metadata.network) {
      const lowerNetwork = metadata.network.toLowerCase();
      Object.entries(networkMapping).forEach(([key, value]) => {
        if (lowerNetwork.includes(key)) {
          metadata.network = value;
        }
      });
    }
    
    // Normalize optimization flag to boolean
    if (metadata.optimizationEnabled !== null && metadata.optimizationEnabled !== undefined) {
      if (typeof metadata.optimizationEnabled === 'string') {
        metadata.optimizationEnabled = 
          metadata.optimizationEnabled.toLowerCase() === 'true' ||
          metadata.optimizationEnabled === '1' ||
          metadata.optimizationEnabled.toLowerCase() === 'yes';
      } else if (typeof metadata.optimizationEnabled === 'number') {
        metadata.optimizationEnabled = metadata.optimizationEnabled === 1;
      }
    }
    
    item.metadata = metadata;
    return item;
  });
}

module.exports = {
  normalizeDataset,
  normalizeMetricUnits,
  unifyDataSchema,
  normalizeMetadata,
  normalizeDataFile,
  removeOutliersFromData,
  fillMissingValuesInData,
  standardizeMetricsInData
};