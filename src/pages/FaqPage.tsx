import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { SiteSettings, FAQItem } from '../types';
import { createWhatsAppLink } from '../lib/utils';
import { Footer } from '../sections/Footer';

interface FaqPageProps {
  settings: SiteSettings;
  onNavigatePage: (page: 'home' | 'admin' | 'faq' | 'contact') => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ settings, onNavigatePage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-2': false,
  });

  const categories = [
    'All',
    'Wedding',
    'Pre-Wedding',
    'Booking',
    'Payments',
    'Delivery',
    'Travel',
    'Drone Photography',
    'Editing',
    'General',
  ];

  const enrichedFaqs: (FAQItem & { category: string; tag: string })[] = [
    {
      id: 'faq-1',
      tag: 'DELIVERABLES',
      category: 'Delivery',
      question: 'What is the delivery timeline for final retouched photos and 4K wedding films?',
      answer:
        'Preview teaser photos and Instagram reels are delivered within 48–72 hours. Complete high-resolution edited photo galleries and 4K cinematic films are delivered within 3–4 weeks.',
      sort_order: 1,
      published: true,
    },
    {
      id: 'faq-2',
      tag: 'BOOKING',
      category: 'Booking',
      question: 'How far in advance should we book Chitrakatha by Hemant for our wedding?',
      answer:
        'We recommend reserving your dates at least 3 to 6 months in advance for peak Maharashtrian wedding seasons (November through February and April through May) to ensure date exclusivity.',
      sort_order: 2,
      published: true,
    },
    {
      id: 'faq-3',
      tag: 'TRAVEL',
      category: 'Travel',
      question: 'Do you travel outside Satana & Nashik for destination weddings?',
      answer:
        'Yes! We regularly travel across Pune, Mumbai, Kolhapur, Chhatrapati Sambhajinagar, Alibaug, Mahabaleshwar, Goa, and all across India. Travel and stay arrangements are simply arranged with the family.',
      sort_order: 3,
      published: true,
    },
    {
      id: 'faq-4',
      tag: 'PAYMENTS',
      category: 'Payments',
      question: 'What is the payment schedule for photography packages?',
      answer:
        'We follow a clear transparent structure: 25% advance to lock your calendar dates, 65% during the shoot days, and the remaining 10% upon final delivery of albums and 4K films.',
      sort_order: 4,
      published: true,
    },
    {
      id: 'faq-5',
      tag: 'DRONE',
      category: 'Drone Photography',
      question: 'Is drone aerial cinematography included in wedding packages?',
      answer:
        'Yes, our luxury packages include licensed 4K DGCA drone coverage for venue scale, grand entries, and outdoor bridal couple portraits subject to local airspace permissions.',
      sort_order: 5,
      published: true,
    },
    {
      id: 'faq-6',
      tag: 'PRE-WEDDING',
      category: 'Pre-Wedding',
      question: 'Can you suggest scenic locations for pre-wedding shoots?',
      answer:
        'Absolutely! We curate bespoke scenic itineraries across Sula Vineyards Nashik, Mahabaleshwar hill stations, Alibaug private beaches, and historic heritage forts.',
      sort_order: 6,
      published: true,
    },
    {
      id: 'faq-7',
      tag: 'EDITING',
      category: 'Editing',
      question: 'Do you provide raw uncompressed footage and full original resolution files?',
      answer:
        'Yes! Along with fully color-graded heirloom edits and 4K master films, we provide the complete raw archive on a high-speed SSD or private cloud drive for your lifetime preservation.',
      sort_order: 7,
      published: true,
    },
    {
      id: 'faq-8',
      tag: 'WEDDING',
      category: 'Wedding',
      question: 'How many photographers and cinematographers cover a wedding?',
      answer:
        'Depending on the package size, our crew typically consists of 2 lead photographers (traditional + candid), 2 cinematographers (4K gimbal + drone pilot), and 1 lighting assistant.',
      sort_order: 8,
      published: true,
    },
  ];

  const filteredFaqs = useMemo(() => {
    return enrichedFaqs.filter((faq) => {
      const matchCategory =
        activeCategory === 'All' ||
        faq.category.toLowerCase() === activeCategory.toLowerCase() ||
        faq.tag.toLowerCase() === activeCategory.toLowerCase();

      const matchQuery =
        !searchQuery.trim() ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tag.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchQuery;
    });
  }, [activeCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const whatsappUrl = createWhatsAppLink(
    settings.whatsapp_number || '7249532553',
    'Hello Hemant, I have a question regarding wedding photography bookings.'
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1C1C] flex flex-col justify-between pt-28">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-1 w-full">
        {/* 1. Header Section matching screenshot */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8B0000] font-bold block">
            HELP & CLARIFICATIONS
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1C1C1C] font-normal tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm font-light max-w-xl mx-auto">
            Find quick answers regarding our booking process, travel policies, drone permits, and editing deliverables.
          </p>
        </div>

        {/* 2. Search Bar matching screenshot */}
        <div className="max-w-2xl mx-auto relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. advance payment, travel, drone)..."
            className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white border border-stone-200 shadow-sm text-xs sm:text-sm text-[#1C1C1C] placeholder-stone-400 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000] transition-all"
          />
        </div>

        {/* 3. Category Filter Pills matching screenshot */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? 'bg-[#8B0000] text-white shadow-md'
                  : 'bg-white border border-stone-200/90 text-stone-600 hover:text-black hover:border-stone-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 4. FAQ Accordion Cards matching screenshot */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {filteredFaqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-stone-500 text-xs sm:text-sm border border-stone-200">
              No questions found matching your search. Try another keyword or contact us directly below.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = Boolean(expandedIds[faq.id]);

              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-start justify-between gap-4 focus:outline-none"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      {/* Red Tag Badge */}
                      <span className="px-2.5 py-1 rounded-md bg-[#8B0000]/10 text-[#8B0000] font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0">
                        {faq.tag}
                      </span>

                      <h3 className="font-serif text-base sm:text-lg text-[#1C1C1C] font-medium leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div className="p-1 rounded-full text-stone-400 hover:text-black shrink-0 mt-0.5">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-stone-600 text-xs sm:text-sm font-light leading-relaxed border-t border-stone-100 animate-fade-in">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 5. Bottom Card ("Still Have Questions?") matching screenshot */}
        <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-md text-center space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1C1C] font-medium">
            Still Have Questions?
          </h2>
          <p className="text-xs text-stone-500 font-light leading-relaxed max-w-md mx-auto">
            Hemant Mandawade is available to discuss your specific event itinerary and answer any custom queries directly.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {/* Call Button */}
            <a
              href={`tel:${settings.phone_number || '7249532553'}`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#181818] hover:bg-black text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
            >
              <Phone size={13} className="text-[#D4AF37] fill-[#D4AF37]" />
              <span>Call {settings.phone_number || '7249532553'}</span>
            </a>

            {/* WhatsApp Us Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
            >
              <WhatsAppIcon size={15} className="fill-white" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer onNavigatePage={onNavigatePage} />
    </div>
  );
};
