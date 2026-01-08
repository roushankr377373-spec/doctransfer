import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
    Upload,
    FileText,
    Link as LinkIcon,
    Lock,
    Calendar,
    Download,
    Globe,
    Copy,
    Check,
    Eye,
    BarChart2,
    Shield,
    Mail,
    Image as ImageIcon,
    PenTool,
    UserPlus,
    Fingerprint,
    Flame,
    Settings
} from 'lucide-react';
import { supabase } from './lib/supabase';
import { encryptFile } from './lib/crypto';
import { hashPassword } from './lib/security';
import GoogleDriveTab from './components/GoogleDriveTab';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import DashboardAnimation from './components/DashboardAnimation';
import AuditTrail from './components/AuditTrail';
import SignerManagement, { type Signer } from './components/SignerManagement';
import SignatureFieldEditor, { type SignatureField } from './components/SignatureFieldEditor';
import { logDocumentUpload } from './lib/auditLogger';
import { registerBiometric, isBiometricAvailable } from './lib/webauthn';
import useSubscription from './hooks/useSubscription';
import PremiumBadge from './components/PremiumBadge';
import UpgradeModal from './components/UpgradeModal';
import UsageLimitBanner from './components/UsageLimitBanner';

interface Document {
    id: string;
    name: string;
    size: string;
    type: string;
    uploadedAt: string;
    link: string;
    file_path: string;
    settings: {
        password: string;
        expiresAt: string;
        allowDownload: boolean;
        customDomain: string;
    };
    watermark_config?: WatermarkConfig;
}

interface WatermarkConfig {
    text: string;
    color: string;
    opacity: number;
    fontSize: number;
    rotation: number;
    layout: 'single' | 'tiled';
}

const DataRoom: React.FC = () => {
    const { user } = useUser();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState<'upload' | 'google-drive' | 'documents' | 'analytics' | 'audit'>('upload');
    const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>(undefined);
    const navigate = useNavigate();

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Changed to array
    const [uploadedDoc, setUploadedDoc] = useState<Document | null>(null);
    const [uploadedBundleLink, setUploadedBundleLink] = useState<string | null>(null); // New state for bundle link
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Settings State
    const [passwordProtection, setPasswordProtection] = useState(false);
    const [linkExpiration, setLinkExpiration] = useState(false);
    const [allowDownloads, setAllowDownloads] = useState(true);
    const [password, setPassword] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [screenshotProtection, setScreenshotProtection] = useState(false);
    const [emailVerification, setEmailVerification] = useState(false);
    const [allowedEmail, setAllowedEmail] = useState('');
    const [applyWatermark, setApplyWatermark] = useState(false);
    const [watermarkConfig, setWatermarkConfig] = useState<WatermarkConfig>({
        text: 'CONFIDENTIAL {{email}}',
        color: '#000000',
        opacity: 0.3,
        fontSize: 24,
        rotation: -45,
        layout: 'tiled'
    });
    const [requestSignature, setRequestSignature] = useState(false);
    const [burnAfterRead, setBurnAfterRead] = useState(false);
    const [vaultMode, setVaultMode] = useState(false);

    // New Biometric State
    const [requireBiometric, setRequireBiometric] = useState(false);
    const [biometricCredentialId, setBiometricCredentialId] = useState<string | null>(null);
    const [biometricRegistering, setBiometricRegistering] = useState(false);

    // E-Signature State
    const [signers, setSigners] = useState<Signer[]>([]);
    const [, setSignatureFields] = useState<SignatureField[]>([]);
    const [signatureWorkflowType, setSignatureWorkflowType] = useState<'sequential' | 'parallel'>('sequential');
    const [showFieldEditor, setShowFieldEditor] = useState(false);
    const [signingLinks, setSigningLinks] = useState<any[]>([]);

    // Subscription and premium features
    const { subscription, usage, isLoading: subLoading, isFeatureLocked, getRemainingUploads, getMaxFileSize } = useSubscription();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [lockedFeatureName, setLockedFeatureName] = useState<string | undefined>();

    // Create preview URL when file is selected - Adjusted for multiple files (preview first one)
    useEffect(() => {
        if (selectedFiles.length > 0) {
            const objectUrl = URL.createObjectURL(selectedFiles[0]);
            setFilePreview(objectUrl);

            // Cleanup function to revoke object URL
            return () => {
                URL.revokeObjectURL(objectUrl);
            };
        } else {
            setFilePreview(null);
        }
    }, [selectedFiles]);



    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            let query = supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            // Filter by user if authenticated
            if (user) {
                query = query.eq('user_id', user.id);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                const formattedDocs: Document[] = data.map(doc => ({
                    id: doc.id,
                    name: doc.name,
                    size: (doc.file_size / 1024).toFixed(2) + ' KB',
                    type: doc.file_type,
                    uploadedAt: new Date(doc.created_at).toLocaleDateString(),
                    link: `${window.location.origin}/view/${doc.share_link}`,
                    file_path: doc.file_path,
                    settings: {
                        password: doc.password || '',
                        expiresAt: doc.expires_at || '',
                        allowDownload: doc.allow_download,
                        customDomain: doc.custom_domain || ''
                    }
                }));
                setDocuments(formattedDocs);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) handleFileSelection(files);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelection(Array.from(e.target.files));
        }
    };

    const handleFileSelection = (files: File[]) => {
        setSelectedFiles(files);
        setUploadedDoc(null);
        setUploadedBundleLink(null);
        setUploadError(null);
        setFilePreview(null); // Will be set by useEffect
    };

    const handleBiometricToggle = async (enabled: boolean) => {
        if (!enabled) {
            // User is disabling biometric protection
            setRequireBiometric(false);
            setBiometricCredentialId(null);
            return;
        }

        // User is enabling biometric protection - register immediately
        setBiometricRegistering(true);
        setUploadError(null);

        try {
            // Check availability first
            const available = await isBiometricAvailable();
            if (!available) {
                setUploadError('Biometric authentication is not available on this device. Please ensure you have Touch ID, Face ID, or Windows Hello enabled.');
                return;
            }

            // Trigger registration
            const result = await registerBiometric();

            if (result.success && result.credentialId) {
                setRequireBiometric(true);
                setBiometricCredentialId(result.credentialId);
                // Optional: Show success feedback
                console.log('✓ Biometric registered successfully');
            } else {
                setUploadError(result.error || 'Failed to register biometric');
            }
        } catch (error: any) {
            console.error('Biometric registration error:', error);
            setUploadError('Failed to register biometric. Please try again.');
        } finally {
            setBiometricRegistering(false);
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        if (selectedFiles.length > 1 && isFeatureLocked('document_bundles')) {
            handleLockedFeatureClick('Document Bundles');
            return;
        }

        setIsUploading(true);
        setUploadError(null);

        try {
            console.log('=== UPLOAD DEBUG START ===');
            console.log(`Selected ${selectedFiles.length} files`);

            // Validate biometric requirement
            if (requireBiometric && !biometricCredentialId) {
                throw new Error('Biometric protection is enabled but registration was not completed. Please toggle biometric protection again.');
            }

            // --- BUNDLE CREATION (if > 1 file) ---
            let bundleId: string | null = null;
            let bundleShareLink: string | null = null;

            if (selectedFiles.length > 1) {
                // Generates friendly name e.g. "Contract.pdf and 2 others"
                const bundleName = `${selectedFiles[0].name} and ${selectedFiles.length - 1} others`;
                bundleShareLink = Math.random().toString(36).substring(2, 12);

                const { data: bundleData, error: bundleError } = await supabase
                    .from('document_bundles')
                    .insert({
                        name: bundleName,
                        share_link: bundleShareLink,
                        user_id: user?.id || null,
                        password: passwordProtection ? await hashPassword(password) : null,
                        expires_at: linkExpiration ? expiresAt : null,
                        require_biometric: requireBiometric,
                        require_email_verification: emailVerification,
                        allowed_email: emailVerification ? allowedEmail : null
                    })
                    .select('id')
                    .single();

                if (bundleError) throw new Error(`Failed to create bundle: ${bundleError.message}`);
                bundleId = bundleData.id;
                console.log('Bundle created:', bundleId);
            }

            // --- FILE UPLOAD LOOP ---
            const uploadedDocs: Document[] = [];

            for (const file of selectedFiles) {
                console.log('Processing file:', file.name);

                // 1. Prepare File (Encrypt if Vault Mode)
                let fileToUpload = file;
                let encryptionKey: string | null = null;
                let encryptionIv: string | null = null;

                if (vaultMode) {
                    console.log('🔒 Encrypting file for Vault Mode...');
                    try {
                        const result = await encryptFile(file);
                        const { encryptedBlob, key, iv } = result;

                        fileToUpload = new File([encryptedBlob], file.name, {
                            type: 'application/octet-stream' // Encrypted files are binary
                        });

                        encryptionKey = key; // Keep local for Magic Link, DO NOT STORE IN DB
                        encryptionIv = iv;   // Store IV in DB
                        console.log('✓ File encrypted successfully');
                    } catch (encError) {
                        console.error('Encryption failed:', encError);
                        throw new Error(`Failed to encrypt file ${file.name}. Please try again.`);
                    }
                }

                // 2. Generate unique file path
                const timestamp = Date.now();
                const randomString = Math.random().toString(36).substring(7);
                const filePath = `uploads/${file.name}_${timestamp}_${randomString}`;
                const sanitizedFilePath = filePath.replace(/[^a-zA-Z0-9._/-]/g, '_');

                console.log('Uploading to path:', sanitizedFilePath);

                // 3. Upload to Supabase storage
                const { error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(sanitizedFilePath, fileToUpload, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('✗ Storage upload error:', uploadError);
                    if (uploadError.message?.includes('fetch') || uploadError.message?.includes('CORS')) {
                        throw new Error(`CORS Error: Your Supabase project is blocking requests from localhost.`);
                    }
                    throw new Error(`Storage upload failed for ${file.name}: ${uploadError.message}`);
                }

                const docShareLink = Math.random().toString(36).substring(2, 12);

                // 4. Save document metadata to database
                const { data: docData, error: dbError } = await supabase
                    .from('documents')
                    .insert({
                        name: file.name,
                        file_path: sanitizedFilePath,
                        file_size: file.size,
                        file_type: file.type,
                        share_link: docShareLink,
                        bundle_id: bundleId, // Link to bundle if exists

                        // Inherit settings from UI
                        allow_download: allowDownloads,
                        password: passwordProtection ? await hashPassword(password) : null,
                        expires_at: linkExpiration ? expiresAt : null,
                        custom_domain: null,
                        screenshot_protection: screenshotProtection,
                        email_verification: emailVerification,
                        allowed_email: emailVerification ? allowedEmail : null,
                        apply_watermark: applyWatermark,
                        watermark_config: applyWatermark ? watermarkConfig : null,
                        require_biometric: requireBiometric,
                        biometric_credential_id: requireBiometric ? biometricCredentialId : null,
                        max_views: burnAfterRead ? 1 : null,
                        burn_after_reading: burnAfterRead,

                        // Encryption / Vault Fields
                        is_vault_file: vaultMode,
                        is_encrypted: vaultMode,
                        encryption_key: null,
                        encryption_iv: vaultMode ? encryptionIv : null,

                        original_file_name: file.name,
                        original_file_type: file.type,
                        user_id: user?.id || null,
                        scan_status: 'pending'
                    })
                    .select()
                    .single();

                if (dbError) throw new Error(`Database save failed for ${file.name}: ${dbError.message}`);

                // Construct Link for this doc
                let finalLink = `${window.location.origin}/view/${docShareLink}`;
                if (vaultMode && encryptionKey) {
                    finalLink += `#key=${encodeURIComponent(encryptionKey)}`;
                }

                uploadedDocs.push({
                    id: docData.id,
                    name: file.name,
                    size: (file.size / 1024).toFixed(2) + ' KB',
                    type: file.type,
                    uploadedAt: new Date().toLocaleDateString(),
                    link: finalLink,
                    file_path: filePath,
                    settings: {
                        password: passwordProtection ? 'protected' : '',
                        expiresAt: linkExpiration ? expiresAt : '',
                        allowDownload: allowDownloads,
                        customDomain: ''
                    }
                });

                // Log audit event
                await logDocumentUpload(docData.id, file.name, file.size, {
                    metadata: {
                        passwordProtected: passwordProtection,
                        bundleId: bundleId
                    }
                });
            } // End Loop

            console.log('All files uploaded successfully');

            // Set state based on Single vs Bundle
            if (bundleId && bundleShareLink) {
                const finalBundleLink = `${window.location.origin}/view/${bundleShareLink}`;
                setUploadedBundleLink(finalBundleLink);
                // We don't set uploadedDoc for bundle, or we set the first one?
                // Let's set uploadedDoc to null to avoid confusion, or use a new success state.
                // Or effectively treat the first doc as the "primary" one for some UI logic if needed.
                setUploadedDoc(uploadedDocs[0]); // Just to trigger "Success" UI if it relies on this
            } else {
                setUploadedDoc(uploadedDocs[0]);
                setUploadedBundleLink(null);
            }

            // Update subscription usage
            if (user?.id) {
                const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
                const totalSizeBytes = selectedFiles.reduce((acc, file) => acc + file.size, 0);

                const { data: currentUsage } = await supabase
                    .from('subscription_usage')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('month', currentMonth)
                    .single();

                if (currentUsage) {
                    await supabase
                        .from('subscription_usage')
                        .update({
                            documents_uploaded: currentUsage.documents_uploaded + uploadedDocs.length,
                            storage_used: currentUsage.storage_used + totalSizeBytes
                        })
                        .eq('id', currentUsage.id);
                } else {
                    await supabase
                        .from('subscription_usage')
                        .insert({
                            user_id: user.id,
                            month: currentMonth,
                            documents_uploaded: uploadedDocs.length,
                            storage_used: totalSizeBytes
                        });
                }
            }


            setDocuments(prev => [...uploadedDocs, ...prev]);
            setSelectedFiles([]);

            // TODO: E-signature logic currently only supports single file. Disable for multi-upload for now.

        } catch (error: any) {
            console.error('Upload error:', error);
            const errorMessage = error.message || 'Upload failed';
            setUploadError(errorMessage);
            window.alert(`Upload Error: ${errorMessage}`);
        }

        setIsUploading(false);
    };

    const copyLink = (link: string) => { // Modified to accept any link
        navigator.clipboard.writeText(link);
        setCopiedId('link');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handlePreview = async () => {
        if (!uploadedDoc) return;

        try {
            // Get public URL from Supabase storage
            const { data } = supabase.storage
                .from('documents')
                .getPublicUrl(uploadedDoc.file_path);

            if (data?.publicUrl) {
                setPreviewUrl(data.publicUrl);
                setShowPreviewModal(true);
            }
        } catch (error) {
            console.error('Error loading preview:', error);
        }
    };

    const handleLockedFeatureClick = (featureName: string) => {
        setLockedFeatureName(featureName);
        setShowUpgradeModal(true);
    };

    return (
        <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
            {/* Header */}
            <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '1.5rem 2rem' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#4f46e5', marginBottom: '0.5rem' }}>DocTransfer Dashboard</h1>
                            <p style={{ fontSize: '0.95rem', color: '#6b7280' }}>Welcome back! Here's what's happening.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <button style={{ padding: '0.625rem 1.25rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <UserPlus size={18} />
                                Team
                            </button>
                            <button style={{ padding: '0.625rem 1.25rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <Upload size={18} />
                                Upload Document
                            </button>
                            <a href="/settings" style={{ padding: '0.625rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', textDecoration: 'none' }}>
                                <Settings size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Stats Grid / Animation */}
                    <div style={{ marginBottom: '2rem' }}>
                        <DashboardAnimation />
                    </div>

                    {/* Navigation Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', background: '#f3f4f6', padding: '0.5rem', borderRadius: '12px', width: 'fit-content' }}>
                        <button onClick={() => setActiveTab('upload')} style={{ padding: '0.625rem 1.5rem', background: activeTab === 'upload' ? '#8b5cf6' : 'transparent', color: activeTab === 'upload' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <Upload size={16} /> Upload
                        </button>
                        <button onClick={() => {
                            if (subscription?.plan_type === 'free' || !subscription) {
                                handleLockedFeatureClick('Google Drive Integration');
                            } else {
                                setActiveTab('google-drive');
                            }
                        }} style={{ padding: '0.625rem 1.5rem', background: activeTab === 'google-drive' ? '#8b5cf6' : 'transparent', color: activeTab === 'google-drive' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <Globe size={16} /> Google Drive
                            {(subscription?.plan_type === 'free' || !subscription) && <Lock size={14} />}
                        </button>
                        <button onClick={() => setActiveTab('documents')} style={{ padding: '0.625rem 1.5rem', background: activeTab === 'documents' ? '#8b5cf6' : 'transparent', color: activeTab === 'documents' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <FileText size={16} /> Documents
                        </button>
                        <button onClick={() => {
                            if (isFeatureLocked('advanced_analytics')) {
                                handleLockedFeatureClick('Advanced Analytics');
                            } else {
                                setActiveTab('analytics');
                            }
                        }} style={{ padding: '0.625rem 1.5rem', background: activeTab === 'analytics' ? '#8b5cf6' : 'transparent', color: activeTab === 'analytics' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <BarChart2 size={16} /> Analytics
                            {isFeatureLocked('advanced_analytics') && <Lock size={14} />}
                        </button>
                        <button onClick={() => setActiveTab('audit')} style={{ padding: '0.625rem 1.5rem', background: activeTab === 'audit' ? '#8b5cf6' : 'transparent', color: activeTab === 'audit' ? 'white' : '#6b7280', border: 'none', borderRadius: '8px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                            <Shield size={16} /> Audit Trail
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
                {activeTab === 'google-drive' ? (
                    <GoogleDriveTab onDocumentUploaded={fetchDocuments} />
                ) : activeTab === 'analytics' ? (
                    <AnalyticsDashboard documentId={selectedDocumentId} />
                ) : activeTab === 'audit' ? (
                    <div className="animate-fade-in">
                        <AuditTrail documentId={selectedDocumentId || documents.map(d => d.id)} />
                    </div>
                ) : activeTab === 'documents' ? (
                    <div className="animate-fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>My Documents</h2>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', minWidth: '250px' }}
                                />
                            </div>
                        </div>

                        {documents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                <FileText size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>No documents found</h3>
                                <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Upload your first document to get started.</p>
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    style={{ padding: '0.75rem 1.5rem', background: '#4f46e5', color: 'white', borderRadius: '8px', border: 'none', fontWeight: '500', cursor: 'pointer' }}
                                >
                                    Upload Document
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {documents.map(doc => (
                                    <div key={doc.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer' }}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ padding: '0.5rem', background: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}>
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{doc.name}</h3>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>{doc.size} • {doc.uploadedAt}</p>
                                                        {((doc as any).scan_status === 'pending') && (
                                                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }}>Scanning...</span>
                                                        )}
                                                        {((doc as any).scan_status === 'infected') && (
                                                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5' }}>INFECTED</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Copy link logic
                                                    navigator.clipboard.writeText(doc.link);
                                                    setCopiedId(doc.id);
                                                    setTimeout(() => setCopiedId(null), 2000);
                                                }}
                                                style={{ padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: copiedId === doc.id ? '#10b981' : '#9ca3af' }}
                                            >
                                                {copiedId === doc.id ? <Check size={18} /> : <Copy size={18} />}
                                            </button>
                                        </div>
                                        <div style={{ padding: '1rem', background: '#f9fafb', display: 'flex', gap: '0.5rem' }}>
                                            <a
                                                href={doc.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ flex: 1, padding: '0.5rem', textAlign: 'center', background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', color: '#374151', textDecoration: 'none', fontSize: '0.875rem', fontWeight: '500' }}
                                            >
                                                View
                                            </a>
                                            <button
                                                onClick={() => {
                                                    setSelectedDocumentId(doc.id);
                                                    setActiveTab('analytics');
                                                }}
                                                style={{ flex: 1, padding: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                            >
                                                <BarChart2 size={16} /> Analytics
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedDocumentId(doc.id);
                                                    setActiveTab('audit');
                                                }}
                                                style={{ padding: '0.5rem', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', color: '#0369a1', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                                                title="View Audit Trail"
                                            >
                                                <Shield size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #f3f4f6', maxWidth: '100%', margin: '0 auto', overflow: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '600px' }}>
                                {/* Upload Document Section - Left Side */}
                                <div style={{ padding: '2.5rem', borderRight: '1px solid #f3f4f6', background: 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                        <Upload size={24} style={{ color: '#4f46e5' }} />
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>Upload Document</h2>
                                    </div>
                                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Upload any document to generate a secure sharing link</p>

                                    {/* Error Display */}
                                    {uploadError && (
                                        <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                            <Shield size={18} />
                                            <span>{uploadError}</span>
                                        </div>
                                    )}

                                    {/* Usage Limit Banner for Free Plan */}
                                    {subscription && (
                                        <UsageLimitBanner
                                            currentUploads={usage?.documents_uploaded || 0}
                                            maxUploads={10}
                                            planType={subscription.plan_type}
                                        />
                                    )}

                                    {/* Upload Area */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                        style={{
                                            padding: '3rem 2rem',
                                            border: isDragging ? '2px dashed #4f46e5' : selectedFiles.length > 0 ? '2px dashed #10b981' : '2px dashed #e5e7eb',
                                            borderRadius: '12px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            marginBottom: '1.5rem',
                                            background: isDragging ? '#f0f4ff' : selectedFiles.length > 0 ? '#f0fdf4' : '#fafbfc',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {/* Icon with checkmark when file selected */}
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            margin: '0 auto 1rem',
                                            background: selectedFiles.length > 0 ? '#dcfce7' : '#f3f4f6',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            position: 'relative',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {selectedFiles.length > 0 ? (
                                                <Check size={40} color="#10b981" strokeWidth={3} />
                                            ) : (
                                                <FileText size={36} color="#6b7280" />
                                            )}
                                        </div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: selectedFiles.length > 0 ? '#047857' : '#374151' }}>
                                            {selectedFiles.length > 0
                                                ? (selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files selected`)
                                                : 'Click to upload or drag and drop'}
                                        </h3>
                                        <div style={{ fontSize: '0.875rem', color: selectedFiles.length > 0 ? '#10b981' : '#9ca3af', fontWeight: selectedFiles.length > 0 ? '500' : '400' }}>
                                            {selectedFiles.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                    <span>Ready to upload</span>
                                                    {selectedFiles.length > 1 && (
                                                        <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'left', background: 'rgba(255,255,255,0.5)', padding: '0.5rem', borderRadius: '8px' }}>
                                                            {selectedFiles.slice(0, 3).map((f, i) => (
                                                                <div key={i} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>• {f.name}</div>
                                                            ))}
                                                            {selectedFiles.length > 3 && <div>...and {selectedFiles.length - 3} more</div>}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', gap: '0.25rem' }}>
                                                    <span>Supports multiple files (Bundles)</span>
                                                    {isFeatureLocked('document_bundles') && <Lock size={12} color="#9ca3af" />}
                                                </div>
                                            )}
                                        </div>
                                        {selectedFiles.length === 0 && (
                                            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.25rem' }}>Maximum file size: 30 MB per file</p>
                                        )}
                                        <input
                                            type="file"
                                            onChange={handleFileInput}
                                            id="file-upload"
                                            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                                            disabled={isUploading}
                                            multiple // Enable multiple selection
                                            style={{ display: 'none' }}
                                        />
                                    </div>

                                    {/* Settings */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                                        {/* Password Protection */}
                                        <div style={{ padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '12px', background: passwordProtection ? '#fef2f2' : '#ffffff', transition: 'all 0.2s' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: passwordProtection ? '0.75rem' : '0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ padding: '8px', background: '#fee2e2', borderRadius: '8px' }}>
                                                        <Lock size={18} style={{ color: '#dc2626' }} />
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151', display: 'block' }}>Password Protection</span>
                                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Restrict access with a password</span>
                                                    </div>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input type="checkbox" checked={passwordProtection} onChange={(e) => setPasswordProtection(e.target.checked)} />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                            {passwordProtection && (
                                                <input
                                                    type="password"
                                                    placeholder="Enter password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.625rem 0.875rem',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        fontSize: '0.875rem',
                                                        outline: 'none',
                                                        background: 'white'
                                                    }}
                                                />
                                            )}
                                        </div>



                                        {/* Link Expiration */}
                                        <div style={{ padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '12px', background: linkExpiration ? '#eff6ff' : '#ffffff', transition: 'all 0.2s' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: linkExpiration ? '0.75rem' : '0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '8px' }}>
                                                        <Calendar size={18} style={{ color: '#2563eb' }} />
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Link Expiration</span>
                                                            {isFeatureLocked?.('link_expiration') && <PremiumBadge size={14} />}
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Set an expiry date for the link</span>
                                                    </div>
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
                                                <input
                                                    type="datetime-local"
                                                    value={expiresAt}
                                                    onChange={(e) => setExpiresAt(e.target.value)}
                                                    min={new Date().toISOString().slice(0, 16)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.625rem 0.875rem',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        fontSize: '0.875rem',
                                                        outline: 'none',
                                                        background: 'white'
                                                    }}
                                                />
                                            )}
                                        </div>

                                        {/* Vault Mode */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem', padding: '0.75rem', background: '#1e1b4b', borderRadius: '8px', border: '1px solid #4338ca' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <Shield size={18} style={{ color: '#818cf8' }} />
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                                            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#e0e7ff', display: 'block' }}>Vault Mode (Client-Side Encryption)</span>
                                                            {isFeatureLocked?.('vault_mode') && <PremiumBadge size={14} />}
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: '#a5b4fc' }}>Zero-Knowledge: Server cannot read file.</span>
                                                    </div>
                                                </div>
                                                <label className="toggle-switch">
                                                    <input
                                                        type="checkbox"
                                                        checked={vaultMode}
                                                        onChange={(e) => {
                                                            if (isFeatureLocked?.('vault_mode')) {
                                                                e.preventDefault();
                                                                handleLockedFeatureClick('Vault Mode');
                                                            } else {
                                                                setVaultMode(e.target.checked);
                                                            }
                                                        }}
                                                        disabled={isFeatureLocked?.('vault_mode')}
                                                    />
                                                    <span className="toggle-slider"></span>
                                                </label>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Scan Status Badge (for list view, not settings) - keeping placeholder location */}

                                    {/* Burn-on-Read */}
                                    <div style={{ padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '12px', background: burnAfterRead ? '#fff7ed' : '#ffffff', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ padding: '8px', background: '#ffedd5', borderRadius: '8px' }}>
                                                    <Flame size={18} style={{ color: '#ea580c' }} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Burn After Reading</span>
                                                        {isFeatureLocked?.('burn_after_reading') && <PremiumBadge size={14} />}
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Delete file after 1 download</span>
                                                </div>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={burnAfterRead}
                                                    onChange={(e) => {
                                                        if (isFeatureLocked?.('burn_after_reading')) {
                                                            e.preventDefault();
                                                            handleLockedFeatureClick('Burn After Reading');
                                                        } else {
                                                            setBurnAfterRead(e.target.checked);
                                                        }
                                                    }}
                                                    disabled={isFeatureLocked?.('burn_after_reading')}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Allow Downloads */}
                                    <div style={{ padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '12px', background: allowDownloads ? '#f0fdf4' : '#ffffff', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px' }}>
                                                    <Download size={18} style={{ color: '#16a34a' }} />
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151', display: 'block' }}>Allow Downloads</span>
                                                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Let recipients download the file</span>
                                                </div>
                                            </div>
                                            <label className="toggle-switch">
                                                <input type="checkbox" checked={allowDownloads} onChange={(e) => setAllowDownloads(e.target.checked)} />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Screenshot Protection */}
                                    <div style={{ padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '12px', background: screenshotProtection ? '#fef2f2' : '#ffffff', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ padding: '8px', background: '#fee2e2', borderRadius: '8px' }}>
                                                    <Shield size={18} style={{ color: '#ef4444' }} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Screenshot Protection</span>
                                                        {isFeatureLocked?.('screenshot_protection') && <PremiumBadge size={14} />}
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Block screen capture attempts</span>
                                                </div>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={screenshotProtection}
                                                    onChange={(e) => {
                                                        if (isFeatureLocked?.('screenshot_protection')) {
                                                            e.preventDefault();
                                                            handleLockedFeatureClick('Screenshot Protection');
                                                        } else {
                                                            setScreenshotProtection(e.target.checked);
                                                        }
                                                    }}
                                                    disabled={isFeatureLocked?.('screenshot_protection')}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Email Verification */}
                                    <div style={{ padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '12px', background: emailVerification ? '#f0f9ff' : '#ffffff', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: emailVerification ? '0.75rem' : '0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ padding: '8px', background: '#e0f2fe', borderRadius: '8px' }}>
                                                    <Mail size={18} style={{ color: '#0ea5e9' }} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Email Verification</span>
                                                        {isFeatureLocked?.('email_verification') && <PremiumBadge size={14} />}
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Require recipient email</span>
                                                </div>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={emailVerification}
                                                    onChange={(e) => {
                                                        if (isFeatureLocked?.('email_verification')) {
                                                            e.preventDefault();
                                                            handleLockedFeatureClick('Email Verification');
                                                        } else {
                                                            setEmailVerification(e.target.checked);
                                                        }
                                                    }}
                                                    disabled={isFeatureLocked?.('email_verification')}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                        {emailVerification && (
                                            <input
                                                type="email"
                                                placeholder="Enter recipient email (optional)"
                                                value={allowedEmail}
                                                onChange={(e) => setAllowedEmail(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.625rem 0.875rem',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    fontSize: '0.875rem',
                                                    outline: 'none',
                                                    background: 'white'
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* Biometric & Snapshot Gates */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                        <div style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #dcfce7', fontSize: '0.85rem', fontWeight: '600', color: '#166534', letterSpacing: '0.05em' }}>
                                            SECURITY GATES
                                        </div>

                                        {/* Biometric Toggle */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ padding: '8px', background: '#dcfce7', borderRadius: '8px' }}>
                                                    <Fingerprint size={18} style={{ color: '#15803d' }} />
                                                </div>
                                                <div>
                                                    <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#166534', display: 'block' }}>
                                                        Require Biometrics
                                                        {isFeatureLocked?.('biometric_auth') && <PremiumBadge size={14} />}
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: '#15803d' }}>FaceID / TouchID / Windows Hello</span>
                                                    {biometricRegistering && <div style={{ fontSize: '0.75rem', color: '#ca8a04', marginTop: '0.2rem' }}>Registering...</div>}
                                                    {requireBiometric && biometricCredentialId && <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.2rem' }}>✓ Device registered</div>}
                                                </div>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={requireBiometric}
                                                    onChange={(e) => {
                                                        if (isFeatureLocked?.('biometric_auth')) {
                                                            e.preventDefault();
                                                            handleLockedFeatureClick('Biometric Authentication');
                                                        } else {
                                                            handleBiometricToggle(e.target.checked);
                                                        }
                                                    }}
                                                    disabled={biometricRegistering || isFeatureLocked?.('biometric_auth')}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Watermark */}
                                    <div style={{ padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '12px', background: applyWatermark ? '#f5f3ff' : '#ffffff', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ padding: '8px', background: '#ede9fe', borderRadius: '8px' }}>
                                                    <ImageIcon size={18} style={{ color: '#8b5cf6' }} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Apply Dynamic Watermark</span>
                                                        {isFeatureLocked?.('watermarking') && <PremiumBadge size={14} />}
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Add overlay to documents</span>
                                                </div>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={applyWatermark}
                                                    onChange={(e) => {
                                                        if (isFeatureLocked?.('watermarking')) {
                                                            e.preventDefault();
                                                            handleLockedFeatureClick('Dynamic Watermarking');
                                                        } else {
                                                            setApplyWatermark(e.target.checked);
                                                        }
                                                    }}
                                                    disabled={isFeatureLocked?.('watermarking')}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                        {applyWatermark && (
                                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                {/* Text Template */}
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>Watermark Text</label>
                                                    <input
                                                        type="text"
                                                        value={watermarkConfig.text}
                                                        onChange={(e) => setWatermarkConfig({ ...watermarkConfig, text: e.target.value })}
                                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.9rem' }}
                                                    />
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                        {['{{email}}', '{{ip}}', '{{date}}'].map(tag => (
                                                            <button
                                                                key={tag}
                                                                onClick={() => setWatermarkConfig(prev => ({ ...prev, text: prev.text + ' ' + tag }))}
                                                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#e0e7ff', color: '#4338ca', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                            >
                                                                + {tag}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Settings Grid */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#64748b' }}>Color</label>
                                                        <input
                                                            type="color"
                                                            value={watermarkConfig.color}
                                                            onChange={(e) => setWatermarkConfig({ ...watermarkConfig, color: e.target.value })}
                                                            style={{ width: '100%', height: '36px', border: 'none', cursor: 'pointer' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#64748b' }}>Opacity ({watermarkConfig.opacity})</label>
                                                        <input
                                                            type="range"
                                                            min="0.1" max="1" step="0.1"
                                                            value={watermarkConfig.opacity}
                                                            onChange={(e) => setWatermarkConfig({ ...watermarkConfig, opacity: parseFloat(e.target.value) })}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#64748b' }}>Size ({watermarkConfig.fontSize}px)</label>
                                                        <input
                                                            type="range"
                                                            min="12" max="72" step="2"
                                                            value={watermarkConfig.fontSize}
                                                            onChange={(e) => setWatermarkConfig({ ...watermarkConfig, fontSize: parseInt(e.target.value) })}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#64748b' }}>Rotation ({watermarkConfig.rotation}°)</label>
                                                        <input
                                                            type="range"
                                                            min="-90" max="90" step="5"
                                                            value={watermarkConfig.rotation}
                                                            onChange={(e) => setWatermarkConfig({ ...watermarkConfig, rotation: parseInt(e.target.value) })}
                                                            style={{ width: '100%' }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Layout Toggle */}
                                                <div style={{ marginTop: '1rem' }}>
                                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: '#64748b', marginBottom: '0.25rem' }}>Layout</label>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => setWatermarkConfig({ ...watermarkConfig, layout: 'single' })}
                                                            style={{
                                                                flex: 1, padding: '0.5rem',
                                                                background: watermarkConfig.layout === 'single' ? '#3b82f6' : 'white',
                                                                color: watermarkConfig.layout === 'single' ? 'white' : '#64748b',
                                                                border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer'
                                                            }}
                                                        >
                                                            Single
                                                        </button>
                                                        <button
                                                            onClick={() => setWatermarkConfig({ ...watermarkConfig, layout: 'tiled' })}
                                                            style={{
                                                                flex: 1, padding: '0.5rem',
                                                                background: watermarkConfig.layout === 'tiled' ? '#3b82f6' : 'white',
                                                                color: watermarkConfig.layout === 'tiled' ? 'white' : '#64748b',
                                                                border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer'
                                                            }}
                                                        >
                                                            Tiled
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Live Preview */}
                                                <div style={{
                                                    marginTop: '1rem',
                                                    height: '150px',
                                                    background: 'white',
                                                    border: '1px dashed #cbd5e1',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        inset: 0,
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transform: `rotate(${watermarkConfig.rotation}deg)`,
                                                        pointerEvents: 'none'
                                                    }}>
                                                        {[...Array(watermarkConfig.layout === 'tiled' ? 6 : 1)].map((_, i) => (
                                                            <span key={i} style={{
                                                                color: watermarkConfig.color,
                                                                opacity: watermarkConfig.opacity,
                                                                fontSize: `${watermarkConfig.fontSize}px`,
                                                                margin: '20px',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {watermarkConfig.text}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span style={{ position: 'relative', zIndex: -1, color: '#94a3b8', fontSize: '0.8rem' }}>Document Content Preview</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* E-Signature */}
                                    <div style={{ padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '12px', background: requestSignature ? '#fffbeb' : '#ffffff', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: requestSignature ? '1rem' : '0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{ padding: '8px', background: '#fef3c7', borderRadius: '8px' }}>
                                                    <PenTool size={18} style={{ color: '#d97706' }} />
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.95rem', fontWeight: '600', color: '#374151' }}>Request E-Signature</span>
                                                        {isFeatureLocked?.('e_signature') && <PremiumBadge size={14} />}
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Collect digital signatures</span>
                                                </div>
                                            </div>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={requestSignature}
                                                    onChange={(e) => {
                                                        if (isFeatureLocked?.('e_signature')) {
                                                            e.preventDefault();
                                                            handleLockedFeatureClick('E-Signature Requests');
                                                        } else {
                                                            setRequestSignature(e.target.checked);
                                                        }
                                                    }}
                                                    disabled={isFeatureLocked?.('e_signature')}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                        {requestSignature && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div style={{ padding: '0.75rem', background: '#ffffff', border: '1px solid #fcd34d', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                    <p style={{ color: '#b45309', marginBottom: '0.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <span>📝</span> E-Signature Workflow
                                                    </p>
                                                    <ol style={{ color: '#92400e', marginLeft: '1.25rem', lineHeight: '1.6', fontSize: '0.8rem' }}>
                                                        <li>Add signers below</li>
                                                        <li>Upload your document</li>
                                                        <li>Place signature fields</li>
                                                        <li>Get signing links</li>
                                                    </ol>
                                                </div>

                                                {/* Workflow Type Selector */}
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', fontWeight: '600', color: '#4b5563', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Signing Order
                                                    </label>
                                                    <div style={{ display: 'flex', gap: '0.5rem', background: '#f3f4f6', padding: '0.25rem', borderRadius: '8px' }}>
                                                        <button
                                                            onClick={() => setSignatureWorkflowType('sequential')}
                                                            style={{
                                                                flex: 1,
                                                                padding: '0.5rem',
                                                                background: signatureWorkflowType === 'sequential' ? 'white' : 'transparent',
                                                                color: signatureWorkflowType === 'sequential' ? '#7c3aed' : '#6b7280',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '500',
                                                                cursor: 'pointer',
                                                                boxShadow: signatureWorkflowType === 'sequential' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            Sequential
                                                        </button>
                                                        <button
                                                            onClick={() => setSignatureWorkflowType('parallel')}
                                                            style={{
                                                                flex: 1,
                                                                padding: '0.5rem',
                                                                background: signatureWorkflowType === 'parallel' ? 'white' : 'transparent',
                                                                color: signatureWorkflowType === 'parallel' ? '#7c3aed' : '#6b7280',
                                                                border: 'none',
                                                                borderRadius: '6px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: '500',
                                                                cursor: 'pointer',
                                                                boxShadow: signatureWorkflowType === 'parallel' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            Parallel
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Signer Management */}
                                                <div>
                                                    <SignerManagement
                                                        signers={signers}
                                                        onSignersChange={setSigners}
                                                        workflowType={signatureWorkflowType}
                                                        maxSigners={10}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>



                                    {/* Sharing Link Section - Integrated into Upload Card before Button */}


                                    <button
                                        onClick={() => {
                                            // Check if user has reached upload limit
                                            const remainingUploads = getRemainingUploads?.() || Infinity;
                                            if (subscription?.plan_type === 'free' && remainingUploads <= 0) {
                                                handleLockedFeatureClick('Unlimited Uploads');
                                                return;
                                            }

                                            // Check file size for free users
                                            if (subscription?.plan_type === 'free' && selectedFiles.length > 0) {
                                                const maxSize = getMaxFileSize?.() || 10 * 1024 * 1024;
                                                const oversizedFiles = selectedFiles.filter(f => f.size > maxSize);
                                                if (oversizedFiles.length > 0) {
                                                    setUploadError(`File size limit (${(maxSize / 1024 / 1024).toFixed(0)}MB) exceeded: ${oversizedFiles[0].name} is ${(oversizedFiles[0].size / 1024 / 1024).toFixed(2)}MB. Upgrade to Standard for 500MB limit.`);
                                                    return;
                                                }
                                            }

                                            // If e-signature is enabled and we have a document, show field editor
                                            // Only support e-signature for single files
                                            if (requestSignature && selectedFiles.length === 1 && !uploadedDoc && signers.length > 0) {
                                                setShowFieldEditor(true);
                                            } else {
                                                handleUpload();
                                            }
                                        }}
                                        disabled={selectedFiles.length === 0 || isUploading || (requestSignature && signers.length === 0)}
                                        style={{
                                            marginTop: '1.5rem',
                                            width: '100%',
                                            padding: '0.875rem',
                                            background: selectedFiles.length === 0 || isUploading ? '#9ca3af' : '#6366f1',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontWeight: '600',
                                            fontSize: '0.95rem',
                                            cursor: selectedFiles.length === 0 || isUploading ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {isUploading ? 'Generating Link...' : (
                                            <>
                                                <LinkIcon size={18} />
                                                {selectedFiles.length > 1 ? 'Generate Bundle Link' : 'Generate Secure Link'}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Sharing & Signing Section - Right Side */}
                                <div style={{ padding: '2.5rem', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                        <LinkIcon size={24} style={{ color: '#3b82f6' }} />
                                        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827' }}>Sharing Link</h2>
                                    </div>
                                    <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2rem' }}>Your secure, trackable document link</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '400px', justifyContent: (!uploadedDoc && !uploadedBundleLink) ? 'center' : 'flex-start' }}>
                                        {/* Bundle Link Display */}
                                        {uploadedBundleLink && (
                                            <div style={{ padding: '1.5rem', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#065f46' }}>📦 Bundle Share Link</h3>
                                                <p style={{ fontSize: '0.875rem', color: '#047857', marginBottom: '1rem' }}>
                                                    Share this link to give access to all {uploadedDoc ? 'uploaded files' : 'files'}.
                                                </p>
                                                <div style={{ width: '100%', padding: '0.75rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <input
                                                        type="text"
                                                        value={uploadedBundleLink}
                                                        readOnly
                                                        style={{ fontSize: '0.875rem', flex: 1, border: 'none', background: 'transparent', outline: 'none', color: '#374151' }}
                                                    />
                                                    <button
                                                        onClick={() => copyLink(uploadedBundleLink)}
                                                        style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                    >
                                                        {copiedId === 'link' ? <Check size={16} color="#16a34a" /> : <Copy size={16} color="#6b7280" />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Single Doc Link Display */}
                                        {uploadedDoc && !uploadedBundleLink && (
                                            <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#111827' }}>Public Share Link</h3>
                                                <div style={{ width: '100%', padding: '0.75rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <input
                                                        type="text"
                                                        value={uploadedDoc.link}
                                                        readOnly
                                                        style={{ fontSize: '0.875rem', flex: 1, border: 'none', background: 'transparent', outline: 'none', color: '#374151' }}
                                                    />
                                                    <button
                                                        onClick={() => copyLink(uploadedDoc.link)}
                                                        style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                                    >
                                                        {copiedId === 'link' ? <Check size={16} color="#16a34a" /> : <Copy size={16} color="#6b7280" />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Signer Links */}
                                        {signingLinks.length > 0 && (
                                            <div style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', color: '#1e40af' }}>Signer Links</h3>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                    {signingLinks.map((sl, idx) => (
                                                        <div key={idx} style={{ padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1f2937' }}>{sl.signer_name}</span>
                                                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{sl.signer_email}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <input
                                                                    type="text"
                                                                    value={`${window.location.origin}/sign/${sl.signing_link}`}
                                                                    readOnly
                                                                    style={{ fontSize: '0.8rem', flex: 1, border: 'none', background: 'transparent', outline: 'none', color: '#4b5563' }}
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(`${window.location.origin}/sign/${sl.signing_link}`);
                                                                        setCopiedId(`sl-${idx}`);
                                                                        setTimeout(() => setCopiedId(null), 2000);
                                                                    }}
                                                                    style={{ background: '#f3f4f6', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}
                                                                >
                                                                    {copiedId === `sl-${idx}` ? <Check size={14} color="#16a34a" /> : <Copy size={14} color="#6b7280" />}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Preview section */}
                                        {selectedFiles.length > 0 && filePreview && !uploadedDoc && !uploadedBundleLink && (
                                            <div style={{ width: '100%', maxHeight: '350px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                                {selectedFiles.length > 1 && (
                                                    <div style={{ marginBottom: '1rem', fontWeight: '600', color: '#374151' }}>Previewing first file:</div>
                                                )}
                                                {selectedFiles[0].type.startsWith('image/') ? (
                                                    <img
                                                        src={filePreview}
                                                        alt="Preview"
                                                        style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px' }}
                                                    />
                                                ) : selectedFiles[0].type === 'application/pdf' ? (
                                                    <iframe
                                                        src={filePreview}
                                                        style={{ width: '100%', height: '300px', border: 'none', borderRadius: '8px' }}
                                                        title="PDF Preview"
                                                    />
                                                ) : selectedFiles[0].type === 'text/plain' ? (
                                                    <iframe
                                                        src={filePreview}
                                                        style={{ width: '100%', height: '300px', border: 'none', borderRadius: '8px', background: 'white' }}
                                                        title="Text Preview"
                                                    />
                                                ) : (
                                                    <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                                        <FileText size={64} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                                                        <p style={{ fontSize: '0.875rem' }}>Preview not available for this file type</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {uploadedDoc && !uploadedBundleLink && (
                                            <button
                                                onClick={handlePreview}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: '#f9fafb',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '10px',
                                                    color: '#374151',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#f9fafb'}
                                            >
                                                <Eye size={18} />
                                                Preview Document
                                            </button>
                                        )}

                                        {/* Empty State / Placeholder */}
                                        {!uploadedDoc && !uploadedBundleLink && selectedFiles.length === 0 && (
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d1d5db', flexDirection: 'column', gap: '1rem' }}>
                                                <LinkIcon size={64} style={{ opacity: 0.3 }} />
                                                <p style={{ textAlign: 'center', maxWidth: '200px' }}>Upload a document and click "Generate Secure Link" to create a shareable link</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main >

            {/* Preview Modal */}
            {
                showPreviewModal && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.85)',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}
                        onClick={() => setShowPreviewModal(false)}
                    >
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '16px',
                                maxWidth: '1200px',
                                width: '100%',
                                maxHeight: '90vh',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div style={{
                                padding: '1.5rem',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>
                                        {uploadedDoc?.name}
                                    </h3>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                        {uploadedDoc?.size} • {uploadedDoc?.type}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowPreviewModal(false)}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        background: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#6b7280',
                                        fontSize: '1.5rem'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div style={{
                                flex: 1,
                                overflow: 'auto',
                                padding: '1.5rem',
                                background: '#f9fafb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {uploadedDoc?.type?.startsWith('image/') ? (
                                    <img
                                        src={previewUrl || undefined}
                                        alt={uploadedDoc?.name}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '100%',
                                            objectFit: 'contain',
                                            borderRadius: '8px'
                                        }}
                                    />
                                ) : uploadedDoc?.type === 'application/pdf' ? (
                                    <iframe
                                        src={previewUrl || undefined}
                                        style={{
                                            width: '100%',
                                            height: '600px',
                                            border: 'none',
                                            borderRadius: '8px',
                                            background: 'white'
                                        }}
                                        title="PDF Preview"
                                    />
                                ) : uploadedDoc?.type === 'text/plain' ? (
                                    <iframe
                                        src={previewUrl || undefined}
                                        style={{
                                            width: '100%',
                                            height: '600px',
                                            border: 'none',
                                            borderRadius: '8px',
                                            background: 'white',
                                            padding: '1rem'
                                        }}
                                        title="Text Preview"
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                                        <FileText size={80} color="#9ca3af" style={{ marginBottom: '1.5rem' }} />
                                        <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>
                                            Preview not available
                                        </h4>
                                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                            This file type cannot be previewed in the browser
                                        </p>
                                        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#9ca3af' }}>
                                            {uploadedDoc?.type || 'Unknown type'}
                                        </p>
                                        <a
                                            href={uploadedDoc?.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-block',
                                                marginTop: '1.5rem',
                                                padding: '0.75rem 1.5rem',
                                                background: '#4f46e5',
                                                color: 'white',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                                fontWeight: '600',
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            Open in New Tab
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Signature Field Editor Modal */}
            {
                showFieldEditor && selectedFiles.length === 1 && (
                    <SignatureFieldEditor
                        file={selectedFiles[0]}
                        signers={signers}
                        onSave={(fields) => {
                            setSignatureFields(fields);
                            setShowFieldEditor(false);
                            // Now upload the document with e-signature
                            handleUpload();
                        }}
                        onClose={() => setShowFieldEditor(false)}
                    />
                )
            }

            {/* Signing Links Display (shown after successful upload with e-signature) */}
            {
                signingLinks.length > 0 && uploadedDoc && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.75)',
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}
                        onClick={() => setSigningLinks([])}
                    >
                        <div style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '2rem',
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>
                                🎉 E-Signature Document Created!
                            </h2>
                            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                                Share these links with signers. They will sign in the order specified.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {signingLinks.map((signer, index) => (
                                    <div key={signer.id} style={{
                                        padding: '1rem',
                                        background: '#f9fafb',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '10px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: ['#4f46e5', '#10b981', '#f59e0b'][index % 3],
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: '600'
                                            }}>
                                                {signer.signing_order || (index + 1)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#111827' }}>{signer.signer_name}</div>
                                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{signer.signer_email}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                value={`${window.location.origin}/sign/${signer.signing_link}`}
                                                readOnly
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '6px',
                                                    fontSize: '0.875rem',
                                                    background: 'white'
                                                }}
                                            />
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(`${window.location.origin}/sign/${signer.signing_link}`);
                                                }}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    background: '#4f46e5',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setSigningLinks([])}
                                style={{
                                    width: '100%',
                                    marginTop: '1.5rem',
                                    padding: '0.75rem',
                                    background: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                featureName={lockedFeatureName}
            />
        </div >
    );
};

export default DataRoom;
