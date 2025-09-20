// Debug Speech Recognition Test
function debugSpeechRecognition() {
    console.log('=== SPEECH RECOGNITION DEBUG ===');
    
    // Check basic browser support
    const hasWebkitSpeech = 'webkitSpeechRecognition' in window;
    const hasSpeech = 'SpeechRecognition' in window;
    const hasMediaDevices = 'mediaDevices' in navigator;
    const hasGetUserMedia = navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices;
    
    console.log('webkitSpeechRecognition support:', hasWebkitSpeech);
    console.log('SpeechRecognition support:', hasSpeech);
    console.log('MediaDevices support:', hasMediaDevices);
    console.log('getUserMedia support:', hasGetUserMedia);
    console.log('Browser:', navigator.userAgent);
    
    if (!hasWebkitSpeech && !hasSpeech) {
        console.error('❌ Browser does not support speech recognition');
        return false;
    }
    
    // Try to create speech recognition
    try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        console.log('✅ Speech recognition object created successfully');
        
        // Test microphone permission
        if (hasGetUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    console.log('✅ Microphone permission granted');
                    stream.getTracks().forEach(track => track.stop());
                    
                    // Try starting recognition
                    testSpeechRecognition(recognition);
                })
                .catch(error => {
                    console.error('❌ Microphone permission denied:', error);
                    console.log('🔧 Fix: Allow microphone access in browser settings');
                });
        } else {
            console.warn('⚠️ Cannot test microphone, trying speech recognition anyway...');
            testSpeechRecognition(recognition);
        }
        
    } catch (error) {
        console.error('❌ Failed to create speech recognition:', error);
        return false;
    }
    
    return true;
}

function testSpeechRecognition(recognition) {
    console.log('🧪 Testing speech recognition...');
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
        console.log('✅ Speech recognition started successfully');
        setTimeout(() => {
            recognition.stop();
            console.log('🛑 Stopping test after 3 seconds');
        }, 3000);
    };
    
    recognition.onresult = (event) => {
        console.log('✅ Speech result received:', event.results[0][0].transcript);
    };
    
    recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        
        switch(event.error) {
            case 'not-allowed':
                console.log('🔧 Fix: Allow microphone access');
                break;
            case 'network':
                console.log('🔧 Fix: Check internet connection or try again later');
                break;
            case 'no-speech':
                console.log('🔧 Fix: Speak clearly into the microphone');
                break;
            case 'audio-capture':
                console.log('🔧 Fix: Check microphone connection');
                break;
            default:
                console.log('🔧 Fix: Try reloading the page');
        }
    };
    
    recognition.onend = () => {
        console.log('🏁 Speech recognition test ended');
    };
    
    try {
        recognition.start();
        console.log('🎤 Speech recognition test started - try saying something...');
    } catch (error) {
        console.error('❌ Failed to start speech recognition test:', error);
    }
}

// Auto-run debug when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debugSpeechRecognition);
} else {
    debugSpeechRecognition();
}

// Make it globally available
window.debugSpeechRecognition = debugSpeechRecognition;