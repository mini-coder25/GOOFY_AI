// Goofy Extension Background Service Worker
class GoofyBackgroundService {
    constructor() {
        this.initializeListeners();
        this.isActive = false;
        this.currentTab = null;
    }

    initializeListeners() {
        // Extension installation
        chrome.runtime.onInstalled.addListener((details) => {
            this.onInstalled(details);
        });

        // Message handling between components
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });

        // Tab updates for context awareness
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.onTabActivated(activeInfo);
        });

        // Context menu creation
        this.createContextMenus();
    }

    onInstalled(details) {
        console.log('Goofy Assistant installed/updated:', details.reason);
        
        // Set default settings
        chrome.storage.sync.set({
            voiceEnabled: true,
            avatarEnabled: true,
            autoActivate: false,
            voiceSpeed: 1.0,
            voicePitch: 1.0
        });

        // Create welcome notification
        if (details.reason === 'install') {
            this.showWelcomeNotification();
        }
    }

    createContextMenus() {
        chrome.contextMenus.create({
            id: "activateGoofy",
            title: "Activate Goofy Assistant",
            contexts: ["page", "selection", "link", "image"]
        });

        chrome.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === "activateGoofy") {
                this.activateGoofyOnTab(tab.id);
            }
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'activateGoofy':
                    await this.activateGoofy(request.tabId);
                    sendResponse({success: true});
                    break;

                case 'deactivateGoofy':
                    await this.deactivateGoofy(request.tabId);
                    sendResponse({success: true});
                    break;

                case 'executeCommand':
                    const result = await this.executeVoiceCommand(request.command, request.tabId);
                    sendResponse(result);
                    break;

                case 'getTabInfo':
                    const tabInfo = await this.getTabInfo(request.tabId);
                    sendResponse(tabInfo);
                    break;

                case 'updateSettings':
                    await this.updateSettings(request.settings);
                    sendResponse({success: true});
                    break;

                case 'getCurrentTab':
                    const currentTab = await this.getCurrentActiveTab();
                    sendResponse({tabId: currentTab?.id});
                    break;

                default:
                    sendResponse({error: 'Unknown action'});
            }
        } catch (error) {
            console.error('Background script error:', error);
            sendResponse({error: error.message});
        }
    }

    async activateGoofy(tabId) {
        try {
            // Inject content script if not already present
            await chrome.scripting.executeScript({
                target: {tabId: tabId},
                files: ['content.js']
            });

            // Send activation message to content script
            await chrome.tabs.sendMessage(tabId, {action: 'activate'});
            
            this.isActive = true;
            this.currentTab = tabId;
            
            console.log('Goofy activated on tab:', tabId);
        } catch (error) {
            console.error('Failed to activate Goofy:', error);
            throw error;
        }
    }

    async deactivateGoofy(tabId) {
        try {
            await chrome.tabs.sendMessage(tabId, {action: 'deactivate'});
            this.isActive = false;
            this.currentTab = null;
            console.log('Goofy deactivated on tab:', tabId);
        } catch (error) {
            console.error('Failed to deactivate Goofy:', error);
        }
    }

    async executeVoiceCommand(command, tabId) {
        const commandLower = command.toLowerCase();
        
        try {
            // Basic navigation commands
            if (commandLower.includes('go to') || commandLower.includes('navigate to')) {
                return await this.handleNavigation(command, tabId);
            }
            
            // Scroll commands
            if (commandLower.includes('scroll')) {
                return await this.handleScroll(command, tabId);
            }
            
            // Click commands
            if (commandLower.includes('click')) {
                return await this.handleClick(command, tabId);
            }
            
            // Search commands
            if (commandLower.includes('search')) {
                return await this.handleSearch(command, tabId);
            }
            
            // Tab management
            if (commandLower.includes('new tab') || commandLower.includes('close tab')) {
                return await this.handleTabManagement(command, tabId);
            }

            // Default: Send to content script for DOM manipulation
            const response = await chrome.tabs.sendMessage(tabId, {
                action: 'executeCommand',
                command: command
            });
            
            return response;
            
        } catch (error) {
            console.error('Command execution error:', error);
            return {success: false, error: error.message};
        }
    }

    async handleNavigation(command, tabId) {
        const urlPattern = /(?:go to|navigate to)\s+(.*)/i;
        const match = command.match(urlPattern);
        
        if (match) {
            let url = match[1].trim();
            
            // Add protocol if missing
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            
            await chrome.tabs.update(tabId, {url: url});
            return {success: true, message: `Navigating to ${url}`};
        }
        
        return {success: false, error: 'Could not parse navigation command'};
    }

    async handleTabManagement(command, tabId) {
        const commandLower = command.toLowerCase();
        
        if (commandLower.includes('new tab')) {
            const newTab = await chrome.tabs.create({});
            return {success: true, message: 'New tab created', tabId: newTab.id};
        }
        
        if (commandLower.includes('close tab')) {
            await chrome.tabs.remove(tabId);
            return {success: true, message: 'Tab closed'};
        }
        
        return {success: false, error: 'Unknown tab command'};
    }

    async handleScroll(command, tabId) {
        return await chrome.tabs.sendMessage(tabId, {
            action: 'scroll',
            command: command
        });
    }

    async handleClick(command, tabId) {
        return await chrome.tabs.sendMessage(tabId, {
            action: 'click',
            command: command
        });
    }

    async handleSearch(command, tabId) {
        return await chrome.tabs.sendMessage(tabId, {
            action: 'search',
            command: command
        });
    }

    async getTabInfo(tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            return {
                title: tab.title,
                url: tab.url,
                active: tab.active
            };
        } catch (error) {
            return {error: error.message};
        }
    }

    async getCurrentActiveTab() {
        try {
            const tabs = await chrome.tabs.query({active: true, currentWindow: true});
            return tabs[0] || null;
        } catch (error) {
            console.error('Failed to get current tab:', error);
            return null;
        }
    }

    async updateSettings(settings) {
        await chrome.storage.sync.set(settings);
        console.log('Settings updated:', settings);
    }

    onTabActivated(activeInfo) {
        this.currentTab = activeInfo.tabId;
    }

    activateGoofyOnTab(tabId) {
        this.activateGoofy(tabId);
    }

    showWelcomeNotification() {
        console.log('Welcome to Goofy Assistant! 🎉');
        // Could implement chrome.notifications here if needed
    }
}

// Initialize the background service
const goofyService = new GoofyBackgroundService();

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
    console.log('Goofy Background Service started');
});