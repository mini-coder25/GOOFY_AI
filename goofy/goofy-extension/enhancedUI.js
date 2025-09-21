// Enhanced UI Components for Goofy Extension
class GoofyUIManager {
    constructor(contentScript) {
        this.contentScript = contentScript;
        this.activeElements = new Map();
        this.animations = new Map();
        this.theme = this.detectTheme();
    }
    
    detectTheme() {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches ||
                      document.documentElement.classList.contains('dark') ||
                      getComputedStyle(document.body).backgroundColor === 'rgb(0, 0, 0)';
        
        return {
            isDark,
            colors: isDark ? {
                background: '#1f2937',
                surface: '#374151',
                primary: '#3b82f6',
                text: '#f9fafb',
                border: '#4b5563'
            } : {
                background: '#ffffff',
                surface: '#f9fafb',
                primary: '#3b82f6',
                text: '#111827',
                border: '#e5e7eb'
            }
        };
    }
    
    createEnhancedOverlay() {
        const overlay = GoofyUtils.createStyledElement('div', {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: String(GoofyConfig.UI_SETTINGS.Z_INDEX_BASE + 10),
            background: this.theme.colors.surface,
            borderRadius: '12px',
            padding: '16px',
            color: this.theme.colors.text,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            border: `1px solid ${this.theme.colors.border}`,
            backdropFilter: 'blur(10px)',
            maxWidth: '320px',
            transition: 'all 0.3s ease'
        });
        
        overlay.innerHTML = `
            <div class="goofy-header" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div class="goofy-avatar-mini" style="width: 32px; height: 32px; background: linear-gradient(45deg, #4CAF50, #45a049); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                    🎭
                </div>
                <div>
                    <div style="font-weight: 600; font-size: 14px;">Goofy Assistant</div>
                    <div id="goofy-status" style="font-size: 12px; opacity: 0.7;">Ready</div>
                </div>
                <button id="goofy-close" style="margin-left: auto; background: none; border: none; font-size: 18px; cursor: pointer; color: ${this.theme.colors.text}; opacity: 0.7;">×</button>
            </div>
            
            <div class="goofy-controls" style="display: flex; flex-direction: column; gap: 12px;">
                <button id="goofy-listen-btn" class="goofy-btn-primary" style="width: 100%; padding: 12px; border: none; border-radius: 8px; background: ${this.theme.colors.primary}; color: white; font-weight: 500; cursor: pointer; transition: all 0.2s;">
                    🎤 Start Listening
                </button>
                
                <div id="goofy-manual-input" style="display: flex; gap: 8px;">
                    <input type="text" id="goofy-command-input" placeholder="Type command..." style="flex: 1; padding: 8px 12px; border: 1px solid ${this.theme.colors.border}; border-radius: 6px; background: ${this.theme.colors.background}; color: ${this.theme.colors.text}; font-size: 14px;">
                    <button id="goofy-execute" style="padding: 8px 12px; border: none; border-radius: 6px; background: #10b981; color: white; cursor: pointer; font-weight: 500;">Go</button>
                </div>
                
                <div id="goofy-quick-commands" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
                    <button class="goofy-quick-cmd" data-cmd="scroll down" style="padding: 8px; border: 1px solid ${this.theme.colors.border}; border-radius: 6px; background: ${this.theme.colors.background}; color: ${this.theme.colors.text}; font-size: 12px; cursor: pointer;">↓ Down</button>
                    <button class="goofy-quick-cmd" data-cmd="scroll up" style="padding: 8px; border: 1px solid ${this.theme.colors.border}; border-radius: 6px; background: ${this.theme.colors.background}; color: ${this.theme.colors.text}; font-size: 12px; cursor: pointer;">↑ Up</button>
                    <button class="goofy-quick-cmd" data-cmd="new tab" style="padding: 8px; border: 1px solid ${this.theme.colors.border}; border-radius: 6px; background: ${this.theme.colors.background}; color: ${this.theme.colors.text}; font-size: 12px; cursor: pointer;">+ Tab</button>
                    <button class="goofy-quick-cmd" data-cmd="refresh page" style="padding: 8px; border: 1px solid ${this.theme.colors.border}; border-radius: 6px; background: ${this.theme.colors.background}; color: ${this.theme.colors.text}; font-size: 12px; cursor: pointer;">🔄 Refresh</button>
                </div>
                
                <div id="goofy-suggestions" style="display: none; margin-top: 8px; padding: 8px; background: rgba(59, 130, 246, 0.1); border-radius: 6px; border-left: 3px solid ${this.theme.colors.primary};">
                    <div style="font-size: 12px; font-weight: 500; margin-bottom: 4px;">💡 Try these commands:</div>
                    <div id="goofy-suggestion-list" style="font-size: 11px; opacity: 0.8;"></div>
                </div>
            </div>
        `;
        
        this.addOverlayEventListeners(overlay);
        return overlay;
    }
    
    addOverlayEventListeners(overlay) {
        // Close button
        overlay.querySelector('#goofy-close').addEventListener('click', () => {
            this.contentScript.deactivate();
        });
        
        // Listen button
        const listenBtn = overlay.querySelector('#goofy-listen-btn');
        listenBtn.addEventListener('click', () => {
            this.contentScript.toggleListening();
        });
        
        // Manual input
        const commandInput = overlay.querySelector('#goofy-command-input');
        const executeBtn = overlay.querySelector('#goofy-execute');
        
        const executeCommand = () => {
            const command = commandInput.value.trim();
            if (command) {
                this.contentScript.processVoiceCommand(command);
                commandInput.value = '';
            }
        };
        
        executeBtn.addEventListener('click', executeCommand);
        commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') executeCommand();
        });
        
        // Quick commands
        overlay.querySelectorAll('.goofy-quick-cmd').forEach(btn => {
            btn.addEventListener('click', () => {
                const command = btn.dataset.cmd;
                this.contentScript.processVoiceCommand(command);
            });
        });
        
        // Add hover effects
        this.addHoverEffects(overlay);
    }
    
    addHoverEffects(overlay) {
        overlay.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-1px)';
                btn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            });
        });
    }
    
    createEnhancedAvatar() {
        const avatar = GoofyUtils.createStyledElement('div', {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: String(GoofyConfig.UI_SETTINGS.Z_INDEX_BASE + 5),
            width: '80px',
            height: '80px',
            background: 'linear-gradient(45deg, #4CAF50, #45a049)',
            borderRadius: '50%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '3px solid rgba(255, 255, 255, 0.2)'
        });
        
        avatar.innerHTML = `
            <div class=\"avatar-face\" style=\"position: relative; width: 60px; height: 60px;\">
                <div class=\"avatar-eyes\" style=\"display: flex; justify-content: space-between; margin-top: 18px; width: 20px; margin-left: auto; margin-right: auto;\">
                    <div class=\"eye left-eye\" style=\"width: 6px; height: 6px; background: white; border-radius: 50%; animation: blink 3s infinite;\"></div>
                    <div class=\"eye right-eye\" style=\"width: 6px; height: 6px; background: white; border-radius: 50%; animation: blink 3s infinite 0.1s;\"></div>
                </div>
                <div class=\"avatar-mouth\" style=\"width: 16px; height: 8px; background: white; border-radius: 0 0 16px 16px; margin: 8px auto 0; transition: all 0.3s ease;\"></div>
            </div>
            <div class=\"avatar-status\" style=\"font-size: 9px; color: white; margin-top: 6px; text-align: center; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.2);\">Ready</div>
        `;
        
        // Add click handler
        avatar.addEventListener('click', () => {
            this.contentScript.toggleListening();
        });
        
        // Add CSS animations
        this.injectAvatarStyles();
        
        return avatar;
    }
    
    injectAvatarStyles() {
        if (document.getElementById('goofy-avatar-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'goofy-avatar-styles';
        styles.textContent = `
            @keyframes blink {
                0%, 90%, 100% { transform: scaleY(1); }
                95% { transform: scaleY(0.1); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3); }
                50% { transform: scale(1.05); box-shadow: 0 12px 35px rgba(76, 175, 80, 0.5); }
                100% { transform: scale(1); box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3); }
            }
            
            @keyframes speak {
                0% { height: 8px; }
                50% { height: 12px; }
                100% { height: 8px; }
            }
            
            .goofy-avatar.listening {
                animation: pulse 1.5s infinite;
                background: linear-gradient(45deg, #2196F3, #1976D2) !important;
            }
            
            .goofy-avatar.speaking .avatar-mouth {
                animation: speak 0.6s infinite;
            }
            
            .goofy-avatar.thinking {
                background: linear-gradient(45deg, #ff9800, #f57c00) !important;
            }
            
            .goofy-btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
            }
        `;
        
        document.head.appendChild(styles);
    }
    
    updateAvatarState(state) {
        if (!this.contentScript.avatar) return;
        
        const avatar = this.contentScript.avatar;
        const statusElement = avatar.querySelector('.avatar-status');
        
        // Remove all state classes
        avatar.className = avatar.className.replace(/\\b(listening|speaking|thinking)\\b/g, '');
        
        switch (state) {
            case 'listening':
                avatar.classList.add('listening');
                statusElement.textContent = 'Listening...';
                break;
            case 'speaking':
                avatar.classList.add('speaking');
                statusElement.textContent = 'Speaking...';
                break;
            case 'thinking':
                avatar.classList.add('thinking');
                statusElement.textContent = 'Processing...';
                break;
            default:
                statusElement.textContent = 'Ready';
        }
    }
    
    showSuggestions(suggestions) {
        const suggestionsDiv = document.getElementById('goofy-suggestions');
        const suggestionsList = document.getElementById('goofy-suggestion-list');
        
        if (suggestionsDiv && suggestionsList && suggestions.length > 0) {
            suggestionsList.innerHTML = suggestions.map(cmd => `• ${cmd}`).join('<br>');
            suggestionsDiv.style.display = 'block';
            
            // Auto-hide after a few seconds
            setTimeout(() => {
                suggestionsDiv.style.display = 'none';
            }, 5000);
        }
    }
    
    updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('goofy-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.color = {
                'success': '#10b981',
                'error': '#ef4444',
                'warning': '#f59e0b',
                'info': this.theme.colors.text
            }[type] || this.theme.colors.text;
        }
    }
    
    showToast(message, type = 'info', duration = 3000) {
        const toast = GoofyUtils.createStyledElement('div', {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: String(GoofyConfig.UI_SETTINGS.Z_INDEX_BASE + 20),
            background: {
                'success': '#10b981',
                'error': '#ef4444',
                'warning': '#f59e0b',
                'info': '#3b82f6'
            }[type] || '#3b82f6',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            fontFamily: '-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            opacity: '0',
            transition: 'all 0.3s ease'
        }, message);
        
        document.body.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        
        // Animate out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
    
    cleanup() {
        // Clean up any active elements
        this.activeElements.forEach((element, id) => {
            if (element.parentNode) {
                element.remove();
            }
        });
        this.activeElements.clear();
        
        // Clear animations
        this.animations.forEach(animation => {
            if (animation.cancel) animation.cancel();
        });
        this.animations.clear();
    }
}

// Make available globally
window.GoofyUIManager = GoofyUIManager;