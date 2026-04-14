import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
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
          <div role="alert" className="alert alert-error mt-8">
            {err}
          </div>
        ) : null}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.id} className="card border border-base-300 bg-base-100 shadow-md">
              <div className="card-body">
                <p className="text-base-content/90">&ldquo;{t.content}&rdquo;</p>
                <div className="mt-4 flex items-center gap-3">
                  {t.image_url ? (
                    <img src={t.image_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-base-300" />
                  )}
                  <div>
                    <p className="font-semibold">{t.author_name}</p>
                    <p className="text-xs text-base-content/60">{t.author_title}</p>
                    {t.rating ? (
                      <div className="mt-1 flex text-warning">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!err && items.length === 0 ? <p className="mt-8 text-center text-base-content/60">{TESTI_PAGE.EMPTY}</p> : null}
      </div>
    </>
  );
}
