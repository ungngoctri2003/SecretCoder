import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { supabaseAdmin } from '../supabase.js';

const r = Router();

r.use(requireAuth, requireRole('admin'));

r.get('/users', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, email, created_at')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

r.post('/users', async (req, res) => {
  const { email, password, full_name, role } = req.body || {};
  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password required' });
  }
  const rVal = role && ['admin', 'student'].includes(role) ? role : 'student';
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: email.trim(),
    password,
    email_confirm: true,
    user_metadata: { full_name: typeof full_name === 'string' ? full_name : '' },
  });
  if (createErr) return res.status(400).json({ error: createErr.message });
  const uid = created.user.id;

  const profilePatch = { role: rVal };
  if (typeof full_name === 'string' && full_name.trim()) {
    profilePatch.full_name = full_name.trim();
  }
  const { error: upErr } = await supabaseAdmin.from('profiles').update(profilePatch).eq('id', uid);
  if (upErr) return res.status(500).json({ error: upErr.message });

  const { data: row, error: fetchErr } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, email, created_at')
    .eq('id', uid)
    .single();
  if (fetchErr || !row) return res.status(500).json({ error: fetchErr?.message || 'Profile fetch failed' });
  res.status(201).json(row);
});

r.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, role, email, password } = req.body || {};

  if (id === req.user.id && role === 'student' && req.user.role === 'admin') {
    return res.status(400).json({ error: 'Cannot remove own admin role' });
  }

  const authUpdate = {};
  if (typeof email === 'string' && email.trim()) authUpdate.email = email.trim();
  if (typeof password === 'string' && password.length > 0) authUpdate.password = password;
  if (Object.keys(authUpdate).length > 0) {
    const { error: auErr } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdate);
    if (auErr) return res.status(400).json({ error: auErr.message });
  }

  const profilePatch = {};
  if (full_name !== undefined) {
    profilePatch.full_name = typeof full_name === 'string' && full_name.trim() ? full_name.trim() : null;
  }
  if (role !== undefined) {
    if (!['admin', 'student'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    profilePatch.role = role;
  }
  if (Object.keys(profilePatch).length > 0) {
    const { error: pErr } = await supabaseAdmin.from('profiles').update(profilePatch).eq('id', id);
    if (pErr) return res.status(500).json({ error: pErr.message });
  }

  const { data: row, error: fetchErr } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, email, created_at')
    .eq('id', id)
    .single();
  if (fetchErr || !row) return res.status(404).json({ error: 'User not found' });
  res.json(row);
});

r.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete own account' });
  }
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

r.get('/contact-messages', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Categories CRUD
r.post('/categories', async (req, res) => {
  const { name, slug, image_url, sort_order } = req.body || {};
  if (!name || !slug) return res.status(400).json({ error: 'name and slug required' });
  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({
      name,
      slug,
      image_url: image_url ?? null,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

r.patch('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const patch = {};
  for (const k of ['name', 'slug', 'image_url', 'sort_order']) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.delete('/categories/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('categories').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// Courses (admin full)
r.get('/content-stats', async (_req, res) => {
  const [coursesRes, lecturesRes, quizzesRes] = await Promise.all([
    supabaseAdmin.from('courses').select('id, title, published, created_at'),
    supabaseAdmin.from('course_lectures').select('course_id, created_at'),
    supabaseAdmin.from('course_quizzes').select('course_id, created_at'),
  ]);
  if (coursesRes.error) return res.status(500).json({ error: coursesRes.error.message });
  if (lecturesRes.error) return res.status(500).json({ error: lecturesRes.error.message });
  if (quizzesRes.error) return res.status(500).json({ error: quizzesRes.error.message });

  const courses = coursesRes.data || [];
  const lectures = lecturesRes.data || [];
  const quizzes = quizzesRes.data || [];

  const publishedCourses = courses.filter((c) => c.published).length;
  const summary = {
    totalCourses: courses.length,
    publishedCourses,
    draftCourses: courses.length - publishedCourses,
    totalLectures: lectures.length,
    totalQuizzes: quizzes.length,
  };

  const lectureByCourse = new Map();
  for (const row of lectures) {
    const id = row.course_id;
    if (!id) continue;
    lectureByCourse.set(id, (lectureByCourse.get(id) || 0) + 1);
  }
  const quizByCourse = new Map();
  for (const row of quizzes) {
    const id = row.course_id;
    if (!id) continue;
    quizByCourse.set(id, (quizByCourse.get(id) || 0) + 1);
  }

  const byCourse = courses
    .map((c) => ({
      id: c.id,
      title: c.title || '—',
      lectures: lectureByCourse.get(c.id) || 0,
      quizzes: quizByCourse.get(c.id) || 0,
    }))
    .sort((a, b) => b.lectures + b.quizzes - (a.lectures + a.quizzes))
    .slice(0, 8);

  const dayKeys = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    dayKeys.push(d.toISOString().slice(0, 10));
  }
  const timelineMap = new Map(dayKeys.map((k) => [k, { day: k, courses: 0, lectures: 0, quizzes: 0 }]));
  for (const c of courses) {
    if (!c.created_at) continue;
    const key = new Date(c.created_at).toISOString().slice(0, 10);
    const row = timelineMap.get(key);
    if (row) row.courses += 1;
  }
  for (const row of lectures) {
    if (!row.created_at) continue;
    const key = new Date(row.created_at).toISOString().slice(0, 10);
    const t = timelineMap.get(key);
    if (t) t.lectures += 1;
  }
  for (const row of quizzes) {
    if (!row.created_at) continue;
    const key = new Date(row.created_at).toISOString().slice(0, 10);
    const t = timelineMap.get(key);
    if (t) t.quizzes += 1;
  }
  const timeline = [...timelineMap.values()].map((row) => {
    const [, m, d] = row.day.split('-');
    return { day: `${d}/${m}`, courses: row.courses, lectures: row.lectures, quizzes: row.quizzes };
  });

  res.json({ summary, byCourse, timeline });
});

r.get('/courses', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*, categories(id, name, slug)')
    .order('updated_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

function slugFromTitle(title) {
  const raw = String(title || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  let s = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (!s) s = `khoa-hoc-${Date.now()}`;
  return s.slice(0, 120);
}

r.post('/courses', async (req, res) => {
  const body = req.body || {};
  if (!body.title || typeof body.title !== 'string' || !String(body.title).trim()) {
    return res.status(400).json({ error: 'title required' });
  }
  const slug =
    typeof body.slug === 'string' && String(body.slug).trim()
      ? String(body.slug).trim().toLowerCase().replace(/\s+/g, '-').slice(0, 120)
      : slugFromTitle(body.title);
  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert({
      title: String(body.title).trim(),
      slug,
      description: body.description ?? null,
      thumbnail_url: body.thumbnail_url ?? null,
      category_id: body.category_id ?? null,
      teacher_id: body.teacher_id ?? null,
      published: !!body.published,
      price_cents: body.price_cents ?? 0,
      duration_hours: body.duration_hours ?? null,
      level: body.level ?? null,
      rating: body.rating ?? null,
      learners_count: body.learners_count ?? null,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

r.patch('/courses/:id', async (req, res) => {
  const { id } = req.params;
  const allowed = [
    'title', 'slug', 'description', 'thumbnail_url', 'category_id', 'teacher_id',
    'published', 'price_cents', 'duration_hours', 'level', 'rating', 'learners_count',
  ];
  const patch = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }
  if (patch.title !== undefined && req.body.slug === undefined) {
    patch.slug = slugFromTitle(patch.title);
  }
  const { data, error } = await supabaseAdmin
    .from('courses')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.delete('/courses/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('courses').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

r.get('/enrollments', async (_req, res) => {
  const { data: rows, error } = await supabaseAdmin
    .from('enrollments')
    .select('id, enrolled_at, student_id, course_id, courses(id, title, slug), profiles(id, full_name, email)')
    .order('enrolled_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const list = rows || [];

  const byCourseMap = new Map();
  for (const row of list) {
    const c = row.courses;
    const cid = c?.id || row.course_id;
    if (!cid) continue;
    const cur = byCourseMap.get(cid) || {
      course_id: cid,
      title: c?.title || '—',
      slug: c?.slug || '',
      count: 0,
    };
    cur.count += 1;
    byCourseMap.set(cid, cur);
  }
  const byCourse = [...byCourseMap.values()].sort((a, b) => b.count - a.count);

  const byDayMap = new Map();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    byDayMap.set(key, 0);
  }
  for (const row of list) {
    if (!row.enrolled_at) continue;
    const key = new Date(row.enrolled_at).toISOString().slice(0, 10);
    if (byDayMap.has(key)) byDayMap.set(key, (byDayMap.get(key) || 0) + 1);
  }
  const byDay = [...byDayMap.entries()].map(([day, count]) => ({ day, count }));

  res.json({
    enrollments: list,
    stats: { byCourse, byDay },
  });
});

r.get('/quiz-analytics', async (_req, res) => {
  const { data: rows, error } = await supabaseAdmin
    .from('quiz_attempts')
    .select(
      `
      id,
      student_id,
      quiz_id,
      course_id,
      correct,
      total,
      percent,
      submitted_at,
      course_quizzes ( title ),
      courses ( title, slug ),
      profiles ( full_name, email )
    `,
    )
    .order('submitted_at', { ascending: false })
    .limit(2000);
  if (error) return res.status(500).json({ error: error.message });
  const list = (rows || []).map((row) => ({
    id: row.id,
    student_id: row.student_id,
    quiz_id: row.quiz_id,
    course_id: row.course_id,
    correct: row.correct,
    total: row.total,
    percent: row.percent,
    submitted_at: row.submitted_at,
    quiz_title: row.course_quizzes?.title ?? null,
    course_title: row.courses?.title ?? null,
    course_slug: row.courses?.slug ?? null,
    student_name: row.profiles?.full_name ?? null,
    student_email: row.profiles?.email ?? null,
  }));

  const n = list.length;
  const avgPercent = n === 0 ? 0 : Math.round(list.reduce((s, r) => s + (r.percent || 0), 0) / n);
  const distinctStudents = new Set(list.map((r) => r.student_id)).size;

  const byCourseMap = new Map();
  for (const row of list) {
    const cid = row.course_id;
    if (!cid) continue;
    const cur = byCourseMap.get(cid) || {
      course_id: cid,
      title: row.course_title || '—',
      slug: row.course_slug || '',
      attempts: 0,
      percentSum: 0,
    };
    cur.attempts += 1;
    cur.percentSum += row.percent || 0;
    byCourseMap.set(cid, cur);
  }
  const byCourse = [...byCourseMap.values()]
    .map((c) => ({
      course_id: c.course_id,
      title: c.title,
      slug: c.slug,
      attempts: c.attempts,
      avgPercent: c.attempts === 0 ? 0 : Math.round(c.percentSum / c.attempts),
    }))
    .sort((a, b) => b.attempts - a.attempts);

  const byDayMap = new Map();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    byDayMap.set(key, 0);
  }
  for (const row of list) {
    if (!row.submitted_at) continue;
    const key = new Date(row.submitted_at).toISOString().slice(0, 10);
    if (byDayMap.has(key)) byDayMap.set(key, (byDayMap.get(key) || 0) + 1);
  }
  const byDay = [...byDayMap.entries()].map(([day, count]) => ({ day, count }));

  const bands = [
    { key: '0–49%', min: 0, max: 49, count: 0 },
    { key: '50–69%', min: 50, max: 69, count: 0 },
    { key: '70–89%', min: 70, max: 89, count: 0 },
    { key: '90–100%', min: 90, max: 100, count: 0 },
  ];
  for (const row of list) {
    const p = row.percent ?? 0;
    const b = bands.find((x) => p >= x.min && p <= x.max);
    if (b) b.count += 1;
  }
  const byScoreBand = bands.map(({ key, count }) => ({ band: key, count }));

  res.json({
    attempts: list,
    summary: {
      totalAttempts: n,
      avgPercent,
      distinctStudents,
    },
    stats: { byCourse, byDay, byScoreBand },
  });
});

// Course lectures
r.get('/courses/:courseId/lectures', async (req, res) => {
  const { courseId } = req.params;
  const { data, error } = await supabaseAdmin
    .from('course_lectures')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.post('/courses/:courseId/lectures', async (req, res) => {
  const { courseId } = req.params;
  const body = req.body || {};
  if (!body.title) return res.status(400).json({ error: 'title required' });
  let blocks = body.blocks;
  if (blocks !== undefined && !Array.isArray(blocks)) {
    return res.status(400).json({ error: 'blocks must be an array' });
  }
  if (Array.isArray(blocks) && blocks.length > 0) {
    blocks = blocks.map((b) => ({
      title: b?.title != null && String(b.title).trim() ? String(b.title).trim() : null,
      content: b?.content != null && String(b.content).trim() ? String(b.content).trim() : null,
      video_url: b?.video_url != null && String(b.video_url).trim() ? String(b.video_url).trim() : null,
    }));
  } else {
    blocks = [];
  }
  const useBlocks = blocks.some((b) => b.title || b.content || b.video_url);
  const { data, error } = await supabaseAdmin
    .from('course_lectures')
    .insert({
      course_id: courseId,
      title: body.title,
      content: useBlocks ? null : body.content ?? null,
      video_url: useBlocks ? null : body.video_url ?? null,
      blocks: useBlocks ? blocks : [],
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

r.patch('/lectures/:id', async (req, res) => {
  const patch = {};
  for (const k of ['title', 'content', 'video_url', 'sort_order', 'blocks']) {
    if (req.body[k] !== undefined) {
      if (k === 'blocks') {
        if (!Array.isArray(req.body.blocks)) {
          return res.status(400).json({ error: 'blocks must be an array' });
        }
        patch.blocks = req.body.blocks.map((b) => ({
          title: b?.title != null && String(b.title).trim() ? String(b.title).trim() : null,
          content: b?.content != null && String(b.content).trim() ? String(b.content).trim() : null,
          video_url: b?.video_url != null && String(b.video_url).trim() ? String(b.video_url).trim() : null,
        }));
      } else {
        patch[k] = req.body[k];
      }
    }
  }
  if (
    patch.blocks !== undefined &&
    Array.isArray(patch.blocks) &&
    patch.blocks.some((b) => b.title || b.content || b.video_url)
  ) {
    patch.content = null;
    patch.video_url = null;
  }
  const { data, error } = await supabaseAdmin
    .from('course_lectures')
    .update(patch)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.delete('/lectures/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('course_lectures').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// Course quizzes (questions: JSON array of { question, options[], correctIndex })
r.get('/courses/:courseId/quizzes', async (req, res) => {
  const { courseId } = req.params;
  const { data, error } = await supabaseAdmin
    .from('course_quizzes')
    .select('*')
    .eq('course_id', courseId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.post('/courses/:courseId/quizzes', async (req, res) => {
  const { courseId } = req.params;
  const body = req.body || {};
  if (!body.title) return res.status(400).json({ error: 'title required' });
  let questions = body.questions;
  if (questions === undefined) questions = [];
  if (!Array.isArray(questions)) return res.status(400).json({ error: 'questions must be an array' });
  const { data, error } = await supabaseAdmin
    .from('course_quizzes')
    .insert({
      course_id: courseId,
      title: body.title,
      description: body.description ?? null,
      questions,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

r.patch('/quizzes/:id', async (req, res) => {
  const patch = {};
  for (const k of ['title', 'description', 'questions', 'sort_order']) {
    if (req.body[k] !== undefined) {
      if (k === 'questions' && !Array.isArray(req.body[k])) {
        return res.status(400).json({ error: 'questions must be an array' });
      }
      patch[k] = req.body[k];
    }
  }
  const { data, error } = await supabaseAdmin
    .from('course_quizzes')
    .update(patch)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.delete('/quizzes/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('course_quizzes').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// Team
r.post('/team', async (req, res) => {
  const { name, role_title, image_url, bio, sort_order } = req.body || {};
  if (!name) return res.status(400).json({ error: 'name required' });
  const { data, error } = await supabaseAdmin
    .from('team_members')
    .insert({
      name,
      role_title: role_title ?? null,
      image_url: image_url ?? null,
      bio: bio ?? null,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

r.patch('/team/:id', async (req, res) => {
  const patch = {};
  for (const k of ['name', 'role_title', 'image_url', 'bio', 'sort_order']) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }
  const { data, error } = await supabaseAdmin
    .from('team_members')
    .update(patch)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.delete('/team/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('team_members').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

// Testimonials
r.post('/testimonials', async (req, res) => {
  const { author_name, author_title, content, image_url, rating, sort_order } = req.body || {};
  if (!author_name || !content) {
    return res.status(400).json({ error: 'author_name and content required' });
  }
  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .insert({
      author_name,
      author_title: author_title ?? null,
      content,
      image_url: image_url ?? null,
      rating: rating ?? null,
      sort_order: sort_order ?? 0,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

r.patch('/testimonials/:id', async (req, res) => {
  const patch = {};
  for (const k of ['author_name', 'author_title', 'content', 'image_url', 'rating', 'sort_order']) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
  }
  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .update(patch)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.delete('/testimonials/:id', async (req, res) => {
  const { error } = await supabaseAdmin.from('testimonials').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

export default r;
