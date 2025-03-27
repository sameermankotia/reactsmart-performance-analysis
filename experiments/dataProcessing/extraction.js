/**
 * Data Extraction Utility
 * 
 * Extracts performance data from various sources including:
 * - HAR files (HTTP Archive)
 * - Chrome User Experience Report (CrUX)
 * - WebPageTest results
 * - Custom performance logs
 * 
 * This utility is used in the ReactSmart experimental framework to
 * process and normalize performance data for analysis.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const gunzip = promisify(zlib.gunzip);
const csvParse = require('csv-parse/lib/sync');
const JsonStreamStringify = require('json-stream-stringify');

// Performance metric mappings across different data sources
const METRIC_MAPPINGS = {
  // HAR metrics
  har: {
    initialLoad: 'onLoad',
    ttfb: 'ttfb',
    fcp: '_firstContentfulPaint',
    lcp: '_largestContentfulPaint',
    cls: '_cumulativeLayoutShift',
    tbt: '_totalBlockingTime',
    fid: '_firstInputDelay',
    tti: '_timeToInteractive'
  },
  
  // CrUX metrics
  crux: {
    initialLoad: 'load',
    ttfb: 'first-contentful-paint',
    fcp: 'first-contentful-paint',
    lcp: 'largest-contentful-paint',
    cls: 'cumulative-layout-shift',
    fid: 'first-input-delay',
    tti: 'time-to-interactive'
  },
  
  // WebPageTest metrics
  wpt: {
    initialLoad: 'loadTime',
    ttfb: 'TTFB',
    fcp: 'firstContentfulPaint',
    lcp: 'largestContentfulPaint',
    cls: 'cumulativeLayoutShift',
    tbt: 'TotalBlockingTime',
    fid: 'firstInteraction',
    tti: 'TimeToInteractive'
  },
  
  // ReactSmart custom metrics
  reactsmart: {
    initialLoad: 'initialLoad',
    ttfb: 'ttfb',
    fcp: 'fcp',
    lcp: 'lcp',
    cls: 'cls',
    tbt: 'tbt',
    fid: 'fid',
    tti: 'tti',
    
    // Custom metrics
    predictionAccuracy: 'predictionAccuracy',
    preloadedCount: 'preloadedCount',
    usedPreloadedCount: 'usedPreloadedCount',
    hitRate: 'hitRate',
    networkSavingsKB: 'networkSavingsKB'
  }
};

/**
 * Extract performance data from HAR files
 * @param {string} filePath - Path to HAR file
 * @returns {Object} - Extracted performance data
 */
async function extractFromHAR(filePath) {
  try {
    // Read and parse HAR file
    const content = await readFile(filePath, 'utf8');
    const harData = JSON.parse(content);
    
    // Validate HAR structure
    if (!harData.log || !harData.log.entries) {
      throw new Error('Invalid HAR file format');
    }
    
    // Extract metadata
    const metadata = {
      source: 'HAR',
      url: harData.log.entries[0]?.request?.url || 'unknown',
      browser: harData.log.browser?.name || 'unknown',
      datetime: new Date(harData.log.pages[0]?.startedDateTime || Date.now()).toISOString()
    };
    
    // Extract performance metrics
    const pages = harData.log.pages || [];
    const metrics = {};
    
    if (pages.length > 0) {
      const page = pages[0];
      
      // Extract standard timing metrics
      if (page.pageTimings) {
        metrics.initialLoad = page.pageTimings.onLoad || 0;
        metrics.ttfb = findTTFB(harData.log.entries, page.id);
      }
      
      // Extract performance entries
      if (page._performanceMetrics) {
        const perfMap = METRIC_MAPPINGS.har;
        
        Object.keys(perfMap).forEach(metricKey => {
          const harKey = perfMap[metricKey];
          if (page._performanceMetrics[harKey] !== undefined) {
            metrics[metricKey] = page._performanceMetrics[harKey];
          }
        });
      }
    }
    
    // Extract resource information
    const resources = extractResourceInfo(harData.log.entries);
    
    return {
      metadata,
      metrics,
      resources
    };
  } catch (error) {
    console.error(`Error extracting data from HAR file ${filePath}:`, error);
    return null;
  }
}

/**
 * Find Time To First Byte from HAR entries
 * @param {Array} entries - HAR entries
 * @param {string} pageId - Page ID
 * @returns {number} - TTFB in milliseconds
 */
function findTTFB(entries, pageId) {
  // Look for the main document request
  const pageEntries = entries.filter(entry => entry.pageref === pageId);
  const mainRequest = pageEntries.find(entry => {
    return entry.request.url === pageEntries[0].request.url && 
           entry.response.status >= 200 && 
           entry.response.status < 300;
  });
  
  if (mainRequest && mainRequest.timings) {
    return mainRequest.timings.wait || 0;
  }
  
  return 0;
}

/**
 * Extract resource information from HAR entries
 * @param {Array} entries - HAR entries
 * @returns {Array} - Resource information
 */
function extractResourceInfo(entries) {
  return entries.map(entry => {
    const url = entry.request.url;
    const size = entry.response.content.size;
    const mimeType = entry.response.content.mimeType;
    const timings = entry.timings;
    
    // Determine resource type
    let type = 'other';
    if (mimeType.includes('javascript')) {
      type = 'script';
    } else if (mimeType.includes('css')) {
      type = 'stylesheet';
    } else if (mimeType.includes('image')) {
      type = 'image';
    } else if (mimeType.includes('font')) {
      type = 'font';
    } else if (mimeType.includes('html')) {
      type = 'document';
    }
    
    return {
      url,
      type,
      size,
      transferSize: entry.response.bodySize,
      duration: entry.time,
      timings
    };
  });
}

/**
 * Extract performance data from Chrome UX Report (CrUX)
 * @param {string} filePath - Path to CrUX JSON file
 * @returns {Object} - Extracted performance data
 */
async function extractFromCrUX(filePath) {
  try {
    // Read and parse CrUX file
    const content = await readFile(filePath, 'utf8');
    const cruxData = JSON.parse(content);
    
    // Validate CrUX structure
    if (!cruxData.record || !cruxData.record.metrics) {
      throw new Error('Invalid CrUX file format');
    }
    
    // Extract metadata
    const metadata = {
      source: 'CrUX',
      url: cruxData.record.url || 'unknown',
      origin: cruxData.record.origin || 'unknown',
      formFactor: cruxData.record.key.formFactor || 'all',
      effectiveConnectionType: cruxData.record.key.effectiveConnectionType || '4G',
      datetime: new Date(cruxData.collectionPeriod.endDate || Date.now()).toISOString()
    };
    
    // Extract metrics
    const metrics = {};
    const perfMap = METRIC_MAPPINGS.crux;
    
    Object.entries(cruxData.record.metrics).forEach(([metricName, metricData]) => {
      // Find the corresponding standard metric name
      const standardMetric = Object.keys(perfMap).find(key => perfMap[key] === metricName);
      
      if (standardMetric) {
        // Use p75 (75th percentile) as the representative value
        if (metricData.percentiles && metricData.percentiles.p75) {
          metrics[standardMetric] = metricData.percentiles.p75;
        }
        
        // Add histogram data
        if (metricData.histogram) {
          metrics[`${standardMetric}_histogram`] = metricData.histogram;
        }
      }
    });
    
    return {
      metadata,
      metrics,
      // CrUX doesn't provide resource-level data
      resources: []
    };
  } catch (error) {
    console.error(`Error extracting data from CrUX file ${filePath}:`, error);
    return null;
  }
}

/**
 * Extract performance data from WebPageTest JSON result
 * @param {string} filePath - Path to WebPageTest JSON file
 * @returns {Object} - Extracted performance data
 */
async function extractFromWebPageTest(filePath) {
  try {
    // Read and parse WebPageTest file
    const content = await readFile(filePath, 'utf8');
    const wptData = JSON.parse(content);
    
    // Validate WebPageTest structure
    if (!wptData.data || !wptData.data.runs) {
      throw new Error('Invalid WebPageTest file format');
    }
    
    // Get the first run
    const firstView = Object.values(wptData.data.runs)[0].firstView;
    
    if (!firstView) {
      throw new Error('No first view data in WebPageTest result');
    }
    
    // Extract metadata
    const metadata = {
      source: 'WebPageTest',
      url: wptData.data.url || 'unknown',
      browser: wptData.data.browser_name || 'unknown',
      location: wptData.data.location || 'unknown',
      connectivity: wptData.data.connectivity || 'unknown',
      datetime: new Date(wptData.data.completed || Date.now()).toISOString(),
      testId: wptData.data.id || 'unknown'
    };
    
    // Extract metrics
    const metrics = {};
    const perfMap = METRIC_MAPPINGS.wpt;
    
    Object.keys(perfMap).forEach(metricKey => {
      const wptKey = perfMap[metricKey];
      if (firstView[wptKey] !== undefined) {
        metrics[metricKey] = firstView[wptKey];
      }
    });
    
    // Extract resource information
    const resources = [];
    
    if (firstView.requests) {
      firstView.requests.forEach(request => {
        resources.push({
          url: request.url,
          type: request.contentType,
          size: request.bytesIn,
          transferSize: request.bytesIn,
          duration: request.ttfb + request.download,
          timings: {
            dns: request.dns,
            connect: request.connect,
            ssl: request.ssl,
            ttfb: request.ttfb,
            download: request.download
          }
        });
      });
    }
    
    return {
      metadata,
      metrics,
      resources
    };
  } catch (error) {
    console.error(`Error extracting data from WebPageTest file ${filePath}:`, error);
    return null;
  }
}

/**
 * Extract performance data from ReactSmart performance logs
 * @param {string} filePath - Path to ReactSmart performance log
 * @returns {Object} - Extracted performance data
 */
async function extractFromReactSmartLogs(filePath) {
  try {
    // Check file extension to determine format
    const ext = path.extname(filePath).toLowerCase();
    let logData;
    
    if (ext === '.gz') {
      // Decompress gzipped log file
      const compressedData = await readFile(filePath);
      const decompressedData = await gunzip(compressedData);
      logData = JSON.parse(decompressedData.toString());
    } else if (ext === '.json') {
      // Read JSON log file
      const content = await readFile(filePath, 'utf8');
      logData = JSON.parse(content);
    } else if (ext === '.csv') {
      // Parse CSV log file
      const content = await readFile(filePath, 'utf8');
      logData = csvParse(content, {
        columns: true,
        skipEmptyLines: true
      });
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }
    
    // Process the log data
    if (Array.isArray(logData)) {
      // Multiple sessions in a single file
      return logData.map(processReactSmartLogEntry);
    } else {
      // Single session log
      return processReactSmartLogEntry(logData);
    }
  } catch (error) {
    console.error(`Error extracting data from ReactSmart log ${filePath}:`, error);
    return null;
  }
}

/**
 * Process a single ReactSmart log entry
 * @param {Object} logEntry - Log entry data
 * @returns {Object} - Processed performance data
 */
function processReactSmartLogEntry(logEntry) {
  // Extract metadata
  const metadata = {
    source: 'ReactSmart',
    url: logEntry.url || 'unknown',
    browser: logEntry.browser || 'unknown',
    device: logEntry.device || 'unknown',
    network: logEntry.network || 'unknown',
    datetime: new Date(logEntry.timestamp || Date.now()).toISOString(),
    sessionId: logEntry.sessionId || 'unknown',
    optimizationEnabled: logEntry.optimizationEnabled || false
  };
  
  // Extract metrics
  const metrics = {};
  const perfMap = METRIC_MAPPINGS.reactsmart;
  
  Object.keys(perfMap).forEach(metricKey => {
    const logKey = perfMap[metricKey];
    if (logEntry[logKey] !== undefined) {
      metrics[metricKey] = logEntry[logKey];
    }
  });
  
  // Extract component data
  const components = logEntry.components || [];
  
  // Extract resource data
  const resources = logEntry.resources || [];
  
  return {
    metadata,
    metrics,
    resources,
    components
  };
}

/**
 * Batch process multiple files from a directory
 * @param {string} dirPath - Path to directory containing performance data files
 * @param {string} outputPath - Path to output the processed data
 * @param {Object} options - Processing options
 */
async function batchProcessDirectory(dirPath, outputPath, options = {}) {
  const {
    fileTypes = ['.har', '.json', '.csv', '.gz'],
    recursive = true,
    maxFiles = Infinity,
    normalizeMetrics = true,
    filterByUrl = null,
    mergeResults = true
  } = options;
  
  try {
    // Collect all matching files
    const files = await collectFiles(dirPath, fileTypes, recursive, maxFiles);
    console.log(`Found ${files.length} files to process`);
    
    // Process files
    const results = [];
    let processedCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      try {
        // Determine file type and extract data
        const ext = path.extname(file).toLowerCase();
        let data;
        
        if (ext === '.har') {
          data = await extractFromHAR(file);
        } else if (file.includes('crux') && (ext === '.json' || ext === '.gz')) {
          data = await extractFromCrUX(file);
        } else if (file.includes('webpagetest') && (ext === '.json' || ext === '.gz')) {
          data = await extractFromWebPageTest(file);
        } else {
          data = await extractFromReactSmartLogs(file);
        }
        
        // Apply URL filter if specified
        if (filterByUrl && data) {
          if (Array.isArray(data)) {
            data = data.filter(item => item.metadata.url.includes(filterByUrl));
          } else if (!data.metadata.url.includes(filterByUrl)) {
            data = null;
          }
        }
        
        // Normalize metrics if requested
        if (normalizeMetrics && data) {
          if (Array.isArray(data)) {
            data.forEach(normalizeMetricValues);
          } else {
            normalizeMetricValues(data);
          }
        }
        
        // Add to results
        if (data) {
          if (Array.isArray(data)) {
            results.push(...data);
          } else {
            results.push(data);
          }
          processedCount++;
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Successfully processed ${processedCount} files with ${errorCount} errors`);
    console.log(`Total data points: ${results.length}`);
    
    // Save results
    if (mergeResults) {
      // Save as a single file
      await writeResultsToFile(results, outputPath);
    } else {
      // Save each result as a separate file
      const outputDir = path.dirname(outputPath);
      const outputBase = path.basename(outputPath, path.extname(outputPath));
      
      for (let i = 0; i < results.length; i++) {
        const individualPath = path.join(outputDir, `${outputBase}_${i + 1}${path.extname(outputPath)}`);
        await writeResultsToFile([results[i]], individualPath);
      }
    }
    
    console.log(`Results saved to ${outputPath}`);
    return results;
  } catch (error) {
    console.error('Error in batch processing:', error);
    throw error;
  }
}

/**
 * Collect files matching criteria from a directory
 * @param {string} dirPath - Directory path
 * @param {Array} fileTypes - File extensions to include
 * @param {boolean} recursive - Whether to search recursively
 * @param {number} maxFiles - Maximum number of files to process
 * @returns {Array} - List of matching file paths
 */
async function collectFiles(dirPath, fileTypes, recursive, maxFiles) {
  const files = [];
  
  async function processDir(currentDir) {
    const items = await readdir(currentDir);
    
    for (const item of items) {
      if (files.length >= maxFiles) break;
      
      const itemPath = path.join(currentDir, item);
      const itemStat = await stat(itemPath);
      
      if (itemStat.isDirectory() && recursive) {
        await processDir(itemPath);
      } else if (itemStat.isFile() && fileTypes.some(type => itemPath.endsWith(type))) {
        files.push(itemPath);
      }
    }
  }
  
  await processDir(dirPath);
  return files.slice(0, maxFiles);
}

/**
 * Normalize metric values to standardized formats
 * @param {Object} data - Performance data object
 */
function normalizeMetricValues(data) {
  if (!data || !data.metrics) return;
  
  const metrics = data.metrics;
  
  // Convert time values to milliseconds if necessary
  ['initialLoad', 'ttfb', 'fcp', 'lcp', 'tbt', 'fid', 'tti'].forEach(metric => {
    if (metrics[metric] !== undefined) {
      // Check if the value is in seconds (less than 1000 but greater than 0)
      if (metrics[metric] > 0 && metrics[metric] < 100) {
        metrics[metric] = metrics[metric] * 1000;
      }
    }
  });
  
  // Ensure CLS is a decimal between 0 and 1
  if (metrics.cls !== undefined) {
    if (metrics.cls > 1) {
      metrics.cls = metrics.cls / 100;
    }
  }
  
  // Normalize prediction accuracy to percentage
  if (metrics.predictionAccuracy !== undefined) {
    if (metrics.predictionAccuracy <= 1) {
      metrics.predictionAccuracy = metrics.predictionAccuracy * 100;
    }
  }
  
  // Normalize hit rate to percentage
  if (metrics.hitRate !== undefined) {
    if (metrics.hitRate <= 1) {
      metrics.hitRate = metrics.hitRate * 100;
    }
  }
}

/**
 * Write results to a file, handling large datasets efficiently
 * @param {Array} results - Results to write
 * @param {string} filePath - Output file path
 */
async function writeResultsToFile(results, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.json') {
    // For large datasets, use streaming to avoid memory issues
    if (results.length > 10000) {
      const outputStream = fs.createWriteStream(filePath);
      const jsonStream = new JsonStreamStringify(results);
      
      jsonStream.pipe(outputStream);
      
      return new Promise((resolve, reject) => {
        outputStream.on('finish', resolve);
        outputStream.on('error', reject);
      });
    } else {
      // For smaller datasets, write directly
      await writeFile(filePath, JSON.stringify(results, null, 2));
    }
  } else if (ext === '.csv') {
    // Convert to CSV
    let csv = '';
    
    // Get all possible headers from all results
    const headers = new Set();
    
    // First collect all possible metric names
    results.forEach(result => {
      Object.keys(result.metrics).forEach(key => headers.add(key));
      
      // Add metadata fields with 'meta_' prefix
      Object.keys(result.metadata).forEach(key => headers.add(`meta_${key}`));
    });
    
    // Create header row
    csv = Array.from(headers).join(',') + '\n';
    
    // Add data rows
    results.forEach(result => {
      const row = [];
      
      // Add each header field
      for (const header of headers) {
        if (header.startsWith('meta_')) {
          // This is a metadata field
          const metaKey = header.substring(5);
          row.push(result.metadata[metaKey] || '');
        } else {
          // This is a metric
          row.push(result.metrics[header] || '');
        }
      }
      
      csv += row.join(',') + '\n';
    });
    
    await writeFile(filePath, csv);
  } else {
    throw new Error(`Unsupported output format: ${ext}`);
  }
}

module.exports = {
  extractFromHAR,
  extractFromCrUX,
  extractFromWebPageTest,
  extractFromReactSmartLogs,
  batchProcessDirectory,
  normalizeMetricValues
};