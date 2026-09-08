import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { MobileMenu } from './components/MobileMenu';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';
import { BookingModal } from './components/BookingModal';
import { Toast } from './components/Toast';
import { defaultSiteSettings } from './data/mockData';
import { SiteSettings } from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { deserializeSiteSettingsFromSupabase } from './lib/utils';
import { subscribeToRealtimeChanges } from './lib/realtimeSync';

export type AppPage = 'home' | 'admin' | 'faq' | 'contact';

export function App() {
  const [currentPage, setCurrentPage] = useState<AppPage>(() => {
    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      return 'admin';
    }
    if (window.location.pathname === '/faq' || window.location.hash === '#faq') {
      return 'faq';
    }
    if (window.location.pathname === '/contact' || window.location.hash === '#contact') {
      return 'contact';
    }
    return 'home';
  });

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('chitrakatha_site_settings');
    return saved ? JSON.parse(saved) : defaultSiteSettings;
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingInitialService, setBookingInitialService] = useState('Wedding Photography');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentPage('admin');
      } else if (window.location.hash === '#faq') {
        setCurrentPage('faq');
      } else if (window.location.hash === '#contact') {
        setCurrentPage('contact');
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    const handleOpenBookingEvent = (e: any) => {
      if (e.detail?.service) {
        setBookingInitialService(e.detail.service);
      }
      setIsBookingModalOpen(true);
    };
    window.addEventListener('chitrakatha_open_booking', handleOpenBookingEvent);

    // 1. Fetch live Supabase settings on initial load
    const fetchLatestSettings = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);
        if (data && data.length > 0) {
          const normalized = deserializeSiteSettingsFromSupabase(data[0]);
          if (normalized) {
            setSettings((prev) => ({ ...prev, ...normalized }));
            localStorage.setItem('chitrakatha_site_settings', JSON.stringify(normalized));
          }
        }
      } catch (err) {
        console.warn('Supabase settings load notice:', err);
      }
    };

    fetchLatestSettings();

    // 2. Realtime Unified Subscription (Cross-tab + DOM Events + Supabase WebSocket Broadcast + Postgres WAL)
    const unsubscribe = subscribeToRealtimeChanges((payload) => {
      if (payload.table === 'site_settings' || payload.table === 'all') {
        if (payload.data) {
          const normalized = deserializeSiteSettingsFromSupabase(payload.data);
          if (normalized) {
            setSettings((prev) => ({ ...prev, ...normalized }));
            localStorage.setItem('chitrakatha_site_settings', JSON.stringify(normalized));
          }
        } else {
          fetchLatestSettings();
        }
      }
    });

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('chitrakatha_open_booking', handleOpenBookingEvent);
      unsubscribe();
    };
  }, []);

  const handleNavigatePage = (page: AppPage) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'admin') {
      window.location.hash = 'admin';
    } else if (page === 'faq') {
      window.location.hash = 'faq';
    } else if (page === 'contact') {
      window.location.hash = 'contact';
    } else {
      if (
        window.location.hash === '#admin' ||
        window.location.hash === '#faq' ||
        window.location.hash === '#contact'
      ) {
        window.location.hash = '';
      }
    }
  };

  const handleUpdateSettings = (newSettings: SiteSettings) => {
    setSettings(newSettings);
    localStorage.setItem('chitrakatha_site_settings', JSON.stringify(newSettings));
  };

  const handleOpenBooking = (service = 'Wedding Photography') => {
    setBookingInitialService(service);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C1C1C] flex flex-col font-sans selection:bg-[#8B0000] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        currentPage={currentPage}
        onNavigatePage={handleNavigatePage}
        settings={settings}
        onOpenBooking={() => handleOpenBooking('Wedding Photography')}
      />

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPage={currentPage}
        onNavigatePage={handleNavigatePage}
      />

      {/* Page View */}
      {currentPage === 'home' && (
        <HomePage
          settings={settings}
          onNavigatePage={handleNavigatePage}
          onOpenBooking={handleOpenBooking}
        />
      )}
      {currentPage === 'admin' && (
        <AdminPage
          onNavigatePage={handleNavigatePage}
          onSettingsUpdated={handleUpdateSettings}
        />
      )}
      {currentPage === 'faq' && (
        <FaqPage settings={settings} onNavigatePage={handleNavigatePage} />
      )}
      {currentPage === 'contact' && (
        <ContactPage settings={settings} onNavigatePage={handleNavigatePage} />
      )}

      {/* Booking Shoot Appointment Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        settings={settings}
        initialService={bookingInitialService}
        onSuccess={(msg) => {
          setToast({
            type: 'success',
            title: 'Booking Request Received',
            message: msg,
          });
        }}
      />

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
}

export default App;
