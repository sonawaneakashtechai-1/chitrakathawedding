import React, { useState, useMemo } from 'react';
import { Film } from '../types';
import { Play, Film as FilmIcon } from 'lucide-react';
import {
  formatImageUrl,
  extractYouTubeId,
  getYouTubeThumbnail,
  extractGoogleDriveFileId,
  getCategoryFallbackImage,
  handleImageError,
  matchesFilmCategory,
} from '../lib/utils';

interface FilmsProps {
  films: Film[];
  onPlayFilm: (film: Film) => void;
}


export const Films: React.FC<FilmsProps> = ({ films, onPlayFilm }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const publishedFilms = useMemo(() => {
    return films.filter(
      (f) => f.featured !== false && (f as any).published !== false
    );
  }, [films]);

  // Extract all distinct categories from films + saved categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    publishedFilms.forEach((f) => {
      if (f.category && f.category.trim()) {
        set.add(f.category.trim());
      }
    });

    try {
      const saved = localStorage.getItem('chitrakatha_film_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => {
            if (typeof c === 'string' && c.trim()) set.add(c.trim());
          });
        }
      }
    } catch {}

    const list = Array.from(set);
    return ['All', ...list];
  }, [publishedFilms]);

  // Filter films by selected category
  const visibleFilms = useMemo(() => {
    if (selectedCategory === 'All') return publishedFilms;
    return publishedFilms.filter((f) => matchesFilmCategory(f.category, selectedCategory));
  }, [publishedFilms, selectedCategory]);

  return (
    <section id="films" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#1C1C1C] border-t border-[#E6E1DA]/60">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Centered Section Header */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.25em] text-[#8B0000] font-bold">
            <FilmIcon size={13} />
            <span>CINEMATIC FILMS</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-normal tracking-tight">
            Cinematic Video Gallery
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-light">
            Immersive stories told through 4K motion, music, and raw emotion.
          </p>
        </div>

        {/* Category Filter Tabs */}
        {categoriesList.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat;
              const count = cat === 'All'
                ? publishedFilms.length
                : publishedFilms.filter((f) => matchesFilmCategory(f.category, cat)).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#8B0000] text-white shadow-md'
                      : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200 hover:border-stone-400'
                  }`}
                  aria-pressed={isActive}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Video Cards Grid */}
        {visibleFilms.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-2xl border border-stone-200 space-y-2 max-w-xl mx-auto">
            <p className="font-serif text-lg text-stone-600">
              {selectedCategory === 'All'
                ? 'Cinematic films are being curated.'
                : `No videos found in "${selectedCategory}".`}
            </p>
            <p className="text-xs text-stone-400 font-light">
              Check back soon or select another category above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {visibleFilms.map((film, idx) => {

              const ytId = extractYouTubeId(film.video_url);
              const driveId = extractGoogleDriveFileId(film.video_url);
              const hasCustomImage =
                film.thumbnail_url &&
                !film.thumbnail_url.includes('drive.google.com/thumbnail') &&
                !film.thumbnail_url.includes('drive.google.com/file');

              const fallbackImg = getCategoryFallbackImage(film.category);

              return (
                <div
                  key={film.id || idx}
                  onClick={() => onPlayFilm(film)}
                  className="group bg-white rounded-2xl border border-stone-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                >
                  {/* Video Thumbnail Area with Top Red Badge & Center White Play Button */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-950 flex items-center justify-center">
                    {/* Ultra-Fast Video Cover Rendering */}
                    {ytId && !hasCustomImage ? (
                      /* YouTube HD Thumbnail */
                      <img
                        src={getYouTubeThumbnail(ytId)}
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => handleImageError(e, fallbackImg)}
                      />
                    ) : hasCustomImage ? (
                      /* Custom Uploaded Thumbnail Image */
                      <img
                        src={formatImageUrl(film.thumbnail_url)}
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => handleImageError(e, fallbackImg)}
                      />
                    ) : driveId ? (
                      /* Google Drive CDN Image Poster (Fast & Lightweight) */
                      <img
                        src={`https://lh3.googleusercontent.com/d/${driveId}=w800`}
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => handleImageError(e, fallbackImg)}
                      />
                    ) : (
                      /* Category High-Res Photography Fallback */
                      <img
                        src={fallbackImg}
                        alt={film.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                      />
                    )}

                    {/* Dark Vignette Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                    {/* Top-Left Deep Red Category Pill */}
                    <div className="absolute top-3 left-3 z-10 pointer-events-none">
                      <span className="inline-block px-3 py-1 rounded-full bg-[#8B0000] text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                        {film.category || 'WEDDING FILM'}
                      </span>
                    </div>

                    {/* Center White Play Button with Red Icon */}
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className="w-12 h-12 rounded-full bg-white text-[#8B0000] flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-115">
                        <Play size={18} className="ml-0.5 fill-[#8B0000]" />
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-3">
                    <h3 className="font-serif text-xl sm:text-2xl text-[#1C1C1C] font-medium leading-snug group-hover:text-[#8B0000] transition-colors">
                      {film.title}
                    </h3>

                    {/* Subtle Divider */}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400 font-light">
                      <span>Maharashtra</span>
                      <span className="text-[11px] font-mono text-stone-400 uppercase">4K Cinema</span>
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
