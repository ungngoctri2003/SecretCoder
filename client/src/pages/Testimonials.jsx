import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Alert, Box } from '@mui/material';
import { DemoReviewsGrid } from '../components/DemoReviewsGrid';
import { PageHeader } from '../components/PageHeader';
import { ScrollSection } from '../motion/ScrollBlock';
import { VI_STUDENT_REVIEWS } from '../data/viStudentReviews';
import { apiFetch } from '../lib/api';
import { TESTI_PAGE } from '../strings/vi';
import { ERR } from '../strings/vi';

export function Testimonials() {
  const reduce = useReducedMotion() ?? false;
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');

  const displayItems = useMemo(() => [...(items || []), ...VI_STUDENT_REVIEWS], [items]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch('/api/testimonials');
        if (!cancelled) setItems(data || []);
      } catch (e) {
        if (!cancelled) setErr(e.message || ERR.LOAD_TESTIMONIALS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHeader title={TESTI_PAGE.TITLE} crumbs={[{ label: TESTI_PAGE.CRUMB, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-16">
        <ScrollSection reduced={reduce} className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{TESTI_PAGE.KICKER}</p>
          <h2 className="font-display mt-2 text-3xl font-bold md:text-4xl">{TESTI_PAGE.H2}</h2>
        </ScrollSection>
        {err ? (
          <Alert severity="error" sx={{ mt: 4 }}>
            {err}
          </Alert>
        ) : null}
        <Box sx={{ mt: 6 }}>
          <ScrollSection reduced={reduce}>
            <DemoReviewsGrid items={displayItems} />
          </ScrollSection>
        </Box>
      </div>
    </>
  );
}
