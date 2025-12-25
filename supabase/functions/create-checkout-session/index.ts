// @ts-nocheck
// This is a Deno Edge Function - TypeScript errors are expected when viewed in Node.js IDE
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'

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
        const body = await req.json()
        const { priceId, userId, planType } = body
        console.log(`Received request: priceId=${priceId}, userId=${userId}, planType=${planType}`)

        const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
        console.log(`Stripe Secret Key present: ${!!stripeSecretKey}, Length: ${stripeSecretKey?.length}`)

        if (!stripeSecretKey) {
            console.error('STRIPE_SECRET_KEY is not set');
            return new Response(
                JSON.stringify({ error: 'Server configuration error: STRIPE_SECRET_KEY not set' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500,
                }
            )
        }

        // Initialize Stripe
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        })

        if (!priceId) {
            console.error('Missing priceId in request')
            return new Response(
                JSON.stringify({ error: 'Missing priceId' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        console.log('Creating Stripe Checkout Session...')
        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card', 'amazon_pay'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.get('origin')}/pricing`,
            client_reference_id: userId,
            metadata: {
                userId,
                planType,
            },
            subscription_data: {
                metadata: {
                    userId,
                    planType,
                },
            },
        })

        console.log('Session created successfully:', session.id)

        return new Response(
            JSON.stringify({ sessionId: session.id, url: session.url }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error creating checkout session details:', error)

        let errorMessage = 'Unknown error occurred'
        let userFriendlyMessage = 'Failed to create checkout session'

        // Check for specific Stripe errors
        if (error instanceof Stripe.errors.StripeAuthenticationError) {
            console.error('Stripe Authentication Error - Invalid API Key')
            errorMessage = 'Invalid Stripe API key. Please check your STRIPE_SECRET_KEY in Supabase secrets.'
            userFriendlyMessage = 'Server configuration error: Invalid payment gateway credentials. Please contact support.'
        } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
            console.error('Stripe Invalid Request:', error.message)
            errorMessage = `Invalid request to Stripe: ${error.message}`
            userFriendlyMessage = 'Payment configuration error. Please contact support.'
        } else if (error instanceof Stripe.errors.StripeError) {
            console.error('Stripe Error Type:', error.type)
            console.error('Stripe Error Code:', error.code)
            errorMessage = error.message || 'Stripe error occurred'
            userFriendlyMessage = 'Payment gateway error. Please try again or contact support.'
        } else {
            errorMessage = error.message || 'Unknown error occurred in edge function'
        }

        return new Response(
            JSON.stringify({
                error: userFriendlyMessage,
                details: errorMessage,
                errorType: error.constructor.name
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})
