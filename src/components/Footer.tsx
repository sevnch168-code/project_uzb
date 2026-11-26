interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const nav = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#0B1B32] text-[#E6E0D4] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          <div className="md:col-span-5 space-y-4">
            <a
              href="/"
              onClick={nav('/')}
              className="font-serif text-3xl font-semibold text-white tracking-wide inline-block"
            >
              Uzbekistan
            </a>
            <p className="text-sm text-[#B8C0CC] leading-relaxed max-w-md">
              An editorial guide to the turquoise domes, caravan oases, culinary traditions, and living craftsmanship along Central Asia’s historic Silk Road.
            </p>
            <p className="text-xs text-[#C59B43] tracking-wider uppercase pt-1">
              Tashkent · Samarkand · Bukhara · Khiva · Shahrisabz
            </p>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-serif text-lg font-medium text-white">Explore</h3>
            <ul className="space-y-2 text-sm text-[#B8C0CC]">
              <li>
                <a href="/destinations" onClick={nav('/destinations')} className="hover:text-white transition-colors">
                  Destinations
                </a>
              </li>
              <li>
                <a href="/culture" onClick={nav('/culture')} className="hover:text-white transition-colors">
                  Culture & Crafts
                </a>
              </li>
              <li>
                <a href="/cuisine" onClick={nav('/cuisine')} className="hover:text-white transition-colors">
                  National Cuisine
                </a>
              </li>
              <li>
                <a href="/gallery" onClick={nav('/gallery')} className="hover:text-white transition-colors">
                  Photo Gallery
                </a>
              </li>
              <li>
                <a href="/map" onClick={nav('/map')} className="hover:text-white transition-colors">
                  Silk Road Map
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-serif text-lg font-medium text-white">Cities</h3>
            <ul className="space-y-2 text-sm text-[#B8C0CC]">
              <li>
                <a href="/destinations/samarkand" onClick={nav('/destinations/samarkand')} className="hover:text-white transition-colors">
                  Samarkand
                </a>
              </li>
              <li>
                <a href="/destinations/bukhara" onClick={nav('/destinations/bukhara')} className="hover:text-white transition-colors">
                  Bukhara
                </a>
              </li>
              <li>
                <a href="/destinations/khiva" onClick={nav('/destinations/khiva')} className="hover:text-white transition-colors">
                  Khiva
                </a>
              </li>
              <li>
                <a href="/destinations/tashkent" onClick={nav('/destinations/tashkent')} className="hover:text-white transition-colors">
                  Tashkent
                </a>
              </li>
              <li>
                <a href="/destinations/shahrisabz" onClick={nav('/destinations/shahrisabz')} className="hover:text-white transition-colors">
                  Shahrisabz
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="font-serif text-lg font-medium text-white">Travel Essentials</h3>
            <div className="space-y-2 text-sm text-[#B8C0CC] leading-relaxed">
              <p>Peak Seasons: April – May & September – October</p>
              <p>High-Speed Rail: Afrosiyob linking Tashkent, Samarkand & Bukhara</p>
              <p>Currency: Uzbekistani Som (UZS)</p>
              <p>Time Zone: Uzbekistan Time (UTC+5)</p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#94A0B2]">
          <p>© {new Date().getFullYear()} Uzbekistan — Discover the Silk Road. Cultural & Tourism Showcase.</p>
          <p className="tabular-nums">41.2995° N, 69.2401° E · Heart of Central Asia</p>
        </div>
      </div>
    </footer>
  );
}
