-- Remove app role "teacher": migrate profiles, shrink user_role enum, drop teacher RLS.
-- Assumes schema from 20260414000000_init_schema.sql.

-- Policies that reference public.current_role() or teacher
DROP POLICY IF EXISTS courses_teacher_own ON public.courses;
DROP POLICY IF EXISTS courses_teacher_update ON public.courses;
DROP POLICY IF EXISTS courses_teacher_insert ON public.courses;
DROP POLICY IF EXISTS enrollments_teacher_view ON public.enrollments;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;

DROP POLICY IF EXISTS categories_public_read ON public.categories;
DROP POLICY IF EXISTS categories_admin_all ON public.categories;

DROP POLICY IF EXISTS courses_public_read ON public.courses;
DROP POLICY IF EXISTS courses_admin_all ON public.courses;

DROP POLICY IF EXISTS enrollments_student_own ON public.enrollments;
DROP POLICY IF EXISTS enrollments_student_insert ON public.enrollments;
DROP POLICY IF EXISTS enrollments_admin_all ON public.enrollments;

DROP POLICY IF EXISTS team_public_read ON public.team_members;
DROP POLICY IF EXISTS team_admin_all ON public.team_members;

DROP POLICY IF EXISTS testimonials_public_read ON public.testimonials;
DROP POLICY IF EXISTS testimonials_admin_all ON public.testimonials;

DROP POLICY IF EXISTS contact_insert_anon ON public.contact_messages;
DROP POLICY IF EXISTS contact_select_admin ON public.contact_messages;

DROP FUNCTION IF EXISTS public.current_role();

UPDATE public.profiles SET role = 'student' WHERE role::text = 'teacher';

CREATE TYPE public.user_role_new AS ENUM ('admin', 'student');

ALTER TABLE public.profiles ADD COLUMN role_new public.user_role_new NOT NULL DEFAULT 'student'::public.user_role_new;

UPDATE public.profiles
SET role_new = (
  CASE role::text
    WHEN 'admin' THEN 'admin'::public.user_role_new
    ELSE 'student'::public.user_role_new
  END
);

ALTER TABLE public.profiles DROP COLUMN role;
ALTER TABLE public.profiles RENAME COLUMN role_new TO role;

DROP TYPE public.user_role;
ALTER TYPE public.user_role_new RENAME TO user_role;

ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'student'::public.user_role;

CREATE OR REPLACE FUNCTION public.current_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT USING (public.current_role() = 'admin');
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY categories_public_read ON public.categories FOR SELECT USING (true);
CREATE POLICY categories_admin_all ON public.categories FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

CREATE POLICY courses_public_read ON public.courses FOR SELECT USING (published = true);
CREATE POLICY courses_admin_all ON public.courses FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

CREATE POLICY enrollments_student_own ON public.enrollments FOR SELECT USING (student_id = auth.uid());
CREATE POLICY enrollments_student_insert ON public.enrollments FOR INSERT WITH CHECK (student_id = auth.uid() AND public.current_role() = 'student');
CREATE POLICY enrollments_admin_all ON public.enrollments FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

CREATE POLICY team_public_read ON public.team_members FOR SELECT USING (true);
CREATE POLICY team_admin_all ON public.team_members FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

CREATE POLICY testimonials_public_read ON public.testimonials FOR SELECT USING (true);
CREATE POLICY testimonials_admin_all ON public.testimonials FOR ALL USING (public.current_role() = 'admin') WITH CHECK (public.current_role() = 'admin');

CREATE POLICY contact_insert_anon ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY contact_select_admin ON public.contact_messages FOR SELECT USING (public.current_role() = 'admin');
