// Stripe Checkout Utilities
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface CheckoutSessionParams {
    priceId: string;
    userId: string;
    planType: 'standard' | 'business';
}

/**
 * Creates a Stripe checkout session and redirects the user to Stripe Checkout
 */
export async function createCheckoutSession({ priceId, userId, planType }: CheckoutSessionParams) {
    try {
        // Call the Supabase Edge Function to create a checkout session
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
                priceId,
                userId,
                planType,
            },
        });

        if (error) {
            console.error('Error creating checkout session:', error);
            throw new Error(error.message || 'Failed to create checkout session');
        }

        // Check if the response contains an error (even with 200 status)
        if (data?.error) {
            console.error('Edge function returned error:', data);
            // Use the user-friendly message from the Edge Function
            throw new Error(data.error);
        }

        if (!data?.url) {
            throw new Error('No checkout URL returned');
        }

        // Redirect to Stripe Checkout
        window.location.href = data.url;
    } catch (err: any) {
        console.error('Checkout error:', err);
        // Log more details if available
        if (err) {
            console.error('Error details object:', err);
            console.error('Error message:', err.message);
            console.error('Error string:', err.toString());
        }
        throw err;
    }
}

/**
 * Get the price ID for a plan type from environment variables
 */
export function getPriceId(planType: 'standard' | 'business'): string {
    const priceId = planType === 'standard'
        ? import.meta.env.VITE_STRIPE_STANDARD_PRICE_ID
        : import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID;

    if (!priceId) {
        throw new Error(`Price ID not found for plan: ${planType}`);
    }

    return priceId;
}
