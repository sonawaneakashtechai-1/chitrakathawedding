import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, ExternalLink, Loader2 } from 'lucide-react';
import { SiteSettings, Enquiry } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { broadcastRealtimeChange } from '../lib/realtimeSync';
import { Footer } from '../sections/Footer';
import { Toast } from '../components/Toast';

interface ContactPageProps {
  settings: SiteSettings;
  onNavigatePage: (page: 'home' | 'admin' | 'faq' | 'contact') => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings, onNavigatePage }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    location: '',
    service: 'Wedding Photography',
    date: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setToast({
        type: 'error',
        title: 'Required Fields Missing',
        message: 'Please enter your Full Name and Mobile Number.',
      });
      return;
    }

    setIsSubmitting(true);

    const uuid =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0,
              v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });

    const enquiryRecord: Enquiry = {
      id: uuid,
      custom_id: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: formData.fullName.trim(),
      email: formData.email.trim() || 'Not Provided',
      phone: formData.phone.trim(),
      event_type: formData.service,
      event_date: formData.date || 'TBD',
      location: formData.location.trim() || 'Maharashtra',
      budget: 'Standard Package',
      message: formData.message.trim(),
      status: 'new',
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('enquiries').insert([enquiryRecord]);
        if (error) {
          console.error('Supabase contact insert error:', error);
        } else {
          await broadcastRealtimeChange('enquiries', 'INSERT', enquiryRecord);
        }
      }

      // Local storage backup
      const existing = localStorage.getItem('chitrakatha_local_enquiries');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(enquiryRecord);
      localStorage.setItem('chitrakatha_local_enquiries', JSON.stringify(list));

      // Trigger sync event
      window.dispatchEvent(new Event('chitrakatha_data_updated'));

      setToast({
        type: 'success',
        title: 'Enquiry Received!',
        message: 'Thank you for reaching out. Hemant Mandawade will connect with you within 24 hours.',
      });

      // Reset form
      setFormData({
        fullName: '',
        phone: '',
        email: '',
        location: '',
        service: 'Wedding Photography',
        date: '',
        message: '',
      });
    } catch (err) {
      console.error('Submission error:', err);
      setToast({
        type: 'error',
        title: 'Submission Notice',
        message: 'Could not send directly to database. Please reach out to Hemant on WhatsApp.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1C1C] flex flex-col justify-between pt-28">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 flex-1 w-full">
        {/* Section Header matching exact screenshot */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8B0000] font-bold block">
            CONTACT & BOOKINGS
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1C1C1C] font-normal tracking-tight">
            Let's Capture Your Story
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm font-light max-w-xl mx-auto leading-relaxed">
            We cover weddings, pre-wedding shoots, fashion editorials, and drone films across Maharashtra. Reach out for dates & packages.
          </p>
        </div>

        {/* Main 2-Column Content Grid matching screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Studio Info & Satana Map (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Studio Info Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-md space-y-6">
              <h2 className="font-serif text-2xl text-[#1C1C1C] font-medium">
                Studio Info
              </h2>

              <div className="space-y-5 text-xs text-stone-600">
                {/* Phone & WhatsApp */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center shrink-0">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                      PHONE & WHATSAPP
                    </span>
                    <a
                      href={`tel:${settings.phone_number || '7249532553'}`}
                      className="font-mono text-sm font-semibold text-[#1C1C1C] hover:text-[#8B0000] transition-colors"
                    >
                      +91 {settings.phone_number || '7249532553'}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center shrink-0">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                      EMAIL INQUIRY
                    </span>
                    <a
                      href={`mailto:${settings.email_address || 'clicksbyhemant5564@gmail.com'}`}
                      className="text-xs sm:text-sm font-medium text-[#1C1C1C] hover:text-[#8B0000] transition-colors break-all"
                    >
                      {settings.email_address || 'clicksbyhemant5564@gmail.com'}
                    </a>
                  </div>
                </div>

                {/* Office Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#8B0000]/10 text-[#8B0000] flex items-center justify-center shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                      OFFICE ADDRESS
                    </span>
                    <p className="text-xs sm:text-sm font-medium text-[#1C1C1C]">
                      Satana, Nashik, Maharashtra 423301
                    </p>
                    <p className="text-[11px] font-semibold text-amber-700">
                      Service Coverage: All Over Maharashtra
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Satana Google Map Tile matching screenshot */}
            <div className="relative aspect-[16/10] rounded-3xl overflow-hidden border border-stone-200/80 shadow-md bg-stone-100 group">
              <iframe
                title="Chitrakatha Studio Satana Nashik Location"
                src="https://maps.google.com/maps?q=Satana,Nashik,Maharashtra&t=&z=13&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                loading="lazy"
              />

              {/* Floating Open In Maps Button */}
              <div className="absolute top-3 left-3 z-10">
                <a
                  href="https://maps.google.com/?q=Satana,Nashik,Maharashtra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-stone-800 border border-stone-200 text-[10px] font-semibold shadow-sm hover:bg-white transition-colors"
                >
                  <span>Open in Maps</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Send an Enquiry Booking Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/80 shadow-md space-y-6">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1C1C] font-medium">
                Send an Enquiry
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row 1: Full Name & Mobile Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                      FULL NAME *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      placeholder="e.g. Rahul Deshmukh"
                      className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-[#FAF7F2] border border-stone-200 focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all text-[#1C1C1C]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                      MOBILE NUMBER (10 DIGITS) *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="7249532553"
                      className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-[#FAF7F2] border border-stone-200 focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all text-[#1C1C1C] font-mono"
                    />
                  </div>
                </div>

                {/* Row 2: Email Address & City/Shoot Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                      EMAIL ADDRESS
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@domain.com"
                      className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-[#FAF7F2] border border-stone-200 focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all text-[#1C1C1C]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                      CITY / SHOOT LOCATION *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                      placeholder="e.g. Pune, Mumbai, Nashik"
                      className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-[#FAF7F2] border border-stone-200 focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all text-[#1C1C1C]"
                    />
                  </div>
                </div>

                {/* Row 3: Photography Service */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                    PHOTOGRAPHY SERVICE *
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-[#FAF7F2] border border-stone-200 focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all text-[#1C1C1C]"
                  >
                    <option value="Wedding Photography">Wedding Photography</option>
                    <option value="Pre-Wedding Shoots">Pre-Wedding Shoots</option>
                    <option value="Fashion Editorial">Fashion Editorial</option>
                    <option value="Drone Aerial Cinema">Drone Aerial Cinema</option>
                    <option value="Cinematic Video Films">Cinematic Video Films</option>
                    <option value="Photo & Video Retouching">Photo & Video Retouching</option>
                  </select>
                </div>

                {/* Row 4: Preferred Date */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                    PREFERRED DATE
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-[#FAF7F2] border border-stone-200 focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all text-[#1C1C1C]"
                  />
                </div>

                {/* Row 5: Message / Notes */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                    MESSAGE / NOTES
                  </label>
                  <textarea
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your event scope, venue, dates, or specific requirements..."
                    className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl bg-[#FAF7F2] border border-stone-200 focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all text-[#1C1C1C] resize-none"
                  />
                </div>

                {/* Submit CTA Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] text-white text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending Booking Enquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>SEND BOOKING ENQUIRY</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer onNavigatePage={onNavigatePage} />

      {/* Toast notifications */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
