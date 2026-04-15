import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Link as MuiLink, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { toast } from 'sonner';
import { DemoReviewsGrid } from '../components/DemoReviewsGrid';
import { PageHeader } from '../components/PageHeader';
import { VI_STUDENT_REVIEWS } from '../data/viStudentReviews';
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
                        {DASH_STUDENT.GO_STUDY}
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

        <Box sx={{ mt: 10 }}>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{DASH_STUDENT.REVIEWS_KICKER}</p>
            <h2 className="font-display mt-2 text-2xl font-bold text-base-content md:text-3xl">{DASH_STUDENT.REVIEWS_H2}</h2>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 560, mx: 'auto' }}>
              {DASH_STUDENT.REVIEWS_NOTE}
            </Typography>
          </div>
          <Box sx={{ mt: 6 }}>
            <DemoReviewsGrid items={VI_STUDENT_REVIEWS} />
          </Box>
        </Box>
      </div>
    </>
  );
}
