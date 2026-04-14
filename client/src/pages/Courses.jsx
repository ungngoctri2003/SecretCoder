import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Gauge, Clock, ChevronRight } from 'lucide-react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { apiFetch } from '../lib/api';
import { COURSES_PAGE, COMMON, ERR } from '../strings/vi';

export function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [c, cat] = await Promise.all([apiFetch('/api/courses'), apiFetch('/api/categories')]);
        if (!cancelled) {
          setCourses(c || []);
          setCategories(cat || []);
        }
      } catch (e) {
        if (!cancelled) setErr(e.message || ERR.LOAD);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <PageHeader title={COURSES_PAGE.TITLE} crumbs={[{ label: COURSES_PAGE.CRUMB, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{COURSES_PAGE.CATEGORIES}</p>
          <h2 className="font-display mt-2 text-3xl font-bold md:text-4xl">{COURSES_PAGE.TOPICS}</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Card key={cat.id} variant="outlined" sx={{ transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 4 } }}>
              <Box sx={{ px: 2, pt: 2 }}>
                {cat.image_url ? (
                  <Box
                    component="img"
                    src={cat.image_url}
                    alt=""
                    sx={{ height: 112, width: '100%', borderRadius: 2, objectFit: 'contain' }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      height: 112,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      color: 'text.secondary',
                    }}
                  >
                    {cat.name}
                  </Box>
                )}
              </Box>
              <CardContent sx={{ py: 2, textAlign: 'center' }}>
                <Typography component="h3" className="font-display" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                  {cat.name}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 pb-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{COURSES_PAGE.TITLE}</p>
          <h2 className="font-display mt-2 text-3xl font-bold md:text-4xl">{COURSES_PAGE.ALL_COURSES}</h2>
        </div>
        {err ? (
          <Alert severity="error" sx={{ mt: 4 }}>
            {err}
          </Alert>
        ) : null}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <Card key={course.id} variant="outlined" sx={{ transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 } }}>
              <Box sx={{ position: 'relative', aspectRatio: '16/9' }}>
                <CardMedia
                  component="img"
                  image={course.thumbnail_url || '/img/course-1.png'}
                  alt=""
                  sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
                />
                <Chip
                  label={course.price_cents === 0 ? COMMON.FREE : `$${(course.price_cents / 100).toFixed(0)}`}
                  color="primary"
                  size="small"
                  sx={{ position: 'absolute', left: 12, top: 12, fontWeight: 700, textTransform: 'uppercase' }}
                />
              </Box>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 2 }}>
                <Typography
                  component="h3"
                  className="font-display line-clamp-2 text-base leading-snug"
                  sx={{ fontWeight: 700, minHeight: '2.5rem' }}
                >
                  <MuiLink component={Link} to={`/courses/${course.slug}`} underline="hover" color="inherit">
                    {course.title}
                  </MuiLink>
                </Typography>
                <Box className="flex flex-wrap gap-2 text-xs text-base-content/70">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" style={{ color: 'var(--mui-palette-warning-main)' }} />
                    {course.rating ?? '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {course.learners_count || '—'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Gauge className="h-3.5 w-3.5" />
                    {course.level || COMMON.ALL_LEVELS}
                  </span>
                </Box>
                <Box
                  className="mt-1 flex items-center justify-between border-t pt-2 text-sm"
                  sx={{ borderColor: 'divider' }}
                >
                  <span className="flex items-center gap-1 text-base-content/70">
                    <Clock className="h-4 w-4" />
                    {course.duration_hours != null ? `${course.duration_hours} ${COMMON.HOURS}` : '—'}
                  </span>
                  <span className="font-semibold">
                    {course.price_cents === 0 ? '\u20B9 0' : `$${(course.price_cents / 100).toFixed(0)}`}
                  </span>
                  <MuiLink
                    component={Link}
                    to={`/courses/${course.slug}`}
                    className="flex items-center gap-0.5 text-sm font-semibold"
                    underline="hover"
                  >
                    {COMMON.VIEW}
                    <ChevronRight className="h-4 w-4" />
                  </MuiLink>
                </Box>
              </CardContent>
            </Card>
          ))}
        </div>
        {!err && courses.length === 0 ? (
          <p className="mt-8 text-center text-base-content/60">{COURSES_PAGE.EMPTY}</p>
        ) : null}
      </div>
    </>
  );
}
