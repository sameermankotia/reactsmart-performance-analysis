/**
 * effectSize.js
 * 
 * Implementation of effect size calculation methods for statistical analysis
 * of ReactSmart performance data. This module provides tools for quantifying
 * the magnitude of differences between experimental conditions, going beyond
 * simple statistical significance.
 */

/**
 * Calculates Cohen's d effect size between two independent samples
 * Cohen's d represents the standardized difference between two means
 * @param {Array<number>} group1 - First group data
 * @param {Array<number>} group2 - Second group data
 * @returns {Object} Object containing effect size and interpretation
 */
function cohensD(group1, group2) {
    if (!Array.isArray(group1) || !Array.isArray(group2) || group1.length === 0 || group2.length === 0) {
      throw new Error('Both groups must be non-empty arrays');
    }
    
    const mean1 = calculateMean(group1);
    const mean2 = calculateMean(group2);
    const sd1 = calculateStandardDeviation(group1);
    const sd2 = calculateStandardDeviation(group2);
    
    // Calculate pooled standard deviation
    const n1 = group1.length;
    const n2 = group2.length;
    const pooledSD = Math.sqrt(((n1 - 1) * Math.pow(sd1, 2) + (n2 - 1) * Math.pow(sd2, 2)) / (n1 + n2 - 2));
    
    // Calculate Cohen's d
    const d = (mean1 - mean2) / pooledSD;
    
    // Calculate standard error of d
    const se = Math.sqrt((n1 + n2) / (n1 * n2) + Math.pow(d, 2) / (2 * (n1 + n2)));
    
    // Calculate 95% confidence interval
    const ci95 = {
      lower: d - 1.96 * se,
      upper: d + 1.96 * se
    };
    
    return {
      d: d,
      absoluteD: Math.abs(d),
      interpretation: interpretCohensD(d),
      standardError: se,
      confidenceInterval: ci95
    };
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
   * Calculates Hedges' g effect size, which corrects for bias in Cohen's d
   * especially when sample sizes are small
   * @param {Array<number>} group1 - First group data
   * @param {Array<number>} group2 - Second group data
   * @returns {Object} Object containing effect size and interpretation
   */
  function hedgesG(group1, group2) {
    if (!Array.isArray(group1) || !Array.isArray(group2) || group1.length === 0 || group2.length === 0) {
      throw new Error('Both groups must be non-empty arrays');
    }
    
    // First calculate Cohen's d
    const cohensResult = cohensD(group1, group2);
    
    // Apply correction factor
    const n1 = group1.length;
    const n2 = group2.length;
    const N = n1 + n2;
    
    // Correction factor (J)
    const correctionFactor = 1 - (3 / (4 * N - 9));
    
    // Calculate Hedges' g
    const g = cohensResult.d * correctionFactor;
    
    // Calculate standard error for g
    const se = Math.sqrt((N / (n1 * n2)) + (Math.pow(g, 2) / (2 * (N - 3.94))));
    
    // Calculate 95% confidence interval
    const ci95 = {
      lower: g - 1.96 * se,
      upper: g + 1.96 * se
    };
    
    return {
      g: g,
      absoluteG: Math.abs(g),
      interpretation: interpretCohensD(g), // Same interpretation scale as Cohen's d
      standardError: se,
      confidenceInterval: ci95
    };
  }
  
  /**
   * Calculates Glass's delta effect size, which uses only the standard deviation
   * of the control group. Useful when variances are heterogeneous.
   * @param {Array<number>} controlGroup - Control group data
   * @param {Array<number>} treatmentGroup - Treatment group data
   * @returns {Object} Object containing effect size and interpretation
   */
  function glassDelta(controlGroup, treatmentGroup) {
    if (!Array.isArray(controlGroup) || !Array.isArray(treatmentGroup) || 
        controlGroup.length === 0 || treatmentGroup.length === 0) {
      throw new Error('Both groups must be non-empty arrays');
    }
    
    const meanControl = calculateMean(controlGroup);
    const meanTreatment = calculateMean(treatmentGroup);
    const sdControl = calculateStandardDeviation(controlGroup);
    
    // Calculate Glass's delta
    const delta = (meanTreatment - meanControl) / sdControl;
    
    // Calculate standard error
    const nControl = controlGroup.length;
    const nTreatment = treatmentGroup.length;
    const se = Math.sqrt((nTreatment + nControl) / (nTreatment * nControl) + Math.pow(delta, 2) / (2 * nControl));
    
    // Calculate 95% confidence interval
    const ci95 = {
      lower: delta - 1.96 * se,
      upper: delta + 1.96 * se
    };
    
    return {
      delta: delta,
      absoluteDelta: Math.abs(delta),
      interpretation: interpretCohensD(delta), // Same interpretation scale
      standardError: se,
      confidenceInterval: ci95
    };
  }
  
  /**
   * Calculates Cliff's delta effect size for ordinal data, which is
   * more robust than Cohen's d for non-normal distributions
   * @param {Array<number>} group1 - First group data
   * @param {Array<number>} group2 - Second group data
   * @returns {Object} Object containing effect size and interpretation
   */
  function cliffsDelta(group1, group2) {
    if (!Array.isArray(group1) || !Array.isArray(group2) || group1.length === 0 || group2.length === 0) {
      throw new Error('Both groups must be non-empty arrays');
    }
    
    let dominance = 0;
    
    // Compare each value in group1 with each value in group2
    for (let i = 0; i < group1.length; i++) {
      for (let j = 0; j < group2.length; j++) {
        if (group1[i] > group2[j]) {
          dominance += 1;
        } else if (group1[i] < group2[j]) {
          dominance -= 1;
        }
        // if equal, no change
      }
    }
    
    // Normalize by the total number of comparisons
    const delta = dominance / (group1.length * group2.length);
    
    // Calculate standard error (approximation)
    const n1 = group1.length;
    const n2 = group2.length;
    const se = Math.sqrt((2 * (n1 + n2 + 1)) / (3 * n1 * n2));
    
    // Calculate 95% confidence interval
    const ci95 = {
      lower: Math.max(-1, delta - 1.96 * se),
      upper: Math.min(1, delta + 1.96 * se)
    };
    
    return {
      delta: delta,
      absoluteDelta: Math.abs(delta),
      interpretation: interpretCliffsDelta(delta),
      standardError: se,
      confidenceInterval: ci95
    };
  }
  
  /**
   * Interprets Cliff's delta effect size based on standard guidelines
   * @param {number} delta - Cliff's delta value
   * @returns {string} Interpretation of effect size
   */
  function interpretCliffsDelta(delta) {
    const absDelta = Math.abs(delta);
    
    if (absDelta < 0.147) {
      return 'negligible effect';
    } else if (absDelta < 0.33) {
      return 'small effect';
    } else if (absDelta < 0.474) {
      return 'medium effect';
    } else {
      return 'large effect';
    }
  }
  
  /**
   * Calculates partial eta-squared (η²) effect size for ANOVA
   * @param {number} sumSquaresBetween - Sum of squares between groups
   * @param {number} sumSquaresTotal - Total sum of squares
   * @returns {Object} Object containing effect size and interpretation
   */
  function partialEtaSquared(sumSquaresBetween, sumSquaresTotal) {
    if (typeof sumSquaresBetween !== 'number' || typeof sumSquaresTotal !== 'number') {
      throw new Error('Sum of squares values must be numbers');
    }
    
    if (sumSquaresBetween < 0 || sumSquaresTotal <= 0 || sumSquaresBetween > sumSquaresTotal) {
      throw new Error('Invalid sum of squares values');
    }
    
    const etaSquared = sumSquaresBetween / sumSquaresTotal;
    
    return {
      etaSquared: etaSquared,
      interpretation: interpretEtaSquared(etaSquared)
    };
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
   * Calculates common language effect size (CLES)
   * Represents the probability that a random value from group1 is greater than a random value from group2
   * @param {Array<number>} group1 - First group data
   * @param {Array<number>} group2 - Second group data
   * @returns {Object} Object containing CLES value and interpretation
   */
  function commonLanguageEffectSize(group1, group2) {
    if (!Array.isArray(group1) || !Array.isArray(group2) || group1.length === 0 || group2.length === 0) {
      throw new Error('Both groups must be non-empty arrays');
    }
    
    let count = 0;
    const totalComparisons = group1.length * group2.length;
    
    // Compare each value in group1 with each value in group2
    for (let i = 0; i < group1.length; i++) {
      for (let j = 0; j < group2.length; j++) {
        if (group1[i] > group2[j]) {
          count++;
        } else if (group1[i] === group2[j]) {
          // Count ties as half
          count += 0.5;
        }
      }
    }
    
    // Calculate CLES
    const cles = count / totalComparisons;
    
    return {
      cles: cles,
      probability: cles * 100,  // Convert to percentage
      interpretation: interpretCLES(cles)
    };
  }
  
  /**
   * Interprets common language effect size
   * @param {number} cles - CLES value (0-1)
   * @returns {string} Interpretation
   */
  function interpretCLES(cles) {
    if (cles < 0.56) {
      return 'negligible effect';
    } else if (cles < 0.64) {
      return 'small effect';
    } else if (cles < 0.71) {
      return 'medium effect';
    } else {
      return 'large effect';
    }
  }
  
  /**
   * Calculates percentage improvement effect size
   * Useful for business metrics and performance improvements
   * @param {number} baseline - Baseline value
   * @param {number} improved - Improved value
   * @param {boolean} lowerIsBetter - Whether lower values represent improvement (default: true)
   * @returns {Object} Object containing percentage improvement and interpretation
   */
  function percentageImprovement(baseline, improved, lowerIsBetter = true) {
    if (typeof baseline !== 'number' || typeof improved !== 'number') {
      throw new Error('Baseline and improved values must be numbers');
    }
    
    if (baseline === 0) {
      throw new Error('Baseline cannot be zero');
    }
    
    let percentage;
    
    if (lowerIsBetter) {
      // For metrics where lower is better (e.g., load time)
      percentage = (baseline - improved) / baseline * 100;
    } else {
      // For metrics where higher is better (e.g., conversion rate)
      percentage = (improved - baseline) / baseline * 100;
    }
    
    return {
      percentage: percentage,
      improvement: percentage > 0,
      interpretation: interpretPercentageImprovement(percentage)
    };
  }
  
  /**
   * Interprets percentage improvement effect size
   * @param {number} percentage - Percentage improvement
   * @returns {string} Interpretation
   */
  function interpretPercentageImprovement(percentage) {
    const absPercentage = Math.abs(percentage);
    
    if (percentage < 0) {
      return 'negative impact';
    } else if (absPercentage < 5) {
      return 'negligible improvement';
    } else if (absPercentage < 15) {
      return 'modest improvement';
    } else if (absPercentage < 30) {
      return 'substantial improvement';
    } else if (absPercentage < 50) {
      return 'major improvement';
    } else {
      return 'transformative improvement';
    }
  }
  
  /**
   * Calculates Vargha and Delaney's A measure of stochastic superiority
   * Non-parametric effect size measure that works well for performance data
   * @param {Array<number>} group1 - First group data
   * @param {Array<number>} group2 - Second group data
   * @returns {Object} Object containing A measure and interpretation
   */
  function varghaDelaneyA(group1, group2) {
    if (!Array.isArray(group1) || !Array.isArray(group2) || group1.length === 0 || group2.length === 0) {
      throw new Error('Both groups must be non-empty arrays');
    }
    
    let sumRanks = 0;
    const combinedValues = [...group1, ...group2];
    
    // Sort combined values
    combinedValues.sort((a, b) => a - b);
    
    // Create ranks (handle ties properly)
    const ranks = {};
    let currentRank = 1;
    
    for (let i = 0; i < combinedValues.length; i++) {
      const value = combinedValues[i];
      
      if (!ranks[value]) {
        // Find how many equal values there are
        let count = 1;
        for (let j = i + 1; j < combinedValues.length; j++) {
          if (combinedValues[j] === value) {
            count++;
          } else {
            break;
          }
        }
        
        // Calculate average rank for ties
        const avgRank = currentRank + (count - 1) / 2;
        ranks[value] = avgRank;
        
        currentRank += count;
      }
    }
    
    // Sum ranks for group1
    for (const value of group1) {
      sumRanks += ranks[value];
    }
    
    // Calculate A measure
    const n1 = group1.length;
    const n2 = group2.length;
    const aValue = (sumRanks - (n1 * (n1 + 1)) / 2) / (n1 * n2);
    
    return {
      a: aValue,
      interpretation: interpretVarghaDelaneyA(aValue)
    };
  }
  
  /**
   * Interprets Vargha and Delaney's A measure
   * @param {number} a - A measure value (0-1)
   * @returns {string} Interpretation
   */
  function interpretVarghaDelaneyA(a) {
    // Adjust interpretation based on which direction is "better"
    // Here we assume higher A values mean group1 is superior
    if (a < 0.44) {
      return 'small negative effect';
    } else if (a < 0.56) {
      return 'negligible effect';
    } else if (a < 0.64) {
      return 'small positive effect';
    } else if (a < 0.71) {
      return 'medium positive effect';
    } else {
      return 'large positive effect';
    }
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
    return Math.sqrt(squaredDiffs.reduce((sum, value) => sum + value, 0) / (data.length - 1));
  }
  
  /**
   * Calculates multiple effect sizes for the same pair of groups
   * @param {Array<number>} group1 - First group data
   * @param {Array<number>} group2 - Second group data
   * @param {Object} options - Options for calculation
   * @returns {Object} Object containing multiple effect size measures
   */
  function calculateAllEffectSizes(group1, group2, options = { lowerIsBetter: true }) {
    const results = {
      cohensD: cohensD(group1, group2),
      hedgesG: hedgesG(group1, group2),
      cliffsDelta: cliffsDelta(group1, group2),
      commonLanguage: commonLanguageEffectSize(group1, group2),
      varghaDelaneyA: varghaDelaneyA(group1, group2)
    };
    
    // Add percentage improvement if baseline is provided
    if (options.baseline !== undefined && options.improved !== undefined) {
      results.percentageImprovement = percentageImprovement(
        options.baseline, 
        options.improved, 
        options.lowerIsBetter
      );
    } else {
      // Calculate percentage based on means
      const mean1 = calculateMean(group1);
      const mean2 = calculateMean(group2);
      results.percentageImprovement = percentageImprovement(
        mean1,
        mean2,
        options.lowerIsBetter
      );
    }
    
    return results;
  }
  
  module.exports = {
    cohensD,
    hedgesG,
    glassDelta,
    cliffsDelta,
    partialEtaSquared,
    commonLanguageEffectSize,
    percentageImprovement,
    varghaDelaneyA,
    calculateAllEffectSizes,
    calculateMean,
    calculateStandardDeviation
  };