import { useEffect, useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Fab } from '@mui/material';
import { ChevronUp } from 'lucide-react';
import { getRouteFade } from '../motion/variants';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { LAYOUT } from '../strings/vi';

const MotionMain = motion.create(Box);

export function Layout() {
  const [showTop, setShowTop] = useState(false);
  const location = useLocation();
  const reduceMotion = useReducedMotion() ?? false;

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 320);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AnimatePresence mode="wait" initial={false}>
        <MotionMain
          key={location.pathname}
          component="main"
          initial="initial"
          animate="animate"
          exit="exit"
          variants={getRouteFade(reduceMotion)}
          sx={{ flex: 1, bgcolor: 'background.default', minWidth: 0 }}
        >
          <Outlet />
        </MotionMain>
      </AnimatePresence>
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
