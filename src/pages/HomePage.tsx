import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Check,
  Compass,
  MapPin,
  Plus,
  Search,
  Star,
  Train,
  Utensils,
} from 'lucide-react';
import { api } from '../lib/api';
import { useTrip } from '../context/TripContext';
import type { CuisineItem, CultureItem, Destination, Experience, GalleryPhoto } from '../types';
import { EditorialImage } from '../components/EditorialImage';

interface HomePageProps {
  onNavigate: (path: string) => void;
}

const INTEREST_OPTIONS = [
  'Architecture & UNESCO Sites',
  'Culinary & Plov Trail',
  'Artisan Ceramics & Silk',
  'Desert Yurts & Mountains',
];

export function HomePage({ onNavigate }: HomePageProps) {
  const { addStop } = useTrip();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [cultureItems, setCultureItems] = useState<CultureItem[]>([]);
  const [cuisineItems, setCuisineItems] = useState<CuisineItem[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Inquiry form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [travelMonth, setTravelMonth] = useState('April 2027');
  const [groupSize, setGroupSize] = useState('2 Travelers');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Architecture & UNESCO Sites',
  ]);
  const [message, setMessage] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [inquiryRef, setInquiryRef] = useState('');
  const [inquiryError, setInquiryError] = useState('');

  useEffect(() => {
    Promise.all([
      api.getDestinations({ featured: true }),
      api.getExperiences(),
      api.getCulture(),
      api.getCuisine(),
      api.getGallery(),
    ])
      .then(([destRes, expRes, cultRes, cuisRes, galRes]) => {
        setDestinations(destRes.destinations);
        setExperiences(expRes.experiences.slice(0, 4));
        setCultureItems(cultRes.items);
        setCuisineItems(cuisRes.dishes.slice(0, 4));
        setGalleryPhotos(galRes.photos.slice(0, 5));
      })
      .catch((err) => console.error('Error loading homepage data:', err));
  }, []);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.getDestinations({ search: trimmed });
        setSearchResults(res.destinations);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 180);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      onNavigate(`/destinations?search=${encodeURIComponent(q)}`);
    } else {
      onNavigate('/destinations');
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]
    );
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryStatus('submitting');
    setInquiryError('');
    try {
      const res = await api.submitInquiry({
        full_name: fullName,
        email,
        travel_month: travelMonth,
        group_size: groupSize,
        interests: selectedInterests,
        message,
      });
      setInquiryRef(res.inquiry.reference_code);
      setInquiryStatus('success');
      setFullName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      setInquiryStatus('error');
      setInquiryError(err instanceof Error ? err.message : 'Unable to send request.');
    }
  };

  const leadDestinations = destinations.slice(0, 2);
  const secondaryDestinations = destinations.slice(2, 5);
  const festivalItems = cultureItems.filter((c) => c.category === 'Festivals');
  const craftItems = cultureItems.filter((c) => c.category !== 'Festivals').slice(0, 3);

  return (
    <div className="bg-[#F9F6F0] text-[#0F1D30]">
      {/* 1. FULL-SCREEN HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-end pb-14 sm:pb-20 pt-28 overflow-hidden bg-[#0B1B32]">
        <div className="absolute inset-0">
          <EditorialImage
            src="/src/assets/images/hero_registan_samarkand_1795670679164.jpg"
            alt="Registan Square illuminated at twilight in Samarkand, Uzbekistan"
            loading="eager"
            className="w-full h-full object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0B1B32]/92 via-[#0B1B32]/48 to-[#0B1B32]/35"
            aria-hidden="true"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full">
          <div className="max-w-3xl space-y-6">
            <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-[#E6C574] font-medium">
              Central Asia · Ancient Silk Road Heritage
            </p>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.06] text-balance">
              Discover the Magic of Uzbekistan
            </h1>
            <p className="text-base sm:text-xl text-[#E5E7EB] leading-relaxed max-w-2xl">
              Explore Ancient Cities, Rich Culture and Timeless Traditions.
            </p>

            {/* Search & Primary CTA */}
            <div className="pt-2 space-y-4">
              <form
                onSubmit={handleHeroSearchSubmit}
                className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 p-2 rounded-xl bg-white/95 backdrop-blur-md border border-[#E2D9C8] shadow-2xl max-w-2xl"
              >
                <div className="flex items-center gap-3 flex-1 px-3 py-1.5 min-w-0">
                  <Search className="w-4 h-4 text-[#0E7C86] shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Samarkand, Registan, Bukhara, Khiva, Chorsu..."
                    aria-label="Search destinations in Uzbekistan"
                    className="w-full bg-transparent text-sm text-[#0F1D30] placeholder:text-[#64748B] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 text-sm font-medium bg-[#0E7C86] text-white rounded-lg hover:bg-[#095C64] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Search Destinations
                </button>

                {/* Live Search Dropdown */}
                {searchQuery.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#E2D9C8] rounded-xl shadow-xl overflow-hidden z-30">
                    {isSearching ? (
                      <div className="px-4 py-3 text-xs text-[#64748B]">Searching Silk Road archive...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-[#64748B]">
                        No matching cities found. Press search to browse all destinations.
                      </div>
                    ) : (
                      <ul className="divide-y divide-[#EFE9DD]">
                        {searchResults.map((dest) => (
                          <li key={dest.slug}>
                            <button
                              type="button"
                              onClick={() => onNavigate(`/destinations/${dest.slug}`)}
                              className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-[#F9F6F0] text-left transition-colors cursor-pointer"
                            >
                              <div className="min-w-0">
                                <p className="font-serif text-base font-semibold text-[#0B1B32]">
                                  {dest.name}
                                </p>
                                <p className="text-xs text-[#5B6778] truncate">
                                  {dest.region} · {dest.attractions.map((a) => a.name).join(', ')}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-[#0E7C86] shrink-0" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </form>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('/destinations')}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium bg-[#C59B43] text-[#0B1B32] rounded-lg hover:bg-[#D5AE59] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Explore Destinations
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/map')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#E6C574]" />
                  Interactive Silk Road Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Orientation Ribbon */}
      <section className="bg-[#0B1B32] text-[#E6E0D4] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 grid grid-cols-2 lg:grid-cols-4 gap-6 text-xs sm:text-sm">
          <div className="space-y-0.5">
            <p className="text-[#C59B43] font-medium tabular-nums">5 Historic Cities</p>
            <p className="text-[#B8C0CC]">Samarkand, Bukhara, Khiva, Tashkent & Shahrisabz</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[#C59B43] font-medium tabular-nums">2,750+ Years</p>
            <p className="text-[#B8C0CC]">Continuous Silk Road scholarship & architecture</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[#C59B43] font-medium tabular-nums">2h 10m Rail</p>
            <p className="text-[#B8C0CC]">Afrosiyob bullet train linking Tashkent to Samarkand</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[#C59B43] font-medium tabular-nums">4 UNESCO Ensembles</p>
            <p className="text-[#B8C0CC]">Protected historic centers & living crafts</p>
          </div>
        </div>
      </section>

      {/* 2. FEATURED DESTINATIONS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
              Historic Oasis Cities
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#0B1B32] text-balance">
              Featured Silk Road Destinations
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/destinations')}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0E7C86] hover:text-[#095C64] whitespace-nowrap shrink-0 cursor-pointer"
          >
            View All Destinations
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Top Row: 2 Lead Editorial Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {leadDestinations.map((dest) => (
            <article
              key={dest.slug}
              className="group bg-white border border-[#E2D9C8] rounded-2xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div
                onClick={() => onNavigate(`/destinations/${dest.slug}`)}
                className="relative aspect-[16/10] overflow-hidden cursor-pointer"
              >
                <EditorialImage
                  src={dest.hero_image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B32]/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
                  <div>
                    <p className="text-xs text-[#E6C574] font-medium">
                      {dest.region} · {dest.unesco_year || 'Heritage City'}
                    </p>
                    <h3 className="font-serif text-3xl font-semibold">{dest.name}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium tabular-nums">
                    <Star className="w-4 h-4 fill-[#C59B43] text-[#C59B43]" />
                    {dest.avg_rating}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                <div className="space-y-2.5">
                  <p className="text-xs text-[#5B6778] tabular-nums">
                    {dest.recommended_days} · Best in {dest.best_time}
                  </p>
                  <p className="text-sm sm:text-base text-[#334155] leading-relaxed">
                    {dest.short_description}
                  </p>
                  <p className="text-xs text-[#0E7C86] font-medium">
                    Highlights: {dest.attractions.map((a) => a.name).join(' · ')}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#EFE9DD] flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/destinations/${dest.slug}`)}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0B1B32] hover:text-[#0E7C86] cursor-pointer"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => addStop({ item_type: 'destination', item_slug: dest.slug })}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#F9F6F0] border border-[#D8CEBC] text-[#0B1B32] rounded-lg hover:border-[#0E7C86] hover:text-[#0E7C86] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Trip
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Second Row: 3 Oasis & Imperial Cities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {secondaryDestinations.map((dest) => (
            <article
              key={dest.slug}
              className="group bg-white border border-[#E2D9C8] rounded-2xl overflow-hidden flex flex-col transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div
                onClick={() => onNavigate(`/destinations/${dest.slug}`)}
                className="relative aspect-[4/3] overflow-hidden cursor-pointer"
              >
                <EditorialImage
                  src={dest.hero_image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-[#5B6778]">
                    <span>
                      {dest.region} · {dest.recommended_days}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-[#0B1B32] tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-[#C59B43] text-[#C59B43]" />
                      {dest.avg_rating}
                    </span>
                  </div>
                  <h3
                    onClick={() => onNavigate(`/destinations/${dest.slug}`)}
                    className="font-serif text-2xl font-semibold text-[#0B1B32] cursor-pointer hover:text-[#0E7C86] transition-colors"
                  >
                    {dest.name}
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed line-clamp-3">
                    {dest.short_description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EFE9DD] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/destinations/${dest.slug}`)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[#0E7C86] hover:text-[#095C64] cursor-pointer"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => addStop({ item_type: 'destination', item_slug: dest.slug })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg hover:border-[#0E7C86] hover:text-[#0E7C86] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. POPULAR EXPERIENCES */}
      <section className="bg-[#EFE9DD]/70 border-y border-[#E2D9C8] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
                Curated Encounters
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#0B1B32] text-balance">
                Popular Silk Road Experiences
              </h2>
            </div>
            <p className="text-sm text-[#475569] max-w-md">
              From golden-hour astronomical walks in Samarkand to Kyzylkum desert yurts and artisan ateliers, add any experience straight to your itinerary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experiences.map((exp) => (
              <article
                key={exp.slug}
                className="bg-white border border-[#E2D9C8] rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] overflow-hidden">
                    <EditorialImage
                      src={exp.image_url}
                      alt={exp.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <p className="text-xs text-[#5B6778] tabular-nums">
                      {exp.city_name} · {exp.duration} · ${exp.price_usd}
                    </p>
                    <h3 className="font-serif text-xl font-semibold text-[#0B1B32] leading-snug">
                      {exp.title}
                    </h3>
                    <p className="text-sm text-[#475569] leading-relaxed">{exp.summary}</p>
                  </div>
                </div>
                <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/destinations/${exp.destination_slug}`)}
                    className="text-xs font-medium text-[#475569] hover:text-[#0B1B32] cursor-pointer"
                  >
                    Explore {exp.city_name.split(' ')[0]}
                  </button>
                  <button
                    type="button"
                    onClick={() => addStop({ item_type: 'experience', item_slug: exp.slug })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-[#0E7C86] text-white rounded-lg hover:bg-[#095C64] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Trip
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CULTURE & CULTURAL FESTIVALS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
                Living Heritage & Traditions
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#0B1B32] text-balance">
                Craftsmanship, Music & Timeless Rituals
              </h2>
              <p className="text-base text-[#334155] leading-relaxed">
                Across Bukhara’s trading domes, Rishtan’s ceramic kilns, and Margilan’s silk looms, ancient craft guilds continue unbroken. Discover hand-embroidered Suzani textiles, Shashmaqam classical melodies, and warm tea-house hospitality.
              </p>
            </div>

            <div className="divide-y divide-[#E2D9C8] border-y border-[#E2D9C8]">
              {craftItems.map((item) => (
                <div key={item.slug} className="py-4">
                  <p className="text-xs text-[#0E7C86] font-medium">
                    {item.category} · {item.region}
                  </p>
                  <h3 className="font-serif text-xl font-semibold text-[#0B1B32] mt-0.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#475569] mt-1">{item.subtitle}</p>
                </div>
              ))}
            </div>

            <div>
              <button
                type="button"
                onClick={() => onNavigate('/culture')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium bg-[#0B1B32] text-white rounded-lg hover:bg-[#173052] transition-colors cursor-pointer"
              >
                Explore Culture & Traditions
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden border border-[#E2D9C8] bg-white flex flex-col">
              <div className="aspect-[4/3] overflow-hidden">
                <EditorialImage
                  src="/src/assets/images/culture_clothing_suzani_1795670682175.jpg"
                  alt="Handwoven silk ikat robes and pomegranate Suzani embroidery"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 space-y-1.5">
                <p className="text-xs text-[#5B6778]">Margilan & Bukhara</p>
                <h3 className="font-serif text-2xl font-semibold text-[#0B1B32]">
                  Silk Ikat & Suzani Needlework
                </h3>
                <p className="text-sm text-[#475569]">
                  Resist-dyed abrbandi silks and pomegranate-motived wedding textiles.
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-[#E2D9C8] bg-white flex flex-col">
              <div className="aspect-[4/3] overflow-hidden">
                <EditorialImage
                  src="/src/assets/images/culture_rishtan_ceramics_1795670682154.jpg"
                  alt="Traditional Rishtan turquoise and cobalt glazed ceramics"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 space-y-1.5">
                <p className="text-xs text-[#5B6778]">Fergana Valley</p>
                <h3 className="font-serif text-2xl font-semibold text-[#0B1B32]">
                  Rishtan Mineral Ceramics
                </h3>
                <p className="text-sm text-[#475569]">
                  Hand-painted plates glazed with natural mountain plant-ash pigments.
                </p>
              </div>
            </div>

            {/* Cultural Festivals Feature */}
            {festivalItems.length > 0 && (
              <div className="sm:col-span-2 rounded-2xl overflow-hidden border border-[#E2D9C8] bg-[#0B1B32] text-white grid grid-cols-1 sm:grid-cols-12">
                <div className="sm:col-span-5 aspect-[4/3] sm:aspect-auto">
                  <EditorialImage
                    src="/src/assets/images/culture_navruz_festival_1795670683512.jpg"
                    alt="Navruz spring festival celebrations with karnay horns in Uzbekistan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="sm:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-3">
                  <p className="text-xs uppercase tracking-widest text-[#E6C574]">
                    Cultural Festivals · Navruz & Sharq Taronalari
                  </p>
                  <h3 className="font-serif text-2xl sm:text-3xl font-semibold">
                    Seasons of Music, Blossoms & Renewal
                  </h3>
                  <p className="text-sm text-[#CBD5E1] leading-relaxed">
                    {festivalItems[0].description}
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => onNavigate('/culture')}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-[#E6C574] hover:underline cursor-pointer"
                    >
                      Read Festival Calendar
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. TRADITIONAL FOOD SHOWCASE */}
      <section className="bg-[#0B1B32] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-[#E6C574] font-medium">
                Culinary Heritage
              </p>
              <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-white text-balance">
                Flavors of the Uzbek Table
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/cuisine')}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#E6C574] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Explore All 7 National Dishes
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cuisineItems.map((dish) => (
              <article
                key={dish.slug}
                onClick={() => onNavigate('/cuisine')}
                className="group bg-[#122642] border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <EditorialImage
                    src={dish.image_url}
                    alt={`${dish.name} — ${dish.uzbek_name}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <p className="text-xs text-[#E6C574]">
                    {dish.origin_city} · {dish.uzbek_name}
                  </p>
                  <h3 className="font-serif text-2xl font-semibold text-white">{dish.name}</h3>
                  <p className="text-sm text-[#CBD5E1] leading-relaxed line-clamp-3">
                    {dish.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PHOTO GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
              Visual Archive
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#0B1B32] text-balance">
              Moments Across the Oasis
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/gallery')}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0E7C86] hover:text-[#095C64] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Open Interactive Gallery
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleryPhotos.map((photo, idx) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onNavigate('/gallery')}
              className={`group relative overflow-hidden rounded-2xl border border-[#E2D9C8] text-left cursor-pointer ${
                idx === 0 ? 'sm:col-span-2 sm:row-span-2 aspect-[4/3] sm:aspect-auto' : 'aspect-[4/3]'
              }`}
            >
              <EditorialImage
                src={photo.image_url}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B32]/85 via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[11px] text-[#E6C574]">
                  {photo.category} · {photo.location}
                </p>
                <p className="font-serif text-lg sm:text-xl font-medium">{photo.title}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 7. TRAVEL RECOMMENDATIONS & JOURNEY CONCIERGE */}
      <section className="bg-[#EFE9DD]/75 border-t border-[#E2D9C8] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Travel Recommendations */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
                Practical Intelligence
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B1B32] text-balance">
                Travel Recommendations for the Silk Road
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-[#E2D9C8] rounded-xl p-5 flex items-start gap-4">
                <Calendar className="w-5 h-5 text-[#0E7C86] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#0B1B32]">
                    Best Seasons to Visit
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed mt-1">
                    Spring (April–May) brings mild 22–28°C days, Navruz blossoms, and desert wildflowers. Autumn (September–October) offers crisp golden light and harvest bazaars bursting with melons and pomegranates.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#E2D9C8] rounded-xl p-5 flex items-start gap-4">
                <Train className="w-5 h-5 text-[#0E7C86] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#0B1B32]">
                    High-Speed Rail Across Ancient Oases
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed mt-1">
                    Travel between Tashkent, Samarkand, and Bukhara aboard the Afrosiyob high-speed train (up to 250 km/h), then continue west overnight or by short regional flight to Khiva’s Urgench gateway.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#E2D9C8] rounded-xl p-5 flex items-start gap-4">
                <Utensils className="w-5 h-5 text-[#0E7C86] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#0B1B32]">
                    Etiquette, Dress & Bazaar Customs
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed mt-1">
                    Cover shoulders and knees when entering active mosques such as Shah-i-Zinda or Khast Imam. Carry small Uzbekistani Som bills for Chorsu Bazaar spices, and always accept bread with both hands.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-[#E2D9C8] rounded-xl p-5 flex items-start gap-4">
                <Compass className="w-5 h-5 text-[#0E7C86] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#0B1B32]">
                    Suggested 9-Day Route
                  </h3>
                  <p className="text-sm text-[#475569] leading-relaxed mt-1">
                    Days 1–2 Tashkent → Days 3–5 Samarkand (with day trip to Shahrisabz) → Days 6–7 Bukhara → Days 8–9 Khiva Itchan Kala.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Persistent SQLite Travel Inquiry Form */}
          <div className="lg:col-span-6 bg-white border border-[#E2D9C8] rounded-2xl p-6 sm:p-8">
            <div className="space-y-1.5 mb-6">
              <p className="text-xs uppercase tracking-widest text-[#C59B43] font-medium">
                Personalized Route Advice
              </p>
              <h3 className="font-serif text-3xl font-semibold text-[#0B1B32]">
                Request Tailored Travel Recommendations
              </h3>
              <p className="text-sm text-[#5B6778]">
                Save your travel preferences to receive a curated city-by-city Silk Road dossier.
              </p>
            </div>

            {inquiryStatus === 'success' ? (
              <div className="rounded-xl bg-[#F9F6F0] border border-[#0E7C86]/30 p-6 space-y-3">
                <div className="inline-flex items-center gap-2 text-[#0E7C86] font-medium text-sm">
                  <Check className="w-5 h-5" />
                  Request Saved Successfully
                </div>
                <p className="font-serif text-2xl text-[#0B1B32]">
                  Reference Code: <span className="tabular-nums">{inquiryRef}</span>
                </p>
                <p className="text-sm text-[#475569]">
                  Your Uzbekistan travel preferences have been recorded in our SQLite archive. Continue exploring cities or customize your route in the Trip Planner.
                </p>
                <button
                  type="button"
                  onClick={() => setInquiryStatus('idle')}
                  className="px-4 py-2 text-xs font-medium bg-[#0B1B32] text-white rounded-lg hover:bg-[#173052] cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-xs font-medium text-[#334155]">
                    Full Name
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Amina Karimova"
                      className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
                    />
                  </label>
                  <label className="block text-xs font-medium text-[#334155]">
                    Email Address
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="traveler@example.com"
                      className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-xs font-medium text-[#334155]">
                    Preferred Season
                    <select
                      value={travelMonth}
                      onChange={(e) => setTravelMonth(e.target.value)}
                      className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
                    >
                      <option>April 2027</option>
                      <option>May 2027</option>
                      <option>September 2027</option>
                      <option>October 2027</option>
                      <option>March 2027 (Navruz)</option>
                    </select>
                  </label>
                  <label className="block text-xs font-medium text-[#334155]">
                    Party Size
                    <select
                      value={groupSize}
                      onChange={(e) => setGroupSize(e.target.value)}
                      className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
                    >
                      <option>Solo Traveler</option>
                      <option>2 Travelers</option>
                      <option>3–5 Travelers</option>
                      <option>6+ Cultural Group</option>
                    </select>
                  </label>
                </div>

                <div>
                  <span className="block text-xs font-medium text-[#334155] mb-2">
                    Focus Areas
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {INTEREST_OPTIONS.map((opt) => {
                      const active = selectedInterests.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => toggleInterest(opt)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#0E7C86] text-white border-[#0E7C86]'
                              : 'bg-[#F9F6F0] text-[#334155] border-[#D8CEBC] hover:border-[#0E7C86]'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="block text-xs font-medium text-[#334155]">
                  Cities & Interests
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us which Silk Road cities, artisan workshops, or dishes you would like to prioritize..."
                    className="mt-1.5 w-full px-3.5 py-2.5 text-sm bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
                  />
                </label>

                {inquiryStatus === 'error' && (
                  <p className="text-xs text-[#B91C1C]" role="alert">
                    {inquiryError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={inquiryStatus === 'submitting'}
                  className="w-full py-3 px-5 text-sm font-medium bg-[#0E7C86] text-white rounded-lg hover:bg-[#095C64] transition-colors disabled:opacity-60 cursor-pointer"
                >
                  {inquiryStatus === 'submitting' ? 'Saving Request...' : 'Request Travel Recommendations'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
