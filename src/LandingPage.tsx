import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import Logo from './components/Logo';
import SEO from './components/SEO';
import {
  Shield,
  FileText,
  Lock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  File,
  Upload,
  Download,
  Share2,
  Mail,
  Droplets,
  FileCheck,
  ScrollText,
  Activity,
  BarChart3,
  Bell,
  Flame,
  Fingerprint,
  Camera,
  PenTool,
  Clock
} from 'lucide-react';
import LanguageSelector from './components/LanguageSelector';
import { useTranslation } from 'react-i18next';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showProductMenu, setShowProductMenu] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "What makes 'Vault Mode' different from standard encryption?",
      answer: "Vault Mode uses client-side (end-to-end) encryption. Your files are encrypted in your browser before they ever leave your device. We never see your password or your files—only the encrypted blob. Even if our servers were compromised, your data would remain unreadable."
    },
    {
      question: "How does Biometric Access work for recipients?",
      answer: "When you enable Biometric Gate, recipients must authenticate using FaceID, TouchID, or Windows Hello on their device to view the document. This ensures that only a human present at the device can access the file, adding a physical layer of security beyond just a password."
    },
    {
      question: "Can I use DocTransfer for legally binding signatures?",
      answer: "Yes. Our E-Signature feature creates a legally binding audit trail, capturing the signer's IP, timestamp, and digital signature. It's perfect for contracts, NDAs, and agreements."
    },
    {
      question: "How does the Dynamic Watermark prevent leaks?",
      answer: "Our dynamic watermarking overlays the recipient's email address, IP address, and time of access directly onto the document view. If someone takes a screenshot or photo, their identity is stamped on the image, acting as a powerful deterrent against unauthorized sharing."
    },
    {
      question: "Can I send multiple files at once?",
      answer: "Absolutely. With Document Bundles, you can upload multiple files (e.g., a contract, a presentation, and a spreadsheet) and share them all via a single secure link. You get unified analytics for the entire package."
    },
    {
      question: "Do recipients need to download an app?",
      answer: "No downloads required. We pride ourselves on a frictionless experience. Recipients can view high-fidelity documents, unlock protected files, and even sign contracts directly in their secure mobile or desktop browser."
    },
    {
      question: "What analytics will I see?",
      answer: "You get granular, real-time tracking. See exactly when your document was opened, how long it was viewed, and a page-by-page breakdown of engagement. You'll know exactly which slide of your pitch deck they spent the most time on."
    },
    {
      question: "Is there a free plan?",
      answer: "Yes! Our Free Plan is generous for individuals. It includes basic password protection, download controls, and up to 10 secure uploads per day. It's not a trial—it's free forever."
    }
  ];

  return (
    <div className="landing-page">
      <SEO
        title="Secure Document Sharing with E2E Encryption & Analytics"
        description="Share documents securely with end-to-end encryption, dynamic watermarking, real-time analytics & e-signatures. Free DocSend alternative. 10 uploads/day free forever."
        keywords="secure document sharing, DocSend alternative, end-to-end encryption, dynamic watermarking, document analytics, pitch deck sharing"
      />
      <header className="header">
        <Logo size={32} />
        <nav>
          <div className="nav-links">
            <div
              className="nav-item-dropdown"
              style={{ position: 'relative', display: 'inline-block' }}
              onMouseEnter={() => setShowProductMenu(true)}
              onMouseLeave={() => setShowProductMenu(false)}
            >
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  fontWeight: 500,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0'
                }}
              >
                Product <ChevronDown size={16} />
              </button>

              {showProductMenu && (
                <div
                  className="product-dropdown"
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: '-50px',
                    width: '600px',
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    padding: '2rem',
                    zIndex: 1000,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '2rem',
                    border: '1px solid #f3f4f6'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '1rem', letterSpacing: '0.05em' }}>Core Security</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { name: 'Secure Transfer', icon: Shield, desc: 'Encrypted document sharing' },
                        { name: 'End-to-End Encryption', icon: Lock, desc: 'Zero-knowledge architecture' },
                        { name: 'Password Protection', icon: Lock, desc: 'Access control with passwords' },
                        { name: 'Email Verification', icon: Mail, desc: 'Confirm recipient identity' },
                        { name: 'Link Expiration', icon: Clock, desc: 'Time-limited access' },
                        { name: 'Burn After Reading', icon: Flame, desc: 'Self-destructing files' },
                      ].map((feature, i) => (
                        <li key={i}>
                          <a href="#features" style={{ textDecoration: 'none', display: 'flex', alignItems: 'start', gap: '0.75rem', color: '#1f2937' }}>
                            <div style={{ padding: '0.35rem', background: '#eff6ff', borderRadius: '6px', color: '#4f46e5' }}>
                              <feature.icon size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{feature.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{feature.desc}</div>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '1rem', letterSpacing: '0.05em' }}>Advanced Features</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {[
                        { name: 'Dynamic Watermarking', icon: Droplets, desc: 'Traceable document overlays' },
                        { name: 'Biometric Lock', icon: Fingerprint, desc: 'Fingerprint & Face ID access' },
                        { name: 'Webcam Snapshot', icon: Camera, desc: 'Photo verification on view' },
                        { name: 'E-Signature', icon: PenTool, desc: 'Legally binding signatures' },
                        { name: 'Deep Analytics', icon: BarChart3, desc: 'Page-level engagement tracking' },
                        { name: 'Audit Trails', icon: FileCheck, desc: 'Complete activity logs' },
                      ].map((feature, i) => (
                        <li key={i}>
                          <a href="#features" style={{ textDecoration: 'none', display: 'flex', alignItems: 'start', gap: '0.75rem', color: '#1f2937' }}>
                            <div style={{ padding: '0.35rem', background: '#f5f3ff', borderRadius: '6px', color: '#7c3aed' }}>
                              <feature.icon size={16} />
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{feature.name}</div>
                              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{feature.desc}</div>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <Link to="/pricing">Pricing</Link>
            <a href="#security">Security</a>
          </div>
          <SignedOut>
            <SignInButton mode="modal">
              <button
                className="btn-primary"
                style={{
                  padding: '0.75rem 1.75rem',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  borderRadius: '14px',
                  boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
                  letterSpacing: '0.025em'
                }}
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Link to="/dataroom">
                <button
                  style={{
                    padding: '0.65rem 1.25rem',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.4)';
                  }}
                >
                  Dashboard
                </button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero">
          {/* Floating Background Elements */}
          <div className="floating-elements">
            <div className="floating-icon floating-1"><FileText size={40} /></div>
            <div className="floating-icon floating-2"><Upload size={35} /></div>
            <div className="floating-icon floating-3"><Download size={38} /></div>
            <div className="floating-icon floating-4"><Share2 size={32} /></div>
            <div className="floating-icon floating-5"><File size={36} /></div>
            <div className="floating-icon floating-6"><FileText size={34} /></div>

            <div className="floating-orb orb-1"></div>
            <div className="floating-orb orb-2"></div>
            <div className="floating-orb orb-3"></div>
          </div>

          <h1 className="hero-title-animated">Securely Sharing, Tracking and Manage All Document</h1>
          <p className="hero-subtitle-animated">Share documents securely with real-time insights and control.</p>
          <div className="hero-actions">
            <Link to="/pricing">
              <button className="hero-btn-primary">Get Started Free</button>
            </Link>
            <Link to="/pricing">
              <button className="hero-btn-secondary">View Pricing</button>
            </Link>
          </div>

          <div className="transfer-animation-container">
            <div className="transfer-scene">
              {/* Sender Side */}
              <div className="transfer-node sender-node">
                <div className="node-avatar">
                  <Upload size={32} />
                </div>
                <div className="node-label">Sender</div>
                <div className="node-status">Uploading...</div>
              </div>

              {/* Transfer Path with Animated Documents */}
              <div className="transfer-path">
                <div className="transfer-line">
                  <div className="transfer-pulse"></div>
                </div>

                {/* Animated Flying Documents */}
                <div className="flying-doc doc-1">
                  <FileText size={24} />
                </div>
                <div className="flying-doc doc-2">
                  <File size={22} />
                </div>
                <div className="flying-doc doc-3">
                  <FileCheck size={20} />
                </div>

                {/* Data Particles */}
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
                <div className="particle particle-4"></div>
                <div className="particle particle-5"></div>
                <div className="particle particle-6"></div>
              </div>

              {/* Receiver Side */}
              <div className="transfer-node receiver-node">
                <div className="node-avatar">
                  <Download size={32} />
                </div>
                <div className="node-label">Receiver</div>
                <div className="node-status">Receiving...</div>
              </div>
            </div>

            {/* Security Badges */}
            <div className="security-badges">
              <div className="security-badge">
                <Lock size={16} />
                <span>Encrypted Storage</span>
              </div>
              <div className="security-badge">
                <Shield size={16} />
                <span>Secure Transfer</span>
              </div>
              <div className="security-badge">
                <CheckCircle size={16} />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className="security-section" id="security">
          <span className="section-badge">Enterprise-Grade Security</span>
          <h2>Enterprise-Grade Security for Your Files</h2>
          <p style={{ maxWidth: '600px', margin: '1rem auto', color: '#6b7280' }}>
            We take security seriously. Your data is encrypted and protected at every step.
          </p>

          <div className="security-content">
            <div className="security-image">
              <div style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)', padding: '3rem', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={120} color="#6366f1" strokeWidth={1} />
              </div>
            </div>
            <div className="security-details">
              <h3>AES-256 Encryption Standard</h3>
              <p style={{ marginBottom: '2rem', color: '#6b7280' }}>
                Your files are encrypted in your browser using military-grade AES-256-GCM encryption before they ever reach our servers. We can't read your files, and neither can anyone else.
              </p>
              <ul className="security-list">
                <li>
                  <CheckCircle className="check-icon" size={24} />
                  <span>Client-side encryption (Zero-Knowledge)</span>
                </li>
                <li>
                  <CheckCircle className="check-icon" size={24} />
                  <span>Granular access controls and permissions</span>
                </li>
                <li>
                  <CheckCircle className="check-icon" size={24} />
                  <span>Automatic expiration and self-destruct</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="features-section" id="features">
          <div className="features-header">
            <span className="section-badge">Key Features</span>
            <h2>Enterprise-Grade Document Security</h2>
            <p style={{ maxWidth: '700px', margin: '1rem auto', color: '#6b7280', fontSize: '1.1rem' }}>
              Comprehensive tools to secure, track, and control your sensitive documents with confidence.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card premium-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                  <Lock size={28} />
                </div>
              </div>
              <h3>Password Protection</h3>
              <p>Secure files with password-protected links. Add an extra layer of security ensuring only authorized recipients can access your sensitive documents.</p>
              <div className="feature-highlight">🔐 Secure password protection</div>
            </div>

            <div className="feature-card premium-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' }}>
                  <Mail size={28} />
                </div>
              </div>
              <h3>Email Verification</h3>
              <p>Require recipients to verify their email address to access documents. Ensure your files reach the intended recipient and maintain audit compliance.</p>
              <div className="feature-highlight">✉️ Identity assured</div>
            </div>

            <div className="feature-card premium-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' }}>
                  <Droplets size={28} />
                </div>
              </div>
              <h3>Dynamic Watermarking</h3>
              <p>Apply watermarks with viewer details and custom text. Prevent unauthorized sharing and maintain document traceability with personalized watermarks.</p>
              <div className="feature-highlight">💧 Customizable branding</div>
            </div>

            <div className="feature-card premium-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>
                  <Download size={28} />
                </div>
              </div>
              <h3>Download Controls</h3>
              <p>Restrict or allow document downloads. Control how recipients interact with your files - view-only mode or full download permissions.</p>
              <div className="feature-highlight">⚙️ Granular permissions</div>
            </div>

            <div className="feature-card premium-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>
                  <FileCheck size={28} />
                </div>
              </div>
              <h3>Audit Trail</h3>
              <p>Maintain a complete log of all user activity for compliance and transparency. Track every view, download, and interaction with detailed timestamps.</p>
              <div className="feature-highlight">📊 Complete visibility</div>
            </div>

            <div className="feature-card premium-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' }}>
                  <ScrollText size={28} />
                </div>
              </div>
              <h3>NDA Agreements</h3>
              <p>Require recipients to agree to Non-Disclosure Agreements before viewing. Legally protect your confidential information with digital signatures.</p>
              <div className="feature-highlight">📝 Legal protection</div>
            </div>

            <div className="feature-card premium-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #2dd4bf 100%)' }}>
                  <Activity size={28} />
                </div>
              </div>
              <h3>Real-time Analytics</h3>
              <p>Track document views and engagement in real-time. Monitor who's viewing your documents as it happens with live dashboard updates.</p>
              <div className="feature-highlight">⚡ Live tracking</div>
            </div>

            <div className="feature-card premium-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}>
                  <BarChart3 size={28} />
                </div>
              </div>
              <h3>Page-by-Page Analytics</h3>
              <p>Gain detailed insights into how viewers interact with individual pages. See which pages get the most attention and where readers drop off.</p>
              <div className="feature-highlight">📈 Deep insights</div>
            </div>

            <div className="feature-card premium-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)' }}>
                  <Bell size={28} />
                </div>
              </div>
              <h3>Instant Alerts</h3>
              <p>Receive notifications when documents are viewed or shared. Stay informed with real-time alerts via email or in-app notifications.</p>
              <div className="feature-highlight">🔔 Stay notified</div>
            </div>
          </div>
        </section>

        {/* Animated Features Showcase */}
        <section className="animated-showcase">
          <div className="showcase-container">
            {/* Feature Wave 1 */}
            <div className="showcase-item wave-1">
              <div className="showcase-icon">
                <Lock size={32} />
              </div>
              <h3>Password Protection</h3>
              <p>Secure your files with password protection</p>
            </div>

            {/* Feature Wave 2 */}
            <div className="showcase-item wave-2">
              <div className="showcase-icon">
                <Activity size={32} />
              </div>
              <h3>Real-Time Analytics</h3>
              <p>Track views and engagement as it happens</p>
            </div>

            {/* Feature Wave 3 */}
            <div className="showcase-item wave-3">
              <div className="showcase-icon">
                <Bell size={32} />
              </div>
              <h3>Instant Notifications</h3>
              <p>Get alerted when documents are accessed</p>
            </div>

            {/* Feature Wave 4 */}
            <div className="showcase-item wave-4">
              <div className="showcase-icon">
                <Droplets size={32} />
              </div>
              <h3>Custom Watermarks</h3>
              <p>Protect against unauthorized sharing</p>
            </div>

            {/* Animated Background Elements */}
            <div className="showcase-glow glow-1"></div>
            <div className="showcase-glow glow-2"></div>
            <div className="showcase-glow glow-3"></div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-card">
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.875rem', marginBottom: '1rem', display: 'inline-block' }}>Start for free</span>
            <h2>Everything you need to share securely</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto', opacity: 0.9 }}>
              Join thousands of professionals who trust DocTransfer for their document sharing needs.
            </p>
            <div className="cta-buttons">
              <Link to="/pricing">
                <button style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                  transition: 'transform 0.2s'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >Get Started Now</button>
              </Link>
              <button style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Contact Sales</button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${openFaq === index ? 'active' : ''}`} onClick={() => toggleFaq(index)}>
                <div className="faq-question">
                  {faq.question}
                  {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                <div className="faq-answer">
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-col">
            <div style={{ marginBottom: '1rem' }}>
              <Logo size={28} />
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Secure document sharing and analytics for modern teams.
            </p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#">Features</a></li>
              <li><a href="#">Security</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Enterprise</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                padding: '0.5rem',
                borderRadius: '8px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
              }}>
                <Mail size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', marginBottom: '2px' }}>Email Us</div>
                <a href="mailto:doctransfer144@gmail.com" style={{ color: '#1f2937', fontWeight: 600, textDecoration: 'none', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                  doctransfer144@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem', color: '#9ca3af', fontSize: '0.875rem' }}>
          &copy; 2025 DocTransfer. All rights reserved.
        </div>
      </footer >
    </div >
  );
};

export default LandingPage;
