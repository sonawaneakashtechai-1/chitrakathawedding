import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Testimonial } from '../types';
import { Star, Quote } from 'lucide-react';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  const { t } = useLanguage();

  const approvedList = testimonials.filter((t) => t.approved);

  if (approvedList.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F4EFE6] text-[#1C1C1C]">
      <div className="max-w-7xl mx-auto space-y-14">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-brand-red font-semibold">
            <span className="w-6 h-px bg-brand-red" />
            <span>{t('testimonials.badge')}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1C1C] font-normal">
            {t('testimonials.title')}
          </h2>

          <p className="text-stone-600 text-xs sm:text-base font-light leading-relaxed">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {approvedList.map((item, idx) => (
            <div
              key={item.id || idx}
              className="relative bg-white p-7 sm:p-8 rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              {/* Quote Mark Background Icon */}
              <div className="absolute top-6 right-6 text-stone-200 pointer-events-none">
                <Quote size={32} className="rotate-180 opacity-60" />
              </div>

              {/* Stars & Quote Body */}
              <div className="space-y-4 relative z-10">
                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: item.rating || 5 }).map((_, sIdx) => (
                    <Star key={sIdx} size={14} className="fill-current" />
                  ))}
                </div>

                {/* Testimonial Quote */}
                <p className="text-stone-700 text-xs sm:text-sm font-light leading-relaxed italic">
                  "{item.testimonial}"
                </p>
              </div>

              {/* Client Info */}
              <div className="pt-4 border-t border-stone-100 flex items-center gap-3.5">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.client_name}
                    className="w-11 h-11 rounded-full object-cover border border-stone-200"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-brand-red/10 text-brand-red font-serif font-semibold text-lg flex items-center justify-center">
                    {item.client_name.charAt(0)}
                  </div>
                )}

                <div>
                  <h4 className="font-serif text-lg font-medium text-[#1C1C1C] leading-snug">
                    {item.client_name}
                  </h4>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {item.event_type}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
