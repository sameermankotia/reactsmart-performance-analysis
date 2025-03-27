/**
 * Privacy Utilities
 * 
 * Utilities for handling user data in a privacy-preserving manner,
 * including anonymization, consent management, and compliance with
 * privacy regulations.
 */

// Privacy compliance modes
const COMPLIANCE_MODES = {
    GDPR: 'gdpr',   // European Union General Data Protection Regulation
    CCPA: 'ccpa',   // California Consumer Privacy Act
    LGPD: 'lgpd',   // Brazil's Lei Geral de Proteção de Dados
    PIPEDA: 'pipeda', // Canada's Personal Information Protection and Electronic Documents Act
    MINIMAL: 'minimal' // Most restrictive mode with minimal data collection
  };
  
  // Default configuration
  const DEFAULT_CONFIG = {
    anonymizeIp: true,
    minimizeData: true,
    hashUserIds: true,
    complianceMode: COMPLIANCE_MODES.GDPR,
    retentionPeriodDays: 30,
    storageQuotaKB: 100
  };
  
  // Current privacy configuration
  let privacyConfig = { ...DEFAULT_CONFIG };
  
  /**
   * Configure privacy settings
   * @param {Object} config - Privacy configuration options
   */
  export const configurePrivacy = (config = {}) => {
    privacyConfig = {
      ...privacyConfig,
      ...config
    };
  };
  
  /**
   * Get current privacy configuration
   * @returns {Object} Current privacy configuration
   */
  export const getPrivacyConfig = () => {
    return { ...privacyConfig };
  };
  
  /**
   * Anonymize user interaction data based on privacy settings
   * @param {Object} interactionData - Raw interaction data
   * @returns {Object} Anonymized interaction data
   */
  export const anonymizeInteractionData = (interactionData) => {
    if (!interactionData) return {};
    
    // Create a copy of the data to avoid modifying the original
    const anonymized = { ...interactionData };
    
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
  export const anonymizeIp = (ip) => {
    if (!ip) return null;
    
    try {
      // IPv4 address
      if (ip.includes('.')) {
        // Keep only first 3 octets for IPv4, replace last octet with 0
        const parts = ip.split('.');
        if (parts.length === 4) {
          return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
        }
      }
      // IPv6 address
      else if (ip.includes(':')) {
        // Keep only first 4 segments for IPv6, replace rest with zeroes
        const parts = ip.split(':');
        return parts.slice(0, 4).join(':') + '::0';
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
  export const hashIdentifier = (identifier) => {
    if (!identifier) return null;
    
    try {
      // Simple hash function (for a real implementation, use a cryptographic hash)
      // This is a basic implementation of a non-reversible hash function
      // In production, you would use a more secure method like SHA-256
      
      // Convert string to a numeric hash code
      let hash = 0;
      for (let i = 0; i < identifier.length; i++) {
        const char = identifier.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
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
  const applyDataMinimization = (data) => {
    // Fields to remove for all compliance modes
    const sensitiveFields = [
      'password', 'ssn', 'socialSecurityNumber', 'creditCard', 'creditCardNumber',
      'cvv', 'pin', 'passportNumber', 'driverLicense', 'healthData'
    ];
    
    // Remove sensitive fields
    sensitiveFields.forEach(field => {
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
        applyGdprMinimization(data); // Default to GDPR as it's generally strict
    }
  };
  
  /**
   * Apply GDPR-specific data minimization
   * @param {Object} data - Data to minimize
   */
  const applyGdprMinimization = (data) => {
    // Fields to remove or anonymize under GDPR
    const gdprSensitiveFields = [
      'fullName', 'firstName', 'lastName', 'address', 'postCode', 'zipCode',
      'phoneNumber', 'emailAddress', 'dateOfBirth', 'birthDate', 'age',
      'gender', 'race', 'ethnicity', 'religion', 'politicalOpinion',
      'preciseLocation', 'deviceId', 'advertisingId'
    ];
    
    // Remove GDPR-sensitive fields
    gdprSensitiveFields.forEach(field => {
      if (field in data) {
        delete data[field];
      }
    });
    
    // Generalize location data if present
    if (data.location && typeof data.location === 'object') {
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
  const applyCcpaMinimization = (data) => {
    // Similar to GDPR but with CCPA-specific requirements
    // For this implementation, we'll use the same approach as GDPR
    // In a production system, you would implement CCPA-specific rules
    applyGdprMinimization(data);
  };
  
  /**
   * Apply minimal data collection policy
   * @param {Object} data - Data to minimize
   */
  const applyMinimalDataCollection = (data) => {
    // Keep only essential data for functionality
    const allowedFields = [
      'timestamp', 'componentId', 'eventType', 'sessionId'
    ];
    
    // Remove all fields except allowed ones
    Object.keys(data).forEach(key => {
      if (!allowedFields.includes(key) && !key.startsWith('_')) {
        delete data[key];
      }
    });
  };
  
  /**
   * Check if user has given consent for data collection
   * @returns {boolean} Whether user has given consent
   */
  export const hasUserConsent = () => {
    try {
      // Check localStorage for consent status
      const consentData = localStorage.getItem('reactsmart_consent');
      if (consentData) {
        const { consented, expiry } = JSON.parse(consentData);
        
        // Check if consent is still valid (not expired)
        if (consented && expiry && expiry > Date.now()) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking user consent:', error);
      return false;
    }
  };
  
  /**
   * Set user consent status
   * @param {boolean} consented - Whether user has consented
   * @param {number} validityDays - Number of days consent is valid for
   */
  export const setUserConsent = (consented, validityDays = 365) => {
    try {
      // Calculate expiry date
      const expiry = Date.now() + (validityDays * 24 * 60 * 60 * 1000);
      
      // Store consent status in localStorage
      localStorage.setItem('reactsmart_consent', JSON.stringify({
        consented,
        timestamp: Date.now(),
        expiry
      }));
      
      return true;
    } catch (error) {
      console.error('Error setting user consent:', error);
      return false;
    }
  };
  
  /**
   * Generate a privacy policy for the current configuration
   * @returns {Object} Privacy policy information
   */
  export const generatePrivacyPolicy = () => {
    return {
      dataCollected: getCollectedDataTypes(),
      retentionPeriod: privacyConfig.retentionPeriodDays,
      complianceMode: privacyConfig.complianceMode,
      dataMinimization: privacyConfig.minimizeData,
      anonymization: {
        ipAddresses: privacyConfig.anonymizeIp,
        userIds: privacyConfig.hashUserIds
      },
      dataSharing: {
        thirdParties: false,
        advertisers: false,
        analytics: false
      },
      userRights: getUserRightsForComplianceMode(),
      lastUpdated: new Date().toISOString()
    };
  };
  
  /**
   * Get types of data collected based on current configuration
   * @returns {Array} Types of data collected
   */
  const getCollectedDataTypes = () => {
    const baseTypes = ['Component Usage', 'Interaction Timing'];
    
    if (privacyConfig.complianceMode === COMPLIANCE_MODES.MINIMAL) {
      return baseTypes;
    }
    
    const additionalTypes = ['Session Information', 'Network Conditions'];
    
    return [...baseTypes, ...additionalTypes];
  };
  
  /**
   * Get user rights information based on compliance mode
   * @returns {Object} User rights information
   */
  const getUserRightsForComplianceMode = () => {
    const baseRights = {
      accessData: true,
      deleteData: true
    };
    
    switch (privacyConfig.complianceMode) {
      case COMPLIANCE_MODES.GDPR:
        return {
          ...baseRights,
          dataPortability: true,
          restrictProcessing: true,
          objectToProcessing: true,
          automatedDecisionMaking: true
        };
      
      case COMPLIANCE_MODES.CCPA:
        return {
          ...baseRights,
          optOutOfSale: true,
          nonDiscrimination: true
        };
      
      case COMPLIANCE_MODES.MINIMAL:
        return baseRights;
      
      default:
        return baseRights;
    }
  };
  
  /**
   * Create a data subject access report
   * @param {string} sessionId - Optional session ID to filter by
   * @returns {Object} Data access report
   */
  export const createDataAccessReport = (sessionId) => {
    try {
      // This would typically gather all data associated with the user
      // For this implementation, we'll return a placeholder structure
      
      const storedData = {};
      
      // Get stored data from localStorage
      const storageKeys = [
        'reactsmart_interactions',
        'reactsmart_component_usage',
        'reactsmart_prediction_model',
        'reactsmart_user_prefs'
      ];
      
      storageKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            storedData[key] = JSON.parse(data);
          }
        } catch (e) {
          storedData[key] = { error: 'Could not parse data' };
        }
      });
      
      // Filter by session ID if provided
      if (sessionId && storedData.reactsmart_interactions) {
        storedData.reactsmart_interactions = storedData.reactsmart_interactions.filter(
          interaction => interaction.sessionId === sessionId
        );
      }
      
      return {
        generated: new Date().toISOString(),
        userData: storedData,
        privacySettings: getPrivacyConfig()
      };
    } catch (error) {
      console.error('Error creating data access report:', error);
      return {
        error: 'Could not generate data access report',
        errorDetails: error.message
      };
    }
  };
  
  /**
   * Delete all user data
   * @param {string} sessionId - Optional session ID to delete data for
   * @returns {boolean} Whether data was successfully deleted
   */
  export const deleteUserData = (sessionId) => {
    try {
      // If session ID provided, only delete data for that session
      if (sessionId) {
        // Delete interaction data for session
        const interactionsKey = 'reactsmart_interactions';
        const interactionsJson = localStorage.getItem(interactionsKey);
        
        if (interactionsJson) {
          const interactions = JSON.parse(interactionsJson);
          const filteredInteractions = interactions.filter(
            interaction => interaction.sessionId !== sessionId
          );
          
          localStorage.setItem(interactionsKey, JSON.stringify(filteredInteractions));
        }
        
        // Other session-specific data could be handled similarly
      } else {
        // Delete all ReactSmart data
        const storageKeys = [
          'reactsmart_interactions',
          'reactsmart_component_usage',
          'reactsmart_prediction_model',
          'reactsmart_user_prefs',
          'reactsmart_session_id',
          'reactsmart_last_cleanup'
        ];
        
        storageKeys.forEach(key => {
          localStorage.removeItem(key);
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user data:', error);
      return false;
    }
  };
  
  /**
   * Check if current data collection complies with specified regulations
   * @returns {Object} Compliance status
   */
  export const checkCompliance = () => {
    // This would typically perform a more thorough check
    // For this implementation, we'll return a simple status
    
    const compliance = {
      compliant: true,
      issues: []
    };
    
    // Check user consent
    if (!hasUserConsent()) {
      compliance.compliant = false;
      compliance.issues.push({
        severity: 'high',
        issue: 'No valid user consent found',
        recommendation: 'Implement consent management before collecting data'
      });
    }
    
    // Check data minimization
    if (!privacyConfig.minimizeData) {
      compliance.issues.push({
        severity: 'medium',
        issue: 'Data minimization is not enabled',
        recommendation: 'Enable data minimization to comply with regulations'
      });
    }
    
    // Check IP anonymization
    if (!privacyConfig.anonymizeIp) {
      compliance.issues.push({
        severity: 'medium',
        issue: 'IP anonymization is not enabled',
        recommendation: 'Enable IP anonymization to protect user privacy'
      });
    }
    
    return compliance;
  };
  
  export default {
    anonymizeInteractionData,
    anonymizeIp,
    hashIdentifier,
    configurePrivacy,
    getPrivacyConfig,
    hasUserConsent,
    setUserConsent,
    generatePrivacyPolicy,
    createDataAccessReport,
    deleteUserData,
    checkCompliance,
    COMPLIANCE_MODES
  };