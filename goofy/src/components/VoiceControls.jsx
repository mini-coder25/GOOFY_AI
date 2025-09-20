import { useState, useEffect } from 'react'

const VoiceControls = ({ isListening, onToggleListening, onVoiceCommand }) => {
  const [recognition, setRecognition] = useState(null)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      
      recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }
        
        setTranscript(finalTranscript)
        setInterimTranscript(interimTranscript)
        
        if (finalTranscript) {
          onVoiceCommand(finalTranscript.trim())
          setTranscript('')
          setInterimTranscript('')
        }
      }
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        onToggleListening(false)
      }
      
      recognition.onend = () => {
        onToggleListening(false)
      }
      
      setRecognition(recognition)
    }
  }, [onVoiceCommand, onToggleListening])

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser.')
      return
    }
    
    if (isListening) {
      recognition.stop()
      onToggleListening(false)
    } else {
      recognition.start()
      onToggleListening(true)
    }
  }

  const quickCommands = [
    'Scroll down',
    'Scroll up', 
    'Go to top',
    'Go to bottom',
    'Click search',
    'New tab',
    'Close tab'
  ]

  const handleQuickCommand = (command) => {
    onVoiceCommand(command)
  }

  return (
    <div className="space-y-4">
      {/* Main voice control button */}
      <div className="text-center">
        <button
          onClick={toggleListening}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isListening ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a2 2 0 114 0v4a2 2 0 11-4 0V7z" clipRule="evenodd" />
              </svg>
              <span>Stop Listening</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <span>Start Listening</span>
            </span>
          )}
        </button>
      </div>

      {/* Voice transcript display */}
      {(transcript || interimTranscript) && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600 mb-1">Voice Input:</div>
          <div className="text-gray-900">
            {transcript}
            <span className="text-gray-400 italic">{interimTranscript}</span>
          </div>
        </div>
      )}

      {/* Quick commands */}
      <div>
        <div className="text-sm font-medium text-gray-700 mb-2">Quick Commands:</div>
        <div className="grid grid-cols-2 gap-2">
          {quickCommands.map((command, index) => (
            <button
              key={index}
              onClick={() => handleQuickCommand(command)}
              className="text-left text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded transition-colors"
            >
              {command}
            </button>
          ))}
        </div>
      </div>

      {/* Voice recognition status */}
      {recognition === null && (
        <div className="text-center text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
          ⚠️ Speech recognition is not supported in this browser.
        </div>
      )}
    </div>
  )
}

export default VoiceControls