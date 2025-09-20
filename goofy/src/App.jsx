import { useState, useEffect } from 'react'
import GoofyAvatar from './components/GoofyAvatar'
import VoiceControls from './components/VoiceControls'
import StatusDisplay from './components/StatusDisplay'
import QuickActions from './components/QuickActions'

function App() {
  const [isActive, setIsActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [status, setStatus] = useState('Ready')
  const [currentTab, setCurrentTab] = useState(null)

  useEffect(() => {
    // Check if extension is active on current tab
    checkExtensionStatus()
    getCurrentTab()
  }, [])

  const checkExtensionStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({action: 'getStatus'})
      setIsActive(response.isActive)
    } catch (error) {
      console.error('Failed to check status:', error)
    }
  }

  const getCurrentTab = async () => {
    try {
      const tabs = await chrome.tabs.query({active: true, currentWindow: true})
      if (tabs[0]) {
        setCurrentTab(tabs[0])
      }
    } catch (error) {
      console.error('Failed to get current tab:', error)
    }
  }

  const toggleGoofy = async () => {
    try {
      if (isActive) {
        await chrome.runtime.sendMessage({action: 'deactivateGoofy', tabId: currentTab?.id})
        setIsActive(false)
        setStatus('Deactivated')
      } else {
        await chrome.runtime.sendMessage({action: 'activateGoofy', tabId: currentTab?.id})
        setIsActive(true)
        setStatus('Activated')
      }
    } catch (error) {
      console.error('Failed to toggle Goofy:', error)
      setStatus('Error')
    }
  }

  const handleVoiceCommand = async (command) => {
    setStatus('Processing...')
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'executeCommand',
        command: command,
        tabId: currentTab?.id
      })
      
      if (response.success) {
        setStatus('Command executed')
      } else {
        setStatus('Command failed')
      }
    } catch (error) {
      console.error('Command failed:', error)
      setStatus('Error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <GoofyAvatar isActive={isActive} isListening={isListening} />
              <div>
                <h1 className="text-white font-bold text-lg">Goofy</h1>
                <p className="text-blue-100 text-sm">Voice Browser Assistant</p>
              </div>
            </div>
            <button
              onClick={toggleGoofy}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <StatusDisplay status={status} currentTab={currentTab} />
          
          {isActive && (
            <>
              <VoiceControls 
                isListening={isListening}
                onToggleListening={setIsListening}
                onVoiceCommand={handleVoiceCommand}
              />
              
              <QuickActions onCommand={handleVoiceCommand} />
            </>
          )}
          
          {!isActive && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.817L4.168 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.168l4.215-2.817a1 1 0 011 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-500">Click Activate to start using voice commands</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 text-center">
          <p className="text-xs text-gray-500">
            Press Ctrl+Shift+G on any page to toggle Goofy
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
