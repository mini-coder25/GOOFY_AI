# 🎭 Goofy - AI Voice Browser Assistant

> **Transform your web browsing experience with natural voice commands and an engaging AI avatar**

Goofy is an innovative Chrome extension that revolutionizes web browsing through natural voice commands and an animated avatar. It provides deep browser control through conversational AI, making web browsing more accessible and efficient.

## ✨ Features

### 🎤 Voice Control
- **Natural Language Commands** - Control your browser with everyday speech
- **Speech Recognition** - Advanced voice recognition with real-time feedback
- **Quick Commands** - Predefined shortcuts for common actions
- **Custom Commands** - Type and execute custom voice commands

### 🎭 Animated Avatar
- **Responsive Avatar** - Animated Goofy character that responds to interactions
- **Visual Feedback** - Real-time visual cues for listening, speaking, and processing states
- **Customizable** - Adjustable settings for avatar behavior and appearance

### 🌐 Browser Integration
- **Deep Page Control** - Scroll, click, navigate, and interact with web elements
- **Tab Management** - Open, close, and switch between tabs
- **Form Interaction** - Fill forms and interact with page elements
- **Search Integration** - Perform searches and navigate to websites

### ⚙️ Smart Features
- **Context Awareness** - Understands current page context
- **Error Handling** - Graceful error recovery and user feedback
- **Keyboard Shortcuts** - Quick access via Ctrl+Shift+G
- **Settings Panel** - Comprehensive configuration options

## 🚀 Installation

### Method 1: Load Unpacked Extension (Developer Mode)

1. **Open Chrome Extensions Page**
   ```
   chrome://extensions/
   ```

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked"
   - Navigate to: `d:\\GOOFY_GDG\\GOOFY_AI\\goofy\\goofy-extension`
   - Click "Select Folder"

4. **Verify Installation**
   - Look for the Goofy icon in your browser toolbar
   - You should see "Goofy - AI Voice Browser Assistant" in your extensions list

### Method 2: Chrome Web Store (Future)
*Coming soon - will be available on the Chrome Web Store*

## 📱 Quick Start

### 1. **Activation**
- Click the Goofy icon in your browser toolbar
- Click "Activate Goofy" in the popup
- The animated avatar will appear on your current page

### 2. **Voice Commands**
- Click the microphone button or use Ctrl+Space
- Speak your command clearly
- Watch Goofy execute your request!

### 3. **Quick Commands**
Try these popular commands:
- "Scroll down" / "Scroll up"
- "Go to top" / "Go to bottom"
- "New tab" / "Close tab"
- "Click search" / "Click login"
- "Search for cats"
- "Go to google.com"

## 🎯 Usage Guide

### Voice Commands

#### **Navigation Commands**
- `"Go to [website]"` - Navigate to a specific website
- `"Scroll down"` / `"Scroll up"` - Page scrolling
- `"Go to top"` / `"Go to bottom"` - Jump to page extremes
- `"Refresh page"` - Reload current page

#### **Tab Management**
- `"New tab"` - Open a new browser tab
- `"Close tab"` - Close current tab
- `"Next tab"` / `"Previous tab"` - Switch between tabs

#### **Page Interaction**
- `"Click [element]"` - Click on buttons, links, or elements
  - Examples: "Click search", "Click login", "Click menu"
- `"Search for [query]"` - Perform searches on the current page
- `"Fill [field] with [value]"` - Fill form fields

#### **Advanced Commands**
- `"Find [text]"` - Search for text on the page
- `"Take screenshot"` - Capture the current page
- `"Help"` - Show available commands

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Shift + G` | Toggle Goofy on/off |
| `Ctrl + Space` | Start/stop voice listening (when active) |

### Avatar States

The Goofy avatar provides visual feedback through different states:

- 🟢 **Ready** - Green background, normal expression
- 🔵 **Listening** - Blue background, pulsing animation
- 🟠 **Processing** - Orange background, thinking animation
- 🔴 **Error** - Red background, concerned expression

## ⚙️ Settings & Configuration

Access settings by right-clicking the Goofy icon and selecting "Options".

### Voice Settings
- **Voice Recognition** - Enable/disable voice input
- **Speech Speed** - Adjust response speech rate (0.5x - 2.0x)
- **Speech Pitch** - Modify voice pitch (0.5x - 2.0x)

### Avatar Settings
- **Show Avatar** - Display the animated character
- **Auto-activate** - Automatically show Goofy on new pages

### Performance Settings
- **Continuous Listening** - Keep microphone active (uses more battery)
- **Smart Commands** - Use AI for complex command interpretation

## 🛠️ Troubleshooting

### Common Issues

#### **Voice Recognition Not Working**
- Ensure microphone permissions are granted
- Check if browser supports speech recognition
- Try refreshing the page and reactivating Goofy

#### **Commands Not Executing**
- Verify Goofy is activated (green avatar visible)
- Check if the page has loaded completely
- Try simpler, more specific commands

#### **Extension Not Loading**
- Verify developer mode is enabled in Chrome
- Check that all files are present in the extension folder
- Look for errors in Chrome's extension console

#### **Avatar Not Appearing**
- Ensure the page has finished loading
- Check if avatar display is enabled in settings
- Try reloading the page

### Debug Information

To get debug information:
1. Right-click on the page and select "Inspect"
2. Go to the "Console" tab
3. Look for Goofy-related messages
4. Report any errors in the project issues

## 🔧 Development

### Project Structure
```
goofy-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── background.js          # Background service worker
├── content.js             # Page interaction script
├── content.css            # Avatar and UI styles
├── options.html           # Settings page
└── icons/                 # Extension icons
    ├── icon16.svg
    ├── icon32.svg
    ├── icon48.svg
    └── icon128.svg
```

### Key Components

#### **Background Service Worker** (`background.js`)
- Manages extension lifecycle
- Handles communication between components
- Processes voice commands
- Manages browser API interactions

#### **Content Script** (`content.js`)
- Injects Goofy avatar into web pages
- Handles DOM manipulation
- Provides voice recognition interface
- Executes page-specific commands

#### **Popup Interface** (`popup.js`)
- Extension control panel
- Settings and configuration
- Quick command access
- Status monitoring

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Setup
1. Clone the repository
2. Set up the React + Vite + Tailwind development environment
3. Make your changes
4. Test the extension thoroughly
5. Submit a pull request

### Areas for Contribution
- **Voice Commands** - Add new command types and patterns
- **AI Integration** - Improve natural language processing
- **UI/UX** - Enhance the avatar animations and interface
- **Accessibility** - Make the extension more accessible
- **Documentation** - Improve guides and examples

## 📄 Technical Specifications

### Browser Compatibility
- **Chrome** 88+ (Primary support)
- **Edge** 88+ (Chromium-based)
- **Opera** 74+ (Limited testing)

### Permissions Required
- `activeTab` - Access current tab content
- `tabs` - Manage browser tabs
- `storage` - Save user preferences
- `scripting` - Inject content scripts
- `webNavigation` - Navigate between pages
- `contextMenus` - Add right-click options

### Web APIs Used
- **Speech Recognition API** - Voice input processing
- **Speech Synthesis API** - Text-to-speech responses
- **Chrome Extension APIs** - Browser integration
- **DOM APIs** - Page interaction

## 🎓 Learning Resources

### Voice Command Examples
- [Basic Commands Guide](./docs/basic-commands.md)
- [Advanced Usage Patterns](./docs/advanced-usage.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)

### Development Resources
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Speech Recognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 📞 Support

Need help? Here are your options:

- **GitHub Issues** - Report bugs and request features
- **Documentation** - Check our comprehensive guides
- **Community** - Join discussions with other users

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React, Vite, and Tailwind CSS
- Speech recognition powered by Web Speech API
- Icons and animations created with modern web standards
- Inspired by the need for accessible web browsing

---

**Made with ❤️ for a more accessible and efficient web browsing experience**

*Goofy - Because browsing should be fun and effortless!* 🎭