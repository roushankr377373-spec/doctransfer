import React, { useState, useEffect } from 'react';
import { Flame, Clock, Eye, Lock, Minus, Plus, Zap } from 'lucide-react';
import PremiumBadge from './PremiumBadge';

interface SelfDestructSettingsProps {
    linkExpiration: boolean;
    setLinkExpiration: (value: boolean) => void;
    expirationMode: 'date' | 'duration';
    setExpirationMode: (value: 'date' | 'duration') => void;
    durationValue: number;
    setDurationValue: (value: number) => void;
    durationUnit: 'hours' | 'days' | 'weeks';
    setDurationUnit: (value: 'hours' | 'days' | 'weeks') => void;
    expiresAt: string;
    setExpiresAt: (value: string) => void;
    maxViewsEnabled: boolean;
    setMaxViewsEnabled: (value: boolean) => void;
    maxViews: number;
    setMaxViews: (value: number) => void;
    isFeatureLocked?: (feature: string) => boolean;
    handleLockedFeatureClick: (featureName: string) => void;
}

const SelfDestructSettings: React.FC<SelfDestructSettingsProps> = ({
    linkExpiration,
    setLinkExpiration,
    expirationMode,
    setExpirationMode,
    durationValue,
    setDurationValue,
    durationUnit,
    setDurationUnit,
    expiresAt,
    setExpiresAt,
    maxViewsEnabled,
    setMaxViewsEnabled,
    maxViews,
    setMaxViews,
    isFeatureLocked,
    handleLockedFeatureClick
}) => {
    const isActive = linkExpiration || maxViewsEnabled;

    return (
        <div
            style={{
                position: 'relative',
                padding: '1.5rem',
                borderRadius: '16px',
                background: isActive
                    ? 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 100%)'
                    : '#ffffff',
                border: isActive
                    ? '1px solid #fdba74'
                    : '1px solid #f3f4f6',
                boxShadow: isActive
                    ? '0 10px 30px -10px rgba(234, 88, 12, 0.2), 0 0 0 1px rgba(234, 88, 12, 0.1) inset'
                    : 'none',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden'
            }}
        >
            {/* Ambient Background Glow when active */}
            {isActive && (
                <div
                    style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle at center, rgba(251, 146, 60, 0.1) 0%, transparent 50%)',
                        pointerEvents: 'none',
                        animation: 'pulse-slow 4s infinite ease-in-out'
                    }}
                />
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{
                    padding: '12px',
                    background: isActive ? 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)' : '#f3f4f6',
                    borderRadius: '14px',
                    boxShadow: isActive ? '0 4px 12px rgba(234, 88, 12, 0.3)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s ease'
                }}>
                    <Flame
                        size={24}
                        style={{
                            color: isActive ? 'white' : '#9ca3af',
                            transition: 'all 0.3s',
                            filter: isActive ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                        }}
                    />
                </div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>Self-Destruct Rules</h3>
                        {isFeatureLocked?.('burn_after_reading') && <PremiumBadge size={14} />}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.25rem 0 0' }}>
                        Automatically expire links based on time or views
                    </p>
                </div>
            </div>

            {/* Controls Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 }}>

                {/* 1. Time Expiration Control */}
                <div style={{
                    background: linkExpiration ? 'rgba(255,255,255,0.7)' : 'transparent',
                    backdropFilter: linkExpiration ? 'blur(8px)' : 'none',
                    padding: linkExpiration ? '1.25rem' : '0.75rem',
                    borderRadius: '16px',
                    border: linkExpiration ? '1px solid rgba(253, 186, 116, 0.5)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    boxShadow: linkExpiration ? '0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: linkExpiration ? '1rem' : '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '6px', background: linkExpiration ? '#ffedd5' : 'transparent', borderRadius: '8px', transition: 'all 0.3s' }}>
                                <Clock size={18} color={linkExpiration ? '#ea580c' : '#6b7280'} />
                            </div>
                            <span style={{ fontSize: '0.95rem', color: '#374151', fontWeight: '600' }}>Time Expiration</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={linkExpiration}
                                onChange={(e) => {
                                    if (isFeatureLocked?.('link_expiration')) {
                                        e.preventDefault();
                                        handleLockedFeatureClick('Link Expiration');
                                    } else {
                                        setLinkExpiration(e.target.checked);
                                    }
                                }}
                                disabled={isFeatureLocked?.('link_expiration')}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {linkExpiration && (
                        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                            {/* Toggle Mode */}
                            <div style={{
                                display: 'flex',
                                background: 'white',
                                padding: '4px',
                                borderRadius: '10px',
                                border: '1px solid #e5e7eb',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                            }}>
                                <button
                                    onClick={() => setExpirationMode('duration')}
                                    style={{
                                        flex: 1, padding: '0.5rem', fontSize: '0.85rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer',
                                        background: expirationMode === 'duration' ? '#ea580c' : 'transparent',
                                        color: expirationMode === 'duration' ? 'white' : '#6b7280',
                                        border: 'none', transition: 'all 0.2s',
                                        boxShadow: expirationMode === 'duration' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    Duration
                                </button>
                                <button
                                    onClick={() => setExpirationMode('date')}
                                    style={{
                                        flex: 1, padding: '0.5rem', fontSize: '0.85rem', fontWeight: '600', borderRadius: '8px', cursor: 'pointer',
                                        background: expirationMode === 'date' ? '#ea580c' : 'transparent',
                                        color: expirationMode === 'date' ? 'white' : '#6b7280',
                                        border: 'none', transition: 'all 0.2s',
                                        boxShadow: expirationMode === 'date' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                                    }}
                                >
                                    Specific Date
                                </button>
                            </div>

                            {/* Inputs */}
                            {expirationMode === 'duration' ? (
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <div style={{ position: 'relative', width: '100px' }}>
                                        <input
                                            type="number"
                                            min="1"
                                            value={durationValue}
                                            onChange={(e) => setDurationValue(parseInt(e.target.value) || 1)}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                paddingRight: '1rem',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '10px',
                                                outline: 'none',
                                                fontSize: '1rem',
                                                fontWeight: '600',
                                                textAlign: 'center',
                                                color: '#374151'
                                            }}
                                        />
                                    </div>
                                    <select
                                        value={durationUnit}
                                        onChange={(e) => setDurationUnit(e.target.value as any)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '10px',
                                            background: 'white',
                                            outline: 'none',
                                            fontSize: '0.95rem',
                                            fontWeight: '500',
                                            cursor: 'pointer',
                                            color: '#374151'
                                        }}
                                    >
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                        <option value="weeks">Weeks</option>
                                    </select>
                                </div>
                            ) : (
                                <input
                                    type="datetime-local"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '10px',
                                        outline: 'none',
                                        fontSize: '0.95rem',
                                        fontFamily: 'inherit',
                                        color: '#374151'
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Divider if Active */}
                {isActive && (
                    <div style={{
                        height: '1px',
                        background: 'linear-gradient(90deg, transparent, #fdba74, transparent)',
                        opacity: 0.6,
                        margin: '0 1rem'
                    }}></div>
                )}

                {/* 2. View Limit Control */}
                <div style={{
                    background: maxViewsEnabled ? 'rgba(255,255,255,0.7)' : 'transparent',
                    backdropFilter: maxViewsEnabled ? 'blur(8px)' : 'none',
                    padding: maxViewsEnabled ? '1.25rem' : '0.75rem',
                    borderRadius: '16px',
                    border: maxViewsEnabled ? '1px solid rgba(253, 186, 116, 0.5)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
                    boxShadow: maxViewsEnabled ? '0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: maxViewsEnabled ? '1rem' : '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '6px', background: maxViewsEnabled ? '#ffedd5' : 'transparent', borderRadius: '8px', transition: 'all 0.3s' }}>
                                <Eye size={18} color={maxViewsEnabled ? '#ea580c' : '#6b7280'} />
                            </div>
                            <span style={{ fontSize: '0.95rem', color: '#374151', fontWeight: '600' }}>View Limit</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={maxViewsEnabled}
                                onChange={(e) => {
                                    if (isFeatureLocked?.('burn_after_reading')) {
                                        e.preventDefault();
                                        handleLockedFeatureClick('Burn After Reading / View Limits');
                                    } else {
                                        setMaxViewsEnabled(e.target.checked);
                                    }
                                }}
                                disabled={isFeatureLocked?.('burn_after_reading')}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>

                    {maxViewsEnabled && (
                        <div className="animate-fade-in" style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'white',
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                            marginTop: '0.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Zap size={16} color="#f59e0b" fill="#f59e0b" />
                                <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: '500' }}>Max views allowed:</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f9fafb', padding: '4px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                                <button
                                    onClick={() => setMaxViews(Math.max(1, maxViews - 1))}
                                    style={{
                                        width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                                        background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#374151',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Minus size={16} stroke="#374151" strokeWidth={3} style={{ minWidth: '16px', minHeight: '16px', stroke: '#374151' }} />
                                </button>
                                <span style={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: '40px', textAlign: 'center', color: '#ea580c' }}>{maxViews}</span>
                                <button
                                    onClick={() => setMaxViews(maxViews + 1)}
                                    style={{
                                        width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                                        background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)', color: '#374151',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <Plus size={16} stroke="#374151" strokeWidth={3} style={{ minWidth: '16px', minHeight: '16px', stroke: '#374151' }} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CSS Animation for Pulse */}
            <style>
                {`
                @keyframes pulse-slow {
                    0% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 0.5; }
                }
                `}
            </style>
        </div>
    );
};

export default SelfDestructSettings;
