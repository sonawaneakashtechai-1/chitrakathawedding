import React, { useState, useEffect } from 'react';
import { Phone, Shield, Calendar, Menu } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { scrollToSection, createWhatsAppLink } from '../lib/utils';
import { SiteSettings } from '../types';
import chitrakathaLogo from '../assets/chitrakatha-logo.png';

interface NavbarProps {
  onOpenMobileMenu: () => void;
  currentPage: 'home' | 'admin' | 'faq' | 'contact';
  onNavigatePage: (page: 'home' | 'admin' | 'faq' | 'contact') => void;
  settings: SiteSettings;
  onOpenBooking?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenMobileMenu,
  currentPage,
  onNavigatePage,
  settings,
  onOpenBooking,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('portfolio');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (currentPage === 'home') {
        const sections = ['hero', 'about', 'portfolio', 'services'];
        const current = sections.find((section) => {
          const el = document.getElementById(section);
          if (el) {
            const rect = el.getBoundingClientRect();
            return rect.top <= 160 && rect.bottom >= 160;
          }
          return false;
        });
        if (current) {
          setActiveSection(current === 'hero' ? 'portfolio' : current);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const navLinks = [
    { id: 'hero', label: 'Home', href: '#hero' },
    { id: 'about', label: 'About', href: '#about' },
    { id: 'portfolio', label: 'Portfolio', href: '#portfolio' },
    { id: 'services', label: 'Services', href: '#services' },
    { id: 'faq', label: 'FAQ', href: '#faq' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (id === 'faq') {
      onNavigatePage('faq');
      return;
    }
    if (id === 'contact') {
      onNavigatePage('contact');
      return;
    }

    setActiveSection(id);
    if (currentPage !== 'home') {
      onNavigatePage('home');
      setTimeout(() => scrollToSection(id), 150);
    } else {
      scrollToSection(id);
    }
  };

  const whatsappUrl = createWhatsAppLink(
    settings.whatsapp_number || '7249532553',
    'Hello Hemant, I would like to inquire about wedding photography packages.'
  );

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black/95 backdrop-blur-md text-white border-b border-neutral-800/80 ${
        isScrolled ? 'py-2.5 shadow-2xl' : 'py-3.5'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* 1. Left Branding matching screenshot */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, 'hero')}
          className="flex items-center group focus:outline-none"
        >
          {/* Marathi Logo PNG */}
          <div className="flex items-center">
            <img
              src={chitrakathaLogo}
              alt="चित्रकथा Chitrakatha by Hemant"
              className="h-8 sm:h-10 w-auto object-contain brightness-100 contrast-125 transition-transform group-hover:scale-105"
            />
          </div>
        </a>

        {/* 2. Center Navigation Links (Matching screenshot with White Active Pill) */}
        <nav className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive =
              (currentPage === 'contact' && link.id === 'contact') ||
              (currentPage === 'faq' && link.id === 'faq') ||
              (currentPage === 'home' && activeSection === link.id);

            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.id)}
                className={`text-xs uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black font-semibold px-4 py-1.5 rounded-full shadow-md hover:bg-white/95'
                    : 'text-neutral-300 hover:text-white px-3 py-1.5 font-medium'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* 3. Right Action Bar Controls (Exact match to screenshot) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Phone Pill */}
          <a
            href={`tel:${settings.phone_number || '7249532553'}`}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 text-white text-xs font-mono tracking-wide transition-colors"
          >
            <Phone size={12} className="text-[#D4AF37] fill-[#D4AF37]" />
            <span>{settings.phone_number || '7249532553'}</span>
          </a>


          {/* Quick WhatsApp Round Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center transition-transform hover:scale-105 shadow"
            title="WhatsApp Chitrakatha"
          >
            <WhatsAppIcon size={16} className="fill-white" />
          </a>

          {/* Admin Shield Round Button */}
          <button
            onClick={() => onNavigatePage(currentPage === 'admin' ? 'home' : 'admin')}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
              currentPage === 'admin'
                ? 'bg-[#8B0000] border-[#8B0000] text-white'
                : 'bg-neutral-900/90 border-neutral-700/80 text-neutral-300 hover:text-white hover:border-neutral-500'
            }`}
            title="Studio Admin Panel"
          >
            <Shield size={14} />
          </button>

          {/* Deep Red BOOK SHOOT Button */}
          <button
            onClick={() => (onOpenBooking ? onOpenBooking() : onNavigatePage('contact'))}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 shrink-0"
          >
            <Calendar size={13} />
            <span>BOOK SHOOT</span>
          </button>

          {/* Mobile Hamburger Trigger */}
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-neutral-300 hover:text-white"
            aria-label="Open Mobile Menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>
    </header>
  );
};
