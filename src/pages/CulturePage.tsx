import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import type { CultureItem } from '../types';
import { EditorialImage } from '../components/EditorialImage';

interface CulturePageProps {
  onNavigate: (path: string) => void;
}

const CATEGORIES = [
  'All',
  'Textiles & Attire',
  'Artisan Heritage',
  'Performing Arts',
  'Living Customs',
  'Festivals',
];

export function CulturePage({ onNavigate }: CulturePageProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState<CultureItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    api
      .getCulture(activeCategory)
      .then((res) => {
        if (active) setItems(res.items);
      })
      .catch((err) => console.error('Failed to load culture items:', err))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeCategory]);

  return (
    <div className="pt-24 pb-24 bg-[#F9F6F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-10 border-b border-[#E2D9C8]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
            Culture & Living Traditions
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-[#0B1B32] text-balance">
            Crafts, Music & Timeless Silk Road Customs
          </h1>
          <p className="text-base text-[#475569] leading-relaxed">
            Explore Uzbekistan’s living cultural heritage—from hand-dyed silk ikat robes and Suzani embroidery to Rishtan ceramics, Shashmaqam classical music, chaikhana hospitality, and Navruz spring festivities.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="py-8">
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
        </div>

        {/* Cultural Chapters */}
        {isLoading ? (
          <div className="space-y-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 bg-white border border-[#E2D9C8] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            {items.map((item, idx) => {
              const reversed = idx % 2 === 1;
              return (
                <article
                  key={item.slug}
                  className="bg-white border border-[#E2D9C8] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
                >
                  <div
                    className={`lg:col-span-5 aspect-[4/3] lg:aspect-auto overflow-hidden ${
                      reversed ? 'lg:order-2' : ''
                    }`}
                  >
                    <EditorialImage
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div
                    className={`lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between gap-6 ${
                      reversed ? 'lg:order-1' : ''
                    }`}
                  >
                    <div className="space-y-3">
                      <p className="text-xs text-[#0E7C86] font-medium">
                        {String(idx + 1).padStart(2, '0')}. {item.category} · {item.region}
                      </p>
                      <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0B1B32]">
                        {item.title}
                      </h2>
                      <p className="text-sm font-medium text-[#C59B43]">{item.subtitle}</p>
                      <p className="text-sm sm:text-base text-[#334155] leading-[1.75] max-w-prose">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#EFE9DD] flex flex-wrap items-center justify-between gap-4">
                      <p className="text-xs text-[#5B6778] italic">{item.heritage_note}</p>
                      <button
                        type="button"
                        onClick={() => onNavigate('/destinations')}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#0E7C86] hover:text-[#095C64] whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Explore Heritage Cities
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
