import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Stripe Webhook Handler Loaded')

serve(async (req) => {
    try {
        const signature = req.headers.get('Stripe-Signature')
        const body = await req.text()

        // Get env vars
        const stripePriceIdStandard = Deno.env.get('STRIPE_PRICE_ID_STANDARD')
        const stripePriceIdBusiness = Deno.env.get('STRIPE_PRICE_ID_BUSINESS')
        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET')
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceRoleKey) {
            console.error('Missing environment variables')
            return new Response('Server configuration error', { status: 500 })
        }

        // Initialize Stripe and Supabase
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

        // Verify signature
        let event
        try {
            event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`)
            return new Response(`Webhook Error: ${err.message}`, { status: 400 })
        }

        console.log(`Processing event: ${event.type}`)

        // Handle events
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object
                const userId = session.client_reference_id
                const stripeCustomerId = session.customer as string
                const stripeSubscriptionId = session.subscription as string
                const metadata = session.metadata

                if (!userId) {
                    console.error('No user_id found in session')
                    return new Response('No user_id found', { status: 400 })
                }

                console.log(`Handling checkout.session.completed for user ${userId}`)

                // Get subscription details to find end date
                const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId)
                const planType = metadata?.planType || 'standard' // Fallback or logic to determine plan from price ID

                // Upsert subscription into database
                const { error } = await supabase
                    .from('subscriptions')
                    .upsert({
                        user_id: userId,
                        stripe_customer_id: stripeCustomerId,
                        stripe_subscription_id: stripeSubscriptionId,
                        status: subscription.status,
                        plan_type: planType,
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'user_id' })

                if (error) {
                    console.error('Error upserting subscription:', error)
                    return new Response('Database error', { status: 500 })
                }
                break
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object
                const stripeSubscriptionId = subscription.id
                const status = subscription.status

                console.log(`Handling subscription update: ${stripeSubscriptionId}, status: ${status}`)

                const { error } = await supabase
                    .from('subscriptions')
                    .update({
                        status: status,
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .eq('stripe_subscription_id', stripeSubscriptionId)

                if (error) {
                    console.error('Error updating subscription:', error)
                    return new Response('Database error', { status: 500 })
                }
                break
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (err: any) {
        console.error(`Webhook handler error: ${err.message}`)
        return new Response(`Server Error: ${err.message}`, { status: 500 })
    }
})
