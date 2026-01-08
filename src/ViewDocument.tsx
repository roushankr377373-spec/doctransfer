import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { decryptFile } from './lib/crypto';
import { comparePassword, rateLimiter } from './lib/security';
import { FileText, Download, AlertCircle, Lock as LockIcon, Package, ArrowRight, ExternalLink, Flame, ShieldCheck } from 'lucide-react';
import { logDocumentView, logDocumentDownload, logPasswordVerification, logEmailVerification } from './lib/auditLogger';
import WatermarkOverlay from './components/WatermarkOverlay';
import BiometricGate from './components/BiometricGate';
import WebcamGate from './components/WebcamGate';

interface DocumentData {
    id: string;
    name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    storage_type?: string;
    google_drive_link?: string;
    password?: string;
    allow_download: boolean;
    expires_at?: string;
    screenshot_protection: boolean;
    email_verification: boolean;
    allowed_email?: string;
    // Encryption fields
    is_encrypted?: boolean;
    encryption_key?: string;
    encryption_iv?: string;
    is_vault_file?: boolean; // New field
    original_file_type?: string;
    watermark_config?: {
        text: string;
        color: string;
        opacity: number;
        fontSize: number;
        rotation: number;
        layout: 'single' | 'tiled';
    };
    require_biometric: boolean;
    require_snapshot: boolean;
    biometric_credential_id?: string;
    scan_status?: 'pending' | 'clean' | 'infected' | 'error';
    max_views?: number;
    view_count?: number;
    burn_after_reading?: boolean;
    share_link?: string; // Added for bundle listing
    user_id?: string;
}

interface BundleData {
    id: string;
    name: string;
    share_link: string;
    created_at: string;
    password?: string;
    expires_at?: string;
    require_biometric: boolean;
    require_email_verification: boolean;
    allowed_email?: string;
    user_id?: string;
}

const ViewDocument: React.FC = () => {
    const { t } = useTranslation();
    const { shareLink } = useParams<{ shareLink: string }>();
    const [document, setDocument] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Bundle State
    const [isBundle, setIsBundle] = useState(false);
    const [bundleData, setBundleData] = useState<BundleData | null>(null);
    const [bundleDocs, setBundleDocs] = useState<DocumentData[]>([]);

    // Email Verification State
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [sentCode, setSentCode] = useState<string | null>(null);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [showCodeInput, setShowCodeInput] = useState(false);

    // Biometric/Snapshot State
    const [isBiometricVerified, setIsBiometricVerified] = useState(false);
    const [isSnapshotVerified, setIsSnapshotVerified] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // Vault State
    const [vaultKey, setVaultKey] = useState<string | null>(null);

    useEffect(() => {
        // Extract key from hash if present (Magic Link)
        const hash = window.location.hash;
        if (hash.includes('key=')) {
            const params = new URLSearchParams(hash.substring(1)); // remove #
            const key = params.get('key');
            if (key) {
                setVaultKey(decodeURIComponent(key));
                console.log('🔑 Vault Key found in URL hash');
            }
        }
    }, []);

    // Branding State
    const [branding, setBranding] = useState<{
        logo_url?: string;
        brand_color?: string;
        site_url?: string;
        remove_branding?: boolean;
    } | null>(null);

    useEffect(() => {
        fetchDocument();
    }, [shareLink]);

    const fetchDocument = async () => {
        try {
            // 1. Try to find Single Document
            const { data: docData } = await supabase
                .from('documents')
                .select('*')
                .eq('share_link', shareLink)
                .maybeSingle();

            if (docData) {
                setDocument(docData);
                handleDocLoaded(docData);
                return;
            }

            // 2. If not found, try to find Bundle
            const { data: bundle } = await supabase
                .from('document_bundles')
                .select('*')
                .eq('share_link', shareLink)
                .maybeSingle();

            if (bundle) {
                setIsBundle(true);
                setBundleData(bundle);

                // Fetch docs in bundle
                const { data: docs } = await supabase
                    .from('documents')
                    .select('*')
                    .eq('bundle_id', bundle.id)
                    .order('created_at', { ascending: true });

                if (docs) setBundleDocs(docs);

                handleBundleLoaded(bundle);
                return;
            }

            throw new Error('Not found');

        } catch (err: any) {
            console.error('Error fetching resource:', err);
            setError('Link is invalid or has expired.');
        } finally {
            setLoading(false);
        }
    };

    const handleDocLoaded = (data: DocumentData) => {
        // Fetch branding settings
        if (data.user_id) {
            supabase
                .from('branding_settings')
                .select('logo_url, brand_color, site_url')
                .eq('user_id', data.user_id)
                .single()
                .then(({ data: brandingData }) => {
                    if (brandingData) setBranding(brandingData);
                });
        }

        // Start basic view tracking
        trackView(data.id);

        // Increment Secure View Count
        supabase.rpc('increment_view_count', { doc_id: data.id }).then(({ error }) => {
            if (error) console.error('Failed to increment view count:', error);
        });

        // Log to audit system
        logDocumentView(data.id, {
            metadata: {
                viewer_agent: navigator.userAgent
            }
        });

        // SECURITY: Check Malware Scan Status
        if (data.scan_status === 'infected') {
            setError('This file has been flagged as malicious and cannot be accessed.');
            return;
        }

        // Check Max Views (Burn After Reading Fail-safe)
        if (data.max_views && (data.view_count || 0) >= data.max_views) {
            setError('This document has reached its view limit and is no longer accessible.');
            return;
        }

        // Check for expiration
        if (data.expires_at) {
            const expirationDate = new Date(data.expires_at);
            const now = new Date();
            expirationDate.setHours(23, 59, 59, 999);

            if (now > expirationDate) {
                setError('This link has expired.');
                return;
            }
        }

        // Auto-authenticate logic
        if ((!data.password || data.password === '') && !data.email_verification) {
            setIsAuthenticated(true);
        }
    };

    const handleBundleLoaded = (data: BundleData) => {
        // Fetch branding
        if (data.user_id) {
            supabase
                .from('branding_settings')
                .select('logo_url, brand_color, site_url')
                .eq('user_id', data.user_id)
                .single()
                .then(({ data: brandingData }) => {
                    if (brandingData) setBranding(brandingData);
                });
        }

        // Check Expiration
        if (data.expires_at) {
            const expirationDate = new Date(data.expires_at);
            const now = new Date();
            expirationDate.setHours(23, 59, 59, 999);

            if (now > expirationDate) {
                setError('This bundle link has expired.');
                return;
            }
        }

        // Auto-authenticate logic
        if ((!data.password || data.password === '') && !data.require_email_verification) {
            setIsAuthenticated(true);
        }
    };

    // Track View Logic
    const trackView = async (documentId: string) => {
        try {
            // 1. Get/Create Session Logic
            let geoData = null;
            try {
                // Try a privacy-friendly IP/location service if available, or just send null to let backend/edge handle it
                // For this demo we'll skip external fetch to avoid CORS blocks on localhost, backend will handle IP
            } catch (e) {
                console.warn('Failed to fetch geolocation', e);
            }

            // Create Session
            const { data: sessionData, error: sessionError } = await supabase
                .from('document_access_sessions')
                .insert({
                    document_id: documentId,
                    user_agent: navigator.userAgent,
                    // geolocation: geoData // Let supabase edge/triggers handle this if possible, or backend
                })
                .select('session_id')
                .single();

            if (sessionError) {
                console.error('Session creation failed:', sessionError);
                return;
            }

            if (sessionData) {
                setCurrentSessionId(sessionData.session_id);

                // 2. Track View (Initial Page 1)
                const { data: viewData, error: viewError } = await supabase
                    .from('document_view_tracking')
                    .insert({
                        session_id: sessionData.session_id,
                        document_id: documentId,
                        page_number: 1
                    })
                    .select('id')
                    .single();

                if (viewData && !viewError) {
                    // Start Heartbeat for Duration
                    const startTime = Date.now();
                    const heartbeatInterval = setInterval(async () => {
                        const duration = Math.round((Date.now() - startTime) / 1000);
                        if (duration > 0 && duration % 5 === 0) { // Update every 5 seconds
                            await supabase
                                .from('document_view_tracking')
                                .update({ duration_seconds: duration })
                                .eq('id', viewData.id);
                        }
                    }, 5000);

                    // Cleanup
                    const cleanup = () => {
                        clearInterval(heartbeatInterval);
                        const finalDuration = Math.round((Date.now() - startTime) / 1000);
                        supabase
                            .from('document_view_tracking')
                            .update({ duration_seconds: finalDuration })
                            .eq('id', viewData.id)
                            .then(() => { });
                    };

                    window.addEventListener('beforeunload', cleanup);
                    return cleanup;
                }
            }
        } catch (err) {
            console.error('Error tracking view:', err);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const target = isBundle ? bundleData : document;

        if (target?.password && await comparePassword(passwordInput, target.password)) {
            setIsAuthenticated(true);
            if (document) await logPasswordVerification(document.id, true); // Log for single doc
        } else {
            if (document) await logPasswordVerification(document.id, false);
            alert('Incorrect password');
        }
    };

    const handleSendCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Rate limiting: Only allow one code every 60 seconds per email
        const rateCheck = rateLimiter.check(email, 1, 60000);
        if (!rateCheck.allowed) {
            alert(`Please wait ${rateCheck.waitTime} seconds before requesting a new code.`);
            return;
        }

        const target = isBundle ? bundleData : document;

        // Check if specific email is required
        if (target?.allowed_email && target.allowed_email !== email) {
            alert('Access denied. This document is not shared with this email address.');
            return;
        }

        // Generate verification code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setSentCode(code);
        setShowCodeInput(true);

        // TODO: In production, integrate real email service (Resend/SendGrid/AWS SES)
        alert(`Verification code sent to ${email}. Check your email.`);

        // Development only - show code in console
        if (import.meta.env.DEV) {
            console.log(`[DEV ONLY] Verification code: ${code}`);
        }
    };

    const handleVerifyCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (verificationCode === sentCode) {
            setIsEmailVerified(true);
            if (document) logEmailVerification(document.id, email, true);
        } else {
            if (document) logEmailVerification(document.id, email, false);
            alert('Invalid code');
        }
    };

    const handleBiometricSuccess = async () => {
        setIsBiometricVerified(true);
        if (currentSessionId) {
            await supabase
                .from('document_access_sessions')
                .update({ verified_biometric: true })
                .eq('session_id', currentSessionId);
        }
    };

    const handleSnapshotSuccess = async (url: string) => {
        setIsSnapshotVerified(true);
        if (currentSessionId) {
            await supabase
                .from('document_access_sessions')
                .update({ snapshot_url: url })
                .eq('session_id', currentSessionId);
        }
    };

    const handleDownload = async () => {
        if (!document) return;
        setDownloading(true);

        try {
            console.log('=== DOWNLOAD DEBUG START ===');
            console.log('Document:', {
                name: document.name,
                storage_type: document.storage_type,
                file_type: document.file_type,
                original_file_type: document.original_file_type,
                is_encrypted: document.is_encrypted,
                has_encryption_key: !!document.encryption_key,
                has_encryption_iv: !!document.encryption_iv
            });

            // Check if it's a Google Drive link
            if (document.storage_type === 'google_drive' && document.google_drive_link) {
                // Redirect to Google Drive
                window.location.href = document.google_drive_link;
                return;
            }

            // Validate encryption keys if file is encrypted
            if (document.is_encrypted) {
                // For Vault Mode, we only need IV stored on server. Key is with client.
                if (document.is_vault_file) {
                    if (!document.encryption_iv) {
                        console.error('Missing encryption IV for vault file');
                        alert('Error: Encryption IV is missing for this secure file.');
                        return;
                    }
                } else {
                    // Standard Encryption: Need both Key and IV from server
                    if (!document.encryption_key || !document.encryption_iv) {
                        console.error('Missing encryption keys:', {
                            has_key: !!document.encryption_key,
                            has_iv: !!document.encryption_iv
                        });
                        alert('Error: Encryption keys are missing for this secure file. Please contact the file owner.');
                        return;
                    }
                }
                console.log('✓ Encryption keys present');
            }

            // Handle Supabase storage download
            console.log('Downloading from storage:', document.file_path);
            const { data, error } = await supabase.storage
                .from('documents')
                .download(document.file_path);

            if (error) {
                console.error('Storage download error:', error);
                throw error;
            }

            console.log('✓ Downloaded from storage, size:', data.size, 'bytes');

            let blob = data;

            // Decrypt if Vault Mode
            if (document.is_vault_file) {
                console.log('🔒 Processing Vault File...');

                let keyToUse = vaultKey;

                // If key missing, prompt user
                if (!keyToUse) {
                    const userInput = prompt('This is a secure Vault file. Please enter the Decryption Key:');
                    if (!userInput) {
                        alert('Decryption key is required to access this file.');
                        return;
                    }
                    keyToUse = userInput;
                }

                if (!document.encryption_iv) {
                    alert('Error: Encryption IV missing. File cannot be decrypted.');
                    return;
                }

                try {
                    console.log('Attempting decryption...');
                    const finalFileType = document.original_file_type || document.file_type;

                    blob = await decryptFile(
                        data,
                        keyToUse,
                        document.encryption_iv,
                        finalFileType
                    );

                    console.log('✓ Decryption successful, size:', blob.size, 'bytes');
                } catch (decryptError) {
                    console.error('Decryption failed:', decryptError);
                    alert('Failed to decrypt file. The key may be incorrect.');
                    return;
                }
            } else if (document.is_encrypted && document.encryption_key && document.encryption_iv) {
                // Legacy Encryption (Server-side key) - if we re-enable it later
            }

            // Verify blob has content
            if (blob.size === 0) {
                console.error('Error: Downloaded blob is empty');
                alert('Error: Downloaded file is empty. This may indicate a decryption or storage issue.');
                return;
            }

            console.log('Creating download link...');
            console.log('Final blob:', {
                size: blob.size,
                type: blob.type
            });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = window.document.createElement('a');
            a.href = url;
            a.download = document.name;
            window.document.body.appendChild(a);
            a.click();

            console.log('✓ Download triggered');

            // Cleanup
            window.URL.revokeObjectURL(url);
            window.document.body.removeChild(a);

            console.log('✓ Download triggered');

            // BURN AFTER READING CHECK
            if (document.burn_after_reading) {
                await burnDocument();
            }

            console.log('=== DOWNLOAD DEBUG END ===');
        } catch (err: any) {
            console.error('Download error:', err);
            console.error('Error details:', {
                message: err.message,
                stack: err.stack
            });
            alert(`Failed to download file: ${err.message || 'Unknown error'}`);
        } finally {
            if (document) {
                logDocumentDownload(document.id, {
                    userEmail: email || undefined,
                    metadata: { storageType: document.storage_type }
                });
            }
            setDownloading(false);
        }
    };

    const burnDocument = async () => {
        if (!document) return;

        try {
            console.log('🔥 Initiating Burn After Reading sequence...');

            // 1. Delete file from storage
            const { error: storageError } = await supabase.storage
                .from('documents')
                .remove([document.file_path]);

            if (storageError) {
                console.error('Failed to delete file from storage:', storageError);
                // Continue to delete record anyway to prevent access
            }

            // 2. Delete document record
            const { error: dbError } = await supabase
                .from('documents')
                .delete()
                .eq('id', document.id);

            if (dbError) {
                console.error('Failed to delete document record:', dbError);
            }

            // 3. UI Feedback
            alert('This message will self-destruct... \n\nFile has been incinerated as per "Burn After Reading" protocol.');
            setError('This document has been burned and is no longer available.');
            setDocument(null);

        } catch (err) {
            console.error('Error burning document:', err);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
                <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#4f46e5', borderRadius: '50%' }}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '1rem' }}>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <AlertCircle size={32} color="#dc2626" />
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>{t('view.accessDenied')}</h1>
                    <p style={{ color: '#6b7280' }}>{error}</p>
                </div>
            </div>
        );
    }

    // Determine targets
    const targetData = isBundle ? bundleData : document;

    // Auth Check (Password or Email)
    const requiresEmail = isBundle
        ? bundleData?.require_email_verification
        : document?.email_verification;

    if ((targetData?.password && !isAuthenticated) || (requiresEmail && !isEmailVerified)) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', padding: '1rem' }}>
                <div style={{ background: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', maxWidth: '440px', width: '100%' }}>

                    {/* Branding Logo */}
                    {branding?.logo_url && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                            <img src={branding.logo_url} alt="Logo" style={{ height: '40px', objectFit: 'contain' }} />
                        </div>
                    )}

                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <LockIcon size={32} color="#3b82f6" />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '0.5rem' }}>
                            {requiresEmail && !isEmailVerified ? t('view.emailTitle') : t('view.passwordTitle')}
                        </h1>
                        <p style={{ color: '#6b7280' }}>
                            {isBundle
                                ? "This document bundle is secured."
                                : t('view.passwordDesc')
                            }
                        </p>
                    </div>

                    {/* Email Verification UI */}
                    {requiresEmail && !isEmailVerified ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {!showCodeInput ? (
                                <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={t('view.emailPlaceholder')}
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '1rem', outline: 'none' }}
                                        required
                                    />
                                    <button type="submit" style={{ width: '100%', padding: '0.875rem', background: branding?.brand_color || '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}>
                                        {t('view.sendCode')}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input
                                        type="text"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '1rem', outline: 'none', textAlign: 'center', letterSpacing: '0.25rem' }}
                                        required
                                    />
                                    <button type="submit" style={{ width: '100%', padding: '0.875rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}>
                                        {t('view.verify')}
                                    </button>
                                    <button type="button" onClick={() => setShowCodeInput(false)} style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.875rem' }}>
                                        {t('view.changeEmail')}
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        /* Password UI */
                        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder={t('view.passwordPlaceholder')}
                                style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '1rem', outline: 'none' }}
                                required
                            />
                            <button type="submit" style={{ width: '100%', padding: '0.875rem', background: branding?.brand_color || '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}>
                                {t('view.unlock')}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    // --- BUNDLE VIEW ---
    if (isBundle && bundleData) {
        return (
            <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '2rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {/* Bundle Header */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        {branding?.logo_url && (
                            <img src={branding.logo_url} alt="Logo" style={{ height: '32px', marginBottom: '1.5rem' }} />
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            <div style={{ background: '#ecfdf5', padding: '0.75rem', borderRadius: '10px' }}>
                                <Package size={32} color="#059669" />
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{bundleData.name}</h1>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                                    {bundleDocs.length} files • Created {new Date(bundleData.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Files List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {bundleDocs.map((doc) => (
                            <div key={doc.id} style={{
                                background: 'white',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer',
                                border: '1px solid transparent'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }}
                                onClick={() => {
                                    // Navigate to individual document view
                                    window.open(`${window.location.origin}/view/${doc.share_link}`, '_blank');
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        background: '#f3f4f6',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FileText size={24} color="#6b7280" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.25rem' }}>{doc.name}</h3>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{(doc.file_size / 1024).toFixed(2)} KB</p>
                                    </div>
                                </div>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    background: '#f9fafb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <ExternalLink size={20} color="#6b7280" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {!branding?.remove_branding && (
                        <div style={{ marginTop: '2rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.8rem' }}>
                            Powered by DocTransfer
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- SINGLE DOC VIEW (Existing + Interface) ---
    // At this point, we assume it's NOT a bundle, so 'document' must be present 
    // unless loading failed (handled above) or not initialized.
    if (!document) return null;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f3f4f6',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Watermark Overlay */}
            {document.watermark_config && (
                <WatermarkOverlay
                    config={document.watermark_config}
                    viewerInfo={{
                        email: isEmailVerified ? email : undefined,
                        ip: '127.0.0.1',
                        date: new Date().toLocaleString()
                    }}
                />
            )}

            {/* Content Container */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                    maxWidth: '1000px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>

                    {/* Header */}
                    <div style={{
                        padding: '1.5rem 2rem',
                        borderBottom: '1px solid #f3f4f6',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {branding?.logo_url ? (
                                <img src={branding.logo_url} alt="Logo" style={{ height: '32px' }} />
                            ) : (
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: branding?.brand_color || '#4f46e5',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FileText size={20} color="white" />
                                </div>
                            )}
                            <div>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>
                                    {document.name}
                                </h2>
                                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    {(document.file_size / 1024 / 1024).toFixed(2)} MB • {document.file_type}
                                </p>
                            </div>
                        </div>

                        {document.allow_download && (
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: downloading ? '#9ca3af' : (branding?.brand_color || '#4f46e5'),
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    cursor: downloading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
                                }}
                            >
                                {downloading ? (
                                    'Processing...'
                                ) : (
                                    <>
                                        <Download size={18} />
                                        Download File
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Security Gates (Biometric / Snapshot) */}
                    {(document.require_biometric && !isBiometricVerified) || (document.require_snapshot && !document.require_biometric && !isSnapshotVerified) ? (
                        <div style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', minHeight: '400px' }}>

                            {/* Biometric Gate */}
                            {document.require_biometric && !isBiometricVerified && (
                                <BiometricGate
                                    documentName={document.name}
                                    credentialId={document.biometric_credential_id}
                                    onVerified={handleBiometricSuccess}
                                />
                            )}

                            {/* Snapshot Gate (Only if biometric passed or not required) */}
                            {(!document.require_biometric || isBiometricVerified) && document.require_snapshot && !isSnapshotVerified && (
                                <WebcamGate
                                    documentName={document.name}
                                    onVerified={handleSnapshotSuccess}
                                />
                            )}

                        </div>
                    ) : (
                        /* Document Preview Area */
                        /* Decorative Floating Animation */
                        <div style={{
                            background: '#f8fafc',
                            padding: '4rem 2rem',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '400px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <style>
                                {`
                                    @keyframes float {
                                        0% { transform: translateY(0px) rotate(0deg); }
                                        50% { transform: translateY(-20px) rotate(2deg); }
                                        100% { transform: translateY(0px) rotate(0deg); }
                                    }
                                    @keyframes pulse-glow {
                                        0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2); }
                                        70% { box-shadow: 0 0 0 20px rgba(99, 102, 241, 0); }
                                        100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
                                    }
                                `}
                            </style>

                            <div style={{
                                position: 'relative',
                                animation: 'float 6s ease-in-out infinite'
                            }}>
                                {/* Glow Effect */}
                                <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '120px',
                                    height: '120px',
                                    background: 'rgba(99, 102, 241, 0.15)',
                                    borderRadius: '50%',
                                    filter: 'blur(20px)',
                                    animation: 'pulse-glow 3s infinite'
                                }} />

                                {/* Icon Container */}
                                <div style={{
                                    width: '100px',
                                    height: '100px',
                                    background: 'white',
                                    borderRadius: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                    position: 'relative',
                                    zIndex: 10,
                                    border: '1px solid #e0e7ff'
                                }}>
                                    {document.is_encrypted || document.is_vault_file ? (
                                        <LockIcon size={48} color="#4f46e5" />
                                    ) : (
                                        <FileText size={48} color="#4f46e5" />
                                    )}
                                </div>

                                {/* Floating Elements */}
                                <div style={{
                                    position: 'absolute',
                                    top: -10,
                                    right: -10,
                                    background: '#ecfdf5',
                                    borderRadius: '50%',
                                    padding: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    animation: 'float 4s ease-in-out infinite reverse',
                                    zIndex: 11
                                }}>
                                    <ShieldCheck size={16} color="#059669" />
                                </div>
                            </div>
                        </div>
                    )}

                    {document.burn_after_reading && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', color: '#c2410c', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Flame size={20} />
                            <span><strong>Burn After Reading:</strong> This file will be deleted permanently after the first view/download.</span>
                        </div>
                    )}

                </div>

                {/* Branding Footer */}
                {branding?.site_url && (
                    <a href={branding.site_url} target="_blank" rel="noopener noreferrer" style={{ marginTop: '2rem', color: '#9ca3af', textDecoration: 'none', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Visit {new URL(branding.site_url).hostname} <ArrowRight size={14} />
                    </a>
                )}
            </div>
        </div>
    );
};
export default ViewDocument;
