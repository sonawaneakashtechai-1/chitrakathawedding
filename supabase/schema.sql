-- ==============================================================================
-- CHITRAKATHA BY HEMANT - COMPLETE SUPABASE DATABASE SCHEMA & SEED
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SITE SETTINGS TABLE (Single row CMS config)
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    marathi_brand_mark TEXT DEFAULT 'चित्रकथा',
    brand_name TEXT DEFAULT 'CHITRAKATHA',
    sub_brand_text TEXT DEFAULT 'BY HEMANT',
    phone_number TEXT DEFAULT '7249532553',
    whatsapp_number TEXT DEFAULT '7249532553',
    email_address TEXT DEFAULT 'clicksbyhemant5564@gmail.com',
    studio_location TEXT DEFAULT 'Satana, Nashik, Maharashtra',
    
    hero_title TEXT DEFAULT 'CHITRAKATHA',
    hero_tagline TEXT DEFAULT 'Premium Wedding Photography & Cinematic Stories',
    hero_description TEXT DEFAULT 'Capturing emotions, traditions and unforgettable moments across Maharashtra.',
    hero_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=85&w=1920',
    hero_cta_primary TEXT DEFAULT 'BOOK YOUR SHOOT',
    hero_cta_secondary TEXT DEFAULT 'WHATSAPP NOW',

    founder_name TEXT DEFAULT 'Hemant Mandawade',
    founder_title TEXT DEFAULT 'Founder & Lead Photographer',
    experience_badge TEXT DEFAULT '12+ YEARS OF TRUST',
    stat_weddings TEXT DEFAULT '550+',
    stat_cities TEXT DEFAULT '35+',
    stat_satisfaction TEXT DEFAULT '99%',
    stat_films TEXT DEFAULT '480+',
    mission_text TEXT DEFAULT 'To preserve the sacred beauty, emotional depth and timeless traditions of Indian celebrations through authentic, cinematic imagery.',
    vision_text TEXT DEFAULT 'To be Maharashtra''s most trusted storytelling photography studio, transforming fleeting moments into heirloom art.',
    coverage_text TEXT DEFAULT 'Satana, Nashik, Pune, Mumbai, Dhule, Malegaon & across Maharashtra.',

    drone_heading TEXT DEFAULT 'Drone & Aerial Photography',
    drone_subtitle TEXT DEFAULT 'Breathtaking high-altitude perspectives for forts, palaces, beaches across Maharashtra.',
    drone_image_url TEXT DEFAULT 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1600',

    instagram_heading TEXT DEFAULT 'Follow Our Stories',
    instagram_username TEXT DEFAULT '@chitrakatha_by_hemant',
    instagram_profile_url TEXT DEFAULT 'https://instagram.com',

    cta_heading TEXT DEFAULT 'Let''s Capture Your Beautiful Story',
    cta_subtitle TEXT DEFAULT 'Dates for the upcoming wedding season are filling quickly across Maharashtra. Reserve your dates today.',
    cta_button_primary TEXT DEFAULT 'BOOK YOUR SHOOT',
    cta_button_secondary TEXT DEFAULT 'WHATSAPP NOW',
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    coverImage TEXT NOT NULL,
    displayOrder INT DEFAULT 0,
    hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PORTFOLIO ITEMS TABLE
CREATE TABLE IF NOT EXISTS portfolio_items (
    id TEXT PRIMARY KEY,
    categoryId TEXT REFERENCES categories(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT NOT NULL,
    altText TEXT,
    location TEXT,
    date TEXT,
    featured BOOLEAN DEFAULT true,
    hidden BOOLEAN DEFAULT false,
    displayOrder INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    icon TEXT,
    sort_order INT DEFAULT 0,
    hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FAQS TABLE
CREATE TABLE IF NOT EXISTS faqs (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    testimonial TEXT NOT NULL,
    event_type TEXT NOT NULL,
    image_url TEXT,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FILMS TABLE
CREATE TABLE IF NOT EXISTS films (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT NOT NULL,
    video_url TEXT NOT NULL,
    category TEXT DEFAULT 'Wedding Film',
    featured BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    custom_id TEXT DEFAULT 'ENQ-1001',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_date TEXT,
    location TEXT,
    budget TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'confirmed', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE films ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- Allow public read and client enquiry inserts
DROP POLICY IF EXISTS "Public site_settings read" ON site_settings;
CREATE POLICY "Public site_settings read" ON site_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public categories read" ON categories;
CREATE POLICY "Public categories read" ON categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public portfolio_items read" ON portfolio_items;
CREATE POLICY "Public portfolio_items read" ON portfolio_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public services read" ON services;
CREATE POLICY "Public services read" ON services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public faqs read" ON faqs;
CREATE POLICY "Public faqs read" ON faqs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public testimonials read" ON testimonials;
CREATE POLICY "Public testimonials read" ON testimonials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public films read" ON films;
CREATE POLICY "Public films read" ON films FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public enquiries read and insert" ON enquiries;
CREATE POLICY "Public enquiries read and insert" ON enquiries FOR ALL USING (true) WITH CHECK (true);

-- INITIAL SEED DATA
INSERT INTO site_settings (marathi_brand_mark, brand_name, sub_brand_text, phone_number, whatsapp_number, email_address, studio_location)
VALUES ('चित्रकथा', 'CHITRAKATHA', 'BY HEMANT', '7249532553', '7249532553', 'clicksbyhemant5564@gmail.com', 'Satana, Nashik, Maharashtra')
ON CONFLICT DO NOTHING;

INSERT INTO categories (id, name, slug, coverImage, displayOrder, hidden) VALUES
('cat-wedding', 'Wedding', 'wedding', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800', 1, false),
('cat-prewedding', 'Pre-Wedding', 'pre-wedding', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800', 2, false),
('cat-engagement', 'Engagement', 'engagement', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800', 3, false),
('cat-birthday', 'Birthday', 'birthday', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=800', 4, false),
('cat-babyshoot', 'Baby Shoot', 'baby-shoot', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=800', 5, false),
('cat-maternity', 'Maternity', 'maternity', 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800', 6, false),
('cat-fashion', 'Fashion', 'fashion', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800', 7, false),
('cat-events', 'Events', 'events', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800', 8, false),
('cat-portrait', 'Portrait', 'portrait', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800', 9, false),
('cat-product', 'Product', 'product', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800', 10, false),
('cat-drone', 'Drone', 'drone', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800', 11, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO portfolio_items (id, categoryId, category, title, description, image, location, date, featured) VALUES
('img-w1', 'cat-wedding', 'Wedding', 'The Royal Peshwa Maharashtrian Vows', 'Traditional Nauvari silk saree and Mundavalya rituals.', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200', 'Satana, Nashik', 'February 2026', true),
('img-w2', 'cat-wedding', 'Wedding', 'Heritage Fort Wedding Celebration', 'Grand royal palace setting with festive baraat.', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=1200', 'Pune, MH', 'January 2026', true),
('img-pw1', 'cat-prewedding', 'Pre-Wedding', 'Sunset Love Stories in Mahabaleshwar', 'Misty hill station couple portrait session at sunset.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200', 'Mahabaleshwar, MH', 'February 2026', true),
('img-pw2', 'cat-prewedding', 'Pre-Wedding', 'Golden Hour Vineyard Romance in Sula', 'Romantic stroll amidst sunlit vineyards.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200', 'Sula Vineyards, Nashik', 'January 2026', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO services (id, title, slug, description, image_url, sort_order) VALUES
('s1', 'Wedding Photography', 'wedding-photography', 'Capturing genuine emotions, traditions, celebrations and unforgettable moments.', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200', 1),
('s2', 'Pre-Wedding Shoots', 'pre-wedding-shoots', 'Romantic, cinematic stories created around your chemistry.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200', 2),
('s3', 'Fashion Editorial', 'fashion-editorial', 'Editorial photography focused on style and personality.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200', 3),
('s4', 'Drone Aerial Cinema', 'drone-aerial-cinema', 'Breathtaking 4K high-altitude aerial perspectives.', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1200', 4),
('s5', 'Cinematic Video Films', 'cinematic-video-films', 'Emotion-driven wedding and event films.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200', 5),
('s6', 'Photo & Video Retouching', 'photo-video-retouching', 'Professional color grading and finishing.', 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1200', 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO faqs (id, question, answer, sort_order, published) VALUES
('faq-1', 'What photography packages do you offer?', 'We provide bespoke packages for Weddings, Pre-Weddings, Engagements, and Cinematic Films with dedicated lead photographers and drone coverage.', 1, true),
('faq-2', 'Do you travel outside Nashik?', 'Yes! We regularly document weddings across Maharashtra including Pune, Mumbai, Kolhapur, Aurangabad, and all across India.', 2, true),
('faq-3', 'Do you provide cinematic wedding films?', 'Yes, we produce 4K wedding teaser films, full-length documentary films, and emotional ceremony highlights.', 3, true),
('faq-4', 'Do you offer drone photography?', 'Yes, we capture 4K aerial perspectives of wedding venues and grand entries.', 4, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO enquiries (custom_id, full_name, email, phone, event_type, event_date, location, budget, message, status)
VALUES ('ENQ-1001', 'Rahul Deshmukh', 'rahul.deshmukh@example.com', '9822012345', 'Wedding', '2026-11-20', 'Pune', '₹2,50,000 - ₹4,00,000', 'Looking for 3-day royal Maharashtrian wedding coverage.', 'confirmed')
ON CONFLICT DO NOTHING;
