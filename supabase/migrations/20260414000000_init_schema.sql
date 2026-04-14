-- E-Learning schema: profiles, categories, courses, enrollments, team, testimonials, contact
-- Run in Supabase SQL Editor or via supabase db push

-- Role enum
CREATE TYPE public.user_role AS ENUM ('admin', 'student', 'teacher');

-- Profiles (1:1 with auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_role ON public.profiles (role);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Courses
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  thumbnail_url TEXT,
  category_id UUID REFERENCES public.categories (id) ON DELETE SET NULL,
  teacher_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  price_cents INT NOT NULL DEFAULT 0,
  duration_hours NUMERIC(4,1),
  level TEXT,
  rating NUMERIC(2,1),
  learners_count TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_teacher ON public.courses (teacher_id);
CREATE INDEX idx_courses_category ON public.courses (category_id);
CREATE INDEX idx_courses_published ON public.courses (published);

-- Enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses (id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

CREATE INDEX idx_enrollments_student ON public.enrollments (student_id);
CREATE INDEX idx_enrollments_course ON public.enrollments (course_id);

-- Team & testimonials (CMS-style)
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role_title TEXT,
  image_url TEXT,
  bio TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  rating INT CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Helper: current user's role
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Profiles: users read/update own row; admins read all
CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT USING (public.current_role() = 'admin');
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Categories: public read; admin write
CREATE POLICY categories_public_read ON public.categories FOR SELECT USING (true);
CREATE POLICY categories_admin_all ON public.categories FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

-- Courses: published readable by all; teachers see own drafts; admin all
CREATE POLICY courses_public_read ON public.courses FOR SELECT USING (published = true);
CREATE POLICY courses_teacher_own ON public.courses FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY courses_admin_all ON public.courses FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');
CREATE POLICY courses_teacher_update ON public.courses FOR UPDATE USING (teacher_id = auth.uid() AND public.current_role() = 'teacher') WITH CHECK (teacher_id = auth.uid());
CREATE POLICY courses_teacher_insert ON public.courses FOR INSERT WITH CHECK (teacher_id = auth.uid() AND public.current_role() = 'teacher');

-- Enrollments
CREATE POLICY enrollments_student_own ON public.enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY enrollments_student_insert ON public.enrollments FOR INSERT WITH CHECK (student_id = auth.uid() AND public.current_role() = 'student');
CREATE POLICY enrollments_teacher_view ON public.enrollments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    WHERE c.id = enrollments.course_id AND c.teacher_id = auth.uid()
  ) AND public.current_role() = 'teacher'
);
CREATE POLICY enrollments_admin_all ON public.enrollments FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

-- Team & testimonials: public read; admin write
CREATE POLICY team_public_read ON public.team_members FOR SELECT USING (true);
CREATE POLICY team_admin_all ON public.team_members FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

CREATE POLICY testimonials_public_read ON public.testimonials FOR SELECT USING (true);
CREATE POLICY testimonials_admin_all ON public.testimonials FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

-- Contact: anyone can insert (anon); admin read
CREATE POLICY contact_insert_anon ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY contact_select_admin ON public.contact_messages FOR SELECT USING (public.current_role() = 'admin');

-- Note: INSERT for contact with anon requires granting usage - Supabase anon key can insert if policy allows.
-- For SELECT on contact_messages, only admin - good.

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
