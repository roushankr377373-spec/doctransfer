# Data Retention Policy Setup Guide

This guide explains how to deploy and schedule the 1-day data retention policy for Free Plan users.

## Overview
We have created a Supabase Edge Function `cleanup-free-storage` that:
1.  Identifies users with "Standard" or "Business" plans.
2.  Finds all documents older than 24 hours.
3.  Deletes documents (and their files) if the user is **not** in the paid list (i.e., Free Plan or Anonymous).

## Deployment Steps

### 1. Prerequisite: Login to Supabase CLI
Ensure you are logged in to your Supabase account in your terminal:
```bash
npx supabase login
```

### 2. Deploy the Function
Run the following command to deploy the function to your Supabase project:
```bash
npx supabase functions deploy cleanup-free-storage --no-verify-jwt
```
> **Note**: We use `--no-verify-jwt` because this function effectively runs as a background cron job, not triggered by a user's browser session directly.

### 3. Set Environment Variables
The function needs the Service Role Key to perform deletions (bypassing some safety checks).
Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> Settings -> API.
Copy:
- `Project URL` (SUPABASE_URL)
- `service_role key` (SUPABASE_SERVICE_ROLE_KEY)

Set them for the function:
```bash
npx supabase secrets set SUPABASE_URL=your_project_url SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Schedule the Function (Cron Job)
To run this automatically every hour (or day), you need to set up a Cron schedule.

**Option A: Using pg_cron (Recommended)**
Run this SQL in your Supabase SQL Editor:
```sql
select
  cron.schedule(
    'cleanup-free-storage-daily',
    '0 0 * * *', -- Runs at midnight every day
    $$
    select
      net.http_post(
        url:='https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/cleanup-free-storage',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer <YOUR_ANON_KEY>"}'::jsonb
      ) as request_id;
    $$
  );
```
*Replace `<YOUR_PROJECT_REF>` and `<YOUR_ANON_KEY>` with your actual values.*

**Option B: Manual Trigger (For Testing)**
You can trigger it manually to test:
```bash
curl -i -X POST https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/cleanup-free-storage \
  -H "Authorization: Bearer <YOUR_ANON_KEY>"
```
