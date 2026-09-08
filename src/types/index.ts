export type Language = 'en' | 'mr' | 'hi';

export type FilterCategory = string;

export interface Category {
  id: string;
  name: string;
  slug: string;
  coverImage: string;
  displayOrder: number;
  hidden: boolean;
}

export interface PortfolioItem {
  id: string;
  categoryId: string;
  category: string;
  title: string;
  description?: string;
  image: string;
  altText?: string;
  location?: string;
  date?: string;
  featured?: boolean;
  hidden?: boolean;
  displayOrder?: number;
  created_at?: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  sort_order: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  location: string;
  event_date: string;
  cover_image: string;
  featured: boolean;
  created_at?: string;
  images?: ProjectImage[];
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url?: string;
  icon?: string;
  sort_order: number;
  hidden?: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
}

export interface Testimonial {
  id: string;
  client_name: string;
  testimonial: string;
  event_type: string;
  image_url?: string;
  rating: number;
  approved: boolean;
  created_at?: string;
}

export interface Film {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  category: string;
  featured: boolean;
  created_at?: string;
}

export type EnquiryStatus = 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';

export interface Enquiry {
  id?: string;
  custom_id?: string;
  full_name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date?: string;
  location?: string;
  budget?: string;
  message?: string;
  status?: EnquiryStatus;
  created_at?: string;
}

export interface SiteSettings {
  id?: string;
  marathi_brand_mark: string;
  brand_name: string;
  sub_brand_text: string;
  phone_number: string;
  whatsapp_number: string;
  email_address: string;
  studio_location: string;
  
  // Hero settings
  hero_title: string;
  hero_tagline: string;
  hero_description: string;
  hero_image_url: string;
  hero_video_url?: string;
  hero_video_enabled?: boolean;
  hero_video_opacity?: number;
  hero_video_updated_at?: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;

  // About & Trust settings
  founder_name: string;
  founder_title: string;
  founder_image_url?: string;
  experience_badge: string;
  stat_weddings: string;
  stat_cities: string;
  stat_satisfaction: string;
  stat_films: string;
  mission_text: string;
  vision_text: string;
  coverage_text: string;

  // Drone Section
  drone_heading: string;
  drone_subtitle: string;
  drone_image_url: string;
  drone_video_url?: string;

  // Instagram Section
  instagram_heading: string;
  instagram_username: string;
  instagram_profile_url: string;

  // Red CTA Banner
  cta_heading: string;
  cta_subtitle: string;
  cta_button_primary: string;
  cta_button_secondary: string;
}
