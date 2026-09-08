import React from 'react';
import { ArrowRight } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { scrollToSection, createWhatsAppLink } from '../lib/utils';
import { SiteSettings } from '../types';

interface RedCtaSectionProps {
  settings: SiteSettings;
  onOpenBooking?: () => void;
}

export const RedCtaSection: React.FC<RedCtaSectionProps> = ({ settings, onOpenBooking }) => {
  const whatsappUrl = createWhatsAppLink(
    settings.whatsapp_number || '7249532553',
    'Hello Hemant, I would like to reserve our wedding photography dates with Chitrakatha.'
  );

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#8B0000] text-white">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal leading-tight">
          {settings.cta_heading || "Let's Capture Your Beautiful Story"}
        </h2>

        <p className="text-white/90 text-xs sm:text-base md:text-lg font-light max-w-2xl mx-auto leading-relaxed">
          {settings.cta_subtitle || 'Dates for the upcoming wedding season are filling quickly across Maharashtra. Reserve your dates today.'}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => (onOpenBooking ? onOpenBooking() : scrollToSection('contact'))}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] bg-white text-[#8B0000] hover:bg-stone-100 transition-all shadow-xl hover:shadow-2xl active:scale-95"
          >
            <span>{settings.cta_button_primary || 'BOOK YOUR SHOOT'}</span>
            <ArrowRight size={15} />
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] bg-[#25D366] hover:bg-[#20bd5a] text-white transition-all shadow-xl hover:shadow-2xl active:scale-95"
          >
            <WhatsAppIcon size={18} className="fill-white" />
            <span>{settings.cta_button_secondary || 'WHATSAPP NOW'}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
