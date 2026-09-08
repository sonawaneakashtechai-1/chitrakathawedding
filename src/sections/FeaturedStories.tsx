import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Project } from '../types';
import { MapPin, Calendar, ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedStoriesProps {
  projects: Project[];
  onOpenStoryModal: (project: Project) => void;
}

export const FeaturedStories: React.FC<FeaturedStoriesProps> = ({ projects, onOpenStoryModal }) => {
  const { t } = useLanguage();

  const featuredList = projects.filter((p) => p.featured).slice(0, 3);

  if (featuredList.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#1C1C1C] border-t border-stone-200/60">
      <div className="max-w-7xl mx-auto space-y-14">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-brand-red font-semibold">
            <span className="w-6 h-px bg-brand-red" />
            <span>{t('featured.badge')}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1C1C] font-normal">
            {t('featured.title')}
          </h2>

          <p className="text-stone-600 text-xs sm:text-base font-light leading-relaxed">
            {t('featured.subtitle')}
          </p>
        </div>

        {/* Featured Stories Cards */}
        <div className="space-y-12 sm:space-y-16">
          {featuredList.map((story, idx) => {
            const isReversed = idx % 2 === 1;

            return (
              <div
                key={story.id || idx}
                className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white p-6 sm:p-10 rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-500`}
              >
                {/* Image Column */}
                <div
                  className={`lg:col-span-7 ${
                    isReversed ? 'lg:order-2' : 'lg:order-1'
                  } relative aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden shadow-md cursor-pointer group`}
                  onClick={() => onOpenStoryModal(story)}
                >
                  <img
                    src={story.cover_image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                  <div className="absolute top-4 left-4 bg-brand-red text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold shadow-sm flex items-center gap-1">
                    <Sparkles size={10} /> Featured Story
                  </div>
                </div>

                {/* Content Column */}
                <div
                  className={`lg:col-span-5 ${
                    isReversed ? 'lg:order-1' : 'lg:order-2'
                  } space-y-5`}
                >
                  <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
                    {story.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-brand-red" /> {story.location}
                      </span>
                    )}
                    {story.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-brand-gold" /> {story.event_date}
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => onOpenStoryModal(story)}
                    className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#1C1C1C] hover:text-brand-red transition-colors cursor-pointer leading-tight"
                  >
                    {story.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed line-clamp-3">
                    {story.description}
                  </p>

                  <button
                    onClick={() => onOpenStoryModal(story)}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-brand-red hover:text-brand-red-hover group pt-2"
                  >
                    <span>{t('featured.viewGallery')}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
