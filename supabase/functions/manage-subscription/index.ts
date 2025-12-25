import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { action, userId, subscriptionId } = await req.json()

        // Initialize Stripe
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        // Initialize Supabase
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        switch (action) {
            case 'cancel': {
                // Cancel subscription at period end
                const subscription = await stripe.subscriptions.update(subscriptionId, {
                    cancel_at_period_end: true,
                })

                // Update in database
                await supabaseAdmin
                    .from('subscriptions')
                    .update({ cancel_at_period_end: true })
                    .eq('stripe_subscription_id', subscriptionId)

                return new Response(
                    JSON.stringify({ success: true, subscription }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            case 'resume': {
                // Resume a subscription that was set to cancel
                const subscription = await stripe.subscriptions.update(subscriptionId, {
                    cancel_at_period_end: false,
                })

                await supabaseAdmin
                    .from('subscriptions')
                    .update({ cancel_at_period_end: false })
                    .eq('stripe_subscription_id', subscriptionId)

                return new Response(
                    JSON.stringify({ success: true, subscription }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            case 'create_portal_session': {
                // Create a Stripe billing portal session
                const { data: subscription } = await supabaseAdmin
                    .from('subscriptions')
                    .select('stripe_customer_id')
                    .eq('user_id', userId)
                    .single()

                if (!subscription?.stripe_customer_id) {
                    throw new Error('No customer ID found')
                }

                const portalSession = await stripe.billingPortal.sessions.create({
                    customer: subscription.stripe_customer_id,
                    return_url: `${req.headers.get('origin')}/dashboard`,
                })

                return new Response(
                    JSON.stringify({ url: portalSession.url }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            default:
                throw new Error('Invalid action')
        }
    } catch (error) {
        console.error('Error managing subscription:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
