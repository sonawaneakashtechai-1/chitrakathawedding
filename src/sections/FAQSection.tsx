import React, { useState } from 'react';
import { FAQItem } from '../types';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQSectionProps {
  faqs: FAQItem[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const publishedFaqs = faqs.filter((f) => f.published);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F4EFE6] text-[#1C1C1C]">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#8B0000] font-semibold">
            <HelpCircle size={14} />
            <span>COMMON QUESTIONS</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#1C1C1C]">
            Frequently Asked Questions
          </h2>

          <p className="text-stone-600 text-xs sm:text-base font-light leading-relaxed max-w-xl mx-auto">
            Everything you need to know about our photography services, booking process, and deliverables.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {publishedFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={faq.id || idx}
                className="bg-white rounded-xl border border-[#E6E1DA] overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-lg sm:text-xl font-medium text-[#1C1C1C]">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#8B0000] text-white' : 'text-stone-600'
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-stone-600 font-light leading-relaxed border-t border-stone-100 animate-fade-in">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
