import React, { useEffect, useCallback, useState } from 'react';
import { Film } from '../types';
import { X, Film as FilmIcon, AlertCircle, RefreshCw } from 'lucide-react';

import { formatVideoEmbedUrl, getPlayableVideoUrl } from '../lib/utils';

interface VideoModalProps {
  film: Film | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ film, onClose }) => {
  const [resolvedVideoUrl, setResolvedVideoUrl] = useState<string>('');
  const [videoError, setVideoError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!film) {
      setResolvedVideoUrl('');
      setVideoError(false);
      setLoading(true);
      return;
    }
    setVideoError(false);
    setLoading(true);
    let isMounted = true;
    getPlayableVideoUrl(film.video_url, film.id).then((url) => {
      if (isMounted) {
        setResolvedVideoUrl(url || film.video_url || '');
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [film]);

  useEffect(() => {
    if (!film) return;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [film, handleKeyDown]);

  if (!film) return null;

  const currentVideoSrc = resolvedVideoUrl || film.video_url || '';
  const embedSrc = formatVideoEmbedUrl(currentVideoSrc);

  // Determine if it should use native <video> player
  const isDirectVideo =
    currentVideoSrc.startsWith('blob:') ||
    currentVideoSrc.startsWith('/') ||
    currentVideoSrc.includes('/uploads/') ||
    currentVideoSrc.includes('supabase.co/storage') ||
    /\.(mp4|webm|mov|m4v|ogg)($|\?)/i.test(currentVideoSrc);


  // Is this a local-only blob that may not work on other devices?
  const isLocalBlob = currentVideoSrc.startsWith('blob:');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={film.title}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-900/60">
          <div className="flex items-center gap-2 text-brand-gold text-xs uppercase tracking-widest font-medium">
            <FilmIcon size={14} />
            <span>{film.category || 'Cinematic Film'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
            aria-label="Close video player"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center">
          {videoError || (!currentVideoSrc && !loading) ? (
            /* Error State — local blob expired or not accessible on this device */
            <div className="flex flex-col items-center justify-center gap-4 px-8 text-center">
              <AlertCircle size={40} className="text-[#8B0000]" />
              <div>
                <p className="font-serif text-white text-lg mb-1">Video Not Available on This Device</p>
                <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
                  {isLocalBlob
                    ? 'This video is stored locally on the admin PC only. Please re-upload it from the Admin Panel to make it available on all devices.'
                    : 'This video could not be loaded. The file may have been moved or deleted.'}
                </p>
              </div>
              <button
                onClick={() => {
                  setVideoError(false);
                  setLoading(true);
                  getPlayableVideoUrl(film.video_url, film.id).then((url) => {
                    setResolvedVideoUrl(url || film.video_url || '');
                    setLoading(false);
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs transition-colors"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            </div>
          ) : loading ? (
            /* Loading spinner */
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-neutral-700 border-t-[#8B0000] rounded-full animate-spin" />
              <p className="text-neutral-500 text-xs">Loading video...</p>
            </div>
          ) : isDirectVideo ? (
            <video
              key={currentVideoSrc}
              src={currentVideoSrc}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
              onError={() => setVideoError(true)}
              onLoadedData={() => setVideoError(false)}
            />
          ) : (
            <iframe
              src={embedSrc}
              title={film.title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setLoading(false)}
            />
          )}
        </div>

        {/* Video Details */}
        <div className="p-5 bg-neutral-950 space-y-2">
          <h3 className="font-serif text-xl sm:text-2xl text-white font-medium tracking-wide">
            {film.title}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
            {film.description}
          </p>
        </div>
      </div>
    </div>
  );
};
