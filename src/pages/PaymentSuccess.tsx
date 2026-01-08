import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Check, Sparkles } from 'lucide-react';

const PaymentSuccess: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        // Simulate checking payment status
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{
                        width: '50px',
                        height: '50px',
                        border: '4px solid #e2e8f0',
                        borderTop: '4px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                    }} />
                    <p style={{ color: '#64748b' }}>Processing your payment...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)',
            padding: '2rem'
        }}>
            <div style={{
                maxWidth: '600px',
                width: '100%',
                background: '#ffffff',
                borderRadius: '24px',
                padding: '3rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                textAlign: 'center'
            }}>
                {/* Success Icon */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem',
                    boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
                }}>
                    <Check size={40} color="white" strokeWidth={3} />
                </div>

                {/* Success Message */}
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '800',
                    marginBottom: '1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>
                    Payment Successful!
                </h1>

                <p style={{
                    fontSize: '1.125rem',
                    color: '#64748b',
                    marginBottom: '2rem',
                    lineHeight: '1.6'
                }}>
                    Thank you for subscribing to DocTransfer. Your account has been upgraded and you now have access to all premium features.
                </p>

                {/* Features Badge */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    padding: '1.5rem',
                    borderRadius: '16px',
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
                        <Sparkles size={18} color="#667eea" />
                        <span style={{
                            fontWeight: '700',
                            color: '#475569'
                        }}>
                            What's Next?
                        </span>
                    </div>
                    <p style={{
                        fontSize: '0.9rem',
                        color: '#64748b',
                        margin: 0
                    }}>
                        Head to your dashboard to start uploading documents with your new premium features!
                    </p>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    flexDirection: 'column'
                }}>
                    <button
                        onClick={() => navigate('/dataroom')}
                        style={{
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 28px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                        }}
                    >
                        Go to Dashboard
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: '1rem 2rem',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            background: 'transparent',
                            color: '#475569',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        Back to Home
                    </button>
                </div>

                {/* Session ID (for debugging) */}
                {sessionId && (
                    <p style={{
                        marginTop: '2rem',
                        fontSize: '0.75rem',
                        color: '#94a3b8'
                    }}>
                        Session ID: {sessionId}
                    </p>
                )}
            </div>

            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default PaymentSuccess;
