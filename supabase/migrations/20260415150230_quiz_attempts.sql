-- Store quiz submission scores (student dashboard + admin analytics)

CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.course_quizzes (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  correct INT NOT NULL CHECK (correct >= 0),
  total INT NOT NULL CHECK (total >= 0),
  percent INT NOT NULL CHECK (percent >= 0 AND percent <= 100),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT quiz_attempts_correct_lte_total CHECK (correct <= total)
);

CREATE INDEX idx_quiz_attempts_student ON public.quiz_attempts (student_id);
CREATE INDEX idx_quiz_attempts_quiz ON public.quiz_attempts (quiz_id);
CREATE INDEX idx_quiz_attempts_course ON public.quiz_attempts (course_id);
CREATE INDEX idx_quiz_attempts_submitted ON public.quiz_attempts (submitted_at DESC);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY quiz_attempts_select_own ON public.quiz_attempts FOR SELECT USING (student_id = auth.uid());

CREATE POLICY quiz_attempts_insert_own ON public.quiz_attempts FOR INSERT WITH CHECK (
  student_id = auth.uid()
  AND public.current_role() = 'student'
);

CREATE POLICY quiz_attempts_admin_all ON public.quiz_attempts FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');
