# Stripe Payment Setup Guide

This guide will help you set up Stripe payments for DocTransfer.

## Prerequisites

1. **Stripe Account**: Create an account at [stripe.com](https://stripe.com)
2. **Supabase Project**: Your database should be set up and running

## Step 1: Configure Stripe

### 1.1 Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click "Developers" → "API keys"
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### 1.2 Create Products and Prices

1. Go to "Products" → "Add product"
2. Create two products:

**Standard Plan:**
- Name: DocTransfer Standard
- Pricing: $19/month recurring
- Copy the **Price ID** (starts with `price_`)

**Business Plan:**
- Name: DocTransfer Business  
- Pricing: $49/month recurring
- Copy the **Price ID** (starts with `price_`)

## Step 2: Configure Environment Variables

1. Copy `.env.stripe.example` to `.env.local`:
   ```bash
   copy .env.stripe.example .env.local
   ```

2. Fill in your Stripe keys:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here
   VITE_STRIPE_STANDARD_PRICE_ID=price_standard_id_here
   VITE_STRIPE_BUSINESS_PRICE_ID=price_business_id_here
   ```

## Step 3: Apply Database Migration

Run the subscription migration in your Supabase SQL editor:

```bash
# Open subscriptions_migration.sql in Supabase dashboard
# Or use Supabase CLI:
supabase db push --db-url "your_connection_string"
```

## Step 4: Deploy Supabase Edge Functions

### 4.1 Install Supabase CLI
```bash
npm install -g supabase
```

### 4.2 Initialize Functions (if not already done)
```bash
supabase functions new create-checkout-session
supabase functions new stripe-webhook
supabase functions new manage-subscription
```

### 4.3 Deploy Functions
```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy manage-subscription
```

## Step 5: Configure Webhook

1. Go to Stripe Dashboard → "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Enter your webhook URL:
   ```
   https://your-project-ref.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add it to your Edge Function secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_your_secret
   ```

## Step 6: Test Payment Flow

### Using Stripe Test Cards

Use these test card numbers in test mode:

- **Successful payment**: `4242 4242 4242 4242`
- **Requires authentication**: `4000 0025 0000 3155`
- **Declined card**: `4000 0000 0000 9995`

For all test cards:
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC
- Use any ZIP code

### Test the Flow

1. Start your dev server: `npm run dev`
2. Go to `/pricing`
3. Click "Get Started" on Standard or Business plan
4. Complete checkout with test card
5. Verify:
   - You're redirected to success page
   - Subscription appears in Supabase `subscriptions` table
   - User has access to premium features

## Step 7: Go Live

Before going live:

1. Switch to **Live mode** in Stripe Dashboard (toggle in top-left)
2. Get your **live API keys**
3. Create **live products and prices**
4. Update environment variables with live keys
5. Create a **live webhook** endpoint
6. Test with real payment methods
7. Enable **production mode** for your Edge Functions

## Troubleshooting

### Webhook not receiving events
- Check webhook URL is correct and publicly accessible
- Verify webhook secret is set correctly  
- Check Stripe Dashboard → Developers → Webhooks for delivery attempts

### Payment not completing
- Check browser console for errors
- Verify Stripe keys are correct
- Ensure price IDs match your Stripe products

### Subscription not created in database
- Check Supabase logs for Edge Function errors
- Verify database migration was applied
- Check RLS policies allow service role to insert

## Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Store secrets in Supabase Edge Function secrets
- [ ] Verify webhook signatures in webhook handler
- [ ] Use HTTPS for all production endpoints
- [ ] Enable RLS policies on all tables
- [ ] Test with real payment methods before launch

## Support

- **Stripe Docs**: https://stripe.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Testing Guide**: https://stripe.com/docs/testing
