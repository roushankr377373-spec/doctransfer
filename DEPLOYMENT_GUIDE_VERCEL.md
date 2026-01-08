# Deploying DocTransfer to Vercel

This guide explains how to deploy the DocTransfer application to Vercel.

## Prerequisites

1.  **Vercel Account:** Create an account at [vercel.com](https://vercel.com).
2.  **GitHub Repository:** Ensure your code is pushed to GitHub.
3.  **Supabase Project:** You need your Supabase URL and Anon Key.
4.  **Stripe Accounts:** You need your Stripe Publishable and Secret keys.

## Deployment Steps

### Method 1: Vercel Dashboard (Recommended)

1.  **Login to Vercel:** Go to your Vercel dashboard.
2.  **Add New Project:** Click "Add New..." -> "Project".
3.  **Import Git Repository:** Select your GitHub repository (`roushan3262/DocTransfer` or similar).
4.  **Configure Project:**
    *   **Framework Preset:** Vercel should automatically detect "Vite". If not, select it.
    *   **Root Directory:** `./` (default)
    *   **Build Command:** `npm run build` (default)
    *   **Output Directory:** `dist` (default)
5.  **Environment Variables:**
    Expand the "Environment Variables" section and add the following variables from your `.env` file:
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
    *   `VITE_STRIPE_PUBLISHABLE_KEY`
    *   `VITE_STRIPE_STANDARD_PRICE_ID`
    *   `VITE_STRIPE_BUSINESS_PRICE_ID`
    *   `VITE_CLERK_PUBLISHABLE_KEY`
    *   `VITE_SITE_URL` (Set this to your Vercel deployment URL, e.g., `https://doctransfer.vercel.app`)

    *Note: Do NOT add sensitive backend keys (like `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET`) to the "Environment Variables" section if they are only used in backend functions not present in this frontend repo. However, if you have API routes in `api/` (Vercel Functions), you need them.*

    *Since this project uses Supabase Edge Functions for backend logic, ensure those are deployed to Supabase separately.*

6.  **Deploy:** Click "Deploy".
7.  **Wait:** Vercel will build and deploy your site.

### Method 2: Vercel CLI

1.  **Install CLI:** `npm i -g vercel`
2.  **Login:** `vercel login`
3.  **Deploy:** Run `vercel` in the project root.
4.  **Follow Prompts:** Accept default settings.
5.  **Set Environment Variables:** Go to the Vercel dashboard for your new project and add the variables as described in Method 1.
6.  **Redeploy:** Run `vercel --prod` to trigger a new deployment with variables.

## Verification

- Visit the deployed URL.
- Test navigation: Go to `/pricing` and refresh the page. It should not 404.
- Test Authentication (Clerk) and Database (Supabase) connections.
