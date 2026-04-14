-- Lectures and quizzes per course (admin-managed; learners read when course is published)

CREATE TABLE public.course_lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  video_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_lectures_course ON public.course_lectures (course_id);

CREATE TABLE public.course_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_quizzes_course ON public.course_quizzes (course_id);

ALTER TABLE public.course_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY course_lectures_select_published ON public.course_lectures FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.published = true)
);

CREATE POLICY course_lectures_admin_all ON public.course_lectures FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

CREATE POLICY course_quizzes_select_published ON public.course_quizzes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.published = true)
);

CREATE POLICY course_quizzes_admin_all ON public.course_quizzes FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');
