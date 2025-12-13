import React from 'react';

interface LogoProps {
    className?: string;
    size?: number | string;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ minWidth: size, filter: 'drop-shadow(0 2px 8px rgba(6, 182, 212, 0.4))' }}
            >
                <defs>
                    {/* Main gradient - Vibrant Turquoise to Coral */}
                    <linearGradient id="doc-gradient-1" x1="8" y1="8" x2="32" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#06B6D4" /> {/* Cyan-500 */}
                        <stop offset="50%" stopColor="#3B82F6" /> {/* Blue-500 */}
                        <stop offset="100%" stopColor="#8B5CF6" /> {/* Violet-500 */}
                    </linearGradient>

                    {/* Second document gradient - Coral to Orange */}
                    <linearGradient id="doc-gradient-2" x1="16" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#F59E0B" /> {/* Amber-500 */}
                        <stop offset="50%" stopColor="#EF4444" /> {/* Red-500 */}
                        <stop offset="100%" stopColor="#EC4899" /> {/* Pink-500 */}
                    </linearGradient>

                    {/* Arrow gradient */}
                    <linearGradient id="arrow-gradient" x1="20" y1="20" x2="32" y2="28" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#10B981" /> {/* Emerald-500 */}
                        <stop offset="100%" stopColor="#14B8A6" /> {/* Teal-500 */}
                    </linearGradient>

                    {/* Glow filter */}
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background Circle - Soft gradient */}
                <circle cx="24" cy="24" r="22" fill="url(#doc-gradient-1)" opacity="0.15" />

                {/* First Document (Back layer) */}
                <rect x="10" y="14" width="18" height="24" rx="2" fill="url(#doc-gradient-1)" opacity="0.9">
                    <animate attributeName="opacity" values="0.9;1;0.9" dur="3s" repeatCount="indefinite" />
                </rect>

                {/* Document lines detail */}
                <line x1="13" y1="20" x2="22" y2="20" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
                <line x1="13" y1="24" x2="25" y2="24" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
                <line x1="13" y1="28" x2="20" y2="28" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />

                {/* Second Document (Front layer) */}
                <rect x="20" y="10" width="18" height="24" rx="2" fill="url(#doc-gradient-2)" opacity="0.95">
                    <animate attributeName="opacity" values="0.95;1;0.95" dur="3s" begin="0.5s" repeatCount="indefinite" />
                </rect>

                {/* Document lines detail */}
                <line x1="23" y1="16" x2="32" y2="16" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />
                <line x1="23" y1="20" x2="35" y2="20" stroke="white" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />
                <line x1="23" y1="24" x2="30" y2="24" stroke="white" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />

                {/* Transfer Arrow - Dynamic */}
                <g filter="url(#glow)">
                    <path
                        d="M 28 32 L 35 32 L 35 28 L 40 33 L 35 38 L 35 34 L 28 34 Z"
                        fill="url(#arrow-gradient)"
                        opacity="0.95"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="translate"
                            values="0,0; 2,0; 0,0"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </path>
                </g>

                {/* Highlight on first doc */}
                <rect x="10" y="14" width="18" height="6" rx="2" fill="white" opacity="0.2" />

                {/* Highlight on second doc */}
                <rect x="20" y="10" width="18" height="6" rx="2" fill="white" opacity="0.25" />

            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{
                    fontWeight: 800,
                    fontSize: typeof size === 'number' ? size * 0.75 : '1.5rem',
                    background: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 50%, #8B5CF6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.02em',
                    fontFamily: 'var(--font-family, sans-serif)'
                }}>
                    DocTransfer
                </span>
            </div>
        </div>
    );
};
export default Logo;
