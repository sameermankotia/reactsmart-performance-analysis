/**
 * Component Identifier
 * 
 * Utility for identifying and extracting React component information from application bundles
 * and runtime execution. This is used for analysis purposes in experiments.
 */

const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const jsx = require('acorn-jsx');
const walk = require('acorn-walk');
const puppeteer = require('puppeteer');

/**
 * Extract component information from application bundles
 * @param {string} bundlePath - Path to JavaScript bundle file
 * @returns {Array} - Extracted component information
 */
async function extractComponentsFromBundle(bundlePath) {
  try {
    // Read bundle file
    const code = fs.readFileSync(bundlePath, 'utf-8');
    
    // Parse JavaScript code with JSX support
    const parser = acorn.Parser.extend(jsx());
    const ast = parser.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true
    });
    
    // Component data
    const components = [];
    const functionComponents = new Set();
    const classComponents = new Set();
    
    // Walk AST to find React components
    walk.simple(ast, {
      // Find function declarations that might be components
      FunctionDeclaration(node) {
        // Component candidates must have PascalCase names
        if (node.id && isComponentName(node.id.name)) {
          // Check function body for JSX return
          const hasJsxReturn = findJsxReturn(node);
          
          if (hasJsxReturn) {
            functionComponents.add(node.id.name);
            
            components.push({
              name: node.id.name,
              type: 'function',
              location: formatLocation(node.loc),
              size: estimateComponentSize(node),
              props: extractProps(node)
            });
          }
        }
      },
      
      // Find arrow functions that might be components
      ArrowFunctionExpression(node) {
        // Check for variable declaration parent
        const parent = findParentVariableDeclaration(node);
        if (parent && parent.id && isComponentName(parent.id.name)) {
          // Check function body for JSX return
          const hasJsxReturn = findJsxReturn(node);
          
          if (hasJsxReturn) {
            functionComponents.add(parent.id.name);
            
            components.push({
              name: parent.id.name,
              type: 'arrow-function',
              location: formatLocation(node.loc),
              size: estimateComponentSize(node),
              props: extractProps(node)
            });
          }
        }
      },
      
      // Find class declarations that extend React.Component
      ClassDeclaration(node) {
        if (node.superClass && 
            ((node.superClass.type === 'MemberExpression' && 
              node.superClass.object.name === 'React' && 
              node.superClass.property.name === 'Component') ||
             (node.superClass.type === 'Identifier' && 
              node.superClass.name === 'Component'))
          ) {
          classComponents.add(node.id.name);
          
          components.push({
            name: node.id.name,
            type: 'class',
            location: formatLocation(node.loc),
            size: estimateComponentSize(node),
            props: extractPropsFromClass(node)
          });
        }
      },
      
      // Find Component imports
      ImportDeclaration(node) {
        const source = node.source.value;
        
        node.specifiers.forEach(specifier => {
          if (specifier.type === 'ImportSpecifier' || specifier.type === 'ImportDefaultSpecifier') {
            if (isComponentName(specifier.local.name)) {
              components.push({
                name: specifier.local.name,
                type: 'imported',
                source: source,
                location: formatLocation(node.loc)
              });
            }
          }
        });
      },
      
      // Find JSX elements to identify component usage
      JSXElement(node) {
        const elementName = getJsxElementName(node);
        
        if (isComponentName(elementName) && 
            (functionComponents.has(elementName) || classComponents.has(elementName))) {
          // Record component usage
          const existingComponent = components.find(c => c.name === elementName);
          
          if (existingComponent) {
            existingComponent.usageCount = (existingComponent.usageCount || 0) + 1;
            
            // Extract props usage
            const props = extractJsxProps(node);
            existingComponent.propsUsage = existingComponent.propsUsage || {};
            
            props.forEach(prop => {
              existingComponent.propsUsage[prop] = (existingComponent.propsUsage[prop] || 0) + 1;
            });
          }
        }
      }
    });
    
    // Enhance with dependency information
    addDependencyInfo(components);
    
    return components;
  } catch (error) {
    console.error('Error extracting components from bundle:', error);
    return [];
  }
}

/**
 * Identify components from runtime using browser instrumentation
 * @param {string} appUrl - URL of the application to analyze
 * @returns {Array} - Components identified at runtime
 */
async function identifyComponentsAtRuntime(appUrl) {
  let browser;
  try {
    // Launch headless browser
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Add instrumentation to detect React components
    await page.evaluateOnNewDocument(() => {
      window.__REACT_COMPONENTS__ = new Set();
      window.__COMPONENT_RENDERS__ = new Map();
      
      // Save original createElement to detect component creation
      if (window.React && window.React.createElement) {
        const originalCreateElement = window.React.createElement;
        
        window.React.createElement = function(type, props, ...children) {
          // Detect component types (functions and classes)
          if (typeof type === 'function') {
            const name = type.displayName || type.name;
            if (name && name[0] === name[0].toUpperCase()) {
              window.__REACT_COMPONENTS__.add(name);
              
              // Track renders
              if (!window.__COMPONENT_RENDERS__.has(name)) {
                window.__COMPONENT_RENDERS__.set(name, 0);
              }
              window.__COMPONENT_RENDERS__.set(
                name, 
                window.__COMPONENT_RENDERS__.get(name) + 1
              );
            }
          }
          
          return originalCreateElement.apply(this, [type, props, ...children]);
        };
      }
    });
    
    // Navigate to app and wait for it to load
    await page.goto(appUrl, { waitUntil: 'networkidle0' });
    
    // Trigger some interactions to detect more components
    await simulateBasicInteractions(page);
    
    // Extract component information
    const runtimeComponents = await page.evaluate(() => {
      return {
        components: Array.from(window.__REACT_COMPONENTS__),
        renderCounts: Object.fromEntries(window.__COMPONENT_RENDERS__)
      };
    });
    
    // Format runtime component data
    const components = runtimeComponents.components.map(name => ({
      name,
      type: 'runtime-detected',
      renderCount: runtimeComponents.renderCounts[name] || 1
    }));
    
    return components;
  } catch (error) {
    console.error('Error identifying components at runtime:', error);
    return [];
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Simulate basic user interactions to trigger component renders
 * @param {Page} page - Puppeteer page object
 */
async function simulateBasicInteractions(page) {
  try {
    // Click on first few links
    const links = await page.$$('a');
    for (let i = 0; i < Math.min(links.length, 5); i++) {
      await links[i].click().catch(() => {});
      await page.waitForTimeout(500);
      await page.goBack().catch(() => {});
      await page.waitForTimeout(300);
    }
    
    // Scroll down page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(500);
    
    // Try clicking some buttons
    const buttons = await page.$$('button');
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      await buttons[i].click().catch(() => {});
      await page.waitForTimeout(300);
    }
    
    // Try interacting with form elements
    const inputs = await page.$$('input');
    for (let i = 0; i < Math.min(inputs.length, 3); i++) {
      await inputs[i].type('test input').catch(() => {});
      await page.waitForTimeout(200);
    }
  } catch (error) {
    console.warn('Error during interaction simulation:', error.message);
  }
}

/**
 * Analyze component dependencies and create a dependency graph
 * @param {Array} components - Component information
 * @param {string} sourceDir - Source directory for deeper analysis
 * @returns {Object} - Dependency graph
 */
function analyzeComponentDependencies(components, sourceDir) {
  const dependencyGraph = {};
  
  // Initialize graph
  components.forEach(component => {
    dependencyGraph[component.name] = {
      name: component.name,
      dependencies: [],
      dependents: [],
      weight: 0
    };
  });
  
  // Find imported components in source files
  if (sourceDir && fs.existsSync(sourceDir)) {
    const files = findReactFiles(sourceDir);
    
    files.forEach(file => {
      const code = fs.readFileSync(file, 'utf-8');
      const fileName = path.basename(file);
      
      // Simple regex-based import detection
      // This is a simplification; a full implementation would use AST parsing
      const importRegex = /import\s+(?:{([^}]+)}|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      
      const componentName = getComponentNameFromFileName(fileName);
      if (!componentName || !dependencyGraph[componentName]) return;
      
      while ((match = importRegex.exec(code)) !== null) {
        const namedImports = match[1];
        const defaultImport = match[2];
        
        if (namedImports) {
          const importNames = namedImports.split(',').map(name => name.trim());
          
          importNames.forEach(importName => {
            if (dependencyGraph[importName]) {
              // Add dependency relationship
              dependencyGraph[componentName].dependencies.push(importName);
              dependencyGraph[importName].dependents.push(componentName);
              
              // Increment dependency weight
              dependencyGraph[componentName].weight++;
            }
          });
        }
        
        if (defaultImport && dependencyGraph[defaultImport]) {
          // Add dependency relationship for default import
          dependencyGraph[componentName].dependencies.push(defaultImport);
          dependencyGraph[defaultImport].dependents.push(componentName);
          
          // Increment dependency weight
          dependencyGraph[componentName].weight++;
        }
      }
    });
  }
  
  return dependencyGraph;
}

/**
 * Find all React files in a directory
 * @param {string} dir - Directory to search
 * @returns {Array} - List of React file paths
 */
function findReactFiles(dir) {
  const files = [];
  
  const walk = (currentDir) => {
    const items = fs.readdirSync(currentDir);
    
    items.forEach(item => {
      const itemPath = path.join(currentDir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Skip node_modules and other common exclusions
        if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
          walk(itemPath);
        }
      } else if (stats.isFile()) {
        // Check if it's a React file
        if (/\.(jsx|tsx|js|ts)$/.test(item) && 
            !item.includes('.test.') && 
            !item.includes('.spec.')) {
          files.push(itemPath);
        }
      }
    });
  };
  
  walk(dir);
  return files;
}

/**
 * Estimate component size in bytes
 * @param {Object} node - AST node
 * @returns {number} - Estimated size
 */
function estimateComponentSize(node) {
  if (!node.loc) return 0;
  
  const startLine = node.loc.start.line;
  const endLine = node.loc.end.line;
  const lineCount = endLine - startLine + 1;
  
  // Rough estimate: average 40 bytes per line of code
  return lineCount * 40;
}

/**
 * Get component name from file name
 * @param {string} fileName - File name
 * @returns {string|null} - Component name or null
 */
function getComponentNameFromFileName(fileName) {
  // Remove extension
  const baseName = fileName.replace(/\.[^.]+$/, '');
  
  // Check if name is PascalCase
  if (baseName && baseName[0] === baseName[0].toUpperCase()) {
    return baseName;
  }
  
  // Try to extract component name from index file
  if (baseName === 'index') {
    // Get parent directory name
    const parentDir = path.basename(path.dirname(fileName));
    if (parentDir && parentDir[0] === parentDir[0].toUpperCase()) {
      return parentDir;
    }
  }
  
  return null;
}

/**
 * Extract props from function component
 * @param {Object} node - AST node
 * @returns {Array} - List of prop names
 */
function extractProps(node) {
  const props = [];
  
  // Check function parameters
  if (node.params && node.params.length > 0) {
    const firstParam = node.params[0];
    
    // Object pattern (destructuring)
    if (firstParam.type === 'ObjectPattern') {
      firstParam.properties.forEach(prop => {
        if (prop.key && prop.key.name) {
          props.push(prop.key.name);
        }
      });
    }
    // Simple identifier (props)
    else if (firstParam.type === 'Identifier') {
      props.push('props');
    }
  }
  
  return props;
}

/**
 * Extract props from class component
 * @param {Object} node - AST node
 * @returns {Array} - List of prop names
 */
function extractPropsFromClass(node) {
  const props = [];
  
  // Find prop types definition
  walk.simple(node, {
    ClassProperty(propNode) {
      if (propNode.key && propNode.key.name === 'propTypes') {
        // Extract prop names from object properties
        if (propNode.value && propNode.value.type === 'ObjectExpression') {
          propNode.value.properties.forEach(prop => {
            if (prop.key && prop.key.name) {
              props.push(prop.key.name);
            }
          });
        }
      }
    }
  });
  
  return props;
}

/**
 * Extract props from JSX element
 * @param {Object} node - AST node
 * @returns {Array} - List of prop names
 */
function extractJsxProps(node) {
  const props = [];
  
  if (node.openingElement && node.openingElement.attributes) {
    node.openingElement.attributes.forEach(attr => {
      if (attr.type === 'JSXAttribute' && attr.name) {
        props.push(attr.name.name);
      }
    });
  }
  
  return props;
}

/**
 * Add dependency information to component list
 * @param {Array} components - Component list
 */
function addDependencyInfo(components) {
  // Create a map of component names to indices
  const componentMap = new Map();
  components.forEach((comp, index) => {
    componentMap.set(comp.name, index);
  });
  
  // Initialize dependency arrays
  components.forEach(comp => {
    comp.dependencies = [];
    comp.dependents = [];
  });
  
  // Process imports to find dependencies
  components.forEach(comp => {
    if (comp.type === 'imported' && comp.source) {
      // Try to find a matching component from the source
      const sourceParts = comp.source.split('/');
      const potentialComponentName = sourceParts[sourceParts.length - 1];
      
      // Check if we have a component with this name
      if (componentMap.has(potentialComponentName)) {
        const dependencyIndex = componentMap.get(potentialComponentName);
        
        // Add dependency relationship
        comp.dependencies.push(potentialComponentName);
        components[dependencyIndex].dependents.push(comp.name);
      }
    }
  });
}

/**
 * Find parent variable declaration for a node
 * @param {Object} node - AST node
 * @returns {Object|null} - Parent variable declaration or null
 */
function findParentVariableDeclaration(node) {
  // Simple check for direct parent
  // In a full implementation, this would walk up the AST
  if (node.parent && node.parent.type === 'VariableDeclarator') {
    return node.parent;
  }
  return null;
}

/**
 * Check if a function node has a JSX return
 * @param {Object} node - AST node
 * @returns {boolean} - Whether the function returns JSX
 */
function findJsxReturn(node) {
  let hasJsx = false;
  
  // Helper function to check if a node is a JSX element
  function isJsxNode(node) {
    return node && (
      node.type === 'JSXElement' || 
      node.type === 'JSXFragment' ||
      node.type === 'JSXIdentifier'
    );
  }
  
  // Walk the function body to find JSX
  if (node.body) {
    walk.simple(node.body, {
      ReturnStatement(returnNode) {
        if (isJsxNode(returnNode.argument)) {
          hasJsx = true;
        }
      },
      ArrowFunctionExpression(arrowNode) {
        if (isJsxNode(arrowNode.body)) {
          hasJsx = true;
        }
      },
      JSXElement() {
        hasJsx = true;
      }
    });
  }
  
  return hasJsx;
}

/**
 * Get JSX element name from node
 * @param {Object} node - AST node
 * @returns {string} - Element name
 */
function getJsxElementName(node) {
  if (node.openingElement && node.openingElement.name) {
    const name = node.openingElement.name;
    
    // JSXIdentifier
    if (name.type === 'JSXIdentifier') {
      return name.name;
    }
    
    // JSXMemberExpression (e.g., Namespace.Component)
    if (name.type === 'JSXMemberExpression') {
      return `${name.object.name}.${name.property.name}`;
    }
  }
  
  return '';
}

/**
 * Check if a name is a component name (PascalCase)
 * @param {string} name - Name to check
 * @returns {boolean} - Whether it's a component name
 */
function isComponentName(name) {
  return name && name[0] === name[0].toUpperCase();
}

/**
 * Format location information for output
 * @param {Object} loc - Location object
 * @returns {Object} - Formatted location
 */
function formatLocation(loc) {
  if (!loc) return null;
  
  return {
    start: {
      line: loc.start.line,
      column: loc.start.column
    },
    end: {
      line: loc.end.line,
      column: loc.end.column
    }
  };
}

module.exports = {
  extractComponentsFromBundle,
  identifyComponentsAtRuntime,
  analyzeComponentDependencies
};