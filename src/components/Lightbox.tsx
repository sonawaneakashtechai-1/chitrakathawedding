import React, { useEffect, useCallback } from 'react';
import { Project } from '../types';
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Tag } from 'lucide-react';
import { formatImageUrl, handleImageError } from '../lib/utils';

interface LightboxProps {
  project: Project | null;
  currentIndex: number;
  totalProjects: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  project,
  currentIndex,
  totalProjects,
  onClose,
  onNext,
  onPrev,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    if (!project) return;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, handleKeyDown]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo Lightbox"
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-fade-in"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between z-10 text-white/90">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.2em] font-mono text-brand-gold">
            {currentIndex + 1} / {totalProjects}
          </span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-stone-600" />
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-stone-300 font-medium">
            <Tag size={12} className="text-brand-red" /> {project.category}
          </span>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
          aria-label="Close Lightbox"
        >
          <X size={20} />
        </button>
      </div>

      {/* Center Image Container */}
      <div className="relative flex-1 flex items-center justify-center my-2 max-h-[78vh] overflow-hidden select-none">
        {/* Prev Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Previous photograph"
        >
          <ChevronLeft size={24} />
        </button>

        {/* The Image */}
        <div className="relative max-h-full max-w-5xl mx-auto flex items-center justify-center px-4">
          <img
            src={formatImageUrl(project.cover_image)}
            alt={project.title}
            className="max-h-[74vh] max-w-full object-contain rounded-sm shadow-2xl transition-transform duration-300"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={handleImageError}
          />
        </div>

        {/* Next Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Next photograph"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Bottom Metadata Bar */}
      <div className="max-w-4xl mx-auto w-full text-center z-10 text-white space-y-1.5 px-4">
        <h3 className="font-serif text-xl sm:text-2xl tracking-wide text-white font-medium">
          {project.title}
        </h3>
        {project.description && (
          <p className="text-xs sm:text-sm text-stone-300 font-light max-w-2xl mx-auto line-clamp-2">
            {project.description}
          </p>
        )}
        <div className="flex items-center justify-center gap-4 text-[11px] text-stone-400 pt-1">
          {project.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-brand-red" /> {project.location}
            </span>
          )}
          {project.event_date && (
            <span className="flex items-center gap-1">
              <Calendar size={11} className="text-brand-gold" /> {project.event_date}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
