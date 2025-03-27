/**
 * powerAnalysis.js
 * 
 * Implementation of statistical power analysis methods for ReactSmart experiments.
 * This module provides tools for:
 * 1. Determining appropriate sample sizes for future experiments
 * 2. Calculating achieved power of completed experiments
 * 3. Analyzing sensitivity (minimum detectable effect) for fixed sample sizes
 */

/**
 * Calculates sample size needed for t-test with specified parameters
 * @param {Object} options - Configuration options
 * @param {number} options.effectSize - Expected effect size (Cohen's d)
 * @param {number} options.power - Desired statistical power (default: 0.8)
 * @param {number} options.alpha - Significance level (default: 0.05)
 * @param {boolean} options.twoSided - Whether test is two-sided (default: true)
 * @returns {Object} Sample size calculation results
 */
function sampleSizeForTTest(options) {
    const { 
      effectSize, 
      power = 0.8, 
      alpha = 0.05, 
      twoSided = true 
    } = options;
    
    if (typeof effectSize !== 'number' || effectSize <= 0) {
      throw new Error('Effect size must be a positive number');
    }
    
    if (power <= 0 || power >= 1) {
      throw new Error('Power must be between 0 and 1');
    }
    
    if (alpha <= 0 || alpha >= 1) {
      throw new Error('Alpha must be between 0 and 1');
    }
    
    // Calculate critical values
    const alphaActual = twoSided ? alpha / 2 : alpha;
    const zAlpha = probit(1 - alphaActual);
    const zBeta = probit(power);
    
    // Calculate sample size per group
    const n = Math.ceil(2 * Math.pow(zAlpha + zBeta, 2) / Math.pow(effectSize, 2));
    
    // Calculate total sample size
    const totalN = 2 * n;
    
    return {
      sampleSizePerGroup: n,
      totalSampleSize: totalN,
      effectSize,
      power,
      alpha,
      twoSided,
      criticalValue: zAlpha
    };
  }
  
  /**
   * Calculates achieved power of a t-test with given parameters
   * @param {Object} options - Configuration options
   * @param {number} options.sampleSize - Sample size per group
   * @param {number} options.effectSize - Observed effect size (Cohen's d)
   * @param {number} options.alpha - Significance level (default: 0.05)
   * @param {boolean} options.twoSided - Whether test is two-sided (default: true)
   * @returns {Object} Power calculation results
   */
  function achievedPowerForTTest(options) {
    const { 
      sampleSize, 
      effectSize, 
      alpha = 0.05, 
      twoSided = true 
    } = options;
    
    if (typeof sampleSize !== 'number' || sampleSize <= 0 || !Number.isInteger(sampleSize)) {
      throw new Error('Sample size must be a positive integer');
    }
    
    if (typeof effectSize !== 'number' || effectSize <= 0) {
      throw new Error('Effect size must be a positive number');
    }
    
    if (alpha <= 0 || alpha >= 1) {
      throw new Error('Alpha must be between 0 and 1');
    }
    
    // Calculate critical values
    const alphaActual = twoSided ? alpha / 2 : alpha;
    const zAlpha = probit(1 - alphaActual);
    
    // Calculate non-centrality parameter
    const ncp = effectSize * Math.sqrt(sampleSize / 2);
    
    // Calculate power
    const criticalValue = zAlpha;
    const power = 1 - cdf(criticalValue - ncp);
    
    return {
      power,
      effectSize,
      sampleSizePerGroup: sampleSize,
      totalSampleSize: 2 * sampleSize,
      alpha,
      twoSided,
      criticalValue
    };
  }
  
  /**
   * Calculates minimum detectable effect size for a given sample size
   * @param {Object} options - Configuration options
   * @param {number} options.sampleSize - Sample size per group
   * @param {number} options.power - Desired statistical power (default: 0.8)
   * @param {number} options.alpha - Significance level (default: 0.05)
   * @param {boolean} options.twoSided - Whether test is two-sided (default: true)
   * @returns {Object} Sensitivity analysis results
   */
  function minimumDetectableEffect(options) {
    const { 
      sampleSize, 
      power = 0.8, 
      alpha = 0.05, 
      twoSided = true 
    } = options;
    
    if (typeof sampleSize !== 'number' || sampleSize <= 0 || !Number.isInteger(sampleSize)) {
      throw new Error('Sample size must be a positive integer');
    }
    
    if (power <= 0 || power >= 1) {
      throw new Error('Power must be between 0 and 1');
    }
    
    if (alpha <= 0 || alpha >= 1) {
      throw new Error('Alpha must be between 0 and 1');
    }
    
    // Calculate critical values
    const alphaActual = twoSided ? alpha / 2 : alpha;
    const zAlpha = probit(1 - alphaActual);
    const zBeta = probit(power);
    
    // Calculate minimum detectable effect size
    const mde = Math.sqrt(2 * Math.pow(zAlpha + zBeta, 2) / sampleSize);
    
    return {
      minimumDetectableEffectSize: mde,
      interpretation: interpretCohensD(mde),
      sampleSizePerGroup: sampleSize,
      totalSampleSize: 2 * sampleSize,
      power,
      alpha,
      twoSided
    };
  }
  
  /**
   * Calculates sample size for ANOVA with specified parameters
   * @param {Object} options - Configuration options
   * @param {number} options.groups - Number of groups
   * @param {number} options.effectSize - Expected effect size (f)
   * @param {number} options.power - Desired statistical power (default: 0.8)
   * @param {number} options.alpha - Significance level (default: 0.05)
   * @returns {Object} Sample size calculation results
   */
  function sampleSizeForANOVA(options) {
    const { 
      groups, 
      effectSize, 
      power = 0.8, 
      alpha = 0.05 
    } = options;
    
    if (typeof groups !== 'number' || groups < 2 || !Number.isInteger(groups)) {
      throw new Error('Number of groups must be an integer greater than 1');
    }
    
    if (typeof effectSize !== 'number' || effectSize <= 0) {
      throw new Error('Effect size must be a positive number');
    }
    
    // Convert f to partial eta squared for easier interpretation
    const etaSquared = Math.pow(effectSize, 2) / (1 + Math.pow(effectSize, 2));
    
    // Degrees of freedom
    const dfBetween = groups - 1;
    
    // Calculate lambda
    const lambda = dfBetween * Math.pow(effectSize, 2);
    
    // Use approximation method to find sample size
    let n = 10; // starting guess
    let currentPower = 0;
    
    while (currentPower < power && n <= 1000) {
      const dfError = groups * (n - 1);
      const fcrit = calculateFCritical(dfBetween, dfError, alpha);
      currentPower = calculateNoncentralFPower(fcrit, dfBetween, dfError, n * lambda);
      
      if (currentPower < power) {
        n += 1;
      }
    }
    
    return {
      sampleSizePerGroup: n,
      totalSampleSize: n * groups,
      groups,
      effectSize,
      etaSquared,
      power: currentPower,
      alpha,
      dfBetween,
      dfError: groups * (n - 1)
    };
  }
  
  /**
   * A simple approximation of F critical value
   * Note: This is an approximation and should be replaced with a more accurate method
   * for production use
   * @param {number} dfBetween - Degrees of freedom between groups
   * @param {number} dfError - Degrees of freedom within groups
   * @param {number} alpha - Significance level
   * @returns {number} Approximate F critical value
   */
  function calculateFCritical(dfBetween, dfError, alpha) {
    // This is a simplified approximation based on normal distribution
    // For more accurate results, use a proper F distribution implementation
    const z = probit(1 - alpha);
    return 1 + (Math.pow(z, 2) * (dfBetween + dfError)) / (dfBetween * dfError);
  }
  
  /**
   * Approximate power calculation for non-central F distribution
   * @param {number} fcrit - F critical value
   * @param {number} df1 - Numerator degrees of freedom
   * @param {number} df2 - Denominator degrees of freedom
   * @param {number} lambda - Non-centrality parameter
   * @returns {number} Approximate power
   */
  function calculateNoncentralFPower(fcrit, df1, df2, lambda) {
    // This is a simplified approximation
    // For more accurate results, use a proper non-central F distribution implementation
    const t = Math.sqrt(fcrit * df1 / df2);
    const delta = Math.sqrt(lambda / df1);
    const numerator = df2 - 1;
    const denominator = df2 - 3;
    const adjustment = Math.sqrt(numerator / denominator);
    
    return 1 - cdf((t - delta) * adjustment);
  }
  
  /**
   * Calculates power curve for varying sample sizes
   * @param {Object} options - Configuration options
   * @param {number} options.minN - Minimum sample size per group
   * @param {number} options.maxN - Maximum sample size per group
   * @param {number} options.step - Step size for sample size increments
   * @param {number} options.effectSize - Expected effect size (Cohen's d)
   * @param {number} options.alpha - Significance level (default: 0.05)
   * @param {boolean} options.twoSided - Whether test is two-sided (default: true)
   * @returns {Array<Object>} Array of power calculations for different sample sizes
   */
  function powerCurve(options) {
    const { 
      minN, 
      maxN, 
      step = 1, 
      effectSize, 
      alpha = 0.05, 
      twoSided = true 
    } = options;
    
    if (typeof minN !== 'number' || minN <= 0 || !Number.isInteger(minN)) {
      throw new Error('Minimum sample size must be a positive integer');
    }
    
    if (typeof maxN !== 'number' || maxN <= minN || !Number.isInteger(maxN)) {
      throw new Error('Maximum sample size must be a positive integer greater than minimum');
    }
    
    if (typeof step !== 'number' || step <= 0 || !Number.isInteger(step)) {
      throw new Error('Step size must be a positive integer');
    }
    
    const curve = [];
    
    for (let n = minN; n <= maxN; n += step) {
      const result = achievedPowerForTTest({
        sampleSize: n,
        effectSize,
        alpha,
        twoSided
      });
      
      curve.push({
        sampleSizePerGroup: n,
        totalSampleSize: 2 * n,
        power: result.power,
        effectSize
      });
    }
    
    return curve;
  }
  
  /**
   * Calculates effect size curve for fixed sample size and power
   * @param {Object} options - Configuration options
   * @param {number} options.sampleSize - Sample size per group
   * @param {number} options.minEffect - Minimum effect size
   * @param {number} options.maxEffect - Maximum effect size
   * @param {number} options.steps - Number of steps between min and max effect
   * @param {number} options.power - Desired statistical power (default: 0.8)
   * @param {number} options.alpha - Significance level (default: 0.05)
   * @param {boolean} options.twoSided - Whether test is two-sided (default: true)
   * @returns {Array<Object>} Array of minimum detectable effects for different power levels
   */
  function effectSizeCurve(options) {
    const { 
      sampleSize, 
      minEffect, 
      maxEffect, 
      steps = 10, 
      alpha = 0.05, 
      twoSided = true 
    } = options;
    
    if (typeof sampleSize !== 'number' || sampleSize <= 0 || !Number.isInteger(sampleSize)) {
      throw new Error('Sample size must be a positive integer');
    }
    
    if (typeof minEffect !== 'number' || minEffect <= 0) {
      throw new Error('Minimum effect size must be a positive number');
    }
    
    if (typeof maxEffect !== 'number' || maxEffect <= minEffect) {
      throw new Error('Maximum effect size must be greater than minimum effect size');
    }
    
    const curve = [];
    const stepSize = (maxEffect - minEffect) / steps;
    
    for (let i = 0; i <= steps; i++) {
      const effectSize = minEffect + i * stepSize;
      
      const result = achievedPowerForTTest({
        sampleSize,
        effectSize,
        alpha,
        twoSided
      });
      
      curve.push({
        effectSize,
        power: result.power,
        sampleSizePerGroup: sampleSize,
        totalSampleSize: 2 * sampleSize
      });
    }
    
    return curve;
  }
  
  /**
   * Calculates post-hoc power analysis for actual experiment results
   * @param {Object} options - Configuration options
   * @param {number} options.mean1 - Mean of first group
   * @param {number} options.sd1 - Standard deviation of first group
   * @param {number} options.n1 - Sample size of first group
   * @param {number} options.mean2 - Mean of second group
   * @param {number} options.sd2 - Standard deviation of second group
   * @param {number} options.n2 - Sample size of second group
   * @param {number} options.alpha - Significance level (default: 0.05)
   * @param {boolean} options.twoSided - Whether test is two-sided (default: true)
   * @returns {Object} Post-hoc power analysis results
   */
  function postHocPower(options) {
    const { 
      mean1, 
      sd1, 
      n1, 
      mean2, 
      sd2, 
      n2, 
      alpha = 0.05, 
      twoSided = true 
    } = options;
    
    // Calculate pooled standard deviation
    const pooledSD = Math.sqrt(((n1 - 1) * Math.pow(sd1, 2) + (n2 - 1) * Math.pow(sd2, 2)) / (n1 + n2 - 2));
    
    // Calculate observed Cohen's d
    const observedD = Math.abs(mean1 - mean2) / pooledSD;
    
    // Calculate non-centrality parameter
    const ncp = observedD * Math.sqrt((n1 * n2) / (n1 + n2));
    
    // Calculate critical value
    const alphaActual = twoSided ? alpha / 2 : alpha;
    const criticalValue = probit(1 - alphaActual);
    
    // Calculate power
    const power = 1 - cdf(criticalValue - ncp);
    
    return {
      observedEffect: observedD,
      power,
      pooledSD,
      n1,
      n2,
      mean1,
      mean2,
      sd1,
      sd2,
      alpha,
      twoSided,
      interpretation: interpretPostHocPower(power)
    };
  }
  
  /**
   * Calculates power for a paired t-test
   * @param {Object} options - Configuration options
   * @param {number} options.sampleSize - Number of pairs
   * @param {number} options.effectSize - Expected effect size (Cohen's d for paired differences)
   * @param {number} options.alpha - Significance level (default: 0.05)
   * @param {boolean} options.twoSided - Whether test is two-sided (default: true)
   * @returns {Object} Power calculation results
   */
  function powerForPairedTTest(options) {
    const { 
      sampleSize, 
      effectSize, 
      alpha = 0.05, 
      twoSided = true 
    } = options;
    
    if (typeof sampleSize !== 'number' || sampleSize <= 0 || !Number.isInteger(sampleSize)) {
      throw new Error('Sample size must be a positive integer');
    }
    
    if (typeof effectSize !== 'number' || effectSize <= 0) {
      throw new Error('Effect size must be a positive number');
    }
    
    // For paired t-test, the sample size required is different from independent samples
    // The ncp is simply d * sqrt(n) rather than d * sqrt(n/2)
    
    // Calculate critical values
    const alphaActual = twoSided ? alpha / 2 : alpha;
    const zAlpha = probit(1 - alphaActual);
    
    // Calculate non-centrality parameter (adjusted for paired design)
    const ncp = effectSize * Math.sqrt(sampleSize);
    
    // Calculate power
    const power = 1 - cdf(zAlpha - ncp);
    
    return {
      power,
      effectSize,
      sampleSize,
      alpha,
      twoSided,
      criticalValue: zAlpha
    };
  }
  
  /**
   * Calculates sample size for detecting a proportion difference
   * @param {Object} options - Configuration options
   * @param {number} options.p1 - Expected proportion in first group
   * @param {number} options.p2 - Expected proportion in second group
   * @param {number} options.power - Desired statistical power (default: 0.8)
   * @param {number} options.alpha - Significance level (default: 0.05)
   * @param {boolean} options.twoSided - Whether test is two-sided (default: true)
   * @returns {Object} Sample size calculation results
   */
  function sampleSizeForProportions(options) {
    const { 
      p1, 
      p2, 
      power = 0.8, 
      alpha = 0.05, 
      twoSided = true 
    } = options;
    
    if (p1 < 0 || p1 > 1 || p2 < 0 || p2 > 1) {
      throw new Error('Proportions must be between 0 and 1');
    }
    
    if (p1 === p2) {
      throw new Error('Proportions must be different');
    }
    
    // Calculate critical values
    const alphaActual = twoSided ? alpha / 2 : alpha;
    const zAlpha = probit(1 - alphaActual);
    const zBeta = probit(power);
    
    // Calculate sample size (using pooled proportion)
    const pBar = (p1 + p2) / 2;
    const n = Math.ceil(
      Math.pow(zAlpha + zBeta, 2) * 2 * pBar * (1 - pBar) / Math.pow(p1 - p2, 2)
    );
    
    // Calculate effect size (h) for comparison with Cohen's d
    const h = 2 * Math.asin(Math.sqrt(p1)) - 2 * Math.asin(Math.sqrt(p2));
    
    return {
      sampleSizePerGroup: n,
      totalSampleSize: 2 * n,
      p1,
      p2,
      effectSizeH: h,
      interpretation: interpretCohenH(h),
      power,
      alpha,
      twoSided
    };
  }
  
  /**
   * Interprets Cohen's h effect size for proportions
   * @param {number} h - Cohen's h value
   * @returns {string} Interpretation of effect size
   */
  function interpretCohenH(h) {
    const absH = Math.abs(h);
    
    if (absH < 0.2) {
      return 'negligible effect';
    } else if (absH < 0.5) {
      return 'small effect';
    } else if (absH < 0.8) {
      return 'medium effect';
    } else {
      return 'large effect';
    }
  }
  
  /**
   * Interprets Cohen's d effect size
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
   * Interprets post-hoc power value
   * @param {number} power - Calculated power
   * @returns {string} Interpretation of power
   */
  function interpretPostHocPower(power) {
    if (power < 0.5) {
      return 'inadequate power';
    } else if (power < 0.8) {
      return 'moderate power';
    } else if (power < 0.95) {
      return 'good power';
    } else {
      return 'excellent power';
    }
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
   * Analyzes power and sample size requirements for a complete experiment plan
   * @param {Object} experimentPlan - Experiment configuration
   * @returns {Object} Comprehensive power analysis results
   */
  function analyzeExperimentPower(experimentPlan) {
    const { 
      experimentType = 'independent', 
      expectedEffectSize,
      desiredPower = 0.8,
      alpha = 0.05,
      groups = 2,
      estimatedSampleSize = null,
      actualResults = null
    } = experimentPlan;
    
    const results = {
      experimentType,
      alpha,
      desiredPower,
      expectedEffectSize
    };
    
    // Calculate a priori sample size
    if (experimentType === 'independent') {
      results.aPriori = sampleSizeForTTest({
        effectSize: expectedEffectSize,
        power: desiredPower,
        alpha,
        twoSided: true
      });
    } else if (experimentType === 'paired') {
      // For paired design, use paired power calculation
      const size = Math.ceil(
        Math.pow(probit(1 - alpha/2) + probit(desiredPower), 2) / Math.pow(expectedEffectSize, 2)
      );
      
      results.aPriori = {
        sampleSize: size,
        effectSize: expectedEffectSize,
        power: desiredPower,
        alpha
      };
    } else if (experimentType === 'anova') {
      results.aPriori = sampleSizeForANOVA({
        groups,
        effectSize: expectedEffectSize,
        power: desiredPower,
        alpha
      });
    }
    
    // Calculate sensitivity (MDE) if sample size is provided
    if (estimatedSampleSize !== null) {
      if (experimentType === 'independent') {
        results.sensitivity = minimumDetectableEffect({
          sampleSize: estimatedSampleSize,
          power: desiredPower,
          alpha,
          twoSided: true
        });
      } else if (experimentType === 'paired') {
        // For paired design, MDE calculation differs
        const mde = Math.sqrt(
          Math.pow(probit(1 - alpha/2) + probit(desiredPower), 2) / estimatedSampleSize
        );
        
        results.sensitivity = {
          minimumDetectableEffectSize: mde,
          interpretation: interpretCohensD(mde),
          sampleSize: estimatedSampleSize,
          power: desiredPower,
          alpha
        };
      }
      
      // Calculate power curve
      results.powerCurve = powerCurve({
        minN: Math.max(5, Math.floor(estimatedSampleSize * 0.5)),
        maxN: Math.ceil(estimatedSampleSize * 1.5),
        step: Math.max(1, Math.floor(estimatedSampleSize * 0.1)),
        effectSize: expectedEffectSize,
        alpha,
        twoSided: true
      });
    }
    
    // Calculate post-hoc power if actual results are provided
    if (actualResults !== null) {
      const { group1, group2 } = actualResults;
      
      if (experimentType === 'independent') {
        results.postHoc = postHocPower({
          mean1: group1.mean,
          sd1: group1.sd,
          n1: group1.n,
          mean2: group2.mean,
          sd2: group2.sd,
          n2: group2.n,
          alpha,
          twoSided: true
        });
      } else if (experimentType === 'paired') {
        // For paired design, we need the mean and sd of differences
        results.postHoc = powerForPairedTTest({
          sampleSize: group1.n, // assuming both groups have same n for paired test
          effectSize: Math.abs(group1.mean - group2.mean) / actualResults.sdDiff,
          alpha,
          twoSided: true
        });
        
        results.postHoc.observedEffect = Math.abs(group1.mean - group2.mean) / actualResults.sdDiff;
        results.postHoc.interpretation = interpretPostHocPower(results.postHoc.power);
      }
    }
    
    return results;
  }
  
  module.exports = {
    sampleSizeForTTest,
    achievedPowerForTTest,
    minimumDetectableEffect,
    sampleSizeForANOVA,
    powerCurve,
    effectSizeCurve,
    postHocPower,
    powerForPairedTTest,
    sampleSizeForProportions,
    analyzeExperimentPower,
    interpretCohensD,
    interpretCohenH,
    interpretPostHocPower
  };