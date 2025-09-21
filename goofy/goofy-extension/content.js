// Enhanced Goofy Content Script with Better Architecture
class GoofyContentScript {
    constructor() {
        // Check if required dependencies are loaded
        if (typeof GoofyUtils === 'undefined') {
            console.warn('GoofyUtils not loaded, creating fallback');
            window.GoofyUtils = this.createFallbackUtils();
        }
        
        if (typeof GoofyCommandProcessor === 'undefined') {
            console.warn('GoofyCommandProcessor not loaded, creating basic processor');
            this.commandProcessor = this.createBasicCommandProcessor();
        } else {
            this.commandProcessor = new GoofyCommandProcessor();
        }
        
        // Core state
        this.isActive = false;
        this.isListening = false;
        this.isDestroyed = false;
        
        // UI elements
        this.avatar = null;
        this.overlay = null;
        this.textInputContainer = null;
        
        // Speech components
        this.speechEngine = null;
        this.speechSynthesis = window.speechSynthesis;
        
        // Event listeners for cleanup
        this.eventListeners = new Map();
        
        this.initialize();
    }
    
    async initialize() {
        try {
            this.initializeListeners();
            await this.setupSpeechEngine();
            console.log('✅ Goofy Content Script initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Goofy Content Script:', error);
        }
    }
    
    createFallbackUtils() {
        return {
            throttle: (func, limit) => {
                let inThrottle;
                return function(...args) {
                    if (!inThrottle) {
                        func.apply(this, args);
                        inThrottle = true;
                        setTimeout(() => inThrottle = false, limit);
                    }
                };
            },
            debounce: (func, wait) => {
                let timeout;
                return function(...args) {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => func.apply(this, args), wait);
                };
            },
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
    }
    
    createBasicCommandProcessor() {
        return {
            async processCommand(command) {
                const cmd = command.toLowerCase().trim();
                
                if (cmd.includes('scroll down')) {
                    window.scrollBy(0, 300);
                    return { success: true, message: 'Scrolled down' };
                }
                if (cmd.includes('scroll up')) {
                    window.scrollBy(0, -300);
                    return { success: true, message: 'Scrolled up' };
                }
                if (cmd.includes('new tab')) {
                    window.open('', '_blank');
                    return { success: true, message: 'Opened new tab' };
                }
                if (cmd.includes('refresh') || cmd.includes('reload')) {
                    window.location.reload();
                    return { success: true, message: 'Page refreshed' };
                }
                
                return { success: false, error: 'Command not recognized' };
            }
        };
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
        console.log('Setting up speech engine...');
        
        // Check if enhanced speech engine is available
        if (window.GoofySpeechEngine) {
            try {
                console.log('Using enhanced speech engine');
                this.speechEngine = new window.GoofySpeechEngine();
                
                // Listen to speech events if available
                if (this.speechEngine.on) {
                    this.speechEngine.on('start', () => this.handleSpeechEvent('start', {}));
                    this.speechEngine.on('result', (data) => this.handleSpeechEvent('result', data));
                    this.speechEngine.on('error', (data) => this.handleSpeechEvent('error', data));
                    this.speechEngine.on('end', () => this.handleSpeechEvent('end', {}));
                } else if (this.speechEngine.addListener) {
                    this.speechEngine.addListener((event, data) => {
                        this.handleSpeechEvent(event, data);
                    });
                }
                
                console.log('Enhanced speech engine initialized');
            } catch (error) {
                console.error('Failed to initialize enhanced speech engine:', error);
                this.setupBasicSpeechRecognition();
            }
        } else {
            console.log('Enhanced speech engine not available, using basic recognition');
            this.setupBasicSpeechRecognition();
        }
    }
    
    testSpeechAvailability() {
        console.log('Testing speech recognition availability...');
        
        // Test basic browser support
        const hasWebSpeech = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        console.log('Browser speech support:', hasWebSpeech);
        
        if (!hasWebSpeech) {
            console.error('Browser does not support speech recognition');
            return;
        }
        
        // Test microphone access
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    console.log('Microphone access granted');
                    stream.getTracks().forEach(track => track.stop());
                })
                .catch(error => {
                    console.error('Microphone access denied:', error);
                });
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
        if (this.overlay) {
            this.overlay.remove();
        }
        
        this.overlay = document.createElement('div');
        this.overlay.id = 'goofy-overlay';
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
            max-width: 300px;
        `;
        
        this.overlay.innerHTML = `
            <div class="goofy-controls">
                <div style="margin-bottom: 12px; font-weight: bold; text-align: center;">
                    🎭 Goofy Assistant
                </div>
                <button id="goofy-listen-btn" class="goofy-btn" style="width: 100%; margin-bottom: 10px; padding: 10px; border: none; border-radius: 6px; background: #4CAF50; color: white; cursor: pointer;">🎤 Listen</button>
                <input type="text" id="goofy-text-command" placeholder="Type command..." style="width: calc(100% - 60px); padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 8px;">
                <button id="goofy-execute-text" style="width: 50px; padding: 8px; border: none; border-radius: 4px; background: #2196F3; color: white; cursor: pointer;">Go</button>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-top: 8px;">
                    <button class="goofy-quick" data-cmd="scroll down" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; background: white; color: black; font-size: 11px; cursor: pointer;">↓ Down</button>
                    <button class="goofy-quick" data-cmd="scroll up" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; background: white; color: black; font-size: 11px; cursor: pointer;">↑ Up</button>
                    <button class="goofy-quick" data-cmd="new tab" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; background: white; color: black; font-size: 11px; cursor: pointer;">+ Tab</button>
                    <button class="goofy-quick" data-cmd="refresh page" style="padding: 6px; border: 1px solid #ddd; border-radius: 4px; background: white; color: black; font-size: 11px; cursor: pointer;">🔄 Refresh</button>
                </div>
                <button id="goofy-close-btn" class="goofy-btn" style="width: 100%; margin-top: 10px; padding: 8px; border: none; border-radius: 6px; background: #f44336; color: white; cursor: pointer;">✕ Close</button>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        
        // Add event listeners
        this.addOverlayEventListeners();
    }
    
    addOverlayEventListeners() {
        const listenBtn = document.getElementById('goofy-listen-btn');
        const closeBtn = document.getElementById('goofy-close-btn');
        const textInput = document.getElementById('goofy-text-command');
        const executeBtn = document.getElementById('goofy-execute-text');
        const quickButtons = document.querySelectorAll('.goofy-quick');
        
        if (listenBtn) {
            listenBtn.addEventListener('click', () => {
                this.toggleListening();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.deactivate();
            });
        }
        
        const executeCommand = () => {
            const command = textInput?.value?.trim();
            if (command) {
                this.processVoiceCommand(command);
                textInput.value = '';
            }
        };
        
        if (executeBtn) {
            executeBtn.addEventListener('click', executeCommand);
        }
        
        if (textInput) {
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') executeCommand();
            });
        }
        
        quickButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.dataset.cmd;
                if (command) {
                    this.processVoiceCommand(command);
                }
            });
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

    updateAvatar(state) {
        if (!this.avatar) return;
        
        const statusElement = this.avatar.querySelector('.avatar-status');
        if (!statusElement) return;
        
        // Remove existing state classes
        this.avatar.className = this.avatar.className.replace(/\b(listening|speaking|thinking)\b/g, '');
        
        switch (state) {
            case 'listening':
                this.avatar.classList.add('listening');
                statusElement.textContent = 'Listening...';
                break;
            case 'speaking':
                this.avatar.classList.add('speaking');
                statusElement.textContent = 'Speaking...';
                break;
            case 'thinking':
                this.avatar.classList.add('thinking');
                statusElement.textContent = 'Processing...';
                break;
            default:
                statusElement.textContent = 'Ready';
        }
    }
    
    updateListenButton(text) {
        const listenBtn = document.getElementById('goofy-listen-btn');
        if (listenBtn) {
            listenBtn.textContent = text;
        }
    }
    
    speak(text) {
        if (this.speechSynthesis && text) {
            try {
                this.updateAvatar('speaking');
                
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.rate = 1.0;
                utterance.pitch = 1.2;
                utterance.volume = 0.8;
                
                utterance.onend = () => {
                    this.updateAvatar('idle');
                };
                
                utterance.onerror = (error) => {
                    console.error('Speech synthesis error:', error);
                    this.updateAvatar('idle');
                };
                
                this.speechSynthesis.speak(utterance);
            } catch (error) {
                console.error('Failed to speak:', error);
                this.updateAvatar('idle');
            }
        }
    }
    
    setupBasicSpeechRecognition() {
        console.log('Setting up basic speech recognition...');
        
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            
            if (!SpeechRecognition) {
                console.error('Speech recognition not supported in this browser');
                this.speak('Voice recognition is not supported in this browser. Please use text input.');
                return false;
            }
            
            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = 'en-US';
            
            this.speechRecognition.onstart = () => {
                console.log('Speech recognition started');
                this.isListening = true;
                this.updateAvatar('listening');
                this.updateListenButton('🛑 Stop');
            };
            
            this.speechRecognition.onresult = (event) => {
                if (event.results.length > 0) {
                    const transcript = event.results[0][0].transcript;
                    console.log('Speech result:', transcript);
                    this.processVoiceCommand(transcript);
                }
            };
            
            this.speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                
                switch (event.error) {
                    case 'network':
                        this.speak('Network error. Please check your internet connection or use text input.');
                        this.showTextInput();
                        break;
                    case 'not-allowed':
                        this.speak('Microphone access denied. Please allow microphone access.');
                        break;
                    case 'no-speech':
                        this.speak('No speech detected. Please try again.');
                        break;
                    default:
                        this.speak('Speech recognition error. Please use text input.');
                        this.showTextInput();
                }
                
                this.isListening = false;
                this.updateAvatar('idle');
                this.updateListenButton('🎤 Listen');
            };
            
            this.speechRecognition.onend = () => {
                console.log('Speech recognition ended');
                this.isListening = false;
                this.updateAvatar('idle');
                this.updateListenButton('🎤 Listen');
            };
            
            return true;
        } catch (error) {
            console.error('Failed to setup speech recognition:', error);
            this.speak('Voice recognition setup failed. Please use text input.');
            return false;
        }
    }
    
    async processVoiceCommand(command) {
        if (!command || !command.trim()) {
            this.speak('I didn\'t hear anything. Please try again.');
            return;
        }
        
        console.log('Processing voice command:', command);
        this.updateAvatar('thinking');
        
        try {
            const result = await this.commandProcessor.processCommand(command);
            
            if (result.success) {
                this.speak(result.message || 'Command executed successfully');
            } else {
                this.speak(result.error || 'I couldn\'t understand that command. Please try again.');
            }
        } catch (error) {
            console.error('Error processing command:', error);
            this.speak('Sorry, I encountered an error processing that command.');
        } finally {
            this.updateAvatar('idle');
        }
    }
    
    injectAvatarStyles() {
        if (document.getElementById('goofy-avatar-styles')) return;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'goofy-avatar-styles';
        styleSheet.textContent = `
            #goofy-avatar.listening {
                animation: pulse 1s infinite;
                background: linear-gradient(45deg, #2196F3, #1976D2) !important;
            }
            
            #goofy-avatar.speaking .avatar-mouth {
                animation: speak 0.5s infinite alternate;
            }
            
            #goofy-avatar.thinking {
                background: linear-gradient(45deg, #ff9800, #f57c00) !important;
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
        `;
        
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
    
    highlightFallbackOptions() {
        console.log('Highlighting fallback options');
        // This could show visual hints about alternatives
    }
    
    showPermissionHelp() {
        console.log('Showing permission help');
        this.speak('Please allow microphone access in your browser settings.');
    }
    
    showTextInput() {
        // Show text input as fallback
        const textInput = document.getElementById('goofy-text-command');
        if (textInput) {
            textInput.focus();
            textInput.style.border = '2px solid #4CAF50';
            setTimeout(() => {
                textInput.style.border = '1px solid #ddd';
            }, 2000);
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
        
        if (this.speechEngine && this.speechEngine.startListening) {
            const success = this.speechEngine.startListening();
            if (success) {
                this.isListening = true;
                this.updateAvatar('listening');
                this.updateListenButton('🛑 Stop');
            }
        } else if (this.speechRecognition) {
            try {
                this.speechRecognition.start();
                this.isListening = true;
                this.updateAvatar('listening');
                this.updateListenButton('🛑 Stop');
            } catch (error) {
                console.error('Failed to start basic speech recognition:', error);
                this.speak('Voice recognition failed. Please use text input.');
                this.showTextInput();
            }
        } else {
            console.log('No speech recognition available');
            this.speak('Voice recognition not available. Please use text input.');
            this.showTextInput();
        }
    }
    
    stopListening() {
        this.isListening = false;
        this.updateAvatar('idle');
        this.updateListenButton('🎤 Listen');
        
        if (this.speechEngine && this.speechEngine.stopListening) {
            this.speechEngine.stopListening();
        } else if (this.speechRecognition) {
            this.speechRecognition.stop();
        }
    }
    
    getCurrentTabId() {
        return Promise.resolve(null); // Simplified for now
    }

    // Cleanup method
    cleanup() {
        if (this.isDestroyed) return;
        
        this.isDestroyed = true;
        this.stopListening();
        this.removeOverlay();
        this.removeAvatar();
        
        // Remove event listeners
        if (this.eventListeners) {
            this.eventListeners.forEach((listener, element) => {
                element.removeEventListener(listener.type, listener.handler);
            });
            this.eventListeners.clear();
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
