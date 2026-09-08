import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Heart, Sparkles, Film, Palette } from 'lucide-react';

export const About: React.FC = () => {
  const { t } = useLanguage();

  const pillars = [
    {
      icon: Heart,
      title: t('about.pillar1.title'),
      desc: t('about.pillar1.desc'),
    },
    {
      icon: Sparkles,
      title: t('about.pillar2.title'),
      desc: t('about.pillar2.desc'),
    },
    {
      icon: Film,
      title: t('about.pillar3.title'),
      desc: t('about.pillar3.desc'),
    },
    {
      icon: Palette,
      title: t('about.pillar4.title'),
      desc: t('about.pillar4.desc'),
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#1C1C1C]">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Top Header & Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Title & Quote */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-brand-red font-semibold">
              <span className="w-6 h-px bg-brand-red" />
              <span>{t('about.subtitle')}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1C1C] font-normal leading-[1.15]">
              {t('about.title')}
            </h2>

            <p className="font-serif italic text-lg sm:text-2xl text-stone-700 font-light leading-relaxed border-l-2 border-brand-red/40 pl-5">
              "{t('about.quote')}"
            </p>

            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-stone-500 font-medium pt-2">
              <MapPin size={14} className="text-brand-red" />
              <span>{t('about.locationBadge')}</span>
            </div>
          </div>

          {/* Right Column: Layered Editorial Image Composition */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000"
                alt="Chitrakatha Indian Couple"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] font-mono text-brand-gold">
                  CHITRAKATHA STUDIO
                </span>
                <p className="font-serif text-lg font-medium leading-snug">
                  Framing emotions that echo through time.
                </p>
              </div>
            </div>

            {/* Secondary Floating Accent Card */}
            <div className="hidden sm:block absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-stone-200/80 max-w-[200px]">
              <div className="flex items-center gap-2 text-brand-red mb-1">
                <Sparkles size={16} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-800">Candid Craft</span>
              </div>
              <p className="text-[11px] text-stone-600 font-light leading-tight">
                Honoring traditions with a modern editorial touch.
              </p>
            </div>
          </div>
        </div>

        {/* Four Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-[#E6E1DA]">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-xl bg-white/70 hover:bg-white border border-stone-200/80 shadow-sm hover:shadow-md transition-all duration-300 space-y-3 group"
              >
                <div className="w-10 h-10 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-colors duration-300">
                  <Icon size={18} />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#1C1C1C] tracking-wide">
                  {pillar.title}
                </h3>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
