import React from 'react';
import { X, Crown, Check, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, featureName }) => {
    if (!isOpen) return null;

    const premiumFeatures = [
        'Unlimited document uploads',
        'Up to 500MB file size limit',
        'Custom branding & watermarks',
        'Advanced analytics & audit trails',
        'Priority support',
        'And much more...'
    ];

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '1rem'
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '24px',
                    maxWidth: '500px',
                    width: '100%',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gradient Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    padding: '2rem',
                    position: 'relative'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                    >
                        <X size={20} color="white" />
                    </button>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem'
                        }}>
                            <Crown size={32} color="white" fill="white" />
                        </div>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: '700',
                            color: 'white',
                            marginBottom: '0.5rem'
                        }}>
                            Upgrade to Premium
                        </h2>
                        {featureName && (
                            <p style={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '0.95rem'
                            }}>
                                Unlock <strong>{featureName}</strong> and more
                            </p>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem' }}>
                    <p style={{
                        color: '#6b7280',
                        marginBottom: '1.5rem',
                        lineHeight: '1.6'
                    }}>
                        Upgrade to Standard or Business plan to unlock powerful features and take your document sharing to the next level.
                    </p>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '1rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Premium Features Include:
                        </h3>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem'
                        }}>
                            {premiumFeatures.map((feature, index) => (
                                <li key={index} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <div style={{
                                        background: '#3b82f6',
                                        borderRadius: '50%',
                                        padding: '2px',
                                        flexShrink: 0
                                    }}>
                                        <Check size={12} color="white" />
                                    </div>
                                    <span style={{
                                        fontSize: '0.9rem',
                                        color: '#374151'
                                    }}>
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Link to="/pricing" style={{ textDecoration: 'none' }}>
                        <button
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                            }}
                        >
                            View Pricing Plans
                            <Zap size={18} />
                        </button>
                    </Link>

                    <p style={{
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '0.8rem',
                        marginTop: '1rem'
                    }}>
                        Start your 14-day free trial • No credit card required
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
