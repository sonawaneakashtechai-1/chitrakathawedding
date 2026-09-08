import React from 'react';
import { Award, Camera, Palette, Video, Film, Clock, Heart, BookOpen } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      id: 'f1',
      icon: Award,
      title: '12+ Years Experience',
      description: 'Over a decade of master craftsmanship capturing sacred moments and grand events.',
    },
    {
      id: 'f2',
      icon: Camera,
      title: 'Professional Equipment',
      description: 'State-of-the-art full frame cameras, prime lenses, and cinematic lighting.',
    },
    {
      id: 'f3',
      icon: Palette,
      title: 'Creative Color Grading',
      description: 'Signature warm ivory and rich cinematic color tones applied meticulously to every frame.',
    },
    {
      id: 'f4',
      icon: Video,
      title: 'Drone Aerial Cinema',
      description: '4K Ultra-HD licensed aerial drone shots capturing grand perspectives.',
    },
    {
      id: 'f5',
      icon: Film,
      title: 'Cinematic Videos',
      description: 'Emotional feature films and high-energy music trailers.',
    },
    {
      id: 'f6',
      icon: Clock,
      title: 'Fast On-Time Delivery',
      description: 'Quick sneak peeks within 48 hours and complete gallery delivery as promised.',
    },
    {
      id: 'f7',
      icon: Heart,
      title: 'Personalized Experience',
      description: 'Tailored shot lists and comfortable direction for natural, candid poses.',
    },
    {
      id: 'f8',
      icon: BookOpen,
      title: 'Premium Album Prints',
      description: 'Luxury velvet and glass photobooks imported to last generations.',
    },
  ];

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#1C1C1C] border-t border-[#E6E1DA]/60">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header matching exact screenshot */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8B0000] font-bold block">
            DISCOVER OUR DIFFERENCE
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-normal tracking-tight">
            Why Choose Chitrakatha
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-light">
            12+ years of artistic precision, luxury aesthetics, and seamless storytelling.
          </p>
        </div>

        {/* 8 Feature Cards Grid (4 cols x 2 rows) matching screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-7 border border-stone-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Rounded Icon Badge */}
                  <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-[#8B0000] group-hover:bg-[#8B0000]/10 transition-colors">
                    <Icon size={18} className="text-[#8B0000]" />
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-lg font-medium text-[#1C1C1C]">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-stone-500 font-light leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Subtle Divider */}
                <div className="w-8 h-[1.5px] bg-stone-200 group-hover:w-16 group-hover:bg-[#8B0000] transition-all duration-300" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
