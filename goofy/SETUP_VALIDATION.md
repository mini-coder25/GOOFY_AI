# 🔍 Goofy Setup Validation

## ✅ Pre-Demo Checklist

### Environment Setup
- [ ] Node.js 16+ installed
- [ ] Chrome browser updated
- [ ] Gemini API key from Google AI Studio

### Project Setup
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file with `VITE_GEMINI_API_KEY`
- [ ] Build completed (`npm run build`)
- [ ] Extension loaded in Chrome

### Testing Commands
- [ ] \"Open YouTube\" - Opens new tab
- [ ] \"Scroll down\" - Scrolls page
- [ ] \"Tell me a joke\" - Personality response

### UI Validation
- [ ] Avatar animates during listening
- [ ] Status messages update
- [ ] Command history visible
- [ ] Microphone permissions granted

## 🚨 Common Issues

**Microphone not working**: Check Chrome permissions
**API not responding**: Verify API key in .env
**Extension not loading**: Check manifest.json in dist

## 🎯 Success Criteria
✅ Voice commands work
✅ Browser actions execute
✅ TTS responses play
✅ No console errors