import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Enquiry } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { createWhatsAppLink } from '../lib/utils';
import { broadcastRealtimeChange } from '../lib/realtimeSync';
import { Phone, Mail, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';

interface ContactProps {
  initialService?: string;
  onEnquirySubmitted?: (enquiry: Enquiry) => void;
}

export const Contact: React.FC<ContactProps> = ({ initialService, onEnquirySubmitted }) => {
  const { t } = useLanguage();

  const [formData, setFormData] = useState<Enquiry>({
    full_name: '',
    email: '',
    phone: '',
    event_type: initialService || 'Wedding Photography',
    event_date: '',
    location: '',
    budget: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const eventTypes = [
    'Wedding Photography',
    'Pre-Wedding Shoots',
    'Fashion Editorial',
    'Drone Aerial Cinema',
    'Cinematic Video Films',
    'Photo & Video Retouching',
    'Other Bespoke Project',
  ];

  const budgetRanges = [
    '₹50,000 - ₹1,00,000',
    '₹1,00,000 - ₹2,00,000',
    '₹2,00,000 - ₹3,50,000',
    '₹3,50,000 - ₹5,00,000+',
    'Custom Production Budget',
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
    if (!formData.full_name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg('Please fill in your name, email, and phone number.');
      return;
    }

    setLoading(true);

    try {
      const uuid =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
              const r = (Math.random() * 16) | 0,
                v = c === 'x' ? r : (r & 0x3) | 0x8;
              return v.toString(16);
            });

      const newRecord: Enquiry = {
        id: uuid,
        custom_id: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        event_type: formData.event_type,
        event_date: formData.event_date || 'TBD',
        location: formData.location || 'Maharashtra',
        budget: formData.budget || 'Standard Package',
        message: formData.message || '',
        status: 'new',
        created_at: new Date().toISOString(),
      };

      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('enquiries').insert([newRecord]);
        if (error) {
          console.error('Supabase contact section insert error:', error);
        } else {
          await broadcastRealtimeChange('enquiries', 'INSERT', newRecord);
        }
      }

      // Local storage backup
      const existing = JSON.parse(localStorage.getItem('chitrakatha_local_enquiries') || '[]');
      localStorage.setItem('chitrakatha_local_enquiries', JSON.stringify([newRecord, ...existing]));

      setSubmitted(true);
      if (onEnquirySubmitted) {
        onEnquirySubmitted(formData);
      }
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        event_type: 'Wedding Photography',
        event_date: '',
        location: '',
        budget: '',
        message: '',
      });
    } catch (err: any) {
      console.error('Enquiry submission error:', err);
      setErrorMsg(err.message || t('contact.form.errorDesc'));
    } finally {
      setLoading(false);
    }
  };

  const whatsappLink = createWhatsAppLink(
    '7249532553',
    'Hello Hemant, I would like to inquire about wedding photography / cinematic films with Chitrakatha.'
  );

  return (
    <section id="contact" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] text-[#1C1C1C]">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-brand-red font-semibold">
            <span className="w-6 h-px bg-brand-red" />
            <span>{t('contact.badge')}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1C1C] font-normal">
            {t('contact.title')}
          </h2>

          <p className="text-stone-600 text-xs sm:text-base font-light leading-relaxed">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* Contact Layout: Left Info, Right Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Left Info Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-7 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              <h3 className="font-serif text-2xl font-medium text-[#1C1C1C]">
                {t('contact.directTitle')}
              </h3>

              <div className="space-y-5 text-sm text-stone-700">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                      {t('contact.phoneLabel')}
                    </span>
                    <a
                      href="tel:7249532553"
                      className="font-medium text-base text-[#1C1C1C] hover:text-brand-red transition-colors"
                    >
                      +91 7249532553
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                      {t('contact.emailLabel')}
                    </span>
                    <a
                      href="mailto:clicksbyhemant5564@gmail.com"
                      className="font-medium text-stone-800 hover:text-brand-red transition-colors break-all"
                    >
                      clicksbyhemant5564@gmail.com
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold block">
                      {t('contact.locationLabel')}
                    </span>
                    <p className="font-medium text-stone-800">
                      Satana, Nashik, Maharashtra, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Action */}
              <div className="pt-4 border-t border-stone-100">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <WhatsAppIcon size={16} className="fill-white" />
                  <span>{t('contact.whatsappBtn')}</span>
                </a>
              </div>
            </div>

            {/* Quick Assurance Box */}
            <div className="bg-[#F4EFE6] p-6 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-2">
              <h4 className="font-semibold text-stone-800 uppercase tracking-wider text-[11px]">
                Booking & Dates
              </h4>
              <p className="leading-relaxed font-light">
                We accept limited wedding and film assignments per season to ensure the highest standard of personalized artistry, dedicated direction, and meticulous color grading.
              </p>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white p-7 sm:p-10 rounded-2xl border border-stone-200 shadow-sm">
              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#1C1C1C]">
                    {t('contact.form.successTitle')}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 font-light max-w-md mx-auto leading-relaxed">
                    {t('contact.form.successDesc')}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-stone-900 text-white hover:bg-black transition-colors"
                  >
                    Send Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMsg && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-700 uppercase tracking-wider">
                        {t('contact.form.fullName')}
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Tanvi Joshi"
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all bg-stone-50/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-700 uppercase tracking-wider">
                        {t('contact.form.phone')}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all bg-stone-50/50"
                      />
                    </div>
                  </div>

                  {/* Email & Event Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-700 uppercase tracking-wider">
                        {t('contact.form.email')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="tanvi@example.com"
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all bg-stone-50/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-700 uppercase tracking-wider">
                        {t('contact.form.eventType')}
                      </label>
                      <select
                        name="event_type"
                        value={formData.event_type}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all bg-stone-50/50"
                      >
                        {eventTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Event Date & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-700 uppercase tracking-wider">
                        {t('contact.form.eventDate')}
                      </label>
                      <input
                        type="date"
                        name="event_date"
                        value={formData.event_date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all bg-stone-50/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-stone-700 uppercase tracking-wider">
                        {t('contact.form.location')}
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Satana, Nashik, Pune"
                        className="w-full px-4 py-3 rounded-lg border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all bg-stone-50/50"
                      />
                    </div>
                  </div>

                  {/* Budget Dropdown */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-700 uppercase tracking-wider">
                      {t('contact.form.budget')}
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all bg-stone-50/50"
                    >
                      <option value="">Select an estimated range</option>
                      {budgetRanges.map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message / Vision */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-700 uppercase tracking-wider">
                      {t('contact.form.message')}
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Share details about your celebration, ceremonies, or special visual preferences..."
                      className="w-full px-4 py-3 rounded-lg border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red transition-all bg-stone-50/50 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-full bg-brand-red hover:bg-brand-red-hover text-white text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{t('contact.form.submitting')}</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>{t('contact.form.submit')}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
