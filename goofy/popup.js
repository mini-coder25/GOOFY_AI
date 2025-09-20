// Popup script for Chrome Extension
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './src/App.jsx'
import './src/index.css'

// Create root and render the React app
const container = document.getElementById('root')
const root = createRoot(container)
root.render(React.createElement(App))