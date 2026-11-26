import type {
  CultureItem,
  CuisineItem,
  Destination,
  Experience,
  GalleryPhoto,
  ItineraryItem,
  Review,
} from '../types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'Request failed';
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  getDestinations: (params?: { search?: string; category?: string; featured?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.featured) query.set('featured', '1');
    const qs = query.toString();
    return request<{ destinations: Destination[] }>(`/api/destinations${qs ? `?${qs}` : ''}`);
  },

  getDestinationDetail: (slug: string) =>
    request<{ destination: Destination }>(`/api/destinations/${encodeURIComponent(slug)}`),

  createReview: (
    slug: string,
    payload: {
      author_name: string;
      author_country: string;
      rating: number;
      visit_season: string;
      title: string;
      comment: string;
    }
  ) =>
    request<{ review: Review; stats: { avg_rating: number; review_count: number } }>(
      `/api/destinations/${encodeURIComponent(slug)}/reviews`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  markReviewHelpful: (id: number) =>
    request<{ review: { id: number; helpful_count: number } }>(`/api/reviews/${id}/helpful`, {
      method: 'POST',
    }),

  deleteReview: (id: number) =>
    request<{ deletedId: number; stats: { avg_rating: number; review_count: number } }>(`/api/reviews/${id}`, {
      method: 'DELETE',
    }),

  getExperiences: (category?: string) => {
    const qs = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return request<{ experiences: Experience[] }>(`/api/experiences${qs}`);
  },

  getCulture: (category?: string) => {
    const qs = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return request<{ items: CultureItem[] }>(`/api/culture${qs}`);
  },

  getCuisine: (course?: string) => {
    const qs = course && course !== 'All' ? `?course=${encodeURIComponent(course)}` : '';
    return request<{ dishes: CuisineItem[] }>(`/api/cuisine${qs}`);
  },

  getGallery: (category?: string) => {
    const qs = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return request<{ photos: GalleryPhoto[] }>(`/api/gallery${qs}`);
  },

  likePhoto: (id: number) =>
    request<{ photo: { id: number; likes: number } }>(`/api/gallery/${id}/like`, {
      method: 'POST',
    }),

  getItinerary: (tripCode: string) =>
    request<{ trip_code: string; items: ItineraryItem[] }>(
      `/api/itinerary?trip_code=${encodeURIComponent(tripCode)}`
    ),

  addItineraryItem: (payload: {
    trip_code: string;
    item_type: 'destination' | 'experience';
    item_slug: string;
    day_number?: number;
    preferred_month?: string;
    notes?: string;
  }) =>
    request<{ item: ItineraryItem }>('/api/itinerary', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateItineraryItem: (
    id: number,
    payload: { day_number?: number; preferred_month?: string; notes?: string }
  ) =>
    request<{ item: ItineraryItem }>(`/api/itinerary/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteItineraryItem: (id: number) =>
    request<{ deletedId: number }>(`/api/itinerary/${id}`, {
      method: 'DELETE',
    }),

  submitInquiry: (payload: {
    full_name: string;
    email: string;
    travel_month: string;
    group_size: string;
    interests: string[];
    message: string;
  }) =>
    request<{
      inquiry: {
        reference_code: string;
        full_name: string;
        travel_month: string;
        group_size: string;
      };
    }>('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
