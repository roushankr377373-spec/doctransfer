import React, { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { CreditCard, Calendar, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SubscriptionManager: React.FC = () => {
    const { subscription, usage, isLoading } = useSubscription();
    const [actionLoading, setActionLoading] = useState(false);

    if (isLoading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading subscription...</div>;
    }

    if (!subscription) {
        return <div style={{ padding: '2rem' }}>No subscription found</div>;
    }

    const handleManageSubscription = async () => {
        try {
            setActionLoading(true);

            const { data, error } = await supabase.functions.invoke('manage-subscription', {
                body: {
                    action: 'create_portal_session',
                    userId: subscription.user_id
                }
            });

            if (error) throw error;

            if (data?.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Error opening billing portal:', error);
            alert('Failed to open billing portal. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case 'business': return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            case 'standard': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            default: return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }
    };

    const getPlanName = (plan: string) => {
        switch (plan) {
            case 'business': return 'Business Plan';
            case 'standard': return 'Standard Plan';
            default: return 'Free Plan';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div style={{
            maxWidth: '800px',
            margin: '2rem auto',
            padding: '0 1rem'
        }}>
            <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '800',
                marginBottom: '2rem',
                color: '#1e293b'
            }}>
                Subscription Management
            </h2>

            {/* Current Plan Card */}
            <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            background: getPlanColor(subscription.plan_type),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CreditCard size={24} color="white" />
                        </div>
                        <div>
                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                color: '#1e293b',
                                marginBottom: '0.25rem'
                            }}>
                                {getPlanName(subscription.plan_type)}
                            </h3>
                            <span style={{
                                fontSize: '0.875rem',
                                color: subscription.status === 'active' ? '#10b981' : '#f59e0b',
                                fontWeight: '600',
                                textTransform: 'capitalize'
                            }}>
                                {subscription.status}
                            </span>
                        </div>
                    </div>

                    {subscription.plan_type !== 'free' && (
                        <button
                            onClick={handleManageSubscription}
                            disabled={actionLoading}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: '#ffffff',
                                color: '#475569',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: actionLoading ? 0.6 : 1
                            }}
                        >
                            <ExternalLink size={16} />
                            {actionLoading ? 'Loading...' : 'Manage Billing'}
                        </button>
                    )}
                </div>

                {/* Billing Details */}
                {subscription.plan_type !== 'free' && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '1rem',
                        paddingTop: '1.5rem',
                        borderTop: '1px solid #e2e8f0'
                    }}>
                        <div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '0.5rem'
                            }}>
                                <Calendar size={16} color="#64748b" />
                                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                    Current Period
                                </span>
                            </div>
                            <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>
                                {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                            </p>
                        </div>

                        {subscription.cancel_at_period_end && (
                            <div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    marginBottom: '0.5rem'
                                }}>
                                    <AlertCircle size={16} color="#ef4444" />
                                    <span style={{ fontSize: '0.875rem', color: '#ef4444' }}>
                                        Cancellation Scheduled
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>
                                    Ends on {formatDate(subscription.current_period_end)}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Usage Card */}
            {usage && (
                <div style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '1.5rem',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                    }}>
                        <TrendingUp size={20} color="#667eea" />
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            color: '#1e293b',
                            margin: 0
                        }}>
                            Usage This Month
                        </h3>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        <div>
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#64748b',
                                marginBottom: '0.5rem'
                            }}>
                                Documents Uploaded
                            </p>
                            <p style={{
                                fontSize: '2rem',
                                fontWeight: '800',
                                color: '#1e293b',
                                margin: 0
                            }}>
                                {usage.documents_uploaded}
                                {subscription.plan_type === 'free' && (
                                    <span style={{
                                        fontSize: '1rem',
                                        color: '#64748b',
                                        fontWeight: '500'
                                    }}>
                                        {' '}/ 10
                                    </span>
                                )}
                            </p>
                        </div>

                        <div>
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#64748b',
                                marginBottom: '0.5rem'
                            }}>
                                Storage Used
                            </p>
                            <p style={{
                                fontSize: '2rem',
                                fontWeight: '800',
                                color: '#1e293b',
                                margin: 0
                            }}>
                                {(usage.storage_used / (1024 * 1024)).toFixed(1)}
                                <span style={{
                                    fontSize: '1rem',
                                    color: '#64748b',
                                    fontWeight: '500'
                                }}>
                                    {' '}MB
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Prompt for Free Users */}
            {subscription.plan_type === 'free' && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    borderRadius: '16px',
                    padding: '2rem',
                    border: '1px solid rgba(102, 126, 234, 0.2)',
                    textAlign: 'center'
                }}>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem',
                        color: '#1e293b'
                    }}>
                        Ready to Unlock More Features?
                    </h3>
                    <p style={{
                        color: '#64748b',
                        marginBottom: '1.5rem'
                    }}>
                        Upgrade to Standard or Business to get unlimited uploads, larger file sizes, and premium features.
                    </p>
                    <button
                        onClick={() => window.location.href = '/pricing'}
                        style={{
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
                        }}
                    >
                        View Pricing Plans
                    </button>
                </div>
            )}
        </div>
    );
};

export default SubscriptionManager;
