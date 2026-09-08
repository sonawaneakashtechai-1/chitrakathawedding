import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'light' | 'dark' | 'header';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'header' }) => {
  const { language, setLanguage } = useLanguage();

  const options: { code: Language; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'mr', label: 'मराठी' },
    { code: 'hi', label: 'हिन्दी' },
  ];

  const baseStyle = variant === 'dark'
    ? 'bg-neutral-900/80 border-neutral-700 text-neutral-300'
    : 'bg-white/80 border-stone-200/80 text-stone-700';

  return (
    <div className={`inline-flex items-center gap-1 p-1 rounded-full border backdrop-blur-md text-xs font-medium ${baseStyle} transition-all duration-300 shadow-sm`}>
      <div className="pl-1.5 pr-0.5 text-brand-red opacity-80" aria-hidden="true">
        <Globe size={13} />
      </div>
      {options.map((opt) => {
        const isActive = language === opt.code;
        return (
          <button
            key={opt.code}
            onClick={() => setLanguage(opt.code)}
            className={`px-2.5 py-1 rounded-full transition-all duration-300 ${
              isActive
                ? 'bg-brand-red text-white shadow-sm font-semibold'
                : 'hover:text-brand-red hover:bg-stone-100/60'
            }`}
            aria-label={`Switch language to ${opt.label}`}
            aria-pressed={isActive}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
