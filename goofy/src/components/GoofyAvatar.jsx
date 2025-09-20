import { useEffect, useState } from 'react'

const GoofyAvatar = ({ isActive, isListening }) => {
  const [blinkState, setBlinkState] = useState(false)
  const [speakingState, setSpeakingState] = useState(false)

  useEffect(() => {
    // Blinking animation
    const blinkInterval = setInterval(() => {
      setBlinkState(true)
      setTimeout(() => setBlinkState(false), 150)
    }, 3000)

    return () => clearInterval(blinkInterval)
  }, [])

  useEffect(() => {
    // Speaking animation when listening
    if (isListening) {
      setSpeakingState(true)
      const speakInterval = setInterval(() => {
        setSpeakingState(prev => !prev)
      }, 500)
      
      return () => clearInterval(speakInterval)
    } else {
      setSpeakingState(false)
    }
  }, [isListening])

  const getAvatarClasses = () => {
    let classes = "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 "
    
    if (!isActive) {
      classes += "bg-gray-400"
    } else if (isListening) {
      classes += "bg-blue-500 animate-pulse"
    } else {
      classes += "bg-green-500"
    }
    
    return classes
  }

  const getEyeClasses = () => {
    return `w-2 h-2 bg-white rounded-full transition-all duration-150 ${
      blinkState ? 'h-0.5' : 'h-2'
    }`
  }

  const getMouthClasses = () => {
    return `w-4 h-2 bg-white rounded-b-full transition-all duration-300 ${
      speakingState ? 'h-3' : 'h-2'
    }`
  }

  return (
    <div className={getAvatarClasses()}>
      <div className="relative w-8 h-8 flex flex-col items-center justify-center">
        {/* Eyes */}
        <div className="flex space-x-2 mb-1">
          <div className={getEyeClasses()}></div>
          <div className={getEyeClasses()}></div>
        </div>
        
        {/* Mouth */}
        <div className={getMouthClasses()}></div>
        
        {/* Status indicator */}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
        )}
      </div>
    </div>
  )
}

export default GoofyAvatar