import React from 'react';
import { ArrowRight, Sparkles, ChevronDown, CheckCircle2 } from 'lucide-react';
import { scrollToSection } from '../lib/utils';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
  onOpenBooking?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onOpenBooking }) => {
  const defaultHeroVideo = 'https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-in-a-forest-41584-large.mp4';
  const rawUrl = settings.hero_video_url || settings.hero_image_url || defaultHeroVideo;
  const isEnabled = settings.hero_video_enabled !== false;

  const activeVideoUrl =
    isEnabled && rawUrl && !rawUrl.startsWith('blob:')
      ? rawUrl
      : isEnabled
      ? defaultHeroVideo
      : '';

  const isVideoActive = Boolean(activeVideoUrl && activeVideoUrl.trim());

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between items-center text-center text-white px-4 sm:px-6 lg:px-8 overflow-hidden pt-28 pb-10 bg-[#0E0E0E]"
    >
      {/* 1. Full Screen Ambient Video Background (Behaves like a background layer) */}
      {isVideoActive && (
        <video
          key={activeVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        >
          <source src={activeVideoUrl} type="video/mp4" />
          <source src={activeVideoUrl} type="video/webm" />
          <source src={activeVideoUrl} type="video/ogg" />
        </video>
      )}

      {/* 2. Dark Transparent Overlay (rgba(0,0,0,0.35 - 0.50)) - Text floats directly over video */}
      <div
        className="absolute inset-0 pointer-events-none z-[1] transition-opacity duration-300"
        style={{
          backgroundColor: isVideoActive
            ? `rgba(0, 0, 0, ${((settings.hero_video_opacity ?? 45) / 100).toFixed(2)})`
            : 'rgba(0, 0, 0, 0.2)',
        }}
        aria-hidden="true"
      />

      {/* Top Spacer */}
      <div className="hidden sm:block" />

      {/* Main Hero Center Content Box matching the exact screenshot */}
      <div className="relative z-10 max-w-5xl mx-auto space-y-6 sm:space-y-8 my-auto animate-fade-up py-6">
        {/* 1. Luxury Gold Pill Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] shadow-lg">
          <Sparkles size={13} className="text-amber-400" />
          <span>LUXURY PHOTOGRAPHY & CINEMATOGRAPHY</span>
        </div>

        {/* 2. Main Title (High-contrast Luxury Serif matching screenshot) */}
        <div className="space-y-3">
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight sm:tracking-normal font-normal uppercase text-white leading-[1.05] drop-shadow-2xl">
            {settings.hero_title || 'CHITRAKATHA'}
          </h1>
        </div>

        {/* 3. Subtitle / Tagline Copy */}
        <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-neutral-300 font-light leading-relaxed px-4">
          {settings.hero_description || 'Professional Wedding, Pre-Wedding, Fashion & Cinematic Photography Across Maharashtra.'}
        </p>

        {/* 4. Dual CTA Buttons (VIEW PORTFOLIO → and BOOK NOW) */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* White View Portfolio Pill */}
          <button
            onClick={() => scrollToSection('portfolio')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider bg-white hover:bg-neutral-200 text-black transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <span>VIEW PORTFOLIO</span>
            <ArrowRight size={15} />
          </button>

          {/* Deep Red Book Now Pill */}
          <button
            onClick={() => (onOpenBooking ? onOpenBooking() : scrollToSection('contact'))}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-3.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider bg-[#8B0000] hover:bg-[#A61C1C] text-white transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <span>BOOK NOW</span>
          </button>
        </div>
      </div>

      {/* Bottom Floating Bar & Scroll Indicator matching screenshot */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center space-y-3 pt-4">
        {/* Scroll To Explore Indicator */}
        <div
          onClick={() => scrollToSection('about')}
          className="cursor-pointer flex flex-col items-center gap-1 text-[11px] uppercase tracking-[0.25em] text-neutral-400 hover:text-white transition-colors"
        >
          <span>SCROLL TO EXPLORE</span>
          <ChevronDown size={14} className="animate-bounce" />
        </div>

        {/* Floating Trust Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-neutral-200 text-xs font-light tracking-wide shadow-md">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>
            {settings.experience_badge || '12+ Years Experience'} • {settings.coverage_text ? 'All Over Maharashtra Coverage' : 'All Over Maharashtra Coverage'}
          </span>
        </div>
      </div>
    </section>
  );
};
