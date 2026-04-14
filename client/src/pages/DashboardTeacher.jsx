import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { DASH_TEACHER, DASH_STUDENT } from '../strings/vi';
import { COMMON } from '../strings/vi';
import { ERR } from '../strings/vi';

export function DashboardTeacher() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [published, setPublished] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('/img/course-1.png');

  async function refresh() {
    if (!token) return;
    const [c, e, cat] = await Promise.all([
      apiFetch('/api/teacher/courses', {}, token),
      apiFetch('/api/teacher/enrollments', {}, token),
      apiFetch('/api/categories'),
    ]);
    setCourses(c || []);
    setEnrollments(e || []);
    setCategories(cat || []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!token) return;
        await refresh();
      } catch (e) {
        if (!cancelled) setErr(e.message || ERR.LOAD);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function createCourse(e) {
    e.preventDefault();
    setMsg('');
    setErr('');
    try {
      await apiFetch(
        '/api/teacher/courses',
        {
          method: 'POST',
          body: JSON.stringify({
            title,
            slug: slug || undefined,
            description,
            category_id: categoryId || null,
            published,
            thumbnail_url: thumbnailUrl || null,
          }),
        },
        token,
      );
      setMsg(DASH_TEACHER.MSG_CREATED);
      setTitle('');
      setSlug('');
      setDescription('');
      setCategoryId('');
      setPublished(false);
      await refresh();
    } catch (er) {
      setErr(er.data?.error || er.message);
    }
  }

  async function togglePublish(course) {
    setErr('');
    try {
      await apiFetch(
        `/api/teacher/courses/${course.id}`,
        { method: 'PATCH', body: JSON.stringify({ published: !course.published }) },
        token,
      );
      await refresh();
    } catch (er) {
      setErr(er.data?.error || er.message);
    }
  }

  return (
    <>
      <PageHeader title={DASH_TEACHER.TITLE} crumbs={[{ label: COMMON.DASH_CRUMB, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <Link to="/courses" className="link link-primary text-sm">
          {DASH_TEACHER.VIEW_CATALOG}
        </Link>
        {err ? (
          <div role="alert" className="alert alert-error mt-4">
            {err}
          </div>
        ) : null}
        {msg ? (
          <div role="alert" className="alert alert-success mt-4">
            {msg}
          </div>
        ) : null}

        <h3 className="font-display mt-8 text-xl font-bold text-primary">{DASH_TEACHER.CREATE_COURSE}</h3>
        <form className="card mt-4 border border-base-300 bg-base-100 shadow" onSubmit={createCourse}>
          <div className="card-body grid gap-4 md:grid-cols-2">
            <label className="form-control w-full md:col-span-1">
              <span className="label-text">{DASH_TEACHER.LABEL_TITLE}</span>
              <input className="input input-bordered w-full" required value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="form-control w-full md:col-span-1">
              <span className="label-text">{DASH_TEACHER.LABEL_SLUG}</span>
              <input
                className="input input-bordered w-full"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={DASH_TEACHER.SLUG_PLACEHOLDER}
              />
            </label>
            <label className="form-control w-full md:col-span-2">
              <span className="label-text">{DASH_TEACHER.LABEL_DESC}</span>
              <textarea className="textarea textarea-bordered h-24 w-full" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label className="form-control w-full">
              <span className="label-text">{DASH_TEACHER.LABEL_CATEGORY}</span>
              <select className="select select-bordered w-full" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-control w-full">
              <span className="label-text">{DASH_TEACHER.LABEL_THUMB}</span>
              <input className="input input-bordered w-full" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} />
            </label>
            <label className="label cursor-pointer justify-start gap-3 md:col-span-2">
              <input type="checkbox" className="checkbox checkbox-primary" checked={published} onChange={(e) => setPublished(e.target.checked)} />
              <span className="label-text">{DASH_TEACHER.LABEL_PUBLISHED}</span>
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="btn btn-primary">
                {DASH_TEACHER.SAVE_COURSE}
              </button>
            </div>
          </div>
        </form>

        <h3 className="font-display mt-12 text-xl font-bold text-primary">{DASH_TEACHER.MY_COURSES}</h3>
        <div className="mt-4 overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>{DASH_TEACHER.TH_TITLE}</th>
                <th>{DASH_TEACHER.TH_SLUG}</th>
                <th>{DASH_TEACHER.TH_PUBLISHED}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>
                    <code className="text-xs">{c.slug}</code>
                  </td>
                  <td>{c.published ? COMMON.YES : COMMON.NO}</td>
                  <td className="flex flex-wrap gap-2">
                    <button type="button" className="btn btn-outline btn-xs" onClick={() => togglePublish(c)}>
                      {DASH_TEACHER.TOGGLE_PUBLISH}
                    </button>
                    <Link to={`/courses/${c.slug}`} className="btn btn-ghost btn-xs">
                      {COMMON.VIEW}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-display mt-12 text-xl font-bold text-primary">{DASH_TEACHER.ENROLL_TITLE}</h3>
        <div className="mt-4 overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>{DASH_STUDENT.TH_COURSE}</th>
                <th>{DASH_TEACHER.TH_STUDENT_ID}</th>
                <th>{DASH_TEACHER.TH_ENROLLED}</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((r) => (
                <tr key={r.id}>
                  <td>{r.courses?.title}</td>
                  <td>
                    <code className="text-xs">{r.student_id}</code>
                  </td>
                  <td className="text-sm">{r.enrolled_at ? new Date(r.enrolled_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {enrollments.length === 0 ? <p className="mt-4 text-center text-base-content/60">{DASH_TEACHER.NO_ENROLLMENTS}</p> : null}
      </div>
    </>
  );
}
