# Spiral Light App - Supabase Setup Guide

## Prerequisites

- A Supabase account (free tier works great)
- Basic knowledge of SQL (or just follow the steps)

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: Spiral Light Healing (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for the project to be created

## Step 2: Set Up Database Schema

1. In your Supabase project dashboard, click on **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `database/schema.sql` from this project
4. Copy the entire contents
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

## Step 3: Get Your API Credentials

1. In Supabase dashboard, go to **Settings** (gear icon) → **API**
2. You'll see two important values:
   - **Project URL**: Something like `https://xxxxx.supabase.co`
   - **anon public key**: A long string starting with `eyJ...`

## Step 4: Configure the App

1. Open `js/config.js` in this project
2. Replace `YOUR_SUPABASE_URL` with your Project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your anon public key
4. Save the file

Example:
```javascript
const SUPABASE_CONFIG = {
    url: 'https://abcdefghijklmnop.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

## Step 5: Add Supabase Library

The app needs the Supabase JavaScript library. Open `index.html` and make sure this line is in the `<head>` section:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## Step 6: Test the Connection

1. Open `index.html` in your browser
2. Open the browser console (F12)
3. You should see no errors
4. Try adding a client - if it works, you're all set!

## Troubleshooting

### "Supabase configuration missing" error
- Make sure you've filled in `js/config.js` with your actual credentials
- Check that the file is named `config.js` (not `config.example.js`)

### "Supabase library not loaded" error
- Make sure the Supabase script tag is in your `index.html`
- Check your internet connection

### Database errors
- Make sure you ran the SQL schema in Step 2
- Check that the table names match (clients, sessions)
- Verify your RLS policies are set up correctly

### CORS errors
- This shouldn't happen with Supabase, but if it does:
  - Check your Supabase project settings
  - Make sure your domain is allowed (for production)

## Security Notes

- The `anon` key is safe to use in client-side code
- For production, consider enabling Row Level Security (RLS) with proper policies
- Never commit your `service_role` key to version control

## Next Steps

- Consider adding authentication for multi-user support
- Set up backups in Supabase dashboard
- Configure email notifications (if needed)
- Deploy to a hosting service (Netlify, Vercel, etc.)

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com

