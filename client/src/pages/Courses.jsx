import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Users, Gauge, Clock, ChevronRight } from 'lucide-react';
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
            <div key={cat.id} className="card border border-base-300 bg-base-100 shadow-md transition-shadow hover:shadow-lg">
              <figure className="px-4 pt-4">
                {cat.image_url ? (
                  <img src={cat.image_url} alt="" className="h-28 w-full rounded-xl object-contain" />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center rounded-xl bg-base-200 text-base-content/60">
                    {cat.name}
                  </div>
                )}
              </figure>
              <div className="card-body items-center py-4 text-center">
                <h3 className="card-title text-base">{cat.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 pb-16">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{COURSES_PAGE.TITLE}</p>
          <h2 className="font-display mt-2 text-3xl font-bold md:text-4xl">{COURSES_PAGE.ALL_COURSES}</h2>
        </div>
        {err ? (
          <div role="alert" className="alert alert-error mt-8">
            {err}
          </div>
        ) : null}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((course) => (
            <div key={course.id} className="card border border-base-300 bg-base-100 shadow-md transition-shadow hover:shadow-xl">
              <figure className="relative aspect-video">
                <img src={course.thumbnail_url || '/img/course-1.png'} alt="" className="h-full w-full object-cover" />
                <span className="badge badge-primary absolute left-3 top-3 border-0 font-bold uppercase">
                  {course.price_cents === 0 ? COMMON.FREE : `$${(course.price_cents / 100).toFixed(0)}`}
                </span>
              </figure>
              <div className="card-body gap-2 p-4">
                <h3 className="card-title line-clamp-2 text-base leading-snug">
                  <Link to={`/courses/${course.slug}`} className="link link-hover">
                    {course.title}
                  </Link>
                </h3>
                <div className="flex flex-wrap gap-2 text-xs text-base-content/70">
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-warning" />
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
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-base-200 pt-2 text-sm">
                  <span className="flex items-center gap-1 text-base-content/70">
                    <Clock className="h-4 w-4" />
                    {course.duration_hours != null ? `${course.duration_hours} ${COMMON.HOURS}` : '—'}
                  </span>
                  <span className="font-semibold">
                    {course.price_cents === 0 ? '\u20B9 0' : `$${(course.price_cents / 100).toFixed(0)}`}
                  </span>
                  <Link to={`/courses/${course.slug}`} className="link link-primary flex items-center gap-0.5 text-sm font-semibold">
                    {COMMON.VIEW}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        {!err && courses.length === 0 ? (
          <p className="mt-8 text-center text-base-content/60">{COURSES_PAGE.EMPTY}</p>
        ) : null}
      </div>
    </>
  );
}
