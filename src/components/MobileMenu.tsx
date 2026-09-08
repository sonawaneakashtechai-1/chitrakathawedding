import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, Phone, Mail, MapPin } from 'lucide-react';
import { scrollToSection } from '../lib/utils';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: 'home' | 'admin' | 'faq' | 'contact';
  onNavigatePage: (page: 'home' | 'admin' | 'faq' | 'contact') => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  currentPage,
  onNavigatePage,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleLinkClick = (id: string) => {
    onClose();
    if (id === 'faq') {
      onNavigatePage('faq');
      return;
    }
    if (id === 'contact') {
      onNavigatePage('contact');
      return;
    }

    if (currentPage !== 'home') {
      onNavigatePage('home');
      setTimeout(() => scrollToSection(id), 150);
    } else {
      setTimeout(() => scrollToSection(id), 100);
    }
  };

  const navLinks = [
    { id: 'hero', label: t('nav.home') },
    { id: 'about', label: t('nav.about') },
    { id: 'portfolio', label: t('nav.portfolio') },
    { id: 'services', label: t('nav.services') },
    { id: 'films', label: t('nav.films') },
    { id: 'faq', label: 'Frequently Asked Questions' },
    { id: 'contact', label: 'Contact & Bookings' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-[#141414] text-white p-6 sm:p-8 animate-fade-in overflow-y-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <div className="flex items-center gap-3">
          <img
            src="/images/chitrakatha-logo.png"
            alt="चित्रकथा Chitrakatha by Hemant"
            className="h-8 w-auto object-contain brightness-100"
          />
          <div className="flex flex-col border-l border-neutral-700/80 pl-2.5">
            <span className="font-serif text-sm tracking-[0.18em] font-semibold text-white leading-none uppercase">
              CHITRAKATHA
            </span>
            <span className="text-[7px] uppercase tracking-[0.2em] text-[#D4AF37] font-sans font-medium mt-0.5">
              BY HEMANT MANDAWADE
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-600 transition-colors"
          aria-label="Close navigation menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col space-y-4 py-8">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => handleLinkClick(link.id)}
            className="text-left font-serif text-2xl sm:text-3xl text-neutral-200 hover:text-white hover:pl-2 transition-all"
          >
            {link.label}
          </button>
        ))}

        <button
          onClick={() => {
            onClose();
            onNavigatePage('admin');
          }}
          className="text-left text-xs uppercase tracking-widest text-brand-gold font-semibold pt-4 border-t border-neutral-800"
        >
          Studio CMS Admin →
        </button>
      </nav>

      {/* Footer Info */}
      <div className="border-t border-neutral-800 pt-6 space-y-3 text-xs text-neutral-400 font-light">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-brand-red" />
          <span>Satana, Nashik, Maharashtra</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-brand-red" />
          <span>+91 7249532553</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail size={14} className="text-brand-red" />
          <span>clicksbyhemant5564@gmail.com</span>
        </div>
      </div>
    </div>
  );
};
