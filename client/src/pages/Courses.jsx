import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Gauge, Clock, ChevronRight } from 'lucide-react';
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Stack,
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

      <div className="container mx-auto max-w-6xl px-4 pb-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{COURSES_PAGE.TITLE}</p>
          <h2 className="font-display mt-2 text-3xl font-bold md:text-4xl">{COURSES_PAGE.ALL_COURSES}</h2>
        </div>
        {err ? (
          <Alert severity="error" sx={{ mt: 4 }}>
            {err}
          </Alert>
        ) : null}
        <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const categoryName = course.categories?.name;
            return (
              <Card
                key={course.id}
                elevation={0}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  boxShadow: '0 4px 24px rgba(28, 36, 51, 0.06)',
                  transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 24px 48px -12px rgba(28, 36, 51, 0.14)',
                    borderColor: 'primary.main',
                  },
                  '& .MuiCardActionArea-root:hover .courses-card-media': {
                    transform: 'scale(1.06)',
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  to={`/courses/${course.slug}`}
                  aria-label={`${COURSES_PAGE.VIEW_COURSE_ARIA}: ${course.title}`}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    textAlign: 'left',
                    borderRadius: 0,
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      aspectRatio: '16 / 10',
                      overflow: 'hidden',
                      bgcolor: 'action.hover',
                    }}
                  >
                    <CardMedia
                      className="courses-card-media"
                      component="img"
                      image={course.thumbnail_url || '/img/course-1.png'}
                      alt=""
                      sx={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, transparent 45%, rgba(28,36,51,0.55) 100%)',
                        pointerEvents: 'none',
                      }}
                    />
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ position: 'absolute', left: 12, top: 12, flexWrap: 'wrap', gap: 0.75 }}
                      useFlexGap
                    >
                      {categoryName ? (
                        <Chip
                          label={categoryName}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.92)',
                            color: 'secondary.main',
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            height: 26,
                          }}
                        />
                      ) : null}
                    </Stack>
                  </Box>
                  <CardContent
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      p: 2.5,
                      pt: 2.25,
                    }}
                  >
                    <Typography
                      component="h3"
                      className="font-display"
                      sx={{
                        fontWeight: 800,
                        fontSize: '1.125rem',
                        lineHeight: 1.35,
                        letterSpacing: '-0.02em',
                        color: 'text.primary',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '2.7rem',
                      }}
                    >
                      {course.title}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ rowGap: 1 }}>
                      <Chip
                        icon={<Star size={14} style={{ color: 'inherit' }} aria-hidden />}
                        label={course.rating != null ? String(course.rating) : '—'}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: 'divider', '& .MuiChip-icon': { color: 'warning.main' } }}
                      />
                      <Chip
                        icon={<Users size={14} aria-hidden />}
                        label={course.learners_count || '—'}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: 'divider' }}
                      />
                      <Chip
                        icon={<Gauge size={14} aria-hidden />}
                        label={course.level || COMMON.ALL_LEVELS}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: 'divider' }}
                      />
                    </Stack>
                    <Box
                      sx={{
                        mt: 'auto',
                        pt: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Clock size={16} aria-hidden />
                        {course.duration_hours != null ? `${course.duration_hours} ${COMMON.HOURS}` : '—'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.25, fontWeight: 800 }}
                      >
                        {COURSES_PAGE.OPEN_COURSE}
                        <ChevronRight size={18} aria-hidden />
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </div>
        {!err && courses.length === 0 ? (
          <p className="mt-8 text-center text-base-content/60">{COURSES_PAGE.EMPTY}</p>
        ) : null}
      </div>
    </>
  );
}
