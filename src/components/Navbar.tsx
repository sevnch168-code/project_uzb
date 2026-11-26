import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTrip } from '../context/TripContext';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

const NAV_LINKS = [
  { label: 'Destinations', path: '/destinations' },
  { label: 'Culture', path: '/culture' },
  { label: 'Cuisine', path: '/cuisine' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Map', path: '/map' },
];

export function Navbar({ currentPath, onNavigate }: NavbarProps) {
  const { items, openDrawer } = useTrip();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomeHero = currentPath === '/';

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 48);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const useTransparentHeader = isHomeHero && !isScrolled && !mobileMenuOpen;

  const handleLinkClick = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${
        useTransparentHeader
          ? 'bg-[#0B1B32]/35 backdrop-blur-md text-white border-b border-white/15'
          : 'bg-[#F9F6F0]/95 backdrop-blur-md text-[#0F1D30] border-b border-[#E2D9C8]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('/');
          }}
          className={`font-serif text-xl sm:text-2xl font-semibold tracking-wide whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C86] rounded ${
            useTransparentHeader ? 'text-white' : 'text-[#0B1B32]'
          }`}
        >
          Uzbekistan
        </a>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              currentPath === link.path ||
              (link.path === '/destinations' && currentPath.startsWith('/destinations/'));
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.path);
                }}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                  isActive
                    ? useTransparentHeader
                      ? 'border-[#C59B43] text-white'
                      : 'border-[#0E7C86] text-[#0B1B32]'
                    : useTransparentHeader
                      ? 'border-transparent text-white/85 hover:text-white hover:border-white/50'
                      : 'border-transparent text-[#3D4B5E] hover:text-[#0B1B32] hover:border-[#C59B43]'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={openDrawer}
            className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B43] tabular-nums ${
              useTransparentHeader
                ? 'bg-[#C59B43] text-[#0B1B32] hover:bg-[#D5AE59]'
                : 'bg-[#0E7C86] text-white hover:bg-[#095C64]'
            }`}
          >
            {items.length > 0 ? `Plan Trip (${items.length})` : 'Plan Trip'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className={`md:hidden p-2 rounded-lg transition-colors cursor-pointer ${
              useTransparentHeader
                ? 'text-white hover:bg-white/10'
                : 'text-[#0B1B32] hover:bg-[#EFE9DD]'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F9F6F0] border-t border-[#E2D9C8] px-5 py-4 space-y-2 text-[#0F1D30]">
          {NAV_LINKS.map((link) => {
            const isActive =
              currentPath === link.path ||
              (link.path === '/destinations' && currentPath.startsWith('/destinations/'));
            return (
              <a
                key={link.path}
                href={link.path}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(link.path);
                }}
                className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#EFE9DD] text-[#0E7C86]'
                    : 'text-[#0F1D30] hover:bg-[#EFE9DD]/60'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}
