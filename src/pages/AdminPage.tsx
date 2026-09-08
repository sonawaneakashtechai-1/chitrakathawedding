import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Category,
  PortfolioItem,
  Service,
  FAQItem,
  Film,
  Enquiry,
  EnquiryStatus,
  SiteSettings,
} from '../types';
import {
  defaultSiteSettings,
  mockCategories,
  mockPortfolioItems,
  mockServices,
  mockFAQs,
  mockFilms,
  mockEnquiries,
} from '../data/mockData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  createWhatsAppLink,
  formatImageUrl,
  formatVideoUrl,
  deserializeSiteSettingsFromSupabase,
  saveSiteSettingsToSupabase,
  isValidVideoLink,
  extractGoogleDriveFileId,
  extractYouTubeId,
  getYouTubeThumbnail,
  getCategoryFallbackImage,
  getAutoThumbnail,
  handleImageError,
  compressImageFile,
  generateVideoThumbnail,
  matchesFilmCategory,
} from '../lib/utils';




import { broadcastRealtimeChange, subscribeToRealtimeChanges } from '../lib/realtimeSync';
import {
  LayoutDashboard,
  Home,
  User,
  Briefcase,
  Image as ImageIcon,
  Radio,
  Video,
  Calendar,
  HelpCircle,
  Search,
  ExternalLink,
  Bell,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  Trash2,
  Plus,
  Loader2,

  Eye,
  EyeOff,
  Save,
  LogOut,
  ArrowRight,
  Users,
  HardDrive,
  MapPin,
  Upload,
  RefreshCw,
  UploadCloud,
  Check,
  Edit3,
  X,
  Tag,
  FolderUp,
  FolderPlus,
  Folder,
} from 'lucide-react';

interface AdminPageProps {
  onNavigatePage: (page: 'home' | 'admin') => void;
  onSettingsUpdated?: (settings: SiteSettings) => void;
}

type AdminTab =
  | 'overview'
  | 'homepage'
  | 'about'
  | 'services'
  | 'portfolio'
  | 'drone'
  | 'films'
  | 'bookings'
  | 'faqs';

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigatePage, onSettingsUpdated }) => {
  const { isAdmin, signInWithPassword, signOut } = useAuth();

  // Active Tab - default to Dashboard Overview matching screenshot
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Search Filter in Header
  const [searchQuery, setSearchQuery] = useState('');

  // CMS States
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('chitrakatha_site_settings');
    return saved ? JSON.parse(saved) : defaultSiteSettings;
  });

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

  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    const saved = localStorage.getItem('chitrakatha_faqs');
    return saved ? JSON.parse(saved) : mockFAQs;
  });

  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    const saved = localStorage.getItem('chitrakatha_local_enquiries');
    return saved ? JSON.parse(saved) : mockEnquiries;
  });

  // Auth Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Success Feedback Toast
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Buffer Modals / Forms
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    coverImage: '',
    displayOrder: 1,
    hidden: false,
  });

  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [newPhoto, setNewPhoto] = useState<Partial<PortfolioItem>>({
    title: '',
    category: 'Wedding',
    categoryId: 'cat-wedding',
    image: '',
    description: '',
    location: 'Satana, Nashik',
    date: 'February 2026',
    featured: true,
  });

  // Batch / Folder Photo Upload States
  const [showBatchUpload, setShowBatchUpload] = useState(false);
  const [batchCategory, setBatchCategory] = useState<string>('');
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [batchDriveLinksText, setBatchDriveLinksText] = useState<string>('');
  const [batchUploadMode, setBatchUploadMode] = useState<'files' | 'links'>('files');
  const [batchUploading, setBatchUploading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    statusText: string;
  }>({ current: 0, total: 0, percent: 0, statusText: '' });

  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({
    title: '',
    slug: '',
    description: '',
    image_url: '',
    sort_order: 1,
  });

  const [filmCategories, setFilmCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('chitrakatha_film_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [
      'Wedding Film',
      'Pre-Wedding Film',
      'Engagement Film',
      'Cinematic Highlights',
      'Traditional Wedding Film',
      'Drone & Aerial Film',
    ];
  });
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);

  const [showAddFilm, setShowAddFilm] = useState(false);
  const [editingFilm, setEditingFilm] = useState<Film | null>(null);
  const [newFilm, setNewFilm] = useState<Partial<Film>>({
    title: '',
    description: '',
    thumbnail_url: '',
    video_url: '',
    category: 'Wedding Film',
    featured: true,
  });

  // Batch / Folder Video Upload States
  const [showBatchVideoUpload, setShowBatchVideoUpload] = useState(false);
  const [batchVideoCategory, setBatchVideoCategory] = useState<string>('Wedding Film');
  const [batchVideoFiles, setBatchVideoFiles] = useState<File[]>([]);
  const [batchVideoLinksText, setBatchVideoLinksText] = useState<string>('');
  const [batchVideoUploadMode, setBatchVideoUploadMode] = useState<'files' | 'links'>('links');
  const [batchVideoUploading, setBatchVideoUploading] = useState(false);
  const [batchVideoProgress, setBatchVideoProgress] = useState<{
    current: number;
    total: number;
    percent: number;
    statusText: string;
  }>({ current: 0, total: 0, percent: 0, statusText: '' });
  const batchVideoCancelRef = useRef(false);
  const [adminFilmCategoryFilter, setAdminFilmCategoryFilter] = useState<string>('All');



  const [showAddFaq, setShowAddFaq] = useState(false);
  const [newFaq, setNewFaq] = useState<Partial<FAQItem>>({
    question: '',
    answer: '',
    sort_order: 1,
    published: true,
  });

  const [enquiryFilter, setEnquiryFilter] = useState<string>('all');

  // Hero Background Video CMS states
  const [videoUploading, setVideoUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [stagedVideoUrl, setStagedVideoUrl] = useState<string>('');
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const opacityDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOpacityChange = (newVal: number) => {
    const updatedSettings: SiteSettings = {
      ...settings,
      hero_video_opacity: newVal,
    };
    setSettings(updatedSettings);

    // 1. Instant local persistence for immediate live effect
    localStorage.setItem('chitrakatha_hero_video_opacity', String(newVal));
    localStorage.setItem('chitrakatha_site_settings', JSON.stringify(updatedSettings));
    if (onSettingsUpdated) onSettingsUpdated(updatedSettings);
    window.dispatchEvent(new Event('chitrakatha_data_updated'));

    // 2. Debounced save to Supabase
    if (opacityDebounceRef.current) clearTimeout(opacityDebounceRef.current);
    opacityDebounceRef.current = setTimeout(async () => {
      if (isSupabaseConfigured && supabase) {
        await saveSiteSettingsToSupabase(updatedSettings);
        await broadcastRealtimeChange('site_settings', 'UPDATE', updatedSettings);
      }
    }, 400);
  };


  useEffect(() => {
    loadAllData();

    // Auto-create 'films' storage bucket if it doesn't exist (needed for cross-device video playback)
    if (isSupabaseConfigured && supabase) {
      supabase.storage.createBucket('films', { public: true, fileSizeLimit: 5368709120 })
        .then(({ error }) => {
          if (error && !error.message?.includes('already exists')) {
            console.warn('Could not create films bucket:', error.message);
          }
        })
        .catch(() => {});
    }

    const unsubscribeRealtime = subscribeToRealtimeChanges((payload) => {
      if (payload.table === 'enquiries' || payload.table === 'all') {
        loadAllData();
      }
    });

    return () => {
      if (unsubscribeRealtime) unsubscribeRealtime();
    };
  }, []);

  const loadAllData = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sRows } = await supabase
          .from('site_settings')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1);
        if (sRows && sRows.length > 0) {
          const normalized = deserializeSiteSettingsFromSupabase(sRows[0]);
          if (normalized) {
            setSettings(normalized);
            localStorage.setItem('chitrakatha_site_settings', JSON.stringify(normalized));
          }
        }

        const { data: cData } = await supabase.from('categories').select('*');
        if (cData && cData.length > 0) {
          const normalized: Category[] = cData.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            coverImage: c.coverimage || c.coverImage || '',
            displayOrder: c.displayorder ?? c.displayOrder ?? 0,
            hidden: Boolean(c.hidden),
          })).sort((a, b) => a.displayOrder - b.displayOrder);

          setCategories(normalized);
          localStorage.setItem('chitrakatha_categories', JSON.stringify(normalized));
        }

        const { data: pData } = await supabase.from('portfolio_items').select('*');
        if (pData && pData.length > 0) {
          const normalized: PortfolioItem[] = pData.map((item: any) => ({
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

          setPortfolioItems(normalized);
          localStorage.setItem('chitrakatha_portfolio_items', JSON.stringify(normalized));
        }

        const { data: srvData } = await supabase.from('services').select('*').order('sort_order', { ascending: true });
        if (srvData && srvData.length > 0) {
          setServices(srvData);
          localStorage.setItem('chitrakatha_services', JSON.stringify(srvData));
        }

        const { data: fData } = await supabase.from('films').select('*').order('created_at', { ascending: false });
        if (fData && fData.length > 0) {
          setFilms(fData);
          localStorage.setItem('chitrakatha_films', JSON.stringify(fData));
        }

        const { data: faqData } = await supabase.from('faqs').select('*').order('sort_order', { ascending: true });
        if (faqData && faqData.length > 0) {
          setFaqs(faqData);
          localStorage.setItem('chitrakatha_faqs', JSON.stringify(faqData));
        }

        const { data: eData } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
        if (eData) {
          setEnquiries(eData);
          localStorage.setItem('chitrakatha_local_enquiries', JSON.stringify(eData));
        }
      } catch (err) {
        console.warn('Using local dataset:', err);
      }
    }
  };

  const showToast = (msg: string) => {
    setActionSuccess(msg);
    window.dispatchEvent(new Event('chitrakatha_data_updated'));
    setTimeout(() => setActionSuccess(null), 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const { error } = await signInWithPassword(email, password);
    setAuthLoading(false);

    if (error) {
      setAuthError(error.message);
    }
  };

  // --- SAVE SETTINGS (LIVE TO SUPABASE + LOCALSTORAGE + REACT ROOT STATE) ---
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveSiteSettingsToSupabase(settings);
    if (!success) {
      alert('Unable to save changes to Supabase database. Please check your internet connection.');
      return;
    }
    localStorage.setItem('chitrakatha_site_settings', JSON.stringify(settings));
    localStorage.setItem('chitrakatha_hero_video_url', settings.hero_video_url || '');
    localStorage.setItem('chitrakatha_hero_video_enabled', String(settings.hero_video_enabled !== false));
    localStorage.setItem('chitrakatha_hero_video_opacity', String(settings.hero_video_opacity ?? 45));
    if (onSettingsUpdated) onSettingsUpdated(settings);
    await broadcastRealtimeChange('site_settings', 'UPDATE', settings);
    showToast('Changes saved! Live website updated instantly.');
  };

  const handleFounderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (isSupabaseConfigured && supabase) {
        const fileExt = file.name.split('.').pop() || 'png';
        const fileName = `founder-${Date.now()}.${fileExt}`;
        const filePath = `founder/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('hero-videos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type || 'image/png',
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('hero-videos')
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            const uploadedUrl = publicUrlData.publicUrl;
            const newSettings: SiteSettings = {
              ...settings,
              founder_image_url: uploadedUrl,
            };
            setSettings(newSettings);
            await saveSiteSettingsToSupabase(newSettings);
            localStorage.setItem('chitrakatha_site_settings', JSON.stringify(newSettings));
            localStorage.setItem('chitrakatha_founder_image_url', uploadedUrl);
            if (onSettingsUpdated) onSettingsUpdated(newSettings);
            await broadcastRealtimeChange('site_settings', 'UPDATE', newSettings);
            showToast('Artist profile photo uploaded and published live to all devices!');
            return;
          }
        }
      }

      // Fallback local reader
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const dataUrl = reader.result as string;
          setSettings((prev) => ({
            ...prev,
            founder_image_url: dataUrl,
          }));
          showToast('Artist profile photo loaded! Click Save to apply live.');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Founder image upload error:', err);
    }
  };

  // --- HERO BACKGROUND VIDEO CMS HANDLERS ---
  const handleUploadHeroVideo = async (file: File) => {
    if (!file) return;

    // 1. File Type Validation
    const validExts = ['.mp4', '.webm', '.mov', '.ogg'];
    const hasValidExt = validExts.some((ext) => file.name.toLowerCase().endsWith(ext));
    if (!file.type.startsWith('video/') && !hasValidExt) {
      alert('Invalid file format. Please upload a valid MP4, WebM, or MOV video.');
      return;
    }

    setVideoUploading(true);
    setUploadProgress(5);

    try {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const cleanName = `hero-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      let uploadedUrl = '';

      // Step 1: Fast upload to local server (takes < 1 second, works for any file size)
      try {
        const xhr = new XMLHttpRequest();
        const localPromise = new Promise<{ success: boolean; url?: string }>((resolve) => {
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) {
              const p = Math.round((ev.loaded / ev.total) * 90);
              setUploadProgress(Math.max(5, p));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch {
                resolve({ success: false });
              }
            } else {
              resolve({ success: false });
            }
          };
          xhr.onerror = () => resolve({ success: false });
        });

        xhr.open('POST', `/api/local-video-upload?filename=${encodeURIComponent(cleanName)}`);
        xhr.send(file);

        const localResult = await localPromise;
        if (localResult.success && localResult.url) {
          uploadedUrl = localResult.url;
        }
      } catch (localErr) {
        console.warn('Local upload notice:', localErr);
      }

      // Step 2: If under 50MB and Supabase is configured, also sync to Supabase Storage
      if (isSupabaseConfigured && supabase && file.size <= 50 * 1024 * 1024) {
        try {
          const filePath = `hero/${cleanName}`;
          const { error: uploadError } = await supabase.storage
            .from('hero-videos')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type || 'video/mp4',
            });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('hero-videos')
              .getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              uploadedUrl = publicUrlData.publicUrl;
            }
          }
        } catch (cloudErr) {
          console.warn('Cloud sync notice:', cloudErr);
        }
      }

      if (!uploadedUrl) {
        // Fallback to object URL if all else fails
        uploadedUrl = URL.createObjectURL(file);
      }

      setUploadProgress(100);
      setStagedVideoUrl(uploadedUrl);

      const newSettings: SiteSettings = {
        ...settings,
        hero_video_url: uploadedUrl,
        hero_video_enabled: true,
        hero_video_updated_at: new Date().toISOString(),
      };

      setSettings(newSettings);

      if (isSupabaseConfigured && supabase) {
        await saveSiteSettingsToSupabase(newSettings);
      }

      localStorage.setItem('chitrakatha_site_settings', JSON.stringify(newSettings));
      localStorage.setItem('chitrakatha_hero_video_url', uploadedUrl);
      localStorage.setItem('chitrakatha_hero_video_enabled', 'true');
      if (onSettingsUpdated) onSettingsUpdated(newSettings);
      await broadcastRealtimeChange('site_settings', 'UPDATE', newSettings);

      showToast(`Hero background video (${fileSizeMB} MB) uploaded and published!`);
    } catch (err: any) {
      console.error('Video upload error:', err);
      alert(err?.message || 'Video upload failed.');
    } finally {
      setVideoUploading(false);
      setUploadProgress(0);
    }
  };


  const handlePublishHeroVideo = async (urlToPublish?: string) => {
    const rawUrl = (urlToPublish || stagedVideoUrl || settings.hero_video_url || '').trim();
    if (!rawUrl) {
      alert('Please enter or select a valid video URL first.');
      return;
    }

    const targetUrl = formatVideoUrl(rawUrl);

    const updatedSettings: SiteSettings = {
      ...settings,
      hero_video_url: targetUrl,
      hero_video_enabled: true,
      hero_video_updated_at: new Date().toISOString(),
    };

    setSettings(updatedSettings);

    const success = await saveSiteSettingsToSupabase(updatedSettings);
    if (!success) {
      alert('Unable to save video settings to Supabase database. Please try again.');
      return;
    }
    localStorage.setItem('chitrakatha_site_settings', JSON.stringify(updatedSettings));
    localStorage.setItem('chitrakatha_hero_video_url', targetUrl);
    localStorage.setItem('chitrakatha_hero_video_enabled', 'true');
    if (onSettingsUpdated) onSettingsUpdated(updatedSettings);
    await broadcastRealtimeChange('site_settings', 'UPDATE', updatedSettings);

    showToast('Hero background video updated successfully.');
  };

  const handleUnpublishHeroVideo = async () => {
    const updatedSettings: SiteSettings = {
      ...settings,
      hero_video_enabled: false,
      hero_video_updated_at: new Date().toISOString(),
    };

    setSettings(updatedSettings);

    await saveSiteSettingsToSupabase(updatedSettings);
    localStorage.setItem('chitrakatha_site_settings', JSON.stringify(updatedSettings));
    localStorage.setItem('chitrakatha_hero_video_enabled', 'false');
    if (onSettingsUpdated) onSettingsUpdated(updatedSettings);
    await broadcastRealtimeChange('site_settings', 'UPDATE', updatedSettings);

    showToast('Hero video unpublished. Fallback background active.');
  };

  // --- CATEGORIES CRUD ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.coverImage) {
      alert('Please fill Category Name and Cover Image URL');
      return;
    }
    const cleanCover = formatImageUrl(newCategory.coverImage!);
    const slug = newCategory.slug || newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const record: Category = {
      id: `cat-${Date.now()}`,
      name: newCategory.name!,
      slug,
      coverImage: cleanCover,
      displayOrder: categories.length + 1,
      hidden: false,
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('categories').insert([{
        id: record.id,
        name: record.name,
        slug: record.slug,
        coverimage: record.coverImage,
        displayorder: record.displayOrder,
        hidden: record.hidden,
      }]);
    }
    const updated = [...categories, record];
    setCategories(updated);
    localStorage.setItem('chitrakatha_categories', JSON.stringify(updated));
    await broadcastRealtimeChange('categories', 'INSERT', record);
    window.dispatchEvent(new Event('chitrakatha_data_updated'));
    setShowAddCategory(false);
    setNewCategory({ name: '', slug: '', coverImage: '', displayOrder: 1, hidden: false });
    showToast('New Portfolio Category created!');
  };

  const handleToggleCategoryHidden = async (id: string, currentHidden: boolean) => {
    const updated = !currentHidden;
    if (isSupabaseConfigured && supabase) {
      await supabase.from('categories').update({ hidden: updated }).eq('id', id);
    }
    const newList = categories.map((c) => (c.id === id ? { ...c, hidden: updated } : c));
    setCategories(newList);
    localStorage.setItem('chitrakatha_categories', JSON.stringify(newList));
    await broadcastRealtimeChange('categories', 'UPDATE', { id, hidden: updated });
    window.dispatchEvent(new Event('chitrakatha_data_updated'));
    showToast(`Category ${updated ? 'Hidden' : 'Visible'} on live website`);
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Delete this category?')) {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('categories').delete().eq('id', id);
      }
      const newList = categories.filter((c) => c.id !== id);
      setCategories(newList);
      localStorage.setItem('chitrakatha_categories', JSON.stringify(newList));
      await broadcastRealtimeChange('categories', 'DELETE', { id });
      window.dispatchEvent(new Event('chitrakatha_data_updated'));
      showToast('Category deleted');
    }
  };

  // --- PORTFOLIO PHOTO CRUD ---
  const handlePortfolioPhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (isSupabaseConfigured && supabase) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `photo-${Date.now()}.${fileExt}`;
        const filePath = `portfolio/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('hero-videos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type || 'image/jpeg',
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('hero-videos')
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            setNewPhoto((prev) => ({
              ...prev,
              image: publicUrlData.publicUrl,
              title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
            }));
            showToast('Photograph uploaded to Supabase Storage!');
            return;
          }
        }
      }

      // Local fallback
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setNewPhoto((prev) => ({
            ...prev,
            image: reader.result as string,
            title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          }));
          showToast('Image file loaded!');
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Portfolio photo upload error:', err);
    }
  };

  const handleCreatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.title || !newPhoto.image) {
      alert('Please provide Title and Image URL');
      return;
    }

    const cleanPhotoImg = formatImageUrl(newPhoto.image!);
    const matchedCat =
      categories.find(
        (c) =>
          c.name.trim().toLowerCase() === newPhoto.category?.trim().toLowerCase() ||
          c.id === newPhoto.categoryId
      ) || categories[0];

    const record: PortfolioItem = {
      id: `img-${Date.now()}`,
      categoryId: matchedCat?.id || 'cat-wedding',
      category: matchedCat?.name || 'Wedding',
      title: newPhoto.title!,
      description: newPhoto.description || '',
      image: cleanPhotoImg,
      location: newPhoto.location || 'Maharashtra',
      date: newPhoto.date || '2026',
      featured: Boolean(newPhoto.featured),
      hidden: false,
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('portfolio_items').insert([{
        id: record.id,
        categoryid: record.categoryId,
        category: record.category,
        title: record.title,
        description: record.description,
        image: record.image,
        location: record.location,
        date: record.date,
        featured: record.featured,
        hidden: record.hidden,
      }]);
    }
    const updated = [record, ...portfolioItems];
    setPortfolioItems(updated);
    localStorage.setItem('chitrakatha_portfolio_items', JSON.stringify(updated));
    await broadcastRealtimeChange('portfolio_items', 'INSERT', record);
    window.dispatchEvent(new Event('chitrakatha_data_updated'));
    setShowAddPhoto(false);
    setNewPhoto({ title: '', category: categories[0]?.name || 'Wedding', categoryId: categories[0]?.id, image: '', description: '', location: 'Satana, Nashik', date: 'February 2026', featured: true });
    showToast('Photograph added to live gallery!');
  };

  // --- BATCH / FOLDER PHOTO UPLOAD HANDLER ---
  const handleExecuteBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const matchedCat =
      categories.find((c) => c.id === batchCategory || c.name === batchCategory) ||
      categories[0];

    if (!matchedCat) {
      alert('Please select a target category album first.');
      return;
    }

    if (batchUploadMode === 'files' && batchFiles.length === 0) {
      alert('Please select at least one photo or folder of photos to upload.');
      return;
    }

    if (batchUploadMode === 'links' && !batchDriveLinksText.trim()) {
      alert('Please paste at least one photo link (Google Drive or image URL).');
      return;
    }

    setBatchUploading(true);
    const newRecords: PortfolioItem[] = [];

    try {
      if (batchUploadMode === 'files') {
        const total = batchFiles.length;
        setBatchProgress({ current: 0, total, percent: 0, statusText: 'Starting folder upload...' });

        for (let i = 0; i < total; i++) {
          const rawFile = batchFiles[i];
          const cleanName = rawFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const cleanTitle = rawFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          const catSlug = matchedCat.slug || matchedCat.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const filePath = `portfolio/${catSlug}/${Date.now()}-${i}-${cleanName.replace(/\.[^.]+$/, '.jpg')}`;

          setBatchProgress({
            current: i + 1,
            total,
            percent: Math.round(((i + 1) / total) * 100),
            statusText: `Optimizing & Uploading "${rawFile.name}" (${i + 1} of ${total})...`,
          });

          // 1. Auto-compress 10MB-30MB raw camera photos to ~150KB-250KB with crystal-clear 1080p web fidelity
          const { compressedFile, dataUrl } = await compressImageFile(rawFile, 1920, 0.82);

          let finalImageUrl = '';

          // 2. Try Supabase Storage upload
          if (isSupabaseConfigured && supabase) {
            try {
              const { error: uploadError } = await supabase.storage
                .from('hero-videos')
                .upload(filePath, compressedFile, {
                  cacheControl: '31536000',
                  upsert: true,
                  contentType: 'image/jpeg',
                });

              if (!uploadError) {
                const { data: publicUrlData } = supabase.storage
                  .from('hero-videos')
                  .getPublicUrl(filePath);
                if (publicUrlData?.publicUrl) {
                  finalImageUrl = publicUrlData.publicUrl;
                }
              }
            } catch (err) {
              console.warn('Storage upload warning:', err);
            }
          }

          // 3. Lightweight compressed Data URL fallback
          if (!finalImageUrl) {
            finalImageUrl = dataUrl;
          }

          const record: PortfolioItem = {
            id: `img-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            categoryId: matchedCat.id,
            category: matchedCat.name,
            title: cleanTitle || `${matchedCat.name} Photo ${i + 1}`,
            description: `${matchedCat.name} collection`,
            image: finalImageUrl,
            location: 'Maharashtra',
            date: '2026',
            featured: true,
            hidden: false,
          };

          if (isSupabaseConfigured && supabase) {
            await supabase.from('portfolio_items').insert([{
              id: record.id,
              categoryid: record.categoryId,
              category: record.category,
              title: record.title,
              description: record.description,
              image: record.image,
              location: record.location,
              date: record.date,
              featured: record.featured,
              hidden: record.hidden,
            }]);
          }

          newRecords.push(record);
        }
      } else {
        // Mode: Links Batch Importer
        const lines = batchDriveLinksText
          .split(/[\n,;]+/)
          .map((s) => s.trim())
          .filter(Boolean);

        if (lines.length === 0) {
          alert('No valid links found in the text box.');
          setBatchUploading(false);
          return;
        }

        const total = lines.length;
        setBatchProgress({ current: 0, total, percent: 0, statusText: 'Importing photo links...' });

        for (let i = 0; i < total; i++) {
          const rawLink = lines[i];
          const cleanPhotoImg = formatImageUrl(rawLink);

          setBatchProgress({
            current: i + 1,
            total,
            percent: Math.round(((i + 1) / total) * 100),
            statusText: `Adding photo ${i + 1} of ${total}...`,
          });

          const record: PortfolioItem = {
            id: `img-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            categoryId: matchedCat.id,
            category: matchedCat.name,
            title: `${matchedCat.name} Photo ${String(i + 1).padStart(2, '0')}`,
            description: `${matchedCat.name} Photography Collection`,
            image: cleanPhotoImg,
            location: 'Maharashtra',
            date: '2026',
            featured: true,
            hidden: false,
          };

          if (isSupabaseConfigured && supabase) {
            await supabase.from('portfolio_items').insert([{
              id: record.id,
              categoryid: record.categoryId,
              category: record.category,
              title: record.title,
              description: record.description,
              image: record.image,
              location: record.location,
              date: record.date,
              featured: record.featured,
              hidden: record.hidden,
            }]);
          }

          newRecords.push(record);
        }
      }

      // Update state & sync
      const updated = [...newRecords, ...portfolioItems];
      setPortfolioItems(updated);
      localStorage.setItem('chitrakatha_portfolio_items', JSON.stringify(updated));
      await broadcastRealtimeChange('portfolio_items', 'INSERT', newRecords);
      window.dispatchEvent(new Event('chitrakatha_data_updated'));

      showToast(`Successfully uploaded ${newRecords.length} photographs to "${matchedCat.name}"!`);
      setShowBatchUpload(false);
      setBatchFiles([]);
      setBatchDriveLinksText('');
    } catch (err) {
      console.error('Batch upload error:', err);
      alert('An error occurred during batch upload. Some items may have succeeded.');
    } finally {
      setBatchUploading(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (window.confirm('Delete this photograph?')) {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('portfolio_items').delete().eq('id', id);
      }
      const updated = portfolioItems.filter((p) => p.id !== id);
      setPortfolioItems(updated);
      localStorage.setItem('chitrakatha_portfolio_items', JSON.stringify(updated));
      await broadcastRealtimeChange('portfolio_items', 'DELETE', { id });
      window.dispatchEvent(new Event('chitrakatha_data_updated'));
      showToast('Photo removed from live gallery');
    }
  };

  // --- SERVICES CRUD ---
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.title || !newService.description) return;

    const cleanServiceImg = newService.image_url
      ? formatImageUrl(newService.image_url)
      : 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200';

    const record: Service = {
      id: `s-${Date.now()}`,
      title: newService.title!,
      slug: newService.slug || newService.title!.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: newService.description!,
      image_url: cleanServiceImg,
      sort_order: services.length + 1,
      hidden: false,
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('services').insert([record]);
    }
    const updated = [...services, record];
    setServices(updated);
    localStorage.setItem('chitrakatha_services', JSON.stringify(updated));
    await broadcastRealtimeChange('services', 'INSERT', record);
    window.dispatchEvent(new Event('chitrakatha_data_updated'));
    setShowAddService(false);
    setNewService({ title: '', slug: '', description: '', image_url: '', sort_order: 1 });
    showToast('Service added live!');
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Delete this service?')) {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('services').delete().eq('id', id);
      }
      const updated = services.filter((s) => s.id !== id);
      setServices(updated);
      localStorage.setItem('chitrakatha_services', JSON.stringify(updated));
      await broadcastRealtimeChange('services', 'DELETE', { id });
      window.dispatchEvent(new Event('chitrakatha_data_updated'));
      showToast('Service deleted');
    }
  };

  // --- FILMS CRUD ---
  const handleCreateFilm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilm.title || !newFilm.video_url) {
      alert('Please enter a Video Title and Video Link (YouTube or Google Drive).');
      return;
    }

    if (!isValidVideoLink(newFilm.video_url)) {
      alert('Please enter a valid YouTube or Google Drive video link (e.g. https://youtu.be/... or https://drive.google.com/file/d/...).');
      return;
    }

    const autoThumb = getAutoThumbnail(newFilm.video_url);
    const cleanThumb = newFilm.thumbnail_url
      ? formatImageUrl(newFilm.thumbnail_url)
      : (autoThumb || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200');

    const filmId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = (Math.random() * 16) | 0;
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        });
    const record: Film = {
      id: filmId,
      title: newFilm.title.trim(),
      description: newFilm.description?.trim() || '',
      thumbnail_url: cleanThumb,
      video_url: newFilm.video_url.trim(),
      category: newFilm.category?.trim() || 'Wedding Film',
      featured: newFilm.featured !== false,
    };

    if (isSupabaseConfigured && supabase) {
      const { error: insertError } = await supabase.from('films').insert([record]);
      if (insertError) {
        console.error('Failed to insert film in Supabase:', insertError);
      }
    }

    const updated = [record, ...films];
    setFilms(updated);
    localStorage.setItem('chitrakatha_films', JSON.stringify(updated));
    await broadcastRealtimeChange('films', 'INSERT', record);
    window.dispatchEvent(new Event('chitrakatha_data_updated'));
    setShowAddFilm(false);
    setNewFilm({
      title: '',
      description: '',
      thumbnail_url: '',
      video_url: '',
      category: 'Wedding Film',
      featured: true,
    });
    showToast(
      record.featured
        ? 'Cinematic film added and published live!'
        : 'Cinematic film saved as unpublished draft!'
    );
  };

  const handleUpdateFilm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFilm || !editingFilm.title || !editingFilm.video_url) {
      alert('Please enter a Video Title and Video Link (YouTube or Google Drive).');
      return;
    }

    if (!isValidVideoLink(editingFilm.video_url)) {
      alert('Please enter a valid YouTube or Google Drive video link (e.g. https://youtu.be/... or https://drive.google.com/file/d/...).');
      return;
    }

    const autoThumb = getAutoThumbnail(editingFilm.video_url);
    const cleanThumb = editingFilm.thumbnail_url
      ? formatImageUrl(editingFilm.thumbnail_url)
      : (autoThumb || 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200');

    const updatedRecord: Film = {
      ...editingFilm,
      title: editingFilm.title.trim(),
      description: editingFilm.description?.trim() || '',
      thumbnail_url: cleanThumb,
      video_url: editingFilm.video_url.trim(),
      category: editingFilm.category?.trim() || 'Wedding Film',
      featured: editingFilm.featured !== false,
    };

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('films')
        .update({
          title: updatedRecord.title,
          description: updatedRecord.description,
          thumbnail_url: updatedRecord.thumbnail_url,
          video_url: updatedRecord.video_url,
          category: updatedRecord.category,
          featured: updatedRecord.featured,
        })
        .eq('id', updatedRecord.id);
    }

    const updated = films.map((f) => (f.id === updatedRecord.id ? updatedRecord : f));
    setFilms(updated);
    localStorage.setItem('chitrakatha_films', JSON.stringify(updated));
    await broadcastRealtimeChange('films', 'UPDATE', updatedRecord);
    window.dispatchEvent(new Event('chitrakatha_data_updated'));
    setEditingFilm(null);
    showToast('Film details updated live!');
  };

  const handleToggleFilmFeatured = async (id: string, currentFeatured: boolean) => {
    const nextFeatured = !currentFeatured;
    if (isSupabaseConfigured && supabase) {
      await supabase.from('films').update({ featured: nextFeatured }).eq('id', id);
    }
    const updated = films.map((f) => (f.id === id ? { ...f, featured: nextFeatured } : f));
    setFilms(updated);
    localStorage.setItem('chitrakatha_films', JSON.stringify(updated));
    const targetFilm = updated.find((f) => f.id === id);
    if (targetFilm) {
      await broadcastRealtimeChange('films', 'UPDATE', targetFilm);
    }
    window.dispatchEvent(new Event('chitrakatha_data_updated'));
    showToast(nextFeatured ? 'Film published to live website!' : 'Film unpublished from live website.');
  };

  const handleDeleteFilm = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this film?')) {
      const targetFilm = films.find((f) => f.id === id);
      if (isSupabaseConfigured && supabase) {
        if (targetFilm?.video_url && targetFilm.video_url.includes('/storage/v1/object/public/films/')) {
          try {
            const rawPath = targetFilm.video_url.split('/storage/v1/object/public/films/')[1];
            if (rawPath) {
              await supabase.storage.from('films').remove([decodeURIComponent(rawPath)]);
            }
          } catch (stErr) {
            console.warn('Storage file deletion notice:', stErr);
          }
        }
        await supabase.from('films').delete().eq('id', id);
      }
      const updated = films.filter((f) => f.id !== id);
      setFilms(updated);
      localStorage.setItem('chitrakatha_films', JSON.stringify(updated));
      await broadcastRealtimeChange('films', 'DELETE', { id });
      window.dispatchEvent(new Event('chitrakatha_data_updated'));
      showToast('Film deleted from showcase.');
    }
  };

  const handleAddFilmCategory = (categoryName: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed) return;
    if (filmCategories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert(`Category "${trimmed}" already exists.`);
      return;
    }
    const updated = [...filmCategories, trimmed];
    setFilmCategories(updated);
    localStorage.setItem('chitrakatha_film_categories', JSON.stringify(updated));
    setNewCategoryInput('');
    setShowAddCategoryInput(false);
    if (showAddFilm) {
      setNewFilm((prev) => ({ ...prev, category: trimmed }));
    }
    if (editingFilm) {
      setEditingFilm((prev) => (prev ? { ...prev, category: trimmed } : null));
    }
    showToast(`Film category "${trimmed}" added!`);
  };

  const handleRemoveFilmCategory = (categoryToRemove: string) => {
    if (filmCategories.length <= 1) {
      alert('You must have at least one film category.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove category "${categoryToRemove}"?`)) {
      const updated = filmCategories.filter((c) => c !== categoryToRemove);
      setFilmCategories(updated);
      localStorage.setItem('chitrakatha_film_categories', JSON.stringify(updated));
      if (newFilm.category === categoryToRemove) {
        setNewFilm((prev) => ({ ...prev, category: updated[0] || 'Wedding Film' }));
      }
      if (editingFilm && editingFilm.category === categoryToRemove) {
        setEditingFilm((prev) => (prev ? { ...prev, category: updated[0] || 'Wedding Film' } : null));
      }
      showToast(`Category "${categoryToRemove}" removed.`);
    }
  };

  // --- BATCH / FOLDER VIDEO UPLOAD HANDLER ---
  const handleExecuteBatchVideoUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCategory = batchVideoCategory.trim() || 'Wedding Film';

    if (batchVideoUploadMode === 'files' && batchVideoFiles.length === 0) {
      alert('Please select at least one video file or folder of videos to upload.');
      return;
    }

    if (batchVideoUploadMode === 'links' && !batchVideoLinksText.trim()) {
      alert('Please paste at least one video link (YouTube or Google Drive).');
      return;
    }

    setBatchVideoUploading(true);
    const newRecords: Film[] = [];

    try {
      if (batchVideoUploadMode === 'files') {
        const total = batchVideoFiles.length;
        batchVideoCancelRef.current = false;
        setBatchVideoProgress({ current: 0, total, percent: 0, statusText: 'Starting direct video upload...' });

        // Upload all files concurrently (parallel)
        const uploadOneFile = async (file: File, i: number): Promise<Film | null> => {
          if (batchVideoCancelRef.current) return null;

          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
          const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          const catSlug = targetCategory.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const filePath = `films/${catSlug}/${Date.now()}-${i}-${cleanName}`;
          const filmId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = (Math.random() * 16) | 0;
                return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
              });

          // 1. Extract high-quality frame snapshot from the actual video file (< 200ms)
          const autoThumb = (await generateVideoThumbnail(file)) || getCategoryFallbackImage(targetCategory);

          let finalVideoUrl = URL.createObjectURL(file); // last-resort fallback

          // 3. Upload to local server with real XHR progress tracking
          try {
            const localUrl = await new Promise<string | null>((resolve) => {
              const xhr = new XMLHttpRequest();

              xhr.upload.onprogress = (ev) => {
                if (ev.lengthComputable) {
                  const filePercent = Math.round((ev.loaded / ev.total) * 100);
                  setBatchVideoProgress({
                    current: i + 1,
                    total,
                    percent: Math.round(((i + filePercent / 100) / total) * 100),
                    statusText: `[${i + 1}/${total}] 🚀 "${file.name}" — ${filePercent}% (${(ev.loaded / 1024 / 1024).toFixed(0)} MB / ${fileSizeMB} MB)`,
                  });
                }
              };

              xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  try {
                    const res = JSON.parse(xhr.responseText);
                    resolve(res?.url || null);
                  } catch { resolve(null); }
                } else {
                  resolve(null);
                }
              };
              xhr.onerror = () => resolve(null);

              xhr.open('POST', `/api/local-video-upload?filename=${encodeURIComponent(cleanName)}`);
              xhr.send(file);
            });

            if (localUrl) finalVideoUrl = localUrl;
          } catch (localErr) {
            console.warn('Local upload notice:', localErr);
          }

          // 4. Cloud sync for small files only
          if (isSupabaseConfigured && supabase && file.size <= 50 * 1024 * 1024) {
            try {
              const { error: uploadError } = await supabase.storage
                .from('films')
                .upload(filePath, file, { cacheControl: '31536000', upsert: true, contentType: file.type || 'video/mp4' });

              if (!uploadError) {
                const { data: publicUrlData } = supabase.storage.from('films').getPublicUrl(filePath);
                if (publicUrlData?.publicUrl) finalVideoUrl = publicUrlData.publicUrl;
              }
            } catch (cloudErr) {
              console.warn('Cloud upload error:', cloudErr);
            }
          }

          const record: Film = {
            id: filmId,
            title: cleanTitle || `${targetCategory} ${i + 1}`,
            description: `${targetCategory} 4K Cinema Collection`,
            thumbnail_url: autoThumb,
            video_url: finalVideoUrl,
            category: targetCategory,
            featured: true,
          };

          if (isSupabaseConfigured && supabase) {
            await supabase.from('films').insert([record]);
          }

          setBatchVideoProgress({
            current: i + 1,
            total,
            percent: Math.round(((i + 1) / total) * 100),
            statusText: `[${i + 1}/${total}] ✅ "${file.name}" (${fileSizeMB} MB) ready!`,
          });

          return record;
        };

        // Run all uploads in parallel
        setBatchVideoProgress({ current: 0, total, percent: 0, statusText: `🚀 Starting parallel upload of ${total} video(s)...` });
        const results = await Promise.all(
          batchVideoFiles.map((file, i) => uploadOneFile(file, i))
        );

        results.forEach((r) => { if (r) newRecords.push(r); });


      }


 else {
        // Mode: Links Batch Importer (YouTube & Drive)
        const lines = batchVideoLinksText
          .split(/[\n,;]+/)
          .map((s) => s.trim())
          .filter(Boolean);

        if (lines.length === 0) {
          alert('No valid video links found in the text box.');
          setBatchVideoUploading(false);
          return;
        }

        const total = lines.length;
        setBatchVideoProgress({ current: 0, total, percent: 0, statusText: 'Importing video links...' });

        for (let i = 0; i < total; i++) {
          const rawLink = lines[i];
          if (!isValidVideoLink(rawLink)) {
            continue;
          }

          const autoThumb = getAutoThumbnail(rawLink) || getCategoryFallbackImage(targetCategory);

          setBatchVideoProgress({
            current: i + 1,
            total,
            percent: Math.round(((i + 1) / total) * 100),
            statusText: `Adding video ${i + 1} of ${total}...`,
          });

          const filmId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = (Math.random() * 16) | 0;
                return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
              });
          const record: Film = {
            id: filmId,
            title: `${targetCategory} ${String(i + 1).padStart(2, '0')}`,
            description: `${targetCategory} 4K Cinematic Highlight`,
            thumbnail_url: autoThumb,
            video_url: rawLink,
            category: targetCategory,
            featured: true,
          };

          if (isSupabaseConfigured && supabase) {
            await supabase.from('films').insert([record]);
          }

          newRecords.push(record);
        }
      }

      const updated = [...newRecords, ...films];
      setFilms(updated);
      localStorage.setItem('chitrakatha_films', JSON.stringify(updated));
      await broadcastRealtimeChange('films', 'INSERT', newRecords);
      window.dispatchEvent(new Event('chitrakatha_data_updated'));

      showToast(`Successfully added ${newRecords.length} cinematic videos to "${targetCategory}"!`);
      setShowBatchVideoUpload(false);
      setBatchVideoFiles([]);
      setBatchVideoLinksText('');
    } catch (err) {
      console.error('Batch video upload error:', err);
      alert('An error occurred during video upload. Some items may have succeeded.');
    } finally {
      setBatchVideoUploading(false);
    }
  };

  // --- FAQ CRUD ---
  const handleCreateFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaq.question || !newFaq.answer) return;

    const record: FAQItem = {
      id: `faq-${Date.now()}`,
      question: newFaq.question!,
      answer: newFaq.answer!,
      sort_order: faqs.length + 1,
      published: true,
    };

    if (isSupabaseConfigured && supabase) {
      await supabase.from('faqs').insert([record]);
    }
    const updated = [...faqs, record];
    setFaqs(updated);
    localStorage.setItem('chitrakatha_faqs', JSON.stringify(updated));
    await broadcastRealtimeChange('faqs', 'INSERT', record);
    setShowAddFaq(false);
    setNewFaq({ question: '', answer: '', sort_order: 1, published: true });
    showToast('FAQ added to live website!');
  };

  const handleDeleteFaq = async (id: string) => {
    if (window.confirm('Delete this FAQ?')) {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('faqs').delete().eq('id', id);
      }
      const updated = faqs.filter((f) => f.id !== id);
      setFaqs(updated);
      localStorage.setItem('chitrakatha_faqs', JSON.stringify(updated));
      await broadcastRealtimeChange('faqs', 'DELETE', { id });
      showToast('FAQ deleted');
    }
  };

  // --- ENQUIRIES CRM ACTIONS ---
  const handleUpdateEnquiryStatus = async (id: string, newStatus: EnquiryStatus) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('enquiries').update({ status: newStatus }).eq('id', id);
    }
    const updated = enquiries.map((e) => (e.id === id ? { ...e, status: newStatus } : e));
    setEnquiries(updated);
    localStorage.setItem('chitrakatha_local_enquiries', JSON.stringify(updated));
    await broadcastRealtimeChange('enquiries', 'UPDATE', { id, status: newStatus });
    showToast(`Enquiry status changed to ${newStatus}`);
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (window.confirm('Delete this lead record?')) {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('enquiries').delete().eq('id', id);
      }
      const updated = enquiries.filter((e) => e.id !== id);
      setEnquiries(updated);
      localStorage.setItem('chitrakatha_local_enquiries', JSON.stringify(updated));
      await broadcastRealtimeChange('enquiries', 'DELETE', { id });
      showToast('Lead deleted');
    }
  };

  // Calculated Metrics
  const totalBookings = enquiries.length;
  const confirmedShoots = enquiries.filter((e) => e.status === 'confirmed').length;
  const unreadEnquiries = enquiries.filter((e) => e.status === 'new').length;

  const filteredEnquiries = useMemo(() => {
    let list = enquiries;
    if (enquiryFilter !== 'all') {
      list = list.filter((e) => e.status === enquiryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.full_name.toLowerCase().includes(q) ||
          e.phone.includes(q) ||
          e.event_type.toLowerCase().includes(q) ||
          (e.location && e.location.toLowerCase().includes(q)) ||
          (e.custom_id && e.custom_id.toLowerCase().includes(q))
      );
    }
    return list;
  }, [enquiries, enquiryFilter, searchQuery]);

  // Sidebar Menu Items matching the exact screenshot
  const menuItems = [
    { id: 'overview' as AdminTab, label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'homepage' as AdminTab, label: 'Homepage Editor', icon: Home },
    { id: 'about' as AdminTab, label: 'About Page', icon: User },
    { id: 'services' as AdminTab, label: 'Services Manager', icon: Briefcase },
    { id: 'portfolio' as AdminTab, label: 'Portfolio Gallery', icon: ImageIcon },
    { id: 'drone' as AdminTab, label: 'Drone Showcase', icon: Radio },
    { id: 'films' as AdminTab, label: 'Videos & Films', icon: Video },
    { id: 'bookings' as AdminTab, label: 'Bookings & Leads', icon: Calendar, badge: 'NEW' },
    { id: 'faqs' as AdminTab, label: 'FAQ Manager', icon: HelpCircle },
  ];

  // If not logged in, render authentication modal
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#161616] border border-neutral-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <img
                src="/images/chitrakatha-logo.png"
                alt="चित्रकथा Chitrakatha by Hemant"
                className="h-12 w-auto object-contain brightness-100 contrast-125 mx-auto"
              />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide">Studio Admin</h2>
            <p className="text-xs text-neutral-400 font-light">
              Chitrakatha by Hemant Mandawade Management Portal
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-xs text-red-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clicksbyhemant5564@gmail.com"
                required
                className="w-full px-4 py-3 rounded-lg bg-[#0E0E0E] border border-neutral-700 text-sm text-white focus:outline-none focus:border-[#8B0000]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-lg bg-[#0E0E0E] border border-neutral-700 text-sm text-white focus:outline-none focus:border-[#8B0000]"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] text-white text-xs font-semibold uppercase tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              {authLoading ? <Loader2 size={16} className="animate-spin" /> : 'Log In with Supabase'}
            </button>
          </form>

          <div className="pt-4 border-t border-neutral-800 text-center">
            <button
              onClick={() => onNavigatePage('home')}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              <ArrowRight size={13} className="rotate-180" />
              <span>Back to Chitrakatha Website</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0E0E0E] text-white flex flex-col font-sans overflow-hidden">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-[#121212] border-b border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        {/* Left Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Dashboard Search (Bookings, Portfolio, FAQs)..."
            className="w-full bg-[#1A1A1A] text-neutral-200 text-xs rounded-full pl-10 pr-4 py-2 border border-neutral-800 focus:outline-none focus:border-neutral-600 placeholder-neutral-500"
          />
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* REFRESH DATA CTA */}
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await loadAllData();
              setTimeout(() => setIsRefreshing(false), 400);
              showToast('Refreshed latest data from database!');
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#252525] border border-neutral-700 text-neutral-200 text-xs font-medium transition-colors shadow-sm"
            title="Reload all bookings & updates from database"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-amber-400' : 'text-neutral-400'} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>

          {/* VIEW SITE CTA */}
          <button
            onClick={() => onNavigatePage('home')}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1A1A1A] hover:bg-[#252525] border border-neutral-700 text-neutral-200 text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
          >
            <span>VIEW SITE</span>
            <ExternalLink size={13} />
          </button>

          {/* Notification Bell */}
          <div className="relative p-2 text-neutral-400 hover:text-white cursor-pointer transition-colors">
            <Bell size={17} />
            {unreadEnquiries > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            )}
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-800">
            <div className="w-8 h-8 rounded-full bg-[#8B0000] text-white flex items-center justify-center font-semibold text-xs shadow">
              HM
            </div>
            <div className="hidden sm:block text-left leading-none">
              <span className="text-xs font-medium text-white block">Hemant Mandawade</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Layout with Fixed Locked Sidebar + Scrollable Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Permanently Locked in Place */}
        <aside className="w-64 bg-[#121212] border-r border-neutral-800 flex flex-col justify-between p-4 shrink-0 overflow-y-auto h-full select-none">
          <div className="space-y-6">
            {/* Top Brand Block */}
            <div className="px-2 py-2 flex items-center gap-3">
              <img
                src="/images/chitrakatha-logo.png"
                alt="चित्रकथा Chitrakatha"
                className="h-8 w-auto object-contain brightness-100"
              />
              <div className="flex flex-col">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest bg-[#8B0000] text-white w-max">
                  CMS PORTAL
                </span>
                <span className="text-[10px] text-neutral-400 font-medium tracking-wide mt-0.5">
                  Admin Panel
                </span>
              </div>
            </div>

            {/* Navigation Menu Tabs */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#8B0000] text-white font-semibold shadow-md'
                        : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className={isActive ? 'text-white' : 'text-neutral-400'} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#EAB308] text-black">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Profile and Sign Out Block */}
          <div className="pt-4 border-t border-neutral-800 space-y-3">
            <div className="flex items-center gap-2.5 px-2">
              <div className="w-8 h-8 rounded-full bg-[#8B0000] text-white flex items-center justify-center font-bold text-xs">
                H
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-white truncate">Hemant Mandawade</p>
                <p className="text-[10px] text-neutral-400 truncate">clicksbyhemant5564@gmail.com</p>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full py-2 px-3 rounded-lg border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Center Content Workspace */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#0E0E0E] space-y-8">
          {/* Action Feedback Toast */}
          {actionSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/90 border border-emerald-600 text-white text-xs font-medium flex items-center gap-2 shadow-lg animate-fade-in">
              <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* TAB 1: DASHBOARD OVERVIEW (Exact Screenshot UI) */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Header Title + System Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal">
                    Welcome back, Hemant
                  </h1>
                  <p className="text-neutral-400 text-xs sm:text-sm font-light mt-1">
                    Overview of Chitrakatha website traffic, lead enquiries, storage & shoot calendar
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 self-start sm:self-auto bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-800/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>System Online & Live</span>
                </div>
              </div>

              {/* 4 Metric / KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* 1. Website Visits */}
                <div className="bg-[#161616] p-6 rounded-2xl border border-neutral-800 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                      TOTAL WEBSITE VISITS
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-400 flex items-center justify-center">
                      <Users size={16} />
                    </div>
                  </div>
                  <p className="font-serif text-3xl sm:text-4xl font-semibold text-white">0</p>
                  <p className="text-[11px] text-neutral-500">0% growth this month</p>
                </div>

                {/* 2. Total Booking Requests */}
                <div className="bg-[#161616] p-6 rounded-2xl border border-neutral-800 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                      TOTAL BOOKING REQUESTS
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-800/40 text-[#8B0000] flex items-center justify-center">
                      <Calendar size={16} />
                    </div>
                  </div>
                  <p className="font-serif text-3xl sm:text-4xl font-semibold text-white">
                    {totalBookings}
                  </p>
                  <p className="text-[11px] text-amber-400 font-medium">
                    {unreadEnquiries} New Unread Enquiries
                  </p>
                </div>

                {/* 3. Confirmed Shoots */}
                <div className="bg-[#161616] p-6 rounded-2xl border border-neutral-800 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                      CONFIRMED SHOOTS
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 size={16} />
                    </div>
                  </div>
                  <p className="font-serif text-3xl sm:text-4xl font-semibold text-white">
                    {confirmedShoots}
                  </p>
                  <p className="text-[11px] text-neutral-500">Scheduled Across MH</p>
                </div>

                {/* 4. Storage Usage */}
                <div className="bg-[#161616] p-6 rounded-2xl border border-neutral-800 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">
                      STORAGE USAGE
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 flex items-center justify-center">
                      <HardDrive size={16} />
                    </div>
                  </div>
                  <p className="font-serif text-3xl sm:text-4xl font-semibold text-white">0 MB</p>
                  <p className="text-[11px] text-neutral-500">of 5.0 GB Cloud Capacity</p>
                </div>
              </div>

              {/* Recent Lead Enquiries Table Card */}
              <div className="bg-[#161616] rounded-2xl border border-neutral-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-400" />
                    <h3 className="font-serif text-lg font-medium text-white">
                      Recent Lead Enquiries (Latest 10)
                    </h3>
                  </div>
                  <span className="text-xs text-neutral-500 font-mono">
                    {enquiries.length} Enquiries Streamed
                  </span>
                </div>

                {filteredEnquiries.length === 0 ? (
                  <div className="p-12 text-center text-neutral-500 text-xs">
                    No lead enquiries found.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-neutral-300">
                      <thead className="bg-[#121212] text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                        <tr>
                          <th className="px-6 py-3.5">ID</th>
                          <th className="px-6 py-3.5">CUSTOMER</th>
                          <th className="px-6 py-3.5">SERVICE REQUIRED</th>
                          <th className="px-6 py-3.5">SHOOT DATE</th>
                          <th className="px-6 py-3.5">STATUS</th>
                          <th className="px-6 py-3.5 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/60">
                        {filteredEnquiries.slice(0, 10).map((enq) => {
                          const waUrl = createWhatsAppLink(
                            enq.phone,
                            `Hi ${enq.full_name}, thank you for contacting Chitrakatha for your ${enq.event_type} shoot. Hemant Mandawade here!`
                          );

                          return (
                            <tr key={enq.id} className="hover:bg-neutral-800/30 transition-colors">
                              <td className="px-6 py-4 font-mono font-semibold text-amber-400">
                                {enq.custom_id || `ENQ-${enq.id?.slice(0, 4) || '1001'}`}
                              </td>

                              <td className="px-6 py-4">
                                <div className="font-medium text-white text-sm">{enq.full_name}</div>
                                <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                                  <span>{enq.phone}</span>
                                  {enq.location && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-0.5">
                                        <MapPin size={10} className="text-[#8B0000]" /> {enq.location}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </td>

                              <td className="px-6 py-4 font-medium text-neutral-200">
                                {enq.event_type}
                              </td>

                              <td className="px-6 py-4 font-mono text-neutral-300">
                                {enq.event_date || 'TBD'}
                              </td>

                              <td className="px-6 py-4">
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                                    enq.status === 'confirmed'
                                      ? 'bg-emerald-950 border border-emerald-600 text-emerald-400'
                                      : enq.status === 'contacted'
                                      ? 'bg-blue-950 border border-blue-600 text-blue-400'
                                      : enq.status === 'new'
                                      ? 'bg-red-950 border border-red-600 text-red-400'
                                      : 'bg-neutral-800 text-neutral-300'
                                  }`}
                                >
                                  {enq.status || 'New'}
                                </span>
                              </td>

                              <td className="px-6 py-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <a
                                    href={`tel:${enq.phone}`}
                                    className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                                    title="Call client"
                                  >
                                    <Phone size={13} />
                                  </a>
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 transition-colors"
                                    title="WhatsApp Reply"
                                  >
                                    <MessageSquare size={13} />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HOMEPAGE EDITOR */}
          {activeTab === 'homepage' && (
            <form onSubmit={handleSaveSettings} className="bg-[#161616] p-8 rounded-2xl border border-neutral-800 space-y-8">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white">Homepage Content Editor</h2>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">
                    Modify hero text, buttons, header branding, and red CTA banner. Updates reflect immediately on live site.
                  </p>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] text-white text-xs font-semibold uppercase tracking-wider shadow"
                >
                  <Save size={15} />
                  <span>Save Changes Live</span>
                </button>
              </div>

              {/* Branding Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 border-b border-neutral-800 pb-1">
                  1. Header & Brand Identity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Marathi Logo Mark</label>
                    <input
                      type="text"
                      value={settings.marathi_brand_mark}
                      onChange={(e) => setSettings({ ...settings, marathi_brand_mark: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={settings.brand_name}
                      onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Sub-brand Text</label>
                    <input
                      type="text"
                      value={settings.sub_brand_text}
                      onChange={(e) => setSettings({ ...settings, sub_brand_text: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Studio Phone</label>
                    <input
                      type="text"
                      value={settings.phone_number}
                      onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Email</label>
                    <input
                      type="email"
                      value={settings.email_address}
                      onChange={(e) => setSettings({ ...settings, email_address: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Hero Section */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 border-b border-neutral-800 pb-1">
                  2. Hero Intro Copy & Background
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Hero Title</label>
                    <input
                      type="text"
                      value={settings.hero_title}
                      onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Hero Tagline</label>
                    <input
                      type="text"
                      value={settings.hero_tagline}
                      onChange={(e) => setSettings({ ...settings, hero_tagline: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-400 block mb-1">Hero Description</label>
                  <textarea
                    rows={2}
                    value={settings.hero_description}
                    onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white resize-none"
                  />
                </div>

                {/* HERO BACKGROUND VIDEO CMS SECTION */}
                <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-neutral-800 space-y-6 shadow-xl">
                  {/* Top Bar with Status & Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-serif text-lg font-medium text-white">
                          Current Hero Background Video
                        </h4>
                        {/* Video Status Badge */}
                        {settings.hero_video_enabled !== false && settings.hero_video_url ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-950/80 border border-emerald-500 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-neutral-800 border border-neutral-700 text-neutral-400">
                            <span className="w-2 h-2 rounded-full bg-neutral-500" />
                            INACTIVE (FALLBACK BACKGROUND)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 font-light mt-1">
                        Full-screen autoplaying cinematic background video for the public Hero page.
                      </p>
                    </div>

                    {/* Action Buttons: Publish, Unpublish, Replace */}
                    <div className="flex flex-wrap items-center gap-2">
                      {settings.hero_video_enabled !== false && settings.hero_video_url ? (
                        <button
                          type="button"
                          onClick={handleUnpublishHeroVideo}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 text-xs font-semibold uppercase tracking-wider border border-amber-800/80 transition-colors shadow-sm"
                        >
                          <span>Unpublish Video</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePublishHeroVideo()}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider border border-emerald-700 transition-colors shadow-sm"
                        >
                          <Check size={14} />
                          <span>Publish as Hero Background</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2-Column Layout: Left Video Player Preview (7 cols) + Right Upload & Settings (5 cols) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: 16:9 Video Player Preview with live floating text preview */}
                    <div className="lg:col-span-7 space-y-3">
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[11px]">
                          Live Background Preview
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {settings.hero_video_enabled !== false && settings.hero_video_url
                            ? '● Playing in Loop (Muted)'
                            : '○ Fallback Static Dark Layer'}
                        </span>
                      </div>

                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-neutral-700 shadow-2xl flex items-center justify-center text-center group">
                        {settings.hero_video_enabled !== false && settings.hero_video_url ? (
                          <>
                            <video
                              key={settings.hero_video_url}
                              src={settings.hero_video_url}
                              autoPlay
                              loop
                              muted
                              playsInline
                              preload="metadata"
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Dark Transparent Overlay Preview */}
                            <div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                backgroundColor: `rgba(0, 0, 0, ${((settings.hero_video_opacity ?? 45) / 100).toFixed(2)})`,
                              }}
                            />
                          </>
                        ) : (
                          <div className="absolute inset-0 bg-[#0E0E0E] flex items-center justify-center">
                            <div className="p-4 text-center space-y-1">
                              <p className="text-xs text-neutral-400 font-medium">
                                Video is currently Unpublished / Inactive
                              </p>
                              <p className="text-[10px] text-neutral-600">
                                Clean dark background is active for website visitors.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Floating Text Overlay Simulation */}
                        <div className="relative z-10 p-4 max-w-sm mx-auto space-y-2 pointer-events-none drop-shadow-lg">
                          <span className="inline-block px-3 py-0.5 rounded-full bg-black/60 border border-amber-500/40 text-amber-300 text-[9px] font-semibold uppercase tracking-wider">
                            LUXURY PHOTOGRAPHY
                          </span>
                          <h5 className="font-serif text-2xl font-normal text-white uppercase tracking-wider">
                            CHITRAKATHA
                          </h5>
                          <div className="flex items-center justify-center gap-2 pt-1">
                            <span className="px-3 py-1 rounded-full bg-white text-black text-[9px] font-bold">
                              VIEW PORTFOLIO
                            </span>
                            <span className="px-3 py-1 rounded-full bg-[#8B0000] text-white text-[9px] font-bold">
                              BOOK NOW
                            </span>
                          </div>
                        </div>

                        {/* Status Watermark */}
                        <span className="absolute bottom-2 right-3 text-[9px] bg-black/80 backdrop-blur-md px-2 py-0.5 rounded text-neutral-300 font-mono border border-neutral-700">
                          {settings.hero_video_enabled !== false && settings.hero_video_url
                            ? 'HERO LIVE'
                            : 'FALLBACK'}
                        </span>
                      </div>
                    </div>

                    {/* Right: Drag & Drop Upload Zone + Presets + Controls */}
                    <div className="lg:col-span-5 space-y-4">
                      {/* Drag & Drop Upload Box */}
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingVideo(true);
                        }}
                        onDragLeave={() => setIsDraggingVideo(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingVideo(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file) handleUploadHeroVideo(file);
                        }}
                        className={`relative p-6 rounded-2xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-2.5 ${
                          isDraggingVideo
                            ? 'border-amber-400 bg-amber-950/20'
                            : 'border-neutral-700 hover:border-neutral-500 bg-[#141414]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-[#1F1F1F] text-amber-400 border border-neutral-700 flex items-center justify-center">
                          {videoUploading ? (
                            <Loader2 size={18} className="animate-spin text-amber-400" />
                          ) : (
                            <UploadCloud size={20} />
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-white">
                            {videoUploading
                              ? `Uploading to Supabase Storage (${uploadProgress}%)...`
                              : 'Drag & Drop Video Here, or Browse'}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-light mt-0.5">
                            Supports MP4, WebM, MOV (up to 100MB, 1080p recommended)
                          </p>
                        </div>

                        {videoUploading && (
                          <div className="w-full max-w-xs bg-neutral-800 rounded-full h-1.5 mt-2 overflow-hidden">
                            <div
                              className="bg-amber-400 h-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}

                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 mt-1 rounded-full bg-[#242424] hover:bg-[#303030] text-white text-xs font-semibold uppercase tracking-wider border border-neutral-600 transition-colors shadow-sm">
                          <span>Browse Video File</span>
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime,video/ogg"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadHeroVideo(file);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Direct Video URL Input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-neutral-300 block">
                          Or Paste Direct Video URL (.mp4)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={settings.hero_video_url || ''}
                            onChange={(e) =>
                              setSettings({ ...settings, hero_video_url: e.target.value })
                            }
                            placeholder="https://your-domain.com/hero-video.mp4"
                            className="flex-1 px-3 py-2 text-xs rounded-xl bg-[#141414] border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#8B0000]"
                          />
                          <button
                            type="button"
                            onClick={() => handlePublishHeroVideo()}
                            className="px-3 py-2 rounded-xl bg-[#8B0000] hover:bg-[#A61C1C] text-white text-xs font-semibold uppercase transition-colors shrink-0"
                            title="Save & Publish"
                          >
                            Apply
                          </button>
                        </div>
                      </div>

                      {/* Dark Overlay Opacity Slider */}
                      <div className="p-3.5 rounded-xl bg-[#141414] border border-neutral-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-neutral-300">
                          <span className="text-[11px] font-medium">Dark Transparent Overlay</span>
                          <span className="font-mono font-bold text-amber-400">
                            {settings.hero_video_opacity ?? 45}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="95"
                          step="5"
                          value={settings.hero_video_opacity ?? 45}
                          onChange={(e) => handleOpacityChange(Number(e.target.value))}
                          className="w-full accent-[#8B0000] cursor-pointer"
                        />
                        <p className="text-[10px] text-neutral-500 font-light">
                          Controls the transparent dark overlay so title & buttons remain 100% readable.
                        </p>
                      </div>

                      {/* Sample Cinematic Preset Library */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block">
                          1-Click Cinematic Presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handlePublishHeroVideo(
                                'https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-in-a-forest-41584-large.mp4'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white text-[10px] font-medium border border-neutral-700 transition-colors"
                          >
                            🌲 Forest Couple Walk
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handlePublishHeroVideo(
                                'https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-walking-in-the-countryside-41588-large.mp4'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white text-[10px] font-medium border border-neutral-700 transition-colors"
                          >
                            🌅 Golden Hour Countryside
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handlePublishHeroVideo(
                                'https://assets.mixkit.co/videos/preview/mixkit-bride-and-groom-walking-together-in-nature-41582-large.mp4'
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-[#1F1F1F] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white text-[10px] font-medium border border-neutral-700 transition-colors"
                          >
                            🏰 Royal Outdoor Romance
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Red CTA Section */}
              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300 border-b border-neutral-800 pb-1">
                  3. Deep Red CTA Banner Section
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Banner Heading</label>
                    <input
                      type="text"
                      value={settings.cta_heading}
                      onChange={(e) => setSettings({ ...settings, cta_heading: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Banner Subtitle</label>
                    <input
                      type="text"
                      value={settings.cta_subtitle}
                      onChange={(e) => setSettings({ ...settings, cta_subtitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] text-white text-xs font-semibold uppercase tracking-wider shadow-lg"
                >
                  Save Homepage Changes Live
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: ABOUT PAGE */}
          {activeTab === 'about' && (
            <form onSubmit={handleSaveSettings} className="bg-[#161616] p-8 rounded-2xl border border-neutral-800 space-y-8">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white">About & Trust Section Editor</h2>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">
                    Update Founder credentials, live stats, mission, vision, and coverage.
                  </p>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] text-white text-xs font-semibold uppercase tracking-wider shadow"
                >
                  <Save size={15} />
                  <span>Save Changes Live</span>
                </button>
              </div>

              {/* 1. Artist & Founder Profile Image Manager */}
              <div className="p-6 rounded-2xl bg-[#0E0E0E] border border-neutral-800 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
                  <div>
                    <h3 className="font-serif text-lg font-medium text-white">
                      Artist & Founder Portrait Image
                    </h3>
                    <p className="text-xs text-neutral-400 font-light mt-0.5">
                      This photo is featured on the homepage in <em>Behind The Lens</em> and the Instagram profile avatar.
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white text-xs font-semibold uppercase tracking-wider border border-neutral-700 transition-colors shadow-sm">
                      <Upload size={13} className="text-amber-400" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFounderImageUpload}
                        className="hidden"
                      />
                    </label>

                    {settings.founder_image_url && (
                      <button
                        type="button"
                        onClick={() => {
                          setSettings({ ...settings, founder_image_url: '' });
                          showToast('Profile image cleared! Click Save to apply.');
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-950/60 hover:bg-red-900/80 text-red-300 text-xs font-semibold uppercase tracking-wider border border-red-800/80 transition-colors shadow-sm"
                      >
                        <Trash2 size={13} />
                        <span>Remove</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSettings({
                          ...settings,
                          founder_image_url:
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=800',
                        });
                        showToast('Reset to default portrait! Click Save to apply.');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#1F1F1F] hover:bg-[#2A2A2A] text-neutral-300 hover:text-white text-xs font-semibold border border-neutral-700 transition-colors"
                      title="Reset to default portrait"
                    >
                      <RefreshCw size={13} />
                      <span>Default</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Left Live Preview Frame (4 cols) */}
                  <div className="md:col-span-4 flex justify-center">
                    <div className="relative aspect-[3/4] w-48 rounded-2xl overflow-hidden shadow-xl border-2 border-neutral-700 bg-neutral-900 group">
                      <img
                        src={
                          settings.founder_image_url ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=85&w=800'
                        }
                        alt={settings.founder_name || 'Hemant Mandawade'}
                        className="w-full h-full object-cover object-top"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="block text-[8px] font-bold uppercase tracking-wider bg-black/80 text-amber-400 px-2 py-1 rounded text-center border border-amber-500/30">
                          {settings.founder_title || 'FOUNDER & LEAD PHOTOGRAPHER'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right URL & Settings (8 cols) */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-neutral-300 block">
                        Direct Image URL or CDN Link
                      </label>
                      <input
                        type="url"
                        value={settings.founder_image_url || ''}
                        onChange={(e) =>
                          setSettings({ ...settings, founder_image_url: e.target.value })
                        }
                        placeholder="https://images.unsplash.com/... or paste image link"
                        className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#161616] border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#8B0000]"
                      />
                      <p className="text-[11px] text-neutral-500 font-light">
                        Tip: You can click <strong>"Upload Photo"</strong> above to pick any file from your computer, or paste any image URL here.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Text Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-neutral-400 block mb-1">Founder Name</label>
                  <input
                    type="text"
                    value={settings.founder_name}
                    onChange={(e) => setSettings({ ...settings, founder_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-400 block mb-1">Founder Title</label>
                  <input
                    type="text"
                    value={settings.founder_title}
                    onChange={(e) => setSettings({ ...settings, founder_title: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-400 block mb-1">Experience Badge</label>
                  <input
                    type="text"
                    value={settings.experience_badge}
                    onChange={(e) => setSettings({ ...settings, experience_badge: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                  />
                </div>
              </div>

              {/* 4 Live Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-800">
                <div>
                  <label className="text-xs font-medium text-neutral-400 block mb-1">Weddings & Shoots</label>
                  <input
                    type="text"
                    value={settings.stat_weddings}
                    onChange={(e) => setSettings({ ...settings, stat_weddings: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-400 block mb-1">Cinematic Films</label>
                  <input
                    type="text"
                    value={settings.stat_films}
                    onChange={(e) => setSettings({ ...settings, stat_films: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-400 block mb-1">Cities in Maharashtra</label>
                  <input
                    type="text"
                    value={settings.stat_cities}
                    onChange={(e) => setSettings({ ...settings, stat_cities: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-400 block mb-1">Client Satisfaction %</label>
                  <input
                    type="text"
                    value={settings.stat_satisfaction}
                    onChange={(e) => setSettings({ ...settings, stat_satisfaction: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                  />
                </div>
              </div>

              {/* Mission / Vision / Coverage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-800">
                <div>
                  <label className="text-xs font-medium text-neutral-400 block mb-1">Our Mission</label>
                  <textarea
                    rows={3}
                    value={settings.mission_text}
                    onChange={(e) => setSettings({ ...settings, mission_text: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-400 block mb-1">Our Vision</label>
                  <textarea
                    rows={3}
                    value={settings.vision_text}
                    onChange={(e) => setSettings({ ...settings, vision_text: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-400 block mb-1">Service Coverage</label>
                  <textarea
                    rows={3}
                    value={settings.coverage_text}
                    onChange={(e) => setSettings({ ...settings, coverage_text: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] text-white text-xs font-semibold uppercase tracking-wider shadow-lg"
                >
                  Save About Section Changes Live
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: SERVICES MANAGER */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white">Signature Services Manager</h2>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">
                    Add, edit, and reorder photography & cinematography services.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddService(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8B0000] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A61C1C] transition-colors"
                >
                  <Plus size={15} />
                  <span>Add Service</span>
                </button>
              </div>

              {showAddService && (
                <form onSubmit={handleCreateService} className="bg-[#161616] p-6 rounded-2xl border border-neutral-800 space-y-4 animate-fade-in">
                  <h3 className="font-serif text-lg font-medium text-white">Add New Service</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-400 block mb-1">Service Title *</label>
                      <input
                        type="text"
                        value={newService.title}
                        onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                        required
                        placeholder="e.g. Pre-Wedding Cinema"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-400 block mb-1">Image URL</label>
                      <input
                        type="url"
                        value={newService.image_url}
                        onChange={(e) => setNewService({ ...newService, image_url: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Description *</label>
                    <textarea
                      rows={2}
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      required
                      placeholder="Service details and client deliverables..."
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-2 rounded-full bg-[#8B0000] text-white text-xs font-semibold uppercase tracking-wider">
                      Save Service
                    </button>
                    <button type="button" onClick={() => setShowAddService(false)} className="px-4 py-2 text-xs text-neutral-400">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((srv) => (
                  <div key={srv.id} className="bg-[#161616] p-4 rounded-xl border border-neutral-800 space-y-3">
                    {srv.image_url && (
                      <div className="aspect-video rounded-lg overflow-hidden relative">
                        <img src={formatImageUrl(srv.image_url)} alt={srv.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-serif text-lg font-medium text-white">{srv.title}</h4>
                      <p className="text-xs text-neutral-400 font-light mt-1 line-clamp-2">{srv.description}</p>
                    </div>

                    <div className="pt-2 border-t border-neutral-800 flex justify-end">
                      <button onClick={() => handleDeleteService(srv.id)} className="text-neutral-400 hover:text-red-500 p-1">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PORTFOLIO GALLERY */}
          {activeTab === 'portfolio' && (
            <div className="space-y-8">
              {/* Category Albums Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white">Portfolio Categories & Albums</h2>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">
                    Manage 12 category albums (Wedding, Pre-Wedding, Engagement, Baby Shoot, Drone, etc.).
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setBatchCategory(categories[0]?.id || '');
                      setBatchFiles([]);
                      setBatchDriveLinksText('');
                      setShowBatchUpload(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8B0000] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A61C1C] transition-colors shadow-md"
                  >
                    <FolderUp size={15} />
                    <span>Upload Folder / Bulk</span>
                  </button>

                  <button
                    onClick={() => setShowAddPhoto(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-700 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Single Photo</span>
                  </button>

                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-700 transition-colors"
                  >
                    <Plus size={14} />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>

              {/* BATCH / FOLDER PHOTO UPLOAD MODAL */}
              {showBatchUpload && (
                <form
                  onSubmit={handleExecuteBatchUpload}
                  className="bg-[#161616] p-6 rounded-2xl border border-amber-600/50 space-y-5 animate-fade-in shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FolderUp size={20} className="text-amber-400" />
                      <div>
                        <h3 className="font-serif text-lg font-medium text-white">
                          Upload Folder / Bulk Photos (Category-Wise)
                        </h3>
                        <p className="text-[11px] text-neutral-400 font-light">
                          Select an entire folder from your device or paste multiple Google Drive links.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={batchUploading}
                      onClick={() => setShowBatchUpload(false)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Step 1: Choose Target Category Album */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-300 block mb-1">
                        Target Category Album *
                      </label>
                      <select
                        value={batchCategory}
                        onChange={(e) => setBatchCategory(e.target.value)}
                        disabled={batchUploading}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white focus:outline-none focus:border-[#8B0000]"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            📁 {c.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-neutral-500 font-light mt-1">
                        All uploaded photographs will be automatically assigned to this category album.
                      </p>
                    </div>

                    {/* Step 2: Upload Method Tabs */}
                    <div>
                      <label className="text-xs font-medium text-neutral-300 block mb-1">
                        Upload Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={batchUploading}
                          onClick={() => setBatchUploadMode('files')}
                          className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                            batchUploadMode === 'files'
                              ? 'bg-[#8B0000] border-[#8B0000] text-white shadow-sm'
                              : 'bg-[#0E0E0E] border-neutral-700 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <Folder size={13} />
                          <span>Device Folder / Files</span>
                        </button>
                        <button
                          type="button"
                          disabled={batchUploading}
                          onClick={() => setBatchUploadMode('links')}
                          className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                            batchUploadMode === 'links'
                              ? 'bg-[#8B0000] border-[#8B0000] text-white shadow-sm'
                              : 'bg-[#0E0E0E] border-neutral-700 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <UploadCloud size={13} />
                          <span>Drive Links (Batch)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mode A: Local Folder / Files Upload Area */}
                  {batchUploadMode === 'files' ? (
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-neutral-700 hover:border-amber-500/60 rounded-xl p-6 text-center bg-[#0E0E0E]/80 space-y-3 transition-colors">
                        <FolderPlus size={32} className="mx-auto text-amber-400/80" />
                        <div>
                          <p className="text-xs text-white font-medium">
                            Choose an entire folder of photos or select multiple files
                          </p>
                          <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                            Supports JPG, PNG, WEBP, and high-resolution camera exports.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          {/* Folder Picker */}
                          <label className="cursor-pointer px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors inline-flex items-center gap-1.5">
                            <FolderUp size={14} className="text-amber-400" />
                            <span>Select Entire Folder</span>
                            <input
                              type="file"
                              multiple
                              {...({ webkitdirectory: '', directory: '' } as any)}
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  const filesArray = Array.from(e.target.files).filter((f) =>
                                    f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif)$/i.test(f.name)
                                  );
                                  setBatchFiles(filesArray);
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          {/* Multiple Files Picker */}
                          <label className="cursor-pointer px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors inline-flex items-center gap-1.5">
                            <Upload size={14} className="text-emerald-400" />
                            <span>Select Multiple Files</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  setBatchFiles(Array.from(e.target.files));
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Selected Files Count & Preview */}
                      {batchFiles.length > 0 && (
                        <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-white font-medium">
                              {batchFiles.length} {batchFiles.length === 1 ? 'photo' : 'photos'} ready to upload
                            </span>
                            <span className="text-neutral-500 text-[11px] hidden sm:inline">
                              (Total size: {(batchFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBatchFiles([])}
                            className="text-neutral-400 hover:text-red-400 text-xs"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Mode B: Multiple Drive Links Batch Input */
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-neutral-300 block">
                        Paste Google Drive / Direct Image Links (One link per line) *
                      </label>
                      <textarea
                        rows={5}
                        value={batchDriveLinksText}
                        onChange={(e) => setBatchDriveLinksText(e.target.value)}
                        placeholder={`https://drive.google.com/file/d/1cAZHQE7MXXdIpJlQo7czfeJSzFrvLVS2/view\nhttps://drive.google.com/file/d/1lG3xOb8tGT2XJooKNYrU2W6opt7nYb6m/view\nhttps://drive.google.com/file/d/16ZJM7SjqOuJuUdOdFfwpYcFCSmvVrFCI/view`}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-[#8B0000] resize-y"
                      />
                      <p className="text-[11px] text-neutral-500 font-light">
                        💡 Tip: You can paste 5, 20, or 50+ Google Drive sharing links at once. Each link will be automatically converted to high-speed CDN and saved category-wise.
                      </p>
                    </div>
                  )}

                  {/* Progress Indicator */}
                  {batchUploading && (
                    <div className="p-4 bg-neutral-900 rounded-xl border border-amber-600/40 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white font-medium flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin text-amber-400" />
                          <span>{batchProgress.statusText || 'Processing batch upload...'}</span>
                        </span>
                        <span className="font-mono text-amber-400 font-bold">{batchProgress.percent}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#8B0000] h-full transition-all duration-300 rounded-full"
                          style={{ width: `${batchProgress.percent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={
                        batchUploading ||
                        (batchUploadMode === 'files' ? batchFiles.length === 0 : !batchDriveLinksText.trim())
                      }
                      className="px-6 py-2.5 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] disabled:bg-neutral-800 disabled:text-neutral-500 text-white text-xs font-semibold uppercase tracking-wider shadow-lg transition-colors flex items-center gap-2"
                    >
                      {batchUploading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <FolderUp size={14} />
                          <span>
                            {batchUploadMode === 'files'
                              ? `Upload ${batchFiles.length > 0 ? `${batchFiles.length} Photos` : 'Folder'} Now`
                              : 'Import All Links Now'}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={batchUploading}
                      onClick={() => setShowBatchUpload(false)}
                      className="px-4 py-2.5 text-xs text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {showAddCategory && (
                <form onSubmit={handleCreateCategory} className="bg-[#161616] p-6 rounded-2xl border border-neutral-800 space-y-4 animate-fade-in">
                  <h3 className="font-serif text-lg font-medium text-white">Create New Album Category</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-400 block mb-1">Category Name *</label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        required
                        placeholder="e.g. Sangeet Celebration"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-400 block mb-1">Cover Image URL *</label>
                      <input
                        type="url"
                        value={newCategory.coverImage}
                        onChange={(e) => setNewCategory({ ...newCategory, coverImage: e.target.value })}
                        required
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-2 rounded-full bg-[#8B0000] text-white text-xs font-semibold uppercase tracking-wider">
                      Save Category
                    </button>
                    <button type="button" onClick={() => setShowAddCategory(false)} className="px-4 py-2 text-xs text-neutral-400">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {showAddPhoto && (
                <form onSubmit={handleCreatePhoto} className="bg-[#161616] p-6 rounded-2xl border border-neutral-800 space-y-4 animate-fade-in">
                  <h3 className="font-serif text-lg font-medium text-white">Upload / Add Single Photograph</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-400 block mb-1">Title *</label>
                      <input
                        type="text"
                        value={newPhoto.title}
                        onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                        required
                        placeholder="e.g. Sunset Vows at Nashik"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-400 block mb-1">Category *</label>
                      <select
                        value={newPhoto.category}
                        onChange={(e) => {
                          const selectedName = e.target.value;
                          const foundCat = categories.find((c) => c.name === selectedName);
                          setNewPhoto({
                            ...newPhoto,
                            category: selectedName,
                            categoryId: foundCat?.id,
                          });
                        }}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-neutral-400 block">Image Source *</label>
                        <label className="cursor-pointer text-[10px] text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1">
                          <Upload size={11} />
                          <span>Browse File</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePortfolioPhotoFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="url"
                        value={newPhoto.image}
                        onChange={(e) => setNewPhoto({ ...newPhoto, image: e.target.value })}
                        required
                        placeholder="Paste image URL or click Browse File"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-2 rounded-full bg-[#8B0000] text-white text-xs font-semibold uppercase tracking-wider">
                      Save Photo Live
                    </button>
                    <button type="button" onClick={() => setShowAddPhoto(false)} className="px-4 py-2 text-xs text-neutral-400">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-[#161616] p-3 rounded-xl border border-neutral-800 space-y-3 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden relative">
                        <img src={formatImageUrl(cat.coverImage)} alt={cat.name} className="w-full h-full object-cover" />
                        {cat.hidden && (
                          <span className="absolute top-2 left-2 bg-neutral-900/90 text-white text-[9px] px-2 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-medium text-white">{cat.name}</h4>
                        <p className="text-[10px] text-neutral-500 font-mono">slug: {cat.slug}</p>
                      </div>
                    </div>

                    {/* Category Action Bar */}
                    <div className="space-y-2 pt-2 border-t border-neutral-800">
                      {/* Quick Upload Button for this Album */}
                      <button
                        type="button"
                        onClick={() => {
                          setBatchCategory(cat.id);
                          setBatchFiles([]);
                          setBatchDriveLinksText('');
                          setShowBatchUpload(true);
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bg-[#0E0E0E] hover:bg-[#8B0000] text-neutral-300 hover:text-white text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5 border border-neutral-800 hover:border-[#8B0000]"
                      >
                        <FolderUp size={12} className="text-amber-400 group-hover:text-white" />
                        <span>Upload Folder to {cat.name}</span>
                      </button>

                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <button
                          onClick={() => handleToggleCategoryHidden(cat.id, cat.hidden)}
                          className="flex items-center gap-1 hover:text-white"
                        >
                          {cat.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                          <span>{cat.hidden ? 'Show' : 'Hide'}</span>
                        </button>

                        <button onClick={() => handleDeleteCategory(cat.id)} className="hover:text-red-500 p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Individual Photographs Grid */}
              <div className="space-y-4 pt-6 border-t border-neutral-800">
                <h3 className="font-serif text-lg font-medium text-white">All Photographs in Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="bg-[#161616] p-3 rounded-xl border border-neutral-800 space-y-2">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden relative bg-neutral-900">
                        <img src={formatImageUrl(item.image)} alt={item.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded font-mono">
                          {item.category}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-serif text-xs font-medium text-white line-clamp-1">{item.title}</h4>
                        <p className="text-[10px] text-neutral-500">{item.location} • {item.date}</p>
                      </div>
                      <div className="pt-1 border-t border-neutral-800 flex justify-end">
                        <button
                          onClick={() => handleDeletePhoto(item.id)}
                          className="text-neutral-400 hover:text-red-500 p-1"
                          title="Delete photo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DRONE SHOWCASE */}
          {activeTab === 'drone' && (
            <form onSubmit={handleSaveSettings} className="bg-[#161616] p-8 rounded-2xl border border-neutral-800 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white">Drone & Aerial Cinema Showcase</h2>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">
                    Update high-altitude aerial media and description for Maharashtra heritage forts and palace shoots.
                  </p>
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] text-white text-xs font-semibold uppercase tracking-wider shadow"
                >
                  <Save size={15} />
                  <span>Save Changes Live</span>
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">Section Heading</label>
                <input
                  type="text"
                  value={settings.drone_heading}
                  onChange={(e) => setSettings({ ...settings, drone_heading: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">Section Subtitle</label>
                <textarea
                  rows={2}
                  value={settings.drone_subtitle}
                  onChange={(e) => setSettings({ ...settings, drone_subtitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-400 block mb-1">Drone Cover Image URL</label>
                <input
                  type="url"
                  value={settings.drone_image_url}
                  onChange={(e) => setSettings({ ...settings, drone_image_url: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                />
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] text-white text-xs font-semibold uppercase tracking-wider shadow-lg"
                >
                  Save Drone Showcase Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 7: VIDEOS & FILMS */}
          {activeTab === 'films' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white">Cinematic Videos & Films</h2>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">
                    Manage 4K cinematic wedding highlight trailers, pre-wedding films, and drone films category-wise.
                  </p>
                </div>
                {!showAddFilm && !editingFilm && !showBatchVideoUpload && (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setBatchVideoCategory(filmCategories[0] || 'Wedding Film');
                        setBatchVideoFiles([]);
                        setBatchVideoLinksText('');
                        setShowBatchVideoUpload(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8B0000] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A61C1C] transition-colors shadow-md"
                    >
                      <FolderUp size={15} />
                      <span>Upload Folder / Bulk Videos</span>
                    </button>

                    <button
                      onClick={() => {
                        setNewFilm({
                          title: '',
                          description: '',
                          thumbnail_url: '',
                          video_url: '',
                          category: filmCategories[0] || 'Wedding Film',
                          featured: true,
                        });
                        setShowAddFilm(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-700 transition-colors"
                    >
                      <Plus size={14} />
                      <span>Add Single Video</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Video Publishing Guide Banner */}
              <div className="p-4 rounded-xl bg-[#0E0E0E] border border-neutral-800 flex items-start gap-3 text-xs text-neutral-300">
                <Video size={18} className="text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-white block">Video Publishing Guide (YouTube & Google Drive):</span>
                  <p className="text-neutral-400 font-light leading-relaxed">
                    Paste any <strong>YouTube link</strong> (e.g. <code className="text-amber-300/90 font-mono text-[11px]">https://youtu.be/...</code> or <code className="text-amber-300/90 font-mono text-[11px]">https://www.youtube.com/watch?v=...</code>) or <strong>Google Drive link</strong> (e.g. <code className="text-amber-300/90 font-mono text-[11px]">https://drive.google.com/file/d/FILE_ID/view?usp=sharing</code>).
                    Thumbnails and streaming previews are auto-generated.
                  </p>
                </div>
              </div>

              {/* FILM CATEGORIES MANAGEMENT BAR */}
              <div className="bg-[#141414] p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Tag size={15} className="text-amber-400" />
                    <div>
                      <span className="text-xs font-semibold text-white uppercase tracking-wider block">
                        Film Categories ({filmCategories.length})
                      </span>
                      <p className="text-[11px] text-neutral-400 font-light">
                        Add custom film categories or click <span className="text-red-400">✕</span> on any badge to remove it.
                      </p>
                    </div>
                  </div>
                  {!showAddCategoryInput && (
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryInput(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors border border-neutral-700 self-start sm:self-auto"
                    >
                      <Plus size={13} />
                      <span>Add Category</span>
                    </button>
                  )}
                </div>

                {/* Category Badges / Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {filmCategories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs group hover:border-neutral-600 transition-colors"
                    >
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setBatchVideoCategory(cat);
                          setBatchVideoFiles([]);
                          setBatchVideoLinksText('');
                          setShowBatchVideoUpload(true);
                        }}
                        className="text-neutral-500 hover:text-amber-400 p-0.5 rounded transition-colors"
                        title={`Upload videos directly to "${cat}"`}
                      >
                        <FolderUp size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFilmCategory(cat)}
                        className="text-neutral-500 hover:text-red-400 p-0.5 rounded transition-colors"
                        title={`Remove "${cat}"`}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}

                  {/* Inline Add Category Input */}
                  {showAddCategoryInput && (
                    <div className="inline-flex items-center gap-1.5 p-1 bg-[#0E0E0E] rounded-full border border-amber-600/70 animate-fade-in shadow-md">
                      <input
                        type="text"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFilmCategory(newCategoryInput);
                          } else if (e.key === 'Escape') {
                            setShowAddCategoryInput(false);
                            setNewCategoryInput('');
                          }
                        }}
                        placeholder="Enter category name..."
                        autoFocus
                        className="bg-transparent px-2.5 py-0.5 text-xs text-white placeholder-neutral-500 focus:outline-none w-36 sm:w-44"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddFilmCategory(newCategoryInput)}
                        className="px-3 py-1 rounded-full bg-[#8B0000] text-white text-[11px] font-semibold hover:bg-[#A61C1C] transition-colors"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddCategoryInput(false);
                          setNewCategoryInput('');
                        }}
                        className="px-2 py-0.5 text-neutral-400 hover:text-white text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* BATCH / FOLDER VIDEO UPLOAD MODAL */}
              {showBatchVideoUpload && (
                <form
                  onSubmit={handleExecuteBatchVideoUpload}
                  className="bg-[#161616] p-6 rounded-2xl border border-amber-600/50 space-y-5 animate-fade-in shadow-2xl"
                >
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <FolderUp size={20} className="text-amber-400" />
                      <div>
                        <h3 className="font-serif text-lg font-medium text-white">
                          Upload Folder / Bulk Videos (Category-Wise)
                        </h3>
                        <p className="text-[11px] text-neutral-400 font-light">
                          Select an entire video folder from your device or paste multiple YouTube & Drive links.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={batchVideoUploading}
                      onClick={() => setShowBatchVideoUpload(false)}
                      className="text-xs text-neutral-400 hover:text-white"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Step 1: Choose Target Film Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-300 block mb-1">
                        Target Film Category *
                      </label>
                      <select
                        value={batchVideoCategory}
                        onChange={(e) => setBatchVideoCategory(e.target.value)}
                        disabled={batchVideoUploading}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white focus:outline-none focus:border-[#8B0000]"
                      >
                        {filmCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            🎬 {cat}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11px] text-neutral-500 font-light mt-1">
                        All uploaded cinematic videos will be automatically categorized under this film category.
                      </p>
                    </div>

                    {/* Step 2: Upload Method Tabs */}
                    <div>
                      <label className="text-xs font-medium text-neutral-300 block mb-1">
                        Upload Method
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={batchVideoUploading}
                          onClick={() => setBatchVideoUploadMode('links')}
                          className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                            batchVideoUploadMode === 'links'
                              ? 'bg-[#8B0000] border-[#8B0000] text-white shadow-sm'
                              : 'bg-[#0E0E0E] border-neutral-700 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <UploadCloud size={13} className="text-amber-400" />
                          <span>⚡ Batch Links (Instant)</span>
                        </button>
                        <button
                          type="button"
                          disabled={batchVideoUploading}
                          onClick={() => setBatchVideoUploadMode('files')}
                          className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                            batchVideoUploadMode === 'files'
                              ? 'bg-[#8B0000] border-[#8B0000] text-white shadow-sm'
                              : 'bg-[#0E0E0E] border-neutral-700 text-neutral-400 hover:text-white'
                          }`}
                        >
                          <Folder size={13} />
                          <span>Device Video Folder</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Mode A: Batch Video Links (RECOMMENDED - INSTANT) */}
                  {batchVideoUploadMode === 'links' ? (
                    <div className="space-y-3 bg-[#0E0E0E] p-4 rounded-xl border border-neutral-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-white flex items-center gap-1.5">
                          <span>Paste YouTube or Google Drive Video Links (One link per line)</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold">
                            ⚡ Instant 1-Click Import
                          </span>
                        </label>
                      </div>
                      <textarea
                        rows={6}
                        value={batchVideoLinksText}
                        onChange={(e) => setBatchVideoLinksText(e.target.value)}
                        placeholder={`https://www.youtube.com/watch?v=6rly2xErfIY\nhttps://youtu.be/dQw4w9WgXcQ\nhttps://drive.google.com/file/d/1I4hVmGPSxHQ61mhDmia01mF0jMRQoPEv/view\nhttps://drive.google.com/file/d/10bQds5EArXRz-Q11kXfcEnnN8f0RkmD0/view`}
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-[#141414] border border-neutral-700 text-white placeholder-neutral-600 focus:outline-none focus:border-[#8B0000] resize-y"
                      />
                      <div className="p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-lg text-[11px] text-amber-200/90 leading-relaxed">
                        ✨ <strong>Why Links Are Instant:</strong> Raw 4K camera videos are 500MB–2GB each and take a long time to upload through a browser. When you paste your YouTube or Google Drive video links, the entire album imports in <strong>under 1 second</strong> with automatic 4K streaming and HD posters!
                      </div>
                    </div>
                  ) : (
                    /* Mode B: Local Video Folder / Files */
                    <div className="space-y-3">
                      <div className="border-2 border-dashed border-neutral-700 hover:border-amber-500/60 rounded-xl p-6 text-center bg-[#0E0E0E]/80 space-y-3 transition-colors">
                        <FolderPlus size={32} className="mx-auto text-amber-400/80" />
                        <div>
                          <p className="text-xs text-white font-medium">
                            Choose a folder of lightweight MP4/WebM video clips from your computer
                          </p>
                          <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                            For large 4K wedding films (100MB+), use the <strong>⚡ Batch Links tab</strong> above for instant 1-second import!
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                          {/* Folder Picker */}
                          <label className="cursor-pointer px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors inline-flex items-center gap-1.5">
                            <FolderUp size={14} className="text-amber-400" />
                            <span>Select Video Folder</span>
                            <input
                              type="file"
                              multiple
                              {...({ webkitdirectory: '', directory: '' } as any)}
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  const filesArray = Array.from(e.target.files).filter((f) =>
                                    f.type.startsWith('video/') || /\.(mp4|webm|mov|m4v|mkv)$/i.test(f.name)
                                  );
                                  setBatchVideoFiles(filesArray);
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          {/* Multiple Files Picker */}
                          <label className="cursor-pointer px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 transition-colors inline-flex items-center gap-1.5">
                            <Video size={14} className="text-emerald-400" />
                            <span>Select Multiple Video Files</span>
                            <input
                              type="file"
                              multiple
                              accept="video/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                  setBatchVideoFiles(Array.from(e.target.files));
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Selected Video Files Count & Warning */}
                      {batchVideoFiles.length > 0 && (
                        <div className="space-y-2">
                          <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span className="text-white font-medium">
                                {batchVideoFiles.length} {batchVideoFiles.length === 1 ? 'video' : 'videos'} selected
                              </span>
                              <span className="text-neutral-400 text-[11px] font-mono">
                                (Total: {(batchVideoFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setBatchVideoFiles([])}
                              className="text-neutral-400 hover:text-red-400 text-xs"
                            >
                              Clear
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}


                  {/* Progress Indicator */}
                  {batchVideoUploading && (
                    <div className="p-4 bg-neutral-900 rounded-xl border border-amber-600/40 space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white font-medium flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin text-amber-400" />
                          <span>{batchVideoProgress.statusText || 'Processing videos...'}</span>
                        </span>
                        <span className="font-mono text-amber-400 font-bold">{batchVideoProgress.percent}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#8B0000] to-amber-500 h-full transition-all duration-300 rounded-full"
                          style={{ width: `${batchVideoProgress.percent}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500 text-center">
                        🎬 Auto-generating HD cover poster &amp; ☁️ uploading to gallery — do not close this tab
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={
                        batchVideoUploading ||
                        (batchVideoUploadMode === 'files' ? batchVideoFiles.length === 0 : !batchVideoLinksText.trim())
                      }
                      className="px-6 py-2.5 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] disabled:bg-neutral-800 disabled:text-neutral-500 text-white text-xs font-semibold uppercase tracking-wider shadow-lg transition-colors flex items-center gap-2"
                    >
                      {batchVideoUploading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Uploading Videos...</span>
                        </>
                      ) : (
                        <>
                          <FolderUp size={14} />
                          <span>
                            {batchVideoUploadMode === 'files'
                              ? `Upload ${batchVideoFiles.length > 0 ? `${batchVideoFiles.length} Videos` : 'Folder'} Now`
                              : 'Import All Video Links Now'}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (batchVideoUploading) {
                          batchVideoCancelRef.current = true;
                          setBatchVideoUploading(false);
                        } else {
                          setShowBatchVideoUpload(false);
                        }
                      }}
                      className="px-4 py-2.5 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      {batchVideoUploading ? 'Cancel Upload' : 'Cancel'}
                    </button>
                  </div>
                </form>
              )}


              {/* ADD FILM FORM */}
              {showAddFilm && (
                <form onSubmit={handleCreateFilm} className="bg-[#161616] p-6 rounded-2xl border border-neutral-800 space-y-4 animate-fade-in shadow-xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h3 className="font-serif text-lg font-medium text-white">Add New Cinematic Film</h3>
                    <button type="button" onClick={() => setShowAddFilm(false)} className="text-xs text-neutral-400 hover:text-white">
                      ✕ Close
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-400 block mb-1">Video Title *</label>
                      <input
                        type="text"
                        value={newFilm.title}
                        onChange={(e) => setNewFilm({ ...newFilm, title: e.target.value })}
                        required
                        placeholder="e.g. Wedding Film — Rahul & Priya"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#8B0000]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-neutral-400">Film Category</label>
                        <button
                          type="button"
                          onClick={() => setShowAddCategoryInput(true)}
                          className="text-[11px] text-amber-400 hover:underline"
                        >
                          + Add New
                        </button>
                      </div>
                      <select
                        value={newFilm.category}
                        onChange={(e) => setNewFilm({ ...newFilm, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white focus:outline-none focus:border-[#8B0000]"
                      >
                        {filmCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">
                      YouTube or Google Drive Video Link *
                    </label>
                    <input
                      type="url"
                      value={newFilm.video_url}
                      onChange={(e) => {
                        const val = e.target.value;
                        const autoThumb = getAutoThumbnail(val);
                        setNewFilm((prev) => ({
                          ...prev,
                          video_url: val,
                          thumbnail_url: prev.thumbnail_url || autoThumb,
                        }));
                      }}
                      required
                      placeholder="https://youtu.be/... or https://drive.google.com/file/d/..."
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#8B0000]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-400 block mb-1">
                        Thumbnail Cover URL (Optional — auto-detected from YouTube/Drive)
                      </label>
                      <input
                        type="url"
                        value={newFilm.thumbnail_url}
                        onChange={(e) => setNewFilm({ ...newFilm, thumbnail_url: e.target.value })}
                        placeholder="https://images.unsplash.com/... or auto detected"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#8B0000]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-400 block mb-1">Short Description / Mood</label>
                      <input
                        type="text"
                        value={newFilm.description}
                        onChange={(e) => setNewFilm({ ...newFilm, description: e.target.value })}
                        placeholder="e.g. 4K Sunset ritual and emotional vows"
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-[#8B0000]"
                      />
                    </div>
                  </div>

                  {/* Publish Immediately Switch */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="publish_film_toggle"
                      checked={newFilm.featured !== false}
                      onChange={(e) => setNewFilm({ ...newFilm, featured: e.target.checked })}
                      className="rounded bg-[#0E0E0E] border-neutral-700 text-[#8B0000] focus:ring-0"
                    />
                    <label htmlFor="publish_film_toggle" className="text-xs text-neutral-300 cursor-pointer">
                      Publish to public website immediately
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="px-6 py-2.5 rounded-full bg-[#8B0000] hover:bg-[#A61C1C] text-white text-xs font-semibold uppercase tracking-wider shadow">
                      Save & Publish Film
                    </button>
                    <button type="button" onClick={() => setShowAddFilm(false)} className="px-4 py-2.5 text-xs text-neutral-400 hover:text-white">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* EDIT FILM FORM */}
              {editingFilm && (
                <form onSubmit={handleUpdateFilm} className="bg-[#161616] p-6 rounded-2xl border border-amber-600/40 space-y-4 animate-fade-in shadow-xl">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <h3 className="font-serif text-lg font-medium text-white">Edit Cinematic Film</h3>
                    </div>
                    <button type="button" onClick={() => setEditingFilm(null)} className="text-xs text-neutral-400 hover:text-white">
                      ✕ Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-400 block mb-1">Video Title *</label>
                      <input
                        type="text"
                        value={editingFilm.title}
                        onChange={(e) => setEditingFilm({ ...editingFilm, title: e.target.value })}
                        required
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white focus:outline-none focus:border-[#8B0000]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-medium text-neutral-400">Film Category</label>
                        <button
                          type="button"
                          onClick={() => setShowAddCategoryInput(true)}
                          className="text-[11px] text-amber-400 hover:underline"
                        >
                          + Add New
                        </button>
                      </div>
                      <select
                        value={editingFilm.category}
                        onChange={(e) => setEditingFilm({ ...editingFilm, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white focus:outline-none focus:border-[#8B0000]"
                      >
                        {filmCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">
                      YouTube or Google Drive Video Link *
                    </label>
                    <input
                      type="url"
                      value={editingFilm.video_url}
                      onChange={(e) => {
                        const val = e.target.value;
                        const autoThumb = getAutoThumbnail(val);
                        setEditingFilm((prev) =>
                          prev
                            ? {
                                ...prev,
                                video_url: val,
                                thumbnail_url: prev.thumbnail_url || autoThumb,
                              }
                            : null
                        );
                      }}
                      required
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white focus:outline-none focus:border-[#8B0000]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-neutral-400 block mb-1">
                        Thumbnail Cover URL
                      </label>
                      <input
                        type="url"
                        value={editingFilm.thumbnail_url}
                        onChange={(e) => setEditingFilm({ ...editingFilm, thumbnail_url: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white focus:outline-none focus:border-[#8B0000]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-neutral-400 block mb-1">Short Description / Mood</label>
                      <input
                        type="text"
                        value={editingFilm.description}
                        onChange={(e) => setEditingFilm({ ...editingFilm, description: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white focus:outline-none focus:border-[#8B0000]"
                      />
                    </div>
                  </div>

                  {/* Publish Status Toggle */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="edit_publish_film_toggle"
                      checked={editingFilm.featured !== false}
                      onChange={(e) => setEditingFilm({ ...editingFilm, featured: e.target.checked })}
                      className="rounded bg-[#0E0E0E] border-neutral-700 text-[#8B0000] focus:ring-0"
                    />
                    <label htmlFor="edit_publish_film_toggle" className="text-xs text-neutral-300 cursor-pointer">
                      Published on live website
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" className="px-6 py-2.5 rounded-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold uppercase tracking-wider shadow">
                      Update Film Live
                    </button>
                    <button type="button" onClick={() => setEditingFilm(null)} className="px-4 py-2.5 text-xs text-neutral-400 hover:text-white">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* FILMS CATEGORY FILTER & GRID LIST */}
              {films.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-neutral-800 pt-2">
                  {['All', ...filmCategories].map((cat) => {
                    const isActive = adminFilmCategoryFilter === cat;
                    const count =
                      cat === 'All'
                        ? films.length
                        : films.filter((f) => matchesFilmCategory(f.category, cat)).length;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setAdminFilmCategoryFilter(cat)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                          isActive
                            ? 'bg-[#8B0000] text-white shadow-sm'
                            : 'bg-[#161616] text-neutral-400 hover:text-white border border-neutral-800'
                        }`}
                      >
                        <span>{cat}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                            isActive ? 'bg-white/20 text-white' : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {films.length === 0 ? (
                <div className="text-center py-16 bg-[#161616] rounded-2xl border border-neutral-800 space-y-2">
                  <Video size={28} className="mx-auto text-neutral-600 mb-1" />
                  <p className="font-serif text-lg text-white">No Cinematic Films in Gallery</p>
                  <p className="text-xs text-neutral-400 font-light">Click "+ Add Video" above to paste a Google Drive film link.</p>
                </div>
              ) : films.filter((f) => matchesFilmCategory(f.category, adminFilmCategoryFilter)).length === 0 ? (
                <div className="text-center py-12 bg-[#161616] rounded-2xl border border-neutral-800 space-y-2">
                  <Video size={24} className="mx-auto text-neutral-600 mb-1" />
                  <p className="font-serif text-base text-white">
                    No videos found in "{adminFilmCategoryFilter}"
                  </p>
                  <p className="text-xs text-neutral-400 font-light">
                    Click "⚡ Upload Folder / Bulk Videos" above to upload videos directly to this category.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {films
                    .filter((f) => matchesFilmCategory(f.category, adminFilmCategoryFilter))
                    .map((f) => {

                    const ytId = extractYouTubeId(f.video_url);
                    const driveId = extractGoogleDriveFileId(f.video_url);
                    const hasCustomImage =
                      f.thumbnail_url &&
                      !f.thumbnail_url.includes('drive.google.com/thumbnail') &&
                      !f.thumbnail_url.includes('drive.google.com/file');

                    const fallbackImg = getCategoryFallbackImage(f.category);
                    const isPublished = f.featured !== false;

                    return (
                      <div key={f.id} className="bg-[#161616] p-4 rounded-xl border border-neutral-800 space-y-3 shadow-md hover:border-neutral-700 transition-colors flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="aspect-video rounded-lg overflow-hidden relative bg-black flex items-center justify-center">
                            {ytId && !hasCustomImage ? (
                              <img
                                src={getYouTubeThumbnail(ytId)}
                                alt={f.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={(e) => handleImageError(e, fallbackImg)}
                              />
                            ) : hasCustomImage ? (
                              <img
                                src={formatImageUrl(f.thumbnail_url)}
                                alt={f.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                                onError={(e) => handleImageError(e, fallbackImg)}
                              />
                            ) : driveId ? (
                              <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
                                <iframe
                                  src={`https://drive.google.com/file/d/${driveId}/preview`}
                                  className="w-full h-full pointer-events-none scale-[1.03] border-0"
                                  tabIndex={-1}
                                  title={f.title}
                                  loading="lazy"
                                />
                              </div>
                            ) : (
                              <img
                                src={fallbackImg}
                                alt={f.title}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                              />
                            )}
                            
                            {/* Category Badge */}
                            <span className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-white text-[9px] px-2 py-0.5 rounded font-mono border border-white/20 pointer-events-none">
                              {f.category || 'Film'}
                            </span>

                            {/* Status Badge */}
                            <span
                              className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider pointer-events-none ${
                                isPublished
                                  ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-neutral-900/90 text-neutral-400 border border-neutral-700'
                              }`}
                            >
                              {isPublished ? '● LIVE' : '○ UNPUBLISHED'}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-serif text-base font-medium text-white">{f.title}</h4>
                            <p className="text-xs text-neutral-400 font-light mt-1 line-clamp-2">
                              {f.description || 'Google Drive Cinematic Film'}
                            </p>
                          </div>
                        </div>

                        {/* Action Toolbar */}
                        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                          {/* Toggle Publish */}
                          <button
                            type="button"
                            onClick={() => handleToggleFilmFeatured(f.id, isPublished)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                              isPublished
                                ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                                : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60'
                            }`}
                          >
                            {isPublished ? <EyeOff size={12} /> : <Eye size={12} />}
                            <span>{isPublished ? 'Unpublish' : 'Publish'}</span>
                          </button>

                          <div className="flex items-center gap-1">
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFilm(f);
                                setShowAddFilm(false);
                              }}
                              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-amber-400 transition-colors"
                              title="Edit film"
                            >
                              <Edit3 size={14} />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteFilm(f.id)}
                              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors"
                              title="Delete film"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: BOOKINGS & LEADS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white">Client Bookings & Leads CRM</h2>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">
                    Filter by status, send 1-click WhatsApp replies, and manage booking confirmations.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {['all', 'new', 'contacted', 'confirmed', 'completed', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setEnquiryFilter(st)}
                      className={`px-3 py-1 rounded-full uppercase tracking-wider text-[10px] font-semibold transition-colors ${
                        enquiryFilter === st
                          ? 'bg-[#8B0000] text-white'
                          : 'bg-[#161616] border border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredEnquiries.map((enq) => {
                  const replyMsg = `Hi ${enq.full_name}, thank you for reaching out to Chitrakatha for your ${enq.event_type} on ${enq.event_date || 'your upcoming celebration'}. Hemant here!`;
                  const waUrl = createWhatsAppLink(enq.phone, replyMsg);

                  return (
                    <div
                      key={enq.id}
                      className="bg-[#161616] p-6 rounded-2xl border border-neutral-800 shadow-sm space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-800 pb-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-semibold text-amber-400">
                              {enq.custom_id || `ENQ-${enq.id?.slice(0, 4) || '1001'}`}
                            </span>
                            <h3 className="font-serif text-xl font-medium text-white">{enq.full_name}</h3>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold ${
                                enq.status === 'confirmed'
                                  ? 'bg-emerald-950 border border-emerald-600 text-emerald-400'
                                  : enq.status === 'contacted'
                                  ? 'bg-blue-950 border border-blue-600 text-blue-400'
                                  : enq.status === 'new'
                                  ? 'bg-red-950 border border-red-600 text-red-400'
                                  : 'bg-neutral-800 text-neutral-300'
                              }`}
                            >
                              {enq.status || 'New'}
                            </span>
                          </div>
                          <p className="text-xs text-[#8B0000] font-semibold mt-0.5">{enq.event_type}</p>
                        </div>

                        {/* Status dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-400">Status:</span>
                          <select
                            value={enq.status || 'new'}
                            onChange={(e) => handleUpdateEnquiryStatus(enq.id!, e.target.value as any)}
                            className="text-xs bg-[#0E0E0E] border border-neutral-700 rounded-lg px-2.5 py-1 text-white focus:outline-none"
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-neutral-300">
                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase">Phone</span>
                          <span className="font-medium text-white">{enq.phone}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase">Email</span>
                          <span className="font-medium text-white break-all">{enq.email}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase">Shoot Date</span>
                          <span className="font-medium text-white">{enq.event_date || 'TBD'}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[10px] uppercase">Location</span>
                          <span className="font-medium text-white">{enq.location || 'Maharashtra'}</span>
                        </div>
                      </div>

                      {enq.message && (
                        <div className="p-3 bg-[#0E0E0E] rounded-lg text-xs text-neutral-300 italic border-l-2 border-[#8B0000]">
                          "{enq.message}"
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
                        <div className="flex items-center gap-2">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp Reply</span>
                          </a>

                          <a
                            href={`tel:${enq.phone}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium transition-colors"
                          >
                            <Phone size={13} />
                            <span>Call</span>
                          </a>
                        </div>

                        <button
                          onClick={() => handleDeleteEnquiry(enq.id!)}
                          className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 9: FAQ MANAGER */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-2xl font-medium text-white">Frequently Asked Questions</h2>
                  <p className="text-xs text-neutral-400 font-light mt-0.5">
                    Add, edit, or delete FAQ answers on the live website.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddFaq(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8B0000] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#A61C1C] transition-colors"
                >
                  <Plus size={15} />
                  <span>Add FAQ</span>
                </button>
              </div>

              {showAddFaq && (
                <form onSubmit={handleCreateFaq} className="bg-[#161616] p-6 rounded-2xl border border-neutral-800 space-y-4 animate-fade-in">
                  <h3 className="font-serif text-lg font-medium text-white">Add FAQ</h3>
                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Question *</label>
                    <input
                      type="text"
                      value={newFaq.question}
                      onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                      required
                      placeholder="e.g. Do you travel across Maharashtra?"
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-400 block mb-1">Answer *</label>
                    <textarea
                      rows={3}
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                      required
                      placeholder="Detailed answer for clients..."
                      className="w-full px-3 py-2 text-xs rounded-lg bg-[#0E0E0E] border border-neutral-700 text-white resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button type="submit" className="px-6 py-2 rounded-full bg-[#8B0000] text-white text-xs font-semibold uppercase tracking-wider">
                      Save FAQ Live
                    </button>
                    <button type="button" onClick={() => setShowAddFaq(false)} className="px-4 py-2 text-xs text-neutral-400">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="bg-[#161616] p-5 rounded-xl border border-neutral-800 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-serif text-base font-medium text-white">{faq.question}</h4>
                      <p className="text-xs text-neutral-400 font-light leading-relaxed">{faq.answer}</p>
                    </div>

                    <button onClick={() => handleDeleteFaq(faq.id)} className="text-neutral-500 hover:text-red-500 p-1 shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
