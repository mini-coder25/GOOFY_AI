# 🔧 Goofy AI Assistant - Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Issue 1: "Speech recognition error" 
**Symptoms**: Extension shows speech recognition error immediately
**Solutions**:
1. **Check microphone permissions**:
   - Go to `chrome://settings/content/microphone`
   - Ensure microphone access is allowed
   - Allow microphone for the extension site

2. **Browser compatibility**:
   - Use Chrome/Chromium browsers only
   - Ensure Chrome is updated to latest version
   - Speech Recognition API not supported in Firefox/Safari

3. **System microphone**:
   - Test microphone with other apps
   - Check Windows sound settings
   - Restart Chrome after microphone fixes

### Issue 2: "Please set your Gemini API key"
**Symptoms**: Extension shows API key warning
**Solutions**:
1. **Get API key**:
   - Visit https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy the key (starts with `AIza...`)

2. **Set in .env file**:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Rebuild extension**:
   ```bash
   npm run build
   ```

4. **Reload extension** in Chrome

### Issue 3: "Browser actions not working"
**Symptoms**: Voice commands recognized but no browser action happens
**Solutions**:
1. **Check extension permissions**:
   - Go to `chrome://extensions/`
   - Click "Details" on Goofy AI Assistant
   - Ensure all permissions are granted

2. **Reload extension**:
   - Toggle extension off/on
   - Or click refresh icon

3. **Check active tab**:
   - Some actions need an active tab
   - Try opening a website first

### Issue 4: "Extension popup not opening"
**Symptoms**: Clicking extension icon does nothing
**Solutions**:
1. **Check extension loading**:
   - Go to `chrome://extensions/`
   - Look for error messages
   - Ensure "Developer mode" is on

2. **Reload from dist folder**:
   - Remove extension
   - Load unpacked from `dist` folder
   - Not from `src` or project root

### Issue 5: "Voice recognition cuts off"
**Symptoms**: Goofy stops listening too quickly
**Solutions**:
1. **Speak clearly and continuously**
2. **Avoid long pauses** mid-sentence
3. **Check for background noise**
4. **Restart recognition** if it stops

## 🛠 Technical Diagnostics

### Check Extension Console
1. Right-click extension popup → "Inspect"
2. Check Console tab for errors
3. Look for red error messages

### Check Background Script
1. Go to `chrome://extensions/`
2. Click "Details" → "Inspect views: background page"
3. Check console for background script errors

### Check API Response
1. Open extension console
2. Look for "Gemini response:" logs
3. Verify JSON structure is correct

## 📋 Verification Checklist

Before reporting bugs, verify:

- [ ] Chrome browser (latest version)
- [ ] Microphone working in other apps
- [ ] Valid Gemini API key set
- [ ] Extension built with `npm run build`
- [ ] Loaded from `dist` folder
- [ ] All permissions granted
- [ ] Internet connection stable
- [ ] No console errors visible

## 🔍 Debug Commands

### Test API Key Manually
```bash
# Replace YOUR_KEY with actual key
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Say hello"
      }]
    }]
  }'
```

### Check Extension Status
```javascript
// In extension console
chrome.runtime.sendMessage({action: 'getTabInfo'}, console.log);
chrome.runtime.sendMessage({action: 'checkPermissions'}, console.log);
```

## 🆘 Getting Help

If issues persist:

1. **Check browser console** for specific error messages
2. **Verify all requirements** are met
3. **Try with a fresh API key**
4. **Test on different websites**
5. **Restart Chrome** completely

## 🎯 Known Limitations

- **Speech Recognition**: Chrome-only feature
- **API Calls**: Require internet connection
- **Some websites**: May block extension scripts
- **Private tabs**: Limited extension access
- **File:// URLs**: Not supported

---

**Remember**: Most issues are related to permissions or API setup. Follow the verification checklist first! 🔍