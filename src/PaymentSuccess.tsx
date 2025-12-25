import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { user } = useUser();
    const [isVerified, setIsVerified] = useState(false);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const checkSubscription = async () => {
            if (!user) return; // Wait for user to be loaded

            // Polling logic to wait for webhook to update DB
            let attempts = 0;
            const maxAttempts = 10;

            const poll = async () => {
                try {
                    const { data } = await supabase
                        .from('subscriptions')
                        .select('status')
                        .eq('user_id', user.id)
                        .single();

                    if (data && (data.status === 'active' || data.status === 'trialing')) {
                        setIsVerified(true);
                        setVerifying(false);
                        return;
                    }
                } catch (err) {
                    console.error("Error checking subscription:", err);
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 2000); // Retry every 2 seconds
                } else {
                    setVerifying(false); // Stop verifying after timeout
                }
            };

            poll();
        };

        if (sessionId && user) {
            checkSubscription();
        } else if (!sessionId) {
            setVerifying(false);
        }
    }, [sessionId, user]);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: '3rem',
                maxWidth: '600px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
            }}>
                {/* Success Icon */}
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: verifying ? '#e2e8f0' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem',
                    boxShadow: verifying ? 'none' : '0 12px 24px rgba(16, 185, 129, 0.3)',
                    animation: verifying ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'successPulse 2s ease-in-out infinite',
                    transition: 'all 0.5s ease'
                }}>
                    {verifying ? (
                        <Loader2 size={50} color="#64748b" className="animate-spin" />
                    ) : (
                        <Check size={50} color="white" strokeWidth={3} />
                    )}
                </div>

                {/* Success Message */}
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '1rem'
                }}>
                    {verifying ? 'Verifying Payment...' : 'Payment Successful! 🎉'}
                </h1>

                <p style={{
                    color: '#64748b',
                    fontSize: '1.125rem',
                    lineHeight: '1.6',
                    marginBottom: '2rem'
                }}>
                    {verifying ? (
                        <>We're confirming your subscription details from the bank.</>
                    ) : isVerified ? (
                        <>
                            Your subscription has been activated successfully. You now have access to all premium features!
                        </>
                    ) : (
                        <>
                            Your payment was processed, but we're still setting up your account. If this takes longer than a minute, please contact support.
                        </>
                    )}
                </p>

                {/* Features badge */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem',
                    border: '1px solid rgba(102, 126, 234, 0.2)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.75rem'
                    }}>
                        <Sparkles size={20} color="#f59e0b" />
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            color: '#1e293b',
                            margin: 0
                        }}>
                            What's Next?
                        </h3>
                    </div>
                    <p style={{
                        color: '#64748b',
                        fontSize: '0.9rem',
                        margin: 0,
                        lineHeight: '1.5'
                    }}>
                        Head to your dashboard to start uploading documents with your new premium features and enhanced limits.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <Link to="/dataroom" style={{ textDecoration: 'none' }}>
                        <button style={{
                            width: '100%',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: verifying ? 0.7 : 1,
                            pointerEvents: verifying ? 'none' : 'auto'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                            }}>
                            Go to Dashboard
                            <ArrowRight size={20} />
                        </button>
                    </Link>

                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <button style={{
                            width: '100%',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            border: '2px solid #e2e8f0',
                            background: 'white',
                            color: '#64748b',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#cbd5e1';
                                e.currentTarget.style.color = '#475569';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.color = '#64748b';
                            }}>
                            Back to Home
                        </button>
                    </Link>
                </div>

                {/* Session ID (for debugging) */}
                {sessionId && (
                    <p style={{
                        marginTop: '2rem',
                        fontSize: '0.75rem',
                        color: '#94a3b8'
                    }}>
                        Session: {sessionId.substring(0, 20)}...
                    </p>
                )}
            </div>

            <style>
                {`
                    @keyframes successPulse {
                        0%, 100% {
                            transform: scale(1);
                        }
                        50% {
                            transform: scale(1.05);
                        }
                    }
                     @keyframes pulse {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: .5;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default PaymentSuccess;
