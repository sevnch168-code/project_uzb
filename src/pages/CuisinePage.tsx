import { useEffect, useState } from 'react';
import { Clock, MapPin, Utensils, X } from 'lucide-react';
import { api } from '../lib/api';
import type { CuisineItem } from '../types';
import { EditorialImage } from '../components/EditorialImage';

interface CuisinePageProps {
  onNavigate: (path: string) => void;
}

const COURSES = ['All', 'Mains & Feasts', 'Bakery & Street', 'Soups'];

export function CuisinePage({ onNavigate }: CuisinePageProps) {
  const [activeCourse, setActiveCourse] = useState('All');
  const [dishes, setDishes] = useState<CuisineItem[]>([]);
  const [selectedDish, setSelectedDish] = useState<CuisineItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    api
      .getCuisine(activeCourse)
      .then((res) => {
        if (active) setDishes(res.dishes);
      })
      .catch((err) => console.error('Failed to load cuisine:', err))
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeCourse]);

  return (
    <div className="pt-24 pb-24 bg-[#F9F6F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="max-w-3xl space-y-3 pb-10 border-b border-[#E2D9C8]">
          <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
            Culinary Heritage
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl font-semibold text-[#0B1B32] text-balance">
            Uzbek National Cuisine
          </h1>
          <p className="text-base text-[#475569] leading-relaxed">
            From wood-fired Samarkand plov and blistered tandoor samsa to hand-pulled lagman noodles and sacred stamped non, every dish tells a story of Silk Road harvests and shared hospitality.
          </p>
        </div>

        {/* Course Filter */}
        <div className="py-8">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#EFE9DD] rounded-xl w-fit">
            {COURSES.map((course) => (
              <button
                key={course}
                type="button"
                onClick={() => setActiveCourse(course)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeCourse === course
                    ? 'bg-white text-[#0B1B32] shadow-xs'
                    : 'text-[#475569] hover:text-[#0B1B32]'
                }`}
              >
                {course}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 bg-white border border-[#E2D9C8] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dishes.map((dish) => (
              <article
                key={dish.slug}
                className="group bg-white border border-[#E2D9C8] rounded-2xl overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
              >
                <div>
                  <div
                    onClick={() => setSelectedDish(dish)}
                    className="aspect-[4/3] overflow-hidden cursor-pointer"
                  >
                    <EditorialImage
                      src={dish.image_url}
                      alt={`${dish.name} — ${dish.uzbek_name}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#5B6778]">
                      <span>
                        {dish.origin_city} · {dish.uzbek_name}
                      </span>
                      <span className="tabular-nums">{dish.prep_time}</span>
                    </div>
                    <h2 className="font-serif text-3xl font-semibold text-[#0B1B32]">
                      {dish.name}
                    </h2>
                    <p className="text-sm text-[#334155] leading-relaxed">{dish.description}</p>
                    <p className="text-xs text-[#5B6778] leading-relaxed pt-1 border-t border-[#EFE9DD]">
                      <span className="font-medium text-[#0B1B32]">Heritage: </span>
                      {dish.cultural_background}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-[#0E7C86] font-medium truncate">
                    {dish.key_ingredients.slice(0, 3).join(' · ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDish(dish)}
                    className="px-3.5 py-2 text-xs font-medium bg-[#F9F6F0] border border-[#D8CEBC] text-[#0B1B32] rounded-lg hover:border-[#0E7C86] hover:text-[#0E7C86] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Read Full Story
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Culinary Detail Modal */}
      {selectedDish && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selectedDish.name}
        >
          <div
            className="fixed inset-0 bg-[#0B1B32]/65 backdrop-blur-xs"
            onClick={() => setSelectedDish(null)}
          />
          <div className="relative z-10 bg-white border border-[#E2D9C8] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedDish(null)}
              aria-label="Close dish details"
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-[#0B1B32] hover:bg-white shadow-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-[16/9] w-full overflow-hidden">
              <EditorialImage
                src={selectedDish.image_url}
                alt={selectedDish.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#0E7C86] font-medium">
                  {selectedDish.course_type} · {selectedDish.uzbek_name}
                </p>
                <h2 className="font-serif text-4xl font-semibold text-[#0B1B32] mt-1">
                  {selectedDish.name}
                </h2>
              </div>

              <div className="flex flex-wrap gap-5 text-xs text-[#475569] py-3 border-y border-[#EFE9DD]">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#0E7C86]" />
                  Origin: {selectedDish.origin_city}
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Clock className="w-4 h-4 text-[#0E7C86]" />
                  Traditional Prep: {selectedDish.prep_time}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#0E7C86]" />
                  {selectedDish.course_type}
                </span>
              </div>

              <div className="space-y-3 text-sm sm:text-base text-[#334155] leading-relaxed">
                <p>{selectedDish.description}</p>
                <p className="text-[#475569]">{selectedDish.cultural_background}</p>
              </div>

              <div className="pt-2">
                <p className="text-xs uppercase tracking-wider text-[#5B6778] font-medium mb-2">
                  Signature Ingredients
                </p>
                <p className="text-sm font-medium text-[#0B1B32]">
                  {selectedDish.key_ingredients.join(' · ')}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EFE9DD] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDish(null);
                    onNavigate('/destinations/samarkand');
                  }}
                  className="px-4 py-2 text-xs font-medium bg-[#0E7C86] text-white rounded-lg hover:bg-[#095C64] cursor-pointer"
                >
                  Taste in Samarkand & Tashkent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
