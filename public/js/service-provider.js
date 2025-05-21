/**
 * Service Provider Architecture
 * 
 * A centralized registry for service implementations that allows:
 * 1. Registration of both mock and real implementations
 * 2. Dynamic switching between implementations
 * 3. Service discovery and dependency injection
 * 4. Container-aware service routing for Docker environments
 */

// Implementation types
const ImplementationType = {
  MOCK: 'mock',
  REAL: 'real'
};

// Service provider class
class ServiceProvider {
  constructor() {
    // Singleton pattern
    if (ServiceProvider.instance) {
      return ServiceProvider.instance;
    }
    
    // Initialize the service registry
    this.serviceRegistry = new Map();
    this.activeImplementations = new Map();
    
    // Track container info for Docker environments
    this.containerInfo = {
      id: null,
      username: null,
      isDockerized: false
    };
    
    // Track service dependencies
    this.serviceDependencies = new Map();
    
    ServiceProvider.instance = this;
  }
  
  /**
   * Register a service implementation
   * @param {string} serviceName - Name of the service
   * @param {string} implementationType - Type of implementation (mock/real)
   * @param {object} implementation - The implementation object
   */
  registerImplementation(serviceName, implementationType, implementation) {
    if (!this.serviceRegistry.has(serviceName)) {
      this.serviceRegistry.set(serviceName, new Map());
    }
    
    const serviceMap = this.serviceRegistry.get(serviceName);
    serviceMap.set(implementationType, implementation);
    
    console.debug(`[ServiceProvider] Registered ${implementationType} implementation for ${serviceName}`);
    
    // If this is the first implementation, make it active
    if (!this.activeImplementations.has(serviceName)) {
      this.setImplementationType(serviceName, implementationType);
    }
  }
  
  /**
   * Set the active implementation type for a service
   * @param {string} serviceName - Name of the service
   * @param {string} implementationType - Type of implementation to use
   */
  setImplementationType(serviceName, implementationType) {
    if (!this.serviceRegistry.has(serviceName)) {
      console.warn(`[ServiceProvider] No implementations registered for ${serviceName}`);
      return false;
    }
    
    const serviceMap = this.serviceRegistry.get(serviceName);
    if (!serviceMap.has(implementationType)) {
      console.warn(`[ServiceProvider] No ${implementationType} implementation found for ${serviceName}`);
      return false;
    }
    
    this.activeImplementations.set(serviceName, implementationType);
    console.debug(`[ServiceProvider] Set ${serviceName} to use ${implementationType} implementation`);
    
    // Notify subscribers if we implement an event system later
    this.notifyImplementationChanged(serviceName, implementationType);
    
    return true;
  }
  
  /**
   * Get a service implementation
   * @param {string} serviceName - Name of the service to get
   * @returns {object} The active implementation for the service
   */
  getService(serviceName) {
    if (!this.serviceRegistry.has(serviceName)) {
      console.error(`[ServiceProvider] No implementations registered for ${serviceName}`);
      return null;
    }
    
    const activeType = this.activeImplementations.get(serviceName) || ImplementationType.MOCK;
    const serviceMap = this.serviceRegistry.get(serviceName);
    const implementation = serviceMap.get(activeType);
    
    if (!implementation) {
      console.error(`[ServiceProvider] No ${activeType} implementation found for ${serviceName}`);
      return null;
    }
    
    return implementation;
  }
  
  /**
   * Register a dependency between services
   * @param {string} serviceName - The service that has dependencies
   * @param {Array<string>} dependencies - List of services it depends on
   */
  registerDependencies(serviceName, dependencies) {
    this.serviceDependencies.set(serviceName, dependencies);
  }
  
  /**
   * Get the registered services
   * @returns {Array<string>} List of registered service names
   */
  getRegisteredServices() {
    return Array.from(this.serviceRegistry.keys());
  }
  
  /**
   * Get the current implementation type for a service
   * @param {string} serviceName - Name of the service
   * @returns {string} The implementation type (mock/real)
   */
  getImplementationType(serviceName) {
    return this.activeImplementations.get(serviceName) || ImplementationType.MOCK;
  }
  
  /**
   * Set container information for Docker environments
   * @param {object} info - Container information
   */
  setContainerInfo(info) {
    this.containerInfo = {
      ...this.containerInfo,
      ...info
    };
    
    console.debug(`[ServiceProvider] Container info updated: ${JSON.stringify(this.containerInfo)}`);
  }
  
  /**
   * Check if running in Docker
   * @returns {boolean} True if running in Docker
   */
  isDockerized() {
    return this.containerInfo.isDockerized;
  }
  
  /**
   * Get container info
   * @returns {object} Container information
   */
  getContainerInfo() {
    return { ...this.containerInfo };
  }
  
  /**
   * Notify subscribers when implementation changes
   * @private
   * @param {string} serviceName - The service that changed
   * @param {string} implementationType - The new implementation type
   */
  notifyImplementationChanged(serviceName, implementationType) {
    // For now just log, later can implement a pub/sub system
    console.debug(`[ServiceProvider] Implementation changed: ${serviceName} => ${implementationType}`);
    
    // Custom event for subscribers
    const event = new CustomEvent('serviceImplementationChanged', {
      detail: {
        serviceName,
        implementationType
      }
    });
    
    document.dispatchEvent(event);
  }
}

// Create singleton instance
const instance = new ServiceProvider();

// Export as a global object for browser environments
window.ServiceProvider = {
  // Constants
  ImplementationType,
  
  // Methods
  registerImplementation: (serviceName, implementationType, implementation) => {
    return instance.registerImplementation(serviceName, implementationType, implementation);
  },
  
  setImplementationType: (serviceName, implementationType) => {
    return instance.setImplementationType(serviceName, implementationType);
  },
  
  getService: (serviceName) => {
    return instance.getService(serviceName);
  },
  
  getRegisteredServices: () => {
    return instance.getRegisteredServices();
  },
  
  getImplementationType: (serviceName) => {
    return instance.getImplementationType(serviceName);
  },
  
  setContainerInfo: (info) => {
    return instance.setContainerInfo(info);
  },
  
  isDockerized: () => {
    return instance.isDockerized();
  },
  
  getContainerInfo: () => {
    return instance.getContainerInfo();
  },
  
  // Additional Docker-specific methods
  discoverContainers: async () => {
    if (!instance.isDockerized()) {
      console.warn('[ServiceProvider] Not running in Docker, container discovery unavailable');
      return [];
    }
    
    try {
      const response = await fetch('/api/containers');
      const containers = await response.json();
      return containers;
    } catch (error) {
      console.error('[ServiceProvider] Error discovering containers:', error);
      return [];
    }
  },
  
  connectToContainer: async (containerId) => {
    if (!instance.isDockerized()) {
      console.warn('[ServiceProvider] Not running in Docker, container connection unavailable');
      return false;
    }
    
    try {
      const response = await fetch(`/api/containers/${containerId}/connect`, {
        method: 'POST'
      });
      
      return response.ok;
    } catch (error) {
      console.error(`[ServiceProvider] Error connecting to container ${containerId}:`, error);
      return false;
    }
  }
};

// Auto-detect Docker environment
(async function detectDockerEnvironment() {
  try {
    // Various ways to detect if running in Docker
    const isDocker = 
      // Check for Docker-specific env vars
      (typeof process !== 'undefined' && process.env.DOCKER_CONTAINER) ||
      // Check for .dockerenv file
      (await fetch('/.dockerenv').then(res => res.ok).catch(() => false)) ||
      // Check container API
      (await fetch('/api/container/info').then(res => res.ok).catch(() => false));
    
    if (isDocker) {
      try {
        const containerInfo = await fetch('/api/container/info').then(res => res.json());
        window.ServiceProvider.setContainerInfo({
          ...containerInfo,
          isDockerized: true
        });
      } catch (error) {
        console.warn('[ServiceProvider] Running in Docker but failed to get container info');
        window.ServiceProvider.setContainerInfo({
          isDockerized: true
        });
      }
    }
  } catch (error) {
    console.debug('[ServiceProvider] Not running in Docker environment');
  }
})();
