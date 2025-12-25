import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise: Promise<Stripe | null> = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

interface StripeProviderProps {
    children: React.ReactNode;
}

/**
 * StripeProvider wraps the application with Stripe Elements context
 * This enables use of Stripe components and hooks throughout the app
 */
export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
    return (
        <Elements stripe={stripePromise}>
            {children}
        </Elements>
    );
};

export default StripeProvider;
