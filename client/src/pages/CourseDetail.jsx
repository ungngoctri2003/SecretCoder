import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
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
        <div className="container mx-auto max-w-2xl px-4 py-12">
          <div role="alert" className="alert alert-warning">
            {err || COMMON.LOADING}
          </div>
          <Link to="/courses" className="btn btn-link mt-4 px-0">
            {COURSE_DETAIL.BACK}
          </Link>
        </div>
      </>
    );
  }

  const enrollOk = msg === COURSE_DETAIL.ENROLL_SUCCESS;

  return (
    <>
      <PageHeader title={course.title} crumbs={[{ label: COURSE_DETAIL.CRUMB, to: '/courses' }, { label: course.title, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-base-300 shadow-lg">
            <img src={course.thumbnail_url || '/img/course-1.png'} alt="" className="h-full w-full object-cover" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-primary">{course.title}</h2>
            <p className="mt-4 text-base-content/80">{course.description || COURSE_DETAIL.NO_DESC}</p>
            <p className="mt-4 text-sm text-base-content/70">
              <strong>{COURSE_DETAIL.LEVEL}:</strong> {course.level || '—'} · <strong>{COURSE_DETAIL.DURATION}:</strong>{' '}
              {course.duration_hours != null ? `${course.duration_hours} ${COMMON.HOURS}` : '—'}
            </p>
            {msg ? (
              <div role="alert" className={`alert mt-4 ${enrollOk ? 'alert-success' : 'alert-info'}`}>
                {msg}
              </div>
            ) : null}
            {profile?.role === 'student' ? (
              <button type="button" className="btn btn-primary mt-6" disabled={enrolling} onClick={enroll}>
                {enrolling ? <span className="loading loading-spinner" /> : null}
                {enrolling ? COURSE_DETAIL.ENROLLING : COURSE_DETAIL.ENROLL}
              </button>
            ) : null}
            {!session ? (
              <p className="mt-4 text-sm">
                <Link to="/login" className="link link-primary">
                  {COURSE_DETAIL.LOGIN_LINK}
                </Link>
                {COURSE_DETAIL.LOGIN_SUFFIX}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
