import { useEffect, useState } from 'react';
import { Alert, Box, Card, CardContent, Typography } from '@mui/material';
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
          <Alert severity="error" sx={{ mt: 4 }}>
            {err}
          </Alert>
        ) : null}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((m) => (
            <Card key={m.id} variant="outlined" sx={{ textAlign: 'center', boxShadow: 2 }}>
              <Box sx={{ px: 3, pt: 3 }}>
                {m.image_url ? (
                  <Box
                    component="img"
                    src={m.image_url}
                    alt=""
                    sx={{ mx: 'auto', height: 112, width: 112, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <Box sx={{ mx: 'auto', height: 112, width: 112, borderRadius: '50%', bgcolor: 'action.selected' }} />
                )}
              </Box>
              <CardContent>
                <Typography component="h3" className="font-display text-lg font-bold">
                  {m.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {m.role_title}
                </Typography>
                {m.bio ? (
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    {m.bio}
                  </Typography>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
        {!err && members.length === 0 ? (
          <p className="mt-8 text-center text-base-content/60">{TEAM_PAGE.EMPTY}</p>
        ) : null}
      </div>
    </>
  );
}
