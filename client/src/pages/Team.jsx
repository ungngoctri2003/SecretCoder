import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { apiFetch } from '../lib/api';
import { TEAM_PAGE } from '../strings/vi';
import { ERR } from '../strings/vi';

export function Team() {
  const [members, setMembers] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch('/api/team');
        if (!cancelled) setMembers(data || []);
      } catch (e) {
        if (!cancelled) setErr(e.message || ERR.LOAD_TEAM);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHeader title={TEAM_PAGE.TITLE} crumbs={[{ label: TEAM_PAGE.CRUMB, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{TEAM_PAGE.KICKER}</p>
          <h2 className="font-display mt-2 text-3xl font-bold md:text-4xl">{TEAM_PAGE.H2}</h2>
        </div>
        {err ? (
          <div role="alert" className="alert alert-error mt-8">
            {err}
          </div>
        ) : null}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((m) => (
            <div key={m.id} className="card border border-base-300 bg-base-100 text-center shadow-md">
              <figure className="px-6 pt-6">
                {m.image_url ? (
                  <img src={m.image_url} alt="" className="mx-auto h-28 w-28 rounded-full object-cover" />
                ) : (
                  <div className="mx-auto h-28 w-28 rounded-full bg-base-300" />
                )}
              </figure>
              <div className="card-body">
                <h3 className="card-title justify-center text-lg">{m.name}</h3>
                <p className="text-sm text-base-content/60">{m.role_title}</p>
                {m.bio ? <p className="text-sm text-base-content/80">{m.bio}</p> : null}
              </div>
            </div>
          ))}
        </div>
        {!err && members.length === 0 ? (
          <p className="mt-8 text-center text-base-content/60">{TEAM_PAGE.EMPTY}</p>
        ) : null}
      </div>
    </>
  );
}
