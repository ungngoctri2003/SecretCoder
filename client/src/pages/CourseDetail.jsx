import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Link as MuiLink, Typography } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { COURSE_DETAIL } from '../strings/vi';
import { COMMON } from '../strings/vi';
import { ERR } from '../strings/vi';

export function CourseDetail() {
  const { slug } = useParams();
  const { session, profile } = useAuth();
  const [course, setCourse] = useState(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiFetch(`/api/courses/${encodeURIComponent(slug)}`);
        if (!cancelled) setCourse(data);
      } catch (e) {
        if (!cancelled) setErr(e.message || ERR.NOT_FOUND);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function enroll() {
    setMsg('');
    if (!session) {
      setMsg(COURSE_DETAIL.LOGIN_STUDENT);
      return;
    }
    if (profile?.role !== 'student') {
      setMsg(COURSE_DETAIL.ONLY_STUDENT);
      return;
    }
    setEnrolling(true);
    try {
      await apiFetch(
        '/api/enrollments',
        { method: 'POST', body: JSON.stringify({ course_id: course.id }) },
        session.access_token,
      );
      setMsg(COURSE_DETAIL.ENROLL_SUCCESS);
    } catch (e) {
      setMsg(e.data?.error || e.message || ERR.ENROLL_FAILED);
    } finally {
      setEnrolling(false);
    }
  }

  if (err || !course) {
    return (
      <>
        <PageHeader
          title={COURSE_DETAIL.TITLE_FALLBACK}
          crumbs={[{ label: COURSE_DETAIL.CRUMB, to: '/courses' }, { label: slug || '', active: true }]}
        />
        <Box className="container mx-auto max-w-2xl px-4 py-12">
          <Alert severity="warning">{err || COMMON.LOADING}</Alert>
          <Button component={Link} to="/courses" variant="text" color="primary" sx={{ mt: 2, px: 0 }}>
            {COURSE_DETAIL.BACK}
          </Button>
        </Box>
      </>
    );
  }

  const enrollOk = msg === COURSE_DETAIL.ENROLL_SUCCESS;

  return (
    <>
      <PageHeader title={course.title} crumbs={[{ label: COURSE_DETAIL.CRUMB, to: '/courses' }, { label: course.title, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <Box className="overflow-hidden rounded-2xl shadow-lg" sx={{ border: 1, borderColor: 'divider' }}>
            <Box component="img" src={course.thumbnail_url || '/img/course-1.png'} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
          <div>
            <h2 className="font-display text-3xl font-bold text-primary">{course.title}</h2>
            <p className="mt-4 text-base-content/80">{course.description || COURSE_DETAIL.NO_DESC}</p>
            <p className="mt-4 text-sm text-base-content/70">
              <strong>{COURSE_DETAIL.LEVEL}:</strong> {course.level || '—'} · <strong>{COURSE_DETAIL.DURATION}:</strong>{' '}
              {course.duration_hours != null ? `${course.duration_hours} ${COMMON.HOURS}` : '—'}
            </p>
            {msg ? (
              <Alert severity={enrollOk ? 'success' : 'info'} sx={{ mt: 2 }}>
                {msg}
              </Alert>
            ) : null}
            {profile?.role === 'student' ? (
              <Button type="button" variant="contained" color="primary" sx={{ mt: 3 }} disabled={enrolling} onClick={enroll}>
                {enrolling ? <CircularProgress size={22} color="inherit" sx={{ mr: 1 }} /> : null}
                {enrolling ? COURSE_DETAIL.ENROLLING : COURSE_DETAIL.ENROLL}
              </Button>
            ) : null}
            {!session ? (
              <Typography className="mt-4 text-sm">
                <MuiLink component={Link} to="/login" fontWeight={600}>
                  {COURSE_DETAIL.LOGIN_LINK}
                </MuiLink>
                {COURSE_DETAIL.LOGIN_SUFFIX}
              </Typography>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
