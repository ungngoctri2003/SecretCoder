import { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import { DASH_ADMIN, DASH_TEACHER } from '../strings/vi';
import { COMMON } from '../strings/vi';
import { ERR } from '../strings/vi';

const TAB_KEYS = ['users', 'contacts', 'categories', 'courses', 'team', 'testimonials'];

export function DashboardAdmin() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [tab, setTab] = useState('users');
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');

  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [team, setTeam] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catImg, setCatImg] = useState('');

  const [courseForm, setCourseForm] = useState({
    title: '',
    slug: '',
    description: '',
    thumbnail_url: '/img/course-1.png',
    category_id: '',
    teacher_id: '',
    published: true,
    price_cents: 0,
    duration_hours: '',
    level: DASH_ADMIN.LEVEL_DEFAULT,
    rating: '',
    learners_count: '',
  });

  const [teamForm, setTeamForm] = useState({ name: '', role_title: '', image_url: '', bio: '' });
  const [testForm, setTestForm] = useState({ author_name: '', author_title: '', content: '', rating: 5 });

  async function loadAll() {
    if (!token) return;
    const [u, co, ca, cr, t, te] = await Promise.all([
      apiFetch('/api/admin/users', {}, token),
      apiFetch('/api/admin/contact-messages', {}, token),
      apiFetch('/api/categories'),
      apiFetch('/api/admin/courses', {}, token),
      apiFetch('/api/team'),
      apiFetch('/api/testimonials'),
    ]);
    setUsers(u || []);
    setContacts(co || []);
    setCategories(ca || []);
    setCourses(cr || []);
    setTeam(t || []);
    setTestimonials(te || []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!token) return;
        await loadAll();
      } catch (e) {
        if (!cancelled) setErr(e.message || ERR.LOAD_FAILED);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function updateRole(userId, role) {
    setErr('');
    try {
      await apiFetch(`/api/admin/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }, token);
      setMsg(DASH_ADMIN.ROLE_UPDATED);
      await loadAll();
    } catch (e) {
      setErr(e.data?.error || e.message);
    }
  }

  async function addCategory(e) {
    e.preventDefault();
    setErr('');
    try {
      await apiFetch(
        '/api/admin/categories',
        { method: 'POST', body: JSON.stringify({ name: catName, slug: catSlug, image_url: catImg || null }) },
        token,
      );
      setCatName('');
      setCatSlug('');
      setCatImg('');
      await loadAll();
    } catch (e) {
      setErr(e.data?.error || e.message);
    }
  }

  async function deleteCategory(id) {
    if (!confirm(DASH_ADMIN.CONFIRM_DEL_CAT)) return;
    setErr('');
    try {
      await apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' }, token);
      await loadAll();
    } catch (e) {
      setErr(e.data?.error || e.message);
    }
  }

  async function addCourse(e) {
    e.preventDefault();
    setErr('');
    try {
      await apiFetch(
        '/api/admin/courses',
        {
          method: 'POST',
          body: JSON.stringify({
            title: courseForm.title,
            slug: courseForm.slug,
            description: courseForm.description || null,
            thumbnail_url: courseForm.thumbnail_url || null,
            category_id: courseForm.category_id || null,
            teacher_id: courseForm.teacher_id || null,
            published: courseForm.published,
            price_cents: Number(courseForm.price_cents) || 0,
            duration_hours: courseForm.duration_hours === '' ? null : Number(courseForm.duration_hours),
            level: courseForm.level || null,
            rating: courseForm.rating === '' ? null : Number(courseForm.rating),
            learners_count: courseForm.learners_count || null,
          }),
        },
        token,
      );
      setMsg(DASH_ADMIN.COURSE_CREATED);
      await loadAll();
    } catch (e) {
      setErr(e.data?.error || e.message);
    }
  }

  async function deleteCourse(id) {
    if (!confirm(DASH_ADMIN.CONFIRM_DEL_COURSE)) return;
    setErr('');
    try {
      await apiFetch(`/api/admin/courses/${id}`, { method: 'DELETE' }, token);
      await loadAll();
    } catch (e) {
      setErr(e.data?.error || e.message);
    }
  }

  async function addTeam(e) {
    e.preventDefault();
    setErr('');
    try {
      await apiFetch('/api/admin/team', { method: 'POST', body: JSON.stringify(teamForm) }, token);
      setTeamForm({ name: '', role_title: '', image_url: '', bio: '' });
      await loadAll();
    } catch (e) {
      setErr(e.data?.error || e.message);
    }
  }

  async function deleteTeam(id) {
    if (!confirm(DASH_ADMIN.CONFIRM_DEL)) return;
    await apiFetch(`/api/admin/team/${id}`, { method: 'DELETE' }, token);
    await loadAll();
  }

  async function addTestimonial(e) {
    e.preventDefault();
    setErr('');
    try {
      await apiFetch(
        '/api/admin/testimonials',
        { method: 'POST', body: JSON.stringify({ ...testForm, rating: Number(testForm.rating) }) },
        token,
      );
      setTestForm({ author_name: '', author_title: '', content: '', rating: 5 });
      await loadAll();
    } catch (e) {
      setErr(e.data?.error || e.message);
    }
  }

  async function deleteTestimonial(id) {
    if (!confirm(DASH_ADMIN.CONFIRM_DEL)) return;
    await apiFetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' }, token);
    await loadAll();
  }

  const teachers = users.filter((u) => u.role === 'teacher');

  return (
    <>
      <PageHeader title={DASH_ADMIN.TITLE} crumbs={[{ label: DASH_ADMIN.CRUMB, active: true }]} />
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {err ? (
          <div role="alert" className="alert alert-error">
            {err}
          </div>
        ) : null}
        {msg ? (
          <div role="alert" className="alert alert-success">
            {msg}
          </div>
        ) : null}

        <div role="tablist" className="tabs tabs-boxed mt-6 flex flex-wrap gap-1 bg-base-200 p-2">
          {TAB_KEYS.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              className={`tab tab-sm ${tab === k ? 'tab-active' : ''}`}
              onClick={() => setTab(k)}
            >
              {DASH_ADMIN.TABS[k]}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === 'users' && (
            <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>{DASH_ADMIN.TH_NAME}</th>
                    <th>{DASH_ADMIN.TH_ID}</th>
                    <th>{DASH_ADMIN.TH_ROLE}</th>
                    <th>{DASH_ADMIN.TH_CHANGE}</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.full_name}</td>
                      <td>
                        <code className="text-xs">{u.id}</code>
                      </td>
                      <td>{u.role}</td>
                      <td>
                        <select
                          className="select select-bordered select-sm max-w-[140px]"
                          value={u.role}
                          onChange={(e) => updateRole(u.id, e.target.value)}
                        >
                          <option value="student">{DASH_ADMIN.ROLE_STUDENT}</option>
                          <option value="teacher">{DASH_ADMIN.ROLE_TEACHER}</option>
                          <option value="admin">{DASH_ADMIN.ROLE_ADMIN}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'contacts' && (
            <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow">
              <table className="table table-zebra table-sm">
                <thead>
                  <tr>
                    <th>{DASH_ADMIN.TH_DATE}</th>
                    <th>{DASH_ADMIN.TH_NAME}</th>
                    <th>{DASH_ADMIN.TH_EMAIL}</th>
                    <th>{DASH_ADMIN.TH_SUBJECT}</th>
                    <th>{DASH_ADMIN.TH_MESSAGE}</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr key={c.id}>
                      <td className="whitespace-nowrap text-xs">{new Date(c.created_at).toLocaleString()}</td>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.subject}</td>
                      <td className="max-w-[240px] whitespace-pre-wrap text-xs">{c.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'categories' && (
            <div className="space-y-6">
              <form className="flex flex-wrap items-end gap-2 rounded-xl border border-base-300 bg-base-100 p-4 shadow" onSubmit={addCategory}>
                <input
                  className="input input-bordered input-sm"
                  placeholder={DASH_ADMIN.PH_NAME}
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                />
                <input
                  className="input input-bordered input-sm"
                  placeholder={DASH_ADMIN.PH_SLUG}
                  required
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                />
                <input
                  className="input input-bordered input-sm flex-1 min-w-[120px]"
                  placeholder={DASH_ADMIN.PH_IMAGE_URL}
                  value={catImg}
                  onChange={(e) => setCatImg(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  {COMMON.ADD}
                </button>
              </form>
              <ul className="divide-y divide-base-300 rounded-xl border border-base-300 bg-base-100">
                {categories.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span>
                      {c.name} <span className="text-sm text-base-content/60">({c.slug})</span>
                    </span>
                    <button type="button" className="btn btn-outline btn-error btn-sm" onClick={() => deleteCategory(c.id)}>
                      {COMMON.DELETE}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'courses' && (
            <div className="space-y-6">
              <form className="card border border-base-300 bg-base-100 shadow" onSubmit={addCourse}>
                <div className="card-body grid gap-3 md:grid-cols-2">
                  <label className="form-control">
                    <span className="label-text">{DASH_TEACHER.LABEL_TITLE}</span>
                    <input
                      className="input input-bordered input-sm"
                      required
                      value={courseForm.title}
                      onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text">Slug</span>
                    <input
                      className="input input-bordered input-sm"
                      required
                      value={courseForm.slug}
                      onChange={(e) => setCourseForm((f) => ({ ...f, slug: e.target.value }))}
                    />
                  </label>
                  <label className="form-control md:col-span-2">
                    <span className="label-text">{DASH_TEACHER.LABEL_DESC}</span>
                    <textarea
                      className="textarea textarea-bordered textarea-sm"
                      rows={2}
                      value={courseForm.description}
                      onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text">{DASH_TEACHER.LABEL_CATEGORY}</span>
                    <select
                      className="select select-bordered select-sm"
                      value={courseForm.category_id}
                      onChange={(e) => setCourseForm((f) => ({ ...f, category_id: e.target.value }))}
                    >
                      <option value="">—</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-control">
                    <span className="label-text">{DASH_ADMIN.LABEL_TEACHER}</span>
                    <select
                      className="select select-bordered select-sm"
                      value={courseForm.teacher_id}
                      onChange={(e) => setCourseForm((f) => ({ ...f, teacher_id: e.target.value }))}
                    >
                      <option value="">—</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.full_name} ({t.id.slice(0, 8)}\u2026)
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-control md:col-span-2">
                    <span className="label-text">{DASH_TEACHER.LABEL_THUMB}</span>
                    <input
                      className="input input-bordered input-sm"
                      value={courseForm.thumbnail_url}
                      onChange={(e) => setCourseForm((f) => ({ ...f, thumbnail_url: e.target.value }))}
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text">{DASH_ADMIN.LABEL_PRICE_CENTS}</span>
                    <input
                      type="number"
                      className="input input-bordered input-sm"
                      value={courseForm.price_cents}
                      onChange={(e) => setCourseForm((f) => ({ ...f, price_cents: e.target.value }))}
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text">{DASH_ADMIN.LABEL_DURATION_H}</span>
                    <input
                      className="input input-bordered input-sm"
                      value={courseForm.duration_hours}
                      onChange={(e) => setCourseForm((f) => ({ ...f, duration_hours: e.target.value }))}
                    />
                  </label>
                  <label className="form-control">
                    <span className="label-text">{DASH_ADMIN.LABEL_LEVEL}</span>
                    <input
                      className="input input-bordered input-sm"
                      value={courseForm.level}
                      onChange={(e) => setCourseForm((f) => ({ ...f, level: e.target.value }))}
                    />
                  </label>
                  <label className="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={courseForm.published}
                      onChange={(e) => setCourseForm((f) => ({ ...f, published: e.target.checked }))}
                    />
                    <span className="label-text">{DASH_ADMIN.LABEL_PUBLISHED}</span>
                  </label>
                  <div className="md:col-span-2">
                    <button type="submit" className="btn btn-primary btn-sm">
                      {DASH_ADMIN.ADD_COURSE}
                    </button>
                  </div>
                </div>
              </form>
              <div className="overflow-x-auto rounded-xl border border-base-300 bg-base-100 shadow">
                <table className="table table-zebra table-sm">
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
                        <td>
                          <button type="button" className="btn btn-outline btn-error btn-xs" onClick={() => deleteCourse(c.id)}>
                            {COMMON.DELETE}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'team' && (
            <div className="space-y-6">
              <form className="flex flex-wrap items-end gap-2 rounded-xl border border-base-300 bg-base-100 p-4 shadow" onSubmit={addTeam}>
                <input
                  className="input input-bordered input-sm"
                  placeholder={DASH_ADMIN.PH_NAME}
                  required
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                />
                <input
                  className="input input-bordered input-sm"
                  placeholder={DASH_ADMIN.PH_ROLE}
                  value={teamForm.role_title}
                  onChange={(e) => setTeamForm({ ...teamForm, role_title: e.target.value })}
                />
                <input
                  className="input input-bordered input-sm"
                  placeholder={DASH_ADMIN.PH_IMAGE_URL}
                  value={teamForm.image_url}
                  onChange={(e) => setTeamForm({ ...teamForm, image_url: e.target.value })}
                />
                <input
                  className="input input-bordered input-sm flex-1 min-w-[100px]"
                  placeholder={DASH_ADMIN.PH_BIO}
                  value={teamForm.bio}
                  onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  {COMMON.ADD}
                </button>
              </form>
              <ul className="divide-y divide-base-300 rounded-xl border border-base-300 bg-base-100">
                {team.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span>
                      {m.name}
                      {' \u2014 '}
                      {m.role_title}
                    </span>
                    <button type="button" className="btn btn-outline btn-error btn-sm" onClick={() => deleteTeam(m.id)}>
                      {COMMON.DELETE}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === 'testimonials' && (
            <div className="space-y-6">
              <form className="flex flex-wrap items-end gap-2 rounded-xl border border-base-300 bg-base-100 p-4 shadow" onSubmit={addTestimonial}>
                <input
                  className="input input-bordered input-sm"
                  placeholder={DASH_ADMIN.PH_AUTHOR}
                  required
                  value={testForm.author_name}
                  onChange={(e) => setTestForm({ ...testForm, author_name: e.target.value })}
                />
                <input
                  className="input input-bordered input-sm"
                  placeholder={DASH_ADMIN.PH_TITLE}
                  value={testForm.author_title}
                  onChange={(e) => setTestForm({ ...testForm, author_title: e.target.value })}
                />
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="input input-bordered input-sm w-20"
                  value={testForm.rating}
                  onChange={(e) => setTestForm({ ...testForm, rating: e.target.value })}
                />
                <input
                  className="input input-bordered input-sm flex-1 min-w-[160px]"
                  placeholder={DASH_ADMIN.PH_CONTENT}
                  required
                  value={testForm.content}
                  onChange={(e) => setTestForm({ ...testForm, content: e.target.value })}
                />
                <button type="submit" className="btn btn-primary btn-sm">
                  {COMMON.ADD}
                </button>
              </form>
              <ul className="divide-y divide-base-300 rounded-xl border border-base-300 bg-base-100">
                {testimonials.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-sm">
                      {t.author_name}: {t.content.slice(0, 80)}
                      {t.content.length > 80 ? '\u2026' : ''}
                    </span>
                    <button type="button" className="btn btn-outline btn-error btn-sm" onClick={() => deleteTestimonial(t.id)}>
                      {COMMON.DELETE}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
