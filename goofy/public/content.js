// Enhanced Content script for Goofy AI Assistant
// Runs on all web pages with improved functionality

console.log('🤖 Goofy AI content script loaded and enhanced!');

// Enhanced message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  try {
    if (request.action === 'performPageAction') {
      const result = performPageAction(request.actionType, request.data);
      sendResponse({ success: true, result });
    } else if (request.action === 'getPageInfo') {
      const pageInfo = getPageInfo();
      sendResponse({ success: true, pageInfo });
    } else if (request.action === 'highlightElement') {
      highlightElement(request.selector);
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Content script error:', error);
    sendResponse({ success: false, error: error.message });
  }
  
  return true; // Keep message channel open
});

// Enhanced page action handler
function performPageAction(actionType, data) {
  switch (actionType) {
    case 'scroll':
      return handlePageScroll(data.direction);
    case 'click':
      return handlePageClick(data.selector);
    case 'fillForm':
      return handleFillForm(data.selector, data.value);
    case 'extractText':
      return extractPageText(data.selector);
    case 'findElement':
      return findElementByText(data.text);
    default:
      throw new Error(`Unknown page action: ${actionType}`);
  }
}

// Get comprehensive page information
function getPageInfo() {
  return {
    title: document.title,
    url: window.location.href,
    domain: window.location.hostname,
    hasSearchBox: !!document.querySelector('input[type="search"], input[name*="search"], input[placeholder*="search"]'),
    hasTextInputs: document.querySelectorAll('input[type="text"], textarea').length > 0,
    scrollPosition: window.scrollY,
    pageHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight
  };
}

// Enhanced scroll with smooth animation
function handlePageScroll(direction) {
  const scrollAmount = direction === 'up' ? -window.innerHeight * 0.8 : window.innerHeight * 0.8;
  const startPosition = window.scrollY;
  const targetPosition = Math.max(0, Math.min(startPosition + scrollAmount, document.documentElement.scrollHeight - window.innerHeight));
  
  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth'
  });
  
  return {
    direction,
    scrolledFrom: startPosition,
    scrolledTo: targetPosition,
    distance: Math.abs(targetPosition - startPosition)
  };
}

// Enhanced click handler with better element finding
function handlePageClick(selector) {
  let element;
  
  if (selector) {
    element = document.querySelector(selector);
  } else {
    // Try to find common clickable elements
    element = document.querySelector('button, a, input[type="submit"], .btn');
  }
  
  if (element) {
    // Highlight element briefly before clicking
    highlightElement(element);
    
    setTimeout(() => {
      element.click();
      removeHighlight();
    }, 500);
    
    return {
      clicked: true,
      elementType: element.tagName,
      elementText: element.textContent?.substring(0, 50) || '',
      selector: getElementSelector(element)
    };
  } else {
    throw new Error('No clickable element found');
  }
}

// Enhanced form filling
function handleFillForm(selector, value) {
  let element;
  
  if (selector) {
    element = document.querySelector(selector);
  } else {
    // Find the most likely input field
    element = document.querySelector('input[type="text"]:not([readonly]), input[type="search"], textarea') ||
              document.querySelector('input[type="email"], input[type="url"]');
  }
  
  if (element) {
    element.focus();
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    return {
      filled: true,
      elementType: element.tagName,
      inputType: element.type,
      value: value.substring(0, 50) + (value.length > 50 ? '...' : '')
    };
  } else {
    throw new Error('No suitable input field found');
  }
}

// Extract text from page
function extractPageText(selector) {
  let element;
  
  if (selector) {
    element = document.querySelector(selector);
  } else {
    element = document.body;
  }
  
  if (element) {
    const text = element.textContent || element.innerText || '';
    return {
      text: text.substring(0, 1000), // Limit to 1000 chars
      fullLength: text.length,
      selector: selector || 'body'
    };
  } else {
    throw new Error('Element not found for text extraction');
  }
}

// Find element by text content
function findElementByText(searchText) {
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const matches = [];
  let node;
  
  while (node = walker.nextNode()) {
    if (node.textContent.toLowerCase().includes(searchText.toLowerCase())) {
      matches.push({
        text: node.textContent.trim(),
        element: node.parentElement?.tagName,
        selector: getElementSelector(node.parentElement)
      });
    }
  }
  
  return {
    searchText,
    matches: matches.slice(0, 10), // Limit to 10 matches
    totalMatches: matches.length
  };
}

// Utility functions
function highlightElement(element) {
  if (typeof element === 'string') {
    element = document.querySelector(element);
  }
  
  if (element) {
    element.style.outline = '3px solid #ff6b6b';
    element.style.outlineOffset = '2px';
    element.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
    element.classList.add('goofy-highlighted');
  }
}

function removeHighlight() {
  const highlighted = document.querySelectorAll('.goofy-highlighted');
  highlighted.forEach(el => {
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.style.backgroundColor = '';
    el.classList.remove('goofy-highlighted');
  });
}

function getElementSelector(element) {
  if (!element) return '';
  
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.className) {
    const classes = element.className.split(' ').filter(c => c.trim()).slice(0, 2);
    if (classes.length > 0) {
      return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
    }
  }
  
  return element.tagName.toLowerCase();
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎯 Goofy AI content script ready for action!');
});

// Handle dynamic content
const observer = new MutationObserver((mutations) => {
  // Could be used for dynamic content updates in the future
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});