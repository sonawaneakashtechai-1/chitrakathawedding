import { Video, ShieldCheck } from 'lucide-react';
import { scrollToSection, formatImageUrl } from '../lib/utils';
import { SiteSettings } from '../types';

interface DroneSectionProps {
  settings: SiteSettings;
  onOpenBooking?: (service?: string) => void;
}

export const DroneSection: React.FC<DroneSectionProps> = ({ settings, onOpenBooking }) => {
  return (
    <section id="drone" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] text-white">
      <div className="max-w-7xl mx-auto">
        {/* Large Floating Dark Banner Card matching screenshot */}
        <div className="bg-[#181818] rounded-3xl p-8 sm:p-12 lg:p-14 border border-neutral-800 shadow-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-7">
              {/* Top Golden License Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] shadow-md">
                <Video size={13} className="text-amber-400" />
                <span>DGCA LICENSED AERIAL OPERATIONS</span>
              </div>

              {/* Heading */}
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight">
                {settings.drone_heading || 'Drone & Aerial Photography'}
              </h2>

              {/* Subtitle */}
              <p className="text-neutral-400 text-xs sm:text-sm font-light leading-relaxed max-w-xl">
                {settings.drone_subtitle || 'Breathtaking high-altitude perspectives over forts, palaces, and beaches across Maharashtra.'}
              </p>

              {/* 3 Green Checklist Points */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2.5 text-xs text-neutral-300 font-light">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>4K HDR high-frame rate aerial video capture</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-neutral-300 font-light">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>Palace, beach, fort & destination venue scale coverage</span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-neutral-300 font-light">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span>Safe, licensed, and insured flight operations</span>
                </div>
              </div>

              {/* Inquire Drone Shoot CTA */}
              <div className="pt-2">
                <button
                  onClick={() =>
                    onOpenBooking
                      ? onOpenBooking('Drone Aerial Cinema')
                      : scrollToSection('contact')
                  }
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#8B0000] hover:bg-[#A61C1C] text-white transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
                >
                  <span>INQUIRE DRONE SHOOT</span>
                </button>
              </div>
            </div>

            {/* Right Media Column (6 cols) */}
            <div className="lg:col-span-6">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-2xl group">
                <img
                  src={formatImageUrl(
                    settings.drone_image_url ||
                    'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1200'
                  )}
                  alt="Raigad Fort Aerial View Drone"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95"
                  loading="lazy"
                />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

                {/* Bottom Left Fort Caption */}
                <div className="absolute bottom-4 left-4 z-10">
                  <span className="font-serif text-xs text-white/90 font-light tracking-wide">
                    Raigad Fort Aerial View
                  </span>
                </div>

                {/* Bottom Right 4K Ultra-HD Gold Badge */}
                <div className="absolute bottom-4 right-4 z-10">
                  <span className="px-2.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] uppercase font-mono font-bold text-amber-300 border border-amber-400/30">
                    4K Ultra-HD
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
