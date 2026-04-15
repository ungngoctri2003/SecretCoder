import { supabaseAdmin } from '../supabase.js';

export function sortContentRows(rows) {
  if (!rows?.length) return [];
  return [...rows].sort((a, b) => {
    const o = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (o !== 0) return o;
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return ta - tb;
  });
}

export function normalizeLectureBlocks(row) {
  const raw = Array.isArray(row.blocks) ? row.blocks : [];
  const cleaned = raw
    .map((b) => ({
      title: b?.title != null && String(b.title).trim() ? String(b.title).trim() : null,
      content: b?.content != null && String(b.content).trim() ? String(b.content).trim() : '',
      video_url: b?.video_url != null && String(b.video_url).trim() ? String(b.video_url).trim() : '',
    }))
    .filter((b) => b.title || b.content || b.video_url);
  if (cleaned.length) return cleaned;
  const c = row.content != null && String(row.content).trim() ? String(row.content).trim() : '';
  const v = row.video_url != null && String(row.video_url).trim() ? String(row.video_url).trim() : '';
  if (c || v) return [{ title: null, content: c, video_url: v }];
  return [];
}

export function toPublicQuiz(row) {
  const raw = Array.isArray(row.questions) ? row.questions : [];
  const questions = raw.map((q) => ({
    question: q?.question ?? '',
    options: Array.isArray(q?.options) ? q.options : [],
  }));
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    sort_order: row.sort_order,
    questions,
  };
}

/**
 * Loads lectures + quizzes for a course (same shape as legacy public detail).
 */
export async function loadCourseLecturesAndQuizzes(courseId) {
  const [{ data: lectureRows, error: lErr }, { data: quizRows, error: zErr }] = await Promise.all([
    supabaseAdmin.from('course_lectures').select('*').eq('course_id', courseId),
    supabaseAdmin.from('course_quizzes').select('*').eq('course_id', courseId),
  ]);
  if (lErr) throw new Error(lErr.message);
  if (zErr) throw new Error(zErr.message);

  const lectures = sortContentRows(lectureRows || []).map((row) => ({
    id: row.id,
    title: row.title,
    sort_order: row.sort_order,
    blocks: normalizeLectureBlocks(row),
  }));
  const quizzes = sortContentRows(quizRows || []).map(toPublicQuiz);
  return { lectures, quizzes };
}

export async function scoreQuizSubmission(quizId, courseId, answers) {
  const { data: quiz, error: qErr } = await supabaseAdmin
    .from('course_quizzes')
    .select('id, course_id, questions')
    .eq('id', quizId)
    .single();
  if (qErr || !quiz) return { error: 'Quiz not found', status: 404 };
  if (quiz.course_id !== courseId) return { error: 'Quiz not found', status: 404 };

  const qs = Array.isArray(quiz.questions) ? quiz.questions : [];
  const total = qs.length;
  let correct = 0;
  for (let i = 0; i < total; i += 1) {
    const ci = qs[i]?.correctIndex;
    const picked = answers[i];
    if (typeof picked === 'number' && typeof ci === 'number' && picked === ci) {
      correct += 1;
    }
  }
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, percent };
}

export async function insertQuizAttempt(studentId, quizId, courseId, scores) {
  const { correct, total, percent } = scores;
  const { error } = await supabaseAdmin.from('quiz_attempts').insert({
    student_id: studentId,
    quiz_id: quizId,
    course_id: courseId,
    correct,
    total,
    percent,
  });
  if (error) throw new Error(error.message);
}
