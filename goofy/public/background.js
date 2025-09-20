// Enhanced Background script for Goofy AI Assistant
// Handles extension lifecycle and improved communication

chrome.runtime.onInstalled.addListener(() => {
  console.log('🤖 Goofy AI Assistant installed successfully!');
  // Set default settings
  chrome.storage.local.set({
    goofyEnabled: true,
    lastUsed: Date.now()
  });
});

// Enhanced message handling with better error handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === 'executeAction') {
    executeAction(request.actionData, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'getTabInfo') {
    getTabInfo(sendResponse);
    return true;
  }
  
  if (request.action === 'checkPermissions') {
    checkPermissions(sendResponse);
    return true;
  }
  
  // Handle unknown actions
  sendResponse({ success: false, error: 'Unknown action' });
});

// Enhanced action execution with better error handling
async function executeAction(actionData, sendResponse) {
  try {
    console.log('Executing action:', actionData);
    const { type, url, target, query, direction } = actionData;
    
    // Validate action data
    if (!type) {
      throw new Error('Action type is required');
    }
    
    switch (type) {
      case 'openTab':
        await handleOpenTab(url || target);
        break;
      case 'search':
        await handleSearch(target, query);
        break;
      case 'scroll':
        await handleScroll(direction || target);
        break;
      case 'copy':
        await handleCopy();
        break;
      case 'paste':
        await handlePaste();
        break;
      case 'closeTab':
        await handleCloseTab();
        break;
      case 'goBack':
        await handleGoBack();
        break;
      case 'goForward':
        await handleGoForward();
        break;
      case 'refresh':
        await handleRefresh();
        break;
      case 'newTab':
        await handleNewTab();
        break;
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
    
    console.log(`Action '${type}' executed successfully`);
    sendResponse({ success: true, message: `${type} completed successfully` });
  } catch (error) {
    console.error('Action execution failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Get current tab information
async function getTabInfo(sendResponse) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      sendResponse({ 
        success: true, 
        tab: {
          id: tabs[0].id,
          url: tabs[0].url,
          title: tabs[0].title
        }
      });
    } else {
      throw new Error('No active tab found');
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Check extension permissions
async function checkPermissions(sendResponse) {
  try {
    const hasPermissions = await chrome.permissions.contains({
      permissions: ['activeTab', 'scripting', 'tabs']
    });
    sendResponse({ success: true, hasPermissions });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
}

// Enhanced tab and navigation handlers
async function handleOpenTab(target) {
  try {
    let url;
    
    if (!target) {
      throw new Error('Target URL or site name is required');
    }
    
    if (target.startsWith('http://') || target.startsWith('https://')) {
      url = target; // Direct URL
    } else {
      const lowerTarget = target.toLowerCase().trim();
      
      // Enhanced site mapping
      const siteMap = {
        'youtube': 'https://www.youtube.com',
        'google': 'https://www.google.com',
        'github': 'https://www.github.com',
        'twitter': 'https://www.twitter.com',
        'facebook': 'https://www.facebook.com',
        'reddit': 'https://www.reddit.com',
        'stackoverflow': 'https://stackoverflow.com',
        'netflix': 'https://www.netflix.com',
        'amazon': 'https://www.amazon.com',
        'linkedin': 'https://www.linkedin.com',
        'instagram': 'https://www.instagram.com',
        'discord': 'https://discord.com',
        'spotify': 'https://open.spotify.com',
        'twitch': 'https://www.twitch.tv'
      };
      
      url = siteMap[lowerTarget] || `https://www.${lowerTarget}.com`;
    }
    
    console.log(`Opening tab with URL: ${url}`);
    await chrome.tabs.create({ url, active: true });
  } catch (error) {
    console.error('Error opening tab:', error);
    throw error;
  }
}

async function handleNewTab() {
  try {
    await chrome.tabs.create({ url: 'chrome://newtab/', active: true });
  } catch (error) {
    console.error('Error creating new tab:', error);
    throw error;
  }
}

// Enhanced navigation handlers
async function handleCloseTab() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      await chrome.tabs.remove(tabs[0].id);
      console.log('Tab closed successfully');
    } else {
      throw new Error('No active tab to close');
    }
  } catch (error) {
    console.error('Error closing tab:', error);
    throw error;
  }
}

async function handleGoBack() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            throw new Error('No previous page in history');
          }
        }
      });
      console.log('Navigated back successfully');
    } else {
      throw new Error('No active tab found');
    }
  } catch (error) {
    console.error('Error going back:', error);
    throw error;
  }
}

async function handleGoForward() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          window.history.forward();
        }
      });
      console.log('Navigated forward successfully');
    } else {
      throw new Error('No active tab found');
    }
  } catch (error) {
    console.error('Error going forward:', error);
    throw error;
  }
}

async function handleRefresh() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      await chrome.tabs.reload(tabs[0].id);
      console.log('Page refreshed successfully');
    } else {
      throw new Error('No active tab found');
    }
  } catch (error) {
    console.error('Error refreshing page:', error);
    throw error;
  }
}

// Enhanced search functionality
async function handleSearch(target, query) {
  try {
    if (!query) {
      throw new Error('Search query is required');
    }
    
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    if (!activeTab) {
      throw new Error('No active tab found');
    }
    
    const lowerTarget = (target || '').toLowerCase();
    let searchUrl;
    
    // Enhanced search URLs
    if (lowerTarget.includes('youtube')) {
      searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    } else if (lowerTarget.includes('google') || !target) {
      searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    } else if (lowerTarget.includes('github')) {
      searchUrl = `https://github.com/search?q=${encodeURIComponent(query)}`;
    } else if (lowerTarget.includes('stackoverflow')) {
      searchUrl = `https://stackoverflow.com/search?q=${encodeURIComponent(query)}`;
    } else if (lowerTarget.includes('reddit')) {
      searchUrl = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`;
    } else {
      // Default to Google search
      searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    
    console.log(`Searching for '${query}' on ${target || 'Google'}`);
    await chrome.tabs.update(activeTab.id, { url: searchUrl });
  } catch (error) {
    console.error('Error performing search:', error);
    throw error;
  }
}

// Enhanced scroll and navigation handlers
async function handleScroll(direction) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    if (!activeTab) {
      throw new Error('No active tab found');
    }
    
    const scrollDirection = direction?.toLowerCase() || 'down';
    
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: (scrollDir) => {
        const scrollAmount = scrollDir === 'up' ? -window.innerHeight : window.innerHeight;
        window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
      },
      args: [scrollDirection]
    });
    
    console.log(`Scrolled ${scrollDirection}`);
  } catch (error) {
    console.error('Error scrolling:', error);
    throw error;
  }
}

async function handleCopy() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    if (!activeTab) {
      throw new Error('No active tab found');
    }
    
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: () => {
        // Try to copy selected text or current URL
        const selection = window.getSelection().toString();
        if (selection) {
          navigator.clipboard.writeText(selection);
          return `Copied selected text: ${selection.substring(0, 50)}...`;
        } else {
          navigator.clipboard.writeText(window.location.href);
          return `Copied page URL: ${window.location.href}`;
        }
      }
    });
    
    console.log('Copy operation completed');
  } catch (error) {
    console.error('Error copying:', error);
    throw error;
  }
}

async function handlePaste() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    if (!activeTab) {
      throw new Error('No active tab found');
    }
    
    await chrome.scripting.executeScript({
      target: { tabId: activeTab.id },
      func: async () => {
        try {
          const text = await navigator.clipboard.readText();
          const activeElement = document.activeElement;
          
          if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            activeElement.value += text;
            activeElement.dispatchEvent(new Event('input', { bubbles: true }));
          } else {
            // Try to find a text input on the page
            const textInput = document.querySelector('input[type="text"], input[type="search"], textarea');
            if (textInput) {
              textInput.focus();
              textInput.value += text;
              textInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }
        } catch (error) {
          console.error('Paste failed:', error);
        }
      }
    });
    
    console.log('Paste operation completed');
  } catch (error) {
    console.error('Error pasting:', error);
    throw error;
  }
}