import React, { useState, useEffect } from 'react';
import { Hero } from '../sections/Hero';
import { TrustCards } from '../sections/TrustCards';
import { ProvenExcellence } from '../sections/ProvenExcellence';
import { WhyChooseUs } from '../sections/WhyChooseUs';
import { Services } from '../sections/Services';
import { FeaturedPortfolio } from '../sections/FeaturedPortfolio';
import { DroneSection } from '../sections/DroneSection';
import { Films } from '../sections/Films';
import { InstagramSection } from '../sections/InstagramSection';
import { RedCtaSection } from '../sections/RedCtaSection';
import { Footer } from '../sections/Footer';
import { Lightbox } from '../components/Lightbox';
import { VideoModal } from '../components/VideoModal';
import { CategoryGalleryModal } from '../components/CategoryGalleryModal';
import { FloatingWhatsApp } from '../components/FloatingWhatsApp';
import { Toast } from '../components/Toast';
import {
  Category,
  PortfolioItem,
  Service,
  Film,
  SiteSettings,
  Project,
} from '../types';
import {
  defaultSiteSettings,
  mockCategories,
  mockPortfolioItems,
  mockServices,
  mockFilms,
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { deserializeSiteSettingsFromSupabase } from '../lib/utils';
import { subscribeToRealtimeChanges } from '../lib/realtimeSync';

interface HomePageProps {
  onNavigatePage: (page: 'home' | 'admin' | 'faq' | 'contact') => void;
  onOpenBooking?: (service?: string) => void;
  settings?: SiteSettings;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigatePage, onOpenBooking, settings: propSettings }) => {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    if (propSettings) return propSettings;
    const saved = localStorage.getItem('chitrakatha_site_settings');
    return saved ? JSON.parse(saved) : defaultSiteSettings;
  });

  useEffect(() => {
    if (propSettings) {
      setSettings(propSettings);
    }
  }, [propSettings]);

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('chitrakatha_categories');
    return saved ? JSON.parse(saved) : mockCategories;
  });

  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>(() => {
    const saved = localStorage.getItem('chitrakatha_portfolio_items');
    return saved ? JSON.parse(saved) : mockPortfolioItems;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('chitrakatha_services');
    return saved ? JSON.parse(saved) : mockServices;
  });

  const [films, setFilms] = useState<Film[]>(() => {
    const saved = localStorage.getItem('chitrakatha_films');
    return saved ? JSON.parse(saved) : mockFilms;
  });

  // Modal States
  const [activeCategoryForGallery, setActiveCategoryForGallery] = useState<Category | null>(null);
  const [activeLightboxItem, setActiveLightboxItem] = useState<{ item: PortfolioItem; index: number } | null>(null);
  const [activeVideoFilm, setActiveVideoFilm] = useState<Film | null>(null);

  // Feedback Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);

  // Fetch live Supabase data on mount and listen for admin updates
  useEffect(() => {
    async function loadDataFromSupabase() {
      if (!isSupabaseConfigured || !supabase) return;

      try {
        // 1. Settings
        const { data: setRes } = await supabase
          .from('site_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);
        if (setRes && setRes.length > 0) {
          const normalized = deserializeSiteSettingsFromSupabase(setRes[0]);
          if (normalized) {
            setSettings(normalized);
            localStorage.setItem('chitrakatha_site_settings', JSON.stringify(normalized));
          }
        }

        // 2. Categories
        const { data: catRes } = await supabase
          .from('categories')
          .select('*')
          .order('displayorder', { ascending: true });
        if (catRes && catRes.length > 0) {
          const normalizedCats: Category[] = catRes.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            coverImage: c.coverimage || c.coverImage || '',
            displayOrder: c.displayorder ?? c.displayOrder ?? 0,
            hidden: Boolean(c.hidden),
          })).sort((a, b) => a.displayOrder - b.displayOrder);

          setCategories(normalizedCats);
          localStorage.setItem('chitrakatha_categories', JSON.stringify(normalizedCats));
        }

        // 3. Portfolio items
        const { data: itemRes } = await supabase.from('portfolio_items').select('*');
        if (itemRes && itemRes.length > 0) {
          const normalizedItems: PortfolioItem[] = itemRes.map((item: any) => ({
            id: item.id,
            categoryId: item.categoryid || item.categoryId,
            category: item.category,
            title: item.title,
            description: item.description,
            image: item.image,
            altText: item.alttext || item.altText,
            location: item.location,
            date: item.date,
            featured: Boolean(item.featured),
            hidden: Boolean(item.hidden),
            displayOrder: item.displayorder ?? item.displayOrder ?? 0,
            created_at: item.created_at,
          }));

          setPortfolioItems(normalizedItems);
          localStorage.setItem('chitrakatha_portfolio_items', JSON.stringify(normalizedItems));
        }

        // 4. Services
        const { data: srvRes } = await supabase.from('services').select('*').order('sort_order', { ascending: true });
        if (srvRes && srvRes.length > 0) {
          setServices(srvRes);
          localStorage.setItem('chitrakatha_services', JSON.stringify(srvRes));
        }

        // 5. Films
        const { data: filmRes } = await supabase
          .from('films')
          .select('*')
          .order('created_at', { ascending: false });
        if (filmRes) {
          setFilms(filmRes);
          localStorage.setItem('chitrakatha_films', JSON.stringify(filmRes));
        }
      } catch (err) {
        console.warn('Supabase data load notice:', err);
      }
    }

    loadDataFromSupabase();

    // Unified Realtime subscription across DOM, BroadcastChannel, and Supabase WebSockets
    const unsubscribe = subscribeToRealtimeChanges((payload) => {
      if (payload.table === 'site_settings' || payload.table === 'all') {
        if (payload.data) {
          const normalized = deserializeSiteSettingsFromSupabase(payload.data);
          if (normalized) {
            setSettings((prev) => ({ ...prev, ...normalized }));
            localStorage.setItem('chitrakatha_site_settings', JSON.stringify(normalized));
          }
        } else {
          loadDataFromSupabase();
        }
      } else {
        loadDataFromSupabase();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleOpenLightbox = (item: PortfolioItem, index: number) => {
    setActiveLightboxItem({ item, index });
  };

  const handleNextLightbox = () => {
    if (!activeLightboxItem) return;
    const nextIdx = (activeLightboxItem.index + 1) % portfolioItems.length;
    setActiveLightboxItem({ item: portfolioItems[nextIdx], index: nextIdx });
  };

  const handlePrevLightbox = () => {
    if (!activeLightboxItem) return;
    const prevIdx = (activeLightboxItem.index - 1 + portfolioItems.length) % portfolioItems.length;
    setActiveLightboxItem({ item: portfolioItems[prevIdx], index: prevIdx });
  };

  // Convert PortfolioItem to Project shape for Lightbox compatibility
  const lightboxProject: Project | null = activeLightboxItem
    ? {
        id: activeLightboxItem.item.id,
        title: activeLightboxItem.item.title,
        slug: activeLightboxItem.item.id,
        category: activeLightboxItem.item.category || 'Wedding',
        description: activeLightboxItem.item.description || '',
        location: activeLightboxItem.item.location || 'Maharashtra',
        event_date: activeLightboxItem.item.date || '2026',
        cover_image: activeLightboxItem.item.image,
        featured: Boolean(activeLightboxItem.item.featured),
      }
    : null;

  return (
    <div className="relative min-h-screen bg-[#FAF7F2]">
      {/* 1. Hero Section */}
      <Hero settings={settings} onOpenBooking={() => onOpenBooking?.('Wedding Photography')} />

      {/* 2. Behind The Lens Artist & Philosophy */}
      <TrustCards settings={settings} />

      {/* 3. Proven Excellence 6-Metric Trust Showcase */}
      <ProvenExcellence settings={settings} />

      {/* 4. Why Choose Chitrakatha 8-Feature Grid */}
      <WhyChooseUs />

      {/* 5. Signature Services */}
      <Services
        services={services}
        onSelectServiceForBooking={(srv) => (onOpenBooking ? onOpenBooking(srv) : onNavigatePage('contact'))}
      />

      {/* 4. Featured Portfolio Categories Grid */}
      <FeaturedPortfolio
        categories={categories}
        portfolioItems={portfolioItems}
        onOpenCategoryGallery={(cat) => setActiveCategoryForGallery(cat)}
      />

      {/* 6. Cinematic Video Films Gallery */}
      <Films films={films} onPlayFilm={(film) => setActiveVideoFilm(film)} />

      {/* 7. Drone & Aerial Photography Banner Showcase */}
      <DroneSection settings={settings} onOpenBooking={onOpenBooking} />

      {/* 8. Instagram Section */}
      <InstagramSection settings={settings} />

      {/* 9. Red CTA Section Banner */}
      <RedCtaSection settings={settings} onOpenBooking={() => onOpenBooking?.('Wedding Photography')} />

      {/* 10. Footer */}
      <Footer onNavigatePage={onNavigatePage} settings={settings} />

      {/* Floating WhatsApp Quick Chat CTA */}
      <FloatingWhatsApp whatsappNumber={settings.whatsapp_number} />

      {/* Category Gallery Modal */}
      {activeCategoryForGallery && (
        <CategoryGalleryModal
          category={activeCategoryForGallery}
          items={portfolioItems}
          onClose={() => setActiveCategoryForGallery(null)}
          onOpenLightbox={(photo, idx) => handleOpenLightbox(photo, idx)}
        />
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxProject && (
        <Lightbox
          project={lightboxProject}
          currentIndex={activeLightboxItem?.index || 0}
          totalProjects={portfolioItems.length}
          onClose={() => setActiveLightboxItem(null)}
          onNext={handleNextLightbox}
          onPrev={handlePrevLightbox}
        />
      )}

      {/* Video Player Modal */}
      {activeVideoFilm && (
        <VideoModal
          film={activeVideoFilm}
          onClose={() => setActiveVideoFilm(null)}
        />
      )}

      {/* Toast feedback */}
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
