import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { supabaseAdmin } from '../supabase.js';

const r = Router();

r.post('/', requireAuth, requireRole('student'), async (req, res) => {
  const { course_id: courseId } = req.body || {};
  if (!courseId) return res.status(400).json({ error: 'course_id required' });

  const { data: course, error: cErr } = await supabaseAdmin
    .from('courses')
    .select('id, published')
    .eq('id', courseId)
    .single();
  if (cErr || !course) return res.status(404).json({ error: 'Course not found' });
  if (!course.published) return res.status(400).json({ error: 'Course not available' });

  const { data, error } = await supabaseAdmin
    .from('enrollments')
    .insert({ student_id: req.user.id, course_id: courseId })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Already enrolled' });
    }
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
});

r.get('/me', requireAuth, requireRole('student'), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('enrollments')
    .select('*, courses(*)')
    .eq('student_id', req.user.id)
    .order('enrolled_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

export default r;
