import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Fab } from '@mui/material';
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
        <Fab
          color="primary"
          aria-label={LAYOUT.BACK_TO_TOP}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: (t) => t.zIndex.tooltip }}
        >
          <ChevronUp className="h-5 w-5" />
        </Fab>
      )}
    </div>
  );
}
