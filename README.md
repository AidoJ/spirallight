# Spiral Light Healing - Client Management System

A modern, professional web application for managing client intake forms and session records for healing practitioners. Now powered by **Supabase** for cloud-based data storage and synchronization.

## ✨ Features

- **Client Management**: Add, edit, delete, and search clients
- **Multiple Sessions Per Client**: Track unlimited session records for each client
- **Comprehensive Intake Forms**: Based on Bowen Therapy intake requirements
- **Therapist Notes**: Add and edit notes for each session
- **Session History**: View all past sessions organized by client
- **Mobile Responsive**: Works beautifully on phones, tablets, and desktops
- **Cloud Sync**: All data stored in Supabase - accessible from any device
- **Real-time Updates**: Changes sync automatically across devices

## 🚀 Quick Start

### Prerequisites

- A Supabase account (free tier works great)
- Basic knowledge of SQL (or just follow the steps)

### Setup Steps

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait 2-3 minutes for setup

2. **Set Up Database**
   - In Supabase dashboard, go to **SQL Editor**
   - Open `database/schema.sql` from this project
   - Copy and paste the entire SQL into the editor
   - Click **Run**

3. **Get API Credentials**
   - Go to **Settings** → **API**
   - Copy your **Project URL** and **anon public key**

4. **Configure the App**
   - Open `js/config.js`
   - Replace `YOUR_SUPABASE_URL` with your Project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your anon key

5. **Open the App**
   - Open `index.html` in your web browser
   - Start adding clients!

📖 **For detailed instructions, see [SETUP.md](SETUP.md)**  
⚡ **For quick setup, see [QUICK_START.md](QUICK_START.md)**

## 📁 Project Structure

```
spiral-light-app/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All styles
├── js/
│   ├── config.js          # Supabase configuration
│   ├── supabase.js        # Database service layer
│   ├── ui.js              # UI utilities
│   ├── clients.js         # Client management
│   ├── sessions.js        # Session management
│   └── app.js             # App initialization
├── database/
│   └── schema.sql         # Database schema
└── [documentation files]
```

## 🗄️ Database Schema

The app uses two main tables:

- **clients**: Stores client information (name, contact, demographics, etc.)
- **sessions**: Stores session records with detailed intake forms

See `database/schema.sql` for the complete schema.

## 🚀 Deployment

### Option 1: Netlify (Recommended)

1. Push your code to GitHub (already done!)
2. Go to [Netlify](https://www.netlify.com/)
3. Click "Add new site" > "Import an existing project"
4. Connect to GitHub and select this repository
5. Click "Deploy site"

Your app will be live instantly! Don't forget to add your Supabase credentials to `js/config.js` after deployment.

### Option 2: Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your GitHub repository
4. Deploy!

### Option 3: GitHub Pages

1. Go to repository **Settings** > **Pages**
2. Select branch: `master`
3. Select folder: `/ (root)`
4. Save
5. Your app will be available at `https://aidoj.github.io/spirallight/`

**Note**: For GitHub Pages, you'll need to update the Supabase config after deployment.

## 🔧 Technology Stack

- **HTML5** - Structure
- **CSS3** - Modern styling with Grid & Flexbox
- **Vanilla JavaScript** - No frameworks needed
- **Supabase** - Backend as a Service (database, auth-ready)
- **Google Fonts** - Inter font family

## 📱 Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔐 Security

- The `anon` key is safe to use in client-side code
- Row Level Security (RLS) is enabled (permissive policies for MVP)
- For production, consider adding authentication and proper RLS policies

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[QUICK_START.md](QUICK_START.md)** - Quick setup guide
- **[REBUILD_PLAN.md](REBUILD_PLAN.md)** - Technical architecture
- **[REBUILD_SUMMARY.md](REBUILD_SUMMARY.md)** - Rebuild overview
- **[FINAL_STEPS.md](FINAL_STEPS.md)** - Final checklist

## 🆕 What's New (Supabase Rebuild)

- ✅ **Cloud Storage**: Data stored in Supabase, accessible from any device
- ✅ **Modular Code**: Separated CSS and JavaScript into organized files
- ✅ **Better UX**: Loading states, error handling, and user feedback
- ✅ **Scalable**: Ready for growth and multi-user support
- ✅ **Maintainable**: Clean, organized codebase

## 🐛 Troubleshooting

**"Supabase configuration missing" error:**
- Make sure you've filled in `js/config.js` with your actual credentials

**"Supabase library not loaded" error:**
- Check that the Supabase script tag is in `index.html`
- Verify your internet connection

**Database errors:**
- Make sure you ran the SQL schema in Supabase
- Check that table names match (clients, sessions)

## 📝 License

Copyright 2026 Spiral Light Healing. All rights reserved.

## 🤝 Contributing

This is a private project, but suggestions and improvements are welcome!

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review browser console for errors
3. Verify Supabase dashboard shows your tables

---

**Built with ❤️ for healing practitioners**
