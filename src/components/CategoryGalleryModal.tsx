import React, { useEffect, useCallback } from 'react';
import { Category, PortfolioItem } from '../types';
import { X, Maximize2, MapPin, Calendar } from 'lucide-react';
import { formatImageUrl, handleImageError } from '../lib/utils';

interface CategoryGalleryModalProps {
  category: Category | null;
  items: PortfolioItem[];
  onClose: () => void;
  onOpenLightbox: (item: PortfolioItem, index: number) => void;
}

export const CategoryGalleryModal: React.FC<CategoryGalleryModalProps> = ({
  category,
  items,
  onClose,
  onOpenLightbox,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!category) return;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [category, handleKeyDown]);

  if (!category) return null;

  // Filter items strictly matching category
  const filtered = items.filter(
    (item) =>
      item.categoryId === category.id ||
      item.category.trim().toLowerCase() === category.name.trim().toLowerCase()
  );

  const displayList = filtered;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${category.name} Gallery`}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-3 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl mx-auto bg-[#FAF7F2] text-[#1C1C1C] rounded-2xl overflow-hidden shadow-2xl my-auto max-h-[92vh] flex flex-col border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-[#E6E1DA]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[#8B0000] font-semibold">
                GALLERY ALBUM
              </span>
              <span className="w-1 h-1 rounded-full bg-stone-400" />
              <span className="text-xs font-mono text-stone-500 font-medium">
                {displayList.length} {displayList.length === 1 ? 'ITEM' : 'ITEMS'}
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1C1C] font-medium">
              {category.name} Photography Collection
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full border border-stone-300 hover:bg-stone-200 text-stone-700 transition-colors"
            aria-label="Close album"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Gallery Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {displayList.length === 0 ? (
            <div className="text-center py-20 bg-white/60 rounded-2xl border border-stone-200 space-y-2">
              <p className="font-serif text-xl text-stone-600">No photographs uploaded to {category.name} yet.</p>
              <p className="text-xs text-stone-400 font-light">Photographs added from the Admin Panel under {category.name} will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayList.map((photo, idx) => (
                <div
                  key={photo.id || idx}
                  onClick={() => onOpenLightbox(photo, idx)}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm hover:shadow-xl bg-stone-900 cursor-pointer transition-all duration-300 border border-stone-200"
                >
                  <img
                    src={formatImageUrl(photo.image)}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={handleImageError}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white">
                    <div className="flex justify-end">
                      <span className="p-1.5 rounded-full bg-black/50 backdrop-blur-md">
                        <Maximize2 size={14} />
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif text-lg font-medium">{photo.title}</h4>
                      <div className="flex items-center gap-3 text-[11px] text-stone-300 pt-1">
                        {photo.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={11} className="text-[#8B0000]" /> {photo.location}
                          </span>
                        )}
                        {photo.date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-amber-300" /> {photo.date}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
