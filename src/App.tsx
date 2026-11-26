import { useCallback, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { TripProvider, useTrip } from './context/TripContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { TripPlannerDrawer } from './components/TripPlannerDrawer';
import { HomePage } from './pages/HomePage';
import { DestinationsPage } from './pages/DestinationsPage';
import { DestinationDetailPage } from './pages/DestinationDetailPage';
import { CulturePage } from './pages/CulturePage';
import { CuisinePage } from './pages/CuisinePage';
import { GalleryPage } from './pages/GalleryPage';
import { MapPage } from './pages/MapPage';

function AppShell() {
  const { toastMessage, clearToast } = useTrip();
  const [locationState, setLocationState] = useState<{ pathname: string; search: string }>(() => ({
    pathname: window.location.pathname || '/',
    search: window.location.search || '',
  }));

  useEffect(() => {
    const onPopState = () => {
      setLocationState({
        pathname: window.location.pathname || '/',
        search: window.location.search || '',
      });
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string) => {
    const url = new URL(to, window.location.origin);
    window.history.pushState({}, '', url.pathname + url.search);
    setLocationState({ pathname: url.pathname, search: url.search });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { pathname, search } = locationState;
  const searchParams = new URLSearchParams(search);

  const renderPage = () => {
    if (pathname === '/' || pathname === '') {
      return <HomePage onNavigate={navigate} />;
    }
    if (pathname === '/destinations') {
      return (
        <DestinationsPage
          initialSearch={searchParams.get('search') || ''}
          onNavigate={navigate}
        />
      );
    }
    if (pathname.startsWith('/destinations/')) {
      const slug = pathname.replace('/destinations/', '').split('/')[0];
      return <DestinationDetailPage slug={slug} onNavigate={navigate} />;
    }
    if (pathname === '/culture') {
      return <CulturePage onNavigate={navigate} />;
    }
    if (pathname === '/cuisine') {
      return <CuisinePage onNavigate={navigate} />;
    }
    if (pathname === '/gallery') {
      return <GalleryPage onNavigate={navigate} />;
    }
    if (pathname === '/map') {
      return (
        <MapPage
          initialCitySlug={searchParams.get('city') || undefined}
          onNavigate={navigate}
        />
      );
    }
    return <HomePage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F6F0] text-[#0F1D30]">
      <Navbar currentPath={pathname} onNavigate={navigate} />

      <main className="flex-1">{renderPage()}</main>

      <Footer onNavigate={navigate} />

      <TripPlannerDrawer onNavigate={navigate} />

      {toastMessage && (
        <div
          role="status"
          onClick={clearToast}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0B1B32] text-white text-xs sm:text-sm font-medium border border-[#C59B43]/50 shadow-xl cursor-pointer"
        >
          <Check className="w-4 h-4 text-[#C59B43] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <TripProvider>
      <AppShell />
    </TripProvider>
  );
}
