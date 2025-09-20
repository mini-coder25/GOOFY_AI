const StatusDisplay = ({ status, currentTab }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'Ready':
        return 'text-green-600 bg-green-50'
      case 'Activated':
        return 'text-green-600 bg-green-50'
      case 'Deactivated':
        return 'text-gray-600 bg-gray-50'
      case 'Processing...':
        return 'text-blue-600 bg-blue-50'
      case 'Command executed':
        return 'text-green-600 bg-green-50'
      case 'Command failed':
        return 'text-red-600 bg-red-50'
      case 'Error':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'Ready':
      case 'Activated':
      case 'Command executed':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'Processing...':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )
      case 'Command failed':
      case 'Error':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const truncateUrl = (url) => {
    if (!url) return 'No page'
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname
      if (domain.length > 25) {
        return domain.substring(0, 22) + '...'
      }
      return domain
    } catch {
      return 'Invalid URL'
    }
  }

  return (
    <div className="space-y-3">
      {/* Status indicator */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="font-medium">{status}</span>
      </div>

      {/* Current tab info */}
      {currentTab && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600 mb-1">Current Page:</div>
          <div className="text-sm font-medium text-gray-900 truncate" title={currentTab.title}>
            {currentTab.title || 'Untitled'}
          </div>
          <div className="text-xs text-gray-500 truncate" title={currentTab.url}>
            {truncateUrl(currentTab.url)}
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="text-xs text-gray-500 space-y-1">
        <div>💡 Try saying commands like:</div>
        <div className="ml-4 space-y-0.5">
          <div>• "Scroll down" or "Go to bottom"</div>
          <div>• "Click search" or "Click login"</div>
          <div>• "Search for cats" or "Find help"</div>
          <div>• "New tab" or "Close tab"</div>
        </div>
      </div>
    </div>
  )
}

export default StatusDisplay