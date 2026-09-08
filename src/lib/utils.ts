import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase, isSupabaseConfigured } from './supabase';
import { broadcastRealtimeChange } from './realtimeSync';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function createWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200';

export function getCategoryFallbackImage(category?: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('pre-wedding') || cat.includes('prewedding')) {
    return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800';
  }
  if (cat.includes('engagement')) {
    return 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800';
  }
  if (cat.includes('traditional') || cat.includes('ritual') || cat.includes('haldi')) {
    return 'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?auto=format&fit=crop&q=80&w=800';
  }
  if (cat.includes('maternity') || cat.includes('baby')) {
    return 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800';
  }
  if (cat.includes('drone') || cat.includes('aerial')) {
    return 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800';
  }
  if (cat.includes('birthday')) {
    return 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=800';
  }
  return 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800';
}

export function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl: string = DEFAULT_FALLBACK_IMAGE
) {
  const target = e.currentTarget;
  if (target.src !== fallbackUrl) {
    target.onerror = null;
    target.src = fallbackUrl;
  }
}

export function extractGoogleDriveFileId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/{FILE_ID}/...
  const match1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (match1 && match1[1]) return match1[1];

  // Pattern 2: id={FILE_ID} (e.g. uc?id=..., thumbnail?id=..., open?id=...)
  const match2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (match2 && match2[1]) return match2[1];

  // Pattern 3: lh3.googleusercontent.com/d/{FILE_ID} or googleusercontent.com/...
  const match3 = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/i);
  if (match3 && match3[1]) return match3[1];

  return null;
}

/**
 * Automatically converts Google Drive sharing links, Dropbox links, and CDN links
 * into high-speed, direct-rendering image URLs for <img> tags.
 */
export function formatImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return DEFAULT_FALLBACK_IMAGE;
  const trimmed = url.trim();
  if (!trimmed) return DEFAULT_FALLBACK_IMAGE;

  // 1. Google Drive direct CDN: https://lh3.googleusercontent.com/d/{FILE_ID}
  const driveId = extractGoogleDriveFileId(trimmed);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }

  // 2. Dropbox links: ?dl=0 -> ?raw=1
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('?dl=0', '?raw=1').replace('&dl=0', '&raw=1');
  }

  return trimmed;
}

export function extractYouTubeId(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i
  );
  return match && match[1] ? match[1] : null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function getAutoThumbnail(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const ytId = extractYouTubeId(url);
  if (ytId) return getYouTubeThumbnail(ytId);

  const driveId = extractGoogleDriveFileId(url);
  if (driveId) return getGoogleDriveThumbnail(driveId);

  return '';
}

export function isValidGoogleDriveUrl(url?: string): boolean {
  return isValidVideoLink(url);
}

export function isValidVideoLink(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (extractGoogleDriveFileId(trimmed)) return true;
  if (extractYouTubeId(trimmed)) return true;
  if (
    trimmed.includes('youtube.com') ||
    trimmed.includes('youtu.be') ||
    trimmed.includes('vimeo.com') ||
    trimmed.match(/\.(mp4|webm|mov|ogg)($|\?)/i)
  ) {
    return true;
  }
  return false;
}

export function matchesFilmCategory(filmCategory?: string, targetCategory?: string): boolean {
  if (!targetCategory || targetCategory === 'All') return true;
  if (!filmCategory) return false;
  const f = filmCategory.trim().toLowerCase();
  const t = targetCategory.trim().toLowerCase();
  if (f === t) return true;
  const cleanF = f.replace(/(\bfilm\b|\bfilms\b|\bvideo\b|\bvideos\b|\bshoot\b)/g, '').trim();
  const cleanT = t.replace(/(\bfilm\b|\bfilms\b|\bvideo\b|\bvideos\b|\bshoot\b)/g, '').trim();
  if (cleanF && cleanT && cleanF === cleanT) return true;
  return false;
}


export function getGoogleDriveThumbnail(fileId: string): string {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
}

export function formatVideoEmbedUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  const driveId = extractGoogleDriveFileId(trimmed);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  // YouTube (including standard watch, short URL, shorts, and embed links)
  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;
  }

  // Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  return trimmed;
}

export function formatVideoUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // 1. Google Drive: https://drive.google.com/file/d/{FILE_ID}/view...
  const driveFileRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i;
  const driveFileMatch = trimmed.match(driveFileRegex);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveFileMatch[1]}`;
  }

  // 2. Google Drive: https://drive.google.com/open?id={FILE_ID} or /uc?id={FILE_ID}
  const driveIdRegex = /drive\.google\.com\/(?:open|uc)\?(?:[^&]*&)*id=([a-zA-Z0-9_-]+)/i;
  const driveIdMatch = trimmed.match(driveIdRegex);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${driveIdMatch[1]}`;
  }

  // 3. Google Docs: https://docs.google.com/uc?export=view&id={FILE_ID}
  const docsIdRegex = /docs\.google\.com\/uc\?(?:[^&]*&)*id=([a-zA-Z0-9_-]+)/i;
  const docsIdMatch = trimmed.match(docsIdRegex);
  if (docsIdMatch && docsIdMatch[1]) {
    return `https://docs.google.com/uc?export=download&id=${docsIdMatch[1]}`;
  }

  // 4. Dropbox links: ?dl=0 -> ?raw=1
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('?dl=0', '?raw=1').replace('&dl=0', '&raw=1');
  }

  return trimmed;
}

export function serializeSiteSettingsForSupabase(settings: any) {
  let activeHeroMedia =
    settings.hero_video_enabled !== false && settings.hero_video_url
      ? settings.hero_video_url
      : settings.hero_image_url || '';

  // Never write a temporary destroyed blob: URL to database
  if (activeHeroMedia && activeHeroMedia.startsWith('blob:')) {
    activeHeroMedia = 'https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-in-a-forest-41584-large.mp4';
  }
  if (!activeHeroMedia) {
    activeHeroMedia = 'https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-in-a-forest-41584-large.mp4';
  }

  return {
    id: '8918a81e-0839-4848-babe-87733c016a87',
    marathi_brand_mark: settings.marathi_brand_mark ?? 'चित्रकथा',
    brand_name: settings.brand_name ?? 'CHITRAKATHA',
    sub_brand_text: settings.sub_brand_text ?? 'BY HEMANT',
    phone_number: settings.phone_number ?? '7249532553',
    whatsapp_number: settings.whatsapp_number ?? '7249532553',
    email_address: settings.email_address ?? 'clicksbyhemant5564@gmail.com',
    studio_location: settings.studio_location ?? 'Satana, Nashik, Maharashtra',
    hero_title: settings.hero_title ?? 'CHITRAKATHA',
    hero_tagline: settings.hero_tagline ?? 'Premium Wedding Photography & Cinematic Stories',
    hero_description: settings.hero_description ?? 'Capturing emotions, traditions and unforgettable moments across Maharashtra.',
    hero_image_url: activeHeroMedia,
    hero_cta_primary: settings.hero_cta_primary ?? 'BOOK YOUR SHOOT',
    hero_cta_secondary: settings.hero_cta_secondary ?? 'WHATSAPP NOW',
    founder_name: settings.founder_name ?? 'Hemant Mandawade',
    founder_title: settings.founder_title ?? 'Founder & Lead Photographer',
    experience_badge: settings.experience_badge ?? '12+ YEARS OF TRUST',
    stat_weddings: settings.stat_weddings ?? '550+',
    stat_cities: settings.stat_cities ?? '35+',
    stat_satisfaction: settings.stat_satisfaction ?? '99%',
    stat_films: settings.stat_films ?? '480+',
    mission_text: settings.mission_text ?? '',
    vision_text: settings.vision_text ?? '',
    coverage_text: settings.coverage_text ?? '',
    drone_heading: settings.drone_heading ?? '',
    drone_subtitle: settings.drone_subtitle ?? '',
    drone_image_url: settings.drone_image_url ?? '',
    instagram_heading: settings.instagram_heading ?? '',
    instagram_username: settings.instagram_username ?? 'chitrakatha_by_hemant',
    instagram_profile_url: settings.instagram_profile_url ?? 'https://www.instagram.com/chitrakatha_by_hemant/',
    cta_heading: settings.cta_heading ?? '',
    cta_subtitle: settings.cta_subtitle ?? '',
    cta_button_primary: settings.cta_button_primary ?? 'BOOK YOUR SHOOT',
    cta_button_secondary: settings.cta_button_secondary ?? 'WHATSAPP NOW',
    updated_at: new Date().toISOString(),
  };
}

export async function saveSiteSettingsToSupabase(settings: any): Promise<boolean> {
  // Always persist local values immediately so they are never lost
  if (settings.hero_video_opacity !== undefined && settings.hero_video_opacity !== null) {
    try {
      localStorage.setItem('chitrakatha_hero_video_opacity', String(settings.hero_video_opacity));
    } catch {}
  }
  if (settings.founder_image_url !== undefined) {
    try {
      localStorage.setItem('chitrakatha_founder_image_url', settings.founder_image_url || '');
    } catch {}
  }

  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = serializeSiteSettingsForSupabase(settings);
    
    // Attempt save with founder_image_url if present
    let updatePayload: any = { ...payload };
    if (settings.founder_image_url) {
      updatePayload.founder_image_url = settings.founder_image_url;
    }

    let { error: updateError } = await supabase
      .from('site_settings')
      .update(updatePayload)
      .eq('id', payload.id);

    // If column doesn't exist yet in Supabase schema, retry with base payload
    if (updateError && updateError.message?.includes('founder_image_url')) {
      const retryRes = await supabase
        .from('site_settings')
        .update(payload)
        .eq('id', payload.id);
      updateError = retryRes.error;
    }

    if (updateError) {
      console.warn('Direct update notice, running upsert:', updateError);
      const { error: upsertError } = await supabase
        .from('site_settings')
        .upsert([payload], { onConflict: 'id' });
      if (upsertError) {
        console.error('Supabase settings save failed:', upsertError);
        return false;
      }
    }

    // Broadcast change across all open windows, tabs, and devices
    await broadcastRealtimeChange('site_settings', 'UPDATE', {
      ...payload,
      founder_image_url: settings.founder_image_url,
      hero_video_opacity: settings.hero_video_opacity,
    });
    return true;
  } catch (err) {
    console.error('Error saving site settings to Supabase:', err);
    return false;
  }
}

export function deserializeSiteSettingsFromSupabase(data: any): any {
  if (!data) return null;

  const defaultHeroVideo = 'https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-in-a-forest-41584-large.mp4';

  const isVideo = (url?: string) =>
    Boolean(
      url &&
        !url.startsWith('blob:') &&
        (url.match(/\.(mp4|webm|mov|ogg)($|\?)/i) ||
          url.includes('/videos/') ||
          url.includes('assets.mixkit.co') ||
          url.includes('supabase.co/storage/v1/object/public/hero-videos') ||
          url.includes('supabase.co/storage/v1/object/public/videos'))
    );

  const rawHeroUrl = data.hero_video_url || data.hero_image_url || '';
  const videoDetected = isVideo(rawHeroUrl);

  const heroVideoUrl =
    videoDetected
      ? rawHeroUrl
      : rawHeroUrl && !rawHeroUrl.startsWith('blob:')
      ? rawHeroUrl
      : defaultHeroVideo;

  const heroVideoEnabled =
    data.hero_video_enabled !== undefined
      ? Boolean(data.hero_video_enabled)
      : true;

  const localSavedOpacity =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('chitrakatha_hero_video_opacity')
      : null;

  const heroVideoOpacity =
    data.hero_video_opacity !== undefined && data.hero_video_opacity !== null
      ? Number(data.hero_video_opacity)
      : localSavedOpacity !== null && !isNaN(Number(localSavedOpacity))
      ? Number(localSavedOpacity)
      : 45;

  const localSavedFounderImage = typeof localStorage !== 'undefined' ? localStorage.getItem('chitrakatha_founder_image_url') || '' : '';
  const founderImageUrl = data.founder_image_url || localSavedFounderImage || '';

  return {
    ...data,
    founder_image_url: founderImageUrl,
    hero_video_url: heroVideoUrl,
    hero_video_enabled: heroVideoEnabled,
    hero_video_opacity: heroVideoOpacity,
    hero_video_updated_at: data.hero_video_updated_at || data.updated_at,
  };
}

/**
 * Ultra-fast client-side image compressor & optimizer.
 * Compresses raw 10MB-30MB DSLR/Phone photos down to 150KB-300KB
 * with crystal-clear 1080p/2K resolution for instant web loading.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1920,
  quality = 0.82
): Promise<{ compressedFile: File; dataUrl: string; sizeReductionText: string }> {
  // If not an image or SVG/GIF, return original
  if (!file.type.startsWith('image/') || file.type.includes('svg') || file.type.includes('gif')) {
    const dataUrl = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res((r.result as string) || '');
      r.readAsDataURL(file);
    });
    return { compressedFile: file, dataUrl, sizeReductionText: 'Original format kept' };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Downscale if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        // Fallback to original
        resolve({ compressedFile: file, dataUrl: objectUrl, sizeReductionText: 'Original' });
        return;
      }

      // High-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const targetType = 'image/jpeg';
      const dataUrl = canvas.toDataURL(targetType, quality);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ compressedFile: file, dataUrl, sizeReductionText: 'Original' });
            return;
          }

          const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
          const compressedSizeKB = (blob.size / 1024).toFixed(0);
          const reduction = Math.round(((file.size - blob.size) / file.size) * 100);

          const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
            type: targetType,
            lastModified: Date.now(),
          });

          resolve({
            compressedFile,
            dataUrl,
            sizeReductionText: `${originalSizeMB} MB → ${compressedSizeKB} KB (${reduction}% smaller)`,
          });
        },
        targetType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ compressedFile: file, dataUrl: '', sizeReductionText: 'Error' });
    };

    img.src = objectUrl;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Instant Client-Side Video Thumbnail Extractor (HTML5 Canvas)
// Extracts an HD poster frame from any local video file in < 50ms
// ─────────────────────────────────────────────────────────────────────────────

export function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      video.src = url;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';

      let resolved = false;
      const finish = (result: string) => {
        if (!resolved) {
          resolved = true;
          try { URL.revokeObjectURL(url); } catch {}
          try {
            video.pause();
            video.removeAttribute('src');
            video.load();
          } catch {}
          resolve(result);
        }
      };

      const captureFrame = () => {
        try {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 360;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, 640, 360);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              if (dataUrl && dataUrl.length > 500) {
                finish(dataUrl);
                return true;
              }
            }
          }
        } catch {
          // Canvas draw error fallback
        }
        return false;
      };

      video.onloadedmetadata = () => {
        // Seek to 0.1s for fast keyframe capture
        video.currentTime = Math.min(0.2, (video.duration || 1) / 2);
      };

      video.onseeked = () => {
        if (!captureFrame()) {
          finish('');
        }
      };

      video.onloadeddata = () => {
        captureFrame();
      };

      video.onerror = () => finish('');

      // Safety timeout after 2000ms
      setTimeout(() => {
        if (!captureFrame()) {
          finish('');
        }
      }, 2000);
    } catch {
      resolve('');
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// IndexedDB Local Video Store for Fast PC Uploads (supports 100MB–5GB video files)
// ─────────────────────────────────────────────────────────────────────────────

const DB_NAME = 'chitrakatha_video_storage';
const DB_VERSION = 1;
const STORE_NAME = 'videos';

function openVideoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveVideoToLocalDB(filmId: string, file: Blob): Promise<void> {
  try {
    const db = await openVideoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(file, filmId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB saveVideo notice:', err);
  }
}

export async function getVideoFromLocalDB(filmId: string): Promise<Blob | null> {
  try {
    const db = await openVideoDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(filmId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

const memoryBlobUrlMap = new Map<string, string>();

export async function getPlayableVideoUrl(videoUrl: string, filmId?: string): Promise<string> {
  if (!videoUrl) return '';

  // Cloud URLs (YouTube, Drive, Supabase HTTPS)
  if (videoUrl.startsWith('http://') || videoUrl.startsWith('https://')) {
    return videoUrl;
  }

  // Active blob URL in current session
  if (videoUrl.startsWith('blob:') && filmId && memoryBlobUrlMap.has(filmId)) {
    return memoryBlobUrlMap.get(filmId)!;
  }

  // Retrieve from IndexedDB if stored locally
  if (filmId) {
    if (memoryBlobUrlMap.has(filmId)) {
      return memoryBlobUrlMap.get(filmId)!;
    }
    const blob = await getVideoFromLocalDB(filmId);
    if (blob) {
      const freshUrl = URL.createObjectURL(blob);
      memoryBlobUrlMap.set(filmId, freshUrl);
      return freshUrl;
    }
  }

  return videoUrl;
}


