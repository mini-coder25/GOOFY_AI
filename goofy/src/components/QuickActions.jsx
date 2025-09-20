const QuickActions = ({ onCommand }) => {
  const actionCategories = [
    {
      title: 'Navigation',
      icon: '🧭',
      actions: [
        { label: 'Scroll Down', command: 'scroll down', icon: '⬇️' },
        { label: 'Scroll Up', command: 'scroll up', icon: '⬆️' },
        { label: 'Go to Top', command: 'scroll to top', icon: '🔝' },
        { label: 'Go to Bottom', command: 'scroll to bottom', icon: '⬇️' },
      ]
    },
    {
      title: 'Tabs',
      icon: '📑',
      actions: [
        { label: 'New Tab', command: 'new tab', icon: '➕' },
        { label: 'Close Tab', command: 'close tab', icon: '❌' },
        { label: 'Refresh', command: 'refresh page', icon: '🔄' },
      ]
    },
    {
      title: 'Interaction',
      icon: '👆',
      actions: [
        { label: 'Click Search', command: 'click search', icon: '🔍' },
        { label: 'Click Login', command: 'click login', icon: '🔐' },
        { label: 'Click Menu', command: 'click menu', icon: '☰' },
      ]
    }
  ]

  const handleActionClick = (command) => {
    onCommand(command)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700">Quick Actions:</div>
      
      {actionCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-medium text-gray-600">
            <span>{category.icon}</span>
            <span>{category.title}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {category.actions.map((action, actionIndex) => (
              <button
                key={actionIndex}
                onClick={() => handleActionClick(action.command)}
                className="flex items-center space-x-2 text-left text-xs bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 px-3 py-2 rounded-lg transition-all duration-200 shadow-sm"
              >
                <span className="text-sm">{action.icon}</span>
                <span className="font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      
      {/* Custom command input */}
      <div className="border-t pt-4">
        <div className="text-xs font-medium text-gray-600 mb-2">Custom Command:</div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Type a custom command..."
            className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                onCommand(e.target.value.trim())
                e.target.value = ''
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = e.target.previousElementSibling
              if (input.value.trim()) {
                onCommand(input.value.trim())
                input.value = ''
              }
            }}
            className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuickActions