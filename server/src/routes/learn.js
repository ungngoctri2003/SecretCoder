import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { supabaseAdmin } from '../supabase.js';
import { loadCourseLecturesAndQuizzes, scoreQuizSubmission } from '../lib/courseContent.js';

const r = Router();

async function assertStudentEnrolledInCourse(req, slug) {
  const { data: course, error: cErr } = await supabaseAdmin
    .from('courses')
    .select('id, slug, published')
    .eq('slug', slug)
    .single();
  if (cErr || !course) return { error: 'Course not found', status: 404 };
  if (!course.published) return { error: 'Course not found', status: 404 };

  const { data: enr, error: eErr } = await supabaseAdmin
    .from('enrollments')
    .select('id')
    .eq('student_id', req.user.id)
    .eq('course_id', course.id)
    .maybeSingle();
  if (eErr) return { error: eErr.message, status: 500 };
  if (!enr) return { error: 'NOT_ENROLLED', status: 403 };
  return { course };
}

r.get('/courses/:slug', requireAuth, requireRole('student'), async (req, res) => {
  try {
    const gate = await assertStudentEnrolledInCourse(req, req.params.slug);
    if (gate.error) {
      return res.status(gate.status).json({ error: gate.error });
    }
    const { lectures, quizzes } = await loadCourseLecturesAndQuizzes(gate.course.id);
    res.json({ lectures, quizzes });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Internal error' });
  }
});

r.post('/courses/:slug/quizzes/:quizId/submit', requireAuth, requireRole('student'), async (req, res) => {
  const answers = req.body?.answers;
  if (!Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers must be an array' });
  }
  try {
    const gate = await assertStudentEnrolledInCourse(req, req.params.slug);
    if (gate.error) {
      return res.status(gate.status).json({ error: gate.error });
    }
    const { quizId } = req.params;
    const result = await scoreQuizSubmission(quizId, gate.course.id, answers);
    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }
    res.json({ correct: result.correct, total: result.total, percent: result.percent });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Internal error' });
  }
});

export default r;
