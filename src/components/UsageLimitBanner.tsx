import React from 'react';
import { Upload, AlertTriangle, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface UsageLimitBannerProps {
    currentUploads: number;
    maxUploads: number;
    planType: 'free' | 'standard' | 'business';
}

const UsageLimitBanner: React.FC<UsageLimitBannerProps> = ({
    currentUploads,
    maxUploads,
    planType
}) => {
    // Only show for free plan
    if (planType !== 'free') return null;

    const percentage = (currentUploads / maxUploads) * 100;
    const remaining = maxUploads - currentUploads;
    const isNearLimit = percentage >= 80;
    const isAtLimit = currentUploads >= maxUploads;

    // Determine colors based on usage
    const getColors = () => {
        if (isAtLimit) {
            return {
                bg: '#fef2f2',
                border: '#fecaca',
                text: '#991b1b',
                progress: '#dc2626'
            };
        } else if (isNearLimit) {
            return {
                bg: '#fffbeb',
                border: '#fde68a',
                text: '#92400e',
                progress: '#f59e0b'
            };
        }
        return {
            bg: '#eff6ff',
            border: '#bfdbfe',
            text: '#1e40af',
            progress: '#3b82f6'
        };
    };

    const colors = getColors();

    return (
        <div style={{
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isAtLimit ? (
                        <AlertTriangle size={20} color={colors.text} />
                    ) : (
                        <Upload size={20} color={colors.text} />
                    )}
                    <div>
                        <h4 style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: colors.text,
                            margin: 0,
                            marginBottom: '0.125rem'
                        }}>
                            {isAtLimit ? 'Upload Limit Reached' : `${remaining} upload${remaining !== 1 ? 's' : ''} remaining this month`}
                        </h4>
                        <p style={{
                            fontSize: '0.75rem',
                            color: colors.text,
                            opacity: 0.8,
                            margin: 0
                        }}>
                            {isAtLimit
                                ? 'Upgrade to continue uploading documents'
                                : `Using ${currentUploads} of ${maxUploads} monthly uploads`
                            }
                        </p>
                    </div>
                </div>

                {(isAtLimit || isNearLimit) && (
                    <Link to="/pricing" style={{ textDecoration: 'none' }}>
                        <button style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem 1rem',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
                            transition: 'all 0.2s'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
                            }}
                        >
                            <Crown size={14} />
                            Upgrade
                        </button>
                    </Link>
                )}
            </div>

            {/* Progress Bar */}
            <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '3px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${Math.min(percentage, 100)}%`,
                    height: '100%',
                    background: colors.progress,
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                }} />
            </div>
        </div>
    );
};

export default UsageLimitBanner;
