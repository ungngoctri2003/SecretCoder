import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { supabaseAdmin } from '../supabase.js';

const r = Router();

r.use(requireAuth, requireRole('admin'));

r.get('/users', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, created_at')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.patch('/users/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body || {};
  if (!['admin', 'student', 'teacher'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'User not found' });
  res.json(data);
});

r.get('/contact-messages', async (_req, res) => {
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
r.get('/courses', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*, categories(id, name, slug)')
    .order('updated_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.post('/courses', async (req, res) => {
  const body = req.body || {};
  if (!body.title || !body.slug) {
    return res.status(400).json({ error: 'title and slug required' });
  }
  const { data, error } = await supabaseAdmin
    .from('courses')
    .insert({
      title: body.title,
      slug: body.slug,
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
