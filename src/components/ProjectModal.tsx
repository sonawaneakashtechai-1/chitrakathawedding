import React, { useEffect, useCallback } from 'react';
import { Project } from '../types';
import { X, MapPin, Calendar, Tag, ArrowRight } from 'lucide-react';
import { scrollToSection } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onOpenImage: (imageUrl: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onOpenImage }) => {
  const { t } = useLanguage();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
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
      aria-label={project.title}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#FAF7F2] text-[#1C1C1C] rounded-xl overflow-hidden shadow-2xl my-auto max-h-[90vh] flex flex-col border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#FAF7F2]/95 backdrop-blur-sm border-b border-stone-200">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-brand-red font-semibold">
            <Tag size={12} />
            <span>{project.category}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-stone-300 hover:bg-stone-200 text-stone-700 transition-colors"
            aria-label="Close story modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Main Hero Photo */}
          <div
            className="relative aspect-[16/9] w-full rounded-lg overflow-hidden shadow-md cursor-pointer group"
            onClick={() => onOpenImage(project.cover_image)}
          >
            <img
              src={project.cover_image}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs uppercase tracking-widest font-medium">
              Click to view full size
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="space-y-3">
            <h2 className="font-serif text-2xl sm:text-4xl text-[#1C1C1C] font-normal leading-tight">
              {project.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 font-medium">
              {project.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-brand-red" /> {project.location}
                </span>
              )}
              {project.event_date && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-brand-gold" /> {project.event_date}
                </span>
              )}
            </div>
          </div>

          {/* Story Narrative */}
          {project.description && (
            <div className="prose max-w-none text-stone-700 text-sm sm:text-base font-light leading-relaxed border-l-2 border-brand-red/60 pl-4 py-1">
              <p>{project.description}</p>
            </div>
          )}

          {/* Additional Gallery Photos if available */}
          {project.images && project.images.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-stone-200">
              <h3 className="font-serif text-xl text-[#1C1C1C] font-medium">Story Gallery</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.images.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => onOpenImage(img.image_url)}
                    className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group shadow-sm"
                  >
                    <img
                      src={img.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversion CTA Footer inside modal */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-100/60 p-5 rounded-lg">
            <div>
              <h4 className="font-serif text-lg font-medium text-[#1C1C1C]">Love this visual story?</h4>
              <p className="text-xs text-stone-500">Let Hemant craft your wedding memories with the same elegance.</p>
            </div>
            <button
              onClick={() => {
                onClose();
                scrollToSection('contact');
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest bg-brand-red text-white hover:bg-brand-red-hover transition-colors"
            >
              <span>{t('nav.bookShoot')}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
