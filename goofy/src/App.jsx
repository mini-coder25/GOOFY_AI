import React, { useState, useEffect, useRef, useCallback } from 'react';
import { browserAPI } from './browserAPI';
import { Player } from '@lottiefiles/react-lottie-player';

function App() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("Hi! I'm Goofy, your AI voice assistant. 🎉 Click the mic to start!");
  const [commandHistory, setCommandHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [apiStatus, setApiStatus] = useState('unknown');
  const recognitionRef = useRef(null);
  const isRecognitionActive = useRef(false);

  // Check browser support and initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      setFeedback('❌ Speech recognition not supported in this browser. Please use Chrome.');
      return;
    }

    // Initialize Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    const recognition = recognitionRef.current;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // Check API status on mount
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
      setApiStatus('missing');
      setFeedback('⚠️ Please set your Gemini API key in the .env file to get started!');
    } else {
      setApiStatus('ready');
      setFeedback("Hi! I'm Goofy, your AI voice assistant. 🎉 Click the mic to start!");
    }
  };

  const setupRecognitionHandlers = useCallback(() => {
    if (!recognitionRef.current) return;
    
    const recognition = recognitionRef.current;

    recognition.onresult = async (event) => {
    const newTranscript = event.results[0][0].transcript;
    
    // --- 🔍 DEBUGGING STEP 1: CHECK TRANSCRIPTION ---
    console.log("🎤 1. Raw Transcript:", newTranscript);
    console.log("🎤 1. Transcript Length:", newTranscript.length);
    console.log("🎤 1. Transcript Type:", typeof newTranscript);
    // ------------------------------------------------
    
    setTranscript(newTranscript);
    setIsListening(false);
    
    // Add to command history
    const newCommand = {
      id: Date.now(),
      command: newTranscript,
      timestamp: new Date().toLocaleTimeString(),
      status: 'processing'
    };
    setCommandHistory(prev => [newCommand, ...prev.slice(0, 4)]); // Keep last 5 commands
    
    // Process the voice command using the robust function
    await processVoiceCommand(newTranscript, newCommand);
  };

  // Robust voice command processing function
  const processVoiceCommand = async (transcript) => {
    console.log("🚀 Starting processVoiceCommand with:", transcript);
    
    try {
      // VISUAL FEEDBACK: Let the user know you're thinking
      setFeedback("🤔 Thinking...");
      setIsProcessing(true);

      // STEP 1: Get Gemini's structured response
      console.log("🧠 Step 1: Calling Gemini API...");
      const geminiData = await getGeminiResponse(transcript);
      
      // VALIDATION: Check if the response is valid
      if (!geminiData) {
        throw new Error("No response from Gemini API.");
      }
      
      if (!geminiData.actions) {
        console.warn("⚠️ No actions field in Gemini response, adding empty array");
        geminiData.actions = [];
      }
      
      if (!geminiData.response) {
        console.warn("⚠️ No response field in Gemini response, adding default");
        geminiData.response = "I heard you, but I'm not sure what to say!";
      }

      console.log("✅ Valid Gemini response received:", geminiData);

      // VISUAL FEEDBACK: Let the user know what's happening
      setFeedback(`🎭 ${geminiData.response}`);
      
      // STEP 2: Speak the response text
      console.log("🔊 Step 2: Speaking response...");
      speak(geminiData.response);

      // STEP 3: Execute actions
      if (geminiData.actions && geminiData.actions.length > 0) {
        console.log("⚡ Step 3: Executing actions...");
        await executeActions(geminiData.actions);
      } else {
        console.log("💬 Step 3: No actions to execute, just conversation.");
      }

    } catch (error) {
      console.error("❌ Failed to process command:", error);
      const errorMessage = `Uh oh, I hit a snag: ${error.message}`;
      setFeedback(`❌ ${errorMessage}`);
      speak("Uh oh, I hit a snag. Could you try that again?");
    } finally {
      setIsProcessing(false);
    }
  };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      isRecognitionActive.current = false;
      
      let errorMessage = 'Speech recognition error. Try again!';
      switch (event.error) {
        case 'no-speech':
          errorMessage = '🔇 No speech detected. Try speaking louder!';
          break;
        case 'audio-capture':
          errorMessage = '🎤 Microphone not accessible. Check permissions!';
          break;
        case 'not-allowed':
          errorMessage = '🚫 Microphone permission denied. Please allow access!';
          break;
        case 'network':
          errorMessage = '🌐 Network error. Check your internet connection!';
          break;
        default:
          errorMessage = `❌ Recognition error: ${event.error}`;
      }
      
      setFeedback(errorMessage);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onstart = () => {
      isRecognitionActive.current = true;
      setFeedback('🎤 Listening... Speak clearly!');
    };

    recognition.onend = () => {
      isRecognitionActive.current = false;
      if (isListening && !isProcessing) {
        setFeedback('🔄 Recognition ended. Click mic to try again!');
      }
      setIsListening(false);
    };
  }, [isListening, isProcessing]);

  useEffect(() => {
    setupRecognitionHandlers();
  }, [setupRecognitionHandlers]);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
  };

  // Robust voice command processing function
  const processVoiceCommand = async (transcript, commandHistoryItem) => {
    console.log("🚀 Starting processVoiceCommand with:", transcript);
    
    try {
      // VISUAL FEEDBACK: Let the user know you're thinking
      setFeedback("🤔 Thinking...");
      setIsProcessing(true);

      // STEP 1: Get Gemini's structured response
      console.log("🧠 Step 1: Calling Gemini API...");
      const geminiData = await getGeminiResponse(transcript);
      
      // VALIDATION: Check if the response is valid
      if (!geminiData) {
        throw new Error("No response from Gemini API.");
      }
      
      if (!geminiData.actions) {
        console.warn("⚠️ No actions field in Gemini response, adding empty array");
        geminiData.actions = [];
      }
      
      if (!geminiData.response) {
        console.warn("⚠️ No response field in Gemini response, adding default");
        geminiData.response = "I heard you, but I'm not sure what to say!";
      }

      console.log("✅ Valid Gemini response received:", geminiData);

      // Update command history with success
      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === commandHistoryItem.id 
            ? { ...cmd, status: 'success', response: geminiData.response }
            : cmd
        )
      );

      // VISUAL FEEDBACK: Let the user know what's happening
      setFeedback(`🎭 ${geminiData.response}`);
      
      // STEP 2: Speak the response text
      console.log("🔊 Step 2: Speaking response...");
      speak(geminiData.response);

      // STEP 3: Execute actions
      if (geminiData.actions && geminiData.actions.length > 0) {
        console.log("⚡ Step 3: Executing actions...");
        await executeActions(geminiData.actions);
      } else {
        console.log("💬 Step 3: No actions to execute, just conversation.");
      }

    } catch (error) {
      console.error("❌ Failed to process command:", error);
      const errorMessage = error.message.includes('API key') 
        ? 'Please set your Gemini API key first!' 
        : 'Uh oh, I hit a snag. Could you try that again?';
      
      setFeedback(`❌ ${errorMessage}`);
      speak(errorMessage);
      
      // Update command history with error
      setCommandHistory(prev => 
        prev.map(cmd => 
          cmd.id === commandHistoryItem.id 
            ? { ...cmd, status: 'error', response: errorMessage }
            : cmd
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Gemini API function
  async function getGeminiResponse(transcript) {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
      throw new Error('Please set your Gemini API key in the .env file');
    }
    
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

    const systemPrompt = `You are Goofy, a playful AI browser assistant. 

CRITICAL INSTRUCTION: You MUST respond ONLY with a single, raw, valid JSON object and nothing else. Do not add explanations, comments, the word "json", or any text outside the JSON object.

Task: Convert user commands into JSON actions for a Chrome extension. Include a funny response.

Example Input: "Open YouTube and search cat videos"
Example Output:
{
  "actions": [
    { "type": "openTab", "target": "YouTube" },
    { "type": "search", "target": "YouTube", "query": "cat videos" }
  ],
  "response": "Opening YouTube and finding cats for you, boss!"
}

Available action types:
- openTab: Opens a new tab (target: website name)
- search: Searches on a website (target: website, query: search terms)  
- scroll: Scrolls page (direction: "up" or "down")
- copy: Copies selected text
- paste: Pastes clipboard content
- goBack: Navigate back
- goForward: Navigate forward
- refresh: Refresh page
- closeTab: Close current tab
- newTab: Create new blank tab

REMEMBER: Respond with ONLY the JSON object, no other text.`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nInput: "${transcript}"` }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    // --- 🧠 DEBUGGING STEP 2: CHECK GEMINI RESPONSE ---
    console.log("🧠 2. Full API Response:", data);
    
    const jsonString = data.candidates[0].content.parts[0].text;
    console.log("🧠 2. Raw Gemini Response Text:", jsonString);
    console.log("🧠 2. Response Length:", jsonString.length);
    console.log("🧠 2. First 100 chars:", jsonString.substring(0, 100));
    console.log("🧠 2. Last 100 chars:", jsonString.substring(Math.max(0, jsonString.length - 100)));
    // -------------------------------------------------------
    
    // Clean up the response to extract JSON
    const cleanJsonString = jsonString.replace(/```json\n?|```\n?/g, '').trim();
    
    console.log("🧠 2. Cleaned JSON String:", cleanJsonString);
    console.log("🧠 2. About to parse JSON...");
    
    try {
      const parsedResult = JSON.parse(cleanJsonString);
      console.log("✅ 2. JSON Parse SUCCESS!", parsedResult);
      console.log("✅ 2. Actions found:", parsedResult.actions);
      console.log("✅ 2. Response text:", parsedResult.response);
      return parsedResult;
    } catch (parseError) {
      console.error("❌ 2. JSON PARSE FAILED!", parseError);
      console.error("❌ 2. Failed to parse:", cleanJsonString);
      
      // Return fallback response
      return { 
        response: "My brain got scrambled! I received a weird response from the AI.", 
        actions: [] 
      };
    }
  }

  // Command executor function
  const executeActions = async (actions) => {
    // --- ⚡ DEBUGGING STEP 3: CHECK ACTION EXECUTION ---
    console.log("⚡ 3. Executing these actions:", actions);
    console.log("⚡ 3. Actions type:", typeof actions);
    console.log("⚡ 3. Is array:", Array.isArray(actions));
    console.log("⚡ 3. Actions length:", actions?.length);
    // ---------------------------------------------------
    
    if (!actions || !Array.isArray(actions)) {
      console.error("❌ 3. No valid actions to execute. Received:", actions);
      setFeedback("❌ No actions to execute.");
      return;
    }
    
    if (actions.length === 0) {
      console.warn("⚠️ 3. Actions array is empty.");
      setFeedback("⚠️ No specific actions requested.");
      return;
    }
    
    setFeedback("⚡ Executing commands...");
    
    try {
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        console.log(`🚀 3. Processing action ${i + 1}/${actions.length}:`, action);
        
        const { type, ...params } = action;
        console.log(`🚀 3. Action type: '${type}', params:`, params);
        
        if (!type) {
          console.error(`❌ 3. Action ${i + 1} missing 'type' field:`, action);
          continue;
        }
        
        if (browserAPI[type]) {
          console.log(`✅ 3. Found browserAPI function for '${type}', executing...`);
          
          try {
            const result = await browserAPI[type](...Object.values(params));
            console.log(`✅ 3. Action '${type}' completed successfully:`, result);
          } catch (actionError) {
            console.error(`❌ 3. Action '${type}' failed:`, actionError);
            throw actionError; // Re-throw to be caught by outer try-catch
          }
          
          // Add a small delay between actions
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          console.error(`❌ 3. Unknown action type: '${type}'. Available:`, Object.keys(browserAPI));
        }
      }
      
      console.log("✅ 3. All actions completed successfully!");
      setFeedback("✅ Commands executed successfully!");
    } catch (error) {
      console.error('❌ 3. Action execution failed:', error);
      setFeedback(`❌ Command failed: ${error.message}`);
    }
  };

  const handleListen = useCallback(() => {
    if (!isSupported) {
      setFeedback('❌ Speech recognition not supported in this browser.');
      return;
    }

    if (apiStatus === 'missing') {
      setFeedback('⚠️ Please set your Gemini API key first!');
      return;
    }

    if (isProcessing) {
      setFeedback('⏳ Please wait, still processing previous command...');
      return;
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        isRecognitionActive.current = false;
        setIsListening(false);
        setFeedback('🛑 Stopped listening.');
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    } else {
      try {
        if (recognitionRef.current && !isRecognitionActive.current) {
          setFeedback('🎤 Starting... Speak clearly!');
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (error) {
        console.error('Error starting recognition:', error);
        setFeedback('❌ Failed to start listening. Try again!');
        setIsListening(false);
      }
    }
  }, [isSupported, apiStatus, isProcessing, isListening]);

  // Get avatar animation state
  const getAvatarState = () => {
    if (isListening) return 'listening';
    if (isProcessing) return 'thinking';
    return 'idle';
  };

  // Enhanced status indicator
  const getStatusColor = () => {
    if (!isSupported) return 'text-red-400';
    if (apiStatus === 'missing') return 'text-yellow-400';
    if (isListening) return 'text-blue-400';
    if (isProcessing) return 'text-purple-400';
    return 'text-green-400';
  };

  const getStatusIcon = () => {
    if (!isSupported) return '❌';
    if (apiStatus === 'missing') return '⚠️';
    if (isListening) return '🎤';
    if (isProcessing) return '🤔';
    return '✅';
  };

  return (
    <div className="w-96 min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex flex-col relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/10 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/20 rounded-full animate-ping animation-delay-2000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-white/15 rounded-full animate-ping animation-delay-3000"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl font-bold text-black">🤖</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Goofy AI Assistant
              </h1>
              <p className="text-xs text-white/70">Your playful voice browser buddy</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${getStatusColor()}`}>{getStatusIcon()}</span>
            <div className="text-xs text-white/60">
              {apiStatus === 'ready' ? 'Ready' : apiStatus === 'missing' ? 'Setup' : 'Error'}
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Enhanced Avatar Section */}
        <div className="mb-6 relative">
          <div className={`transition-all duration-500 transform ${
            isListening ? 'scale-110 rotate-2' : 
            isProcessing ? 'scale-105 -rotate-1' : 
            'scale-100'
          }`}>
            {/* Fallback avatar if Lottie fails */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
              <Player
                autoplay
                loop={getAvatarState() !== 'idle'}
                src="https://lottie.host/embed/4f1b6c6c-b5c9-4f0d-9a1f-2d5e8c7b9a3e/KZZFtUUwXe.json"
                style={{ height: '100px', width: '100px' }}
                onEvent={(event) => {
                  if (event === 'error') {
                    console.log('Lottie animation failed, using fallback');
                  }
                }}
              >
                {/* Fallback content */}
                <div className="text-6xl animate-bounce">
                  {isListening ? '🎧' : isProcessing ? '🧠' : '🤖'}
                </div>
              </Player>
            </div>
          </div>
          
          {/* Animated rings */}
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 animate-ping"></div>
              <div className="absolute inset-4 rounded-full border-2 border-purple-400/30 animate-ping animation-delay-150"></div>
              <div className="absolute inset-8 rounded-full border-2 border-pink-400/20 animate-ping animation-delay-300"></div>
            </>
          )}
        </div>
        
        {/* Status Display */}
        <div className="text-center mb-6 min-h-[3rem] flex items-center justify-center">
          <p className="text-sm leading-relaxed px-4">{feedback}</p>
        </div>
        
        {/* Enhanced Voice Control Button */}
        <button 
          onClick={handleListen} 
          disabled={!isSupported || isProcessing || apiStatus === 'missing'}
          className={`relative p-8 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl ${
            isListening 
              ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 animate-pulse shadow-red-500/50' 
              : isProcessing
              ? 'bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/50'
              : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 shadow-blue-500/50'
          }`}
        >
          <span className="text-4xl drop-shadow-lg">
            {isListening ? '⏹️' : isProcessing ? '⏳' : '🎤'}
          </span>
          
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping"></div>
              <div className="absolute inset-2 rounded-full border-2 border-white/20 animate-ping animation-delay-200"></div>
            </>
          )}
        </button>
        
        <p className="text-sm text-white/70 mt-4 text-center px-4">
          {!isSupported ? 'Browser not supported' :
           apiStatus === 'missing' ? 'Set up API key first' :
           isListening ? '🔴 Recording... Speak clearly!' : 
           isProcessing ? '⚡ Processing your command...' :
           '🎯 Click the mic to give voice commands'}
        </p>
        
        {/* Quick action hints */}
        {!isListening && !isProcessing && isSupported && apiStatus === 'ready' && (
          <div className="mt-4 text-center">
            <p className="text-xs text-white/40 mb-2">Try saying:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['"Open YouTube"', '"Search cats"', '"Scroll down"'].map((hint, index) => (
                <span key={index} className="px-2 py-1 bg-white/10 rounded-full text-xs text-white/60">
                  {hint}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Command History */}
      {commandHistory.length > 0 && (
        <div className="bg-gradient-to-b from-black/30 to-black/20 backdrop-blur-sm border-t border-white/10 p-4 max-h-52 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
              📚 Recent Commands
            </h3>
            <button 
              onClick={() => setCommandHistory([])}
              className="text-xs text-white/50 hover:text-white/80 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2">
            {commandHistory.map((cmd, index) => (
              <div key={cmd.id} className={`bg-gradient-to-r from-white/15 to-white/5 rounded-lg p-3 border-l-4 ${
                cmd.status === 'success' ? 'border-green-400' :
                cmd.status === 'error' ? 'border-red-400' :
                'border-yellow-400'
              } transition-all duration-300 hover:from-white/20 hover:to-white/10`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/60 font-mono">{cmd.timestamp}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium ${
                      cmd.status === 'success' ? 'text-green-400' :
                      cmd.status === 'error' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {cmd.status === 'success' ? '✓ Success' :
                       cmd.status === 'error' ? '❌ Error' : '⏳ Processing'}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-medium text-white/90 mb-1">
                  💬 "{cmd.command}"
                </p>
                {cmd.response && (
                  <p className="text-xs text-white/70 italic bg-black/20 rounded p-2 mt-2">
                    🤖 {cmd.response}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Enhanced Footer */}
      <div className="bg-gradient-to-r from-black/40 via-black/30 to-black/40 p-4 text-center border-t border-white/5">
        <div className="flex items-center justify-center space-x-4 text-xs text-white/60">
          <span className="flex items-center gap-1">
            🧠 <span className="hidden sm:inline">Powered by</span> Gemini AI
          </span>
          <span className="w-1 h-1 bg-white/30 rounded-full"></span>
          <span className="flex items-center gap-1">
            🚀 <span className="hidden sm:inline">Made for</span> GDG Hackathon
          </span>
        </div>
        <div className="mt-2 text-xs text-white/40">
          v1.0.0 | Modern Voice Assistant
        </div>
        </div>
      </div>
    </div>
  );
}

export default App;
