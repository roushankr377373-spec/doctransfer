import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../lib/supabase';
import useSubscription from '../hooks/useSubscription';
import { ArrowLeft, Save, Upload, Palette, Globe, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
    const { user } = useUser();
    const navigate = useNavigate();
    const { hasFeature } = useSubscription();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Branding State
    const [logoUrl, setLogoUrl] = useState('');
    const [brandColor, setBrandColor] = useState('#4f46e5');
    const [siteUrl, setSiteUrl] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);

    useEffect(() => {
        if (user) {
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            const { data } = await supabase
                .from('branding_settings')
                .select('*')
                .eq('user_id', user?.id)
                .single();

            if (data) {
                setLogoUrl(data.logo_url || '');
                setBrandColor(data.brand_color || '#4f46e5');
                setSiteUrl(data.site_url || '');
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setLogoFile(file);

        // Preview
        const objectUrl = URL.createObjectURL(file);
        setLogoUrl(objectUrl);
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setMessage(null);

        try {
            let finalLogoUrl = logoUrl;

            // Upload Logo if changed
            if (logoFile) {
                const fileExt = logoFile.name.split('.').pop();
                const filePath = `logos/${user.id}_${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('branding')
                    .upload(filePath, logoFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from('branding')
                    .getPublicUrl(filePath);

                finalLogoUrl = publicUrlData.publicUrl;
            }

            // Upsert Settings
            const { error } = await supabase
                .from('branding_settings')
                .upsert({
                    user_id: user.id,
                    logo_url: finalLogoUrl,
                    brand_color: brandColor,
                    site_url: siteUrl,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } catch (error: any) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to save settings' });
        } finally {
            setSaving(false);
        }
    };

    const isBrandingLocked = !hasFeature('custom_branding');

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
            {/* Header */}
            <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1rem 2rem' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/dataroom')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', color: '#6b7280' }}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>Settings</h1>
                </div>
            </header>

            <main style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem' }}>
                <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                        <Palette size={24} color="#4f46e5" />
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>Branding</h2>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>Customize how your shared links look</p>
                        </div>
                        {isBrandingLocked && (
                            <span style={{ marginLeft: 'auto', background: '#f3f4f6', color: '#6b7280', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px', fontWeight: '500' }}>
                                Requires Standard Plan
                            </span>
                        )}
                    </div>

                    {isBrandingLocked ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>Upgrade to the Standard Plan to customize your branding.</p>
                            <button
                                onClick={() => navigate('/pricing')}
                                style={{ padding: '0.625rem 1.25rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
                            >
                                View Plans
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Logo Upload */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Company Logo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <div style={{
                                        width: '80px', height: '80px',
                                        borderRadius: '12px', border: '1px solid #e5e7eb',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: '#f9fafb', overflow: 'hidden'
                                    }}>
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <Upload size={24} color="#9ca3af" />
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            style={{ display: 'none' }}
                                        />
                                        <button
                                            onClick={() => document.getElementById('logo-upload')?.click()}
                                            style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', fontWeight: '500', color: '#374151', cursor: 'pointer' }}
                                        >
                                            Upload New Logo
                                        </button>
                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>Recommended: 200x200px PNG or JPG</p>
                                    </div>
                                </div>
                            </div>

                            {/* Brand Color */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Brand Color</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <input
                                        type="color"
                                        value={brandColor}
                                        onChange={(e) => setBrandColor(e.target.value)}
                                        style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    />
                                    <input
                                        type="text"
                                        value={brandColor}
                                        onChange={(e) => setBrandColor(e.target.value)}
                                        style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', width: '100px' }}
                                    />
                                </div>
                            </div>

                            {/* Site URL */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Website URL</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                    <input
                                        type="url"
                                        value={siteUrl}
                                        onChange={(e) => setSiteUrl(e.target.value)}
                                        placeholder="https://yourcompany.com"
                                        style={{ width: '100%', padding: '0.625rem 0.625rem 0.625rem 2.25rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ paddingTop: '2rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
                                {message && (
                                    <span style={{ fontSize: '0.875rem', color: message.type === 'success' ? '#059669' : '#dc2626' }}>
                                        {message.text}
                                    </span>
                                )}
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    style={{
                                        padding: '0.625rem 1.5rem',
                                        background: '#4f46e5', color: 'white',
                                        border: 'none', borderRadius: '8px',
                                        fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: saving ? 0.7 : 1
                                    }}
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
