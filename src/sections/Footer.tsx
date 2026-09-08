import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { scrollToSection, createWhatsAppLink } from '../lib/utils';
import { SiteSettings } from '../types';

interface FooterProps {
  onNavigatePage: (page: 'home' | 'admin' | 'faq' | 'contact') => void;
  settings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigatePage, settings }) => {
  const phone = settings?.phone_number || '7249532553';
  const whatsappNum = settings?.whatsapp_number || phone;
  const email = settings?.email_address || 'clicksbyhemant5564@gmail.com';
  const brandName = settings?.brand_name || 'CHITRAKATHA';
  const subBrand = settings?.sub_brand_text || 'BY HEMANT MANDAWADE';
  const location = settings?.studio_location || 'Satana, Nashik • All Over Maharashtra';

  const whatsappUrl = createWhatsAppLink(
    whatsappNum,
    'Hello Hemant, I would like to book an appointment with Chitrakatha.'
  );

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

    onNavigatePage('home');
    setTimeout(() => scrollToSection(id), 150);
  };

  return (
    <footer className="bg-[#121212] text-white border-t border-neutral-800/80 pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* 4-Column Main Footer Grid matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Column 1: Brand Mark, Tagline & CTAs (Col 5) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Logo matching screenshot */}
            <div className="flex items-center gap-3">
              {/* High-Resolution Marathi Calligraphy Logo */}
              <div className="flex items-center">
                <img
                  src="/images/chitrakatha-logo.png"
                  alt="चित्रकथा Chitrakatha by Hemant"
                  className="h-9 sm:h-11 w-auto object-contain brightness-100 contrast-125"
                />
              </div>

              {/* English Brand & Sub-Brand */}
              <div className="flex flex-col border-l border-neutral-700/80 pl-3">
                <span className="font-serif text-base tracking-[0.18em] font-semibold text-white leading-none uppercase">
                  {brandName}
                </span>
                <span className="text-[8px] uppercase tracking-[0.25em] text-[#D4AF37] font-sans font-medium mt-1">
                  {subBrand}
                </span>
              </div>
            </div>

            {/* Tagline Paragraph matching screenshot */}
            <p className="text-xs text-neutral-400 font-light leading-relaxed max-w-sm">
              {brandName} {subBrand ? `— ${subBrand}` : ''} — Premium Wedding, Pre Wedding, Fashion & Cinematic Photography across Maharashtra.
            </p>

            {/* Row of CTAs matching screenshot */}
            <div className="flex items-center gap-2.5 pt-1">
              {/* WhatsApp Round Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white flex items-center justify-center transition-transform hover:scale-105 shadow"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppIcon size={16} className="fill-white" />
              </a>

              {/* Phone Round Button */}
              <a
                href={`tel:${phone}`}
                className="w-8 h-8 rounded-full bg-[#1E1E1E] hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Call Studio"
              >
                <Phone size={13} />
              </a>

              {/* Red BOOK APPOINTMENT Button */}
              <button
                onClick={() => onNavigatePage('contact')}
                className="px-4 py-2 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] text-white text-[11px] font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                BOOK APPOINTMENT
              </button>
            </div>
          </div>

          {/* Column 2: Quick Links (Col 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-serif text-[#D4AF37] font-medium text-base sm:text-lg tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
              <li>
                <a
                  href="#hero"
                  onClick={(e) => handleNavClick(e, 'hero')}
                  className="hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleNavClick(e, 'about')}
                  className="hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#portfolio"
                  onClick={(e) => handleNavClick(e, 'portfolio')}
                  className="hover:text-white transition-colors"
                >
                  Portfolio
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className="hover:text-white transition-colors"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleNavClick(e, 'faq')}
                  className="hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Services (Col 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-serif text-[#D4AF37] font-medium text-base sm:text-lg tracking-wide">
              Services
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-light">
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className="hover:text-white transition-colors"
                >
                  Wedding Photography
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className="hover:text-white transition-colors"
                >
                  Pre Wedding Shoots
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className="hover:text-white transition-colors"
                >
                  Fashion Editorial
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className="hover:text-white transition-colors"
                >
                  Drone Aerial Cinema
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className="hover:text-white transition-colors"
                >
                  Cinematic Video Films
                </a>
              </li>
              <li>
                <a
                  href="#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className="hover:text-white transition-colors"
                >
                  Photo & Video Retouching
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us (Col 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="font-serif text-[#D4AF37] font-medium text-base sm:text-lg tracking-wide">
              Contact Us
            </h3>
            <div className="space-y-3 text-xs text-neutral-400 font-light">
              {/* Location */}
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[#8B0000] shrink-0 mt-0.5" />
                <span>{location}</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-[#8B0000] shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-white transition-colors font-mono">
                  {phone}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-[#8B0000] shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="hover:text-white transition-colors break-all"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Footer Copyright Bar matching screenshot */}
        <div className="border-t border-neutral-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-light">
          <p>© 2026 {brandName}. All Rights Reserved.</p>
          <div className="flex items-center gap-4 text-neutral-500">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms & Conditions</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
