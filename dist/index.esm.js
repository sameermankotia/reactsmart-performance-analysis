import React, { createContext, useState, useRef, useEffect, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { jsx } from 'react/jsx-runtime';
import { Route } from 'react-router-dom';

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
function _createForOfIteratorHelper(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (!t) {
    if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
      t && (r = t);
      var n = 0,
        F = function () {};
      return {
        s: F,
        n: function () {
          return n >= r.length ? {
            done: !0
          } : {
            done: !1,
            value: r[n++]
          };
        },
        e: function (r) {
          throw r;
        },
        f: F
      };
    }
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  var o,
    a = !0,
    u = !1;
  return {
    s: function () {
      t = t.call(r);
    },
    n: function () {
      var r = t.next();
      return a = r.done, r;
    },
    e: function (r) {
      u = !0, o = r;
    },
    f: function () {
      try {
        a || null == t.return || t.return();
      } finally {
        if (u) throw o;
      }
    }
  };
}
function _defineProperty(e, r, t) {
  return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
    value: t,
    enumerable: !0,
    configurable: !0,
    writable: !0
  }) : e[r] = t, e;
}
function _iterableToArray(r) {
  if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function ownKeys(e, r) {
  var t = Object.keys(e);
  if (Object.getOwnPropertySymbols) {
    var o = Object.getOwnPropertySymbols(e);
    r && (o = o.filter(function (r) {
      return Object.getOwnPropertyDescriptor(e, r).enumerable;
    })), t.push.apply(t, o);
  }
  return t;
}
function _objectSpread2(e) {
  for (var r = 1; r < arguments.length; r++) {
    var t = null != arguments[r] ? arguments[r] : {};
    r % 2 ? ownKeys(Object(t), !0).forEach(function (r) {
      _defineProperty(e, r, t[r]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) {
      Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
    });
  }
  return e;
}
function _objectWithoutProperties(e, t) {
  if (null == e) return {};
  var o,
    r,
    i = _objectWithoutPropertiesLoose(e, t);
  if (Object.getOwnPropertySymbols) {
    var n = Object.getOwnPropertySymbols(e);
    for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
  }
  return i;
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}
function _readOnlyError(r) {
  throw new TypeError('"' + r + '" is read-only');
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

/**
 * User Behavior Analysis Module
 * 
 * Tracks and analyzes user interactions to identify patterns and
 * predict future component requirements.
 */
var BehaviorAnalysis = /*#__PURE__*/function () {
  /**
   * Create a new BehaviorAnalysis instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.anonymizeData - Whether to anonymize interaction data
   * @param {string} options.privacyCompliance - Privacy compliance mode ('gdpr', 'ccpa', etc.)
   */
  function BehaviorAnalysis() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, BehaviorAnalysis);
    this.options = _objectSpread2({
      anonymizeData: true,
      privacyCompliance: 'gdpr'
    }, options);

    // Initialize data structures
    this.interactionHistory = [];
    this.componentGraph = new Map(); // Graph representing component relationships
    this.weightedEvents = new Map(); // Map of event types to weights
    this.sessionStart = Date.now();

    // Initialize event weights
    this.initializeEventWeights();
  }

  /**
   * Initialize weights for different event types
   * Higher weights indicate stronger predictive value
   */
  return _createClass(BehaviorAnalysis, [{
    key: "initializeEventWeights",
    value: function initializeEventWeights() {
      // Core navigation events have high weights
      this.weightedEvents.set('click', 0.9);
      this.weightedEvents.set('navigation', 0.95);
      this.weightedEvents.set('form-submit', 0.85);

      // Intent-signaling events have medium-high weights
      this.weightedEvents.set('hover', 0.7);
      this.weightedEvents.set('focus', 0.65);
      this.weightedEvents.set('scroll-end', 0.6);

      // Passive or incidental events have lower weights
      this.weightedEvents.set('mousemove', 0.2);
      this.weightedEvents.set('scroll', 0.4);
      this.weightedEvents.set('visibility', 0.5);
    }

    /**
     * Record a user interaction with a component
     * @param {string} componentId - ID of the component interacted with
     * @param {Object} data - Data about the interaction
     */
  }, {
    key: "recordInteraction",
    value: function recordInteraction(componentId, data) {
      var timestamp = Date.now();
      var eventType = data.type || 'unknown';
      var eventWeight = this.weightedEvents.get(eventType) || 0.3;

      // Calculate interaction metric using the weighted sum formula
      // InteractionMetric = ∑(w_i × EventWeight(e_i))
      var interactionMetric = this.calculateInteractionMetric(data, eventWeight);

      // Store the interaction
      var interaction = _objectSpread2({
        componentId: componentId,
        timestamp: timestamp,
        eventType: eventType,
        eventWeight: eventWeight,
        interactionMetric: interactionMetric,
        sessionTime: timestamp - this.sessionStart
      }, data);
      this.interactionHistory.push(interaction);

      // Update the component relationship graph
      this.updateComponentGraph(componentId, interaction);

      // Prune old data if necessary
      this.pruneOldData();
      return interaction;
    }

    /**
     * Calculate the interaction metric for an event
     * @param {Object} data - Interaction data
     * @param {number} baseWeight - Base weight for this event type
     * @returns {number} - Calculated interaction metric
     */
  }, {
    key: "calculateInteractionMetric",
    value: function calculateInteractionMetric(data, baseWeight) {
      var metric = baseWeight;

      // Adjust based on interaction duration if available
      if (data.duration) {
        // Normalize duration (longer interactions may indicate higher interest)
        var durationFactor = Math.min(data.duration / 1000, 10) / 10;
        metric *= 1 + durationFactor * 0.5;
      }

      // Adjust based on viewport coverage if available
      if (data.viewportCoverage) {
        // Higher coverage may indicate more significant content
        metric *= 1 + data.viewportCoverage * 0.3;
      }

      // Adjust based on recency (more recent interactions are more relevant)
      if (data.recency) {
        var recencyFactor = 1 - Math.min(data.recency / 60000, 5) / 5;
        metric *= recencyFactor;
      }
      return metric;
    }

    /**
     * Update the component relationship graph
     * @param {string} componentId - Current component ID
     * @param {Object} interaction - Interaction data
     */
  }, {
    key: "updateComponentGraph",
    value: function updateComponentGraph(componentId, interaction) {
      // Initialize this component in the graph if it doesn't exist
      if (!this.componentGraph.has(componentId)) {
        this.componentGraph.set(componentId, new Map());
      }

      // Find the previous interaction (if any) to establish relationship
      var recentInteractions = this.getRecentInteractions(5);
      if (recentInteractions.length > 1) {
        // Get the most recent different component interaction
        var previousInteractions = recentInteractions.filter(function (i) {
          return i.componentId !== componentId;
        });
        if (previousInteractions.length > 0) {
          var previousInteraction = previousInteractions[0];
          var previousComponentId = previousInteraction.componentId;

          // Update edge weight between previous and current component
          var componentRelationships = this.componentGraph.get(previousComponentId) || new Map();
          var currentWeight = componentRelationships.get(componentId) || 0;

          // Weighted sum of previous weight and new interaction
          var newWeight = currentWeight * 0.7 + interaction.interactionMetric * 0.3;
          componentRelationships.set(componentId, newWeight);

          // Ensure the previous component exists in the graph
          if (!this.componentGraph.has(previousComponentId)) {
            this.componentGraph.set(previousComponentId, componentRelationships);
          } else {
            this.componentGraph.set(previousComponentId, componentRelationships);
          }
        }
      }
    }

    /**
     * Get the most recent interactions
     * @param {number} count - Number of interactions to return
     * @returns {Array} - Recent interactions
     */
  }, {
    key: "getRecentInteractions",
    value: function getRecentInteractions(count) {
      return this.interactionHistory.slice(-count).sort(function (a, b) {
        return b.timestamp - a.timestamp;
      });
    }

    /**
     * Remove old interaction data to prevent memory growth
     */
  }, {
    key: "pruneOldData",
    value: function pruneOldData() {
      var now = Date.now();
      var maxAgeMs = 30 * 60 * 1000; // 30 minutes

      // Remove interactions older than maxAge
      this.interactionHistory = this.interactionHistory.filter(function (interaction) {
        return now - interaction.timestamp < maxAgeMs;
      });
    }

    /**
     * Get current user behavior patterns
     * @returns {Object} - Current behavior patterns and component relationships
     */
  }, {
    key: "getCurrentPatterns",
    value: function getCurrentPatterns() {
      return {
        recentInteractions: this.getRecentInteractions(10),
        componentRelationships: this.serializeComponentGraph(),
        interactionDensity: this.calculateInteractionDensity(),
        primaryComponents: this.identifyPrimaryComponents(5)
      };
    }

    /**
     * Convert the component graph to a serializable format
     * @returns {Array} - Serialized graph
     */
  }, {
    key: "serializeComponentGraph",
    value: function serializeComponentGraph() {
      var serialized = [];

      // Convert the nested maps to an array of relationship objects
      this.componentGraph.forEach(function (relationships, sourceId) {
        relationships.forEach(function (weight, targetId) {
          serialized.push({
            source: sourceId,
            target: targetId,
            weight: weight
          });
        });
      });
      return serialized;
    }

    /**
     * Calculate interaction density (interactions per minute)
     * @returns {number} - Interaction density
     */
  }, {
    key: "calculateInteractionDensity",
    value: function calculateInteractionDensity() {
      var sessionDurationMinutes = (Date.now() - this.sessionStart) / 60000;
      return this.interactionHistory.length / Math.max(sessionDurationMinutes, 0.1);
    }

    /**
     * Identify the most important components based on interaction metrics
     * @param {number} count - Number of components to return
     * @returns {Array} - Primary components with their importance scores
     */
  }, {
    key: "identifyPrimaryComponents",
    value: function identifyPrimaryComponents(count) {
      // Aggregate interaction metrics by component
      var componentMetrics = new Map();
      this.interactionHistory.forEach(function (interaction) {
        var currentMetric = componentMetrics.get(interaction.componentId) || 0;
        componentMetrics.set(interaction.componentId, currentMetric + interaction.interactionMetric);
      });

      // Convert to array and sort by metric
      return Array.from(componentMetrics.entries()).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          componentId = _ref2[0],
          metric = _ref2[1];
        return {
          componentId: componentId,
          importance: metric
        };
      }).sort(function (a, b) {
        return b.importance - a.importance;
      }).slice(0, count);
    }

    /**
     * Calculate the user's interaction pattern complexity
     * Higher complexity may indicate more sophisticated user behavior
     * @returns {number} - Complexity score between 0 and 1
     */
  }, {
    key: "calculatePatternComplexity",
    value: function calculatePatternComplexity() {
      // Calculate based on variety of components and event types
      var uniqueComponents = new Set(this.interactionHistory.map(function (i) {
        return i.componentId;
      })).size;
      var uniqueEventTypes = new Set(this.interactionHistory.map(function (i) {
        return i.eventType;
      })).size;

      // Calculate graph density (ratio of actual to possible edges)
      var componentCount = this.componentGraph.size;
      var edgeCount = 0;
      this.componentGraph.forEach(function (relationships) {
        edgeCount += relationships.size;
      });
      var maxPossibleEdges = componentCount * (componentCount - 1);
      var graphDensity = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;

      // Combine factors into a single complexity score
      var componentVariety = Math.min(uniqueComponents / 10, 1);
      var eventVariety = Math.min(uniqueEventTypes / this.weightedEvents.size, 1);
      return componentVariety * 0.4 + eventVariety * 0.3 + graphDensity * 0.3;
    }

    /**
     * Detect user navigation patterns
     * @returns {Object} - Detected patterns
     */
  }, {
    key: "detectNavigationPatterns",
    value: function detectNavigationPatterns() {
      var patterns = {
        linear: 0,
        branching: 0,
        cyclic: 0,
        dominant: 'unknown'
      };

      // Analyze component graph to detect patterns
      if (this.componentGraph.size > 3) {
        // Calculate outdegree distribution for linearity assessment
        var outDegrees = [];
        this.componentGraph.forEach(function (relationships) {
          outDegrees.push(relationships.size);
        });

        // Calculate average outdegree
        var avgOutDegree = outDegrees.reduce(function (sum, deg) {
          return sum + deg;
        }, 0) / outDegrees.length;

        // Linear patterns have low average outdegree
        if (avgOutDegree < 1.5) {
          patterns.linear = 0.7;
        }

        // Branching patterns have high variance in outdegree
        var variance = outDegrees.reduce(function (sum, deg) {
          return sum + Math.pow(deg - avgOutDegree, 2);
        }, 0) / outDegrees.length;
        if (variance > 1) {
          patterns.branching = 0.6 + Math.min(variance / 10, 0.3);
        }

        // Detect cyclic patterns using simple cycle detection
        var cycles = this.detectCycles();
        if (cycles > 0) {
          patterns.cyclic = Math.min(cycles / 5, 0.9);
        }

        // Determine dominant pattern
        var patternScores = [{
          type: 'linear',
          score: patterns.linear
        }, {
          type: 'branching',
          score: patterns.branching
        }, {
          type: 'cyclic',
          score: patterns.cyclic
        }];
        var dominantPattern = patternScores.sort(function (a, b) {
          return b.score - a.score;
        })[0];
        patterns.dominant = dominantPattern.score > 0.3 ? dominantPattern.type : 'mixed';
      }
      return patterns;
    }

    /**
     * Detect cycles in the component graph
     * @returns {number} - Number of cycles detected
     */
  }, {
    key: "detectCycles",
    value: function detectCycles() {
      var _this = this;
      var cycleCount = 0;
      var visited = new Set();
      var recursionStack = new Set();

      // Simple DFS-based cycle detection
      var _detectCyclesFromNode = function detectCyclesFromNode(nodeId) {
        var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        visited.add(nodeId);
        recursionStack.add(nodeId);
        path.push(nodeId);
        var neighbors = _this.componentGraph.get(nodeId) || new Map();
        neighbors.forEach(function (weight, neighborId) {
          if (!visited.has(neighborId)) {
            if (_detectCyclesFromNode(neighborId, _toConsumableArray(path))) ;
          } else if (recursionStack.has(neighborId)) {
            // Found a cycle
            var cycleStart = path.indexOf(neighborId);
            if (cycleStart >= 0 && path.length - cycleStart >= 3) {
              cycleCount++;
            }
          }
        });
        recursionStack["delete"](nodeId);
        return false;
      };

      // Check from each node
      this.componentGraph.forEach(function (_, nodeId) {
        if (!visited.has(nodeId)) {
          _detectCyclesFromNode(nodeId);
        }
      });
      return cycleCount;
    }

    /**
     * Generate a feature vector for machine learning models
     * @returns {Array} - Feature vector representing current user behavior
     */
  }, {
    key: "generateFeatureVector",
    value: function generateFeatureVector() {
      var features = [];

      // Add interaction density
      features.push(this.calculateInteractionDensity());

      // Add pattern complexity
      features.push(this.calculatePatternComplexity());

      // Add recency-weighted component usage
      var recentInteractions = this.getRecentInteractions(5);
      recentInteractions.map(function (i) {
        return i.componentId;
      });

      // Create a fixed-size feature vector for recent components
      // (using one-hot encoding for a predefined set of components)
      // This would typically be customized based on the application

      // Add navigation pattern features
      var patterns = this.detectNavigationPatterns();
      features.push(patterns.linear);
      features.push(patterns.branching);
      features.push(patterns.cyclic);
      return features;
    }

    /**
     * Reset the analysis data
     */
  }, {
    key: "reset",
    value: function reset() {
      this.interactionHistory = [];
      this.componentGraph = new Map();
      this.sessionStart = Date.now();
    }

    /**
     * Export analysis data in a standardized format
     * @returns {Object} - Exportable analysis data
     */
  }, {
    key: "exportAnalysisData",
    value: function exportAnalysisData() {
      return {
        sessionId: this.sessionStart.toString(),
        sessionDuration: (Date.now() - this.sessionStart) / 1000,
        interactionCount: this.interactionHistory.length,
        interactionDensity: this.calculateInteractionDensity(),
        patternComplexity: this.calculatePatternComplexity(),
        navigationPatterns: this.detectNavigationPatterns(),
        componentGraph: this.serializeComponentGraph(),
        primaryComponents: this.identifyPrimaryComponents(10)
      };
    }
  }]);
}();

/**
 * ML-based Prediction Engine
 * 
 * Core prediction module that analyzes user behavior patterns
 * to predict which components will be needed next.
 */
var PredictionEngine = /*#__PURE__*/function () {
  /**
   * Create a new PredictionEngine instance
   * @param {Object} options - Configuration options
   * @param {number} options.learningRate - Learning rate for model updates
   * @param {string} options.modelType - Type of prediction model to use
   */
  function PredictionEngine() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, PredictionEngine);
    this.options = _objectSpread2({
      learningRate: 0.03,
      modelType: 'probabilistic'
    }, options);

    // Initialize data structures
    this.transitionMatrix = new Map(); // For probabilistic predictions
    this.predictions = new Map(); // Current predictions
    this.confidenceThresholds = {
      high: 0.75,
      medium: 0.40,
      low: 0.20
    };

    // Performance metrics for self-evaluation
    this.metrics = {
      correctPredictions: 0,
      totalPredictions: 0,
      lastAccuracy: 0
    };
  }

  /**
   * Predict which components will be needed based on user behavior
   * @param {Object} userPatterns - Current user behavior patterns
   * @param {Array} registeredComponents - List of registered components
   * @returns {Array} - Component predictions with probabilities
   */
  return _createClass(PredictionEngine, [{
    key: "predictComponentUsage",
    value: function predictComponentUsage(userPatterns, registeredComponents) {
      if (!userPatterns || !registeredComponents) {
        return [];
      }

      // Select prediction method based on configuration
      switch (this.options.modelType) {
        case 'markovChain':
          return this.predictUsingMarkovChain(userPatterns, registeredComponents);
        case 'transformer':
          return this.predictUsingTransformer(userPatterns, registeredComponents);
        case 'probabilistic':
        default:
          return this.predictUsingProbabilistic(userPatterns, registeredComponents);
      }
    }

    /**
     * Predict component usage using probabilistic model
     * Based on the formula: P(c_i|c_j) = N(c_i,c_j) / ∑_k N(c_k,c_j)
     * 
     * @param {Object} userPatterns - Current user behavior patterns
     * @param {Array} registeredComponents - List of registered components
     * @returns {Array} - Component predictions with probabilities
     */
  }, {
    key: "predictUsingProbabilistic",
    value: function predictUsingProbabilistic(userPatterns, registeredComponents) {
      var _this = this;
      var predictions = [];
      var recentInteractions = userPatterns.recentInteractions,
        componentRelationships = userPatterns.componentRelationships,
        primaryComponents = userPatterns.primaryComponents;

      // Update transition matrix with new relationship data
      this.updateTransitionMatrix(componentRelationships);

      // Use recent interactions to identify current context
      var currentComponents = new Set(recentInteractions.slice(0, 3).map(function (interaction) {
        return interaction.componentId;
      }));

      // Generate predictions for each registered component
      registeredComponents.forEach(function (component) {
        var componentId = component.id;

        // Skip components already in current context
        if (currentComponents.has(componentId)) {
          return;
        }
        var probability = 0;
        var confidence = 0;

        // Calculate probability based on component relationships
        currentComponents.forEach(function (currentId) {
          // Get transition probability using the conditional probability formula
          var transitionProb = _this.getTransitionProbability(currentId, componentId);

          // Weighted sum of probabilities from different current components
          probability += transitionProb * 0.7;

          // Increase confidence if we have seen this transition before
          if (transitionProb > 0) {
            confidence += 0.3;
          }
        });

        // Incorporate primary component data
        var isPrimaryComponent = primaryComponents.some(function (pc) {
          return pc.componentId === componentId;
        });
        if (isPrimaryComponent) {
          var primaryData = primaryComponents.find(function (pc) {
            return pc.componentId === componentId;
          });

          // Normalize importance score to [0, 0.3] range
          var normalizedImportance = Math.min(primaryData.importance / 10, 0.3);

          // Boost probability based on component importance
          probability += normalizedImportance;
          confidence += 0.2;
        }

        // Ensure probability is in [0, 1] range
        probability = Math.max(0, Math.min(probability, 1));

        // Add prediction if probability exceeds low threshold
        if (probability > _this.confidenceThresholds.low) {
          predictions.push({
            componentId: componentId,
            probability: probability,
            confidence: confidence,
            priority: _this.getPriorityFromProbability(probability)
          });
        }
      });

      // Sort by probability (highest first)
      return predictions.sort(function (a, b) {
        return b.probability - a.probability;
      });
    }

    /**
     * Update the transition matrix with new relationship data
     * @param {Array} relationships - Component relationship data
     */
  }, {
    key: "updateTransitionMatrix",
    value: function updateTransitionMatrix(relationships) {
      var _this2 = this;
      relationships.forEach(function (relationship) {
        var source = relationship.source,
          target = relationship.target,
          weight = relationship.weight;

        // Initialize source map if it doesn't exist
        if (!_this2.transitionMatrix.has(source)) {
          _this2.transitionMatrix.set(source, new Map());
        }
        var sourceMap = _this2.transitionMatrix.get(source);
        var currentWeight = sourceMap.get(target) || 0;

        // Update weight using exponential moving average with learning rate
        var newWeight = currentWeight * (1 - _this2.options.learningRate) + weight * _this2.options.learningRate;
        sourceMap.set(target, newWeight);
      });

      // Normalize transition probabilities
      this.normalizeTransitionMatrix();
    }

    /**
     * Normalize the transition matrix so probabilities sum to 1
     */
  }, {
    key: "normalizeTransitionMatrix",
    value: function normalizeTransitionMatrix() {
      this.transitionMatrix.forEach(function (transitions, sourceId) {
        var total = Array.from(transitions.values()).reduce(function (sum, val) {
          return sum + val;
        }, 0);
        if (total > 0) {
          transitions.forEach(function (value, targetId) {
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
  }, {
    key: "getTransitionProbability",
    value: function getTransitionProbability(sourceId, targetId) {
      var sourceTransitions = this.transitionMatrix.get(sourceId);
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
  }, {
    key: "getPriorityFromProbability",
    value: function getPriorityFromProbability(probability) {
      if (probability >= this.confidenceThresholds.high) {
        return 'high';
      } else if (probability >= this.confidenceThresholds.medium) {
        return 'medium';
      } else {
        return 'low';
      }
    }

    /**
     * Predict component usage using Markov Chain model
     * This method considers sequences of component usage rather than
     * just pairwise relationships
     * 
     * @param {Object} userPatterns - Current user behavior patterns
     * @param {Array} registeredComponents - List of registered components
     * @returns {Array} - Component predictions with probabilities
     */
  }, {
    key: "predictUsingMarkovChain",
    value: function predictUsingMarkovChain(userPatterns, registeredComponents) {
      var _this3 = this;
      // Implementation of Markov Chain prediction
      // This is a more sophisticated version of probabilistic prediction
      // that considers sequences of states

      var predictions = [];
      var recentInteractions = userPatterns.recentInteractions;

      // Create a sequence of recently used components (states)
      var recentSequence = recentInteractions.slice(0, 5).map(function (interaction) {
        return interaction.componentId;
      });

      // Get target components (excluding those in recent sequence)
      var targetComponents = registeredComponents.filter(function (component) {
        return !recentSequence.includes(component.id);
      });

      // For each target component, calculate transition probability
      // based on sequence history
      targetComponents.forEach(function (component) {
        var componentId = component.id;
        var probability = 0;

        // Implementation would use n-gram analysis of sequences
        // with back-off to lower-order models when needed

        // For this implementation, we'll use the probabilistic model
        // as a fallback since full Markov Chain requires more state
        probability = _this3.calculateMarkovProbability(recentSequence, componentId);
        if (probability > _this3.confidenceThresholds.low) {
          predictions.push({
            componentId: componentId,
            probability: probability,
            confidence: Math.min(probability + 0.1, 1),
            priority: _this3.getPriorityFromProbability(probability)
          });
        }
      });
      return predictions.sort(function (a, b) {
        return b.probability - a.probability;
      });
    }

    /**
     * Calculate Markov Chain transition probability
     * @param {Array} sequence - Sequence of component IDs
     * @param {string} targetId - Target component ID
     * @returns {number} - Transition probability
     */
  }, {
    key: "calculateMarkovProbability",
    value: function calculateMarkovProbability(sequence, targetId) {
      // Simplified implementation using first-order Markov model
      // A full implementation would use higher-order models

      if (sequence.length === 0) {
        return 0;
      }

      // Use the most recent component as the current state
      var currentId = sequence[0];

      // Fall back to the probabilistic model
      return this.getTransitionProbability(currentId, targetId);
    }

    /**
     * Predict component usage using Transformer-based model
     * This is an experimental approach for sequence modeling
     * 
     * @param {Object} userPatterns - Current user behavior patterns
     * @param {Array} registeredComponents - List of registered components
     * @returns {Array} - Component predictions with probabilities
     */
  }, {
    key: "predictUsingTransformer",
    value: function predictUsingTransformer(userPatterns, registeredComponents) {
      var _this4 = this;
      // In a real implementation, this would use a pre-trained transformer model
      // or integrate with a machine learning service

      // For this implementation, we'll use the probabilistic model as a fallback
      var predictions = this.predictUsingProbabilistic(userPatterns, registeredComponents);

      // Apply additional sequence-aware adjustments
      // This simulates the enhanced capabilities of a transformer model
      return predictions.map(function (prediction) {
        prediction.componentId;
          var probability = prediction.probability;

        // Enhance prediction with sequence awareness (simulated)
        var enhancedProbability = Math.min(probability * 1.2, 1.0);
        return _objectSpread2(_objectSpread2({}, prediction), {}, {
          probability: enhancedProbability,
          confidence: Math.min(enhancedProbability + 0.15, 1),
          priority: _this4.getPriorityFromProbability(enhancedProbability),
          model: 'transformer'
        });
      });
    }

    /**
     * Update prediction metrics based on actual component usage
     * @param {string} componentId - Component that was actually used
     */
  }, {
    key: "updateMetrics",
    value: function updateMetrics(componentId) {
      // Increment total predictions counter
      this.metrics.totalPredictions++;

      // Check if this component was predicted
      var prediction = this.predictions.get(componentId);
      if (prediction) {
        // This was a correct prediction
        this.metrics.correctPredictions++;
      }

      // Update accuracy
      this.metrics.lastAccuracy = this.metrics.correctPredictions / this.metrics.totalPredictions;

      // Adjust confidence thresholds based on accuracy trend
      this.adjustConfidenceThresholds();
    }

    /**
     * Dynamically adjust confidence thresholds based on prediction performance
     */
  }, {
    key: "adjustConfidenceThresholds",
    value: function adjustConfidenceThresholds() {
      // Only adjust after sufficient predictions
      if (this.metrics.totalPredictions < 50) {
        return;
      }

      // If accuracy is high, we can be more aggressive with preloading
      // by lowering thresholds
      if (this.metrics.lastAccuracy > 0.85) {
        this.confidenceThresholds.high = Math.max(this.confidenceThresholds.high * 0.95, 0.6);
        this.confidenceThresholds.medium = Math.max(this.confidenceThresholds.medium * 0.95, 0.3);
        this.confidenceThresholds.low = Math.max(this.confidenceThresholds.low * 0.95, 0.1);
      }
      // If accuracy is low, be more conservative with predictions
      else if (this.metrics.lastAccuracy < 0.65) {
        this.confidenceThresholds.high = Math.min(this.confidenceThresholds.high * 1.05, 0.9);
        this.confidenceThresholds.medium = Math.min(this.confidenceThresholds.medium * 1.05, 0.6);
        this.confidenceThresholds.low = Math.min(this.confidenceThresholds.low * 1.05, 0.3);
      }
    }

    /**
     * Get current prediction metrics
     * @returns {Object} - Current prediction metrics
     */
  }, {
    key: "getMetrics",
    value: function getMetrics() {
      return {
        totalPredictions: this.metrics.totalPredictions,
        correctPredictions: this.metrics.correctPredictions,
        accuracy: this.metrics.lastAccuracy,
        confidenceThresholds: _objectSpread2({}, this.confidenceThresholds)
      };
    }

    /**
     * Reset prediction engine state
     */
  }, {
    key: "reset",
    value: function reset() {
      this.transitionMatrix = new Map();
      this.predictions = new Map();
      this.metrics = {
        correctPredictions: 0,
        totalPredictions: 0,
        lastAccuracy: 0
      };
      // Reset confidence thresholds to defaults
      this.confidenceThresholds = {
        high: 0.75,
        medium: 0.40,
        low: 0.20
      };
    }
  }]);
}();

/**
 * Dynamic Component Loader
 * 
 * Manages the loading of components based on predictions and
 * system conditions, optimizing resource utilization.
 */
var DynamicComponentLoader = /*#__PURE__*/function () {
  /**
   * Create a new DynamicComponentLoader instance
   * @param {Object} options - Configuration options
   * @param {boolean} options.networkAdaptation - Whether to adapt to network conditions
   * @param {number} options.preloadBatchSize - Maximum components to preload at once
   * @param {boolean} options.usePriority - Whether to use priority-based loading
   */
  function DynamicComponentLoader() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, DynamicComponentLoader);
    this.options = _objectSpread2({
      networkAdaptation: true,
      preloadBatchSize: 3,
      usePriority: true
    }, options);

    // Initialize data structures
    this.registeredComponents = new Map();
    this.loadingQueue = {
      high: new Set(),
      medium: new Set(),
      low: new Set()
    };
    this.loadedComponents = new Set();
    this.loadingComponents = new Set();
    this.networkConditions = {
      type: '4g',
      effectiveType: '4g',
      downlink: 10,
      rtt: 50
    };

    // Resource hints registry
    this.resourceHints = new Map();

    // Initialize metrics
    this.metrics = {
      loadedComponentCount: 0,
      preloadedComponentCount: 0,
      usedPreloadedCount: 0,
      networkSavings: 0
    };
  }

  /**
   * Register a component with the loader
   * @param {string} componentId - ID of the component
   * @param {Object} componentData - Metadata about the component
   */
  return _createClass(DynamicComponentLoader, [{
    key: "registerComponent",
    value: function registerComponent(componentId, componentData) {
      // Store component metadata
      this.registeredComponents.set(componentId, _objectSpread2({
        id: componentId,
        module: componentData.module,
        size: componentData.size || 0,
        dependencies: componentData.dependencies || [],
        importance: componentData.importance || 'normal',
        priority: 'medium'
      }, componentData));
    }

    /**
     * Update loading priorities based on predictions
     * @param {Array} predictions - Component predictions with probabilities
     */
  }, {
    key: "updateLoadingPriorities",
    value: function updateLoadingPriorities(predictions) {
      var _this = this;
      // Reset queues
      this.loadingQueue.high.clear();
      this.loadingQueue.medium.clear();
      this.loadingQueue.low.clear();

      // Update component priorities based on predictions
      predictions.forEach(function (prediction) {
        var componentId = prediction.componentId,
          priority = prediction.priority;

        // Skip already loaded components
        if (_this.loadedComponents.has(componentId) || _this.loadingComponents.has(componentId)) {
          return;
        }

        // Update component priority
        var component = _this.registeredComponents.get(componentId);
        if (component) {
          component.priority = priority;
          _this.loadingQueue[priority].add(componentId);
        }
      });

      // Process loading queue based on current conditions
      this.processLoadingQueue();
    }

    /**
     * Process the loading queue, taking into account system conditions
     */
  }, {
    key: "processLoadingQueue",
    value: function processLoadingQueue() {
      // Determine how many components to preload based on network conditions
      var batchSize = this.calculateBatchSize();
      var remainingSlots = batchSize;

      // Process queue by priority
      for (var _i = 0, _arr = ['high', 'medium', 'low']; _i < _arr.length; _i++) {
        var priority = _arr[_i];
        if (remainingSlots <= 0) break;

        // Get up to remainingSlots components from this priority queue
        var componentsToLoad = Array.from(this.loadingQueue[priority]).slice(0, remainingSlots);
        var _iterator = _createForOfIteratorHelper(componentsToLoad),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var componentId = _step.value;
            this.loadComponent(componentId, priority);
            remainingSlots--;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    }

    /**
     * Calculate appropriate batch size based on network conditions
     * @returns {number} - Number of components to preload at once
     */
  }, {
    key: "calculateBatchSize",
    value: function calculateBatchSize() {
      if (!this.options.networkAdaptation) {
        return this.options.preloadBatchSize;
      }

      // Adjust batch size based on network quality
      var _this$networkConditio = this.networkConditions,
        effectiveType = _this$networkConditio.effectiveType;
        _this$networkConditio.downlink;

      // Base size on network type
      switch (effectiveType) {
        case '4g':
          return this.options.preloadBatchSize;
        case '3g':
          return Math.max(1, Math.floor(this.options.preloadBatchSize * 0.7));
        case '2g':
        case 'slow-2g':
          return 1;
        default:
          return this.options.preloadBatchSize;
      }
    }

    /**
     * Load a component with specified priority
     * @param {string} componentId - ID of the component to load
     * @param {string} priority - Priority level (high, medium, low)
     */
  }, {
    key: "loadComponent",
    value: function loadComponent(componentId) {
      var _this2 = this;
      var priority = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'medium';
      // Skip if already loaded or loading
      if (this.loadedComponents.has(componentId) || this.loadingComponents.has(componentId)) {
        return;
      }
      var component = this.registeredComponents.get(componentId);
      if (!component) {
        console.warn("ReactSmart: Attempted to load unknown component: ".concat(componentId));
        return;
      }

      // Mark as loading
      this.loadingComponents.add(componentId);

      // Determine loading method based on priority
      if (priority === 'high') {
        this.preloadResource(componentId);
      } else if (priority === 'medium') {
        this.preconnectResource(componentId);
      }

      // In a real implementation, this would actually load the component
      // using dynamic imports or a similar mechanism

      // Simulate loading with timeout based on component size and network
      var loadTime = this.calculateLoadTime(component.size || 10);
      setTimeout(function () {
        // Mark as loaded
        _this2.loadedComponents.add(componentId);
        _this2.loadingComponents["delete"](componentId);

        // Remove from loading queues
        _this2.loadingQueue.high["delete"](componentId);
        _this2.loadingQueue.medium["delete"](componentId);
        _this2.loadingQueue.low["delete"](componentId);

        // Update metrics
        _this2.metrics.loadedComponentCount++;
        if (priority === 'high') {
          _this2.metrics.preloadedComponentCount++;
        }

        // Load dependencies if needed
        _this2.loadDependencies(component);

        // Remove resource hints
        _this2.cleanupResourceHints(componentId);
        console.debug("ReactSmart: Loaded component ".concat(componentId, " with ").concat(priority, " priority"));
      }, loadTime);
    }

    /**
     * Load dependencies for a component
     * @param {Object} component - Component object
     */
  }, {
    key: "loadDependencies",
    value: function loadDependencies(component) {
      var _this3 = this;
      if (!component.dependencies || component.dependencies.length === 0) {
        return;
      }

      // Load each dependency with medium priority
      component.dependencies.forEach(function (dependencyId) {
        if (!_this3.loadedComponents.has(dependencyId) && !_this3.loadingComponents.has(dependencyId)) {
          _this3.loadComponent(dependencyId, 'medium');
        }
      });
    }

    /**
     * Calculate estimated load time based on component size and network conditions
     * @param {number} sizeKB - Size of component in KB
     * @returns {number} - Estimated load time in ms
     */
  }, {
    key: "calculateLoadTime",
    value: function calculateLoadTime(sizeKB) {
      if (!this.options.networkAdaptation) {
        return 100; // Default load time
      }
      var _this$networkConditio2 = this.networkConditions,
        downlink = _this$networkConditio2.downlink,
        rtt = _this$networkConditio2.rtt;

      // Basic formula: latency + (size / bandwidth)
      // Convert KB to bits (× 8 × 1024), and Mbps to bps (× 1024 × 1024)
      var latency = rtt || 100;
      var bandwidth = downlink || 1; // Mbps

      var transferTime = sizeKB * 8 * 1024 / (bandwidth * 1024 * 1024) * 1000;
      return latency + transferTime;
    }

    /**
     * Add a preload hint for a high-priority component
     * @param {string} componentId - ID of the component
     */
  }, {
    key: "preloadResource",
    value: function preloadResource(componentId) {
      var component = this.registeredComponents.get(componentId);
      if (!component || !component.module) return;

      // Create and add preload link
      var preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'script';
      preloadLink.href = this.getResourceUrl(component);
      document.head.appendChild(preloadLink);

      // Register for cleanup
      this.resourceHints.set(componentId, preloadLink);
    }

    /**
     * Add a preconnect hint for a medium-priority component
     * @param {string} componentId - ID of the component
     */
  }, {
    key: "preconnectResource",
    value: function preconnectResource(componentId) {
      var component = this.registeredComponents.get(componentId);
      if (!component || !component.module) return;

      // Extract domain from module path
      var domain = this.extractDomain(component);
      if (!domain) return;

      // Create and add preconnect link
      var preconnectLink = document.createElement('link');
      preconnectLink.rel = 'preconnect';
      preconnectLink.href = domain;
      document.head.appendChild(preconnectLink);

      // Register for cleanup
      this.resourceHints.set(componentId, preconnectLink);
    }

    /**
     * Clean up resource hints for a component
     * @param {string} componentId - ID of the component
     */
  }, {
    key: "cleanupResourceHints",
    value: function cleanupResourceHints(componentId) {
      var hint = this.resourceHints.get(componentId);
      if (hint) {
        // Remove from DOM
        hint.parentNode.removeChild(hint);
        // Remove from registry
        this.resourceHints["delete"](componentId);
      }
    }

    /**
     * Extract domain from a component's module path
     * @param {Object} component - Component object
     * @returns {string|null} - Domain URL or null
     */
  }, {
    key: "extractDomain",
    value: function extractDomain(component) {
      try {
        // This is a simplified implementation
        // In practice, you would need to handle various module formats
        if (component.module && typeof component.module === 'string' && component.module.startsWith('http')) {
          var url = new URL(component.module);
          return "".concat(url.protocol, "//").concat(url.hostname);
        }
        return null;
      } catch (error) {
        return null;
      }
    }

    /**
     * Get resource URL for a component
     * @param {Object} component - Component object
     * @returns {string} - Resource URL
     */
  }, {
    key: "getResourceUrl",
    value: function getResourceUrl(component) {
      // In a real implementation, this would generate the correct
      // chunk URL based on the component and build configuration
      return component.module || "/".concat(component.id, ".chunk.js");
    }

    /**
     * Update network conditions
     * @param {Object} conditions - Current network conditions
     */
  }, {
    key: "setNetworkConditions",
    value: function setNetworkConditions(conditions) {
      this.networkConditions = conditions;

      // Re-process loading queue with new conditions
      if (this.options.networkAdaptation) {
        this.processLoadingQueue();
      }
    }

    /**
     * Mark a component as used after it was preloaded
     * @param {string} componentId - ID of the component
     */
  }, {
    key: "markComponentUsed",
    value: function markComponentUsed(componentId) {
      if (this.loadedComponents.has(componentId)) {
        // Calculate network savings if we preloaded this component
        var component = this.registeredComponents.get(componentId);
        if (component && component.size) {
          this.metrics.usedPreloadedCount++;
          this.metrics.networkSavings += component.size;
        }
      }
    }

    /**
     * Get the current priority of a component
     * @param {string} componentId - ID of the component
     * @returns {string} - Priority level (high, medium, low)
     */
  }, {
    key: "getComponentPriority",
    value: function getComponentPriority(componentId) {
      var component = this.registeredComponents.get(componentId);
      return component ? component.priority : 'medium';
    }

    /**
     * Check if a component is loaded
     * @param {string} componentId - ID of the component
     * @returns {boolean} - Whether the component is loaded
     */
  }, {
    key: "isComponentLoaded",
    value: function isComponentLoaded(componentId) {
      return this.loadedComponents.has(componentId);
    }

    /**
     * Get all registered components
     * @returns {Array} - List of registered components
     */
  }, {
    key: "getRegisteredComponents",
    value: function getRegisteredComponents() {
      return Array.from(this.registeredComponents.values());
    }

    /**
     * Get current loader metrics
     * @returns {Object} - Current metrics
     */
  }, {
    key: "getMetrics",
    value: function getMetrics() {
      var hitRate = this.metrics.preloadedComponentCount > 0 ? this.metrics.usedPreloadedCount / this.metrics.preloadedComponentCount : 0;
      return {
        loadedComponentCount: this.metrics.loadedComponentCount,
        preloadedComponentCount: this.metrics.preloadedComponentCount,
        usedPreloadedCount: this.metrics.usedPreloadedCount,
        preloadHitRate: hitRate,
        networkSavingsKB: this.metrics.networkSavings,
        currentQueueSizes: {
          high: this.loadingQueue.high.size,
          medium: this.loadingQueue.medium.size,
          low: this.loadingQueue.low.size
        }
      };
    }

    /**
     * Reset the loader state
     */
  }, {
    key: "reset",
    value: function reset() {
      this.loadingQueue.high.clear();
      this.loadingQueue.medium.clear();
      this.loadingQueue.low.clear();
      this.loadedComponents.clear();
      this.loadingComponents.clear();

      // Clean up all resource hints
      this.resourceHints.forEach(function (hint) {
        if (hint.parentNode) {
          hint.parentNode.removeChild(hint);
        }
      });
      this.resourceHints.clear();

      // Reset metrics
      this.metrics = {
        loadedComponentCount: 0,
        preloadedComponentCount: 0,
        usedPreloadedCount: 0,
        networkSavings: 0
      };
    }
  }]);
}();

/**
 * Network Utilities
 * 
 * Utilities for detecting and monitoring network conditions
 * to optimize component loading strategies.
 */

/**
 * Detect current network conditions
 * @returns {Object} Network condition information
 */
var detectNetworkConditions = function detectNetworkConditions() {
  // Default network condition values
  var defaultConditions = {
    type: '4g',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false,
    online: true
  };

  // Use Network Information API if available
  if (navigator.connection) {
    var connection = navigator.connection;
    return {
      type: connection.type || defaultConditions.type,
      effectiveType: connection.effectiveType || defaultConditions.effectiveType,
      downlink: connection.downlink || defaultConditions.downlink,
      rtt: connection.rtt || defaultConditions.rtt,
      saveData: connection.saveData || defaultConditions.saveData,
      online: navigator.onLine
    };
  }

  // If Network Information API is not available, estimate based on
  // navigator.onLine and potentially performance.timing metrics
  return _objectSpread2(_objectSpread2({}, defaultConditions), {}, {
    online: navigator.onLine
  });
};

/**
 * Categorize network quality based on conditions
 * @param {Object} conditions - Network conditions
 * @returns {string} Network quality category ('excellent', 'good', 'fair', 'poor', 'offline')
 */
var categorizeNetworkQuality = function categorizeNetworkQuality(conditions) {
  if (!conditions) {
    conditions = detectNetworkConditions();
  }
  var _conditions = conditions,
    effectiveType = _conditions.effectiveType,
    downlink = _conditions.downlink,
    rtt = _conditions.rtt,
    online = _conditions.online;

  // Check if offline
  if (!online) {
    return 'offline';
  }

  // Categorize based on effective connection type if available
  if (effectiveType) {
    switch (effectiveType) {
      case '4g':
        return 'excellent';
      case '3g':
        return 'good';
      case '2g':
        return 'fair';
      case 'slow-2g':
        return 'poor';
    }
  }

  // Categorize based on downlink and RTT
  if (downlink && rtt) {
    if (downlink >= 5 && rtt < 100) {
      return 'excellent';
    } else if (downlink >= 2 && rtt < 200) {
      return 'good';
    } else if (downlink >= 0.5 && rtt < 400) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  // Fallback: categorize based on downlink only
  if (downlink) {
    if (downlink >= 5) return 'excellent';
    if (downlink >= 2) return 'good';
    if (downlink >= 0.5) return 'fair';
    return 'poor';
  }

  // Fallback: categorize based on RTT only
  if (rtt) {
    if (rtt < 100) return 'excellent';
    if (rtt < 200) return 'good';
    if (rtt < 400) return 'fair';
    return 'poor';
  }

  // If we can't determine, assume 'good'
  return 'good';
};

/**
 * Storage Utilities
 * 
 * Utilities for managing persistent storage of user interaction data,
 * prediction models, and component metrics in a privacy-conscious way.
 */

// Constants
var STORAGE_KEYS = {
  INTERACTION_DATA: 'reactsmart_interactions',
  COMPONENT_USAGE: 'reactsmart_component_usage',
  PREDICTION_MODEL: 'reactsmart_prediction_model',
  USER_PREFERENCES: 'reactsmart_user_prefs',
  SESSION_ID: 'reactsmart_session_id',
  LAST_CLEANUP: 'reactsmart_last_cleanup'
};
var DEFAULT_EXPIRY = 30; // days

/**
 * Initialize storage for ReactSmart
 * Ensures required storage structures exist
 */
var initializeStorage = function initializeStorage() {
  try {
    // Check if localStorage is available
    if (!isLocalStorageAvailable()) {
      console.warn('ReactSmart: localStorage is not available, using in-memory storage');
      window._reactSmartMemoryStorage = window._reactSmartMemoryStorage || {};
      return false;
    }

    // Initialize interaction data if it doesn't exist
    if (!localStorage.getItem(STORAGE_KEYS.INTERACTION_DATA)) {
      localStorage.setItem(STORAGE_KEYS.INTERACTION_DATA, JSON.stringify([]));
    }

    // Initialize component usage data if it doesn't exist
    if (!localStorage.getItem(STORAGE_KEYS.COMPONENT_USAGE)) {
      localStorage.setItem(STORAGE_KEYS.COMPONENT_USAGE, JSON.stringify({}));
    }

    // Initialize session ID if it doesn't exist
    if (!localStorage.getItem(STORAGE_KEYS.SESSION_ID)) {
      var sessionId = generateSessionId();
      localStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
    }

    // Record last cleanup time if it doesn't exist
    if (!localStorage.getItem(STORAGE_KEYS.LAST_CLEANUP)) {
      localStorage.setItem(STORAGE_KEYS.LAST_CLEANUP, Date.now().toString());
    }
    return true;
  } catch (error) {
    console.error('ReactSmart: Error initializing storage', error);
    return false;
  }
};

/**
 * Check if localStorage is available
 * @returns {boolean} Whether localStorage is available
 */
var isLocalStorageAvailable = function isLocalStorageAvailable() {
  try {
    var testKey = 'reactsmart_test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Generate a unique session ID
 * @returns {string} Unique session ID
 */
var generateSessionId = function generateSessionId() {
  return "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
};

/**
 * Clean up old data based on retention policy
 * @param {number} retentionDays - Number of days to retain data
 */
var cleanupOldData = function cleanupOldData() {
  var retentionDays = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DEFAULT_EXPIRY;
  try {
    // Check if we need to run cleanup
    // (Only run once per day to avoid unnecessary processing)
    var now = Date.now();
    var lastCleanup = 0;
    if (isLocalStorageAvailable()) {
      lastCleanup = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_CLEANUP) || '0', 10);
    } else {
      var _window$_reactSmartMe6;
      lastCleanup = ((_window$_reactSmartMe6 = window._reactSmartMemoryStorage) === null || _window$_reactSmartMe6 === void 0 ? void 0 : _window$_reactSmartMe6.lastCleanup) || 0;
    }
    var daysSinceLastCleanup = (now - lastCleanup) / (1000 * 60 * 60 * 24);

    // Skip if cleaned up in the last day
    if (daysSinceLastCleanup < 1) {
      return;
    }

    // Calculate retention threshold
    var retentionThreshold = now - retentionDays * 24 * 60 * 60 * 1000;
    if (isLocalStorageAvailable()) {
      // Clean up interaction data
      var interactionsJson = localStorage.getItem(STORAGE_KEYS.INTERACTION_DATA);
      if (interactionsJson) {
        var interactions = JSON.parse(interactionsJson);
        var filteredInteractions = interactions.filter(function (interaction) {
          return (interaction.timestamp || 0) >= retentionThreshold;
        });
        localStorage.setItem(STORAGE_KEYS.INTERACTION_DATA, JSON.stringify(filteredInteractions));
      }

      // Clean up component usage data
      var usageJson = localStorage.getItem(STORAGE_KEYS.COMPONENT_USAGE);
      if (usageJson) {
        var usage = JSON.parse(usageJson);
        Object.keys(usage).forEach(function (componentId) {
          // Remove components not used since threshold
          if ((usage[componentId].lastUsed || 0) < retentionThreshold) {
            delete usage[componentId];
          }
        });
        localStorage.setItem(STORAGE_KEYS.COMPONENT_USAGE, JSON.stringify(usage));
      }

      // Update last cleanup time
      localStorage.setItem(STORAGE_KEYS.LAST_CLEANUP, now.toString());
    } else {
      var _window$_reactSmartMe7, _window$_reactSmartMe8;
      // Clean up in-memory storage
      if ((_window$_reactSmartMe7 = window._reactSmartMemoryStorage) !== null && _window$_reactSmartMe7 !== void 0 && _window$_reactSmartMe7.interactions) {
        window._reactSmartMemoryStorage.interactions = window._reactSmartMemoryStorage.interactions.filter(function (interaction) {
          return (interaction.timestamp || 0) >= retentionThreshold;
        });
      }
      if ((_window$_reactSmartMe8 = window._reactSmartMemoryStorage) !== null && _window$_reactSmartMe8 !== void 0 && _window$_reactSmartMe8.componentUsage) {
        Object.keys(window._reactSmartMemoryStorage.componentUsage).forEach(function (componentId) {
          // Remove components not used since threshold
          if ((window._reactSmartMemoryStorage.componentUsage[componentId].lastUsed || 0) < retentionThreshold) {
            delete window._reactSmartMemoryStorage.componentUsage[componentId];
          }
        });
      }

      // Update last cleanup time
      window._reactSmartMemoryStorage.lastCleanup = now;
    }
  } catch (error) {
    console.error('ReactSmart: Error cleaning up old data', error);
  }
};

/**
 * Privacy Utilities
 * 
 * Utilities for handling user data in a privacy-preserving manner,
 * including anonymization, consent management, and compliance with
 * privacy regulations.
 */

// Privacy compliance modes
var COMPLIANCE_MODES = {
  GDPR: 'gdpr',
  // European Union General Data Protection Regulation
  CCPA: 'ccpa',
  // California Consumer Privacy Act
  LGPD: 'lgpd',
  // Brazil's Lei Geral de Proteção de Dados
  PIPEDA: 'pipeda',
  // Canada's Personal Information Protection and Electronic Documents Act
  MINIMAL: 'minimal' // Most restrictive mode with minimal data collection
};

// Default configuration
var DEFAULT_CONFIG = {
  anonymizeIp: true,
  minimizeData: true,
  hashUserIds: true,
  complianceMode: COMPLIANCE_MODES.GDPR,
  retentionPeriodDays: 30,
  storageQuotaKB: 100
};

// Current privacy configuration
var privacyConfig = _objectSpread2({}, DEFAULT_CONFIG);

/**
 * Anonymize user interaction data based on privacy settings
 * @param {Object} interactionData - Raw interaction data
 * @returns {Object} Anonymized interaction data
 */
var anonymizeInteractionData = function anonymizeInteractionData(interactionData) {
  if (!interactionData) return {};

  // Create a copy of the data to avoid modifying the original
  var anonymized = _objectSpread2({}, interactionData);

  // Anonymize IP address if enabled
  if (privacyConfig.anonymizeIp && anonymized.userIp) {
    anonymized.userIp = anonymizeIp(anonymized.userIp);
  }

  // Hash user IDs if enabled
  if (privacyConfig.hashUserIds && anonymized.userId) {
    anonymized.userId = hashIdentifier(anonymized.userId);
  }

  // Minimize data if enabled
  if (privacyConfig.minimizeData) {
    // Remove unnecessary fields based on compliance mode
    applyDataMinimization(anonymized);
  }

  // Add privacy metadata
  anonymized._privacy = {
    anonymized: true,
    complianceMode: privacyConfig.complianceMode,
    processingTime: Date.now()
  };
  return anonymized;
};

/**
 * Anonymize an IP address (keep only the network part)
 * @param {string} ip - IP address to anonymize
 * @returns {string} Anonymized IP address
 */
var anonymizeIp = function anonymizeIp(ip) {
  if (!ip) return null;
  try {
    // IPv4 address
    if (ip.includes('.')) {
      // Keep only first 3 octets for IPv4, replace last octet with 0
      var parts = ip.split('.');
      if (parts.length === 4) {
        return "".concat(parts[0], ".").concat(parts[1], ".").concat(parts[2], ".0");
      }
    }
    // IPv6 address
    else if (ip.includes(':')) {
      // Keep only first 4 segments for IPv6, replace rest with zeroes
      var _parts = ip.split(':');
      return _parts.slice(0, 4).join(':') + '::0';
    }
    return null;
  } catch (error) {
    console.error('Error anonymizing IP address:', error);
    return null;
  }
};

/**
 * Hash an identifier (such as user ID) for anonymization
 * @param {string} identifier - Identifier to hash
 * @returns {string} Hashed identifier
 */
var hashIdentifier = function hashIdentifier(identifier) {
  if (!identifier) return null;
  try {
    // Simple hash function (for a real implementation, use a cryptographic hash)
    // This is a basic implementation of a non-reversible hash function
    // In production, you would use a more secure method like SHA-256

    // Convert string to a numeric hash code
    var hash = 0;
    for (var i = 0; i < identifier.length; i++) {
      var _char = identifier.charCodeAt(i);
      hash = (hash << 5) - hash + _char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to hex string and add prefix to indicate it's hashed
    return 'h_' + (hash >>> 0).toString(16).padStart(8, '0');
  } catch (error) {
    console.error('Error hashing identifier:', error);
    return 'h_unknown';
  }
};

/**
 * Apply data minimization based on compliance mode
 * @param {Object} data - Data to minimize
 */
var applyDataMinimization = function applyDataMinimization(data) {
  // Fields to remove for all compliance modes
  var sensitiveFields = ['password', 'ssn', 'socialSecurityNumber', 'creditCard', 'creditCardNumber', 'cvv', 'pin', 'passportNumber', 'driverLicense', 'healthData'];

  // Remove sensitive fields
  sensitiveFields.forEach(function (field) {
    if (field in data) {
      delete data[field];
    }
  });

  // Apply compliance-specific data minimization
  switch (privacyConfig.complianceMode) {
    case COMPLIANCE_MODES.GDPR:
      applyGdprMinimization(data);
      break;
    case COMPLIANCE_MODES.CCPA:
      applyCcpaMinimization(data);
      break;
    case COMPLIANCE_MODES.MINIMAL:
      applyMinimalDataCollection(data);
      break;
    // Other compliance modes handled similarly
    default:
      applyGdprMinimization(data);
    // Default to GDPR as it's generally strict
  }
};

/**
 * Apply GDPR-specific data minimization
 * @param {Object} data - Data to minimize
 */
var applyGdprMinimization = function applyGdprMinimization(data) {
  // Fields to remove or anonymize under GDPR
  var gdprSensitiveFields = ['fullName', 'firstName', 'lastName', 'address', 'postCode', 'zipCode', 'phoneNumber', 'emailAddress', 'dateOfBirth', 'birthDate', 'age', 'gender', 'race', 'ethnicity', 'religion', 'politicalOpinion', 'preciseLocation', 'deviceId', 'advertisingId'];

  // Remove GDPR-sensitive fields
  gdprSensitiveFields.forEach(function (field) {
    if (field in data) {
      delete data[field];
    }
  });

  // Generalize location data if present
  if (data.location && _typeof(data.location) === 'object') {
    // Remove precise coordinates
    if (data.location.coordinates) {
      delete data.location.coordinates;
    }

    // Keep only country and region, remove city and more specific info
    if (data.location.city) {
      delete data.location.city;
    }
    if (data.location.postalCode) {
      delete data.location.postalCode;
    }
    if (data.location.street) {
      delete data.location.street;
    }
  }
};

/**
 * Apply CCPA-specific data minimization
 * @param {Object} data - Data to minimize
 */
var applyCcpaMinimization = function applyCcpaMinimization(data) {
  // Similar to GDPR but with CCPA-specific requirements
  // For this implementation, we'll use the same approach as GDPR
  // In a production system, you would implement CCPA-specific rules
  applyGdprMinimization(data);
};

/**
 * Apply minimal data collection policy
 * @param {Object} data - Data to minimize
 */
var applyMinimalDataCollection = function applyMinimalDataCollection(data) {
  // Keep only essential data for functionality
  var allowedFields = ['timestamp', 'componentId', 'eventType', 'sessionId'];

  // Remove all fields except allowed ones
  Object.keys(data).forEach(function (key) {
    if (!allowedFields.includes(key) && !key.startsWith('_')) {
      delete data[key];
    }
  });
};

var ReactSmartContext = /*#__PURE__*/createContext({
  trackInteraction: function trackInteraction() {},
  registerComponent: function registerComponent() {},
  preloadComponent: function preloadComponent() {},
  getLoadingPriority: function getLoadingPriority() {
    return 'medium';
  },
  networkStatus: {
    type: '4g',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50
  },
  isInitialized: false
});

/**
 * Main provider component that initializes ReactSmart and provides
 * context to child components.
 */
var ReactSmartProvider = function ReactSmartProvider(_ref) {
  var children = _ref.children,
    _ref$options = _ref.options,
    options = _ref$options === void 0 ? {
      networkAdaptation: true,
      learningRate: 0.03,
      anonymizeData: true,
      privacyCompliance: 'gdpr',
      dataRetentionDays: 30,
      disabled: false,
      predictionModel: 'probabilistic',
      debug: false,
      logLevel: 'warn',
      maxConcurrentLoads: 5,
      maxCacheSize: 50,
      compatibility: 'modern'
    } : _ref$options;
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isInitialized = _useState2[0],
    setIsInitialized = _useState2[1];
  var _useState3 = useState({
      type: '4g',
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
      online: true
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    networkStatus = _useState4[0],
    setNetworkStatus = _useState4[1];

  // Create refs for core modules to preserve instances
  var behaviorAnalysis = useRef(null);
  var predictionEngine = useRef(null);
  var componentLoader = useRef(null);
  var predictionWorker = useRef(null);

  // Debugging logger
  var logger = useRef({
    debug: function debug() {
      var _console;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      return options.debug && options.logLevel === 'debug' && (_console = console).debug.apply(_console, ['[ReactSmart]'].concat(args));
    },
    info: function info() {
      var _console2;
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      return options.debug && ['debug', 'info'].includes(options.logLevel) && (_console2 = console).info.apply(_console2, ['[ReactSmart]'].concat(args));
    },
    warn: function warn() {
      var _console3;
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      return options.debug && ['debug', 'info', 'warn'].includes(options.logLevel) && (_console3 = console).warn.apply(_console3, ['[ReactSmart]'].concat(args));
    },
    error: function error() {
      var _console4;
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      return (_console4 = console).error.apply(_console4, ['[ReactSmart]'].concat(args));
    }
  }).current;

  // Initialize ReactSmart on component mount
  useEffect(function () {
    if (options.disabled) {
      logger.info('ReactSmart is disabled by configuration');
      return;
    }
    logger.info('Initializing ReactSmart with options:', options);

    // Initialize storage
    initializeStorage();

    // Clean up old data according to retention policy
    cleanupOldData(options.dataRetentionDays || 30);

    // Initialize core modules
    behaviorAnalysis.current = new BehaviorAnalysis({
      anonymizeData: options.anonymizeData,
      privacyCompliance: options.privacyCompliance
    });

    // Create prediction engine based on selected model
    predictionEngine.current = new PredictionEngine({
      learningRate: options.learningRate || 0.03,
      modelType: options.predictionModel || 'probabilistic'
    });
    componentLoader.current = new DynamicComponentLoader({
      networkAdaptation: options.networkAdaptation,
      preloadBatchSize: options.maxConcurrentLoads || 5,
      maxCacheSize: options.maxCacheSize || 50
    });

    // Initialize prediction worker if browser supports it and not in compatibility mode
    if (window.Worker && options.compatibility !== 'legacy') {
      try {
        predictionWorker.current = new Worker(new URL('../workers/prediction-worker.js', import.meta.url));
        predictionWorker.current.onmessage = function (e) {
          var _e$data = e.data,
            type = _e$data.type,
            predictions = _e$data.predictions,
            error = _e$data.error;
          if (type === 'error') {
            logger.error('Prediction worker error:', error);
            return;
          }
          if (type === 'predictions' && predictions) {
            logger.debug('Received predictions from worker:', predictions.length);
            componentLoader.current.updateLoadingPriorities(predictions);
          }
        };

        // Configure worker
        predictionWorker.current.postMessage({
          action: 'configure',
          options: {
            learningRate: options.learningRate,
            modelType: options.predictionModel
          }
        });
        logger.info('Prediction worker initialized successfully');
      } catch (error) {
        logger.error('Failed to initialize prediction worker:', error);
        logger.info('Falling back to main thread predictions');
      }
    } else {
      logger.info(window.Worker ? 'Running in legacy compatibility mode, prediction will run on main thread' : 'Web Workers not supported in this browser, prediction will run on main thread');
    }

    // Monitor network conditions if enabled
    if (options.networkAdaptation) {
      var updateNetworkStatus = function updateNetworkStatus() {
        var conditions = detectNetworkConditions();
        setNetworkStatus(conditions);
        if (componentLoader.current) {
          componentLoader.current.setNetworkConditions(conditions);
        }
        logger.debug('Network conditions updated:', conditions);
      };

      // Initial check
      updateNetworkStatus();

      // Set up network monitoring
      if (navigator.connection) {
        navigator.connection.addEventListener('change', updateNetworkStatus);
        logger.debug('Network Information API available, monitoring network changes');
      } else {
        logger.debug('Network Information API not available, using fallback polling');
      }

      // Periodic checking as fallback
      var networkCheckInterval = setInterval(updateNetworkStatus, 30000);

      // Online/offline events
      window.addEventListener('online', function () {
        logger.info('Device went online');
        updateNetworkStatus();
      });
      window.addEventListener('offline', function () {
        logger.info('Device went offline');
        updateNetworkStatus();
      });
      return function () {
        if (navigator.connection) {
          navigator.connection.removeEventListener('change', updateNetworkStatus);
        }
        clearInterval(networkCheckInterval);
        window.removeEventListener('online', updateNetworkStatus);
        window.removeEventListener('offline', updateNetworkStatus);
      };
    }

    // Make the instance available globally for debugging and metrics
    if (options.debug) {
      window.__REACTSMART_INSTANCE__ = {
        behaviorAnalysis: behaviorAnalysis.current,
        predictionEngine: predictionEngine.current,
        componentLoader: componentLoader.current,
        options: options,
        version: '1.0.0'
      };
      logger.info('Debug mode enabled, instance available at window.__REACTSMART_INSTANCE__');
    }
    setIsInitialized(true);
    logger.info('ReactSmart initialized successfully');
    return function () {
      // Clean up resources
      if (predictionWorker.current) {
        predictionWorker.current.terminate();
        logger.debug('Terminated prediction worker');
      }

      // Remove global debug reference
      if (options.debug) {
        delete window.__REACTSMART_INSTANCE__;
      }
      logger.info('ReactSmart cleanup complete');
    };
  }, [options.disabled, options.networkAdaptation, options.anonymizeData, options.privacyCompliance, options.learningRate, options.dataRetentionDays, options.predictionModel, options.debug, options.logLevel, options.maxConcurrentLoads, options.maxCacheSize, options.compatibility, logger]);

  /**
   * Track user interaction with a component
   * @param {string} componentId - ID of the component
   * @param {object} interactionData - Data about the interaction
   */
  var trackInteraction = function trackInteraction(componentId, interactionData) {
    if (!isInitialized || options.disabled) return;
    logger.debug('Tracking interaction:', componentId, interactionData.type);

    // Anonymize data if privacy settings require it
    var processedData = options.anonymizeData ? anonymizeInteractionData(interactionData) : interactionData;

    // Add interaction to behavior analysis
    var interaction = behaviorAnalysis.current.recordInteraction(componentId, processedData);

    // Send data to prediction worker if available
    if (predictionWorker.current) {
      var userPatterns = behaviorAnalysis.current.getCurrentPatterns();
      predictionWorker.current.postMessage({
        action: 'predict',
        userPatterns: userPatterns,
        components: componentLoader.current.getRegisteredComponents()
      });
    } else {
      // Run prediction in main thread if worker not available
      var _userPatterns = behaviorAnalysis.current.getCurrentPatterns();
      var predictions = predictionEngine.current.predictComponentUsage(_userPatterns, componentLoader.current.getRegisteredComponents());
      if (predictions && predictions.length > 0) {
        logger.debug('Generated predictions:', predictions.length);
        componentLoader.current.updateLoadingPriorities(predictions);
      }
    }

    // If this was a component usage event, mark it as used
    if (interactionData.type === 'use' || interactionData.type === 'render') {
      componentLoader.current.markComponentUsed(componentId);
    }
    return interaction;
  };

  /**
   * Register a component with ReactSmart
   * @param {string} componentId - ID of the component
   * @param {object} componentData - Metadata about the component
   */
  var registerComponent = function registerComponent(componentId, componentData) {
    if (!isInitialized || options.disabled) return;
    logger.debug('Registering component:', componentId);
    componentLoader.current.registerComponent(componentId, componentData);
  };

  /**
   * Explicitly preload a component
   * @param {string} componentId - ID of the component to preload
   */
  var preloadComponent = function preloadComponent(componentId) {
    if (!isInitialized || options.disabled) return;
    logger.debug('Explicitly preloading component:', componentId);
    componentLoader.current.loadComponent(componentId, 'high');
  };

  /**
   * Get the current loading priority for a component
   * @param {string} componentId - ID of the component
   * @returns {string} Priority level ('high', 'medium', 'low')
   */
  var getLoadingPriority = function getLoadingPriority(componentId) {
    if (!isInitialized || options.disabled) return 'medium';
    return componentLoader.current.getComponentPriority(componentId);
  };

  /**
   * Check if a component is loaded
   * @param {string} componentId - ID of the component
   * @returns {boolean} Whether the component is loaded
   */
  var isComponentLoaded = function isComponentLoaded(componentId) {
    if (!isInitialized || options.disabled) return false;
    return componentLoader.current.isComponentLoaded(componentId);
  };

  /**
   * Get metrics about ReactSmart's performance
   * @returns {object} Performance metrics
   */
  var getMetrics = function getMetrics() {
    if (!isInitialized || options.disabled) {
      return {
        predictionAccuracy: 0,
        preloadedCount: 0,
        usedPreloadedCount: 0,
        hitRate: 0,
        networkSavingsKB: 0
      };
    }
    var predictionMetrics = predictionEngine.current.getMetrics();
    var loaderMetrics = componentLoader.current.getMetrics();
    return {
      predictionAccuracy: predictionMetrics.lastAccuracy * 100,
      preloadedCount: loaderMetrics.preloadedComponentCount,
      usedPreloadedCount: loaderMetrics.usedPreloadedCount,
      hitRate: loaderMetrics.preloadHitRate * 100,
      networkSavingsKB: loaderMetrics.networkSavingsKB
    };
  };

  // Context value to be provided to consumers
  var contextValue = {
    trackInteraction: trackInteraction,
    registerComponent: registerComponent,
    preloadComponent: preloadComponent,
    getLoadingPriority: getLoadingPriority,
    isComponentLoaded: isComponentLoaded,
    getMetrics: getMetrics,
    networkStatus: networkStatus,
    isInitialized: isInitialized && !options.disabled
  };
  return /*#__PURE__*/jsx(ReactSmartContext.Provider, {
    value: contextValue,
    children: children
  });
};
ReactSmartProvider.propTypes = {
  children: PropTypes.node.isRequired,
  options: PropTypes.shape({
    networkAdaptation: PropTypes.bool,
    learningRate: PropTypes.number,
    anonymizeData: PropTypes.bool,
    privacyCompliance: PropTypes.string,
    dataRetentionDays: PropTypes.number,
    disabled: PropTypes.bool,
    predictionModel: PropTypes.oneOf(['probabilistic', 'markovChain', 'transformer']),
    debug: PropTypes.bool,
    logLevel: PropTypes.oneOf(['debug', 'info', 'warn', 'error']),
    maxConcurrentLoads: PropTypes.number,
    maxCacheSize: PropTypes.number,
    compatibility: PropTypes.oneOf(['modern', 'legacy'])
  })
};

var withReactSmart = function withReactSmart(WrappedComponent) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$analyzeInter = options.analyzeInteractions,
    analyzeInteractions = _options$analyzeInter === void 0 ? true : _options$analyzeInter,
    _options$predictionTh = options.predictionThreshold,
    predictionThreshold = _options$predictionTh === void 0 ? 0.6 : _options$predictionTh,
    _options$preloadDepen = options.preloadDependencies,
    _preloadDependencies = _options$preloadDepen === void 0 ? [] : _options$preloadDepen,
    _options$importance = options.importance,
    importance = _options$importance === void 0 ? 'medium' : _options$importance,
    _options$trackMounts = options.trackMounts,
    trackMounts = _options$trackMounts === void 0 ? true : _options$trackMounts,
    _options$trackClicks = options.trackClicks,
    trackClicks = _options$trackClicks === void 0 ? true : _options$trackClicks,
    _options$trackVisibil = options.trackVisibility,
    trackVisibility = _options$trackVisibil === void 0 ? true : _options$trackVisibil,
    _options$trackHovers = options.trackHovers,
    trackHovers = _options$trackHovers === void 0 ? false : _options$trackHovers;

  // Component display name for better debugging
  var displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  // Create the enhanced component
  var WithReactSmart = /*#__PURE__*/React.forwardRef(function (props, ref) {
    // Get ReactSmart context
    var _useContext = useContext(ReactSmartContext),
      trackInteraction = _useContext.trackInteraction,
      registerComponent = _useContext.registerComponent,
      preloadComponent = _useContext.preloadComponent,
      isInitialized = _useContext.isInitialized;

    // Create references
    var componentRef = useRef(null);
    var rootRef = useRef(null);
    var visibilityObserverRef = useRef(null);
    var mountTimeRef = useRef(null);

    // Generate component ID based on display name and props
    var componentId = "".concat(displayName, ":").concat(props.id || props.key || 'instance');

    // Register component with ReactSmart
    useEffect(function () {
      if (!isInitialized) return;

      // Register this component
      registerComponent(componentId, {
        id: componentId,
        type: 'component',
        importance: importance,
        dependencies: _preloadDependencies,
        size: options.size || 10,
        // Size in KB (estimated if not provided)
        predictionThreshold: predictionThreshold,
        metadata: _objectSpread2({
          displayName: displayName,
          props: Object.keys(props)
        }, options)
      });

      // Register dependencies if any
      _preloadDependencies.forEach(function (depId) {
        registerComponent(depId, {
          id: depId,
          type: 'dependency',
          parentComponent: componentId
        });
      });

      // Track mount event
      if (trackMounts) {
        trackInteraction(componentId, {
          type: 'mount',
          timestamp: Date.now()
        });
        mountTimeRef.current = Date.now();
      }

      // Return cleanup function
      return function () {
        // Track unmount event
        if (trackMounts && mountTimeRef.current) {
          var duration = Date.now() - mountTimeRef.current;
          trackInteraction(componentId, {
            type: 'unmount',
            timestamp: Date.now(),
            duration: duration
          });
        }

        // Disconnect visibility observer if it exists
        if (visibilityObserverRef.current) {
          visibilityObserverRef.current.disconnect();
          visibilityObserverRef.current = null;
        }
      };
    }, [isInitialized, componentId, props.id, props.key]);

    // Set up visibility tracking
    useEffect(function () {
      if (!isInitialized || !analyzeInteractions || !trackVisibility || !rootRef.current) return;

      // Check if Intersection Observer API is available
      if (typeof IntersectionObserver === 'undefined') {
        console.warn("ReactSmart: IntersectionObserver not supported in this browser. Visibility tracking disabled for ".concat(componentId, "."));
        return;
      }

      // Track when component first becomes visible
      var firstVisibleTime = null;

      // Create observer instance
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var timestamp = Date.now();

            // Track first visibility
            if (!firstVisibleTime) {
              firstVisibleTime = timestamp;

              // Track visibility event
              trackInteraction(componentId, {
                type: 'visibility',
                subType: 'visible',
                timestamp: timestamp,
                viewportCoverage: entry.intersectionRatio
              });

              // Preload dependencies when component becomes visible
              _preloadDependencies.forEach(function (depId) {
                preloadComponent(depId);
              });
            }
          } else if (firstVisibleTime) {
            // Component was visible but is now hidden
            var duration = Date.now() - firstVisibleTime;

            // Only track if visible for a meaningful time
            if (duration > 100) {
              trackInteraction(componentId, {
                type: 'visibility',
                subType: 'hidden',
                timestamp: Date.now(),
                duration: duration
              });
            }

            // Reset first visible time
            firstVisibleTime = null;
          }
        });
      }, {
        threshold: [0, 0.2, 0.5, 0.8, 1],
        rootMargin: '0px'
      });

      // Start observing the component
      observer.observe(rootRef.current);
      visibilityObserverRef.current = observer;
      return function () {
        observer.disconnect();
      };
    }, [isInitialized, componentId, analyzeInteractions, trackVisibility, _preloadDependencies]);

    // Set up click tracking
    useEffect(function () {
      if (!isInitialized || !analyzeInteractions || !trackClicks || !rootRef.current) return;
      var element = rootRef.current;
      var handleClick = function handleClick(event) {
        trackInteraction(componentId, {
          type: 'click',
          timestamp: Date.now(),
          target: event.target.tagName,
          position: {
            x: event.clientX,
            y: event.clientY
          }
        });
      };
      element.addEventListener('click', handleClick);
      return function () {
        element.removeEventListener('click', handleClick);
      };
    }, [isInitialized, componentId, analyzeInteractions, trackClicks]);

    // Set up hover tracking if enabled
    useEffect(function () {
      if (!isInitialized || !analyzeInteractions || !trackHovers || !rootRef.current) return;
      var element = rootRef.current;
      var hoverTimeout;
      var hoverStartTime;
      var isHovering = false;
      var handleMouseEnter = function handleMouseEnter() {
        if (!isHovering) {
          isHovering = true;
          hoverStartTime = Date.now();
          trackInteraction(componentId, {
            type: 'hover',
            subType: 'enter',
            timestamp: hoverStartTime
          });
        }
      };
      var handleMouseLeave = function handleMouseLeave() {
        if (isHovering) {
          isHovering = false;
          clearTimeout(hoverTimeout);
          var duration = Date.now() - hoverStartTime;

          // Only track hover if it lasted a significant time
          if (duration > 300) {
            trackInteraction(componentId, {
              type: 'hover',
              subType: 'leave',
              timestamp: Date.now(),
              duration: duration
            });
          }
        }
      };
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      return function () {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        clearTimeout(hoverTimeout);
      };
    }, [isInitialized, componentId, analyzeInteractions, trackHovers]);

    // Combine provided ref with our internal ref
    var setRootRef = function setRootRef(element) {
      rootRef.current = element;

      // If a ref was passed through props, update it too
      if (ref) {
        if (typeof ref === 'function') {
          ref(element);
        } else {
          ref.current = element;
        }
      }
    };

    // Custom tracking methods that can be called from the wrapped component
    var trackCustomInteraction = function trackCustomInteraction(type) {
      var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!isInitialized || !analyzeInteractions) return;
      trackInteraction(componentId, _objectSpread2({
        type: type,
        timestamp: Date.now()
      }, data));
    };

    // Method to manually preload dependencies
    var preloadDependency = function preloadDependency(dependencyId) {
      if (!isInitialized) return;
      preloadComponent(dependencyId);
    };

    // Render the wrapped component with the tracking ref and additional props
    return /*#__PURE__*/jsx(WrappedComponent, _objectSpread2(_objectSpread2({}, props), {}, {
      ref: componentRef,
      rootRef: setRootRef,
      reactSmartId: componentId,
      trackInteraction: trackCustomInteraction,
      preloadDependency: preloadDependency,
      preloadDependencies: function preloadDependencies() {
        _preloadDependencies.forEach(preloadDependency);
      }
    }));
  });

  // Set display name for better debugging
  WithReactSmart.displayName = "withReactSmart(".concat(displayName, ")");
  return WithReactSmart;
};

var _excluded = ["path", "component", "preloadRelated", "analyzeRouteUsage", "trackRouteMetrics", "priority"];
var SmartRoute = function SmartRoute(_ref) {
  var path = _ref.path,
    Component = _ref.component,
    _ref$preloadRelated = _ref.preloadRelated,
    preloadRelated = _ref$preloadRelated === void 0 ? [] : _ref$preloadRelated,
    _ref$analyzeRouteUsag = _ref.analyzeRouteUsage,
    analyzeRouteUsage = _ref$analyzeRouteUsag === void 0 ? true : _ref$analyzeRouteUsag,
    _ref$trackRouteMetric = _ref.trackRouteMetrics,
    trackRouteMetrics = _ref$trackRouteMetric === void 0 ? true : _ref$trackRouteMetric,
    _ref$priority = _ref.priority,
    priority = _ref$priority === void 0 ? 'medium' : _ref$priority,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useContext = useContext(ReactSmartContext),
    trackInteraction = _useContext.trackInteraction,
    registerComponent = _useContext.registerComponent,
    preloadComponent = _useContext.preloadComponent,
    isInitialized = _useContext.isInitialized;

  // Generate a stable component ID based on the route path
  var routeId = "route:".concat(path);

  // Register this route with ReactSmart
  useEffect(function () {
    if (!isInitialized) return;

    // Register the route as a component
    registerComponent(routeId, {
      id: routeId,
      type: 'route',
      path: path,
      priority: priority,
      dependencies: preloadRelated,
      metadata: {
        preloadRelated: preloadRelated,
        analyzeRouteUsage: analyzeRouteUsage,
        trackRouteMetrics: trackRouteMetrics
      }
    });

    // Register related components for preloading
    preloadRelated.forEach(function (relatedId) {
      // Mark related components as dependencies of this route
      registerComponent(relatedId, {
        id: relatedId,
        type: 'component',
        priority: 'medium',
        relatedRoute: routeId,
        isPreloadTarget: true
      });
    });
  }, [isInitialized, registerComponent, routeId, path, preloadRelated, priority, analyzeRouteUsage, trackRouteMetrics]);

  // Wrap the component to add tracking
  var WrappedComponent = function WrappedComponent(props) {
    var _props$location2;
    useEffect(function () {
      var _props$location, _props$history;
      if (!isInitialized || !analyzeRouteUsage) return;

      // Track route usage when component mounts
      trackInteraction(routeId, {
        type: 'navigation',
        path: path,
        timestamp: Date.now(),
        routeProps: rest,
        queryParams: new URLSearchParams((_props$location = props.location) === null || _props$location === void 0 ? void 0 : _props$location.search).toString(),
        referrer: document.referrer || ((_props$history = props.history) === null || _props$history === void 0 ? void 0 : _props$history.action) || null
      });

      // Preload related components
      preloadRelated.forEach(function (relatedId) {
        preloadComponent(relatedId);
      });

      // Start timing the route duration
      var routeEnterTime = Date.now();

      // Return cleanup function
      return function () {
        // Track route exit when component unmounts
        var duration = Date.now() - routeEnterTime;
        if (duration > 500) {
          // Only track meaningful visits
          trackInteraction(routeId, {
            type: 'navigation-exit',
            path: path,
            timestamp: Date.now(),
            duration: duration,
            nextRoute: window.location.pathname
          });
        }
      };
    }, [(_props$location2 = props.location) === null || _props$location2 === void 0 ? void 0 : _props$location2.pathname]);

    // Render the wrapped component
    return /*#__PURE__*/jsx(Component, _objectSpread2({}, props));
  };
  WrappedComponent.displayName = "SmartRoute(".concat(Component.displayName || Component.name || 'Component', ")");

  // Return enhanced Route
  return /*#__PURE__*/jsx(Route, _objectSpread2(_objectSpread2({
    path: path
  }, rest), {}, {
    render: function render(routeProps) {
      return /*#__PURE__*/jsx(WrappedComponent, _objectSpread2({}, routeProps));
    }
  }));
};

// Add compatibility for React Router v6
// This section allows the component to work with both v5 and v6 API
if (typeof Route.render === 'undefined') {

  // Replace the v5 implementation with v6 implementation
  _readOnlyError("SmartRoute");
}
SmartRoute.propTypes = {
  path: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
  component: PropTypes.elementType.isRequired,
  preloadRelated: PropTypes.arrayOf(PropTypes.string),
  analyzeRouteUsage: PropTypes.bool,
  trackRouteMetrics: PropTypes.bool,
  priority: PropTypes.oneOf(['high', 'medium', 'low'])
};

/**
 * Hook for tracking component interactions and usage patterns
 * 
 * This hook provides methods to track interactions with components,
 * allowing the prediction engine to learn from user behavior.
 * 
 * @param {string} componentId - Unique identifier for the component
 * @param {Object} options - Configuration options for the tracker
 * @param {boolean} options.trackMounts - Whether to track component mounts (default: true)
 * @param {boolean} options.trackUnmounts - Whether to track component unmounts (default: true)
 * @param {boolean} options.trackClicks - Whether to track clicks within the component (default: true)
 * @param {boolean} options.trackHovers - Whether to track hover interactions (default: true)
 * @param {boolean} options.trackVisibility - Whether to track visibility in viewport (default: true)
 * @param {Array} options.dependencies - Component dependencies to preload
 * @param {string} options.importance - Component importance ('high', 'medium', 'low')
 * @returns {Object} Component tracking methods and state
 */
var useComponentTracker = function useComponentTracker(componentId) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _options$trackMounts = options.trackMounts,
    trackMounts = _options$trackMounts === void 0 ? true : _options$trackMounts,
    _options$trackUnmount = options.trackUnmounts,
    trackUnmounts = _options$trackUnmount === void 0 ? true : _options$trackUnmount,
    _options$trackClicks = options.trackClicks,
    trackClicks = _options$trackClicks === void 0 ? true : _options$trackClicks,
    _options$trackHovers = options.trackHovers,
    trackHovers = _options$trackHovers === void 0 ? true : _options$trackHovers,
    _options$trackVisibil = options.trackVisibility,
    trackVisibility = _options$trackVisibil === void 0 ? true : _options$trackVisibil,
    _options$dependencies = options.dependencies,
    dependencies = _options$dependencies === void 0 ? [] : _options$dependencies,
    _options$importance = options.importance,
    importance = _options$importance === void 0 ? 'medium' : _options$importance;

  // Get ReactSmart context
  var _useContext = useContext(ReactSmartContext),
    trackInteraction = _useContext.trackInteraction,
    registerComponent = _useContext.registerComponent,
    preloadComponent = _useContext.preloadComponent,
    getLoadingPriority = _useContext.getLoadingPriority,
    isInitialized = _useContext.isInitialized;

  // Create refs to track component state
  var rootRef = useRef(null);
  var isVisibleRef = useRef(false);
  var visibilityObserverRef = useRef(null);
  var mountTimeRef = useRef(null);

  // Generate a stable component ID if not provided
  var resolvedComponentId = componentId || 'anonymous-component';

  // Register the component with ReactSmart
  useEffect(function () {
    if (!isInitialized) return;

    // Register this component
    registerComponent(resolvedComponentId, {
      id: resolvedComponentId,
      type: 'component',
      importance: importance,
      dependencies: dependencies,
      metadata: _objectSpread2({
        registeredAt: Date.now()
      }, options)
    });

    // Component might have dependencies to preload
    dependencies.forEach(function (depId) {
      registerComponent(depId, {
        id: depId,
        type: 'dependency',
        parentComponent: resolvedComponentId
      });
    });

    // Track mount event
    if (trackMounts) {
      trackInteraction(resolvedComponentId, {
        type: 'mount',
        timestamp: Date.now()
      });
      mountTimeRef.current = Date.now();
    }

    // Return cleanup function
    return function () {
      // Track unmount event
      if (trackUnmounts && mountTimeRef.current) {
        var duration = Date.now() - mountTimeRef.current;
        trackInteraction(resolvedComponentId, {
          type: 'unmount',
          timestamp: Date.now(),
          duration: duration
        });
      }

      // Disconnect observer if it exists
      if (visibilityObserverRef.current) {
        visibilityObserverRef.current.disconnect();
        visibilityObserverRef.current = null;
      }
    };
  }, [isInitialized, resolvedComponentId, trackMounts, trackUnmounts].concat(_toConsumableArray(dependencies)));

  // Set up visibility tracking if requested
  useEffect(function () {
    if (!isInitialized || !trackVisibility || !rootRef.current) return;

    // Check if Intersection Observer API is available
    if (typeof IntersectionObserver === 'undefined') {
      console.warn('ReactSmart: IntersectionObserver not supported in this browser. Visibility tracking disabled.');
      return;
    }

    // Initialize last visibility timestamp
    var lastVisibilityTimestamp = 0;

    // Create an observer to track component visibility
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var isVisible = entry.isIntersecting;
        var timestamp = Date.now();

        // Only track visibility changes
        if (isVisible !== isVisibleRef.current) {
          isVisibleRef.current = isVisible;
          if (isVisible) {
            // Component became visible
            trackInteraction(resolvedComponentId, {
              type: 'visibility',
              subType: 'visible',
              timestamp: timestamp,
              viewportCoverage: entry.intersectionRatio
            });
            lastVisibilityTimestamp = timestamp;
          } else {
            // Component is no longer visible
            var duration = timestamp - lastVisibilityTimestamp;

            // Only track if it was visible for a meaningful time
            if (duration > 100) {
              trackInteraction(resolvedComponentId, {
                type: 'visibility',
                subType: 'hidden',
                timestamp: timestamp,
                duration: duration
              });
            }
          }
        }
      });
    }, {
      threshold: [0, 0.1, 0.5, 0.9],
      rootMargin: '0px'
    });

    // Start observing the component
    observer.observe(rootRef.current);
    visibilityObserverRef.current = observer;

    // Cleanup on unmount
    return function () {
      if (observer) {
        observer.disconnect();
        visibilityObserverRef.current = null;
      }
    };
  }, [isInitialized, resolvedComponentId, trackVisibility]);

  // Track click events
  var trackClickEvent = useCallback(function (event) {
    var customData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!isInitialized) return;
    trackInteraction(resolvedComponentId, _objectSpread2({
      type: 'click',
      timestamp: Date.now(),
      target: event.target.tagName,
      position: {
        x: event.clientX,
        y: event.clientY
      }
    }, customData));
  }, [isInitialized, resolvedComponentId, trackInteraction]);

  // Track hover events
  var trackHoverEvent = useCallback(function (event) {
    var customData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!isInitialized) return;
    trackInteraction(resolvedComponentId, _objectSpread2({
      type: 'hover',
      timestamp: Date.now(),
      target: event.target.tagName,
      position: {
        x: event.clientX,
        y: event.clientY
      }
    }, customData));
  }, [isInitialized, resolvedComponentId, trackInteraction]);

  // Generic interaction tracking function
  var trackCustomInteraction = useCallback(function (interactionType) {
    var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (!isInitialized) return;
    trackInteraction(resolvedComponentId, _objectSpread2({
      type: interactionType,
      timestamp: Date.now()
    }, data));
  }, [isInitialized, resolvedComponentId, trackInteraction]);

  // Set up click event listener if requested
  useEffect(function () {
    if (!isInitialized || !trackClicks || !rootRef.current) return;
    var element = rootRef.current;

    // Add click event listener
    element.addEventListener('click', trackClickEvent);

    // Cleanup on unmount
    return function () {
      element.removeEventListener('click', trackClickEvent);
    };
  }, [isInitialized, trackClicks, trackClickEvent]);

  // Set up hover event listener if requested
  useEffect(function () {
    if (!isInitialized || !trackHovers || !rootRef.current) return;
    var element = rootRef.current;
    var hoverTimeout;
    var isHovering = false;

    // Track mouseenter with debounce
    var handleMouseEnter = function handleMouseEnter(event) {
      if (!isHovering) {
        isHovering = true;
        trackHoverEvent(event, {
          subType: 'enter'
        });
      }
    };

    // Track mouseleave with debounce
    var handleMouseLeave = function handleMouseLeave(event) {
      if (isHovering) {
        isHovering = false;
        trackHoverEvent(event, {
          subType: 'leave'
        });
      }
    };

    // Add hover event listeners
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup on unmount
    return function () {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(hoverTimeout);
    };
  }, [isInitialized, trackHovers, trackHoverEvent]);

  // Manual preload function for dependencies
  var preloadDependencies = useCallback(function () {
    if (!isInitialized) return;
    dependencies.forEach(function (depId) {
      preloadComponent(depId);
    });
  }, [isInitialized, dependencies, preloadComponent]);
  return {
    rootRef: rootRef,
    // Ref to attach to the root element of the component
    isVisible: isVisibleRef.current,
    trackInteraction: trackCustomInteraction,
    // Method to track custom interactions
    trackClick: trackClickEvent,
    // Method to track click events
    trackHover: trackHoverEvent,
    // Method to track hover events
    preloadDependencies: preloadDependencies,
    // Method to manually preload dependencies
    priority: getLoadingPriority(resolvedComponentId),
    // Current loading priority
    componentId: resolvedComponentId // The resolved component ID
  };
};

/**
 * Hook for making components network-aware
 * 
 * This hook provides network condition information and helper functions
 * to adapt component behavior based on network quality.
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.monitorChanges - Whether to monitor network changes (default: true)
 * @param {number} options.pollInterval - Polling interval in ms for browsers without NetworkInformation API (default: 30000)
 * @param {Function} options.onNetworkChange - Callback when network conditions change
 * @returns {Object} Network status information and helper functions
 */
var useNetworkAware = function useNetworkAware() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$monitorChang = options.monitorChanges,
    monitorChanges = _options$monitorChang === void 0 ? true : _options$monitorChang,
    _options$pollInterval = options.pollInterval,
    pollInterval = _options$pollInterval === void 0 ? 30000 : _options$pollInterval,
    _options$onNetworkCha = options.onNetworkChange,
    onNetworkChange = _options$onNetworkCha === void 0 ? null : _options$onNetworkCha;

  // Get ReactSmart context
  var _useContext = useContext(ReactSmartContext),
    networkStatus = _useContext.networkStatus,
    isInitialized = _useContext.isInitialized;

  // Local state for network status (initial value from context)
  var _useState = useState(networkStatus),
    _useState2 = _slicedToArray(_useState, 2),
    localNetworkStatus = _useState2[0],
    setLocalNetworkStatus = _useState2[1];

  // Local state for network quality category
  var _useState3 = useState(function () {
      return categorizeNetworkQuality(networkStatus);
    }),
    _useState4 = _slicedToArray(_useState3, 2),
    networkQuality = _useState4[0],
    setNetworkQuality = _useState4[1];

  // Helper variables for common checks
  var _useState5 = useState(function () {
      return ['excellent', 'good'].includes(categorizeNetworkQuality(networkStatus));
    }),
    _useState6 = _slicedToArray(_useState5, 2),
    isGoodConnection = _useState6[0],
    setIsGoodConnection = _useState6[1];
  var _useState7 = useState(function () {
      return networkStatus.saveData === true;
    }),
    _useState8 = _slicedToArray(_useState7, 2),
    isSaveDataMode = _useState8[0],
    setIsSaveDataMode = _useState8[1];

  // Effect to synchronize with context network status
  useEffect(function () {
    if (isInitialized) {
      setLocalNetworkStatus(networkStatus);
      var quality = categorizeNetworkQuality(networkStatus);
      setNetworkQuality(quality);
      setIsGoodConnection(['excellent', 'good'].includes(quality));
      setIsSaveDataMode(networkStatus.saveData === true);
    }
  }, [isInitialized, networkStatus]);

  // Effect to set up additional monitoring if requested
  useEffect(function () {
    if (!isInitialized || !monitorChanges) return;
    var intervalId = null;
    var updateNetworkStatus = function updateNetworkStatus() {
      var newStatus = detectNetworkConditions();
      setLocalNetworkStatus(newStatus);
      var quality = categorizeNetworkQuality(newStatus);
      setNetworkQuality(quality);
      setIsGoodConnection(['excellent', 'good'].includes(quality));
      setIsSaveDataMode(newStatus.saveData === true);
      if (onNetworkChange && typeof onNetworkChange === 'function') {
        onNetworkChange(newStatus, quality);
      }
    };

    // Set up event listener for Network Information API if available
    if (navigator.connection) {
      navigator.connection.addEventListener('change', updateNetworkStatus);
    }
    // Otherwise, poll at the specified interval
    else if (pollInterval > 0) {
      intervalId = setInterval(updateNetworkStatus, pollInterval);
    }

    // Additional event listeners for online/offline status
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    // Cleanup function
    return function () {
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', updateNetworkStatus);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, [isInitialized, monitorChanges, pollInterval, onNetworkChange]);

  /**
   * Check if current network quality meets a minimum threshold
   * @param {string} minimumQuality - Minimum quality level ('excellent', 'good', 'fair', 'poor')
   * @returns {boolean} Whether current network meets the threshold
   */
  var meetsQualityThreshold = useCallback(function (minimumQuality) {
    var qualityLevels = ['excellent', 'good', 'fair', 'poor', 'offline'];
    var currentIndex = qualityLevels.indexOf(networkQuality);
    var thresholdIndex = qualityLevels.indexOf(minimumQuality);
    return currentIndex !== -1 && thresholdIndex !== -1 && currentIndex <= thresholdIndex;
  }, [networkQuality]);

  /**
   * Calculate appropriate resource size based on network conditions
   * @param {Object} sizeOptions - Size options for different network qualities
   * @param {number} sizeOptions.excellent - Size for excellent connections (default: 1)
   * @param {number} sizeOptions.good - Size for good connections (default: 0.8)
   * @param {number} sizeOptions.fair - Size for fair connections (default: 0.6)
   * @param {number} sizeOptions.poor - Size for poor connections (default: 0.4)
   * @param {number} sizeOptions.offline - Size for offline mode (default: 0)
   * @returns {number} Appropriate resource size multiplier
   */
  var getAdaptiveSize = useCallback(function () {
    var sizeOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var defaults = {
      excellent: 1,
      good: 0.8,
      fair: 0.6,
      poor: 0.4,
      offline: 0
    };
    var options = _objectSpread2(_objectSpread2({}, defaults), sizeOptions);
    return options[networkQuality] || options.fair;
  }, [networkQuality]);

  /**
   * Select the appropriate resource variant based on network quality
   * @param {Object} variants - Resource variants for different network qualities
   * @param {any} variants.excellent - Variant for excellent connections
   * @param {any} variants.good - Variant for good connections
   * @param {any} variants.fair - Variant for fair connections
   * @param {any} variants.poor - Variant for poor connections
   * @param {any} variants.offline - Variant for offline mode
   * @param {any} variants.default - Default variant if quality-specific one not provided
   * @returns {any} Selected resource variant
   */
  var selectResourceVariant = useCallback(function (variants) {
    if (!variants || _typeof(variants) !== 'object') {
      return variants;
    }
    if (variants[networkQuality] !== undefined) {
      return variants[networkQuality];
    }

    // Fall back to the next best quality
    var qualityOrder = ['excellent', 'good', 'fair', 'poor', 'offline'];
    var currentIndex = qualityOrder.indexOf(networkQuality);
    if (currentIndex === -1) {
      return variants["default"] || variants.fair;
    }

    // Look for the next available quality
    for (var i = currentIndex + 1; i < qualityOrder.length; i++) {
      var quality = qualityOrder[i];
      if (variants[quality] !== undefined) {
        return variants[quality];
      }
    }

    // Look for previous better quality
    for (var _i = currentIndex - 1; _i >= 0; _i--) {
      var _quality = qualityOrder[_i];
      if (variants[_quality] !== undefined) {
        return variants[_quality];
      }
    }
    return variants["default"];
  }, [networkQuality]);

  /**
   * Estimate loading time for a resource based on its size
   * @param {number} sizeKB - Size of the resource in kilobytes
   * @returns {number} Estimated loading time in milliseconds
   */
  var estimateLoadTime = useCallback(function (sizeKB) {
    var downlink = localNetworkStatus.downlink,
      rtt = localNetworkStatus.rtt;

    // Base latency on RTT
    var latency = rtt || 100; // default to 100ms if RTT is unknown

    // Base bandwidth on downlink
    var bandwidth = downlink || 1; // default to 1Mbps if downlink is unknown

    // Calculate transfer time: size (in bits) / bandwidth (in bits per second)
    // Convert KB to bits (× 8 × 1024), and Mbps to bps (× 1024 × 1024)
    var transferTime = sizeKB * 8 * 1024 / (bandwidth * 1024 * 1024) * 1000;

    // Total load time = latency + transfer time
    return latency + transferTime;
  }, [localNetworkStatus]);
  return {
    networkStatus: localNetworkStatus,
    networkQuality: networkQuality,
    isOnline: localNetworkStatus.online,
    isGoodConnection: isGoodConnection,
    isFairConnection: networkQuality === 'fair',
    isPoorConnection: networkQuality === 'poor',
    isOffline: networkQuality === 'offline',
    isSaveDataMode: isSaveDataMode,
    // Helper functions
    meetsQualityThreshold: meetsQualityThreshold,
    getAdaptiveSize: getAdaptiveSize,
    selectResourceVariant: selectResourceVariant,
    estimateLoadTime: estimateLoadTime
  };
};

/**
 * Adaptive Loading Queue 
 * 
 * Manages prioritized component loading based on predictions,
 * network conditions, and resource constraints.
 */
var AdaptiveLoadingQueue = /*#__PURE__*/function () {
  /**
   * Create a new AdaptiveLoadingQueue instance
   * @param {Object} options - Configuration options
   * @param {number} options.highPriorityThreshold - Probability threshold for high priority (default: 0.8)
   * @param {number} options.mediumPriorityThreshold - Probability threshold for medium priority (default: 0.5)
   * @param {number} options.maxConcurrentLoads - Maximum number of concurrent component loads (default: 5)
   * @param {boolean} options.adaptToNetwork - Whether to adapt loading strategy to network conditions (default: true)
   */
  function AdaptiveLoadingQueue() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, AdaptiveLoadingQueue);
    this.options = _objectSpread2({
      highPriorityThreshold: 0.8,
      mediumPriorityThreshold: 0.5,
      maxConcurrentLoads: 5,
      adaptToNetwork: true
    }, options);

    // Priority queues
    this.highPriority = new Set();
    this.mediumPriority = new Set();
    this.lowPriority = new Set();

    // Component metadata registry
    this.componentRegistry = new Map();

    // Resource hint registry
    this.resourceHints = new Map();

    // Track currently loading components
    this.loadingComponents = new Set();

    // Track loaded components
    this.loadedComponents = new Set();

    // Network state
    this.network = {
      type: '4g',
      effectiveType: '4g',
      downlink: 10,
      rtt: 50
    };

    // Detect network conditions if available
    this.detectNetworkConditions();

    // Set up network monitoring
    this.setupNetworkMonitoring();
  }

  /**
   * Initialize network condition detection
   */
  return _createClass(AdaptiveLoadingQueue, [{
    key: "detectNetworkConditions",
    value: function detectNetworkConditions() {
      if (!this.options.adaptToNetwork) return;
      if (navigator.connection) {
        var connection = navigator.connection;
        this.network = {
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        };
      }
    }

    /**
     * Setup ongoing network monitoring
     */
  }, {
    key: "setupNetworkMonitoring",
    value: function setupNetworkMonitoring() {
      var _this = this;
      if (!this.options.adaptToNetwork) return;

      // Listen for network changes if supported
      if (navigator.connection) {
        navigator.connection.addEventListener('change', function () {
          _this.detectNetworkConditions();
          _this.rebalanceQueues();
        });
      }

      // Fallback polling for browsers without Network Information API
      else {
        // No reliable way to detect network changes, so we'll
        // periodically check performance of resource loading
        this.networkCheckInterval = setInterval(function () {
          // Estimate network conditions based on recent load performance
          _this.estimateNetworkConditions();
        }, 60000); // Check every minute
      }
    }

    /**
     * Estimate network conditions based on resource loading performance
     */
  }, {
    key: "estimateNetworkConditions",
    value: function estimateNetworkConditions() {
      // This is a simplified implementation
      // A real implementation would track resource load times
      // and use them to estimate network conditions

      // For now, we'll use navigator.connection if available,
      // or assume decent connectivity otherwise
      if (navigator.connection) {
        this.detectNetworkConditions();
      }
    }

    /**
     * Register a component with the loading queue
     * @param {string} componentId - ID of the component
     * @param {Object} metadata - Component metadata
     */
  }, {
    key: "registerComponent",
    value: function registerComponent(componentId, metadata) {
      this.componentRegistry.set(componentId, _objectSpread2({
        id: componentId,
        size: metadata.size || 0,
        dependencies: metadata.dependencies || [],
        path: metadata.path || null,
        importance: metadata.importance || 'normal'
      }, metadata));
    }

    /**
     * Update loading priorities based on predictions
     * @param {Array} predictions - Component predictions from the prediction engine
     */
  }, {
    key: "updatePriorities",
    value: function updatePriorities(predictions) {
      var _this2 = this;
      // Clear existing queue contents
      this.highPriority.clear();
      this.mediumPriority.clear();
      this.lowPriority.clear();

      // Process predictions and assign to appropriate queues
      predictions.forEach(function (pred) {
        var componentId = pred.componentId;

        // Skip already loaded or loading components
        if (_this2.loadedComponents.has(componentId) || _this2.loadingComponents.has(componentId)) {
          return;
        }

        // Assign to priority queues based on prediction probability
        if (pred.probability > _this2.options.highPriorityThreshold) {
          _this2.highPriority.add(componentId);
          _this2.prefetchResource(componentId);
        } else if (pred.probability > _this2.options.mediumPriorityThreshold) {
          _this2.mediumPriority.add(componentId);
          _this2.preconnectResource(componentId);
        } else {
          _this2.lowPriority.add(componentId);
        }
      });

      // Start loading components based on priorities
      this.processQueues();
    }

    /**
     * Process loading queues to load components in priority order
     */
  }, {
    key: "processQueues",
    value: function processQueues() {
      // Determine how many components we can load concurrently
      var availableSlots = this.calculateAvailableSlots();
      var remainingSlots = availableSlots - this.loadingComponents.size;

      // Process high priority queue first
      if (remainingSlots > 0) {
        remainingSlots = this.processQueue(this.highPriority, remainingSlots, 'high');
      }

      // Process medium priority queue next
      if (remainingSlots > 0) {
        remainingSlots = this.processQueue(this.mediumPriority, remainingSlots, 'medium');
      }

      // Process low priority queue if we still have slots and good network
      if (remainingSlots > 0 && this.hasGoodNetwork()) {
        this.processQueue(this.lowPriority, remainingSlots, 'low');
      }
    }

    /**
     * Process a specific queue to load components
     * @param {Set} queue - Priority queue to process
     * @param {number} slots - Number of available loading slots
     * @param {string} priority - Priority level ('high', 'medium', 'low')
     * @returns {number} - Remaining slots after processing
     */
  }, {
    key: "processQueue",
    value: function processQueue(queue, slots, priority) {
      var remainingSlots = slots;

      // Convert queue to array for easier processing
      var components = Array.from(queue);

      // Use slots for components from this queue
      for (var i = 0; i < components.length && remainingSlots > 0; i++) {
        var componentId = components[i];
        this.loadComponent(componentId, priority);
        remainingSlots--;

        // Remove from queue
        queue["delete"](componentId);
      }
      return remainingSlots;
    }

    /**
     * Calculate the number of concurrent loads based on network conditions
     * @returns {number} - Number of components to load concurrently
     */
  }, {
    key: "calculateAvailableSlots",
    value: function calculateAvailableSlots() {
      if (!this.options.adaptToNetwork) {
        return this.options.maxConcurrentLoads;
      }

      // Adjust based on network conditions
      var _this$network = this.network,
        effectiveType = _this$network.effectiveType,
        downlink = _this$network.downlink;
      switch (effectiveType) {
        case '4g':
          return this.options.maxConcurrentLoads;
        case '3g':
          return Math.max(2, Math.floor(this.options.maxConcurrentLoads * 0.6));
        case '2g':
          return 1;
        case 'slow-2g':
          return 1;
        default:
          // If we don't know, use a conservative value based on downlink
          if (downlink > 5) return this.options.maxConcurrentLoads;
          if (downlink > 2) return Math.floor(this.options.maxConcurrentLoads * 0.6);
          return 1;
      }
    }

    /**
     * Check if current network conditions are good
     * @returns {boolean} - Whether network conditions are good
     */
  }, {
    key: "hasGoodNetwork",
    value: function hasGoodNetwork() {
      if (!this.options.adaptToNetwork) {
        return true;
      }
      var _this$network2 = this.network,
        effectiveType = _this$network2.effectiveType,
        downlink = _this$network2.downlink,
        rtt = _this$network2.rtt;

      // Consider good network if:
      // - 4g or better effective type, or
      // - downlink > 1.5Mbps, or
      // - RTT < 300ms
      return effectiveType === '4g' || downlink > 1.5 || rtt && rtt < 300;
    }

    /**
     * Rebalance queues when conditions change
     */
  }, {
    key: "rebalanceQueues",
    value: function rebalanceQueues() {
      // Adjust processing based on new network conditions
      this.processQueues();
    }

    /**
     * Load a component
     * @param {string} componentId - ID of the component to load
     * @param {string} priority - Priority level ('high', 'medium', 'low')
     */
  }, {
    key: "loadComponent",
    value: function loadComponent(componentId, priority) {
      var _this3 = this;
      // Skip if already loaded or loading
      if (this.loadedComponents.has(componentId) || this.loadingComponents.has(componentId)) {
        return;
      }

      // Ensure component is registered
      var component = this.componentRegistry.get(componentId);
      if (!component) {
        console.warn("AdaptiveLoadingQueue: Attempted to load unknown component: ".concat(componentId));
        return;
      }

      // Mark as loading
      this.loadingComponents.add(componentId);

      // In a real implementation, this would load the actual component
      // through dynamic import or a similar mechanism

      // For this implementation, we'll simulate loading with a timeout
      var loadTime = this.estimateLoadTime(component);
      setTimeout(function () {
        // Mark as loaded
        _this3.loadedComponents.add(componentId);
        _this3.loadingComponents["delete"](componentId);

        // Clean up any resource hints
        _this3.cleanupResourceHint(componentId);

        // Process dependencies
        _this3.processDependencies(component);

        // Process queues again in case we have room for more components
        _this3.processQueues();
        console.debug("AdaptiveLoadingQueue: Loaded component ".concat(componentId, " with ").concat(priority, " priority"));
      }, loadTime);
    }

    /**
     * Process dependencies for a component
     * @param {Object} component - Component metadata
     */
  }, {
    key: "processDependencies",
    value: function processDependencies(component) {
      var _this4 = this;
      if (!component.dependencies || component.dependencies.length === 0) {
        return;
      }

      // Load each dependency with medium priority
      component.dependencies.forEach(function (dependencyId) {
        if (!_this4.loadedComponents.has(dependencyId) && !_this4.loadingComponents.has(dependencyId)) {
          // Add to medium priority queue
          _this4.mediumPriority.add(dependencyId);
        }
      });
    }

    /**
     * Estimate load time for a component based on size and network conditions
     * @param {Object} component - Component metadata
     * @returns {number} - Estimated load time in milliseconds
     */
  }, {
    key: "estimateLoadTime",
    value: function estimateLoadTime(component) {
      if (!this.options.adaptToNetwork) {
        return 100; // Default load time
      }
      var _this$network3 = this.network,
        downlink = _this$network3.downlink,
        rtt = _this$network3.rtt;
      var size = component.size || 10; // Size in KB, default 10KB if unknown

      // Basic formula: latency + (size / bandwidth)
      var latency = rtt || 100; // ms
      var bandwidth = downlink || 1; // Mbps

      // Convert KB to bits (× 8 × 1024), and Mbps to bps (× 1024 × 1024)
      var transferTime = size * 8 * 1024 / (bandwidth * 1024 * 1024) * 1000;
      return latency + transferTime;
    }

    /**
     * Add a prefetch hint for a component
     * @param {string} componentId - ID of the component
     */
  }, {
    key: "prefetchResource",
    value: function prefetchResource(componentId) {
      // Skip if already loaded, loading, or hint already exists
      if (this.loadedComponents.has(componentId) || this.loadingComponents.has(componentId) || this.resourceHints.has(componentId)) {
        return;
      }
      var component = this.componentRegistry.get(componentId);
      if (!component || !component.path) return;

      // Create and add prefetch link
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = 'script';
      link.href = component.path;
      document.head.appendChild(link);

      // Register for cleanup
      this.resourceHints.set(componentId, link);
    }

    /**
     * Add a preconnect hint for a component
     * @param {string} componentId - ID of the component
     */
  }, {
    key: "preconnectResource",
    value: function preconnectResource(componentId) {
      // Skip if already loaded, loading, or hint already exists
      if (this.loadedComponents.has(componentId) || this.loadingComponents.has(componentId) || this.resourceHints.has(componentId)) {
        return;
      }
      var component = this.componentRegistry.get(componentId);
      if (!component || !component.path) return;

      // Extract domain from path
      var domain;
      try {
        if (component.path.startsWith('http')) {
          var url = new URL(component.path);
          domain = "".concat(url.protocol, "//").concat(url.hostname);
        } else {
          // Assume same origin
          domain = window.location.origin;
        }
      } catch (error) {
        return;
      }

      // Create and add preconnect link
      var link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);

      // Register for cleanup
      this.resourceHints.set(componentId, link);
    }

    /**
     * Clean up resource hint for a component
     * @param {string} componentId - ID of the component
     */
  }, {
    key: "cleanupResourceHint",
    value: function cleanupResourceHint(componentId) {
      var hint = this.resourceHints.get(componentId);
      if (hint) {
        // Remove from DOM
        if (hint.parentNode) {
          hint.parentNode.removeChild(hint);
        }

        // Remove from registry
        this.resourceHints["delete"](componentId);
      }
    }

    /**
     * Check if a component is loaded
     * @param {string} componentId - ID of the component
     * @returns {boolean} - Whether the component is loaded
     */
  }, {
    key: "isLoaded",
    value: function isLoaded(componentId) {
      return this.loadedComponents.has(componentId);
    }

    /**
     * Check if a component is currently loading
     * @param {string} componentId - ID of the component
     * @returns {boolean} - Whether the component is loading
     */
  }, {
    key: "isLoading",
    value: function isLoading(componentId) {
      return this.loadingComponents.has(componentId);
    }

    /**
     * Get the current queue state
     * @returns {Object} - Current queue state
     */
  }, {
    key: "getQueueState",
    value: function getQueueState() {
      return {
        high: Array.from(this.highPriority),
        medium: Array.from(this.mediumPriority),
        low: Array.from(this.lowPriority),
        loading: Array.from(this.loadingComponents),
        loaded: Array.from(this.loadedComponents),
        network: _objectSpread2({}, this.network)
      };
    }

    /**
     * Clean up and destroy the queue
     */
  }, {
    key: "destroy",
    value: function destroy() {
      // Clear intervals if any
      if (this.networkCheckInterval) {
        clearInterval(this.networkCheckInterval);
      }

      // Remove network event listeners
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', this.detectNetworkConditions);
      }

      // Clean up all resource hints
      this.resourceHints.forEach(function (hint) {
        if (hint.parentNode) {
          hint.parentNode.removeChild(hint);
        }
      });

      // Clear all collections
      this.highPriority.clear();
      this.mediumPriority.clear();
      this.lowPriority.clear();
      this.loadingComponents.clear();
      this.loadedComponents.clear();
      this.componentRegistry.clear();
      this.resourceHints.clear();
    }
  }]);
}();

/**
 * Markov Chain Model for component usage prediction
 * 
 * Implements a higher-order Markov Chain model to predict component usage
 * based on sequences of previous component interactions.
 */
/**
 * MarkovChain class for component usage prediction
 */
var MarkovChain = /*#__PURE__*/function () {
  /**
   * Create a new MarkovChain instance
   * @param {Object} options - Configuration options
   * @param {number} options.order - Order of the Markov Chain (default: 2)
   * @param {number} options.learningRate - Learning rate for model updates (default: 0.05)
   * @param {boolean} options.useBackoff - Whether to use backoff to lower-order models (default: true)
   */
  function MarkovChain() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, MarkovChain);
    this.options = _objectSpread2({
      order: 2,
      learningRate: 0.05,
      useBackoff: true
    }, options);

    // Initialize data structures
    this.transitionMatrices = new Map();

    // Initialize matrices for each order
    for (var i = 1; i <= this.options.order; i++) {
      this.transitionMatrices.set(i, new Map());
    }

    // Metrics for performance tracking
    this.metrics = {
      sequencesObserved: 0,
      predictions: 0,
      correctPredictions: 0
    };
  }

  /**
   * Process a new sequence of component usage
   * @param {Array} sequence - Sequence of component IDs
   */
  return _createClass(MarkovChain, [{
    key: "observeSequence",
    value: function observeSequence(sequence) {
      if (!sequence || sequence.length < 2) return;
      this.metrics.sequencesObserved++;

      // Process each subsequence up to the specified order
      for (var order = 1; order <= this.options.order; order++) {
        if (sequence.length <= order) continue;

        // Process each subsequence of the current order
        for (var i = 0; i <= sequence.length - order - 1; i++) {
          var context = sequence.slice(i, i + order);
          var nextComponent = sequence[i + order];
          this.updateTransition(order, context, nextComponent);
        }
      }
    }

    /**
     * Update transition probabilities for a specific context and next component
     * @param {number} order - Order of the context
     * @param {Array} context - Context sequence
     * @param {string} nextComponent - Next component ID
     */
  }, {
    key: "updateTransition",
    value: function updateTransition(order, context, nextComponent) {
      var contextKey = this.getContextKey(context);
      var matrix = this.transitionMatrices.get(order);

      // Initialize context map if not exists
      if (!matrix.has(contextKey)) {
        matrix.set(contextKey, new Map());
      }
      var transitions = matrix.get(contextKey);
      var currentCount = transitions.get(nextComponent) || 0;

      // Update count with learning rate
      var newCount = currentCount * (1 - this.options.learningRate) + this.options.learningRate;
      transitions.set(nextComponent, newCount);

      // Normalize the transition probabilities
      this.normalizeTransitions(order, contextKey);
    }

    /**
     * Normalize transition probabilities for a specific context
     * @param {number} order - Order of the context
     * @param {string} contextKey - Context key
     */
  }, {
    key: "normalizeTransitions",
    value: function normalizeTransitions(order, contextKey) {
      var matrix = this.transitionMatrices.get(order);
      var transitions = matrix.get(contextKey);
      if (!transitions) return;

      // Calculate sum of all counts
      var total = Array.from(transitions.values()).reduce(function (sum, count) {
        return sum + count;
      }, 0);
      if (total > 0) {
        // Normalize each count to a probability
        transitions.forEach(function (count, component) {
          transitions.set(component, count / total);
        });
      }
    }

    /**
     * Generate a key from a context sequence
     * @param {Array} context - Context sequence
     * @returns {string} Context key
     */
  }, {
    key: "getContextKey",
    value: function getContextKey(context) {
      return context.join('|');
    }

    /**
     * Parse a context key back into an array
     * @param {string} key - Context key
     * @returns {Array} Context sequence
     */
  }, {
    key: "parseContextKey",
    value: function parseContextKey(key) {
      return key.split('|');
    }

    /**
     * Predict the next component based on a context sequence
     * @param {Array} context - Context sequence
     * @param {Array} availableComponents - Available components to choose from
     * @returns {Array} Predictions with probabilities
     */
  }, {
    key: "predict",
    value: function predict(context, availableComponents) {
      var _this = this;
      if (!context || context.length === 0 || !availableComponents || availableComponents.length === 0) {
        return [];
      }

      // Use the longest possible subsequence up to the model's order
      var effectiveContext = context.slice(-this.options.order);
      var predictions = new Map();
      var _loop = function _loop(order) {
        var subContext = effectiveContext.slice(-order);
        var contextKey = _this.getContextKey(subContext);
        var matrix = _this.transitionMatrices.get(order);
        if (matrix.has(contextKey)) {
          var transitions = matrix.get(contextKey);

          // Add predictions from this order
          transitions.forEach(function (probability, componentId) {
            if (!predictions.has(componentId)) {
              predictions.set(componentId, {
                componentId: componentId,
                probability: probability,
                confidence: order / _this.options.order,
                // Higher order = higher confidence
                order: order
              });
            }
          });

          // If we got predictions and don't want to use backoff, stop here
          if (predictions.size > 0 && !_this.options.useBackoff) {
            return 1; // break
          }
        }
      };
      for (var order = Math.min(this.options.order, effectiveContext.length); order >= 1; order--) {
        if (_loop(order)) break;
      }

      // If no predictions were found, use a uniform distribution over available components
      if (predictions.size === 0) {
        var uniformProbability = 1 / availableComponents.length;
        availableComponents.forEach(function (component) {
          predictions.set(component.id, {
            componentId: component.id,
            probability: uniformProbability,
            confidence: 0.1,
            // Low confidence for uniform prediction
            order: 0
          });
        });
      }

      // Convert predictions to array and sort by probability
      var result = Array.from(predictions.values());

      // Filter to only include available components
      var availableIds = new Set(availableComponents.map(function (c) {
        return c.id;
      }));
      result = result.filter(function (prediction) {
        return availableIds.has(prediction.componentId);
      });

      // Sort by probability (highest first)
      result.sort(function (a, b) {
        return b.probability - a.probability;
      });

      // Add priority based on probability
      result = result.map(function (prediction) {
        return _objectSpread2(_objectSpread2({}, prediction), {}, {
          priority: _this.getPriorityFromProbability(prediction.probability)
        });
      });
      return result;
    }

    /**
     * Get priority level based on probability
     * @param {number} probability - Probability value
     * @returns {string} Priority level ('high', 'medium', 'low')
     */
  }, {
    key: "getPriorityFromProbability",
    value: function getPriorityFromProbability(probability) {
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
  }, {
    key: "updateMetrics",
    value: function updateMetrics(actualComponent, predictions) {
      this.metrics.predictions++;

      // Check if the actual component was in the top predictions
      var topPredictions = predictions.slice(0, 3).map(function (p) {
        return p.componentId;
      });
      if (topPredictions.includes(actualComponent)) {
        this.metrics.correctPredictions++;
      }
    }

    /**
     * Get current prediction accuracy
     * @returns {number} Prediction accuracy (0-1)
     */
  }, {
    key: "getAccuracy",
    value: function getAccuracy() {
      if (this.metrics.predictions === 0) return 0;
      return this.metrics.correctPredictions / this.metrics.predictions;
    }

    /**
     * Get model metrics
     * @returns {Object} Model metrics
     */
  }, {
    key: "getMetrics",
    value: function getMetrics() {
      return _objectSpread2(_objectSpread2({}, this.metrics), {}, {
        accuracy: this.getAccuracy(),
        order: this.options.order,
        matricesSizes: Array.from(this.transitionMatrices.entries()).map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            order = _ref2[0],
            matrix = _ref2[1];
          return {
            order: order,
            contexts: matrix.size,
            totalTransitions: Array.from(matrix.values()).reduce(function (sum, transitions) {
              return sum + transitions.size;
            }, 0)
          };
        })
      });
    }

    /**
     * Serialize the model for storage
     * @returns {Object} Serialized model
     */
  }, {
    key: "serialize",
    value: function serialize() {
      var serialized = {
        options: _objectSpread2({}, this.options),
        metrics: _objectSpread2({}, this.metrics),
        matrices: []
      };

      // Serialize transition matrices
      this.transitionMatrices.forEach(function (matrix, order) {
        var serializedMatrix = [];
        matrix.forEach(function (transitions, contextKey) {
          transitions.forEach(function (probability, componentId) {
            serializedMatrix.push({
              context: contextKey,
              component: componentId,
              probability: probability
            });
          });
        });
        serialized.matrices.push({
          order: order,
          transitions: serializedMatrix
        });
      });
      return serialized;
    }

    /**
     * Deserialize a model from storage
     * @param {Object} serialized - Serialized model
     * @returns {MarkovChain} Deserialized model
     */
  }, {
    key: "reset",
    value:
    /**
     * Reset the model
     */
    function reset() {
      // Clear all transition matrices
      this.transitionMatrices.forEach(function (matrix) {
        return matrix.clear();
      });

      // Reset metrics
      this.metrics = {
        sequencesObserved: 0,
        predictions: 0,
        correctPredictions: 0
      };
    }
  }], [{
    key: "deserialize",
    value: function deserialize(serialized) {
      if (!serialized || !serialized.options || !serialized.matrices) {
        throw new Error('Invalid serialized Markov Chain model');
      }
      var model = new MarkovChain(serialized.options);

      // Restore metrics
      if (serialized.metrics) {
        model.metrics = _objectSpread2({}, serialized.metrics);
      }

      // Restore transition matrices
      serialized.matrices.forEach(function (matrixData) {
        var order = matrixData.order,
          transitions = matrixData.transitions;
        var matrix = new Map();
        transitions.forEach(function (transitionData) {
          var context = transitionData.context,
            component = transitionData.component,
            probability = transitionData.probability;
          if (!matrix.has(context)) {
            matrix.set(context, new Map());
          }
          matrix.get(context).set(component, probability);
        });
        model.transitionMatrices.set(order, matrix);
      });
      return model;
    }
  }]);
}();

/**
 * Probabilistic Prediction Model
 * 
 * Implements a conditional probability based model for component usage prediction,
 * using the formula: P(c_i|c_j) = N(c_i,c_j) / ∑_k N(c_k,c_j)
 */
/**
 * ProbabilisticModel for component usage prediction based on conditional probabilities
 */
var ProbabilisticModel = /*#__PURE__*/function () {
  /**
   * Create a new ProbabilisticModel instance
   * @param {Object} options - Configuration options
   * @param {number} options.learningRate - Learning rate for model updates (default: 0.03)
   * @param {number} options.decayFactor - Decay factor for older transitions (default: 0.95)
   * @param {number} options.highPriorityThreshold - Threshold for high priority (default: 0.75)
   * @param {number} options.mediumPriorityThreshold - Threshold for medium priority (default: 0.4)
   */
  function ProbabilisticModel() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, ProbabilisticModel);
    this.options = _objectSpread2({
      learningRate: 0.03,
      decayFactor: 0.95,
      highPriorityThreshold: 0.75,
      mediumPriorityThreshold: 0.4
    }, options);

    // Initialize data structures
    this.transitionMatrix = new Map(); // Stores P(c_i|c_j)
    this.componentFrequency = new Map(); // Stores component usage frequency
    this.cooccurrenceMatrix = new Map(); // Stores N(c_i,c_j)

    // Metrics for performance tracking
    this.metrics = {
      totalPredictions: 0,
      correctPredictions: 0,
      lastUpdateTime: Date.now()
    };
  }

  /**
   * Process a transition between components
   * @param {string} sourceComponent - Source component ID
   * @param {string} targetComponent - Target component ID
   * @param {number} weight - Weight of the transition (default: 1)
   */
  return _createClass(ProbabilisticModel, [{
    key: "observeTransition",
    value: function observeTransition(sourceComponent, targetComponent) {
      var weight = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      if (!sourceComponent || !targetComponent) return;

      // Update component frequency
      this.componentFrequency.set(sourceComponent, (this.componentFrequency.get(sourceComponent) || 0) + weight);
      this.componentFrequency.set(targetComponent, (this.componentFrequency.get(targetComponent) || 0) + weight);

      // Update co-occurrence matrix
      if (!this.cooccurrenceMatrix.has(sourceComponent)) {
        this.cooccurrenceMatrix.set(sourceComponent, new Map());
      }
      var sourceMap = this.cooccurrenceMatrix.get(sourceComponent);
      var currentCount = sourceMap.get(targetComponent) || 0;

      // Apply learning rate to update
      var newCount = currentCount * (1 - this.options.learningRate) + weight * this.options.learningRate;
      sourceMap.set(targetComponent, newCount);

      // Update transition matrix
      this.updateTransitionProbabilities(sourceComponent);
    }

    /**
     * Process a sequence of component transitions
     * @param {Array} sequence - Sequence of component IDs
     */
  }, {
    key: "observeSequence",
    value: function observeSequence(sequence) {
      if (!sequence || sequence.length < 2) return;

      // Process each pair of adjacent components in the sequence
      for (var i = 0; i < sequence.length - 1; i++) {
        this.observeTransition(sequence[i], sequence[i + 1]);
      }
    }

    /**
     * Update transition probabilities for a specific source component
     * @param {string} sourceComponent - Source component ID
     */
  }, {
    key: "updateTransitionProbabilities",
    value: function updateTransitionProbabilities(sourceComponent) {
      if (!this.cooccurrenceMatrix.has(sourceComponent)) return;
      var sourceMap = this.cooccurrenceMatrix.get(sourceComponent);
      var total = Array.from(sourceMap.values()).reduce(function (sum, count) {
        return sum + count;
      }, 0);

      // Skip if no transitions have been observed
      if (total === 0) return;

      // Ensure transition matrix has an entry for this component
      if (!this.transitionMatrix.has(sourceComponent)) {
        this.transitionMatrix.set(sourceComponent, new Map());
      }
      var transitionMap = this.transitionMatrix.get(sourceComponent);

      // Update transition probabilities
      sourceMap.forEach(function (count, targetComponent) {
        // P(c_i|c_j) = N(c_i,c_j) / ∑_k N(c_k,c_j)
        transitionMap.set(targetComponent, count / total);
      });
    }

    /**
     * Get the transition probability between two components
     * @param {string} sourceComponent - Source component ID
     * @param {string} targetComponent - Target component ID
     * @returns {number} - Transition probability P(target|source)
     */
  }, {
    key: "getTransitionProbability",
    value: function getTransitionProbability(sourceComponent, targetComponent) {
      var transitionMap = this.transitionMatrix.get(sourceComponent);
      if (!transitionMap) return 0;
      return transitionMap.get(targetComponent) || 0;
    }

    /**
     * Predict next components based on current components
     * @param {Array} currentComponents - Currently active component IDs
     * @param {Array} availableComponents - Available components to predict from
     * @returns {Array} - Predictions with probabilities
     */
  }, {
    key: "predict",
    value: function predict(currentComponents, availableComponents) {
      var _this = this;
      if (!currentComponents || !availableComponents || currentComponents.length === 0 || availableComponents.length === 0) {
        return [];
      }
      var predictions = new Map();

      // For each current component, get transition probabilities to other components
      currentComponents.forEach(function (currentId) {
        var transitionMap = _this.transitionMatrix.get(currentId);
        if (!transitionMap) return;

        // For each available component, calculate probability
        availableComponents.forEach(function (component) {
          var componentId = component.id;

          // Skip if the component is already in the current set
          if (currentComponents.includes(componentId)) return;

          // Get transition probability
          var probability = transitionMap.get(componentId) || 0;

          // If we already have a prediction for this component, take the maximum
          if (predictions.has(componentId)) {
            var currentPrediction = predictions.get(componentId);
            if (probability > currentPrediction.probability) {
              currentPrediction.probability = probability;
              currentPrediction.sourceComponent = currentId;
            }
          } else {
            predictions.set(componentId, {
              componentId: componentId,
              probability: probability,
              sourceComponent: currentId,
              confidence: probability > 0 ? 0.7 : 0.3
            });
          }
        });
      });

      // Convert to array and sort by probability
      var result = Array.from(predictions.values());

      // Add priority based on thresholds
      result.forEach(function (prediction) {
        prediction.priority = _this.getPriorityFromProbability(prediction.probability);
      });

      // Sort by probability (highest first)
      result.sort(function (a, b) {
        return b.probability - a.probability;
      });
      return result;
    }

    /**
     * Get priority level based on probability
     * @param {number} probability - Prediction probability
     * @returns {string} - Priority level ('high', 'medium', 'low')
     */
  }, {
    key: "getPriorityFromProbability",
    value: function getPriorityFromProbability(probability) {
      if (probability >= this.options.highPriorityThreshold) {
        return 'high';
      } else if (probability >= this.options.mediumPriorityThreshold) {
        return 'medium';
      } else {
        return 'low';
      }
    }

    /**
     * Apply time decay to all transition counts
     * This gradually reduces the influence of old transitions
     */
  }, {
    key: "applyTimeDecay",
    value: function applyTimeDecay() {
      var _this2 = this;
      var now = Date.now();
      var timeSinceLastUpdate = (now - this.metrics.lastUpdateTime) / 1000; // in seconds

      // Skip if not enough time has passed
      if (timeSinceLastUpdate < 60) return; // Only decay after at least a minute

      // Calculate decay factor based on time passed
      var decayFactor = Math.pow(this.options.decayFactor, timeSinceLastUpdate / 3600); // Hourly base

      // Apply decay to co-occurrence matrix
      this.cooccurrenceMatrix.forEach(function (sourceMap, sourceId) {
        sourceMap.forEach(function (count, targetId) {
          sourceMap.set(targetId, count * decayFactor);
        });

        // Update transition probabilities after decay
        _this2.updateTransitionProbabilities(sourceId);
      });

      // Update last update time
      this.metrics.lastUpdateTime = now;
    }

    /**
     * Update metrics based on prediction accuracy
     * @param {string} actualComponent - Component that was actually used
     * @param {Array} predictions - Predictions that were made
     */
  }, {
    key: "updateMetrics",
    value: function updateMetrics(actualComponent, predictions) {
      this.metrics.totalPredictions++;

      // Check if the actual component was among the top predictions
      var predictedComponents = predictions.slice(0, 3).map(function (p) {
        return p.componentId;
      });
      if (predictedComponents.includes(actualComponent)) {
        this.metrics.correctPredictions++;
      }
    }

    /**
     * Get current prediction accuracy
     * @returns {number} - Accuracy as a value between 0 and 1
     */
  }, {
    key: "getAccuracy",
    value: function getAccuracy() {
      if (this.metrics.totalPredictions === 0) return 0;
      return this.metrics.correctPredictions / this.metrics.totalPredictions;
    }

    /**
     * Get metrics about the model's performance
     * @returns {Object} - Model metrics
     */
  }, {
    key: "getMetrics",
    value: function getMetrics() {
      return {
        accuracy: this.getAccuracy(),
        totalPredictions: this.metrics.totalPredictions,
        correctPredictions: this.metrics.correctPredictions,
        componentCount: this.componentFrequency.size,
        transitionCount: Array.from(this.cooccurrenceMatrix.values()).reduce(function (sum, map) {
          return sum + map.size;
        }, 0),
        mostFrequentComponents: this.getMostFrequentComponents(5)
      };
    }

    /**
     * Get the most frequently used components
     * @param {number} count - Number of components to return
     * @returns {Array} - Most frequent components with their frequencies
     */
  }, {
    key: "getMostFrequentComponents",
    value: function getMostFrequentComponents() {
      var count = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
      return Array.from(this.componentFrequency.entries()).sort(function (a, b) {
        return b[1] - a[1];
      }).slice(0, count).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          componentId = _ref2[0],
          frequency = _ref2[1];
        return {
          componentId: componentId,
          frequency: frequency
        };
      });
    }

    /**
     * Serialize the model for storage
     * @returns {Object} - Serialized model
     */
  }, {
    key: "serialize",
    value: function serialize() {
      return {
        options: _objectSpread2({}, this.options),
        metrics: _objectSpread2({}, this.metrics),
        componentFrequency: Array.from(this.componentFrequency.entries()).map(function (_ref3) {
          var _ref4 = _slicedToArray(_ref3, 2),
            id = _ref4[0],
            freq = _ref4[1];
          return {
            id: id,
            frequency: freq
          };
        }),
        cooccurrenceMatrix: Array.from(this.cooccurrenceMatrix.entries()).map(function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
            sourceId = _ref6[0],
            targetMap = _ref6[1];
          return {
            sourceId: sourceId,
            targets: Array.from(targetMap.entries()).map(function (_ref7) {
              var _ref8 = _slicedToArray(_ref7, 2),
                targetId = _ref8[0],
                count = _ref8[1];
              return {
                targetId: targetId,
                count: count
              };
            })
          };
        })
      };
    }

    /**
     * Deserialize a model from storage
     * @param {Object} serialized - Serialized model data
     * @returns {ProbabilisticModel} - Deserialized model
     */
  }, {
    key: "reset",
    value:
    /**
     * Reset the model
     */
    function reset() {
      this.transitionMatrix.clear();
      this.componentFrequency.clear();
      this.cooccurrenceMatrix.clear();
      this.metrics = {
        totalPredictions: 0,
        correctPredictions: 0,
        lastUpdateTime: Date.now()
      };
    }

    /**
     * Find the most likely path between components
     * @param {string} startComponent - Starting component ID
     * @param {string} endComponent - Ending component ID
     * @param {number} maxLength - Maximum path length to consider
     * @returns {Array} - Most likely path between the components
     */
  }, {
    key: "findMostLikelyPath",
    value: function findMostLikelyPath(startComponent, endComponent) {
      var _this3 = this;
      var maxLength = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 5;
      if (!startComponent || !endComponent) return [];
      if (startComponent === endComponent) return [startComponent];

      // Simple breadth-first search to find paths
      var queue = [[startComponent]];
      var visited = new Set([startComponent]);
      var paths = [];
      var _loop = function _loop() {
          var path = queue.shift();
          var lastComponent = path[path.length - 1];

          // If we reached the maximum path length, skip
          if (path.length > maxLength) return 0; // continue

          // Get transitions from the last component
          var transitions = _this3.transitionMatrix.get(lastComponent);
          if (!transitions) return 0; // continue

          // Check each possible next component
          transitions.forEach(function (probability, nextComponent) {
            // Skip if probability is too low
            if (probability < 0.1) return;

            // Skip if already visited (to avoid cycles)
            if (visited.has(nextComponent)) return;

            // Create a new path with this component
            var newPath = [].concat(_toConsumableArray(path), [nextComponent]);

            // If we reached the end component, add to paths
            if (nextComponent === endComponent) {
              paths.push({
                path: newPath,
                probability: _this3.calculatePathProbability(newPath)
              });
            } else {
              // Otherwise, add to queue for further exploration
              queue.push(newPath);
              visited.add(nextComponent);
            }
          });
        },
        _ret;
      while (queue.length > 0 && paths.length < 3) {
        _ret = _loop();
        if (_ret === 0) continue;
      }

      // Sort paths by probability
      paths.sort(function (a, b) {
        return b.probability - a.probability;
      });

      // Return the most likely path, or empty if none found
      return paths.length > 0 ? paths[0].path : [];
    }

    /**
     * Calculate the probability of a path
     * @param {Array} path - Sequence of component IDs
     * @returns {number} - Path probability
     */
  }, {
    key: "calculatePathProbability",
    value: function calculatePathProbability(path) {
      if (!path || path.length < 2) return 0;
      var probability = 1;

      // Multiply probabilities of each transition in the path
      for (var i = 0; i < path.length - 1; i++) {
        var transitionProb = this.getTransitionProbability(path[i], path[i + 1]);
        probability *= transitionProb;
      }
      return probability;
    }

    /**
     * Identify clusters of components that are frequently used together
     * @param {number} minClusterSize - Minimum size of clusters to identify
     * @param {number} probabilityThreshold - Minimum transition probability to consider
     * @returns {Array} - Clusters of related components
     */
  }, {
    key: "identifyComponentClusters",
    value: function identifyComponentClusters() {
      var minClusterSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 3;
      var probabilityThreshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.3;
      // Build an adjacency list of components with strong relationships
      var adjacencyList = new Map();
      this.transitionMatrix.forEach(function (transitions, sourceId) {
        adjacencyList.set(sourceId, []);
        transitions.forEach(function (probability, targetId) {
          if (probability >= probabilityThreshold) {
            adjacencyList.get(sourceId).push(targetId);
          }
        });
      });

      // Perform simple clustering (a basic form of community detection)
      var componentIds = Array.from(this.componentFrequency.keys());
      var visited = new Set();
      var clusters = [];
      componentIds.forEach(function (componentId) {
        if (visited.has(componentId)) return;

        // Start a new cluster
        var cluster = [];
        var queue = [componentId];
        while (queue.length > 0) {
          var current = queue.shift();
          if (visited.has(current)) continue;
          visited.add(current);
          cluster.push(current);

          // Add neighbors to the queue
          var neighbors = adjacencyList.get(current) || [];
          neighbors.forEach(function (neighbor) {
            if (!visited.has(neighbor)) {
              queue.push(neighbor);
            }
          });
        }

        // Only add clusters that meet the minimum size
        if (cluster.length >= minClusterSize) {
          clusters.push(cluster);
        }
      });
      return clusters;
    }
  }], [{
    key: "deserialize",
    value: function deserialize(serialized) {
      if (!serialized) throw new Error('Invalid serialized model data');
      var model = new ProbabilisticModel(serialized.options || {});

      // Restore metrics
      if (serialized.metrics) {
        model.metrics = _objectSpread2({}, serialized.metrics);
      }

      // Restore component frequency
      if (serialized.componentFrequency) {
        serialized.componentFrequency.forEach(function (_ref9) {
          var id = _ref9.id,
            frequency = _ref9.frequency;
          model.componentFrequency.set(id, frequency);
        });
      }

      // Restore co-occurrence matrix
      if (serialized.cooccurrenceMatrix) {
        serialized.cooccurrenceMatrix.forEach(function (_ref0) {
          var sourceId = _ref0.sourceId,
            targets = _ref0.targets;
          var targetMap = new Map();
          targets.forEach(function (_ref1) {
            var targetId = _ref1.targetId,
              count = _ref1.count;
            targetMap.set(targetId, count);
          });
          model.cooccurrenceMatrix.set(sourceId, targetMap);

          // Update transition probabilities
          model.updateTransitionProbabilities(sourceId);
        });
      }
      return model;
    }
  }]);
}();

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
var TransformerModel = /*#__PURE__*/function () {
  /**
   * Create a new TransformerModel
   * @param {Object} options - Configuration options
   * @param {number} options.embeddingSize - Size of component embeddings (default: 32)
   * @param {number} options.sequenceLength - Maximum sequence length to consider (default: 10)
   * @param {number} options.numHeads - Number of attention heads (default: 4)
   * @param {number} options.learningRate - Learning rate for updates (default: 0.01)
   */
  function TransformerModel() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    _classCallCheck(this, TransformerModel);
    this.options = _objectSpread2({
      embeddingSize: 32,
      sequenceLength: 10,
      numHeads: 4,
      learningRate: 0.01
    }, options);

    // Component embeddings (id -> vector)
    this.embeddings = new Map();

    // Attention matrices
    this.attentionMatrices = Array(this.options.numHeads).fill().map(function () {
      return new Map();
    });

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
  return _createClass(TransformerModel, [{
    key: "getComponentIndex",
    value: function getComponentIndex(componentId) {
      if (!this.componentToIndex.has(componentId)) {
        var index = this.nextIndex++;
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
  }, {
    key: "createRandomVector",
    value: function createRandomVector() {
      return Array(this.options.embeddingSize).fill().map(function () {
        return (Math.random() - 0.5) * 0.1;
      });
    }

    /**
     * Train the model on a sequence of component interactions
     * @param {Array} sequence - Sequence of component IDs
     */
  }, {
    key: "trainOnSequence",
    value: function trainOnSequence(sequence) {
      var _this = this;
      if (!sequence || sequence.length < 2) return;
      this.metrics.sequencesTrained++;

      // Process only the most recent part of the sequence if it's too long
      var effectiveSequence = sequence.slice(-this.options.sequenceLength);

      // Register all components in the sequence
      effectiveSequence.forEach(function (componentId) {
        return _this.getComponentIndex(componentId);
      });

      // For each position, predict the next component
      for (var i = 0; i < effectiveSequence.length - 1; i++) {
        var context = effectiveSequence.slice(0, i + 1);
        var targetComponent = effectiveSequence[i + 1];

        // Update model based on this example
        this.updateModelForExample(context, targetComponent);
      }
    }

    /**
     * Update model parameters for a single training example
     * @param {Array} context - Context sequence of component IDs
     * @param {string} targetComponent - Target component ID to predict
     */
  }, {
    key: "updateModelForExample",
    value: function updateModelForExample(context, targetComponent) {
      // Compute attention over the context
      var attentionOutputs = this.computeAttention(context);

      // Make a prediction based on current model
      this.predictNextComponent(attentionOutputs);

      // Compute error (very simplified for this implementation)
      var targetIndex = this.getComponentIndex(targetComponent);

      // Simple "error signal" - 1 for correct component, -1 for others
      var errorSignal = new Map();
      var _iterator = _createForOfIteratorHelper(this.embeddings),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 1),
            componentId = _step$value[0];
          var componentIndex = this.getComponentIndex(componentId);
          errorSignal.set(componentId, componentIndex === targetIndex ? 1 : -1);
        }

        // Update embeddings and attention matrices (simplified gradient descent)
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.updateParameters(context, errorSignal, attentionOutputs);
    }

    /**
     * Compute multi-head attention over a sequence
     * @param {Array} sequence - Sequence of component IDs
     * @returns {Array} Attention outputs
     */
  }, {
    key: "computeAttention",
    value: function computeAttention(sequence) {
      var _this2 = this;
      // This is a very simplified implementation of multi-head attention
      // A real transformer would have more complex operations

      // Get embeddings for each component in the sequence
      var embeddings = sequence.map(function (componentId) {
        return _this2.embeddings.get(componentId) || _this2.createRandomVector();
      });

      // Compute attention outputs for each head
      var headOutputs = this.options.numHeads.map(function (_, headIndex) {
        var attentionMatrix = _this2.attentionMatrices[headIndex];

        // Compute attention scores (simplified)
        var attentionScores = [];
        for (var i = 0; i < sequence.length; i++) {
          var scores = [];
          for (var j = 0; j < sequence.length; j++) {
            // Get or create attention weight between these components
            var sourceId = sequence[i];
            var targetId = sequence[j];
            var key = "".concat(sourceId, "|").concat(targetId);
            if (!attentionMatrix.has(key)) {
              // Initialize with a small random value
              attentionMatrix.set(key, Math.random() * 0.1);
            }
            scores.push(attentionMatrix.get(key));
          }

          // Apply softmax to get attention weights
          var softmaxScores = _this2.softmax(scores);
          attentionScores.push(softmaxScores);
        }

        // Apply attention weights to values (embeddings)
        var outputs = [];
        for (var _i = 0; _i < sequence.length; _i++) {
          var weightedSum = new Array(_this2.options.embeddingSize).fill(0);
          for (var _j = 0; _j < sequence.length; _j++) {
            var weight = attentionScores[_i][_j];
            var embedding = embeddings[_j];

            // Add weighted embedding
            for (var k = 0; k < _this2.options.embeddingSize; k++) {
              weightedSum[k] += weight * embedding[k];
            }
          }
          outputs.push(weightedSum);
        }
        return outputs;
      });

      // Combine outputs from all heads (just average for simplicity)
      var combinedOutputs = [];
      for (var i = 0; i < sequence.length; i++) {
        var combined = new Array(this.options.embeddingSize).fill(0);
        for (var head = 0; head < this.options.numHeads; head++) {
          var headOutput = headOutputs[head][i];
          for (var j = 0; j < this.options.embeddingSize; j++) {
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
  }, {
    key: "softmax",
    value: function softmax(scores) {
      // Numerical stability: subtract max score
      var maxScore = Math.max.apply(Math, _toConsumableArray(scores));
      var expScores = scores.map(function (score) {
        return Math.exp(score - maxScore);
      });
      var sumExpScores = expScores.reduce(function (sum, exp) {
        return sum + exp;
      }, 0);
      return expScores.map(function (exp) {
        return exp / sumExpScores;
      });
    }

    /**
     * Predict the next component based on attention outputs
     * @param {Array} attentionOutputs - Outputs from attention mechanism
     * @returns {Map} Probabilities for each component
     */
  }, {
    key: "predictNextComponent",
    value: function predictNextComponent(attentionOutputs) {
      if (!attentionOutputs || attentionOutputs.length === 0) {
        return new Map();
      }

      // Use the last position's output for prediction
      var lastOutput = attentionOutputs[attentionOutputs.length - 1];

      // Compute scores for each possible next component
      var scores = new Map();
      var _iterator2 = _createForOfIteratorHelper(this.embeddings.entries()),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
            componentId = _step2$value[0],
            embedding = _step2$value[1];
          // Compute dot product between last output and component embedding
          var score = 0;
          for (var _i2 = 0; _i2 < this.options.embeddingSize; _i2++) {
            score += lastOutput[_i2] * embedding[_i2];
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
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      var scoreValues = Array.from(scores.values());
      var probabilities = this.softmax(scoreValues);

      // Create component to probability mapping
      var result = new Map();
      var i = 0;
      var _iterator3 = _createForOfIteratorHelper(scores.keys()),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _componentId = _step3.value;
          result.set(_componentId, probabilities[i++]);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return result;
    }

    /**
     * Update model parameters based on error signal
     * @param {Array} context - Context sequence
     * @param {Map} errorSignal - Error signal for each component
     * @param {Array} attentionOutputs - Outputs from attention mechanism
     */
  }, {
    key: "updateParameters",
    value: function updateParameters(context, errorSignal, attentionOutputs) {
      // Update output projection weights
      var _iterator4 = _createForOfIteratorHelper(errorSignal.entries()),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var _step4$value = _slicedToArray(_step4.value, 2),
            componentId = _step4$value[0],
            signal = _step4$value[1];
          var currentValue = this.outputProjection.get(componentId) || 0;
          this.outputProjection.set(componentId, currentValue + this.options.learningRate * signal);
        }

        // Update embeddings (very simplified)
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      var _iterator5 = _createForOfIteratorHelper(errorSignal.entries()),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var _step5$value = _slicedToArray(_step5.value, 2),
            _componentId2 = _step5$value[0],
            _signal = _step5$value[1];
          var embedding = this.embeddings.get(_componentId2);
          if (embedding) {
            // Small adjustment based on signal
            for (var _i3 = 0; _i3 < embedding.length; _i3++) {
              embedding[_i3] += this.options.learningRate * _signal * 0.01;
            }
          }
        }

        // Update attention matrices (very simplified)
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      for (var head = 0; head < this.options.numHeads; head++) {
        var attentionMatrix = this.attentionMatrices[head];
        for (var i = 0; i < context.length; i++) {
          for (var j = 0; j < context.length; j++) {
            var sourceId = context[i];
            var targetId = context[j];
            var key = "".concat(sourceId, "|").concat(targetId);

            // Get current attention weight
            var currentWeight = attentionMatrix.get(key) || 0;

            // Simple update based on target component's error signal
            var targetSignal = errorSignal.get(context[context.length - 1]) || 0;

            // Update weight
            attentionMatrix.set(key, currentWeight + this.options.learningRate * targetSignal * 0.01);
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
  }, {
    key: "predict",
    value: function predict(context, availableComponents) {
      var _this3 = this;
      if (!context || context.length === 0 || !availableComponents || availableComponents.length === 0) {
        return [];
      }

      // Process only the most recent part of the sequence if it's too long
      var effectiveContext = context.slice(-this.options.sequenceLength);

      // Register any new components
      effectiveContext.forEach(function (componentId) {
        return _this3.getComponentIndex(componentId);
      });

      // Compute attention over the context
      var attentionOutputs = this.computeAttention(effectiveContext);

      // Get probabilities for each component
      var probabilities = this.predictNextComponent(attentionOutputs);

      // Create predictions array
      var predictions = [];

      // Add predictions for available components
      var _iterator6 = _createForOfIteratorHelper(availableComponents),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var component = _step6.value;
          var componentId = component.id;

          // Skip components already in context
          if (effectiveContext.includes(componentId)) continue;

          // Get probability, defaulting to a small value if not found
          var probability = probabilities.get(componentId) || 0.01;
          predictions.push({
            componentId: componentId,
            probability: probability,
            confidence: 0.8,
            // Transformers generally have higher confidence
            priority: this.getPriorityFromProbability(probability),
            model: 'transformer'
          });
        }

        // Sort by probability (highest first)
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
      predictions.sort(function (a, b) {
        return b.probability - a.probability;
      });
      return predictions;
    }

    /**
     * Get priority level based on probability
     * @param {number} probability - Probability value
     * @returns {string} Priority level ('high', 'medium', 'low')
     */
  }, {
    key: "getPriorityFromProbability",
    value: function getPriorityFromProbability(probability) {
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
  }, {
    key: "updateMetrics",
    value: function updateMetrics(actualComponent, predictions) {
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
  }, {
    key: "getMetrics",
    value: function getMetrics() {
      return _objectSpread2(_objectSpread2({}, this.metrics), {}, {
        modelSize: {
          components: this.embeddings.size,
          embeddingSize: this.options.embeddingSize,
          attentionHeads: this.options.numHeads,
          parameters: this.calculateParameterCount()
        }
      });
    }

    /**
     * Calculate the total number of parameters in the model
     * @returns {number} Parameter count
     */
  }, {
    key: "calculateParameterCount",
    value: function calculateParameterCount() {
      var numComponents = this.embeddings.size;

      // Embedding parameters
      var embeddingParams = numComponents * this.options.embeddingSize;

      // Attention matrix parameters
      var attentionParams = 0;
      var _iterator7 = _createForOfIteratorHelper(this.attentionMatrices),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var matrix = _step7.value;
          attentionParams += matrix.size;
        }

        // Output projection parameters
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
      var outputParams = this.outputProjection.size;
      return embeddingParams + attentionParams + outputParams;
    }

    /**
     * Serialize the model for storage
     * @returns {Object} Serialized model
     */
  }, {
    key: "serialize",
    value: function serialize() {
      return {
        options: _objectSpread2({}, this.options),
        metrics: _objectSpread2({}, this.metrics),
        embeddings: Array.from(this.embeddings.entries()).map(function (_ref) {
          var _ref2 = _slicedToArray(_ref, 2),
            id = _ref2[0],
            vector = _ref2[1];
          return {
            id: id,
            vector: _toConsumableArray(vector)
          };
        }),
        attentionMatrices: this.attentionMatrices.map(function (matrix) {
          return Array.from(matrix.entries()).map(function (_ref3) {
            var _ref4 = _slicedToArray(_ref3, 2),
              key = _ref4[0],
              value = _ref4[1];
            return {
              key: key,
              value: value
            };
          });
        }),
        outputProjection: Array.from(this.outputProjection.entries()).map(function (_ref5) {
          var _ref6 = _slicedToArray(_ref5, 2),
            id = _ref6[0],
            value = _ref6[1];
          return {
            id: id,
            value: value
          };
        }),
        componentMapping: Array.from(this.componentToIndex.entries()).map(function (_ref7) {
          var _ref8 = _slicedToArray(_ref7, 2),
            id = _ref8[0],
            index = _ref8[1];
          return {
            id: id,
            index: index
          };
        }),
        nextIndex: this.nextIndex
      };
    }

    /**
     * Deserialize a model from storage
     * @param {Object} serialized - Serialized model
     * @returns {TransformerModel} Deserialized model
     */
  }, {
    key: "reset",
    value:
    /**
     * Reset the model
     */
    function reset() {
      // Clear all data structures
      this.embeddings.clear();
      this.attentionMatrices.forEach(function (matrix) {
        return matrix.clear();
      });
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
  }, {
    key: "pruneComponents",
    value: function pruneComponents() {
      var _this4 = this;
      var usageThreshold = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 5;
      // Get component usage counts
      var usageCounts = new Map();

      // Count occurrences in attention matrices
      this.attentionMatrices.forEach(function (matrix) {
        Array.from(matrix.keys()).forEach(function (key) {
          var _key$split = key.split('|'),
            _key$split2 = _slicedToArray(_key$split, 2),
            sourceId = _key$split2[0],
            targetId = _key$split2[1];
          usageCounts.set(sourceId, (usageCounts.get(sourceId) || 0) + 1);
          usageCounts.set(targetId, (usageCounts.get(targetId) || 0) + 1);
        });
      });

      // Identify components to remove
      var componentsToRemove = [];
      var _iterator8 = _createForOfIteratorHelper(this.embeddings),
        _step8;
      try {
        for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
          var _step8$value = _slicedToArray(_step8.value, 1),
            componentId = _step8$value[0];
          var usageCount = usageCounts.get(componentId) || 0;
          if (usageCount < usageThreshold) {
            componentsToRemove.push(componentId);
          }
        }

        // Remove embeddings for these components
      } catch (err) {
        _iterator8.e(err);
      } finally {
        _iterator8.f();
      }
      componentsToRemove.forEach(function (componentId) {
        _this4.embeddings["delete"](componentId);
        _this4.outputProjection["delete"](componentId);

        // Remove from component mapping
        var index = _this4.componentToIndex.get(componentId);
        if (index !== undefined) {
          _this4.componentToIndex["delete"](componentId);
          _this4.indexToComponent["delete"](index);
        }
      });

      // Clean up attention matrices
      this.attentionMatrices.forEach(function (matrix) {
        var keysToRemove = [];
        var _iterator9 = _createForOfIteratorHelper(matrix.keys()),
          _step9;
        try {
          for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
            var key = _step9.value;
            var _key$split3 = key.split('|'),
              _key$split4 = _slicedToArray(_key$split3, 2),
              sourceId = _key$split4[0],
              targetId = _key$split4[1];
            if (componentsToRemove.includes(sourceId) || componentsToRemove.includes(targetId)) {
              keysToRemove.push(key);
            }
          }
        } catch (err) {
          _iterator9.e(err);
        } finally {
          _iterator9.f();
        }
        keysToRemove.forEach(function (key) {
          return matrix["delete"](key);
        });
      });
      return componentsToRemove.length;
    }
  }], [{
    key: "deserialize",
    value: function deserialize(serialized) {
      if (!serialized || !serialized.options || !serialized.embeddings) {
        throw new Error('Invalid serialized Transformer model');
      }
      var model = new TransformerModel(serialized.options);

      // Restore metrics
      if (serialized.metrics) {
        model.metrics = _objectSpread2({}, serialized.metrics);
      }

      // Restore embeddings
      serialized.embeddings.forEach(function (_ref9) {
        var id = _ref9.id,
          vector = _ref9.vector;
        model.embeddings.set(id, _toConsumableArray(vector));
      });

      // Restore attention matrices
      serialized.attentionMatrices.forEach(function (matrixData, index) {
        var matrix = new Map();
        matrixData.forEach(function (_ref0) {
          var key = _ref0.key,
            value = _ref0.value;
          matrix.set(key, value);
        });
        model.attentionMatrices[index] = matrix;
      });

      // Restore output projection
      serialized.outputProjection.forEach(function (_ref1) {
        var id = _ref1.id,
          value = _ref1.value;
        model.outputProjection.set(id, value);
      });

      // Restore component mapping
      serialized.componentMapping.forEach(function (_ref10) {
        var id = _ref10.id,
          index = _ref10.index;
        model.componentToIndex.set(id, index);
        model.indexToComponent.set(index, id);
      });

      // Restore next index
      model.nextIndex = serialized.nextIndex;
      return model;
    }
  }]);
}();

export { AdaptiveLoadingQueue, BehaviorAnalysis, DynamicComponentLoader, MarkovChain, PredictionEngine, ProbabilisticModel, ReactSmartContext, ReactSmartProvider, SmartRoute, TransformerModel, useComponentTracker, useNetworkAware, withReactSmart };
//# sourceMappingURL=index.esm.js.map
