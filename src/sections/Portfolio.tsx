import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Project, FilterCategory } from '../types';
import { MapPin, Maximize2, Tag, BookOpen } from 'lucide-react';

interface PortfolioProps {
  projects: Project[];
  onOpenLightbox: (project: Project, index: number) => void;
  onOpenStoryModal: (project: Project) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({
  projects,
  onOpenLightbox,
  onOpenStoryModal,
}) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('All');

  const categories: { key: FilterCategory; labelKey: string }[] = [
    { key: 'All', labelKey: 'portfolio.filter.all' },
    { key: 'Weddings', labelKey: 'portfolio.filter.weddings' },
    { key: 'Pre-Wedding', labelKey: 'portfolio.filter.preWedding' },
    { key: 'Fashion', labelKey: 'portfolio.filter.fashion' },
    { key: 'Cinema', labelKey: 'portfolio.filter.cinema' },
  ];

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return projects;
    return projects.filter((p) => p.category === activeFilter);
  }, [projects, activeFilter]);

  return (
    <section id="portfolio" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#1C1C1C]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-brand-red font-semibold">
              <span className="w-6 h-px bg-brand-red" />
              <span>{t('portfolio.badge')}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1C1C] font-normal">
              {t('portfolio.title')}
            </h2>

            <p className="text-stone-600 text-xs sm:text-base font-light leading-relaxed">
              {t('portfolio.subtitle')}
            </p>
          </div>

          {/* Filter Categories Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
            {categories.map((cat) => {
              const isActive = activeFilter === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveFilter(cat.key)}
                  className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-red text-white shadow-sm font-semibold'
                      : 'bg-white/80 hover:bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                  }`}
                  aria-pressed={isActive}
                >
                  {t(cat.labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid (Editorial Staggered) */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white/60 rounded-2xl border border-stone-200 space-y-2">
            <p className="font-serif text-xl text-stone-600">No stories found in this category.</p>
            <p className="text-xs text-stone-400 font-light">New works are added frequently through our studio.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map((project, idx) => {
              // Create dynamic aspect ratio variations for masonry rhythm
              const isLargeSpan = idx % 5 === 0;
              const aspectClass = isLargeSpan
                ? 'aspect-[4/5] sm:row-span-2'
                : idx % 2 === 0
                ? 'aspect-[3/4]'
                : 'aspect-[4/5]';

              return (
                <div
                  key={project.id || idx}
                  className={`group relative ${aspectClass} rounded-xl overflow-hidden shadow-sm hover:shadow-2xl bg-stone-900 transition-all duration-500 cursor-pointer`}
                  onClick={() => onOpenLightbox(project, idx)}
                >
                  {/* High Quality Photograph */}
                  <img
                    src={project.cover_image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />

                  {/* Gradient Scrim Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white/90">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[10px] uppercase tracking-widest border border-white/10 font-medium">
                      <Tag size={10} className="text-brand-red" /> {project.category}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenStoryModal(project);
                      }}
                      className="p-2 rounded-full bg-black/40 hover:bg-brand-red text-white backdrop-blur-md border border-white/15 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      title="Read Story"
                      aria-label={`Read story for ${project.title}`}
                    >
                      <BookOpen size={14} />
                    </button>
                  </div>

                  {/* Bottom Information */}
                  <div className="absolute bottom-0 inset-x-0 p-5 text-white space-y-2 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-serif text-xl sm:text-2xl font-normal leading-snug tracking-wide text-white group-hover:text-brand-gold transition-colors">
                      {project.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-stone-300 pt-1 border-t border-white/10">
                      {project.location && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <MapPin size={12} className="text-brand-red" /> {project.location}
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-white/90 group-hover:text-brand-gold transition-colors">
                        <Maximize2 size={12} /> {t('portfolio.viewStory')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
