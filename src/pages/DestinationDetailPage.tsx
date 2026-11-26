import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Compass,
  MapPin,
  Plus,
  Star,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { api } from '../lib/api';
import { useTrip } from '../context/TripContext';
import type { Destination, Review } from '../types';
import { EditorialImage } from '../components/EditorialImage';

interface DestinationDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
}

export function DestinationDetailPage({ slug, onNavigate }: DestinationDetailPageProps) {
  const { addStop } = useTrip();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // New review form state
  const [authorName, setAuthorName] = useState('');
  const [authorCountry, setAuthorCountry] = useState('');
  const [rating, setRating] = useState(5);
  const [visitSeason, setVisitSeason] = useState('Spring (April)');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    api
      .getDestinationDetail(slug)
      .then((res) => {
        if (!active) return;
        setDestination(res.destination);
        setReviews(res.destination.reviews || []);
        setAvgRating(res.destination.avg_rating);
        setReviewCount(res.destination.review_count);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Destination not found');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    try {
      const res = await api.createReview(slug, {
        author_name: authorName,
        author_country: authorCountry,
        rating,
        visit_season: visitSeason,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviews((prev) => [res.review, ...prev]);
      setAvgRating(res.stats.avg_rating);
      setReviewCount(res.stats.review_count);
      setAuthorName('');
      setAuthorCountry('');
      setReviewTitle('');
      setReviewComment('');
      setRating(5);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Failed to post review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleHelpful = async (id: number) => {
    try {
      const res = await api.markReviewHelpful(id);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, helpful_count: res.review.helpful_count } : r))
      );
    } catch {
      // ignore transient error
    }
  };

  const handleDeleteReview = async (id: number) => {
    try {
      const res = await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      setAvgRating(res.stats.avg_rating);
      setReviewCount(res.stats.review_count);
    } catch {
      // ignore transient error
    }
  };

  if (isLoading) {
    return (
      <div className="pt-28 pb-20 max-w-6xl mx-auto px-5 sm:px-8">
        <div className="h-96 rounded-2xl bg-white border border-[#E2D9C8] animate-pulse" />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="pt-32 pb-20 max-w-3xl mx-auto px-5 text-center space-y-4">
        <h1 className="font-serif text-4xl font-semibold text-[#0B1B32]">Destination Unavailable</h1>
        <p className="text-sm text-[#5B6778]">{error || 'We could not locate this Silk Road city.'}</p>
        <button
          type="button"
          onClick={() => onNavigate('/destinations')}
          className="px-5 py-2.5 text-sm font-medium bg-[#0E7C86] text-white rounded-lg cursor-pointer"
        >
          Back to All Destinations
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F9F6F0] min-h-screen pb-24">
      {/* Hero Banner */}
      <section className="relative h-[68vh] min-h-[460px] flex items-end pb-12 pt-24 bg-[#0B1B32]">
        <div className="absolute inset-0">
          <EditorialImage
            src={destination.hero_image}
            alt={destination.name}
            loading="eager"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B32]/92 via-[#0B1B32]/45 to-[#0B1B32]/30" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full">
          <button
            type="button"
            onClick={() => onNavigate('/destinations')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-white/85 hover:text-white mb-5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            All Destinations
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <p className="text-xs sm:text-sm text-[#E6C574] font-medium tabular-nums">
                {destination.region} · {destination.unesco_year || 'Silk Road Heritage'} ·{' '}
                {destination.latitude.toFixed(4)}° N, {destination.longitude.toFixed(4)}° E
              </p>
              <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-white">
                {destination.name}
              </h1>
              <p className="text-base sm:text-lg text-[#E5E7EB] leading-relaxed">
                {destination.tagline}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate(`/map?city=${destination.slug}`)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-white/15 backdrop-blur-xs text-white border border-white/25 rounded-lg hover:bg-white/25 transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#E6C574]" />
                View on Map
              </button>
              <button
                type="button"
                onClick={() => addStop({ item_type: 'destination', item_slug: destination.slug })}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-[#C59B43] text-[#0B1B32] rounded-lg hover:bg-[#D5AE59] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add to Trip Itinerary
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Facts Strip */}
      <div className="bg-white border-b border-[#E2D9C8]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-[#5B6778]">Recommended Stay: </span>
            <span className="font-medium text-[#0B1B32] tabular-nums">{destination.recommended_days}</span>
          </div>
          <div>
            <span className="text-[#5B6778]">Optimal Season: </span>
            <span className="font-medium text-[#0B1B32]">{destination.best_time}</span>
          </div>
          <div>
            <span className="text-[#5B6778]">Elevation: </span>
            <span className="font-medium text-[#0B1B32] tabular-nums">{destination.elevation_m} m</span>
          </div>
          <div className="flex items-center gap-1.5 tabular-nums">
            <Star className="w-4 h-4 fill-[#C59B43] text-[#C59B43]" />
            <span className="font-medium text-[#0B1B32]">{avgRating}</span>
            <span className="text-[#5B6778]">({reviewCount} traveler reviews)</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-14 space-y-16">
        {/* Historical & Architectural Monograph */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
                Historical Context
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B1B32]">
                Chronicles of {destination.name}
              </h2>
            </div>

            <p className="text-base text-[#1E293B] leading-[1.8] max-w-prose first-letter:text-5xl first-letter:font-serif first-letter:font-semibold first-letter:text-[#0E7C86] first-letter:float-left first-letter:mr-3 first-letter:mt-1">
              {destination.history_text}
            </p>

            <div className="pt-4 border-t border-[#E2D9C8] space-y-2 max-w-prose">
              <h3 className="font-serif text-2xl font-semibold text-[#0B1B32]">
                Architectural Signature
              </h3>
              <p className="text-sm sm:text-base text-[#334155] leading-relaxed">
                {destination.architecture_notes}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl overflow-hidden border border-[#E2D9C8] aspect-[4/3]">
              <EditorialImage
                src={destination.secondary_image}
                alt={`${destination.name} architectural and cultural detail`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Travel Recommendations */}
            <div className="bg-white border border-[#E2D9C8] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#0E7C86]">
                <Compass className="w-5 h-5" />
                <h3 className="font-serif text-2xl font-semibold text-[#0B1B32]">
                  Travel Recommendations
                </h3>
              </div>
              <ul className="space-y-3">
                {destination.travel_tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-[#334155] leading-relaxed">
                    <span className="font-serif text-base font-semibold text-[#C59B43] tabular-nums">
                      0{index + 1}.
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Main Attractions */}
        <section className="space-y-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
              Architectural Landmarks
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B1B32]">
              Main Attractions in {destination.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destination.attractions.map((attr) => (
              <article
                key={attr.id}
                className="bg-white border border-[#E2D9C8] rounded-2xl p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <p className="text-xs text-[#0E7C86] font-medium tabular-nums">
                    {attr.era} · {attr.latitude.toFixed(4)}° N, {attr.longitude.toFixed(4)}° E
                  </p>
                  <h3 className="font-serif text-2xl font-semibold text-[#0B1B32]">{attr.name}</h3>
                  <p className="text-sm text-[#334155] leading-relaxed">{attr.summary}</p>
                </div>
                <div className="pt-3 border-t border-[#EFE9DD] text-xs text-[#475569] leading-relaxed">
                  <span className="font-medium text-[#0B1B32]">Insider Tip: </span>
                  {attr.highlight_tip}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Local Experiences */}
        {destination.experiences && destination.experiences.length > 0 && (
          <section className="space-y-6">
            <h2 className="font-serif text-3xl font-semibold text-[#0B1B32]">
              Curated Experiences in {destination.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {destination.experiences.map((exp) => (
                <div
                  key={exp.slug}
                  className="bg-white border border-[#E2D9C8] rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-12"
                >
                  <div className="sm:col-span-5 aspect-[4/3] sm:aspect-auto">
                    <EditorialImage
                      src={exp.image_url}
                      alt={exp.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="sm:col-span-7 p-5 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <p className="text-xs text-[#5B6778] tabular-nums">
                        {exp.category} · {exp.duration} · ${exp.price_usd}
                      </p>
                      <h3 className="font-serif text-xl font-semibold text-[#0B1B32]">{exp.title}</h3>
                      <p className="text-xs text-[#475569] leading-relaxed">{exp.summary}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addStop({ item_type: 'experience', item_slug: exp.slug })}
                      className="self-start inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#0E7C86] text-white rounded-lg hover:bg-[#095C64] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Itinerary
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Traveler Reviews & Persistent SQLite Feedback */}
        <section className="pt-8 border-t border-[#E2D9C8] grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
                  Traveler Dispatches
                </p>
                <h2 className="font-serif text-3xl font-semibold text-[#0B1B32]">
                  Verified Reviews ({reviewCount})
                </h2>
              </div>
              <div className="inline-flex items-center gap-1.5 text-lg font-serif font-semibold text-[#0B1B32] tabular-nums">
                <Star className="w-5 h-5 fill-[#C59B43] text-[#C59B43]" />
                {avgRating} / 5.0
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="bg-white border border-[#E2D9C8] rounded-2xl p-8 text-center text-sm text-[#5B6778]">
                Be the first traveler to leave a reflection on {destination.name}.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <article
                    key={rev.id}
                    className="bg-white border border-[#E2D9C8] rounded-2xl p-6 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-[#5B6778]">
                          {rev.author_name} · {rev.author_country} · {rev.visit_season}
                        </p>
                        <h3 className="font-serif text-xl font-semibold text-[#0B1B32] mt-0.5">
                          {rev.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 text-[#C59B43]">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#C59B43]" />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-[#334155] leading-relaxed">{rev.comment}</p>

                    <div className="pt-2 flex items-center justify-between text-xs text-[#5B6778]">
                      <button
                        type="button"
                        onClick={() => handleHelpful(rev.id)}
                        className="inline-flex items-center gap-1.5 text-[#0E7C86] hover:underline cursor-pointer tabular-nums"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Helpful ({rev.helpful_count})
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteReview(rev.id)}
                        aria-label={`Delete review ${rev.title}`}
                        className="inline-flex items-center gap-1 text-[#64748B] hover:text-[#B91C1C] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review Form */}
          <div className="lg:col-span-5 bg-white border border-[#E2D9C8] rounded-2xl p-6 sm:p-7">
            <div className="space-y-1 mb-5">
              <div className="flex items-center gap-2 text-[#0E7C86] text-xs font-medium uppercase tracking-wider">
                <Calendar className="w-4 h-4" />
                Share Your Journey
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#0B1B32]">
                Write a Review for {destination.name}
              </h3>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-xs font-medium text-[#334155]">
                  Your Name
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Lukas Weber"
                    className="mt-1 w-full px-3 py-2 text-sm bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
                  />
                </label>
                <label className="block text-xs font-medium text-[#334155]">
                  Country
                  <input
                    type="text"
                    required
                    value={authorCountry}
                    onChange={(e) => setAuthorCountry(e.target.value)}
                    placeholder="Germany"
                    className="mt-1 w-full px-3 py-2 text-sm bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block text-xs font-medium text-[#334155]">
                  Rating
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="mt-1 w-full px-3 py-2 text-sm bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
                  >
                    <option value={5}>5 Stars — Extraordinary</option>
                    <option value={4}>4 Stars — Memorable</option>
                    <option value={3}>3 Stars — Good</option>
                    <option value={2}>2 Stars — Fair</option>
                    <option value={1}>1 Star — Needs Care</option>
                  </select>
                </label>
                <label className="block text-xs font-medium text-[#334155]">
                  Season Visited
                  <select
                    value={visitSeason}
                    onChange={(e) => setVisitSeason(e.target.value)}
                    className="mt-1 w-full px-3 py-2 text-sm bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
                  >
                    <option>Spring (April)</option>
                    <option>Spring (May)</option>
                    <option>Summer (July)</option>
                    <option>Autumn (September)</option>
                    <option>Autumn (October)</option>
                    <option>Winter (December)</option>
                  </select>
                </label>
              </div>

              <label className="block text-xs font-medium text-[#334155]">
                Review Headline
                <input
                  type="text"
                  required
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Morning light over the turquoise domes"
                  className="mt-1 w-full px-3 py-2 text-sm bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
                />
              </label>

              <label className="block text-xs font-medium text-[#334155]">
                Your Reflection
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share architectural highlights, dining discoveries, or practical advice..."
                  className="mt-1 w-full px-3 py-2 text-sm bg-[#F9F6F0] border border-[#D8CEBC] rounded-lg focus:outline-none focus:border-[#0E7C86]"
                />
              </label>

              {reviewError && (
                <p className="text-xs text-[#B91C1C]" role="alert">
                  {reviewError}
                </p>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 px-4 text-sm font-medium bg-[#0E7C86] text-white rounded-lg hover:bg-[#095C64] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submittingReview ? 'Publishing Review...' : 'Publish Traveler Review'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
