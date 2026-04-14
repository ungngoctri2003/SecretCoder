import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { LAYOUT } from '../strings/vi';

export function Layout() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {showTop && (
        <button
          type="button"
          className="btn btn-primary btn-circle fixed bottom-6 right-6 z-40 shadow-lg"
          aria-label={LAYOUT.BACK_TO_TOP}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
