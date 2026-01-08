import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';

export interface Subscription {
    id: string;
    user_id: string;
    // stripe_customer_id: string | null;
    // stripe_subscription_id: string | null;
    plan_type: 'free' | 'standard' | 'business';
    status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    trial_end: string | null;
    created_at: string;
    updated_at: string;
}

export interface SubscriptionUsage {
    documents_uploaded: number;
    storage_used: number; // in bytes
    month: string;
}

/**
 * Custom hook to fetch and manage user subscription data
 */
export const useSubscription = () => {
    const { user } = useUser();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const fetchSubscription = async () => {
            try {
                setIsLoading(true);

                // Fetch subscription
                const { data: subData, error: subError } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows returned
                    throw subError;
                }

                // If no subscription found, create a default free subscription
                if (!subData) {
                    const { data: newSub, error: createError } = await supabase
                        .from('subscriptions')
                        .insert({
                            user_id: user.id,
                            plan_type: 'free',
                            status: 'active'
                        })
                        .select()
                        .single();

                    if (createError) throw createError;
                    setSubscription(newSub);
                } else {
                    setSubscription(subData);
                }

                // Fetch current month usage
                const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
                const { data: usageData, error: usageError } = await supabase
                    .from('subscription_usage')
                    .select('documents_uploaded, storage_used, month')
                    .eq('user_id', user.id)
                    .eq('month', currentMonth)
                    .single();

                if (usageError && usageError.code !== 'PGRST116') {
                    throw usageError;
                }

                setUsage(usageData || {
                    documents_uploaded: 0,
                    storage_used: 0,
                    month: currentMonth
                });

                setError(null);
            } catch (err) {
                console.error('Error fetching subscription:', err);
                setError(err as Error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubscription();

        // Set up real-time subscription to subscription changes
        const channel = supabase
            .channel('subscription-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'subscriptions',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    setSubscription(payload.new as Subscription);
                }
            )
            .subscribe();

        // Subscribe to usage changes
        const usageChannel = supabase
            .channel('usage-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'subscription_usage',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    // Only update if it's for the current month
                    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
                    const newData = payload.new as SubscriptionUsage;
                    if (newData && newData.month === currentMonth) {
                        setUsage(newData);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(usageChannel);
        };
    }, [user]);

    /**
     * Check if user can upload based on their plan and usage
     */
    const canUpload = (): boolean => {
        if (!subscription) return false;

        // Paid plans have unlimited uploads
        if (subscription.plan_type === 'standard' || subscription.plan_type === 'business') {
            return true;
        }

        // Free plan: check if under 300 uploads this month (approx 10/day)
        return (usage?.documents_uploaded || 0) < 300;
    };

    /**
     * Get max file size for user's plan (in bytes)
     */
    const getMaxFileSize = (): number => {
        if (!subscription) return 30 * 1024 * 1024; // 30MB default for free

        switch (subscription.plan_type) {
            case 'free':
                return 10 * 1024 * 1024; // 10MB
            case 'standard':
                return 500 * 1024 * 1024; // 500MB
            case 'business':
                return Infinity; // Unlimited
            default:
                return 30 * 1024 * 1024;
        }
    };

    /**
     * Check if user has access to a specific feature
     */
    const hasFeature = (feature: string): boolean => {
        if (!subscription) return false;

        const featureMap: Record<string, string[]> = {
            'custom_branding': ['standard', 'business'],
            'link_expiration': ['free', 'standard', 'business'],
            'email_notifications': ['standard', 'business'],
            'email_verification': ['standard', 'business'],
            'screenshot_protection': ['standard', 'business'],
            'watermarking': ['standard', 'business'],
            'burn_after_reading': ['free', 'standard', 'business'],
            'advanced_analytics': ['standard', 'business'],
            'audit_trails': ['standard', 'business'],
            'priority_support': ['standard', 'business'],
            'vault_mode': ['business'],
            'biometric_auth': ['business'],
            'e_signature': ['business'],
            'document_bundles': ['business'],
            'sso_integration': ['business'],
            'white_label': ['business'],
            'dedicated_manager': ['business'],
            'custom_integrations': ['business'],
            'sla_guarantee': ['business'],
        };

        return featureMap[feature]?.includes(subscription.plan_type) || false;
    };

    /**
     * Check if a feature is locked for the current plan
     */
    const isFeatureLocked = (feature: string): boolean => {
        return !hasFeature(feature);
    };

    /**
     * Get remaining uploads for the current month (for free plan)
     */
    const getRemainingUploads = (): number => {
        if (!subscription || subscription.plan_type !== 'free') return Infinity; // Unlimited for paid plans
        const currentUploads = usage?.documents_uploaded || 0;
        return Math.max(0, 300 - currentUploads);
    };

    /**
     * Get storage duration in days
     */
    const getStorageDurationDays = (): number => {
        if (!subscription) return 30;
        switch (subscription.plan_type) {
            case 'free':
                return 1; // 1 day
            case 'standard':
                return 365; // 1 year
            case 'business':
                return 36500; // 100 years (effectively unlimited)
            default:
                return 30;
        }
    };

    return {
        subscription,
        usage,
        isLoading,
        error,
        canUpload,
        getMaxFileSize,
        hasFeature,
        isFeatureLocked,

        getRemainingUploads,
        getStorageDurationDays,
        isPaid: subscription?.plan_type !== 'free',
        isStandard: subscription?.plan_type === 'standard',
        isBusiness: subscription?.plan_type === 'business',
    };
};

export default useSubscription;
