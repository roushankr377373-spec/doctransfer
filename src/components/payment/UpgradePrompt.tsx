import React from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UpgradePromptProps {
    feature: string;
    requiredPlan: 'standard' | 'business';
    onClose: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ feature, requiredPlan, onClose }) => {
    const navigate = useNavigate();

    const planFeatures = {
        standard: [
            'Unlimited document uploads',
            '500MB file size limit',
            'Custom branding & watermarking',
            'Advanced analytics',
            'Priority support'
        ],
        business: [
            'Everything in Standard',
            'Unlimited file size',
            'Vault Mode encryption',
            'Biometric authentication',
            'E-signature requests',
            'SSO integration'
        ]
    };

    const planPrices = {
        standard: '$19/month',
        business: '$49/month'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        }} onClick={onClose}>
            <div
                style={{
                    background: '#ffffff',
                    borderRadius: '24px',
                    maxWidth: '500px',
                    width: '100%',
                    padding: '2.5rem',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    border: '1px solid #e2e8f0',
                    position: 'relative'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <X size={20} color="#64748b" />
                </button>

                {/* Icon */}
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: '0 8px 20px rgba(245, 87, 108, 0.3)'
                }}>
                    <Sparkles size={28} color="white" />
                </div>

                {/* Title */}
                <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: '800',
                    marginBottom: '0.75rem',
                    color: '#1e293b'
                }}>
                    Upgrade Required
                </h2>

                {/* Description */}
                <p style={{
                    fontSize: '1rem',
                    color: '#64748b',
                    marginBottom: '1.5rem',
                    lineHeight: '1.6'
                }}>
                    <strong>{feature}</strong> is a premium feature available on the{' '}
                    <span style={{
                        fontWeight: '700',
                        color: '#1e293b',
                        textTransform: 'capitalize'
                    }}>
                        {requiredPlan} Plan
                    </span>.
                </p>

                {/* Plan Price */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(102, 126, 234, 0.2)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        <span style={{
                            fontSize: '2.5rem',
                            fontWeight: '900',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {planPrices[requiredPlan].split('/')[0]}
                        </span>
                        <span style={{
                            fontSize: '1.125rem',
                            color: '#64748b',
                            fontWeight: '500'
                        }}>
                            /month
                        </span>
                    </div>

                    {/* Features List */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem'
                    }}>
                        {planFeatures[requiredPlan].slice(0, 3).map((feat, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.875rem',
                                    color: '#475569'
                                }}
                            >
                                <Check size={16} color="#10b981" strokeWidth={3} />
                                <span>{feat}</span>
                            </div>
                        ))}
                        <span style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            fontStyle: 'italic',
                            marginLeft: '1.5rem'
                        }}>
                            + {planFeatures[requiredPlan].length - 3} more features
                        </span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexDirection: 'column'
                }}>
                    <button
                        onClick={() => {
                            navigate('/pricing');
                            onClose();
                        }}
                        style={{
                            padding: '1rem 1.5rem',
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
                        View Pricing Plans
                    </button>

                    <button
                        onClick={onClose}
                        style={{
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            background: 'transparent',
                            color: '#64748b',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradePrompt;
