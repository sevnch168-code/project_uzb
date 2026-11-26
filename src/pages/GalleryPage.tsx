import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, MapPin, Maximize2, X } from 'lucide-react';
import { api } from '../lib/api';
import type { GalleryPhoto } from '../types';
import { EditorialImage } from '../components/EditorialImage';

interface GalleryPageProps {
  onNavigate: (path: string) => void;
}

const CATEGORIES = ['All', 'Architecture', 'Culture', 'Cuisine', 'Landscapes'];

export function GalleryPage({ onNavigate }: GalleryPageProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [likedIds, setLikedIds] = useState<number[]>([]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    api
      .getGallery(activeCategory)
      .then((res) => {
        if (active) {
          setPhotos(res.photos);
          setLightboxIndex(null);
        }
      })
      .catch((err) => console.error('Failed to load gallery:', err))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeCategory]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || photos.length === 0) return null;
      return (prev + 1) % photos.length;
    });
  }, [photos.length]);

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null || photos.length === 0) return null;
      return (prev - 1 + photos.length) % photos.length;
    });
  }, [photos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev, lightboxIndex]);

  const handleLike = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (likedIds.includes(id)) return;
    setLikedIds((prev) => [...prev, id]);
    try {
      const res = await api.likePhoto(id);
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likes: res.photo.likes } : p))
      );
    } catch {
      // ignore transient error
    }
  };

  const activePhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <div className="pt-24 pb-24 bg-[#F9F6F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-10 border-b border-[#E2D9C8]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
            Interactive Photography Archive
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-[#0B1B32] text-balance">
            Uzbekistan Through the Lens
          </h1>
          <p className="text-base text-[#475569] leading-relaxed">
            Browse Silk Road architecture, artisan traditions, desert horizons, and culinary craft. Click any photograph to enter full-screen lightbox view.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="py-8 flex flex-wrap items-center justify-between gap-4">
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

          <p className="text-xs text-[#5B6778] tabular-nums">
            Showing {photos.length} curated photographs
          </p>
        </div>

        {/* Responsive Masonry / Bento Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 bg-white border border-[#E2D9C8] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <article
                key={photo.id}
                onClick={() => setLightboxIndex(index)}
                className={`group relative rounded-2xl overflow-hidden border border-[#E2D9C8] bg-white cursor-pointer flex flex-col ${
                  photo.is_wide === 1 && activeCategory === 'All' ? 'lg:col-span-2' : ''
                }`}
              >
                <div
                  className={`relative overflow-hidden ${
                    photo.is_wide === 1 && activeCategory === 'All'
                      ? 'aspect-[16/9]'
                      : 'aspect-[4/3]'
                  }`}
                >
                  <EditorialImage
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B32]/85 via-transparent to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                  <span className="absolute top-3.5 right-3.5 p-2 rounded-full bg-[#0B1B32]/65 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 className="w-4 h-4" />
                  </span>

                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#E6C574]">
                        {photo.category} · {photo.location}
                      </p>
                      <h2 className="font-serif text-xl sm:text-2xl font-medium truncate">
                        {photo.title}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleLike(e, photo.id)}
                      aria-label={`Favorite ${photo.title}`}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0B1B32]/70 hover:bg-[#0E7C86] text-xs font-medium transition-colors shrink-0 cursor-pointer tabular-nums"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          likedIds.includes(photo.id) ? 'fill-[#E6C574] text-[#E6C574]' : 'text-white'
                        }`}
                      />
                      {photo.likes}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Lightbox */}
      {activePhoto && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-[#071120]/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close lightbox"
            className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-5xl w-full flex flex-col items-center gap-5">
            <div className="w-full max-h-[72vh] rounded-2xl overflow-hidden border border-white/15 bg-[#0B1B32] flex items-center justify-center">
              <EditorialImage
                src={activePhoto.image_url}
                alt={activePhoto.title}
                className="max-h-[72vh] w-auto max-w-full object-contain"
              />
            </div>

            <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white px-2">
              <div className="space-y-1 max-w-2xl">
                <p className="text-xs text-[#E6C574] tabular-nums">
                  {activePhoto.category} · {activePhoto.location} · Photo by{' '}
                  {activePhoto.photographer_credit} · {lightboxIndex + 1} / {photos.length}
                </p>
                <h3 className="font-serif text-2xl sm:text-3xl font-semibold">
                  {activePhoto.title}
                </h3>
                <p className="text-sm text-[#CBD5E1]">{activePhoto.caption}</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const destSlug = activePhoto.destination_slug;
                  setLightboxIndex(null);
                  onNavigate(`/destinations/${destSlug}`);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#0E7C86] text-white rounded-lg hover:bg-[#095C64] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                Explore Destination
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
