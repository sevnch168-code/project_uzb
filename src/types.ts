export interface Attraction {
  id: number;
  name: string;
  era: string;
  summary: string;
  highlight_tip: string;
  latitude: number;
  longitude: number;
}

export interface Review {
  id: number;
  destination_slug: string;
  author_name: string;
  author_country: string;
  rating: number;
  visit_season: string;
  title: string;
  comment: string;
  helpful_count: number;
  created_at: string;
}

export interface Experience {
  id: number;
  slug: string;
  title: string;
  destination_slug: string;
  city_name: string;
  category: string;
  duration: string;
  price_usd: number;
  season: string;
  summary: string;
  highlights: string[];
  image_url: string;
}

export interface Destination {
  id: number;
  slug: string;
  name: string;
  region: string;
  category: string;
  tagline: string;
  short_description: string;
  history_text: string;
  architecture_notes: string;
  best_time: string;
  recommended_days: string;
  unesco_year: string | null;
  elevation_m: number;
  latitude: number;
  longitude: number;
  hero_image: string;
  secondary_image: string;
  is_featured: number;
  travel_tips: string[];
  attractions: Attraction[];
  avg_rating: number;
  review_count: number;
  reviews?: Review[];
  experiences?: Experience[];
}

export interface CultureItem {
  id: number;
  slug: string;
  title: string;
  category: string;
  subtitle: string;
  region: string;
  description: string;
  heritage_note: string;
  image_url: string;
  sort_order: number;
}

export interface CuisineItem {
  id: number;
  slug: string;
  name: string;
  uzbek_name: string;
  origin_city: string;
  course_type: string;
  prep_time: string;
  description: string;
  cultural_background: string;
  key_ingredients: string[];
  image_url: string;
  sort_order: number;
}

export interface GalleryPhoto {
  id: number;
  title: string;
  category: string;
  location: string;
  destination_slug: string;
  photographer_credit: string;
  caption: string;
  image_url: string;
  likes: number;
  is_wide: number;
}

export interface ItineraryItem {
  id: number;
  trip_code: string;
  item_type: 'destination' | 'experience';
  item_slug: string;
  title: string;
  city: string;
  day_number: number;
  preferred_month: string;
  notes: string;
  image_url: string;
  created_at: string;
}
