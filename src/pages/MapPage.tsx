import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowRight, Compass, MapPin, Plus, Route } from 'lucide-react';
import { api } from '../lib/api';
import { useTrip } from '../context/TripContext';
import type { Destination } from '../types';
import { EditorialImage } from '../components/EditorialImage';

interface MapPageProps {
  initialCitySlug?: string;
  onNavigate: (path: string) => void;
}

const SILK_ROAD_ROUTE_ORDER = ['tashkent', 'samarkand', 'shahrisabz', 'bukhara', 'khiva'];

export function MapPage({ initialCitySlug, onNavigate }: MapPageProps) {
  const { addStop } = useTrip();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const attractionLayerRef = useRef<L.LayerGroup | null>(null);

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialCitySlug || 'samarkand');
  const [showRouteLine, setShowRouteLine] = useState(true);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    api
      .getDestinations()
      .then((res) => {
        setDestinations(res.destinations);
      })
      .catch((err) => console.error('Failed to load map destinations:', err));
  }, []);

  useEffect(() => {
    if (initialCitySlug) {
      setSelectedSlug(initialCitySlug);
    }
  }, [initialCitySlug]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [40.2, 64.8],
      zoom: 6,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    attractionLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render City Markers & Silk Road Polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || destinations.length === 0) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    // Add Silk Road Route Polyline
    const orderedCoords: [number, number][] = [];
    for (const slug of SILK_ROAD_ROUTE_ORDER) {
      const found = destinations.find((d) => d.slug === slug);
      if (found) orderedCoords.push([found.latitude, found.longitude]);
    }

    if (showRouteLine && orderedCoords.length > 1) {
      routeLayerRef.current = L.polyline(orderedCoords, {
        color: '#C59B43',
        weight: 3,
        dashArray: '8, 8',
        opacity: 0.9,
      }).addTo(map);
    }

    // Add City Markers using custom SVG/HTML L.divIcon
    destinations.forEach((dest) => {
      const isSelected = dest.slug === selectedSlug;
      const icon = L.divIcon({
        className: 'custom-silk-marker',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%);cursor:pointer;">
            <div style="padding:4px 10px;border-radius:8px;background:${
              isSelected ? '#0B1B32' : '#FFFFFF'
            };color:${isSelected ? '#FFFFFF' : '#0B1B32'};border:1.5px solid ${
          isSelected ? '#C59B43' : '#0E7C86'
        };font-family:'Cormorant Garamond',serif;font-weight:600;font-size:14px;white-space:nowrap;box-shadow:0 6px 16px rgba(11,27,50,0.2);">
              ${dest.name}
            </div>
            <div style="width:12px;height:12px;margin-top:-4px;border-radius:9999px;background:${
              isSelected ? '#C59B43' : '#0E7C86'
            };border:2px solid #FFFFFF;box-shadow:0 2px 6px rgba(0,0,0,0.25);"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([dest.latitude, dest.longitude], { icon }).addTo(map);

      const popupEl = document.createElement('div');
      popupEl.innerHTML = `
        <div style="overflow:hidden;font-family:'Plus Jakarta Sans',sans-serif;">
          <img src="${dest.hero_image}" alt="${dest.name}" style="width:100%;height:132px;object-fit:cover;display:block;" />
          <div style="padding:12px 14px;">
            <div style="font-size:11px;color:#0E7C86;font-weight:600;margin-bottom:2px;">${dest.region}</div>
            <div style="font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:700;color:#0B1B32;line-height:1.15;margin-bottom:6px;">${dest.name}</div>
            <div style="font-size:12px;color:#475569;line-height:1.45;margin-bottom:10px;">${dest.tagline}</div>
            <button data-explore="${dest.slug}" style="width:100%;padding:7px 12px;background:#0E7C86;color:#FFFFFF;border:none;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;">
              Open ${dest.name} Guide
            </button>
          </div>
        </div>
      `;

      const exploreBtn = popupEl.querySelector(`[data-explore="${dest.slug}"]`);
      if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
          onNavigate(`/destinations/${dest.slug}`);
        });
      }

      marker.bindPopup(popupEl, {
        className: 'silk-leaflet-popup',
        offset: [0, -28],
      });

      marker.on('click', () => {
        setSelectedSlug(dest.slug);
      });

      markersRef.current[dest.slug] = marker;
    });
  }, [destinations, onNavigate, selectedSlug, showRouteLine]);

  // Focus Selected City + Display Attraction Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const attrLayer = attractionLayerRef.current;
    if (!map || !attrLayer || destinations.length === 0) return;

    const selected = destinations.find((d) => d.slug === selectedSlug);
    if (!selected) return;

    attrLayer.clearLayers();
    selected.attractions.forEach((attr) => {
      const circle = L.circleMarker([attr.latitude, attr.longitude], {
        radius: 6,
        color: '#0B1B32',
        weight: 2,
        fillColor: '#C59B43',
        fillOpacity: 1,
      }).addTo(attrLayer);
      circle.bindTooltip(`${attr.name} (${attr.era})`, { direction: 'top' });
    });

    if (initialCitySlug) {
      map.flyTo([selected.latitude, selected.longitude], 11, { duration: 1.0 });
    }
  }, [destinations, initialCitySlug, selectedSlug]);

  const focusCity = (dest: Destination, zoom = 11) => {
    setSelectedSlug(dest.slug);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([dest.latitude, dest.longitude], zoom, { duration: 0.9 });
      const marker = markersRef.current[dest.slug];
      if (marker) {
        setTimeout(() => marker.openPopup(), 450);
      }
    }
  };

  const resetOverview = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([40.2, 64.8], 6, { duration: 0.9 });
    }
  };

  const selectedCity = destinations.find((d) => d.slug === selectedSlug) || destinations[0];

  return (
    <div className="pt-24 pb-20 bg-[#F9F6F0] min-h-screen">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E2D9C8]">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-[#0E7C86] font-medium">
              Geographic Explorer · OpenStreetMap & Leaflet
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-[#0B1B32]">
              Interactive Silk Road Map
            </h1>
            <p className="text-sm sm:text-base text-[#475569]">
              Inspect coordinates across Uzbekistan’s oasis cities, explore landmark locations, and trace the historic Silk Road rail and caravan corridor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowRouteLine((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                showRouteLine
                  ? 'bg-[#0B1B32] text-white border-[#0B1B32]'
                  : 'bg-white text-[#0B1B32] border-[#D8CEBC]'
              }`}
            >
              <Route className="w-3.5 h-3.5 text-[#C59B43]" />
              {showRouteLine ? 'Silk Road Route Visible' : 'Show Silk Road Route'}
            </button>
            <button
              type="button"
              onClick={resetOverview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-[#D8CEBC] text-[#0B1B32] rounded-lg hover:border-[#0E7C86] cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#0E7C86]" />
              Full Country View
            </button>
          </div>
        </div>

        {/* Map + Sidebar Grid */}
        <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* City Directory Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            {destinations.map((dest) => {
              const active = dest.slug === selectedSlug;
              return (
                <button
                  key={dest.slug}
                  type="button"
                  onClick={() => focusCity(dest)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0B1B32] text-white border-[#0B1B32]'
                      : 'bg-white text-[#0F1D30] border-[#E2D9C8] hover:border-[#0E7C86]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-medium ${
                        active ? 'text-[#E6C574]' : 'text-[#0E7C86]'
                      }`}
                    >
                      {dest.region}
                    </span>
                    <span
                      className={`text-[11px] tabular-nums ${
                        active ? 'text-[#CBD5E1]' : 'text-[#64748B]'
                      }`}
                    >
                      {dest.latitude.toFixed(2)}°N, {dest.longitude.toFixed(2)}°E
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-semibold mt-0.5">{dest.name}</h2>
                  <p
                    className={`text-xs mt-1 line-clamp-2 ${
                      active ? 'text-[#CBD5E1]' : 'text-[#475569]'
                    }`}
                  >
                    {dest.attractions.map((a) => a.name).join(' · ')}
                  </p>
                </button>
              );
            })}

            {/* Selected City Detail Summary */}
            {selectedCity && (
              <div className="bg-white border border-[#E2D9C8] rounded-2xl overflow-hidden mt-4">
                <div className="aspect-[16/9] overflow-hidden">
                  <EditorialImage
                    src={selectedCity.hero_image}
                    alt={selectedCity.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#5B6778]">
                    <span>{selectedCity.recommended_days}</span>
                    <span className="tabular-nums">Elevation {selectedCity.elevation_m} m</span>
                  </div>
                  <h3 className="font-serif text-2xl font-semibold text-[#0B1B32]">
                    {selectedCity.name} Landmarks
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#334155]">
                    {selectedCity.attractions.map((attr) => (
                      <li key={attr.id} className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#C59B43] shrink-0" />
                        <span>
                          <strong className="text-[#0B1B32]">{attr.name}</strong> ({attr.era})
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/destinations/${selectedCity.slug}`)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#0E7C86] text-white rounded-lg hover:bg-[#095C64] cursor-pointer"
                    >
                      View Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        addStop({ item_type: 'destination', item_slug: selectedCity.slug })
                      }
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium bg-[#F9F6F0] border border-[#D8CEBC] text-[#0B1B32] rounded-lg hover:border-[#0E7C86] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Trip
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Leaflet Map Canvas */}
          <div className="lg:col-span-8 flex flex-col">
            <div
              ref={mapContainerRef}
              className="w-full h-[540px] lg:h-full min-h-[540px] rounded-2xl border border-[#E2D9C8] overflow-hidden shadow-xs"
              aria-label="Interactive OpenStreetMap of Uzbekistan"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
