# CORS Error Fix Guide

## The Error Message

When trying to upload files to Supabase from your local development environment, you may encounter this error:

```
CORS Error: Your Supabase project is blocking requests from localhost. 
Please add http://localhost:5173 to your Supabase Dashboard > Settings > API > CORS settings.
```

## What is CORS?

**CORS (Cross-Origin Resource Sharing)** is a browser security feature that prevents websites from making requests to different domains without permission.

In your case:
- Your app runs on: `http://localhost:5173`
- Your Supabase database is at: `https://[your-project].supabase.co`
- These are different "origins" - so CORS blocks the requests by default

## How to Fix It

### Step 1: Open Supabase Dashboard
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project

### Step 2: Navigate to CORS Settings
1. Click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. Scroll down to find **CORS Configuration** or **Additional Allowed Origins**

### Step 3: Add Your Local URL
Add the following URL to the allowlist:
```
http://localhost:5173
```

**Important Notes:**
- Use `http://` NOT `https://` for localhost
- Include the port number `:5173`
- Don't add a trailing slash
- Some versions of the dashboard may also accept `http://127.0.0.1:5173` as an alternative

### Step 4: Save and Test
1. Click **Save** at the bottom of the page
2. Wait a few seconds for changes to propagate
3. Refresh your application
4. Try uploading a file again

## When to Update CORS Settings

You'll need to add new URLs when:
- ✅ Running on a different port (e.g., `http://localhost:3000`)
- ✅ Deploying to production (e.g., `https://yourdomain.com`)
- ✅ Using a staging environment
- ✅ Testing from a different local IP address

## Error Handling in the App

The DocTransfer app already includes CORS error detection in `DataRoom.tsx`:

```typescript
if (uploadError.message?.includes('fetch') || uploadError.message?.includes('CORS')) {
    throw new Error(`CORS Error: Your Supabase project is blocking requests from localhost. Please add http://localhost:5173 to your Supabase Dashboard > Settings > API > CORS settings.`);
}
```

This provides a helpful error message to guide you to fix the issue.

## Common Issues

### Issue: Added URL but still getting errors
**Solution:** 
- Clear your browser cache
- Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
- Wait 1-2 minutes for Supabase settings to propagate

### Issue: Works on localhost but not 127.0.0.1
**Solution:** Add both URLs to CORS settings:
```
http://localhost:5173
http://127.0.0.1:5173
```

### Issue: Different port number
**Solution:** If your dev server runs on a different port, add that specific URL:
```
http://localhost:3000
http://localhost:5174
```

## Testing CORS Configuration

After adding the URL to CORS settings:

1. Open browser DevTools (F12)
2. Go to the **Console** tab
3. Try uploading a file
4. Look for network requests in the **Network** tab
5. Check if the response includes these headers:
   - `Access-Control-Allow-Origin: http://localhost:5173`
   - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE`

## Security Notes

**For Production:**
- Only add your actual production domain
- Never use `*` (wildcard) in production - it's a security risk
- Remove `localhost` URLs from production CORS settings

**For Development:**
- It's safe to include `localhost` URLs
- Remove test URLs when deploying to production
