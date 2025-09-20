// Enhanced Browser API module for Goofy AI Assistant
// Handles all Chrome Extension API calls with improved error handling and functionality

export const browserAPI = {
  // Open a new tab with enhanced URL handling
  openTab: async (target) => {
    try {
      const result = await chrome.runtime.sendMessage({
        action: 'executeAction',
        actionData: { type: 'openTab', target }
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to open tab');
      }
      
      return result;
    } catch (error) {
      console.error('Error opening tab:', error);
      throw new Error(`Failed to open ${target}: ${error.message}`);
    }
  },

  // Create a new blank tab
  newTab: async () => {
    try {
      const result = await chrome.runtime.sendMessage({
        action: 'executeAction',
        actionData: { type: 'newTab' }
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create new tab');
      }
      
      return result;
    } catch (error) {
      console.error('Error creating new tab:', error);
      throw new Error(`Failed to create new tab: ${error.message}`);
    }
  },

  // Close the current tab with confirmation
  closeTab: async () => {
    try {
      const result = await chrome.runtime.sendMessage({
        action: 'executeAction',
        actionData: { type: 'closeTab' }
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to close tab');
      }
      
      return result;
    } catch (error) {
      console.error('Error closing tab:', error);
      throw new Error(`Failed to close tab: ${error.message}`);
    }
  },

  // Enhanced search with multiple platform support
  search: async (target, query) => {
    try {
      if (!query || query.trim() === '') {
        throw new Error('Search query cannot be empty');
      }
      
      const result = await chrome.runtime.sendMessage({
        action: 'executeAction',
        actionData: { type: 'search', target: target || 'google', query: query.trim() }
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Search failed');
      }
      
      return result;
    } catch (error) {
      console.error('Error performing search:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  },

  // Enhanced scroll with direction validation
  scroll: async (direction) => {
    try {
      const validDirections = ['up', 'down', 'top', 'bottom'];
      const scrollDir = direction?.toLowerCase() || 'down';
      
      if (!validDirections.includes(scrollDir)) {
        throw new Error(`Invalid scroll direction. Use: ${validDirections.join(', ')}`);
      }
      
      const result = await chrome.runtime.sendMessage({
        action: 'executeAction',
        actionData: { type: 'scroll', direction: scrollDir }
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Scroll failed');
      }
      
      return result;
    } catch (error) {
      console.error('Error scrolling:', error);
      throw new Error(`Scroll failed: ${error.message}`);
    }
  },

  // Enhanced copy with better feedback
  copy: async () => {
    try {
      const result = await chrome.runtime.sendMessage({
        action: 'executeAction',
        actionData: { type: 'copy' }
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Copy failed');
      }
      
      return result;
    } catch (error) {
      console.error('Error copying:', error);
      throw new Error(`Copy failed: ${error.message}`);
    }
  },

  // Enhanced paste with better targeting
  paste: async () => {
    try {
      const result = await chrome.runtime.sendMessage({
        action: 'executeAction',
        actionData: { type: 'paste' }
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Paste failed');
      }
      
      return result;
    } catch (error) {
      console.error('Error pasting:', error);
      throw new Error(`Paste failed: ${error.message}`);
    }
  },

  // Navigate back with history validation
  goBack: async () => {
    try {
      const result = await chrome.runtime.sendMessage({
        action: 'executeAction',
        actionData: { type: 'goBack' }
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Cannot go back');
      }
      
      return result;
    } catch (error) {
      console.error('Error going back:', error);
      throw new Error(`Navigation back failed: ${error.message}`);
    }
  },

  // Navigate forward
  goForward: async () => {
    try {
      const result = await chrome.runtime.sendMessage({
        action: 'executeAction',
        actionData: { type: 'goForward' }
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Cannot go forward');
      }
      
      return result;
    } catch (error) {
      console.error('Error going forward:', error);
      throw new Error(`Navigation forward failed: ${error.message}`);
    }
  },

  // Refresh the current page
  refresh: async () => {
    try {
      const result = await chrome.runtime.sendMessage({
        action: 'executeAction',
        actionData: { type: 'refresh' }
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Refresh failed');
      }
      
      return result;
    } catch (error) {
      console.error('Error refreshing:', error);
      throw new Error(`Page refresh failed: ${error.message}`);
    }
  },

  // Get current tab information
  getTabInfo: async () => {
    try {
      const result = await chrome.runtime.sendMessage({
        action: 'getTabInfo'
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get tab info');
      }
      
      return result.tab;
    } catch (error) {
      console.error('Error getting tab info:', error);
      throw new Error(`Failed to get tab info: ${error.message}`);
    }
  },

  // Check extension permissions
  checkPermissions: async () => {
    try {
      const result = await chrome.runtime.sendMessage({
        action: 'checkPermissions'
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Permission check failed');
      }
      
      return result.hasPermissions;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }
};