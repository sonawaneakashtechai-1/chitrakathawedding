import React from 'react';
import { Service } from '../types';
import { Camera, Video, ArrowRight, MessageSquare } from 'lucide-react';
import { scrollToSection, formatImageUrl } from '../lib/utils';

interface ServicesProps {
  services: Service[];
  onSelectServiceForBooking?: (serviceTitle: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ services, onSelectServiceForBooking }) => {
  const handleInquire = (serviceTitle: string) => {
    if (onSelectServiceForBooking) {
      onSelectServiceForBooking(serviceTitle);
    }
    scrollToSection('contact');
  };

  // Curated pricing mapping and icons matching the screenshot format
  const serviceExtras: Record<string, { price: string; icon: 'camera' | 'video'; image: string }> = {
    'wedding-photography': {
      price: 'From ₹75,000 Starting',
      icon: 'camera',
      image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1000',
    },
    'pre-wedding-shoots': {
      price: 'From ₹35,000 Starting',
      icon: 'video',
      image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1000',
    },
    'fashion-editorial': {
      price: 'From ₹25,000 Starting',
      icon: 'camera',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1000',
    },
    'drone-aerial-cinema': {
      price: 'From ₹20,000 Starting',
      icon: 'video',
      image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1000',
    },
    'cinematic-video-films': {
      price: 'From ₹45,000 Starting',
      icon: 'video',
      image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1000',
    },
    'photo-video-retouching': {
      price: 'From ₹15,000 Starting',
      icon: 'camera',
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1000',
    },
  };

  return (
    <section id="services" className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#1C1C1C] border-t border-[#E6E1DA]/60">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Centered Section Header matching exact screenshot */}
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8B0000] font-bold block">
            LUXURY OFFERINGS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#1C1C1C] font-normal tracking-tight">
            Our Signature Services
          </h2>
          <p className="text-stone-500 text-xs sm:text-sm font-light">
            Crafted for couples, families, models, and visionaries across Maharashtra.
          </p>
        </div>

        {/* Signature Service Cards Grid matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((service, index) => {
            const extra = serviceExtras[service.slug] || {
              price: 'Custom Quote',
              icon: index % 2 === 0 ? 'video' : 'camera',
              image: service.image_url || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800',
            };

            const displayImage = service.image_url || extra.image;
            const Icon = extra.icon === 'video' ? Video : Camera;

            return (
              <div
                key={service.id || index}
                className="group bg-white rounded-2xl border border-stone-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1"
              >
                {/* Top Image Banner with Floating Icon & Starting Price Pill */}
                <div className="relative aspect-[16/10] overflow-hidden bg-stone-900">
                  <img
                    src={formatImageUrl(displayImage)}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Top-Left Floating Icon Badge */}
                  <div className="absolute top-3 left-3 z-10 w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-stone-800 shadow-md">
                    <Icon size={16} />
                  </div>

                  {/* Bottom-Right Deep Red Starting Price Badge */}
                  <div className="absolute bottom-3 right-3 z-10">
                    <span className="inline-block px-3.5 py-1 rounded-full bg-[#8B0000] text-white text-[11px] font-semibold tracking-wide shadow-md">
                      {extra.price}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-7 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl sm:text-2xl text-[#1C1C1C] font-medium leading-snug group-hover:text-[#8B0000] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-stone-600 font-light leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                    <button
                      onClick={() => handleInquire(service.title)}
                      className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-[#8B0000] hover:underline underline-offset-4 group-hover:translate-x-1 transition-transform"
                    >
                      <span>LEARN MORE</span>
                      <ArrowRight size={13} />
                    </button>

                    <button
                      onClick={() => handleInquire(service.title)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-500/30 text-emerald-700 text-xs font-semibold transition-colors"
                    >
                      <MessageSquare size={12} className="fill-emerald-700" />
                      <span>Inquire</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
