import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import Logo from './components/Logo';
import {
    Check,
    X,
    Briefcase,
    Rocket,
    Users,
    Sparkles,
    Zap,
    HelpCircle
} from 'lucide-react';

const Pricing: React.FC = () => {
    const { user } = useUser();
    // const [loading, setLoading] = useState<string | null>(null);
    // const [error, setError] = useState<string | null>(null);


    const handleSubscribe = async (planType: 'standard' | 'business') => {
        // Stripe integration removed
        // setError('Payment gateway is currently under maintenance. Please contact sales.');
        console.log('Subscribe clicked for:', planType);
    };

    const plans = [
        {
            name: 'Free Plan',
            planType: null,
            icon: Users,
            price: '$0',
            period: '/month',
            target: 'Individuals & personal use',
            description: 'Perfect for trying out DocTransfer',
            features: [
                { text: '10 document uploads per day', included: true },
                { text: '10 MB file size limit', included: true },
                { text: 'Basic password protection', included: true },
                { text: 'Email verification', included: false },
                { text: 'Screenshot protection', included: false },
                { text: '1-day document storage', included: true },
                { text: 'Download controls', included: true },
                { text: 'Link expiration controls', included: true },
                { text: 'Burn After Reading', included: true },
                { text: 'Basic analytics', included: true },
                { text: 'DocTransfer branding', included: true },
                { text: 'Custom branding', included: false },
                { text: 'Advanced analytics', included: false },
                { text: 'Priority support', included: false }
            ],
            cta: 'Get Started Free',
            ctaLink: '/dataroom',
            popular: false,
            gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            glowColor: 'rgba(59, 130, 246, 0.5)',
            accentColor: '#3b82f6'
        },
        {
            name: 'Standard Plan',
            planType: 'standard' as const,
            icon: Briefcase,
            price: '$29',
            period: '/month',
            annualPrice: '$290/year',
            annualSavings: 'Save 17%',
            target: 'Professionals & small teams',
            description: 'Everything you need to share professionally',
            features: [
                { text: 'Everything in Free, plus:', included: true, bold: true },
                { text: 'Unlimited document uploads', included: true },
                { text: '500MB file size limit', included: true },
                { text: 'Custom branding (logo & colors)', included: true },
                { text: 'Dynamic watermarking', included: true },
                { text: 'Advanced analytics with page tracking', included: true },
                { text: 'Audit trails', included: true },
                { text: 'Email notifications', included: true },
                { text: 'Email verification', included: true },
                { text: 'Screenshot protection', included: true },
                { text: 'Priority support', included: true },
                { text: '1-year document storage', included: true },
                { text: 'Biometric authentication', included: false },
                { text: 'SSO integration', included: false }
            ],
            upcomingFeatures: [
                { text: 'Slack Integration' },
                { text: 'Team Management Dashboard' }
            ],

            cta: 'Coming Soon',
            ctaLink: '/dataroom',
            isComingSoon: true,
            popular: true,
            gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
            glowColor: 'rgba(168, 85, 247, 0.5)',
            accentColor: '#a855f7'
        },
        {
            name: 'Business Plan',
            planType: 'business' as const,
            icon: Rocket,
            price: '$79',
            period: '/month',
            annualPrice: '$790/year',
            annualSavings: 'Save 17%',
            target: 'Teams & enterprises',
            description: 'Advanced features for growing organizations',
            features: [
                { text: 'Everything in Standard, plus:', included: true, bold: true },
                { text: 'Unlimited file size', included: true },
                { text: 'Vault Mode (Client-Side Encryption)', included: true },
                { text: 'Biometric authentication (Face ID, Fingerprint)', included: true },
                { text: 'E-signature requests', included: true },
                { text: 'Document bundles (multi-file sharing)', included: true },
                { text: 'Advanced compliance reports', included: true },
                { text: 'SSO integration', included: true },
                { text: 'Unlimited storage', included: true },
                { text: 'White-label solution', included: true },
                { text: 'Dedicated account manager', included: true },
                { text: 'Custom integrations', included: true },
                { text: 'SLA guarantee', included: true }
            ],
            upcomingFeatures: [
                { text: 'Data Loss Prevention (DLP)' },
                { text: 'Dedicated IP Address' },
                { text: 'Audit Trail API' }
            ],

            cta: 'Coming Soon',
            ctaLink: '/dataroom',
            isComingSoon: true,
            popular: false,
            gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            glowColor: 'rgba(6, 182, 212, 0.5)',
            accentColor: '#06b6d4'
        }
    ];

    return (
        <div style={{
            background: '#ffffff',
            minHeight: '100vh',
            color: '#0f172a',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 50,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid #e2e8f0'
            }}>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Logo size={32} />
                </Link>
                <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0f172a'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>Home</Link>
                    <a href="/#features" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0f172a'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>Features</a>
                    <a href="/#security" style={{ color: '#64748b', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#0f172a'} onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>Security</a>

                    <SignedOut>
                        <SignInButton mode="modal">
                            <button style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '0.6rem 1.25rem',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                                transition: 'all 0.2s'
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)';
                                }}>
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Link to="/dataroom">
                                <button style={{
                                    background: '#f1f5f9',
                                    color: '#0f172a',
                                    border: '1px solid #e2e8f0',
                                    padding: '0.6rem 1.25rem',
                                    borderRadius: '8px',
                                    fontWeight: 500,
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
                                    Dashboard
                                </button>
                            </Link>
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </SignedIn>
                </nav>
            </header>

            <main style={{ paddingTop: '120px', paddingBottom: '6rem' }}>
                {/* Hero Section */}
                <section style={{ textAlign: 'center', padding: '0 2rem 4rem', position: 'relative' }}>
                    {/* Background decorations */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '800px',
                        height: '400px',
                        background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1) 0%, rgba(255, 255, 255, 0) 70%)',
                        zIndex: -1,
                        pointerEvents: 'none'
                    }} />

                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        padding: '0.5rem 1rem',
                        borderRadius: '100px',
                        marginBottom: '2rem',
                        color: '#2563eb',
                        fontSize: '0.875rem',
                        fontWeight: 500
                    }}>
                        <Sparkles size={16} />
                        <span>Simple, Transparent Pricing</span>
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        color: '#0f172a',
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(to right, #0f172a, #334155)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Choose the Perfect Plan<br />for Your Needs
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: '#64748b',
                        maxWidth: '600px',
                        margin: '0 auto 3rem',
                        lineHeight: 1.6
                    }}>
                        Whether you're sending one document or managing an enterprise data room, we have a plan for you.
                    </p>


                </section>

                {/* Pricing Cards */}
                <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>


                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '2rem',
                        alignItems: 'flex-start'
                    }}>
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                style={{
                                    background: '#ffffff',
                                    borderRadius: '24px',
                                    border: plan.popular ? `2px solid ${plan.accentColor}` : '1px solid #e2e8f0',
                                    padding: '2.5rem',
                                    position: 'relative',
                                    transition: 'all 0.3s ease',
                                    boxShadow: plan.popular ? `0 20px 40px ${plan.glowColor.replace('0.5', '0.15')}` : '0 4px 20px rgba(0,0,0,0.03)',
                                    transform: plan.popular ? 'translateY(-10px)' : 'none'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = plan.popular ? 'translateY(-15px)' : 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = plan.popular ? `0 25px 50px ${plan.glowColor.replace('0.5', '0.2')}` : '0 10px 30px rgba(0,0,0,0.06)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = plan.popular ? 'translateY(-10px)' : 'none';
                                    e.currentTarget.style.boxShadow = plan.popular ? `0 20px 40px ${plan.glowColor.replace('0.5', '0.15')}` : '0 4px 20px rgba(0,0,0,0.03)';
                                }}
                            >
                                {plan.popular && (
                                    <div style={{
                                        position: 'absolute',
                                        top: -2,
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: plan.gradient,
                                        padding: '0.25rem 1rem',
                                        borderRadius: '0 0 12px 12px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        color: 'white',
                                        boxShadow: `0 4px 12px ${plan.glowColor}`
                                    }}>
                                        Most Popular
                                    </div>
                                )}

                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '16px',
                                        background: `linear-gradient(135deg, ${plan.accentColor}10 0%, ${plan.accentColor}05 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '1.5rem',
                                        border: `1px solid ${plan.accentColor}20`
                                    }}>
                                        <plan.icon size={32} color={plan.accentColor} />
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>{plan.name}</h3>
                                    <p style={{ color: '#64748b', fontSize: '0.9rem', minHeight: '40px' }}>{plan.target}</p>
                                </div>

                                <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                                        <span style={{ fontSize: '3rem', fontWeight: 800, color: '#0f172a' }}>{plan.price}</span>
                                        <span style={{ color: '#64748b' }}>{plan.period}</span>
                                    </div>
                                    {plan.annualPrice && (
                                        <div style={{ fontSize: '0.875rem', marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span style={{ color: '#64748b' }}>{plan.annualPrice}</span>
                                            <span style={{ color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>{plan.annualSavings}</span>
                                        </div>
                                    )}
                                </div>

                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {plan.features.map((feature, fIndex) => (
                                        <li key={fIndex} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', opacity: feature.included ? 1 : 0.5 }}>
                                            {feature.included ? (
                                                <div style={{ background: '#3b82f6', borderRadius: '50%', padding: '2px', marginTop: '2px' }}>
                                                    <Check size={12} color="white" />
                                                </div>
                                            ) : (
                                                <X size={16} color="#94a3b8" style={{ marginTop: '2px' }} />
                                            )}
                                            <span style={{
                                                fontSize: '0.9rem',
                                                color: feature.included && (feature as any).bold ? '#0f172a' : '#64748b',
                                                fontWeight: (feature as any).bold ? 600 : 400
                                            }}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}

                                    {/* Upcoming Features */}
                                    {(plan as any).upcomingFeatures && (plan as any).upcomingFeatures.length > 0 && (
                                        <>
                                            <li style={{ marginTop: '1.5rem', marginBottom: '0.75rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                                                Coming Soon
                                            </li>
                                            {(plan as any).upcomingFeatures.map((feature: any, uIndex: number) => (
                                                <li key={`u-${uIndex}`} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                                    <div style={{ background: '#f59e0b', borderRadius: '50%', padding: '2px', marginTop: '2px' }}>
                                                        <Sparkles size={12} color="white" />
                                                    </div>
                                                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                                        {feature.text}
                                                    </span>
                                                </li>
                                            ))}
                                        </>
                                    )}
                                </ul>

                                {plan.planType ? (
                                    <button
                                        // onClick={() => handleSubscribe(plan.planType!)}
                                        // disabled={loading === plan.planType || (plan as any).isComingSoon}
                                        style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: '#3b82f6', // Blue background
                                            color: 'white',
                                            fontWeight: 600,
                                            // cursor: loading === plan.planType || (plan as any).isComingSoon ? 'not-allowed' : 'pointer',
                                            cursor: 'not-allowed',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            boxShadow: 'none' // Removed glow
                                        }}
                                    >
                                        Coming Soon
                                        {/* {!loading && <Zap size={16} />} */}
                                    </button>
                                ) : (
                                    <Link to={plan.ctaLink} style={{ textDecoration: 'none' }}>
                                        <button style={{
                                            width: '100%',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            color: '#0f172a',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.background = '#f1f5f9';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.background = '#f8fafc';
                                            }}
                                        >
                                            {plan.cta}
                                        </button>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </section>



                {/* Final CTA */}
                <section style={{
                    marginTop: '6rem',
                    padding: '0 2rem',
                    textAlign: 'center'
                }}>
                    <div style={{
                        maxWidth: '1000px',
                        margin: '0 auto',
                        background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)',
                        borderRadius: '32px',
                        padding: '4rem 2rem',
                        border: '1px solid #bfdbfe',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>

                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', position: 'relative', color: '#1e3a8a' }}>Ready to get started?</h2>
                        <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem', position: 'relative' }}>
                            Join thousands of professionals who trust DocTransfer for secure document sharing.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', position: 'relative' }}>
                            <Link to="/dataroom">
                                <button style={{
                                    background: '#3b82f6',
                                    color: 'white',
                                    padding: '1rem 2rem',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                }}>
                                    Get Started Free
                                </button>
                            </Link>
                            <button style={{
                                background: 'white',
                                color: '#0f172a',
                                padding: '1rem 2rem',
                                borderRadius: '12px',
                                fontWeight: 600,
                                border: '1px solid #e2e8f0',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}>
                                Contact Sales
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer style={{
                background: '#f8fafc',
                padding: '4rem 2rem 2rem',
                borderTop: '1px solid #e2e8f0'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '3rem',
                    marginBottom: '3rem'
                }}>
                    <div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <Logo size={28} />
                        </div>
                        <p style={{ color: '#64748b', lineHeight: 1.6 }}>
                            Secure document sharing and analytics for modern teams.
                        </p>
                    </div>
                    <div>
                        <h4 style={{ color: '#0f172a', fontWeight: 600, marginBottom: '1.5rem' }}>Product</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Features</Link></li>
                            <li><Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Security</Link></li>
                            <li><Link to="/pricing" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>Pricing</Link></li>
                            <li><a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Enterprise</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ color: '#0f172a', fontWeight: 600, marginBottom: '1.5rem' }}>Company</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>About Us</a></li>
                            <li><a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Careers</a></li>
                            <li><a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Blog</a></li>
                            <li><a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ color: '#0f172a', fontWeight: 600, marginBottom: '1.5rem' }}>Legal</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</a></li>
                            <li><a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Terms of Service</a></li>
                            <li><a href="#" style={{ color: '#64748b', textDecoration: 'none' }}>Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>
                <div style={{
                    textAlign: 'center',
                    paddingTop: '2rem',
                    borderTop: '1px solid #e2e8f0',
                    color: '#94a3b8',
                    fontSize: '0.875rem'
                }}>
                    &copy; 2025 DocTransfer. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Pricing;
