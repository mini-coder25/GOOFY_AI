// Goofy Content Script - DOM Interaction and Page Control
class GoofyContentScript {
    constructor() {
        this.isActive = false;
        this.avatar = null;
        this.overlay = null;
        this.speechEngine = null;
        this.speechSynthesis = window.speechSynthesis;
        this.isListening = false;
        
        this.initializeListeners();
        this.setupSpeechEngine();
    }

    initializeListeners() {
        // Listen for messages from background script
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true;
        });

        // Listen for keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+G to toggle Goofy
            if (e.ctrlKey && e.shiftKey && e.key === 'G') {
                e.preventDefault();
                this.toggle();
            }
            
            // Space to start/stop listening when Goofy is active
            if (this.isActive && e.code === 'Space' && e.ctrlKey) {
                e.preventDefault();
                this.toggleListening();
            }
        });
    }

    handleMessage(request, sender, sendResponse) {
        switch (request.action) {
            case 'activate':
                this.activate();
                sendResponse({success: true});
                break;
                
            case 'deactivate':
                this.deactivate();
                sendResponse({success: true});
                break;
                
            case 'executeCommand':
                this.executeCommand(request.command).then(result => {
                    sendResponse(result);
                });
                break;
                
            case 'scroll':
                this.handleScroll(request.command).then(result => {
                    sendResponse(result);
                });
                break;
                
            case 'click':
                this.handleClick(request.command).then(result => {
                    sendResponse(result);
                });
                break;
                
            case 'search':
                this.handleSearch(request.command).then(result => {
                    sendResponse(result);
                });
                break;
                
            default:
                sendResponse({error: 'Unknown action'});
        }
    }

    setupSpeechEngine() {
        console.log('Setting up enhanced speech engine...');
        
        if (window.GoofySpeechEngine) {
            this.speechEngine = new window.GoofySpeechEngine();
            
            // Listen to speech events
            this.speechEngine.addListener((event, data) => {
                this.handleSpeechEvent(event, data);
            });
            
            console.log('Speech engine initialized successfully');
            console.log('Browser support:', this.speechEngine.getSupportInfo());
        } else {
            console.error('GoofySpeechEngine not available');
            // Fallback to basic setup
            this.setupBasicSpeechRecognition();
        }
    }
    
    handleSpeechEvent(event, data) {
        console.log('Speech event:', event, data);
        
        switch (event) {
            case 'start':
                this.isListening = true;
                this.updateAvatar('listening');
                this.updateListenButton('🛑 Stop');
                break;
                
            case 'result':
                console.log('Voice command received:', data.transcript);
                this.processVoiceCommand(data.transcript);
                break;
                
            case 'error':
                this.handleSpeechError(data);
                break;
                
            case 'end':
                this.isListening = false;
                this.updateAvatar('idle');
                this.updateListenButton('🎤 Listen');
                break;
        }
    }
    
    handleSpeechError(errorData) {
        console.log('Handling speech error:', errorData);
        
        switch (errorData.type) {
            case 'permission':
                this.speak('Please allow microphone access in your browser settings.');
                this.showPermissionHelp();
                break;
                
            case 'network':
                if (errorData.showFallback) {
                    this.speak('Voice recognition is temporarily unavailable. Please use the text input or quick buttons.');
                    this.highlightFallbackOptions();
                } else {
                    this.speak('Network issue detected. Retrying...');
                }
                break;
                
            case 'no-speech':
                this.speak('I didn\'t hear anything. Please try speaking more clearly.');
                if (errorData.canRetry) {
                    setTimeout(() => {
                        this.startListening();
                    }, 2000);
                }
                break;
                
            case 'microphone':
                this.speak('No microphone detected. Please check your microphone connection.');
                break;
                
            default:
                this.speak(errorData.message || 'Speech recognition error. Please try again.');
        }
        
        this.isListening = false;
        this.updateAvatar('idle');
        this.updateListenButton('🎤 Listen');
    }

    activate() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.createOverlay();
        this.createAvatar();
        this.speak("Hi! I'm Goofy, your voice assistant. How can I help you browse?");
        
        console.log('Goofy activated on page:', window.location.href);
    }

    deactivate() {
        if (!this.isActive) return;
        
        this.isActive = false;
        this.stopListening();
        this.removeOverlay();
        this.removeAvatar();
        
        console.log('Goofy deactivated');
    }

    toggle() {
        if (this.isActive) {
            this.deactivate();
        } else {
            this.activate();
        }
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'goofy-overlay';
        this.overlay.innerHTML = `
            <div class="goofy-controls">
                <button id="goofy-listen-btn" class="goofy-btn">🎤 Listen</button>
                <button id="goofy-close-btn" class="goofy-btn">✕ Close</button>
            </div>
        `;
        
        // Add styles
        this.overlay.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: rgba(0, 0, 0, 0.9);
            border-radius: 12px;
            padding: 15px;
            color: white;
            font-family: Arial, sans-serif;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(this.overlay);
        
        // Add event listeners
        document.getElementById('goofy-listen-btn').addEventListener('click', () => {
            this.toggleListening();
        });
        
        document.getElementById('goofy-close-btn').addEventListener('click', () => {
            this.deactivate();
        });
    }

    createAvatar() {
        this.avatar = document.createElement('div');
        this.avatar.id = 'goofy-avatar';
        this.avatar.innerHTML = `
            <div class="avatar-face">
                <div class="avatar-eyes">
                    <div class="eye left-eye"></div>
                    <div class="eye right-eye"></div>
                </div>
                <div class="avatar-mouth"></div>
            </div>
            <div class="avatar-status">Ready</div>
        `;
        
        // Avatar styles
        this.avatar.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 10001;
            width: 80px;
            height: 80px;
            background: linear-gradient(45deg, #4CAF50, #45a049);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        
        document.body.appendChild(this.avatar);
        
        // Add click listener to avatar
        this.avatar.addEventListener('click', () => {
            this.toggleListening();
        });
        
        this.injectAvatarStyles();
    }

    injectAvatarStyles() {
        const styles = `
            #goofy-avatar .avatar-face {
                position: relative;
                width: 60px;
                height: 60px;
            }
            
            #goofy-avatar .avatar-eyes {
                display: flex;
                justify-content: space-between;
                margin-top: 15px;
                width: 30px;
                margin-left: auto;
                margin-right: auto;
            }
            
            #goofy-avatar .eye {
                width: 8px;
                height: 8px;
                background: white;
                border-radius: 50%;
                animation: blink 3s infinite;
            }
            
            #goofy-avatar .avatar-mouth {
                width: 20px;
                height: 10px;
                background: white;
                border-radius: 0 0 20px 20px;
                margin: 5px auto 0;
                transition: all 0.3s ease;
            }
            
            #goofy-avatar .avatar-status {
                font-size: 10px;
                color: white;
                margin-top: 5px;
                text-align: center;
            }
            
            #goofy-avatar.listening {
                animation: pulse 1s infinite;
                background: linear-gradient(45deg, #2196F3, #1976D2);
            }
            
            #goofy-avatar.speaking .avatar-mouth {
                animation: speak 0.5s infinite alternate;
            }
            
            @keyframes blink {
                0%, 90%, 100% { height: 8px; }
                95% { height: 2px; }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            @keyframes speak {
                0% { height: 10px; }
                100% { height: 15px; }
            }
            
            .goofy-controls {
                display: flex;
                gap: 10px;
            }
            
            .goofy-btn {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                transition: background 0.3s;
            }
            
            .goofy-btn:hover {
                background: #45a049;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    removeOverlay() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }

    removeAvatar() {
        if (this.avatar) {
            this.avatar.remove();
            this.avatar = null;
        }
    }

    updateAvatar(state) {
        if (!this.avatar) return;
        
        const statusElement = this.avatar.querySelector('.avatar-status');
        
        switch (state) {
            case 'listening':
                this.avatar.className = 'listening';
                statusElement.textContent = 'Listening...';
                break;
            case 'speaking':
                this.avatar.className = 'speaking';
                statusElement.textContent = 'Speaking...';
                break;
            case 'thinking':
                this.avatar.className = 'thinking';
                statusElement.textContent = 'Processing...';
                break;
            default:
                this.avatar.className = '';
                statusElement.textContent = 'Ready';
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        console.log('Attempting to start listening...');
        
        if (this.speechEngine) {
            // Use enhanced speech engine
            const success = this.speechEngine.startListening();
            if (!success) {
                this.speak("Sorry, couldn't start voice recognition. Please try the text input below.");
                this.highlightFallbackOptions();
            }
        } else if (this.speechRecognition) {
            // Fallback to basic speech recognition
            this.startBasicListening();
        } else {
            console.error('No speech recognition available');
            this.speak("Voice recognition is not available. Please use the text input or quick buttons.");
            this.highlightFallbackOptions();
        }
    }
    
    startBasicListening() {
        if (this.isListening) {
            console.log('Already listening, stopping first...');
            this.stopListening();
            return;
        }
        
        try {
            console.log('Starting basic speech recognition...');
            this.isListening = true;
            this.updateAvatar('listening');
            this.speechRecognition.start();
            this.updateListenButton('🛑 Stop');
            console.log('Basic speech recognition started successfully');
        } catch (error) {
            console.error('Failed to start basic speech recognition:', error);
            this.isListening = false;
            this.updateAvatar('idle');
            this.speak('Failed to start voice recognition. Please try the text input.');
            this.highlightFallbackOptions();
        }
    }

    stopListening() {
        this.isListening = false;
        this.updateAvatar('idle');
        
        if (this.speechEngine) {
            this.speechEngine.stopListening();
        } else if (this.speechRecognition) {
            this.speechRecognition.stop();
        }
        
        this.updateListenButton('🎤 Listen');
    }

    onSpeechResult(event) {
        console.log('Speech result event:', event);
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            console.log('Result', i, ':', result[0].transcript, 'Final:', result.isFinal);
            
            if (result.isFinal) {
                finalTranscript += result[0].transcript;
            }
        }
        
        if (finalTranscript.trim()) {
            console.log('Final transcript:', finalTranscript.trim());
            this.processVoiceCommand(finalTranscript.trim());
        } else {
            console.log('No final transcript detected');
        }
    }

    async processVoiceCommand(command) {
        console.log('Processing voice command:', command);
        this.updateAvatar('thinking');
        this.stopListening();
        
        try {
            // First try to execute locally
            let result = await this.executeCommand(command);
            
            // If local execution fails, try background script
            if (!result.success) {
                console.log('Local execution failed, trying background script...');
                result = await chrome.runtime.sendMessage({
                    action: 'executeCommand',
                    command: command,
                    tabId: await this.getCurrentTabId()
                });
            }
            
            if (result && result.success) {
                this.speak(result.message || "Command executed successfully!");
                console.log('Command executed successfully:', result);
            } else {
                const errorMsg = "Sorry, I couldn't execute that command. " + (result?.error || "Please try rephrasing.");
                this.speak(errorMsg);
                console.error('Command execution failed:', result);
            }
        } catch (error) {
            console.error('Command processing error:', error);
            this.speak("Sorry, there was an error processing your command. Please try again.");
        }
        
        this.updateAvatar('idle');
    }

    async getCurrentTabId() {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({action: 'getCurrentTab'}, (response) => {
                resolve(response.tabId);
            });
        });
    }

    speak(text) {
        if (this.speechSynthesis) {
            this.updateAvatar('speaking');
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0;
            utterance.pitch = 1.2;
            utterance.volume = 0.8;
            
            utterance.onend = () => {
                this.updateAvatar('idle');
            };
            
            this.speechSynthesis.speak(utterance);
        }
    }
    
    updateListenButton(text) {
        const listenBtn = document.getElementById('goofy-listen-btn');
        if (listenBtn) {
            listenBtn.textContent = text;
        }
    }
    
    highlightFallbackOptions() {
        // Highlight the text input and quick buttons as alternatives
        const overlay = this.overlay;
        if (overlay) {
            const fallbackNote = document.createElement('div');
            fallbackNote.style.cssText = `
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                padding: 10px;
                margin: 10px 0;
                font-size: 12px;
                color: #856404;
            `;
            fallbackNote.innerHTML = '💡 <strong>Tip:</strong> Use the text input or quick buttons below for reliable commands!';
            
            const controls = overlay.querySelector('.goofy-controls');
            if (controls && !controls.querySelector('.fallback-note')) {
                fallbackNote.className = 'fallback-note';
                controls.appendChild(fallbackNote);
                
                // Remove after 5 seconds
                setTimeout(() => {
                    if (fallbackNote.parentNode) {
                        fallbackNote.remove();
                    }
                }, 5000);
            }
        }
    }
    
    showPermissionHelp() {
        const helpText = `
            To enable voice commands:
            1. Click the microphone icon in your address bar
            2. Select "Always allow" for this site
            3. Refresh the page and try again
        `;
        
        console.log('Permission Help:', helpText);
        
        // Show as notification or overlay
        if (this.overlay) {
            const helpDiv = document.createElement('div');
            helpDiv.style.cssText = `
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 6px;
                padding: 10px;
                margin: 10px 0;
                font-size: 11px;
                color: #721c24;
                white-space: pre-line;
            `;
            helpDiv.textContent = helpText;
            
            const controls = this.overlay.querySelector('.goofy-controls');
            if (controls) {
                controls.appendChild(helpDiv);
                
                setTimeout(() => {
                    if (helpDiv.parentNode) {
                        helpDiv.remove();
                    }
                }, 10000);
            }
        }
    }
    
    setupBasicSpeechRecognition() {
        console.log('Setting up basic speech recognition fallback...');
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'en-US';
            this.speechRecognition.maxAlternatives = 1;
            
            this.speechRecognition.onresult = (event) => {
                this.onSpeechResult(event);
            };
            
            this.speechRecognition.onerror = (event) => {
                console.error('Basic speech recognition error:', event.error);
                this.handleSpeechError({
                    type: event.error === 'network' ? 'network' : 'generic',
                    message: `Speech error: ${event.error}`,
                    showFallback: event.error === 'network'
                });
            };
            
            this.speechRecognition.onend = () => {
                this.isListening = false;
                this.updateAvatar('idle');
                this.updateListenButton('🎤 Listen');
            };
        }
    }

    // Command execution methods
    async executeCommand(command) {
        const commandLower = command.toLowerCase();
        
        // Handle page-specific commands
        if (commandLower.includes('scroll')) {
            return this.handleScroll(command);
        }
        
        if (commandLower.includes('click')) {
            return this.handleClick(command);
        }
        
        if (commandLower.includes('find') || commandLower.includes('search')) {
            return this.handleSearch(command);
        }
        
        if (commandLower.includes('fill') || commandLower.includes('type')) {
            return this.handleInput(command);
        }
        
        return {success: false, error: 'Command not recognized'};
    }

    async handleScroll(command) {
        const commandLower = command.toLowerCase();
        
        try {
            if (commandLower.includes('up')) {
                window.scrollBy(0, -300);
                return {success: true, message: 'Scrolled up'};
            } else if (commandLower.includes('down')) {
                window.scrollBy(0, 300);
                return {success: true, message: 'Scrolled down'};
            } else if (commandLower.includes('top')) {
                window.scrollTo(0, 0);
                return {success: true, message: 'Scrolled to top'};
            } else if (commandLower.includes('bottom')) {
                window.scrollTo(0, document.body.scrollHeight);
                return {success: true, message: 'Scrolled to bottom'};
            }
            
            return {success: false, error: 'Unknown scroll direction'};
        } catch (error) {
            return {success: false, error: error.message};
        }
    }

    async handleClick(command) {
        // Extract what to click from the command
        const clickPattern = /click\s+(?:on\s+)?(?:the\s+)?(.+)/i;
        const match = command.match(clickPattern);
        
        if (!match) {
            return {success: false, error: 'Could not understand what to click'};
        }
        
        const target = match[1].toLowerCase();
        
        try {
            // Find element by various selectors
            let element = this.findElementByText(target) ||
                         this.findElementByRole(target) ||
                         this.findElementByAttribute(target);
            
            if (element) {
                element.click();
                return {success: true, message: `Clicked on ${target}`};
            } else {
                return {success: false, error: `Could not find element: ${target}`};
            }
        } catch (error) {
            return {success: false, error: error.message};
        }
    }

    findElementByText(text) {
        // Search for buttons, links, and clickable elements containing the text
        const selectors = ['button', 'a', '[role="button"]', 'input[type="submit"]', 'input[type="button"]'];
        
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (element.textContent.toLowerCase().includes(text)) {
                    return element;
                }
            }
        }
        
        return null;
    }

    findElementByRole(role) {
        return document.querySelector(`[role="${role}"]`) || 
               document.querySelector(role);
    }

    findElementByAttribute(text) {
        // Search by common attributes
        return document.querySelector(`[title*="${text}"]`) ||
               document.querySelector(`[aria-label*="${text}"]`) ||
               document.querySelector(`[alt*="${text}"]`);
    }

    async handleSearch(command) {
        // Extract search query
        const searchPattern = /(?:find|search)\s+(?:for\s+)?(.+)/i;
        const match = command.match(searchPattern);
        
        if (!match) {
            return {success: false, error: 'Could not understand search query'};
        }
        
        const query = match[1];
        
        // Try to find search input
        const searchInput = document.querySelector('input[type="search"]') ||
                           document.querySelector('input[name*="search"]') ||
                           document.querySelector('input[placeholder*="search"]') ||
                           document.querySelector('#search') ||
                           document.querySelector('.search-input');
        
        if (searchInput) {
            searchInput.focus();
            searchInput.value = query;
            
            // Trigger search (try Enter key or find search button)
            searchInput.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter'}));
            
            return {success: true, message: `Searching for: ${query}`};
        } else {
            return {success: false, error: 'Could not find search input on this page'};
        }
    }

    async handleInput(command) {
        // Handle form filling
        const inputPattern = /(?:fill|type)\s+(.+)\s+(?:in|into)\s+(.+)/i;
        const match = command.match(inputPattern);
        
        if (!match) {
            return {success: false, error: 'Could not understand input command'};
        }
        
        const value = match[1];
        const fieldName = match[2].toLowerCase();
        
        // Find input field
        const inputField = document.querySelector(`input[name*="${fieldName}"]`) ||
                          document.querySelector(`input[placeholder*="${fieldName}"]`) ||
                          document.querySelector(`textarea[name*="${fieldName}"]`) ||
                          document.querySelector(`#${fieldName}`) ||
                          document.querySelector(`.${fieldName}`);
        
        if (inputField) {
            inputField.focus();
            inputField.value = value;
            inputField.dispatchEvent(new Event('input', {bubbles: true}));
            
            return {success: true, message: `Filled ${fieldName} with: ${value}`};
        } else {
            return {success: false, error: `Could not find input field: ${fieldName}`};
        }
    }
}

// Initialize content script when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.goofyContentScript = new GoofyContentScript();
    });
} else {
    window.goofyContentScript = new GoofyContentScript();
}