import React from 'react';
import { Award, Camera, MapPin, Smile, Image as ImageIcon, Film } from 'lucide-react';
import { SiteSettings } from '../types';

interface ProvenExcellenceProps {
  settings: SiteSettings;
}

export const ProvenExcellence: React.FC<ProvenExcellenceProps> = ({ settings }) => {
  const stats = [
    {
      id: 'stat-exp',
      icon: Award,
      value: settings.experience_badge?.match(/\d+\+?/)?.[0] || '12+',
      label: 'Years Experience',
    },
    {
      id: 'stat-wed',
      icon: Camera,
      value: settings.stat_weddings || '550+',
      label: 'Weddings & Shoots',
    },
    {
      id: 'stat-cit',
      icon: MapPin,
      value: settings.stat_cities || '35+',
      label: 'Cities Covered in MH',
    },
    {
      id: 'stat-sat',
      icon: Smile,
      value: settings.stat_satisfaction || '99%',
      label: 'Client Satisfaction',
    },
    {
      id: 'stat-pht',
      icon: ImageIcon,
      value: '250k+',
      label: 'Photos Delivered',
    },
    {
      id: 'stat-flm',
      icon: Film,
      value: settings.stat_films || '480+',
      label: 'Cinematic Films',
    },
  ];

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#1C1C1C] border-t border-[#E6E1DA]/60">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header matching exact screenshot */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8B0000] font-bold block">
            PROVEN EXCELLENCE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-normal tracking-tight">
            12+ Years of Cinematic Trust Across Maharashtra
          </h2>
        </div>

        {/* 6 Metric Cards Grid matching exact screenshot */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center text-center space-y-3 group hover:-translate-y-1"
              >
                {/* Rounded Icon Badge */}
                <div className="w-11 h-11 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-[#8B0000] group-hover:bg-[#8B0000]/10 transition-colors">
                  <Icon size={20} className="text-[#8B0000]" />
                </div>

                {/* Stat Value */}
                <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#1C1C1C] tracking-tight">
                  {item.value}
                </p>

                {/* Stat Label */}
                <p className="text-xs text-stone-500 font-light leading-snug">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
