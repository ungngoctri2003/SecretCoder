import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Alert, Box, Card, CardContent, Typography } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { apiFetch } from '../lib/api';
import { TESTI_PAGE } from '../strings/vi';
import { ERR } from '../strings/vi';

export function Testimonials() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');

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
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{TESTI_PAGE.KICKER}</p>
          <h2 className="font-display mt-2 text-3xl font-bold md:text-4xl">{TESTI_PAGE.H2}</h2>
        </div>
        {err ? (
          <Alert severity="error" sx={{ mt: 4 }}>
            {err}
          </Alert>
        ) : null}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <Card key={t.id} variant="outlined" sx={{ boxShadow: 2 }}>
              <CardContent>
                <Typography sx={{ color: 'text.primary', opacity: 0.9 }}>&ldquo;{t.content}&rdquo;</Typography>
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {t.image_url ? (
                    <Box component="img" src={t.image_url} alt="" sx={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: 'action.selected' }} />
                  )}
                  <div>
                    <Typography fontWeight={600}>{t.author_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.author_title}
                    </Typography>
                    {t.rating ? (
                      <Box sx={{ mt: 0.5, display: 'flex', color: 'warning.main' }}>
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </Box>
                    ) : null}
                  </div>
                </Box>
              </CardContent>
            </Card>
          ))}
        </div>
        {!err && items.length === 0 ? <p className="mt-8 text-center text-base-content/60">{TESTI_PAGE.EMPTY}</p> : null}
      </div>
    </>
  );
}
