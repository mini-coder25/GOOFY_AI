// Simple popup for Chrome Extension without React modules
document.addEventListener('DOMContentLoaded', function() {
    const root = document.getElementById('root');
    
    // Simple HTML structure for the popup
    root.innerHTML = `
        <div style="width: 380px; min-height: 500px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <!-- Header -->
            <div style="padding: 20px; text-align: center; color: white;">
                <div style="width: 60px; height: 60px; margin: 0 auto 16px; background: #4CAF50; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    🎭
                </div>
                <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: bold;">Goofy Assistant</h1>
                <p style="margin: 0; opacity: 0.9; font-size: 14px;">AI Voice Browser Assistant</p>
            </div>
            
            <!-- Main Controls -->
            <div style="background: white; margin: 0 20px; border-radius: 12px; padding: 20px;">
                <div id="status-indicator" style="padding: 12px; border-radius: 8px; margin-bottom: 16px; background: #f3f4f6; text-align: center;">
                    <span style="color: #6b7280; font-size: 14px;">Click Activate to start</span>
                </div>
                
                <button id="toggle-btn" style="width: 100%; padding: 16px; border: none; border-radius: 8px; background: #4CAF50; color: white; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.3s;">
                    Activate Goofy
                </button>
                
                <div id="voice-controls" style="display: none; margin-top: 16px;">
                    <button id="voice-btn" style="width: 100%; padding: 16px; border: none; border-radius: 8px; background: #2196F3; color: white; font-size: 14px; font-weight: bold; cursor: pointer; margin-bottom: 12px;">
                        🎤 Start Listening
                    </button>
                    
                    <div style="margin-bottom: 12px;">
                        <input type="text" id="manual-command" placeholder="Type command manually..." style="width: calc(100% - 80px); padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 12px;">
                        <button id="execute-manual" style="width: 70px; padding: 8px; border: none; border-radius: 6px; background: #4CAF50; color: white; font-size: 12px; cursor: pointer; margin-left: 4px;">Execute</button>
                    </div>
                    
                    <div style="font-size: 12px; color: #6b7280; margin-bottom: 16px;">
                        <strong>Quick Commands:</strong>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <button class="quick-cmd" data-cmd="scroll down" style="padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; font-size: 12px; cursor: pointer;">
                            Scroll Down
                        </button>
                        <button class="quick-cmd" data-cmd="scroll up" style="padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; font-size: 12px; cursor: pointer;">
                            Scroll Up
                        </button>
                        <button class="quick-cmd" data-cmd="new tab" style="padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; font-size: 12px; cursor: pointer;">
                            New Tab
                        </button>
                        <button class="quick-cmd" data-cmd="close tab" style="padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; background: white; font-size: 12px; cursor: pointer;">
                            Close Tab
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="padding: 16px; text-align: center;">
                <div style="color: white; font-size: 12px; opacity: 0.8;">
                    Press Ctrl+Shift+G on any page to toggle
                </div>
            </div>
        </div>
    `;
    
    // Get references to elements
    const toggleBtn = document.getElementById('toggle-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceControls = document.getElementById('voice-controls');
    const statusIndicator = document.getElementById('status-indicator');
    const quickCmdButtons = document.querySelectorAll('.quick-cmd');
    
    let isActive = false;
    let isListening = false;
    let currentTab = null;
    
    // Get current tab info
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            currentTab = tabs[0];
            updateStatusIndicator('Ready');
        }
    });
    
    // Toggle Goofy activation
    toggleBtn.addEventListener('click', async function() {
        try {
            if (isActive) {
                // Deactivate
                await chrome.runtime.sendMessage({
                    action: 'deactivateGoofy',
                    tabId: currentTab?.id
                });
                setActiveState(false);
                updateStatusIndicator('Deactivated');
            } else {
                // Activate
                await chrome.runtime.sendMessage({
                    action: 'activateGoofy',
                    tabId: currentTab?.id
                });
                setActiveState(true);
                updateStatusIndicator('Activated');
            }
        } catch (error) {
            console.error('Toggle failed:', error);
            updateStatusIndicator('Error: ' + error.message);
        }
    });
    
    // Voice control button
    voiceBtn.addEventListener('click', function() {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    });
    
    // Quick command buttons
    quickCmdButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const command = this.dataset.cmd;
            await executeCommand(command);
        });
    });
    
    // Manual command input
    const manualCommandInput = document.getElementById('manual-command');
    const executeManualBtn = document.getElementById('execute-manual');
    
    if (executeManualBtn) {
        executeManualBtn.addEventListener('click', async function() {
            const command = manualCommandInput.value.trim();
            if (command) {
                await executeCommand(command);
                manualCommandInput.value = '';
            }
        });
    }
    
    if (manualCommandInput) {
        manualCommandInput.addEventListener('keypress', async function(e) {
            if (e.key === 'Enter') {
                const command = this.value.trim();
                if (command) {
                    await executeCommand(command);
                    this.value = '';
                }
            }
        });
    }
    
    function setActiveState(active) {
        isActive = active;
        toggleBtn.textContent = active ? 'Deactivate Goofy' : 'Activate Goofy';
        toggleBtn.style.background = active ? '#f44336' : '#4CAF50';
        voiceControls.style.display = active ? 'block' : 'none';
    }
    
    function updateStatusIndicator(status) {
        const colors = {
            'Ready': '#10b981',
            'Activated': '#10b981',
            'Deactivated': '#6b7280',
            'Listening': '#2196F3',
            'Processing': '#ff9800'
        };
        
        statusIndicator.innerHTML = `<span style="color: ${colors[status] || '#ef4444'};">${status}</span>`;
    }
    
    function startListening() {
        console.log('Starting voice recognition from popup...');
        
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            updateStatusIndicator('Speech not supported');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.maxAlternatives = 1;
        
        recognition.onstart = function() {
            console.log('Voice recognition started from popup');
            isListening = true;
            voiceBtn.textContent = '🛑 Stop Listening';
            voiceBtn.style.background = '#f44336';
            updateStatusIndicator('Listening');
        };
        
        recognition.onresult = function(event) {
            console.log('Voice recognition result:', event);
            const transcript = event.results[0][0].transcript;
            console.log('Transcript received:', transcript);
            executeCommand(transcript);
            stopListening();
        };
        
        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            stopListening();
            
            switch(event.error) {
                case 'not-allowed':
                    updateStatusIndicator('Microphone access denied');
                    break;
                case 'no-speech':
                    updateStatusIndicator('No speech detected');
                    break;
                case 'network':
                    updateStatusIndicator('Network error - Use buttons below');
                    console.log('Speech recognition network error - this is common and normal');
                    break;
                case 'audio-capture':
                    updateStatusIndicator('No microphone found');
                    break;
                case 'service-not-allowed':
                    updateStatusIndicator('Speech service not allowed');
                    break;
                default:
                    updateStatusIndicator('Voice Error: ' + event.error);
            }
        };
        
        recognition.onend = function() {
            console.log('Voice recognition ended');
            stopListening();
        };
        
        try {
            recognition.start();
        } catch (error) {
            console.error('Failed to start recognition:', error);
            updateStatusIndicator('Failed to start');
        }
    }
    
    function stopListening() {
        isListening = false;
        voiceBtn.textContent = '🎤 Start Listening';
        voiceBtn.style.background = '#2196F3';
        updateStatusIndicator('Ready');
    }
    
    async function executeCommand(command) {
        try {
            updateStatusIndicator('Processing');
            
            const response = await chrome.runtime.sendMessage({
                action: 'executeCommand',
                command: command,
                tabId: currentTab?.id
            });
            
            if (response && response.success) {
                updateStatusIndicator('Command executed');
                setTimeout(() => updateStatusIndicator('Ready'), 2000);
            } else {
                updateStatusIndicator('Command failed');
                setTimeout(() => updateStatusIndicator('Ready'), 2000);
            }
        } catch (error) {
            console.error('Command execution failed:', error);
            updateStatusIndicator('Error');
            setTimeout(() => updateStatusIndicator('Ready'), 2000);
        }
    }
    
    // Initialize with correct state
    updateStatusIndicator('Ready');
});