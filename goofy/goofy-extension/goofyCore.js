// Enhanced Configuration and Constants for Goofy Extension
class GoofyConfig {
    static get SPEECH_SETTINGS() {
        return {
            CONTINUOUS: false,
            INTERIM_RESULTS: false,
            LANGUAGE: 'en-US',
            MAX_ALTERNATIVES: 3,
            MAX_RETRIES: 3,
            RETRY_DELAY_BASE: 1000, // milliseconds
            SPEECH_TIMEOUT: 10000   // 10 seconds
        };
    }
    
    static get UI_SETTINGS() {
        return {
            ANIMATION_DURATION: 300,
            AUTO_HIDE_DELAY: 3000,
            SCROLL_AMOUNT: 300,
            Z_INDEX_BASE: 10000
        };
    }
    
    static get COMMANDS() {
        return {
            SCROLL: {
                down: () => window.scrollBy(0, GoofyConfig.UI_SETTINGS.SCROLL_AMOUNT),
                up: () => window.scrollBy(0, -GoofyConfig.UI_SETTINGS.SCROLL_AMOUNT),
                top: () => window.scrollTo(0, 0),
                bottom: () => window.scrollTo(0, document.body.scrollHeight)
            },
            NAVIGATION: {
                'new tab': () => window.open('', '_blank'),
                'close tab': () => window.close(),
                'refresh page': () => window.location.reload(),
                'go back': () => window.history.back(),
                'go forward': () => window.history.forward()
            }
        };
    }
    
    static get ERROR_MESSAGES() {
        return {
            PERMISSION_DENIED: 'Please allow microphone access in browser settings',
            NETWORK_ERROR: 'Voice recognition temporarily unavailable - use text input',
            NO_SPEECH: 'No speech detected - please speak clearly',
            MICROPHONE_ERROR: 'Microphone not found - check connection',
            BROWSER_UNSUPPORTED: 'Browser does not support speech recognition',
            COMMAND_NOT_FOUND: 'Command not recognized - try "scroll down"'
        };
    }
    
    static get SELECTORS() {
        return {
            SEARCH_INPUTS: [
                'input[type="search"]',
                'input[name*="search"]', 
                'input[placeholder*="search" i]',
                '#search',
                '.search-input',
                '[role="searchbox"]'
            ],
            CLICKABLE_ELEMENTS: [
                'button',
                'a[href]',
                '[role="button"]',
                'input[type="submit"]',
                'input[type="button"]',
                '[onclick]'
            ]
        };
    }
}

// Enhanced Event System
class GoofyEventEmitter {
    constructor() {
        this.events = new Map();
    }
    
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);
        return () => this.off(event, callback); // Return unsubscribe function
    }
    
    off(event, callback) {
        if (this.events.has(event)) {
            this.events.get(event).delete(callback);
        }
    }
    
    emit(event, data = {}) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${event}:`, error);
                }
            });
        }
    }
    
    once(event, callback) {
        const unsubscribe = this.on(event, (data) => {
            unsubscribe();
            callback(data);
        });
        return unsubscribe;
    }
}

// Enhanced Utility Functions
class GoofyUtils {
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    }
    
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    static isElementVisible(element) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && 
               rect.top >= 0 && rect.left >= 0 &&
               rect.bottom <= window.innerHeight && 
               rect.right <= window.innerWidth;
    }
    
    static findBestElementMatch(query, selectors = GoofyConfig.SELECTORS.CLICKABLE_ELEMENTS) {
        const queryLower = query.toLowerCase();
        let bestMatch = null;
        let bestScore = 0;
        
        selectors.forEach(selector => {
            try {
                document.querySelectorAll(selector).forEach(element => {
                    const text = (element.textContent || element.value || element.placeholder || '').toLowerCase();
                    const score = GoofyUtils.calculateMatchScore(queryLower, text);
                    
                    if (score > bestScore && GoofyUtils.isElementVisible(element)) {
                        bestScore = score;
                        bestMatch = element;
                    }
                });
            } catch (error) {
                console.warn(`Invalid selector: ${selector}`, error);
            }
        });
        
        return bestMatch;
    }
    
    static calculateMatchScore(query, text) {
        if (!text) return 0;
        
        // Exact match gets highest score
        if (text === query) return 100;
        
        // Contains query gets good score
        if (text.includes(query)) return 80;
        
        // Word-based matching
        const queryWords = query.split(' ');
        const textWords = text.split(' ');
        const matchingWords = queryWords.filter(qWord => 
            textWords.some(tWord => tWord.includes(qWord) || qWord.includes(tWord))
        );
        
        return (matchingWords.length / queryWords.length) * 60;
    }
    
    static sanitizeInput(input) {
        return input.trim().toLowerCase().replace(/[^\w\s]/g, '');
    }
    
    static createStyledElement(tag, styles = {}, content = '') {
        const element = document.createElement(tag);
        Object.assign(element.style, styles);
        if (content) element.innerHTML = content;
        return element;
    }
}

// Make available globally
window.GoofyConfig = GoofyConfig;
window.GoofyEventEmitter = GoofyEventEmitter;
window.GoofyUtils = GoofyUtils;