// Enhanced Goofy Speech Recognition Engine
class GoofySpeechEngine extends GoofyEventEmitter {
    constructor(options = {}) {
        super();
        this.recognition = null;
        this.isListening = false;
        this.retryCount = 0;
        this.maxRetries = options.maxRetries || GoofyConfig.SPEECH_SETTINGS.MAX_RETRIES;
        this.currentTimeout = null;
        this.isDestroyed = false;
        
        // Bind methods to preserve context
        this.handleStart = this.handleStart.bind(this);
        this.handleResult = this.handleResult.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
        
        this.setupSpeechRecognition();
    }

    setupSpeechRecognition() {
        if (!this.isSpeechSupported()) {
            console.warn('Speech recognition not supported');
            this.emit('error', {
                type: 'unsupported',
                message: GoofyConfig.ERROR_MESSAGES.BROWSER_UNSUPPORTED
            });
            return false;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();

            // Apply configuration
            const settings = GoofyConfig.SPEECH_SETTINGS;
            this.recognition.continuous = settings.CONTINUOUS;
            this.recognition.interimResults = settings.INTERIM_RESULTS;
            this.recognition.lang = settings.LANGUAGE;
            this.recognition.maxAlternatives = settings.MAX_ALTERNATIVES;
            
            this.setupEventHandlers();
            return true;
        } catch (error) {
            console.error('Failed to setup speech recognition:', error);
            this.emit('error', {
                type: 'setup-failed',
                message: 'Failed to initialize speech recognition'
            });
            return false;
        }
    }

    setupEventHandlers() {
        this.recognition.onstart = () => {
            console.log('🎤 Speech recognition started');
            this.isListening = true;
            this.retryCount = 0;
            this.notifyListeners('start', { status: 'listening' });
        };

        this.recognition.onresult = (event) => {
            console.log('🎯 Speech result received:', event);
            
            let finalTranscript = '';
            let confidence = 0;
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript = result[0].transcript.trim();
                    confidence = result[0].confidence || 0.5;
                    break;
                }
            }
            
            if (finalTranscript) {
                this.notifyListeners('result', { 
                    transcript: finalTranscript, 
                    confidence: confidence 
                });
            }
        };

        this.recognition.onerror = (event) => {
            console.error('🚨 Speech recognition error:', event.error);
            this.isListening = false;
            
            // Handle different error types with specific strategies
            switch (event.error) {
                case 'network':
                    this.handleNetworkError();
                    break;
                case 'not-allowed':
                    this.notifyListeners('error', { 
                        type: 'permission', 
                        message: 'Microphone permission denied. Please allow microphone access.' 
                    });
                    break;
                case 'no-speech':
                    this.handleNoSpeechError();
                    break;
                case 'audio-capture':
                    this.notifyListeners('error', { 
                        type: 'microphone', 
                        message: 'No microphone detected. Please check your microphone.' 
                    });
                    break;
                default:
                    this.handleGenericError(event.error);
            }
        };

        this.recognition.onend = () => {
            console.log('🔚 Speech recognition ended');
            this.isListening = false;
            this.notifyListeners('end', { status: 'idle' });
        };
    }

    handleNetworkError() {
        console.log('🌐 Handling network error...');
        
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`🔄 Retrying... (${this.retryCount}/${this.maxRetries})`);
            
            // Wait a bit before retrying
            setTimeout(() => {
                this.startListening();
            }, 1000 * this.retryCount); // Progressive delay
        } else {
            this.notifyListeners('error', { 
                type: 'network', 
                message: 'Voice recognition is temporarily unavailable. Use text commands instead.',
                showFallback: true
            });
        }
    }

    handleNoSpeechError() {
        this.notifyListeners('error', { 
            type: 'no-speech', 
            message: 'No speech detected. Please try speaking more clearly.',
            canRetry: true
        });
    }

    handleGenericError(errorType) {
        this.notifyListeners('error', { 
            type: 'generic', 
            message: `Speech error: ${errorType}. Please try again.`,
            canRetry: true
        });
    }

    // Public API
    startListening() {
        if (!this.recognition) {
            this.notifyListeners('error', { 
                type: 'unsupported', 
                message: 'Speech recognition not supported in this browser.',
                showFallback: true
            });
            return false;
        }

        if (this.isListening) {
            console.log('Already listening...');
            return false;
        }

        try {
            console.log('🎙️ Starting speech recognition...');
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            this.notifyListeners('error', { 
                type: 'start-failed', 
                message: 'Failed to start voice recognition. Please try again.' 
            });
            return false;
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            console.log('🛑 Stopping speech recognition...');
            this.recognition.stop();
        }
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in speech listener:', error);
            }
        });
    }

    isSpeechSupported() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    // Utility method to test microphone access
    async testMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            return true;
        } catch (error) {
            console.error('Microphone test failed:', error);
            return false;
        }
    }

    // Get detailed browser support info
    getSupportInfo() {
        return {
            speechRecognition: this.isSpeechSupported(),
            webkitSpeechRecognition: 'webkitSpeechRecognition' in window,
            mediaDevices: 'mediaDevices' in navigator,
            getUserMedia: 'getUserMedia' in navigator.mediaDevices || {},
            browser: this.detectBrowser()
        };
    }

    detectBrowser() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoofySpeechEngine;
} else {
    window.GoofySpeechEngine = GoofySpeechEngine;
}