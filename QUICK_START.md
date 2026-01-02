# Quick Start Guide

## ⚡ Get Started in 5 Minutes

### Step 1: Get Your Supabase Anon Key

1. Go to your Supabase project: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the **anon public** key (it's a long string starting with `eyJ...`)

### Step 2: Configure the App

1. Open `js/config.js`
2. Paste your anon key where it says `YOUR_SUPABASE_ANON_KEY`
3. Save the file

Your config should look like this:
```javascript
const SUPABASE_CONFIG = {
    url: 'https://hkibbzjintfpjeruhfem.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // Your actual key here
};
```

### Step 3: Open the App

1. Open `index.html` in your web browser
2. You should see the app load without errors
3. Try adding a client!

## ✅ That's It!

The app is now connected to your Supabase database. All data will be saved and synced automatically.

## 🐛 Troubleshooting

**"Supabase configuration missing" error:**
- Make sure you've added your anon key to `js/config.js`
- Check that the file is saved

**"Supabase library not loaded" error:**
- Make sure `index.html` includes the Supabase script tag
- Check your internet connection

**Database errors:**
- Make sure you ran the SQL schema in Supabase
- Check the Supabase dashboard to verify tables exist

## 📚 Next Steps

- Read `SETUP.md` for detailed setup instructions
- Read `REBUILD_SUMMARY.md` to understand the architecture
- Deploy to Netlify/Vercel for production use

## 🚀 Deployment

### Netlify
1. Push your code to GitHub
2. Connect to Netlify
3. Deploy!

### Vercel
1. Push your code to GitHub
2. Import to Vercel
3. Deploy!

No build step needed - it's a static site!

