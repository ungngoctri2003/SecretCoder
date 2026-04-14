import { Router } from 'express';
import { supabaseAdmin } from '../supabase.js';

const r = Router();

r.get('/courses', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*, categories(id, name, slug)')
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.get('/courses/:slug', async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*, categories(id, name, slug)')
    .eq('slug', req.params.slug)
    .single();
  if (error || !data) return res.status(404).json({ error: 'Course not found' });
  if (!data.published) return res.status(404).json({ error: 'Course not found' });
  res.json(data);
});

r.get('/categories', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.get('/team', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('team_members')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

r.get('/testimonials', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default r;
