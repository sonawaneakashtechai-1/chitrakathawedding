import React from 'react';
import { Instagram, ExternalLink, MessageCircle, Play } from 'lucide-react';
import { SiteSettings } from '../types';

interface InstagramSectionProps {
  settings: SiteSettings;
}

export const InstagramSection: React.FC<InstagramSectionProps> = ({ settings }) => {
  const instagramProfileUrl =
    'https://www.instagram.com/chitrakatha_by_hemant?igsi=MWFzenNxZHR3YWdpNg%3D%3D';

  const feedPosts = [
    {
      id: 'ig-p1',
      type: 'reel',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=85&w=1000',
      caption: 'Misty mountain romantic vows in Mahabaleshwar ✨ #chitrakatha #cinematicstory',
    },
    {
      id: 'ig-p2',
      type: 'reel',
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=85&w=1000',
      caption: 'Traditional haldi rituals and joyous family laughter ❤️ #royalwedding',
    },
    {
      id: 'ig-p3',
      type: 'gallery',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1000',
      caption: 'Golden hour sunset strolls across lush Nashik vineyards 🍷 #prewedding',
    },
    {
      id: 'ig-p4',
      type: 'reel',
      image: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=85&w=1000',
      caption: 'Regal fortress wedding night pheras under the stars 🏰 #maharashtrianwedding',
    },
    {
      id: 'ig-p5',
      type: 'photo',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=85&w=1000',
      caption: 'Pure Paithani silk & heirloom gold jewellery details 💛 #bridalportrait',
    },
    {
      id: 'ig-p6',
      type: 'reel',
      image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=85&w=1000',
      caption: '4K aerial drone perspectives over historic Maharashtra palaces 🛸 #dronecinema',
    },
  ];

  return (
    <section id="instagram" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#0A0A0A] text-white">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12">
        {/* Section Header matching exact screenshot */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          {/* Top Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#181818] border border-amber-500/40 text-amber-300 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] shadow-md">
            <Instagram size={13} className="text-amber-400" />
            <span>OFFICIAL LIVE INSTAGRAM FEED</span>
          </div>

          {/* Heading */}
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-tight">
            Follow Us On Instagram
          </h2>

          {/* Golden Handle Link */}
          <div>
            <a
              href={instagramProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-[#E5C158] hover:text-amber-200 transition-colors tracking-wide"
            >
              <span>@chitrakatha_by_hemant</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Live Instagram App Frame Window matching exact screenshot */}
        <div className="bg-[#141414] rounded-3xl border border-neutral-800 shadow-2xl overflow-hidden">
          {/* App Top Bar */}
          <div className="px-5 sm:px-8 py-4 bg-[#1A1A1A] border-b border-neutral-800 flex items-center justify-between gap-4">
            {/* Left Account Identifier */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[1.5px] flex items-center justify-center">
                <div className="w-full h-full bg-[#1A1A1A] rounded-full flex items-center justify-center font-bold text-amber-400 text-xs">
                  C
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-xs sm:text-sm text-white">
                    chitrakatha_by_hemant
                  </span>
                  {/* Blue Verified Badge */}
                  <span className="w-4 h-4 rounded-full bg-[#0095F6] text-white flex items-center justify-center text-[9px] font-bold">
                    ✓
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 font-light">
                  10.2K Followers • 365 Posts
                </p>
              </div>
            </div>

            {/* Right Action CTAs */}
            <div className="flex items-center gap-2">
              <a
                href={instagramProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
              >
                <Instagram size={12} />
                <span>FOLLOW PROFILE</span>
              </a>

              <a
                href={instagramProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#262626] hover:bg-[#333333] text-white text-xs font-medium transition-colors"
              >
                <MessageCircle size={12} />
                <span>Message</span>
              </a>
            </div>
          </div>

          {/* Profile Details Bar inside frame */}
          <div className="p-6 sm:p-8 border-b border-neutral-800/60 flex items-center justify-between bg-white text-black">
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Profile Avatar with Instagram Story Gradient Ring */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-1 flex items-center justify-center shrink-0">
                <img
                  src={
                    settings.founder_image_url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
                  }
                  alt={settings.founder_name || 'Hemant Mandawade'}
                  className="w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>

              {/* Bio & Handle */}
              <div className="space-y-1">
                <h3 className="font-semibold text-sm sm:text-base text-black leading-tight">
                  chitrakatha_by_hemant
                </h3>
                <p className="text-xs font-medium text-neutral-800">
                  {settings.founder_name || 'Hemant Mandawade'}
                </p>
                <p className="text-[11px] text-neutral-500 font-light">
                  10.2K followers • 266 posts
                </p>
              </div>
            </div>

            {/* Instagram Icon */}
            <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-pink-600">
              <Instagram size={24} />
            </div>
          </div>

          {/* Interactive Live Post Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 sm:p-6 bg-black">
            {feedPosts.map((post) => (
              <a
                key={post.id}
                href={instagramProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 block cursor-pointer"
              >
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95"
                  loading="lazy"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-60 group-hover:opacity-90 transition-opacity" />

                {/* Top Type Indicator Icon */}
                {post.type === 'reel' && (
                  <div className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-md bg-black/60 backdrop-blur-sm text-white flex items-center justify-center">
                    <Play size={11} className="fill-white ml-0.5" />
                  </div>
                )}

                {/* Hover Caption Overlay */}
                <div className="absolute bottom-3 left-3 right-3 z-10 space-y-1">
                  <p className="text-[11px] text-neutral-200 line-clamp-2 leading-snug font-light">
                    {post.caption}
                  </p>
                  <span className="text-[9px] uppercase tracking-wider text-pink-400 font-semibold flex items-center gap-1">
                    <Instagram size={10} /> View on Instagram ↗
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* App Frame Bottom Bar matching screenshot */}
          <div className="px-6 py-3 bg-[#111111] border-t border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-light text-[11px]">
              Official Instagram Account: <strong className="text-white font-medium">@chitrakatha_by_hemant</strong>
            </span>

            <a
              href={instagramProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold text-[11px] uppercase tracking-wider transition-colors"
            >
              <span>Open Profile App</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
