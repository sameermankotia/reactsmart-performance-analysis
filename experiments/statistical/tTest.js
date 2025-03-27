/**
 * tTest.js
 * 
 * Implementation of t-test statistical methods for analyzing ReactSmart performance data.
 * This module provides functions for performing various types of t-tests to compare
 * performance metrics between experimental conditions.
 */

/**
 * Performs an independent samples t-test to compare means of two groups
 * @param {Array<number>}

/**
 * Approximation of the inverse normal cumulative distribution function
 * @param {number} p - Probability (0 < p < 1)
 * @returns {number} Z value at the given probability
 */
function inverseNormalCDF(p) {
    if (p <= 0 || p >= 1) {
      throw new Error('Probability must be between 0 and 1 exclusive');
    }
    
    // Rational approximation for the normal quantile function
    let q, r;
    
    if (p < 0.5) {
      // F^-1(p) = -G^-1(p)
      q = Math.sqrt(-2 * Math.log(p));
    } else {
      // F^-1(p) = G^-1(1-p)
      q = Math.sqrt(-2 * Math.log(1 - p));
    }
    
    // Coefficients from Abramowitz and Stegun 26.2.23
    const c = [2.515517, 0.802853, 0.010328];
    const d = [1.432788, 0.189269, 0.001308];
    
    r = q - ((c[2] * q + c[1]) * q + c[0]) / (((d[2] * q + d[1]) * q + d[0]) * q + 1.0);
    
    if (p < 0.5) {
      return -r;
    } else {
      return r;
    }
  }
  
  /**
   * Generates a human-readable report of t-test results
   * @param {Object} results - Results from any t-test function
   * @returns {string} Human-readable report
   */
  function formatTTestResults(results) {
    // Helper function for rounding numbers
    const round = (num, places = 4) => Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
    
    let report = '';
    
    if (results.testType) {
      report += `Test Type: ${results.testType}\n`;
    }
    
    report += `t-statistic: ${round(results.t)}\n`;
    report += `Degrees of freedom: ${round(results.df)}\n`;
    report += `p-value: ${round(results.pValue)}${results.pValue < 0.001 ? ' (p < 0.001)' : ''}\n`;
    
    if (results.mean1 !== undefined && results.mean2 !== undefined) {
      report += `\nDescriptive Statistics:\n`;
      report += `Group 1: Mean = ${round(results.mean1)}, SD = ${round(results.sd1)}, n = ${results.n1}\n`;
      report += `Group 2: Mean = ${round(results.mean2)}, SD = ${round(results.sd2)}, n = ${results.n2}\n`;
    }
    
    if (results.meanDifference !== undefined) {
      report += `\nMean Difference: ${round(results.meanDifference)}`;
      
      if (results.confidenceInterval) {
        const ci = results.confidenceInterval;
        report += ` (${ci.level * 100}% CI: ${round(ci.lower)} to ${round(ci.upper)})\n`;
      } else {
        report += '\n';
      }
    }
    
    if (results.effectSize !== undefined) {
      report += `\nEffect Size:\n`;
      report += `Cohen's d: ${round(results.effectSize)} (${results.effectSizeInterpretation})\n`;
    }
    
    report += `\nResult: ${results.significant ? 'Statistically significant' : 'Not statistically significant'} at α = 0.05\n`;
    
    return report;
  }
  
  module.exports = {
    independentTTest,
    pairedTTest,
    oneSampleTTest,
    welchAnova,
    pairwiseTTests,
    robustTTest,
    formatTTestResults,
    calculateMean,
    calculateVariance,
    interpretCohensD,
    interpretEtaSquared
  }; group1 - Data values for first group
   /*
   * @param {Array<number>} group2 - Data values for second group
   * @param {Object} options - Test options
   * @param {boolean} options.equalVariance - Whether to assume equal variances (default: false)
   * @param {boolean} options.twoSided - Whether to use two-sided test (default: true)
   * @returns {Object} Results of t-test including p-value and effect size
   */
function independentTTest(group1, group2, options = {}) {
    const { 
      equalVariance = false, 
      twoSided = true 
    } = options;
  
    if (!Array.isArray(group1) || !Array.isArray(group2) || group1.length === 0 || group2.length === 0) {
      throw new Error('Both groups must be non-empty arrays');
    }
  
    // Calculate basic statistics
    const n1 = group1.length;
    const n2 = group2.length;
    const mean1 = calculateMean(group1);
    const mean2 = calculateMean(group2);
    const var1 = calculateVariance(group1);
    const var2 = calculateVariance(group2);
    const diff = mean1 - mean2;
  
    let tStat, df, pValue;
  
    if (equalVariance) {
      // Pooled variance t-test (Student's t-test)
      const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
      const se = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
      tStat = diff / se;
      df = n1 + n2 - 2;
    } else {
      // Welch's t-test (unequal variances)
      const se = Math.sqrt(var1 / n1 + var2 / n2);
      tStat = diff / se;
      // Welch-Satterthwaite approximation for degrees of freedom
      const numerator = Math.pow(var1 / n1 + var2 / n2, 2);
      const denominator = Math.pow(var1 / n1, 2) / (n1 - 1) + Math.pow(var2 / n2, 2) / (n2 - 1);
      df = numerator / denominator;
    }
  
    // Calculate p-value
    pValue = twoSided ? 
      2 * (1 - cumulativeStudentT(Math.abs(tStat), df)) : 
      (diff > 0 ? 1 - cumulativeStudentT(tStat, df) : cumulativeStudentT(tStat, df));
  
    // Calculate effect size (Cohen's d)
    let cohensD;
    if (equalVariance) {
      // Pooled standard deviation
      const pooledSD = Math.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2));
      cohensD = diff / pooledSD;
    } else {
      // Use average standard deviation (less common, but simple approach)
      const avgSD = Math.sqrt((var1 + var2) / 2);
      cohensD = diff / avgSD;
    }
  
    return {
      t: tStat,
      df: df,
      pValue: pValue,
      mean1: mean1,
      mean2: mean2,
      meanDifference: diff,
      sd1: Math.sqrt(var1),
      sd2: Math.sqrt(var2),
      n1: n1,
      n2: n2,
      effectSize: cohensD,
      effectSizeInterpretation: interpretCohensD(cohensD),
      significant: pValue < 0.05,
      equalVarianceAssumed: equalVariance,
      testType: equalVariance ? "Student's t-test" : "Welch's t-test",
      confidenceInterval: calculateConfidenceInterval(diff, tStat, df, equalVariance, var1, var2, n1, n2)
    };
  }
  
  /**
   * Performs a paired samples t-test for related measurements
   * @param {Array<number>} before - Data values before treatment
   * @param {Array<number>} after - Data values after treatment
   * @param {Object} options - Test options
   * @param {boolean} options.twoSided - Whether to use two-sided test (default: true)
   * @returns {Object} Results of paired t-test including p-value and effect size
   */
  function pairedTTest(before, after, options = {}) {
    const { twoSided = true } = options;
  
    if (!Array.isArray(before) || !Array.isArray(after) || 
        before.length === 0 || after.length === 0 || 
        before.length !== after.length) {
      throw new Error('Both groups must be non-empty arrays of equal length');
    }
  
    // Calculate paired differences
    const differences = before.map((val, i) => after[i] - val);
    
    // Basic statistics on differences
    const n = differences.length;
    const meanDiff = calculateMean(differences);
    const varDiff = calculateVariance(differences);
    const seDiff = Math.sqrt(varDiff / n);
    
    // Calculate t-statistic
    const tStat = meanDiff / seDiff;
    const df = n - 1;
    
    // Calculate p-value
    const pValue = twoSided ? 
      2 * (1 - cumulativeStudentT(Math.abs(tStat), df)) : 
      (meanDiff > 0 ? 1 - cumulativeStudentT(tStat, df) : cumulativeStudentT(tStat, df));
    
    // Calculate effect size (Cohen's d for paired samples)
    const sdDiff = Math.sqrt(varDiff);
    const cohensD = meanDiff / sdDiff;
    
    // Calculate 95% confidence interval
    const t_critical = quantileStudentT(0.975, df); // 95% CI
    const ciLower = meanDiff - t_critical * seDiff;
    const ciUpper = meanDiff + t_critical * seDiff;
    
    return {
      t: tStat,
      df: df,
      pValue: pValue,
      meanDifference: meanDiff,
      standardErrorDifference: seDiff,
      standardDeviationDifference: sdDiff,
      n: n,
      effectSize: cohensD,
      effectSizeInterpretation: interpretCohensD(cohensD),
      significant: pValue < 0.05,
      confidenceInterval: {
        lower: ciLower,
        upper: ciUpper,
        level: 0.95
      }
    };
  }
  
  /**
   * Performs a one-sample t-test to compare a sample mean to a known value
   * @param {Array<number>} sample - Data values for the sample
   * @param {number} populationMean - Known or hypothesized population mean
   * @param {Object} options - Test options
   * @param {boolean} options.twoSided - Whether to use two-sided test (default: true)
   * @returns {Object} Results of one-sample t-test including p-value and effect size
   */
  function oneSampleTTest(sample, populationMean, options = {}) {
    const { twoSided = true } = options;
  
    if (!Array.isArray(sample) || sample.length === 0) {
      throw new Error('Sample must be a non-empty array');
    }
  
    if (typeof populationMean !== 'number') {
      throw new Error('Population mean must be a number');
    }
  
    // Calculate basic statistics
    const n = sample.length;
    const mean = calculateMean(sample);
    const variance = calculateVariance(sample);
    const sd = Math.sqrt(variance);
    const se = sd / Math.sqrt(n);
    const diff = mean - populationMean;
    
    // Calculate t-statistic
    const tStat = diff / se;
    const df = n - 1;
    
    // Calculate p-value
    const pValue = twoSided ? 
      2 * (1 - cumulativeStudentT(Math.abs(tStat), df)) : 
      (diff > 0 ? 1 - cumulativeStudentT(tStat, df) : cumulativeStudentT(tStat, df));
    
    // Calculate effect size (Cohen's d for one-sample test)
    const cohensD = diff / sd;
    
    // Calculate 95% confidence interval
    const t_critical = quantileStudentT(0.975, df); // 95% CI
    const ciLower = mean - t_critical * se;
    const ciUpper = mean + t_critical * se;
    
    return {
      t: tStat,
      df: df,
      pValue: pValue,
      sampleMean: mean,
      populationMean: populationMean,
      meanDifference: diff,
      standardDeviation: sd,
      standardError: se,
      n: n,
      effectSize: cohensD,
      effectSizeInterpretation: interpretCohensD(cohensD),
      significant: pValue < 0.05,
      confidenceInterval: {
        lower: ciLower,
        upper: ciUpper,
        level: 0.95
      }
    };
  }
  
  /**
   * Performs Welch's ANOVA (for groups with unequal variances)
   * @param {Array<Array<number>>} groups - Array of arrays containing data for each group
   * @returns {Object} Results of Welch's ANOVA
   */
  function welchAnova(groups) {
    if (!Array.isArray(groups) || groups.length < 2) {
      throw new Error('At least two groups must be provided');
    }
  
    for (const group of groups) {
      if (!Array.isArray(group) || group.length === 0) {
        throw new Error('Each group must be a non-empty array');
      }
    }
  
    // Calculate basic statistics for each group
    const groupStats = groups.map(group => ({
      n: group.length,
      mean: calculateMean(group),
      variance: calculateVariance(group)
    }));
  
    // Calculate weights
    const weights = groupStats.map(stats => stats.n / stats.variance);
    const sumWeights = weights.reduce((sum, w) => sum + w, 0);
    
    // Calculate grand mean (weighted)
    const grandMean = groupStats.reduce((sum, stats, i) => 
      sum + weights[i] * stats.mean, 0) / sumWeights;
  
    // Calculate between-groups sum of squares
    const ssb = groupStats.reduce((sum, stats, i) => 
      sum + weights[i] * Math.pow(stats.mean - grandMean, 2), 0);
  
    // Calculate F statistic approximation
    const k = groups.length;
    const f = (k - 1) * ssb / (k * k - 1);
  
    // Calculate adjusted degrees of freedom
    let sumLambdaSquared = 0;
    let sumLambda = 0;
    
    for (let i = 0; i < k; i++) {
      const lambda = Math.pow(1 - weights[i] / sumWeights, 2) / (groupStats[i].n - 1);
      sumLambdaSquared += lambda;
      sumLambda += lambda / (groupStats[i].n - 1);
    }
    
    const df1 = k - 1;
    const df2 = 1 / (3 * sumLambdaSquared / (k * k - 1));
    
    // Calculate p-value (using F distribution approximation)
    const pValue = 1 - cumulativeFDistribution(f, df1, df2);
    
    // Calculate effect size (eta-squared)
    const etaSquared = ssb / (ssb + groupStats.reduce((sum, stats) => 
      sum + stats.variance * (stats.n - 1), 0));
    
    return {
      f: f,
      df1: df1,
      df2: df2,
      pValue: pValue,
      etaSquared: etaSquared,
      etaSquaredInterpretation: interpretEtaSquared(etaSquared),
      significant: pValue < 0.05,
      groupStats: groupStats.map(stats => ({
        n: stats.n,
        mean: stats.mean,
        sd: Math.sqrt(stats.variance)
      }))
    };
  }
  
  /**
   * Conducts pairwise t-tests with correction for multiple comparisons
   * @param {Array<Array<number>>} groups - Array of arrays containing data for each group
   * @param {Array<string>} groupNames - Names for each group (optional)
   * @param {Object} options - Test options
   * @param {string} options.correction - Multiple comparison correction method ('none', 'bonferroni', 'holm') (default: 'bonferroni')
   * @param {boolean} options.equalVariance - Whether to assume equal variances (default: false)
   * @returns {Array<Object>} Results of all pairwise comparisons
   */
  function pairwiseTTests(groups, groupNames = null, options = {}) {
    const { 
      correction = 'bonferroni', 
      equalVariance = false 
    } = options;
  
    if (!Array.isArray(groups) || groups.length < 2) {
      throw new Error('At least two groups must be provided');
    }
  
    for (const group of groups) {
      if (!Array.isArray(group) || group.length === 0) {
        throw new Error('Each group must be a non-empty array');
      }
    }
  
    // Generate names if not provided
    const names = groupNames || groups.map((_, i) => `Group ${i + 1}`);
    
    if (names.length !== groups.length) {
      throw new Error('Number of group names must match number of groups');
    }
  
    // Perform all pairwise comparisons
    const comparisons = [];
    
    for (let i = 0; i < groups.length - 1; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const result = independentTTest(groups[i], groups[j], { equalVariance, twoSided: true });
        
        comparisons.push({
          group1: names[i],
          group2: names[j],
          ...result,
          adjustedPValue: null // Will be filled in after correction
        });
      }
    }
    
    // Apply multiple comparison correction
    if (correction === 'none') {
      // No correction
      comparisons.forEach(comp => {
        comp.adjustedPValue = comp.pValue;
      });
    } else if (correction === 'bonferroni') {
      // Bonferroni correction
      const n = comparisons.length;
      comparisons.forEach(comp => {
        comp.adjustedPValue = Math.min(comp.pValue * n, 1);
      });
    } else if (correction === 'holm') {
      // Holm-Bonferroni correction
      const n = comparisons.length;
      
      // Sort by p-value (ascending)
      comparisons.sort((a, b) => a.pValue - b.pValue);
      
      // Apply sequential correction
      for (let i = 0; i < n; i++) {
        // Adjusted p-value is min of 1 and (n-i) * p
        comparisons[i].adjustedPValue = Math.min(1, comparisons[i].pValue * (n - i));
        
        // Ensure monotonicity
        if (i > 0 && comparisons[i].adjustedPValue < comparisons[i-1].adjustedPValue) {
          comparisons[i].adjustedPValue = comparisons[i-1].adjustedPValue;
        }
      }
      
      // Resort by group names to restore original order
      comparisons.sort((a, b) => {
        if (a.group1 !== b.group1) return a.group1.localeCompare(b.group1);
        return a.group2.localeCompare(b.group2);
      });
    } else {
      throw new Error(`Unsupported correction method: ${correction}`);
    }
    
    // Update significance based on adjusted p-values
    comparisons.forEach(comp => {
      comp.significant = comp.adjustedPValue < 0.05;
    });
    
    return comparisons;
  }
  
  /**
   * Performs a robust t-test using bootstrapping (useful for non-normal data)
   * @param {Array<number>} group1 - Data values for first group
   * @param {Array<number>} group2 - Data values for second group
   * @param {Object} options - Test options
   * @param {number} options.iterations - Number of bootstrap iterations (default: 10000)
   * @param {boolean} options.twoSided - Whether to use two-sided test (default: true)
   * @returns {Object} Results of robust t-test
   */
  function robustTTest(group1, group2, options = {}) {
    const { 
      iterations = 10000, 
      twoSided = true 
    } = options;
  
    if (!Array.isArray(group1) || !Array.isArray(group2) || group1.length === 0 || group2.length === 0) {
      throw new Error('Both groups must be non-empty arrays');
    }
  
    // Calculate observed difference in means
    const mean1 = calculateMean(group1);
    const mean2 = calculateMean(group2);
    const observedDiff = mean1 - mean2;
    
    // Combine groups for permutation test
    const combined = [...group1, ...group2];
    const n1 = group1.length;
    const n2 = group2.length;
    
    // Perform bootstrap permutation test
    let count = 0;
    
    for (let i = 0; i < iterations; i++) {
      // Randomly shuffle combined data
      shuffleArray(combined);
      
      // Split into two groups of original sizes
      const permGroup1 = combined.slice(0, n1);
      const permGroup2 = combined.slice(n1, n1 + n2);
      
      // Calculate mean difference in permuted data
      const permMean1 = calculateMean(permGroup1);
      const permMean2 = calculateMean(permGroup2);
      const permDiff = permMean1 - permMean2;
      
      // Count instances where permuted difference is as extreme as observed
      if (twoSided) {
        if (Math.abs(permDiff) >= Math.abs(observedDiff)) {
          count++;
        }
      } else {
        if ((observedDiff > 0 && permDiff >= observedDiff) || 
            (observedDiff < 0 && permDiff <= observedDiff)) {
          count++;
        }
      }
    }
    
    // Calculate p-value
    const pValue = count / iterations;
    
    // Calculate traditional t-test for comparison
    const traditionalTest = independentTTest(group1, group2, { 
      equalVariance: false, 
      twoSided 
    });
    
    // Calculate bootstrap confidence interval
    const bootDiffs = [];
    
    for (let i = 0; i < iterations; i++) {
      // Resample with replacement
      const resample1 = resampleWithReplacement(group1);
      const resample2 = resampleWithReplacement(group2);
      
      // Calculate mean difference
      const resampleMean1 = calculateMean(resample1);
      const resampleMean2 = calculateMean(resample2);
      bootDiffs.push(resampleMean1 - resampleMean2);
    }
    
    // Sort bootstrap differences for percentile CI
    bootDiffs.sort((a, b) => a - b);
    
    // 95% confidence interval
    const lower = bootDiffs[Math.floor(0.025 * iterations)];
    const upper = bootDiffs[Math.floor(0.975 * iterations)];
    
    return {
      observedDifference: observedDiff,
      bootstrapPValue: pValue,
      iterations: iterations,
      traditionalTTest: traditionalTest,
      significant: pValue < 0.05,
      confidenceInterval: {
        lower,
        upper,
        level: 0.95
      },
      effectSize: traditionalTest.effectSize,
      effectSizeInterpretation: traditionalTest.effectSizeInterpretation
    };
  }
  
  /**
   * Calculates confidence interval for the difference in means
   * @param {number} diff - Observed difference in means
   * @param {number} tStat - t statistic
   * @param {number} df - Degrees of freedom
   * @param {boolean} equalVariance - Whether equal variances were assumed
   * @param {number} var1 - Variance of first group
   * @param {number} var2 - Variance of second group
   * @param {number} n1 - Size of first group
   * @param {number} n2 - Size of second group
   * @returns {Object} Confidence interval
   */
  function calculateConfidenceInterval(diff, tStat, df, equalVariance, var1, var2, n1, n2) {
    // Critical t-value for 95% confidence level
    const criticalT = quantileStudentT(0.975, df);
    
    let se;
    
    if (equalVariance) {
      // Pooled standard error
      const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
      se = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));
    } else {
      // Separate variances standard error (Welch)
      se = Math.sqrt(var1 / n1 + var2 / n2);
    }
    
    // Calculate margin of error
    const marginOfError = criticalT * se;
    
    return {
      lower: diff - marginOfError,
      upper: diff + marginOfError,
      level: 0.95
    };
  }
  
  /**
   * Calculates the mean of an array of numbers
   * @param {Array<number>} data - Array of numeric values
   * @returns {number} Mean value
   */
  function calculateMean(data) {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }
  
  /**
   * Calculates the variance of an array of numbers
   * @param {Array<number>} data - Array of numeric values
   * @returns {number} Variance value
   */
  function calculateVariance(data) {
    const mean = calculateMean(data);
    return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
  }
  
  /**
   * Interprets Cohen's d effect size based on standard guidelines
   * @param {number} d - Cohen's d value
   * @returns {string} Interpretation of effect size
   */
  function interpretCohensD(d) {
    const absD = Math.abs(d);
    
    if (absD < 0.2) {
      return 'negligible effect';
    } else if (absD < 0.5) {
      return 'small effect';
    } else if (absD < 0.8) {
      return 'medium effect';
    } else {
      return 'large effect';
    }
  }
  
  /**
   * Interprets eta-squared effect size based on standard guidelines
   * @param {number} etaSquared - Eta-squared value
   * @returns {string} Interpretation of effect size
   */
  function interpretEtaSquared(etaSquared) {
    if (etaSquared < 0.01) {
      return 'negligible effect';
    } else if (etaSquared < 0.06) {
      return 'small effect';
    } else if (etaSquared < 0.14) {
      return 'medium effect';
    } else {
      return 'large effect';
    }
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
   * Resamples an array with replacement
   * @param {Array} array - Original array
   * @returns {Array} Resampled array of the same length
   */
  function resampleWithReplacement(array) {
    const n = array.length;
    const result = new Array(n);
    
    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * n);
      result[i] = array[randomIndex];
    }
    
    return result;
  }
  
  /**
   * Approximation of cumulative distribution function for Student's t-distribution
   * @param {number} t - T value
   * @param {number} df - Degrees of freedom
   * @returns {number} Cumulative probability
   */
  function cumulativeStudentT(t, df) {
    // Using beta incomplete function approximation
    if (t === 0) {
      return 0.5;
    }
    
    let x = df / (df + t * t);
    if (x > 1.0) {
      x = 1.0;
    }
    
    // Beta regularized function I_x(a,b)
    const a = df / 2;
    const b = 0.5;
    
    let result = incompleteBetaFunction(x, a, b);
    
    if (t > 0) {
      result = 1.0 - 0.5 * result;
    } else {
      result = 0.5 * result;
    }
    
    return result;
  }
  
  /**
   * Approximation of cumulative distribution function for F-distribution
   * @param {number} F - F value
   * @param {number} df1 - Numerator degrees of freedom
   * @param {number} df2 - Denominator degrees of freedom
   * @returns {number} Cumulative probability
   */
  function cumulativeFDistribution(F, df1, df2) {
    if (F <= 0) {
      return 0;
    }
    
    // Transform to incomplete beta function
    const x = df1 * F / (df1 * F + df2);
    
    // 1 - I_x(df1/2, df2/2)
    return 1 - incompleteBetaFunction(x, df1 / 2, df2 / 2);
  }
  
  /**
   * Approximation of the quantile function for Student's t-distribution
   * @param {number} p - Probability (0 < p < 1)
   * @param {number} df - Degrees of freedom
   * @returns {number} T value at the given probability
   */
  function quantileStudentT(p, df) {
    if (p <= 0 || p >= 1) {
      throw new Error('Probability must be between 0 and 1 exclusive');
    }
    
    // Initial approximation based on normal distribution
    let t = inverseNormalCDF(p);
    
    // Refinement using bisection method
    let lowerBound = -1000;
    let upperBound = 1000;
    let midPoint = t;
    let currentP = cumulativeStudentT(midPoint, df);
    
    // Bisection method for a reasonable number of iterations
    for (let i = 0; i < 20; i++) {
      if (Math.abs(currentP - p) < 0.0001) {
        break;
      }
      
      if (currentP < p) {
        lowerBound = midPoint;
      } else {
        upperBound = midPoint;
      }
      
      midPoint = (lowerBound + upperBound) / 2;
      currentP = cumulativeStudentT(midPoint, df);
    }
    
    return midPoint;
  }
  
  /**
   * Approximation of the incomplete beta function
   * @param {number} x - Upper limit of integration (0 <= x <= 1)
   * @param {number} a - First parameter
   * @param {number} b - Second parameter
   * @returns {number} Value of the incomplete beta function
   */
  function incompleteBetaFunction(x, a, b) {
    if (x < 0 || x > 1) {
      throw new Error('x must be between 0 and 1 inclusive');
    }
    
    if (x === 0 || x === 1) {
      return x;
    }
    
    // Series expansion approximation
    // This is a simple approximation; for production use,
    // a more robust implementation should be used
    const maxTerms = 100;
    const epsilon = 1e-8;
    
    const betaFactor = Math.exp(
      lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x)
    );
    
    let sum = 0;
    let term = 1;
    
    for (let i = 0; i < maxTerms; i++) {
      term *= (a + i) * (a + b + i) * x / ((a + b + i) * (a + i + 1));
      sum += term;
      
      if (Math.abs(term) < epsilon) {
        break;
      }
    }
    
    return betaFactor * (1 + sum) / a;
  }
  
  /**
   * Log gamma function approximation (Lanczos approximation)
   * @param {number} x - Input value
   * @returns {number} Log gamma value
   */
  function lgamma(x) {
    // Coefficients for Lanczos approximation
    const p = [
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
      9.9843695780195716e-6,
      1.5056327351493116e-7
    ];
    
    // Reflection formula for negative x
    if (x < 0.5) {
      return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * x)) - lgamma(1 - x);
    }
    
    // Use Lanczos approximation for x >= 0.5
    let z = x - 1;
    let sum = 0.99999999999980993;
    
    for (let i = 0; i < p.length; i++) {
      sum += p[i] / (z + i + 1);
    }
    
    const t = z + p.length - 0.5;
    
    return Math.log(Math.sqrt(2 * Math.PI)) + (z + 0.5) * Math.log(t) - t + Math.log(sum);
  }