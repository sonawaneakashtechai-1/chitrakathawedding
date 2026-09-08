import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Camera, ArrowRight, Sparkles } from 'lucide-react';
import { scrollToSection } from '../lib/utils';

export const Photographer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="photographer" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#1C1C1C]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Portrait Image Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-stone-900">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1000"
                alt="Hemant Mandawade - Lead Photographer"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-[10px] uppercase tracking-[0.25em] font-mono text-brand-gold block">
                  FOUNDER & PRINCIPAL CINEMATOGRAPHER
                </span>
                <h3 className="font-serif text-2xl font-medium tracking-wide">
                  Hemant Mandawade
                </h3>
              </div>
            </div>

            {/* Subtle camera icon pill */}
            <div className="absolute -top-3 -right-3 sm:right-6 bg-brand-red text-white p-3 rounded-full shadow-lg border-2 border-white">
              <Camera size={18} />
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-brand-red font-semibold">
              <span className="w-6 h-px bg-brand-red" />
              <span>{t('photographer.badge')}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1C1C] font-normal leading-tight">
              {t('photographer.title')}
            </h2>

            <div className="space-y-4 text-stone-700 text-sm sm:text-base font-light leading-relaxed">
              <p>{t('photographer.bio1')}</p>
              <p>{t('photographer.bio2')}</p>
            </div>

            {/* Location & Details */}
            <div className="pt-2 flex flex-wrap items-center gap-5 text-xs text-stone-600 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-red" /> Satana • Nashik • Maharashtra
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-brand-gold" /> Available Across India
              </span>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={() => scrollToSection('contact')}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.2em] bg-brand-red text-white hover:bg-brand-red-hover transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{t('photographer.cta')}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
