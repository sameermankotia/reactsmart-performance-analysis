/**
 * bootstrap.js
 * 
 * Implementation of bootstrap confidence interval calculation methods
 * for statistical analysis of ReactSmart performance data.
 * 
 * This module provides tools for estimating confidence intervals around
 * performance metrics using non-parametric bootstrap resampling techniques.
 */

/**
 * Calculates bootstrap confidence intervals for a sample of data
 * @param {Array<number>} data - The sample data
 * @param {number} iterations - Number of bootstrap iterations (default: 1000)
 * @param {number} alpha - Significance level (default: 0.05 for 95% CI)
 * @param {Function} statistic - Function to calculate the statistic of interest (default: mean)
 * @returns {Object} Object containing the confidence intervals and related statistics
 */
function bootstrapCI(data, iterations = 1000, alpha = 0.05, statistic = calculateMean) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }
  
    // Calculate the observed statistic on the original sample
    const observedStat = statistic(data);
    
    // Generate bootstrap distribution
    const bootstrapDistribution = [];
    for (let i = 0; i < iterations; i++) {
      const resample = getBootstrapSample(data);
      bootstrapDistribution.push(statistic(resample));
    }
    
    // Sort the bootstrap distribution for percentile calculation
    bootstrapDistribution.sort((a, b) => a - b);
    
    // Calculate percentile confidence intervals
    const lowerPercentileIndex = Math.floor((alpha / 2) * iterations);
    const upperPercentileIndex = Math.floor((1 - alpha / 2) * iterations);
    
    const percentileCI = {
      lower: bootstrapDistribution[lowerPercentileIndex],
      upper: bootstrapDistribution[upperPercentileIndex]
    };
    
    // Calculate bias-corrected and accelerated (BCa) confidence intervals if sample size permits
    let bcaCI = null;
    if (data.length >= 20) {
      bcaCI = calculateBCaCI(data, bootstrapDistribution, observedStat, alpha, statistic);
    }
    
    // Calculate standard error from bootstrap distribution
    const bootstrapStdError = calculateStandardDeviation(bootstrapDistribution);
    
    return {
      observed: observedStat,
      percentileCI,
      bcaCI,
      bootstrapSamples: iterations,
      standardError: bootstrapStdError,
      distribution: bootstrapDistribution
    };
  }
  
  /**
   * Generates a bootstrap resample from the original data (sampling with replacement)
   * @param {Array<number>} data - Original data sample
   * @returns {Array<number>} Bootstrap resample of the same size as the original data
   */
  function getBootstrapSample(data) {
    const n = data.length;
    const resample = new Array(n);
    
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * n);
      resample[i] = data[randomIndex];
    }
    
    return resample;
  }
  
  /**
   * Calculates bias-corrected and accelerated (BCa) bootstrap confidence intervals
   * @param {Array<number>} data - Original data sample
   * @param {Array<number>} bootstrapDistribution - Bootstrap distribution of statistic
   * @param {number} observedStat - Observed statistic on original data
   * @param {number} alpha - Significance level
   * @param {Function} statistic - Function to calculate the statistic
   * @returns {Object} BCa confidence interval
   */
  function calculateBCaCI(data, bootstrapDistribution, observedStat, alpha, statistic) {
    const n = data.length;
    const iterations = bootstrapDistribution.length;
    
    // Calculate bias-correction factor z0
    const proportionLessThanObserved = bootstrapDistribution.filter(x => x < observedStat).length / iterations;
    const z0 = probit(proportionLessThanObserved);
    
    // Calculate acceleration factor a
    const jackknifeDist = calculateJackknife(data, statistic);
    const jackknifeMean = calculateMean(jackknifeDist);
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      const diff = jackknifeMean - jackknifeDist[i];
      numerator += Math.pow(diff, 3);
      denominator += Math.pow(diff, 2);
    }
    
    const a = numerator / (6 * Math.pow(denominator, 1.5));
    
    // Calculate adjusted alpha values for BCa intervals
    const alpha1 = alpha / 2;
    const alpha2 = 1 - alpha / 2;
    
    const z1 = probit(alpha1);
    const z2 = probit(alpha2);
    
    const b1 = z0 + (z0 + z1) / (1 - a * (z0 + z1));
    const b2 = z0 + (z0 + z2) / (1 - a * (z0 + z2));
    
    const p1 = cdf(b1);
    const p2 = cdf(b2);
    
    const index1 = Math.floor(p1 * iterations);
    const index2 = Math.floor(p2 * iterations);
    
    // Sort the bootstrap distribution just to be safe
    const sortedDist = [...bootstrapDistribution].sort((a, b) => a - b);
    
    return {
      lower: sortedDist[index1],
      upper: sortedDist[index2],
      z0: z0,
      a: a
    };
  }
  
  /**
   * Calculates jackknife distribution for a statistic
   * @param {Array<number>} data - Original data sample
   * @param {Function} statistic - Function to calculate the statistic
   * @returns {Array<number>} Jackknife distribution
   */
  function calculateJackknife(data, statistic) {
    const n = data.length;
    const jackknife = new Array(n);
    
    for (let i = 0; i < n; i++) {
      // Create a sample with the i-th observation removed
      const leaveOneOut = [...data.slice(0, i), ...data.slice(i + 1)];
      jackknife[i] = statistic(leaveOneOut);
    }
    
    return jackknife;
  }
  
  /**
   * Bootstrap comparison for two samples
   * @param {Array<number>} sample1 - First data sample
   * @param {Array<number>} sample2 - Second data sample
   * @param {number} iterations - Number of bootstrap iterations (default: 1000)
   * @param {number} alpha - Significance level (default: 0.05 for 95% CI)
   * @param {Function} statistic - Function to calculate the statistic of interest (default: mean difference)
   * @returns {Object} Object containing the confidence intervals and p-value
   */
  function bootstrapComparison(sample1, sample2, iterations = 1000, alpha = 0.05, statistic = meanDifference) {
    if (!Array.isArray(sample1) || !Array.isArray(sample2) || sample1.length === 0 || sample2.length === 0) {
      throw new Error('Both samples must be non-empty arrays');
    }
  
    // Calculate observed statistic
    const observedStat = statistic(sample1, sample2);
    
    // Combine samples for permutation testing
    const combinedSample = [...sample1, ...sample2];
    const n1 = sample1.length;
    const n2 = sample2.length;
    
    // Generate bootstrap distribution
    const bootstrapDistribution = [];
    for (let i = 0; i < iterations; i++) {
      const resample1 = getBootstrapSample(sample1);
      const resample2 = getBootstrapSample(sample2);
      bootstrapDistribution.push(statistic(resample1, resample2));
    }
    
    // Sort the bootstrap distribution for percentile calculation
    bootstrapDistribution.sort((a, b) => a - b);
    
    // Calculate percentile confidence intervals
    const lowerPercentileIndex = Math.floor((alpha / 2) * iterations);
    const upperPercentileIndex = Math.floor((1 - alpha / 2) * iterations);
    
    const percentileCI = {
      lower: bootstrapDistribution[lowerPercentileIndex],
      upper: bootstrapDistribution[upperPercentileIndex]
    };
    
    // Calculate permutation p-value
    const permutationDistribution = [];
    for (let i = 0; i < iterations; i++) {
      // Shuffle the combined sample
      shuffleArray(combinedSample);
      
      // Split into two samples of original sizes
      const permSample1 = combinedSample.slice(0, n1);
      const permSample2 = combinedSample.slice(n1, n1 + n2);
      
      // Calculate statistic on permuted samples
      permutationDistribution.push(statistic(permSample1, permSample2));
    }
    
    // Calculate p-value as proportion of permutation statistics as extreme as observed
    const isStatPositive = observedStat > 0;
    let pValue;
    
    if (isStatPositive) {
      pValue = permutationDistribution.filter(x => x >= observedStat).length / iterations;
    } else {
      pValue = permutationDistribution.filter(x => x <= observedStat).length / iterations;
    }
    
    // Calculate effect size (standardized mean difference)
    const effectSize = calculateEffectSize(sample1, sample2);
    
    return {
      observed: observedStat,
      percentileCI,
      pValue,
      effectSize,
      bootstrapSamples: iterations,
      standardError: calculateStandardDeviation(bootstrapDistribution)
    };
  }
  
  /**
   * Calculates mean difference between two samples
   * @param {Array<number>} sample1 - First data sample
   * @param {Array<number>} sample2 - Second data sample
   * @returns {number} Mean difference (sample1 - sample2)
   */
  function meanDifference(sample1, sample2) {
    return calculateMean(sample1) - calculateMean(sample2);
  }
  
  /**
   * Calculates Cohen's d effect size between two samples
   * @param {Array<number>} sample1 - First data sample
   * @param {Array<number>} sample2 - Second data sample
   * @returns {number} Cohen's d effect size
   */
  function calculateEffectSize(sample1, sample2) {
    const mean1 = calculateMean(sample1);
    const mean2 = calculateMean(sample2);
    const sd1 = calculateStandardDeviation(sample1);
    const sd2 = calculateStandardDeviation(sample2);
    
    // Pooled standard deviation
    const n1 = sample1.length;
    const n2 = sample2.length;
    const pooledSD = Math.sqrt(((n1 - 1) * Math.pow(sd1, 2) + (n2 - 1) * Math.pow(sd2, 2)) / (n1 + n2 - 2));
    
    // Cohen's d
    return (mean1 - mean2) / pooledSD;
  }
  
  /**
   * Calculates the mean of an array of numbers
   * @param {Array<number>} data - Array of numeric values
   * @returns {number} Mean value
   */
  function calculateMean(data) {
    return data.reduce((sum, value) => sum + value, 0) / data.length;
  }
  
  /**
   * Calculates the standard deviation of an array of numbers
   * @param {Array<number>} data - Array of numeric values
   * @returns {number} Standard deviation
   */
  function calculateStandardDeviation(data) {
    const mean = calculateMean(data);
    const squaredDiffs = data.map(value => Math.pow(value - mean, 2));
    return Math.sqrt(calculateMean(squaredDiffs));
  }
  
  /**
   * Approximation of the probit function (inverse of standard normal CDF)
   * @param {number} p - Probability (0 < p < 1)
   * @returns {number} Probit value
   */
  function probit(p) {
    if (p <= 0 || p >= 1) {
      throw new Error('Probability must be between 0 and 1 exclusive');
    }
    
    // Constants for Abramowitz and Stegun approximation
    const c = [2.515517, 0.802853, 0.010328];
    const d = [1.432788, 0.189269, 0.001308];
    
    // Determine sign based on which side of 0.5 p falls
    let sign = 1;
    if (p > 0.5) {
      p = 1 - p;
      sign = -1;
    }
    
    // Calculate t
    const t = Math.sqrt(-2 * Math.log(p));
    
    // Abramowitz and Stegun approximation
    const numerator = c[0] + c[1] * t + c[2] * t * t;
    const denominator = 1 + d[0] * t + d[1] * t * t + d[2] * t * t * t;
    
    return sign * (t - numerator / denominator);
  }
  
  /**
   * Standard normal cumulative distribution function
   * @param {number} z - Z-score
   * @returns {number} Cumulative probability
   */
  function cdf(z) {
    // Approximation using the error function
    return 0.5 * (1 + erf(z / Math.sqrt(2)));
  }
  
  /**
   * Error function approximation (Abramowitz and Stegun)
   * @param {number} x - Input value
   * @returns {number} Error function value
   */
  function erf(x) {
    // Constants
    const a = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];
    const p = 0.3275911;
    
    // Save the sign
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    
    // Abramowitz and Stegun formula 7.1.26
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a[4] * t + a[3]) * t + a[2]) * t + a[1]) * t + a[0]) * t * Math.exp(-x * x));
    
    return sign * y;
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
  
  /**
   * Multi-dimension bootstrap for complex metrics
   * @param {Array<Object>} data - Array of objects containing multiple metrics
   * @param {Array<string>} metricKeys - Keys of metrics to bootstrap
   * @param {number} iterations - Number of bootstrap iterations (default: 1000)
   * @param {number} alpha - Significance level (default: 0.05 for 95% CI)
   * @returns {Object} Object containing bootstrap results for each metric
   */
  function multiBootstrap(data, metricKeys, iterations = 1000, alpha = 0.05) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Data must be a non-empty array');
    }
    
    if (!Array.isArray(metricKeys) || metricKeys.length === 0) {
      throw new Error('Metric keys must be a non-empty array');
    }
    
    const results = {};
    
    for (const key of metricKeys) {
      // Extract the specific metric data
      const metricData = data.map(item => item[key]).filter(val => val !== undefined && val !== null);
      
      if (metricData.length === 0) {
        console.warn(`No valid data found for metric ${key}, skipping bootstrap analysis`);
        continue;
      }
      
      // Perform bootstrap analysis on this metric
      results[key] = bootstrapCI(metricData, iterations, alpha);
    }
    
    return results;
  }
  
  /**
   * Stratified bootstrap for grouped data
   * @param {Object} groupedData - Object with arrays of data per group
   * @param {number} iterations - Number of bootstrap iterations (default: 1000)
   * @param {number} alpha - Significance level (default: 0.05 for 95% CI)
   * @param {Function} statistic - Function to calculate the statistic of interest (default: mean)
   * @returns {Object} Object containing bootstrap results for each group
   */
  function stratifiedBootstrap(groupedData, iterations = 1000, alpha = 0.05, statistic = calculateMean) {
    if (typeof groupedData !== 'object' || groupedData === null) {
      throw new Error('Grouped data must be an object');
    }
    
    const results = {};
    
    for (const [group, data] of Object.entries(groupedData)) {
      if (!Array.isArray(data) || data.length === 0) {
        console.warn(`No valid data found for group ${group}, skipping bootstrap analysis`);
        continue;
      }
      
      // Perform bootstrap analysis on this group
      results[group] = bootstrapCI(data, iterations, alpha, statistic);
    }
    
    return results;
  }
  
  module.exports = {
    bootstrapCI,
    bootstrapComparison,
    multiBootstrap,
    stratifiedBootstrap,
    calculateMean,
    calculateStandardDeviation,
    calculateEffectSize
  };