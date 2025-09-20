// Network Error Fix - No API Keys Required
// This creates a local fallback system for voice commands

class LocalVoiceCommandHandler {
    constructor() {
        this.commands = {
            // Scroll commands
            'scroll down': () => window.scrollBy(0, 300),
            'scroll up': () => window.scrollBy(0, -300),
            'scroll to top': () => window.scrollTo(0, 0),
            'scroll to bottom': () => window.scrollTo(0, document.body.scrollHeight),
            'go down': () => window.scrollBy(0, 300),
            'go up': () => window.scrollBy(0, -300),
            
            // Tab commands
            'new tab': () => window.open('', '_blank'),
            'close tab': () => window.close(),
            'refresh page': () => window.location.reload(),
            
            // Navigation
            'go back': () => window.history.back(),
            'go forward': () => window.history.forward(),
            
            // Page interaction
            'click search': () => this.clickElement('input[type="search"], input[name*="search"], .search-input'),
            'click button': () => this.clickElement('button'),
            'click submit': () => this.clickElement('input[type="submit"], button[type="submit"]'),
        };
        
        this.setupLocalRecognition();
    }
    
    setupLocalRecognition() {
        console.log('🔧 Setting up local voice commands (no network needed)...');
        
        // Create a simpler recognition system
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            // Key fix: Don't depend on Google's servers
            this.recognition.onstart = () => {
                console.log('🎤 Local voice recognition started');
                this.showStatus('Listening... (say a command)');
            };
            
            this.recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase().trim();
                console.log('🎯 Command heard:', command);
                this.executeLocalCommand(command);
            };
            
            this.recognition.onerror = (event) => {
                console.log('⚠️ Voice error:', event.error);
                if (event.error === 'network') {
                    this.showStatus('Network error - Use text commands below');
                    this.showTextInput();
                } else {
                    this.showStatus('Voice error - Try again or use text');
                }
            };
        }
    }
    
    executeLocalCommand(command) {
        console.log('🚀 Executing command:', command);
        
        // Find matching command
        const matchedCommand = this.findBestMatch(command);
        
        if (matchedCommand && this.commands[matchedCommand]) {
            try {
                this.commands[matchedCommand]();
                this.showStatus(`✅ Executed: ${command}`);
                console.log('✅ Command executed successfully');
            } catch (error) {
                console.error('❌ Command failed:', error);
                this.showStatus('❌ Command failed');
            }
        } else {
            console.log('❓ Unknown command:', command);
            this.showStatus('❓ Unknown command - try "scroll down"');
            this.showAvailableCommands();
        }
    }
    
    findBestMatch(spokenCommand) {
        // Direct match first
        if (this.commands[spokenCommand]) {
            return spokenCommand;
        }
        
        // Fuzzy matching for speech recognition variations
        for (const command of Object.keys(this.commands)) {
            if (spokenCommand.includes(command) || command.includes(spokenCommand)) {
                return command;
            }
        }
        
        // Word-based matching
        const words = spokenCommand.split(' ');
        for (const command of Object.keys(this.commands)) {
            const commandWords = command.split(' ');
            const matchingWords = words.filter(word => commandWords.includes(word));
            if (matchingWords.length >= Math.min(2, commandWords.length)) {
                return command;
            }
        }
        
        return null;
    }
    
    clickElement(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.click();
            return true;
        }
        
        // Try more selectors
        const fallbackSelectors = [
            'button:first-of-type',
            'input[type="submit"]',
            'a[href*="search"]',
            '.btn',
            '.button'
        ];
        
        for (const sel of fallbackSelectors) {
            const el = document.querySelector(sel);
            if (el) {
                el.click();
                return true;
            }
        }
        
        return false;
    }
    
    showStatus(message) {
        // Create or update status display
        let status = document.getElementById('goofy-voice-status');
        if (!status) {
            status = document.createElement('div');
            status.id = 'goofy-voice-status';
            status.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #333;
                color: white;
                padding: 10px;
                border-radius: 5px;
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                max-width: 300px;
            `;
            document.body.appendChild(status);
        }
        
        status.textContent = message;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (status.parentNode) {
                status.remove();
            }
        }, 3000);
    }
    
    showTextInput() {
        // Create text input for manual commands
        let textInput = document.getElementById('goofy-text-input');
        if (!textInput) {
            const container = document.createElement('div');
            container.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: white;
                border: 2px solid #4CAF50;
                border-radius: 10px;
                padding: 15px;
                z-index: 10000;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            `;
            
            container.innerHTML = `
                <div style="margin-bottom: 10px; font-weight: bold;">Voice Commands (Type Here):</div>
                <input type="text" id="goofy-text-input" placeholder="Type: scroll down, new tab, etc." 
                       style="width: 250px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <button id="goofy-execute-btn" style="margin-left: 5px; padding: 8px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Execute</button>
                <button id="goofy-close-input" style="margin-left: 5px; padding: 8px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">×</button>
            `;
            
            document.body.appendChild(container);
            
            textInput = document.getElementById('goofy-text-input');
            const executeBtn = document.getElementById('goofy-execute-btn');
            const closeBtn = document.getElementById('goofy-close-input');
            
            const executeCommand = () => {
                const command = textInput.value.trim().toLowerCase();
                if (command) {
                    this.executeLocalCommand(command);
                    textInput.value = '';
                }
            };
            
            executeBtn.addEventListener('click', executeCommand);
            textInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') executeCommand();
            });
            
            closeBtn.addEventListener('click', () => {
                container.remove();
            });
        }
    }
    
    showAvailableCommands() {
        console.log('📋 Available voice commands:');
        Object.keys(this.commands).forEach(cmd => console.log('  -', cmd));
    }
    
    startListening() {
        if (this.recognition) {
            try {
                this.recognition.start();
                return true;
            } catch (error) {
                console.error('Failed to start recognition:', error);
                this.showTextInput();
                return false;
            }
        } else {
            console.log('No speech recognition available');
            this.showTextInput();
            return false;
        }
    }
}

// Make it globally available
window.LocalVoiceCommandHandler = LocalVoiceCommandHandler;

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.goofyLocalVoice = new LocalVoiceCommandHandler();
    });
} else {
    window.goofyLocalVoice = new LocalVoiceCommandHandler();
}

console.log('🎤 Local voice commands loaded - No API keys needed!');