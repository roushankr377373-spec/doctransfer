import React from 'react';
import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PremiumBadgeProps {
    size?: number;
    showTooltip?: boolean;
    className?: string;
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({
    size = 16,
    showTooltip = true,
    className = ''
}) => {
    return (
        <Link
            to="/pricing"
            title={showTooltip ? "Upgrade to unlock this feature" : undefined}
            style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                marginLeft: '0.5rem'
            }}
            className={className}
        >
            <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderRadius: '6px',
                padding: '0.15rem 0.4rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s',
                cursor: 'pointer'
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 3px 6px rgba(59, 130, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                }}
            >
                <Crown size={size} color="white" fill="white" />
                <span style={{
                    color: 'white',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase'
                }}>
                    PRO
                </span>
            </div>
        </Link>
    );
};

export default PremiumBadge;
