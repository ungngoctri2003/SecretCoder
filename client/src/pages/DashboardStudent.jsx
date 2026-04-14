import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { DASH_STUDENT } from '../strings/vi';
import { COMMON } from '../strings/vi';
import { ERR } from '../strings/vi';

export function DashboardStudent() {
  const { session } = useAuth();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch('/api/enrollments/me', {}, session?.access_token);
        if (!cancelled) setRows(data || []);
      } catch (e) {
        if (!cancelled) setErr(e.message || ERR.LOAD_ENROLLMENTS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  return (
    <>
      <PageHeader title={DASH_STUDENT.TITLE} crumbs={[{ label: COMMON.DASH_CRUMB, active: true }]} />
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-display text-2xl font-bold text-primary">{DASH_STUDENT.MY_COURSES}</h2>
        {err ? (
          <div role="alert" className="alert alert-error mt-6">
            {err}
          </div>
        ) : null}
        <div className="mt-6 overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>{DASH_STUDENT.TH_COURSE}</th>
                <th>{DASH_STUDENT.TH_ENROLLED}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.courses?.title || '—'}</td>
                  <td className="text-sm text-base-content/70">{r.enrolled_at ? new Date(r.enrolled_at).toLocaleString() : '—'}</td>
                  <td>
                    {r.courses?.slug ? (
                      <Link to={`/courses/${r.courses.slug}`} className="link link-primary">
                        {COMMON.OPEN}
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!err && rows.length === 0 ? (
          <p className="mt-6 text-center text-base-content/60">{DASH_STUDENT.EMPTY}</p>
        ) : null}
      </div>
    </>
  );
}
