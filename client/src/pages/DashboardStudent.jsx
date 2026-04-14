import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Link as MuiLink, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { toast } from 'sonner';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/useAuth';
import { apiFetch } from '../lib/api';
import { DASH_STUDENT } from '../strings/vi';
import { COMMON } from '../strings/vi';
import { ERR } from '../strings/vi';

export function DashboardStudent() {
  const { session } = useAuth();
  const [rows, setRows] = useState([]);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadFailed(false);
    (async () => {
      try {
        const data = await apiFetch('/api/enrollments/me', {}, session?.access_token);
        if (!cancelled) {
          setRows(data || []);
          setLoadFailed(false);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadFailed(true);
          toast.error(e.message || ERR.LOAD_ENROLLMENTS);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  const rowSx = { '&:nth-of-type(odd)': { bgcolor: 'action.hover' } };

  return (
    <>
      <PageHeader title={DASH_STUDENT.TITLE} crumbs={[{ label: COMMON.DASH_CRUMB, active: true }]} />
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <h2 className="font-display text-2xl font-bold text-primary">{DASH_STUDENT.MY_COURSES}</h2>
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 3, borderRadius: 2, boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{DASH_STUDENT.TH_COURSE}</TableCell>
                <TableCell>{DASH_STUDENT.TH_ENROLLED}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} sx={rowSx}>
                  <TableCell>{r.courses?.title || '—'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {r.enrolled_at ? new Date(r.enrolled_at).toLocaleString() : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {r.courses?.slug ? (
                      <MuiLink component={Link} to={`/courses/${r.courses.slug}`} fontWeight={600}>
                        {COMMON.OPEN}
                      </MuiLink>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!loadFailed && rows.length === 0 ? (
          <p className="mt-6 text-center text-base-content/60">{DASH_STUDENT.EMPTY}</p>
        ) : null}
      </div>
    </>
  );
}
