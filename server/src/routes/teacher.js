import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { supabaseAdmin } from '../supabase.js';

const r = Router();

r.use(requireAuth, requireRole('teacher'));

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}

r.get('/courses', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*, categories(id, name, slug)')
    .eq('teacher_id', req.user.id)
    .order('updated_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.post('/courses', async (req, res) => {
  const {
    title,
    slug,
    description,
    thumbnail_url,
    category_id,
    published,
    price_cents,
    duration_hours,
    level,
    rating,
    learners_count,
  } = req.body || {};
  if (!title) return res.status(400).json({ error: 'title required' });
  const finalSlug = slug && String(slug).trim() ? String(slug).trim() : slugify(title);

  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert({
      title,
      slug: finalSlug,
      description: description ?? null,
      thumbnail_url: thumbnail_url ?? null,
      category_id: category_id ?? null,
      teacher_id: req.user.id,
      published: !!published,
      price_cents: price_cents ?? 0,
      duration_hours: duration_hours ?? null,
      level: level ?? null,
      rating: rating ?? null,
      learners_count: learners_count ?? null,
    })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

r.patch('/courses/:id', async (req, res) => {
  const { id } = req.params;
  const { data: existing, error: e0 } = await supabaseAdmin
    .from('courses')
    .select('id, teacher_id')
    .eq('id', id)
    .single();
  if (e0 || !existing || existing.teacher_id !== req.user.id) {
    return res.status(404).json({ error: 'Course not found' });
  }
  const allowed = [
    'title', 'slug', 'description', 'thumbnail_url', 'category_id',
    'published', 'price_cents', 'duration_hours', 'level', 'rating', 'learners_count',
  ];
  const patch = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) patch[k] = req.body[k];
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

r.get('/enrollments', async (req, res) => {
  const { data: myCourses, error: e1 } = await supabaseAdmin
    .from('courses')
    .select('id')
    .eq('teacher_id', req.user.id);
  if (e1) return res.status(500).json({ error: e1.message });
  const ids = (myCourses || []).map((c) => c.id);
  if (ids.length === 0) return res.json([]);

  const { data, error } = await supabaseAdmin
    .from('enrollments')
    .select('id, student_id, course_id, enrolled_at, courses(title, slug)')
    .in('course_id', ids);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default r;
