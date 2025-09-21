// Enhanced Command Processing System
class GoofyCommandProcessor {
    constructor() {
        this.commandHistory = [];
        this.maxHistorySize = 50;
        this.commandPatterns = this.initializeCommandPatterns();
    }
    
    initializeCommandPatterns() {
        return {
            scroll: {
                patterns: [
                    /^(scroll|move|go)\s+(down|up|top|bottom)$/i,
                    /^(scroll|go)\s+to\s+(top|bottom)$/i,
                    /^(page\s+)?(up|down)$/i
                ],
                handler: this.handleScrollCommand.bind(this)
            },
            
            navigation: {
                patterns: [
                    /^(new|open)\s+tab$/i,
                    /^close\s+tab$/i,
                    /^(refresh|reload)\s+(page)?$/i,
                    /^go\s+(back|forward)$/i
                ],
                handler: this.handleNavigationCommand.bind(this)
            },
            
            interaction: {
                patterns: [
                    /^click\s+(?:on\s+)?(.+)$/i,
                    /^press\s+(.+)$/i,
                    /^tap\s+(.+)$/i
                ],
                handler: this.handleInteractionCommand.bind(this)
            },
            
            search: {
                patterns: [
                    /^search\s+(?:for\s+)?(.+)$/i,
                    /^find\s+(.+)$/i,
                    /^look\s+for\s+(.+)$/i
                ],
                handler: this.handleSearchCommand.bind(this)
            },
            
            input: {
                patterns: [
                    /^(type|enter|input)\s+(.+)\s+(?:in|into)\s+(.+)$/i,
                    /^fill\s+(.+)\s+with\s+(.+)$/i
                ],
                handler: this.handleInputCommand.bind(this)
            }
        };
    }
    
    async processCommand(rawCommand) {
        try {
            const command = this.normalizeCommand(rawCommand);
            this.addToHistory(command);
            
            console.log(`🎯 Processing command: "${command}"`);
            
            // Find matching pattern
            const result = this.findAndExecuteCommand(command);
            
            if (result.success) {
                console.log(`✅ Command executed: ${result.message}`);
                return result;
            } else {
                console.warn(`❌ Command failed: ${result.error}`);
                return this.handleUnknownCommand(command);
            }
            
        } catch (error) {
            console.error('❌ Command processing error:', error);
            return {
                success: false,
                error: 'Failed to process command',
                details: error.message
            };
        }
    }
    
    normalizeCommand(command) {
        return command
            .trim()
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ');
    }
    
    findAndExecuteCommand(command) {
        for (const [category, config] of Object.entries(this.commandPatterns)) {
            for (const pattern of config.patterns) {
                const match = command.match(pattern);
                if (match) {
                    console.log(`🎯 Matched pattern in category: ${category}`);
                    return config.handler(command, match);
                }
            }
        }
        
        return { success: false, error: 'No matching command pattern found' };
    }
    
    handleScrollCommand(command, match) {
        const direction = this.extractScrollDirection(command);
        const scrollAmount = window.GoofyConfig?.UI_SETTINGS?.SCROLL_AMOUNT || 300;
        
        switch (direction) {
            case 'down':
                window.scrollBy(0, scrollAmount);
                return { success: true, message: 'Scrolled down' };
                
            case 'up':
                window.scrollBy(0, -scrollAmount);
                return { success: true, message: 'Scrolled up' };
                
            case 'top':
                window.scrollTo(0, 0);
                return { success: true, message: 'Scrolled to top' };
                
            case 'bottom':
                window.scrollTo(0, document.body.scrollHeight);
                return { success: true, message: 'Scrolled to bottom' };
                
            default:
                return { success: false, error: 'Unknown scroll direction' };
        }
    }
    
    handleNavigationCommand(command, match) {
        try {
            if (command.includes('new') || command.includes('open')) {
                window.open('', '_blank');
                return { success: true, message: 'Opened new tab' };
            }
            
            if (command.includes('close')) {
                window.close();
                return { success: true, message: 'Closed tab' };
            }
            
            if (command.includes('refresh') || command.includes('reload')) {
                window.location.reload();
                return { success: true, message: 'Page refreshed' };
            }
            
            if (command.includes('back')) {
                window.history.back();
                return { success: true, message: 'Navigated back' };
            }
            
            if (command.includes('forward')) {
                window.history.forward();
                return { success: true, message: 'Navigated forward' };
            }
            
            return { success: false, error: 'Unknown navigation command' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    handleInteractionCommand(command, match) {
        const target = match[1];
        const GoofyUtils = window.GoofyUtils || {
            findBestElementMatch: (query) => {
                const selectors = ['button', 'a', '[role="button"]', 'input[type="submit"]'];
                for (const selector of selectors) {
                    const elements = document.querySelectorAll(selector);
                    for (const element of elements) {
                        if (element.textContent.toLowerCase().includes(query.toLowerCase())) {
                            return element;
                        }
                    }
                }
                return null;
            }
        };
        
        const element = GoofyUtils.findBestElementMatch(target);
        
        if (element) {
            try {
                element.click();
                return { 
                    success: true, 
                    message: `Clicked on ${target}`,
                    element: element.tagName.toLowerCase()
                };
            } catch (error) {
                return { success: false, error: `Failed to click: ${error.message}` };
            }
        } else {
            return { 
                success: false, 
                error: `Could not find clickable element: ${target}`,
                suggestion: 'Try being more specific or use quick buttons'
            };
        }
    }
    
    handleSearchCommand(command, match) {
        const query = match[1];
        const searchInput = this.findSearchInput();
        
        if (searchInput) {
            try {
                searchInput.focus();
                searchInput.value = query;
                
                // Trigger input events
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                searchInput.dispatchEvent(new Event('change', { bubbles: true }));
                
                // Try to submit
                const form = searchInput.closest('form');
                if (form) {
                    form.submit();
                } else {
                    // Try Enter key
                    searchInput.dispatchEvent(new KeyboardEvent('keydown', {
                        key: 'Enter',
                        code: 'Enter',
                        bubbles: true
                    }));
                }
                
                return { success: true, message: `Searching for: ${query}` };
            } catch (error) {
                return { success: false, error: `Search failed: ${error.message}` };
            }
        } else {
            return { 
                success: false, 
                error: 'No search input found on this page',
                suggestion: 'Try navigating to a search page first'
            };
        }
    }
    
    handleInputCommand(command, match) {
        // Implementation for input/form filling
        return { success: false, error: 'Input commands not yet implemented' };
    }
    
    handleUnknownCommand(command) {
        const suggestions = this.generateSuggestions(command);
        const errorMessages = window.GoofyConfig?.ERROR_MESSAGES || {
            COMMAND_NOT_FOUND: 'Command not recognized - try "scroll down"'
        };
        
        return {
            success: false,
            error: errorMessages.COMMAND_NOT_FOUND,
            suggestions: suggestions,
            originalCommand: command
        };
    }
    
    generateSuggestions(command) {
        const commonCommands = [
            'scroll down',
            'scroll up', 
            'new tab',
            'close tab',
            'refresh page',
            'search for [query]',
            'click [element]'
        ];
        
        // Simple fuzzy matching for suggestions
        return commonCommands.filter(cmd => 
            cmd.includes(command.split(' ')[0]) || 
            command.includes(cmd.split(' ')[0])
        ).slice(0, 3);
    }
    
    extractScrollDirection(command) {
        if (command.includes('down')) return 'down';
        if (command.includes('up')) return 'up';
        if (command.includes('top')) return 'top';
        if (command.includes('bottom')) return 'bottom';
        return null;
    }
    
    findSearchInput() {
        const searchSelectors = window.GoofyConfig?.SELECTORS?.SEARCH_INPUTS || [
            'input[type="search"]',
            'input[name*="search"]', 
            'input[placeholder*="search" i]',
            '#search',
            '.search-input',
            '[role="searchbox"]'
        ];
        
        const GoofyUtils = window.GoofyUtils || {
            isElementVisible: (element) => {
                if (!element) return false;
                const rect = element.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            }
        };
        
        for (const selector of searchSelectors) {
            const element = document.querySelector(selector);
            if (element && GoofyUtils.isElementVisible(element)) {
                return element;
            }
        }
        return null;
    }
    
    addToHistory(command) {
        this.commandHistory.unshift({
            command,
            timestamp: Date.now(),
            url: window.location.href
        });
        
        if (this.commandHistory.length > this.maxHistorySize) {
            this.commandHistory = this.commandHistory.slice(0, this.maxHistorySize);
        }
    }
    
    getCommandHistory(limit = 10) {
        return this.commandHistory.slice(0, limit);
    }
    
    getCommandStats() {
        const categories = {};
        this.commandHistory.forEach(({ command }) => {
            const category = this.categorizeCommand(command);
            categories[category] = (categories[category] || 0) + 1;
        });
        return categories;
    }
    
    categorizeCommand(command) {
        for (const [category, config] of Object.entries(this.commandPatterns)) {
            for (const pattern of config.patterns) {
                if (command.match(pattern)) {
                    return category;
                }
            }
        }
        return 'unknown';
    }
}

// Make available globally
window.GoofyCommandProcessor = GoofyCommandProcessor;