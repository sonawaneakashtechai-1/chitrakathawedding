-- ==============================================================================
-- CHITRAKATHA BY HEMANT - SUPABASE SEED DATA
-- ==============================================================================

-- 1. SEED SERVICES
INSERT INTO services (title, slug, description, image_url, sort_order) VALUES
('Wedding Photography', 'wedding-photography', 'Capturing genuine emotions, sacred rituals, grand celebrations and unforgettable candid moments.', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200', 1),
('Pre-Wedding Shoots', 'pre-wedding-shoots', 'Romantic, cinematic and deeply personalized visual stories created around your natural chemistry.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200', 2),
('Fashion Editorial', 'fashion-editorial', 'High-end editorial aesthetics focused on styling, couture personality, dynamic composition and lighting.', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200', 3),
('Drone Aerial Cinema', 'drone-aerial-cinema', 'Sweeping 4K aerial perspectives documenting heritage venues, grand entries, baraats and scenic landscapes.', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1200', 4),
('Cinematic Video Films', 'cinematic-video-films', 'Emotion-driven wedding and event teaser films cut like breathtaking cinematic narratives.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200', 5),
('Photo & Video Retouching', 'photo-video-retouching', 'Master-level color grading, skin texture retouching, and cinematic audio-visual finishing.', 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1200', 6)
ON CONFLICT (slug) DO NOTHING;

-- 2. SEED PROJECTS
INSERT INTO projects (title, slug, category, description, location, event_date, cover_image, featured) VALUES
('The Royal Peshwa Marathi Wedding', 'the-royal-peshwa-marathi-wedding', 'Weddings', 'A soulful celebration of Maharashtrian heritage with traditional Nauvari silk, Mundavalya, and joyous mangalashtak moments.', 'Satana, Nashik', 'February 2026', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200', true),
('Forever Begins in the Vineyards', 'forever-begins-in-the-vineyards', 'Pre-Wedding', 'Sunset hues and intimate romantic portraits amidst the sprawling vineyard hills of Nashik.', 'Sula Vineyards, Nashik', 'January 2026', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200', true),
('Heritage Silk & Gold Couture', 'heritage-silk-gold-couture', 'Fashion', 'An editorial tribute to handcrafted Paithani silks, antique temple jewelry, and timeless Indian silhouettes.', 'Pune, Maharashtra', 'December 2025', 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200', true),
('Fortress of Eternal Vows', 'fortress-of-eternal-vows', 'Weddings', 'Grand regal wedding set against historic stone arches with vibrant baraat fireworks and emotional pheras.', 'Jadhavgadh, Pune', 'November 2025', 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=1200', true),
('Echoes of Golden Hour', 'echoes-of-golden-hour', 'Pre-Wedding', 'Misty lakeside dawn and candid embrace captured in rich warm monochrome and amber light.', 'Bhandardara, Maharashtra', 'October 2025', 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=1200', false),
('Symphony of Sacred Fire', 'symphony-of-sacred-fire', 'Weddings', 'Intimate candid rituals, saptapadi steps, and the tearful joy of parents sending their daughter into a new dawn.', 'Satana, Maharashtra', 'September 2025', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200', true),
('Monochrome Velvet Nocturne', 'monochrome-velvet-nocturne', 'Fashion', 'Contemporary fashion portraiture exploring deep shadows, sharp studio lighting, and high-fashion attitude.', 'Mumbai, Maharashtra', 'August 2025', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200', false),
('Distant Horizons Aerial Film', 'distant-horizons-aerial-film', 'Cinema', 'Sweeping drone footage showcasing a majestic hilltop destination wedding venue bathed in dawn light.', 'Lonavala, Maharashtra', 'July 2025', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1200', true)
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED FILMS
INSERT INTO films (title, description, thumbnail_url, video_url, category, featured) VALUES
('The Marathi Heritage Vows | Teaser Film', 'An emotional cinematic teaser capturing the soulful rituals, Shehnai melodies, and timeless glances of Tanvi & Aditya in Nashik.', 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Wedding Film', true),
('Love in the Golden Hills | Cinematic Pre-Wedding', 'A poetic pre-wedding film set across the misty hill stations and golden fields of Maharashtra.', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Pre-Wedding Film', true),
('Palace Grandeur | Aerial & Highlight Film', 'Grand 4K cinematic highlights featuring royal baraat celebrations, firework spectacles, and sacred pheras.', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Cinematic Highlight', true)
ON CONFLICT DO NOTHING;

-- 4. SEED TESTIMONIALS
INSERT INTO testimonials (client_name, testimonial, event_type, image_url, rating, approved) VALUES
('Pooja & Rohan Shinde', 'Hemant and the Chitrakatha team captured our wedding so naturally! Looking back at our album brings tears of joy. Every single smile, ritual, and candid hug was documented with pure cinematic perfection.', 'Traditional Wedding, Satana', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', 5, true),
('Snehal & Nikhil Patil', 'The pre-wedding shoot in Nashik felt like a movie! Hemant made us feel completely relaxed in front of the lens. His eye for golden hour lighting and storytelling is truly unmatched.', 'Pre-Wedding Shoot, Nashik', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', 5, true),
('Dr. Aniket & Neha Kulkarni', 'From our Haldi to the Vidai, Chitrakatha captured the purest raw emotions without being intrusive. Our wedding film is a treasure we will cherish for generations. Highly recommended!', 'Grand Wedding, Pune', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300', 5, true)
ON CONFLICT DO NOTHING;
