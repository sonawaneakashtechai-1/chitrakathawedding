import React from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { createWhatsAppLink } from '../lib/utils';

interface FloatingWhatsAppProps {
  whatsappNumber: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ whatsappNumber }) => {
  const url = createWhatsAppLink(
    whatsappNumber || '7249532553',
    'Hello Hemant, I would like to inquire about wedding photography and cinematic films with Chitrakatha.'
  );

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group border border-white/20"
      aria-label="Chat with Hemant on WhatsApp"
      title="Chat on WhatsApp"
    >
      <WhatsAppIcon size={28} className="fill-white text-white" />
    </a>
  );
};
