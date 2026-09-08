import React, { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { SiteSettings, Enquiry } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { broadcastRealtimeChange } from '../lib/realtimeSync';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SiteSettings;
  initialService?: string;
  onSuccess: (message: string) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  settings,
  initialService = 'Wedding Photography',
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    eventType: initialService || 'Wedding Photography',
    fullName: '',
    phone: '',
    email: '',
    location: '',
    date: '',
    timeSlot: 'Morning (09:00 AM)',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phone.trim()) {
      alert('Please fill in your Full Name and Phone Number.');
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

    const newEnquiry: Enquiry = {
      id: uuid,
      custom_id: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: formData.fullName.trim(),
      email: formData.email.trim() || 'Not Provided',
      phone: formData.phone.trim(),
      event_type: `${formData.eventType} (${formData.timeSlot})`,
      event_date: formData.date || 'TBD',
      location: formData.location.trim() || 'Maharashtra',
      budget: 'Standard Package',
      message: formData.notes.trim()
        ? `[Time Slot: ${formData.timeSlot}] ${formData.notes.trim()}`
        : `Preferred Slot: ${formData.timeSlot}`,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.from('enquiries').insert([newEnquiry]);
        if (error) {
          console.error('Supabase booking insert error:', error);
        } else {
          await broadcastRealtimeChange('enquiries', 'INSERT', newEnquiry);
        }
      }

      // Local storage backup
      const existing = localStorage.getItem('chitrakatha_local_enquiries');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newEnquiry);
      localStorage.setItem('chitrakatha_local_enquiries', JSON.stringify(list));

      // Trigger sync
      window.dispatchEvent(new Event('chitrakatha_data_updated'));

      onSuccess(
        `Thank you ${formData.fullName}! Your booking request for ${formData.eventType} has been received. Hemant Mandawade will confirm your slot shortly.`
      );
      onClose();
    } catch (err) {
      console.error('Booking submission error:', err);
      onSuccess(
        'Your request has been recorded locally. You can also connect directly with Hemant on WhatsApp!'
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppDirect = () => {
    const text = `*New Booking Request from Website*%0A%0A*Name:* ${
      formData.fullName || 'Client'
    }%0A*Phone:* ${formData.phone || 'Not Provided'}%0A*Event Type:* ${
      formData.eventType
    }%0A*Location:* ${formData.location || 'Maharashtra'}%0A*Date:* ${
      formData.date || 'To be discussed'
    }%0A*Time Slot:* ${formData.timeSlot}%0A*Notes:* ${
      formData.notes || 'Please share packages & date availability.'
    }`;

    const url = `https://wa.me/91${
      settings.whatsapp_number || '7249532553'
    }?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {/* Modal Container matching exact screenshot */}
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200/80 my-8 animate-scale-in text-[#1C1C1C]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Right Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-black flex items-center justify-center transition-colors focus:outline-none"
          aria-label="Close booking modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8 mb-6">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B0000] block">
            ONLINE APPOINTMENT REQUEST
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1C1C] font-normal tracking-tight">
            Book Photography Shoot
          </h2>
          <p className="text-xs text-stone-500 font-light leading-relaxed">
            Select your preferred date & time. Admin will confirm calendar slot upon review.
          </p>
        </div>

        {/* Form Elements matching screenshot */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. EVENT TYPE * */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
              EVENT TYPE *
            </label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1C1C1C] focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all"
            >
              <option value="Wedding Photography">Wedding Photography</option>
              <option value="Pre Wedding Shoots">Pre Wedding Shoots</option>
              <option value="Fashion Editorial">Fashion Editorial</option>
              <option value="Drone Aerial Cinema">Drone Aerial Cinema</option>
              <option value="Cinematic Video Films">Cinematic Video Films</option>
              <option value="Photo & Video Retouching">Photo & Video Retouching</option>
            </select>
          </div>

          {/* 2. FULL NAME & PHONE NUMBER (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
                FULL NAME *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                placeholder="Your Name"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1C1C1C] placeholder-stone-400 focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
                PHONE NUMBER *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="7249532553"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1C1C1C] placeholder-stone-400 font-mono focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* 3. EMAIL ADDRESS & CITY / LOCATION (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1C1C1C] placeholder-stone-400 focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
                CITY / LOCATION *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                placeholder="e.g. Satana, Nashik, Pune"
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1C1C1C] placeholder-stone-400 focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* 4. PREFERRED DATE & PREFERRED TIME SLOT (2 cols) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
                PREFERRED DATE *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1C1C1C] focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
                PREFERRED TIME SLOT
              </label>
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1C1C1C] focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all"
              >
                <option value="Morning (09:00 AM)">Morning (09:00 AM)</option>
                <option value="Afternoon (01:00 PM)">Afternoon (01:00 PM)</option>
                <option value="Golden Hour / Evening (04:30 PM)">
                  Golden Hour / Evening (04:30 PM)
                </option>
                <option value="Night / Reception (07:00 PM)">
                  Night / Reception (07:00 PM)
                </option>
                <option value="Full Day Event">Full Day Event</option>
              </select>
            </div>
          </div>

          {/* 5. NOTES & SPECIAL INSTRUCTIONS */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
              NOTES & SPECIAL INSTRUCTIONS
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Details about venue, functions, or specific requirements..."
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-[#1C1C1C] placeholder-stone-400 focus:outline-none focus:border-[#8B0000] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Dual Action Buttons matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
            {/* Left Button: Submit Booking Request */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] text-white text-xs font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>SUBMIT BOOKING REQUEST</span>
                </>
              )}
            </button>

            {/* Right Button: Instant WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppDirect}
              className="w-full py-3 px-4 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <WhatsAppIcon size={15} className="fill-white" />
              <span>INSTANT WHATSAPP</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
