import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import BrandingSettings from '../components/BrandingSettings';
import SLASettings from '../components/SLASettings';
import { ArrowLeft, Loader2, Palette, ShieldCheck, CreditCard, Bell, Lock } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

type SettingsTab = 'branding' | 'sla' | 'billing' | 'notifications';

const SettingsPage: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const { isFeatureLocked } = useSubscription();
    const [activeTab, setActiveTab] = useState<SettingsTab>('branding');

    if (!user) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin text-indigo-600" />
        </div>
    );

    const isSLALocked = isFeatureLocked('sla_guarantee');

    const menuItems = [
        { id: 'branding', label: 'Branding', icon: Palette },
        { id: 'sla', label: 'SLA Guarantee', icon: ShieldCheck, locked: isSLALocked },
        { id: 'billing', label: 'Billing & Plans', icon: CreditCard, disabled: true }, // Placeholder
        { id: 'notifications', label: 'Notifications', icon: Bell, disabled: true }, // Placeholder
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
            {/* Header */}
            <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/dataroom')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', color: '#6b7280' }}
                        className="hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>Settings</h1>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 1rem' }}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-3">
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => !item.disabled && setActiveTab(item.id as SettingsTab)}
                                    disabled={item.disabled}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === item.id
                                            ? 'bg-indigo-50 text-indigo-700 font-bold'
                                            : item.disabled
                                                ? 'opacity-50 cursor-not-allowed text-gray-400'
                                                : 'text-gray-600 hover:bg-white hover:shadow-sm hover:text-gray-900'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon size={18} />
                                        {item.label}
                                    </div>
                                    {item.locked && <Lock size={14} className="text-gray-400" />}
                                </button>
                            ))}
                        </nav>

                        {/* Plan Summary Card - simplified */}
                        <div className="mt-8 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white shadow-lg">
                            <h3 className="font-bold text-lg mb-1">Your Plan</h3>
                            <div className="text-gray-300 text-sm mb-4">Manage your subscription and billing details.</div>
                            <button
                                onClick={() => navigate('/pricing')}
                                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors border border-white/10"
                            >
                                View Plans
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-9">
                        <div className="bg-white rounded-3xl min-h-[600px] p-1 shadow-sm border border-gray-100">
                            {activeTab === 'branding' && <BrandingSettings userId={user.id} />}
                            {activeTab === 'sla' && <SLASettings />}
                            {/* Placeholders for future tabs */}
                            {activeTab === 'billing' && <div className="p-12 text-center text-gray-400">Billing settings coming soon...</div>}
                            {activeTab === 'notifications' && <div className="p-12 text-center text-gray-400">Notification settings coming soon...</div>}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
