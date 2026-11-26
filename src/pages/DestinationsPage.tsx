import { useEffect, useState } from 'react';
import { ArrowRight, MapPin, Plus, Search, Star } from 'lucide-react';
import { api } from '../lib/api';
import { useTrip } from '../context/TripContext';
import type { Destination } from '../types';
import { EditorialImage } from '../components/EditorialImage';

interface DestinationsPageProps {
  initialSearch?: string;
  onNavigate: (path: string) => void;
}

const CATEGORIES = ['All', 'Timurid Capitals', 'Oasis & Fortress', 'Modern & Mountain'];

export function DestinationsPage({ initialSearch = '', onNavigate }: DestinationsPageProps) {
  const { addStop } = useTrip();
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState('All');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await api.getDestinations({
          search: search.trim() || undefined,
          category: activeCategory !== 'All' ? activeCategory : undefined,
        });
        if (active) {
          setDestinations(res.destinations);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load destinations.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, activeCategory]);

  return (
    <div className="pt-24 pb-20 bg-[#F9F6F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-10 border-b border-[#E2D9C8]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
            Silk Road Destinations
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-[#0B1B32] text-balance">
            Ancient Cities & Caravan Oases
          </h1>
          <p className="text-base text-[#475569] leading-relaxed">
            Explore Samarkand, Bukhara, Khiva, Tashkent, and Shahrisabz—complete with historical context, monumental attractions, verified traveler reviews, and interactive trip planning.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EFE9DD] rounded-xl w-fit">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-white text-[#0B1B32] shadow-xs'
                    : 'text-[#475569] hover:text-[#0B1B32]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-[#0E7C86] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by city or landmark..."
              aria-label="Filter destinations"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D8CEBC] rounded-xl focus:outline-none focus:border-[#0E7C86]"
            />
          </div>
        </div>

        {/* Destinations List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-96 bg-white border border-[#E2D9C8] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-[#E2D9C8] rounded-2xl p-8 text-center">
            <p className="text-sm text-[#B91C1C]">{error}</p>
          </div>
        ) : destinations.length === 0 ? (
          <div className="bg-white border border-[#E2D9C8] rounded-2xl p-12 text-center space-y-3">
            <p className="font-serif text-2xl text-[#0B1B32]">No destinations match "{search}"</p>
            <p className="text-sm text-[#5B6778]">
              Try searching for Registan, Bukhara, Itchan Kala, Chorsu, or reset your filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setActiveCategory('All');
              }}
              className="px-4 py-2 text-sm font-medium bg-[#0E7C86] text-white rounded-lg cursor-pointer"
            >
              Show All Cities
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {destinations.map((dest) => (
              <article
                key={dest.slug}
                className="bg-white border border-[#E2D9C8] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
              >
                <div
                  onClick={() => onNavigate(`/destinations/${dest.slug}`)}
                  className="lg:col-span-5 aspect-[4/3] lg:aspect-auto overflow-hidden cursor-pointer relative group"
                >
                  <EditorialImage
                    src={dest.hero_image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5B6778]">
                      <span>
                        {dest.region} · {dest.category} · {dest.unesco_year || 'Historic Oasis'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-[#0B1B32] tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-[#C59B43] text-[#C59B43]" />
                        {dest.avg_rating} ({dest.review_count} reviews)
                      </span>
                    </div>

                    <h2
                      onClick={() => onNavigate(`/destinations/${dest.slug}`)}
                      className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B1B32] cursor-pointer hover:text-[#0E7C86] transition-colors"
                    >
                      {dest.name}
                    </h2>
                    <p className="text-sm font-medium text-[#0E7C86]">{dest.tagline}</p>
                    <p className="text-sm sm:text-base text-[#334155] leading-relaxed">
                      {dest.short_description}
                    </p>

                    {/* Main Attractions */}
                    <div className="pt-2">
                      <p className="text-xs uppercase tracking-wider text-[#5B6778] font-medium mb-2">
                        Main Attractions
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {dest.attractions.map((attr) => (
                          <div
                            key={attr.id}
                            className="p-3 rounded-xl bg-[#F9F6F0] border border-[#E2D9C8]"
                          >
                            <p className="font-serif text-base font-semibold text-[#0B1B32]">
                              {attr.name}
                            </p>
                            <p className="text-[11px] text-[#5B6778] tabular-nums">{attr.era}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#EFE9DD] flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-[#5B6778] tabular-nums">
                      Recommended: <span className="font-medium text-[#0B1B32]">{dest.recommended_days}</span> · Best: {dest.best_time}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/map?city=${dest.slug}`)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#F9F6F0] border border-[#D8CEBC] text-[#0B1B32] rounded-lg hover:border-[#0E7C86] transition-colors cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#0E7C86]" />
                        Map
                      </button>
                      <button
                        type="button"
                        onClick={() => addStop({ item_type: 'destination', item_slug: dest.slug })}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#F9F6F0] border border-[#D8CEBC] text-[#0B1B32] rounded-lg hover:border-[#0E7C86] transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add to Trip
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate(`/destinations/${dest.slug}`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#0E7C86] text-white rounded-lg hover:bg-[#095C64] transition-colors cursor-pointer"
                      >
                        View Details
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
