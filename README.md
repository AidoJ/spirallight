# Spiral Light Healing - Client Management System

A modern, professional web application for managing client intake forms and session records for healing practitioners.

## Features

- **Client Management**: Add, edit, delete, and search clients
- **Multiple Sessions Per Client**: Track unlimited session records for each client
- **Comprehensive Intake Forms**: Based on Bowen Therapy intake requirements
- **Therapist Notes**: Add and edit notes for each session
- **Session History**: View all past sessions organized by client
- **Mobile Responsive**: Works beautifully on phones, tablets, and desktops
- **No Backend Required**: All data stored locally in browser using localStorage

## Quick Start

1. Simply open `index.html` in any modern web browser
2. Start adding clients and creating session records
3. All data is saved automatically in your browser

## Deployment

### Option 1: Netlify (Recommended)

1. Fork this repository
2. Go to [Netlify](https://www.netlify.com/) and sign up/login
3. Click "Add new site" > "Import an existing project"
4. Connect to your GitHub account and select this repository
5. Click "Deploy site"

Your app will be live at a Netlify URL instantly!

### Option 2: Netlify Drop

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop the entire folder
3. Your app will be deployed immediately

### Option 3: GitHub Pages

1. Go to repository Settings > Pages
2. Select branch: `main` (or `master`)
3. Select folder: `/ (root)`
4. Save
5. Your app will be available at `https://yourusername.github.io/spirallight/`

## Data Management

### Backup Your Data

All client and session data is stored in your browser's localStorage. To backup:

1. Open browser developer console (F12)
2. Go to Console tab
3. Type: `copy(localStorage.getItem('clients'))`
4. Paste into a text file and save
5. Repeat for sessions: `copy(localStorage.getItem('sessions'))`

### Restore Data

1. Open browser developer console (F12)
2. Type: `localStorage.setItem('clients', 'PASTE_YOUR_CLIENTS_DATA_HERE')`
3. Type: `localStorage.setItem('sessions', 'PASTE_YOUR_SESSIONS_DATA_HERE')`
4. Refresh the page

## Technology Stack

- HTML5
- CSS3 (Modern Grid & Flexbox)
- Vanilla JavaScript
- localStorage API
- Google Fonts (Inter)

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Copyright 2026 Spiral Light Healing. All rights reserved.
