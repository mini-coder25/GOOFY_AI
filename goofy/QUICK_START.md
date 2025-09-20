# 🚀 Goofy AI Assistant - Quick Start Guide

## ⚡ Get Running in 5 Minutes!

### Step 1: Prerequisites ✅
- ✅ Chrome browser installed
- ✅ Node.js 16+ installed (`node --version`)
- ✅ Get Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Step 2: Setup Project 📦
```bash
# 1. Navigate to project
cd goofy

# 2. Install dependencies
npm install

# 3. Set up API key
echo "VITE_GEMINI_API_KEY=your_actual_api_key_here" > .env
```

### Step 3: Build Extension 🔨
```bash
npm run build
```
**✅ Success indicator**: `dist` folder created with files

### Step 4: Load in Chrome 🌐
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist` folder (NOT the main folder!)
5. ✅ Goofy icon appears in toolbar

### Step 5: Test Voice Commands 🎤
1. Click Goofy extension icon
2. Click the blue microphone button
3. Say: **"Open YouTube"**
4. ✅ YouTube should open in new tab!

## 🎯 Quick Test Commands

**Basic Navigation:**
- "Open Google"
- "Open YouTube" 
- "Go back"
- "Refresh page"
- "Close tab"

**Search Commands:**
- "Search for cute cats"
- "Search GitHub for React"
- "Find funny videos on YouTube"

**Page Actions:**
- "Scroll down"
- "Scroll up"
- "Copy this"
- "Paste here"

## 🚨 Quick Troubleshooting

### ❌ "Speech recognition error"
- Check microphone permissions in Chrome
- Ensure microphone works in other apps
- Only works in Chrome/Chromium browsers

### ❌ "Please set API key"
- Verify `.env` file has correct API key
- Run `npm run build` after adding key
- Reload extension in Chrome

### ❌ "Extension not loading" 
- Load from `dist` folder, not project root
- Enable Developer mode first
- Check for red error text in extensions page

### ❌ "Commands not working"
- Grant all permissions when prompted
- Ensure internet connection active
- Try simpler commands first

## 🎉 Success Checklist

Your setup is perfect when:
- [x] Extension loads without errors
- [x] Microphone button changes color when clicked
- [x] Voice commands trigger browser actions
- [x] Goofy responds with voice feedback
- [x] Command history shows in UI

## 🔗 What's Next?

- 📖 Read full [README.md](./README.md) for details
- 🎬 Check [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for presentation
- 🔧 See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) if issues occur

---

**🎯 Goal**: Get from zero to working voice assistant in 5 minutes!

*Need help? Most issues are solved by checking microphone permissions and API key setup.* 🎤✨