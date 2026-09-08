import React from 'react';
import { Target, Eye, MapPin, Sparkles } from 'lucide-react';
import { SiteSettings } from '../types';
import { formatImageUrl } from '../lib/utils';

interface TrustCardsProps {
  settings: SiteSettings;
}

export const TrustCards: React.FC<TrustCardsProps> = ({ settings }) => {
  return (
    <section id="about" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#1C1C1C]">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* 1. Main Centered Section Header matching screenshot */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-normal tracking-tight">
            Behind The Lens
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-light">
            {settings.founder_name || 'Hemant Mandawade'} — Visual Storyteller & Founder of {settings.brand_name || 'Chitrakatha'}
          </p>
        </div>

        {/* 2. Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Meet The Artist Card / Frame (5 cols) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-xl border border-stone-200/80 space-y-5 transition-transform hover:shadow-2xl">
              {/* Card Header */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#8B0000] font-bold block">
                  MEET THE ARTIST
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#1C1C1C]">
                  Behind The Lens
                </h3>
                <p className="text-xs text-stone-500 font-light">
                  {settings.founder_name || 'Hemant Mandawade'} — Visual Storyteller & Founder of Chitrakatha
                </p>
              </div>

              {/* Founder Image with Bottom Yellow Badge */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-inner bg-stone-900">
                <img
                  src={formatImageUrl(
                    settings.founder_image_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=800'
                  )}
                  alt={settings.founder_name || 'Hemant Mandawade'}
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />

                {/* Dark Gradient Overlay at Bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Golden Yellow Lead Photographer Badge */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="inline-block px-3.5 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-amber-500/40 text-[#E5C158] text-[10px] font-bold uppercase tracking-wider shadow-lg">
                    {settings.founder_title || 'FOUNDER & LEAD PHOTOGRAPHER'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Philosophy, Mission, Vision, Service Coverage (7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Philosophy Tag */}
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#8B0000] font-bold">
              <Sparkles size={14} className="text-[#8B0000]" />
              <span>THE CHITRAKATHA PHILOSOPHY</span>
            </div>

            {/* Philosophy Quote */}
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1C1C1C] font-normal leading-snug">
              "We don't just take photographs. We weave emotional legacies."
            </h3>

            {/* Narrative Story */}
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
              With over {settings.experience_badge || '12 years'} of capturing couples and grand celebrations across Maharashtra, Chitrakatha by Hemant was founded on a simple philosophy: every glance, tear of joy, and warm embrace deserves to be preserved in timeless cinematic beauty.
            </p>

            {/* 2 Side-by-Side Mission & Vision Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Mission Card */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-[#8B0000] font-bold text-xs uppercase tracking-wider">
                  <Target size={15} className="text-[#8B0000]" />
                  <span>Our Mission</span>
                </div>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  {settings.mission_text || 'To preserve raw human emotions and sacred rituals beautifully, creating visual legacies that families cherish for generations.'}
                </p>
              </div>

              {/* Vision Card */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 text-[#8B0000] font-bold text-xs uppercase tracking-wider">
                  <Eye size={15} className="text-[#8B0000]" />
                  <span>Our Vision</span>
                </div>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  {settings.vision_text || 'To set the benchmark for luxury photography in Maharashtra, blending traditional heritage with contemporary cinematic elegance.'}
                </p>
              </div>
            </div>

            {/* Full-Width Service Coverage Card */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-2 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-[#8B0000] font-bold text-xs uppercase tracking-wider">
                <MapPin size={15} className="text-[#8B0000]" />
                <span>SERVICE COVERAGE</span>
              </div>
              <p className="text-xs text-stone-600 font-light leading-relaxed">
                {settings.coverage_text || 'Based in Maharashtra — Available for destination weddings in Pune, Mumbai, Nashik, Kolhapur, Chhatrapati Sambhajinagar, Alibaug, Mahabaleshwar, and across India.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
