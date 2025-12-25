import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' }
];

const LanguageSelector: React.FC = () => {
    const { i18n } = useTranslation();

    // Since there's only one language, we can just show a static display
    // or hide the component entirely
    const currentLang = languages[0];

    return (
        <div className="language-selector" style={{ position: 'relative' }}>
            <button
                disabled
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'transparent',
                    border: '1px solid #e5e7eb',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    cursor: 'default',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    opacity: 0.6
                }}
            >
                <span>{currentLang.flag}</span>
                <span className="hidden md:block">{currentLang.name}</span>
            </button>
        </div>
    );
};

export default LanguageSelector;
