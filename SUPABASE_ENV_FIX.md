# How to Fix Your Supabase Configuration

## ⚠️ Critical: Your Supabase URL is Incorrect

Based on the browser console errors, your `.env` file contains the **wrong Supabase URL**. It's currently pointing to the Supabase dashboard instead of your project's actual API.

## Current Issue

Your `.env` file likely has:
```env
VITE_SUPABASE_URL=https://supabase.com/dashboard/project/myrthifravcxvcqlptcp/...
```

This is **WRONG** ❌ - It points to the Supabase dashboard, not your project's API endpoint.

## What You Need to Do

### Step 1: Find Your Correct Supabase Credentials

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in and select your project
3. Click **Settings** (gear icon) in the left sidebar
4. Click **API** in the settings menu
5. Copy these two values:

**Project URL:**
```
https://myrthifravcxvcqlptcp.supabase.co
```
(Format: `https://[your-project-id].supabase.co`)

**anon/public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cnRoaWZyYXZjeHZjcWxwdGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNTI2MjEsImV4cCI6MjA0ODYyODYyMX0...
```
(A long string starting with `eyJ`)

### Step 2: Update Your `.env` File

Open `c:\Users\roush\Downloads\DocTransfer\DocTransfer\.env` and update it:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://myrthifravcxvcqlptcp.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here

# Clerk Configuration (keep these as they are)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
```

**Replace:**
- `https://myrthifravcxvcqlptcp.supabase.co` with YOUR actual Project URL
- `your_actual_anon_key_here` with YOUR actual anon/public key

### Step 3: Restart Your Dev Server

After updating `.env`:

1. Stop all running dev servers (press Ctrl+C in terminals)
2. Run `npm run dev` again
3. Refresh your browser

## How to Verify It's Fixed

After updating and restarting:

1. Open your app at `http://localhost:5173`
2. Sign in successfully
3. Go to the DataRoom (`/dataroom`)
4. Open browser DevTools (F12) → Console tab
5. Upload a test file
6. You should **NOT** see CORS errors anymore

## Common Mistakes to Avoid

❌ **DON'T** use `https://supabase.com/dashboard/...`  
✅ **DO** use `https://[your-project-id].supabase.co`

❌ **DON'T** include `/rest/v1/` or any path in the URL  
✅ **DO** use just the base URL

❌ **DON'T** forget to restart the dev server  
✅ **DO** restart after changing `.env`

## Still Having Issues?

If you still see CORS errors after fixing the URL:

1. **Add localhost to CORS settings:**
   - Supabase Dashboard → Settings → API → CORS Configuration
   - Add: `http://localhost:5173`
   - Save changes

2. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

3. **Check your .env file loads:**
   - Look in console for: "Clerk Key exists: true"
   - If false, your .env isn't loading properly

## Example of Correct `.env` File

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlYXItcGlyYW5oYS05My5jbGVyay5hY2NvdW50cy5kZXYk

# Supabase Database
VITE_SUPABASE_URL=https://myrthifravcxvcqlptcp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15cnRoaWZyYXZjeHZjcWxwdGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMwNTI2MjEsImV4cCI6MjA0ODYyODYyMX0.abcdefghijklmnopqrstuvwxyz1234567890
```

**Note:** The values above are examples. Use YOUR actual keys from YOUR Supabase dashboard.
