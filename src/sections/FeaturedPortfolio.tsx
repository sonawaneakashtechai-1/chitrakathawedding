import React, { useState, useMemo } from 'react';
import { Category, PortfolioItem } from '../types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { formatImageUrl, handleImageError } from '../lib/utils';

interface FeaturedPortfolioProps {
  categories: Category[];
  portfolioItems: PortfolioItem[];
  onOpenCategoryGallery: (category: Category) => void;
}

export const FeaturedPortfolio: React.FC<FeaturedPortfolioProps> = ({
  categories,
  portfolioItems,
  onOpenCategoryGallery,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // Active visible categories
  const visibleCategories = useMemo(() => {
    const active = categories.filter((c) => !c.hidden);
    if (selectedFilter === 'All') return active;
    return active.filter((c) => c.name.toLowerCase() === selectedFilter.toLowerCase());
  }, [categories, selectedFilter]);

  // Compute exact item count per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach((cat) => {
      const itemsInCat = portfolioItems.filter(
        (item) =>
          item.categoryId === cat.id ||
          item.category.trim().toLowerCase() === cat.name.trim().toLowerCase()
      );
      counts[cat.id] = itemsInCat.length;
    });
    return counts;
  }, [categories, portfolioItems]);

  const filterOptions = ['All', ...categories.filter((c) => !c.hidden).map((c) => c.name)];

  return (
    <section id="portfolio" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#1C1C1C] border-t border-[#E6E1DA]/60">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#8B0000] font-semibold">
            <Sparkles size={13} />
            <span>PORTFOLIO SHOWCASE</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1C1C] font-normal">
            Featured Portfolio
          </h2>

          <p className="text-stone-600 text-xs sm:text-base font-light leading-relaxed">
            Explore detailed galleries for weddings, pre-weddings, engagements, celebrations and cinematic stories.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none justify-start lg:justify-center">
          {filterOptions.map((opt) => {
            const isActive = selectedFilter === opt;
            return (
              <button
                key={opt}
                onClick={() => setSelectedFilter(opt)}
                className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#8B0000] text-white shadow-sm'
                    : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 hover:border-stone-400'
                }`}
                aria-pressed={isActive}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {visibleCategories.map((cat) => {
            const count = categoryCounts[cat.id] ?? 0;

            return (
              <div
                key={cat.id}
                onClick={() => onOpenCategoryGallery(cat)}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm hover:shadow-2xl bg-stone-900 cursor-pointer transition-all duration-500 border border-stone-200"
              >
                {/* Cover Image */}
                <img
                  src={formatImageUrl(cat.coverImage)}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={handleImageError}
                />

                {/* Dark Scrim Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20 group-hover:opacity-90 transition-opacity" />

                {/* Top Badge: Item Count */}
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] uppercase tracking-widest font-mono text-white/90 border border-white/20">
                    {count > 0 ? `${count} ${count === 1 ? 'ITEM' : 'ITEMS'}` : 'VIEW ALBUM'}
                  </span>
                </div>

                {/* Bottom Title & Action */}
                <div className="absolute bottom-0 inset-x-0 p-6 text-white space-y-2 transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide text-white group-hover:text-amber-200 transition-colors">
                    {cat.name}
                  </h3>

                  <div className="pt-2 flex items-center justify-between border-t border-white/20 text-xs">
                    <span className="text-[11px] uppercase tracking-wider text-stone-300 font-medium">
                      View Full Album
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-white group-hover:text-amber-200 transition-colors">
                      <span>OPEN GALLERY</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
